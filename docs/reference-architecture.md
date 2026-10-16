# Reference architecture, data flow, and connection proof

Prepared October 15, 2026. Target design; consult handoff.md for implemented behavior. The two selected OpenAI product surfaces are **Platform/APIs** for customer intake and **ChatGPT** for analyst investigation. Realtime voice and conversational text are alternative experiences within the first surface. Codex is a development aid, not a counted live surface.

## Target reference architecture

```mermaid
flowchart TD
    P["Customer: browser iPhone app"] --> I["Apex intake backend"]
    I <-->|"Scoped text or voice context"| O["OpenAI Platform / APIs"]
    I -->|"Customer-confirmed report"| C["Apex case and evidence service"]
    C --> Q["Apex DMS queue and approval UI"]
    G["Analyst: actual ChatGPT"] <-->|"Authenticated tools"| M["Apex MCP adapter"]
    M <-->|"Case-scoped reads and staged drafts"| C
    Q -->|"Human approves exact payload"| X["Apex authorization and executor"]
    X -->|"Persist request or handoff"| C
    C -->|"Separate saved-effect read"| Q
```

The same Apex case ID spans intake, queue, investigation, and execution. ChatGPT does not create a second case store. The MCP adapter enforces authenticated case access; the model cannot grant its own approval. Existing deadlines and durable operational records belong to Apex. Prototype saved-effect checks read the same SQLite store and are not confirmation from an external bank or second system.

## Data and trust boundaries

| Stage | Data crossing the boundary | Authority and control |
| --- | --- | --- |
| Selected charge -> intake | Case context, amount, merchant, transaction reference; tokenized customer identity | Bank session supplies context; no PAN, CVV, passwords, or unrelated accounts in the model payload |
| Intake backend -> Platform | Only needed conversation and approved transaction fields | Server credentials; disclose assistant use; preserve customer corrections; voice consent/retention policy must be approved |
| Customer confirmation -> case service | Attributed statement and confirmed structured report | Server validates session/transaction ownership and prevents duplicate submission |
| Case -> analyst tools | Authorized source excerpts, IDs, availability, snapshot/version | Case-level permissions; unavailable evidence bodies stay excluded; merchant documents are untrusted content, not tool instructions |
| Model -> staged action | Proposed request or cited investigation brief, exact destination and snapshot | Allowlisted schema; stage-only tools; deterministic identifiers and associations checked in code |
| Human -> executor | Exact reviewed payload with actor, expiry, and snapshot | Fresh authorization, stale-draft rejection, idempotency; no credit or network filing in present scope |
| Executor -> read-back | Saved request ID/scope or assignment/exact handoff | Verify persisted facts; distinguish failure, ambiguity, and later progression; do not infer success from status alone |

Minimal proposed tools: get_case(case_id), get_evidence(case_id, source_id, snapshot), stage_evidence_request(case_id, snapshot, scope), stage_handoff(case_id, snapshot, brief), and get_action_result(case_id, action_id). Names/contracts are proposed, not implemented MCP tools. Execution approval remains an Apex human operation; it is not exposed as a model approval tool.

## Current versus target

| Component | Current repo | Remaining proof |
| --- | --- | --- |
| iPhone appearance | Browser banking shell and local draft form | Conversational intake and shared case creation |
| Case/evidence | One seeded APX-001 case; SQLite transitions | Submitted-report continuity, queue, real identity/ACLs |
| Assessment | Explicit fixed server-side text, release-gated | Actual model synthesis with sources and snapshots |
| Execution | Local operator approval and persisted-effect checks | Authenticated authority, full cited brief, failure reconciliation |
| OpenAI connections | Neither surface connected | Platform intake and actual ChatGPT tool invocation |

## Smallest actual ChatGPT connection proof

Documentation checked October 15, 2026. Current official instructions connect a custom MCP server as a plugin through ChatGPT on the web; workspace restrictions apply. Streaming HTTP and SSE are supported. A connection can use a server URL or supported Secure MCP Tunnel. Current tool-call details expose inputs and outputs. This is verified product guidance, not evidence this account or Apex connection works. See sources below.

1. Check that the intended presentation account/workspace can add and install a custom MCP plugin. Record the actual setup used; do not assume an old developer-mode menu.
2. Build a separate MCP adapter around the existing case service using an official SDK and Streamable HTTP. REST /api/case is not itself MCP. Start with get_case and get_evidence only.
3. Use an established identity provider and OAuth 2.1 metadata/PKCE for the authenticated target. Enforce token validation and case ACLs on each read. Do not build a new identity provider for this demo.
4. Make the adapter reachable through the supported secure tunnel or an authenticated HTTPS deployment. Do not expose the unauthenticated local /api/action server through a public tunnel. Host/origin hardening must match the chosen environment.
5. Install/link in actual ChatGPT and explicitly invoke Apex get_case for APX-001, followed by an available source. Capture the tool input/output and generated answer with source IDs.
6. Run a denied-case attempt using a separate restricted test identity or fixture, plus a withheld-source request. Confirm the server denies access and does not release the body. Then add stage-only tools in a later increment.

Pass evidence: real ChatGPT tool trace, expected case/source content, source-based answer, and denial/release checks. MCP Inspector alone, an API-backed custom chat, a screenshot of a connected icon, or a mocked transcript does not prove this milestone. As of this preparation update, only the documentation path is verified. Adapter, identity configuration, account linking, and live invocation remain unexecuted. If unavailable, use a labeled simulation for the meeting and explain the remaining dependency.

## Regulatory and data context

These are scoped design implications, not an automated legal decision engine. Bank counsel/compliance must validate applicability, disclosures, retention, and notice handling before live customer use.

| Primary reference | Verified context and design implication |
| --- | --- |
| CFPB Regulation Z 1026.13(b), (c), (f) | Qualifying billing-error notices have form/timing conditions. Electronic notice can meet the written requirement through the creditor's disclosed accepted means. Acknowledgment is generally due in 30 days unless resolved; resolution in two complete billing cycles, no later than 90 days. A no-error result requires reasonable investigation, explanation, and documentary evidence on request. Apex tracks triggers/deadlines; pending evidence does not pause them. |
| CFPB Regulation Z 1026.12(b)(3) and commentary | Possible unauthorized-use notification may be given by telephone; protections are independent of 1026.13's written-notice/time requirements. Capture a call promptly and preserve notice provenance; never imply a customer has no protection until completing the app form. |
| Bank data/security review | Minimize identifiers, approve vendor terms and actual retention configuration, encrypt transport/storage, segregate environments, restrict access and redact logs. These are proposed controls; this repo proves no production privacy certification. |

Consumer liability, network remedies, and Apex synthetic referral policy remain separate. No Reg E 10-day provisional-credit rule is imported into this credit-card scenario. CE 3.0 eligibility is not needed for this demo. Model-risk/vendor-risk owners determine applicable governance; do not cite old SR 11-7 as current without checking its successor and scope.

## Primary sources

- [ChatGPT custom MCP connection](https://developers.openai.com/api/docs/guides/custom-mcp-server)
- [MCP authentication](https://developers.openai.com/plugins/build/auth)
- [CFPB 1026.13](https://www.consumerfinance.gov/rules-policy/regulations/1026/13/)
- [CFPB 1026.12](https://www.consumerfinance.gov/rules-policy/regulations/1026/12/)
- [Federal Reserve SR 26-2](https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm): identifies replacement of SR 11-7; assess applicability rather than claiming all generative systems fall within it.

Recheck source/configuration details before final rehearsal. Full interview uploads, tokens, traces containing customer data, and proprietary material do not belong in this public repo.
