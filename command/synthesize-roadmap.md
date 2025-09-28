---
description: Initialize/update roadmap with guidance; draft/apply (dalton-2)
---

# ARGV

- Input: use raw $ARGUMENTS. Do not prompt.
- Recognized tokens:
  - --review-only
  - --language <locale>
  - --tone <style>
  - --guidance "<text>"
  - --guidance-file <path>
- Defaults: review_only = false (i.e., APPLY by default); language/tone empty; guidance empty.
- First line:
ARGV {"review_only":<true|false>,"language":"<..>","tone":"<..>","guidance":"<..>","guidance_file":"<..>","raw":"$ARGUMENTS"}
- Print ARGV exactly once; never re-emit.

# IO Discipline

- This command does not mutate files directly; it orchestrates a planner agent that may write when in APPLY mode.
- No narration. Print only required markers.
- Never read or write outside `planning/**`.

# Mode

- If `--review-only` present → DRAFT mode:
  - Emit: DRAFT_READY path=planning/.drafts/roadmap_preview.md
  - STOP.
- Else (default APPLY):
  - Write/merge `planning/roadmap.md`.
  - Ensure an explicit **Active Phase** link exists if Phase 1 is present:
    `Active Phase: [Phase 1 — …](planning/phases/phase_1.md)` (if missing, insert).
  - Emit: APPLIED planning/roadmap.md

# Flow

1) Accept guidance (priority: `--guidance` > `--guidance-file` > none).
2) Generate/merge sections: Goals, Scope, Principles, Phases (numbered), Links.
3) Maintain the `Active | Next | Completed` summary table if present.
4) Never touch `planning/phases/**`.

# Markers

- START synthesize-roadmap
- DRAFT_READY path=planning/.drafts/roadmap_preview.md | APPLIED planning/roadmap.md
- DONE synthesize-roadmap

# Failure handling

- SPEC_GAP guidance_file not found: <path>
- SPEC_GAP cannot write planning/roadmap.md
- IO_VIOLATION <path>
