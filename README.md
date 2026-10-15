# Apex — dispute investigation prototype

A runnable, synthetic analyst workflow for iterating on an OpenAI Applied AI Architect onsite demo.

## Run

Requires Python 3.10+; no packages, API keys, or build step.

```sh
python3 server.py
```

Open http://127.0.0.1:8080. State persists in local `demo.sqlite` (ignored by Git).

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
