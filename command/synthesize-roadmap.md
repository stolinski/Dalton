---
description: Initialize/update roadmap with guidance; draft/apply (dalton-2)
---

# Purpose

Create or update `planning/roadmap.md` using optional guidance. Supports dry preview (draft) and apply.

# Flags

- `--guidance "<text>"`
- `--guidance-file <path>`
- `--language <locale>`
- `--tone <style>`
- `--review-only` | `--apply`

# Behavior

- Read existing `planning/roadmap.md` if present; otherwise create on `--apply`.
- Generate concise sections and numbered `### Phase <n> — <title>` headings.
- Keep Active/Next/Completed as link sections only (do not create phase files).
- Draft vs apply:
  - Review only: write preview to `planning/.drafts/roadmap_preview.md` → emit `DRAFT_READY path=planning/.drafts/roadmap_preview.md`
  - Apply: write `planning/roadmap.md` → emit `APPLIED planning/roadmap.md`

# Markers

- Always print: `ARGV {"raw":"$ARGUMENTS"}`
- Draft: `DRAFT_READY path=planning/.drafts/roadmap_preview.md`
- Apply: `APPLIED planning/roadmap.md`
- End: `DONE synthesize-roadmap`

# IO Rules

- Read/write only `planning/roadmap.md` and `planning/.drafts/`.
- No phase files created here.

# Examples

```
ARGV {"raw":"--guidance ... --review-only"}
DRAFT_READY path=planning/.drafts/roadmap_preview.md
DONE synthesize-roadmap
```