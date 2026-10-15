# Development handoff — October 15, 2026

## Starting point

Repository: `buildtheo/apex_demo`. Prototype baseline reviewed: `7e88ca49a6ec6ffae821ba51a6bfc8f73d2afda7`.

Read `AGENTS.md`, `README.md`, and `docs/plan.md` before changing application behavior. The user is moving to Codex in VS Code. Their immediate goal remains a working browser preview they can personally open and review. They use a Chromebook.

## Work completed in the cloud session

- Retrieved and inspected the requested repository after discovering that the environment initially opened a different repository. All Apex work is in this repository.
- Ran `python3 -m unittest discover -s tests -v`: all six existing workflow tests passed.
- Started the unmodified Python server on cloud localhost port 8080.
- Exercised the UI in headless Chromium at a 1440 × 1000 viewport: loaded the synthetic case, compared evidence, staged and approved an evidence request, simulated its response, reassessed the evidence, and staged and approved the specialist handoff. Both approvals produced the UI's separate read-back verification. No JavaScript page errors occurred during this walkthrough.
- Inspected a screenshot of the initial desktop UI. Case summary, expandable evidence, guided investigation, action controls, and history rendered. The cloud test case was reset afterward.
- Added VS Code tasks for starting the server and running the existing tests, plus explicit local/remote preview instructions.

The application server and UI were not changed. The browser walkthrough was an interactive session check, not a committed automated browser test. Temporary browser installation, screenshots, and demo database state are not repository deliverables.

## Preview issue and verification limits

The cloud session had no supported browser-preview URL or port-forwarding tool. Its `http://127.0.0.1:8080` URL referred to the cloud machine. The user clicked that link on their own computer and could not reach the app. No hosted preview was deployed. A local cloud server process may stop between sessions; do not assume it is still running.

The user chose help running locally and then decided to move to VS Code. Their own successful browser access and UI review have **not** been confirmed. First start the server in the VS Code environment and confirm which URL reaches that process from their browser. For remote VS Code, use its Ports panel to forward port 8080.

The checks above establish a working synthetic demo path. They do not establish production security, authenticated authorization, model quality, real ChatGPT connectivity, Realtime connectivity, or external execution. The existing persistence-named test uses an in-memory store; it does not verify reopening a database after restart. This session did not comprehensively test mobile layouts, accessibility, network failures, false-success handling, or concurrent clients.

## Locked boundaries

- One synthetic dispute case; inspectable sources; evidence requests; human approval; independent execution read-back.
- Investigation responses are fixed demo content, explicitly labeled. No actual ChatGPT, model, Realtime, MCP, bank, Visa, or external evidence integration exists.
- The custom browser workspace is not actual ChatGPT. An OpenAI API-backed chat UI would not satisfy the actual ChatGPT milestone by itself.
- The current approval actor is the local demo operator. Real identity, case-level permissions, payload/snapshot/expiration-bound authenticated approval, and production audit controls remain pending.
- Consumer disposition and network recovery remain separate and undecided. The handoff is to specialist review, with no financial or network action.
- Keep credentials, customer data, proprietary records, and original interview materials out of this public repository. Missing proof does not establish fraud; requests do not pause external deadlines.

## Next Codex task

> Read AGENTS.md, README.md, docs/plan.md, and docs/handoff.md. Run the prototype and existing tests in this VS Code environment. Help me open the working browser preview, accounting for local versus remote execution, and review the UI with me. Preserve the locked synthetic workflow and explicit integration labels. Once the preview is usable, implement the next small milestone from docs/plan.md: authorized case/evidence read tools behind real authentication and case-level permissions, then prove an actual ChatGPT connection. Keep model tools separate from human execution approval, keep all changes in this repository, and do not claim integrations or evals have passed without recorded verification.
