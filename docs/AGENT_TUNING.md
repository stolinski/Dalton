---
description: Operational guidance for Dalton‑2 agents (markers, determinism, dry‑run/audit)
---

Core markers

- Lifecycle: every agent prints `START <agent> flow=<flow> phase=<n> task=<id?>` then `DONE <agent>`.
- Role markers:
  - roadmap_resolver: `PHASE_ACTIVE <n> <path>` (+ optional `PHASE_NEXT ...`)
  - roadmap_normalizer: `NORMALIZED roadmap.md`
  - phase_loader: `PHASE_FILE <n> <path>`, `TASKS <count>`
  - phase_planner: `DRAFT_READY path=...` or `APPLIED planning/phases/phase_<n>.md`
  - task_selector: `SELECT p<n>-<seq> "<title>"`
  - context_preparer: `FILES <n>`, `CACHE <state> <path>`
  - impl_surface: `CHANGED <m>`
  - test_surface: `TEST <pass|fail> log=./logs/test-impl.log`
  - complete_task: `COMPLETE <task_id> date=<YYYY-MM-DD>`

Determinism & idempotency

- Deterministic ordering for lists (files, tasks, outputs). Avoid non‑stable scans.
- Idempotent edits: check for existing markers/sections to prevent duplicates.
- Limit expansions strictly (context_preparer ≤ 40 files; tests ≤ 30 specs).

IO discipline

- Enforce per‑agent allowlists. Any out‑of‑scope touch → `IO_VIOLATION <path>`.
- All writes are project‑local: `planning/**`, `.opencode/cache/**`, `./logs/**`.

Concurrency & atomicity

- Use lockfiles for caches: `.opencode/cache/task-context/<task>.lock` (fresh <10m → refuse).
- Write `*.tmp` then rename atomically; keep at most one `.bak` per run.

Dry‑run & audit

- Commands stop after `context_preparer` when `dry_run` is true; print the summary lines and exit.
- When `--audit` is provided to the orchestrator, append a single line to `./logs/run.log`:
  `RUN <ISO> <command> phase=<n> task=<id> only=<only> dry_run=<bool>`

Error taxonomy

- SPEC_GAP: unmet preconditions (e.g., missing acceptance, missing Dalton structure, cache locked)
- IO_VIOLATION: attempted access outside allowlist
