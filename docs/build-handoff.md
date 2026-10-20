# Codex build handoff - October 20, 2026

**Start here:** read AGENTS.md, then [the current build plan](plan.md), [current resolution](case-resolution.md), [access design](analyst-access-control.md) and [sensitive-data/voice requirements](sensitive-data-and-voice.md).

Theo has now explicitly asked Codex to review and start building the agreed demo. **Presentation materials and practice are on hold.** This supersedes earlier “preparation only/no build resumption” notes as an authorization statement; it does not turn any pending feature into completed work or remove existing safety/readiness requirements.

Latest setup clarification: Theo approved simulated identity (explicit fixed Barbara demo actor, no OAuth claim) and M. Price API credential reuse. The local ignored configuration and credential helper are ready; 19 adapter/config plus 26 existing tests pass. External IdP setup is deferred; actual ChatGPT access/connection still needs proof. Read build-progress.md and adapter-setup.md before acting on older external-OAuth prerequisites below.

## What changed since the original prototype

The hero must no longer end at specialist referral. Martha disputes $648.50 at JCPenney; Barbara investigates in actual ChatGPT with scoped Apex tools. The weak packet is a fictional processor export. After an internal lookup reveals an earlier-purchase mismatch, Barbara requests transaction-specific processor evidence. A labeled later response corrects the citation. She reviews the complete record and can approve a supported synthetic credit under fictional authority **below $1,000**. Apex posts once, verifies the ledger/case record and shows Martha the approved explanation and resolution. Network recovery stays out of scope.

No final decision is encoded into evidence. Threshold alone is not eligibility; missing authentication is not proof of fraud. Read case-resolution.md for the exact narrative and proof boundaries.

## First actions

1. Inspect the checkout/working changes and run current baseline checks.
2. Perform/document the bounded Gate 0 check or honest sourced-table fallback; optional native UI must not become a detour.
3. Prove minimal authenticated get_case/get_evidence retrieval in actual ChatGPT where account/access allows. Record actual blockers if unavailable.
4. Continue the ordered plan: shared conversational intake/case continuity, released investigation evidence, processor follow-up, human-approved synthetic credit and verified customer outcome.
5. Prepare the voice alternative live or explicitly simulated without silently replacing discovery selection.

The plan contains acceptance criteria, implementation discretion, failure tests and genuine access questions. Ask only for consequential missing information after inspecting the environment; proceed on reversible work already authorized. Do not stop after producing another plan.

## Status at this handoff

Codex has now added the read-only MCP adapter and locally tested signed identity/case/source/version controls: 13 adapter tests and all 26 existing checks passed. [Build progress](build-progress.md) records the Gate 0 sourced-table fallback and precise proof limits; [adapter setup](adapter-setup.md) documents configuration. External identity/ChatGPT connection remain pending. The underlying workflow still has local Python/SQLite, browser banking form/local draft, disabled voice, seeded APX-001, fixed analyst assessments and the old specialist-handoff action. API conversation, shared new cases, real authenticated approvals and the new credit ending remain unbuilt. Do not confuse local signed-token tests with external OAuth deployment or actual ChatGPT execution.

## Other preparation already saved

- [Discovery/evaluations/executive close](discovery-to-pilot.md)
- [Reflection and design tradeoffs](reflection.md)
- [Why OpenAI](why-openai.md)
- [Customer profile](customer-profile.md), [business case](business-case.md), [meeting outline](meeting-outline.md)

These explain intent. Avoid expanding presentation materials while this build is the priority. Preserve synthetic labels, named users, same-case continuity, human authority, source release, source citations, exact-effect verification and truthful live/simulated status.
