import {readFileSync} from 'node:fs';
import {createAdapter} from './app.mjs';
import {tokenVerifier} from './access.mjs';
import {AccessError} from './access.mjs';

try { process.loadEnvFile('.env'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
function required(name) {
  if (!process.env[name]) throw Error(`Configure ${name} locally before starting the adapter.`);
  return process.env[name];
}
const authMode = process.env.APEX_AUTH_MODE || 'oauth';
const staging = process.env.APEX_ENABLE_STAGING === '1';
if (staging && authMode !== 'demo') throw Error('Staging is implemented only for explicitly simulated demo identity.');
if (!['oauth', 'demo'].includes(authMode)) throw Error('Unsupported APEX_AUTH_MODE.');
function configuredOrigin(value) {
  const url = new URL(value);
  const localDemo = authMode === 'demo' && url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname);
  if ((!localDemo && url.protocol !== 'https:') || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw Error('Expected HTTPS origin, or loopback HTTP in demo mode.');
  return url.origin;
}
const origin = configuredOrigin(required('APEX_MCP_ORIGIN'));
let issuer, verifyToken, assignments;
if (authMode === 'oauth') {
  issuer = required('APEX_OAUTH_ISSUER');
  const jwksUrl = required('APEX_OAUTH_JWKS_URL');
  for (const value of [issuer, jwksUrl]) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) throw Error('OAuth endpoints must use HTTPS.');
  }
  verifyToken = tokenVerifier({issuer, audience: required('APEX_OAUTH_AUDIENCE'), jwksUrl});
  assignments = JSON.parse(readFileSync(required('APEX_ACCESS_FILE'), 'utf8'));
  if (!assignments || Array.isArray(assignments) || typeof assignments !== 'object') throw Error('Expected subject-to-case assignments.');
} else {
  assignments = {'demo:barbara': {role: 'analyst', cases: ['APX-001']}};
}
const localRead = async path => {
  const response = await fetch(`http://127.0.0.1:8080${path}`, {signal: AbortSignal.timeout(5000), redirect: 'error'});
  if (!response.ok) throw Error('DMS read failed');
  return response.json();
};
async function actionCall(path, actor, data) {
  const response = await fetch(`http://127.0.0.1:8080${path}`, {
    method: data ? 'POST' : 'GET', headers: {'Content-Type': 'application/json', 'X-Apex-Demo': 'local', 'X-Apex-Actor': actor.subject},
    ...(data ? {body: JSON.stringify(data)} : {}), signal: AbortSignal.timeout(5000), redirect: 'error',
  });
  const result = await response.json();
  if (!response.ok) {
    const codes = new Set(['stale_snapshot', 'scope_denied', 'request_not_permitted', 'source_unavailable', 'draft_conflict', 'action_denied', 'action_unavailable',
      'credit_not_permitted', 'credit_context_changed', 'outside_credit_authority', 'rationale_requires_citations', 'source_scope_changed', 'content_blocked', 'reconciliation_required', 'practice_run_archived', 'explicit_demo_time_jump_required']);
    throw new AccessError(codes.has(result.error) ? result.error : 'service_unavailable');
  }
  return result;
}
const app = createAdapter({origin, issuer, assignments, verifyToken, authMode,
  readAssignments: authMode === 'demo' ? () => localRead('/api/demo-assignments') : undefined,
  readState: caseId => localRead(`/api/case?case_id=${encodeURIComponent(caseId)}`),
  ...(staging ? {requestEvidence: (args, actor) => actionCall('/api/investigation-request', actor, args),
    receiveDemoEvidence: (args, actor) => actionCall('/api/demo-evidence', actor, args),
    stageCredit: (args, actor) => actionCall('/api/stage-credit', actor, args),
    getActionResult: (caseId, actionId, actor) => actionCall(`/api/action-result?case_id=${encodeURIComponent(caseId)}&action_id=${encodeURIComponent(actionId)}`, actor)} : {})});
app.listen(8787, '127.0.0.1', () => console.log(`Apex MCP on 127.0.0.1:8787 (${authMode === 'demo' ? 'SIMULATED IDENTITY, NO OAUTH' : 'OAuth'}); bounded investigation ${staging ? 'enabled' : 'disabled'}; credit requires separate Apex approval.`));
