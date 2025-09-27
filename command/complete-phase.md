---
description: Finalize phase after verify (dalton-2)
---

# Usage

`/complete-phase <n?>`

# Behavior

- Finalize phase after verification passes; no re‑planning here.
- Update roadmap pointers appropriately.

# Markers

- Always print: `ARGV {"raw":"$ARGUMENTS"}`
- Print completion: `COMPLETE_PHASE_DONE (<n>)`
- End: `DONE complete-phase`

# IO Rules

- Mutates only planning files; writes logs to `./logs/`.
