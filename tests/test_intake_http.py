import http.client
import json
import threading
import unittest
from http.server import ThreadingHTTPServer
from server import Handler, Store


class IntakeHttpTests(unittest.TestCase):
    def setUp(self):
        self.srv = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.srv.store = Store(':memory:')
        self.calls = []
        def model(payload):
            self.calls.append(payload)
            return {'reply': 'Review the report.', 'statement': 'Customer denies the selected purchase.', 'reason': 'unauthorized', 'ready': True}
        self.srv.intake_model = model
        self.port = self.srv.server_address[1]
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()

    def tearDown(self):
        self.srv.shutdown()
        self.srv.server_close()
        self.srv.store.db.close()

    def request(self, method, path, data=None, token=None, origin=None, demo=True, actor=None):
        headers = {'Content-Type': 'application/json'}
        if demo: headers['X-Apex-Demo'] = 'local'
        if token: headers['X-Apex-Session'] = token
        if origin: headers['Origin'] = origin
        if actor: headers['X-Apex-Actor'] = actor
        c = http.client.HTTPConnection('127.0.0.1', self.port, timeout=5)
        c.request(method, path, json.dumps(data) if data is not None else None, headers)
        r = c.getresponse()
        status, body = r.status, json.loads(r.read())
        c.close()
        return status, body

    def start(self):
        status, s = self.request('POST', '/api/intake/start', {'transaction_id': 'T-204'})
        self.assertEqual(status, 200)
        return s

    def turn(self, s, message='I recognize the store but did not place this order.'):
        return self.request('POST', '/api/intake/turn', {'session_id': s['session_id'], 'revision': s['revision'],
            'turn_id': 'http-turn-001', 'message': message}, s['token'])

    def test_confirm_readback_queue_assignments_and_packet_share_one_case(self):
        s = self.start()
        status, review = self.turn(s)
        self.assertEqual(status, 200)
        self.assertEqual(len(self.request('GET', '/api/cases')[1]), 1)
        payload = {'session_id': s['session_id'], 'revision': review['revision'], 'nonce': review['review']['nonce'], 'amount': 1, 'customer': 'forged'}
        status, receipt = self.request('POST', '/api/intake/confirm', payload, s['token'])
        self.assertEqual(status, 200)
        case_id = receipt['case_id']
        self.assertEqual(self.request('POST', '/api/intake/confirm', payload, s['token'])[1]['case_id'], case_id)
        case = self.request('GET', '/api/case?case_id=' + case_id)[1]
        self.assertEqual(case['amount'], 648.50)
        self.assertEqual(case['customer'], 'Martha Rivera')
        self.assertNotIn('text', case['evidence'][2])
        self.assertEqual(self.request('GET', '/api/customer-case?session_id=' + s['session_id'], token=s['token'])[1]['case_id'], case_id)
        self.assertIn(case_id, self.request('GET', '/api/demo-assignments')[1]['demo:barbara']['cases'])
        self.assertEqual(len(self.request('GET', '/api/cases')[1]), 2)
        self.assertEqual(self.request('POST', '/api/action', {'action': 'review_packet', 'case_id': case_id})[0], 200)
        self.assertEqual(self.request('GET', '/api/case?case_id=' + case_id)[1]['version'], 2)
        self.assertEqual(self.request('GET', '/api/case?case_id=APX-missing')[0], 404)

    def test_missing_session_token_and_forged_confirmation_do_not_create_case(self):
        s = self.start()
        self.assertEqual(self.request('GET', '/api/customer-case?session_id=' + s['session_id'])[0], 403)
        self.assertEqual(self.request('POST', '/api/intake/confirm', {'session_id': s['session_id'], 'revision': 0, 'nonce': 'invented'}, s['token'])[0], 409)
        self.assertEqual(len(self.request('GET', '/api/cases')[1]), 1)
        self.assertEqual(self.request('GET', '/api/case?case_id=')[0], 404)
        self.assertEqual(self.request('POST', '/api/action', {'action': 'reset', 'case_id': []})[0], 400)

    def test_csrf_boundary_rejects_foreign_origin_and_missing_demo_header(self):
        for kwargs in ({'origin': 'https://evil.example'}, {'demo': False}):
            self.assertEqual(self.request('POST', '/api/intake/start', {'transaction_id': 'T-204'}, **kwargs)[0], 403)

    def test_sensitive_input_does_not_invoke_model_or_persist(self):
        s = self.start()
        self.assertEqual(self.turn(s, 'My full card is 4111 1111 1111 1111')[0], 400)
        self.assertEqual(self.calls, [])
        saved = self.request('GET', '/api/intake/session?session_id=' + s['session_id'], token=s['token'])[1]
        self.assertEqual(saved['revision'], 0)
        self.assertNotIn('4111', json.dumps(saved))

    def test_model_failure_does_not_create_case_or_advance_conversation(self):
        def failure(_payload): raise RuntimeError('synthetic private failure detail')
        self.srv.intake_model = failure
        s = self.start()
        status, result = self.turn(s)
        self.assertEqual(status, 502)
        self.assertEqual(result, {'error': 'intake_model_unavailable'})
        self.assertEqual(self.srv.store.intake.get(s['session_id'], s['token'])['revision'], 0)
        self.assertEqual(len(self.request('GET', '/api/cases')[1]), 1)

    def test_different_intake_sessions_cannot_duplicate_the_same_customer_transaction(self):
        for index in range(2):
            s = self.start()
            _, review = self.turn(s)
            status, _ = self.request('POST', '/api/intake/confirm', {'session_id': s['session_id'], 'revision': review['revision'],
                'nonce': review['review']['nonce']}, s['token'])
            self.assertEqual(status, 200 if index == 0 else 409)
        self.assertEqual(len(self.request('GET', '/api/cases')[1]), 2)

    def submitted_case(self):
        s = self.start(); _, review = self.turn(s)
        _, receipt = self.request('POST', '/api/intake/confirm', {'session_id': s['session_id'], 'revision': review['revision'], 'nonce': review['review']['nonce']}, s['token'])
        case_id = receipt['case_id']
        self.request('POST', '/api/action', {'action': 'review_packet', 'case_id': case_id})
        return case_id

    def test_staging_and_result_routes_require_assigned_actor_and_review_is_separate(self):
        case_id = self.submitted_case()
        args = {'case_id': case_id, 'snapshot': 2, 'scope': 'authentication_transaction_association'}
        self.assertEqual(self.request('POST', '/api/stage-request', args)[0], 403)
        self.assertEqual(self.request('POST', '/api/stage-request', args, actor='other')[0], 403)
        status, draft = self.request('POST', '/api/stage-request', args, actor='demo:barbara')
        self.assertEqual(status, 200)
        self.assertEqual(self.request('POST', '/api/action', {'action': 'approve', 'case_id': case_id, 'draft_id': draft['action_id']})[0], 409)
        review = {'case_id': case_id, 'draft_id': draft['action_id'], 'version': 2, 'payload_hash': draft['payload_hash']}
        self.assertEqual(self.request('POST', '/api/review-action', review, demo=False)[0], 403)
        self.assertEqual(self.request('POST', '/api/review-action', review, origin='https://evil.example')[0], 403)
        self.assertEqual(self.request('POST', '/api/review-action', {**review, 'payload_hash': '0' * 64})[0], 409)
        self.assertEqual(self.request('POST', '/api/review-action', review)[0], 200)
        path = '/api/action-result?case_id=' + case_id + '&action_id=' + draft['action_id']
        self.assertEqual(self.request('GET', path)[0], 403)
        self.assertEqual(self.request('GET', path, actor='demo:barbara')[1]['status'], 'VERIFIED_SAVED_REQUEST')

    def test_unreleased_structured_metadata_is_not_in_the_browser_case(self):
        case_id = self.submitted_case()
        case = self.srv.store.read(case_id)
        case['evidence'][3]['record'] = {'transaction_id': 'WITHHELD-REFERENCE'}
        self.srv.store.save(case)
        status, result = self.request('GET', '/api/case?case_id=' + case_id)
        self.assertEqual(status, 200)
        self.assertNotIn('WITHHELD-REFERENCE', json.dumps(result))

    def test_processor_followup_routes_preserve_lookup_and_only_release_correction_after_separate_approval(self):
        case_id = self.submitted_case()
        def stage(snapshot, scope):
            status, draft = self.request('POST', '/api/stage-request', {'case_id': case_id, 'snapshot': snapshot, 'scope': scope}, actor='demo:barbara')
            self.assertEqual(status, 200)
            return draft
        def approve(draft):
            return self.request('POST', '/api/review-action', {'case_id': case_id, 'draft_id': draft['action_id'],
                'version': draft['evidence_version'], 'payload_hash': draft['payload_hash']})
        first = stage(2, 'authentication_transaction_association')
        self.assertEqual(approve(first)[0], 200)
        self.assertEqual(self.request('POST', '/api/action', {'case_id': case_id, 'action': 'response'})[0], 200)
        followup = stage(3, 'processor_transaction_evidence')
        self.assertEqual(self.request('POST', '/api/action', {'case_id': case_id, 'action': 'processor_response'})[0], 409)
        self.assertEqual(approve(followup)[0], 200)
        self.assertEqual(self.request('POST', '/api/action', {'case_id': case_id, 'action': 'processor_response'}, origin='https://evil.example')[0], 403)
        case = self.request('GET', '/api/case?case_id=' + case_id)[1]
        self.assertEqual(case['status'], 'PROCESSOR_PENDING')
        self.assertFalse(any(e['id'] == 'E-005' for e in case['evidence']))
        original = case['evidence']
        self.assertEqual(self.request('POST', '/api/action', {'case_id': case_id, 'action': 'processor_response'})[0], 200)
        case = self.request('GET', '/api/case?case_id=' + case_id)[1]
        self.assertEqual(case['version'], 4)
        self.assertEqual(case['evidence'][:4], original)
        self.assertEqual(case['evidence'][4]['correction_of'], 'E-003')
        for draft in (first, followup):
            path = '/api/action-result?case_id=' + case_id + '&action_id=' + draft['action_id']
            self.assertEqual(self.request('GET', path, actor='demo:barbara')[1]['status'], 'VERIFIED_SAVED_REQUEST')

    def test_credit_routes_require_actor_review_and_customer_capability_then_verify_saved_effect(self):
        from test_credit import RATIONALE, EXPLANATION, SOURCES
        session = self.start(); _, reviewed = self.turn(session)
        _, submitted = self.request('POST', '/api/intake/confirm', {'session_id': session['session_id'], 'revision': reviewed['revision'],
            'nonce': reviewed['review']['nonce']}, session['token'])
        case_id = submitted['case_id']; store = self.srv.store
        store.act('review_packet', {'case_id': case_id})
        for version, scope, response in ((2, 'authentication_transaction_association', 'response'), (3, 'processor_transaction_evidence', 'processor_response')):
            draft = store.investigation.stage(case_id, version, scope, 'demo:barbara')
            store.review_action({'case_id': case_id, 'draft_id': draft['action_id'], 'version': version, 'payload_hash': draft['payload_hash']}, 'demo:barbara')
            store.act(response, {'case_id': case_id})
        payload = {'case_id': case_id, 'snapshot': 4, 'source_ids': SOURCES, 'rationale': RATIONALE, 'customer_explanation': EXPLANATION}
        self.assertEqual(self.request('POST', '/api/stage-credit', payload)[0], 403)
        self.assertEqual(self.request('POST', '/api/stage-credit', payload, actor='other')[0], 403)
        status, draft = self.request('POST', '/api/stage-credit', payload, actor='demo:barbara')
        self.assertEqual(status, 200)
        approve = {'case_id': case_id, 'draft_id': draft['action_id'], 'version': 4, 'payload_hash': draft['payload_hash']}
        self.assertEqual(self.request('POST', '/api/review-action', approve)[0], 400)
        customer_url = '/api/customer-case?session_id=' + session['session_id']
        self.assertIsNone(self.request('GET', customer_url, token=session['token'])[1]['resolution'])
        self.assertEqual(self.request('POST', '/api/review-action', {**approve, 'supports_dispute': True}, origin='https://evil.example')[0], 403)
        self.assertEqual(self.request('POST', '/api/review-action', {**approve, 'supports_dispute': True})[0], 200)
        self.assertEqual(self.request('GET', customer_url)[0], 403)
        result = self.request('GET', customer_url, token=session['token'])[1]
        self.assertEqual(result['resolution']['amount_cents'], 64850)
        self.assertEqual(result['resolution']['customer_explanation'], EXPLANATION)
        self.assertEqual(self.request('GET', '/api/action-result?case_id=' + case_id + '&action_id=' + draft['action_id'], actor='demo:barbara')[1]['status'], 'VERIFIED_POSTED_CREDIT')
        store.db.execute('DELETE FROM synthetic_credits'); store.db.commit()
        status, result = self.request('GET', customer_url, token=session['token'])
        self.assertEqual(status, 409)
        self.assertNotIn('resolution', result)
