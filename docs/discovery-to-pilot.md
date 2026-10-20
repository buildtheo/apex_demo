# From workflow discovery to an evaluated pilot

Locked by Theo October 20, 2026 for the fictional Apex interview scenario. This is approved preparation wording and sequencing, not a completed Gemba walk, customer commitment, permitted-data approval or evaluation result.

## Opening: establish the outcome

Ask: “What would a meaningful improvement look like for your team, and how do you measure that today?”

Follow up: “What would need to stay at least as good?”

Let the customer identify the priority before proposing a target. Capacity is the working hypothesis, with investigation quality preserved and no increased specialist/QA burden. Revise the hypothesis if discovery changes it. This replaces the premature opening ask, “What would make a pilot worth sponsoring?”

## Close: agree discovery and evaluation design first

The immediate ask is sponsorship of workflow observation and evaluation design, with operations and technology owners and risk participation. A pilot can be presented as a conditional proposal; do not ask for an unconditional launch commitment before validating the work, access, economics and controls.

Locked spoken wording:

“I'd start by observing the work alongside analysts and specialist reviewers. Together, we'd establish the baseline, define permitted data access and actions, and identify where human judgment must remain.

“We'd then agree an evaluation set and success criteria: evidence fidelity, investigation quality, total handling effort and behavior when something goes wrong. Those results would determine whether we proceed to shadow mode and a limited pilot.”

Agree who will participate, which case class to observe, permitted access and a follow-up review of the findings. Observation can justify a revised approach or no pilot. Exact dates, owners and thresholds remain to be agreed; none are customer commitments.

## What the technical terms mean

| Term | Make it concrete |
| --- | --- |
| Boundaries | Data the system may access; actions it may prepare or execute; decisions retained by authorized people. Specify bank-side authorization and the human escalation path. |
| Evaluations | Representative cases, expected behavior, domain reviewers and comparison with today's workflow. Include incomplete/misleading evidence, conflicting sources and failure cases. |
| Success criteria | Total active effort across intake, analysts, specialists and QA; source-supported findings; acceptable investigation quality; downstream rework; cost and adoption. Targets remain proposals until agreed. |
| Release gates | Evidence required before moving from approved-data offline evaluation to shadow mode, then limited assisted use. Readiness, access and workflow approval precede real-data use. |
| Fallback and stopping | Defined behavior for insufficient evidence, denied access, failed actions and serious control failures. Agree stop authority, manual handling and recovery before assisted use. |

Use plain customer language in discovery and precise technical language in architecture, evaluation and reflection. “Quality” alone is too broad; define what reviewers score. “Human control” alone is too broad; name decisions, authority, permitted actions and fallback.

## Workflow evaluation talk track - locked October 20

“I'd start by observing analysts and establishing the baseline. Then we'd agree on representative cases, failure cases and what good looks like with Card Operations and risk reviewers. We'd evaluate the full workflow before proposing limited assisted use. The question is whether Barbara completes the work with less effort and at least the same quality - not whether the model produces a convincing answer.”

**The demo illustrates the workflow; the evaluation determines whether Apex should use it.**

| Evaluation area | What Apex would check |
| --- | --- |
| Evidence quality | Correct transaction; accurate citations; conflicting records and missing evidence explicit; later responses not asserted before retrieval/release. |
| Investigation judgment | Useful, scoped additional evidence requests; reassessment when the record changes; no recommendation of credit solely because the amount is below $1,000 or authentication is missing. Include cases where credit is unsupported or requires another authorized reviewer. |
| Permissions and execution | Unauthorized reads/actions denied; fresh human approval bound to exact case, evidence version, account, amount and payload; policy/authority enforced by Apex; duplicates prevented; posted credit and case decision read back before claiming success. |
| Operational value | Compare total active effort against the observed baseline, including follow-up and downstream review/rework, while preserving decision quality. Distinguish active effort from external waiting and assess cost/adoption. |

Apply this to the [current consumer-resolution ending](case-resolution.md), not only the superseded specialist handoff. The fictional below-$1,000 rule describes Barbara's authority when evidence supports a credit; it is not an automatic-credit rule. Review evidence and action outcomes across representative and challenging cases, not just the happy path.

The earlier technical talk track remains: ChatGPT assembles/proposes; Barbara reviews and may request more evidence; Apex authorizes, executes and records. Say authorized analysts with permitted cases, not “only Barbara.” OAuth establishes identity; Apex enforces case and action permission on each MCP call. Approval binds the exact current action; posting uncertainty requires reconciliation, and saved-effect verification precedes customer confirmation. Bank-authorized approval is presented in Apex unless an in-ChatGPT approval integration is actually proven.

Use the scenario's 20-minute active-effort baseline and proposed 25% reduction as assumptions pending measurement. Do not replace them with an unsupported claim of hours saved. Current code does not implement credit posting; no Gemba, passing evaluation or deployment approval is established by this preparation update.

## Observation and evaluation sequence

1. Observe intake, investigation and specialist/QA handoffs with the people doing the work. Validate tools, missing information and workarounds. Separate active effort from external waiting.
2. Establish the baseline, eligible case class, approved data/access, owners, costs and system/action boundaries. These are discovery outputs, not facts established by the demo.
3. Agree representative and challenging evaluation cases, expected behavior, domain review and acceptance criteria; compare the existing process with the proposed workflow.
4. Evaluate using permitted data. Use the results and readiness review to decide whether to proceed to shadow mode.
5. Consider limited assisted use only after the applicable quality, access, execution, operational and cost gates pass. Retain human review and manual fallback; expand, revise or stop based on evidence.

The existing six-week outline is an illustrative contingent sequence, not a promised launch date. Specific tests and proposed scorecards remain in [meeting-outline.md](meeting-outline.md). Local workflow tests do not establish passing model evaluations.

Gemba establishes what to build and measure. Evaluations test whether the proposed system works within agreed boundaries. No real Apex Gemba has occurred; Theo's OT and bank customer experiences remain separate real accounts.

This updates preparation and the executive ask only. It does not authorize feature building, complete Intelligent UI Gate 0, establish integrations or produce model-test results.
