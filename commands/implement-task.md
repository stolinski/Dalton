---
description: Implement a single task (auto-detect stack; may delegate)
agent: fullstack_impl
---

Read ./planning/phases/phase\_<n>.md. Implement task: {{input}}.

Stack resolution:

- If ./.opencode/project.yaml exists, respect its web/server/data/tests.
- Else auto-detect from configs/deps (e.g., svelte/next/vue, fastify/express/hono, drizzle/prisma/knex, vitest/jest/playwright).

Rules:

- ESM, Node ≥ 20 when Node is present, native fetch, snake_case.
- Verify unknown APIs with minimal runnable snippets before coding.
- Write/update tests alongside code.
- On completion, move the task row to “Completed ✓” with date.
