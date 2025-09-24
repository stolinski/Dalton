# Engineering Decisions

Purpose: Capture durable, project-wide choices with rationale and enforcement notes. Keep entries concise and actionable.

## How to Use
- Add a new entry per decision. Keep “Outcome” imperative and testable.
- Mirror critical active decisions in the current phase’s “Key Decisions”.
- Link to any enforcement (ESLint rules, CI checks, codegen, docs).
- Mark deprecated decisions and add their replacements.

## Decisions

Note: Example rows below are placeholders — remove in real projects.

| Decision | Outcome | Rationale | Scope | Status | Enforcement |
| --- | --- | --- | --- | --- | --- |
| Example — Naming (remove) | Use snake_case for variables | Consistent code style | Project | Example | ESLint rule |
| Example — Error handling (remove) | Centralized error handler with typed errors | Debuggability and safety | Project | Example | Middleware/logger |

## Fields
- Decision: Short name of the choice (e.g., “Data sync policy”).
- Outcome: The binding rule (e.g., “Use synced queries only”).
- Rationale: Why this is the right choice now.
- Scope: Project or Phase (if phase, also copy into phase Key Decisions).
- Status: Active, Deprecated, Proposed.
- Enforcement: Where this is checked (lint, CI, codegen, review).

## Notes
- Keep this document stable; avoid task-level detail.
- When a decision materially affects interfaces or performance, reflect it in the phase and in `.opencode/project.yaml` only if you want future automation to pick it up.
