# Locked Current State

Locked at Theo's request October 21, 2026; updated for the authorized phone-intake deployment. This is the current snapshot, not a claim of production readiness. Update this file in place as facts change; preserve chronology in build-progress.md and decisions-and-artifacts.md.

## Story and Experience

Martha disputes a $648.50 JCPenney online purchase. Barbara investigates the same case in actual ChatGPT, identifies a bad supporting-record association, obtains corrected evidence, then reviews a supported credit recommendation. She returns to Apex to approve the credit. Martha sees the verified result in the browser iPhone banking app.

- Platform/APIs powers customer intake; actual ChatGPT plus Apex MCP powers Barbara's work. Text and Realtime voice are alternative intake modes, not extra product surfaces.
- Discovery chooses voice OR text. Responses text intake works. Twilio/OpenAI Realtime phone intake is implemented and configured; the physical phone rehearsal remains pending.
- Barbara uses Apex only at initial queue pickup and final credit approval. Bounded evidence requests and reassessment stay in her ChatGPT conversation.
- Agreement to an evidence-gathering step includes that step's permitted labeled simulated response. No second time-jump question; honor pause/wait/existing-only requests and read the released source before assessment.
- Keep the primary story short and conversational. Technical depth stays inspectable through source excerpts/provenance, exact approval and verification, not repeated tables or IDs.

## What Works

| Capability | Current boundary |
| --- | --- |
| Customer conversational intake | Server-side Responses, corrections, explicit customer confirmation, persistent shared case and queue |
| Alternative phone intake | Selected purchase -> signed, allowlisted call -> Realtime conversation -> exact draft readback -> completed-playback acknowledgement and keypad 1 -> verified same shared case. Keypad 2 permits correction; no spoken yes alone submits |
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

- 92 Python + 46 Node tests pass: 138 deterministic checks, including private voice binding, stale/corrected readback, signed transport, interruption and keypad confirmation.
- Isolated mock-model browser/official SDK walkthrough passes intake, copy/open/manual fallback, same-case investigation without evidence-request business approvals, separate credit approval, saved-effect verification, completed customer wording, lost-session preview and both restart buttons.
- Tests cover 100 restart operations, repeated practice credits, duplicate/concurrent/stale/denied actions and false-success behavior. These are not 100 live calls.
- Isolated browser/SDK flow also passes voice selection, private synthetic call events, draft without submission, keypad confirmation and same-case bank/queue/MCP visibility. Audio and model responses are mocked in that browser check.
- Live OpenAI accepted the Realtime session configuration for gpt-realtime-2.1/cedar/PCMU. No generated audio or physical telephone call was tested by that handshake.
- Replacement public tunnel preflight lists the same seven MCP tools; unsigned phone webhook returns 403, while private voice callback, case API and operator view return 404 publicly. Twilio route update was read back and local phone config is enabled. Both proof-case/ledger hashes are unchanged.
- Actual ChatGPT account-side proof is Theo's reported and pasted walkthrough, supported by saved-state reads; full raw ChatGPT traces were not independently inspected. Deterministic/browser tests made no paid provider calls; the separate live Realtime configuration handshake did contact OpenAI.

## Runtime Boundaries

Local browser/DMS: 8080. Private Responses worker: 8788. Narrow public adapter: 8787 for MCP and signed /twilio/voice and /twilio/media only. Secrets, active hostname, credentials and SQLite state stay ignored. The previous temporary tunnel was invalidated upstream (Tunnel not found / DNS failure) and needed replacement during phone deployment; never replace a working tunnel unnecessarily. The awake Chromebook/network and temporary address remain availability dependencies. A changed address requires updating the ChatGPT connection as well as Twilio.

Barbara uses Theo's personal Plus ChatGPT connection, labeled simulated identity with No authentication. Server-side API credential reuse from M. Price is configured privately. No real OAuth deployment is claimed. Theo authorized temporarily switching the existing demo number to Apex; the original M. Price route is backed up privately and has a restore command. M. Price domain code and credentials are unchanged. Caller allowlisting and keypad consent are not bank identity authentication.

## Remaining Work

- Rehearse the physical Apex phone call and actual model conversation, correction, interruption, readback and keypad confirmation. Implementation/configuration tests do not establish live model compliance or real phone audio quality. See phone-setup.md.
- Create inspectable clearly synthetic source PDFs where document-shaped evidence warrants them; record views/excerpts already exist. Do not invent original PDFs or provenance.
- Run representative model/failure evaluations and recording/interview-readiness checks. Complete presentation work when Theo directs; the technical walkthrough is not full submission readiness.
- Continue to distinguish fictional policy, customer/processor/ledger data, public merchant references and modeled business assumptions. Missing evidence is not fraud or automatic credit eligibility; below-$1,000 authority is not an eligibility rule. Network recovery stays out of scope.

Detailed operation: [Barbara workflow](barbara-workflow.md), [credit](credit-workflow.md), [restart](restart-demo.md). History: [build progress](build-progress.md), [decisions](decisions-and-artifacts.md), [archived entry points](history/).
