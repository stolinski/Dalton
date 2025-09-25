---
description: Phase-scoped review for roadmap/phase workflow (quality pass)
agent: quality_reviewer
---

Inputs:
- $ARGUMENTS: one of '', '7', 'phase_07.md', or 'planning/phases/phase_07.md'
- Flag: --quick (skip checks; perform static code_context review only)

Payload example (orchestrator → quality_reviewer):
- phase_path: planning/phases/phase_07.md
- phase_content: "...full markdown content..."
- code_context: [
    { path: "src/lib/foo.ts", content: "..." },
    { path: "src/routes/+page.svelte", content: "..." }
  ]
- checks: {
    typecheck: { status: "pass", summary: "tsc clean" },
    lint: { status: "warn", summary: "2 warnings" },
    tests: { status: "fail", summary: "1 failing test in cart.spec.ts" }
  }
- mode: "normal" | "no-block"

Arguments (positional; Phase by default):
- "": auto-detect the Active/Next phase from ./planning/roadmap.md
- "7": treat as Phase number → planning/phases/phase_07.md (fallback to phase_7.md if zero-padded file not found)
- "phase_07.md" or "planning/phases/phase_07.md": treat as explicit phase file

Resolution:
- If $ARGUMENTS is provided, resolve Phase/Path accordingly (no "Phase:" prefix required).
- Else, read ./planning/roadmap.md and resolve the Active/Next phase via its link to ./planning/phases/phase_<n>.md.
- Filename fallback: for numeric input N, prefer `planning/phases/phase_0N.md`; if missing, try `planning/phases/phase_N.md`.
- Echo: RESOLVE_PHASE_START / RESOLVE_PHASE_DONE (<path>)

Code context:
- Provide a focused set of files to review, not a git diff. No git usage anywhere.
- Preferred selection: files referenced by the current phase tasks; otherwise pass explicit paths.
- Payload must include `code_context` with { path, content } entries. Keep total ≤200KB and ≤10 files; truncate large files to the most relevant regions.
- Echo: CODE_CONTEXT_START / CODE_CONTEXT_READY (<files> files, <kb> total).

Checks (orchestrator; no git involved):
- Skip entirely in --quick mode.
- Otherwise, run Typecheck/Lint/Tests via project scripts; keep output minimal and attach summaries.
- Hard timeouts: 10s per check; on timeout, set mode=no-block and continue with static review.
- Echo: CHECKS_START / CHECKS_DONE (typecheck/lint/tests status)

Agent input payload (must provide to quality_reviewer):
- phase_path: resolved path to the phase file (e.g., `planning/phases/phase_07.md`).
- phase_content: full content of the resolved phase file (inline string; do NOT make the agent read it).
- code_context: array of { path, content } for files under review (no git diff; explicit content only).
- checks: object with { typecheck: {status, summary}, lint: {status, summary}, tests: {status, summary} }.
- mode: "normal" or "no-block" (set to no-block when checks timed out/unavailable).

Constraints for agent call:
- Do NOT ask the agent to read the repo. Provide phase_content and code_context directly; only allow agent reads if it explicitly asks for a specific file.
- Keep payload under 200KB for code_context and 50KB for logs; truncate noisy logs to short summaries.

Failure modes (fail fast with SPEC_GAP):
- If roadmap missing or Active/Next link not found: "SPEC_GAP: Active/Next phase not found in planning/roadmap.md. Provide a phase number (e.g., `/review-phase 7`) or a file path."
- If resolved phase file does not exist: "SPEC_GAP: Phase file not found: <path>."
- If checks cannot be executed (no runner found), include the command attempted and stderr summary.
- If no code_context provided: "SPEC_GAP: No code context provided. Pass an explicit list of files and contents to review."
- Fallback (no-block mode): If checks timeout or are unavailable, proceed with static review of the resolved phase file and code_context and return a SPEC_GAP note about missing checks instead of hanging.

Return:
- Blocking vs non-blocking issues
- 1–3 tiny safe refactors
- Explicit test gaps
- Summary of typecheck/lint/test results (failures first)
- Observations tied to provided code_context (per file where relevant)

No re-planning. No external docs.

Implementation notes (for orchestrator):
- Parse `$ARGUMENTS`; do not expect labeled input.
- Strict: Avoid repo-wide Grep/Glob. Only read roadmap/phases for resolution.
- Checks: run typecheck, lint, and tests via project scripts when available; keep output minimal and attach summaries. Hard timeouts: 10s per check.
- Code context: build `code_context` from the files relevant to the phase tasks or explicit paths. Do not use git. Cap to ≤10 files/≤200KB.
- Ignore dirs: node_modules/, .git/, dist/, build/, .next/, .svelte-kit/, .cache/, coverage/, .turbo/, .pnpm-store/, vendor/.
- Timeouts: Each tool step must complete within 5–15s. On timeout, proceed with no-block static review and include SPEC_GAP note rather than hanging.
- Progress echoes: print these markers to stdout so users see activity:
  - RESOLVE_PHASE_START / RESOLVE_PHASE_DONE (<path>)
  - CHECKS_START / CHECKS_DONE (typecheck/lint/tests status)
  - CODE_CONTEXT_START / CODE_CONTEXT_READY (<files> files, <kb> total)
- Dry-run: If a positional arg is provided, echo the resolved inputs before running.
