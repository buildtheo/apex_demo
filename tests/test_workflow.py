import unittest
from server import Store, Conflict, find

class WorkflowTests(unittest.TestCase):
    def setUp(self): self.s=Store(':memory:')
    def draft(self,kind): return self.s.act('draft',{'kind':kind})['draft']
    def test_two_approvals_and_persistence(self):
        d=self.draft('REQUEST_EVIDENCE')
        self.s.act('approve',{'draft_id':d['id']})
        self.assertEqual(self.s.read()['status'],'PENDING_EVIDENCE')
        self.s.act('response',{})
        d=self.draft('ESCALATE_REVIEW')
        self.s.act('approve',{'draft_id':d['id']})
        self.assertEqual(self.s.read()['assigned_to'],'Senior dispute review')
        self.assertEqual(len(self.s.read()['receipts']),2)
    def test_duplicate_has_one_effect(self):
        d=self.draft('REQUEST_EVIDENCE'); self.s.act('approve',{'draft_id':d['id']})
        before=self.s.read(); self.s.act('approve',{'draft_id':d['id']})
        self.assertEqual(before,self.s.read())
    def test_forged_or_stale_approval(self):
        with self.assertRaises(Conflict):self.s.act('approve',{'draft_id':'forged'})
        d=self.draft('REQUEST_EVIDENCE'); self.draft('REQUEST_EVIDENCE')
        with self.assertRaises(Conflict):self.s.act('approve',{'draft_id':d['id']})
    def test_no_response_before_request(self):
        with self.assertRaises(Conflict):self.s.act('response',{})
    def test_no_premature_escalation(self):
        with self.assertRaises(Conflict):self.draft('ESCALATE_REVIEW')
    def test_evidence_changes_snapshot(self):
        d=self.draft('REQUEST_EVIDENCE');self.s.act('approve',{'draft_id':d['id']});self.s.act('response',{})
        self.assertEqual(self.s.read()['version'],2)
        self.assertTrue(find(self.s.read(),'E-004')['available'])
    def test_request_effect_keeps_approved_scope_after_progression(self):
        d=self.draft('REQUEST_EVIDENCE'); self.s.act('approve',{'draft_id':d['id']})
        r=self.s.read()['request']
        self.assertEqual((r['draft_id'],r['case_id'],r['queue'],r['question'],r['source_ids']),(d['id'],'APX-001',d['payload']['queue'],d['payload']['question'],d['payload']['source_ids']))
        self.s.act('response',{})
        r=self.s.read()['request']
        self.assertEqual((r['status'],r['question'],r['draft_id']),('RESPONDED',d['payload']['question'],d['id']))
    def test_handoff_persists_exact_approved_brief(self):
        d=self.draft('REQUEST_EVIDENCE'); self.s.act('approve',{'draft_id':d['id']}); self.s.act('response',{})
        e=self.draft('ESCALATE_REVIEW'); self.s.act('approve',{'draft_id':e['id']})
        s=self.s.read()
        self.assertEqual(s['handoff'],{'draft_id':e['id'],'case_id':'APX-001','payload':e['payload']})
        self.assertEqual(s['assigned_to'],e['payload']['queue'])
    def test_analysis_withholds_finding_until_evidence_released(self):
        for kind in ('compare','gap'): self.assertNotIn('T-198',self.s.analysis(kind)['text'])
        d=self.draft('REQUEST_EVIDENCE'); self.s.act('approve',{'draft_id':d['id']})
        self.assertNotIn('T-198',self.s.analysis('compare')['text'])
        self.s.act('response',{})
        self.assertIn('T-198',self.s.analysis('compare')['text'])
        with self.assertRaises(KeyError): self.s.analysis('nope')
    def test_raw_evidence_states_observations_not_conclusions(self):
        banned=('does not establish','does not show','does not prove','this demo','weakens','undermines')
        for e in self.s.read()['evidence']:
            for phrase in banned: self.assertNotIn(phrase,e['text'].lower(),e['id'])

if __name__=='__main__': unittest.main()

