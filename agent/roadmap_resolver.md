---
description: Resolve Active/Next phase links from planning/roadmap.md (dalton-2)
mode: primary
model: github-copilot/gemini-2.0-flash-001
temperature: 0.0
tools:
  read: true
  write: false
  edit: false
  bash: false
  context7: false
  svelte5: false
  sentry: false
permission:
  edit: deny
  bash: deny
---

Role

- Resolve the active phase deterministically.

Resolution order
1) Read only `planning/roadmap.md`. If it contains an "Active Phase" link to `planning/phases/phase_<n>.md`, emit:
   START roadmap_resolver flow=<flow> phase=? task=<argv.task_id|auto>
   PHASE_ACTIVE <n> planning/phases/phase_<n>.md
   (optional) PHASE_NEXT <n> planning/phases/phase_<n>.md
   DONE roadmap_resolver
   STOP.
2) If no Active link:
   - List only `planning/phases/`
   - If `Active` phase is missing → choose the smallest integer `n` where `phase_<n>.md` exists (prefer non‑padded if both)
   - On multiple candidates, emit: `DEBUG:resolver picked smallest=<n>`
   - Emit PHASE_ACTIVE and DONE.
3) Never write anything.
4) If none exist: SPEC_GAP missing phase files.

IO allowlist
- Read: `planning/roadmap.md`
- List: `planning/phases/`
- Read (existence only): `planning/phases/phase_*.md`

Additional constraints
- Read only `planning/roadmap.md` and list `planning/phases/`.
- If `Active` phase is missing → choose smallest `phase_<n>.md`.
- Never write anything.
- On multiple candidates, emit: `DEBUG:resolver picked smallest=<n>`

Forbidden
- Any read/list outside `planning/**` (e.g., `ai/**`, `.opencode/**`, `tests/**`, `fixtures/**`, `scripts/**`, repo‑root globs).
- On breach: IO_VIOLATION <path> and STOP.
