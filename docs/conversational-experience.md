# Simple Story, Inspectable Depth

October 21 direction from Theo. This is the presentation/interaction contract, not a claim that the remaining polish or voice integration has shipped.

Current superseding implementation: Barbara enters Apex only at the initial queue and to approve credit. Bounded investigation requests execute from ChatGPT without separate business approval. Read [barbara-workflow.md](barbara-workflow.md) for the deployed tools, explicit simulated later-arrival steps and copy/open handoff; [restart-demo.md](restart-demo.md) covers repeatable practice. Actual account-side rehearsal of the new flow remains pending.

## One Story

Martha reports a purchase she does not recognize. Barbara investigates in ChatGPT, asks for the missing evidence, reviews the recommendation and approves a supported credit in Apex. Martha sees the verified result in her banking app.

Lead with the purchase and the people. References, evidence versions, payloads and policy identifiers remain available in details. Sources and the exact action being approved must stay inspectable, not hidden to make the demo look smoother.

## Barbara's Conversation

Use one actual ChatGPT conversation for the returned case. These are suggested natural requests, not scripted model outputs:

- "Review Martha's case, [returned case reference]. What doesn't add up? Keep it brief and show me the sources."
- "Check whether that authentication record belongs to this purchase."
- After the explicit simulated later arrival: "The lookup is back. What did we learn?"
- "Ask the processor for evidence for this purchase and an explanation of the wrong reference. Keep the original record."
- After the explicit simulated later arrival: "Review the new response. What changed, and what do you recommend?"
- "Prepare the credit recommendation for my review, with the evidence and a neutral summary for Martha. Don't approve or post it."
- After Barbara's explicit approval: "Verify what was actually saved and posted."

Suggested conversation-level style instruction: "Work with me as a dispute analyst. Give me a short finding, why it matters, linked sources, and the next useful step. Use plain language. Distinguish customer claims, records and uncertainty. Keep IDs and snapshots secondary. Don't repeat a full report at every turn or claim a proposed action has happened."

This guides style, not authority or truth. The live model must still retrieve current sources and perform the requested allowed tools. No canned findings, fake ChatGPT view or model-based substitute for approval.

## Keep the Transitions Purposeful

The current technical proof has too much ceremony to call presentation-smooth. Tool refreshes, restaging, copied IDs, repeated evidence inventories and long snapshot tables were setup/debugging, not the intended analyst workflow.

Stay in ChatGPT to investigate, inspect sources and request more evidence. Barbara visits Apex at queue pickup and exact credit approval only. Bounded internal lookup and processor follow-up need no separate business approval; they retain case/source/snapshot/scope/idempotency/audit checks. Credit review should answer: what are we doing, why, and what happens next? ChatGPT's host write permission is separate from Barbara's business approval and may still appear.

Demonstrate external waiting honestly: "Later, the response arrives." Do not suggest the processor answered during the call or that the model removes elapsed external waiting. The local later-response controls are explicit simulations. End in Martha's app only after saved ledger/case verification, not a model's success sentence.

Depth on demand: source excerpts/origin/arrival, evidence correction lineage, current-version checks, exact-action approval, duplicate-post protection and ledger/case read-back. PDFs remain pending; existing excerpts must not be described as retrieved original PDFs.

## Voice Alternative: Reuse Transport, Change the Job

Theo requested reuse of M. Price's Twilio hooks. Inspected implementation: `../hero-sentinel/lib/phone-bridge.ts`, `scripts/phone-bridge.ts`, `scripts/phone-env.ts`, `scripts/configure-twilio.ts` and `lib/voice.ts`.

Reuse the signed Twilio webhook and WebSocket validation, short-lived single-use stream ticket, allowlisted rehearsal caller, PCMU media bridge, interruption handling, bounded call duration and server-held OpenAI credentials. Build an Apex-owned adapter, not cross-repository imports of the driver domain/store. Do not modify the working M. Price app, number routing or webhook as a side effect.

The domain profile is `adapter/voice-profile.mjs`. It collects Martha's account, asks useful clarifications, reads back the draft, waits for explicit confirmation, submits through the shared intake service and verifies the saved case. It must not contain Daryl/route recovery tools, code values or credit/analyst execution tools.

Intended connection: selected purchase in banking app -> local linked synthetic session -> signed call -> Realtime conversation -> screened draft/read-back -> explicit customer confirmation bound to the latest revision/nonce -> same Apex case/queue -> Barbara's existing ChatGPT investigation. The public phone bridge must expose only webhook/media endpoints, not the DMS, Responses worker or operator approvals. Browser status refresh must reveal the same saved case without copying a reference or creating a second dispute.

October 22 superseding choice: Theo explicitly requested M. Price-style verification. Apex now matches the signed registered caller and collects the existing four-digit synthetic support code through Twilio keypad-only IVR before connecting Realtime. The private bridge checks it and attests only the result to the DMS; unverified intake operations are rejected. Do not import driver recovery authority or expose code digits to the model, case records or ordinary app logs. This is a simulated support check, not verified production bank identity. Never ask for a banking PIN, full card number, CVV/CVC or password. Raw conversational audio after the check reaches the provider; warnings and transcript screening do not prove upstream audio redaction.

Current increment: Apex phone transport, shared intake linkage, bank voice activation, draft/correction and keypad-consent controls are implemented and tested. Theo explicitly authorized temporarily routing the existing number to Apex; its M. Price route is backed up privately with a restore command. No driver-domain tools or PIN recovery flow were imported. Read phone-setup.md. The model prepares a draft; exact readback, Twilio playback acknowledgement and keypad 1 are required for submission, while keypad 2 permits correction. OpenAI accepted the actual session configuration. Backend, mock transport and isolated browser/MCP tests pass, but a physical phone call and actual model-conversation quality remain pending. Do not describe the phone branch as user-proven before that rehearsal.

Official API grounding checked October 21: [Realtime WebSockets](https://developers.openai.com/api/docs/guides/voice-websockets) and [Realtime function calling](https://developers.openai.com/api/docs/guides/realtime-conversations). Tool calls request application behavior; bank-side handlers, not voice instructions, enforce permissions and state transitions.
