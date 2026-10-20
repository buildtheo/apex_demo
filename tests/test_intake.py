import json
import tempfile
import unittest
from pathlib import Path
from server import Store
from intake import IntakeError


class IntakeTests(unittest.TestCase):
    def setUp(self):
        self.store = Store(':memory:')
        self.intake = self.store.intake
        self.session = self.intake.start('T-204')
        self.sid, self.token = self.session['session_id'], self.session['token']

    def tearDown(self):
        self.store.db.close()

    def turn(self, revision=0, turn_id='test-turn-0001', message='I recognize the store but did not place this order.', statement='The customer denies this purchase.'):
        payload, cached = self.intake.prepare(self.sid, self.token, revision, turn_id, message)
        self.assertIsNone(cached)
        self.assertEqual(payload['messages'][-1]['content'], message)
        return self.intake.finish(self.sid, self.token, revision, turn_id,
            {'reply': 'Please review the captured details.', 'statement': statement, 'reason': 'unauthorized', 'ready': True})

    def confirm(self, session):
        return self.intake.confirm(self.sid, self.token, session['revision'], session['review']['nonce'])

    def test_explicit_confirmation_creates_one_case_preserving_seed_and_original_statement(self):
        seed = self.store.read()
        session = self.turn()
        self.assertEqual(self.intake.cases(), [])
        result = self.confirm(session)
        self.assertEqual(self.confirm(session)['case_id'], result['case_id'])
        self.assertEqual(len(self.intake.cases()), 1)
        self.assertEqual(self.store.read(), seed)
        case = self.store.read(result['case_id'])
        self.assertEqual(case['customer'], 'Martha Rivera')
        self.assertEqual(case['merchant'], 'JCPenney')
        self.assertEqual(case['assigned_to'], 'demo:barbara')
        self.assertIn('I recognize the store but did not place this order.', case['evidence'][0]['text'])
        self.assertEqual([e['id'] for e in case['evidence'] if e['available']], ['E-001', 'E-002'])

    def test_unauthorized_session_and_unselected_transaction_are_denied(self):
        with self.assertRaises(IntakeError): self.intake.get(self.sid, 'wrong-token')
        with self.assertRaises(IntakeError): self.intake.start('T-OTHER')
        with self.assertRaises(IntakeError): self.intake.confirm(self.sid, self.token, 0, 'invented')

    def test_stale_confirmation_invalidated_by_customer_correction(self):
        old = self.turn()
        payload, cached = self.intake.prepare(self.sid, self.token, 1, 'correction-0002', 'Correction: I bought clothing before, not a helmet.')
        with self.assertRaises(IntakeError): self.confirm(old)
        new = self.intake.finish(self.sid, self.token, 1, 'correction-0002', {'reply': 'Updated; please review.',
            'statement': 'Customer recognizes an earlier clothing purchase but denies this order.', 'reason': 'unauthorized', 'ready': True})
        with self.assertRaises(IntakeError): self.confirm(old)
        case = self.store.read(self.confirm(new)['case_id'])
        self.assertIn('Correction: I bought clothing before, not a helmet.', case['evidence'][0]['text'])
        self.assertEqual(case['customer_confirmed_intake']['statement'], new['review']['statement'])

    def test_duplicate_turn_is_cached_and_conflicting_retry_is_denied(self):
        message = 'I did not place this order.'
        session = self.turn(message=message)
        payload, cached = self.intake.prepare(self.sid, self.token, 0, 'test-turn-0001', message)
        self.assertIsNone(payload)
        self.assertEqual(cached['revision'], session['revision'])
        with self.assertRaises(IntakeError): self.intake.prepare(self.sid, self.token, 1, 'test-turn-0001', 'Different content')

    def test_parallel_turn_and_late_response_do_not_replace_current_revision(self):
        self.intake.prepare(self.sid, self.token, 0, 'pending-turn-001', 'Not my order.')
        with self.assertRaises(IntakeError): self.intake.prepare(self.sid, self.token, 0, 'parallel-turn-2', 'Other message')
        with self.assertRaises(IntakeError): self.intake.finish(self.sid, self.token, 0, 'wrong-turn-id',
            {'reply': 'Reply', 'statement': 'Statement', 'reason': 'unauthorized', 'ready': True})
        self.intake.fail(self.sid, self.token, 'pending-turn-001')
        self.assertEqual(self.intake.get(self.sid, self.token)['revision'], 0)

    def test_unsafe_input_is_not_persisted_or_prepared_for_provider(self):
        for message in ('4111 1111 1111 1111', 'CVV: 123', 'my PIN is 1776', 'one ' * 13):
            with self.assertRaises(IntakeError): self.intake.prepare(self.sid, self.token, 0, 'unsafe-turn-001', message)
        self.assertEqual(len(self.intake.get(self.sid, self.token)['messages']), 1)

    def test_later_packet_is_explicit_and_case_scoped(self):
        case_id = self.confirm(self.turn())['case_id']
        with self.assertRaises(Exception): self.store.analysis('compare', case_id)
        self.store.act('review_packet', {'case_id': case_id})
        case = self.store.read(case_id)
        self.assertEqual(case['version'], 2)
        self.assertTrue(case['evidence'][2]['available'])
        self.assertFalse(case['evidence'][3]['available'])
        self.store.act('draft', {'case_id': case_id, 'kind': 'REQUEST_EVIDENCE'})
        self.assertEqual(self.store.read(case_id)['draft']['case_id'], case_id)
        self.assertIsNone(self.store.read()['draft'])
        with self.assertRaises(Exception): self.store.act('reset', {'case_id': case_id})

    def test_new_cases_persist_across_reopen_and_seed_reset(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'test.sqlite'
            store = Store(path)
            s = store.intake.start('T-204')
            store.intake.prepare(s['session_id'], s['token'], 0, 'persist-turn-001', 'Not my order.')
            s1 = store.intake.finish(s['session_id'], s['token'], 0, 'persist-turn-001',
                {'reply': 'Review.', 'statement': 'Customer denies purchase.', 'reason': 'unauthorized', 'ready': True})
            case_id = store.intake.confirm(s['session_id'], s['token'], 1, s1['review']['nonce'])['case_id']
            store.db.close()
            reopened = Store(path)
            reopened.reset()
            self.assertEqual(reopened.read(case_id)['intake_id'], s['session_id'])
            self.assertEqual(reopened.intake.get(s['session_id'], s['token'])['case_id'], case_id)
            reopened.db.close()

    def test_other_dispute_reasons_do_not_enter_the_authentication_fixture_path(self):
        self.intake.prepare(self.sid, self.token, 0, 'goods-turn-001', 'The clothing was never delivered.')
        review = self.intake.finish(self.sid, self.token, 0, 'goods-turn-001',
            {'reply': 'Please review.', 'statement': 'Customer reports undelivered goods.', 'reason': 'goods', 'ready': True})
        case_id = self.confirm(review)['case_id']
        self.assertEqual(self.store.read(case_id)['status'], 'MANUAL_REVIEW_REQUIRED')
        with self.assertRaises(Exception): self.store.act('review_packet', {'case_id': case_id})
