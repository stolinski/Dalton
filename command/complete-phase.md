---
description: Validate DoD + tests (+ perf if defined) and archive the finished phase
agent: phase_completer
---

Complete and archive: $ARGUMENTS # accepts forms: '7', 'phase_7.md', or 'planning/phases/phase_7.md'

Git usage: staging and committing only for archiving; no refs/diffs/history are read or required.

Steps:

- Resolve phase file to complete:
  - If $ARGUMENTS is a bare number N, resolve to planning/phases/phase_N.md; if missing, fallback to planning/phases/phase_0N.md.
  - If empty, read ./planning/roadmap.md and use the Active Phase link; if none, SPEC_GAP asking for a phase number.

- Validate: no Active Tasks pending/in_progress; all DoD boxes checked.
- Run tests with minimal output and bail fast. Prefer project scripts if defined (e.g., `test:run`, then `test`). If Bun is used, prefer dot reporter; if Jest/Vitest/Mocha, prefer dot/quiet with `--bail`; if pytest, use `-q -x`; if Rust, `cargo test --quiet -- --fail-fast`; if Go, keep output minimal.
  - Redirect all test output to `./logs/test.log` and rely on exit code only.
- If Performance Targets exist or `.opencode/perf.yaml` exists:
  - Use minimal output and bail early when possible. Ensure `./logs/` exists; write details to `./logs/perf.log`.
  - Compare results to thresholds from `.opencode/perf.yaml` when present; otherwise enforce from the phase’s “Performance Targets”.
  - If a dedicated perf check exists (e.g., `perf:check` or equivalent) → run it and redirect to `./logs/perf.log`. Must exit 0.
  - Otherwise, look for perf tests and tags (framework-agnostic):
    - Directory convention: prefer tests under `tests/perf/` (any runner). If present, run just these tests with minimal reporters and bail-fast.
    - File naming: include tests matching `**/*.perf.*` across the repo; run them with minimal reporters.
    - Tags: when the runner supports it (e.g., Vitest/Jest/Playwright), filter tests tagged `@perf`.
    - Redirect all perf output to `./logs/perf.log`. Must exit 0.
  - If none of the above are available, leave only the unverified targets as SPEC_GAP and STOP with a short list naming each unverified target.

- If neither `.opencode/perf.yaml` nor phase Performance Targets are present, SKIP perf checks without SPEC_GAP.
- On success: append "Archived: YYYY-MM-DD", move the file to ./planning/archive/ using rename (prefer `git mv`), verify source deletion, and update `./planning/roadmap.md` as follows:
  - Remove the entire section headed `### Phase <n>` for the completed phase.
  - Under "## Completed Phases", add `- [Phase <n> — <Title>](./planning/archive/phase_<n>.md)` (omit title if unknown).
  - Active Phase: if it pointed to the completed phase, clear or update as appropriate.
  - Next Phase: set to the smallest integer greater than <n> that's not present as a file; link if the file exists, else show the number.
  - Then commit these changes.
  - If both source and destination exist after move (copy detected), delete the source and log `ARCHIVE: removed duplicate source`. If deletion fails, STOP with: `FAILURE: archive move resulted in duplicate phase files; manual cleanup required.`
  - Stage ONLY the relevant paths: `planning/roadmap.md` and `planning/archive/phase_<n>.md` (the deletion of `planning/phases/phase_<n>.md` is tracked by `git mv`).
  - Do NOT stage logs or unrelated files. Avoid `git add -A`.
  - Commit message: "complete phase <n>: archive and update roadmap"; do not push.
  - If pre-commit hooks modify these files, stage the modified files and run a single `git commit --amend --no-edit`.
  - The agent must not perform any additional edits beyond the archiving and roadmap update steps; do NOT include unrelated working tree changes in this commit.

Progress echoes (print to stdout):
- RESOLVE_PHASE_START / RESOLVE_PHASE_DONE (<path>)
- VALIDATE_START / VALIDATE_DONE
- TESTS_START / TESTS_DONE (status)
- PERF_START / PERF_SKIPPED / PERF_DONE (status)
- ARCHIVE_START / ARCHIVE_DONE (planning/phases/phase_<n>.md → planning/archive/phase_<n>.md)
- ROADMAP_UPDATE_START / ROADMAP_UPDATE_DONE
- GIT_COMMIT_START / GIT_COMMIT_DONE
- COMPLETE_PHASE_DONE (<n>)

Finalization:
- After `GIT_COMMIT_DONE`, print exactly one line `COMPLETE_PHASE_DONE (<n>)` and EXIT without reading any files. Do not read or echo file contents post-commit.

Do not modify any other phases. No summaries.
