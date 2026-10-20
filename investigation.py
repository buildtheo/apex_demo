"""Synthetic request staging and separate local human approval. No financial action."""
import hashlib
import hmac
import json
import secrets
import time


class ActionError(Exception):
    def __init__(self, code, status=409):
        self.code, self.status = code, status


def payload_hash(payload):
    return hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


class Investigation:
    def __init__(self, store, lock):
        self.store, self.lock = store, lock

    def case(self, case_id, actor):
        case = self.store.read(case_id)
        if actor != 'demo:barbara' or case.get('assigned_to') != actor or not case.get('intake_id'):
            raise ActionError('action_denied', 403)
        return case

    def payload(self):
        return {'queue': 'Apex evidence operations', 'question': 'Which transaction is AUTH-77 associated with?',
                'source_ids': ['E-002', 'E-003'], 'auth_record_id': 'AUTH-77', 'disputed_transaction_id': 'T-204'}

    def require_context(self, case):
        if not all(any(e['id'] == source and e['available'] for e in case['evidence']) for source in ('E-002', 'E-003')):
            raise ActionError('source_unavailable')
        packet = next(e for e in case['evidence'] if e['id'] == 'E-003')
        if case.get('transaction_id') != 'T-204' or packet.get('record', {}).get('auth_record_id') != 'AUTH-77':
            raise ActionError('request_not_permitted')

    def stage(self, case_id, snapshot, scope, actor):
        with self.lock:
            case = self.case(case_id, actor)
            if type(snapshot) is not int or snapshot != case['version']:
                raise ActionError('stale_snapshot')
            if scope != 'authentication_transaction_association':
                raise ActionError('scope_denied', 403)
            if case['status'] != 'IN_REVIEW' or case.get('request'):
                raise ActionError('request_not_permitted')
            self.require_context(case)
            payload = self.payload()
            existing = case.get('draft')
            if existing:
                if existing.get('contract') != 'mcp_request_v1' or existing['payload'] != payload:
                    raise ActionError('draft_conflict')
                if existing['version'] == snapshot and existing['expires_at'] > time.time():
                    return self.stage_view(existing)
            draft = {'id': secrets.token_hex(12), 'kind': 'REQUEST_EVIDENCE', 'contract': 'mcp_request_v1',
                     'case_id': case_id, 'version': snapshot, 'payload': payload, 'payload_hash': payload_hash(payload),
                     'staged_by': actor, 'expires_at': int(time.time()) + 300}
            case['draft'] = draft
            case.setdefault('staged_actions', {})[draft['id']] = json.loads(json.dumps(draft))
            self.store.event(case, 'Synthetic request staged; separate Barbara approval required. No request executed.')
            self.store.save(case)
            return self.stage_view(draft)

    def stage_view(self, draft):
        return {'case_id': draft['case_id'], 'action_id': draft['id'], 'evidence_version': draft['version'],
                'status': 'AWAITING_HUMAN_APPROVAL', 'payload': draft['payload'], 'payload_hash': draft['payload_hash'],
                'expires_at': draft['expires_at'], 'review_url': 'http://localhost:8080/ops?case_id=' + draft['case_id'],
                'identity_verification': 'simulated_not_oauth'}

    def approve(self, data, actor):
        with self.lock:
            case = self.case(data.get('case_id'), actor)
            action_id = data.get('draft_id')
            if not isinstance(action_id, str): raise ActionError('invalid_action', 400)
            archived = case.get('staged_actions', {}).get(action_id)
            if not archived: raise ActionError('action_unavailable', 404)
            if (type(data.get('version')) is not int or data['version'] != archived['version']
                    or not isinstance(data.get('payload_hash'), str)
                    or not hmac.compare_digest(data['payload_hash'], archived['payload_hash'])):
                raise ActionError('approval_payload_changed')
            if action_id in case['receipts']:
                if self.result(case['id'], action_id, actor)['status'] != 'VERIFIED_SAVED_REQUEST':
                    raise ActionError('reconciliation_required')
                return {'accepted': True, 'duplicate': True, 'case_id': case['id'], 'action_id': action_id}
            if (case.get('draft') != archived or case['version'] != archived['version']
                    or archived['expires_at'] <= time.time()):
                raise ActionError('approval_expired_or_stale')
            if (case['status'] != 'IN_REVIEW' or case.get('request') or archived['staged_by'] != actor
                    or archived['payload'] != self.payload() or payload_hash(archived['payload']) != archived['payload_hash']):
                raise ActionError('request_not_permitted')
            self.require_context(case)
            case['request'] = {'id': 'REQ-' + action_id[:8], 'draft_id': action_id, 'case_id': case['id'],
                               'status': 'OPEN', **archived['payload'], 'evidence_version': archived['version'],
                               'approved_by': actor, 'approval_identity': 'simulated_not_oauth', 'payload_hash': archived['payload_hash']}
            case['receipts'][action_id] = {'id': action_id, 'action': 'REQUEST_EVIDENCE', 'case_id': case['id'],
                                         'evidence_version': archived['version'], 'actor': actor}
            case['draft'] = None
            case['status'] = 'PENDING_EVIDENCE'
            self.store.event(case, 'Barbara (simulated identity) approved the exact scoped request; saved request awaits separate verification.')
            self.store.save(case)
            return {'accepted': True, 'duplicate': False, 'case_id': case['id'], 'action_id': action_id}

    def result(self, case_id, action_id, actor):
        with self.lock:
            case = self.case(case_id, actor)
            if not isinstance(action_id, str): raise ActionError('invalid_action', 400)
            draft = case.get('staged_actions', {}).get(action_id)
            if not draft: raise ActionError('action_unavailable', 404)
            request = case.get('request')
            expected = {'draft_id': action_id, 'case_id': case_id, **draft['payload'],
                        'evidence_version': draft['version'], 'approved_by': 'demo:barbara', 'approval_identity': 'simulated_not_oauth',
                        'payload_hash': draft['payload_hash']}
            verified = (bool(request) and isinstance(request.get('id'), str) and bool(request['id'].strip())
                        and draft['payload'] == self.payload() and payload_hash(draft['payload']) == draft['payload_hash']
                        and request.get('status') in ('OPEN', 'RESPONDED')
                        and all(request.get(k) == v for k, v in expected.items()))
            result = {'case_id': case_id, 'action_id': action_id, 'approved_snapshot': draft['version'],
                      'observed_snapshot': case['version'], 'identity_verification': 'simulated_not_oauth'}
            if verified:
                return {**result, 'status': 'VERIFIED_SAVED_REQUEST', 'request': {**expected, 'id': request['id'], 'status': request['status']}}
            if action_id in case['receipts']:
                return {**result, 'status': 'NOT_VERIFIED', 'instruction': 'Reconcile saved request facts before retrying; a receipt alone is not proof.'}
            if (case.get('draft') or {}).get('id') == action_id:
                return {**result, 'status': 'EXPIRED' if draft['expires_at'] <= time.time() else 'AWAITING_HUMAN_APPROVAL'}
            return {**result, 'status': 'SUPERSEDED'}
