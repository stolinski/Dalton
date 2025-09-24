---
description: Create the next concrete phase from the roadmap
agent: phase_planner
---

Read ./planning/roadmap.md and /Users/scotttolinski/.config/opencode/templates/PHASE_TEMPLATE.md.

Optionally accept Inline Guidance in the command input to prefill sections (Scope, Key Decisions, Constraints, Risks, Interfaces hints, Performance Targets). Guidance takes precedence over roadmap heuristics while respecting constraints.

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
