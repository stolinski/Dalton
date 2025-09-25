---
description: Create the next concrete phase from the roadmap
agent: phase_planner
---

Read ./planning/roadmap.md. Use the built-in PHASE_TEMPLATE embedded in the agent; optionally prefer ./.opencode/templates/PHASE_TEMPLATE.md when present.

Numbering behavior:
- If `Phase: <n>` is provided, use it (also accept a bare number like `7`).
- Else, accept a bare positional number (e.g., `7`) to mean `Phase: 7`.
- Else, prefer the roadmap’s next referenced phase number (first "Phase <n>" not already present in planning/phases or planning/archive).
- Else, if there is exactly one active phase file in planning/phases/, use that number when creating a continuation phase (only if explicitly requested via `--continue`); otherwise pick the next sequential integer based on existing phase files.

Optional overrides in command input:
- `Phase: <integer>` to explicitly set the phase number (e.g., 7)
- `Title: <text>` to set the phase title
- Inline Guidance blocks to prefill Scope, Tasks, Decisions, Risks, Interfaces, Performance Targets

Optionally accept Inline Guidance in the command input to prefill sections (Scope, Key Decisions, Constraints, Risks, Interfaces hints, Performance Targets). Guidance takes precedence over roadmap heuristics while respecting constraints.

Guidance (from command arguments):
$ARGUMENTS

Create ONE new file at ./planning/phases/phase\_<n>.md where <n> is the next integer.
Populate:

- Scope
- Active Tasks (≤15) with IDs p<n>-<seq>, Priority, Status, Notes/Acceptance
- Completed ✓ (seed with p<n>-0 if appropriate)
- Key Decisions (3–5)
- Risks & Mitigations (3–5)
- Interfaces (stub types/contracts)
- Performance Targets
- Definition of Done

Do not consult external docs. Do not create more than one phase. No extra summaries.

Collision handling:
- If `./planning/phases/phase_<n>.md` already exists, abort without writing. Use `Phase: <integer>` to choose a different number or archive/rename the existing file first.
