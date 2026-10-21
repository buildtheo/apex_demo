# Demo flow and system ownership

Current streamlined implementation: [Barbara workflow](barbara-workflow.md) supersedes the older three-business-approval journey. Queue copy/open launch -> actual ChatGPT bounded lookup/follow-up and explicit later-response simulation -> Apex credit approval only -> verified Martha resolution. Seven deployed tools; all writes truthfully annotated. Browser/SDK proof exists; new installed-ChatGPT walkthrough and conversational quality still need user rehearsal. Old proof case, source/PDF and voice boundaries remain unchanged. Older pending-conversion notes below are historical.

Latest interaction decision supersedes the three-review target below: Barbara visits Apex at the start and to approve the final credit only; evidence requests and investigation remain in actual ChatGPT. Bounded evidence-request execution and a launch-to-ChatGPT control still need implementation. Restart demo is now available on queue/case screens for fresh isolated practice runs; see [restart-demo.md](restart-demo.md). It does not reset the completed proof case or claim the pending flow changes are shipped.

October 21 latest: Theo confirmed the customer credit, completing the synthetic technical walkthrough end to end. Preserve APX-3625B0CC/v4; do not repeat its credit. Now simplify Barbara's experience without removing the three distinct human approvals. Read [the conversational interaction contract and M. Price voice-reuse plan](conversational-experience.md). An Apex voice profile is prepared but transport/session/tool integration and live call proof remain pending. Source PDFs and model evals also remain pending. Older pending-credit/customer paragraphs below are historical, not current status.

October 21 current implementation: all three review cycles, including the human-approved synthetic credit and verified return to Martha's banking app, are built; see credit-workflow.md. ChatGPT supplies the final cited recommendation and customer explanation, Barbara judges/approves, and Apex validates/posts/verifies before customer success. 111 deterministic tests and an isolated three-cycle browser/SDK run pass. Both actual ChatGPT investigation walkthroughs are now user-observed complete; final actual ChatGPT credit and live customer observation are pending. Source/PDF artifacts, voice and broader evals remain pending. Older unbuilt-credit/follow-up statuses below are historical.

Recorded October 15, 2026 from Theo's clarification. Read alongside plan.md and handoff.md. This describes the intended experience, not a claim that pending integrations work.

## October 20 decision - Barbara approves the supported credit

Latest experience clarification, explicitly locked by Theo: use conversational analyst language with technical identifiers/details secondary; link findings to inspectable source excerpts and origins/arrival information. Synthetic document-shaped evidence may be PDFs; transaction/system records should remain record views. Current fixtures are text, not original PDF retrieval. Visibly distinguish evidence requested from a labeled later response. Preserve the separate transaction-specific processor follow-up after the internal mismatch, then Barbara's reviewed credit approval and return to Martha's banking app only after ledger/case verification. Finish the current technical walkthrough before broad UX work; follow-up, linked document artifacts and customer-credit ending are still pending. See decisions-and-artifacts.md for the locked choices.

Theo selected a completed consumer outcome: after further evidence, Barbara explicitly approves the $648.50 credit under a **fictional Apex analyst-authority policy for amounts below $1,000 when the reviewed evidence supports the dispute**. The threshold grants authority, not automatic entitlement or a fraud finding. Apex validates the action, posts a synthetic ledger credit, and separately reads the saved credit and case decision before displaying completion and the approved customer explanation. This supersedes the October 19 specialist-referral ending. Network recovery stays separate. Read [the current ending and proof requirements](case-resolution.md). Code still implements the earlier handoff; additional evidence, credit posting and customer-resolution flow remain unbuilt. No new runtime/model test or Gate 0 completion is implied.

## Product surfaces and build scope — brief verified

The selected OpenAI product surfaces are **ChatGPT** and **Platform/APIs**. The three possible experiences below remain the design: voice and text are alternative API modes, followed by actual ChatGPT for the analyst. Discovery selects the experience and emphasis. Prepare both branches; the assignment does not require both modes to be live implementations. A clearly labeled simulated alternative can preserve the branch choice while reducing build/rehearsal risk. Keep the browser iPhone presentation.

See meeting-outline.md for the timed story, reference-architecture.md for diagrams and data/notice handling, and business-case.md for assumed before/after value.

## Locked demo experiences — October 15, 2026

Theo confirmed this as the demo. There are three potential OpenAI-powered user experiences, with two shown on either discovery-selected path:

| Experience | User and purpose | Technology |
| --- | --- | --- |
| Voice support | Customer reports the selected charge by call or an in-app voice conversation; assistant clarifies and prepares intake | OpenAI Realtime |
| Conversational agent in the web/iPhone banking app | Customer explains the selected charge through text; assistant asks relevant clarifying questions and prepares intake | OpenAI API |
| Analyst investigation in actual ChatGPT | Analyst retrieves authorized evidence, investigates, and prepares supported actions | Actual ChatGPT connected to Apex tools |

Discovery selects voice OR conversational in-app intake. Both converge on the SAME case service, DMS queue, and actual ChatGPT analyst investigation. Every intended demo path therefore includes a customer-facing OpenAI experience and the analyst-facing ChatGPT experience. Realtime is the voice implementation, not a dependency of the text branch.

Apex DMS remains the system of record and execution authority, not an additional OpenAI surface. The customer confirms the prepared intake before Apex creates the case. The analyst separately approves consequential investigation actions. Customer intake does not determine liability, issue credit, or initiate network recovery.

Example text intake: Customer says, "I've bought from JCPenney before, but this charge isn't mine." The agent may clarify whether this specific $648.50 purchase is disputed while earlier purchases are recognized. Ask only useful questions, retain the customer's wording and corrections, and present the structured report for confirmation. Do not imply recognition of a merchant proves authorization.

This supersedes the earlier option of a plain form as the complete in-app demo branch. The existing form may remain a temporary development scaffold or clearly labeled fallback; it does not satisfy the locked conversational in-app capability. Neither new capability is claimed implemented by this documentation update. Exact APIs, model selection, call transport, and integration mechanisms remain implementation choices.

## Analyst ChatGPT experience and authorization — locked October 20

Use actual ChatGPT on the web as the primary presentation candidate, with an Apex MCP connection and the same case ID. A Project is optional; start with a private case conversation and do not put unrelated cases in a broadly shared Project. ChatGPT app access does not grant bank-record access: Apex must validate identity and enforce role plus case/source/action permission per request. Show inspectable retrieval and source-referenced findings, with denied access tested using a distinct authenticated identity. See [the role matrix, visible flow, future proof and real-world precedents](analyst-access-control.md). These requirements are not yet implemented or demonstrated; Chat/Work/Projects do not count as extra selected surfaces.

## Sensitive-data instruction for intake — locked October 20

If voice is shown, the assistant must open before collecting the narrative: “Please do not say your full card number, card security code—CVV or CVC—PIN, or password. I will never ask for those details in this conversation. We can work from the transaction you've selected.” Never request or repeat those secrets. Read [the complete data boundary and volunteered-data response](sensitive-data-and-voice.md). Selected transaction references and optional last-four are sufficient for this task. The warning is not a guarantee against raw-audio exposure in direct Realtime; transcript masking happens after receipt. Voice and sensitive-data enforcement are not yet implemented or evaluated.

## Locked customer presentation format

Theo will run the Apex iPhone app experience in a browser as an iPhone-style simulator. This is a browser-rendered mobile banking demo, not a native iOS build or the Apple iOS Simulator. Keep the customer flow usable and readable inside the phone viewport; actual ChatGPT and the DMS remain separate analyst surfaces. Do not add native-app packaging, App Store distribution, or an iOS toolchain to deliver this demo. The existing banking preview is the starting shell; live conversational/voice capabilities remain pending. Rehearse customer text input and, when connected, browser microphone permission/audio on the presentation machine.

## Core distinction

Customer banking app → Apex dispute-management case queue → actual ChatGPT investigation → verified updates back to Apex.

Apex's dispute-management system (DMS) owns the case. ChatGPT is the analyst's investigation workspace, accessing authorized Apex records through connected tools. A dispute does not arrive in ChatGPT as a separate case or independent queue. The mocked DMS represents the bank's existing operational system.

Distinguish the three potential OpenAI experiences above from the bank's system-of-record UI. In a given path, the audience sees customer intake, Apex DMS, and actual ChatGPT; customer intake is powered by Realtime voice or an API-powered text agent.

## Discovery selects the intake path

See [the running discovery table and outcomes](discovery-and-outcomes.md). Ask which intake experience needs improvement. Their answer chooses the voice or in-app path shown in depth; both converge on the same Apex case service and analyst workflow. Voice is not an unconditional default.

## End-to-end experience

| Step | Actor and experience | System responsibility |
| --- | --- | --- |
| 1. Spot the charge | Customer opens a transaction in the Apex banking app and selects Dispute this charge. | Banking app supplies the selected transaction context. |
| 2. Report the issue | Customer can choose a call/voice route or an in-app reporting route. Discovery determines which path the live demo follows; the voice branch uses Realtime and the in-app branch uses an OpenAI API-powered text agent. The customer confirms the structured intake before submission. | Apex captures structured intake and an attributed customer statement. Entry choices do not imply both channels have been implemented. |
| 3. Create the case | Intake returns a case ID. | Apex case service persists the dispute, transaction reference, statement, and initial history. Do not imply automatic credit or network filing. |
| 4. Pick up the work | Analyst sees the case in an assigned work queue. | Apex DMS owns routing, assignment, status, and access permissions. |
| 5. Investigate | Analyst opens actual ChatGPT and requests the same case by ID. ChatGPT retrieves authorized evidence, compares sources, and identifies a material inconsistency. | Connected Apex tools enforce identity and case-level access. ChatGPT provides cited investigation support; Apex remains the record authority. |
| 6. Request more evidence | Analyst reviews and approves a scoped internal evidence request. | Apex executes the approved request; a separate authoritative read verifies its creation. |
| 7. Reassess | A clearly labeled simulated response arrives, the evidence snapshot changes, and ChatGPT reassesses what the evidence supports and leaves unresolved. | Apex stores the response and history. New evidence must invalidate stale action drafts/approvals as applicable. |
| 8. Obtain transaction-specific evidence | Barbara approves the processor follow-up; show a labeled later corrected response and reassess the complete record. | Apex saves/verifies the request and releases the later source at the correct stage. No mismatch-alone verdict. |
| 9. Approve the credit | Barbara reviews the cited rationale and approves the exact $648.50 credit under fictional below-$1,000 authority when evidence supports the dispute. | Apex validates simulated actor/authority/snapshot/payload, atomically posts once and separately verifies synthetic ledger and case records. Implemented and isolated-browser-tested; actual ChatGPT/live-case credit walkthrough remains pending. |
| 10. Explain the resolution | Martha sees the approved explanation and verified synthetic credit. | Apex retains the consumer decision, sources and financial entry. Network recovery remains separate; displayed text is not proof of a sent message. |

## People and evidence attribution — locked October 20

Martha Rivera is the fictional cardholder; Barbara is the fictional dispute analyst. Theo chose these first names for recall. Barbara is a story role, not a new authenticated user or a change to the local-demo-operator audit identity. Keep JCPenney as the purchase merchant, but attribute E-003's recognized-device claim to a fictional merchant-processor export. Its title, source label, fixed assessment and spoken narration must agree. Do not describe the packet as a JCPenney statement or submission. Give the [spoken disclosure once in the introduction](meeting-outline.md#opening-discovery--october-20-preparation-decision).

## Merchant and amount in narration — locked October 20

Use “the $648.50 JCPenney purchase” rather than lead with T-204. JCPenney is a familiar real merchant name used only in a fictional, synthetic dispute. The customer acknowledges shopping there before and denies this purchase. An earlier purchase is relevant relationship context; an authentication record associated with it does not substantiate the fictional processor's claim about the new purchase. Preserve the distinction between the attributed customer statement and independently corroborated transaction history. The earlier purchase's amount/date and full corroborating ledger display are not yet in the fixture; do not invent an already-executed proof. Keep internal IDs in source details for transaction association and auditability.

## Stage transition in the demonstration

Show an explicit time jump between customer intake and later analyst investigation. The fictional processor export and later evidence must not appear to have arrived during the initial call.

Suggested narration: "Here is the case in the analyst's queue. Now let's investigate it in ChatGPT."

Switch to actual ChatGPT and ask: "Open case APX-001 and summarize what needs investigation." APX-001 is the current seeded case; when intake creates a different case, use the actual returned ID instead, consistently across the demo.

A direct Investigate in ChatGPT button or deep link is optional and unvalidated. Manual switching with the same case ID is sufficient to demonstrate the intended handoff. Do not show a button as working until its supported integration has been verified.

## Why the existing prototype can be confusing

The initial custom browser workspace combines case details with fixed guided investigation responses. It is a local workflow scaffold, not the final discovery-selected experience and not actual ChatGPT. An API-backed custom chat panel would also not meet the actual ChatGPT milestone by itself.

The customer banking preview now opens at `/` (also `/banking`): iPhone-style accounts → selected JCPenney transaction T-204 → Dispute this charge → Talk to support OR Report in the app. The voice route builds on the M. Price demo concept, but does not reuse its live connection or imply that Twilio is configured for Apex. Its connection button is disabled and labeled pending. The in-app form captures a reason and statement and saves a browser-local draft; it does not create or update an Apex case. The confirmation explicitly identifies the result as a draft.

The original analyst prototype is at `/ops`. A distinct assigned-case queue, live Realtime intake, actual ChatGPT integration, real authentication, case-level authorization, and shared case creation from intake remain pending. Do not describe the preseeded APX-001 investigation case as having been created by the banking preview. The implemented analyst sequence remains evidence review → approved request → simulated response → reassessment → approved specialist handoff → read-back verification. Consult handoff.md for recorded checks and their limits.

## Build authorization - October 20

Theo has authorized review and build resumption. Follow [the current ordered plan](plan.md) and [Codex handoff](build-handoff.md); older preparation-only notes do not require another approval. Slides and practice are on hold. Gate 0/fallback and truthful integration/control proof remain required.

## Build implications and scope control

- Make customer banking/intake, DMS case management, and ChatGPT investigation visually and verbally distinct.
- Use one shared case ID and authoritative case service across surfaces.
- First get the local prototype accessible for review. Then prove authenticated case/evidence retrieval in actual ChatGPT; add customer entry and Realtime intake in small increments per plan.md.
- Keep call/voice and in-app options as intended entry choices. Both conversational intake branches must be prepared for the locked discovery-driven demo, with explicit fallback labeling while building. Actual telephony transport remains an implementation choice; an in-app voice connection must not be presented as a working telephone call.
- Show human approval and saved-effect verification for all three consequential actions: internal lookup request, processor follow-up request and synthetic credit. Explain the first; keep later cycles concise while retaining meaningful review.
- Model tools may prepare actions; they must not grant human approval themselves. Apex owns authorization, execution, and authoritative results.
- Label synthetic records, simulated arrivals, fixed responses, and pending integrations honestly.
- Preserve the locked 30-minute meeting and 18-minute demo. This clarification explains the journey; it does not expand the demo into a complete banking or network-adjudication product.

## Acceptance checks for future agents

An observer should be able to answer: Where did the customer start? Where was the case created? Where does the analyst find it? What does ChatGPT retrieve? Who approves? Which system executes? What independently proves completion?

The same case must remain identifiable across the journey. Source observations must remain separate from model conclusions and evaluator answer keys. Missing proof is not proof of fraud. Evidence requests do not pause external deadlines. The current target explicitly includes a supported human-approved synthetic credit; the implemented specialist handoff alone does not satisfy that ending. See case-resolution.md.

