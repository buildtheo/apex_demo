# Build progress — October 20, 2026

## First scoped approval cycle implemented - October 20

Theo supplied the actual ChatGPT response reading E-001/E-002 for APX-3625B0CC at snapshot 1. It cites the confirmed denial and transaction, keeps authorization unresolved, reports no E-003/E-004 use and labels simulated identity. This closes user-observed new-case intake-to-ChatGPT evidence continuity; raw tool trace was not independently inspected.

Implemented optional MCP stage_evidence_request (write) and get_action_result (read), separate private exact-payload human approval and deterministic released association comparison. Drafts cannot execute themselves; immutable archive/hash, evidence snapshot, explicit demo assignment, canonical scope/references, expiry and saved operational facts are rechecked. No generic execution/approval MCP tool. Local runtime enables the new tools; callers can stage only eligible synthetic drafts, not execute them. See [request-actions.md](request-actions.md) for the flow, controls and limits.

53 Python plus 29 Node tests pass (82 total). Extended isolated browser/SDK check passed MCP staging -> local human review button -> separate saved-request read -> duplicate approval -> explicit later E-004 response -> deterministic mismatch. No new model call or user-case mutation occurred in this increment. Public four-tool listing and premature-stage denial were checked; private stage/review/result HTTP paths returned 404 on the tunnel. APX-3625B0CC remains INTAKE_RECEIVED/v1; Theo must explicitly advance its later-packet step before staging. Actual ChatGPT write-tool invocation/confirmation and human approval on that case are not yet user-observed. Processor follow-up and verified synthetic credit remain pending.

## User submission observed and saved-case read verified - October 20

Theo reported testing and submitting through the banking app. The saved queue contains APX-3625B0CC, JCPenney, INTAKE_RECEIVED, version 1, assigned to simulated Barbara. A public SDK read of that exact case and its E-001 succeeded; available sources are E-001/E-002. A get_evidence request for E-003 returned source_unavailable, as expected before the later packet step. No raw customer statement was printed, no state was modified by verification and APX-001 remains unchanged. Actual ChatGPT retrieval of this new case is the remaining account-side continuity proof; the older APX-001 ChatGPT read/reason proof already exists. No approval, processor response or credit has been executed for this submitted case.

## Confirmed intake and case continuity implemented - October 20

Implemented the Responses text intake worker, persistent session/review confirmation, shared case creation and queue, explicit later-processor-packet release, case-scoped private analyst scaffold and current assignment-based MCP reads. New Martha/JCPenney cases are separate from the unchanged saved APX-001. No customer case is created before a valid current-revision confirmation. Duplicate confirmation returns the same saved ID; another session cannot create a second dispute for the same synthetic customer/transaction. Non-hero reasons route to manual review instead of the authentication fixture. See [intake setup and exact boundaries](intake-setup.md).

Verification: 41 Python tests and 25 Node adapter/config/provider tests pass (66 deterministic tests). Deterministic browser check passed, including a correction, confirmation/read-back, queue/later packet, correctly scoped analyst draft and same returned ID/source through the official MCP SDK. A separate live-browser run made two actual Responses calls using the reused M. Price key, returned model gpt-5.4-mini-2026-03-17, captured a correction and verified case/queue/MCP continuity. Both browser runs used disposable isolated databases; they did not add smoke-test cases to the user's demo database. The final fixed-height iPhone layout was visually inspected and rechecked with the deterministic browser runner.

Known sensitive-string tests assert provider fetch is not called for blocked input; missing/wrong session, stale confirmation, malformed/refused/failed model output, duplicate/conflicting turns and unavailable evidence are covered. This is heuristic text screening and synthetic session authority, not production DLP or real OAuth. Voice remains unbuilt. No claim of model-evaluation quality or measured business savings follows from one live happy-path check.

Started the private apex-intake worker on loopback 8788 and reloaded Python/MCP services. The public endpoint remains two read tools only. Public /respond, /api/intake/start, /api/cases and /api/demo-assignments returned 404. Actual ChatGPT retrieval/comparison of APX-001 is already user-observed; capture a new customer-created case in the actual ChatGPT session next. MCP staging/approval, processor follow-up and synthetic credit/customer-resolution milestones remain pending. Earlier unbuilt/pending intake statements below are historical.

## Actual ChatGPT evidence comparison - user-observed October 20

Theo pasted the follow-up ChatGPT response to the get_evidence request for E-001/E-002/E-003 at snapshot 1. It compared their contents with source IDs, distinguished the customer denial and device assertion from ledger facts, identified the missing AUTH-77/T-204 association, and left authorization unresolved. It explicitly stated E-004 was neither accessed nor used. The helmet reference and merchant-packet label match the preserved older fixture, not the updated Martha/JCPenney story. This is user-observed sourced reasoning in actual ChatGPT; Codex has not inspected raw tool arguments/results or independently verified the claimed absence of an E-004 call in that conversation. SDK source-release denial was separately tested.

The connection/read-and-reason demonstration is now user-observed. This is one favorable synthetic example, not a model-evaluation pass, proof of deployed identity, or execution proof. Native rendering is still deferred. No additional account setup question is needed at this point. Continue the ordered implementation with shared confirmed intake/case continuity, then scoped human-approved internal lookup, processor follow-up and verified synthetic credit. The immediate investigation request should be the narrow AUTH-77 association lookup; the model's broader evidence suggestions are not approved requests. The endpoint still exposes only the two read tools, not staging or approval.

## Actual ChatGPT case read - user-observed October 20

Theo connected Apex Dispute Operations on personal ChatGPT Plus and pasted the result of requesting APX-001 with the Apex tools. The response reported evidence version 1, available E-001/E-002/E-003 and unavailable E-004, with a synthetic-case disclosure and no conclusion from the hidden source. This is user-observed actual-ChatGPT case-metadata retrieval, not just local SDK proof. Codex has not independently inspected that conversation's raw tool trace; an evidence-body retrieval/comparison in ChatGPT remains the next check. The response's E-003 title, Merchant supporting packet, is from the preserved older SQLite fixture.

Do not mark full investigation, authenticated identity, native rendering, API intake, approvals or credit execution complete. Identity remains simulated and the read connection is unauthenticated. The user-observed ChatGPT call does not validate the reused M. Price API key for the separate intake path. Earlier pending-connection statements below record prior increments.

## Connection endpoint prepared - October 20

Theo's screenshots confirm that the personal Plus account shows Add custom MCP server and its creation form. Creation UI availability is now observed; plugin creation, installation and actual ChatGPT invocation are still pending.

Started user-managed transient services `apex-dms`, `apex-mcp` and `apex-mcp-tunnel`. Python stays on loopback 8080. The development Cloudflare tunnel forwards only to the read adapter on loopback 8787, with a fixed upstream Host; the ignored local origin configuration matches the public hostname. Runtime URL/unit details are in ignored `.local/runtime.json`, not committed. Anyone who can reach this no-auth endpoint can read the allowed synthetic case: the simulated Barbara role is not real authentication.

Executed an official-SDK client against the public HTTPS endpoint: initialization, two-tool listing and APX-001 retrieval succeeded; E-004 remained denied. Public `/api/case`, `/api/action`, `/.env` and `/adapter/server.mjs` returned 404. This is genuine remote transport/read-tool proof, not an actual ChatGPT/model trace or a security audit. No OpenAI API request or financial action was made.

The saved SQLite case still contains the older VeloCraft synthetic merchant at version 1. It was deliberately preserved, not reset; connection preflight uses the case ID. Reloading/migrating the current Martha/JCPenney fixture remains separate from successful connectivity.

The quick-tunnel address can change if its service is restarted/recreated; machine sleep/network loss can interrupt it. Services run outside the command session and restart on failure, but are transient, not boot-persistent deployment. Stop with `systemctl --user stop apex-mcp-tunnel apex-mcp apex-dms` when finished. Earlier "no public tunnel" statements below describe the previous increment.

## Latest setup decision and executed follow-up

Presentation account confirmed by Theo: **personal ChatGPT Plus**, not a work workspace. No email address is needed. Custom-MCP creation/connection permissions on that specific account and an actual Apex tool call remain unverified; do not equate plan selection with proven entitlement or advise an upgrade without checking. Current official connection instructions describe ChatGPT web -> Plugins -> plus -> Add custom MCP server; ask for a screenshot if the option is missing. Demo connection remains No authentication with explicitly simulated identity. This account confirmation changes no runtime code or test results.

Theo approved simulated authentication for the demo and reuse of M. Price API credentials. Added explicit `APEX_AUTH_MODE=demo`: fixed `demo:barbara` role, no OAuth challenge/discovery, no validated user identity, and `simulated_not_oauth` on health and successful tool results. Case assignment, source-release/snapshot checks and minimized screening still apply. Unknown auth modes fail closed; OAuth remains the default when no explicit mode is configured. The demo mode is not an unauthorized-user authentication proof and is for synthetic records only. No public tunnel has been opened.

Configured the ignored local `.env` to reference the existing M. Price env file via `APEX_OPENAI_ENV_FILE`. The server-side credential helper imports only key/project/organization fields, not Twilio settings or old model choices. Confirmed a nonempty key loads without printing/copying it; validity, balance and provider requests have NOT been tested. The helper is preparation for API intake, not an implemented model conversation.

Reran checks: 19 adapter/config tests and all 26 existing tests passed (45 total). New tests cover demo labeling, preserved resource/release/version restrictions, fail-closed mode selection and credential allowlisting/errors. A short startup/health smoke check also passed against the local demo configuration; the check stopped its temporary adapter process afterward. Actual ChatGPT connection still awaits account setup. A ChatGPT email address is not needed to identify whether the account/workspace permits a custom connection. External identity deployment is deferred rather than a current demo blocker; the sections below record the earlier OAuth increment.

## Baseline

Reviewed source and current instructions at c07ec33. Ran the existing Python/Node suite locally: all 26 tests passed. These are deterministic workflow, HTTP, verifier and race checks; no model evaluation or live provider invocation was performed.

Current target supersedes specialist referral: Martha / JCPenney / $648.50, internal lookup, transaction-specific processor follow-up, human-reviewed supported synthetic credit strictly below $1,000, verified ledger/case effects, then customer resolution. Three approvals remain separate from model staging permissions. Slides and practice are out of scope for this build pass.

## Gate 0: DEFER optional UI, use a sourced table

The terminal cannot inspect the intended presentation account or native ChatGPT rendering. No connected presentation browser session has been established. Account availability and combined tool/rendering proof are NOT RUN, not failed. Use the already-approved plain source-ID/snapshot table fallback for this increment; native UI remains deferred until account and tool proof exist. No custom UI framework is being added.

This records the honest fallback decision permitted by reference-architecture.md. It does not establish Intelligent UI availability, working source links or actual ChatGPT connectivity.

## Environment and access dependencies

- Python and Node are available. Python pip is not installed; retain the standard-library Python DMS and use the official JavaScript MCP SDK for the separate adapter.
- Apex has no existing API or OAuth configuration in its checkout or process environment. The previous M. Price project contains a configured API-key variable, but its secret was not printed or copied and reuse has not been assumed.
- Presentation ChatGPT account/connection permissions and external identity provider/test-user configuration require Theo's input. No custom identity provider will be built.
- Keep the local action service private. Only an authenticated, allowlisted read adapter may eventually be exposed, after configuration and negative tests.

## First implementation increment

Implemented two read-only MCP tools over Streamable HTTP: get_case and get_evidence, using the official JavaScript MCP SDK in a separate loopback adapter. Code validates JWT signature/issuer/audience/expiry/read scope, role, explicit case assignment, requested snapshot and source release; constructs minimized screened results. Hidden sources return only ID/unavailable, not their title, provenance or body. The adapter cannot approve or execute actions. Configuration fails closed without an issuer, audience, JWKS endpoint, external origin and a bank-owned subject-to-case ACL map. See [setup and connection proof](adapter-setup.md).

Executed after implementation:

- `npm run test:adapter`: 13 passed. Signed-token validation (including wrong issuer/audience/signature/scope and expired tokens), role/assignment/expiry, field minimization, release/snapshot checks, conservative sensitive-text screening, OAuth resource metadata, HTTP host/origin/body limits and actual SDK initialization/list/call over local HTTP. An authenticated but unassigned locally signed identity is denied before DMS retrieval.
- `python3 -m unittest discover -s tests -q`: all 26 existing tests passed. Kept the existing CommonJS browser-test contract unchanged; new adapter files use explicit .mjs extensions.
- `npm install --package-lock-only`: audit reported zero known vulnerabilities at execution. This is not a security audit.

The text screen rejects card-like digit sequences and labeled PIN/CVV/password values; it is intentionally conservative and not complete DLP or a raw-voice audio filter. These tests inspect local SDK-bound results, not actual payloads received by OpenAI. No external deployment, provider token exchange, model call or new browser proof was performed. Local case state was not reset.

Actual ChatGPT linking, two real external-provider identities, API intake, shared new cases, processor follow-up, authenticated approval and synthetic credit remain separate milestones. Local signed-token tests do not establish an external identity deployment or a live ChatGPT trace.

## Next ordered work

1. Configure the existing external issuer and presentation account; prove allowed and denied users against the read adapter in actual ChatGPT. Keep optional rendering deferred until this is demonstrated.
2. Persist confirmed conversational intake and the queue against one shared returned case ID; wire Responses text intake once an API project is securely configured. Do not relabel the browser-local form as model intake.
3. Add scoped staging/approval and internal lookup, then transaction-specific processor follow-up and explicitly released later evidence.
4. Implement supported human-approved synthetic credit, exact-once posting, separate saved ledger/decision checks and Martha's customer resolution.
5. Prepare the discovery-selected voice alternative live or clearly simulated, and run provider/model/adversarial checks. Do not treat this read adapter as an end-to-end demo.
