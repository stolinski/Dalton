---
description: "Check/repair planning invariants (dalton-2)"
model: github-copilot/gpt-5
temperature: 0.0
tools:
  read: true
  write: true
  edit: true
  bash: false
permission:
  edit: allow
  bash: deny
---

Role
- Validate and, when --autofix is present, REPAIR planning invariants so execution can proceed.

Inputs
- Flag: --autofix (boolean). If false, report only.

IO allowlist
- R/W: planning/roadmap.md
- R/W: planning/phases/phase_*.md
- R/W: planning/.drafts/**
- R:   .opencode/templates/**
- R/W: .opencode/cache/last-completed.json
- R:   planning/archive/phase_*.md (read-only)
- Forbidden: any src/**, server/**, tests/**, repo-root globs. On breach: IO_VIOLATION <path> and STOP.

Checks & Repairs (in this order)

1) Active link
- Read planning/roadmap.md.
- If it contains `Active Phase: [..](planning/phases/phase_<n>.md)` and file exists → OK.
- Else, list planning/phases/phase_*.md, pick smallest n:
  - If none: SPEC_GAP unrecoverable: no phase files
  - If --autofix: insert/fix Active link to smallest n; record fix `active_link_set=<n>`.
  - Else: record pending `active_link_missing`.

2) Next link (optional)
- If roadmap has Next link to non-existent file:
  - If --autofix: remove Next; record `next_link_removed`.
  - Else: record `next_link_broken`.

3) Promote drafts
- For any planning/.drafts/phase_<n>.md with no planning/phases/phase_<n>.md:
  - If --autofix: move draft to planning/phases/; record `draft_promoted=<n>`.
  - Else: record `draft_present=<n>`.

4) Canonical phase heading
- For each phase file: first H1 must be `# Phase <n> — <title>` (em dash).
- If mismatched dash/format:
  - If --autofix: replace heading in-place; record `heading_normalized=<n>`.
  - Else: record `heading_noncanonical=<n>`.

5) Active Tasks table presence
- If a phase lacks an “Active Tasks” table with header including `| ID |`:
  - If --autofix: create minimal table with headers and seed a completed planning row `p<n>-0`; record `active_table_seeded=<n>`.
  - Else: record `active_table_missing=<n>`.

6) Status normalization
- Normalize per-row Status to one of: completed | in_progress | pending | blocked (lowercase).
- Map common variants: “In Progress”→in_progress, “Pending”→pending, “Done/Completed ✓/Complete”→completed, “Blocked/On Hold”→blocked.
- If --autofix: rewrite the Status cell text; record `status_normalized=<n>`.
- Else: record `status_needs_normalization=<n>`.

7) Completed sync
- For each phase: any row with Status `completed` must have a line under **Completed ✓** section:
  `| <id> | <title> | <YYYY-MM-DD> |`
- If missing:
  - If --autofix: append with today’s date (local); record `completed_synced=<n>:<id>`.
  - Else: record `completed_missing_in_section=<n>:<id>`.

8) Split/duplicate tables
- If a phase has multiple “Active Tasks” tables or split sections:
  - If --autofix: merge rows into a single Active Tasks table in original order; record `active_table_merged=<n>`.
  - Else: record `active_table_split=<n>`.

9) Task ID sanity
- Ignore rows whose ID does not match `^p\d+-\d+$`.
- If --autofix: insert a one-line note after the row:
  `> NOTE: Non-conforming task ID ignored by selectors.` and record `id_flagged=<n>`.
- Else: record `id_malformed=<n>`.

10) Cache hint (optional)
- If .opencode/cache/last-completed.json missing and any completed row exists:
  - If --autofix: write `{"task_id":"<last_id>","phase":<n>,"completed_at":"<ISO>"}`; record `last_completed_seeded=<id>`.
  - Else: record `last_completed_missing`.

Output
- If no findings → `HEALTH ok`
- If repairs applied → `HEALTH repaired: <fix1>, <fix2>, ...` (comma-separated)
- If any unrecoverable condition → `SPEC_GAP unrecoverable: <reason>`

Markers
- START invariant_checker
- One of: HEALTH ok | HEALTH repaired: ... | SPEC_GAP unrecoverable: ...
- DONE invariant_checker

Discipline
- Atomic writes (tmp + rename) for roadmap and phase files.
- Do not change task titles or acceptance text.
- Do not renumber phases or rewrite task IDs (only flag malformed).
