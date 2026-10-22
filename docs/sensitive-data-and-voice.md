# Sensitive card data and voice intake boundary

Locked by Theo October 20, 2026; updated October 21 for implemented synthetic phone intake. Read phone-setup.md for deployed behavior and current-state.md for proof. Historical baseline observations below are explicitly pre-implementation, not current capability claims.

## Demo support verification - October 22

Theo chose the M. Price pattern: signed allowlisted caller plus the existing private four-digit synthetic support code. This code is not a card PIN, SSN or bank credential. Twilio collects it with keypad-only Gather at signed /twilio/verify, before a Realtime connection exists. The bridge validates call/account/number/caller, expiry and the code outside the model. Only a success result and minimal selected transaction context are released; the code itself is not sent to OpenAI, saved in a case or logged by the application. Twilio necessarily processes the digits, and its retention/debugger controls have not been audited here.

The private case service rejects voice transcript, draft, playback and submission operations before the bridge's support-check attestation. Three failed attempts across calls trigger a fifteen-minute process-memory lock; restarting the bridge clears those counters. This is bounded synthetic-demo enforcement, not production customer authentication, resistant MFA or a provider-retention guarantee. Do not ask the customer to speak the code or a banking PIN. Keypad 1 after readback remains a separate submission-consent step, not the identity check. Signed-callback/replay/denied-code/backend-gate tests pass; a successful physical phone rehearsal of this updated flow remains pending.

## Implemented text-boundary update - October 20

Confirmed text intake now screens messages before persistence/provider handoff and reconstructs an allowlisted Responses payload with fixed selected transaction and permitted user/assistant turns, not the full case or customer profile. Known card-like numbers, labeled secrets and long English spelled-digit sequences are blocked; tests assert provider fetch is not called. Model outputs are validated/screened before a review can be confirmed. User corrections and original statements remain attributed in E-001. The browser check used only synthetic data. This is conservative heuristic screening, not complete DLP; other encodings/languages, documents/images and raw audio are not covered. No zero-retention or production-compliance claim follows from store:false. Current proof and setup: current-state.md and intake-setup.md. The baseline below records the pre-implementation inspection, not current text-intake status.

## Implemented phone boundary - October 21

Signed Twilio webhook/media, caller allowlist, single-use stream ticket, private selected-purchase capability, screened ASR persistence, current-draft binding, checked exact readback and completed-playback mark, keypad consent, correction, hangup rejection and separately verified shared case are implemented. Model instructions never grant submission authority: only the transport can accept keypad 1 after readback. Keypad 1 is consent, not a PIN or authentication. The opening warning plays before the customer media stream. No application audio recording is created. E-001 labels saved ASR text as speech-to-text, not original audio.

Deterministic backend/transport tests and isolated browser/session/MCP integration pass; OpenAI accepted the Realtime session configuration. Physical phone audio and actual conversational compliance remain unverified. Known sensitive transcript patterns stop further tool/persistence work, but raw audio has already reached OpenAI. There is no upstream audio-redaction gate or implemented human transfer; a blocked flow ends instead. Use only synthetic speech. No production PAN-exclusion, complete DLP, external identity, retention or compliance claim is justified.

## Baseline inspected before implementation

Code inspected at commit 836c3a562dbfbe1ef69d25e4dd2d6a198a95a5ed:
- The synthetic case and banking preview contain card last-four 8821, not a full PAN field.
- Case APX-001, transaction T-204, evidence IDs and AUTH-77 are synthetic references. AUTH-77 is an evidence-record identifier, not an authentication credential.
- The customer name, transaction details and statements are still sensitive categories in a real workflow; “not PAN” does not mean nonsensitive.
- The current banking textarea accepts arbitrary text and saves it in browser localStorage without PAN detection. Seeded records lacking PAN do not prove that accidental input is blocked.
- No OpenAI model/API/MCP or Realtime connection exists, so no model payload or PAN-filtering integration has been executed.
- No existing local workflow test establishes PAN redaction, voice interception, provider-side handling or production privacy compliance.

## Minimum intended model context

| Data | Example / rule |
| --- | --- |
| Case and transaction reference | APX-001 and T-204; select the charge through the banking session rather than ask the customer for its full card number |
| Relevant transaction metadata | Merchant, amount, date and needed purchase/channel details |
| Card display reference | Last-four 8821 only if needed to distinguish the selected card |
| Evidence references and version | E-001 etc., AUTH-77 and the evidence snapshot |
| Relevant statements and excerpts | Only scoped, approved content, screened before transmission |
| Customer identity | Opaque case/customer reference where sufficient; do not automatically include the full name merely because the current fixture contains it |
| Excluded secrets | Full PAN, CVV/CVC/security code, PIN, password and unrelated account data; no retrieval tool for these fields is required by this workflow |

Apex constructs and validates an allowlisted model-facing payload instead of serializing the full DMS record. IDs do not grant authorization. Case access, source release and action authority remain bank-side controls.

## Required voice opening

If the voice branch is used, the assistant must say this at the start, before inviting the customer's explanation:

“Please do not say your full card number, card security code—CVV or CVC—PIN, or password. I will never ask for those details in this conversation. We can work from the transaction you've selected.”

Theo explicitly requested the no-card-number/no-security-code instruction; the wording above makes the full-PAN versus last-four distinction clear and confines “never needed” to this selected-transaction workflow. CVV/CVC refers to the security code the user called CVN. No full PAN or security code is needed for the agent's investigation/intake task.

Behavior requirements:
- Never request those secrets for identification, troubleshooting or confirmation. Do not ask the customer to repeat them.
- If the customer starts volunteering them, interrupt where technically possible and remind them that they are not needed. Do not repeat, read back, quote or put them in case summaries or tool arguments.
- Use a brief reminder such as: “Please stop there—your full card number and security code aren't needed. Let's continue with the selected transaction.”
- Use the permitted transaction reference/last-four supplied by the bank; do not infer or reconstruct a full card number.
- If safe continuation cannot be established, stop the AI flow and route to the approved human/secure channel. That channel and handoff remain to be defined, not an existing implemented service.

The spoken warning and model instructions are supplementary controls. They cannot guarantee that the customer never volunteers a number or that it was never transmitted.

## Before model transmission

For text, source excerpts and tool results, Apex must screen permitted content before it leaves the bank-controlled boundary. Remove unnecessary fields; redact or block suspected sensitive card data. If a payload cannot be safely cleared, do not send it or execute dependent actions.

Screen free-text input and retrieved evidence as well as structured fields. Documents/images require an approved extraction/redaction route; do not send an unscreened original PDF/image merely because the JSON schema omits a PAN field. Keep ordinary logs, traces, generated briefs and downstream tools free of raw secrets.

Pattern/checksum checks can help detect PAN-like strings, but do not establish complete detection, especially for formatted or spelled-out numbers and images/audio. Choose and evaluate the detector, handling of uncertain matches and false positives. Do not claim an unbuilt filter is a complete data-loss-prevention system.

## Direct Realtime voice limitation

The implemented phone branch uses Twilio media streams through the Apex bridge to OpenAI Realtime WebSockets. Caller audio reaches OpenAI before its transcript can be screened; masking the resulting transcript afterward does not prevent receipt of a spoken PAN. The earlier WebRTC candidate is not the deployed phone transport.

A strict requirement that PAN never reach the model provider requires an upstream audio-control design that is itself validated. Transcribing raw audio with an external provider first does not establish that no provider received it. Alternatively, review and explicitly approve the voice processing boundary and incident/retention controls. Neither decision is established here.

For the synthetic interview demonstration, keep all spoken data synthetic and do not represent the opening warning or transcript masking as proof of a production PAN-exclusion boundary. Discovery still selects voice or text; this requirement does not approve a live voice release or change the selected two product surfaces.

## If sensitive card data has already crossed the boundary

Do not assume the model automatically redacts, refuses or forgets it. Model instructions not to echo it support containment; they do not undo receipt.

On detection, stop further processing/tool actions as appropriate, prevent propagation into outputs and ordinary logs, and route for restricted incident review. Determine which services, conversation state, traces or stores received it and apply the applicable access, deletion and retention procedures. Do not put the raw value into a broadly accessible incident log. A sanitized new request/session does not erase a previous exposure.

API nontraining defaults are separate from storage/retention. Verify actual API and ChatGPT workspace controls separately; do not promise zero retention, instant erasure or automatic compliance.

## Required future verification

Use only synthetic/nonproduction test data:
- PAN-like input in the typed narrative, evidence/tool text and supported document formats; spacing, separators and uncertain cases.
- Assert the actual provider-bound payload is blocked or sanitized, not merely that the UI displays masked text.
- Verify summaries, tool arguments, logs and error paths do not propagate secrets; confirm required transaction/evidence references remain useful.
- Verify the voice opening occurs before collecting the narrative, never requests the secrets, handles volunteered digits without repeating them and follows the defined fallback.
- Record raw-audio exposure separately from transcript/output masking. A warning-only voice test cannot pass a “never sent to provider” gate.
- Test post-transmission containment and access to incident records. Preserve observed results and remaining limitations; no test above has yet passed.

## Source grounding

- Current code: server.py, web/banking.html and web/banking.js, inspected at the commit above.
- [OpenAI Realtime WebRTC](https://developers.openai.com/api/docs/guides/voice-webrtc): direct media connection and microphone track behavior checked October 20.
- [OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data): nontraining, abuse-monitoring and application-state retention are distinct; checked October 20. Actual entitlement/configuration and ChatGPT retention remain separate.

The future-verification list includes unfulfilled production/privacy requirements. Passing synthetic transport and text-screen tests does not satisfy an upstream audio-redaction gate or establish production compliance.
