---
description: Implement a single frontend task (framework-agnostic)
agent: web_impl
---

Read ./planning/phases/phase\_<n>.md. Implement task: $ARGUMENTS.

Framework:

- If ./.opencode/project.yaml declares web, use it.
- Else auto-detect (svelte/react/vue) from configs/deps.

Requirements:

- Minimal deps; native fetch; avoid CSS unless requested.
- For unknown APIs, verify then code.
- Produce component/route code and focused tests with the project runner.
- During implementation, run only targeted UI tests (related files/tags) with minimal output redirected to `./logs/test-impl.log`. Do not run the full suite unless explicitly requested or required.
