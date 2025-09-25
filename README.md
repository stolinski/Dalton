# Opencode Agents: Structured Workflow

This repository config defines a lean Plan → Implement → Verify → Complete flow.

## Typical Workflow (Golden Path)

1) Initialize metadata
- `/init-project-meta`

2) Shape strategy
- Research-enabled: `/roadmap-synthesize "Goals: <bulleted goals>"` (creates/updates “### Phase <n> — <title>” sections in roadmap.md; no phase files)
- Manual update: `/roadmap-plan` (maintains/renumbers Phase sections; no file creation)

3) Plan the phase
- `/phase-plan` to create `planning/phases/phase_<n>.md` with tasks and targets
  - Accepts bare numbers: `/phase-plan 7` is equivalent to `Phase: 7`
  - Defaults to the next phase number derived from the roadmap Phase sections when not provided
  - Optional: include Inline Guidance in the command input to prefill sections (Scope, Key Decisions, Constraints, Risks, Interfaces hints, Performance Targets).

4) Implement tasks
- By ID: `/implement-task p<n>-<id> [--only web|server|data] [--dry-run]`
- Next task: `/implement-next-task [--only web|server|data] [--dry-run]`

5) Tests and performance (optional)
- Tests: `/test-task "<scope or module>"`
- Perf scaffolding: `/perf-scaffold "<api|ui|db|module>"`
- Perf run: `/perf-check "<api|ui|db>"`

6) Review and complete
- Review: `/review-phase` (auto-detect active/next via roadmap), `/review-phase 7` (bare number), or `/review-phase planning/phases/phase_07.md`
- Complete: `/complete-phase` (uses Active link), or `/complete-phase 7` (bare number), or `/complete-phase phase_<n>.md`

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
 
- `roadmap-synthesize`: Scans repo, may use Context7, writes/updates `planning/roadmap.md` with proposed Phase sections (“### Phase <n> — <title>”), determined by your Goals/args and existing roadmap. It preserves existing phase sections and appends contiguously. No phase files.
- `roadmap-plan`: Maintains/renumbers Phase sections (normalizes decimals; preserves links). No research here; does not create or archive phase files.
- `phase-plan`: Creates `planning/phases/phase_<n>.md` with ≤15 tasks (IDs `p<n>-<seq>`, Priority, Status, Acceptance), Risks, Interfaces, Performance Targets, DoD. Accepts bare numbers (e.g., `7`).

- `implement-task`: ID-only; parses the task title/notes from the phase file; supports flags `--only` and `--dry-run`.
- `implement-next-task`: Auto-selects next task; supports flags `--only` and `--dry-run`.
- `implement-task-web|server|data`: Force a specific surface when desired.
- `test-task`: Writes/updates tests; auto-detects runner (Vitest/Jest/Playwright).
- `perf-scaffold`: Generates minimal, commented benches; no execution or thresholds unless asked.
- `perf-check`: Runs perf, compares to `.opencode/perf.yaml` or phase targets; writes `perf_reports/<timestamp>.md`; fails on threshold violations.
- `review-phase`: Phase-scoped quality pass that runs typecheck/lint/tests (checks-first) and reviews provided code context (explicit files/contents). Accepts bare numbers or auto-detects Active/Next via roadmap. No git usage.
- `complete-phase`: Validates DoD, tests, and perf if defined; archives the phase and updates roadmap. Accepts bare numbers or uses the Active link if not provided. Removes the completed Phase section from the roadmap, adds a link under Completed Phases, and updates Active/Next.

## Releases & CI (Optional)

- `changesets-scaffold`: One-time setup for `.changeset/` config and npm scripts.
- `changeset-create`: Generates a new changeset entry file (single or multi-package), with inference and dry-run.
- `ci-scaffold`: One-time creation of `.github/workflows/ci.yml` (manual trigger by default).
- `ci-ensure`: Idempotent create/update of CI using managed blocks; preserves custom edits; supports dry-run.

## Agents & Permissions

- `fullstack_impl` (primary): `edit: allow`, `bash: ask`; tools include `context7`, `svelte5`, `sentry` when relevant.
- Subagents: `web_impl`, `server_impl`, `data_impl`, `test_impl` — edit allowed, bash ask.
- Planning: `roadmap_planner` (edit allow, bash deny), `phase_planner`, `roadmap_synthesizer` — edit ask, bash deny.
- Verification: `perf_checker` (edit ask, bash ask), `quality_reviewer` (read-only), `phase_completer` (edit ask, bash ask).

## Engineering Decisions & Guidance

- Project-wide decisions: Use `templates/ENGINEERING_DECISIONS_TEMPLATE.md` as the canonical format. Create `planning/engineering-decisions.md` per-project only when you need a persistent record. Avoid duplicating decisions in multiple places.
- Machine-readable defaults (optional): `.opencode/project.yaml` can declare stacks and conventions (e.g., `web/server/data/tests`). Use it if you want automation.
- Inline Guidance: You can pass guidance to `/phase-plan` to seed the new phase with specific scope, decisions, and targets.

## Embedded Templates & Numbering

- Built-in templates: Agents embed `PHASE_TEMPLATE`, `ROADMAP_TEMPLATE`, and `ENGINEERING_DECISIONS_TEMPLATE` so they work without repo-scoped template files.
- Optional overrides: If present, commands prefer `./.opencode/templates/*.md` project overrides.
- Phase numbers: Always integers. If the roadmap uses decimals in headings (e.g., “Phase 7.5 — …”), `/roadmap-plan` normalizes to sequential integers and updates internal links. `/phase-plan` never creates fractional phase files.
- Collision handling: If `planning/phases/phase_<n>.md` exists, `/phase-plan` aborts without writing. Pass `Phase: <n>` to choose a different number or archive/rename the existing file first.

## Manual Normalization

- Use `/roadmap-plan` to update the roadmap and normalize phase headings.
- If headings contain decimals (e.g., `### Phase 7.5 — …`), the command renumbers to sequential integers and updates internal links.
- The command edits only `planning/roadmap.md`. It does not create or modify phase files.
- Recommended: keep phase numbers as integers; decimals are supported for input but are normalized away.

## Task Shaping & Adjustments

- Shape concrete tasks in the phase file created by `/phase-plan`. Add/edit rows as needed; keep ≤15 active tasks.
- Adjust strategy via `/roadmap-plan` to update Phase sections and the next-phase link. Then run `/phase-plan` to create the next concrete phase.

## Performance Targets & Benchmarks

- Prefer `.opencode/perf.yaml` for thresholds; else use the phase’s “Performance Targets.”
- Keep benchmarks opt-in with `/perf-scaffold`.

## Perf Tests Convention

- Directory: place perf tests under `tests/perf/` (preferred). The completer and perf tools will run only this directory when present, using minimal reporters and bail-fast.
- File pattern: name perf tests with `**/*.perf.*` to be auto-discovered when no dedicated directory exists.
- Tags: when your runner supports it (Vitest/Jest/Playwright), tag tests with `@perf` and the tools will filter to just these.
- Thresholds: define central thresholds in `.opencode/perf.yaml`. If absent, thresholds are enforced from the current phase’s “Performance Targets.”
- Outputs: logs are written to `./logs/perf.log`; exit code determines pass/fail.

## Troubleshooting Review Phase

- Checks-first behavior: `review-phase` always runs typecheck, lint, and tests via project scripts when available. Provide code context (explicit files/contents) for review; no git involved.
- Autodetect phase: If no argument is given, it reads `planning/roadmap.md` and follows the Active/Next link (e.g., `planning/phases/phase_07.md`).
- Common SPEC_GAPs:
  - Active/Next not found: "SPEC_GAP: Active/Next phase not found in planning/roadmap.md. Provide a phase number (e.g., `/review-phase 7`) or a file path."
  - Phase file missing: "SPEC_GAP: Phase file not found: <path>."
  - Checks failed to execute: includes the attempted command and stderr summary.

- Progress markers you should see: `RESOLVE_PHASE_START/DONE`, `CHECKS_START/DONE`, and for code context, `CODE_CONTEXT_START/CODE_CONTEXT_READY`.
- If it seems to hang: use `--quick` to skip checks and get immediate static feedback on code_context. Otherwise it’s usually waiting on checks; run your scripts directly (`npm run typecheck`, `npm run lint`, `npm test`), then re-run `review-phase`.

## Models & Tools

- Standard model: `github-copilot/gpt-5` across agents. `roadmap_planner` uses `github-copilot/gemini-2.0-flash` for faster normalization runs.
- Tool keys in agent files are plain names (`context7`, `svelte5`, `sentry`). Use wildcards only in `opencode.json` to mass-toggle tool families.

## Example: .opencode/project.yaml (optional)

- Purpose: Provide machine-readable defaults for stack and conventions. Agents read this first; enforcement happens via your linters/CI.
- Example (Svelte/SvelteKit):

```
web:
  framework: sveltekit
  conventions:
    events:
      prefer: "on:"
      disallow: ["onclick", "onchange"]
    classDirectives:
      prefer: true
    bindings:
      allow: ["bind:value", "bind:group"]
    stores:
      prefer: "$state"
  lint:
    ruleset: eslint
    scripts:
      typecheck: "npm run typecheck || svelte-check --quiet"
      lint: "npm run lint || eslint . --max-warnings=0"
      test: "npm test -- --bail --reporter=dot"
server:
  runtime: node
  language: typescript

data:
  orm: prisma

tests:
  runner: vitest
```

- Note: Only `web/server/data/tests` have meaning to agents; other keys are free-form guidance.

## ESLint Setup (Svelte) Quickstart

- Install dev deps:
  - `npm i -D eslint eslint-plugin-svelte svelte-eslint-parser @eslint/js typescript`
- Create `eslint.config.js` (flat config):

```
// eslint.config.js
import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'

export default [
  js.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    rules: {
      // Example: fail on console in production builds
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]
```

- Package scripts:

```
{
  "scripts": {
    "typecheck": "svelte-check --quiet",
    "lint": "eslint .",
    "test": "vitest --run --bail --reporter=dot"
  }
}
```

- CI wiring: Ensure your workflow runs `npm run typecheck`, `npm run lint`, and `npm test`. `review-phase` surfaces summaries from these.
