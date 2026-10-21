# APEX fictional issuer brand — Codex handoff (October 21, 2026)

These original, fictional APEX branding assets are ready for the customer banking app, case-management/analyst UI and interview slide deck. They do **not** represent a real bank or a cleared commercial trademark.

## Assets

- `apex-wordmark.svg`: horizontal navy logo on white/light backgrounds (slide headers, bank/analyst app header).
- `apex-wordmark-white.svg`: horizontal white logo on dark backgrounds.
- `apex-symbol.svg`: transparent standalone A glyph for small light-background spaces.
- `apex-app-icon.svg`: rounded navy-square A glyph for favicon/app icon/navigation.

Palette: navy `#112B46`; blue `#1477B8`; light cyan `#6CC9E7`; white `#FFFFFF`. Prefer a white, simple, uncluttered executive style. Assets are scalable vector SVG; export PNGs only if required by a component.

## Codex task for next UI polish pass

Integrate the supplied assets into the existing Apex customer banking and analyst/operations screens (and presentation, if deck source is checked in). Use the wordmark in a restrained header; app icon for favicon/mobile shell. Reuse existing sizing/spacing conventions, check responsive layouts and contrast. Keep the brand modest and professional—no redesign of the story or extra scenes. Do not overwrite the existing slide design with a dark background.

**Hard boundary:** visual-only work. Preserve intake, Realtime/Twilio, queue, ChatGPT/MCP, case/evidence snapshots, business approval, credit/ledger posting, idempotency, runtime configuration, tunnels, state and proof cases. Don't restart, reset, approve, post credit, change credentials, or reconfigure Twilio while branding. Run appropriate visual/build checks and record results; avoid claiming unrun tests. Do not invent successful phone-call proof. Work on a fresh branch/commit if helpful and keep changes reviewable.

The assets here are an exact SVG version of the logo set created for the interview. Raster PNG companions were generated locally, but these four vector sources are canonical in this repo.
