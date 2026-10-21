import copy
import json
import threading
import unittest
from unittest.mock import patch

from credit import SOURCES
from investigation import ActionError
from intake import IntakeError
from server import Store, Conflict

RATIONALE = ('Martha denies this purchase [E-001]. The ledger records the charge, not authorization [E-002]. '
             'The processor claimed a recognized device [E-003], but the cited record belongs to another purchase [E-004]. '
             'The corrected response withdraws that association and provides no purchase-specific support [E-005]. '
             'Recommend a customer-favorable resolution for human review of the full record; missing evidence alone does not establish fraud.')
EXPLANATION = "We reviewed your report and the corrected processor records for the JCPenney purchase."


def prepared_store():
    store = Store(':memory:')
    session = store.intake.start('T-204')
    sid, token = session['session_id'], session['token']
    store.intake.prepare(sid, token, 0, 'credit-turn-001', 'I did not authorize this purchase.')
    review = store.intake.finish(sid, token, 0, 'credit-turn-001',
        {'reply': 'Please review.', 'statement': 'Customer denies this purchase.', 'reason': 'unauthorized', 'ready': True})
    case_id = store.intake.confirm(sid, token, 1, review['review']['nonce'])['case_id']
    store.act('review_packet', {'case_id': case_id})
    for snapshot, scope, response in ((2, 'authentication_transaction_association', 'response'), (3, 'processor_transaction_evidence', 'processor_response')):
        draft = store.investigation.stage(case_id, snapshot, scope, 'demo:barbara')
        store.review_action({'case_id': case_id, 'draft_id': draft['action_id'], 'version': snapshot, 'payload_hash': draft['payload_hash']}, 'demo:barbara')
        store.act(response, {'case_id': case_id})
    return store, case_id


class CreditTests(unittest.TestCase):
    def setUp(self):
        self.store, self.case_id = prepared_store()
        self.credit = self.store.credit

    def tearDown(self): self.store.db.close()

    def stage(self, **overrides):
        return self.credit.stage({'case_id': self.case_id, 'snapshot': 4, 'rationale': RATIONALE,
            'customer_explanation': EXPLANATION, 'source_ids': SOURCES.copy(), **overrides}, 'demo:barbara')

    def approval(self, draft):
        return {'case_id': self.case_id, 'draft_id': draft['action_id'], 'version': draft['evidence_version'],
                'payload_hash': draft['payload_hash'], 'supports_dispute': True}

    def test_staging_is_only_a_draft_with_bank_owned_amount_account_and_policy(self):
        draft = self.stage(amount_cents=1, account_ref='other', policy_id='no-controls')
        self.assertEqual(draft['payload']['amount_cents'], 64850)
        self.assertEqual(draft['payload']['account_ref'], 'demo:martha:card-8821')
        self.assertEqual(draft['payload']['policy_id'], 'DEMO-CREDIT-01')
        self.assertEqual(self.stage()['action_id'], draft['action_id'])
        self.assertIsNone(self.credit.ledger(self.case_id))
        self.assertIsNone(self.credit.customer_resolution(self.store.read(self.case_id)))
        self.assertEqual(self.credit.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'AWAITING_HUMAN_APPROVAL')

    def test_explicit_support_review_required_and_legacy_approve_cannot_post(self):
        draft = self.stage()
        for value in (False, None, 'true', 1):
            with self.assertRaises(ActionError): self.credit.approve({**self.approval(draft), 'supports_dispute': value}, 'demo:barbara')
        with self.assertRaises(Conflict): self.store.act('approve', {'case_id': self.case_id, 'draft_id': draft['action_id']})
        self.assertIsNone(self.credit.ledger(self.case_id))

    def test_human_approval_atomic_post_separate_readback_and_duplicate_are_verified(self):
        draft = self.stage()
        original_sources = copy.deepcopy(self.store.read(self.case_id)['evidence'])
        self.assertFalse(self.store.review_action(self.approval(draft), 'demo:barbara')['duplicate'])
        self.assertTrue(self.store.review_action(self.approval(draft), 'demo:barbara')['duplicate'])
        result = self.store.action_result(self.case_id, draft['action_id'], 'demo:barbara')
        self.assertEqual(result['status'], 'VERIFIED_POSTED_CREDIT')
        self.assertEqual(result['credit']['amount_cents'], 64850)
        case = self.store.read(self.case_id)
        self.assertEqual(case['status'], 'CREDIT_POSTED')
        self.assertEqual(case['version'], 4)
        self.assertEqual(case['evidence'], original_sources)
        self.assertTrue(case['decision']['reviewed_support'])
        resolution = self.credit.customer_resolution(case)
        self.assertEqual(resolution['customer_explanation'], EXPLANATION)
        self.assertEqual(resolution['resolution_message'], "We've completed our review and credited $648.50 to your card ending 8821.")
        self.assertEqual(resolution['card_balance_cents'], 153622)
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM synthetic_credits').fetchone()[0], 1)
        for slot in ('request', 'processor_request'):
            self.assertEqual(self.store.action_result(self.case_id, case[slot]['draft_id'], 'demo:barbara')['status'], 'VERIFIED_SAVED_REQUEST')

    def test_concurrent_retries_post_once(self):
        draft = self.stage()
        outcomes = []
        def approve(): outcomes.append(self.store.review_action(self.approval(draft), 'demo:barbara'))
        threads = [threading.Thread(target=approve) for _ in range(5)]
        for thread in threads: thread.start()
        for thread in threads: thread.join()
        self.assertEqual(len(outcomes), 5)
        self.assertEqual(sum(not item['duplicate'] for item in outcomes), 1)
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM synthetic_credits').fetchone()[0], 1)

    def test_denied_actor_unavailable_sources_and_incomplete_followup_fail_closed(self):
        with self.assertRaises(ActionError): self.credit.stage({'case_id': self.case_id, 'snapshot': 4}, 'other')
        original = self.store.read(self.case_id)
        for change in ('source', 'status', 'prior', 'customer', 'transaction'):
            case = copy.deepcopy(original)
            if change == 'source': case['evidence'][4]['available'] = False
            if change == 'status': case['status'] = 'PROCESSOR_PENDING'
            if change == 'prior': case['processor_request']['question'] = 'tampered'
            if change == 'customer': case['customer_ref'] = 'other'
            if change == 'transaction': case['transaction_id'] = 'other'
            self.store.save(case)
            with self.assertRaises(ActionError): self.stage()
            self.assertIsNone(self.credit.ledger(self.case_id))

    def test_threshold_is_strict_and_neither_amount_nor_missing_evidence_issues_credit(self):
        original = self.store.read(self.case_id)
        for amount in (1000, 1000.01, -1, 0, 648.501, 999.99):
            case = copy.deepcopy(original); case['amount'] = amount; self.store.save(case)
            with self.assertRaises(ActionError): self.stage()
        self.store.save(original)
        self.stage()
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM synthetic_credits').fetchone()[0], 0)

    def test_rationale_sources_and_sensitive_content_are_validated(self):
        for changes in ({'rationale': 'Missing proof means credit.'}, {'source_ids': SOURCES[:-1]},
                        {'source_ids': SOURCES[:-1] + ['E-001']}, {'snapshot': 3}):
            with self.assertRaises(ActionError): self.stage(**changes)
        with self.assertRaises(IntakeError): self.stage(customer_explanation='PIN: 1234')
        self.assertIsNone(self.store.read(self.case_id)['draft'])

    def test_expiry_staleness_changed_payload_assignment_and_entitlement_are_rechecked(self):
        draft = self.stage()
        original = self.store.read(self.case_id)
        with patch('credit.time.time', return_value=draft['expires_at'] + 1):
            with self.assertRaises(ActionError): self.store.review_action(self.approval(draft), 'demo:barbara')
        with self.assertRaises(ActionError): self.store.review_action({**self.approval(draft), 'payload_hash': '0' * 64}, 'demo:barbara')
        for change in ('version', 'payload', 'assignment', 'source', 'amount'):
            case = copy.deepcopy(original)
            if change == 'version': case['version'] += 1
            if change == 'payload': case['draft']['payload']['customer_explanation'] = 'Changed'
            if change == 'assignment': case['assigned_to'] = 'other'
            if change == 'source': case['evidence'][4]['available'] = False
            if change == 'amount': case['amount'] = 1000
            self.store.save(case)
            with self.assertRaises(ActionError): self.store.review_action(self.approval(draft), 'demo:barbara')
            self.assertIsNone(self.credit.ledger(self.case_id))

    def test_changed_recommendation_supersedes_old_approval(self):
        first = self.stage()
        second = self.stage(customer_explanation='A revised explanation for your review.')
        self.assertNotEqual(first['action_id'], second['action_id'])
        self.assertEqual(self.credit.result(self.case_id, first['action_id'], 'demo:barbara')['status'], 'SUPERSEDED')
        with self.assertRaises(ActionError): self.store.review_action(self.approval(first), 'demo:barbara')

    def test_missing_ledger_or_changed_decision_never_shows_success_or_reposts(self):
        draft = self.stage(); self.store.review_action(self.approval(draft), 'demo:barbara')
        original = self.store.read(self.case_id)
        for key, value in (('customer_explanation', 'Unreviewed explanation'), ('amount_cents', 1), ('reviewed_support', False)):
            case = copy.deepcopy(original); case['decision'][key] = value; self.store.save(case)
            self.assertEqual(self.credit.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'NOT_VERIFIED')
            with self.assertRaises(ActionError): self.credit.customer_resolution(case)
            with self.assertRaises(ActionError): self.store.review_action(self.approval(draft), 'demo:barbara')
        self.store.save(original)
        self.store.db.execute('DELETE FROM synthetic_credits'); self.store.db.commit()
        self.assertEqual(self.credit.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'NOT_VERIFIED')
        with self.assertRaises(ActionError): self.store.review_action(self.approval(draft), 'demo:barbara')
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM synthetic_credits').fetchone()[0], 0)

    def test_ledger_and_case_are_atomic_on_write_failure(self):
        draft = self.stage()
        before = self.store.read(self.case_id)
        self.store.db.execute("CREATE TRIGGER fail_credit_case BEFORE UPDATE ON submitted_cases BEGIN SELECT RAISE(ABORT, 'test failure'); END")
        with self.assertRaises(ActionError): self.store.review_action(self.approval(draft), 'demo:barbara')
        self.assertIsNone(self.credit.ledger(self.case_id))
        self.assertEqual(self.store.read(self.case_id), before)

    def test_seed_case_cannot_stage_credit(self):
        with self.assertRaises(ActionError): self.credit.stage({'case_id': 'APX-001', 'snapshot': 1}, 'demo:barbara')

    def test_altered_or_malformed_ledger_is_not_success_and_blocks_blind_retry(self):
        draft = self.stage(); self.store.review_action(self.approval(draft), 'demo:barbara')
        original = self.credit.ledger(self.case_id)
        for key, value in (('amount_cents', 1), ('status', 'PENDING'), ('account_ref', 'other'), ('id', 'another-credit'), ('payload_hash', '0' * 64)):
            record = {**original, key: value}
            self.store.db.execute('UPDATE synthetic_credits SET body=?', (json.dumps(record),)); self.store.db.commit()
            self.assertEqual(self.credit.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'NOT_VERIFIED')
            with self.assertRaises(ActionError): self.credit.customer_resolution(self.store.read(self.case_id))
            with self.assertRaises(ActionError): self.store.review_action(self.approval(draft), 'demo:barbara')
        self.store.db.execute("UPDATE synthetic_credits SET body='not-json'"); self.store.db.commit()
        self.assertEqual(self.credit.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'NOT_VERIFIED')

    def test_receipt_alone_or_unknown_execution_never_reposts(self):
        draft = self.stage()
        case = self.store.read(self.case_id); case['receipts'][draft['action_id']] = {'accepted': True}; self.store.save(case)
        self.assertEqual(self.credit.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'NOT_VERIFIED')
        with self.assertRaises(ActionError): self.store.review_action(self.approval(draft), 'demo:barbara')
        self.assertIsNone(self.credit.ledger(self.case_id))

    def test_posted_message_replaces_pending_presentation_without_rewriting_approved_summary(self):
        pending = 'Our findings have been submitted for review; any credit will be confirmed separately if approved and posted.'
        draft = self.stage(customer_explanation=pending)
        self.assertIsNone(self.credit.customer_resolution(self.store.read(self.case_id)))
        self.store.review_action(self.approval(draft), 'demo:barbara')
        case = self.store.read(self.case_id); ledger = self.credit.ledger(self.case_id)
        resolution = self.credit.customer_resolution(case)
        self.assertEqual(resolution['resolution_message'], "We've completed our review and credited $648.50 to your card ending 8821.")
        self.assertNotIn('submitted for review', resolution['resolution_message'])
        self.assertEqual(resolution['customer_explanation'], pending)
        self.assertEqual(case['decision']['customer_explanation'], pending)
        self.assertEqual(ledger['customer_explanation'], pending)
        self.assertEqual(self.store.read(self.case_id), case)
        self.assertEqual(self.credit.ledger(self.case_id), ledger)
        self.store.db.execute('DELETE FROM synthetic_credits'); self.store.db.commit()
        with self.assertRaises(ActionError): self.credit.customer_resolution(case)
