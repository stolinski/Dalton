---
description: Create a new Changeset entry (single or multi-package)
agent: project_initializer
---

Create a changeset file in `./.changeset/` without publishing or versioning.

Flags (optional):
- --from <git-ref>            # infer changed packages since ref (e.g., main)
- --packages pkgA,pkgB        # explicit packages (monorepo) or omit for single package repo
- --bump patch|minor|major    # default: infer from Conventional Commits (feat=>minor, fix/chore=>patch, BREAKING=>major); fallback patch
- --summary "..."              # description; if omitted, create a TODO placeholder
- --dry-run                   # print the file content and path without writing

Behavior:
- Ensure `./.changeset/` exists; require config only if present (do not auto-install).
- Determine package list via `--packages`, or by scanning `packages/*/package.json`, or default to root package.
- Generate a filename `<timestamp>-<slug>.md` with frontmatter mapping:
  ---
  "pkg-a": minor
  "pkg-b": patch
  ---
  
  <summary>

- If `--dry-run`, output the proposed file and stop.
