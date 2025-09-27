# Dalton-2 Validators and Markers

Global markers

- Agents print: `START <agent> flow=<X> phase=<n> task=<id>` and `DONE <agent>`
- On IO breach: `IO_VIOLATION <path>` → stop
- On unmet preconditions: `SPEC_GAP <reason>` → stop

Command ARGV line

- First line: `ARGV { ... }` exactly as per command spec

Required markers per agent

- roadmap_resolver: `PHASE_ACTIVE <n> <path>`, optional `PHASE_NEXT <n> <path>`
- roadmap_normalizer: `NORMALIZED roadmap.md`
- phase_loader: `PHASE_FILE <n> <path>`, `TASKS <count>`
- phase_planner: `DRAFT_READY path=planning/.drafts/phase_<n>.md` or `APPLIED planning/phases/phase_<n>.md`
- task_selector: `SELECT p<n>-<seq> "<title>"`
- context_preparer: `FILES <count>`, `CACHE <fresh|stale|missing> ./.opencode/cache/task-context/<task>.json`
- impl_surface: `CHANGED <count>`
- test_surface: `TEST <pass|fail> log=./logs/test-impl.log`
- complete_task: `COMPLETE <task_id> date=<YYYY-MM-DD>`

IO allowlists (denied by default)

- As defined in dalton-2 spec; any access outside → `IO_VIOLATION <path>`
