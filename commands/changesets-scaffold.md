---
description: Scaffold Changesets config and optional scripts (no installs)
agent: project_initializer
---

Create or update a minimal Changesets setup:

- Ensure `./.changeset/` exists.
- Write `./.changeset/config.json` (overwrite if exists) with sensible defaults:
  {
    "$schema": "https://unpkg.com/@changesets/config@2.3.1/schema.json",
    "changelog": ["@changesets/cli/changelog", {"repo": "<fill-me>"}],
    "commit": false,
    "access": "public",
    "baseBranch": "main",
    "updateInternalDependencies": "patch",
    "ignore": []
  }
- Create `./.changeset/README.md` explaining how to create a changeset and release.
- If `package.json` exists, add (or merge) npm scripts without removing existing ones:
  - "changeset": "changeset"
  - "version-packages": "changeset version"
  - "release": "changeset publish"

Notes:
- Do not install dependencies. Leave package installation to the user.
- If you detect a monorepo (e.g., `packages/*`), keep config generic; do not guess package access.
