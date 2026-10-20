# Start here: Apex agent handoff

Last consolidated October 15, 2026, 11 p.m. America/Los_Angeles. Theo is ending the session and wants any agent to continue from repository state. Read AGENTS.md, then this page. The repo contains the consolidated decisions and work; the complete chat and original interview uploads are not archived here.

## Preparation update — October 20: discovery and unexpected answers

Theo locked the [focused, correctable discovery approach](discovery-and-outcomes.md#discovery-approach--locked-october-20-2026). Ask about the full intake process before selecting a relevant prepared phone/in-app route; understand analyst effort and pilot value; adapt if the priority is waiting, intake quality, investigation quality, existing automation or another problem. Apex remains the fictional issuer. These are preparation decisions, not collected customer answers or new execution proof. The feature-building gate and implementation status below are unchanged.

## Preparation update — October 19: Why OpenAI

Theo requested a substantive enterprise buying rationale in the interview brief. Read [Why OpenAI for Apex](why-openai.md), then the updated customer profile, objection prep and slide 2 cue. Security, governance and safety are central alongside capability, adoption, integration and total cost. Existing ChatGPT Enterprise productivity use and the original selection rationale are explicitly fictional premeeting context; new case-data/API/action approvals remain separate. No implementation, connection, model evaluation or readiness gate changed.

## Locked demo

- Thirty-minute customer meeting: 3 minutes discovery, 6 solution, 18 demonstration/Q&A, 3 pilot/value/ask; 15-minute reflection afterward.
- Two selected OpenAI product surfaces: **Platform/APIs** for customer intake and **actual ChatGPT** for analyst investigation.
- Three possible experiences: Realtime voice OR an API-powered text conversation in the banking app, followed by ChatGPT. Discovery selects the intake path. Prepare both; both need not be live. Label any recording/simulation. Text-primary is a rehearsal proposal, not a replacement for discovery.
- Show the customer app in a browser iPhone frame. No native iOS build is required.
- Customer confirms intake; Apex owns the case, queue, records, permissions, and execution. Use the same returned case ID across surfaces and an explicit time jump before later merchant evidence.
- Analyst investigates, requests one scoped record, reassesses, and approves a supported next action. Show approval and persisted-effect verification for both actions; explain the first and keep the second concise.
- Current endpoint is specialist review. Final consumer disposition and network recovery remain separate and open. Missing proof does not establish fraud.
- Executive close: sponsor a bounded pilot with owners and measurable gates. Keep assumptions explicit.

## Implemented and checked

The Python/SQLite prototype runs locally with python3 server.py. Banking shell at / or /banking; fixed analyst workflow at /ops, seeded case APX-001. The banking form saves only a browser-local draft and voice is disabled. Shared intake/case creation, analyst queue, authenticated permissions, API conversation, Realtime, MCP, and actual ChatGPT are not connected.

Commit 8ed10ea incorporated the supplied evidence-gating repair and added stricter request identity/case checks and stale-assessment protection. Its 26 tests passed in this session, including HTTP, Node verifier, and minimal-DOM race checks. This is not a model evaluation, production-security proof, or real-browser validation. Saved handoff is still a short fixed payload, not yet the full cited investigation brief.

## Next action: do not skip Gate 0

Theo requested an Intelligent UI readiness check **before further feature building**. Detailed steps/outcomes are in reference-architecture.md and plan.md. Status: NOT RUN.

Check the actual presentation account/mode and a source-based comparison. If no adapter yet, label pasted-snapshot tests, record combined-tool proof pending, and choose the sourced-table fallback for now. A fallback is a valid outcome. After recording the gate, build only the minimal get_case/get_evidence adapter and prove a real ChatGPT call. Repeat the combined UI/tool check before any additional UI investment. Do not create a UI framework to force an optional capability.

Then finish a renderable six-slide deck, export the architecture diagram, and rehearse. Avoid another general planning expansion. Exact API model configurations must be selected and recorded before model evaluation.

## Find the work

| Need | Read |
| --- | --- |
| Complete decision register and artifact inventory | decisions-and-artifacts.md |
| Customer flow, system ownership, browser iPhone format | demo-flow.md |
| Running discovery table and branching flow | discovery-and-outcomes.md |
| Sequence and constraints | plan.md |
| Scenario, stakeholder map, qualification | customer-profile.md |
| Diagram, data flow, regulatory sources, named APIs, Gate 0 and connection proof | reference-architecture.md |
| Before/after, costs, downside, growth-capacity math, instrumentation | business-case.md |
| Verified primary market sources and cost/mix caveat | market-evidence.md |
| Enterprise provider-selection rationale, trust controls, alternatives and spoken answer | why-openai.md |
| Spoken positioning and competitive objections | objection-prep.md |
| Six-slide timing, demo cues, evals, governance, enablement | meeting-outline.md |
| Detailed executed checks and remaining implementation limits | handoff.md |
| Original critique and accepted corrections | adversarial-review-hm.md and adversarial-review-response.md |

## Economics and sources: do not overclaim

Original full-coverage example: 60,000 eligible cases, 20 -> 15 minutes, $60/hour = $300k gross capacity. At assumed 75% adoption, gross is $225k; $80k recurring and $100k one-time placeholders produce $45k year-one modeled net capacity value. Half capture makes it negative $67.5k. These are assumptions, not cash savings or quotes.

The forward-growth scenario has 69,000 cases and 18,687.5 expected hours with adoption, versus 23,000 without change and 20,000 today. Do not add this scenario's monetary benefit to the constant-volume benefit.

Visa's primary announcement supports 106 million global disputes in 2025 and 35% growth since 2019. Mastercard publishes $9.08-$10.32 average US FI processing cost. Neither validates Apex volume/complexity. The 50% complex-case share and $20 baseline need reconciliation; market-evidence.md explains why the subset label alone is insufficient. Network AI tools are a real competitive discovery topic.

## Remaining risks and honest status

Host/origin configuration for the actual deployment, framing protection, stale database handling, reset controls, privacy/retention configuration, real identity/ACLs, full brief, model evals, deck, rehearsal, and both OpenAI connections remain unfinished. ChatGPT staging permission is separate from Apex business authority; never mark a draft-saving tool read-only to suppress confirmation.

Do not claim all interview criteria are satisfied merely because the documentation covers them. Update this handoff and the decision register when results or user decisions change. Preserve public-repo synthetic-data boundaries.
