---
description: Infer and scaffold .opencode/project.yaml and folders based on project structure
agent: project_initializer
---

If `.opencode/project.yaml` does not exist, create it.

- Detect stack: web (svelte/react/vue), server (node/bun/deno), data (drizzle/prisma/knex), tests (vitest/jest/playwright)
- Detect style: snake_case, native fetch
- Output result as valid YAML at `.opencode/project.yaml`

Also:

- Create these folders if missing:
  - `planning/phases/`
  - `planning/archive/`
  - `lib_notes/`
- Add `.gitkeep` files to any that are empty

Do **not** generate roadmap or phase files.  
Only create metadata + folder structure.
