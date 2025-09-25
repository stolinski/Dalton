---
description: Synthesize or refresh roadmap from high-level goals
agent: roadmap_synthesizer
---

Goals:
$ARGUMENTS

Phases behavior:
- Create or update “### Phase <n> — <title>” sections within roadmap.md.
- Determine how many to add based on Goals/args and existing roadmap context; no fixed default count.
- Source titles from Goals/args; if missing, use existing phase headings.
- Start numbering at the current Next Phase number; preserve existing phase sections and append new ones contiguously.

Scan repo context and produce ./planning/roadmap.md with:
- Assumptions & Unknowns
- “### Phase <n> — <title>” sections (proposed phases), numbered contiguously:
  - Determine count based on provided Goals/args and existing roadmap context (no fixed default count).
  - Source titles primarily from the Goals/args; if missing, use existing phase headings to preserve intent.
  - If existing phase sections are present, preserve them; append new ones starting at the current Next Phase number.
  - Keep content lightweight (1–3 bullets max per phase) derived from Goals and repo context; avoid task-level detail.
- Active/Next/Completed sections remain as pointers (do not create or modify phase files).

No secondary goals file. Do not create phase files.

