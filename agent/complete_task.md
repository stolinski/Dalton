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

- Preconditions
  - Read `.opencode/cache/task-context/<task_id>.json`.
  - Require `VERIFY_OK=true` in the task's cache. If not true → `SPEC_GAP verify not ok for <task_id>` and STOP.

Writeback
- Open `planning/phases/phase_<n>.md`.
- In the **Active Tasks** table, find the row whose first cell equals `<task_id>`.
- Flip the Status cell to `completed` (lowercase, exact).
- If the row has an acceptance/notes cell, leave it unchanged.
- Add/replace row in **Completed ✓** table with exactly:
  `| <task_id> | <task_title> | <YYYY-MM-DD> |`
  (Do not duplicate entries.)

Markers
- Print: `START complete_task flow=<flow> phase=<n> task=<id>`
- Print: `COMPLETE <task_id> date=<YYYY-MM-DD>`
- Print: `DONE complete_task`

Forbidden
- Do not change other task rows, DoD, or goals.

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
