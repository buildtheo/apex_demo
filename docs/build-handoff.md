# Current Build Handoff

Read [current-state.md](current-state.md) before changing anything. The streamlined text/ChatGPT/credit/customer journey is implemented and user-observed, not pending a rebuild. Phone intake is implemented/configured. Theo's first call hit the existing-dispute guard; early detection and abrupt rejection handling are fixed. On October 22 he chose M. Price-style caller matching plus a four-digit demo support code. Signed keypad-only IVR now gates Realtime and backend intake, followed by the quick amount -> merchant -> reason -> readback flow. Successful physical submission remains pending. Last executed checks: 146 deterministic tests plus isolated browser/SDK text and voice flows and an earlier live Realtime configuration handshake.

## Preserve

- Completed APX-B355D834 and APX-3625B0CC and their original credits/approved summaries. Do not execute financial actions or simulate new responses on them for a deployment check.
- Seven bounded MCP tools and credit-only Apex business approval. Do not restore the old three-approval journey or extra time-jump confirmation.
- Working temporary tunnel, private service split and local credentials/state. The old tunnel was invalidated upstream and replaced during phone deployment. Theo authorized the shared number's temporary Apex routing; preserve its private M. Price backup and restore command. No automatic ChatGPT prefill/app-selection claim.
- The bank-generated verified completion message and immutable approved financial/audit payloads.

## Resume

1. Inspect the working tree and current services. Read the relevant workflow/security files, not just historical progress paragraphs.
2. Follow Theo's next request. The immediate pending check is a successful phone submission: Theo explicitly uses Restart demo on the queue, selects the purchase and Talk to support, calls, enters his existing synthetic support code on the keypad, then states the amount/reason and confirms readback with keypad 1. These are separate code and consent steps. Verify the same saved case in the bank and queue and that follow-up conversation remains open. Do not reset for him, reuse the credited run, invent a recovered report or change a working MCP/tunnel. Read phone-setup.md. Synthetic document artifacts and representative model evals remain separate unfinished work.
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
