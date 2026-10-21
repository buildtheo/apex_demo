# Barbara: Queue, ChatGPT, Credit Approval

Implemented October 21. This supersedes the earlier three-business-approval workflow for new rehearsals. Only credit requires business approval in Apex. Simulated identity, scoped authority and synthetic evidence/ledger limits remain unchanged.

## One-Time Connection Update

In ChatGPT, open Plugins -> Apex Dispute Operations1 -> Manage app -> Refresh tools. Keep the working Server URL; do not recreate the connection or tunnel just for this code update. A fresh conversation must discover these seven tools:

| Tool | Effect |
| --- | --- |
| get_case | Read the assigned case and released source metadata |
| get_evidence | Read an available source at the current evidence version |
| request_authentication_lookup | Save and verify the fixed internal lookup; no separate business approval |
| request_processor_evidence | Save and verify the scoped purchase-specific follow-up; no separate business approval |
| receive_demo_evidence | Explicitly simulate one later arrival, only when the presenter asks to advance demo time |
| get_action_result | Read back the actual saved request or separately verified synthetic credit |
| stage_credit | Save a proposal for separate exact human review; cannot approve or post |

All four state-changing tools are correctly marked WRITE. ChatGPT may ask permission to use them. That is host permission, not an extra Apex business approval. Do not relabel writes as reads, disable safeguards or claim these prompts cannot appear.

The old stage_evidence_request/stage_processor_followup tools are absent from the deployed bounded configuration. The old Python paths/test configuration remain for historical case compatibility; do not use them for the new walkthrough.

## Run the Story

1. Click Restart demo in Apex and complete Martha's conversational report in the banking app. Keep the returned case, not the original completed proof case.
2. Open the Apex queue. Click Investigate in ChatGPT beside that report. Apex opens actual ChatGPT and tries to copy a case-scoped opening prompt. Select your Apex connection, paste and send. If clipboard access or the popup fails, the prompt, Copy prompt control and plain Open ChatGPT link remain on the Apex page. No unsupported prompt URL, automatic tool selection or automatic message submission is claimed.
3. Stay in that ChatGPT conversation for the investigation. Initial evidence includes the customer report and ledger. The later processor packet is not silently available.
4. Ask: "Show the later processor packet, then tell me what doesn't add up." This invokes the explicit initial_packet simulation and lets ChatGPT read the released E-003, not invent its content.
5. Ask: "Check whether that authentication record belongs to this purchase." The bounded lookup is saved and verified immediately, without an Apex approval visit. Its response remains pending.
6. Say: "Let's move forward to when the lookup comes back. What did we learn?" The explicit authentication_lookup simulation releases E-004. ChatGPT can then inspect the different-transaction finding.
7. Ask: "Request evidence for this purchase and an explanation of the incorrect reference. Keep the original record." The fixed processor follow-up saves/verifies the request, not a response or credit.
8. Say: "Show the later processor response. What changed, and what do you recommend?" The explicit processor_response simulation releases the versioned correction E-005. ChatGPT assesses the complete evidence without equating missing records to fraud or automatic eligibility.
9. Ask: "Prepare the credit recommendation for my review, with the evidence and a neutral summary for Martha. Don't approve or post it." ChatGPT stages a cited proposal and links to Apex. Now Barbara returns to Apex to review the exact amount, rationale, sources and customer explanation, affirm support and approve.
10. In the same ChatGPT conversation, ask to verify what was saved and posted if needed. Finish in Martha's app with the verified credit, not a model's assertion of success. A lost customer tab can use the labeled read-only local preview after verification.

These prompts are conversational suggestions, not fixed outputs or a model-eval pass. The opening prompt asks for short findings and sources rather than repeated tables and identifiers. Do not skip useful customer/analyst clarification to hit a predetermined outcome.

## Enforced Boundaries

The new request handler validates current assignment, active practice run, source release, snapshot, status and a server-owned scope/payload. It cannot send arbitrary correspondence, change an account, decide a dispute or post credit. A save is followed by a persisted request read. Repeated and concurrent requests return the same verified effect; uncertain/mismatched saved facts fail closed. The audit records requested_by and bounded_investigation, not a fabricated human approval.

Later arrivals are separate writes, not side effects of reading or requesting evidence. The typed stage and explicit later_demo_response flag are mandatory; the source and retry marker share one save. Only the permitted stage can advance. Duplicate time jumps do not advance twice or duplicate sources. This is a rehearsal control, not production evidence ingestion. The instruction to wait for the presenter is guidance to the model, not independently authenticated proof of human intent; ChatGPT host permissions remain separate.

Credit still requires the cited complete record, a fresh exact proposal, the separate human evidence-support check, unchanged simulated authority below $1,000, atomic once-only posting and separately verified ledger/case facts. Neither investigation tool nor the demo-arrival tool exposes that approval path. Original sources are preserved and only the later correction is appended.

The compatibility result field approved_snapshot denotes the saved request's evidence version for old and new records; it must not be narrated as a human approval for a bounded request. New request authorization metadata explicitly distinguishes that mode. Old proof records are not rewritten.

## Verification and Limits

The isolated browser/official MCP SDK walkthrough tests copy/open launch and clipboard fallback, new-case continuity, both bounded requests, explicit later arrivals, no investigation approval visit, exact credit review, saved ledger/case verification, customer display and restart. Python/Node checks cover scopes, assignment, snapshots, unreleased evidence, concurrent/repeated requests, corrupted saved facts, atomic later-arrival save failure, old practice rejection and unchanged credit controls.

This is local/browser/SDK proof with synthetic model output, not a new actual-ChatGPT-account walkthrough or representative model evaluation. Actual installed-tool refresh, host confirmation behavior and conversational quality still need Theo's rehearsal. No live provider request or financial action on the completed proof case is required for deployment. Voice, synthetic source PDFs and broader evals remain pending.

Official documentation checked October 21: [tool annotations](https://developers.openai.com/plugins/reference) are hints, not server authorization; [connect and test](https://developers.openai.com/plugins/deploy/connect-chatgpt) requires testing real tool selection and write confirmations in the installed ChatGPT connection. A plain copy/open launch avoids claiming an undocumented external prompt-injection/deep-link mechanism.
