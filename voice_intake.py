"""Private call/session binding. Identity is simulated; keypad 1 is consent, not a PIN."""
import hashlib
import hmac
import json
import re
import secrets
import time
from intake import IntakeError, screened


class VoiceIntake:
    def __init__(self, intake):
        self.intake = intake
        intake.db.execute('CREATE TABLE IF NOT EXISTS voice_links (session_id TEXT PRIMARY KEY, call_sid TEXT UNIQUE, expires_at INTEGER NOT NULL)')
        intake.db.commit()

    def _require_new_report(self):
        run = self.intake.current_run()
        if any(c.get('customer_ref') == 'demo:martha' and c.get('transaction_id') == 'T-204'
               and c.get('demo_run') == run for c in self.intake.cases()):
            raise IntakeError('duplicate_dispute')

    def arm(self, transaction_id):
        with self.intake.lock:
            self._require_new_report()
            session = self.intake.start(transaction_id, channel='voice')
            self.intake.db.execute('DELETE FROM voice_links WHERE call_sid IS NULL')
            self.intake.db.execute('INSERT INTO voice_links VALUES (?,NULL,?)', (session['session_id'], int(time.time()) + 600))
            self.intake.db.commit()
            return session

    def claim(self, call_sid):
        if not isinstance(call_sid, str) or not re.fullmatch(r'CA[a-fA-F0-9]{32}', call_sid): raise IntakeError('call_denied', 403)
        with self.intake.lock:
            if self.intake.db.execute('SELECT 1 FROM voice_links WHERE call_sid=?', (call_sid,)).fetchone():
                raise IntakeError('call_already_claimed', 409)
            self._require_new_report()
            rows = self.intake.db.execute('SELECT v.session_id,i.body FROM voice_links v JOIN intakes i ON i.id=v.session_id WHERE v.call_sid IS NULL AND v.expires_at>?', (time.time(),)).fetchall()
            eligible = [(sid, json.loads(body)) for sid, body in rows if json.loads(body).get('demo_run') == self.intake.current_run()]
            if len(eligible) != 1: raise IntakeError('no_armed_call', 409)
            sid, s = eligible[0]
            token = secrets.token_urlsafe(32)
            s.update(voice_token_hash=hashlib.sha256(token.encode()).hexdigest(), voice_status='verifying', support_verified=False)
            self.intake.db.execute('UPDATE voice_links SET call_sid=? WHERE session_id=?', (call_sid, sid))
            self.intake._save(s)
            return {'session_id': sid, 'token': token, 'revision': s['revision'], 'identity_verification': 'simulated_not_oauth'}

    def session(self, sid, token, require_verified=True):
        s = self.intake._session(sid, token)
        if s.get('channel') != 'voice' or not isinstance(token, str) or not hmac.compare_digest(s.get('voice_token_hash', ''), hashlib.sha256(token.encode()).hexdigest()):
            raise IntakeError('call_denied', 403)
        row = self.intake.db.execute('SELECT call_sid,expires_at FROM voice_links WHERE session_id=?', (sid,)).fetchone()
        if not row or not row[0] or row[1] <= time.time() or s.get('voice_status') == 'ended': raise IntakeError('call_ended', 409)
        if require_verified and s.get('support_verified') is not True: raise IntakeError('support_verification_required', 403)
        return s

    def verified(self, sid, token):
        # Only the private bridge capability can attest its signed keypad check.
        with self.intake.lock:
            s = self.session(sid, token, require_verified=False)
            if s.get('support_verified'): raise IntakeError('support_already_verified', 409)
            self._require_new_report()
            s.update(support_verified=True, voice_status='connected')
            self.intake._save(s)
            return {'support_check': 'passed_demo_only',
                    'transaction': {'merchant': 'JCPenney', 'amount': 648.50, 'currency': 'USD', 'transaction_id': 'T-204', 'card_last_four': '8821'}}

    def transcript(self, sid, token, item_id, text):
        text = screened(text)
        if not isinstance(item_id, str) or not re.fullmatch(r'[A-Za-z0-9_-]{5,100}', item_id): raise IntakeError('invalid_turn', 400)
        with self.intake.lock:
            s = self.session(sid, token)
            if s['case_id']: return {'revision': s['revision'], 'submitted': True}
            if item_id in s['turns']:
                if s['turns'][item_id] != text: raise IntakeError('turn_conflict')
                return {'revision': s['revision'], 'duplicate': True}
            if len(s['turns']) >= 30 or sum(map(len, s['turns'].values())) + len(text) > 12000: raise IntakeError('conversation_limit')
            s['turns'][item_id] = text
            s['messages'].append({'role': 'user', 'content': text})
            s['revision'] += 1
            s.update(review=None, readback_played=False, voice_status='connected')
            self.intake._save(s)
            return {'revision': s['revision']}

    def prepare(self, sid, token, revision, statement, reason):
        statement = screened(statement, 3000)
        if reason not in ('unauthorized', 'duplicate', 'amount', 'goods'): raise IntakeError('clarification_required', 400)
        with self.intake.lock:
            s = self.session(sid, token)
            if s['case_id']: raise IntakeError('already_submitted')
            if type(revision) is not int or revision != s['revision'] or not s['turns']: raise IntakeError('stale_intake')
            review = {'statement': statement, 'reason': reason, 'transaction_id': 'T-204', 'merchant': 'JCPenney', 'amount': 648.50,
                      'nonce': secrets.token_urlsafe(24)}
            s.update(review=review, readback_played=False, voice_status='reviewing')
            self.intake._save(s)
            return {'revision': revision, 'review': review}

    def played(self, sid, token, revision, nonce):
        with self.intake.lock:
            s = self.session(sid, token)
            review = s.get('review') or {}
            if type(revision) is not int or revision != s['revision'] or not isinstance(nonce, str) or not hmac.compare_digest(review.get('nonce', ''), nonce):
                raise IntakeError('stale_confirmation')
            s['readback_played'] = True
            self.intake._save(s)
            return {'ready_for_keypad_confirmation': True}

    def confirm(self, sid, token, revision, nonce, digit):
        with self.intake.lock:
            s = self.session(sid, token)
            if digit != '1' or not s.get('readback_played'): raise IntakeError('keypad_confirmation_required', 403)
            try:
                result = self.intake.confirm(sid, token, revision, nonce, voice_confirmation=True)
            except IntakeError as error:
                if error.code == 'duplicate_dispute':
                    s.update(voice_status='duplicate', readback_played=False)
                    self.intake._save(s)
                raise
            # Separate persisted read before returning a receipt.
            saved = self.intake._session(sid, token)
            case = self.intake.read_case(result['case_id'])
            if saved['case_id'] != case['id'] or case['intake_id'] != sid: raise IntakeError('submission_not_verified')
            saved['voice_status'] = 'submitted'; self.intake._save(saved)
            return {**result, 'verified_saved_case': True}

    def correct(self, sid, token):
        with self.intake.lock:
            s = self.session(sid, token)
            if s['case_id']: raise IntakeError('already_submitted')
            s.update(review=None, readback_played=False, voice_status='connected')
            self.intake._save(s)
            return {'correction_requested': True}

    def end(self, sid, token):
        with self.intake.lock:
            s = self.session(sid, token, require_verified=False)
            s.update(voice_status='ended', readback_played=False)
            self.intake._save(s)
            return {'ended': True}
