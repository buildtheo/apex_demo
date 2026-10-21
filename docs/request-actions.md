# Scoped request, human approval and verification

October 21: this document describes the first approval cycle. The second is implemented in [processor-followup.md](processor-followup.md), and the final credit/customer cycle in [credit-workflow.md](credit-workflow.md). Runtime exposes six tools, all staging WRITEs and no approval/execution MCP tool. Existing first-cycle payload/approval behavior is preserved. Earlier four/five-tool and unbuilt-credit/follow-up notes below are historical.

Implemented October 20 for customer-created synthetic cases, with explicitly simulated Barbara identity. This is the first approval cycle, not processor follow-up or credit. Theo has supplied actual ChatGPT evidence retrieval for APX-3625B0CC; the new action tools still need account-side invocation proof.

## Public tools and private execution

`APEX_ENABLE_STAGING=1` opts in on the adapter; it is enabled in ignored local configuration. It is off by default in .env.example and cannot be enabled with the real-OAuth runtime path until real action entitlements are implemented. Optional callbacks let read-only deployments/tests retain the original two tools.

| Tool | Effect |
| --- | --- |
| get_case | Read assigned case metadata and any released deterministic association check |
| get_evidence | Read one released source at the requested snapshot |
| stage_evidence_request | WRITE: persist a bounded draft only; readOnlyHint=false |
| get_action_result | Read operational facts; only VERIFIED_SAVED_REQUEST establishes a saved request |

No MCP tool can approve or execute a request. The public adapter has no generic HTTP proxy. The private /api/review-action endpoint is reached only by the separate local Apex review surface, with the existing local CSRF/origin boundary. That is a synthetic demo approval mechanism, not authenticated production human presence. Anyone who can reach the no-auth public endpoint shares the simulated role and can stage an eligible synthetic draft; never expose real records through it.

## Demonstrate the first approval cycle

1. Open the local [queue](http://localhost:8080/queue), locate APX-3625B0CC and click Attach later packet. This explicit simulation releases E-003 and advances version 1 to 2. E-004 remains withheld. Codex did not perform this step on Theo's case.
2. Refresh Apex's tool definitions in the installed ChatGPT connection. Confirm stage_evidence_request is present; its write confirmation is separate from business approval. Do not relabel the write as read-only to suppress confirmation. [Official tool/confirmation guidance](https://developers.openai.com/api/docs/guides/custom-mcp-server).
3. Ask ChatGPT to read the current case and E-003, then stage only scope authentication_transaction_association at the returned snapshot. It must not claim the request was sent. The draft contains the exact queue/question/source IDs/AUTH-77/T-204 references and local review URL.
4. Open the returned local Apex case URL, or refresh its existing review page. The approval card shows the exact question, destination, authentication record, disputed transaction, source IDs and action ID in readable fields. Raw JSON and payload hash are under collapsed Technical details, not the primary review experience. Inspect the exact action and current case, then explicitly click Approve & execute in demo. Review expires after five minutes; expired/changed drafts require a fresh stage/review.
5. Apex separately reads the saved case and checks the approved scope/hash/version/actor. Ask ChatGPT for get_action_result with the returned action_id; only VERIFIED_SAVED_REQUEST is execution proof. It verifies request facts, not merely a receipt or status.
6. Click Simulate later response in local Apex to release E-004 and advance to version 3. The server compares structured returned transaction T-198 with disputed T-204 and returns matches_disputed_transaction=false. This is deterministic record association, not proof of fraud or a credit decision. Read the new source/current snapshot in ChatGPT and reassess with uncertainty preserved.

## Controls

- Explicit assigned demo actor is checked at stage, approval and result retrieval. This is not external OAuth proof. Seed APX-001 is read-only to this new action path and retains its legacy local prototype actions.
- Scope is fixed to the one internal association lookup, with released E-002/E-003 and matching structured case/auth-record references. No arbitrary question, recipient, script or model-supplied approving identity.
- Draft stores an immutable archive, random ID, canonical exact-payload hash, current evidence snapshot, simulated actor and five-minute expiry. Approval rechecks all of these, current state, source release and assignment.
- Identical stage retries reuse the current unexpired draft. Identical approval retries return the original request. If a receipt exists but saved facts cannot be verified, return reconciliation_required rather than blindly execute again.
- get_action_result and browser verifyEffect compare the saved request's identifier/state, outer case, question, queue, references, source IDs, evidence version, payload hash and explicit simulated approval identity. The receipt is not the verification source.
- Legacy /api/action approve and legacy specialist-handoff staging cannot bypass the new-case review path. Old APX-001 checks remain unchanged. Unreleased evidence strips structured metadata as well as text from browser output.
- The lookup response is an explicitly simulated later fixture. Structured association output is released only after E-004; no final decision is embedded in the initial packet or returned check.

## Executed proof and remaining work

53 Python tests and 29 Node tests pass (82 total). The isolated browser/SDK run passed intake/correction/confirmation, current case ID, later packet, MCP staging with no execution, actual local review-button click, separate request verification, duplicate approval, explicit later response and deterministic association. It used mock intake for this increment, made no new provider requests and did not alter the user's database. Earlier live Responses intake and actual ChatGPT reads remain separately recorded.

Public SDK listing shows four correctly annotated tools. A premature stage on Theo's still-intake case was denied without mutation. Public /api/review-action, /api/stage-request and /api/action-result returned 404. Actual ChatGPT staging/confirmation and human approval on Theo's saved case still need user-side proof. Processor follow-up, full resolution brief, credit and final customer outcome remain unbuilt. Slides and rehearsal remain out of scope.
