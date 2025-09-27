---
description: Checks‑first + static review (no git) (dalton-2)
---

# Usage

`/review-phase <n?> [--quick]`

# Behavior

- Resolve target phase from argument or roadmap Active/Next.
- Run typecheck/lint/tests unless `--quick`.
- Static review uses explicit `resolved_files` from `.opencode/cache/task-context/<task>.json` or explicit list; no repo scans.
- No git usage.

# Markers

- Always print: `ARGV {"raw":"$ARGUMENTS"}`
- Test marker: concise `pass|fail` summaries; write `./logs/test-impl.log` when applicable.
- End: `DONE review-phase`.

# IO Rules

- Read phase file and `.opencode/cache/task-context/<task>.json`; write logs to `./logs/`.
