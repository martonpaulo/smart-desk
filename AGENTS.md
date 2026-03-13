# Smart Desk — Agent Guidelines

Guidelines for AI agents working on the Smart Desk codebase.

This project follows a **local-first architecture** with **offline-first data synchronization**.

Agents must respect the architecture described below.

---

# Architecture Overview

Smart Desk is a productivity workspace application.

The architecture is **local-first**:

Client UI never depends directly on the server.

Data flow:

UI
↓
Local SQLite database
↓
Sync engine
↓
PostgreSQL (Supabase)

Tools used:

- React 19
- Next.js 15+
- TypeScript (strict)
- Tailwind CSS
- Radix UI
- shadcn/ui
- PowerSync
- SQLite (local)
- Supabase (PostgreSQL)
- TanStack Query
- React Hook Form
- Zod
- Playwright
- Vitest
- Sentry

---

# Core Principles

## 1 Local First

UI must read and write **only to the local database**.

Never call Supabase directly from UI.

Correct flow:

User action
↓
Write local SQLite
↓
UI updates instantly
↓
PowerSync syncs to backend

---

## 2 Strict TypeScript

Rules:

- strict mode enabled
- never use `any`
- always define types
- use named exports only
- prefer interfaces
- define a props type/interface before the component; avoid inline prop typing in component signatures

---

## 3 Absolute Imports

Use aliases only.

Correct:

```
import { TaskCard } from "@/features/tasks/components/TaskCard"
```

Never:

```
../../../TaskCard
```

---

## 4 Feature-Based Architecture

Code must be organized by feature.

Example:

```
features/
tasks/
components/
hooks/
logic/
types/
```

Never organize by file type globally.

---

## 5 UI Guidelines

UI stack:

- Tailwind CSS
- Radix UI primitives
- shadcn/ui components

Do not introduce other UI libraries.

---

## 6 Drag and Drop

Kanban must use:

```
@dnd-kit
```

---

## 7 Forms

Forms must use:

- React Hook Form
- Zod validation

---

## 8 Testing

Mandatory tools:

Unit tests: Vitest
Component tests: Testing Library
E2E tests: Playwright

Agents must ensure tests pass before completing tasks.

---

## 9 Code Size

Guidelines:

- prefer files under 300 lines
- split logic into hooks
- isolate domain logic

---

## 10 Performance

Rules:

- avoid unnecessary renders
- use memoization when needed
- virtualize large lists
- lazy-load heavy modules

---

## 11 Separation of Concerns

Keep clear boundaries between layers:

- UI: rendering and interaction only
- Business logic: feature/domain rules only
- Data layer: persistence and synchronization concerns only

Do not mix data access or domain rules directly inside presentational components.

---

## 12 Reusability

Prefer small, focused, reusable functions and components.

Rules:

- single responsibility per function/component
- compose from smaller units instead of large monoliths
- extract repeated logic into hooks or utility modules

---

## 13 Constants and Design Tokens

Never hardcode colors, sizes, spacing values, or other magic numbers/strings in feature code.

Rules:

- use Tailwind design tokens and theme scales for UI values
- use named constants for domain thresholds, limits, and timing values
- use named constants for non-trivial string literals (statuses, provider names, header keys, routes, error codes, table names)
- keep shared constants in dedicated modules close to their feature or in shared utils when cross-feature

---

# Common Mistakes (Forbidden)

❌ Calling Supabase directly from UI
❌ Using global state for server data
❌ Using `any`
❌ Adding large UI frameworks
❌ Writing sync logic manually
❌ Mixing UI, business logic, and data concerns in the same module
❌ Building oversized, non-reusable components/functions
❌ Hardcoding colors, sizes, spacing, magic numbers, or domain magic strings
❌ Hardcoding the project tree in `README.md`

---

# Documentation

- Do not hardcode the project tree in `README.md`.
- If structure documentation is needed, keep it high-level or reference commands that generate the current tree.

---

# Sync Layer

Data synchronization is handled by:

PowerSync

It manages:

- local SQLite database
- background sync
- conflict resolution
- offline mode

Never implement custom sync logic.

---

# Project Structure

```
smart-desk

apps/
web/

packages/
ui/
db/
features/
utils/
types/

supabase/
migrations/
```

---

# Commit Convention

Use Conventional Commits.

Examples:

```
feat: add kanban drag and drop
fix: resolve task sync issue
refactor: simplify planner logic
docs: update architecture documentation
```

---

# Security

Always validate user input.

Use:

- Zod validation
- Supabase Row Level Security
