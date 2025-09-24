---
description: Implement a single backend task (runtime-agnostic)
agent: server_impl
---

Read ./planning/phases/phase\_<n>.md. Implement task: {{input}}.

Runtime/lib:

- If ./.opencode/project.yaml declares server, use it.
- Else auto-detect (node/bun/deno) and prefer an existing server lib already in deps.

Requirements:

- ESM, native fetch, async/await; validate inputs; explicit errors.
- Unknown APIs → verify, then implement.
- Write unit tests for handlers/services; integration only for critical flows.
