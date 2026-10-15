import unittest
from server import Store, Conflict

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
        self.assertTrue(self.s.read()['evidence'][3]['available'])

if __name__=='__main__': unittest.main()
