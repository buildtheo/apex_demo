# Locked Current State

Locked at Theo's request October 21, 2026. Deployed implementation: `0f1fa39`. This is the current snapshot, not a new runtime change, test execution or claim of production readiness. Update this file in place as facts change; preserve chronology in build-progress.md and decisions-and-artifacts.md.

## Story and Experience

Martha disputes a $648.50 JCPenney online purchase. Barbara investigates the same case in actual ChatGPT, identifies a bad supporting-record association, obtains corrected evidence, then reviews a supported credit recommendation. She returns to Apex to approve the credit. Martha sees the verified result in the browser iPhone banking app.

- Platform/APIs powers customer intake; actual ChatGPT plus Apex MCP powers Barbara's work. Text and Realtime voice are alternative intake modes, not extra product surfaces.
- Discovery chooses voice OR text. Conversational Responses text intake works; Apex voice remains unconnected.
- Barbara uses Apex only at initial queue pickup and final credit approval. Bounded evidence requests and reassessment stay in her ChatGPT conversation.
- Agreement to an evidence-gathering step includes that step's permitted labeled simulated response. No second time-jump question; honor pause/wait/existing-only requests and read the released source before assessment.
- Keep the primary story short and conversational. Technical depth stays inspectable through source excerpts/provenance, exact approval and verification, not repeated tables or IDs.

## What Works

| Capability | Current boundary |
| --- | --- |
| Customer conversational intake | Server-side Responses, corrections, explicit customer confirmation, persistent shared case and queue |
| Investigate in ChatGPT | Opens actual ChatGPT and attempts clipboard copy; visible manual-copy/link fallback. No verified automatic prompt prefill, app selection or message sending |
| Evidence investigation | Released E-001/E-002 -> labeled later E-003 processor assertion -> bounded lookup -> E-004 association mismatch -> purchase-specific follow-up -> E-005 versioned correction |
| Evidence requests | Fixed nonfinancial scopes, simulated assigned analyst authority, active-run/source/snapshot/status checks, idempotency, saved-effect verification; no separate business approval |
| Later evidence | Separate labeled simulation tool, stage/retry gates; no real external processor contact |
| Credit | Cited proposal -> exact human approval in Apex -> atomic once-only synthetic posting -> separate ledger/case verification |
| Customer resolution | Bank-generated completion message only after verification. Original approved customer_explanation stays unchanged in decision/ledger/audit |
| Restart demo | Buttons on queue/case screens create fresh isolated practice runs; old records remain stored and stale practice actions are blocked |
| Lost customer tab | Explicit expiring read-only local preview after verification; identity is simulated, not production login recovery |

The seven deployed MCP tools are get_case, get_evidence, request_authentication_lookup, request_processor_evidence, receive_demo_evidence, get_action_result and stage_credit. All four state-changing tools are marked WRITE. ChatGPT host permission may still appear; it is not an extra Apex business approval. No tool approves or posts credit. Legacy request-staging code remains for historical compatibility, not the presented flow.

## Preserved Proof

| Case | Recorded proof |
| --- | --- |
| APX-B355D834 | Theo observed actual ChatGPT investigation through E-005, staged action 354e66a479674d0d2c472b8d, approved in Apex and confirmed the iPhone credit. Separate saved-result read verifies VERIFIED_POSTED_CREDIT/v4/64850 cents |
| APX-3625B0CC | Earlier user-observed technical walkthrough; credit 1b15a734b07f9dd879f3d913 independently verified. Customer reveal used the labeled local read-only demo preview |

Never restage, repost, reapprove or reset either proof case. Rehearse with Restart demo and the new returned case reference/conversation. Restart can archive prior practice access but must not delete or overwrite saved proof. Both case/ledger bodies were unchanged across the latest customer-copy deployment.

Theo's user observation of the customer credit preceded the completion-copy polish. The new completed wording is browser-tested, not separately user-confirmed in this record. The case is not evidence of production identity, real money, actual external processor integration or a broad passing model evaluation.

## Last Executed Verification

- 87 Python + 42 Node tests pass: 129 deterministic checks.
- Isolated mock-model browser/official SDK walkthrough passes intake, copy/open/manual fallback, same-case investigation without evidence-request business approvals, separate credit approval, saved-effect verification, completed customer wording, lost-session preview and both restart buttons.
- Tests cover 100 restart operations, repeated practice credits, duplicate/concurrent/stale/denied actions and false-success behavior. These are not 100 live calls.
- Public tool/read/private-route preflight passed for the bounded seven-tool deployment. Read-only published-guidance check passed after the duplicate-question fix. Latest customer-copy update restarted only DMS; tools/tunnel/Twilio were unchanged.
- Actual account-side proof is Theo's reported and pasted walkthrough, supported by saved-state reads; full raw ChatGPT traces were not independently inspected. Recent deterministic/browser tests made no paid provider calls.

## Runtime Boundaries

Local browser/DMS: 8080. Private Responses worker: 8788. Public MCP adapter only: 8787 through the existing temporary Cloudflare tunnel. Secrets, active hostname, credentials and SQLite state stay ignored. Do not expose the other services or replace a working tunnel unnecessarily. The awake Chromebook/network and temporary address remain availability dependencies.

Barbara uses Theo's personal Plus ChatGPT connection, labeled simulated identity with No authentication. Server-side API credential reuse from M. Price is configured privately. No real OAuth deployment is claimed. Preserve the M. Price app/number/webhook while preparing Apex reuse.

## Remaining Work

- Connect and test the Apex voice alternative using M. Price transport patterns, with Apex-specific intake tools/session linkage and required sensitive-data warning. Existing voice-profile instructions are not a working call agent.
- Create inspectable clearly synthetic source PDFs where document-shaped evidence warrants them; record views/excerpts already exist. Do not invent original PDFs or provenance.
- Run representative model/failure evaluations and recording/interview-readiness checks. Complete presentation work when Theo directs; the technical walkthrough is not full submission readiness.
- Continue to distinguish fictional policy, customer/processor/ledger data, public merchant references and modeled business assumptions. Missing evidence is not fraud or automatic credit eligibility; below-$1,000 authority is not an eligibility rule. Network recovery stays out of scope.

Detailed operation: [Barbara workflow](barbara-workflow.md), [credit](credit-workflow.md), [restart](restart-demo.md). History: [build progress](build-progress.md), [decisions](decisions-and-artifacts.md), [archived entry points](history/).
