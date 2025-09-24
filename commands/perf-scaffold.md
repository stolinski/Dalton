---
description: Scaffold optional performance benches and scripts (do not run)
agent: perf_checker
---

Generate minimal, opt-in performance scaffolding without executing it:

- If ./.opencode/perf.yaml is missing, create it with commented examples and no thresholds by default.
- If no bench suites exist, add placeholders:
  - ./benchmarks/.gitkeep
  - ./scripts/run-benches.mjs (tinybench-compatible stub)
- If package.json lacks perf scripts, add commented suggestions for: perf:check, perf:api, perf:ui, perf:db

Do not set thresholds or run anything. Keep diffs minimal.
