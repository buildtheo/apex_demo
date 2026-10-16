const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const app = fs.readFileSync(path.join(__dirname, '../web/app.js'), 'utf8');
const verify = fs.readFileSync(path.join(__dirname, '../web/verify.js'), 'utf8');
const clone = value => JSON.parse(JSON.stringify(value));
const reply = body => ({ok: true, json: async () => clone(body)});
const flush = () => new Promise(resolve => setImmediate(resolve));

async function harness() {
  const nodes = new Map();
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, {textContent: '', innerHTML: '', disabled: false});
    return nodes.get(id);
  };
  let server = {id: 'APX-001', version: 1, status: 'IN_REVIEW', amount: 648.50,
    customer: 'Synthetic customer', merchant: 'Demo merchant', evidence: [], timeline: [], draft: null};
  const pending = [];
  const ctx = vm.createContext({
    document: {getElementById: node, querySelectorAll: () => []},
    confirm: () => true,
    fetch: async (url, options) => {
      if (url.startsWith('/api/analysis/')) {
        return new Promise((resolve, reject) => pending.push({resolve, reject}));
      }
      if (url === '/api/case') return reply(server);
      if (url === '/api/action') {
        const {action} = JSON.parse(options.body);
        if (action === 'reset') {server.version = 1; server.status = 'IN_REVIEW';}
        if (action === 'response') {server.version++; server.status = 'EVIDENCE_RECEIVED';}
        return reply({accepted: true});
      }
      throw Error('Unexpected URL: ' + url);
    }
  });
  vm.runInContext(verify, ctx);
  vm.runInContext(app, ctx);
  await flush();
  return {ctx, node, pending, server};
}

const assessment = (text, version = 1, id = 'APX-001') =>
  reply({case_id: id, evidence_version: version, text});

async function run() {
  // A local reset reuses ID/version; a generation guard must still discard an old response.
  {
    const h = await harness();
    const old = h.ctx.ask('compare');
    await h.ctx.act('reset');
    h.pending[0].resolve(assessment('OLD ASSESSMENT'));
    await old;
    assert(!h.node('analysis').textContent.includes('OLD ASSESSMENT'));
  }
  // A delayed old snapshot must not overwrite the panel after evidence arrival.
  {
    const h = await harness();
    const old = h.ctx.ask('compare');
    await h.ctx.act('response');
    h.pending[0].resolve(assessment('OLD SNAPSHOT'));
    await old;
    assert(!h.node('analysis').textContent.includes('OLD SNAPSHOT'));
    const fresh = h.ctx.ask('compare');
    h.pending[1].resolve(assessment('FRESH SNAPSHOT', 2));
    await fresh;
    assert.equal(h.node('analysis').textContent, 'FRESH SNAPSHOT');
  }
  // Compare and gap requests may return in reverse order; only the newest should display.
  {
    const h = await harness();
    const first = h.ctx.ask('compare'), last = h.ctx.ask('gap');
    h.pending[1].resolve(assessment('LATEST QUESTION'));
    await last;
    h.pending[0].resolve(assessment('OLDER QUESTION'));
    await first;
    assert.equal(h.node('analysis').textContent, 'LATEST QUESTION');
  }
  // Server metadata can differ when another client advances the case.
  for (const [version, id] of [[2, 'APX-001'], [1, 'OTHER-CASE']]) {
    const h = await harness(), ask = h.ctx.ask('compare');
    h.pending[0].resolve(assessment('MISMATCHED RESULT', version, id));
    await ask;
    assert(!h.node('analysis').textContent.includes('MISMATCHED RESULT'));
    assert(h.node('analysis').textContent.includes('Refresh'));
  }
  // Refresh invalidates a previously displayed assessment and pending failures.
  {
    const h = await harness(), first = h.ctx.ask('compare');
    h.pending[0].resolve(assessment('PREVIOUS RESULT'));
    await first;
    h.server.version = 2;
    await h.ctx.load();
    assert(!h.node('analysis').textContent.includes('PREVIOUS RESULT'));
    const old = h.ctx.ask('gap');
    await h.ctx.act('reset');
    const notice = h.node('notice').textContent;
    h.pending[1].reject(Error('OLD FAILURE'));
    await old;
    assert.equal(h.node('notice').textContent, notice);
  }
  console.log('Assessment reset, snapshot, ordering, refresh, and stale-error checks passed.');
}

run().catch(error => {console.error(error); process.exitCode = 1;});
