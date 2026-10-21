import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import twilio from 'twilio';
import WebSocket, {WebSocketServer} from 'ws';
import {attachPhone, readbackMatches, realtimeSession} from '../adapter/phone-bridge.mjs';

const config = {origin: 'https://phone.example', accountSid: 'AC' + 'a'.repeat(32), authToken: 'test-token-only',
  number: '+15555550100', caller: '+15555550101', apiKey: 'test-key-only', model: 'gpt-realtime-2.1', voice: 'cedar'};
const wait = async predicate => {for (let i = 0; i < 200; i++) {if (predicate()) return; await new Promise(r => setTimeout(r, 10));} throw Error('Phone test timed out');};
async function fixture(t) {
  const calls = [], modelEvents = [], phoneEvents = [];
  const modelServer = new WebSocketServer({port: 0, host: '127.0.0.1'}); await once(modelServer, 'listening');
  let peer;
  modelServer.on('connection', socket => {peer = socket; socket.on('message', raw => {
    const event = JSON.parse(raw.toString()); modelEvents.push(event);
    if (event.type === 'session.update') socket.send(JSON.stringify({type: 'session.updated'}));
  });});
  const server = createServer((req, res) => void bridge.handle(req, res));
  const backend = async (action, data, session) => {
    calls.push({action, data, session});
    if (action === 'claim') return {session_id: 'private-session', token: 'private-capability', revision: 0, transaction: {transaction_id: 'T-204'}};
    if (action === 'transcript') return {revision: 1};
    if (action === 'prepare') return {revision: 1, review: {statement: data.statement, nonce: 'private-review-nonce'}};
    if (action === 'confirm') return {verified_saved_case: true, case_id: 'APX-TEST'};
    return {ok: true};
  };
  const bridge = attachPhone(server, {config, backend, connectModel: () => new WebSocket(`ws://127.0.0.1:${modelServer.address().port}`)});
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {await bridge.close(); for (const socket of modelServer.clients) socket.terminate();
    server.closeAllConnections(); await new Promise(r => server.close(r)); await new Promise(r => modelServer.close(r));});
  async function dial(overrides = {}, signed = true) {
    const params = {AccountSid: config.accountSid, To: config.number, From: config.caller, CallSid: 'CA' + 'b'.repeat(32), ...overrides};
    const signature = twilio.getExpectedTwilioSignature(config.authToken, config.origin + '/twilio/voice', params);
    return fetch(base + '/twilio/voice', {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded',
      ...(signed ? {'X-Twilio-Signature': signature} : {})}, body: new URLSearchParams(params)});
  }
  async function start() {
    const response = await dial(); assert.equal(response.status, 200);
    const xml = await response.text();
    assert.ok(xml.indexOf('Please do not say') < xml.indexOf('<Connect>'));
    const ticket = /name="ticket" value="([a-f0-9]+)"/.exec(xml)[1];
    const phone = new WebSocket(base.replace('http:', 'ws:') + '/twilio/media', {headers: {
      'X-Twilio-Signature': twilio.getExpectedTwilioSignature(config.authToken, config.origin + '/twilio/media', {})}});
    await once(phone, 'open'); phone.on('message', raw => phoneEvents.push(JSON.parse(raw.toString())));
    phone.send(JSON.stringify({event: 'start', start: {streamSid: 'MZ-demo', accountSid: config.accountSid, callSid: 'CA' + 'b'.repeat(32),
      customParameters: {ticket}, mediaFormat: {encoding: 'audio/x-mulaw', sampleRate: 8000, channels: 1}}}));
    await wait(() => modelEvents.some(e => e.type === 'response.create'));
    return phone;
  }
  const emit = event => peer.send(JSON.stringify(event));
  async function draft() {
    emit({type: 'response.created', response: {id: 'greeting'}});
    emit({type: 'response.done', response: {id: 'greeting', status: 'completed', output: []}});
    emit({type: 'conversation.item.input_audio_transcription.completed', item_id: 'item-caller', transcript: 'I did not authorize this purchase.'});
    await wait(() => calls.some(c => c.action === 'transcript'));
    emit({type: 'response.created', response: {id: 'prepare'}});
    emit({type: 'response.done', response: {id: 'prepare', status: 'completed', output: [{type: 'function_call', name: 'prepare_intake',
      call_id: 'call-prepare', arguments: JSON.stringify({statement: 'I did not authorize this purchase.', reason: 'unauthorized'})}]}});
    await wait(() => calls.some(c => c.action === 'prepare'));
    emit({type: 'response.created', response: {id: 'readback'}});
    emit({type: 'response.output_audio_transcript.done', response_id: 'readback', transcript: 'I did not authorize this purchase. Press 1 to submit this report.'});
    emit({type: 'response.done', response: {id: 'readback', status: 'completed', output: []}});
    await wait(() => phoneEvents.some(e => e.event === 'mark'));
    return phoneEvents.find(e => e.event === 'mark').mark.name;
  }
  return {calls, modelEvents, phoneEvents, dial, start, emit, draft};
}

test('signed bridge accepts only allowlisted caller and number', async t => {
  const f = await fixture(t);
  assert.equal((await f.dial({}, false)).status, 403);
  assert.equal((await f.dial({From: '+15555550999'})).status, 403);
  assert.equal((await f.dial({To: '+15555550999'})).status, 403);
  assert.equal(f.calls.length, 0);
});

test('readback playback acknowledgement plus keypad are required; private capability never reaches model', async t => {
  const f = await fixture(t), phone = await f.start(), mark = await f.draft();
  phone.send(JSON.stringify({event: 'dtmf', dtmf: {digit: '1'}}));
  await new Promise(r => setTimeout(r, 30));
  assert.equal(f.calls.some(c => c.action === 'confirm'), false);
  phone.send(JSON.stringify({event: 'mark', mark: {name: mark}}));
  await wait(() => f.calls.some(c => c.action === 'played'));
  phone.send(JSON.stringify({event: 'dtmf', dtmf: {digit: '1'}}));
  await wait(() => f.calls.some(c => c.action === 'confirm'));
  assert.equal(f.calls.find(c => c.action === 'confirm').data.nonce, 'private-review-nonce');
  assert.doesNotMatch(JSON.stringify(f.modelEvents), /private-capability|private-review-nonce/);
  assert.equal(f.calls.filter(c => c.action === 'confirm').length, 1);
  phone.close();
});

test('interrupted readback cannot be acknowledged and hangup does not submit', async t => {
  const f = await fixture(t), phone = await f.start(), mark = await f.draft();
  f.emit({type: 'input_audio_buffer.speech_started'});
  await new Promise(r => setTimeout(r, 30));
  phone.send(JSON.stringify({event: 'mark', mark: {name: mark}}));
  phone.send(JSON.stringify({event: 'dtmf', dtmf: {digit: '1'}}));
  await new Promise(r => setTimeout(r, 30));
  assert.equal(f.calls.some(c => c.action === 'played' || c.action === 'confirm'), false);
  phone.close(); await wait(() => f.calls.some(c => c.action === 'end'));
});

test('readback matcher and model configuration expose no submission authority', () => {
  assert.equal(readbackMatches('Your report: I deny this charge. Press one to submit.', 'I deny this charge.'), true);
  assert.equal(readbackMatches('A different statement. Press 1 to submit.', 'I deny this charge.'), false);
  const session = realtimeSession(config, {transaction_id: 'T-204'});
  assert.deepEqual(session.tools.map(t => t.name), ['prepare_intake']);
  assert.equal(session.audio.input.turn_detection.create_response, false);
  assert.doesNotMatch(JSON.stringify(session), /test-key-only|test-token-only/);
});
