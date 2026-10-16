# Discovery, competitive, and executive objection preparation

Prepared October 15, 2026. Facilitator preparation, not claims about a competitor's current features or an actual customer's behavior. Use the customer's alternatives and the same evaluation tasks. Do not claim OpenAI is universally superior, that a bank can safely automate liability decisions, or that a six-week pilot has already been approved.

| Likely objection | Ask / concise response | Evidence or next step |
| --- | --- | --- |
| We already have a case system / ServiceNow / Microsoft tools. | Which evidence and approval steps work well today, and where is manual effort left? Apex remains the record/execution system. Test whether OpenAI improves the remaining investigation work enough to justify another integration. | Compare baseline, native workflow, and OpenAI-assisted workflow on identical cases, quality, access, effort, and total cost. Avoid unverified feature claims. |
| Why not a SQL join or deterministic automation? | Use code for the join. The model interprets narratives, extracts the claim to check, chooses a scoped lookup, and explains what the returned fact does and does not establish. | Show a source assertion, the exact tool check, and the resulting sourced assessment. If rules solve the selected task adequately, use them. |
| Why both the API and ChatGPT? | The API fits the bank's customer experience and transaction context. ChatGPT fits an analyst investigating across approved tools. Both use the same Apex case service. | Show Platform-generated structured intake, then real ChatGPT tool input/output and citations. Voice and text are modes within the API surface. |
| Why an AI conversation instead of a form? | What ambiguity or missing information causes follow-up today? The agent should ask only relevant questions, retain corrections, and prepare a report for confirmation. | Compare completion, required corrections, extra turns, abandonment, and downstream follow-up against the existing form. Retain a form/human route if the agent adds no value. |
| Nobody calls; everything starts in our app. | Then follow the conversational text branch, preserving the selected charge and confirmed statement. Voice need not be forced into this workflow. | Show Platform/API text intake and the same ChatGPT investigation. A labeled prepared alternative can replace a second live build. |
| You just escalated to a more expensive person. | Measure work across both roles. The intended gain is a verified, cited investigation package with explicit unresolved questions, rather than a bare referral. | Show the exact brief and specialist decision requested. Include specialist and repeat-work minutes in the baseline and pilot. Financial resolution remains outside the current endpoint. |
| Why now? | What volume, service, quality, or capacity event is driving action? Our flat-capacity/15%-growth scenario is a hypothesis. | Replace urgency with the customer's answer; do not invent a compliance deadline or a crisis. |
| $300k before costs is not compelling. | Agreed: the economics could fail. With assumed 75% adoption and placeholder costs, year-one modeled net capacity value is $45k; lower capture or savings makes it negative. | Validate the primary lever and integration cost before committing beyond the bounded pilot. Do not inflate benefits. |
| Can the model read other accounts or follow instructions in a merchant PDF? | Server-side identity/ACLs determine access; document text is evidence, not authority. The model cannot grant itself approval or broaden scope. | Denied-case, cross-case, injection, and withheld-evidence tests. These target controls are not all implemented. |
| Does this comply with banking regulation? | This design preserves bank-controlled notice/deadline handling, investigation, human decisions, and separate network recovery. Compliance validates the exact workflow before customer use. | Use the primary-source mapping in reference-architecture.md. Never claim compliance because the demo has citations. |
| What happens if a write times out or the model is wrong? | No blind success claim or blind retry. Reconcile by action ID against saved facts, preserve the analyst's ability to reject/edit, and return to the case system when uncertain. | Tests for false success, duplicates, stale approvals, timeouts, and corrections. Distinguish existing unit checks from future model/system evaluations. |
| Why this provider rather than another model/vendor? | Use the same representative task set and access constraints to compare source fidelity, procedure adherence, latency, cost, and operator usability. | Present observed results only. Keep model/backend choice flexible behind governed tool contracts if the evidence warrants it. |

## Network-tool and average-cost objections

Source detail is in market-evidence.md. Ask whether the bank uses Visa Dispute Intelligence, Doc Analyzer, Case Manager, or comparable network tools. Visa's April 2026 announcement describes these capabilities; current installed availability and bank entitlements must be checked. Our position is the customer conversation and analyst workflow over governed bank evidence/actions, complementing useful existing services where appropriate. Do not claim OpenAI uniquely summarizes documents or is superior without a comparison.

If an executive cites roughly $10 per dispute, acknowledge Mastercard's published $9.08-$10.32 average. Our $20 figure is a complex-case hypothesis requiring measurement, especially because we assumed a 50% eligible share. Do not dismiss the comparison simply by saying subset. Ask for the bank's distribution and all-role costs, then rerun the model; lower value can justify stopping.

## Two-sentence spoken position

"I recommend OpenAI for this pilot because its APIs let us tailor the customer conversation while ChatGPT gives analysts a workspace for investigating through the same governed Apex tools. We will retain the bank's case system and deterministic checks, and require measurable improvement over that baseline before expanding."

This is our proposed architecture position, not a claim of measured superiority. Follow with the customer's priority outcome, the specific demonstrated model contribution, and the pilot's acceptance threshold. If the baseline wins on value or controls, say so.

## Qualification and close practice

Operations sponsor: confirm the primary measure and who can commit evaluation capacity. Technology owner: confirm the supported access path and cost estimate. Risk/privacy: identify the approval gate and prohibited uses. Analyst/specialist leads: agree scoring and training. Procurement: confirm how incremental spend and supplier review are decided.

Close: "If this is the right workflow, can we name an operations owner and a technology owner, involve risk/privacy, and agree the baseline/access work for a bounded pilot? We will return with measured quality, total handling effort, and costs before asking to expand."

If sponsorship or access is missing, propose a short readiness/discovery step instead of implying the pilot is qualified. Keep objections woven into the 18-minute demonstration; deeper details belong in backup material.
