# Processor follow-up - October 21

Implemented for customer-created synthetic cases after the completed internal lookup. This is the second approval cycle; credit and Martha's resolved banking view remain unbuilt. No external processor is contacted. Identity remains explicitly simulated, not OAuth.

## What the audience should understand

"That record belongs to a different purchase. Let's ask the processor for evidence supporting Martha's charge and a correction to its earlier response."

The request covers authentication, authorization, timestamps, device verification and any available 3-D Secure records for T-204, the incorrect AUTH-77 citation, explicit unavailable evidence, and a separately versioned correction preserving E-003 unchanged. Missing evidence is not proof of fraud or automatic credit eligibility.

## Walk through in actual ChatGPT and Apex

1. Reconnect the installed Apex connection with the current Server URL from ignored .local/runtime.json: the October 20 quick tunnel expired and was replaced October 21. Use the existing No authentication synthetic-demo setup, then refresh the tools. There are now five: get_case, get_evidence, stage_evidence_request, stage_processor_followup and get_action_result. Neither staging tool can approve or execute. Keep write confirmations enabled.
2. Ask: "Open APX-3625B0CC and review its current evidence. Use stage_processor_followup to prepare the request for evidence supporting Martha's disputed purchase and a corrected processor response. Preserve the original export. Stop for my review. Explain it briefly in plain language."
3. Open http://localhost:8080/ops?case_id=APX-3625B0CC and refresh. Inspect the exact request, destination, purchase, cited sources and preservation requirement. Click Approve request in demo within five minutes. An expired or changed draft must be restaged and reviewed again.
4. Ask ChatGPT to use get_action_result with the returned action ID. Only VERIFIED_SAVED_REQUEST proves the synthetic request is saved. The case stays at evidence v3 with PROCESSOR_PENDING, and the page says no response has arrived yet. This is not an external message-delivery claim.
5. Explicitly say "Later, a processor response arrives" and click Show later processor response (simulation). Only this action appends E-005 and advances the evidence to v4. It is not a model-generated or live-processor response.
6. Ask ChatGPT: "Read the current case and corrected processor response E-005. Explain what changed, what remains unresolved, and how it affects the evidence for Martha's purchase. Cite your sources. Do not approve a credit or declare fraud."

## Saved records and controls

- Internal request stays in request; follow-up is separately saved in processor_request. Both actions remain independently verifiable after later case progression.
- Follow-up staging requires assignment to the simulated Barbara actor, current evidence version, released E-002/E-003/E-004, exact structured lookup association and a separately verified completed internal request. Seed APX-001 cannot use this new path.
- The fixed follow-up payload cannot be replaced with arbitrary questions, recipients, code or broad customer-data collection. Draft is a WRITE, not submission or approval.
- Exact immutable draft, canonical SHA-256 payload hash, current evidence, assignment, five-minute expiry and preservation scope are rechecked at separate local review. Repeated approval does not create another request; a receipt without saved facts requires reconciliation.
- E-005 is created only at explicit simulated arrival. It corrects the fictional export mapping, states unavailable T-204 authentication/authorization evidence and makes no fraud/liability determination. E-001 through E-004 remain unchanged.
- E-005 includes source, received timestamp, document version 2, correction_of E-003 and the follow-up request ID. Its get_evidence result returns allowlisted provenance. No original PDFs or external document retrieval are implemented yet; current evidence remains synthetic record/excerpt data.
- Only port 8787's MCP adapter is tunneled. Review/action/private HTTP endpoints remain off the public adapter. No approval/execution MCP tool exists. The local review mechanism and fixed demo actor are not production user authentication or human-presence proof.

## Executed verification

60 Python tests and 31 Node tests pass (91 deterministic tests). The isolated mock-intake browser/SDK check passed both separate MCP draft/approval/result cycles, the visible waiting state, explicit E-005 arrival and provenance, and exact preservation of the original sources. It did not call OpenAI or alter Theo's live case. These tests are not model evaluations or actual ChatGPT invocation proof for the new tool.

Actual account-side stage_processor_followup invocation and Theo's approval are the next walkthrough checks. Financial ledger/credit, final decision brief, customer resolution and document/PDF provenance are still pending.
