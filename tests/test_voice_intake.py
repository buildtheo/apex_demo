import copy
import unittest
from unittest.mock import patch
from server import Store
from intake import IntakeError

CALL = 'CA' + 'a' * 32


class VoiceIntakeTests(unittest.TestCase):
    def setUp(self):
        self.store = Store(':memory:')
        self.voice = self.store.voice
        self.browser = self.voice.arm('T-204')
        self.link = self.voice.claim(CALL)
        self.sid, self.token = self.link['session_id'], self.link['token']

    def tearDown(self): self.store.db.close()

    def draft(self):
        self.voice.transcript(self.sid, self.token, 'item-first', 'I shop at JCPenney, but I did not authorize this purchase.')
        return self.voice.prepare(self.sid, self.token, 1, 'I recognize the store, but I did not authorize this purchase.', 'unauthorized')

    def test_submission_requires_completed_readback_and_keypad_not_model_or_browser(self):
        draft = self.draft(); nonce = draft['review']['nonce']
        self.assertEqual(self.store.intake.cases(), [])
        with self.assertRaises(IntakeError): self.voice.confirm(self.sid, self.token, 1, nonce, '1')
        with self.assertRaises(IntakeError): self.store.intake.confirm(self.sid, self.browser['token'], 1, nonce)
        self.voice.played(self.sid, self.token, 1, nonce)
        for digit in ('yes', None, 1, '2'):
            with self.assertRaises(IntakeError): self.voice.confirm(self.sid, self.token, 1, nonce, digit)
        result = self.voice.confirm(self.sid, self.token, 1, nonce, '1')
        self.assertTrue(result['verified_saved_case'])
        self.assertEqual(self.voice.confirm(self.sid, self.token, 1, nonce, '1')['case_id'], result['case_id'])
        case = self.store.read(result['case_id'])
        self.assertEqual(case['intake_channel'], 'voice')
        self.assertIn('speech-to-text', case['evidence'][0]['source'])
        self.assertNotIn('original audio', case['evidence'][0]['source'])
        self.assertEqual([e['id'] for e in case['evidence'] if e['available']], ['E-001', 'E-002'])
        self.assertEqual(self.store.intake.get(self.sid, self.browser['token'])['case_id'], case['id'])
        self.assertEqual(len(self.store.intake.cases()), 1)
        self.assertIsNone(self.store.credit.ledger(case['id']))

    def test_correction_invalidates_old_readback_and_confirmation(self):
        draft = self.draft(); nonce = draft['review']['nonce']
        self.voice.played(self.sid, self.token, 1, nonce)
        self.voice.transcript(self.sid, self.token, 'item-correct', 'Correction, my earlier purchase was in May.')
        with self.assertRaises(IntakeError): self.voice.confirm(self.sid, self.token, 1, nonce, '1')
        with self.assertRaises(IntakeError): self.voice.played(self.sid, self.token, 1, nonce)
        next_draft = self.voice.prepare(self.sid, self.token, 2, 'I bought there in May, but not this purchase.', 'unauthorized')
        self.assertNotEqual(next_draft['review']['nonce'], nonce)
        self.voice.correct(self.sid, self.token)
        with self.assertRaises(IntakeError): self.voice.played(self.sid, self.token, 2, next_draft['review']['nonce'])
        self.assertEqual(self.store.intake.cases(), [])

    def test_hangup_restart_expiry_and_wrong_capability_never_create_case(self):
        draft = self.draft(); nonce = draft['review']['nonce']
        for operation in (lambda: self.voice.prepare(self.sid, self.browser['token'], 1, 'A statement', 'unauthorized'),
                          lambda: self.voice.claim(CALL),
                          lambda: self.voice.claim('CA' + 'b' * 32)):
            with self.assertRaises(IntakeError): operation()
        self.voice.end(self.sid, self.token)
        with self.assertRaises(IntakeError): self.voice.confirm(self.sid, self.token, 1, nonce, '1')
        self.assertEqual(self.store.intake.cases(), [])
        self.store.intake.restart('voice-next-run')
        with self.assertRaises(IntakeError): self.voice.transcript(self.sid, self.token, 'late-turn', 'Late result')
        session = self.voice.arm('T-204')
        with patch('voice_intake.time.time', return_value=10**12):
            with self.assertRaises(IntakeError): self.voice.claim('CA' + 'c' * 32)

    def test_sensitive_transcripts_are_not_persisted_and_text_worker_cannot_use_voice_session(self):
        before = copy.deepcopy(self.store.intake.get(self.sid, self.browser['token']))
        for text in ('My card is 4111 1111 1111 1111', 'PIN: 1776', 'CVV: 123'):
            with self.assertRaises(IntakeError): self.voice.transcript(self.sid, self.token, 'unsafe-item', text)
        self.assertEqual(self.store.intake.get(self.sid, self.browser['token']), before)
        with self.assertRaises(IntakeError): self.store.intake.prepare(self.sid, self.browser['token'], 0, 'text-turn-01', 'Use the text model')

    def test_transcript_retries_and_active_run_duplicate_case_protection(self):
        self.draft()
        self.assertTrue(self.voice.transcript(self.sid, self.token, 'item-first', 'I shop at JCPenney, but I did not authorize this purchase.')['duplicate'])
        with self.assertRaises(IntakeError): self.voice.transcript(self.sid, self.token, 'item-first', 'A different statement')
        s = self.store.intake._session(self.sid, self.token); nonce = s['review']['nonce']
        other = self.voice.arm('T-204'); linked = self.voice.claim('CA' + 'd' * 32)
        self.voice.transcript(linked['session_id'], linked['token'], 'another-item', 'I deny this purchase.')
        d = self.voice.prepare(linked['session_id'], linked['token'], 1, 'I deny this purchase.', 'unauthorized')
        self.voice.played(linked['session_id'], linked['token'], 1, d['review']['nonce'])
        self.voice.played(self.sid, self.token, 1, nonce)
        self.voice.confirm(self.sid, self.token, 1, nonce, '1')
        with self.assertRaises(IntakeError) as error:
            self.voice.confirm(linked['session_id'], linked['token'], 1, d['review']['nonce'], '1')
        self.assertEqual(error.exception.code, 'duplicate_dispute')
        self.assertEqual(self.store.intake.get(other['session_id'], other['token'])['voice_status'], 'duplicate')
        self.assertEqual(len(self.store.intake.cases()), 1)

    def test_existing_report_blocks_arming_and_claim_without_overwriting_saved_case(self):
        draft = self.draft()
        pending = self.voice.arm('T-204')
        self.voice.played(self.sid, self.token, 1, draft['review']['nonce'])
        result = self.voice.confirm(self.sid, self.token, 1, draft['review']['nonce'], '1')
        case_before = copy.deepcopy(self.store.read(result['case_id']))
        count = self.store.db.execute('SELECT COUNT(*) FROM intakes').fetchone()[0]
        for operation in (lambda: self.voice.arm('T-204'), lambda: self.voice.claim('CA' + 'e' * 32)):
            with self.assertRaises(IntakeError) as error: operation()
            self.assertEqual(error.exception.code, 'duplicate_dispute')
        self.assertEqual(self.store.db.execute('SELECT COUNT(*) FROM intakes').fetchone()[0], count)
        self.assertEqual(self.store.read(result['case_id']), case_before)
        self.assertEqual(self.store.intake.get(pending['session_id'], pending['token'])['voice_status'], 'ready')
        self.store.intake.restart('explicit-fresh-voice-run')
        self.assertEqual(self.voice.arm('T-204')['channel'], 'voice')
        self.assertEqual(self.store.read(result['case_id']), case_before)
