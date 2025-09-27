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

- Map changed/resolved files to nearest tests (`*.test.*`, `*.spec.*`, or framework‑specific) ≤ 30 specs; quiet reporters; bail‑fast.
- Always truncate and write `./logs/test-impl.log`.

Markers

- `TEST <pass|fail> log=./logs/test-impl.log`
- Lifecycle `START test_surface flow=<flow> phase=<n|?> task=<id|?>` / `DONE test_surface`

IO allowlist

- Read `.opencode/cache/task-context/<task>.json`
- Run only targeted tests; write logs to `./logs/`
