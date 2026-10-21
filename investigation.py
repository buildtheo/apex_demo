"""Synthetic request staging and separate local human approval. No financial action."""
import hashlib
import hmac
import json
import secrets
import time
from datetime import datetime, timezone


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
        if case.get('demo_run') and case['demo_run'] != self.store.intake.current_run():
            raise ActionError('practice_run_archived', 409)
        return case

    def payload(self, kind='REQUEST_EVIDENCE'):
        if kind == 'REQUEST_PROCESSOR_EVIDENCE':
            return {'queue': 'Fictional processor evidence team',
                    'question': 'Please provide authentication, authorization, timestamps, device-verification and any available 3-D Secure records for the disputed $648.50 JCPenney purchase (T-204). Explain why AUTH-77, which the lookup associates with T-198, appeared in the original export. Provide a separately versioned corrected response with a correction timestamp and linkage to E-003. Identify unavailable evidence explicitly; do not infer authorization.',
                    'source_ids': ['E-002', 'E-003', 'E-004'], 'auth_record_id': 'AUTH-77',
                    'disputed_transaction_id': 'T-204', 'preserve_original': True, 'correction_of': 'E-003'}
        return {'queue': 'Apex evidence operations', 'question': 'Which transaction is AUTH-77 associated with?',
                'source_ids': ['E-002', 'E-003'], 'auth_record_id': 'AUTH-77', 'disputed_transaction_id': 'T-204'}

    def request_slot(self, kind):
        if kind == 'REQUEST_EVIDENCE': return 'request'
        if kind == 'REQUEST_PROCESSOR_EVIDENCE': return 'processor_request'
        raise ActionError('scope_denied', 403)

    def require_context(self, case, kind='REQUEST_EVIDENCE'):
        if not all(any(e['id'] == source and e['available'] for e in case['evidence']) for source in ('E-002', 'E-003')):
            raise ActionError('source_unavailable')
        packet = next(e for e in case['evidence'] if e['id'] == 'E-003')
        if case.get('transaction_id') != 'T-204' or packet.get('record', {}).get('auth_record_id') != 'AUTH-77':
            raise ActionError('request_not_permitted')
        if kind == 'REQUEST_PROCESSOR_EVIDENCE':
            lookup = next((e for e in case['evidence'] if e['id'] == 'E-004' and e['available']), None)
            prior = case.get('request') or {}
            if (not lookup or lookup.get('record') != {'auth_record_id': 'AUTH-77', 'transaction_id': 'T-198'}
                    or prior.get('status') != 'RESPONDED'
                    or self.result(case['id'], prior.get('draft_id'), 'demo:barbara')['status'] != 'VERIFIED_SAVED_REQUEST'):
                raise ActionError('request_not_permitted')

    def stage(self, case_id, snapshot, scope, actor):
        with self.lock:
            case = self.case(case_id, actor)
            if type(snapshot) is not int or snapshot != case['version']:
                raise ActionError('stale_snapshot')
            kinds = {'authentication_transaction_association': 'REQUEST_EVIDENCE',
                     'processor_transaction_evidence': 'REQUEST_PROCESSOR_EVIDENCE'}
            if scope not in kinds:
                raise ActionError('scope_denied', 403)
            kind = kinds[scope]
            required_status = 'IN_REVIEW' if kind == 'REQUEST_EVIDENCE' else 'EVIDENCE_RECEIVED'
            if case['status'] != required_status or case.get(self.request_slot(kind)):
                raise ActionError('request_not_permitted')
            self.require_context(case, kind)
            payload = self.payload(kind)
            existing = case.get('draft')
            if existing:
                if existing.get('contract') != 'mcp_request_v1' or existing.get('kind') != kind or existing['payload'] != payload:
                    raise ActionError('draft_conflict')
                if existing['version'] == snapshot and existing['expires_at'] > time.time():
                    return self.stage_view(existing)
            draft = {'id': secrets.token_hex(12), 'kind': kind, 'contract': 'mcp_request_v1',
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
            kind = archived['kind']
            slot = self.request_slot(kind)
            required_status = 'IN_REVIEW' if kind == 'REQUEST_EVIDENCE' else 'EVIDENCE_RECEIVED'
            if (case['status'] != required_status or case.get(slot) or archived['staged_by'] != actor
                    or archived['payload'] != self.payload(kind) or payload_hash(archived['payload']) != archived['payload_hash']):
                raise ActionError('request_not_permitted')
            self.require_context(case, kind)
            case[slot] = {'id': 'REQ-' + action_id[:8], 'draft_id': action_id, 'case_id': case['id'],
                               'status': 'OPEN', **archived['payload'], 'evidence_version': archived['version'],
                               'approved_by': actor, 'approval_identity': 'simulated_not_oauth', 'payload_hash': archived['payload_hash']}
            case['receipts'][action_id] = {'id': action_id, 'action': kind, 'case_id': case['id'],
                                         'evidence_version': archived['version'], 'actor': actor}
            case['draft'] = None
            case['status'] = 'PENDING_EVIDENCE' if kind == 'REQUEST_EVIDENCE' else 'PROCESSOR_PENDING'
            self.store.event(case, 'Barbara (simulated identity) approved the exact scoped request; saved request awaits separate verification.')
            self.store.save(case)
            return {'accepted': True, 'duplicate': False, 'case_id': case['id'], 'action_id': action_id}

    def result(self, case_id, action_id, actor):
        with self.lock:
            case = self.case(case_id, actor)
            if not isinstance(action_id, str): raise ActionError('invalid_action', 400)
            draft = case.get('staged_actions', {}).get(action_id)
            if not draft: raise ActionError('action_unavailable', 404)
            kind = draft['kind']
            request = case.get(self.request_slot(kind))
            expected = {'draft_id': action_id, 'case_id': case_id, **draft['payload'],
                        'evidence_version': draft['version'], 'approved_by': 'demo:barbara', 'approval_identity': 'simulated_not_oauth',
                        'payload_hash': draft['payload_hash']}
            verified = (bool(request) and isinstance(request.get('id'), str) and bool(request['id'].strip())
                        and draft['payload'] == self.payload(kind) and payload_hash(draft['payload']) == draft['payload_hash']
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

    def attach_processor_response(self, case_id, actor):
        with self.lock:
            case = self.case(case_id, actor)
            request = case.get('processor_request') or {}
            if case['status'] != 'PROCESSOR_PENDING' or request.get('status') != 'OPEN':
                raise ActionError('request_not_permitted')
            if self.result(case_id, request.get('draft_id'), actor)['status'] != 'VERIFIED_SAVED_REQUEST':
                raise ActionError('reconciliation_required')
            self.require_context(case, 'REQUEST_PROCESSOR_EVIDENCE')
            if any(e['id'] == 'E-005' for e in case['evidence']):
                raise ActionError('response_already_received')
            timestamp = datetime.now(timezone.utc).isoformat()
            case['version'] += 1
            case['evidence'].append({'id': 'E-005', 'title': 'Corrected processor response',
                'source': 'Synthetic response from a fictional merchant processor', 'kind': 'Response', 'available': True,
                'received_at': timestamp, 'corrected_at': timestamp, 'document_version': 2, 'correction_of': 'E-003', 'request_id': request['id'],
                'text': 'SIMULATED LATER PROCESSOR RESPONSE. Correction to E-003: the export associated AUTH-77 with T-204 in error during record mapping. AUTH-77 belongs to T-198. For the disputed $648.50 JCPenney purchase T-204, we cannot supply a transaction-specific authentication reference, authentication timestamps, device-verification record or 3-D Secure result. The transaction record confirms the recorded purchase, but we have no additional authorization evidence to provide. E-003 is retained unchanged; this separately versioned response corrects its reference. No determination of fraud or customer liability is made.',
                'record': {'transaction_id': 'T-204', 'auth_record_id': None, 'corrected_auth_record_id': 'AUTH-77',
                           'corrected_transaction_id': 'T-198', 'authentication_evidence_available': False}})
            request['status'] = 'RESPONDED'
            case['draft'] = None
            case['status'] = 'PROCESSOR_EVIDENCE_RECEIVED'
            self.store.event(case, 'SIMULATION - later: corrected processor response received. Original export retained unchanged. No dispute decision or credit issued.')
            self.store.save(case)
            return case
