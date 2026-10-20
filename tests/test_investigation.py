import copy
import unittest
from unittest.mock import patch
from investigation import ActionError
from server import Store, Conflict


class InvestigationTests(unittest.TestCase):
    def setUp(self):
        self.store = Store(':memory:')
        s = self.store.intake.start('T-204')
        self.store.intake.prepare(s['session_id'], s['token'], 0, 'investigation-test', 'I did not authorize this order.')
        reviewed = self.store.intake.finish(s['session_id'], s['token'], 0, 'investigation-test',
            {'reply': 'Review.', 'statement': 'Customer denies this order.', 'reason': 'unauthorized', 'ready': True})
        self.case_id = self.store.intake.confirm(s['session_id'], s['token'], 1, reviewed['review']['nonce'])['case_id']
        self.store.act('review_packet', {'case_id': self.case_id})
        self.actions = self.store.investigation

    def tearDown(self): self.store.db.close()

    def stage(self, actor='demo:barbara', snapshot=2, scope='authentication_transaction_association'):
        return self.actions.stage(self.case_id, snapshot, scope, actor)

    def approval(self, draft):
        return {'case_id': self.case_id, 'draft_id': draft['action_id'], 'version': draft['evidence_version'], 'payload_hash': draft['payload_hash']}

    def test_stage_does_not_execute_and_retry_returns_same_draft(self):
        draft = self.stage()
        self.assertEqual(self.stage()['action_id'], draft['action_id'])
        self.assertEqual(self.actions.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'AWAITING_HUMAN_APPROVAL')
        self.assertIsNone(self.store.read(self.case_id)['request'])
        self.assertFalse(self.store.read(self.case_id)['evidence'][3]['available'])

    def test_explicit_approval_and_separate_read_prove_one_exact_saved_request(self):
        draft = self.stage()
        first = self.actions.approve(self.approval(draft), 'demo:barbara')
        second = self.actions.approve(self.approval(draft), 'demo:barbara')
        self.assertFalse(first['duplicate'])
        self.assertTrue(second['duplicate'])
        saved = self.actions.result(self.case_id, draft['action_id'], 'demo:barbara')
        self.assertEqual(saved['status'], 'VERIFIED_SAVED_REQUEST')
        self.assertEqual(saved['request']['auth_record_id'], 'AUTH-77')
        self.assertEqual(saved['request']['disputed_transaction_id'], 'T-204')
        self.assertEqual(len(self.store.read(self.case_id)['receipts']), 1)

    def test_stale_wrong_scope_denied_actor_and_assignment_change_fail_closed(self):
        for kwargs in ({'actor': 'other'}, {'snapshot': 1}, {'scope': 'all_customer_records'}):
            with self.assertRaises(ActionError): self.stage(**kwargs)
        draft = self.stage()
        case = self.store.read(self.case_id); case['assigned_to'] = 'another-team'; self.store.save(case)
        with self.assertRaises(ActionError): self.actions.approve(self.approval(draft), 'demo:barbara')
        self.assertIsNone(self.store.read(self.case_id)['request'])

    def test_hash_snapshot_and_expiry_are_checked_at_approval(self):
        draft = self.stage()
        for changed in ({'payload_hash': '0' * 64}, {'version': 1}):
            with self.assertRaises(ActionError): self.actions.approve({**self.approval(draft), **changed}, 'demo:barbara')
        with patch('investigation.time.time', return_value=draft['expires_at'] + 1):
            self.assertEqual(self.actions.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'EXPIRED')
            with self.assertRaises(ActionError): self.actions.approve(self.approval(draft), 'demo:barbara')
        self.assertIsNone(self.store.read(self.case_id)['request'])

    def test_mutated_draft_and_released_sources_are_rechecked(self):
        draft = self.stage()
        case = self.store.read(self.case_id); case['draft']['payload']['question'] = 'Get everything'; self.store.save(case)
        with self.assertRaises(ActionError): self.actions.approve(self.approval(draft), 'demo:barbara')
        case['draft'] = copy.deepcopy(case['staged_actions'][draft['action_id']]); case['evidence'][2]['available'] = False; self.store.save(case)
        with self.assertRaises(ActionError): self.actions.approve(self.approval(draft), 'demo:barbara')

    def test_receipt_alone_never_verifies_or_authorizes_retry(self):
        draft = self.stage()
        self.actions.approve(self.approval(draft), 'demo:barbara')
        case = self.store.read(self.case_id); case['request'] = None; self.store.save(case)
        self.assertEqual(self.actions.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'NOT_VERIFIED')
        with self.assertRaises(ActionError): self.actions.approve(self.approval(draft), 'demo:barbara')

    def test_altered_saved_scope_or_approval_identity_fails_verification(self):
        draft = self.stage()
        self.actions.approve(self.approval(draft), 'demo:barbara')
        original = self.store.read(self.case_id)
        for field, value in (('auth_record_id', 'OTHER'), ('disputed_transaction_id', 'OTHER'), ('approved_by', 'other'), ('payload_hash', '0' * 64)):
            case = copy.deepcopy(original); case['request'][field] = value; self.store.save(case)
            self.assertEqual(self.actions.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'NOT_VERIFIED')

    def test_later_response_is_explicit_and_association_check_is_deterministic(self):
        draft = self.stage()
        with self.assertRaises(Conflict): self.store.act('response', {'case_id': self.case_id})
        self.actions.approve(self.approval(draft), 'demo:barbara')
        self.store.act('response', {'case_id': self.case_id})
        case = self.store.read(self.case_id)
        self.assertEqual(case['version'], 3)
        self.assertTrue(case['evidence'][3]['available'])
        self.assertEqual(case['association_check']['returned_transaction_id'], 'T-198')
        self.assertFalse(case['association_check']['matches_disputed_transaction'])
        self.assertEqual(self.actions.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'VERIFIED_SAVED_REQUEST')

    def test_legacy_approval_cannot_bypass_new_request_controls(self):
        draft = self.stage()
        with self.assertRaises(Conflict): self.store.act('approve', {'case_id': self.case_id, 'draft_id': draft['action_id']})
        with self.assertRaises(Conflict): self.store.act('draft', {'case_id': self.case_id, 'kind': 'ESCALATE_REVIEW'})
