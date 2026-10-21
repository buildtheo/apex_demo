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

    def completed_lookup(self):
        draft = self.stage()
        self.actions.approve(self.approval(draft), 'demo:barbara')
        self.store.act('response', {'case_id': self.case_id})
        return draft

    def followup(self):
        return self.stage(snapshot=3, scope='processor_transaction_evidence')

    def test_followup_waits_for_completed_lookup_and_does_not_execute_itself(self):
        with self.assertRaises(ActionError): self.stage(scope='processor_transaction_evidence')
        self.completed_lookup()
        draft = self.followup()
        self.assertEqual(self.followup()['action_id'], draft['action_id'])
        case = self.store.read(self.case_id)
        self.assertIsNone(case.get('processor_request'))
        self.assertEqual(case['status'], 'EVIDENCE_RECEIVED')
        self.assertTrue(draft['payload']['preserve_original'])
        self.assertEqual(draft['payload']['source_ids'], ['E-002', 'E-003', 'E-004'])
        self.assertFalse(any(e['id'] == 'E-005' for e in case['evidence']))
        with self.assertRaises(ActionError): self.store.act('processor_response', {'case_id': self.case_id})

    def test_separate_followup_approval_and_later_correction_preserve_entire_original_evidence(self):
        first = self.completed_lookup()
        originals = copy.deepcopy(self.store.read(self.case_id)['evidence'])
        draft = self.followup()
        with self.assertRaises(Conflict): self.store.act('approve', {'case_id': self.case_id, 'draft_id': draft['action_id']})
        self.assertFalse(self.actions.approve(self.approval(draft), 'demo:barbara')['duplicate'])
        self.assertTrue(self.actions.approve(self.approval(draft), 'demo:barbara')['duplicate'])
        self.assertEqual(self.actions.result(self.case_id, first['action_id'], 'demo:barbara')['status'], 'VERIFIED_SAVED_REQUEST')
        self.assertEqual(self.actions.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'VERIFIED_SAVED_REQUEST')
        pending = self.store.read(self.case_id)
        self.assertEqual(pending['status'], 'PROCESSOR_PENDING')
        self.assertEqual(pending['version'], 3)
        self.assertFalse(any(e['id'] == 'E-005' for e in pending['evidence']))
        self.store.act('processor_response', {'case_id': self.case_id})
        case = self.store.read(self.case_id)
        self.assertEqual(case['version'], 4)
        self.assertEqual(case['status'], 'PROCESSOR_EVIDENCE_RECEIVED')
        self.assertEqual(case['evidence'][:4], originals)
        correction = case['evidence'][-1]
        self.assertEqual(correction['id'], 'E-005')
        self.assertEqual(correction['correction_of'], 'E-003')
        self.assertEqual(correction['request_id'], pending['processor_request']['id'])
        self.assertEqual(correction['document_version'], 2)
        self.assertTrue(correction['received_at'])
        self.assertTrue(correction['corrected_at'])
        self.assertFalse(correction['record']['authentication_evidence_available'])
        self.assertEqual(case['processor_request']['status'], 'RESPONDED')
        for action in (first, draft):
            self.assertEqual(self.actions.result(self.case_id, action['action_id'], 'demo:barbara')['status'], 'VERIFIED_SAVED_REQUEST')
            self.assertTrue(self.actions.approve(self.approval(action), 'demo:barbara')['duplicate'])
        with self.assertRaises(ActionError): self.store.act('processor_response', {'case_id': self.case_id})
        self.assertEqual(self.store.read(self.case_id), case)
        self.assertIsNone(case.get('credit'))

    def test_followup_rechecks_assignment_hash_freshness_and_source_at_approval(self):
        self.completed_lookup()
        draft = self.followup()
        original = self.store.read(self.case_id)
        with patch('investigation.time.time', return_value=draft['expires_at'] + 1):
            with self.assertRaises(ActionError): self.actions.approve(self.approval(draft), 'demo:barbara')
        with self.assertRaises(ActionError): self.actions.approve({**self.approval(draft), 'payload_hash': '0' * 64}, 'demo:barbara')
        for change in ('assignment', 'version', 'source', 'lookup', 'payload'):
            case = copy.deepcopy(original)
            if change == 'assignment': case['assigned_to'] = 'other'
            if change == 'version': case['version'] += 1
            if change == 'source': case['evidence'][3]['available'] = False
            if change == 'lookup': case['evidence'][3]['record']['transaction_id'] = 'T-204'
            if change == 'payload': case['draft']['payload']['preserve_original'] = False
            self.store.save(case)
            with self.assertRaises(ActionError): self.actions.approve(self.approval(draft), 'demo:barbara')
            self.assertIsNone(self.store.read(self.case_id).get('processor_request'))

    def test_followup_receipt_alone_or_altered_preservation_never_verifies_or_retries(self):
        self.completed_lookup()
        draft = self.followup()
        self.actions.approve(self.approval(draft), 'demo:barbara')
        original = self.store.read(self.case_id)
        for field, value in (('preserve_original', False), ('correction_of', 'E-001'), ('disputed_transaction_id', 'OTHER'),
                             ('approved_by', 'other'), ('payload_hash', '0' * 64)):
            case = copy.deepcopy(original); case['processor_request'][field] = value; self.store.save(case)
            self.assertEqual(self.actions.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'NOT_VERIFIED')
            with self.assertRaises(ActionError): self.actions.approve(self.approval(draft), 'demo:barbara')
            with self.assertRaises(ActionError): self.store.act('processor_response', {'case_id': self.case_id})
        case = copy.deepcopy(original); case['processor_request'] = None; self.store.save(case)
        self.assertEqual(self.actions.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'NOT_VERIFIED')
        with self.assertRaises(ActionError): self.actions.approve(self.approval(draft), 'demo:barbara')

    def test_followup_requires_verified_prior_request_and_actual_released_lookup(self):
        self.completed_lookup()
        original = self.store.read(self.case_id)
        for change in ('actor', 'prior_request', 'prior_state', 'lookup', 'source'):
            case = copy.deepcopy(original)
            if change == 'prior_request': case['request']['question'] = 'Different request'
            if change == 'prior_state': case['request']['status'] = 'OPEN'
            if change == 'lookup': case['evidence'][3]['record']['transaction_id'] = 'T-204'
            if change == 'source': case['evidence'][3]['available'] = False
            self.store.save(case)
            with self.assertRaises(ActionError):
                self.stage(actor='other' if change == 'actor' else 'demo:barbara', snapshot=3, scope='processor_transaction_evidence')
            self.assertIsNone(self.store.read(self.case_id).get('draft'))
