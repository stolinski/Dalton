---
description: Implement a single data/migration task (ORM/SQL-agnostic)
agent: data_impl
---

Read ./planning/phases/phase\_<n>.md. Implement task: {{input}}.

Data layer:

- If ./.opencode/project.yaml declares data, use it.
- Else auto-detect (drizzle/prisma/knex/raw-sql).

Requirements:

- Forward-only migrations; parametrized queries; idempotent backfills.
- Document up/down shape and runtime considerations.
- Add minimal tests that hit repository/integration layer.
