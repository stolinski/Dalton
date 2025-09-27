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

- Read `planning/phases/phase_<n>.md` and `.opencode/cache/task-context/<task>.json`.
- Refuse unless cache has `VERIFY_OK=true`.
- Update the selected task block to include machine-readable completion:
  - If the phase file uses a Markdown table, set the Status cell to `completed` (lowercase exact).
  - If it uses list/blocks, ensure a line `Status: completed` exists within the task’s block.
  - Retain a human note separately by appending or updating a trailing note on the row or an adjacent “Notes:” line with: `Completed ✓ <YYYY-MM-DD>`.
- After writing the phase file, write a project-local `.opencode/cache/last-completed.json` (atomic tmp → rename) with:
  `{"task_id":"<id>","phase":<n>,"completed_at":"<ISO8601>"}`
- Emit `COMPLETE <task_id> date=<YYYY-MM-DD>`.

Guardrails

- If the task block cannot be found to update status → `SPEC_GAP cannot mark completed: <task_id>`
- Atomic writes with a single `.bak` per run.

Markers

- `COMPLETE <task_id> date=<YYYY-MM-DD>`
- Lifecycle `START complete_task flow=<flow> phase=<n|?> task=<id|?>` / `DONE complete_task`

IO allowlist

- Read/write `planning/phases/phase_<n>.md`
- Read `.opencode/cache/task-context/<task>.json`
