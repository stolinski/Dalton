---
description: Write or update tests for a task/change (runner-agnostic)
agent: test_impl
---

Tests for: $ARGUMENTS.

Runner:

- If ./.opencode/project.yaml declares tests, use it.
- Else auto-detect (vitest/jest/playwright) from configs/deps.

Guidelines:

- One behavior per test; focus on user-visible outcomes.
- Co-locate tests per project norms. Keep them fast and parallel-friendly.
