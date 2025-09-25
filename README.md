# Dalton - The Opencode Agents Structured Workflow

This repository config defines a lean Plan → Implement → Verify → Complete flow.

This is done via this flow initialize project → create roadmap → create detailed phase → do all phase tasks → complete phase → next phase

Project contains a roadmap. Roadmap contains many phases. Phases contain many tasks.

## Typical Workflow (Golden Path)

1. Initialize metadata

- `/init-project`

2. Roadmap

   a. `/init-roadmap` - Initialize roadmap file (creates `planning/roadmap.md` from template with Active/Next/Completed sections; seeds two Phase skeletons; no phase files)

   b. `/synthesize-roadmap "Goals: <bulleted goals>"` - Generate roadmap: (creates/updates `### Phase <n> — <title>` sections in `planning/roadmap.md`; no phase files)

Note* if you are manually adding phases, run `/refresh-roadmap` to normalize and repair the roadmap (does not create files)

3. Phase

- `/plan-phase` to create `planning/phases/phase_<n>.md` with tasks and targets
  - Accepts bare numbers: `/plan-phase 7` is equivalent to `Phase: 7`
  - Defaults to the next phase number derived from the roadmap Phase sections when not provided
  - Optional: include Inline Guidance in the command input to prefill sections (Scope, Key Decisions, Constraints, Risks, Interfaces hints, Performance Targets).

4. Tasks

- By ID: `/do-task p<n>-<id> [--only web|server|data] [--dry-run]`
- Next task: `/do-next-task [--only web|server|data] [--dry-run]`

5. Tests and performance (optional)

- Tests: `/write-tests "<scope or module>"`
- Perf scaffolding: `/scaffold-perf "<api|ui|db|module>"`
- Perf run: `/check-perf "<api|ui|db>"`

6. Review and complete

- Review: `/review-phase` (auto-detect active/next via roadmap), `/review-phase 7` (bare number), or `/review-phase planning/phases/phase_7.md`
- Complete: `/complete-phase` (uses Active link), or `/complete-phase 7` (bare number), or `/complete-phase phase_<n>.md` (non-padded preferred; zero-padded also supported)

7. Releases and CI (optional)

- Changeset one-time setup: `/scaffold-changesets`
- Create a changeset entry: `/create-changeset [--from main] [--packages ...] [--bump ...] [--summary ...] [--dry-run]`
- One-time CI setup: `/scaffold-ci`
- Keep CI current: `/refresh-ci [--enable push,pr] [--node "18,20"] [--workspaces] [--lint/--no-lint] [--perf/--no-perf] [--dry-run]`

## How To Run: Commands vs Agents

- Prefer commands: Use the slash commands (e.g., `/do-task`) to orchestrate the right agents and tools automatically. Commands are idempotent where possible and respect safety checks.
- Direct agents (optional): Advanced users may invoke specific agents for focused work, but the commands already route to the appropriate agent for you in most cases.
- Scoping: Use `--only web|server|data` to constrain implementers to a single surface when needed.
- Dry-run validation:
  - Implementation: `/do-task ... --dry-run`, `/do-next-task --dry-run` to preview actions without writing.
  - Releases: `/create-changeset --dry-run` prints the changeset that would be created.
  - CI: `/refresh-ci --dry-run` shows the proposed workflow updates/diffs without writing.
  - Performance: Start with `/scaffold-perf` (no execution). `/check-perf` runs and writes reports; it may fail on threshold breaches.

## Commands Overview

- `init-roadmap`: Creates `planning/roadmap.md` from the embedded template, with Active, Next, and Completed sections. Seeds two Phase skeletons. Does not create phase files.
- `synthesize-roadmap`: Scans repo, may use Context7, writes/updates `planning/roadmap.md` with proposed Phase sections (“### Phase <n> — <title>”), determined by your Goals/args and existing roadmap. It preserves existing phase sections and appends contiguously. No phase files.
- `refresh-roadmap`: Normalizes Phase headings and repairs roadmap sections/links (Active/Next/Completed) after manual edits; does not create or archive phase files.
- `plan-phase`: Creates `planning/phases/phase_<n>.md` with ≤15 tasks (IDs `p<n>-<seq>`, Priority, Status, Acceptance), Risks, Interfaces, Performance Targets, DoD. Accepts bare numbers (e.g., `7`).

- `do-task`: ID-only; parses the task title/notes from the phase file; supports flags `--only` and `--dry-run`.
- `do-next-task`: Auto-selects next task; supports flags `--only` and `--dry-run`.
- `do-web-task|do-server-task|do-data-task`: Force a specific surface when desired.
- `write-tests`: Writes/updates tests; auto-detects runner (Vitest/Jest/Playwright).
- `scaffold-perf`: Generates minimal, commented benches; no execution or thresholds unless asked.
- `check-perf`: Runs perf, compares to `.opencode/perf.yaml` or phase targets; writes `perf_reports/<timestamp>.md`; fails on threshold violations.
- `review-phase`: Phase-scoped quality pass that runs typecheck/lint/tests (checks-first) and reviews provided code context (explicit files/contents). Accepts bare numbers or auto-detects Active/Next via roadmap. No git usage.
- `complete-phase`: Validates DoD, tests, and perf if defined; archives the phase and updates roadmap. Accepts bare numbers or uses the Active link if not provided. Removes the completed Phase section from the roadmap, adds a link under Completed Phases, and updates Active/Next. Commits only changes to `planning/roadmap.md` and `planning/archive/phase_<n>.md`; does not stage unrelated files.

## Releases & CI (Optional)

- `scaffold-changesets`: One-time setup for `.changeset/` config and npm scripts.
- `create-changeset`: Generates a new changeset entry file (single or multi-package), with inference and dry-run.
- `scaffold-ci`: One-time creation of `.github/workflows/ci.yml` (manual trigger by default).
- `refresh-ci`: Idempotent create/update of CI using managed blocks; preserves custom edits; supports dry-run.

## Agents & Permissions

- `fullstack_impl` (primary): `edit: allow`, `bash: allow`; tools include `context7`, `svelte5`, `sentry` when relevant. Auto-delegates Svelte UI work to `svelte_pro` when Svelte/SvelteKit is detected.
- Subagents: `web_impl`, `server_impl`, `data_impl`, `test_impl`, `svelte_pro` — edit allowed, bash allow.
- `svelte_pro`: Specialized Svelte/SvelteKit implementer using Svelte MCP; honors project Svelte guidelines (`./.opencode/svelte-guidelines.(md|yaml)` or `./.opencode/project.yaml`) with global fallback to `templates/SVELTE_GUIDELINES.md`. Prefers Svelte 5 runes and idioms.
- Planning:
  - `roadmap_planner`: `edit: allow`, `bash: deny`
  - `phase_planner`: `edit: ask`, `bash: deny`
  - `roadmap_synthesizer`: `edit: allow`, `bash: deny`
- Verification:
  - `perf_checker`: `edit: ask`, `bash: ask`
  - `quality_reviewer`: read-only
  - `phase_completer`: `edit: ask`, `bash: allow`

## Engineering Decisions & Guidance

- Project-wide decisions: Use `templates/ENGINEERING_DECISIONS_TEMPLATE.md` as the canonical format. Create `planning/engineering-decisions.md` per-project only when you need a persistent record. Avoid duplicating decisions in multiple places.
- Machine-readable defaults (optional): `.opencode/project.yaml` can declare stacks and conventions (e.g., `web/server/data/tests`). Use it if you want automation.
- Inline Guidance: You can pass guidance to `/plan-phase` to seed the new phase with specific scope, decisions, and targets.

## Embedded Templates & Numbering

- Built-in templates: Agents embed `PHASE_TEMPLATE`, `ROADMAP_TEMPLATE`, and `ENGINEERING_DECISIONS_TEMPLATE` so they work without repo-scoped template files.
- Optional overrides: If present, commands prefer `./.opencode/templates/*.md` project overrides.
- Phase numbers: Integers are recommended and preserved. `/refresh-roadmap` uses a stable renumber policy: existing integer phases keep their numbers; fractional headings (e.g., “Phase 7.5 — …”) are promoted to the next available integer and subsequent integer phases shift upward. It never restarts numbering at 1. `/plan-phase` never creates fractional phase files.
- Collision handling: If `planning/phases/phase_<n>.md` exists, `/plan-phase` aborts without writing. Pass `Phase: <n>` to choose a different number or archive/rename the existing file first.

## Manual Normalization

- Use `/refresh-roadmap` to update the roadmap and normalize/repair phase headings and links.
- If headings contain decimals (e.g., `### Phase 7.5 — …`), the command applies stable renumbering: preserve existing integer phase numbers; promote fractional phases to the next available integer and shift subsequent integers upward. Never restart numbering at 1. Internal links are updated accordingly.
- The command edits only `planning/roadmap.md`. It does not create or modify phase files.
- Recommended: keep phase numbers as integers; decimals are supported for input but are normalized away.

## Task Shaping & Adjustments

- Shape concrete tasks in the phase file created by `/plan-phase`. Add/edit rows as needed; keep ≤15 active tasks.
- Adjust strategy via `/refresh-roadmap` to update Phase sections and the next-phase link. Then run `/plan-phase` to create the next concrete phase.

## Performance Targets & Benchmarks

- Prefer `.opencode/perf.yaml` for thresholds; else use the phase’s “Performance Targets.” Checks are opt-in: if neither `.opencode/perf.yaml` nor phase targets exist, perf checks are skipped without SPEC_GAP.
- Keep benchmarks opt-in with `/scaffold-perf`.

## Perf Tests Convention

- Directory: place perf tests under `tests/perf/` (preferred). The completer and perf tools will run only this directory when present, using minimal reporters and bail-fast.
- File pattern: name perf tests with `**/*.perf.*` to be auto-discovered when no dedicated directory exists.
- Tags: when your runner supports it (Vitest/Jest/Playwright), tag tests with `@perf` and the tools will filter to just these.
- Thresholds: define central thresholds in `.opencode/perf.yaml`. If absent, thresholds are enforced from the current phase’s “Performance Targets.”
- Outputs: logs are written to `./logs/perf.log`; exit code determines pass/fail.

## Troubleshooting Review Phase

- Checks-first behavior: `review-phase` always runs typecheck, lint, and tests via project scripts when available. Provide code context (explicit files/contents) for review; no git involved.
- Autodetect phase: If no argument is given, it reads `planning/roadmap.md` and follows the Active/Next link (e.g., `planning/phases/phase_7.md`).
- Common SPEC_GAPs:

  - Active/Next not found: "SPEC_GAP: Active/Next phase not found in planning/roadmap.md. Provide a phase number (e.g., `/review-phase 7`) or a file path."
  - Phase file missing: "SPEC_GAP: Phase file not found: <path>."
  - Checks failed to execute: includes the attempted command and stderr summary.

- Progress markers you should see: `RESOLVE_PHASE_START/DONE`, `CHECKS_START/DONE`, and for code context, `CODE_CONTEXT_START/CODE_CONTEXT_READY`.
- If it seems to hang: use `--quick` to skip checks and get immediate static feedback on code_context. Otherwise it’s usually waiting on checks; run your scripts directly (`npm run typecheck`, `npm run lint`, `npm test`), then re-run `review-phase`.

## Models & Tools

- Standard model: `github-copilot/gpt-5` across agents. `roadmap_planner` uses `github-copilot/gemini-2.0-flash` for faster normalization runs.
- Tool keys in agent files are plain names (`context7`, `svelte5`, `sentry`). Use wildcards only in `opencode.json` to mass-toggle tool families.
- Context7 API key is read from the environment as `CONTEXT7_API_KEY`. Ensure it's set locally and in CI before invoking features that rely on Context7.

## Example: .opencode/project.yaml (optional)

- Purpose: Provide machine-readable defaults for stack and conventions. Agents read this first; enforcement happens via your linters/CI.
- Example (Svelte/SvelteKit):

```
web:
  framework: sveltekit
  conventions:
    events:
      prefer: "onclick"
      disallow: ["on:", "onchange"]
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
