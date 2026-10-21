import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createServer, request} from 'node:http';
import {test} from 'node:test';
import {generateKeyPair, exportJWK, createLocalJWKSet, SignJWT} from 'jose';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {createAdapter, boundedInvestigationInstructions, demoEvidenceDescription} from '../adapter/app.mjs';
import {authorize, caseView, evidenceView, screen, tokenVerifier, actionResultView, creditPayloadView} from '../adapter/access.mjs';

test('credit payload accepts bounded practice account namespaces, not arbitrary accounts', () => {
  const payload = {amount_cents: 64850, currency: 'USD', account_ref: 'demo:martha:card-8821',
    transaction_id: 'T-204', policy_id: 'DEMO-CREDIT-01', disposition: 'CUSTOMER_FAVORABLE',
    source_ids: ['E-001', 'E-002', 'E-003', 'E-004', 'E-005'], rationale: 'Synthetic rationale', customer_explanation: 'Evidence reviewed.'};
  assert.equal(creditPayloadView({...payload, account_ref: payload.account_ref + ':practice:' + 'ab'.repeat(16)}).amount_cents, 64850);
  for (const account_ref of ['other', payload.account_ref + ':practice:short', payload.account_ref + ':practice:' + 'g'.repeat(32)]) {
    assert.throws(() => creditPayloadView({...payload, account_ref}));
  }
});

// Locally generated credentials exercise validation, not an external OAuth deployment.
const issuer = 'https://identity.example/';
const audience = 'https://apex.example/mcp';

test('agreed evidence step includes labeled later response without a second time-jump question', () => {
  assert.match(boundedInvestigationInstructions, /says yes to your immediately preceding evidence-gathering proposal/);
  assert.match(boundedInvestigationInstructions, /Do not ask a second question/);
  assert.match(boundedInvestigationInstructions, /Later - response received \(simulated\)/);
  assert.match(boundedInvestigationInstructions, /read the newly released source before assessing it/);
  assert.match(boundedInvestigationInstructions, /Honor requests to pause/);
  assert.match(boundedInvestigationInstructions, /An unrelated yes is not permission/);
  assert.match(boundedInvestigationInstructions, /exact human credit approval/);
  assert.match(demoEvidenceDescription, /No extra time-jump question is required/);
  assert.doesNotMatch(boundedInvestigationInstructions + demoEvidenceDescription, /only when Barbara asks to show|never automatically after a request|Do not automatically advance time/);
});
const {privateKey, publicKey} = await generateKeyPair('RS256');
const jwk = {...await exportJWK(publicKey), kid: 'local-test', alg: 'RS256'};
const verifyToken = tokenVerifier({issuer, audience}, createLocalJWKSet({keys: [jwk]}));
const assignments = {barbara: {role: 'analyst', cases: ['APX-001']}};
const freshState = () => ({
  id: 'APX-001', customer: 'PRIVATE CUSTOMER NAME', merchant: 'JCPenney', amount: 648.50,
  status: 'Investigating', version: 1, receipts: ['PRIVATE RECEIPT'], draft: 'PRIVATE DRAFT',
  evidence: [
    {id: 'E-001', title: 'Customer statement', source: 'Synthetic intake', kind: 'statement', text: 'I dispute this purchase.', available: true},
    {id: 'E-004', title: 'Later response', source: 'Synthetic processor', kind: 'response', text: 'WITHHELD ANSWER', available: false},
  ],
});
async function token(overrides = {}, key = privateKey) {
  return new SignJWT({scope: 'apex:read', ...overrides})
    .setProtectedHeader({alg: 'RS256', kid: 'local-test'})
    .setIssuer(overrides.iss || issuer).setAudience(overrides.aud || audience)
    .setSubject(overrides.sub || 'barbara').setIssuedAt()
    .setExpirationTime(overrides.exp ?? '5m').sign(key);
}
const rejectsCode = (fn, code) => assert.rejects(fn, error => error.code === code);

test('signed issuer/audience/scope/expiry and signature validation', async () => {
  assert.equal((await verifyToken(await token())).subject, 'barbara');
  const wrongKey = (await generateKeyPair('RS256')).privateKey;
  for (const value of [
    await token({iss: 'https://wrong.example/'}), await token({aud: 'wrong'}),
    await token({scope: 'other:read'}), await token({exp: 1}),
    await token({}, wrongKey), 'not-a-token',
  ]) await rejectsCode(() => verifyToken(value), 'invalid_token');
});

test('case access is explicit, role-bound and expires', () => {
  const principal = {subject: 'barbara', expiresAt: Date.now() / 1000 + 60};
  authorize(principal, 'APX-001', assignments);
  for (const [actor, caseId, acl, code] of [
    [{...principal, subject: 'other'}, 'APX-001', assignments, 'access_denied'],
    [principal, 'APX-002', assignments, 'access_denied'],
    [principal, 'APX-001', {barbara: {role: 'customer', cases: ['APX-001']}}, 'access_denied'],
    [principal, 'APX-001', {barbara: {role: 'analyst', cases: 'APX-001'}}, 'access_denied'],
    [{...principal, expiresAt: 1}, 'APX-001', assignments, 'invalid_token'],
    [{...principal, expiresAt: undefined}, 'APX-001', assignments, 'invalid_token'],
  ]) assert.throws(() => authorize(actor, caseId, acl), error => error.code === code);
});

test('provider case view excludes internal fields and unreleased text', () => {
  const view = caseView(freshState());
  assert.equal(view.case_id, 'APX-001');
  assert.equal(view.sources[1].available, false);
  assert.deepEqual(Object.keys(view.sources[1]).sort(), ['available', 'source_id']);
  assert.doesNotMatch(JSON.stringify(view), /PRIVATE|WITHHELD/);
  assert.deepEqual(Object.keys(view).sort(), ['case_id', 'evidence_version', 'sources', 'status', 'synthetic', 'transaction']);
});

test('evidence requires a released source and exact snapshot', () => {
  assert.equal(evidenceView(freshState(), 'E-001', 1).text, 'I dispute this purchase.');
  for (const [id, version, code] of [
    ['E-004', 1, 'source_unavailable'], ['missing', 1, 'source_unavailable'],
    ['E-001', 2, 'stale_snapshot'],
  ]) assert.throws(() => evidenceView(freshState(), id, version), error => error.code === code);
});

test('conservative outbound screening blocks card-like numbers and labeled secrets', () => {
  for (const text of ['4111 1111 1111 1111', 'CVV: 123', 'PIN=1776', 'password: secret', 'x'.repeat(12001)]) {
    assert.throws(() => screen(text), error => error.code === 'content_blocked');
  }
  const state = freshState();
  state.evidence[0].text = 'security code: 123';
  assert.throws(() => evidenceView(state, 'E-001', 1), error => error.code === 'content_blocked');
  assert.equal(screen('Purchase $648.50, source E-001.'), 'Purchase $648.50, source E-001.');
});

async function fixture(t, state = freshState(), options = {}) {
  let reads = 0;
  const server = createServer().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}`;
  server.on('request', createAdapter({origin: url, issuer, assignments, verifyToken,
    readState: async () => { reads++; return state; }, ...options}));
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const headers = {};
  return {url, headers, reads: () => reads};
}

async function clientFor(t, f, bearer) {
  const client = new Client({name: 'apex-local-test', version: '1.0.0'});
  const transport = new StreamableHTTPClientTransport(new URL(`${f.url}/mcp`), {
    requestInit: {headers: {...f.headers, ...(bearer ? {Authorization: `Bearer ${bearer}`} : {})}},
  });
  t.after(() => client.close());
  await client.connect(transport);
  return client;
}

test('HTTP metadata advertises OAuth; missing bearer fails without reading DMS', async t => {
  const f = await fixture(t);
  const metadata = await fetch(`${f.url}/.well-known/oauth-protected-resource/mcp`, {headers: f.headers});
  assert.equal(metadata.status, 200);
  assert.deepEqual((await metadata.json()).scopes_supported, ['apex:read']);
  const denied = await fetch(`${f.url}/mcp`, {method: 'POST', headers: f.headers});
  assert.equal(denied.status, 401);
  assert.match(denied.headers.get('www-authenticate'), /resource_metadata=/);
  assert.equal(f.reads(), 0);
});

test('HTTP rejects unexpected Host and browser Origin', async t => {
  const f = await fixture(t);
  const hostStatus = await new Promise((resolve, reject) => {
    const req = request(`${f.url}/healthz`, {headers: {Host: 'evil.example'}}, res => { res.resume(); resolve(res.statusCode); });
    req.on('error', reject); req.end();
  });
  assert.equal(hostStatus, 403);
  assert.equal((await fetch(`${f.url}/healthz`, {headers: {Origin: 'https://evil.example'}})).status, 403);
  assert.equal(f.reads(), 0);
});

test('SDK initializes, lists only read tools, and retrieves allowed source', async t => {
  const f = await fixture(t);
  const client = await clientFor(t, f, await token());
  const {tools} = await client.listTools();
  assert.deepEqual(tools.map(tool => tool.name).sort(), ['get_case', 'get_evidence']);
  assert.ok(tools.every(tool => tool.annotations.readOnlyHint && !tool.annotations.destructiveHint));
  const result = await client.callTool({name: 'get_case', arguments: {case_id: 'APX-001'}});
  assert.equal(result.structuredContent.case_id, 'APX-001');
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE|WITHHELD/);
  const evidence = await client.callTool({name: 'get_evidence', arguments: {case_id: 'APX-001', source_id: 'E-001', snapshot: 1}});
  assert.equal(evidence.structuredContent.text, 'I dispute this purchase.');
});

test('valid signed but unassigned identity cannot read or infer case data', async t => {
  const f = await fixture(t);
  const client = await clientFor(t, f, await token({sub: 'denied-user'}));
  const result = await client.callTool({name: 'get_case', arguments: {case_id: 'APX-001'}});
  assert.equal(result.isError, true);
  assert.equal(result.content[0].text, 'access_denied');
  assert.equal(f.reads(), 0);
});

test('SDK refuses hidden evidence and stale snapshots without returning text', async t => {
  const f = await fixture(t);
  const client = await clientFor(t, f, await token());
  for (const [source_id, snapshot, code] of [['E-004', 1, 'source_unavailable'], ['E-001', 2, 'stale_snapshot']]) {
    const result = await client.callTool({name: 'get_evidence', arguments: {case_id: 'APX-001', source_id, snapshot}});
    assert.equal(result.isError, true);
    assert.equal(result.content[0].text, code);
    assert.doesNotMatch(JSON.stringify(result), /WITHHELD/);
  }
});

test('SDK never returns a blocked sensitive excerpt', async t => {
  const state = freshState();
  state.evidence[0].text = 'PIN=1776';
  const f = await fixture(t, state);
  const client = await clientFor(t, f, await token());
  const result = await client.callTool({name: 'get_evidence', arguments: {case_id: 'APX-001', source_id: 'E-001', snapshot: 1}});
  assert.equal(result.isError, true);
  assert.equal(result.content[0].text, 'content_blocked');
  assert.doesNotMatch(JSON.stringify(result), /1776/);
});

test('HTTP rejects invalid tokens and oversized bodies without reading DMS', async t => {
  const f = await fixture(t);
  const invalid = await fetch(`${f.url}/mcp`, {method: 'POST', headers: {Authorization: 'Bearer invalid'}});
  assert.equal(invalid.status, 401);
  const oversized = await fetch(`${f.url}/mcp`, {method: 'POST',
    headers: {Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({padding: 'x'.repeat(33000)})});
  assert.equal(oversized.status, 413);
  assert.equal(f.reads(), 0);
});

test('SDK rejects unauthorized case and malformed arguments before a DMS read', async t => {
  const f = await fixture(t);
  const client = await clientFor(t, f, await token());
  const denied = await client.callTool({name: 'get_case', arguments: {case_id: 'APX-002'}});
  assert.equal(denied.content[0].text, 'access_denied');
  const invalid = await client.callTool({name: 'get_evidence', arguments: {case_id: 'APX-001', source_id: 'E-001', snapshot: -1}});
  assert.equal(invalid.isError, true);
  assert.equal(f.reads(), 0);
});

const demoOptions = {authMode: 'demo', assignments: {'demo:barbara': {role: 'analyst', cases: ['APX-001']}}};

test('explicit demo mode needs no token and discloses simulated identity', async t => {
  const f = await fixture(t, freshState(), demoOptions);
  const health = await fetch(`${f.url}/healthz`);
  assert.equal((await health.json()).authentication, 'simulated_not_oauth');
  assert.equal((await fetch(`${f.url}/.well-known/oauth-protected-resource`)).status, 404);
  const client = await clientFor(t, f);
  const result = await client.callTool({name: 'get_case', arguments: {case_id: 'APX-001'}});
  assert.equal(result.structuredContent.identity_verification, 'simulated_not_oauth');
  assert.equal(result.structuredContent.synthetic, true);
});

test('demo mode preserves case/release/version checks, never trusts caller identity', async t => {
  const f = await fixture(t, freshState(), demoOptions);
  const client = await clientFor(t, f);
  const denied = await client.callTool({name: 'get_case', arguments: {case_id: 'APX-002', subject: 'admin', role: 'reviewer'}});
  assert.equal(denied.content[0].text, 'access_denied');
  assert.equal(f.reads(), 0);
  for (const [source_id, snapshot, code] of [['E-004', 1, 'source_unavailable'], ['E-001', 2, 'stale_snapshot']]) {
    const result = await client.callTool({name: 'get_evidence', arguments: {case_id: 'APX-001', source_id, snapshot}});
    assert.equal(result.content[0].text, code);
  }
});

test('unknown authentication mode fails closed', () => {
  assert.throws(() => createAdapter({authMode: 'typo'}), /Unsupported authentication mode/);
});

test('live assignment map and requested case ID are rechecked for newly submitted cases', async t => {
  const state = freshState(); state.id = 'APX-NEWCASE';
  let entitled = true, requested;
  const f = await fixture(t, state, {...demoOptions,
    readAssignments: async () => ({'demo:barbara': {role: 'analyst', cases: entitled ? ['APX-NEWCASE'] : []}}),
    readState: async caseId => { requested = caseId; return state; },
  });
  const client = await clientFor(t, f);
  const result = await client.callTool({name: 'get_case', arguments: {case_id: state.id}});
  assert.equal(result.structuredContent.case_id, state.id);
  assert.equal(requested, state.id);
  entitled = false; requested = undefined;
  const denied = await client.callTool({name: 'get_case', arguments: {case_id: state.id}});
  assert.equal(denied.content[0].text, 'access_denied');
  assert.equal(requested, undefined);
});

function actionFixture() {
  const state = freshState();
  state.evidence.push(...['E-002', 'E-003'].map(id => ({id, title: 'Released record', source: 'Synthetic', kind: 'Record', text: 'Released', available: true})));
  const staged = {case_id: state.id, action_id: 'a'.repeat(24), evidence_version: 1, status: 'AWAITING_HUMAN_APPROVAL',
    payload: {queue: 'Apex evidence operations', question: 'Which transaction is AUTH-77 associated with?', source_ids: ['E-002', 'E-003'], auth_record_id: 'AUTH-77', disputed_transaction_id: 'T-204'},
    payload_hash: '1'.repeat(64), expires_at: 9999999999};
  return {state, staged};
}

test('staging is a write; five tools include result reads but never an approval/execution tool', async t => {
  const {state, staged} = actionFixture();
  let actor, calls = 0;
  const f = await fixture(t, state, {...demoOptions, stageRequest: async (_args, principal) => { actor = principal.subject; calls++; return staged; },
    getActionResult: async () => ({case_id: state.id, action_id: staged.action_id, status: 'AWAITING_HUMAN_APPROVAL', approved_snapshot: 1, observed_snapshot: 1})});
  const client = await clientFor(t, f);
  const {tools} = await client.listTools();
  assert.deepEqual(tools.map(tool => tool.name).sort(), ['get_action_result', 'get_case', 'get_evidence', 'stage_evidence_request', 'stage_processor_followup']);
  assert.equal(tools.find(tool => tool.name === 'stage_processor_followup').annotations.readOnlyHint, false);
  assert.equal(tools.find(tool => tool.name === 'stage_evidence_request').annotations.readOnlyHint, false);
  const result = await client.callTool({name: 'stage_evidence_request', arguments: {case_id: state.id, snapshot: 1, scope: 'authentication_transaction_association'}});
  assert.equal(result.structuredContent.status, 'AWAITING_HUMAN_APPROVAL');
  assert.equal(result.structuredContent.payload_hash, '1'.repeat(64));
  assert.equal(actor, 'demo:barbara'); assert.equal(calls, 1);
  const readback = await client.callTool({name: 'get_action_result', arguments: {case_id: state.id, action_id: staged.action_id}});
  assert.equal(readback.structuredContent.status, 'AWAITING_HUMAN_APPROVAL');
});

test('unassigned identity, wrong scope, stale snapshot and unreleased source never reach staging', async t => {
  const {state, staged} = actionFixture(); let calls = 0;
  const f = await fixture(t, state, {stageRequest: async () => { calls++; return staged; }, getActionResult: async () => ({})});
  const denied = await clientFor(t, f, await token({sub: 'denied-user'}));
  const args = {case_id: state.id, snapshot: 1, scope: 'authentication_transaction_association'};
  assert.equal((await denied.callTool({name: 'stage_evidence_request', arguments: args})).isError, true);
  const allowed = await clientFor(t, f, await token());
  for (const changed of [{scope: 'all_customer_records'}, {snapshot: 2}]) {
    assert.equal((await allowed.callTool({name: 'stage_evidence_request', arguments: {...args, ...changed}})).isError, true);
  }
  state.evidence.find(e => e.id === 'E-003').available = false;
  assert.equal((await allowed.callTool({name: 'stage_evidence_request', arguments: args})).content[0].text, 'source_unavailable');
  assert.equal(calls, 0);
});

test('new result views discard extra fields and fail mismatched action identity', async t => {
  const {state, staged} = actionFixture();
  const f = await fixture(t, state, {...demoOptions, stageRequest: async () => ({...staged, internal: 'PRIVATE DATA'}),
    getActionResult: async () => ({case_id: 'APX-OTHER', action_id: staged.action_id, status: 'VERIFIED_SAVED_REQUEST'})});
  const client = await clientFor(t, f);
  const result = await client.callTool({name: 'stage_evidence_request', arguments: {case_id: state.id, snapshot: 1, scope: 'authentication_transaction_association'}});
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE DATA/);
  const bad = await client.callTool({name: 'get_action_result', arguments: {case_id: state.id, action_id: staged.action_id}});
  assert.equal(bad.isError, true);
  assert.equal(bad.content[0].text, 'invalid_action_result');
});

test('optional staging requires verification and hidden association metadata cannot leak', () => {
  assert.throws(() => createAdapter({authMode: 'demo', stageRequest: async () => ({})}), /configured together/);
  const state = freshState();
  state.association_check = {returned_transaction_id: 'HIDDEN ANSWER'};
  assert.doesNotMatch(JSON.stringify(caseView(state)), /HIDDEN ANSWER/);
});

test('processor follow-up enforces assignment, snapshot and released lookup before its fixed scope reaches backend', async t => {
  const {state, staged} = actionFixture();
  let received;
  staged.payload = {...staged.payload, preserve_original: true, correction_of: 'E-003'};
  const f = await fixture(t, state, {...demoOptions, stageRequest: async args => { received = args; return staged; }, getActionResult: async () => ({})});
  const client = await clientFor(t, f);
  const args = {case_id: state.id, snapshot: 1};
  const call = arguments_ => client.callTool({name: 'stage_processor_followup', arguments: arguments_});
  assert.equal((await call({...args, case_id: 'OTHER'})).content[0].text, 'access_denied');
  assert.equal((await call({...args, snapshot: 2})).content[0].text, 'stale_snapshot');
  assert.equal((await call(args)).content[0].text, 'source_unavailable');
  assert.equal(received, undefined);
  state.evidence.find(e => e.id === 'E-004').available = true;
  const result = await call({...args, scope: 'all_customer_records'});
  assert.deepEqual(received, {...args, scope: 'processor_transaction_evidence'});
  assert.equal(result.structuredContent.payload.preserve_original, true);
  assert.equal(result.structuredContent.payload.correction_of, 'E-003');
});

test('corrected response provenance is returned only for released evidence at the current snapshot', () => {
  const state = freshState();
  state.evidence.push({id: 'E-005', title: 'Correction', source: 'Synthetic processor', kind: 'Response', text: 'Corrected record.',
    available: false, received_at: '2026-10-21T12:00:00Z', corrected_at: '2026-10-21T11:59:00Z', document_version: 2, correction_of: 'E-003', request_id: 'REQ-abcdef12'});
  assert.doesNotMatch(JSON.stringify(caseView(state)), /Corrected record|2026-10-21/);
  assert.throws(() => evidenceView(state, 'E-005', 1), error => error.code === 'source_unavailable');
  state.evidence.at(-1).available = true;
  const view = evidenceView(state, 'E-005', 1);
  assert.equal(view.provenance.document_version, 2);
  assert.equal(view.provenance.simulated_arrival, true);
  assert.equal(view.provenance.correction_of, 'E-003');
  assert.equal(view.provenance.corrected_at, '2026-10-21T11:59:00Z');
});

function creditFixture() {
  const {state} = actionFixture();
  state.evidence.find(e => e.id === 'E-004').available = true;
  state.evidence.push({id: 'E-001', available: true}, {id: 'E-005', available: true});
  const payload = {amount_cents: 64850, currency: 'USD', account_ref: 'demo:martha:card-8821', transaction_id: 'T-204',
    policy_id: 'DEMO-CREDIT-01', disposition: 'CUSTOMER_FAVORABLE', source_ids: ['E-001', 'E-002', 'E-003', 'E-004', 'E-005'],
    rationale: 'Human-reviewed recommendation.', customer_explanation: 'Your dispute is resolved in your favor.'};
  const staged = {case_id: state.id, action_kind: 'POST_CREDIT', action_id: 'a'.repeat(24), evidence_version: 1,
    status: 'AWAITING_HUMAN_APPROVAL', payload, payload_hash: 'b'.repeat(64), expires_at: 9999999999};
  return {state, payload, staged};
}

test('credit draft is a sixth WRITE tool with no approval/posting tool and fixed payload boundary', async t => {
  const {state, staged} = creditFixture();
  let received, actor;
  const f = await fixture(t, state, {...demoOptions, stageRequest: async () => ({}), getActionResult: async () => ({}),
    stageCredit: async (args, principal) => {received = args; actor = principal.subject; return {...staged, private: 'SECRET'};}});
  const client = await clientFor(t, f);
  const list = await client.listTools();
  assert.equal(list.tools.length, 6);
  assert.equal(list.tools.find(tool => tool.name === 'stage_credit').annotations.readOnlyHint, false);
  assert.match(list.tools.find(tool => tool.name === 'stage_credit').description, /does not approve a decision, post funds or communicate/);
  assert.match(list.tools.find(tool => tool.name === 'stage_credit').inputSchema.properties.customer_explanation.description, /not an approval or posting confirmation/);
  assert.ok(!list.tools.some(tool => /approve|execute|post_credit/.test(tool.name)));
  const args = {case_id: state.id, snapshot: 1, source_ids: staged.payload.source_ids, rationale: 'Cited analysis', customer_explanation: 'Explanation'};
  const result = await client.callTool({name: 'stage_credit', arguments: {...args, amount_cents: 1, approved_by: 'admin'}});
  assert.equal(result.structuredContent.payload.amount_cents, 64850);
  assert.equal(actor, 'demo:barbara');
  assert.deepEqual(received, args);
  assert.doesNotMatch(JSON.stringify(result), /SECRET/);
});

test('credit source/snapshot/access and sensitive-text failures never reach backend', async t => {
  const {state, staged} = creditFixture(); let calls = 0;
  const f = await fixture(t, state, {...demoOptions, stageRequest: async () => ({}), getActionResult: async () => ({}),
    stageCredit: async () => {calls++; return staged;}});
  const client = await clientFor(t, f);
  const args = {case_id: state.id, snapshot: 1, source_ids: staged.payload.source_ids, rationale: 'Cited analysis', customer_explanation: 'Explanation'};
  for (const changed of [{case_id: 'OTHER'}, {snapshot: 2}, {customer_explanation: 'PIN: 1234'}, {source_ids: ['E-001']}]) {
    assert.equal((await client.callTool({name: 'stage_credit', arguments: {...args, ...changed}})).isError, true);
  }
  state.evidence.find(e => e.id === 'E-005').available = false;
  assert.equal((await client.callTool({name: 'stage_credit', arguments: args})).content[0].text, 'source_unavailable');
  assert.equal(calls, 0);
});

test('verified credit result requires matching ledger and reviewed decision; extra data stays private', () => {
  const {payload, staged} = creditFixture();
  const common = {...payload, case_id: staged.case_id, draft_id: staged.action_id, evidence_version: 1, payload_hash: staged.payload_hash,
    approved_by: 'demo:barbara', approval_identity: 'simulated_not_oauth'};
  const credit = {...common, id: 'CR-' + staged.action_id, status: 'POSTED', posted_at: '2026-10-21T12:00:00Z', private: 'SECRET'};
  const decision = {...common, credit_id: credit.id, reviewed_support: true, brief_version: 1};
  const data = {case_id: staged.case_id, action_id: staged.action_id, approved_snapshot: 1, observed_snapshot: 1,
    status: 'VERIFIED_POSTED_CREDIT', credit, decision};
  const view = actionResultView(data, data.case_id, data.action_id);
  assert.equal(view.credit.amount_cents, 64850);
  assert.doesNotMatch(JSON.stringify(view), /SECRET/);
  for (const changed of [{credit: {...credit, amount_cents: 1}}, {decision: {...decision, customer_explanation: 'Changed'}},
    {decision: {...decision, reviewed_support: false}}, {credit: {...credit, id: 'CR-other'}}]) {
    assert.throws(() => actionResultView({...data, ...changed}, data.case_id, data.action_id));
  }
});

test('credit configuration requires result verification and policy metadata is released with the corrected response', () => {
  assert.throws(() => createAdapter({authMode: 'demo', stageCredit: async () => ({})}), /requires verification/);
  const state = freshState(); state.intake_id = 'synthetic-intake';
  state.evidence.push({id: 'E-005', title: 'Corrected processor response', source: 'Synthetic processor', available: false});
  assert.equal(caseView(state).credit_policy, undefined);
  state.evidence.at(-1).available = true;
  assert.equal(caseView(state).credit_policy.authority_limit_cents_exclusive, 100000);
  assert.equal(caseView(state).credit_policy.fictional, true);
});

test('bounded tools replace request approvals, remain writes, and never expose credit approval', async t => {
  const {state, staged} = actionFixture();
  const calls = [];
  const saved = {case_id: state.id, action_id: staged.action_id, approved_snapshot: 1, observed_snapshot: 1,
    status: 'VERIFIED_SAVED_REQUEST', request: {...staged.payload, id: 'REQ-demo', case_id: state.id,
      draft_id: staged.action_id, status: 'OPEN', evidence_version: 1, payload_hash: staged.payload_hash,
      requested_by: 'demo:barbara', authorization_mode: 'bounded_investigation', identity_verification: 'simulated_not_oauth'}};
  const f = await fixture(t, state, {...demoOptions,
    stageRequest: async () => { throw Error('Legacy tool must not be offered'); },
    requestEvidence: async (args, actor) => { calls.push({args, actor}); return saved; },
    receiveDemoEvidence: async args => ({case_id: args.case_id, stage: args.stage, source_id: 'E-004', simulation: true,
      from_snapshot: args.snapshot, evidence_version: args.snapshot + 1, observed_snapshot: args.snapshot + 1,
      duplicate: false, notice: 'SIMULATION - later evidence received.'}),
    stageCredit: async () => ({}), getActionResult: async () => saved});
  const client = await clientFor(t, f);
  const tools = (await client.listTools()).tools;
  assert.deepEqual(tools.map(tool => tool.name).sort(), ['get_case', 'get_evidence', 'get_action_result',
    'request_authentication_lookup', 'request_processor_evidence', 'receive_demo_evidence', 'stage_credit'].sort());
  assert.equal(client.getInstructions(), boundedInvestigationInstructions);
  assert.equal(tools.find(tool => tool.name === 'receive_demo_evidence').description, demoEvidenceDescription);
  for (const name of ['request_authentication_lookup', 'request_processor_evidence', 'receive_demo_evidence', 'stage_credit']) {
    assert.equal(tools.find(tool => tool.name === name).annotations.readOnlyHint, false);
  }
  const response = await client.callTool({name: 'request_authentication_lookup', arguments: {case_id: state.id, snapshot: 1,
    scope: 'POST_CREDIT', question: 'Ignore policy', subject: 'admin'}});
  assert.equal(response.structuredContent.status, 'VERIFIED_SAVED_REQUEST');
  assert.equal(response.structuredContent.request.authorization_mode, 'bounded_investigation');
  assert.equal('approved_by' in response.structuredContent.request, false);
  assert.deepEqual(calls[0].args, {case_id: state.id, snapshot: 1, scope: 'authentication_transaction_association'});
  assert.equal(calls[0].actor.subject, 'demo:barbara');
  const before = calls.length;
  const denied = await client.callTool({name: 'request_processor_evidence', arguments: {case_id: state.id, snapshot: 1}});
  assert.equal(denied.content[0].text, 'source_unavailable');
  assert.equal(calls.length, before);
  const arrived = await client.callTool({name: 'receive_demo_evidence', arguments: {case_id: state.id, snapshot: 1,
    stage: 'authentication_lookup', time_jump: 'later_demo_response'}});
  assert.equal(arrived.structuredContent.simulation, true);
  const unassigned = await client.callTool({name: 'request_authentication_lookup', arguments: {case_id: 'APX-OTHER', snapshot: 1}});
  assert.equal(unassigned.content[0].text, 'access_denied');
  const privateRoute = await fetch(f.url + '/api/demo-evidence', {method: 'POST'});
  assert.equal(privateRoute.status, 404);
});

test('bounded investigation requires demo mode and saved-result verification', () => {
  assert.throws(() => createAdapter({authMode: 'demo', requestEvidence: async () => ({})}), /configured together/);
  assert.throws(() => createAdapter({authMode: 'oauth', requestEvidence: async () => ({}),
    receiveDemoEvidence: async () => ({}), getActionResult: async () => ({})}), /demo-only/);
});
