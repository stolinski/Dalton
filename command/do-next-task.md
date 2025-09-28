---
description: "Orchestrator: select → prepare → implement → test → complete (dalton-2)"
---

# Command Contract (NO CODEGEN)

- This command is **non-editing**. It MUST NOT create/modify/delete project files.
- It MAY ONLY:
  - Parse ARGV (non-interactive).
  - Invoke agents in the flow below.
  - Print markers and the final summary.
- If any write/codegen is about to happen (e.g., creating `scripts/**`, `src/**`, `server/**`, `db/**`, `migrations/**`, `schema/**`, `tools/**`), print:
  `IO_VIOLATION COMMAND_WRITE <path>` and **STOP**.

Forbidden in commands:

- Generating code files (`*.ts`, `*.js`, `*.svelte`, etc.)
- Creating CLIs (e.g., `scripts/do-next-task.ts`)
- Running scaffolds; edits belong only in agents.

# ARGV (non‑interactive gate)

- Input: use raw `$ARGUMENTS`. Do **not** prompt.
- Recognized tokens (order‑agnostic):
  - `--only <web|server|data>`
  - `--dry-run`
  - `<task_id>` matching `^p\d+-\d+$`
- JSON mode: if `$ARGUMENTS` begins with `{`, parse JSON and merge onto defaults; ignore unknown keys.
- Defaults: `task_id="auto"`, `only="none"`, `dry_run=false`.
- Print ARGV exactly once; never prompt or re‑emit it later
- Do not narrate steps (e.g., “Triggering…”, “Next I’ll…”). Print only required markers and summary.

First printed line (required):
ARGV {"task_id":"<id|auto>","only":"<web|server|data|none>","dry_run":<true|false>,"raw":"$ARGUMENTS"}

(Optional debug):
DEBUG:ARGS raw="$ARGUMENTS"
DEBUG:FLAGS only=<web|server|data|none> dry_run=<true|false> task_id=<id|auto>

# IO Discipline

- Strict allowlists per **agent**; the command itself does not read/write files.
- Never scan repo root; only agents may do controlled expansions.

# Flow (exact order; command ONLY orchestrates)

1. @roadmap_resolver → require PHASE_ACTIVE <n> <path>
2. @phase_loader → require PHASE_FILE <n> <path> and TASKS <count>
3. @task_selector (or validate provided id) → require SELECT p<n>-<seq> "<title>"
   - If ARGV.task_id provided and status is `completed`: SPEC_GAP task <task_id> already completed
   - After SELECT, defensively confirm status; if completed: SPEC_GAP selected task already completed: <task_id>
   - If project-local .opencode/cache/last-completed.json equals selected id: DEBUG:last-completed <task_id>
   - **Acceptance guard:** if the selected task’s acceptance is empty → SPEC_GAP acceptance missing for <task_id> and STOP
4. @context_preparer <task_id> [only] → require FILES <n> and CACHE <fresh|stale|missing> <path>
5. If dry_run: print summary (PHASE/TASK/CACHE/ONLY) and STOP
6. @impl_surface <task_id> [only] → require CHANGED <m>
   - If it prints `CHANGED 0`, print `SPEC_GAP no changes produced` and STOP. Skip @test_surface/@complete_task on no‑op.
7. @test_surface <task_id> → require TEST pass log=./logs/test-impl.log
   - If the marker is not exactly `TEST pass ...`, print `SPEC_GAP tests failed` and STOP.
8. Set VERIFY_OK=true in project-local cache
9. @complete_task <task_id> → require COMPLETE <task_id> date=<YYYY-MM-DD>

All agents MUST also print: START <agent> flow=do-next-task phase=<n> task=<id> and DONE <agent>.

# Dry‑run

- Stops after @context_preparer. Print summary (PHASE/TASK/CACHE/ONLY) then STOP.

# Audit (optional)

- If `--audit` (out-of-band), append a single line to ./logs/run.log at agent level (not here).

# Summary (print in this exact order)

PHASE: <n> <path>
TASK: <task_id> <title>
CACHE: <fresh|stale|missing> <path>
ONLY: <web|server|data|none> # omit if none
DONE do-next-task

# Failure handling

- SPEC_GAP <which agent/marker>
- SPEC_GAP acceptance missing for <task_id>
- SPEC_GAP task <task_id> already completed
- SPEC_GAP selected task already completed: <task_id>
- IO_VIOLATION <path>
