# Reviewed credit and Martha's banking-app ending

Implemented October 21, 2026. Synthetic local ledger and fictional bank policy only. No actual money movement, processor contact, production identity or legal/network eligibility rule.

## Current walkthrough state

Theo completed both actual ChatGPT investigation walkthroughs, then staged credit action 1b15a734b07f9dd879f3d913 and explicitly approved it in Apex. Independent saved ledger/case read verifies CREDIT_POSTED at evidence v4 and credit CR-1b15a734b07f9dd879f3d913 for $648.50. Theo subsequently confirmed the displayed credit through the labeled local read-only customer preview. The technical walkthrough is now user-observed complete. No posting was performed by Codex. Preserve this resolved case; do not restage/repost/reset it. The Accounts balance/activity UI is isolated-browser-tested, not separately confirmed by this latest user report.

Connection name visible in Theo's screenshots is Apex Dispute Operations1 on personal ChatGPT Plus. Theo chose to keep the temporary Cloudflare tunnel, not ngrok. Current URL is in ignored .local/runtime.json. Keep the laptop awake/online; preflight the endpoint before the interview. Do not recreate a working tunnel just because tools changed.

## Final technical walkthrough

APX-3625B0CC is already credited. For this saved case, skip the staging/approval steps below and go directly to step 6. Do not replay the financial action. The full sequence remains a reference for a separate, deliberately reset rehearsal.

1. Refresh the installed connection's tools. The same current URL now exposes six tools, including stage_credit; no MCP tool approves or executes. All three stage tools are WRITEs and retain ChatGPT's separate confirmation.
2. Ask actual ChatGPT: "Open APX-3625B0CC and review E-001 through E-005 at the current snapshot. Prepare a supported customer-favorable recommendation for my review using stage_credit, with all five sources cited in your rationale. Use this neutral customer explanation: 'We reviewed your report and the corrected processor records for the JCPenney purchase.' Stop for my review. Do not approve or post a credit."
3. Open http://localhost:8080/ops?case_id=APX-3625B0CC and refresh. Review the exact $648.50 amount, card ending 8821, source-cited rationale and exact customer explanation. The amount/account/policy come from Apex, not model-selected parameters.
4. Only if the full record supports the decision under the fictional policy, explicitly check the evidence-support attestation and click Approve $648.50 credit in demo within five minutes. If you disagree, do not approve. A changed recommendation gets a new draft/hash and requires fresh review.
5. Apex acknowledges posting, then the browser makes a separate GET result request and verifies both synthetic ledger and case decision. Ask ChatGPT to use get_action_result for the returned action ID. Only VERIFIED_POSTED_CREDIT establishes verified posting. A receipt or case status alone does not.
6. Return to the original banking-app tab if its opaque customer session is still available. Otherwise refresh Apex review and click Open Martha's app (demo). This explicitly opens a new read-only, expiring customer preview after the local operator control rechecks the posted credit. It is labeled Identity simulated and is not a claim to have restored a real login. A case ID alone cannot read the customer endpoint. The link uses the current tab/origin, so localhost versus 127.0.0.1 does not lose the new preview during navigation.
7. Show Your credit is here, $648.50 credited, the approved customer explanation and credit reference. Go back to Accounts to show the credit in recent activity and the reduced synthetic card balance. A new tab without the session will not automatically reveal someone else's dispute. Do not create an insecure case-ID-only customer shortcut.

## Ownership and policy

- ChatGPT supplies the rationale and customer explanation; fixed assessments are not passed off as model output. Isolated tests use clearly mock text, not a live ChatGPT result.
- Customer explanation summarizes the reviewed evidence without announcing approval/posting. The banking app supplies the verified financial-status heading/amount separately, only after the ledger/case check. Do not prewrite an "already approved and posted" claim into an unexecuted draft.
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
- Local /api/customer-preview is a demo operator action with the same local request-header/origin boundary and explicitly simulated fixed role as the review controls. It verifies assigned synthetic case and posted credit before minting a new one-hour read-only session. The session cannot invoke intake turns/confirmation, doesn't replace the original token, and never appears in the URL. It is not exposed through MCP/the public tunnel. This boundary is not production authentication or authorized bank impersonation.
- The synthetic credit-card opening balance is $2,184.72. The verified $648.50 credit reduces the displayed fixture balance to $1,536.22. This is a local demo balance calculation, not reconciliation against a real bank's complete ledger.
- Customer explanation is displayed in-app only. No email/SMS/outbox delivery is implemented or claimed.

## Executed checks and limits

77 Python plus 35 Node tests pass (112 deterministic tests). Extended isolated mock-intake browser/official-SDK test passes all three separate approvals, saved-request verification, explicit source arrival, credit review checkbox, ledger/case read-back, duplicate posting, customer explanation/activity/balance, hiding completion on verification failure, and explicit read-only local preview after clearing the original session. HTTP checks cover denied/unverified case, missing/wrong/expired preview capability and forbidden writes. Screenshots were visually inspected. No paid provider call or live-case financial action occurred in this build.

The running services were reloaded without changing the public hostname; public six-tool discovery and same-case v4 reading passed. /api/stage-credit, /api/review-action, /api/customer-case and /api/customer-preview are not publicly routed by the MCP adapter. A consistent pre-build SQLite backup is saved in ignored .local/pre-credit-build.sqlite. Theo's live case now has his explicitly approved, independently verified synthetic credit; do not repost it.

Actual ChatGPT credit staging, Theo's approval and the displayed customer credit are user-observed, with saved credit independently verified. This completes the synthetic technical walkthrough, not an evaluation of recommendation quality. PDF/source-document artifacts, voice/fallback, broader evals and interview-readiness/rehearsal checks remain separate work. No passing model evaluation, production auth, deployment availability guarantee or real customer savings is claimed.
