# Phase $N – $TITLE

## Scope

- <Key capability 1>
- <Key capability 2>
- <Key capability 3>

## Active Tasks

| ID    | Task             | Priority | Status      | Notes / Acceptance Criteria    |
| ----- | ---------------- | -------- | ----------- | ------------------------------ |
| p$N-1 | Implement X      | H        | pending     | Matches contract + passes test |
| p$N-2 | Add Y middleware | M        | in_progress | Works in dev + SSR mode        |

## Completed ✓

| ID    | Task            | Completed  |
| ----- | --------------- | ---------- |
| p$N-0 | Bootstrap setup | 2025-09-21 |

## Key Decisions

- **Auth**: Using `@drop-in/pass` via `hooks.server.ts` – avoids custom JWT middleware.
- **DB strategy**: All schema changes go through Drizzle migrations.

## Risks & Mitigations

- **Zero sync fails offline** → Add fallback to `localStorage`
- **Stripe webhooks misfire** → Use test mode locally via `stripe listen`

## Interfaces

```ts
interface UserAuth {
  id: string;
  email: string;
  created_at: number;
}
```
