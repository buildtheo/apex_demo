# Demo flow and system ownership

Recorded October 15, 2026 from Theo's clarification. Read alongside plan.md and handoff.md. This describes the intended experience, not a claim that pending integrations work.

## Core distinction

Customer banking app → Apex dispute-management case queue → actual ChatGPT investigation → verified updates back to Apex.

Apex's dispute-management system (DMS) owns the case. ChatGPT is the analyst's investigation workspace, accessing authorized Apex records through connected tools. A dispute does not arrive in ChatGPT as a separate case or independent queue. The mocked DMS represents the bank's existing operational system.

There are three visible surfaces, including two OpenAI-powered experiences: customer banking/intake (Realtime voice), Apex DMS, and actual ChatGPT (analyst investigation).

## End-to-end experience

| Step | Actor and experience | System responsibility |
| --- | --- | --- |
| 1. Spot the charge | Customer opens a transaction in the Apex banking app and selects Dispute this charge. | Banking app supplies the selected transaction context. |
| 2. Report the issue | Customer can choose a call/voice route or an in-app reporting route. The live demo follows voice intake using Realtime. | Apex captures structured intake and an attributed customer statement. Entry choices do not imply both channels have been implemented. |
| 3. Create the case | Intake returns a case ID. | Apex case service persists the dispute, transaction reference, statement, and initial history. Do not imply automatic credit or network filing. |
| 4. Pick up the work | Analyst sees the case in an assigned work queue. | Apex DMS owns routing, assignment, status, and access permissions. |
| 5. Investigate | Analyst opens actual ChatGPT and requests the same case by ID. ChatGPT retrieves authorized evidence, compares sources, and identifies a material inconsistency. | Connected Apex tools enforce identity and case-level access. ChatGPT provides cited investigation support; Apex remains the record authority. |
| 6. Request more evidence | Analyst reviews and approves a scoped internal evidence request. | Apex executes the approved request; a separate authoritative read verifies its creation. |
| 7. Reassess | A clearly labeled simulated response arrives, the evidence snapshot changes, and ChatGPT reassesses what the evidence supports and leaves unresolved. | Apex stores the response and history. New evidence must invalidate stale action drafts/approvals as applicable. |
| 8. Approve and verify next action | Analyst reviews a supported next action and explicitly approves it. | Apex validates and executes it; an independent read checks the resulting state. Current prototype endpoint is specialist handoff. |
| 9. Track outcome | Analyst can see updated status, assignment, evidence, and audit history in the DMS. | Apex retains the durable operational record. Final consumer disposition and network recovery remain separate and undecided. |

## Stage transition in the demonstration

Show an explicit time jump between customer intake and later analyst investigation. Merchant documents and later evidence must not appear to have arrived during the initial call.

Suggested narration: "Here is the case in the analyst's queue. Now let's investigate it in ChatGPT."

Switch to actual ChatGPT and ask: "Open case CASE-2026-88412 and summarize what needs investigation."

A direct Investigate in ChatGPT button or deep link is optional and unvalidated. Manual switching with the same case ID is sufficient to demonstrate the intended handoff. Do not show a button as working until its supported integration has been verified.

## Why the existing prototype can be confusing

The initial custom browser workspace combines case details with fixed guided investigation responses. It is a local workflow scaffold, not the final three-surface experience and not actual ChatGPT. An API-backed custom chat panel would also not meet the actual ChatGPT milestone by itself.

At this clarification, customer banking screens, live Realtime intake, actual ChatGPT integration, real authentication, and case-level authorization remain pending. A distinct assigned-case queue must be built or verified rather than inferred from the existing single-case view. The implemented synthetic sequence is evidence review → approved request → simulated response → reassessment → approved specialist handoff → read-back verification. Consult handoff.md for recorded checks and their limits.

## Build implications and scope control

- Make customer banking/intake, DMS case management, and ChatGPT investigation visually and verbally distinct.
- Use one shared case ID and authoritative case service across surfaces.
- First get the local prototype accessible for review. Then prove authenticated case/evidence retrieval in actual ChatGPT; add customer entry and Realtime intake in small increments per plan.md.
- Keep call/voice and in-app options as intended entry choices. A real telephone connection and a complete second intake channel are not established requirements for the first demo. The precise voice transport remains an implementation choice.
- Show human approval and independent verification for both the evidence request and the later consequential action. The first gets the architectural explanation; the second is concise.
- Model tools may prepare actions; they must not grant human approval themselves. Apex owns authorization, execution, and authoritative results.
- Label synthetic records, simulated arrivals, fixed responses, and pending integrations honestly.
- Preserve the locked 30-minute meeting and 18-minute demo. This clarification explains the journey; it does not expand the demo into a complete banking or network-adjudication product.

## Acceptance checks for future agents

An observer should be able to answer: Where did the customer start? Where was the case created? Where does the analyst find it? What does ChatGPT retrieve? Who approves? Which system executes? What independently proves completion?

The same case must remain identifiable across the journey. Source observations must remain separate from model conclusions and evaluator answer keys. Missing proof is not proof of fraud. Evidence requests do not pause external deadlines. The final financial outcome remains open; do not silently promote specialist handoff into a final consumer resolution.
