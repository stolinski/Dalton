---
description: Create/update a phase file with guidance; draft/apply (dalton-2)
---

# ARGV

- Input: use raw $ARGUMENTS. Do not prompt.
- Recognized tokens:
  - <n> (bare integer)  # optional phase number
  - --review-only
  - --language <locale>
  - --tone <style>
  - --guidance "<text>"
  - --guidance-file <path>
- Defaults: review_only = false (i.e., APPLY by default); n = next integer if omitted.
- First line:
ARGV {"phase":"<n|auto>","review_only":<true|false>,"language":"<..>","tone":"<..>","guidance":"<..>","guidance_file":"<..>","raw":"$ARGUMENTS"}
- Print ARGV exactly once; never re-emit.

# IO Discipline

- Command orchestrates a planner agent; agent writes only in APPLY mode.
- No narration. Print only required markers.
- Never read or write outside `planning/**`.

# Mode

- If `--review-only` present → DRAFT mode:
  - Emit: DRAFT_READY path=planning/.drafts/phase_<n>.md
  - STOP.
- Else (default APPLY):
  - Create or overwrite `planning/phases/phase_<n>.md` (non-padded preferred).
  - Do not archive/rename other files.
  - Emit: APPLIED planning/phases/phase_<n>.md

# Flow

1) Resolve `<n>`:
   - If ARGV has bare integer → use it.
   - Else find the next integer after highest existing `planning/phases/phase_*.md`.
2) Accept guidance (priority: `--guidance` > `--guidance-file` > none).
3) Write phase file with: title, Scope, Active Tasks table (≤15), Completed, Risks, Interfaces, Performance Targets, DoD.

# Markers

- START plan-phase phase=<n>
- DRAFT_READY path=planning/.drafts/phase_<n>.md | APPLIED planning/phases/phase_<n>.md
- DONE plan-phase

# Failure handling

- SPEC_GAP phase file exists: planning/phases/phase_<n>.md (refuse overwrite unless explicit overwrite policy is already in your spec)
- SPEC_GAP guidance_file not found: <path>
- IO_VIOLATION <path>
