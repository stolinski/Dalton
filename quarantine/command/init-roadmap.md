---
description: Initialize a fresh roadmap from template
agent: roadmap_planner
---

Use the built-in ROADMAP_TEMPLATE embedded in the agent; optionally prefer ./.opencode/templates/ROADMAP_TEMPLATE.md when present.

Copy its structure into ./planning/roadmap.md.
- Include two initial “### Phase <n> — <Title>” skeleton sections seeded from command Goals/args when available (start numbering at 1 unless existing phase files dictate otherwise).
- Sections: Active Phase, Next Phase, Completed Phases.
- Do not link Active until a phase file exists. Next should point to the smallest-numbered existing phase file greater than Active when such a file exists; otherwise set it to the smallest missing integer and show the number (or link if the file exists). Completed starts empty.
