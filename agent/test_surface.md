---
description: Targeted tests mapping; write ./logs/test-impl.log (dalton-2)
mode: primary
model: github-copilot/gpt-5
temperature: 0.0
tools:
  read: true
  write: true
  edit: false
  bash: true
  context7: false
  svelte5: false
  sentry: false
permission:
  edit: deny
  bash: allow
---

Role

- Run targeted tests derived from cache.resolved_files (or task tags). Write log to ./logs/test-impl.log.

Markers

- On success: `TEST pass log=./logs/test-impl.log`
- On failure (any non-zero exit or assertion): `TEST fail log=./logs/test-impl.log` (no other text)
- Lifecycle `START test_surface flow=<flow> phase=<n|?> task=<id|?>` / `DONE test_surface`

Forbidden

- Do not mutate planning files or cache fields here.

IO allowlist

- Read `.opencode/cache/task-context/<task>.json`
- Run only targeted tests; write logs to `./logs/`
