# Dalton-2 Schemas (project-local contracts)

Manifest `planning/context/<task>.manifest.json`

- `{ "schema_version": 1, "files": ["<rel path or narrow glob>", "..."], "source": "manual|inline|index|fallback" }`

Cache `.opencode/cache/task-context/<task>.json`

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

Cache invalidation

- Auto-stale when schema/flow changes, phase/title/acceptance/manifest diff, or age > 7 days.
