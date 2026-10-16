# Before/after, capacity value, and pilot measurement

Prepared October 15, 2026. All figures below are explicit synthetic scenario assumptions or proposed targets. No baseline, improvement, vendor quote, customer budget, or financial result has been measured. The primary value lever is **released operational capacity with decision quality preserved**. Capacity valued at labor cost is not automatically cash savings.

## Assumed before and proposed after

The comparison measures expected active human effort across initial analysts, specialists, and downstream correction work. It excludes waiting time, which is measured separately. More evidence requests or specialist referrals must not hide extra work.

| Expected active work per eligible case | Assumed before | Proposed after | How to validate |
| --- | ---: | ---: | --- |
| Assemble source context | 8 min | 5 min | Active task timing and source-access events |
| Interpret and reconcile evidence | 6 min | 5 min | Task timing plus expert review of the resulting assessment |
| Prepare/review/execute next action | 3 min | 3 min | Include approval, editing, retries, and saved-effect checks |
| Expected downstream rework | 3 min | 2 min | Before: 15% x 20 min; after: 10% x 20 min. Track specialist/reopen/correction effort |
| Total expected human effort | **20 min** | **15 min** | Sum across roles; do not add rework again |

These rows are a scenario model, not a prediction that the hero case resolves in 15 minutes. The customer may identify a different bottleneck. Keep the 20-to-15-minute comparison as an assumption until validated, and replace row allocations with measured distributions. Do not say analysts rubber-stamp, search four systems, or achieve a 90-second result without evidence.

## Annual model and costs

| Input | Scenario assumption |
| --- | ---: |
| Total annual disputes | 120,000 |
| Eligible investigations | 60,000 |
| Target savings per adopted eligible case | 5 minutes |
| Loaded human effort value | $60/hour |
| Full-coverage hours released | 60,000 x 5 / 60 = 5,000 hours |
| Full-coverage gross capacity value | **$300,000/year** |
| Initial adopted share of eligible cases | 75% = 45,000 cases |
| Adopted gross capacity value | **$225,000/year** |
| Annual recurring incremental costs | $80,000 placeholder: $30k licensing/inference, $10k hosting, $40k operation/support |
| One-time implementation/enablement | $100,000 placeholder, including a $30k pilot allocation |
| Year-one modeled capacity value less costs | **$45,000** = $225k - $80k - $100k |
| Later steady-state annual value less recurring costs | **$145,000** before ramp/coverage changes |

Costs are planning placeholders, not current OpenAI pricing or negotiated terms. Replace with incremental seats, measured calls/tokens/audio, deployment costs, identity/integration work, QA, and technical support. Keep technical operating costs separate from the case-handling effort already counted above. Do not add the pilot allocation a second time. This annualized scenario excludes rollout ramp and discounting; build a monthly forecast before a real investment decision. The hypothetical growth pressure is not monetized. Do not imply labor is removed from payroll: if only 50% of the released time can be redeployed, valued benefit is $112,500 and year-one modeled net becomes **negative $67,500**.

## Sensitivity and decision threshold

At 45,000 adopted cases and $60/hour, one minute saved is worth $45,000/year. With $180,000 year-one costs, break-even is four minutes saved per adopted case before any capture discount. The five-minute hypothesis has limited headroom; a pilot may conclude that expansion is not justified.

| Minutes saved per case | Gross capacity value | Year-one value less $180k costs |
| --- | ---: | ---: |
| 2 | $90,000 | -$90,000 |
| 5 | $225,000 | $45,000 |
| 8 | $360,000 | $180,000 |

Decision quality, repeat contacts, complaint rates, and avoided incorrect outcomes are guardrails or exploratory measures. Do not add speculative fines, churn, recoveries, or $1M-$3M loss avoidance to this case. Monetary benefits from future quality changes require an attributable baseline and must not duplicate the rework benefit.

## Instrumentation and pilot design

Propose a six-week pilot contingent on access/readiness. Start with approved synthetic or deidentified historical cases; no customer-facing live operation until the governance gates in meeting-outline.md pass.

| Measure | Proposed collection | Decision use |
| --- | --- | --- |
| Active effort across roles | Task start/pause/end events plus manual sampling; sum handling minutes through follow-up | Primary: target 25% reduction; include rework and specialist effort |
| Elapsed response/case time | Received, request, evidence-arrival, action, and final-stage timestamps | Identify whether waiting dominates; do not claim active-time savings equal faster resolution |
| Case mix and adoption | Eligible/classification, attempted/completed, channel, analyst, complexity band | Prevent easier-case selection and unsupported coverage claims |
| Quality | Blinded independent expert scoring on paired outputs and an adjudication process | Quality must at least match baseline; examine authorization and omission errors separately |
| Model/tool behavior | Versioned prompt/model/tools/policy, source IDs, snapshot, tool events, edits, approvals, verification failures | Investigate failures and prove workflow adherence |
| Cost and adoption | Actual incremental usage/seats, support effort, completion/abandonment, analyst feedback | Update cost model and expansion decision |

Proposed time study: 100 case-runs, 50 baseline and 50 assisted, balanced by complexity and analyst experience. Avoid the same analyst seeing the same case in both arms. Include downstream follow-up through a defined observation window before annualizing. This is an initial sampling proposal, not a guarantee of statistical power; report uncertainty and increase the sample if inconclusive. Preserve a larger holdout and adversarial set for safety/quality tests as described in meeting-outline.md.

Proposed instrumentation event fields: run_id, case_id, role, phase, event_type, started_at, ended_at, complexity_band, evidence_version, action_id, result, model/tool/policy versions, and redacted usage/cost. Capture the actual intake channel, notice timestamps, and follow-up linkage. Restrict transcript storage and log access under approved policy. Event collection and the study have not been implemented or executed.
