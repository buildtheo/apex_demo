# Confirmed text intake and shared cases

Implemented October 20. The banking app runs a Responses API conversation, not a browser-local form. The synthetic hero is Martha / JCPenney / $648.50 / T-204. The first scoped lookup approval cycle is now implemented too; see request-actions.md. This is not credit or a complete dispute decision.

## Run and try

Run these in separate terminals from the repo:

```sh
python3 server.py
npm run intake
npm run mcp
```

The API worker requires the ignored `.env` credential reference already configured for M. Price. It uses `gpt-5.4-mini` unless `APEX_INTAKE_MODEL` is explicitly configured. A live check returned `gpt-5.4-mini-2026-03-17`. Keys are loaded on the server, never shipped in HTML, tools or browser storage. The Responses payload uses structured outputs and `store: false`; this is not a zero-retention or compliance claim.

Open http://127.0.0.1:8080. Select JCPenney -> Dispute this charge -> Report in the app. Describe the issue, send corrections if needed, then review the statement and click Confirm and submit report. Only that button creates a case. The app separately reads the saved case before displaying receipt. Record its returned APX-... reference; do not assume APX-001.

Open http://127.0.0.1:8080/queue. The new case is assigned to simulated Barbara. Initially only E-001 customer-confirmed intake and E-002 transaction evidence are released. For the unauthorized-purchase hero, Attach later packet explicitly simulates a later fictional processor response: E-003 becomes available and the evidence version advances to 2. E-004 remains unavailable. Other dispute reasons enter manual review, not the hero's authentication-evidence sequence.

In the existing actual ChatGPT Apex connection, retrieve the returned case ID, use its returned snapshot, then read available evidence. Demo assignment checks now read explicit saved assignments each call; there is no wildcard portfolio grant. The same ID also scopes the local /ops scaffold. The old fixed assessments and local-operator actions there are not model-authored MCP staging or authenticated Barbara approval.

## State and authority

- Additive SQLite tables `intakes` and `submitted_cases`; the old `state` table/APX-001 remain intact. The existing seed still has its older saved labels until deliberately reset. New cases use the current fixture, including Martha/JCPenney/clothing.
- Original user messages are retained unaltered alongside the customer-confirmed summary, rather than replaced by model paraphrase. A correction invalidates the earlier review nonce; confirmation binds the exact current revision/nonce.
- Random session capability stored in browser sessionStorage, with a hash in SQLite. Missing/wrong capability, an unselected transaction, stale confirmation and altered retry are denied. This is synthetic session scoping, not a verified bank login. Closing/losing the tab can lose the capability; account-level case recovery is not implemented.
- Same confirmation retries return one case; a separate session cannot create a second submitted dispute for the same synthetic customer/transaction. The old seeded case is excluded from that uniqueness check. Resetting the seeded prototype does not delete submitted cases; no destructive demo reset/migration was performed.
- Six user turns and 6,000 aggregate user characters per session. Pending turns serialize for 90 seconds before retry recovery; provider timeout is 35 seconds. Provider errors/refusals/malformed output never create a case or become a success message.

## Private/public split

| Port | Job | Exposure |
| --- | --- | --- |
| 8080 | Browser banking, queue, private DMS, intake state and local actions | Loopback only; never tunnel |
| 8788 | Stateless Responses worker, credentials held server-side | Loopback only; never tunnel |
| 8787 | Reads plus opt-in draft staging/result tools; no approval/execution | Temporary development tunnel; synthetic records only, identity simulated |

Current user services are apex-dms, apex-intake, apex-mcp and apex-mcp-tunnel. They run outside command sessions but are transient and require an awake machine/network. Tunnel URL/runtime details are ignored in `.local/runtime.json`. Public paths /respond, /api/intake/start, /api/cases and /api/demo-assignments returned 404; they do not proxy through the public adapter.

## Verification

```sh
python3 -m unittest discover -s tests -q
npm run test:adapter
```

The optional browser runner uses a temporary isolated database and an installed Playwright package. It checks conversation/correction, no case before confirmation, saved receipt, queue/later packet, scoped analyst staging without touching APX-001, and the same returned ID through real MCP SDK reads. Set `APEX_PLAYWRIGHT_MODULE` to an installed Playwright module path if the package is outside this checkout:

```sh
node tests/browser_intake.mjs
# Opt-in: makes a few synthetic provider requests against the private worker.
APEX_LIVE_INTAKE=1 node tests/browser_intake.mjs
```

Local execution reused the already installed Playwright package from M. Price. Deterministic browser and live Responses checks passed; the live run made two model calls. Actual ChatGPT read/reason on APX-001 was separately user-observed. A newly created case being read in Theo's actual ChatGPT session is still a user-side proof to capture, not established by the SDK check.

Sensitive-text tests inspect the actual constructed provider payload and ensure known PAN-like numbers, labeled secrets and long spelled-number sequences fail before fetch/persistence. This is conservative heuristic screening, not complete DLP, and does not filter raw audio. Voice remains disabled. MCP first-request staging/private human approval is implemented; actual ChatGPT staging confirmation, processor follow-up and supported credit/customer resolution remain pending.

Official API reference: [Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs).
