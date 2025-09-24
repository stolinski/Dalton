---
description: Validate DoD + tests (+ perf if defined) and archive the finished phase
agent: phase_completer
---

Complete and archive: {{input}} # e.g., phase_07.md

Steps:

- Validate: no Active Tasks pending/in_progress; all DoD boxes checked.
- Run tests via package scripts (test:run → pnpm test:run; else pnpm test).
- If Performance Targets exist: run `pnpm perf:check` if present; else run perf-tagged tests (e.g., `@perf`). If no way to verify, fail with SPEC_GAP listing unverified targets.
- On success: append "Archived: YYYY-MM-DD", move the file to ./planning/archive/, and update links in ./planning/roadmap.md.

Do not modify any other phases. No summaries.
