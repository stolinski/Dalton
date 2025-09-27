---
description: Prepare and cache task context for fast, low-noise execution
agent: task_preparer
---

Arguments (how to parse $ARGUMENTS):
- Exactly one required token: `<taskId>` matching `^p\d+-\d+$` (e.g., `p1-1`).
- If missing or invalid, emit SPEC_GAP and stop.

What it does:
- Generates two artifacts for the task:
  - Machine cache: `./.opencode/cache/task-context/<taskId>.json`
  - Human summary: `./logs/task-context/<taskId>.md`

Contents:
- task: id, title, surface (web|server|data|unknown), acceptance criteria
- targets: prioritized list of file paths likely to be touched
- anchors: up to 10 symbols/identifiers to locate code
- hits: ripgrep results (file + line numbers only), capped
- digests: exports-only summaries for large/generated files
- tests: script or exact test files/tags to run
- budgets: { maxFiles, maxHitsPerFile, maxBytesRead, maxMs }
- freshness: input files and mtimes used to compute staleness

Rules:
- Single-pass IO; respect budgets; stop-on-sufficient context.
- Budgets (defaults unless overridden): { maxFiles: 24, maxHitsPerFile: 8, maxTotalHits: 120, maxBytesRead: 300_000, maxRgMs: 1500 }
- Ripgrep usage: cap per-file hits and total hits; timebox to `maxRgMs`; prefer targeted directories from `targets`; otherwise search repo root with excludes.
- Ignore dirs: node_modules, dist, .svelte-kit, build, .git
- Generated/large files: treat `*.gen.*`, `*.d.ts`, and files > 80KB as exports-only reads (symbol signatures only)
- Do not modify source files; only write cache and summary.
- Ensure parent dirs exist; create `./logs/task-context/` and `./.opencode/cache/task-context/` if missing.

Staleness:
- Cache is stale if any input (phase file, targeted files) changed mtime/hash since last prep.
- On staleness, re-run this command to refresh.

Usage examples:
- `@command/prepare-task.md p1-1`
- Then run `@command/do-next-task.md p1-1` to execute with the cache.
