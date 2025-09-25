---
description: Refresh (normalize and repair) the roadmap using the template; no file creation
agent: roadmap_planner
---

Refresh `./planning/roadmap.md` to align with the roadmap template and current repo state. This command is idempotent and safe to run after any manual edits.

What it does:
- Stable renumbering: Do NOT change existing integer phase numbers. Only promote fractional phases (e.g., 10.5 → 11) and shift subsequent integers upward as needed, preserving the relative order. Example: 10 stays 10; 10.5 becomes 11; existing 11→12, 12→13, etc. Never restart numbering at 1.
- Repair structure based on the template (prefer project override at `./.opencode/templates/ROADMAP_TEMPLATE.md`; else built-in):
  - Ensure sections exist and order: `## Active Phase`, `## Next Phase`, `## Completed Phases`.
  - Convert placeholder prose into markdown links when the target file exists.
  - Prefer non-padded phase filenames (e.g., `phase_1.md`) if present. If only a zero-padded file exists, use it; both forms are accepted.
  - Active: link to the smallest existing phase file; if none exist yet, leave a concise placeholder.
  - Next: set to the smallest integer greater than the current highest completed/active integer that is not in use; link only if a corresponding file exists.
  - Completed: list archive links that actually exist (descending). No archiving here.

Constraints:
- Do not create or archive phase files.
- Keep content concise; avoid task-level detail.

Implementation notes:
- Parse headings with `^###\s*Phase\s+(\d+(?:\.\d+)?)(?:\s*[-:]\s*)(.*)$`.
- Compute new numbers using a stable algorithm:
  1) Keep all integers as-is initially.
  2) For each fractional in ascending order, promote it to the next available integer greater than its floor, then increment any existing integers ≥ that slot by 1 (cascade).
  3) Preserve heading order and titles; update links accordingly.
- Rebuild the sections in memory and write once (idempotent).
- When constructing links, check for both `planning/phases/phase_<n>.md` and `planning/phases/phase_<nn>.md`; prefer non-padded when both exist.
- If parsing headings fails, still ensure the `Active/Next/Completed` sections exist and are normalized based on existing phase files; otherwise no-op with a clear message.
