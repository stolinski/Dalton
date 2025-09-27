---
description: Create/update a phase file with guidance; draft/apply (dalton-2)
---

# Usage

`/plan-phase <n?> [--guidance|--guidance-file|--language|--tone] [--review-only|--apply]`

# Behavior

- Determine target phase number from argument `<n?>` or roadmap Next.
- Generate or modify `planning/phases/phase_<n>.md` using guidance and templates.
- Draft vs apply:
  - Review only: write preview to `planning/.drafts/phase_<n>.md` → `DRAFT_READY path=planning/.drafts/phase_<n>.md`
  - Apply: write to `planning/phases/phase_<n>.md` → `APPLIED planning/phases/phase_<n>.md`

# Flags

- `--guidance "<text>"`, `--guidance-file <path>`, `--language <locale>`, `--tone <style>`, `--review-only|--apply`

# Markers

- `ARGV {"raw":"$ARGUMENTS"}`
- `DRAFT_READY path=planning/.drafts/phase_<n>.md` or `APPLIED planning/phases/phase_<n>.md`
- `DONE plan-phase`

# IO Rules

- Read/write only `planning/phases/phase_<n>.md` and `planning/.drafts/`.

# Example

```
ARGV {"raw":"2 --apply"}
APPLIED planning/phases/phase_2.md
DONE plan-phase
```