"""Human-reviewed synthetic credit. No external bank or payment integration."""
import hmac
import json
import secrets
import sqlite3
import time
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation

from intake import screened
from investigation import ActionError, payload_hash

SOURCES = ['E-001', 'E-002', 'E-003', 'E-004', 'E-005']
POLICY = 'DEMO-CREDIT-01'
ACCOUNT = 'demo:martha:card-8821'


class Credit:
    def __init__(self, store, lock):
        self.store, self.lock = store, lock
        store.db.execute('''CREATE TABLE IF NOT EXISTS synthetic_credits (
            id TEXT PRIMARY KEY, case_id TEXT UNIQUE NOT NULL, account_ref TEXT NOT NULL,
            transaction_id TEXT NOT NULL, body TEXT NOT NULL, UNIQUE(account_ref, transaction_id))''')
        store.db.commit()

    def amount(self, case):
        try:
            amount = Decimal(str(case['amount'])) * 100
            if not amount.is_finite() or amount != amount.to_integral_value() or amount <= 0:
                raise ValueError()
            if amount >= 100000: raise ActionError('outside_credit_authority', 403)
            if amount != 64850: raise ActionError('credit_context_changed')
            return int(amount)
        except (InvalidOperation, ValueError): raise ActionError('credit_context_changed')

    def context(self, case):
        amount = self.amount(case)
        intake = case.get('customer_confirmed_intake') or {}
        if (case.get('customer_ref') != 'demo:martha' or case.get('transaction_id') != 'T-204'
                or case.get('merchant') != 'JCPenney' or intake.get('reason') != 'unauthorized'
                or intake.get('amount') != 648.5 or intake.get('transaction_id') != 'T-204'):
            raise ActionError('credit_context_changed')
        if not all(any(e['id'] == source and e['available'] for e in case['evidence']) for source in SOURCES):
            raise ActionError('source_unavailable')
        correction = next(e for e in case['evidence'] if e['id'] == 'E-005')
        if (correction.get('correction_of') != 'E-003' or correction.get('document_version') != 2
                or correction.get('record', {}).get('transaction_id') != 'T-204'):
            raise ActionError('credit_context_changed')
        for slot in ('request', 'processor_request'):
            request = case.get(slot) or {}
            if (request.get('status') != 'RESPONDED'
                    or self.store.investigation.result(case['id'], request.get('draft_id'), 'demo:barbara')['status'] != 'VERIFIED_SAVED_REQUEST'):
                raise ActionError('credit_not_permitted')
        return amount

    def payload(self, case, rationale, explanation, sources):
        amount = self.context(case)
        if not isinstance(sources, list) or sorted(sources) != SOURCES: raise ActionError('source_scope_changed')
        rationale, explanation = screened(rationale, 2400), screened(explanation, 1200)
        if not all(source in rationale for source in SOURCES):
            raise ActionError('rationale_requires_citations', 400)
        return {'amount_cents': amount, 'currency': 'USD', 'account_ref': ACCOUNT, 'transaction_id': 'T-204',
                'policy_id': POLICY, 'source_ids': SOURCES.copy(), 'rationale': rationale,
                'customer_explanation': explanation, 'disposition': 'CUSTOMER_FAVORABLE'}

    def ledger(self, case_id):
        row = self.store.db.execute('SELECT id,case_id,account_ref,transaction_id,body FROM synthetic_credits WHERE case_id=?', (case_id,)).fetchone()
        if not row: return None
        try: record = json.loads(row[4])
        except (ValueError, TypeError): raise ActionError('reconciliation_required')
        if not isinstance(record, dict): raise ActionError('reconciliation_required')
        if (record.get('id'), record.get('case_id'), record.get('account_ref'), record.get('transaction_id')) != tuple(row[:4]):
            raise ActionError('reconciliation_required')
        return record

    def stage(self, data, actor):
        with self.lock:
            case = self.store.investigation.case(data.get('case_id'), actor)
            if type(data.get('snapshot')) is not int or data['snapshot'] != case['version']:
                raise ActionError('stale_snapshot')
            if case['status'] != 'PROCESSOR_EVIDENCE_RECEIVED' or case.get('decision') or self.ledger(case['id']):
                raise ActionError('credit_not_permitted')
            payload = self.payload(case, data.get('rationale'), data.get('customer_explanation'), data.get('source_ids'))
            existing = case.get('draft')
            if existing:
                if existing.get('kind') != 'POST_CREDIT': raise ActionError('draft_conflict')
                if existing['payload'] == payload and existing['version'] == case['version'] and existing['expires_at'] > time.time():
                    return self.stage_view(existing)
            draft = {'id': secrets.token_hex(12), 'kind': 'POST_CREDIT', 'contract': 'mcp_credit_v1',
                     'case_id': case['id'], 'version': case['version'], 'payload': payload, 'payload_hash': payload_hash(payload),
                     'staged_by': actor, 'expires_at': int(time.time()) + 300}
            case['draft'] = draft
            case.setdefault('staged_actions', {})[draft['id']] = json.loads(json.dumps(draft))
            self.store.event(case, 'Credit recommendation prepared for Barbara to review. No decision or credit posted.')
            self.store.save(case)
            return self.stage_view(draft)

    def stage_view(self, draft):
        return {**self.store.investigation.stage_view(draft), 'action_kind': 'POST_CREDIT'}

    def approve(self, data, actor):
        with self.lock:
            case = self.store.investigation.case(data.get('case_id'), actor)
            action = data.get('draft_id')
            archived = case.get('staged_actions', {}).get(action) if isinstance(action, str) else None
            if not archived or archived.get('contract') != 'mcp_credit_v1': raise ActionError('action_unavailable', 404)
            if (type(data.get('version')) is not int or data['version'] != archived['version']
                    or not isinstance(data.get('payload_hash'), str)
                    or not hmac.compare_digest(data['payload_hash'], archived['payload_hash'])):
                raise ActionError('approval_payload_changed')
            if data.get('supports_dispute') is not True: raise ActionError('human_evidence_review_required', 400)
            if self.ledger(case['id']) or case.get('decision') or action in case['receipts']:
                if self.result(case['id'], action, actor)['status'] != 'VERIFIED_POSTED_CREDIT':
                    raise ActionError('reconciliation_required')
                return {'accepted': True, 'duplicate': True, 'case_id': case['id'], 'action_id': action}
            if (case.get('draft') != archived or case['version'] != archived['version'] or archived['expires_at'] <= time.time()):
                raise ActionError('approval_expired_or_stale')
            p = archived['payload']
            if (case['status'] != 'PROCESSOR_EVIDENCE_RECEIVED' or archived['staged_by'] != actor
                    or p != self.payload(case, p.get('rationale'), p.get('customer_explanation'), p.get('source_ids'))
                    or archived['payload_hash'] != payload_hash(p)):
                raise ActionError('credit_not_permitted')
            record = {**p, 'id': 'CR-' + action, 'case_id': case['id'], 'draft_id': action, 'status': 'POSTED',
                      'evidence_version': archived['version'], 'payload_hash': archived['payload_hash'],
                      'approved_by': actor, 'approval_identity': 'simulated_not_oauth',
                      'posted_at': datetime.now(timezone.utc).isoformat()}
            case['decision'] = {**p, 'credit_id': record['id'], 'draft_id': action, 'case_id': case['id'],
                                'evidence_version': archived['version'], 'brief_version': 1, 'payload_hash': archived['payload_hash'],
                                'approved_by': actor, 'approval_identity': 'simulated_not_oauth', 'reviewed_support': True}
            case['receipts'][action] = {'id': action, 'action': 'POST_CREDIT', 'case_id': case['id']}
            case['draft'] = None
            case['status'] = 'CREDIT_POSTED'
            self.store.event(case, 'Barbara approved the reviewed customer-favorable decision. Synthetic credit posted; verify ledger and case before showing completion.')
            # One SQLite transaction covers the ledger insert and saved decision. No nested Store.save commit.
            try:
                with self.store.db:
                    self.store.db.execute('INSERT INTO synthetic_credits VALUES (?,?,?,?,?)',
                        (record['id'], case['id'], ACCOUNT, 'T-204', json.dumps(record)))
                    changed = self.store.db.execute('UPDATE submitted_cases SET body=? WHERE id=?', (json.dumps(case), case['id']))
                    if changed.rowcount != 1: raise ActionError('reconciliation_required')
            except sqlite3.IntegrityError: raise ActionError('reconciliation_required')
            return {'accepted': True, 'duplicate': False, 'case_id': case['id'], 'action_id': action}

    def result(self, case_id, action, actor):
        with self.lock:
            case = self.store.investigation.case(case_id, actor)
            draft = case.get('staged_actions', {}).get(action) if isinstance(action, str) else None
            if not draft or draft.get('contract') != 'mcp_credit_v1': raise ActionError('action_unavailable', 404)
            base = {'case_id': case_id, 'action_id': action, 'approved_snapshot': draft['version'],
                    'observed_snapshot': case['version'], 'identity_verification': 'simulated_not_oauth'}
            p = draft['payload']
            try: record = self.ledger(case_id)
            except ActionError: return {**base, 'status': 'NOT_VERIFIED'}
            decision = case.get('decision') or {}
            common = {**p, 'draft_id': action, 'case_id': case_id, 'evidence_version': draft['version'],
                      'payload_hash': draft['payload_hash'], 'approved_by': 'demo:barbara', 'approval_identity': 'simulated_not_oauth'}
            valid_payload = (p.get('amount_cents') == 64850 and p.get('currency') == 'USD' and p.get('account_ref') == ACCOUNT
                and p.get('transaction_id') == 'T-204' and p.get('policy_id') == POLICY and p.get('source_ids') == SOURCES
                and p.get('disposition') == 'CUSTOMER_FAVORABLE' and payload_hash(p) == draft['payload_hash'])
            if (record and valid_payload and case['status'] == 'CREDIT_POSTED' and case['amount'] == 648.5
                    and case.get('customer_ref') == 'demo:martha' and case.get('transaction_id') == 'T-204'
                    and record.get('id') == 'CR-' + action and record.get('status') == 'POSTED' and record.get('posted_at')
                    and all(record.get(k) == v and decision.get(k) == v for k, v in common.items())
                    and decision.get('credit_id') == record['id'] and decision.get('brief_version') == 1 and decision.get('reviewed_support') is True):
                return {**base, 'status': 'VERIFIED_POSTED_CREDIT', 'credit': record, 'decision': decision}
            if record or decision or action in case['receipts']: return {**base, 'status': 'NOT_VERIFIED'}
            if (case.get('draft') or {}).get('id') == action and case['version'] == draft['version']:
                return {**base, 'status': 'EXPIRED' if draft['expires_at'] <= time.time() else 'AWAITING_HUMAN_APPROVAL'}
            return {**base, 'status': 'SUPERSEDED'}

    def customer_resolution(self, case):
        with self.lock:
            if case['status'] != 'CREDIT_POSTED': return None
            result = self.result(case['id'], (case.get('decision') or {}).get('draft_id'), 'demo:barbara')
            if result['status'] != 'VERIFIED_POSTED_CREDIT': raise ActionError('credit_verification_pending', 409)
            credit = result['credit']
            return {**{key: credit[key] for key in ('id', 'amount_cents', 'currency', 'posted_at', 'customer_explanation')},
                    'card_balance_cents': 218472 - credit['amount_cents']}
