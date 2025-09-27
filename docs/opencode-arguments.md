# OpenCode Agent Instructions

Use this for all command templates that rely on `$ARGUMENTS`. This ensures consistent argument parsing, task selection, and IO behavior.

---

## 🧠 Global Contract

- You receive a **raw string** via `$ARGUMENTS`.
- You **must parse it** and emit this as your first line:
  ```text
  ARGV {"task_id":"<id|auto>","only":"<web|server|data|none>","raw":"$ARGUMENTS"}
  ```

````

- Use only this parsed JSON object for decision making. Never re-parse `$ARGUMENTS`.

---

## 🧩 Argument Grammar

Recognized tokens (order-agnostic):

- `--only <web|server|data>`
- `<task_id>` like `p7-3` (matches `/^p\d+-\d+$/`)

Rules:

- Unknown tokens = ignore.
- If `task_id` is present, override auto-selection.
- If missing or invalid, set `task_id: "auto"`, `only: "none"`.

---

## 🧭 Phase Resolution

Find the current phase using this order:

1. If `planning/roadmap.md` has `Active Phase: planning/phases/phase_<n>.md`, use it.
2. Else, pick the **smallest `n`** with a matching file in `planning/phases/`, supporting both `phase_<n>.md` and `phase_<nn>.md` (prefer non‑padded).
3. If multiple exist, proceed with smallest `n` and note the invariant violation.
4. If **none exist**, emit:

   ```text
   SPEC_GAP: missing phase files
   ```

   Then STOP.

---

## ✅ Task Selection

From `planning/phases/phase_<n>.md`, choose the top task using:

1. `status`: `in_progress` > `pending` (ignore `blocked`)
2. `priority`: `High` > `Medium` > `Low` > unset
3. `sequence`: lowest `p<n>-<seq>` first

If `ARGV.task_id !== "auto"`, select that ID directly.
If it's not found, emit:

```text
SPEC_GAP: task <task_id> not found in phase_<n>.md
```

---

## 🗂️ Task Context Cache

- Path: `./.opencode/cache/task-context/<task_id>.json`
- If it exists and is marked `"freshness": "fresh"`, use it.
- Otherwise, build it via the `context_preparer` step within `/do-next-task` (no standalone prepare command in the minimal spec).

---

## 🛠️ Implementation Rules

- If `ARGV.only !== "none"`:

  - Scope work to that surface (`web`, `server`, or `data`).
  - Add a brief “Notes” line under the task describing what remains.

- Parse and implement the task based on its `Title` and `Acceptance Criteria`.

- Create `./logs` if needed, and run **only targeted tests**.

  - Redirect output to:

    ```text
    ./logs/test-impl.log
    ```

- After success:

  - Move the task to `Completed ✓` in the phase file.
  - Add today’s date.

---

## 🛡️ IO Safety

- Read/write only what’s necessary for the current step.
- **DO NOT**:

  - List or read unrelated directories like `src/**`, `server/**`, `lib/**`
  - Expand globs
  - Invoke other commands/agents unexpectedly

If a file is missing or something cannot proceed, emit a `SPEC_GAP` message and STOP.

---

## 🧾 Output Contract

- First line: parsed JSON

  ```text
  ARGV {...}
  ```

- Always include (after):

  - `PHASE: <n> planning/phases/phase_<n>.md`
  - `TASK: <task_id> <title>`
  - `CACHE: <fresh|stale|missing> ./.opencode/cache/task-context/<task_id>.json`
  - If scoped: `ONLY: web` or similar

If no task is available or an invariant fails, emit a clear one-liner like:

```text
SPEC_GAP: no in_progress or pending tasks in phase_<n>.md
```

---

## 🧪 Error Handling

| Condition          | Output                                                      |
| ------------------ | ----------------------------------------------------------- |
| Unparseable args   | `ARGV { task_id: "auto", only: "none", raw: "$ARGUMENTS" }` |
| Task not found     | `SPEC_GAP: task <task_id> not found in phase_<n>.md`        |
| No eligible tasks  | `SPEC_GAP: no in_progress or pending tasks in phase_<n>.md` |
| Phase file missing | `SPEC_GAP: missing phase files`                             |
| Cache build fails  | `SPEC_GAP: cannot prepare cache for <task_id>`              |

---

## 💬 Example Invocations

```bash
/impl
/impl p7-3
/impl --only server
/impl --only web p3-2
```

```text
ARGV {"task_id":"p7-3","only":"server","raw":"--only server p7-3"}
PHASE: 7 planning/phases/phase_7.md
TASK: p7-3 Create SSO Login
CACHE: fresh ./.opencode/cache/task-context/p7-3.json
ONLY: server
```

---

## 📌 Template Stub

Paste this at the top of `.opencode/command/*.md` files:

```md
---
description: Implement next prioritized task
agent: fullstack_impl
---

# First line must output:

# ARGV {"task_id":"<id|auto>","only":"<web|server|data|none>","raw":"$ARGUMENTS"}

$ARGUMENTS

# Follow global contract: phase resolution → task selection → context cache → implementation.

# Respect IO safety, output contract, and emit SPEC_GAP on any invariant break.
```
````
