# Apex customer and qualification brief

Prepared October 15, 2026; provider-selection context updated October 19. Rehearsal scenario v2. Every customer attribute below is a proposed fictional assumption unless marked as implemented. These are inputs for discovery, not facts learned from a bank. No executive commitment, customer policy, deadline, budget, or result has been established.

## Customer in one paragraph

Apex is a fictional US regional bank with a consumer credit-card business. For rehearsal, assume $40 billion in bank assets, one million active credit-card accounts, and a card-operations group of 40 analysts plus specialist and quality reviewers. Assume 120,000 annual disputes, of which 60,000 are in the selected evidence-intensive investigation class. Apex earns interest and fees from its card business; customer trust, service cost, and defensible treatment of disputed charges matter. These scale assumptions explain the audience and economics; do not imply all disputes require this investigation or that the whole operations group serves only this case class.

## Familiar merchant name — locked October 20

Theo requested a real, memorable merchant name. Use JCPenney in the synthetic scenario; this is not an allegation about actual purchases, customer behavior, evidence or merchant practices. The current customer statement acknowledges an earlier clothing purchase while disputing the new $648.50 purchase. Lead with merchant/amount/date in narration; retain case/transaction/source IDs as secondary traceability. The prior purchase's amount/date and corroborating ledger detail still need to be defined before displaying them as verified evidence. Recognizing the merchant does not itself establish authorization of the new purchase. The disputed purchase belongs to Martha Rivera; Barbara is the analyst following the case. The weak supporting packet is a fictional merchant-processor export, not a JCPenney statement or submission. See [the opening disclosure and story introduction](meeting-outline.md#opening-discovery--october-20-preparation-decision).

## Workflow and systems

| Item | Proposed scenario |
| --- | --- |
| Target business unit | Consumer Card Operations |
| Case class | Unrecognized online credit-card purchase requiring evidence review |
| Customer | Martha Rivera; JCPenney transaction T-204, $648.50; synthetic details match the prototype |
| Analyst | Barbara, the fictional dispute analyst in the talk track; not a new authenticated prototype user |
| Entry | Apex banking app displayed in a browser iPhone frame; text or voice conversation selected through discovery |
| Operational record | Legacy Apex DMS with supported integration interfaces and no native MCP; Python/SQLite/HTTP stand-in in this repo. Apex builds/operates the adapter; fictional assumption locked October 20. |
| Evidence systems | Card ledger, customer intake transcript, synthetic export from a fictional merchant processor, internal authentication-reference service |
| Identity and governance | Existing enterprise identity provider, case assignment/ACLs, privacy/security review, QA and risk owners; target integrations pending |
| Shared workflow | Customer-confirmed intake -> case and queue -> explicit later evidence stage -> actual ChatGPT investigation -> approved evidence request -> reassessment -> approved next action -> saved-effect verification |

## Legacy integration assumption — locked October 20

Assume Apex keeps its legacy DMS, supported APIs or approved integration middleware, and enterprise identity. It has no native MCP endpoint. Apex owns the adapter connecting actual ChatGPT to scoped DMS/evidence operations, enforcing delegated-user and case/action permissions and minimizing returned fields. Existing records and execution authority remain with the bank. Exact vendor/interface coverage is unspecified and must be validated in discovery. Read [the architecture decision](reference-architecture.md#legacy-dms-integration--locked-october-20). This is fictional scenario authorship, not a real-bank finding or completed implementation. MCP support alone would not establish embedded vendor AI; evaluate native AI separately if present.

## Existing AI footprint and why OpenAI

For this rehearsal, assume ChatGPT Enterprise is already deployed for employee productivity. Its original selection rationale combines useful model capability with acceptable privacy, security, governance and safety requirements. Card Operations evidence and actions are not yet connected. These are explicit fictional premeeting assumptions, not real bank discovery or approval of API processing, sensitive case data or write tools.

The recommendation is to extend that foundation into a bounded Card Ops pilot, retaining Apex's DMS and execution authority. The [Why OpenAI customer selection brief](why-openai.md) covers the full buying rationale, verified product controls, alternatives, responsibility boundaries and a one-minute spoken answer. Responsible account preparation establishes installed platforms, adoption and approved uses before the executive meeting; discovery validates the priority and new-use constraints.

## Pain, urgency, and end in mind

Working hypothesis: evidence assembly and reconciliation consume analyst time, while incomplete handoffs create repeat work. The urgency assumption is that case volume will rise 15% over the next planning year while capacity remains flat. This is proposed scenario pressure, not an actual forecast or a regulatory event. Ask what is driving urgency; replace or drop the assumption if the customer gives a different answer.

The meeting should earn sponsorship for workflow observation and evaluation design, with operations and technology owners, risk participation and a review of the findings. A bounded pilot is a conditional proposal, subject to validated baseline, permitted data/actions, evaluation results and readiness; see [discovery-to-pilot sequencing](discovery-to-pilot.md). The proposed primary value lever is released operational capacity with decision quality preserved. A specialist referral is useful only if the verified investigation package reduces work across the full chain. It is not a final customer resolution.

## Stakeholder map

Roles are proposed; no individual is appointed.

| Stakeholder | What they need to believe | Discovery / proof | Proposed pilot responsibility |
| --- | --- | --- | --- |
| Head of Card Operations: potential sponsor | Value exceeds integration effort without displacing work into another queue | All-role handling time, downstream rework, readable case brief | Own scope and value decision |
| Technology leader / application owner | Fits existing records, identity, and integration constraints | Architecture, access enforcement, controlled tool contracts, failure recovery | Own technical delivery and support |
| Risk, compliance, and privacy representatives | Appropriate customer treatment and data use; understandable boundaries | Sourced regulatory mapping, redacted data flow, evaluation gates | Define release conditions and escalation |
| Analyst lead / potential champion | Fits daily work and preserves judgment | Guided case walkthrough, edit/reject behavior, confirmation and citations | Recruit testers, validate usability, coach users |
| Specialist and QA leads | Receives a usable package; decision quality is observable | Findings, conflicts, open questions, exact persisted brief | Grade cases and measure downstream effort |
| Procurement / vendor management | Commercial and data-processing terms are acceptable | Cost ranges, contractual controls, supplier review | Validate terms before expanded use |

## Qualification and discovery

Use the running table in discovery-and-outcomes.md. Three opening questions are enough: which intake friction matters, where analyst effort is lost, and what meaningful improvement looks like and how it is measured. The answer selects voice versus text and changes emphasis. Both use Platform/APIs followed by ChatGPT. A prerecorded or simulated alternative must be labeled; both modes need preparation, but both need not be implemented live to meet the assignment.

| Qualification area | Ask | What changes the proposal |
| --- | --- | --- |
| Value and urgency | What volume, backlog, or capacity event makes this important now? | Baseline and primary value lever; no urgency means a smaller discovery engagement |
| Sponsor and decision process | Who can fund a pilot and who must approve production use? | Owners, decision date, and review gates; do not invent a budget |
| Workflow fit | Which case class and handoff generate repeat work? | Narrow the pilot to a measurable class |
| Access and security | Can approved synthetic/deidentified records and existing APIs be made available? | Start read-only/shadow if writes or real data are blocked |
| Alternatives | Based on the premeeting review of installed capabilities, which baseline and native AI option should the pilot beat? | Use the same task set, costs, quality measures and non-negotiable controls; do not ask about basic platform presence as if unprepared |
| Success | What result would justify expansion or stopping? | Agree economic threshold and quality/control guardrails |

An acceptable next step is not merely interest: agree a sponsor and proposed participants for a workflow ride-along/evaluation-design session, a case class, permitted observation/access work and a follow-up review. Establish baseline, boundaries, expected behavior and evaluation criteria before asking for a pilot launch. If these are absent, name the gaps; do not claim a qualified or approved pilot.
