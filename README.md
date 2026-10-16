# Apex — dispute investigation prototype

A runnable, synthetic analyst workflow for iterating on an OpenAI Applied AI Architect onsite demo.

## Locked target demo

Discovery selects either OpenAI Realtime voice support or an OpenAI API-powered conversational text agent in the banking web/iPhone app. Both clarify the selected charge, prepare intake for customer confirmation, and create the same Apex case for analyst investigation in actual ChatGPT. That is three potential OpenAI experiences, with two on each demonstrated path. Apex DMS owns the case and approved execution. See [demo flow](docs/demo-flow.md) and [running discovery](docs/discovery-and-outcomes.md).

The current form and fixed analyst responses are scaffolds; the integrations below remain pending. Locking the target does not mean it has been implemented.

The customer banking app will be presented in the browser as an iPhone-style simulator. A native iOS build or Apple iOS Simulator is not required. ChatGPT and Apex DMS remain separate analyst surfaces.

## Run

Requires Python 3.10+; no packages, API keys, or build step.

```sh
python3 server.py
```

Open http://127.0.0.1:8080 for the iPhone-style customer banking preview. Select VeloCraft, then Dispute this charge to choose voice support or an in-app report. The form saves a browser-local draft only; voice connection and case submission remain pending. Open http://127.0.0.1:8080/ops for the existing analyst investigation prototype. Case state persists in local `demo.sqlite` (ignored by Git).

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
4. Approve & execute in the local demo. The browser independently reads case state to verify the result.
5. Simulate a later response. Compare again to reassess the new evidence.
6. Stage and approve the specialist handoff; verify the assignment and status.

The handoff is a reversible prototype endpoint, not a locked final financial disposition. Consumer resolution and network recovery remain undecided. This build does not finalize credit, file network actions, or send messages.

## Honest implementation boundaries

- SQLite-backed case transitions, draft version binding, duplicate approval handling, and read-back verification are implemented.
- Investigation text is fixed demo content. No model, ChatGPT, Realtime, MCP, bank, Visa, or external evidence service is connected.
- Approval is performed by the local demo operator. This is not OAuth, real identity verification, or production role authorization.
- Server binds only to localhost. Do not expose it to the internet as a production service.
- All names, transactions, sources, and DEMO-01 policy are synthetic. No legal or network eligibility conclusion is encoded.
- Original customer-provided PDFs and interview materials are intentionally not in this public repository.

## Tests

```sh
python3 -m unittest discover -s tests -v
```

These test local workflow controls, not model quality or production security. See `docs/plan.md` for the locked meeting baseline and next integration milestones.
