import copy
import tempfile
import unittest
from pathlib import Path

from server import Store, Conflict
from intake import IntakeError
from investigation import ActionError
from test_credit import prepared_store, RATIONALE, EXPLANATION, SOURCES


def submit(store):
    session = store.intake.start('T-204')
    sid, token = session['session_id'], session['token']
    store.intake.prepare(sid, token, 0, 'restart-turn-001', 'I did not authorize this purchase.')
    review = store.intake.finish(sid, token, 0, 'restart-turn-001',
        {'reply': 'Please review.', 'statement': 'Customer denies this purchase.', 'reason': 'unauthorized', 'ready': True})
    return session, review, store.intake.confirm(sid, token, 1, review['review']['nonce'])['case_id']


def post(store, case_id):
    store.act('review_packet', {'case_id': case_id})
    for version, scope, response in ((2, 'authentication_transaction_association', 'response'), (3, 'processor_transaction_evidence', 'processor_response')):
        draft = store.investigation.stage(case_id, version, scope, 'demo:barbara')
        store.review_action({'case_id': case_id, 'draft_id': draft['action_id'], 'version': version,
                            'payload_hash': draft['payload_hash']}, 'demo:barbara')
        store.act(response, {'case_id': case_id})
    draft = store.credit.stage({'case_id': case_id, 'snapshot': 4, 'rationale': RATIONALE,
        'customer_explanation': EXPLANATION, 'source_ids': SOURCES}, 'demo:barbara')
    store.review_action({'case_id': case_id, 'draft_id': draft['action_id'], 'version': 4,
        'payload_hash': draft['payload_hash'], 'supports_dispute': True}, 'demo:barbara')
    assert store.action_result(case_id, draft['action_id'], 'demo:barbara')['status'] == 'VERIFIED_POSTED_CREDIT'
    return draft


class RestartTests(unittest.TestCase):
    def test_repeated_runs_post_once_each_and_preserve_original_proof(self):
        store, original = prepared_store()
        try:
            draft = store.credit.stage({'case_id': original, 'snapshot': 4, 'rationale': RATIONALE,
                'customer_explanation': EXPLANATION, 'source_ids': SOURCES}, 'demo:barbara')
            store.review_action({'case_id': original, 'draft_id': draft['action_id'], 'version': 4,
                'payload_hash': draft['payload_hash'], 'supports_dispute': True}, 'demo:barbara')
            proof = copy.deepcopy(store.read(original)); ledger = store.credit.ledger(original)
            accounts = {ledger['account_ref']}
            for index in range(3):
                restart = store.intake.restart(f'practice-run-{index}')
                self.assertEqual(store.intake.restart(f'practice-run-{index}'), {**restart, 'duplicate': True})
                session, review, case_id = submit(store)
                # Another independently started session cannot duplicate this run's dispute.
                with self.assertRaises(IntakeError): submit(store)
                post(store, case_id)
                accounts.add(store.credit.ledger(case_id)['account_ref'])
                self.assertEqual(store.read(case_id)['demo_run'], restart['run_id'])
            self.assertEqual(len(accounts), 4)
            self.assertEqual(store.db.execute('SELECT COUNT(*) FROM synthetic_credits').fetchone()[0], 4)
            self.assertEqual(store.read(original), proof)
            self.assertEqual(store.credit.ledger(original), ledger)
            self.assertEqual(store.credit.result(original, draft['action_id'], 'demo:barbara')['status'], 'VERIFIED_POSTED_CREDIT')
        finally: store.db.close()

    def test_restart_invalidates_stale_sessions_provider_results_and_actions(self):
        store = Store(':memory:')
        try:
            store.intake.restart('practice-first')
            session, review, case_id = submit(store)
            store.act('review_packet', {'case_id': case_id})
            draft = store.investigation.stage(case_id, 2, 'authentication_transaction_association', 'demo:barbara')
            pending = store.intake.start('T-204')
            store.intake.prepare(pending['session_id'], pending['token'], 0, 'pending-turn-001', 'I deny this purchase.')
            before = store.read(case_id)
            store.intake.restart('practice-second')
            for operation in (
                lambda: store.intake.get(session['session_id'], session['token']),
                lambda: store.intake.confirm(session['session_id'], session['token'], 1, review['review']['nonce']),
                lambda: store.intake.finish(pending['session_id'], pending['token'], 0, 'pending-turn-001',
                    {'reply': 'Review.', 'statement': 'Customer denies.', 'reason': 'unauthorized', 'ready': True}),
            ):
                with self.assertRaises(IntakeError): operation()
            with self.assertRaises(ActionError):
                store.review_action({'case_id': case_id, 'draft_id': draft['action_id'], 'version': 2,
                    'payload_hash': draft['payload_hash']}, 'demo:barbara')
            with self.assertRaises(Conflict): store.act('response', {'case_id': case_id})
            self.assertEqual(store.read(case_id), before)
            with self.assertRaises(IntakeError): store.intake.restart('practice-first')
            self.assertEqual(store.db.execute('SELECT COUNT(*) FROM synthetic_credits').fetchone()[0], 0)
        finally: store.db.close()

    def test_one_hundred_restarts_and_service_reopen_keep_current_run(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'test.sqlite'
            store = Store(path)
            seed = store.read()
            for index in range(100): store.intake.restart(f'rehearsal-{index:03}')
            active = store.intake.current_run()
            self.assertEqual(store.read(), seed)
            self.assertEqual(store.intake.cases(), [])
            store.db.close()
            store = Store(path)
            try:
                self.assertEqual(store.intake.current_run(), active)
                self.assertEqual(store.intake.start('T-204')['demo_run'], active)
                for request in (None, '', [], 'x', 'a' * 81):
                    with self.assertRaises(IntakeError): store.intake.restart(request)
            finally: store.db.close()
