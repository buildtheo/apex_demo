# Locked direction and implementation sequence

## Preparation update — verified assignment scope

The original assignment has been checked. The selected product surfaces are ChatGPT and Platform/APIs. Realtime voice and conversational text are alternative experiences within Platform/APIs, not separate counted product surfaces. Discovery still selects the intake experience; prepare both, but a clearly labeled simulated alternative is permitted and both need not be live implementations. The customer experience still runs in the browser iPhone frame.

The preparation pack is customer-profile.md (scenario/stakeholders/qualification), reference-architecture.md (architecture/data/connection proof/regulatory context), business-case.md (before/after/value/instrumentation), objection-prep.md, and meeting-outline.md (timing/evals/governance/enablement).

Explicit baseline and before/after assumptions are appropriate; unsupported statements presented as actual customer behavior/results remain prohibited. New scenario attributes and pilot/cost assumptions in the pack are proposals to validate, not additional customer commitments or measured outcomes.

## Customer meeting

Fictional US consumer-credit issuer Apex. Thirty-minute meeting: 3 minutes customer/discovery, 6 solution, 18 demo with questions, 3 value/pilot/ask. Separate 15-minute reflection.

Demo direction: discovery selects voice (Realtime) or conversational text intake in the web/iPhone banking app (OpenAI API); explicit later investigation stage; actual ChatGPT opens the same case; analyst compares evidence, asks a follow-up, requests a scoped internal record, reassesses, and approves a defined next action with independent verification. First approval explained in depth, second concise. Final consumer disposition is still open.

Executive outcome, clarified October 20: sponsorship of workflow observation and evaluation design, operations and technology owners, risk participation, and an agreed review of findings. Present a bounded pilot as a conditional proposal, not an immediate launch commitment. See [discovery-to-pilot sequencing](discovery-to-pilot.md). The illustrative six-week outline covers baseline/access/evals, shadow testing, then limited assisted use only if gates pass; its duration is not a customer commitment. Illustrative assumptions: 60,000 eligible cases/year, 20 minutes baseline, 5 minutes saved, $60/hour = 5,000 hours / $300,000 gross capacity value before costs. These are not measured results. Test quality, follow-up workload, cost, adoption, and controls alongside time.

Maintain the [running discovery table, branching flow, and end-in-mind outcomes](discovery-and-outcomes.md). The selected intake path changes with the customer's answer; both paths converge on the same case and analyst investigation. The executive close now asks for discovery/evaluation-design sponsorship, with pilot launch conditional on findings and readiness.

## Locked demo capabilities

Three potential OpenAI experiences: Realtime voice support, an API-powered conversational agent in the banking web/iPhone app, and actual ChatGPT for the analyst. Discovery selects one customer intake branch, followed by the shared analyst investigation. Both prepared branches must show useful clarification, customer confirmation of structured intake, and shared case creation, live or explicitly simulated. A plain form is a scaffold/fallback, not the final in-app branch. See demo-flow.md for the locked experience table. These are build requirements, not completed integrations.

## Scope of this first build

One persistent synthetic case, inspectable evidence, fixed guided comparison, approved internal lookup request, simulated response, reassessment, approved specialist handoff, independent read-back. The handoff provides an iteration point while final financial disposition remains open. No credit or network transaction is performed.

## Intelligent UI readiness gate — before further feature building

Theo requested this gate. Complete and record a bounded feasibility check before adding more features, including custom investigation UI or a larger intake build. See reference-architecture.md for the test and pass/fallback outcomes. Candidate use: a source-based evidence comparison inside actual ChatGPT, replacing a text response for up to 60 seconds. It is optional presentation within the ChatGPT surface, not a third product surface or a new banking-app dependency.

Gate status: **NOT RUN**. Current announcement availability does not prove compatibility with the presentation account, selected Chat experience, custom Apex MCP tools, or source references. If the adapter is not yet available, test a clearly labeled synthetic snapshot for presentation only, record combined-tool proof as pending, and select the sourced-table fallback for now. After recording that decision, build only the minimal read adapter needed for the actual connection proof and repeat the combined check before further UI expansion. Lack of Intelligent UI must not cause a new architecture project.

## Next milestones

Customer-entry preview now exists at `/`: iPhone-style banking → charge details → voice or in-app reporting. Voice is explicitly pending; the in-app route saves only a browser-local draft. The analyst scaffold moved to `/ops`. Neither route creates a backend case yet; shared intake and case continuity remain future work. See demo-flow.md and decisions-and-artifacts.md for the exact state.

0. Complete the Intelligent UI readiness gate above and record use/fallback plus limits before further feature work.
1. Review the five preparation pieces and rehearse the executive story; finish a compact deck. Confirm local prototype usability. Work on a single actual ChatGPT retrieval proof alongside the presentation work rather than waiting for the complete intake build.
2. Build the OpenAI API-powered conversational in-app intake branch with relevant clarification and customer confirmation. Connect it to shared case creation and a minimal analyst queue, preserving the submitted statement and case ID. This implementation sequence does not change discovery-selected demo branching.
3. Implement the smallest read-only MCP adapter (get_case and get_evidence) after Gate 0, then add approved read tools for case/evidence behind real authentication and case-level permissions. Prove one actual ChatGPT connection. REST endpoints in this version are not an MCP implementation.
4. Replace fixed review text with grounded model investigation; retain sources and evidence snapshots. Put evaluator expectations outside model-visible records.
5. Add authenticated approval bound to actor, exact payload, case, snapshot and expiration. Stage-only model tools must not execute approvals. Add audit, timeout reconciliation and failure tests.
6. Build the alternative Realtime voice intake branch with the same confirmation and case-creation contract. Include the mandatory no-full-card-number/no-security-code opening and volunteered-data behavior in [sensitive-data-and-voice.md](sensitive-data-and-voice.md). Validate the raw-audio processing boundary separately from transcript masking; warning alone does not prove pre-transmission exclusion. Use server-side credentials and a shared case service; never ship API secrets to browser or GitHub.
7. Finalize a grounded customer disposition and separately track network recovery if in scope.
8. Execute adversarial evals, record model/tool/policy versions and traces, then rehearse with a labeled fallback.

## Sensitive-data requirement — October 20

Model-facing data is limited to necessary case/transaction references, metadata, optional last-four and cleared evidence/narrative. Full PAN/security codes are unnecessary. Implement and verify pre-transmission screening for text/tool/document content before claiming exclusion; define containment for accidental exposure. Direct voice needs a separate approved boundary or validated upstream audio controls. See [the locked specification and required checks](sensitive-data-and-voice.md). These are future requirements; Gate 0/build sequencing remains unchanged.

## Execution choices from preparation review

- Named integration baseline: Responses API for text intake, schema-constrained intake with server validation and customer confirmation; Realtime API over WebRTC for browser voice; MCP Streamable HTTP for actual ChatGPT case/evidence tools; existing Apex HTTP/SQLite service for local deterministic case transitions. See reference-architecture.md. Exact model IDs/snapshots must be selected and recorded before model tests; no evaluation or model choice is claimed complete.
- Proposed rehearsal default (not a replacement for locked discovery branching): text as primary live candidate, recording/simulation if not ready; voice as a clearly labeled prepared alternative. Customer answers still choose the path shown. Theo has not separately locked this execution default.
- Rehearse ChatGPT tool-call permission separately from Apex execution authority. A stage tool that saves a draft is a write; do not mark it read-only to suppress confirmation.
- Use the growth-capacity scenario in business-case.md alongside costs, without counting it as another additive monetary benefit. Keep portfolio scale and eligibility assumptions unvalidated until checked.
- Stop expanding prose after these changes. The next proof is one actual ChatGPT read-tool call, then finished slides/diagram export and a timed rehearsal.

## Accepted adversarial review actions

See [the approved review response](adversarial-review-response.md). The next action must carry a useful source-cited investigation brief: supported findings, conflicts, unresolved questions, and the specific specialist decision required. Analyst approval covers the exact brief and destination; separate read-back verifies the saved brief and request/assignment, not only status. This is required future behavior, not implemented functionality.

Use deterministic code for transaction associations; use the model for document interpretation, selecting what to verify, scoped investigation, and explaining evidence limits. Enrich evidence only for representative realism. Prepare both discovery branches; rehearse readable side-by-side surfaces as an option. Customer behavior and timing need validation; hiring scores are subjective and the proposed $1M–$3M+ uplift is unsupported. Keep economic claims tied to measured quality, effort, and costs.

## Evidence and domain corrections

Focus on a material source inconsistency, not an artificially decisive fraud signal. A requested internal lookup shows a processor-cited record belongs to a prior transaction. That undermines one supporting item but does not establish authorization or fraud. DEMO-01 permits a specialist referral, not a liability conclusion.

Do not mix credit/debit rules, assert cryptographic binding is universally required for CE3.0, treat absent SDK fields as failed authentication, assume network validation misses an incomplete history, or put a prewritten policy conclusion in raw evidence. Pin real rule versions before implementing network criteria.

## Public context

Apex is our proposed application, not an OpenAI packaged dispute product. Related official examples:
- https://openai.com/index/gradient-labs/ — banking procedure workflows and trajectory evaluations.
- https://openai.com/index/morgan-stanley/ — expert evaluation, retrieval, human-reviewed outputs.
- https://openai.com/index/introducing-chatgpt-financial-services/ — financial research/product context, not packaged dispute adjudication.

These precedents do not substantiate Apex ROI or imply access to their implementations.

