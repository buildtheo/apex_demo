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
  if (state.intake_id && state.evidence.some(e => e.id === 'E-005' && e.available === true)) {
    result.credit_policy = {policy_id: 'DEMO-CREDIT-01', fictional: true, authority_limit_cents_exclusive: 100000,
      currency: 'USD', instruction: 'The amount is authority, not eligibility. Review the complete record, draft a cited rationale and customer explanation, and obtain separate human approval. Missing evidence alone is not proof of fraud or automatic credit eligibility.'};
  }
  if (state.evidence.some(e => e.id === 'E-004' && e.available === true) && check && Number.isSafeInteger(check.evidence_version)
      && check.evidence_version >= 1 && check.evidence_version <= state.version && typeof check.matches_disputed_transaction === 'boolean') {
    result.association_check = {source_id: screen(check.source_id), auth_record_id: screen(check.auth_record_id),
      disputed_transaction_id: screen(check.disputed_transaction_id), returned_transaction_id: screen(check.returned_transaction_id),
      matches_disputed_transaction: check.matches_disputed_transaction, evidence_version: check.evidence_version};
  }
  return result;
}

export function requestPayloadView(payload) {
  const view = {queue: screen(payload.queue), question: screen(payload.question), source_ids: payload.source_ids.map(screen),
    auth_record_id: screen(payload.auth_record_id), disputed_transaction_id: screen(payload.disputed_transaction_id)};
  if (Object.hasOwn(payload, 'preserve_original') || Object.hasOwn(payload, 'correction_of')) {
    if (payload.preserve_original !== true || payload.correction_of !== 'E-003') throw new AccessError('invalid_action_result');
    view.preserve_original = true;
    view.correction_of = 'E-003';
  }
  return view;
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
  if (data.case_id !== caseId || data.action_id !== actionId || !['VERIFIED_SAVED_REQUEST', 'VERIFIED_POSTED_CREDIT', 'NOT_VERIFIED', 'AWAITING_HUMAN_APPROVAL', 'EXPIRED', 'SUPERSEDED'].includes(data.status)) {
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
  if (data.status === 'VERIFIED_POSTED_CREDIT') {
    const c = data.credit, d = data.decision;
    const payload = creditPayloadView(c);
    if (c.case_id !== caseId || c.draft_id !== actionId || c.id !== 'CR-' + actionId || c.status !== 'POSTED'
        || c.approved_by !== 'demo:barbara' || c.approval_identity !== 'simulated_not_oauth'
        || !Number.isSafeInteger(c.evidence_version) || c.evidence_version !== data.approved_snapshot
        || d.credit_id !== c.id || d.case_id !== caseId || d.draft_id !== actionId || d.reviewed_support !== true || d.brief_version !== 1
        || d.payload_hash !== c.payload_hash || d.evidence_version !== c.evidence_version
        || d.approved_by !== c.approved_by || d.approval_identity !== c.approval_identity
        || Object.keys(payload).some(key => JSON.stringify(d[key]) !== JSON.stringify(payload[key]))) throw new AccessError('invalid_action_result');
    result.credit = {...payload, id: c.id, case_id: screen(c.case_id), draft_id: hexId(c.draft_id, 24),
      status: 'POSTED', posted_at: screen(c.posted_at), evidence_version: c.evidence_version, payload_hash: hexId(c.payload_hash, 64),
      approved_by: c.approved_by, approval_identity: c.approval_identity};
    result.decision = {brief_version: 1, reviewed_support: true, disposition: payload.disposition};
  }
  return result;
}

export function creditPayloadView(p) {
  if (p.amount_cents !== 64850 || p.currency !== 'USD' || p.account_ref !== 'demo:martha:card-8821'
      || p.transaction_id !== 'T-204' || p.policy_id !== 'DEMO-CREDIT-01' || p.disposition !== 'CUSTOMER_FAVORABLE'
      || JSON.stringify(p.source_ids) !== JSON.stringify(['E-001', 'E-002', 'E-003', 'E-004', 'E-005'])) throw new AccessError('invalid_action_result');
  return {amount_cents: p.amount_cents, currency: p.currency, account_ref: p.account_ref, transaction_id: p.transaction_id,
    policy_id: p.policy_id, disposition: p.disposition, source_ids: p.source_ids, rationale: screen(p.rationale), customer_explanation: screen(p.customer_explanation)};
}

export function stagedCreditView(data, caseId) {
  if (data.case_id !== caseId || data.action_kind !== 'POST_CREDIT' || data.status !== 'AWAITING_HUMAN_APPROVAL'
      || !Number.isSafeInteger(data.evidence_version) || data.evidence_version < 1 || !Number.isSafeInteger(data.expires_at)) throw new AccessError('invalid_action_result');
  return {case_id: screen(caseId), action_kind: 'POST_CREDIT', action_id: hexId(data.action_id, 24),
    evidence_version: data.evidence_version, payload: creditPayloadView(data.payload), payload_hash: hexId(data.payload_hash, 64),
    expires_at: data.expires_at, status: data.status, review_url: `http://localhost:8080/ops?case_id=${encodeURIComponent(caseId)}`};
}

export function evidenceView(state, sourceId, snapshot) {
  if (state.version !== snapshot) throw new AccessError('stale_snapshot');
  const source = state.evidence.find(e => e.id === sourceId);
  if (!source || source.available !== true) throw new AccessError('source_unavailable');
  const result = {
    case_id: screen(state.id), evidence_version: state.version,
    source_id: screen(source.id), title: screen(source.title), source: screen(source.source),
    kind: screen(source.kind), text: screen(source.text), synthetic: true,
  };
  if (source.id === 'E-005') {
    if (source.document_version !== 2 || source.correction_of !== 'E-003') throw new AccessError('content_blocked');
    result.provenance = {received_at: screen(source.received_at), corrected_at: screen(source.corrected_at), document_version: 2,
      correction_of: 'E-003', request_id: screen(source.request_id), simulated_arrival: true};
  }
  return result;
}
