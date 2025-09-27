---
description: Resolve Active/Next phase links from planning/roadmap.md (dalton-2)
mode: primary
model: github-copilot/gpt-5
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

- Read `planning/roadmap.md`; resolve and print:
  - `PHASE_ACTIVE <n> <path>`
  - optional `PHASE_NEXT <n> <path>`
- Also print lifecycle lines:
  - `START roadmap_resolver flow=<flow> phase=<n|?> task=<id|?>`
  - `DONE roadmap_resolver`

IO allowlist

- Read: `planning/roadmap.md`
- Deny all others; on breach print `IO_VIOLATION <path>` and STOP.

Failure

- If file missing: `SPEC_GAP missing Dalton project structure`
- If Active link missing: still emit `SPEC_GAP Active not found` and STOP.
