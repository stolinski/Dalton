---
description: Refresh (normalize and repair) the roadmap using the template; no file creation
agent: roadmap_planner
---

Refresh `./planning/roadmap.md` to align with the roadmap template and current repo state. This command is idempotent and safe to run after any manual edits.

What it does:
- Renumber Phase headings to a contiguous integer sequence (preserving numbers prior to the first decimal; promoting fractional phases; shifting subsequent ones).
- Repair structure based on the template (prefer project override at `./.opencode/templates/ROADMAP_TEMPLATE.md`; else built-in):
  - Ensure sections exist and order: `## Active Phase`, `## Next Phase`, `## Completed Phases`.
  - Convert placeholder prose into markdown links when the target file exists.
  - Prefer non-padded phase filenames (e.g., `phase_1.md`) if present. If only a zero-padded file exists, use it; both forms are accepted.
  - Active: link to the smallest existing phase file; if none exist yet, leave a concise placeholder.
  - Next: set to the next integer after Active; link only if a corresponding file exists.
  - Completed: list archive links that actually exist (descending). No archiving here.

Constraints:
- Do not create or archive phase files.
- Keep content concise; avoid task-level detail.

Implementation notes:
- Single-pass, idempotent update: parse headings with `^###\s*Phase\s+(\d+(?:\.\d+)?)(?:\s*[-:]\s*)(.*)$`, compute the new sequence, and rebuild the three sections in memory, then write once.
- When constructing links, check for both `planning/phases/phase_<n>.md` and `planning/phases/phase_<nn>.md`; prefer non-padded when both exist.
- If parsing headings fails, still ensure the `Active/Next/Completed` sections exist and are normalized based on existing phase files; otherwise no-op with a clear message.
