---
description: Diagnose summarization/verification loops and context bloat; write logs/loop-diagnostics.md
agent: loop_diagnostics
---

Flags (optional):
- --deep              # include broader file scans and longer excerpts
- --max-lines <n>     # limit per-file excerpt length (default 200)

Run a non-destructive diagnostics pass to identify why executions stall in summarization/verification loops:

- Inspect roadmap, phase files, and recent logs in ./logs for loop patterns
- Check command/agent specs for conflicting guidance (e.g., reflow rules, read/write loops, unclear selection). If project-local ./command or ./agent are missing, fall back to ~/.config/opencode/{command,agent} and do not treat absence as a root cause (downgrade to info).
- Identify context bloat risks (oversized planning files, too many bullets, multiple active phases)
- Ensure ./logs exists (create if missing). Produce a concise report at ./logs/loop-diagnostics.md with root causes, evidence, and actionable remediation steps; print the exact report path after writing

No files are modified outside of creating/updating the diagnostics report.
