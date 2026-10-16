import copy, json, shutil, subprocess, unittest
from pathlib import Path
from server import Store

VERIFY = Path(__file__).parent.parent / 'web' / 'verify.js'
RUNNER = "const {verifyEffect}=require(process.argv[1]);const c=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(JSON.stringify(c.map(([s,a])=>verifyEffect(s,a))));"

def run(cases):
    out = subprocess.run(['node', '-e', RUNNER, str(VERIFY)], input=json.dumps(cases), capture_output=True, text=True, check=True)
    return json.loads(out.stdout)

@unittest.skipUnless(shutil.which('node'), 'node is optional; it is only needed to test web/verify.js')
class VerifyEffectTests(unittest.TestCase):
    def setUp(self):
        self.store = Store(':memory:')
        self.req_draft = self.store.act('draft', {'kind': 'REQUEST_EVIDENCE'})['draft']
        self.before = self.store.read()
        self.store.act('approve', {'draft_id': self.req_draft['id']})
        self.requested = self.store.read()
        self.store.act('response', {})
        self.responded = self.store.read()
        self.esc_draft = self.store.act('draft', {'kind': 'ESCALATE_REVIEW'})['draft']
        self.store.act('approve', {'draft_id': self.esc_draft['id']})
        self.escalated = self.store.read()

    def test_request_verified_and_still_verified_after_case_progresses(self):
        a = self.req_draft
        res = run([[self.requested, a], [self.responded, a], [self.escalated, a]])
        self.assertTrue(all(r['ok'] for r in res), res)
    def test_request_not_verified_when_missing_or_altered(self):
        a = self.req_draft
        bad_q = copy.deepcopy(self.requested); bad_q['request']['question'] = 'Something else?'
        bad_dest = copy.deepcopy(self.requested); bad_dest['request']['queue'] = 'Other queue'
        bad_src = copy.deepcopy(self.requested); bad_src['request']['source_ids'] = ['E-001']
        other = copy.deepcopy(self.requested); other['request']['draft_id'] = 'different'
        res = run([[self.before, a], [bad_q, a], [bad_dest, a], [bad_src, a], [other, a]])
        self.assertFalse(any(r['ok'] for r in res), res)
    def test_status_fields_alone_do_not_verify(self):
        stripped = copy.deepcopy(self.requested); stripped['request'] = None  # status still PENDING_EVIDENCE with a matching receipt
        self.assertEqual(stripped['status'], 'PENDING_EVIDENCE')
        self.assertTrue(stripped['receipts'][self.req_draft['id']])
        self.assertFalse(run([[stripped, self.req_draft]])[0]['ok'])
    def test_request_requires_identifier_state_and_matching_outer_case(self):
        cases = []
        for missing in ('id', 'status'):
            s = copy.deepcopy(self.requested); del s['request'][missing]
            cases.append([s, self.req_draft])
        for invalid in ('', '   ', None, 42):
            s = copy.deepcopy(self.requested); s['request']['id'] = invalid
            cases.append([s, self.req_draft])
        s = copy.deepcopy(self.requested); s['request']['status'] = 'NOT_CREATED'
        cases.append([s, self.req_draft])
        s = copy.deepcopy(self.requested); s['id'] = 'OTHER-CASE'
        cases.append([s, self.req_draft])
        self.assertFalse(any(r['ok'] for r in run(cases)))
    def test_handoff_rejects_different_outer_case(self):
        s = copy.deepcopy(self.escalated); s['id'] = 'OTHER-CASE'
        self.assertFalse(run([[s, self.esc_draft]])[0]['ok'])
    def test_missing_approval_identity_cannot_verify(self):
        cases = []
        for field in ('id', 'case_id'):
            a = copy.deepcopy(self.req_draft); del a[field]
            cases.append([self.requested, a])
        self.assertFalse(any(r['ok'] for r in run(cases)))
    def test_handoff_verified_only_with_exact_brief_and_assignment(self):
        a = self.esc_draft
        bad_brief = copy.deepcopy(self.escalated); bad_brief['handoff']['payload']['reason'] = 'Edited after approval.'
        bad_assign = copy.deepcopy(self.escalated); bad_assign['assigned_to'] = 'Somewhere else'
        no_handoff = copy.deepcopy(self.escalated); no_handoff['handoff'] = None
        res = run([[self.escalated, a], [bad_brief, a], [bad_assign, a], [no_handoff, a], [self.responded, a]])
        self.assertEqual([r['ok'] for r in res], [True, False, False, False, False], res)

if __name__ == '__main__': unittest.main()
