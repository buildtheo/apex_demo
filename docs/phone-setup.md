# Apex Phone Intake

October 21, 2026. Theo authorized temporarily using the existing M. Price Twilio number. Transport, session binding and bank updates are implemented. Theo's first call reached the confirmation flow but failed because that practice run already contained a credited dispute. Duplicate prevention worked; the bridge incorrectly disconnected on rejection. That handling is corrected and regression-tested. A successful physical-call submission still needs Theo's rehearsal.

## Rehearse

1. Open http://localhost:8080. For a new rehearsal, use Restart demo on the Apex queue; keep the earlier completed proof cases untouched. Hang up before restarting.
2. Select the JCPenney purchase, report a problem and choose Talk to support. This arms a ten-minute synthetic selected-purchase session; keep the app open.
3. Dial the displayed number from the configured rehearsal phone. The number is shared temporarily, not a bank support number. After the disclosure/warning, the IVR recognizes the registered demo caller as Martha and asks for the four-digit demo support code. Enter the same private code used for M. Price on the keypad; never speak it or use a card PIN. Three failures lock the bridge's check for fifteen minutes. Identity remains simulated.
4. After the server-side support check passes, Realtime connects and asks for the purchase amount. Say: "I want to dispute a transaction for $648.50." The agent should confirm JCPenney and ask why. Say: "I didn't make or authorize that purchase." If you already supplied the reason, it should not ask again. A different or unclear amount needs clarification, not an assumed match.
5. Listen to the one-sentence report readback. After it finishes, press 1 to submit, or press 2 / say what to correct. Spoken agreement alone cannot submit. No banking PIN is requested. The agent confirms verified receipt, asks if anything else is needed and waits. This is quick intake, not the centerpiece of the demo.
6. The computer's banking app shows the verified saved receipt for that same case. Hang up naturally, then continue Barbara's existing queue -> actual ChatGPT investigation -> Apex credit approval -> Martha's verified credit flow. Voice does not decide or post credit.

Calls are limited to five minutes and one active caller. A hangup, provider failure, stale session or incomplete confirmation does not create a new case. Refresh can resume the browser's linked session. After an ended unsubmitted call, prepare another call in the app. Do not arm competing browser tabs or call before selecting Talk to support.

A run allows only one dispute for the selected purchase, including an already credited dispute. Phone preparation and call claim now reject that situation before collecting a report. Use Restart demo in the queue for a new rehearsal; the application never silently resets financial history. If another channel saves a report during the call, the agent explains the duplicate rejection and stays connected for questions instead of claiming success or disconnecting. Unverified save results are explained as uncertain and must be checked before retrying. After a verified submission, follow-up conversation has no intake tools and the call stays open for the caller's answer.

On October 22 Theo chose the existing M. Price pattern: signed allowlisted caller plus a configured four-digit synthetic support code, not app approval or a new one-time code. The code check is enforced outside the model through signed /twilio/verify callbacks and a private bridge attestation. Raw code digits never enter application case records, model messages or ordinary app logs. Twilio still processes the keypad input; no provider-retention claim is made. The bridge requires matching call/account/number/caller, ninety-second challenge expiry, three failed entries and a fifteen-minute lockout across calls. Those attempt/lockout counters are process-memory only and reset on bridge restart, not production identity infrastructure. After success, callbacks cannot issue another stream ticket. The private DMS rejects transcript, draft and submission operations until the support check passes. Caller name, amount and submit key still do not independently authenticate identity. Actual phone behavior needs rehearsal.

## Architecture

Banking browser -> private DMS voice session -> signed Twilio webhook -> keypad-only support check -> private result attestation -> single-use stream ticket -> signed WSS media -> OpenAI Realtime PCMU audio. There is no OpenAI connection during code entry, and no verification tool is exposed to the model. The model can only prepare_intake. The bridge saves screened ASR turns, binds the draft to the current revision/nonce, checks the exact readback transcript and Twilio completed-playback mark, then accepts keypad 1. A separately read saved case must match before success is announced. The browser polls the shared session and reveals the same case; the existing seven MCP tools remain unchanged.

Only the narrow adapter on loopback 8787 is tunneled. DMS 8080 and Responses 8788 stay private. The public routes are /mcp, /twilio/voice, /twilio/verify and /twilio/media, not operator approval or arbitrary backend proxying. Both Twilio signatures and the configured account/number/caller are checked. Caller number is routing context, not verified bank identity. This synthetic demo still uses simulated Barbara identity, not production OAuth.

## Routing and Restore

Run from the repository root:

```sh
npm run phone:configure
npm run phone:configure -- --apply
npm run phone:configure -- --restore
```

The first command reads current Twilio routing. Apply backs up the original voice URL/method once to ignored .local/twilio-routing-backup.json before changing anything. Restore reinstates that saved M. Price route. Both write modes read Twilio back afterward. The ignored .local/phone-runtime.json marker enables the banking call button only when the readback matches Apex. M. Price code and secrets are not copied or rewritten.

Private .env uses APEX_PHONE_ENABLED=1 and references the existing credential file through APEX_OPENAI_ENV_FILE. Selected Twilio/OpenAI credentials are read server-side; never paste them into docs, prompts or frontend code. Apex defaults to gpt-realtime-2.1 with cedar; APEX_REALTIME_MODEL and APEX_REALTIME_VOICE can override privately.

The support code is referenced privately from DRIVER_SOFT_PIN in that file; APEX_SUPPORT_CODE can override it locally. No code value is hardcoded into the repo, shown in the banking app or sent to Realtime. This deliberately reuses a synthetic rehearsal code, not a customer's real bank PIN.

The temporary Cloudflare address is not durable. If invalidated, replace it, update APEX_MCP_ORIGIN locally, restart apex-mcp.service, reapply phone routing and update the actual ChatGPT custom MCP connection. Do not restart a healthy tunnel just because time passed. The Chromebook must remain awake and online. Services are transient user services, not a promise of persistence across machine reboot.

## Data and Proof Limits

The initial warning plays before streaming customer speech. Raw caller audio still reaches OpenAI through the bridge; screening ASR afterward is not upstream audio redaction. Use synthetic data only. Known sensitive transcript patterns fail closed before local persistence and downstream tool use; this is heuristic screening, not complete DLP. No audio recording is created by the application. E-001 explicitly identifies the saved account as a customer-confirmed speech-to-text transcript, not original audio.

Automated transport tests use mocked Realtime/Twilio events, and browser tests use an isolated database. A live OpenAI session.updated confirms accepted configuration only, not conversation quality. Physical call, interruption/noise behavior and model-output evaluations remain pending. Quiet calls may stay connected until the five-minute cap after Restart; further session operations fail the stale-run checks. Neither channel establishes real customer identity, processor contact or actual money movement.
