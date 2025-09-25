---
description: Initialize a fresh roadmap from template
agent: roadmap_planner
---

Use the built-in ROADMAP_TEMPLATE embedded in the agent; optionally prefer ./.opencode/templates/ROADMAP_TEMPLATE.md when present.

Copy its structure into ./planning/roadmap.md.
- Include two initial “### Phase <n> — <Title>” skeleton sections seeded from command Goals/args when available (start numbering at 1 unless existing phase files dictate otherwise).
- Sections: Active Phase, Next Phase, Completed Phases.
- Do not link Active until a phase file exists. Set Next to the smallest integer not present as a file (show number or link if file exists). Completed starts empty.
