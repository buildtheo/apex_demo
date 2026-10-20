# Decisions and artifact index

Updated October 20, 2026. Consolidated from the available project conversation and repository, not a verbatim transcript or a claim that every historical attachment is archived here. This is the entry point for any agent continuing the work. Read demo-flow.md for the latest surface clarification, plan.md for strategy, and handoff.md for implementation verification. User instructions supersede these documents. Record future decisions here and update affected documents rather than leaving decisions only in chat.

## October 20 requirement — sensitive card data and voice warning

Theo requested locking [the PAN/field boundary and accidental-exposure handling](sensitive-data-and-voice.md), and explicitly required a voice opening telling customers never to give their full card number or security code because those are unnecessary for this selected-transaction task. Saved exact wording, never-request/never-repeat behavior, existing synthetic fields, pre-transmission text/tool/document requirements, direct-Realtime audio limitations, incident containment and future test cases. Current fixtures contain last-four only, but the free-text form has no detector and no model/voice connection exists. Do not claim automatic model redaction/forgetting, warning-only protection, passing evals or production compliance. This records requirements; it does not resume feature building or complete Gate 0.

## October 20 clarification — observation, boundaries and evaluations before pilot launch

Theo challenged the premature pilot ask and requested locking the [revised next-step language and definitions](discovery-to-pilot.md). Opening discovery asks what meaningful improvement looks like and how it is measured. The immediate close seeks sponsorship of Gemba/ride-along observation, baseline validation, data/action boundaries and evaluation design with domain reviewers. A bounded pilot remains proposed conditionally; evaluation results and readiness gates determine shadow mode and limited assisted use. Define source fidelity, investigation quality, total effort, downstream rework, failures, fallback and stopping rather than rely on vague “quality” or “human control.” No real Apex observation, customer launch approval, new implementation or model result is inferred. This supersedes earlier immediate pilot-sponsorship wording while retaining the contingent rollout outline.

## October 20 preparation decision — correctable discovery and unexpected answers

Theo requested locking the [focused discovery approach](discovery-and-outcomes.md#discovery-approach--locked-october-20-2026): broaden intake discovery beyond the two prepared demo modes, test the analyst-effort hypothesis with room for correction, listen and adapt. Saved responses for external merchant waiting, incomplete intake, quality-first priorities, existing evidence automation and problems outside scope. These change emphasis, metrics or the proposed next step rather than force the same pitch. Theo reaffirmed Apex as the fictional issuer; Visa remains network context and Apex volumes/growth remain assumptions. More workload per analyst does not itself imply increased effort per case. No AI-driven-fraud forecast or customer dissatisfaction claim was adopted. This is documentation-only preparation; no actual discovery, build resumption, runtime result, Gate 0 or model evaluation is established.

## October 19 preparation decision — customer selection rationale

Theo explicitly requested the reasons a customer selects OpenAI over another provider in the interview brief, emphasizing security, governance and safety. [Why OpenAI for Apex](why-openai.md) now covers capability, privacy, security, governance, safe deployment, adoption, integration, total cost and supplier/deployment fit, with official sources and a competitive decision guide.

For this fictional rehearsal, use the premeeting baseline that ChatGPT Enterprise already serves employee productivity and was selected for capability plus enterprise trust requirements; Card Ops evidence/actions are not connected. This is authored scenario context, not actual customer discovery, a completed vendor review or permission for sensitive data, API processing or writes. Review installed platforms and approved uses before a real executive meeting. Product controls and Apex-owned safeguards remain distinct. Updated customer profile, objection prep and slide 2 cue route to the brief. This documentation update does not resume building, complete Gate 0 or establish integration/model-evaluation proof.

## Decision register

| Topic | Status | Decision |
| --- | --- | --- |
| Customer presentation format | Locked by Theo, October 15 | Run the Apex iPhone app experience in the browser as an iPhone-style simulator. Browser mobile UI, not a native iOS build or Apple iOS Simulator. No native packaging requirement; keep the phone viewport usable for customer conversation. |
| Discovery branch | Confirmed by Theo, October 15 | Customer discovery answers select voice (Realtime) or in-app reporting for the live demonstration. Show selected route in depth; both converge on the shared Apex case and analyst workflow. See discovery-and-outcomes.md. |
| Product-surface requirement | Verified against original brief | Selected surfaces are ChatGPT and Platform/APIs. Realtime voice and API text are alternative customer experiences within Platform/APIs. The brief does not require both modes live; prepare both discovery branches with honest simulation/fallback labels. |
| Preparation pack | Created; scenario details and targets proposed | customer-profile.md, reference-architecture.md, business-case.md, objection-prep.md, and meeting-outline.md cover the executive/commercial work and map remaining proof. Assumptions are explicit; neither a finished deck nor a passing pilot is claimed. |
| Intelligent UI readiness | Required by Theo before further feature building | Run Gate 0 in reference-architecture.md; record availability, source fidelity, use/fallback and combined-tool limits. Native UI is optional within ChatGPT. If no adapter yet, record combined proof pending, select sourced table for now, then build only the minimal read adapter before any further UI expansion. |
| Post-preparation review | Accepted corrections; execution defaults proposed | Add growth-capacity scenario, write-tool permission narration, named API baseline, and spoken OpenAI position. Text-primary/voice-alternative rehearsal default remains a proposal; discovery branching stays locked. Account/dispute scale is not benchmark-validated. |
| Market evidence and investment case | Locked by Theo, October 15 | Use primary Visa 106m global disputes in 2025 / 35% since 2019 and Mastercard published $9.08-$10.32 average US FI processing cost as context. Apex volume, complex-case share/cost and savings remain assumptions. The subset label does not by itself reconcile the 50% eligible mix and $20 baseline. See market-evidence.md. |
| Agent continuity | Required by Theo | Start at START-HERE.md, then follow the linked decision register, current handoff, preparation pack, and Gate 0. Preserve implemented/proposed/unproven distinctions. |
| Meeting goal | Locked; October 20 clarification | Demonstrate the value hypothesis and earn sponsorship for workflow observation, baseline/boundary validation and evaluation design. Pilot launch is conditional on findings, evaluation results and readiness. |
| Meeting timing | Locked baseline | 30 minutes: 3 discovery, 6 solution, 18 demonstration including questions, 3 value/pilot/ask. |
| Journey | Confirmed clarification | Customer sees charge in banking app, selects dispute via voice or in-app entry; Apex creates case and owns analyst queue; actual ChatGPT investigates the same case; Apex executes approved updates. See demo-flow.md. |
| OpenAI experiences | Locked by Theo, October 15; integrations pending | Three potential experiences: Realtime voice support; OpenAI API-powered conversational text agent in the banking web/iPhone app; analyst in actual ChatGPT. Discovery selects voice OR text agent, then shared ChatGPT investigation. Each path includes two OpenAI-powered experiences. A plain form is only a scaffold/fallback. |
| Customer confirmation | Locked demo flow | Either intake agent clarifies the selected transaction and presents structured intake for customer confirmation before Apex case creation. This is distinct from analyst approval of consequential investigation actions. |
| Investigation | Locked | Compare sources, identify a material inconsistency, request a narrowly scoped internal record, reassess, approve a supported next action, verify execution. |
| Approval | Locked direction | Show approval and verification on both actions; explain first in depth and finish second in approximately 60–90 seconds. |
| Evidence | Locked principle | Raw observations with provenance, no prewritten conclusions; missing proof does not establish fraud. Requested evidence should improve judgment rather than provide an artificial smoking gun. |
| Current scenario | Prototype choice | Merchant-cited record is associated with a prior transaction; this undermines one item without establishing fraud or authorization. |
| Current endpoint | Implemented iteration choice; enhancement authorized | Specialist handoff remains the prototype endpoint. Upgrade its payload to a cited investigation brief with findings, conflicts, open questions, and the requested specialist decision. This is not the locked final financial outcome. |
| Adversarial review response | Authorized by Theo, October 15 | Follow adversarial-review-response.md: prove actual ChatGPT, shared case continuity, useful handoff, deterministic association checks, both discovery branches, and measured economics. Subjective scores, unsupported baselines/timings presented as facts, and $1M–$3M+ uplift are not accepted claims. Clearly labeled baseline/timing assumptions are permitted. |
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
- Walk me through how customers initiate disputes today. Which channels account for most of the volume, and where does intake create the most friction? Agree a relevant prepared route after understanding the process; see [running discovery and outcomes](discovery-and-outcomes.md).
- Once a dispute reaches your team, walk me through how an analyst investigates it. Which steps take the most hands-on time?
- What would a meaningful improvement look like for your team, and how do you measure that today? What would need to stay at least as good?

Adapt emphasis to the answer. Do not present assumed customer pain as measured evidence.

### 3–9 minutes: solution

Discovery-selected Realtime voice or OpenAI API-powered conversational in-app intake → customer confirmation → Apex case/evidence services → actual ChatGPT investigation → analyst approval → Apex execution and verification.

Explain why the two OpenAI surfaces serve different jobs. Show Apex record ownership, identity, permission boundaries, and evidence provenance. Existing case systems remain authoritative. The hypothesis is that reduced evidence assembly and interpretation effort justifies integration and operating costs; do not claim unsupported competitive superiority.

### 9–27 minutes: one investigation

| Meeting time | Scene | Visible result |
| --- | --- | --- |
| 9–12 | Customer entry and discovery-selected voice or API-powered text conversation | Attributed statement, structured intake, same case ID |
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

Ask executives to sponsor workflow observation and evaluation design, name proposed operations and technology participants, involve risk/security and agree permitted access plus a follow-up review. Use the findings to define scope, baseline, boundaries and evaluation criteria. Present the pilot conditionally; launch requires evaluation/readiness gates. No named owner, customer approval, real Gemba or actual baseline has been established. See [the locked next-step wording](discovery-to-pilot.md).

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
| Agent starting point and consolidated status | START-HERE.md |
| Agent instructions | ../AGENTS.md |
| Run, preview, VS Code instructions | ../README.md and ../.vscode/tasks.json |
| Running discovery, branching flow, end-in-mind outcomes | discovery-and-outcomes.md |
| Customer scenario, stakeholder map, qualification | customer-profile.md; synthetic assumptions |
| Architecture, data flow, regulatory context, connection proof checklist | reference-architecture.md; target design; real connection unproven |
| Verified market sources, complex-case cost/mix caveat, competitive implications | market-evidence.md |
| Before/after, capacity economics, costs, instrumentation | business-case.md; assumptions and pilot proposals |
| Competitive and executive objection prep | objection-prep.md; no unsupported competitor claims |
| Timed deck skeleton, evals, governance, enablement | meeting-outline.md; actual deck/rehearsal pending |
| Locked strategy and milestones | plan.md |
| Customer-to-analyst flow and ownership | demo-flow.md |
| Decisions, full meeting outline, artifact index | This file |
| Recorded checks and local-development handoff | handoff.md |
| Adversarial hiring-manager review | adversarial-review-hm.md; subjective critique |
| Accepted adversarial review actions and corrections | adversarial-review-response.md |
| Backend prototype and synthetic state | ../server.py |
| Browser prototype | ../web/index.html, ../web/app.js, ../web/style.css |
| Workflow, HTTP, persisted-effect verification, and UI race tests | ../tests/test_workflow.py, ../tests/test_http.py, ../tests/test_verify.py, ../tests/test_app_races.py, ../tests/app_races.js |
| Runtime SQLite state | Local demo.sqlite, intentionally Git-ignored; not a source artifact |
| Original AAA interview PDF and merchant guide | Not committed; original uploads are excluded by repository instructions. The guide was merchant-side, not an issuer procedure. |
| Earlier pasted JSON/text drafts | Not archived verbatim here; superseded assumptions are recorded above. Do not assume these source attachments are available to a repo-only agent. |
| Final presentation deck and rehearsal recording | Not yet created in this repository |
| Actual ChatGPT/MCP, Realtime, authenticated integrations | Pending; not established by local REST endpoints |
| Executed model evaluations and traces | Pending; six recorded local workflow checks are not model evaluations |
| Hosted website | Not deployed; localhost requires a running server on the appropriate machine or port forwarding |

## Latest locked demo decision — three potential OpenAI experiences

Theo confirmed the demo after identifying voice dependency as a design weakness. Voice support (Realtime) and conversational text in the banking web/iPhone app (OpenAI API) are alternative customer-facing experiences; actual ChatGPT is the shared analyst experience. Every chosen branch demonstrates two OpenAI-powered experiences. Both intake agents prepare a report for customer confirmation and submit to the same Apex case service. A static form alone no longer satisfies the in-app demo path. This changes the target design, not current implementation status. Exact model/API choices and voice transport remain open. See demo-flow.md and discovery-and-outcomes.md.

## Implemented credibility repair — October 15, 2026

Incorporated the supplied evidence/completion patch and fixed two additional review findings. Saved request/handoff facts are checked against the approved payload; request ID, recognized request state, and matching outer case identity are required. Verification survives normal case progression. Fixed assessments are release-gated server-side and returned with case ID and evidence version; the UI rejects mismatched and superseded responses, including delayed responses after reset reuses ID/version. Static browser assets no longer contain the withheld finding. Raw evidence now states observations and attributed assertions only. Query strings are accepted by routes.

Executed verification for this increment: 26 tests passed, including live local HTTP tests, Node verifier tests, and a minimal-DOM network-race harness using the actual app.js. These are not a real-browser/layout check, a model evaluation, authenticated authorization, or proof of external bank execution. The exact saved handoff is still the short fixed payload, not yet the full cited investigation brief. See handoff.md for limits and remaining work.

## Assignment coverage update — October 15, 2026

Read the five-piece preparation pack in the artifact inventory. The original five-page assignment was read privately; its upload is not committed. It confirms ChatGPT plus Platform/APIs as our selected two surfaces and permits a live or simulated workflow. Keep discovery-driven voice/text choice, but do not treat both live modes as required. The review did not prohibit explicit assumptions: fictional baselines, timings, rework, costs, and urgency are permitted when labeled. The pack proposes a customer profile, before/after, cost sensitivity, stakeholder/qualification map, objections, architecture/data flow, verified regulatory context, eval plan, and governance/enablement. No new customer answer or approval is invented.

The original $300k full-coverage capacity example is retained; the new cost/adoption scenario shows $45k year-one modeled net capacity value and a negative downside. These new numbers are proposals, not locked measurements. The next technical risk is one actual ChatGPT case/evidence tool invocation with access checks; current official connection guidance was verified, but account linking, the MCP adapter, and live invocation are still unexecuted. Do not claim the technical proof is complete.

## Intelligent UI and delivery-readiness update — October 15, 2026

Theo asked for an Intelligent UI feasibility step before more building. Gate 0 is now first in plan.md and detailed in reference-architecture.md. It has not been run. Do not claim native UI works with Apex tools because the public feature exists. Use a sourced-table fallback if unavailable and record whether any test used pasted synthetic context rather than real retrieval.

The follow-up review correctly emphasizes renderable output and actual execution over more prose. The pack adds a calculated growth-capacity scenario (69,000 cases, 18,687.5 expected assisted hours versus 23,000 unchanged), while keeping costs and downside. This does not make the economic case automatically positive or justify adding the benefit twice. It names Responses API, Realtime/WebRTC, and MCP Streamable HTTP; exact model configurations still require selection and testing. Stage tools are writes with possible ChatGPT confirmation, separate from Apex authority. A two-sentence spoken position is in objection-prep.md. The one-million-account/120,000-event scale remains unvalidated; a public dollar-volume rate is not an account-event benchmark. Next: bounded Gate 0, smallest actual ChatGPT read proof, renderable deck/diagram and rehearsal. No application code changed in this update.

## End-of-session source and continuity update — October 15, 2026

Theo locked the verified market research and its limits into the repo before ending the session. Read market-evidence.md and START-HERE.md. These add primary Visa/Mastercard sources, separate network context from bank-specific economics, explain the cost/mix reconciliation gap, and identify network AI offerings as discovery/competitive context. No additional benefit, issuer-specific data, validated account rate, live integration, or model result is claimed. Gate 0 remains NOT RUN and must be recorded before further feature building; the minimal actual ChatGPT read proof and renderable/rehearsed presentation follow. This was a documentation update, with no application-code change.

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
3. Build API-powered conversational in-app intake with useful clarification and customer confirmation. Connect submitted intake to shared case creation and a minimal analyst queue, preserving the actual statement and case ID. Prove real authenticated, case-authorized evidence retrieval in actual ChatGPT.
4. Replace fixed comparisons with grounded investigation; preserve source and snapshot references.
5. Implement a source-cited investigation brief, authenticated human approval, and failure/duplicate/stale-state handling. Verify the exact saved brief and expected request/assignment, not just status. See adversarial-review-response.md.
6. Build Realtime voice as the alternative intake branch using the same customer-confirmation and case-creation contract. Rehearse both discovery-selected branches.
7. Resolve the final consumer outcome from balanced evidence and explicit synthetic policy; keep network recovery separate.
8. Execute adversarial evaluations, refine costs and pilot assumptions, create presentation/backup/fallback material, and rehearse the timed story.

Exact voice transport, ChatGPT launch mechanism, deployment host, final disposition, and actual pilot owners remain open. Do not block the first local review on these choices. Keep repository documentation synchronized with implementation and clearly distinguish newly executed checks from historical verification reports.


