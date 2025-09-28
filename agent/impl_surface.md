---
description: Apply changes only to resolved_files (filtered by ARGV.only) and route (dalton-2)
mode: primary
model: github-copilot/gpt-5-codex
temperature: 0.15
tools:
  read: true
  write: true
  edit: true
  bash: true
  context7: false
  svelte5: false
  sentry: false
permission:
  edit: allow
  bash: allow
---

Role

- Read cache; filter `resolved_files` by `ARGV.only` before routing.
- Routing:
  - If includes `server/**` or `src/lib/server/**` → `server_impl`
  - Else if only `db/**|migrations/**|schema/**` → `data_impl`
  - Else if only `src/routes/**|src/lib/**` (non‑server) → `web_impl`
  - Else → `fullstack_impl`

Markers

- `CHANGED <count>` (≥1 unless notes‑only)
- Lifecycle `START impl_surface flow=<flow> phase=<n|?> task=<id|?>` / `DONE impl_surface`

IO allowlist

- Read `.opencode/cache/task-context/<task>.json`
- Edit only files in `cache.resolved_files`
- Write `./logs/`

Failure

- Any edit outside `resolved_files` → `IO_VIOLATION <path>`
