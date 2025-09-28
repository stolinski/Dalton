---
description: Create/update a phase file with guidance; draft/apply (dalton-2)
---

# ARGV (non-interactive)
- Input: use raw $ARGUMENTS. Do not prompt.
- Recognized:
  - <n> (bare integer)
  - --review-only
  - --language <locale>
  - --tone <style>
  - --guidance "<text>"
  - --guidance-file <path>
- Defaults: review_only=false (APPLY by default); language/tone/guidance empty.
- First line:
ARGV {"phase":"<n|auto>","review_only":<true|false>,"language":"<..>","tone":"<..>","guidance":"<..>","guidance_file":"<..>","raw":"$ARGUMENTS"}
- Print ARGV exactly once; no narration.

# Resolution (strict precedence)
1) If a bare integer `<n>` is present in ARGV → use it.
2) Else, read `planning/roadmap.md` and, if a "Next Phase" link exists → use its `<n>`.
3) Else, auto-pick: `n = 1` if no phases exist; otherwise `n = max(existing) + 1`.

# Mode
- If `--review-only` → write `planning/.drafts/phase_<n>.md`
  - Emit: `DRAFT_READY path=planning/.drafts/phase_<n>.md` and STOP.
- Else (default APPLY) → write `planning/phases/phase_<n>.md` (non-padded preferred).
  - Emit: `APPLIED planning/phases/phase_<n>.md`

# IO Discipline
- Command does not shell/exec anything. No external CLIs.
- Agents do any writing; this command only orchestrates them.
- No reads/writes outside `planning/**`.

# Markers (in order)
START plan-phase phase=<n>
[DRAFT_READY path=...] | [APPLIED planning/phases/phase_<n>.md]
DONE plan-phase

# Failure handling
- SPEC_GAP phase file exists: planning/phases/phase_<n>.md
- SPEC_GAP guidance_file not found: <path>
- IO_VIOLATION <path>
