# Decisions and artifact index

Updated October 15, 2026. Consolidated from the available project conversation and repository, not a verbatim transcript or a claim that every historical attachment is archived here. This is the entry point for any agent continuing the work. Read demo-flow.md for the latest surface clarification, plan.md for strategy, and handoff.md for implementation verification. User instructions supersede these documents. Record future decisions here and update affected documents rather than leaving decisions only in chat.

## Decision register

| Topic | Status | Decision |
| --- | --- | --- |
| Discovery branch | Confirmed by Theo, October 15 | Customer discovery answers select voice (Realtime) or in-app reporting for the live demonstration. Show selected route in depth; both converge on the shared Apex case and analyst workflow. See discovery-and-outcomes.md. |
| Meeting goal | Locked | Demonstrate credible operational value and earn sponsorship for a bounded pilot. |
| Meeting timing | Locked baseline | 30 minutes: 3 discovery, 6 solution, 18 demonstration including questions, 3 value/pilot/ask. |
| Journey | Confirmed clarification | Customer sees charge in banking app, selects dispute via voice or in-app entry; Apex creates case and owns analyst queue; actual ChatGPT investigates the same case; Apex executes approved updates. See demo-flow.md. |
| OpenAI surfaces | Locked direction; integrations pending | Realtime customer intake and actual ChatGPT analyst investigation. Custom browser chat is not a substitute for actual ChatGPT. |
| Investigation | Locked | Compare sources, identify a material inconsistency, request a narrowly scoped internal record, reassess, approve a supported next action, verify execution. |
| Approval | Locked direction | Show approval and verification on both actions; explain first in depth and finish second in approximately 60–90 seconds. |
| Evidence | Locked principle | Raw observations with provenance, no prewritten conclusions; missing proof does not establish fraud. Requested evidence should improve judgment rather than provide an artificial smoking gun. |
| Current scenario | Prototype choice | Merchant-cited record is associated with a prior transaction; this undermines one item without establishing fraud or authorization. |
| Current endpoint | Implemented iteration choice; enhancement authorized | Specialist handoff remains the prototype endpoint. Upgrade its payload to a cited investigation brief with findings, conflicts, open questions, and the requested specialist decision. This is not the locked final financial outcome. |
| Adversarial review response | Authorized by Theo, October 15 | Follow adversarial-review-response.md: prove actual ChatGPT, shared case continuity, useful handoff, deterministic association checks, both discovery branches, and measured economics. Scores, invented baselines/timings, and $1M–$3M+ uplift are not accepted claims. |
| Final outcome | Open | Consumer disposition remains undecided; network recovery has separate status and authority. |
| Variant direction | Proposed | Customer-favorable primary path and stronger merchant evidence counterexample can test impartial reassessment; neither outcome is an automatic rebilling rule or locked fixture. |
| Economics | Illustrative assumptions | 60,000 eligible cases/year; 20 minutes baseline; 5 minutes saved; $60/hour; 5,000 hours and $300,000 annual gross capacity value before costs. Not measured savings. |
| Pilot | Proposed, not customer-approved | Six weeks contingent on readiness: baseline/access/evaluation, shadow testing, then limited assisted use if gates pass. |
| Scope discipline | Locked | Stop expanding banking/network mechanics; build the smallest coherent end-to-end workflow and iterate. |
| Public precedents | Supporting context | Gradient Labs operational workflows, Morgan Stanley evaluations, financial-services product context. Apex is our proposed solution, not an established OpenAI packaged dispute product. Links in plan.md; recheck current claims before presenting. |
| Development | User-selected | buildtheo/apex_demo; move to Codex in VS Code for local iteration. First make the browser preview usable. |

## Meeting outline retained from the discussion

Central message: Apex can help analysts reach a defensible next action with less investigation effort, while retaining control over decisions and execution.

### 0–3 minutes: customer context and discovery

Proposed audience: head of card operations, technology leader, and risk representative. Validate the hypothesis that gathering records and reconciling conflicts create investigation effort and rework.

Ask:
- When customers report an unfamiliar charge, do they typically call support or start in your banking app? Which experience most needs improvement? Use the answer to choose the demonstrated intake branch. See [running discovery and outcomes](discovery-and-outcomes.md).
- Where does your team lose more time today: gathering evidence, interpreting conflicts, or completing the disposition?
- What would make this pilot valuable: more capacity, less rework, faster customer responses, or improved decision consistency?

Adapt emphasis to the answer. Do not present assumed customer pain as measured evidence.

### 3–9 minutes: solution

Discovery-selected voice or in-app intake → Apex case/evidence services → actual ChatGPT investigation → analyst approval → Apex execution and verification.

Explain why the two OpenAI surfaces serve different jobs. Show Apex record ownership, identity, permission boundaries, and evidence provenance. Existing case systems remain authoritative. The hypothesis is that reduced evidence assembly and interpretation effort justifies integration and operating costs; do not claim unsupported competitive superiority.

### 9–27 minutes: one investigation

| Meeting time | Scene | Visible result |
| --- | --- | --- |
| 9–12 | Customer entry and discovery-selected voice or in-app report | Attributed statement, structured intake, same case ID |
| 12–14 | Explicit time jump; analyst queue and transition into actual ChatGPT | Authorized case and later evidence available |
| 14–19 | Compare customer account with supporting records | Cited facts, material inconsistency, specific information gap |
| 19–22 | Scoped evidence request | Exact request reviewed, approved, executed, independently verified |
| 22–25 | Clearly labeled response arrival and reassessment | Explain what changed, what remains uncertain, and approve next action |
| 25–27 | Verify operational result and questions | Authoritative state change and audit history |

Pivotal prompt: "What underlying evidence supports that assertion, and what would change your assessment?"

Show before/after: manual gathering and reconciliation versus supported investigation and approved execution. Keep detailed network mechanics, architecture depth, and adversarial results in backup material. Never present unexecuted evaluations as results.

### 27–30 minutes: value and pilot close

Use the illustrative capacity calculation above, explicitly deducting implementation and recurring costs for any net-value claim. Include follow-up work in time measurement so evidence requests cannot hide downstream effort.

Proposed pilot scorecard:
- 25% reduction in active investigation time for selected cases.
- Decision quality at least matches baseline under expert review.
- Follow-up workload and rework do not erase gains.
- No observed unauthorized actions, fabricated citations, or false completion claims in the agreed evaluation suite; this is an observed-test criterion, not a universal safety guarantee.
- Cost per case and adoption support expansion.

Proposed weeks 1–2: validate workflow, baseline, access, evaluation set. Weeks 3–4: shadow evaluations and failure remediation. Weeks 5–6: limited analyst-assisted use only if gates pass, then assess results.

Ask executives to sponsor the pilot, name operations and technology owners, agree scope and success criteria, involve risk/security, and provide approved evaluation data. No named owner, customer approval, or actual baseline has been established.

## Rejected or superseded design claims

Do not restore these from older chat drafts:
- Mandatory 10-business-day provisional credit presented as the credit-card Reg Z rule.
- Universal 10-day advance credit-reversal notice or automatically required evidence packet labeled adverse action.
- Cryptographic issuer device binding as a universal CE 3.0 requirement; absent SDK field as invalid authentication; shared cellular IP as automatically disqualified.
- Missing second historical transaction as the central trap in supposedly validated network evidence.
- CE eligibility automatically deciding consumer liability, permanent credit, or rebilling.
- Evidence requests pausing statutory/network clocks.
- Pre-arbitration filing meaning the entire case is closed.
- Combined internal-vault and VROL response labeled one authoritative issuer record without distinct provenance.
- Answer-bearing evidence fields such as epistemic_summary or policy_reassessment_impact supplying expected conclusions.
- Fixture field VERIFIED being treated as actual executed approval or independent verification.

Older proposed policy POL-DISP-104-v2.4, EVD-3DS-005 payloads, and UPHOLD_CLAIM_PRE_ARB / REBILL_CLOSE contracts were discussion drafts, not adopted executable specifications. Do not implement them verbatim. Verify applicable primary rules and version dates before introducing legal or network mechanics. The implemented DEMO-01 policy supports synthetic referral only.

## Artifact inventory

| Artifact | Location / status |
| --- | --- |
| Agent instructions | ../AGENTS.md |
| Run, preview, VS Code instructions | ../README.md and ../.vscode/tasks.json |
| Running discovery, branching flow, end-in-mind outcomes | discovery-and-outcomes.md |
| Locked strategy and milestones | plan.md |
| Customer-to-analyst flow and ownership | demo-flow.md |
| Decisions, full meeting outline, artifact index | This file |
| Recorded checks and local-development handoff | handoff.md |
| Adversarial hiring-manager review | adversarial-review-hm.md; subjective critique |
| Accepted adversarial review actions and corrections | adversarial-review-response.md |
| Backend prototype and synthetic state | ../server.py |
| Browser prototype | ../web/index.html, ../web/app.js, ../web/style.css |
| Existing workflow tests | ../tests/test_workflow.py |
| Runtime SQLite state | Local demo.sqlite, intentionally Git-ignored; not a source artifact |
| Original AAA interview PDF and merchant guide | Not committed; original uploads are excluded by repository instructions. The guide was merchant-side, not an issuer procedure. |
| Earlier pasted JSON/text drafts | Not archived verbatim here; superseded assumptions are recorded above. Do not assume these source attachments are available to a repo-only agent. |
| Final presentation deck and rehearsal recording | Not yet created in this repository |
| Actual ChatGPT/MCP, Realtime, authenticated integrations | Pending; not established by local REST endpoints |
| Executed model evaluations and traces | Pending; six recorded local workflow checks are not model evaluations |
| Hosted website | Not deployed; localhost requires a running server on the appropriate machine or port forwarding |

## Outstanding work and continuation

### Customer-entry implementation update — October 15, 2026

- Theo confirmed two customer roads: voice support, building on the previous M. Price experience, and an in-app dispute report. Both start from an iPhone-style Apex banking app and a selected transaction.
- `/` and `/banking` now show accounts, recent activity, VeloCraft transaction T-204, its details, and the two reporting choices. `/ops` retains the original analyst prototype.
- The in-app report saves a reason and statement in browser localStorage as a draft. It is not case submission, customer authentication, or a shared backend integration.
- Voice shows the selected transaction context and an explicit pending connection state. Realtime and phone transport have not been connected for Apex.
- The intended story remains banking → shared Apex case creation → assigned DMS queue → actual ChatGPT → human-approved, verified Apex updates. Case creation, queue, ChatGPT, and authenticated approval remain unfinished.
- Preserve an explicit later-stage transition before showing merchant evidence. Do not portray APX-001 as created by either preview entry route.
- New source artifacts: `../web/banking.html`, `../web/banking.css`, and `../web/banking.js`. They are served by the existing Python server.

1. Start locally in VS Code; run tests; confirm Theo can open and review the UI.
2. Make the three surfaces and case continuity clear without adding unnecessary scope.
3. Connect submitted intake to shared case creation and a minimal analyst queue, preserving the actual statement and case ID. Prove real authenticated, case-authorized evidence retrieval in actual ChatGPT.
4. Replace fixed comparisons with grounded investigation; preserve source and snapshot references.
5. Implement a source-cited investigation brief, authenticated human approval, and failure/duplicate/stale-state handling. Verify the exact saved brief and expected request/assignment, not just status. See adversarial-review-response.md.
6. Add customer entry and Realtime intake through the shared case service.
7. Resolve the final consumer outcome from balanced evidence and explicit synthetic policy; keep network recovery separate.
8. Execute adversarial evaluations, refine costs and pilot assumptions, create presentation/backup/fallback material, and rehearse the timed story.

Exact voice transport, ChatGPT launch mechanism, deployment host, final disposition, and actual pilot owners remain open. Do not block the first local review on these choices. Keep repository documentation synchronized with implementation and clearly distinguish newly executed checks from historical verification reports.
