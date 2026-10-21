// Optional isolated browser check. Live mode makes a few synthetic OpenAI requests.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdtempSync, mkdirSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:http';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {createAdapter} from '../adapter/app.mjs';

const {chromium} = await import(process.env.APEX_PLAYWRIGHT_MODULE || 'playwright');
const live = process.env.APEX_LIVE_INTAKE === '1';
const temp = mkdtempSync(join(tmpdir(), 'apex-browser-'));
const python = `from http.server import ThreadingHTTPServer
from server import Handler, Store
import sys
s = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
s.store = Store(sys.argv[1])
if sys.argv[2] != 'live':
    s.intake_model = lambda payload: dict(reply='Please review your report below.', statement='Customer denies this order; prior clothing purchase was in May.', reason='unauthorized', ready=True)
print(s.server_address[1], flush=True)
s.serve_forever()
`;
const child = spawn('python3', ['-u', '-c', python, join(temp, 'case.sqlite'), live ? 'live' : 'mock'], {stdio: ['ignore', 'pipe', 'pipe']});
const exited = once(child, 'exit');
let browser, mcp, client;
try {
  const line = await Promise.race([once(child.stdout, 'data').then(([data]) => data.toString().trim()), exited.then(() => { throw Error('Browser fixture server failed.'); })]);
  const base = `http://127.0.0.1:${Number(line)}`;
  browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const page = await browser.newPage({viewport: {width: 1000, height: 1100}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  await page.click('#open-charge'); await page.click('#dispute-charge'); await page.click('#choose-form');
  await page.waitForFunction(() => !document.getElementById('send-message').disabled);
  let modelCalls = 0;
  const send = async message => {
    await page.fill('#statement', message);
    const completed = page.waitForResponse(r => r.url().endsWith('/api/intake/turn') && r.request().method() === 'POST', {timeout: 50000});
    await page.click('#send-message');
    const response = await completed;
    assert.equal(response.status(), 200, `Intake turn failed: ${JSON.stringify(await response.json())}`);
    modelCalls++;
    await page.waitForFunction(() => !document.getElementById('send-message').disabled);
  };
  await send('I recognize JCPenney and bought clothing there earlier this year, but I did not place this $648.50 online order.');
  if (!await page.locator('#review').isVisible()) await send('No one else has permission to use my card. I did not authorize this online purchase.');
  await send('Correction: my earlier clothing purchase was in May. I still deny placing the October 12 order. Please include that correction.');
  await page.locator('#review').waitFor({state: 'visible', timeout: 10000});
  assert.match(await page.locator('#review-statement').innerText(), /May/i);
  assert.equal((await (await fetch(base + '/api/cases')).json()).length, 1, 'No case before customer confirmation');
  mkdirSync('.local', {recursive: true});
  await page.screenshot({path: '.local/intake-review.png', fullPage: true});
  await page.click('#confirm-report');
  await page.locator('#saved').waitFor({state: 'visible'});
  const caseId = (await page.locator('#saved-case').innerText()).replace('Case reference: ', '');
  assert.match(caseId, /^APX-[A-F0-9]{8}$/);
  const readCase = async () => (await fetch(`${base}/api/case?case_id=${caseId}`)).json();
  const initial = await readCase();
  assert.equal(initial.status, 'INTAKE_RECEIVED');
  assert.equal(initial.merchant, 'JCPenney');
  assert.match(initial.evidence[0].text, /Correction: my earlier clothing purchase was in May/);
  assert.deepEqual(initial.evidence.filter(e => e.available).map(e => e.id), ['E-001', 'E-002']);
  if (live) assert.match(initial.model_meta.model, /^gpt-/);
  await page.goto(base + '/queue');
  const row = page.locator('tr').filter({hasText: caseId});
  await row.locator('button').click();
  await page.waitForFunction(() => document.getElementById('notice').textContent.startsWith('Simulated later processor packet saved.'));
  const later = await readCase();
  assert.equal(later.version, 2);
  await row.locator('a').click();
  await page.waitForFunction(id => document.getElementById('facts').textContent.includes(id), caseId);
  assert.equal(new URL(page.url()).searchParams.get('case_id'), caseId);
  mcp = createServer().listen(0, '127.0.0.1'); await once(mcp, 'listening');
  const mcpOrigin = `http://127.0.0.1:${mcp.address().port}`;
  const actionCall = async (path, data) => {
    const response = await fetch(base + path, {method: data ? 'POST' : 'GET',
      headers: {'Content-Type': 'application/json', 'X-Apex-Demo': 'local', 'X-Apex-Actor': 'demo:barbara'},
      ...(data ? {body: JSON.stringify(data)} : {})});
    assert.equal(response.status, 200, 'Private action call must succeed');
    return response.json();
  };
  mcp.on('request', createAdapter({origin: mcpOrigin, authMode: 'demo',
    readAssignments: async () => (await fetch(base + '/api/demo-assignments')).json(),
    readState: async id => (await fetch(`${base}/api/case?case_id=${encodeURIComponent(id)}`)).json(),
    stageRequest: args => actionCall('/api/stage-request', args),
    stageCredit: args => actionCall('/api/stage-credit', args),
    getActionResult: (id, actionId) => actionCall(`/api/action-result?case_id=${id}&action_id=${actionId}`)}));
  client = new Client({name: 'browser-continuity-check', version: '1'});
  await client.connect(new StreamableHTTPClientTransport(new URL(mcpOrigin + '/mcp')));
  const retrieved = await client.callTool({name: 'get_case', arguments: {case_id: caseId}});
  assert.equal(retrieved.structuredContent.case_id, caseId);
  const evidence = await client.callTool({name: 'get_evidence', arguments: {case_id: caseId, source_id: 'E-001', snapshot: 2}});
  assert.match(evidence.structuredContent.text, /Correction: my earlier clothing purchase was in May/);
  const hidden = await client.callTool({name: 'get_evidence', arguments: {case_id: caseId, source_id: 'E-004', snapshot: 2}});
  assert.equal(hidden.content[0].text, 'source_unavailable');
  const staged = await client.callTool({name: 'stage_evidence_request', arguments: {case_id: caseId, snapshot: 2, scope: 'authentication_transaction_association'}});
  assert.equal(staged.structuredContent.status, 'AWAITING_HUMAN_APPROVAL');
  const draft = staged.structuredContent;
  assert.equal((await readCase()).request, null);
  const before = await client.callTool({name: 'get_action_result', arguments: {case_id: caseId, action_id: draft.action_id}});
  assert.equal(before.structuredContent.status, 'AWAITING_HUMAN_APPROVAL');
  await page.click('#refresh-case');
  await page.locator('#approval').waitFor({state: 'visible'});
  assert.equal(await page.locator('.request-question').innerText(), 'Which transaction is AUTH-77 associated with?');
  const requestFacts = await page.locator('.request-facts').innerText();
  for (const value of ['Apex evidence operations', 'AUTH-77', 'T-204', 'E-002, E-003', draft.action_id]) assert.ok(requestFacts.includes(value));
  assert.equal(await page.locator('#approval pre').isVisible(), false, 'Raw payload must be collapsed by default');
  await page.locator('.technical-payload summary').click();
  assert.equal(await page.locator('#approval pre').isVisible(), true);
  assert.ok((await page.locator('.technical-payload').innerText()).includes(draft.payload_hash));
  assert.deepEqual(JSON.parse(await page.locator('#approval pre').innerText()), draft.payload);
  await page.locator('.technical-payload summary').click();
  await page.screenshot({path: '.local/request-review.png', fullPage: true});
  await page.click('#approve');
  await page.waitForFunction(() => document.getElementById('notice').textContent.startsWith('Verified against the saved case record:'));
  const verified = await client.callTool({name: 'get_action_result', arguments: {case_id: caseId, action_id: draft.action_id}});
  assert.equal(verified.structuredContent.status, 'VERIFIED_SAVED_REQUEST');
  assert.equal((await (await fetch(base + '/api/case')).json()).request, null, 'Approval must not change seeded case');
  const duplicate = await actionCall('/api/review-action', {case_id: caseId, draft_id: draft.action_id, version: 2, payload_hash: draft.payload_hash});
  assert.equal(duplicate.duplicate, true);
  await page.click('#response');
  await page.waitForFunction(() => document.getElementById('snapshot').textContent === 'Evidence v3');
  const reassessed = await client.callTool({name: 'get_case', arguments: {case_id: caseId}});
  assert.equal(reassessed.structuredContent.association_check.matches_disputed_transaction, false);
  assert.equal(reassessed.structuredContent.association_check.returned_transaction_id, 'T-198');
  const originals = (await readCase()).evidence;
  const hiddenCorrection = await client.callTool({name: 'get_evidence', arguments: {case_id: caseId, source_id: 'E-005', snapshot: 3}});
  assert.equal(hiddenCorrection.content[0].text, 'source_unavailable');
  const followup = await client.callTool({name: 'stage_processor_followup', arguments: {case_id: caseId, snapshot: 3}});
  assert.equal(followup.structuredContent.status, 'AWAITING_HUMAN_APPROVAL');
  assert.equal(followup.structuredContent.payload.preserve_original, true);
  assert.equal((await readCase()).processor_request, undefined);
  await page.click('#refresh-case');
  await page.waitForFunction(() => document.getElementById('approval').textContent.includes('Ask the processor for more evidence'));
  assert.match(await page.locator('.request-facts').innerText(), /Keep E-003 unchanged/);
  await page.click('#approve');
  await page.waitForFunction(() => document.getElementById('notice').textContent.startsWith('Verified against the saved case record:'));
  assert.match(await page.locator('#request-status').innerText(), /No response has arrived yet/);
  assert.equal((await readCase()).version, 3);
  const savedFollowup = await client.callTool({name: 'get_action_result', arguments: {case_id: caseId, action_id: followup.structuredContent.action_id}});
  assert.equal(savedFollowup.structuredContent.status, 'VERIFIED_SAVED_REQUEST');
  assert.equal(savedFollowup.structuredContent.request.preserve_original, true);
  await page.screenshot({path: '.local/processor-waiting.png', fullPage: true});
  await page.click('#response');
  await page.waitForFunction(() => document.getElementById('snapshot').textContent === 'Evidence v4');
  const final = await readCase();
  assert.deepEqual(final.evidence.slice(0, 4), originals, 'Later response preserves all original evidence');
  assert.equal(final.status, 'PROCESSOR_EVIDENCE_RECEIVED');
  assert.equal(final.processor_request.status, 'RESPONDED');
  assert.match(await page.locator('#request-status').innerText(), /original export is unchanged/);
  const correction = await client.callTool({name: 'get_evidence', arguments: {case_id: caseId, source_id: 'E-005', snapshot: 4}});
  assert.match(correction.structuredContent.text, /no additional authorization evidence/);
  assert.equal(correction.structuredContent.provenance.correction_of, 'E-003');
  assert.equal(correction.structuredContent.provenance.request_id, savedFollowup.structuredContent.request.id);
  assert.equal(final.credit, undefined);
  const recommendation = {
    case_id: caseId, snapshot: 4, source_ids: ['E-001', 'E-002', 'E-003', 'E-004', 'E-005'],
    rationale: 'The customer denies authorization [E-001]. The ledger records the purchase only [E-002]. The original device assertion [E-003] cited a record for another purchase [E-004]. The processor corrected that citation and could provide no purchase-specific support [E-005]. Recommend a customer-favorable decision for human review of this complete record, not an automatic credit or finding of fraud.',
    customer_explanation: 'We reviewed your report and the corrected records for your JCPenney purchase. Your dispute has been resolved in your favor.'};
  const creditDraft = await client.callTool({name: 'stage_credit', arguments: recommendation});
  assert.equal(creditDraft.structuredContent.status, 'AWAITING_HUMAN_APPROVAL');
  assert.equal(creditDraft.structuredContent.payload.amount_cents, 64850);
  await page.goto(base);
  await page.waitForFunction(() => document.getElementById('saved-status').textContent === 'Under review');
  assert.equal(await page.locator('#resolution').isVisible(), false, 'A draft cannot produce customer success');
  await page.goto(`${base}/ops?case_id=${caseId}`);
  await page.locator('#supports-dispute').waitFor({state: 'visible'});
  assert.equal(await page.locator('#approve').isDisabled(), true, 'Explicit evidence-support review is required');
  assert.match(await page.locator('#approval').innerText(), /648.50/);
  await page.locator('#supports-dispute').check();
  await page.screenshot({path: '.local/credit-review.png', fullPage: true});
  await page.click('#approve');
  await page.waitForFunction(() => document.getElementById('notice').textContent.includes('credit and reviewed case decision are verified'));
  const credit = await client.callTool({name: 'get_action_result', arguments: {case_id: caseId, action_id: creditDraft.structuredContent.action_id}});
  assert.equal(credit.structuredContent.status, 'VERIFIED_POSTED_CREDIT');
  assert.equal(credit.structuredContent.credit.amount_cents, 64850);
  assert.equal(credit.structuredContent.credit.customer_explanation, recommendation.customer_explanation);
  assert.equal(credit.structuredContent.decision.reviewed_support, true);
  const repeated = await actionCall('/api/review-action', {case_id: caseId, draft_id: creditDraft.structuredContent.action_id,
    version: 4, payload_hash: creditDraft.structuredContent.payload_hash, supports_dispute: true});
  assert.equal(repeated.duplicate, true);
  await page.goto(base);
  await page.locator('#resolution').waitFor({state: 'visible'});
  assert.equal(await page.locator('#saved-title').innerText(), 'Your credit is here.');
  assert.equal(await page.locator('#resolution-explanation').innerText(), recommendation.customer_explanation);
  await page.screenshot({path: '.local/customer-credit.png', fullPage: true});
  await page.route('**/api/customer-case?*', route => route.fulfill({status: 409, json: {error: 'credit_verification_pending'}}));
  await page.click('#check-report');
  await page.waitForFunction(() => document.getElementById('saved-title').textContent.includes('could not confirm'));
  assert.equal(await page.locator('#resolution').isVisible(), false, 'Failed verification must hide previously visible completion');
  await page.unroute('**/api/customer-case?*');
  await page.click('#check-report');
  await page.locator('#resolution').waitFor({state: 'visible'});
  await page.locator('#saved [data-back="home"]').click();
  assert.equal(await page.locator('#card-balance').innerText(), '$1,536.22');
  assert.equal(await page.locator('#credit-activity').isVisible(), true);
  await page.screenshot({path: '.local/customer-credit-activity.png', fullPage: true});
  assert.equal((await (await fetch(base + '/api/case')).json()).request, null, 'Credit flow must not change legacy seed');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({browser_check: 'passed', mode: live ? 'live_responses' : 'mock_model', model_calls: modelCalls,
    model: initial.model_meta?.model || 'mock', same_case_through_queue_and_mcp: true, hidden_evidence_denied: true,
    mcp_staging_and_human_approval: true, separate_request_verification: true, deterministic_association_check: true,
    processor_followup_and_explicit_correction: true, original_evidence_preserved: true,
    reviewed_credit_and_separate_ledger_case_verification: true, customer_resolution_and_activity: true,
    live_database_modified: false}));
} finally {
  if (client) await client.close();
  if (mcp) { mcp.closeAllConnections(); await new Promise(resolve => mcp.close(resolve)); }
  if (browser) await browser.close();
  child.kill(); await exited;
  rmSync(temp, {recursive: true, force: true});
}
