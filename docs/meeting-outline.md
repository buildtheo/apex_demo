# Timed meeting skeleton, evaluation, and adoption

Prepared October 15, 2026. Reviewable content outline, not a finished slide deck or an executed rehearsal. Read with customer-profile.md, reference-architecture.md, business-case.md, and objection-prep.md. New customer details, pilot thresholds, owners, and costs are proposals for discussion; the 30-minute meeting, two product surfaces, browser iPhone presentation, and discovery-selected intake direction remain locked.

## Readiness gate and proposed rehearsal default

Before further feature building, run and record the Intelligent UI Gate 0 in reference-architecture.md. Outcome may be the sourced-table fallback; native UI is optional and unproven. It replaces up to 60 seconds of the existing evidence-comparison scene and adds no new scene. After the gate, the smallest implementation is a read-only MCP adapter and one actual ChatGPT get_case/get_evidence proof. Export the existing architecture diagram, create the six-slide deck, and rehearse; another prose expansion is not the next deliverable.

Proposed default for preparation: text intake as the primary live candidate, a labeled recording/simulation if not ready, and voice as a labeled prepared alternative. This is a rehearsal proposal, not a user-approved replacement for discovery selection. The customer's answer still selects the experience demonstrated. Both product surfaces must have a clear role in either live or simulated route.

## Story and executive close

Apex's card team needs capacity without weakening customer treatment. An API-powered customer conversation preserves the selected charge and confirmed statement. Later, an analyst uses ChatGPT to assemble evidence, check a material inconsistency, and prepare a supported next action. Apex authorizes, executes, and verifies. The executive decision is sponsorship for a bounded, measured pilot, not acceptance of a predetermined liability verdict.

## Six-slide main deck skeleton

| Time | Slide / screen | Main message and speaker cue | Discovery or proof |
| --- | --- | --- | --- |
| 0:00-3:00 | 1. Apex's capacity question | Fictional US credit issuer; assumed eligible volume and flat capacity. Ask which intake pain and analyst bottleneck matter, and what result warrants investment. | Explicit assumptions; selected branch and value priority |
| 3:00-4:30 | 2. Why OpenAI for Apex | Capability plus enterprise privacy, security, governance and safe adoption. Extend the fictional existing ChatGPT Enterprise footprint: APIs in the customer app; actual ChatGPT for analysts. Voice/text remain alternative API modes. | Use the short answer in [Why OpenAI](why-openai.md); tie each surface to the work, and distinguish platform controls from Apex authority |
| 4:30-7:00 | 3. One case, existing bank authority | Use the architecture in reference-architecture.md; explain context, source retrieval, human approval, executor, and separate saved-effect read. | Identity/data boundaries; current versus target |
| 7:00-9:00 | 4. Adoption with controls | Three points: bank-owned deadlines and decisions; scoped evidence and verified actions; shadow evaluation before limited use. | Concise legal/privacy context, evaluation and rollout thesis |
| 9:00-27:00 | Live / clearly labeled simulated workflow | One coherent customer-to-analyst case, as detailed below. | Visible before/after and the role of both OpenAI product surfaces |
| 27:00-28:15 | 5. Value hypothesis and break-even | Assumed 15% growth: 23,000 hours without change versus 18,687.5 with adoption, below today's 20,000. Keep the $225k constant-volume capacity and cost/downside model as backup, not an additive benefit. | Pilot validates total-role effort, quality, and costs |
| 28:15-30:00 | 6. Pilot decision | Proposed six-week gated pilot; name operations/technology owners and risk participation; agree baseline/access work and scorecard. | Clear next step; no invented customer commitment |

Keep each main slide to one visual and a few talking points. Full tables stay in backup material. This skeleton has not been rendered or rehearsed.

Before rehearsal, read the [provider-selection brief](why-openai.md). It supplies the original-selection scenario assumptions, verified controls, alternatives and one-minute answer. Keep this rationale inside the existing solution time; detailed comparisons belong in backup material. No product connection or safety evaluation is established by this preparation update.

## Eighteen-minute workflow with Q&A

| Time | Scene and narration | Observable proof |
| --- | --- | --- |
| 9:00-10:00 | Show the assumed current task: customer statement, ledger, merchant document, manual reconciliation | Before-state is illustrative, not a measured process study |
| 10:00-12:00 | Browser iPhone: select VeloCraft charge; follow discovery-selected text or voice conversation; clarify and confirm intake | Model contribution, customer corrections, structured report, case ID |
| 12:00-14:00 | Case appears in Apex queue; announce time jump before later merchant evidence; switch to actual ChatGPT | Same case ID and attributed intake; no instant merchant response |
| 14:00-18:00 | Investigate claims with source references; ask what underlying record supports the merchant assertion | Model synthesis versus deterministic association checks; specific gap |
| 18:00-21:00 | Stage a scoped evidence request; distinguish ChatGPT's tool-call permission from Apex approval; Apex executes and saved request is read back | Exact scope, destination, action ID, persisted-effect verification |
| 21:00-24:00 | Label the simulated later response; reassess the material inconsistency and remaining uncertainty | Raw observation separated from inference; no fraud verdict |
| 24:00-26:00 | Review the cited package; keep second Apex approval/verification concise (60-90 seconds), with brief narration of any ChatGPT staging confirmation | Requested specialist decision, sources, open questions, human judgment |
| 26:00-27:00 | Verify destination and exact saved package; connect to the named business priority | Completed supported action; consumer/network states remain distinct |

The full cited brief, case-creation continuity, and model connections remain build work. APX-001 is the current seeded case; when live intake creates another ID, use that actual returned ID throughout. Never use an unrelated scripted case ID.

Discovery still selects the intake path. Prepare both. The brief permits live or simulated demonstrations, so both routes need not be live implementations. Proposed execution plan: rehearse one stable live primary path and a clearly labeled prepared alternative, choosing live versus simulation based on actual readiness. Do not quietly replace the user's branch choice or represent a prerecorded path as interactive.

Do not assume stage tools avoid confirmation. Saving drafts changes state; only true read tools get readOnlyHint. Rehearse the actual sequence and total prompt count, potentially two staging permissions plus two Apex approvals. Use the first cycle to explain the distinction and the second concisely. The eight timing rows are scene cues, not eight separate applications or presentations. If the run exceeds its budget, shorten narration and optional visual exploration; preserve source inspection, meaningful human review, and verified completion. Keep timed slack for questions rather than adding features.

## Evaluation plan (proposed; not executed)

Start with 60 development examples, 60 adversarial cases, and 40 held-out cases kept outside prompt tuning. Include both intake modes where demonstrated. Synthetic/deidentified examples need operations/risk review. These proposed counts do not establish statistical power or production safety.

| Test family | Examples | Evaluation and gate |
| --- | --- | --- |
| Intake fidelity | Recognized merchant but disputed purchase; changed amount; customer correction; incomplete account | Preserve attribution and required fields; confirm before submit; never infer authorization from merchant recognition |
| Grounding and answerability | Supporting packet valid, wrong association, missing record, conflicting sources | Experts grade findings and omissions; every material claim must have a supporting source or explicit uncertainty |
| Procedure trajectory | Need further evidence; no additional request needed; stronger merchant evidence | Correct tool and scope; reassessment may change direction; no automatic customer/merchant preference |
| Access and injection | Wrong user/case, prompt injection in document, unreleased evidence, secrets request | Zero observed unauthorized reads/actions or withheld-body leaks in agreed suite |
| Execution controls | Stale/expired approval, altered payload, missing effect, duplicate, timeout, case advancement | Zero false completion claims; exact-effect verification; reconcile before retry |
| Snapshot/UI behavior | Late responses, reset, out-of-order compare/gap, changed evidence | No assessment presented as current for a mismatched/superseded snapshot |

Two independent domain reviewers score disputed judgments, blinded where feasible, with adjudication of disagreement. Proposed gates: decision/brief quality at least matches the baseline; no severe access/execution failures in the agreed set; material claims traceable; total active effort target 25% lower without increased downstream work. Report denominators, confidence/uncertainty, and failure examples. Gates are observed-test criteria, not universal guarantees. Freeze prompt/model/tool/policy versions for the holdout; rerun relevant regression tests after changes. Existing 26 local tests are control checks, not passing model evaluations.

## Governance, rollout, and enablement

Roles are proposed and unassigned. Operations owns scope/outcomes and can stop assisted use. The application owner owns identity, integrations, support, and rollback. Risk/compliance/privacy approve data use, workflow applicability, and release gates. QA/domain reviewers own scoring; analyst/specialist champions own training and feedback. No model or generic approval token grants legal decision authority.

| Phase | Work | Gate before progressing |
| --- | --- | --- |
| Weeks 1-2, contingent on readiness | Validate baseline and costs; map access/notice handling; approve synthetic/deidentified data; configure identity; train champions | Named owners, permitted dataset, functioning access, scope and metrics agreed |
| Weeks 3-4 | Shadow mode; run model/trajectory evals and time study; review errors and specialist burden | Quality/control gates pass; failure recovery and rollback rehearsed; budget reviewed |
| Weeks 5-6 | Limited assisted use for authorized trained analysts, with explicit approval; review usage and costs | Operations/risk decide expand, revise, or stop; production customer intake requires a separate approval gate |

Enablement proposal: a one-hour workflow session, practice with valid and misleading evidence, a citation/uncertainty checklist, hands-on reject/edit/retry exercises, and weekly office hours during limited use. Retain existing manual intake/processing, identify a support owner, and capture analyst edits plus specialist feedback. Changes to models, prompts, policy, tools, or access require versioned evaluation and release approval. A severe access/false-execution event stops assisted writes pending investigation; the DMS remains available for manual work. Public demo data stays synthetic.

## Rehearsal, fallback, and reflection

Rehearse both intake choices, the full 30-minute run, and interruption recovery. Test actual presentation account, auth expiry, audio permission, legibility, case reset/draft cleanup, network loss, and action reconciliation. A single brief retry is sufficient before a labeled prerecorded/simulated fallback; do not consume the demo troubleshooting a connector. Prepare traces/screens only from synthetic cases and record what was live versus simulated. No such fallback or recording exists yet.

For the 15-minute reflection, address: why this workflow and the two surfaces; what is live versus simulated; deterministic versus model responsibilities; tradeoffs and remaining security/domain limits; what the pilot could disprove; and the next build improvement. Do not claim an integration merely because architecture is drawn.

## Criteria coverage and remaining evidence

| Criterion | Preparation artifact | Evidence still missing |
| --- | --- | --- |
| Technical understanding | reference-architecture.md and connection-proof checklist | Real ChatGPT tools/authorization; Platform intake |
| Business acumen | business-case.md | Measured baseline, costs, time/quality pilot |
| Pre-sales strategy | customer-profile.md, discovery-and-outcomes.md, objection-prep.md | Customer answers, sponsor/owner commitments, qualification |
| Demo quality | demo-flow.md and this timed workflow | Integrated live or well-simulated two-surface run |
| Responsible deployment | Regulatory/data mapping; eval, governance, enablement sections above | Domain review, executed evals and deployment gates |
| Executive communication | Six-slide skeleton and close | Finished deck, visual QA, timed rehearsal |
| Consultative storytelling | Customer assumptions, urgency hypothesis, discovery branches, value trace | Rehearsed adaptation and credible before/after |

These are preparation materials, not a claim the criteria have been met. Next deliverable is a small working two-product-surface proof plus a rehearsed executive story, not another architecture expansion.
