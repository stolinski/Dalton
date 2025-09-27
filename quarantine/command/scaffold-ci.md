---
description: Scaffold optional GitHub Actions CI (disabled by default)
agent: project_initializer
---

Generate a minimal CI workflow without enabling it by default:

- Ensure `./.github/workflows/` exists.
- Write `./.github/workflows/ci.yml` with `on: workflow_dispatch` and commented examples for `push`/`pull_request`.
- Jobs:
  - `build-and-test` (ubuntu-latest):
    - Setup Node 20
    - Detect package manager (pnpm > yarn > npm) based on lockfiles
    - Install deps (ci-friendly)
    - Run `lint` if script exists
    - Run `test` (or `test:run`) if script exists
    - Run `perf:check` if script exists

Implementation details:
- Use guarded shell checks for script existence, e.g.:
  - run: |
      node -e "const s=require('./package.json').scripts||{}; if(s.lint) process.exit(0); process.exit(1)" && npm run -s lint
- Prefer pnpm if `pnpm-lock.yaml` exists; else yarn if `yarn.lock`; else npm.
- Keep the file small and easy to modify.
