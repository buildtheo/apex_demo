# Current Build Handoff

Read [current-state.md](current-state.md) before changing anything. The streamlined text/ChatGPT/credit/customer journey is implemented and user-observed, not pending a rebuild. Last executed checks: 129 deterministic tests plus isolated browser/SDK flow. This lock is documentation-only.

## Preserve

- Completed APX-B355D834 and APX-3625B0CC and their original credits/approved summaries. Do not execute financial actions or simulate new responses on them for a deployment check.
- Seven bounded MCP tools and credit-only Apex business approval. Do not restore the old three-approval journey or extra time-jump confirmation.
- Existing temporary tunnel, private service split, local credentials/state and M. Price routing. No automatic ChatGPT prefill/app-selection claim.
- The bank-generated verified completion message and immutable approved financial/audit payloads.

## Resume

1. Inspect the working tree and current services. Read the relevant workflow/security files, not just historical progress paragraphs.
2. Follow Theo's next request. Voice connection, synthetic document artifacts and representative model evals remain unfinished; do not call them complete from the successful text walkthrough.
3. Use isolated tests or a deliberate new practice run. Preserve proof and report exactly what was checked; never silently reset the user's database.
4. Update current-state.md in place plus the decision/progress history for meaningful changes. Do not stack contradictory "latest" notes in AGENTS.md or START-HERE.md.

Tests, when needed:

```sh
python3 -m unittest discover -s tests -q
npm run test:adapter
APEX_PLAYWRIGHT_MODULE=/home/theosbeer/hero-sentinel/node_modules/playwright/index.mjs node tests/browser_intake.mjs
```

The last command uses the installed local Playwright path. The browser check uses an isolated temporary database and mock model by default. Live provider mode is opt-in and must remain separately labeled. Do not treat deterministic instruction checks as model compliance or user-reported results as independently inspected full traces.

Previous stacked entry points are preserved under [history](history/); detailed chronological checks remain in build-progress.md. Current proof/boundaries are in the snapshot, not the archived notes.
