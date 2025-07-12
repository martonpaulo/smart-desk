# AGENTS

This project uses **TypeScript**, **Next.js (App Router)**, and **MUI (Material UI)** for UI components.

## Workflow Guidelines

- Run `npm run lint` after any code changes
- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages
  Example:
  - `feat: add user login screen`
  - `fix: resolve session timeout bug`

- Keep the code clean, readable, and well-organized
- Add comments in English when logic is complex or non-obvious

## Coding Standards

Write code with:

- ✅ Best practices in React and TypeScript
- ✅ Clear and consistent naming conventions
- ✅ Proper separation of concerns
- ✅ Readable and maintainable structure

## Code Style Rules

| Rule                         | Description                                                  |
| ---------------------------- | ------------------------------------------------------------ |
| ✅ `export function`         | Always use named exports with function syntax                |
| 🚫 `const Component = () =>` | Do not use arrow functions for components                    |
| ✅ Absolute imports          | Never use relative paths like `../`                          |
| 🚫 `any` types               | Avoid at all costs — always type properly                    |
| 🚫 `import React` manually   | Not required in modern setups                                |
| 🎨 Theme-driven design       | Use theme tokens — never hardcode colors or sizes            |
| ✅ Material UI only          | Prefer built-in components and icons from MUI                |
| ✅ Good UX writing           | Use clear, helpful labels and naming                         |
| ✅ Break up large files      | Split into smaller, focused components if needed             |
| ✅ React Query v5            | For data fetching and caching                                |
| ✅ Axios                     | For HTTP requests                                            |
| ✅ Zustand                   | Preferred solution for global state management               |
| ✅ React Compiler            | Automatic memoization - avoid manual `useMemo`/`useCallback` |

### Additional Guidelines

For MUI components, `InputProps` is deprecated. Use `inputProps` instead.

---

Always write code with maintainability and scalability in mind. Think ahead, comment smartly, and cover edge cases.
