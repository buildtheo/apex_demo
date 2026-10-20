import {createRemoteJWKSet, jwtVerify} from 'jose';

export class AccessError extends Error {
  constructor(code) { super(code); this.code = code; }
}

export function tokenVerifier({issuer, audience, jwksUrl}, keyResolver) {
  const keys = keyResolver || createRemoteJWKSet(new URL(jwksUrl));
  return async token => {
    try {
      const {payload} = await jwtVerify(token, keys, {
        issuer, audience, algorithms: ['RS256', 'ES256'], requiredClaims: ['sub', 'exp', 'iat'],
      });
      if (typeof payload.sub !== 'string' || !payload.sub.trim() || typeof payload.scope !== 'string') throw Error();
      if (!payload.scope.split(' ').includes('apex:read')) throw Error();
      return {subject: payload.sub, expiresAt: payload.exp};
    } catch { throw new AccessError('invalid_token'); }
  };
}

export function authorize(principal, caseId, assignments, now = Date.now()) {
  if (!principal || typeof principal.subject !== 'string' || !Number.isFinite(principal.expiresAt) || principal.expiresAt * 1000 <= now) throw new AccessError('invalid_token');
  const rule = Object.hasOwn(assignments, principal.subject) ? assignments[principal.subject] : null;
  if (!rule || !['analyst', 'reviewer', 'specialist'].includes(rule.role) || !Array.isArray(rule.cases) || !rule.cases.includes(caseId)) {
    throw new AccessError('access_denied');
  }
}

// Conservative text screening for this synthetic adapter, not complete DLP.
export function screen(value) {
  if (typeof value !== 'string' || value.length > 12000 ||
      /(?:\d[ -]?){13,19}/.test(value) ||
      /\b(?:cvv|cvc|security code|pin|password)\s*[:=]\s*\S+/i.test(value)) {
    throw new AccessError('content_blocked');
  }
  return value;
}

export function caseView(state) {
  if (!Number.isSafeInteger(state.version) || state.version < 1 || !Number.isFinite(state.amount) || state.amount < 0) throw new AccessError('content_blocked');
  const result = {
    case_id: screen(state.id), evidence_version: state.version, status: screen(state.status),
    transaction: {merchant: screen(state.merchant), amount: state.amount, currency: 'USD'},
    sources: state.evidence.map(e => e.available === true
      ? {source_id: screen(e.id), title: screen(e.title), source: screen(e.source), available: true}
      : {source_id: screen(e.id), available: false}),
    synthetic: true,
  };
  const check = state.association_check;
  if (state.evidence.some(e => e.id === 'E-004' && e.available === true) && check && Number.isSafeInteger(check.evidence_version)
      && check.evidence_version >= 1 && check.evidence_version <= state.version && typeof check.matches_disputed_transaction === 'boolean') {
    result.association_check = {source_id: screen(check.source_id), auth_record_id: screen(check.auth_record_id),
      disputed_transaction_id: screen(check.disputed_transaction_id), returned_transaction_id: screen(check.returned_transaction_id),
      matches_disputed_transaction: check.matches_disputed_transaction, evidence_version: check.evidence_version};
  }
  return result;
}

export function requestPayloadView(payload) {
  return {queue: screen(payload.queue), question: screen(payload.question), source_ids: payload.source_ids.map(screen),
    auth_record_id: screen(payload.auth_record_id), disputed_transaction_id: screen(payload.disputed_transaction_id)};
}

function hexId(value, length) {
  if (typeof value !== 'string' || value.length !== length || !/^[a-f0-9]+$/.test(value)) throw new AccessError('invalid_action_result');
  return value;
}

export function stagedActionView(data, caseId) {
  if (data.case_id !== caseId || data.status !== 'AWAITING_HUMAN_APPROVAL' || !Number.isSafeInteger(data.evidence_version) || data.evidence_version < 1
      || !Number.isSafeInteger(data.expires_at)) throw new AccessError('invalid_action_result');
  return {case_id: screen(data.case_id), action_id: hexId(data.action_id, 24), evidence_version: data.evidence_version,
    status: data.status, payload: requestPayloadView(data.payload), payload_hash: hexId(data.payload_hash, 64), expires_at: data.expires_at,
    review_url: `http://localhost:8080/ops?case_id=${encodeURIComponent(caseId)}`};
}

export function actionResultView(data, caseId, actionId) {
  if (data.case_id !== caseId || data.action_id !== actionId || !['VERIFIED_SAVED_REQUEST', 'NOT_VERIFIED', 'AWAITING_HUMAN_APPROVAL', 'EXPIRED', 'SUPERSEDED'].includes(data.status)) {
    throw new AccessError('invalid_action_result');
  }
  if (![data.approved_snapshot, data.observed_snapshot].every(n => Number.isSafeInteger(n) && n > 0)) throw new AccessError('invalid_action_result');
  const result = {case_id: screen(caseId), action_id: hexId(actionId, 24), status: data.status,
    approved_snapshot: data.approved_snapshot, observed_snapshot: data.observed_snapshot};
  if (data.status === 'VERIFIED_SAVED_REQUEST') {
    const r = data.request;
    if (r.case_id !== caseId || r.draft_id !== actionId || !['OPEN', 'RESPONDED'].includes(r.status)) throw new AccessError('invalid_action_result');
    result.request = {...requestPayloadView(r), id: screen(r.id), case_id: screen(r.case_id), draft_id: hexId(r.draft_id, 24),
      status: r.status, evidence_version: r.evidence_version, approved_by: screen(r.approved_by),
      approval_identity: screen(r.approval_identity), payload_hash: hexId(r.payload_hash, 64)};
  }
  return result;
}

export function evidenceView(state, sourceId, snapshot) {
  if (state.version !== snapshot) throw new AccessError('stale_snapshot');
  const source = state.evidence.find(e => e.id === sourceId);
  if (!source || source.available !== true) throw new AccessError('source_unavailable');
  return {
    case_id: screen(state.id), evidence_version: state.version,
    source_id: screen(source.id), title: screen(source.title), source: screen(source.source),
    kind: screen(source.kind), text: screen(source.text), synthetic: true,
  };
}
