# Development handoff — October 15, 2026

## Next action — Intelligent UI readiness before feature expansion

Theo requested Gate 0 before further feature building. Read plan.md and reference-architecture.md. Gate status is NOT RUN; verify the actual presentation account/Chat mode and a source-based comparison, record fallback if unavailable, and distinguish pasted-snapshot rendering from real Apex retrieval. If no adapter exists, record combined proof pending, select table fallback for now, then implement only get_case/get_evidence and repeat the combined test before further UI work. Do not build a UI framework to force the optional feature.

Updated preparation also covers growth-capacity arithmetic, staging confirmation versus bank authority, named API baseline, and a spoken OpenAI position. Text-primary/voice-prepared-alternative remains a proposed rehearsal default; discovery selection is unchanged. Account/dispute scale is not publicly benchmark-validated. No integration, native Intelligent UI, deck export, or rehearsal was executed by this documentation change. The next deliverables are working/visible proof, not more planning prose.

## Presentation preparation update — October 15, 2026

Original assignment checked privately; selected surfaces are ChatGPT and Platform/APIs. Voice and text remain alternative customer experiences, but both do not need live implementation. Keep discovery-driven branch selection and label simulations. Read customer-profile.md, reference-architecture.md, business-case.md, objection-prep.md, and meeting-outline.md. They add explicit fictional customer/urgency/baseline/cost assumptions, stakeholder and qualification prep, architecture/data flow, primary-source regulatory mapping, a timed six-slide skeleton, and proposed eval/governance/enablement. No actual deck, rehearsal, model evaluation, or live OpenAI connection was produced by this documentation update. Current custom-MCP connection guidance was verified from official docs; actual account/identity setup and invocation remain pending. Prioritize one live read-tool proof alongside presentation work, rather than building both intake modes before proving ChatGPT.

## Completed follow-up repair — October 15, 2026

Incorporated the supplied patch and corrected the two additional review gaps:
- Verification rejects a missing/blank request ID, unrecognized request state, missing approval identity, and a mismatched outer case ID. It still verifies saved requests after normal case progression and verifies exact saved handoff payload/assignment. This is a separate read from the same SQLite database, not external-system confirmation.
- Assessment responses include case ID and evidence version. The UI discards mismatched, out-of-order, and superseded responses; refresh and actions clear old assessments. A client generation guard prevents a late assessment from repopulating the panel after reset reuses the same case ID/version. Superseded errors are discarded too.
- Checks executed for this follow-up: 26 tests passed with Python and Node available. These include real local HTTP requests, verifier negative cases, and a minimal-DOM Node harness running the actual app.js with deferred network responses. No real-browser, mobile/layout, accessibility, or model evaluation was run in this follow-up.
- The preceding supplied patch was applied in an isolated source copy and its 22 tests independently passed before these additions. The earlier jsdom/mutation-test claims below are reported by the supplied patch author; they were not rerun here.
- The saved handoff remains the short fixed referral payload. The full cited investigation brief, authenticated authority, OpenAI integrations, and rehearsal-environment hardening remain pending. Existing database files are not migrated by this change; use the explicit local demo reset when moving from the old synthetic fixture if needed. Schema compatibility handling remains future work.

## Credibility repair — evidence and completion checks (after adversarial code review)

- **Effect verification.** Approving an evidence request now saves its case, approval ID, destination, question and source IDs; approving the handoff saves the exact approved payload in `handoff` and sets the assignment. `web/verify.js` compares those saved facts with the exact action the analyst approved. It does not compare receipt and status, and a request stays verified after the case advances. This is a separate read of the same local database, not a second system; the UI wording says "saved case record" accordingly.
- **No answer leakage.** The fixed comparison text moved from `app.js` to `GET /api/analysis/<compare|gap>`, which returns the post-lookup finding only after E-004 is released. No served asset contains it.
- **Raw evidence.** E-002/E-003/E-004 now state records, identifiers and attributed merchant assertions only. Demo framing stays in the UI; uncertainty analysis stays in the fixed assessment layer. A test fails if conclusion phrases return to evidence text.
- **Checks reported by the supplied patch author (Oct 15, cloud session).** `python3 -m unittest discover -s tests -v`: 22 tests pass, including a real HTTP server on an ephemeral port. `tests/test_verify.py` needs Node and is skipped without it; with the verifier mutated to always succeed, 3 of its 4 tests fail. A throwaway jsdom run of `/ops` passed the full walkthrough, including a second client advancing the case between approval and read-back. That jsdom script is not committed. No real browser, layout, mobile or accessibility check was run.
- **Not done (next, before rehearsal):** Host/origin allowlist for the real environment (the Origin check compares to `http://`+Host, which an HTTPS forwarder would likely fail), framing headers, incompatible-`demo.sqlite` handling, and labeling reset as development-only. The case-ID narration mismatch was corrected in the presentation preparation update: use seeded APX-001 or the actual ID returned by intake. Authentication, the cited investigation brief, ChatGPT and Realtime remain pending.

## Latest locked target — documentation update

Theo locked three potential OpenAI experiences: Realtime voice support OR an OpenAI API-powered conversational text agent in the banking web/iPhone app, followed by analyst investigation in actual ChatGPT. Discovery selects the intake branch; both prepare structured intake for customer confirmation and submit to the same case service. A plain form alone is no longer the target in-app experience. This update changed documentation only and ran no application checks. Existing implementation and historical verification below remain as recorded. Read demo-flow.md, discovery-and-outcomes.md, and the accepted adversarial review response before continuing.

## Customer presentation environment

Theo will present the Apex iPhone app in the browser as an iPhone-style simulator. Build and rehearse the browser phone experience; no native iOS application, Apple simulator, or App Store packaging is required. Test readable conversation, text entry, and browser audio/microphone permissions when voice is connected. This is a presentation decision, not additional executed verification.

## Latest local implementation

The preview now starts at an iPhone-style banking app (`/` or `/banking`). Select the VeloCraft charge → Dispute this charge → choose Talk to support or Report in the app. Voice is explicitly not connected. The form saves a browser-local draft and does not create a case. The existing analyst investigation remains at `/ops`, using the preseeded APX-001 case. Shared case submission, analyst queue, actual ChatGPT and Realtime integration remain pending.

Read the customer-entry update in decisions-and-artifacts.md and current demo-flow.md before continuing. The earlier cloud verification below applies to the original analyst workflow, not these new screens.

Local verification for this increment: all six existing workflow tests pass. A headless Chromium walkthrough exercised account → transaction → reporting choices, checked that the voice connection stays disabled, saved and reloaded an in-app draft, and loaded `/ops` without JavaScript page errors. This is an executed browser walkthrough, not a committed automated browser suite or a model evaluation. Theo's visual acceptance is still pending.

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


