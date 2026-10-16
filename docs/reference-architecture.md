# Reference architecture, data flow, and connection proof

Prepared October 15, 2026. Target design; consult handoff.md for implemented behavior. The two selected OpenAI product surfaces are **Platform/APIs** for customer intake and **ChatGPT** for analyst investigation. Realtime voice and conversational text are alternative experiences within the first surface. Codex is a development aid, not a counted live surface.

## Intelligent UI feasibility check — Gate 0

Required planning step before further feature building; requested by Theo. It is a test of whether to use an optional evidence-comparison presentation in the existing analyst scene. It does not change the case contract or execution controls.

Official announcement checked October 15, 2026: native Intelligent UI is a Chat-tab feature, with Enterprise availability subject to admin settings. The announcement does not establish compatibility with Apex MCP tools or an embeddable API feature. A custom MCP component or browser widget must not be labeled native Intelligent UI.

| Check | Action / evidence to record | Current status |
| --- | --- | --- |
| Presentation-account availability | Identify actual account/workspace, Chat mode/model and browser; confirm native rendering is available. Do not assume Work/Codex behaves the same. | Not run |
| Useful evidence comparison | With a clearly labeled synthetic available-evidence snapshot, compare assertion/source/uncertainty, expand a source, and inspect legibility. Preserve source IDs/version and exclude unreleased findings. | Not run; snapshot rendering alone would not prove tools |
| Combined case retrieval and presentation | Once the minimal adapter is available, invoke get_case/get_evidence in the same Chat experience, render the comparison, verify references and changes after additional evidence. Record the actual tool trace and rendering. | Adapter/linking unbuilt; unproven |
| Failure and timing | Check stale or mismatched evidence, unavailable UI, refresh, and failed source links; retain a plain sourced table. Fit the comparison into the existing scene, proposed maximum 60 seconds. | Not run |

Proposed timebox: one 20-minute readiness session, not a requirement to solve every UI issue. Record one outcome before further feature building: USE AFTER PROOF (native rendering useful, with combined tool proof still explicitly pending if no adapter), DEFER (use sourced table), or UNAVAILABLE (use sourced table). Do not mark an untested combination as working. An availability/rendering decision permits only the minimal read-adapter proof next; repeat the combined check before investing in custom UI. If tool compatibility fails, keep the table and continue the core demo. This gate must not force a new Chat mode or weaker access control merely to obtain visuals.

## Named API and integration baseline

| Responsibility | Selected API / interface | Required behavior |
| --- | --- | --- |
| Conversational text intake | OpenAI Responses API, function calling and Structured Outputs where appropriate | Server validates output; preserve attribution; customer confirms before shared case submission |
| Browser voice alternative | OpenAI Realtime API over WebRTC | Backend-controlled session setup; no persistent API secret in browser; same confirmation/case contract; phone transport is separate and not assumed |
| Analyst investigation | Actual ChatGPT + custom MCP plugin, Streamable HTTP | get_case/get_evidence are truly read-only; validated identity/case access and source snapshots |
| Stage request / brief | Proposed MCP stage tools | Saving a draft is a write and may need ChatGPT confirmation; it cannot authorize Apex execution |
| Human-approved execution | Apex's own HTTP service and executor | Existing prototype is local-only; real actor authorization remains pending; verify exact persisted effects |
| Native Intelligent UI | ChatGPT presentation capability, conditional on Gate 0 | Evidence presentation only; no claim it is available as an API for the simulated iPhone app |

Model IDs/snapshots are not interchangeable with API selection. Before model evaluation, choose candidates supported by the actual account and required tools/schema, record exact IDs/versions and inference settings, then pin the evaluated configuration. The actual ChatGPT model/mode must also work with the tool connection and any native UI. None of these account-level combinations has yet been verified.

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

### Tool confirmation versus business approval

Official custom-MCP guidance says write tools require confirmation by default and honors readOnlyHint for reads. Mark get_case/get_evidence read-only only because they do not mutate state. Draft-persisting stage tools remain writes. In the full two-action demo there may be two ChatGPT staging confirmations plus two Apex approvals; rehearse the actual count and timing, rather than assuming one approval prompt per action. Account setup/OAuth consent is a separate preparation step.

Narration: "ChatGPT is asking permission to call the staging tool. Apex's approval is the bank-authorized decision to execute this exact action." Do not suppress necessary prompts by mislabeling tools or treat a remembered tool permission as business authority. Installation/confirmation behavior must be rehearsed on the presentation account.

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

- [Intelligent UI announcement](https://openai.com/index/gpt-6-for-everyone/)
- [Responses text generation](https://developers.openai.com/api/docs/guides/text)
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Realtime WebRTC](https://developers.openai.com/api/docs/guides/voice-webrtc)
- [ChatGPT custom MCP connection](https://developers.openai.com/api/docs/guides/custom-mcp-server)
- [MCP authentication](https://developers.openai.com/plugins/build/auth)
- [CFPB 1026.13](https://www.consumerfinance.gov/rules-policy/regulations/1026/13/)
- [CFPB 1026.12](https://www.consumerfinance.gov/rules-policy/regulations/1026/12/)
- [Federal Reserve SR 26-2](https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm): identifies replacement of SR 11-7; assess applicability rather than claiming all generative systems fall within it.

Recheck source/configuration details before final rehearsal. Full interview uploads, tokens, traces containing customer data, and proprietary material do not belong in this public repo.
