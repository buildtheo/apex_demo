"""Persistent synthetic intake. Customer/session identity is simulated, not OAuth."""
import hashlib
import hmac
import json
import re
import secrets
import time


class IntakeError(Exception):
    def __init__(self, code, status=409):
        self.code, self.status = code, status


def screened(value, limit=2000):
    if (not isinstance(value, str) or not value.strip() or len(value) > limit
            or re.search(r'(?:\d[ -]?){13,19}', value)
            or re.search(r'\b(?:cvv|cvc|security code|pin|password)\s*(?::|=|is\b)\s*\S+', value, re.I)
            or re.search(r'\b(?:(?:zero|one|two|three|four|five|six|seven|eight|nine|oh)[\s,-]+){12}(?:zero|one|two|three|four|five|six|seven|eight|nine|oh)\b', value, re.I)):
        raise IntakeError('content_blocked', 400)
    return value.strip()


class IntakeStore:
    def __init__(self, db, lock, fixture):
        self.db, self.lock, self.fixture = db, lock, fixture
        db.execute('CREATE TABLE IF NOT EXISTS intakes (id TEXT PRIMARY KEY, token_hash TEXT, body TEXT NOT NULL)')
        db.execute('CREATE TABLE IF NOT EXISTS submitted_cases (id TEXT PRIMARY KEY, intake_id TEXT UNIQUE NOT NULL, body TEXT NOT NULL)')
        db.execute('CREATE TABLE IF NOT EXISTS demo_restarts (request_id TEXT PRIMARY KEY, run_id TEXT UNIQUE NOT NULL)')
        db.commit()

    def current_run(self):
        row = self.db.execute('SELECT run_id FROM demo_restarts ORDER BY rowid DESC LIMIT 1').fetchone()
        return row[0] if row else None

    def restart(self, request_id):
        if not isinstance(request_id, str) or not re.fullmatch(r'[A-Za-z0-9-]{8,80}', request_id):
            raise IntakeError('invalid_restart', 400)
        with self.lock:
            existing = self.db.execute('SELECT run_id FROM demo_restarts WHERE request_id=?', (request_id,)).fetchone()
            if existing:
                if existing[0] != self.current_run(): raise IntakeError('restart_superseded')
                return {'run_id': existing[0], 'duplicate': True}
            run_id = secrets.token_hex(16)
            self.db.execute('INSERT INTO demo_restarts VALUES (?,?)', (request_id, run_id))
            self.db.commit()
            return {'run_id': run_id, 'duplicate': False}

    def _save(self, s):
        self.db.execute('UPDATE intakes SET body=? WHERE id=?', (json.dumps(s), s['session_id']))
        self.db.commit()

    def _session(self, sid, token):
        if not isinstance(sid, str) or not isinstance(token, str):
            raise IntakeError('session_denied', 403)
        row = self.db.execute('SELECT token_hash,body FROM intakes WHERE id=?', (sid,)).fetchone()
        if not row or not hmac.compare_digest(row[0], hashlib.sha256(token.encode()).hexdigest()):
            raise IntakeError('session_denied', 403)
        session = json.loads(row[1])
        if session.get('demo_run') != self.current_run():
            raise IntakeError('demo_restarted', 409)
        if session.get('preview_only') and session.get('expires_at', 0) <= time.time():
            raise IntakeError('preview_expired', 403)
        return session

    def view(self, s):
        result = {key: s[key] for key in ('session_id', 'revision', 'messages', 'review', 'case_id')}
        result['demo_run'] = s.get('demo_run')
        if s.get('preview_only'): result['customer_preview'] = True
        return result

    def customer_preview(self, case_id):
        """Called only after separate local operator authorization and credit verification."""
        with self.lock:
            case = self.read_case(case_id)
            if case.get('customer_ref') != 'demo:martha' or case.get('transaction_id') != 'T-204':
                raise IntakeError('session_denied', 403)
            token = secrets.token_urlsafe(32)
            session = {'session_id': secrets.token_hex(16), 'revision': 0, 'messages': [], 'review': None,
                       'case_id': case_id, 'turns': {}, 'pending': None, 'preview_only': True,
                       'demo_run': self.current_run(),
                       'expires_at': int(time.time()) + 3600}
            self.db.execute('INSERT INTO intakes VALUES (?,?,?)', (session['session_id'], hashlib.sha256(token.encode()).hexdigest(), json.dumps(session)))
            self.db.commit()
            return {**self.view(session), 'token': token}

    def start(self, transaction_id):
        if transaction_id != 'T-204':
            raise IntakeError('transaction_denied', 403)
        token = secrets.token_urlsafe(32)
        s = {'session_id': secrets.token_hex(16), 'revision': 0, 'review': None, 'case_id': None,
             'messages': [{'role': 'assistant', 'content': "You selected the $648.50 JCPenney purchase. What happened? Please don't share your full card number, security code, PIN or password."}],
             'turns': {}, 'pending': None}
        with self.lock:
            s['demo_run'] = self.current_run()
            self.db.execute('INSERT INTO intakes VALUES (?,?,?)', (s['session_id'], hashlib.sha256(token.encode()).hexdigest(), json.dumps(s)))
            self.db.commit()
        return {**self.view(s), 'token': token}

    def get(self, sid, token):
        with self.lock:
            return self.view(self._session(sid, token))

    def prepare(self, sid, token, revision, turn_id, message):
        message = screened(message)
        if not isinstance(turn_id, str) or not re.fullmatch(r'[A-Za-z0-9-]{8,80}', turn_id):
            raise IntakeError('invalid_turn', 400)
        with self.lock:
            s = self._session(sid, token)
            if s.get('preview_only'): raise IntakeError('preview_read_only', 403)
            if turn_id in s['turns']:
                if s['turns'][turn_id] != message:
                    raise IntakeError('turn_conflict')
                return None, self.view(s)
            if s['case_id']:
                raise IntakeError('already_submitted')
            if type(revision) is not int or s['revision'] != revision:
                raise IntakeError('stale_intake')
            if s['pending'] and time.time() - s['pending']['at'] < 90:
                raise IntakeError('turn_in_progress')
            users = [m['content'] for m in s['messages'] if m['role'] == 'user']
            if len(users) >= 6 or sum(map(len, users)) + len(message) > 6000:
                raise IntakeError('conversation_limit', 400)
            s['review'] = None
            s['pending'] = {'id': turn_id, 'message': message, 'at': time.time()}
            self._save(s)
            return {'transaction_id': 'T-204', 'messages': s['messages'] + [{'role': 'user', 'content': message}]}, None

    def finish(self, sid, token, revision, turn_id, result):
        reply = screened(result.get('reply'), 2000)
        statement = screened(result.get('statement'), 3000)
        reason = result.get('reason')
        if reason not in ('unauthorized', 'duplicate', 'amount', 'goods', 'unclear') or type(result.get('ready')) is not bool:
            raise IntakeError('invalid_model_output', 502)
        with self.lock:
            s = self._session(sid, token)
            if s['revision'] != revision or not s['pending'] or s['pending']['id'] != turn_id or s['case_id']:
                raise IntakeError('stale_intake')
            message = s['pending']['message']
            s['messages'] += [{'role': 'user', 'content': message}, {'role': 'assistant', 'content': reply}]
            s['turns'][turn_id] = message
            s['revision'] += 1
            s['pending'] = None
            if result['ready'] and reason != 'unclear':
                s['review'] = {'statement': statement, 'reason': reason, 'transaction_id': 'T-204',
                               'merchant': 'JCPenney', 'amount': 648.50, 'nonce': secrets.token_urlsafe(24)}
            s['model_meta'] = result.get('model_meta', {})
            self._save(s)
            return self.view(s)

    def fail(self, sid, token, turn_id):
        with self.lock:
            s = self._session(sid, token)
            if s['pending'] and s['pending']['id'] == turn_id:
                s['pending'] = None
                self._save(s)

    def confirm(self, sid, token, revision, nonce):
        with self.lock:
            s = self._session(sid, token)
            if s.get('preview_only'): raise IntakeError('preview_read_only', 403)
            review = s['review']
            if (type(revision) is not int or revision != s['revision'] or s['pending'] or not review
                    or not isinstance(nonce, str) or not hmac.compare_digest(review['nonce'], nonce)):
                raise IntakeError('stale_confirmation')
            if s['case_id']:
                return {'case_id': s['case_id'], 'duplicate': True}
            if any(c.get('customer_ref') == 'demo:martha' and c.get('transaction_id') == 'T-204'
                   and c.get('demo_run') == s.get('demo_run') for c in self.cases()):
                raise IntakeError('duplicate_dispute')
            case = self.fixture()
            case.update(id='APX-' + secrets.token_hex(4).upper(), status='INTAKE_RECEIVED', assigned_to='demo:barbara',
                        intake_id=sid, customer_ref='demo:martha', transaction_id='T-204', identity_verification='simulated_not_oauth',
                        investigation_mode='chatgpt_bounded')
            if s.get('demo_run'): case['demo_run'] = s['demo_run']
            if review['reason'] != 'unauthorized':
                case['status'] = 'MANUAL_REVIEW_REQUIRED'
            case['customer_confirmed_intake'] = {k: v for k, v in review.items() if k != 'nonce'}
            case['customer_statements'] = [m['content'] for m in s['messages'] if m['role'] == 'user']
            case['model_meta'] = s.get('model_meta', {})
            case['evidence'][0].update(source='Synthetic customer-confirmed in-app intake',
                text="Customer statements (unaltered):\n" + '\n'.join(case['customer_statements']) + '\nCustomer-confirmed summary:\n' + review['statement'])
            case['evidence'][2]['available'] = False
            case['timeline'] = [{'at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                                 'message': 'Customer confirmed intake; synthetic case assigned to Barbara. Processor evidence not yet received.'}]
            self.db.execute('INSERT INTO submitted_cases VALUES (?,?,?)', (case['id'], sid, json.dumps(case)))
            s['case_id'] = case['id']
            self._save(s)
            return {'case_id': case['id'], 'duplicate': False}

    def read_case(self, case_id):
        row = self.db.execute('SELECT body FROM submitted_cases WHERE id=?', (case_id,)).fetchone()
        if not row:
            raise KeyError(case_id)
        return json.loads(row[0])

    def save_case(self, case):
        self.db.execute('UPDATE submitted_cases SET body=? WHERE id=?', (json.dumps(case), case['id']))
        self.db.commit()

    def cases(self):
        return [json.loads(row[0]) for row in self.db.execute('SELECT body FROM submitted_cases ORDER BY rowid DESC')]
