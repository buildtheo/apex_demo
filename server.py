"""Local synthetic workflow prototype. No real bank or model connections."""
import json
import secrets
import sqlite3
import threading
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).parent
LOCK = threading.RLock()

class Conflict(Exception): pass

class Store:
    def __init__(self, path):
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.execute('CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY, body TEXT)')
        if not self.db.execute('SELECT body FROM state WHERE id=1').fetchone(): self.reset()
    def read(self):
        return json.loads(self.db.execute('SELECT body FROM state WHERE id=1').fetchone()[0])
    def save(self, s):
        self.db.execute('INSERT OR REPLACE INTO state VALUES (1, ?)', (json.dumps(s),))
        self.db.commit()
    def event(self, s, message):
        s['timeline'].append({'at': datetime.now(timezone.utc).isoformat(), 'message': message})
    def reset(self):
        s = {'id':'APX-001','customer':'Elena Rivera','merchant':'VeloCraft Demo Store','amount':648.50,'status':'IN_REVIEW','version':1,'request':None,'draft':None,'receipts':{},'timeline':[], 'evidence':[
            {'id':'E-001','title':'Customer statement','source':'Synthetic voice intake transcript','kind':'Statement','text':'I recognize the store, but I did not place this order. I bought a helmet there earlier this year.','available':True},
            {'id':'E-002','title':'Transaction record','source':'Synthetic Apex card ledger','kind':'Record','text':'Transaction T-204: $648.50, online purchase. Customer card ending 8821. This demo begins at a later investigation stage.','available':True},
            {'id':'E-003','title':'Merchant supporting packet','source':'Synthetic merchant submission','kind':'Assertion','text':'The merchant asserts the purchase came from a recognized device. Its supporting export cites authentication record AUTH-77. The packet does not show the transaction reference associated with that record.','available':True},
            {'id':'E-004','title':'Authentication reference lookup','source':'Synthetic Apex evidence operations','kind':'Record','text':'The requested lookup associates AUTH-77 with T-198, a prior purchase, not the disputed T-204. This lookup does not establish which device was used for T-204 or whether the cardholder authorized it.','available':False}
        ]}
        self.event(s, 'Demo case loaded at later evidence-review stage; all records are synthetic.')
        self.save(s)
        return s
    def act(self, action, data):
        with LOCK:
            s = self.read()
            if action == 'reset': return self.reset()
            if action == 'draft':
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
                    s['request'] = {'id':'REQ-'+draft_id[:8],'status':'OPEN','queue':d['payload']['queue']}
                    s['status'] = 'PENDING_EVIDENCE'
                elif d['kind'] == 'ESCALATE_REVIEW' and s['status'] == 'EVIDENCE_RECEIVED':
                    s['status'] = 'SPECIALIST_REVIEW'
                    s['assigned_to'] = d['payload']['queue']
                else: raise Conflict('Case state changed. Review a new draft.')
                s['receipts'][draft_id] = {'id':draft_id,'action':d['kind'],'case_id':s['id'],'evidence_version':s['version'],'result_status':s['status'],'actor':'local-demo-operator'}
                s['draft'] = None
                self.event(s, 'Local demo approval executed: '+d['kind'])
            elif action == 'response':
                if s['status'] != 'PENDING_EVIDENCE': raise Conflict('An open evidence request is required.')
                s['evidence'][3]['available'] = True
                s['version'] += 1
                s['draft'] = None
                s['request']['status'] = 'RESPONDED'
                s['status'] = 'EVIDENCE_RECEIVED'
                self.event(s, 'SIMULATION: later evidence response attached; snapshot advanced; pending draft invalidated.')
            else: raise Conflict('Unknown action.')
            self.save(s)
            return s

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
        if self.path == '/api/case':
            with LOCK:
                s = self.server.store.read()
                # Unreleased evidence bodies must never reach the initial browser response.
                s['evidence'] = [e if e['available'] else {k:v for k,v in e.items() if k!='text'} for e in s['evidence']]
                return self.reply(200,s)
        files = {'/':('index.html','text/html; charset=utf-8'),'/app.js':('app.js','text/javascript; charset=utf-8'),'/style.css':('style.css','text/css; charset=utf-8')}
        if self.path in files:
            name,mime = files[self.path]; return self.reply(200,(ROOT/'web'/name).read_bytes(),mime)
        self.reply(404,{'error':'Not found'})
    def do_POST(self):
        if self.path != '/api/action': return self.reply(404,{'error':'Not found'})
        # Local demo CSRF boundary, not production identity/authentication.
        if self.headers.get('X-Apex-Demo') != 'local': return self.reply(403,{'error':'Missing demo request header'})
        origin = self.headers.get('Origin')
        if origin and origin != 'http://'+self.headers.get('Host',''): return self.reply(403,{'error':'Origin denied'})
        try:
            size = int(self.headers.get('Content-Length','0'))
            if not 0 < size <= 8192: return self.reply(400,{'error':'Invalid request size'})
            data = json.loads(self.rfile.read(size))
            if not isinstance(data,dict): raise ValueError()
            self.server.store.act(data.get('action'),data)
            # Read-back occurs through GET /api/case in the UI, not this acknowledgement.
            self.reply(200,{'accepted':True})
        except Conflict as e: self.reply(409,{'error':str(e)})
        except (ValueError,TypeError): self.reply(400,{'error':'Invalid request'})

if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1',8080),Handler)
    server.store = Store(ROOT/'demo.sqlite')
    print('Apex synthetic prototype: http://127.0.0.1:8080', flush=True)
    server.serve_forever()
