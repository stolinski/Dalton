# Commands (global, minimal)

1. **/do-next-task**
   Orchestrator: select → prepare → implement → test → complete
   Input: JSON only. Provide `{ "task_id":"<id|auto>", "only":"<web|server|data|none>", "dry_run":<true|false> }`
   **ARGV first line (must print):**
   `ARGV {"task_id":"<id|auto>","only":"<web|server|data|none>","dry_run":<true|false>,"raw":"$ARGUMENTS"}`

2. **/synthesize-roadmap**
   Initialize/update roadmap with guidance; draft/apply
   **Flags**: `--guidance "<text>"`, `--guidance-file <path>`, `--language <locale>`, `--tone <style>`, `--review-only|--apply`

3. **/plan-phase <n?>**
   Create/update a phase file with guidance; draft/apply
   **Flags**: same as synthesize-roadmap

4. **/refresh-roadmap**
   Normalize/repair headings; fix Active/Next/Completed links

5. **/review-phase <n?>**
   Checks‑first + static review (no git)
   **Flags**: `--quick` (skip checks)

6. **/complete-phase <n?>**
   Finalize phase after verify

---

# Agents (global)

- **roadmap_resolver** — read `planning/roadmap.md`; resolve Active/Next links
  **Markers**: `PHASE_ACTIVE <n> <path>`, optional `PHASE_NEXT <n> <path>`

- **roadmap_normalizer** — fix headings/links; integer phases
  **Marker**: `NORMALIZED roadmap.md`

- **phase_loader** — parse `planning/phases/phase_<n>.md`; validate tasks
  **Markers**: `PHASE_FILE <n> <path>`, `TASKS <count>`

- **phase_planner** — generate/modify phase from guidance; draft/apply
  **Markers**: `DRAFT_READY path=planning/.drafts/phase_<n>.md` or `APPLIED planning/phases/phase_<n>.md`

- **task_selector** — choose next task (status > priority > sequence) or validate supplied id
  **Marker**: `SELECT p<n>-<seq> "<title>"`

- **context_preparer** — manifest → controlled expansion (≤40) → cache write/refresh
  **Markers**: `FILES <count>`, `CACHE <fresh|stale|missing> ./.opencode/cache/task-context/<task>.json`

- **impl_surface** — apply changes only to `resolved_files` (filtered by `ARGV.only`)
  **Marker**: `CHANGED <count>`

- **test_surface** — targeted tests map; write `./logs/test-impl.log`
  **Marker**: `TEST <pass|fail> log=./logs/test-impl.log`

- **complete_task** — mark completed ✓ with date; refuse unless verify OK
  **Marker**: `COMPLETE <task_id> date=<YYYY-MM-DD>`

**All agents** also print `START <agent> flow=<X> phase=<n> task=<id>` and `DONE <agent>`.
On breach: `IO_VIOLATION <path>` → stop. On unmet preconditions: `SPEC_GAP <reason>` → stop.

---

# Strict IO allowlists (per role)

- **roadmap_resolver**: `planning/roadmap.md` (read)
- **roadmap_normalizer**: `planning/roadmap.md` (read/write), `planning/phases/` (list)
- **phase_loader**: `planning/phases/phase_*.md` (read)
- **phase_planner**: `planning/phases/phase_<n>.md` (read/write), `planning/.drafts/` (write)
- **context_preparer**:

  - `planning/context/<task>.manifest.json` (read/write)
  - `planning/context/index.json` (read optional)
  - `planning/workspace_map.json` (read or project‑local create from global template)
  - `planning/phases/phase_*.md` (read inline manifest)
  - `.opencode/cache/task-context/<task>.json` (read/write)

- **impl_surface**: `.opencode/cache/task-context/<task>.json` (read), **only** `cache.resolved_files` (edit), `./logs/` (write)
- **test_surface**: `.opencode/cache/task-context/<task>.json` (read), nearest tests only, `./logs/` (write)
- **complete_task**: `planning/phases/phase_<n>.md` (read/write), `.opencode/cache/task-context/<task>.json` (read)

**Denied everywhere by default**: `.git/**`, `node_modules/**`, `.env*`, `secrets/**`, repo‑root `**` globs.

---

# ARGV rules (commands)

- Input: JSON only for orchestrators like `/do-next-task`.
  Guidance-style flags remain for planning commands.
- Defaults: `task_id="auto"`, `only="none"`, `dry_run=false`
- First printed line (all commands): the `ARGV {...}` JSON

---

# Task selection rubric (task_selector)

1. Status: `in_progress` > `pending` (ignore `blocked`, `completed`)
2. Priority: `High` > `Medium` > `Low` > unset
3. Sequence: ascending `p<n>-<seq>`

---

# Acceptance parsing (phase_loader)

- Each task row must expose **Acceptance** text.
- If missing for the candidate task → `SPEC_GAP acceptance missing for <task_id>`.

---

# Context preparation contract (context_preparer)

**Manifest resolution order**:

1. `planning/context/<task>.manifest.json`
2. Inline under the task in `phase_<n>.md` after line exactly: `Context Manifest:` then one path/glob per line
3. `planning/context/index.json` (map `<task>` → `{"files":[...]}`)
4. Fallback: `planning/workspace_map.json`; if missing, copy **project‑local** from global `.opencode/templates/workspace_map.template.json`, then proceed

**Controlled expansion** (concrete `resolved_files[]`):

- Allowed roots only:
  `src/routes/**`, `src/lib/**`, `src/lib/server/**`, `server/**`, `db/**`, `migrations/**`, `schema/**`
- Cap `resolved_files` ≤ 40
- Prefer file paths containing: `access`, `auth`, `authorize`, `permission`, `scope`, `workspace`, `member`, `policy`, `guard`, `route`, `api`
- If zero, include up to 10 nearest index/entry files inside allowed roots

**Cache write** (always refresh on run): see schema below; set `freshness: "fresh"`.

---

# Schemas (project‑local)

**Manifest** `planning/context/<task>.manifest.json`
`{"schema_version":1,"files":["<rel path or narrow glob>","..."],"source":"manual|inline|index|fallback"}`

**Cache** `.opencode/cache/task-context/<task>.json`

```
{
  "schema_version": 2,
  "flow_version": 1,
  "generated_at": "<ISO8601>",
  "phase": <n>,
  "task_id": "p<n>-<seq>",
  "title": "<task title>",
  "only": "web|server|data|none",
  "acceptance": "<text>",
  "manifest": { "files": [...], "source": "<...>" },
  "resolved_files": ["<concrete files only>"],
  "freshness": "fresh|stale",
  "VERIFY_OK": false
}
```

**Cache invalidation** (auto‑stale): schema/flow change; phase/title/acceptance/manifest diff; age > 7 days.

---

# Orchestrator flow (/do-next-task)

1. `@roadmap_resolver` → require `PHASE_ACTIVE <n> <path>`
2. `@phase_loader` → require `PHASE_FILE <n> <path>` and `TASKS <count>`
3. `@task_selector` (or validate provided id) → require `SELECT p<n>-<seq> "<title>"`
4. `@context_preparer <task_id> [only]` → require `FILES <n>` and `CACHE <state> <path>`
5. If `dry_run` is true: print `PHASE/TASK/CACHE/ONLY` and STOP
6. `@impl_surface <task_id> [only]` → require `CHANGED <m>` (≥1 unless notes‑only)
7. `@test_surface <task_id>` → require `TEST pass` (writes `./logs/test-impl.log`); on fail STOP
8. Set `VERIFY_OK=true` in project‑local cache
9. `@complete_task <task_id>` → require `COMPLETE <task_id> date=<YYYY-MM-DD>`

**Final summary (exact order):**
`PHASE: <n> <path>`
`TASK: <task_id> <title>`
`CACHE: <fresh|stale|missing> <path>`
`ONLY: <web|server|data|none>` (omit if none)
`DONE do-next-task`

**On missing marker:** `SPEC_GAP <which agent/marker>`.

---

# Review & testing (review-phase, test_surface)

**review-phase**:

- Runs typecheck/lint/tests (unless `--quick`)
- Static review uses **explicit** `resolved_files` (no repo scans)
- Emits concise summaries; no git usage

**test_surface**:

- Map changed/resolved files → nearest specs (preferred patterns: `*.test.*`, `*.spec.*`, or framework‑specific)
- Cap ≤ 30 specs; quiet reporters; bail‑fast
- Always write `./logs/test-impl.log` (truncate each run)

---

# Routing (impl_surface)

- If `resolved_files` include any of: `server/**` or `src/lib/server/**` → route to `server_impl`
- Else if only `db/**|migrations/**|schema/**` → `data_impl`
- Else if only `src/routes/**|src/lib/**` (non‑server) → `web_impl`
- Else → `fullstack_impl`
- If `only` is supplied in ARGV → filter `resolved_files` to that surface **before** routing

---

# Concurrency, idempotency, backups

- When writing cache/manifest/phase, write `*.tmp` then rename atomically
- Keep a single `planning/roadmap.md.bak` and `planning/phases/phase_<n>.md.bak` per run
- If lockfile `.opencode/cache/task-context/<task>.lock` exists and fresh (<10m), `SPEC_GAP: cache locked <task>`
- Impl agents must avoid duplicate insertions (check for idempotent markers/comments before writing)

---

# Audit & dry‑run

- **Dry‑run** (commands): run up to `context_preparer`; print `PHASE/TASK/CACHE/ONLY`; STOP
- **Audit** (optional flag `--audit` on orchestrator): append single‑line markers to `./logs/run.log` in project:
  `RUN <ISO> <command> phase=<n> task=<id> ...`

---

# Error taxonomy (examples)

- `SPEC_GAP missing Dalton project structure` (no `planning/roadmap.md`)
- `SPEC_GAP acceptance missing for <task_id>`
- `SPEC_GAP task <task_id> not found in phase_<n>.md`
- `SPEC_GAP no in_progress or pending tasks in phase_<n>.md`
- `SPEC_GAP workspace_map missing` (and template copy failed)
- `IO_VIOLATION <path>` (attempt to read/write outside allowlist)

---

# Drift & self‑heal

- Manual edits to `planning/roadmap.md` or `phase_<n>.md` → run `roadmap_normalizer` then `phase_loader` on next orchestrator call
- Manifest changes → `context_preparer` detects diff → rebuild cache and mark fresh
- Cache schema/version drift → auto‑stale and rewrite

---

# Initialization & migration flows

**New project**:

- `/synthesize-roadmap --review-only → --apply` (creates `planning/roadmap.md`)
- `/plan-phase 1 --review-only → --apply` (creates `planning/phases/phase_1.md`)
- `/do-next-task {"dry_run":true}` (auto‑copy `planning/workspace_map.json` from global template if missing; build fallback manifest + cache)
- `/do-next-task` (impl → test → complete)

**Existing project**:

- `/refresh-roadmap` (normalize headings/links/Active/Next)
- `/do-next-task {"dry_run":true}` (auto‑create missing manifest/cache; require Acceptance)
- `/do-next-task`

---

# Workspace map template (global → copied into project when first needed)

`planning/workspace_map.json` (project‑local result):

```
{
  "web_defaults": ["src/routes/**", "src/lib/**"],
  "server_defaults": ["src/lib/server/**", "server/**"],
  "data_defaults": ["db/**", "migrations/**", "schema/**"]
}
```

---

# Inline manifest block format (inside phase file, per task)

```
Context Manifest:
src/lib/server/authz.ts
src/routes/(app)/tasks/+page.svelte
db/migrations/**    # narrow glob within allowed roots
```

---

# Example outputs (happy path)

/do-next-task {"only":"server"}

```
ARGV {"task_id":"auto","only":"server","dry_run":false,"raw":"{\"only\":\"server\"}"}
PHASE_ACTIVE 1 planning/phases/phase_1.md
PHASE_FILE 1 planning/phases/phase_1.md
TASKS 12
SELECT p1-8 "Access control & scoping"
FILES 9
CACHE fresh ./.opencode/cache/task-context/p1-8.json
CHANGED 4
TEST pass log=./logs/test-impl.log
COMPLETE p1-8 date=2025-09-26
PHASE: 1 planning/phases/phase_1.md
TASK: p1-8 Access control & scoping
CACHE: fresh ./.opencode/cache/task-context/p1-8.json
ONLY: server
DONE do-next-task
```

/synthesize-roadmap --guidance "Add SSR perf, access control" --review-only

```
ARGV {"raw":"--guidance ... --review-only"}
DRAFT_READY path=planning/.drafts/roadmap_preview.md
DONE synthesize-roadmap
```

/plan-phase 2 --apply

```
ARGV {"raw":"2 --apply"}
APPLIED planning/phases/phase_2.md
DONE plan-phase
```

---

This is the complete, enforceable contract—commands, agents, IO, ARGV, markers, schemas, drift, init/migration, routing, testing, and examples—optimized for your global install and minimal command surface.
