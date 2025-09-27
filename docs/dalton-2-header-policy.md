Every agent file in `.opencode/agent/*.md` must begin with a complete front‑matter block that defines its execution mode, model, permissions, and tool access.

## Required Header Keys

Each agent file must include the following top-level keys in its front-matter:

- `description`: A one-line summary of the agent's purpose.
- `mode`: Must be `primary` (reserved for future extensions).
- `model`: Typically `github-copilot/gpt-5`.
- `temperature`: Floating point value between 0.0 and 1.0.
- `tools`: A map of boolean flags for tool access:
  - `read`: true | false
  - `write`: true | false
  - `edit`: true | false
  - `bash`: true | false
  - `context7`: true | false
  - `svelte5`: true | false
  - `sentry`: true | false
- `permission`: A map of scope-level permissions:
  - `edit`: allow | ask | deny
  - `bash`: allow | ask | deny

## Example Header

```yaml
---
description: "Run targeted tests mapped from changed/resolved files; write ./logs/test-impl.log"
mode: primary
model: github-copilot/gpt-5
temperature: 0.0
tools:
  read: true
  write: true
  edit: false
  bash: true
  context7: false
  svelte5: false
  sentry: false
permission:
  edit: deny
  bash: allow
---
```

## Policy Enforcement

Any missing or invalid keys will result in the agent being marked invalid.

A linter or audit tool may print:

- `AGENT_OK <path>` if valid
- `AGENT_BAD <path> <missing_keys>` if invalid

## Notes

- All headers must appear before any body content.
- Keys must be valid YAML.
- The `tools` and `permission` blocks must be explicit — no inherited or default values.
- Agents using `bash: true` must set `permission.bash = allow` explicitly.

This file governs the structure and execution metadata of all global OpenCode agents in this repository.
