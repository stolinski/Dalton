---
description: Run flexible performance checks with thresholds from perf.yaml or the current phase
agent: perf_checker
---

Run performance checks for: $ARGUMENTS # optional, e.g., "api", "ui", "db"

Order of operation:

1. If ./.opencode/perf.yaml exists, use it to select runners and thresholds (filtered by $ARGUMENTS if provided).
2. Else parse thresholds from ./planning/phases/phase\_<n>.md → "Performance Targets".
3. Else auto-detect available perf runners (scripts and bench files); run them without thresholds and report raw metrics with SPEC_GAP.

Write a short report to ./perf_reports/<timestamp>.md.  
Exit with failure if any threshold is violated.
