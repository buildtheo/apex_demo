# Apex customer and qualification brief

Prepared October 15, 2026. Rehearsal scenario v1. Every customer attribute below is a proposed fictional assumption unless marked as implemented. These are inputs for discovery, not facts learned from a bank. No executive commitment, customer policy, deadline, budget, or result has been established.

## Customer in one paragraph

Apex is a fictional US regional bank with a consumer credit-card business. For rehearsal, assume $40 billion in bank assets, one million active credit-card accounts, and a card-operations group of 40 analysts plus specialist and quality reviewers. Assume 120,000 annual disputes, of which 60,000 are in the selected evidence-intensive investigation class. Apex earns interest and fees from its card business; customer trust, service cost, and defensible treatment of disputed charges matter. These scale assumptions explain the audience and economics; do not imply all disputes require this investigation or that the whole operations group serves only this case class.

## Workflow and systems

| Item | Proposed scenario |
| --- | --- |
| Target business unit | Consumer Card Operations |
| Case class | Unrecognized online credit-card purchase requiring evidence review |
| Customer | Elena Rivera; VeloCraft transaction T-204, $648.50; synthetic details match the prototype |
| Entry | Apex banking app displayed in a browser iPhone frame; text or voice conversation selected through discovery |
| Operational record | Existing Apex dispute-management system (DMS), mocked by this repository |
| Evidence systems | Card ledger, customer intake transcript, merchant documents, internal authentication-reference service |
| Identity and governance | Existing enterprise identity provider, case assignment/ACLs, privacy/security review, QA and risk owners; target integrations pending |
| Shared workflow | Customer-confirmed intake -> case and queue -> explicit later evidence stage -> actual ChatGPT investigation -> approved evidence request -> reassessment -> approved next action -> saved-effect verification |

## Pain, urgency, and end in mind

Working hypothesis: evidence assembly and reconciliation consume analyst time, while incomplete handoffs create repeat work. The urgency assumption is that case volume will rise 15% over the next planning year while capacity remains flat. This is proposed scenario pressure, not an actual forecast or a regulatory event. Ask what is driving urgency; replace or drop the assumption if the customer gives a different answer.

The meeting should earn sponsorship for a bounded pilot, with operations and technology owners, risk participation, and agreed measures. The proposed primary value lever is released operational capacity with decision quality preserved. A specialist referral is useful only if the verified investigation package reduces work across the full chain. It is not a final customer resolution.

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

Use the running table in discovery-and-outcomes.md. Three opening questions are enough: which intake friction matters, where analyst effort is lost, and what outcome warrants a pilot. The answer selects voice versus text and changes emphasis. Both use Platform/APIs followed by ChatGPT. A prerecorded or simulated alternative must be labeled; both modes need preparation, but both need not be implemented live to meet the assignment.

| Qualification area | Ask | What changes the proposal |
| --- | --- | --- |
| Value and urgency | What volume, backlog, or capacity event makes this important now? | Baseline and primary value lever; no urgency means a smaller discovery engagement |
| Sponsor and decision process | Who can fund a pilot and who must approve production use? | Owners, decision date, and review gates; do not invent a budget |
| Workflow fit | Which case class and handoff generate repeat work? | Narrow the pilot to a measurable class |
| Access and security | Can approved synthetic/deidentified records and existing APIs be made available? | Start read-only/shadow if writes or real data are blocked |
| Alternatives | What existing case-system or AI capability would we compare against? | Use the same task set, costs, and quality measures |
| Success | What result would justify expansion or stopping? | Agree economic threshold and quality/control guardrails |

An acceptable next step is not merely interest: obtain a sponsor, proposed owners, a bounded class, access-validation work, and a scheduled review of the pilot scorecard. If these are absent, name the gaps and do not claim a qualified pilot.
