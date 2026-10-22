# Apex — dispute investigation prototype

**Locked current state:** read [the consolidated snapshot](docs/current-state.md) and [current handoff](docs/build-handoff.md). Theo completed the streamlined actual-ChatGPT investigation, approved the credit and saw it in Martha's app. Only credit needs business approval. Phone intake uses a short caller-amount -> merchant -> reason flow; [phone rehearsal and restore](docs/phone-setup.md). 143 deterministic checks and isolated text/voice browser/SDK flows pass. The first physical call hit a duplicate of the earlier credited dispute; early detection and rejection handling are corrected. Successful physical-call submission, the choice/implementation of an identity step, source PDFs and broader evals remain pending. Older dated status paragraphs below are historical.

**Barbara's current workflow:** queue -> Investigate in ChatGPT (copy/open) -> bounded evidence requests and explicit later responses in the same conversation -> Apex for credit approval only -> verified customer app. See [the current walkthrough and one-time tool refresh](docs/barbara-workflow.md). Old three-approval/pending-conversion paragraphs below are historical.

**Practice:** click **Restart demo** on the [queue](http://localhost:8080/queue) or case screen. It opens a fresh banking-app run without deleting earlier cases/credits. Use the newly returned case reference in a fresh ChatGPT conversation. See [restart behavior and limits](docs/restart-demo.md). Theo's latest credit-only business-approval flow supersedes the older three-approval target; conversion of investigation tools and the launch-to-ChatGPT button remains pending.

October 21 locked build: Theo confirmed the displayed customer credit, completing the user-observed synthetic technical walkthrough through actual ChatGPT, all three separate approvals and the independently verified $648.50 posting for APX-3625B0CC. Preserve the resolved case; do not repost/reset it. The customer reveal uses the labeled read-only demo preview, not production login recovery. Read [the credit walkthrough](docs/credit-workflow.md). 112 deterministic tests plus isolated three-cycle browser/SDK and lost-session recovery checks pass. Source/PDF artifacts, voice/fallback, model evals and interview-readiness remain separate work; no real money movement, measured savings or production-readiness claim.

A runnable, synthetic analyst workflow for iterating on an OpenAI Applied AI Architect onsite demo.

**Continuing as another agent? Start with [the consolidated handoff](docs/START-HERE.md).** It links the locked demo, current implementation, executed checks, source evidence, and next required step.

## Historical Build Notes - October 20

These dated progress notes describe earlier increments; the October 21 status above and docs/credit-workflow.md are current.

Latest approval increment: optional stage_evidence_request saves a bounded draft and is correctly marked WRITE; get_action_result verifies saved request facts. Actual execution requires the separate local Apex review button with exact payload/version/assignment/expiry checks. No approval/execution MCP tool. 82 deterministic tests plus isolated browser/SDK approval flow pass. Theo's submitted-case ChatGPT reading is user-observed; his live case was not advanced or approved. See [request actions](docs/request-actions.md). Processor follow-up and credit are still pending. Earlier two-read-tool descriptions below are historical; local runtime now enables four tools.
Text intake, customer confirmation, shared queue and same-case MCP reads are implemented. Actual ChatGPT source reasoning on the old and new cases is user-observed. Identity remains simulated, not OAuth; public tools may read or stage a bounded draft, never approve/execute. See [intake setup](docs/intake-setup.md), [adapter setup](docs/adapter-setup.md) and [current progress](docs/build-progress.md). No credit or final resolution is implemented yet.

Theo has authorized Codex to review and resume implementation. Start with [the build handoff](docs/build-handoff.md) and [the consolidated current plan](docs/plan.md). Presentation materials and practice are on hold. The plan replaces older slides-first/specialist-endpoint milestones; it contains the credit ending, ordered increments, acceptance checks and genuine account/access questions. [Current build progress](docs/build-progress.md) now records the first implemented read adapter, 13 new adapter tests and 26 existing tests passing. Actual ChatGPT/external identity linking remains pending.

## October 20 decision - Barbara approves the supported credit

Theo selected a completed consumer outcome: after further evidence, Barbara explicitly approves the $648.50 credit under a **fictional Apex analyst-authority policy for amounts below $1,000 when the reviewed evidence supports the dispute**. The threshold grants authority, not automatic entitlement or a fraud finding. Apex validates the action, posts a synthetic ledger credit, and separately reads the saved credit and case decision before displaying completion and the approved customer explanation. This supersedes the October 19 specialist-referral ending. Network recovery stays separate. Read [the current ending and proof requirements](docs/case-resolution.md). Code still implements the earlier handoff; additional evidence, credit posting and customer-resolution flow remain unbuilt. No new runtime/model test or Gate 0 completion is implied.

## Merchant naming — October 20

Use JCPenney as the familiar merchant name in this fictional dispute. All purchases, customer statements, processor assertions and evidence are synthetic; they do not describe actual JCPenney conduct or records. Narration leads with “the $648.50 JCPenney purchase”; internal IDs remain available for traceability. Martha Rivera is the cardholder and Barbara is the fictional analyst in the talk track. E-003 is a synthetic export from a fictional merchant processor, not a JCPenney statement. Use the [spoken opening disclosure once](docs/meeting-outline.md#opening-discovery--october-20-preparation-decision). Earlier snapshots/review text may use superseded names.

Existing demo.sqlite state retains its old seeded text until the local demo is explicitly reset. Use the existing development reset when ready to reload the new fixture; no automatic deletion or migration is introduced.

## Locked target demo

Discovery selects either OpenAI Realtime voice support or an OpenAI API-powered conversational text agent in the banking web/iPhone app. Both clarify the selected charge, prepare intake for customer confirmation, and create the same Apex case for analyst investigation in actual ChatGPT. That is three potential OpenAI experiences, with two on each demonstrated path. Apex DMS owns the case and approved execution. See [demo flow](docs/demo-flow.md) and [running discovery](docs/discovery-and-outcomes.md).

Text intake uses Responses; alternative phone intake uses Realtime. Both create a shared case after customer confirmation. Actual ChatGPT handles the bounded investigation through MCP, followed by separate human credit approval in Apex. Earlier dated implementation notes below are historical; consult current-state.md.

The customer banking app will be presented in the browser as an iPhone-style simulator. A native iOS build or Apple iOS Simulator is not required. ChatGPT and Apex DMS remain separate analyst surfaces.

## Presentation preparation

The two selected product surfaces are ChatGPT and Platform/APIs. Realtime voice and API text are alternative customer experiences; prepare both for discovery, with live or explicitly simulated execution. Both modes need not be live implementations.

Start with [the timed meeting and criteria map](docs/meeting-outline.md), then [customer and stakeholders](docs/customer-profile.md), [architecture and data flow](docs/reference-architecture.md), [before/after and value](docs/business-case.md), and [objection preparation](docs/objection-prep.md). These are reviewable drafts with explicit assumptions; a finished deck, rehearsal, and live two-surface proof remain pending.

## Run

The banking shell/DMS requires Python 3.10+. Conversational intake also requires Node 22+, `npm ci`, local server-side API configuration and a separate `npm run intake` worker. MCP reads require `npm run mcp`. Demo mode uses explicitly simulated identity rather than an external IdP. See [intake setup](docs/intake-setup.md) and [adapter setup](docs/adapter-setup.md). Never tunnel the Python action service or intake worker.

```sh
python3 server.py
```

Open http://127.0.0.1:8080 for the iPhone-style banking app. Select JCPenney, Dispute this charge, then Report in the app. With `npm run intake` running, converse, correct the captured statement and explicitly confirm submission. Alternatively, use Talk to support after [phone configuration](docs/phone-setup.md). The new case appears at http://127.0.0.1:8080/queue; use its returned ID with the actual ChatGPT Apex connection. State persists in local `demo.sqlite` (ignored by Git); APX-001 is not silently reset.

## Continue in VS Code

Open this repository folder in VS Code, then use **Terminal → Run Task → Apex: Run demo**. Wait for `Apex synthetic prototype: http://127.0.0.1:8080`, then open that URL in your browser. Keep the task running; stop it with Ctrl+C in its terminal. **Apex: Run tests** runs the workflow tests.

These tasks use `python3` (Python 3.10+). No extension, packages, or API key is required. If your Python command is `python` or `py`, run the equivalent commands manually in the integrated terminal.

`127.0.0.1` and `localhost` refer to the machine running the browser. A server started in a remote cloud environment is not accessible through your computer's localhost without port forwarding. In a remote VS Code session, forward remote port **8080** using the **Ports** panel and open its local address. The server remains bound to remote localhost; do not make the unauthenticated prototype publicly accessible.

On a Chromebook, use the Linux development environment for Python and VS Code. If Linux is disabled by an administrator, local setup needs a permitted environment.

See [the development handoff](docs/handoff.md) for completed checks, limitations, and the next Codex task.

## Walk through

1. Inspect the case and expand evidence records.
2. Compare the evidence and inspect the missing information.
3. Stage the evidence request and review its exact payload.
4. Approve & execute in the local demo. The browser performs a separate case read and verifies the saved request scope against the approved action.
5. Simulate a later response. Compare again to reassess the new evidence.
6. Stage and approve the specialist handoff; verify the assignment and exact saved handoff payload.

The handoff remains the implemented prototype endpoint, superseded as the target story by the human-approved synthetic credit ending in docs/case-resolution.md. This build does not yet finalize credit, file network actions, or send messages.

## Honest implementation boundaries

- SQLite-backed transitions, draft version binding, duplicate handling, and separate read-back checks of saved request/handoff facts are implemented. Verification reads the same local database; it does not establish external execution or independent-system confirmation.
- Fixed assessments are served only for the available evidence snapshot. The UI checks case/version metadata and discards superseded responses after refresh, actions, or reset. Raw records remain separate from assessment text.
- /ops investigation text is fixed scaffold content. Responses text intake has a live browser check, and actual ChatGPT case/evidence reasoning on APX-001 is user-observed. New-case SDK continuity is verified; capture that new ID in actual ChatGPT next. No Realtime, real bank, Visa or external evidence service is connected.
- Approval is performed by the local demo operator. This is not OAuth, real identity verification, or production role authorization.
- Server binds only to localhost. Do not expose it to the internet as a production service.
- All names, transactions, sources, and DEMO-01 policy are synthetic. No legal or network eligibility conclusion is encoded.
- Original customer-provided PDFs and interview materials are intentionally not in this public repository.

## Tests

```sh
python3 -m unittest discover -s tests -v
npm ci
npm run test:adapter
```

The Python suite includes workflow, HTTP, persisted-effect verification, and delayed-assessment race checks. Node is optional for running the browser prototype but required for its JavaScript verifier/UI-race tests and for the separate adapter suite. The adapter tests cover local signed-token validation, role/case access, evidence release/snapshots, minimized outputs and SDK HTTP calls. These test local controls, not actual ChatGPT connectivity, model quality or production security. See `docs/plan.md` for the locked meeting baseline and next integration milestones.


