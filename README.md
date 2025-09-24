# Opencode Agents: Structured Workflow

This repository config defines a lean Plan → Implement → Verify → Complete flow.

## Typical Workflow (Golden Path)

1) Initialize metadata
- `/init-project-meta`

2) Shape strategy
- Research-enabled: `/roadmap-synthesize "Goals: <bulleted goals>"`
- Manual update: `/roadmap-plan`

3) Plan the phase
- `/phase-plan` to create `planning/phases/phase_<n>.md` with tasks and targets
  - Optional: include Inline Guidance in the command input to prefill sections (Scope, Key Decisions, Constraints, Risks, Interfaces hints, Performance Targets).

4) Implement tasks
- By ID: `/implement-task p<n>-<id> [--only web|server|data] [--dry-run]`
- Next task: `/implement-next-task [--only web|server|data] [--dry-run]`

5) Tests and performance (optional)
- Tests: `/test-task "<scope or module>"`
- Perf scaffolding: `/perf-scaffold "<api|ui|db|module>"`
- Perf run: `/perf-check "<api|ui|db>"`

6) Review and complete
- Review: `/review-phase <git-ref>`
- Complete: `/complete-phase phase_<n>.md`

7) Releases and CI (optional)
- Changeset one-time setup: `/changesets-scaffold`
- Create a changeset entry: `/changeset-create [--from main] [--packages ...] [--bump ...] [--summary ...] [--dry-run]`
- One-time CI setup: `/ci-scaffold`
- Keep CI current: `/ci-ensure [--enable push,pr] [--node "18,20"] [--workspaces] [--lint/--no-lint] [--perf/--no-perf] [--dry-run]`

## How To Run: Commands vs Agents

- Prefer commands: Use the slash commands (e.g., `/implement-task`) to orchestrate the right agents and tools automatically. Commands are idempotent where possible and respect safety checks.
- Direct agents (optional): Advanced users may invoke specific agents for focused work, but the commands already route to the appropriate agent for you in most cases.
- Scoping: Use `--only web|server|data` to constrain implementers to a single surface when needed.
- Dry-run validation:
  - Implementation: `/implement-task ... --dry-run`, `/implement-next-task --dry-run` to preview actions without writing.
  - Releases: `/changeset-create --dry-run` prints the changeset that would be created.
  - CI: `/ci-ensure --dry-run` shows the proposed workflow updates/diffs without writing.
  - Performance: Start with `/perf-scaffold` (no execution). `/perf-check` runs and writes reports; it may fail on threshold breaches.

## Commands Overview

- `roadmap-synthesize`: Scans repo, may use Context7, writes/updates `planning/roadmap.md` with 2–4 epics, “Assumptions & Unknowns,” and “Candidate Next Phases.” No phase files.
- `roadmap-plan`: Updates roadmap epics and the link to the active/next phase. No research here.
- `phase-plan`: Creates `planning/phases/phase_<n>.md` with ≤15 tasks (IDs `p<n>-<seq>`, Priority, Status, Acceptance), Risks, Interfaces, Performance Targets, DoD.
- `implement-task`: ID-only; parses the task title/notes from the phase file; supports flags `--only` and `--dry-run`.
- `implement-next-task`: Auto-selects next task; supports flags `--only` and `--dry-run`.
- `implement-task-web|server|data`: Force a specific surface when desired.
- `test-task`: Writes/updates tests; auto-detects runner (Vitest/Jest/Playwright).
- `perf-scaffold`: Generates minimal, commented benches; no execution or thresholds unless asked.
- `perf-check`: Runs perf, compares to `.opencode/perf.yaml` or phase targets; writes `perf_reports/<timestamp>.md`; fails on threshold violations.
- `review-phase`: Read-only diff review; flags blocking/non-blocking issues and test gaps.
- `complete-phase`: Validates DoD, tests, and perf if defined; archives the phase and updates roadmap links.

## Releases & CI (Optional)

- `changesets-scaffold`: One-time setup for `.changeset/` config and npm scripts.
- `changeset-create`: Generates a new changeset entry file (single or multi-package), with inference and dry-run.
- `ci-scaffold`: One-time creation of `.github/workflows/ci.yml` (manual trigger by default).
- `ci-ensure`: Idempotent create/update of CI using managed blocks; preserves custom edits; supports dry-run.

## Agents & Permissions

- `fullstack_impl` (primary): `edit: allow`, `bash: ask`; tools include `context7`, `svelte5`, `sentry` when relevant.
- Subagents: `web_impl`, `server_impl`, `data_impl`, `test_impl` — edit allowed, bash ask.
- Planning: `roadmap_planner`, `phase_planner`, `roadmap_synthesizer` — edit ask, bash deny.
- Verification: `perf_checker` (edit ask, bash ask), `quality_reviewer` (read-only), `phase_completer` (edit ask, bash ask).

## Engineering Decisions & Guidance

- Project-wide decisions: Use `templates/ENGINEERING_DECISIONS_TEMPLATE.md` as the canonical format. Create `planning/engineering-decisions.md` per-project only when you need a persistent record. Avoid duplicating decisions in multiple places.
- Machine-readable defaults (optional): `.opencode/project.yaml` can declare stacks and conventions (e.g., `web/server/data/tests`). Use it if you want automation.
- Inline Guidance: You can pass guidance to `/phase-plan` to seed the new phase with specific scope, decisions, and targets.

## Task Shaping & Adjustments

- Shape concrete tasks in the phase file created by `/phase-plan`. Add/edit rows as needed; keep ≤15 active tasks.
- Adjust strategy via `/roadmap-plan` to update epics and the next-phase link. Then run `/phase-plan` to create the next concrete phase.

## Performance Targets & Benchmarks

- Prefer `.opencode/perf.yaml` for thresholds; else use the phase’s “Performance Targets.”
- Keep benchmarks opt-in with `/perf-scaffold`.

## Models & Tools

- Standard model: `github-copilot/gpt-5` across agents.
- Tool keys in agent files are plain names (`context7`, `svelte5`, `sentry`). Use wildcards only in `opencode.json` to mass-toggle tool families.
