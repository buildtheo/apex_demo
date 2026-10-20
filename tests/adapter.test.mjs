import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createServer, request} from 'node:http';
import {test} from 'node:test';
import {generateKeyPair, exportJWK, createLocalJWKSet, SignJWT} from 'jose';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {createAdapter} from '../adapter/app.mjs';
import {authorize, caseView, evidenceView, screen, tokenVerifier} from '../adapter/access.mjs';

// Locally generated credentials exercise validation, not an external OAuth deployment.
const issuer = 'https://identity.example/';
const audience = 'https://apex.example/mcp';
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

async function fixture(t, state = freshState()) {
  let reads = 0;
  const server = createServer().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}`;
  server.on('request', createAdapter({origin: url, issuer, assignments, verifyToken,
    readState: async () => { reads++; return state; }}));
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
  const headers = {};
  return {url, headers, reads: () => reads};
}

async function clientFor(t, f, bearer) {
  const client = new Client({name: 'apex-local-test', version: '1.0.0'});
  const transport = new StreamableHTTPClientTransport(new URL(`${f.url}/mcp`), {
    requestInit: {headers: {...f.headers, Authorization: `Bearer ${bearer}`}},
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
