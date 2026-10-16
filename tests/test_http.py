import http.client, json, threading, unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from server import Handler, Store

WEB = Path(__file__).parent.parent / 'web'
WITHHELD = ('T-198', 'prior transaction')

class HttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.srv = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        cls.srv.store = Store(':memory:')
        cls.port = cls.srv.server_address[1]
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown(); cls.srv.server_close()
    def setUp(self): self.post({'action': 'reset'})
    def request(self, method, path, body=None, headers=None):
        c = http.client.HTTPConnection('127.0.0.1', self.port, timeout=5)
        c.request(method, path, body=body, headers=headers or {})
        r = c.getresponse(); data = r.read(); c.close()
        return r.status, data
    def post(self, payload, headers=None, raw=None, demo_header=True):
        h = {'Content-Type': 'application/json'}
        if demo_header: h['X-Apex-Demo'] = 'local'
        h.update(headers or {})
        return self.request('POST', '/api/action', raw if raw is not None else json.dumps(payload), h)
    def case(self): return json.loads(self.request('GET', '/api/case')[1])

    def test_unreleased_evidence_body_never_in_case_response(self):
        status, body = self.request('GET', '/api/case')
        self.assertEqual(status, 200)
        for text in WITHHELD: self.assertNotIn(text, body.decode())
        self.assertNotIn('text', next(e for e in self.case()['evidence'] if e['id'] == 'E-004'))
    def test_unreleased_finding_not_in_any_served_asset(self):
        for path in ('/', '/banking', '/ops', '/app.js', '/verify.js', '/banking.js'):
            status, body = self.request('GET', path)
            self.assertEqual(status, 200, path)
            for text in WITHHELD: self.assertNotIn(text, body.decode(), path)
        for f in WEB.iterdir():
            for text in WITHHELD: self.assertNotIn(text, f.read_text(), f.name)
    def test_analysis_endpoint_gates_on_release(self):
        before = json.loads(self.request('GET', '/api/analysis/compare')[1])
        self.assertEqual(before['case_id'], self.case()['id'])
        self.assertEqual(before['evidence_version'], self.case()['version'])
        self.assertNotIn('T-198', before['text'])
        self.post({'action': 'draft', 'kind': 'REQUEST_EVIDENCE'})
        self.post({'action': 'approve', 'draft_id': self.case()['draft']['id']})
        self.post({'action': 'response'})
        after = json.loads(self.request('GET', '/api/analysis/compare')[1])
        self.assertIn('T-198', after['text'])
        self.assertEqual(after['case_id'], self.case()['id'])
        self.assertEqual(after['evidence_version'], self.case()['version'])
        self.assertEqual(self.request('GET', '/api/analysis/unknown')[0], 404)
    def test_query_string_does_not_break_routes(self):
        self.assertEqual(self.request('GET', '/api/case?_=1')[0], 200)
        self.assertEqual(self.request('GET', '/ops?x=1')[0], 200)
    def test_post_requires_demo_header(self):
        self.assertEqual(self.post({'action': 'reset'}, demo_header=False)[0], 403)
    def test_post_rejects_foreign_origin_and_accepts_matching_origin(self):
        self.assertEqual(self.post({'action': 'reset'}, {'Origin': 'http://evil.example'})[0], 403)
        self.assertEqual(self.post({'action': 'reset'}, {'Origin': f'http://127.0.0.1:{self.port}'})[0], 200)
    def test_post_rejects_bad_bodies(self):
        self.assertEqual(self.post(None, raw='{not json')[0], 400)
        self.assertEqual(self.post(None, raw='[1,2]')[0], 400)
        self.assertEqual(self.post(None, raw='{"action":"reset","pad":"' + 'x' * 9000 + '"}')[0], 400)
        self.assertEqual(self.post({'action': 'approve', 'draft_id': ['unhashable']})[0], 400)
        self.assertEqual(self.post({'action': 'nope'})[0], 409)
    def test_http_flow_persists_request_and_handoff(self):
        self.post({'action': 'draft', 'kind': 'REQUEST_EVIDENCE'})
        d1 = self.case()['draft']
        self.assertEqual(self.post({'action': 'approve', 'draft_id': d1['id']})[0], 200)
        self.post({'action': 'response'})
        self.post({'action': 'draft', 'kind': 'ESCALATE_REVIEW'})
        d2 = self.case()['draft']
        self.assertEqual(self.post({'action': 'approve', 'draft_id': d2['id']})[0], 200)
        s = self.case()
        self.assertEqual(s['request']['question'], d1['payload']['question'])
        self.assertEqual(s['handoff']['payload'], d2['payload'])
        self.assertEqual(self.post({'action': 'approve', 'draft_id': d1['id']})[0], 200)  # duplicate: no new effect
        self.assertEqual(self.case()['handoff']['draft_id'], d2['id'])

if __name__ == '__main__': unittest.main()
