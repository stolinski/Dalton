---
description: Align Dalton meta AI files to expected structure (non-destructive)
agent: dalton_fixer
---

Flags (optional):
- --dry-run            # plan and print changes only
- --with-diagnostics   # also generate loop diagnostics report
- --apply              # apply safe, curated remediations automatically
- --max-lines <n>      # when generating diagnostics, cap per-file excerpt length (default 200)
- --scaffold-locals    # OPT-IN: scaffold local commands/agents/templates if missing (defaults to off; prefer globals)
- --cleanup            # explicit cleanup of local meta files previously scaffolded by Dalton Fixer (docs-only)

Align this repo's Dalton meta AI files to the expected structure used by the opencode agents, without changing intent. By default, prefer global opencode commands/agents/templates and DO NOT scaffold local copies unless --scaffold-locals is provided:

- Normalize planning/roadmap.md structure while preserving all phase bodies verbatim
- Prefer global ROADMAP_TEMPLATE; do not create local `.opencode/templates/ROADMAP_TEMPLATE.md` unless `--scaffold-locals` is provided
- Ensure planning/phases/ and planning/archive/ directories exist
- Verify command files exist: command/refresh-roadmap.md, command/synthesize-roadmap.md, command/do-next-task.md, command/debug-loops.md (quarantined; points to agent/loop_diagnostics.md), command/fix-dalton.md (only scaffold locally with --scaffold-locals)
- Verify agent files exist: agent/roadmap_planner.md, agent/roadmap_synthesizer.md, agent/loop_diagnostics.md (only scaffold locally with --scaffold-locals)

Constraints
- Non-destructive: never delete user content; never reduce number of phase blocks
- Single-pass IO per file; abort-on-loss safety checks
- Minimal edits: add missing sections/files; reorder only if strictly necessary

Diagnostics and auto-remediation
- If --with-diagnostics or --apply is set, run a loop diagnostics pass and write ./logs/loop-diagnostics.md. If ./logs does not exist, create it.
- If --apply is set, automatically apply SAFE remediations only:
  - Normalize phase headings; preserve bodies verbatim
  - Ensure Active/Next/Completed sections and pointers; set Active when exactly one phase file exists
  - Create missing template/directories; only scaffold minimal local command/agent files when --scaffold-locals is provided
  - Update do-next-task rule to prioritize Active or the smallest phase file
  - Add single-pass IO + abort-on-loss guardrails to roadmap-related commands/agents
- After execution, always print a one-line confirmation with the exact report path(s): ./logs/fix-dalton-report.md and ./logs/loop-diagnostics.md (when generated)

Implementation notes
- Use the hardened heading matcher and renumbering rules from roadmap_planner
- Treat each phase as a verbatim block; only adjust heading lines and section pointers
- Prefer non-padded phase file names; accept zero-padded if only option exists
- Respect existing global opencode configuration; do not duplicate global meta files locally unless explicitly asked with --scaffold-locals
- --cleanup (docs-only): when provided, list the local meta files previously scaffolded by this fixer and propose safe deletions; requires explicit confirmation before removal in any future implementation
