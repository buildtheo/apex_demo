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
  return {
    case_id: screen(state.id), evidence_version: state.version, status: screen(state.status),
    transaction: {merchant: screen(state.merchant), amount: state.amount, currency: 'USD'},
    sources: state.evidence.map(e => e.available === true
      ? {source_id: screen(e.id), title: screen(e.title), source: screen(e.source), available: true}
      : {source_id: screen(e.id), available: false}),
    synthetic: true,
  };
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
