---
description: Ensure GitHub Actions CI exists and is up-to-date (idempotent)
agent: project_initializer
---

Create or update `.github/workflows/ci.yml` using managed blocks, preserving custom edits.

Flags (optional):
- --enable push,pr             # enable triggers; default: workflow_dispatch only
- --node "18,20"               # Node matrix; default: 20
- --workspaces                 # monorepo install strategy
- --lint, --no-lint            # include/exclude lint step if script exists
- --perf, --no-perf            # include/exclude perf:check if script exists
- --dry-run                    # print diff without writing

Behavior:
- Detect package manager via lockfiles (pnpm > yarn > npm).
- Detect scripts in package.json and conditionally include steps.
- Use managed sections delimited by:
  # opencode-managed:start
  ...
  # opencode-managed:end
  Only update content within managed blocks.
- Preserve existing custom steps outside managed blocks.
