# Current Build Handoff

Read [current-state.md](current-state.md) before changing anything. The streamlined text/ChatGPT/credit/customer journey is implemented and user-observed, not pending a rebuild. Phone intake is now implemented/configured, with physical call rehearsal pending. Last executed checks: 138 deterministic tests plus isolated browser/SDK text and voice flows and a live Realtime configuration handshake.

## Preserve

- Completed APX-B355D834 and APX-3625B0CC and their original credits/approved summaries. Do not execute financial actions or simulate new responses on them for a deployment check.
- Seven bounded MCP tools and credit-only Apex business approval. Do not restore the old three-approval journey or extra time-jump confirmation.
- Working temporary tunnel, private service split and local credentials/state. The old tunnel was invalidated upstream and replaced during phone deployment. Theo authorized the shared number's temporary Apex routing; preserve its private M. Price backup and restore command. No automatic ChatGPT prefill/app-selection claim.
- The bank-generated verified completion message and immutable approved financial/audit payloads.

## Resume

1. Inspect the working tree and current services. Read the relevant workflow/security files, not just historical progress paragraphs.
2. Follow Theo's next request. Physical phone rehearsal, synthetic document artifacts and representative model evals remain unfinished; do not call them complete from automated checks. Read phone-setup.md before phone/routing changes.
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
