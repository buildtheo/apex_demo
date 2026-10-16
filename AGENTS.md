# Apex implementation instructions

Read README.md, docs/plan.md, docs/demo-flow.md, docs/discovery-and-outcomes.md, and docs/decisions-and-artifacts.md before editing.
The decision/artifact index preserves the meeting outline, accepted and rejected design choices, open items, and artifact locations. The demo-flow document defines the customer banking app → Apex DMS queue → actual ChatGPT → Apex execution journey.
The locked demo has three potential OpenAI experiences: Realtime voice OR an OpenAI API-powered conversational text agent in the banking web/iPhone app, followed by actual ChatGPT for the analyst. Each path includes two OpenAI-powered experiences. Both intake agents obtain customer confirmation before shared Apex case creation; a plain form is only a scaffold/fallback. See docs/demo-flow.md.
Discovery answers select the demonstrated voice or conversational in-app intake path; do not hardcode voice as the default story. Keep the discovery table and end-in-mind outcomes current.
Read docs/meeting-outline.md for the criteria preparation pack and links to customer, architecture, value, and objection materials. The original brief was checked: the two required product surfaces are ChatGPT and Platform/APIs; Realtime and text are alternative API modes. Prepare both discovery branches, but both need not be live implementations; label simulations explicitly. Explicit fictional assumptions are allowed and must never be presented as measured customer facts.
Before further feature building, complete and record Intelligent UI Gate 0 from docs/reference-architecture.md, as requested by Theo. A recorded sourced-table fallback is valid; combined Apex-tool/UI proof remains pending until the minimal read adapter exists. After the gate, prioritize one real read-tool connection and renderable/rehearsed presentation over further feature or prose expansion. Do not mark draft-persisting stage tools read-only to suppress ChatGPT confirmation.
Keep these documents current when implementation or user decisions change. Do not leave important decisions only in chat.
Read docs/adversarial-review-response.md for accepted review actions; the original adversarial review is subjective critique, not an official hiring rubric or permission to inflate claims.
Read docs/handoff.md for the latest verification results, preview limitations, and next-session starting point.

Keep every data item synthetic and every integration status explicit. Never present fixed responses as AI output or a custom API chat UI as actual ChatGPT. Do not add real customer data, credentials, proprietary documents, or interview uploads to this public repository.

Preserve separation of evidence assessment, consumer disposition, and network recovery. Missing proof is not proof of fraud. Do not encode unverified regulatory deadlines or CE eligibility rules. Requests do not pause external deadlines.

Build small working increments. Test state changes, duplicate execution, stale drafts, unauthorized access once identity exists, and false success. Do not claim model evals have passed until recorded executions exist.

