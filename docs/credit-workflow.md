# Reviewed credit and Martha's banking-app ending

Implemented October 21, 2026. Synthetic local ledger and fictional bank policy only. No actual money movement, processor contact, production identity or legal/network eligibility rule.

## Current walkthrough state

Theo completed the actual ChatGPT processor-follow-up walkthrough for APX-3625B0CC. It is at PROCESSOR_EVIDENCE_RECEIVED / evidence version 4, with E-001 through E-005 available. His approved processor request is REQ-39b65a40. ChatGPT distinguished the corrected association, missing purchase-specific evidence and unresolved authorization. Codex verified the saved state but has not staged or approved a credit on Theo's case.

Connection name is iApex Dispute Operations1 on personal ChatGPT Plus. Theo chose to keep the temporary Cloudflare tunnel, not ngrok. Current URL is in ignored .local/runtime.json. Keep the laptop awake/online; preflight the endpoint before the interview. Do not recreate a working tunnel just because tools changed.

## Final technical walkthrough

1. Refresh the installed connection's tools. The same current URL now exposes six tools, including stage_credit; no MCP tool approves or executes. All three stage tools are WRITEs and retain ChatGPT's separate confirmation.
2. Ask actual ChatGPT: "Open APX-3625B0CC and review E-001 through E-005 at the current snapshot. Under the fictional Apex policy, prepare a supported customer-favorable credit recommendation for my review using stage_credit. Cite all five sources in your rationale and draft a short explanation for Martha. Consider her denial, the recorded purchase, the erroneous device reference, the completed lookup and the corrected processor response together. Missing evidence alone does not establish fraud or automatic credit eligibility. Stop for my review; do not claim a posted credit."
3. Open http://localhost:8080/ops?case_id=APX-3625B0CC and refresh. Review the exact $648.50 amount, card ending 8821, source-cited rationale and exact customer explanation. The amount/account/policy come from Apex, not model-selected parameters.
4. Only if the full record supports the decision under the fictional policy, explicitly check the evidence-support attestation and click Approve $648.50 credit in demo within five minutes. If you disagree, do not approve. A changed recommendation gets a new draft/hash and requires fresh review.
5. Apex acknowledges posting, then the browser makes a separate GET result request and verifies both synthetic ledger and case decision. Ask ChatGPT to use get_action_result for the returned action ID. Only VERIFIED_POSTED_CREDIT establishes verified posting. A receipt or case status alone does not.
6. Return to the ORIGINAL banking-app tab at http://localhost:8080/. Its opaque intake session capability is needed; a case ID alone is not customer access. On returning to the submitted-report screen, focus refreshes the result; Check report status also refreshes it. Reloading that same tab restores the session and shows the saved case.
7. Show Your credit is here, $648.50 credited, the approved customer explanation and credit reference. Go back to Accounts to show the credit in recent activity and the reduced synthetic card balance. A new tab without the session will not automatically reveal someone else's dispute. Do not create an insecure case-ID-only customer shortcut.

## Ownership and policy

- ChatGPT supplies the rationale and customer explanation; fixed assessments are not passed off as model output. Isolated tests use clearly mock text, not a live ChatGPT result.
- Apex selects amount 64850 cents, USD, the fixed synthetic Martha/card-8821 account, T-204 and DEMO-CREDIT-01. Barbara's fictional authority is strictly below 100000 cents. The current implementation supports this one selected synthetic transaction, not arbitrary sub-$1,000 cases.
- Both prior requests must be separately verified and RESPONDED; all five sources and the corrected purchase-specific response must be released. These are prerequisites to a recommendation, not an automatic financial decision.
- Rationale must reference all five allowed source IDs and text is conservatively screened. This is citation-presence validation, not a semantic proof that the rationale or customer explanation is correct. Barbara must read and judge the proposed package. Semantic model evaluations remain unrun.
- Human approval requires a separate local review action with affirmative evidence-support attestation. The model cannot supply this via an MCP approval tool. Simulated Barbara is NOT production authentication or independently verified human presence.
- Evidence and uncertainty are retained; customer-favorable disposition does not certify fraud, criminal attribution, network recovery or liability under real rules. No automatic-credit-by-amount/missing-record rule exists.

## Posting and verification

- credit.py owns the bounded credit path, separate from investigation requests. No legacy /api/action approve bypass exists for customer-created cases.
- Immutable archived draft, canonical payload hash, version, assignment, expiry, bank-owned amount/account/policy and complete investigation context are checked again at approval. A revised rationale or explanation replaces the current draft and invalidates old approval.
- One SQLite transaction inserts synthetic_credits and updates submitted_cases with the reviewed decision, source-cited brief, brief version, exact explanation and simulated approving actor. Failed case writes roll back the ledger insert.
- The ledger enforces unique case and account/transaction pairs. Concurrent/duplicate approvals return the original verified result, not another credit. Existing receipts/decisions without matching ledger facts require reconciliation; no blind retry/reposting.
- get_action_result separately reads the saved ledger row and case decision, comparing identity, references, amount/currency, posted state, payload/hash/version, explanation/rationale, policy and reviewed support. It does not trust the acknowledgement or receipt. Request verifications still work after case closure.
- The customer capability-scoped /api/customer-case repeats ledger/case verification before releasing a resolution. Failure withholds it. Browser error handling hides previously shown success rather than leave stale confirmation on screen.
- The synthetic credit-card opening balance is $2,184.72. The verified $648.50 credit reduces the displayed fixture balance to $1,536.22. This is a local demo balance calculation, not reconciliation against a real bank's complete ledger.
- Customer explanation is displayed in-app only. No email/SMS/outbox delivery is implemented or claimed.

## Executed checks and limits

76 Python plus 35 Node tests pass (111 deterministic tests). Extended isolated mock-intake browser/official-SDK test passes all three separate approvals, saved-request verification, explicit source arrival, credit review checkbox, ledger/case read-back, duplicate posting, customer explanation/activity/balance and hiding completion on verification failure. The customer and analyst screenshots were visually inspected. No paid provider call or live-case financial action occurred in this build.

The running services were reloaded without changing the public hostname; public six-tool discovery and same-case v4 reading passed. /api/stage-credit, /api/review-action and /api/customer-case are not publicly routed by the MCP adapter. A consistent pre-build SQLite backup is saved in ignored .local/pre-credit-build.sqlite. Theo's live case remains uncredited until his explicit review.

Actual ChatGPT stage_credit invocation, its recommendation quality, Theo's final live-case approval and customer-view observation are pending. PDF/source-document artifacts, voice, broader evals and interview-readiness/rehearsal checks remain separate work. No passing model evaluation, production auth, deployment availability guarantee or real customer savings is claimed.
