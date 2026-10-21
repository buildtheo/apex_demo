# MCP Adapter Setup

## October 21 tool-list update

With staging enabled, the runtime now exposes five tools: get_case, get_evidence, stage_evidence_request, stage_processor_followup and get_action_result. Both stage tools are WRITEs that persist drafts only. Refresh the installed ChatGPT connection to discover stage_processor_followup. No MCP tool approves or executes. See [processor-followup.md](processor-followup.md). Existing read-only deployments still expose only two tools. Earlier four-tool counts below describe the previous increment; credit is not implemented.

Streamable HTTP MCP at `/mcp` supports reads plus optional draft staging (a write, not execution). Actual ChatGPT case/evidence reasoning is user-observed; the new staging confirmation still needs account-side proof. This is not deployed OAuth or the completed credit workflow. See [request actions](request-actions.md) and [build progress](build-progress.md).

## Current demo choice: simulated identity, not OAuth

Theo approved this simplification on October 20. Ignored local `.env` selects `APEX_AUTH_MODE=demo`, the adapter-only tunnel origin and now `APEX_ENABLE_STAGING=1`. `npm run mcp` starts without an IdP. The fixed simulated actor reads explicit saved assignments; eligible customer-created cases may have a bounded draft staged, but no public tool can approve or execute it. Returned data is labeled simulated_not_oauth. Source release, snapshot, minimization and case restrictions remain. There is no OAuth metadata/challenge in demo mode.

Connection progress: personal Plus plugin creation and actual ChatGPT source reasoning on both APX-001 and the new customer-created case are user-observed. The temporary Cloudflare URL is in ignored .local/runtime.json. Public SDK reads and negative checks pass; four tools are listed, staging marked write. Refresh the installed connection's tool definitions to pick up the new tools. Actual ChatGPT staging/confirmation remains pending. Do not substitute the loopback address in the Server URL field.

The demo uses the supported **No authentication** option, not OAuth with pretend credentials. Anyone who can reach it can read the allowed synthetic cases and stage eligible synthetic drafts; the role name Barbara provides no actual identity guarantee. Keep real data out, never expose 8080/8788 or the private approval routes, and never call this production authentication or a real two-user authorization demonstration. OpenAI documents the connection options [here](https://developers.openai.com/api/docs/guides/custom-mcp-server).

Local .env references M. Price credentials with APEX_OPENAI_ENV_FILE; the helper reads only backend API credentials, not Twilio settings or old model choices. The private Responses worker is live-tested as described in intake-setup.md. No key has been printed or committed.

The OAuth configuration below describes the retained real-auth path, not a prerequisite for this synthetic demo. Default auth mode is still OAuth if no explicit mode is set.

## Local components

| Component | Address | Status |
| --- | --- | --- |
| Python/SQLite DMS stand-in | 127.0.0.1:8080 | Existing local prototype, including unauthenticated action endpoint; must remain private |
| Node MCP adapter | 127.0.0.1:8787/mcp | New authenticated read code; requires external identity configuration before startup |
| Actual ChatGPT | Presentation account | Account/connection permissions and live trace not yet verified |

Requires Node 22+ for the adapter, alongside the existing Python 3.10+ service. Install pinned dependencies with `npm ci`. Run checks with `npm run test:adapter` and `python3 -m unittest discover -s tests -q`.

## Configuration

Configure the ignored local `.env` using the variable names in `.env.example`. Never commit credentials, access tokens or real case information.

- `APEX_MCP_ORIGIN`: HTTPS origin of the eventual adapter-only tunnel (no path or trailing endpoint). The MCP URL is that origin plus `/mcp`.
- `APEX_OAUTH_ISSUER`: exact existing external issuer, including its trailing slash if applicable.
- `APEX_OAUTH_AUDIENCE`: resource audience issued for this Apex integration; must not accept a token intended for a different application.
- `APEX_OAUTH_JWKS_URL`: trusted issuer HTTPS JWKS URL, not a URL supplied by a tool caller.
- `APEX_ACCESS_FILE`: local bank-owned subject-to-role/case assignments, for example `.local/access.json` (ignored). Values use actual validated issuer subject identifiers, not display names or email supplied by the model.

Illustrative ACL shape only; replace the subject placeholder with the provider's actual analyst subject. An authenticated denied-access test user must have no APX-001 entitlement:

```json
{
  "actual-provider-analyst-subject": {
    "role": "analyst",
    "cases": ["APX-001"]
  }
}
```

The provider must issue signed RS256 or ES256 access tokens containing `sub`, `iat`, `exp`, the configured issuer/audience, and the `apex:read` scope. Configure per-user OAuth consent/client registration using that provider's supported ChatGPT integration path. No custom authorization server, service-account identity substitution or unsigned token shortcut is included. ACL changes currently require restarting the adapter; token expiry/validity and case access are checked on each request.

Start Python with `python3 server.py` and the separately configured adapter with `npm run mcp`. The adapter reads the fixed loopback `/api/case` endpoint; it cannot forward arbitrary URLs or call `/api/action`. It supports the current single seeded case, not future intake continuity. Do not reset an existing database without Theo's intent.

Only tunnel port 8787 after configuration and negative checks. Never tunnel 8080 or mount its unauthenticated action service behind the public adapter. Set the origin to the actual tunnel hostname and retain Host/Origin validation. Resource metadata is available at `/.well-known/oauth-protected-resource` and `/.well-known/oauth-protected-resource/mcp`; protected requests without valid authentication return a 401 OAuth challenge.

## Actual connection acceptance

1. On the intended ChatGPT account, connect the HTTPS `/mcp` URL through its supported custom-app connection flow and complete per-user OAuth.
2. As the assigned analyst, request APX-001, inspect the tool trace, then fetch released E-001/E-002/E-003 at the returned `evidence_version`. Confirm source/case/version fields match. A sourced table is the current presentation fallback, not native source-link or Intelligent UI proof.
3. Request unreleased E-004 and an incorrect snapshot: expect `source_unavailable` and `stale_snapshot`, without the hidden body.
4. Use a different real authenticated test user without case assignment: expect `access_denied` before case/evidence release. A prompt saying "I am another user" is not this test.
5. Record observed account, issuer configuration (no credentials), tool traces and outcomes. Only then describe the ChatGPT connection and external-user proof as live.

Local tests generate their own signing keys and use the real SDK HTTP client. They prove adapter behavior under those fixtures, not deployment, actual OpenAI receipt, prompt-injection resistance or production DLP. Evidence is untrusted; read-only annotations describe these two tools but never grant bank execution authority.

Official references: [MCP server](https://developers.openai.com/plugins/build/mcp-server), [authentication](https://developers.openai.com/plugins/build/auth), [connecting ChatGPT](https://developers.openai.com/plugins/deploy/connect-chatgpt). Account availability must still be checked on Theo's presentation account.
