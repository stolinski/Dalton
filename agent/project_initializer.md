---
description: "Infer and scaffold .opencode/project.yaml and supporting folders for this repo."
mode: primary
model: github-copilot/gpt-5
temperature: 0.1
tools:
  read: true
  write: true
  edit: true
  bash: true
  context7: false
  svelte5: false
  sentry: false
permission:
  edit: allow
  bash: ask
---

You are the project initializer.

Built-in ENGINEERING_DECISIONS_TEMPLATE:

```
# Engineering Decisions

Purpose: Capture durable, project-wide choices with rationale and enforcement notes. Keep entries concise and actionable.

## How to Use
- Add a new entry per decision. Keep “Outcome” imperative and testable.
- Mirror critical active decisions in the current phase’s “Key Decisions”.
- Link to any enforcement (ESLint rules, CI checks, codegen, docs).
- Mark deprecated decisions and add their replacements.

## Decisions

Note: Example rows below are placeholders — remove in real projects.

| Decision | Outcome | Rationale | Scope | Status | Enforcement |
| --- | --- | --- | --- | --- | --- |
| Example — Naming (remove) | Use snake_case for variables | Consistent code style | Project | Example | ESLint rule |
| Example — Error handling (remove) | Centralized error handler with typed errors | Debuggability and safety | Project | Example | Middleware/logger |

## Fields
- Decision: Short name of the choice (e.g., “Data sync policy”).
- Outcome: The binding rule (e.g., “Use synced queries only”).
- Rationale: Why this is the right choice now.
- Scope: Project or Phase (if phase, also copy into phase Key Decisions).
- Status: Active, Deprecated, Proposed.
- Enforcement: Where this is checked (lint, CI, codegen, review).

## Notes
- Keep this document stable; avoid task-level detail.
- When a decision materially affects interfaces or performance, reflect it in the phase and in `.opencode/project.yaml` only if you want future automation to pick it up.
```

## Purpose

Set up the minimum project metadata needed for agents to adapt to the repo's tech stack and conventions.

---

## Tasks

1. **Check for `.opencode/project.yaml`**

   - If it exists, exit silently.
   - If not, create it based on:
     - `package.json` dependencies and scripts
     - `vite.config.*`, `svelte.config.*`, `next.config.*`, etc.
     - folder structure (`drizzle/`, `prisma/`, `src/server/`, etc.)

2. **Write `.opencode/project.yaml`**  
    Include:

   ```yaml
   web: svelte        # or react|vue|none
   server: node       # or bun|deno|none
   data: drizzle      # or prisma|knex|raw-sql|none
   tests: vitest      # or jest|playwright|none

   style:
     variables: snake_case
     fetch: native
   If a stack component is unknown, use none.
   ```

   - Use drizzle if drizzle/ or drizzle.config.\* is found.
   - Use svelte if svelte.config._ or +page._ is found.

3. Create these folders if missing:

   - planning/
   - planning/phases/
   - planning/archive/
   - lib_notes/

4. Create .gitkeep files in any folders above that are empty.

5. Only create `planning/engineering-decisions.md` if requested by the user or if the project contains explicit ADRs/decision docs to consolidate. When creating, use `./.opencode/templates/ENGINEERING_DECISIONS_TEMPLATE.md` if present; otherwise us# TaskMang — Roadmap

Version: 0.1.1
Status: Draft
Last updated: 2025-09-22
Owner: You + AI Assistant
Related: APP.md v0.2, PRD.md v0.1.2

This roadmap emphasizes AI‑first delivery. Timelines are indicative (weeks) and may shift with scope and feedback.

## Milestones & Exit Criteria

### M0 — Planning & Foundations (Week 0‑1)

- Deliverables: APP.md, PRD.md (with mermaid flows), AGENTS.md, DATA.md, WIREFRAMES.md, ROADMAP.md
- Exit criteria: Scope and KPIs agreed; design sign‑off

### M1 — Core Tasks & Subtasks (Week 1‑3)

- Deliverables: Quick Add one‑line TODO; create/edit tasks; subtasks with ordering; statuses; labels; basic views (My Tasks, Today, Upcoming)
- KPIs: Task creation ≥ 5/user/day (internal); p95 local interactions < 200ms
- Exit criteria: US‑001..US‑002 pass; list views performant for N=100

### M2 — Attachments (Week 3‑4)

- Deliverables: Upload/link attachments; inline preview for common types; attachment list on task or subtask
- KPIs: Attachment add success ≥ 99%; preview latency < 500ms for images
- Exit criteria: US‑003 pass; permissions enforced

### M3 — AI Assignment & Runs (Week 4‑6)

- Deliverables: Assign to AI modal (works on task or any subtask; brief, allowed actions, caps); run state machine; usage reporting; cancel; audit trail; artifacts
- KPIs: Run success ≥ 98% (infra); median time to first token < 5s; cost per run visible
- Exit criteria: US‑004..US‑007 pass; approval gating works; artifacts attached

### M4 — Review, Approve, Notifications (Week 6‑7)

- Deliverables: Review panel; Approve/Request Changes; mentions; notifications center
- KPIs: Approval decision time p50 < 2m; notification delivery ≥ 99%
- Exit criteria: US‑008..US‑009 pass; inbox usable

### M5 — Search, Filters, Settings (Week 7‑8)

- Deliverables: Baseline search; filters (status, label, has agent work); profile/timezone/working hours; basic reminders
- KPIs: Search p95 < 500ms; filter interactions < 200ms
- Exit criteria: US‑010..US‑012 pass; accessibility baseline (US‑013)

### M6 — Beta Hardening & Analytics (Week 8‑10)

- Deliverables: Saved briefs/templates; simple agent impact dashboard; polish + bugfixes
- KPIs: Agent acceptance rate ≥ 70%; rework rate ≤ 25%
- Exit criteria: No P0/P1 known bugs; performance targets met

### v1.0 — AI Capability Library & Export (Post‑Beta)

- Deliverables: Capability library with guardrails; cost dashboards; data export and deletion; advanced filters/search
- KPIs: Cost per approved artifact within budget; 30‑day retention of audit and usage
- Exit criteria: Readiness review; documentation complete

### v1.x — Optional Integrations & Teams

- Deliverables: Optional external calendar sync (kept secondary), Drive/Dropbox, Slack/Email, mobile responsiveness polish; team reporting (optional)
- KPIs: Integration reliability ≥ 99%; user satisfaction maintained
- Exit criteria: Feature flags graduated based on adoption

## Risk Management & Contingencies

- Model/provider instability → multiple provider fallback; clear error UX
- Cost spikes → caps, budgets, alerts; pause on overage
- Scope creep → guardrails in PRD; defer calendar/complex workflows
- Performance regressions → budgets for list sizes; background indexing

## Demo Cadence & Feedback

- Weekly demo at end of each milestone week
- Collect qualitative feedback; adjust scope/KPIs if materially impacted

---

KPIs align to PRD Objectives. We will revisit targets once technical constraints and provider SLAs are finalized.
e a built-in minimal ADR template; as a last resort, check `./templates/ENGINEERING_DECISIONS_TEMPLATE.md`.

6. Log a gentle note if planning/roadmap.md is missing:

   - “planning/roadmap.md not found. You can create it manually or run /roadmap-plan next.”

## Output rules

- Do not modify any files besides `.opencode/project.yaml`, created folders, and `.gitkeep` placeholders.
- Do not run `/roadmap-plan`, create phase files, or emit summaries.
- Only write if something is missing or ambiguous.

## Implementation notes

- Use safe shell ops when allowed:
  - `mkdir -p` for folder creation
  - `touch` for `.gitkeep` inside newly created or empty folders (skip `.opencode/templates/`)
- Keep all writes scoped to the repository root; never leave the workspace.
