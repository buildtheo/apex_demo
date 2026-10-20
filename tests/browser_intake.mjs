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
  await page.click('#request');
  await page.locator('#approval').waitFor({state: 'visible'});
  assert.equal((await readCase()).draft.case_id, caseId);
  assert.equal((await (await fetch(base + '/api/case')).json()).draft, null, 'Scoped analyst action must not change seeded case');
  mcp = createServer().listen(0, '127.0.0.1'); await once(mcp, 'listening');
  const mcpOrigin = `http://127.0.0.1:${mcp.address().port}`;
  mcp.on('request', createAdapter({origin: mcpOrigin, authMode: 'demo',
    readAssignments: async () => (await fetch(base + '/api/demo-assignments')).json(),
    readState: async id => (await fetch(`${base}/api/case?case_id=${encodeURIComponent(id)}`)).json()}));
  client = new Client({name: 'browser-continuity-check', version: '1'});
  await client.connect(new StreamableHTTPClientTransport(new URL(mcpOrigin + '/mcp')));
  const retrieved = await client.callTool({name: 'get_case', arguments: {case_id: caseId}});
  assert.equal(retrieved.structuredContent.case_id, caseId);
  const evidence = await client.callTool({name: 'get_evidence', arguments: {case_id: caseId, source_id: 'E-001', snapshot: 2}});
  assert.match(evidence.structuredContent.text, /Correction: my earlier clothing purchase was in May/);
  const hidden = await client.callTool({name: 'get_evidence', arguments: {case_id: caseId, source_id: 'E-004', snapshot: 2}});
  assert.equal(hidden.content[0].text, 'source_unavailable');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({browser_check: 'passed', mode: live ? 'live_responses' : 'mock_model', model_calls: modelCalls,
    model: initial.model_meta?.model || 'mock', same_case_through_queue_and_mcp: true, hidden_evidence_denied: true,
    live_database_modified: false}));
} finally {
  if (client) await client.close();
  if (mcp) { mcp.closeAllConnections(); await new Promise(resolve => mcp.close(resolve)); }
  if (browser) await browser.close();
  child.kill(); await exited;
  rmSync(temp, {recursive: true, force: true});
}
