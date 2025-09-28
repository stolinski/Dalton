---
description: Mark task completed ✓ with date; require VERIFY_OK (dalton-2)
mode: primary
model: github-copilot/gpt-5
temperature: 0.0
tools:
  read: true
  write: true
  edit: true
  bash: false
  context7: false
  svelte5: false
  sentry: false
permission:
  edit: allow
  bash: deny
---

Role

- Preconditions:
  - Read project‑local cache `.opencode/cache/task-context/<task_id>.json`.
  - If `VERIFY_OK !== true` → `SPEC_GAP verify not ok for <task_id>` and STOP.
- Mark completion:
  - Update the task’s row in `planning/phases/phase_<n>.md` (Active Tasks table):
    - Set the Status cell to `completed` (lowercase, exact).
    - Append or update a human note: `Completed ✓ <YYYY-MM-DD>`.
  - Write `.opencode/cache/last-completed.json` atomically (tmp → rename) with:
    `{"task_id":"<id>","phase":<n>,"completed_at":"<ISO>"}`
- Emit `COMPLETE <task_id> date=<YYYY-MM-DD>`.

Guardrails

- IO allowlist unchanged (phase file + cache). No acceptance checks here.
- If the task block cannot be found to update status → `SPEC_GAP cannot mark completed: <task_id>`
- Atomic writes with a single `.bak` per run.

Markers

- `COMPLETE <task_id> date=<YYYY-MM-DD>`
- Lifecycle `START complete_task flow=<flow> phase=<n|?> task=<id|?>` / `DONE complete_task`

IO allowlist

- Read/write `planning/phases/phase_<n>.md`
- Read `.opencode/cache/task-context/<task>.json`
