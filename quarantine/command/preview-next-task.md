---
description: Preview the next task and cache status deterministically using a tool
agent: previewer
---

Arguments (JSON only):
- $ARGUMENTS must be a JSON object. Examples:
  - {}
  - {"task_id":"p7-3"}

Behavior:
- The agent will call the MCP tool opencode-phase.preview with the provided JSON.
- It will print exactly two lines based on the tool response:
  - TASK: <task_id> <title>
  - CACHE: <cache_status> <cache_path>

Notes:
- This command performs no repo reads. All logic lives in the tool.
- For human-friendly usage without JSON, consider adding a wrapper alias in your client to supply structured arguments.
