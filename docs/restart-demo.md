# Restart Demo

Use **Restart demo** at the top of `/queue` or `/ops`. Confirm once. It opens Martha's banking app at the beginning, with the original synthetic balance and no submitted report. Run customer intake again; the next confirmed report gets a new case reference and appears in the current queue.

No terminal command, database deletion, tunnel reset or credential reconfiguration is required. Use the new case in a fresh ChatGPT conversation for each rehearsal; restarting Apex cannot erase or reset an existing ChatGPT conversation. Real model/API usage still incurs the configured project's charges. This button does not repair a stopped server, sleeping Chromebook or failed tunnel.

## Isolation and Preservation

- Restart creates a persisted random practice-run namespace. Cases, source history and credits from previous runs remain stored, not deleted or overwritten. The original completed proof case remains unchanged and its ledger still verifies.
- The visible queue contains only the current practice run. Previous practice runs lose model assignments and cannot stage, approve or advance actions. The original nonpractice proof remains available by its saved case link.
- Intake capabilities from before the restart are invalidated server-side, including pending model results and stale confirmations. The banking app discards old tab capabilities on load/focus or a rejected old-session action. New read-only previews use the current run capability but do not change the underlying saved case.
- Practice credits use a bank-owned synthetic account namespace per run. Unique account/transaction and case ledger constraints remain intact within each run; no duplicate-post check is disabled. The original proof account remains unchanged. All balances and money movement are synthetic.
- Restart retries use a request identifier. A repeated acknowledged or lost-response request does not create another run. A superseded old retry is rejected. Only the private local demo endpoint accepts restart; it is not an MCP tool or public tunnel route. Local header/origin checks are not production authentication.

## Checks

The deterministic tests exercise 100 restarts, persistence across service reopening, repeated complete credit flows, original-case/ledger preservation, same-run duplicate disputes, stale intake/model/action rejection, idempotent restart and the local HTTP boundary. The isolated mock-model browser/SDK check exercises both buttons, a clean bank view, a fresh submitted case and preservation of the completed case. These are not 100 paid calls, a model evaluation or a production financial test.

## Separate Workflow Change Still Pending

Theo superseded the three-business-approval design: Barbara enters Apex at the initial queue and final credit approval only. Investigation, bounded evidence requests and reassessment belong in the same actual ChatGPT conversation. Evidence requests must retain scope/access/snapshot/idempotency/audit checks without separate business approvals. Later evidence remains an explicit simulated time transition, not an instant processor response. An Apex launch-to-ChatGPT control is desired, with an honest copy/open fallback if prompt handoff is not supported.

This restart increment does not implement that tool/workflow change. Existing request staging and separate evidence-request approvals are still the deployed behavior. Do not present the new interaction contract as already working. Voice also remains prepared, not connected.
