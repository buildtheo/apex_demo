# Locked direction and implementation sequence

## Customer meeting

Fictional US consumer-credit issuer Apex. Thirty-minute meeting: 3 minutes customer/discovery, 6 solution, 18 demo with questions, 3 value/pilot/ask. Separate 15-minute reflection.

Demo direction: discovery selects voice (Realtime) or in-app intake; explicit later investigation stage; actual ChatGPT opens the same case; analyst compares evidence, asks a follow-up, requests a scoped internal record, reassesses, and approves a defined next action with independent verification. First approval explained in depth, second concise. Final consumer disposition is still open.

Executive outcome: sponsorship of a bounded pilot, operations and technology owners, risk participation, and agreed validation work. Proposed six weeks: baseline/access/evals, shadow testing, then limited assisted use if gates pass. Illustrative assumptions: 60,000 eligible cases/year, 20 minutes baseline, 5 minutes saved, $60/hour = 5,000 hours / $300,000 gross capacity value before costs. These are not measured results. Test quality, follow-up workload, cost, adoption, and controls alongside time.

Maintain the [running discovery table, branching flow, and end-in-mind outcomes](discovery-and-outcomes.md). The selected intake path changes with the customer's answer; both paths converge on the same case and analyst investigation. The executive close remains pilot sponsorship.

## Scope of this first build

One persistent synthetic case, inspectable evidence, fixed guided comparison, approved internal lookup request, simulated response, reassessment, approved specialist handoff, independent read-back. The handoff provides an iteration point while final financial disposition remains open. No credit or network transaction is performed.

## Next milestones

Customer-entry preview now exists at `/`: iPhone-style banking → charge details → voice or in-app reporting. Voice is explicitly pending; the in-app route saves only a browser-local draft. The analyst scaffold moved to `/ops`. Neither route creates a backend case yet; shared intake and case continuity remain future work. See demo-flow.md and decisions-and-artifacts.md for the exact state.

1. Run and inspect the prototype with Theo; simplify confusing screens.
2. Add approved read tools for case/evidence behind real authentication and case-level permissions. Prove one actual ChatGPT connection. REST endpoints in this version are not an MCP implementation.
3. Replace fixed review text with grounded model investigation; retain sources and evidence snapshots. Put evaluator expectations outside model-visible records.
4. Add authenticated approval bound to actor, exact payload, case, snapshot and expiration. Stage-only model tools must not execute approvals. Add audit, timeout reconciliation and failure tests.
5. Add Realtime intake using server-side credentials and a shared case service; never ship API secrets to browser or GitHub.
6. Finalize a grounded customer disposition and separately track network recovery if in scope.
7. Execute adversarial evals, record model/tool/policy versions and traces, then rehearse with a labeled fallback.

## Evidence and domain corrections

Focus on a material source inconsistency, not an artificially decisive fraud signal. A requested internal lookup shows a merchant-cited record belongs to a prior transaction. That undermines one supporting item but does not establish authorization or fraud. DEMO-01 permits a specialist referral, not a liability conclusion.

Do not mix credit/debit rules, assert cryptographic binding is universally required for CE3.0, treat absent SDK fields as failed authentication, assume network validation misses an incomplete history, or put a prewritten policy conclusion in raw evidence. Pin real rule versions before implementing network criteria.

## Public context

Apex is our proposed application, not an OpenAI packaged dispute product. Related official examples:
- https://openai.com/index/gradient-labs/ — banking procedure workflows and trajectory evaluations.
- https://openai.com/index/morgan-stanley/ — expert evaluation, retrieval, human-reviewed outputs.
- https://openai.com/index/introducing-chatgpt-financial-services/ — financial research/product context, not packaged dispute adjudication.

These precedents do not substantiate Apex ROI or imply access to their implementations.
