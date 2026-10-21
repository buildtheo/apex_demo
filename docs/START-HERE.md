# Start here: Apex build status and handoff

Latest October 21: processor follow-up (second separate approval cycle) is implemented and isolated-browser/SDK-tested, with 91 deterministic tests passing. Read [processor-followup.md](processor-followup.md) and the newest progress entry. Five MCP tools, including new WRITE stage_processor_followup; no public approval/execution tool. Actual ChatGPT invocation of the new tool is pending. Original evidence retained; E-005 arrives only after explicit simulation. Credit/Martha's resolved banking view and PDFs remain pending. Earlier milestone states below describe prior increments.

Updated October 20, 2026. Theo has authorized Codex to **review and start building the agreed demo**. Presentation materials and practice are on hold. Read AGENTS.md, [build-handoff.md](build-handoff.md), then [plan.md](plan.md).

The latest user direction and current build plan supersede older slides-first/no-build-resumption notes. Historical implementation records are not fresh proof.

Latest approval increment: MCP can now stage one narrow internal lookup draft (write) and read its saved result. Separate local human approval rechecks exact payload/snapshot/assignment/expiry; no execution MCP tool exists. 82 deterministic tests and isolated browser/SDK approval flow pass. Theo's actual ChatGPT response for the new submitted case is now observed; his case remains intake/v1 until he explicitly advances the later packet. See [request actions](request-actions.md) and current progress. Processor follow-up and credit remain unbuilt; prior read-only/pending-approval descriptions below refer to earlier increments.

Responses intake captures corrections and creates a persistent case only after customer confirmation. The same ID follows through the queue, later fictional packet, MCP reads and controlled request path. New cases use Martha/JCPenney; old APX-001 is intact. See [intake setup](intake-setup.md) and [current progress](build-progress.md). Identity is simulated; public tools may read or stage an eligible draft, never approve/execute. External IdP setup is deferred.

Current connection proof includes Theo's pasted, source-cited ChatGPT comparison on APX-001 with unresolved authorization and reported non-use of E-004. This is user-observed evidence reasoning, not an independently inspected raw trace or action execution. Newly created case continuity is SDK/browser-tested; capture that returned ID in actual ChatGPT next. The next build milestones are scoped MCP staging/approved investigation, processor follow-up and verified synthetic credit.

## Current target

Martha Rivera disputes a $648.50 JCPenney purchase. Customer text OR voice intake in the browser iPhone app confirms her account and creates the shared Apex case. Barbara investigates the same case in actual ChatGPT using an Apex-owned MCP adapter around the legacy DMS stand-in.

The fictional processor's export cites a record from an earlier purchase. An approved internal lookup reveals that association; Barbara requests transaction-specific evidence, then reviews a labeled later processor response and cited assessment. Under a fictional policy she may approve a supported credit **strictly below $1,000**. Apex validates the human approval, posts the $648.50 synthetic credit once and independently reads the ledger/case result before showing Martha the approved explanation and resolution.

This replaces the original specialist-referral target. Missing authentication or an amount below the threshold does not automatically justify credit or prove fraud. No real credit or network recovery is in scope. Read [case-resolution.md](case-resolution.md).

Keep JCPenney for familiarity; the weak evidence is explicitly from a fictional merchant processor. Give the synthetic-case/real-brand disclosure once in the intro and retain source labels. Narrate merchant/amount first, IDs second.

## Latest executed increment - October 20

Confirmed intake is now implemented and live-provider browser-tested; see intake-setup.md. MCP read code retains OAuth validation, but the configured demo uses No authentication and fixed simulated Barbara with explicit saved case assignments. Optional native UI is deferred with the sourced-table fallback; native rendering proof is NOT RUN. Precise results and limitations are in build-progress.md.

## Remaining prototype and integration boundaries

- Python/SQLite case service, browser banking shell at / and analyst scaffold at /ops.
- Persistent confirmed text intake and queue; disabled voice; separately preserved seeded APX-001.
- Fixed server assessment text, internal request, simulated association response and old specialist handoff.
- Actual ChatGPT old/new-case sourced reasoning is user-observed. First request staging/private approval/result verification is isolated-browser/SDK-tested; actual ChatGPT staging confirmation, external identity, processor follow-up, full resolution brief and credit ledger remain pending.
- All 66 deterministic tests pass; these and one live browser example are not a passing model evaluation.
- Gate 0 fallback is recorded; actual account/rendering and combined live-tool proof remain NOT RUN.

Existing demo.sqlite retains old seed text until an explicit development reset; do not silently delete user state. Preserve data and use deliberate reset/migration handling.

## Immediate build sequence

1. Review the checkout and working changes, run existing checks, and record the baseline.
2. Complete/document the bounded optional-UI Gate 0 or honest sourced-table fallback. No optional UI framework detour.
3. Start with minimal authenticated get_case/get_evidence MCP and actual ChatGPT proof if account access permits. Record blockers without claiming a connection.
4. Follow [plan.md](plan.md): shared conversational intake and case continuity; grounded/released evidence; processor follow-up; human-approved credit and saved-effect verification; customer resolution.
5. Prepare the alternative discovery branch live or clearly simulated; verify failures and data boundaries.

Review first, then implement. Routine reversible choices and synthetic fixture completion are authorized. Bundle genuine account/access questions after inspecting what is available; continue independent backend/test work if a provider/account step is blocked. No repeated broad approval round is required. Slides and rehearsal are not the next deliverable.

## Invariants

- Two OpenAI surfaces: Platform/APIs for intake; actual ChatGPT for analyst work. Text/voice are API alternatives, Project optional/private, no third surface.
- Same returned case ID across intake, queue, retrieval, actions and resolution; a seeded case is not evidence of intake continuity.
- Source release and snapshot/case checks; no later answer in initial evidence. Code checks associations; model interprets and proposes.
- Case/action permissions enforced in Apex; OAuth identity is not blanket record access. Barbara is a narrative role until an actual identity is configured.
- Three action approval cycles: internal lookup, processor follow-up and credit. Exact payload/current evidence/actor authority; fresh approval after changes.
- Verify ledger/case effect and reconcile unknown results before retry. No duplicate credits or success claims based only on receipts.
- Full PAN/security codes are unnecessary. Enforce/test provider-bound fields; voice warning is mandatory but not proof raw audio is filtered.
- Synthetic data only; keep secrets/private documents out of this public repo.

## Document map

| Need | Read |
| --- | --- |
| Copyable Codex handoff and genuine setup questions | build-handoff.md |
| Ordered milestones, acceptance tests, discretion and boundaries | plan.md |
| Evidence/credit ending, policy and verification | case-resolution.md |
| Target customer journey and surface ownership | demo-flow.md |
| MCP, API baseline, identity/data flow and Gate 0 | reference-architecture.md |
| Role/case/action access, Project limits and two-identity proof | analyst-access-control.md |
| PAN/voice contract and future checks | sensitive-data-and-voice.md |
| Latest decisions and history | decisions-and-artifacts.md |
| Historical checks and next executed results | handoff.md |
| Current build results and read-adapter setup | build-progress.md; adapter-setup.md |
| Customer context and buying rationale | customer-profile.md; why-openai.md |
| Discovery, evaluation and executive close | discovery-and-outcomes.md; discovery-to-pilot.md |
| Assumed capacity economics and primary context | business-case.md; market-evidence.md |
| Reflection / design tradeoffs | reflection.md |
| Meeting timing and prep outline, no deck build now | meeting-outline.md |

The 20-to-15-minute active-effort hypothesis, 15% growth and business-case costs are modeled assumptions, not measured benefits. No real Apex ride-along, customer approval or passing model evaluation is established by the documentation.
