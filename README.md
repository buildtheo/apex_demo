# Apex — dispute investigation prototype

A runnable, synthetic analyst workflow for iterating on an OpenAI Applied AI Architect onsite demo.

**Continuing as another agent? Start with [the consolidated handoff](docs/START-HERE.md).** It links the locked demo, current implementation, executed checks, source evidence, and next required step.

## October 20 decision - Barbara approves the supported credit

Theo selected a completed consumer outcome: after further evidence, Barbara explicitly approves the $648.50 credit under a **fictional Apex analyst-authority policy for amounts below $1,000 when the reviewed evidence supports the dispute**. The threshold grants authority, not automatic entitlement or a fraud finding. Apex validates the action, posts a synthetic ledger credit, and separately reads the saved credit and case decision before displaying completion and the approved customer explanation. This supersedes the October 19 specialist-referral ending. Network recovery stays separate. Read [the current ending and proof requirements](docs/case-resolution.md). Code still implements the earlier handoff; additional evidence, credit posting and customer-resolution flow remain unbuilt. No new runtime/model test or Gate 0 completion is implied.

## Merchant naming — October 20

Use JCPenney as the familiar merchant name in this fictional dispute. All purchases, customer statements, processor assertions and evidence are synthetic; they do not describe actual JCPenney conduct or records. Narration leads with “the $648.50 JCPenney purchase”; internal IDs remain available for traceability. Martha Rivera is the cardholder and Barbara is the fictional analyst in the talk track. E-003 is a synthetic export from a fictional merchant processor, not a JCPenney statement. Use the [spoken opening disclosure once](docs/meeting-outline.md#opening-discovery--october-20-preparation-decision). Earlier snapshots/review text may use superseded names.

Existing demo.sqlite state retains its old seeded text until the local demo is explicitly reset. Use the existing development reset when ready to reload the new fixture; no automatic deletion or migration is introduced.

## Locked target demo

Discovery selects either OpenAI Realtime voice support or an OpenAI API-powered conversational text agent in the banking web/iPhone app. Both clarify the selected charge, prepare intake for customer confirmation, and create the same Apex case for analyst investigation in actual ChatGPT. That is three potential OpenAI experiences, with two on each demonstrated path. Apex DMS owns the case and approved execution. See [demo flow](docs/demo-flow.md) and [running discovery](docs/discovery-and-outcomes.md).

The current form and fixed analyst responses are scaffolds; the integrations below remain pending. Locking the target does not mean it has been implemented.

The customer banking app will be presented in the browser as an iPhone-style simulator. A native iOS build or Apple iOS Simulator is not required. ChatGPT and Apex DMS remain separate analyst surfaces.

## Presentation preparation

The two selected product surfaces are ChatGPT and Platform/APIs. Realtime voice and API text are alternative customer experiences; prepare both for discovery, with live or explicitly simulated execution. Both modes need not be live implementations.

Start with [the timed meeting and criteria map](docs/meeting-outline.md), then [customer and stakeholders](docs/customer-profile.md), [architecture and data flow](docs/reference-architecture.md), [before/after and value](docs/business-case.md), and [objection preparation](docs/objection-prep.md). These are reviewable drafts with explicit assumptions; a finished deck, rehearsal, and live two-surface proof remain pending.

## Run

Requires Python 3.10+; no packages, API keys, or build step.

```sh
python3 server.py
```

Open http://127.0.0.1:8080 for the iPhone-style customer banking preview. Select JCPenney, then Dispute this charge to choose voice support or an in-app report. The form saves a browser-local draft only; voice connection and case submission remain pending. Open http://127.0.0.1:8080/ops for the existing analyst investigation prototype. Case state persists in local `demo.sqlite` (ignored by Git).

## Continue in VS Code

Open this repository folder in VS Code, then use **Terminal → Run Task → Apex: Run demo**. Wait for `Apex synthetic prototype: http://127.0.0.1:8080`, then open that URL in your browser. Keep the task running; stop it with Ctrl+C in its terminal. **Apex: Run tests** runs the workflow tests.

These tasks use `python3` (Python 3.10+). No extension, packages, or API key is required. If your Python command is `python` or `py`, run the equivalent commands manually in the integrated terminal.

`127.0.0.1` and `localhost` refer to the machine running the browser. A server started in a remote cloud environment is not accessible through your computer's localhost without port forwarding. In a remote VS Code session, forward remote port **8080** using the **Ports** panel and open its local address. The server remains bound to remote localhost; do not make the unauthenticated prototype publicly accessible.

On a Chromebook, use the Linux development environment for Python and VS Code. If Linux is disabled by an administrator, local setup needs a permitted environment.

See [the development handoff](docs/handoff.md) for completed checks, limitations, and the next Codex task.

## Walk through

1. Inspect the case and expand evidence records.
2. Compare the evidence and inspect the missing information.
3. Stage the evidence request and review its exact payload.
4. Approve & execute in the local demo. The browser performs a separate case read and verifies the saved request scope against the approved action.
5. Simulate a later response. Compare again to reassess the new evidence.
6. Stage and approve the specialist handoff; verify the assignment and exact saved handoff payload.

The handoff remains the implemented prototype endpoint, superseded as the target story by the human-approved synthetic credit ending in docs/case-resolution.md. This build does not yet finalize credit, file network actions, or send messages.

## Honest implementation boundaries

- SQLite-backed transitions, draft version binding, duplicate handling, and separate read-back checks of saved request/handoff facts are implemented. Verification reads the same local database; it does not establish external execution or independent-system confirmation.
- Fixed assessments are served only for the available evidence snapshot. The UI checks case/version metadata and discards superseded responses after refresh, actions, or reset. Raw records remain separate from assessment text.
- Investigation text is fixed demo content. No model, ChatGPT, Realtime, MCP, bank, Visa, or external evidence service is connected.
- Approval is performed by the local demo operator. This is not OAuth, real identity verification, or production role authorization.
- Server binds only to localhost. Do not expose it to the internet as a production service.
- All names, transactions, sources, and DEMO-01 policy are synthetic. No legal or network eligibility conclusion is encoded.
- Original customer-provided PDFs and interview materials are intentionally not in this public repository.

## Tests

```sh
python3 -m unittest discover -s tests -v
```

The suite includes workflow, HTTP, persisted-effect verification, and delayed-assessment race checks. Node is optional for running the app but required for the JavaScript verifier and UI-race tests; those tests are explicitly skipped without it. These test local workflow controls, not model quality or production security. See `docs/plan.md` for the locked meeting baseline and next integration milestones.


