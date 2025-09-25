---
description: Implement the next prioritized task from the current phase
agent: fullstack_impl
---

Flags (optional):
- --only <surface>   # one of: web | server | data
- --dry-run          # select and print the chosen task without changing files

Arguments:
- This command takes no positional arguments. Ignore any stray tokens (e.g., "." or trailing punctuation) in $ARGUMENTS.
- Optional override: If a single token in $ARGUMENTS EXACTLY matches a task ID regex `^p\d+-\d+$` (e.g., `p7-3`), implement that task instead of auto-selecting.

Select the next task from ./planning/phases/phase_<n>.md using this order:

1) Status: in_progress > pending (ignore blocked)
2) Priority: High > Medium > Low > unset
3) Sequence: lower p<n>-<seq> first

Behavior:
- If --dry-run is set, output the chosen task ID and title and stop.
- If --only is set, restrict implementation to that surface and add a short note in the phase file under the task’s Notes on what remains for other surfaces (if any).
- Testing during implementation must be targeted only (related files/tags) and use minimal output redirected to `./logs/test-impl.log`. Do not run full suites unless explicitly requested by the user or acceptance criteria.

Implement the task end-to-end (or surface-limited). Parse the task's title and acceptance criteria from the phase file. On completion, move the task row to “Completed ✓” with date. If no eligible task exists, emit SPEC_GAP naming why.
