---
description: Normalize/repair roadmap headings and links; fix Active/Next/Completed (dalton-2)
---

# Purpose

Stabilize `planning/roadmap.md` formatting and links. No file creation.

# Behavior

- Fix headings to integer phases; rebuild Active/Next/Completed pointers.
- Prefer existing non‑padded filenames `phase_<n>.md`; accept zero‑padded when necessary.
- Single‑pass IO: read once, compute, write once.

# Markers

- Always print: `ARGV {"raw":"$ARGUMENTS"}`
- Success: `NORMALIZED roadmap.md`
- End: `DONE refresh-roadmap`

# IO Rules

- Read/write only `planning/roadmap.md`; list `planning/phases/`.

# Notes

- Idempotent and safe after manual edits.
