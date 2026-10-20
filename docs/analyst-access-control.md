# Analyst access control, presentation surface and published precedents

Locked into Apex preparation at Theo's request October 20, 2026. This is the target design and rehearsal guidance, not configured Apex roles, verified presentation-account access or passing authorization tests.

## The two product surfaces

1. OpenAI Platform/APIs powers customer intake inside Apex's banking experience. Discovery selects conversational text (Responses API) or the alternative voice route (Realtime).
2. Actual ChatGPT is the analyst's evidence-investigation workspace, connected to Apex through scoped MCP tools.

Chat and Work are possible experiences within the ChatGPT surface, not two distinct surfaces for the assignment. A Project is an organization/context feature, not another product surface. Codex helps build the demo and is not one of the two selected demonstrated surfaces.

Use actual ChatGPT on the web as the primary presentation candidate, proving the Apex connection on the intended account before rehearsal. Work is not a new requirement; its exact combination with the account, tools and optional UI remains unverified. Account entitlement, authentication and connection proof remain open.

## Legacy DMS connection — locked October 20

Apex's fictional DMS is legacy, has supported integration interfaces and does not provide native MCP. The bank owns the MCP adapter translating focused ChatGPT tool calls into existing DMS/evidence-service operations. Identity, per-case/source/action permission and field minimization are enforced in that integration path; the DMS remains authoritative. Our Python/SQLite/HTTP service stands in for those systems. See [the architecture decision](reference-architecture.md#legacy-dms-integration--locked-october-20). The adapter and authenticated connection remain unbuilt. Public customer precedents need not match this exact fictional design; native MCP also does not imply embedded vendor AI.

## Project choice and copied content

No Project is required for the minimal demo. Start with a private case conversation. A private or restricted case Project may be useful only after verifying tool compatibility, membership and sharing behavior.

Do not place unrelated customer cases in a broadly shared Card Operations Project. Project members can see its chats/files; content retrieved by an authorized person into a shared conversation can become visible to those members. A live source permission check cannot retroactively protect a copied answer. Project memory, sharing, retention and export/access policies must match the intended case audience.

Being a workspace administrator does not automatically grant case permissions in Apex. Separate authorized administration/compliance mechanisms may provide access to content already held in ChatGPT; do not imply that bank-side ACLs prevent all administrative access to those copies.

## Separate the control layers

| Layer | Responsibility |
| --- | --- |
| ChatGPT Enterprise workspace | Approved membership and roles; restrict Apex app availability, supported actions and tool confirmation behavior. Workspace entitlement is not permission to any bank case. |
| Apex authentication | Validate a per-user/delegated OAuth access token, including issuer, audience, signature/validation, expiry and required scopes. Do not trust a username or claimed role from a prompt/tool argument. |
| Apex resource authorization | On every request, check role plus explicit case/team assignment, permitted fields, source release and allowed operation. Knowing a case ID or holding a broad read scope is insufficient. |
| Apex execution authority | A stage tool prepares a request/brief. An authorized person separately approves the exact action; Apex rechecks permission, payload, evidence version and freshness before execution, then verifies the saved effect. |
| Conversation/data governance | Prevent inappropriate sharing of already-retrieved content; configure retention, supported audit access, incident handling and revocation independently of live API permissions. |

Default-deny missing/invalid identity and unauthorized resource/action requests. No broad shared service credential should give every employee the same case access. A service-to-service executor still needs constrained authority and attribution to the validated approving actor.

## Proposed role matrix

These are illustrative bank application roles, not built-in ChatGPT roles or an actual Apex configuration.

| Proposed Apex role | Access |
| --- | --- |
| General employee | No dispute-case access |
| Dispute analyst | Read assigned/explicitly authorized cases and prepare scoped requests/briefs |
| Authorized reviewer | Review and approve only permitted action types on authorized cases; may be an analyst with the necessary entitlement, not an invented mandatory second approver |
| Specialist | Read/review referred or assigned cases within the permitted team scope |
| ChatGPT workspace administrator | Manage workspace/app configuration; no automatic bank case entitlement |

RBAC is only part of the answer. Case assignment and source/action restrictions provide resource-level authorization. Roles must not mean unrestricted access to the entire dispute portfolio.

Spoken explanation:

“Anyone can ask ChatGPT for a case. Only Apex can authorize its release. Workspace access enables the tool; bank-side identity, roles and case permissions determine what it returns.”

## What the analyst would see

Keep the Apex queue/case screen and actual ChatGPT visually distinct. In ChatGPT, request the same case ID using the installed Apex connection. Proposed get_case/get_evidence tools return scoped source excerpts and metadata, followed by a source-referenced comparison. Expand one tool call to inspect case/source IDs and the returned material. Native source links and special interactive UI require separate implementation/proof; a sourced table is the baseline.

Initially, E-001/E-002/E-003 are available; E-004's body remains unavailable until the approved request and explicitly simulated later response. Do not leak the later finding through the initial tool result, prompt or display. Apex remains authoritative, while returned content is processed by ChatGPT; do not claim retrieval means the content never leaves Apex.

## Required authorization proof

Demonstrate an authorized test analyst retrieving APX-001, then a different authenticated, unassigned test identity requesting that same case and being denied before evidence is returned. Identity differences must come from validated credentials, not a model prompt claiming another role.

Also check invalid/expired credentials, a role without case entitlement, unavailable evidence and an unauthorized action. Recheck authorization at execution. Record observed results and limitations. No such authenticated proof exists in the current prototype; local-demo-operator approval is not production RBAC.

## Published OpenAI precedents — checked October 20

| Published example | What it supports | What it does not establish |
| --- | --- | --- |
| [BBVA](https://openai.com/index/bbva/) | ChatGPT Enterprise adoption with security/legal/compliance alignment, governance and employee enablement. | No published proof here of our precise per-case MCP authorization or Projects design. |
| [Morgan Stanley](https://openai.com/index/morgan-stanley/) | Internal knowledge retrieval, expert-scored evaluations, regression testing and advisor review of generated outputs. | This story concerns internal custom tools; do not relabel it as our ChatGPT Project/MCP architecture or inherit its outcomes/retention arrangements. |
| [Itaú](https://openai.com/index/itau-generative-ai/) | An API-based banking conversational experience using text/voice, human-support handoff and bank-owned governance/orchestration. | No evidence that it implements our dispute flow, exact roles or raw-audio PAN boundary. |

These are provider-published customer accounts, not independent audits or reference architectures identical to Apex. Use them as precedents for parts of the approach, without importing their metrics into our business case.

OpenAI's [ChatGPT for Financial Services announcement](https://openai.com/index/introducing-chatgpt-financial-services/) separately describes enterprise identity, role-controlled apps/actions and information barriers. Its initial investment-banking/equity-research focus is not a ready-made card-dispute system and is not an additional required demo surface.

## Official implementation references

- [App access, action and confirmation controls](https://help.openai.com/en/articles/11509118-admin-controls-security-and-compliance-for-plugins-and-apps).
- [MCP authentication and server token validation](https://developers.openai.com/plugins/build/auth).
- [Projects: membership, shared context and app use](https://help.openai.com/en/articles/10169521-projects-in-chatgpt).
- [Custom MCP tool invocation and inspectable call details](https://developers.openai.com/api/docs/guides/custom-mcp-server).
- [Managed account data access](https://help.openai.com/en/articles/20001067).

Current repo code still lacks actual ChatGPT/API/MCP connections and authenticated case-level authorization. This documentation update does not resume building, complete Intelligent UI Gate 0, configure workspace permissions or execute evaluations. See [START-HERE](START-HERE.md) and [sensitive-data-and-voice.md](sensitive-data-and-voice.md).
