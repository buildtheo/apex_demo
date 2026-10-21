import copy
import threading
import unittest
from unittest.mock import patch

from server import Store
from investigation import ActionError
from test_restart import submit
from test_credit import RATIONALE, EXPLANATION, SOURCES


class BoundedInvestigationTests(unittest.TestCase):
    def setUp(self):
        self.store = Store(':memory:')
        self.store.intake.restart('bounded-test-run')
        _, _, self.case_id = submit(self.store)
        self.inv = self.store.investigation

    def tearDown(self): self.store.db.close()

    def receive(self, stage, snapshot):
        return self.inv.receive_demo_evidence(self.case_id, snapshot, stage, 'demo:barbara')

    def request(self, snapshot=2, scope='authentication_transaction_association', actor='demo:barbara'):
        return self.inv.request(self.case_id, snapshot, scope, actor)

    def test_complete_investigation_has_only_credit_business_approval(self):
        self.receive('initial_packet', 1)
        original = copy.deepcopy(self.store.read(self.case_id)['evidence'])
        first = self.request()
        self.assertEqual(first['status'], 'VERIFIED_SAVED_REQUEST')
        self.assertEqual(first['request']['authorization_mode'], 'bounded_investigation')
        self.assertNotIn('approved_by', first['request'])
        self.assertIsNone(self.store.read(self.case_id)['draft'])
        self.assertEqual(self.store.read(self.case_id)['version'], 2)
        self.assertEqual(self.request()['action_id'], first['action_id'])
        self.receive('authentication_lookup', 2)
        self.assertFalse(self.store.read(self.case_id)['association_check']['matches_disputed_transaction'])
        second = self.request(3, 'processor_transaction_evidence')
        self.assertTrue(second['request']['preserve_original'])
        self.assertIsNone(self.store.read(self.case_id)['draft'])
        self.assertEqual(self.store.read(self.case_id)['version'], 3)
        self.assertFalse(any(e['id'] == 'E-005' for e in self.store.read(self.case_id)['evidence']))
        self.receive('processor_response', 3)
        case = self.store.read(self.case_id)
        self.assertEqual(case['evidence'][:3], original[:3])
        self.assertNotIn('decision', case)
        self.assertIsNone(self.store.credit.ledger(self.case_id))
        draft = self.store.credit.stage({'case_id': self.case_id, 'snapshot': 4, 'source_ids': SOURCES,
            'rationale': RATIONALE, 'customer_explanation': EXPLANATION}, 'demo:barbara')
        self.assertEqual(draft['status'], 'AWAITING_HUMAN_APPROVAL')
        self.assertIsNone(self.store.credit.ledger(self.case_id))
        self.store.review_action({'case_id': self.case_id, 'draft_id': draft['action_id'], 'version': 4,
            'payload_hash': draft['payload_hash'], 'supports_dispute': True}, 'demo:barbara')
        self.assertEqual(self.store.credit.result(self.case_id, draft['action_id'], 'demo:barbara')['status'], 'VERIFIED_POSTED_CREDIT')
        self.assertTrue(self.request()['request']['status'] == 'RESPONDED')

    def test_scope_access_snapshot_and_release_guards_remain(self):
        for operation in (lambda: self.request(), lambda: self.request(actor='other'),
                          lambda: self.request(scope='POST_CREDIT'),
                          lambda: self.inv.request('APX-001', 1, 'authentication_transaction_association', 'demo:barbara'),
                          lambda: self.receive('processor_response', 1)):
            with self.assertRaises(ActionError): operation()
        self.receive('initial_packet', 1)
        for value in (1, 3, None, True, '2'):
            with self.assertRaises(ActionError): self.request(snapshot=value)
        self.request()
        with self.assertRaises(ActionError): self.request(2, 'processor_transaction_evidence')
        self.assertIsNone(self.store.credit.ledger(self.case_id))

    def test_concurrent_requests_and_later_arrival_retries_have_one_effect(self):
        self.receive('initial_packet', 1)
        results = []
        threads = [threading.Thread(target=lambda: results.append(self.request())) for _ in range(5)]
        for thread in threads: thread.start()
        for thread in threads: thread.join()
        self.assertEqual(len(results), 5)
        self.assertEqual(len({r['action_id'] for r in results}), 1)
        self.assertEqual(len(self.store.read(self.case_id)['staged_actions']), 1)
        self.assertFalse(self.receive('authentication_lookup', 2)['duplicate'])
        self.assertTrue(self.receive('authentication_lookup', 2)['duplicate'])
        self.assertTrue(self.receive('initial_packet', 1)['duplicate'])
        self.assertEqual(self.store.read(self.case_id)['version'], 3)
        with self.assertRaises(ActionError): self.receive('authentication_lookup', 3)
        # Arrival and its retry marker share one save, so a failed save cannot release a source.
        self.request(3, 'processor_transaction_evidence')
        before = self.store.read(self.case_id)
        with patch.object(self.store, 'save', side_effect=RuntimeError('save unavailable')):
            with self.assertRaises(RuntimeError): self.receive('processor_response', 3)
        self.assertEqual(self.store.read(self.case_id), before)
        self.receive('processor_response', 3)

    def test_receipt_alone_or_changed_authority_scope_cannot_verify_or_unlock_response(self):
        self.receive('initial_packet', 1)
        result = self.request()
        action_id = result['action_id']
        before = self.store.read(self.case_id)
        for mutate in (lambda c: c.update(request=None),
                       lambda c: c['request'].update(question='Unapproved arbitrary action'),
                       lambda c: c['staged_actions'][action_id].update(requested_by='other')):
            case = copy.deepcopy(before); mutate(case); self.store.save(case)
            self.assertEqual(self.inv.result(self.case_id, action_id, 'demo:barbara')['status'], 'NOT_VERIFIED')
            with self.assertRaises(ActionError): self.request()
            self.store.save(before)
        with self.assertRaises(ActionError):
            self.store.review_action({'case_id': self.case_id, 'draft_id': action_id, 'version': 2,
                'payload_hash': result['request']['payload_hash']}, 'demo:barbara')
        self.store.intake.restart('bounded-new-run')
        with self.assertRaises(ActionError): self.request()
        with self.assertRaises(ActionError): self.receive('authentication_lookup', 2)
