import {randomBytes} from 'node:crypto';
import twilio from 'twilio';
import WebSocket, {WebSocketServer} from 'ws';
import {apexVoiceInstructions} from './voice-profile.mjs';

export const warning = 'You have reached Apex banking support, an AI assisted synthetic demonstration. Please do not say your full card number, card security code, PIN, or password. We will never ask for those details.';
const normalize = text => String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
export function readbackMatches(transcript, statement) {
  return normalize(statement).length > 3 && normalize(transcript).includes(normalize(statement))
    && /press\s+(?:1|one)\b/i.test(transcript) && /submit/i.test(transcript);
}
const tools = [{type: 'function', name: 'prepare_intake', description: 'Prepare the customer account for read-back, not submission. The phone bridge alone handles keypad confirmation after playback.',
  parameters: {type: 'object', additionalProperties: false, properties: {statement: {type: 'string', minLength: 5, maxLength: 1000},
    reason: {type: 'string', enum: ['unauthorized', 'duplicate', 'amount', 'goods']}}, required: ['statement', 'reason']}}];

export function realtimeSession(config, transaction) {
  return {type: 'realtime', model: config.model,
    instructions: apexVoiceInstructions + '\nTrusted selected synthetic transaction: ' + JSON.stringify(transaction)
      + '\nThe fixed AI disclosure and no-secrets warning played before this stream. There is no model submission tool. Prepare a report using prepare_intake once the caller amount matches and their reason is clear; do not over-interview. The bridge controls exact readback and phone-keypad submission. Keep the statement to one sentence, at most 30 words. Never request a PIN; pressing 1 is consent, not identity verification.',
    tools, tool_choice: 'auto', max_output_tokens: 600,
    audio: {input: {format: {type: 'audio/pcmu'}, transcription: {model: 'gpt-4o-mini-transcribe'},
      turn_detection: {type: 'semantic_vad', eagerness: 'medium', create_response: false, interrupt_response: true}},
      output: {format: {type: 'audio/pcmu'}, voice: config.voice}}};
}

// M. Price transport pattern, isolated from its driver tools, store and phone routing.
export function attachPhone(server, {config, backend, connectModel}) {
  let slot;
  const tickets = new Map(), sockets = new Set();
  const timers = new Set();
  const schedule = (fn, ms) => {const timer = setTimeout(() => {timers.delete(timer); fn();}, ms); timers.add(timer); timer.unref(); return timer;};
  const connect = connectModel || (() => new WebSocket(`wss://api.openai.com/v1/realtime?model=${encodeURIComponent(config.model)}`,
    {headers: {Authorization: `Bearer ${config.apiKey}`}, handshakeTimeout: 15000, maxPayload: 2 * 1024 * 1024}));
  function signed(req, path, params, websocket = false) {
    const signature = req.headers['x-twilio-signature'];
    return typeof signature === 'string' && [config.origin + path, ...(websocket ? [config.origin.replace('https:', 'wss:') + path] : [])]
      .some(url => twilio.validateRequest(config.authToken, signature, url, params));
  }
  async function handle(req, res) {
    if (req.method !== 'POST' || req.url !== '/twilio/voice') {res.writeHead(404).end(); return;}
    try {
      let body = '';
      for await (const chunk of req) {body += chunk; if (Buffer.byteLength(body) > 16384) {res.writeHead(413).end(); return;}}
      const form = new URLSearchParams(body), params = Object.fromEntries(form);
      if (new Set(form.keys()).size !== [...form.keys()].length || !signed(req, req.url, params)
          || params.AccountSid !== config.accountSid || params.To !== config.number || params.From !== config.caller
          || !/^CA[a-fA-F0-9]{32}$/.test(params.CallSid || '')) {res.writeHead(403).end(); return;}
      const xml = new twilio.twiml.VoiceResponse();
      if (slot) {xml.say('The demonstration line is busy. Please try again.'); xml.hangup();}
      else {
        const owned = {callSid: params.CallSid}; slot = owned;
        try {
          const session = await backend('claim', {call_sid: params.CallSid});
          const ticket = randomBytes(32).toString('hex');
          tickets.set(ticket, {session, slot: owned});
          schedule(() => {if (tickets.delete(ticket)) {if (slot === owned) slot = undefined; void backend('end', {}, session).catch(() => {});}}, 60000);
          xml.say(warning);
          xml.connect().stream({url: config.origin.replace('https:', 'wss:') + '/twilio/media'}).parameter({name: 'ticket', value: ticket});
          xml.hangup();
        } catch (error) {
          if (slot === owned) slot = undefined;
          xml.say(error.code === 'duplicate_dispute'
            ? 'This demo already has a report for the selected purchase. No new report was created. For another rehearsal, use Restart demo on the Apex case queue, then select Talk to support and call again.'
            : 'Please select Talk to support in the Apex demo app, then call again.');
          xml.hangup();
        }
      }
      res.writeHead(200, {'Content-Type': 'text/xml', 'Cache-Control': 'no-store'}).end(xml.toString());
    } catch {if (!res.headersSent) res.writeHead(400); res.end();}
  }
  const wss = new WebSocketServer({noServer: true, maxPayload: 65536});
  server.on('upgrade', (req, socket, head) => {
    if (req.url !== '/twilio/media' || !signed(req, '/twilio/media', {}, true)) {socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); return;}
    wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws));
  });
  wss.on('connection', phone => {
    sockets.add(phone);
    let session, owned, model, streamSid, ready = false, ended = false, work = Promise.resolve();
    let revision = 0, review, mark, played = false, pendingReadback = false, readbackId, outputText = '';
    let intakeClosed = false;
    let latestTimestamp = 0, audioStart = 0, audioBytes = 0, itemId, responseActive = false, pendingUser = false, userSpeaking = false, readbackAttempts = 0;
    const buffered = [], processed = new Set();
    const sendModel = data => {if (model?.readyState === WebSocket.OPEN) model.send(JSON.stringify(data));};
    const sendPhone = data => {if (phone.readyState === WebSocket.OPEN) phone.send(JSON.stringify(data));};
    const call = (action, data = {}) => backend(action, data, session);
    const queue = fn => {work = work.then(() => ended ? undefined : fn()).catch(() => end());};
    const startup = schedule(() => end(), 25000), duration = schedule(() => end(), 300000);
    function end() {
      if (ended) return; ended = true; clearTimeout(startup); clearTimeout(duration);
      if (owned && slot === owned) slot = undefined;
      if (session) void call('end').catch(() => {});
      model?.close(); phone.close(); sockets.delete(phone);
      schedule(() => {model?.terminate(); phone.terminate();}, 1000);
    }
    function respond() {sendModel({type: 'response.create', ...(intakeClosed ? {response: {tools: [], tool_choice: 'none'}} : {})});}
    function speak(instructions) {sendModel({type: 'response.create', response: {instructions, tools: [], tool_choice: 'none'}});}
    function readBack() {
      if (++readbackAttempts > 2) {end(); return;}
      pendingReadback = true; played = false; mark = undefined;
      sendModel({type: 'response.create', response: {tool_choice: 'none',
        instructions: `Read this exactly, then stop and wait for the phone keypad: "${review.statement} Press 1 to submit this report, or 2 to correct it." Do not add an introduction, paraphrase the statement or claim submission.`}});
    }
    async function handleModel(event) {
      if (event.type === 'session.updated' && !ready) {
        ready = true; clearTimeout(startup);
        for (const audio of buffered) sendModel({type: 'input_audio_buffer.append', audio}); buffered.length = 0;
        speak('The telephone greeting and no-secrets warning have already played. Do not repeat them. Ask only: What purchase amount are you calling about? Do not volunteer the merchant, amount or suspected problem. Wait for the caller.');
      } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
        if (!event.transcript?.trim()) return;
        const saved = await call('transcript', {item_id: event.item_id, text: event.transcript});
        revision = saved.revision;
        if (!saved.submitted) {review = undefined; played = false; mark = undefined;}
        userSpeaking = false;
        if (responseActive) pendingUser = true;
        else respond();
      } else if (event.type === 'conversation.item.input_audio_transcription.failed') end();
      else if (event.type === 'response.created') {
        responseActive = true;
        if (pendingReadback) {readbackId = event.response.id; pendingReadback = false; outputText = '';}
      } else if (event.type === 'response.output_audio_transcript.delta' && event.response_id === readbackId) outputText += event.delta || '';
      else if (event.type === 'response.output_audio_transcript.done' && event.response_id === readbackId) outputText = event.transcript || outputText;
      else if (event.type === 'response.done') {
        responseActive = false;
        if (event.response?.status === 'failed') {end(); return;}
        if (pendingUser) {pendingUser = false; readbackId = undefined; respond(); return;}
        if (event.response?.id === readbackId) {
          readbackId = undefined;
          if (event.response.status === 'completed' && review && readbackMatches(outputText, review.statement)) {
            mark = randomBytes(12).toString('hex'); sendPhone({event: 'mark', streamSid, mark: {name: mark}});
          } else if (event.response.status === 'completed' && review && !userSpeaking) readBack();
          return;
        }
        const calls = (event.response?.output || []).filter(item => item.type === 'function_call');
        if (calls.length > 1) {end(); return;}
        for (const item of calls) {
          if (processed.has(item.call_id)) return;
          processed.add(item.call_id);
          if (intakeClosed || item.name !== 'prepare_intake' || typeof item.arguments !== 'string' || item.arguments.length > 4000) {end(); return;}
          const args = JSON.parse(item.arguments);
          try {
            const prepared = await call('prepare', {revision, statement: args.statement, reason: args.reason});
            review = {...prepared.review, revision: prepared.revision};
            readbackAttempts = 0;
            sendModel({type: 'conversation.item.create', item: {type: 'function_call_output', call_id: item.call_id,
              output: JSON.stringify({draft_prepared: true, statement: review.statement, submission: 'requires phone-keypad confirmation after readback'})}});
            readBack();
          } catch (error) {
            if (error.code !== 'stale_intake' && error.code !== 'clarification_required') throw error;
            sendModel({type: 'conversation.item.create', item: {type: 'function_call_output', call_id: item.call_id,
              output: JSON.stringify({draft_prepared: false, reason: 'Wait for the current customer transcript or clarify the account before preparing again.'})}});
            speak('Briefly clarify the customer account if needed. No report has been submitted.');
          }
        }
      } else if (event.type === 'error') end();
    }
    phone.on('message', raw => {
      try {
        const event = JSON.parse(raw.toString());
        if (event.event === 'start') queue(async () => {
          if (session) {end(); return;}
          const start = event.start, ticket = tickets.get(start?.customParameters?.ticket);
          if (!ticket || ticket.slot !== slot || ticket.slot.callSid !== start.callSid || start.accountSid !== config.accountSid
              || start.mediaFormat?.encoding !== 'audio/x-mulaw' || start.mediaFormat?.sampleRate !== 8000 || start.mediaFormat?.channels !== 1) {end(); return;}
          tickets.delete(start.customParameters.ticket); session = ticket.session; owned = ticket.slot; revision = session.revision;
          streamSid = start.streamSid; if (typeof streamSid !== 'string' || !streamSid) {end(); return;}
          model = connect();
          model.on('error', end); model.on('close', end);
          model.on('open', () => sendModel({type: 'session.update', session: realtimeSession(config, session.transaction)}));
          model.on('message', rawModel => {
            try {
              const e = JSON.parse(rawModel.toString());
              if (ended) return;
              if (e.type === 'response.output_audio.delta') {
                if (typeof e.delta !== 'string' || typeof e.item_id !== 'string') return;
                if (itemId !== e.item_id) {itemId = e.item_id; audioStart = latestTimestamp; audioBytes = 0;}
                audioBytes += Buffer.from(e.delta, 'base64').length;
                sendPhone({event: 'media', streamSid, media: {payload: e.delta}});
              } else if (e.type === 'input_audio_buffer.speech_started') {
                userSpeaking = true;
                played = false; mark = undefined;
                if (itemId) {
                  sendPhone({event: 'clear', streamSid});
                  sendModel({type: 'conversation.item.truncate', item_id: itemId, content_index: 0,
                    audio_end_ms: Math.max(0, Math.min(Math.floor(audioBytes / 8), latestTimestamp - audioStart))});
                  itemId = undefined;
                }
              } else queue(() => handleModel(e));
            } catch {end();}
          });
        });
        else if (event.event === 'media' && session) {
          const payload = event.media?.payload;
          if (typeof payload !== 'string' || payload.length > 32000 || !/^[A-Za-z0-9+/]+=*$/.test(payload)) {end(); return;}
          latestTimestamp = Number(event.media.timestamp);
          if (!Number.isFinite(latestTimestamp) || latestTimestamp < 0) {end(); return;}
          if (ready) sendModel({type: 'input_audio_buffer.append', audio: payload});
          else if (buffered.length < 500) buffered.push(payload); else end();
        } else if (event.event === 'mark') queue(async () => {
          if (mark && event.mark?.name === mark && review) {
            await call('played', {revision: review.revision, nonce: review.nonce}); played = true; mark = undefined;
          }
        });
        else if (event.event === 'dtmf') queue(async () => {
          if (!session || !review || responseActive) return;
          if (event.dtmf?.digit === '2') {await call('correct'); review = undefined; played = false; speak('Ask what the customer wants to correct. No report has been submitted.');}
          else if (event.dtmf?.digit === '1' && played) {
            try {
              const receipt = await call('confirm', {revision: review.revision, nonce: review.nonce, digit: '1'});
              if (receipt.verified_saved_case !== true) throw Error('Submission not verified');
            } catch (error) {
              const expected = new Set(['duplicate_dispute', 'stale_confirmation', 'keypad_confirmation_required']);
              console.warn(JSON.stringify({event: 'apex_phone_submission_rejected', reason: expected.has(error.code) ? error.code : 'unverified_result'}));
              review = undefined; played = false; mark = undefined;
              if (error.code === 'stale_confirmation' || error.code === 'keypad_confirmation_required') {
                speak('The report changed before confirmation. Say no new report has been confirmed. Ask the customer to clarify their account so a fresh readback can be prepared, then wait.');
              } else {
                intakeClosed = true;
                speak(error.code === 'duplicate_dispute'
                  ? 'Trusted application result: a report for this purchase already exists in this demo run. No new report was created. Explain that plainly; do not claim this call submitted it. For a new rehearsal, the presenter can use Restart demo on the Apex queue after hanging up. Ask if they have another question and wait; do not end the call.'
                  : 'The application could not verify this submission. Tell the customer you cannot confirm whether it was received and to check the app before trying again. Do not claim success or failure, create another report, promise a credit or end the call. Ask if they need clarification, then wait.');
              }
              return;
            }
            intakeClosed = true;
            review = undefined; played = false;
            speak('Trusted saved-case verification succeeded. Say briefly: Your dispute has been submitted to our review team. Is there anything else I can help with? Then wait for the answer. Do not claim a decision or credit.');
          }
        });
        else if (event.event === 'stop') end();
      } catch {end();}
    });
    phone.on('close', end); phone.on('error', end);
  });
  return {handle, close: async () => {for (const timer of timers) clearTimeout(timer); for (const socket of sockets) socket.terminate(); wss.close();}};
}
