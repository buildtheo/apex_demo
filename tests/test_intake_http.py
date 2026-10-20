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

    def request(self, method, path, data=None, token=None, origin=None, demo=True):
        headers = {'Content-Type': 'application/json'}
        if demo: headers['X-Apex-Demo'] = 'local'
        if token: headers['X-Apex-Session'] = token
        if origin: headers['Origin'] = origin
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
