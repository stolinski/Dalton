---
description: Manifest → controlled expansion (≤40) → cache write/refresh (dalton-2)
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

- No repo-wide grep/glob. Allowed inputs only:
  1. `planning/context/<task_id>.manifest.json`
  2. Inline “Context Manifest:” under the task in `planning/phases/phase_<n>.md`
  3. `planning/context/index.json`
  4. Fallback `planning/workspace_map.json` (or copy from global template)
- Controlled expansion only from the manifest(s); cap `resolved_files` ≤ 40; allowed roots: `src/routes/**`, `src/lib/**`, `src/lib/server/**`, `server/**`, `db/**`, `migrations/**`, `schema/**`.
- Always resolve to a concrete cache file path `.opencode/cache/task-context/<task_id>.json`. If missing, create it (atomic write) with:
  - `schema_version: 2`, `flow_version: 1`, `freshness: "fresh"`, `VERIFY_OK: false`, plus task metadata and `resolved_files`.

Markers

- `FILES <count>`
- `CACHE <fresh|stale|missing> ./.opencode/cache/task-context/<task_id>.json`
- Lifecycle `START context_preparer flow=<flow> phase=<n|?> task=<id|?>` / `DONE context_preparer`

IO allowlist

- planning/context/<task>.manifest.json (read/write)
- planning/context/index.json (read optional)
- planning/workspace_map.json (read or project‑local create from global template)
- planning/phases/phase\_\*.md (read inline manifest)
- .opencode/cache/task-context/<task>.json (read/write)

Denied

- Prohibit repo-wide grep/glob. On any attempt to grep/glob outside allowed roots: `IO_VIOLATION <path>` and STOP.
- `.git/**`, `node_modules/**`, `.env*`, `secrets/**`, and repo‑root globs.

Concurrency & atomicity

- Create lockfile `.opencode/cache/task-context/<task>.lock` at start; if it exists and is fresh (<10m), `SPEC_GAP cache locked <task>` and stop.
- Write `*.tmp` then rename atomically when creating/updating cache or manifest.
- Keep at most one `.bak` per run when modifying project‑local files.

Failure

- `SPEC_GAP workspace_map missing` when template copy fails
- `IO_VIOLATION <path>` on any attempt to use disallowed inputs or expand outside allowed roots
