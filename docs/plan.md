# Current Codex build plan

October 21 executed milestone 4: processor follow-up draft, separate exact review, saved-request verification and explicit corrected-response arrival are implemented; see processor-followup.md and current build-progress.md. 91 deterministic tests and isolated browser/SDK both-cycle walkthrough pass. Actual ChatGPT invocation of stage_processor_followup is pending. Next build milestone is the supported human-reviewed synthetic credit, separate ledger/case verification and Martha's banking-app resolution; linked PDF artifacts and broader conversational polish remain pending. Earlier milestone-4-unbuilt statements below describe prior increments.

Updated October 20, 2026. **Theo has authorized resuming the build. Presentation/deck work and practice are on hold.** This is the current implementation plan, replacing the older specialist-handoff roadmap and slides-first milestones. Read AGENTS.md and docs/START-HERE.md first. Dated preparation notes remain history where they conflict with this plan.

## Goal and locked scope

October 20 setup update: Theo approved simulated identity for the synthetic demo and reuse of M. Price API credentials. Preserve case/action/release controls with an explicit demo actor; do not claim real OAuth or deployed two-user identity proof. Actual ChatGPT tools remain the target using its No authentication connection option, subject to account access. External IdP setup is deferred. See [build-progress.md](build-progress.md) for 45 passing local checks and precise integration status; earlier real-auth acceptance requirements below remain production-path targets, not the demo prerequisite.

Build one coherent synthetic issuer-side dispute workflow for the OpenAI Applied AI Architect interview. Two selected OpenAI surfaces: Platform/APIs for customer intake and actual ChatGPT for analyst investigation. Text and voice are alternative intake modes, selected through discovery. Prepare both branches; both do not have to be live. Preserve the browser iPhone format, 30-minute customer meeting and 18-minute demo. No native iOS application or network-recovery product.

- **Martha Rivera**, cardholder, disputes the **$648.50 JCPenney purchase** while acknowledging an earlier purchase.
- **Barbara**, analyst, investigates in actual ChatGPT using authenticated, case-scoped Apex MCP tools.
- The weak packet comes from a **fictional merchant processor**, not JCPenney. Say the synthetic-case/real-brand disclosure once in the introduction; retain source labels.
- Apex keeps its legacy DMS and existing identity; the local Python/SQLite service is a stand-in. Apex owns integration, records, policy and execution. MCP does not require a native DMS AI feature.
- Barbara requests more evidence after the initial mismatch. After the labeled later processor response, she can approve a supported **$648.50 synthetic credit** under fictional analyst authority for amounts **strictly below $1,000**.
- Apex validates the exact approval, posts once and independently reads the saved ledger/case state before Martha sees completion and the approved explanation.
- Missing evidence, a low amount, or a model recommendation does not automatically justify credit or establish fraud. Network recovery is separate and out of scope.

Detailed narrative and credit controls: [case-resolution.md](case-resolution.md). Identity/role rules: [analyst-access-control.md](analyst-access-control.md). Sensitive data/voice: [sensitive-data-and-voice.md](sensitive-data-and-voice.md). Executive close/evaluation: [discovery-to-pilot.md](discovery-to-pilot.md). Reflection: [reflection.md](reflection.md).

## What is actually implemented

Latest action increment: first scoped request staging, separate human approval, saved-effect verification and explicitly released deterministic association check now exist. 53 Python and 29 Node tests plus isolated browser/SDK approval flow pass. Actual ChatGPT read/reason on Theo's new case is user-observed, but write-tool confirmation and approval on that case still need user-side proof. See request-actions.md. Next build is milestone 4 processor follow-up, then milestone 5 supported synthetic credit; the old specialist endpoint is not the target. Identity remains simulated.
Latest increment: confirmed Responses text intake/shared queue/new-case continuity are implemented and tested (41 Python plus 25 Node tests, isolated deterministic browser and two-call live Responses browser check). New-case SDK continuity is verified; actual ChatGPT old-case read/reason is user-observed. Preserve the old seed. See intake-setup.md and build-progress.md. Milestone 2 is implemented under simulated identity; milestone 3 still needs model-side staging/human-approved scoped actions, followed by processor follow-up and credit. Do not return to account setup or slides instead of those next build steps.

October 20 executed increment: read-only MCP adapter code and local signed-token/role/case/source/version checks now exist; all 13 adapter tests and 26 existing tests passed. Gate 0 is DEFER with the sourced-table fallback, not proof of native rendering. Actual ChatGPT/external identity linking remains pending. See [build-progress.md](build-progress.md) and [adapter-setup.md](adapter-setup.md). Milestone 1 is partial, not complete.

Recorded state before this build:
- Python/SQLite case service; browser banking shell at / and analyst scaffold at /ops.
- Banking form saves a browser-local draft; voice is disabled; intake does not create the backend case.
- APX-001 is seeded. Fixed server assessment text is not model output.
- One approved internal lookup and released simulated response, then specialist handoff and read-back checks.
- No implemented MCP, actual ChatGPT connection, shared conversational intake, real identity/case authorization, full cited resolution brief, processor follow-up or credit ledger.
- Historical 26 workflow/verifier/race checks are not fresh results or model evaluations.
- Gate 0 is recorded NOT RUN. The planning assistant had no execution environment. Codex must inspect the actual checkout and run appropriate checks; do not assume its environment has the same limitation.

Do not report these items complete merely because requirements are documented.

## Start work without another broad permission round

Review the checkout, preserve unrelated changes, run the existing tests and identify actual gaps. Then implement the approved scope in small reviewable increments. Routine code/schema/tool choices, tests, synthetic fixture details and reversible refactors are authorized. Do not wait for Theo to reapprove each milestone.

Use the bounded Gate 0 check before feature expansion. If optional native evidence UI is unavailable, record the sourced-table fallback honestly. The next increment is the minimal read adapter/connection proof; repeat combined rendering/tool checks before any optional UI investment. Do not build a new UI framework to obtain a visual. If account linking or credentials block live proof, record exactly what is blocked and continue independent backend/control work; do not claim the missing connection works.

Do not create presentation materials or rehearse. At each meaningful milestone record changed behavior, checks/results and live/simulated/unbuilt status.

## Ordered implementation milestones

| Order | Deliverable | Acceptance evidence |
| --- | --- | --- |
| 0 | Baseline and Gate 0 | Inspect current code/instructions; run existing checks; record account/UI feasibility or sourced-table fallback and unresolved dependencies. |
| 1 | Minimal actual ChatGPT read connection | MCP adapter with get_case/get_evidence around the existing service; token validation and case/source-release checks; a real ChatGPT tool trace if access is available. Distinct authorized/denied identities and unreleased-source denial. REST calls or a custom chat UI alone are not this proof. |
| 2 | Shared case foundation and intake | Confirmed conversational text intake creates a persistent case/queue entry and returns its actual ID. Preserve Martha's exact account/corrections and selected transaction. Same ID follows into ChatGPT, evidence and actions. Reject duplicate/unauthorized submissions. Keep seed/demo reset separate from customer-created cases. |
| 3 | Released evidence and model investigation | Actual model reads available excerpts and cites source IDs/snapshot; code checks transaction associations. Internal lookup request is staged, human-approved, saved and read back. A labeled later response reveals the earlier-purchase association. No hidden evidence or expected answer leaks. |
| 4 | Processor follow-up and reassessment | Barbara requests evidence specific to the disputed purchase and clarification of the export. Human approval and saved request verification; labeled later processor response corrects the citation and provides no authentication evidence tied to this purchase. Updated cited assessment preserves uncertainty and supports human judgment. |
| 5 | Human-approved synthetic credit and customer outcome | Barbara reviews the exact resolution brief/message and $648.50 action. Apex validates authenticated case/action/amount authority, current evidence/payload and approval freshness; posts one synthetic ledger entry; separate read verifies credit plus saved consumer decision before showing Martha completion. Failed/uncertain posting never becomes a success message. |
| 6 | Voice alternative and failure/evaluation coverage | Prepare the discovery-selected voice branch against the same intake/case contract. Live only with actual approved transport/data controls and account proof; otherwise a clearly labeled simulation. Exercise adversarial evidence, access/action failures and full-path model behavior. Record model/tool/prompt versions and observed results. |

Prioritize one complete, reliable text-to-ChatGPT-to-credit path while retaining the other discovery branch as a labeled prepared alternative if necessary. This is an implementation efficiency choice, not permission to ignore the customer's selected route or claim an unfinished branch works.

## Evidence and fixture contract

Existing IDs provide traceability; narration leads with merchant/amount. Preserve the core E-001 customer account, E-002 disputed ledger record, E-003 fictional processor assertion and gated E-004 association lookup. Add later processor-request/response sources with explicit release stages and provenance. Do not put the eventual credit decision or evaluator answer into raw observations.

Earlier purchase amount/date and fuller corroborating ledger detail remain undefined. Codex may choose consistent, clearly synthetic values and record them; no user approval is needed for routine fictional fixture completion. Do not change the selected disputed merchant/amount or pretend these were previously verified real facts.

The later processor response and exact human decision rationale must be consistent: the corrected citation weakens one assertion; Barbara considers the full case under the authored policy. Do not implement a rule that missing authentication equals fraud/automatic credit. Include supported, unsupported and needs-more-evidence variants for evaluation.

## Actions, identity and verification

Tool names and storage schema are implementation choices. Keep model-facing tools for case/evidence reads and staged requests/credit drafts separate from human approval/execution. Draft saving is a write. Never mark it read-only to hide a ChatGPT permission prompt.

Three consequential approval cycles: internal lookup request, processor follow-up request and credit. Human approval binds case, current evidence snapshot, exact scope/account/amount/currency and payload, actor and freshness. Changed evidence/payload invalidates approval. Authoritative role/case/action checks happen in Apex on every request; an actor name or case ID in a prompt is not authentication.

Barbara is the narrative role. Implement an actual authorized test identity or clearly label local role simulation. Do not silently rename the local-demo-operator audit actor and claim OAuth/enterprise RBAC is implemented. Other permitted reviewers may access authorized cases; “only Barbara can access anything” is not the design.

Credit must have a durable identifier and exact ledger entry. Use safe monetary representation. Prevent duplicate execution and reconcile uncertain results before retry. Verify the exact ledger/case effect, not only receipt/status. Displayed customer text is not a sent notification unless an actual outbox/send result is verified. No real financial or network action.

## Model/data integration requirements

Baseline candidates are Responses for text and Realtime for voice, plus an MCP Streamable HTTP adapter for actual ChatGPT. Verify current official SDK/API/account guidance before implementing; choose available supported model configurations and record versions. These named choices do not establish an existing connection.

Use cleared allowlisted transaction/case metadata and evidence, not full bank records or PAN/security codes. Read the full sensitive-data specification before implementing provider-bound inputs. Test request payloads, logs/error paths and accidental-input handling. Direct voice audio has a separate exposure boundary; the spoken warning is mandatory but is not proof that sensitive audio never reaches the provider.

Keep credentials server-side/out of Git and outputs. Use existing approved identity/provider configuration where available; do not invent a new enterprise identity system for this demo. Never expose the unauthenticated local action service on a public tunnel.

## Review questions versus independent decisions

Ask Theo only for a missing fact/access choice that materially blocks execution:
- Intended presentation ChatGPT account/workspace and ability to install/link the custom MCP connection.
- Available API project/credential configuration, identity provider/test identities and authorized deployment/tunnel access. Use secure configuration, never request secrets in chat or print them.
- Any real blocker to voice/audio or a required choice that cannot be inferred from current scope.

Inspect the environment first and bundle genuine questions. Continue independent implementation/tests while a live connection is blocked. Codex may choose routine code structure, official SDK, fixture IDs/dates/amount for the earlier purchase, schema migrations and test implementation. Do not ask Theo to decide every function name or field.

## Verification and handoff

Minimum meaningful coverage:
- Same case/transaction from confirmed intake through retrieved evidence and customer outcome.
- Unreleased/wrong-case sources denied; injection in evidence cannot grant tools or approvals.
- Missing/invalid identity, wrong role/case, action outside authority and amount exactly $1,000 rejected for Barbara's below-threshold path.
- Stale/expired/altered approvals; duplicate credits; timeouts and reconciliation; ledger/case mismatch or missing effect; no false completion.
- Grounding and investigation variants including additional evidence, unsupported credit and changed conclusions.
- Sensitive-data handling and provider-bound payload checks, plus voice behavior if live.

Separate deterministic tests, browser checks, real ChatGPT/API traces and model evaluations. Report what ran, versions/case counts, failures and limits. Do not relabel fixed responses or historical test counts as new AI proof.

Before handing back: update docs/START-HERE.md and docs/handoff.md with actual status, setup/run steps, migrations/reset instructions, remaining blockers and a live/simulated/unbuilt inventory. Preserve existing demo data with explicit reset/migration handling rather than silently deleting it. Keep useful short milestone commits.

## Out of scope for this build pass

Presentation/deck production, rehearsal, native iOS, production certification, real customer data, real credits, network recovery, broad autonomous adjudication and optional UI expansion before evidence. Business-case numbers remain assumptions; do not claim measured savings from the demo.
