# Smart Desk — Agent Guidelines

A comprehensive guide for AI agents working on the Smart Desk monorepo project.

## 🏗️ Project Overview

Smart Desk is a productivity application built with a modern architecture using TypeScript and Next.js. The project follows a feature-oriented structure with strict linting, formatting, and type safety.

### Architecture
- **App**: Next.js 15 with App Router, Material-UI v7, TypeScript
- **State Management**: Zustand with custom synced entity stores
- **Data Fetching**: TanStack Query v5
- **File Storage**: Cloudinary integration

## 🎯 Core Principles

### TypeScript Standards
- **Strict Mode**: Always use strict TypeScript configuration
- **No `any` Types**: Avoid `any` at all costs; always provide proper typing
- **Named Exports Only**: Use named exports exclusively (no default exports)
- **Absolute Imports**: Use `src/*` alias instead of relative paths like `../`
- **Type Safety**: Leverage TypeScript's type system for better code quality
- **No Relative Exports**: Never use relative exports (e.g., `export * from './Component'`), always use absolute imports

### Code Organization
- **Feature-Oriented**: Organize code by features, not by file types
- **Colocation**: Keep related files together (components, hooks, stores, types)
- **Separation of Concerns**: Clear boundaries between UI, business logic, and data
- **Composability**: Small, reusable functions and components
- **File Length**: Prefer files to be 300 lines or less for better maintainability and readability

### State Management
- **Zustand**: Preferred solution for global state management
- **Local State**: Use React state for component-specific data
- **Synced Stores**: Use custom `createSyncedEntityStore` for Supabase integration
- **Avoid Global State**: Only use global state when necessary

## 📋 Coding Standards

### React Components
```typescript
// ✅ DO: Use function syntax with named exports
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  return <div>{prop1}</div>;
}

// ❌ DON'T: Use arrow functions for components
const ComponentName = ({ prop1, prop2 }: ComponentProps) => {
  return <div>{prop1}</div>;
};

// ❌ DON'T: Use default exports
export default function ComponentName() {}

// ❌ DON'T: Import React (React 19 doesn't require it)
import React from 'react';

// ✅ DO: Direct imports without React
import { useState, useEffect } from 'react';
```

### Import Organization
```typescript
// ✅ DO: Follow the configured import order
import { NextRequest } from 'next/server';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { useFilesStore } from 'src/features/file/store/useFilesStore';
import { File } from 'src/features/file/types/File';
import { PageSection } from 'src/core/components/PageSection';

import './Component.css';
```

### TypeScript Patterns
```typescript
// ✅ DO: Define proper interfaces
interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  tagId?: string | null;
}

// ✅ DO: Use type guards
function isTask(item: unknown): item is Task {
  return typeof item === 'object' && item !== null && 'id' in item;
}

// ✅ DO: Use generic types for reusable patterns
interface EntityStore<T extends Base> {
  items: T[];
  add: (item: Omit<T, 'id'>) => Promise<void>;
  update: (id: string, updates: Partial<T>) => Promise<void>;
}
```

### 🎨 UI/UX Guidelines (Material-UI v7)

- **Components**: Use MUI components exclusively for consistency
- **Theming**: Leverage theme tokens, never hardcode colors or sizes
- **Responsive Design**: Desktop-first approach (not mobile-optimized)
- **Target Platform**: Desktop browsers only - direct mobile users to native app
- **Accessibility**: Follow WCAG 2.1 guidelines
- **Deprecated Props**: Use `inputProps` instead of `InputProps`

### File Cleanup After Optimization
**⚠️ CRITICAL**: When finishing optimization work that creates new improved versions of components, you MUST:

1. **Replace old components**: Move optimized components to replace the original ones
2. **Rename components**: Remove "Optimized" prefixes and use original names (e.g., OptimizedEventList → EventList)
3. **Update imports**: Update all import statements to use the new component locations
4. **Remove old files**: Delete the old unused files to keep the codebase clean
5. **Move supporting files**: Move skeleton components and utilities to appropriate locations
6. **Test build**: Ensure the build still works after cleanup

This maintains clean code organization and consistent naming conventions throughout the project.

### Documentation Updates
**⚠️ CRITICAL**: When making any changes that are documented in README.md or should be documented because they are important, you MUST:

1. **Update README.md**: Always update the README.md file to reflect the changes
2. **Include relevant details**: Add configuration changes, new features, deployment updates, environment variables, etc.
3. **Keep documentation current**: Ensure all instructions and examples remain accurate
4. **Verify completeness**: Check that all necessary information is documented

This ensures the project documentation stays current and helps other developers understand the changes.

## Code Quality Checks
- **ESLint**: Must pass all linting rules
- **Prettier**: Code must be properly formatted
- **TypeScript**: No type errors allowed
- **Import Sorting**: Imports must follow the configured order

## Commit Standards
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```bash
feat: add user authentication system
fix: resolve calendar sync issue
docs: update API documentation
refactor: simplify task filtering logic
```

## 🏛️ Feature Development

### Store Pattern
```typescript
// Use the custom synced entity store for Supabase integration
export const useFeatureStore = createSyncedEntityStore<FeatureType>({
  table: 'feature_table',
  requiredFields: ['name', 'description'],
  defaults: {
    status: 'active',
  },
});
```

### Component Patterns
```typescript
// Use PageSection for consistent page layouts
export function FeatureView() {
  return (
    <PageSection title="Feature Name">
      <FeatureContent />
    </PageSection>
  );
}

// Use proper error boundaries and loading states
export function FeatureComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['feature'],
    queryFn: fetchFeature,
  });

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography>Error: {error.message}</Typography>;
  if (!data) return <Typography>No data found</Typography>;

  return <FeatureContent data={data} />;
}
```

## 🚫 Common Pitfalls to Avoid

### TypeScript Issues
- ❌ Using `any` types
- ❌ Implicit `any` from untyped functions
- ❌ Missing type annotations on function parameters
- ❌ Using `@ts-ignore` without proper justification

### React Issues
- ❌ Using arrow functions for components
- ❌ Missing dependency arrays in useEffect
- ❌ Mutating state directly
- ❌ Using default exports

### Architecture Issues
- ❌ Deep relative imports (`../../../`)
- ❌ Mixing business logic in UI components
- ❌ Creating global state when local state suffices
- ❌ Not following the feature-oriented structure

### Code Quality Issues
- ❌ Not running linting before commits
- ❌ Inconsistent naming conventions
- ❌ Large, monolithic components
- ❌ Files exceeding 300 lines (prefer breaking into smaller files)
- ❌ Missing error handling
- ❌ Using relative exports instead of absolute imports
- ❌ Importing React when not needed (React 19)
- ❌ Keeping unused components in codebase
- ❌ Mixing styles with component code in React Native

## 🔍 Code Review Checklist

### Before Submitting
- [ ] All TypeScript errors resolved
- [ ] ESLint passes without warnings
- [ ] Prettier formatting applied
- [ ] All imports properly sorted
- [ ] No `any` types used
- [ ] Files are 300 lines or less (prefer smaller files)
- [ ] Proper error handling implemented
- [ ] Loading states handled
- [ ] Accessibility considerations addressed

### Architecture Review
- [ ] Follows feature-oriented structure
- [ ] Uses appropriate state management pattern
- [ ] Components are properly composed
- [ ] Business logic separated from UI
- [ ] Types are properly defined
- [ ] No unnecessary global state

## 📚 Key Dependencies

### Web Application
- **Next.js 15**: React framework with App Router
- **Material-UI v7**: Component library
- **TanStack Query v5**: Data fetching and caching
- **Zustand**: State management
- **Supabase**: Backend services
- **Cloudinary**: File storage

### Development Tools
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting

## 🎯 Best Practices

### Performance
- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with dynamic imports
- Use TanStack Query for efficient data fetching

### Maintainability
- Write clear, self-documenting code
- Add comments for complex business logic
- Keep components small and focused
- Use meaningful variable and function names

### Testing
- Write tests for critical functionality
- Test user interactions and edge cases
- Mock external dependencies appropriately
- Ensure tests are deterministic

### Security
- Validate all user inputs
- Use proper authentication patterns
- Sanitize data before rendering
- Follow OWASP security guidelines

---

**Remember**: Always prioritize code quality, type safety, and maintainability. When in doubt, follow the existing patterns in the codebase and ask for clarification rather than making assumptions.
