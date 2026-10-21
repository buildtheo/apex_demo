// Checks that persisted case facts match the exact action the analyst approved.
// It reads operational records (request, handoff, assignment), never the receipt written alongside them,
// and ignores later case progression: a request stays verified after the case moves on.
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every(k => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
}
function verifyEffect(state, approved) {
  const fail = reason => ({ok: false, reason});
  if (!state || !approved || !approved.payload) return fail('the approved action or case record is missing');
  if (typeof approved.id !== 'string' || !approved.id.trim() ||
      typeof approved.case_id !== 'string' || !approved.case_id.trim()) return fail('the approval identity is missing');
  if (state.id !== approved.case_id) return fail('the read-back returned a different case');
  const p = approved.payload;
  if (['REQUEST_EVIDENCE', 'REQUEST_PROCESSOR_EVIDENCE'].includes(approved.kind)) {
    const r = approved.kind === 'REQUEST_PROCESSOR_EVIDENCE' ? state.processor_request : state.request;
    if (!r) return fail('no evidence request is saved');
    if (typeof r.id !== 'string' || !r.id.trim()) return fail('the saved request has no valid identifier');
    if (!['OPEN', 'RESPONDED'].includes(r.status)) return fail('the saved request has no recognized operational state');
    if (r.draft_id !== approved.id) return fail('the saved request belongs to a different approval');
    if (r.case_id !== approved.case_id) return fail('the saved request is attached to a different case');
    if (r.queue !== p.queue) return fail('the saved request has a different destination');
    if (r.question !== p.question) return fail('the saved request asks a different question');
    if (!deepEqual(r.source_ids, p.source_ids)) return fail('the saved request cites different sources');
    if (approved.contract === 'mcp_request_v1') {
      if (!Object.keys(p).every(key => deepEqual(r[key], p[key]))) return fail('the saved request scope differs from the approved payload');
      if (r.payload_hash !== approved.payload_hash || r.evidence_version !== approved.version) return fail('the saved request has a different reviewed payload or version');
      if (r.approved_by !== 'demo:barbara' || r.approval_identity !== 'simulated_not_oauth') return fail('the saved request has a different approval identity');
    }
    return {ok: true, summary: 'request ' + r.id + ' to ' + r.queue + ' is saved with the approved question and sources'};
  }
  if (approved.kind === 'ESCALATE_REVIEW') {
    const h = state.handoff;
    if (!h) return fail('no specialist handoff is saved');
    if (h.draft_id !== approved.id) return fail('the saved handoff belongs to a different approval');
    if (h.case_id !== approved.case_id) return fail('the saved handoff is attached to a different case');
    if (state.assigned_to !== p.queue) return fail('the case is assigned to a different queue');
    if (!deepEqual(h.payload, p)) return fail('the saved brief differs from the approved brief');
    return {ok: true, summary: 'case is assigned to ' + p.queue + ' with the approved brief saved'};
  }
  return fail('unknown action type');
}
if (typeof module !== 'undefined') module.exports = {verifyEffect, deepEqual};
