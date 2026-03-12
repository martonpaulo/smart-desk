# Smart Desk

Smart Desk is a local-first productivity workspace.

## Core Architecture

Data flow is strictly:

UI -> Local SQLite (PowerSync database) -> Sync engine -> Supabase PostgreSQL

Rules enforced in this repository:

- UI reads and writes local data only
- no direct Supabase access from UI modules
- feature-first structure under `src/features`
- strict TypeScript with typed interfaces and no `any`
- absolute imports via `@/`

## Current Stack

- Next.js (App Router)
- React
- TypeScript (strict)
- Tailwind CSS
- Radix UI + shadcn/ui
- TanStack Query
- PowerSync

## Workspace Structure

Project structure evolves frequently.
Avoid hardcoded tree snapshots in this README and use local tooling when a current tree view is needed.

## Development

```bash
pnpm install
pnpm dev
```

## Testing Status

Testing is intentionally deferred in this phase.

The project will use the following in upcoming iterations:

- Vitest (unit)
- Testing Library (component)
- Playwright (e2e)

## Notes

- Next.js App Router requires `default` exports in route files such as `page.tsx` and `layout.tsx`.
- Feature modules should otherwise prefer named exports.
