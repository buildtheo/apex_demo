# Apex Phone Intake

October 21, 2026. Theo authorized temporarily using the existing M. Price Twilio number. Transport, session binding and bank updates are implemented. Theo's first call reached the confirmation flow but failed because that practice run already contained a credited dispute. Duplicate prevention worked; the bridge incorrectly disconnected on rejection. That handling is corrected and regression-tested. A successful physical-call submission still needs Theo's rehearsal.

## Rehearse

1. Open http://localhost:8080. For a new rehearsal, use Restart demo on the Apex queue; keep the earlier completed proof cases untouched. Hang up before restarting.
2. Select the JCPenney purchase, report a problem and choose Talk to support. This arms a ten-minute synthetic selected-purchase session; keep the app open.
3. Dial the displayed number from the configured rehearsal phone. The number is shared temporarily, not a bank support number. Identity is simulated.
4. After the AI disclosure and no-secrets warning, explain: "I don't recognize this JCPenney purchase. I didn't make it or authorize anyone else to make it."
5. Answer useful clarification questions. Listen to the report readback. After it finishes, press 1 to submit, or press 2 / say what to correct. Spoken agreement alone cannot submit. No banking PIN is requested.
6. The computer's banking app shows the verified saved receipt for that same case. Hang up naturally, then continue Barbara's existing queue -> actual ChatGPT investigation -> Apex credit approval -> Martha's verified credit flow. Voice does not decide or post credit.

Calls are limited to five minutes and one active caller. A hangup, provider failure, stale session or incomplete confirmation does not create a new case. Refresh can resume the browser's linked session. After an ended unsubmitted call, prepare another call in the app. Do not arm competing browser tabs or call before selecting Talk to support.

A run allows only one dispute for the selected purchase, including an already credited dispute. Phone preparation and call claim now reject that situation before collecting a report. Use Restart demo in the queue for a new rehearsal; the application never silently resets financial history. If another channel saves a report during the call, the agent explains the duplicate rejection and stays connected for questions instead of claiming success or disconnecting. Unverified save results are explained as uncertain and must be checked before retrying. After a verified submission, follow-up conversation has no intake tools and the call stays open for the caller's answer.

## Architecture

Banking browser -> private DMS voice session -> signed Twilio webhook -> single-use stream ticket -> signed WSS media -> OpenAI Realtime PCMU audio. The model can only prepare_intake. The bridge saves screened ASR turns, binds the draft to the current revision/nonce, checks the exact readback transcript and Twilio completed-playback mark, then accepts keypad 1. A separately read saved case must match before success is announced. The browser polls the shared session and reveals the same case; the existing seven MCP tools remain unchanged.

Only the narrow adapter on loopback 8787 is tunneled. DMS 8080 and Responses 8788 stay private. The public routes are /mcp, /twilio/voice and /twilio/media, not operator approval or arbitrary backend proxying. Both Twilio signatures and the configured account/number/caller are checked. Caller number is routing context, not verified bank identity. This synthetic demo still uses simulated Barbara identity, not production OAuth.

## Routing and Restore

Run from the repository root:

```sh
npm run phone:configure
npm run phone:configure -- --apply
npm run phone:configure -- --restore
```

The first command reads current Twilio routing. Apply backs up the original voice URL/method once to ignored .local/twilio-routing-backup.json before changing anything. Restore reinstates that saved M. Price route. Both write modes read Twilio back afterward. The ignored .local/phone-runtime.json marker enables the banking call button only when the readback matches Apex. M. Price code and secrets are not copied or rewritten.

Private .env uses APEX_PHONE_ENABLED=1 and references the existing credential file through APEX_OPENAI_ENV_FILE. Selected Twilio/OpenAI credentials are read server-side; never paste them into docs, prompts or frontend code. Apex defaults to gpt-realtime-2.1 with cedar; APEX_REALTIME_MODEL and APEX_REALTIME_VOICE can override privately.

The temporary Cloudflare address is not durable. If invalidated, replace it, update APEX_MCP_ORIGIN locally, restart apex-mcp.service, reapply phone routing and update the actual ChatGPT custom MCP connection. Do not restart a healthy tunnel just because time passed. The Chromebook must remain awake and online. Services are transient user services, not a promise of persistence across machine reboot.

## Data and Proof Limits

The initial warning plays before streaming customer speech. Raw caller audio still reaches OpenAI through the bridge; screening ASR afterward is not upstream audio redaction. Use synthetic data only. Known sensitive transcript patterns fail closed before local persistence and downstream tool use; this is heuristic screening, not complete DLP. No audio recording is created by the application. E-001 explicitly identifies the saved account as a customer-confirmed speech-to-text transcript, not original audio.

Automated transport tests use mocked Realtime/Twilio events, and browser tests use an isolated database. A live OpenAI session.updated confirms accepted configuration only, not conversation quality. Physical call, interruption/noise behavior and model-output evaluations remain pending. Quiet calls may stay connected until the five-minute cap after Restart; further session operations fail the stale-run checks. Neither channel establishes real customer identity, processor contact or actual money movement.
