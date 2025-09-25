---
description: Implement a single task (auto-detect stack; may delegate)
agent: fullstack_impl
---

Flags (optional):
- --only <surface>   # one of: web | server | data
- --dry-run          # show intended changes without writing files

Read ./planning/phases/phase\_<n>.md. Implement task with ID: $ARGUMENTS. Parse the task's title and acceptance criteria from the phase file rather than requiring the title in the command input.

Stack resolution:

- If ./.opencode/project.yaml exists, respect its web/server/data/tests.
- Else auto-detect from configs/deps (e.g., svelte/next/vue, fastify/express/hono, drizzle/prisma/knex, vitest/jest/playwright).

Behavior:
- If --dry-run is set, output a summary of intended changes (files to touch, tests to adjust) and stop.
- If --only is set, restrict implementation to that surface and add a short note in the task’s Notes on remaining work for other surfaces.
- Testing during implementation must be targeted-only (related files/tags) with minimal output redirected to `./logs/test-impl.log`. Do not run full suites unless explicitly requested or required by acceptance criteria.

Rules:

- ESM, Node ≥ 20 when Node is present, native fetch, snake_case.
- Verify unknown APIs with minimal runnable snippets before coding.
- Write/update tests alongside code when appropriate (or use /write-tests for dedicated test authoring).
- On completion, move the task row to “Completed ✓” with date.
