"""Local synthetic case/intake service; models use a separate private worker."""
import json
import secrets
import sqlite3
import threading
from urllib.request import Request, urlopen
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
from intake import IntakeStore, IntakeError
from investigation import Investigation, ActionError

ROOT = Path(__file__).parent
LOCK = threading.RLock()

def model_response(payload):
    request = Request('http://127.0.0.1:8788/respond', data=json.dumps(payload).encode(),
                      headers={'Content-Type': 'application/json'}, method='POST')
    with urlopen(request, timeout=40) as response:
        return json.load(response)

class Conflict(Exception): pass

def find(s, evidence_id):
    return next(e for e in s['evidence'] if e['id'] == evidence_id)

# Fixed demo assessment text (no model). Served by the API so unreleased findings never ship in static JS.
# The second variant is returned only after E-004 has been released.
ANALYSIS = {
    'compare': (
        'E-001: the customer denies placing the order. E-003: the fictional merchant processor reports a recognized device, citing AUTH-77. E-002 identifies the disputed transaction as T-204. The packet does not establish that AUTH-77 belongs to T-204. Request the reference lookup before relying on that assertion.',
        'E-004 links AUTH-77 to prior transaction T-198, not T-204 in E-002. This weakens the support offered for the processor assertion in E-003. It does not prove fraud or establish authorization. Under synthetic DEMO-01, prepare a senior-review handoff with the unresolved question.'),
    'gap': (
        'Missing: a verified association between AUTH-77 and T-204. Scope the request to that association; avoid requesting unrelated customer data.',
        'Still unresolved: what evidence establishes authorization of T-204? The lookup answers the record-association question only. Consumer liability and network recovery remain undecided.'),
}

class Store:
    def __init__(self, path):
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.execute('CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY, body TEXT)')
        self.intake = IntakeStore(self.db, LOCK, self.fixture)
        self.investigation = Investigation(self, LOCK)
        if not self.db.execute('SELECT body FROM state WHERE id=1').fetchone(): self.reset()
    def read(self, case_id=None):
        if case_id is not None and (not isinstance(case_id, str) or not case_id or len(case_id) > 80):
            raise KeyError('invalid_case')
        if case_id and case_id != 'APX-001':
            return self.intake.read_case(case_id)
        return json.loads(self.db.execute('SELECT body FROM state WHERE id=1').fetchone()[0])
    def save(self, s):
        if s['id'] != 'APX-001':
            return self.intake.save_case(s)
        self.db.execute('INSERT OR REPLACE INTO state VALUES (1, ?)', (json.dumps(s),))
        self.db.commit()
    def event(self, s, message):
        s['timeline'].append({'at': datetime.now(timezone.utc).isoformat(), 'message': message})
    def fixture(self):
        s = {'id':'APX-001','customer':'Martha Rivera','merchant':'JCPenney','amount':648.50,'status':'IN_REVIEW','version':1,'request':None,'handoff':None,'draft':None,'receipts':{},'timeline':[], 'evidence':[
            {'id':'E-001','title':'Customer statement','source':'Synthetic voice intake transcript','kind':'Statement','text':'I recognize the store, but I did not place this order. I bought clothing there earlier this year.','available':True},
            {'id':'E-002','title':'Transaction record','source':'Synthetic Apex card ledger','kind':'Record','text':'Transaction T-204: $648.50, online purchase, JCPenney. Card ending 8821.','available':True},
            {'id':'E-003','title':'Merchant-processor export','source':'Synthetic export from a fictional merchant processor','kind':'Assertion','text':'Processor export claim: "The purchase originated from a recognized device." Export row: auth_record=AUTH-77, device_recognized=true.','available':True},
            {'id':'E-004','title':'Authentication reference lookup','source':'Synthetic Apex evidence operations','kind':'Record','text':'Lookup result: authentication record AUTH-77 is associated with transaction T-198.','available':False}
        ]}
        return s
    def reset(self):
        s = self.fixture()
        self.event(s, 'Demo case loaded at later evidence-review stage; all records are synthetic.')
        self.save(s)
        return s
    def act(self, action, data):
        with LOCK:
            s = self.read(data.get('case_id'))
            if action == 'reset':
                if s['id'] != 'APX-001': raise Conflict('Reset applies only to the seeded demo case.')
                return self.reset()
            if s.get('intake_id') and action == 'draft':
                scopes = {'REQUEST_EVIDENCE': 'authentication_transaction_association', 'REQUEST_PROCESSOR_EVIDENCE': 'processor_transaction_evidence'}
                if data.get('kind') not in scopes: raise Conflict('This case requires the new reviewed resolution path, not the legacy specialist handoff.')
                return self.investigation.stage(s['id'], s['version'], scopes[data['kind']], 'demo:barbara')
            if s.get('intake_id') and action == 'approve':
                raise Conflict('Use the separate exact-payload review endpoint for this case.')
            if action == 'processor_response':
                return self.investigation.attach_processor_response(s['id'], 'demo:barbara')
            if action == 'review_packet':
                if s['status'] != 'INTAKE_RECEIVED': raise Conflict('This case is not awaiting its later packet.')
                find(s, 'E-003')['available'] = True
                find(s, 'E-003')['record'] = {'auth_record_id': 'AUTH-77', 'transaction_reference': None, 'device_recognized': True}
                s['version'] += 1
                s['status'] = 'IN_REVIEW'
                self.event(s, 'SIMULATION: later fictional processor packet attached for analyst review; snapshot advanced.')
            elif action == 'draft':
                kind = data.get('kind')
                if kind == 'REQUEST_EVIDENCE' and s['status'] == 'IN_REVIEW':
                    payload = {'queue':'Apex evidence operations','question':'Which transaction is AUTH-77 associated with?','source_ids':['E-002','E-003']}
                elif kind == 'ESCALATE_REVIEW' and s['status'] == 'EVIDENCE_RECEIVED':
                    payload = {'queue':'Senior dispute review','reason':'Supporting record refers to a different transaction. Authorization remains unresolved.','source_ids':['E-002','E-003','E-004']}
                else: raise Conflict('Action is not permitted in the current case state.')
                s['draft'] = {'id':secrets.token_hex(12),'kind':kind,'case_id':s['id'],'version':s['version'],'payload':payload}
                self.event(s, 'Action staged for local demo operator approval: '+kind)
            elif action == 'approve':
                draft_id = data.get('draft_id')
                if draft_id in s['receipts']: return s
                d = s['draft']
                if not d or d['id'] != draft_id or d['version'] != s['version']: raise Conflict('Draft is missing or stale. Review a new draft.')
                if d['kind'] == 'REQUEST_EVIDENCE' and s['status'] == 'IN_REVIEW':
                    p = d['payload']
                    s['request'] = {'id':'REQ-'+draft_id[:8],'draft_id':draft_id,'case_id':s['id'],'status':'OPEN','queue':p['queue'],'question':p['question'],'source_ids':list(p['source_ids'])}
                    s['status'] = 'PENDING_EVIDENCE'
                elif d['kind'] == 'ESCALATE_REVIEW' and s['status'] == 'EVIDENCE_RECEIVED':
                    s['status'] = 'SPECIALIST_REVIEW'
                    s['assigned_to'] = d['payload']['queue']
                    s['handoff'] = {'draft_id':draft_id,'case_id':s['id'],'payload':json.loads(json.dumps(d['payload']))}
                else: raise Conflict('Case state changed. Review a new draft.')
                s['receipts'][draft_id] = {'id':draft_id,'action':d['kind'],'case_id':s['id'],'evidence_version':s['version'],'result_status':s['status'],'actor':'local-demo-operator'}
                s['draft'] = None
                self.event(s, 'Local demo approval executed: '+d['kind'])
            elif action == 'response':
                if s['status'] != 'PENDING_EVIDENCE': raise Conflict('An open evidence request is required.')
                if s.get('intake_id'):
                    verification = self.investigation.result(s['id'], s['request']['draft_id'], 'demo:barbara')
                    if verification['status'] != 'VERIFIED_SAVED_REQUEST': raise Conflict('Verify the saved request before attaching a response.')
                find(s, 'E-004')['available'] = True
                s['version'] += 1
                s['draft'] = None
                s['request']['status'] = 'RESPONDED'
                s['status'] = 'EVIDENCE_RECEIVED'
                if s.get('intake_id'):
                    record = {'auth_record_id': 'AUTH-77', 'transaction_id': 'T-198'}
                    find(s, 'E-004')['record'] = record
                    s['association_check'] = {'source_id': 'E-004', 'auth_record_id': record['auth_record_id'],
                        'disputed_transaction_id': s['transaction_id'], 'returned_transaction_id': record['transaction_id'],
                        'matches_disputed_transaction': record['transaction_id'] == s['transaction_id'], 'evidence_version': s['version']}
                self.event(s, 'SIMULATION: later evidence response attached; snapshot advanced; pending draft invalidated.')
            else: raise Conflict('Unknown action.')
            self.save(s)
            return s
    def analysis(self, kind, case_id=None):
        with LOCK:
            s = self.read(case_id)
        if kind not in ANALYSIS: raise KeyError(kind)
        if s.get('intake_id'): raise Conflict('Use actual ChatGPT for this case; fixed assessments are legacy seed scaffolds only.')
        if not find(s, 'E-003')['available']: raise Conflict('Processor packet has not been received.')
        released = find(s, 'E-004')['available']
        return {'kind': kind, 'case_id': s['id'], 'evidence_version': s['version'], 'text': ANALYSIS[kind][1 if released else 0]}

class Handler(BaseHTTPRequestHandler):
    def reply(self, code, body, mime='application/json'):
        raw = json.dumps(body).encode() if mime == 'application/json' else body
        self.send_response(code)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length',str(len(raw)))
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.end_headers(); self.wfile.write(raw)
    def do_GET(self):
        path = urlsplit(self.path).path
        query = parse_qs(urlsplit(self.path).query, keep_blank_values=True)
        case_id = query.get('case_id', [None])[0]
        if path == '/api/intake/session' or path == '/api/customer-case':
            try:
                session = self.server.store.intake.get(query.get('session_id', [''])[0], self.headers.get('X-Apex-Session'))
                if path == '/api/intake/session': return self.reply(200, session)
                if not session['case_id']: return self.reply(200, {'case_id': None})
                with LOCK: case = self.server.store.read(session['case_id'])
                return self.reply(200, {'case_id': case['id'], 'status': case['status'], 'merchant': case['merchant'], 'amount': case['amount']})
            except IntakeError as e: return self.reply(e.status, {'error': e.code})
        if path in ('/api/cases', '/api/demo-assignments'):
            with LOCK:
                cases = [self.server.store.read()] + self.server.store.intake.cases()
            if path == '/api/demo-assignments':
                return self.reply(200, {'demo:barbara': {'role': 'analyst', 'cases': [s['id'] for s in cases if s['id'] == 'APX-001' or s.get('assigned_to') == 'demo:barbara']}})
            return self.reply(200, [{'case_id': s['id'], 'customer': s['customer'], 'merchant': s['merchant'], 'amount': s['amount'],
                                     'status': s['status'], 'version': s['version'], 'assigned_to': s.get('assigned_to', 'local-demo-operator')} for s in cases])
        if path == '/api/action-result':
            try:
                return self.reply(200, self.server.store.investigation.result(case_id, query.get('action_id', [''])[0], self.headers.get('X-Apex-Actor')))
            except ActionError as e: return self.reply(e.status, {'error': e.code})
            except KeyError: return self.reply(404, {'error': 'case_unavailable'})
        if path == '/api/case':
            with LOCK:
                try: s = self.server.store.read(case_id)
                except KeyError: return self.reply(404, {'error': 'case_unavailable'})
                # Unreleased evidence bodies must never reach the initial browser response.
                s['evidence'] = [e if e['available'] else {k:v for k,v in e.items() if k in ('id', 'title', 'source', 'kind', 'available')} for e in s['evidence']]
                return self.reply(200,s)
        if path.startswith('/api/analysis/'):
            try: return self.reply(200,self.server.store.analysis(path.rsplit('/',1)[1], case_id))
            except KeyError: return self.reply(404,{'error':'Not found'})
            except Conflict as e: return self.reply(409, {'error': str(e)})
        files = {'/':('banking.html','text/html; charset=utf-8'),'/banking':('banking.html','text/html; charset=utf-8'),'/banking.js':('banking.js','text/javascript; charset=utf-8'),'/banking.css':('banking.css','text/css; charset=utf-8'),'/ops':('index.html','text/html; charset=utf-8'),'/app.js':('app.js','text/javascript; charset=utf-8'),'/verify.js':('verify.js','text/javascript; charset=utf-8'),'/style.css':('style.css','text/css; charset=utf-8')}
        files.update({'/queue': ('queue.html', 'text/html; charset=utf-8'), '/queue.js': ('queue.js', 'text/javascript; charset=utf-8'),
                      '/intake.css': ('intake.css', 'text/css; charset=utf-8')})
        if path in files:
            name,mime = files[path]; return self.reply(200,(ROOT/'web'/name).read_bytes(),mime)
        self.reply(404,{'error':'Not found'})
    def do_POST(self):
        path = urlsplit(self.path).path
        if path not in ('/api/action', '/api/intake/start', '/api/intake/turn', '/api/intake/confirm', '/api/stage-request', '/api/review-action'): return self.reply(404,{'error':'Not found'})
        # Local demo CSRF boundary, not production identity/authentication.
        if self.headers.get('X-Apex-Demo') != 'local': return self.reply(403,{'error':'Missing demo request header'})
        origin = self.headers.get('Origin')
        if origin and origin != 'http://'+self.headers.get('Host',''): return self.reply(403,{'error':'Origin denied'})
        try:
            size = int(self.headers.get('Content-Length','0'))
            if not 0 < size <= 8192: return self.reply(400,{'error':'Invalid request size'})
            data = json.loads(self.rfile.read(size))
            if not isinstance(data,dict): raise ValueError()
            if path == '/api/stage-request':
                return self.reply(200, self.server.store.investigation.stage(data.get('case_id'), data.get('snapshot'), data.get('scope'), self.headers.get('X-Apex-Actor')))
            if path == '/api/review-action':
                return self.reply(200, self.server.store.investigation.approve(data, 'demo:barbara'))
            if path.startswith('/api/intake/'):
                intake = self.server.store.intake
                if path.endswith('/start'): return self.reply(200, intake.start(data.get('transaction_id')))
                sid, token = data.get('session_id'), self.headers.get('X-Apex-Session')
                if path.endswith('/confirm'):
                    return self.reply(200, intake.confirm(sid, token, data.get('revision'), data.get('nonce')))
                payload, cached = intake.prepare(sid, token, data.get('revision'), data.get('turn_id'), data.get('message'))
                if cached is not None: return self.reply(200, cached)
                try:
                    result = getattr(self.server, 'intake_model', model_response)(payload)
                    result = intake.finish(sid, token, data.get('revision'), data.get('turn_id'), result)
                except Exception as error:
                    intake.fail(sid, token, data.get('turn_id'))
                    if isinstance(error, IntakeError): raise
                    return self.reply(502, {'error': 'intake_model_unavailable'})
                return self.reply(200, result)
            if 'case_id' in data and (not isinstance(data['case_id'], str) or not data['case_id']):
                return self.reply(400, {'error': 'invalid_case'})
            self.server.store.act(data.get('action'),data)
            # Read-back occurs through GET /api/case in the UI, not this acknowledgement.
            self.reply(200,{'accepted':True})
        except Conflict as e: self.reply(409,{'error':str(e)})
        except IntakeError as e: self.reply(e.status, {'error': e.code})
        except ActionError as e: self.reply(e.status, {'error': e.code})
        except KeyError: self.reply(404, {'error': 'case_unavailable'})
        except (ValueError,TypeError): self.reply(400,{'error':'Invalid request'})

if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1',8080),Handler)
    server.store = Store(ROOT/'demo.sqlite')
    print('Apex synthetic prototype: http://127.0.0.1:8080', flush=True)
    server.serve_forever()

