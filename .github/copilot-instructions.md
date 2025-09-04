# KNYH Development Instructions

> **GitHub Copilot Agent Guidelines**  
> This file contains essential patterns, conventions, and architecture details for the KNYH recipe management application. Use these guidelines to ensure consistent, high-quality code generation that follows project standards.

## Project Overview
KNYH is a modern recipe management application built with Next.js 15, designed with dual architecture support (SQLite database + static export). It's a Progressive Web App with offline capabilities, internationalization, and a clean component-based architecture.

**Key Architecture Principle**: The app must work in both database mode (SQLite) and static export mode (JSON files). Always consider both modes when implementing features.

## Copilot Code Generation Guidelines

### File Creation Patterns
When creating new files, follow these patterns:

**Components** (`src/components/custom/`):
```tsx
'use client' // Only if using hooks/state

import { type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

type MyComponentProps = {
  children?: ReactNode
  className?: string
}

/**
 * Component description
 * @param props - Component props
 */
export default function MyComponent({ children, className }: MyComponentProps) {
  const t = useTranslations('common')
  
  return (
    <div className={className}>
      {children}
    </div>
  )
}
```

**Hooks** (`src/hooks/`):
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isStaticExport } from '@/lib/data-config'

export function useMyHook() {
  return useQuery({
    queryKey: ['my-data'],
    queryFn: async () => {
      if (isStaticExport) {
        // Static mode implementation
        return fetchFromJSON()
      }
      // Database mode implementation
      return fetchFromDB()
    },
  })
}
```

**Pages** (`src/app/`):
```tsx
import { PageLayout } from '@/components/custom'
import { getTranslations } from 'next-intl/server'

type PageProps = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function MyPage({ params, searchParams }: PageProps) {
  const t = await getTranslations('pages.myPage')
  
  return (
    <PageLayout title={t('title')}>
      {/* Page content */}
    </PageLayout>
  )
}
```

### Import Order (Enforce Strictly)
1. React imports
2. Next.js imports  
3. External library imports
4. Internal UI components (`@/components/ui/`)
5. Internal custom components (`@/components/custom/`)
6. Internal hooks (`@/hooks/`)
7. Internal utilities (`@/lib/`, `@/types/`)
8. Relative imports

### Code Generation Rules
1. **Always use TypeScript** - No plain JavaScript files
2. **Use 'use client' directive** only when necessary (hooks, state, browser APIs)
3. **Internationalization is mandatory** - Use `useTranslations()` or `getTranslations()` for all text
4. **Handle both modes** - Check `isStaticExport` for dual architecture features
5. **Export pattern** - Add new components to `src/components/custom/index.ts`
6. **Error handling** - Always include error states in data components
7. **Loading states** - Use Suspense or loading indicators for async operations

## Technology Stack
- **Framework**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: SQLite (Better-SQLite3) with JSON fallback for static export
- **State Management**: TanStack Query, Zustand
- **UI/UX**: Motion (animations), DND Kit (drag & drop)
- **Internationalization**: next-intl (English/Hungarian)
- **PWA**: Serwist service worker
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── api/                # API routes
│   └── [routes]/           # Feature-specific pages
├── components/             
│   ├── ui/                 # Shadcn/Radix UI components (DO NOT EDIT)
│   ├── custom/             # Application-specific components
│   │   └── index.ts        # Barrel exports for all custom components
│   ├── AuthGuard.tsx       # Auth wrapper component
│   └── ServiceWorkerRegistration.tsx
├── hooks/                  # Custom React hooks
│   ├── index.ts            # Barrel exports
│   ├── use-recipes.ts      # Recipe data management
│   ├── use-tags.ts         # Tag management
│   └── use-*.ts            # Feature-specific hooks
├── lib/                    # Core utilities and logic
│   ├── database.ts         # SQLite operations
│   ├── data-config.ts      # Environment detection (static vs DB)
│   ├── types.ts            # TypeScript definitions
│   └── utils.ts            # General utilities
├── providers/              # React context providers
└── i18n/                   # Internationalization setup
```

## Naming Conventions

### Files & Folders
- **Components**: PascalCase (`RecipeCard.tsx`)
- **Hooks**: kebab-case with `use-` prefix (`use-recipe-form.ts`)
- **Pages**: kebab-case (`edit-recipe/`)
- **Utilities**: kebab-case (`data-config.ts`)
- **Types**: kebab-case (`recipe-types.ts`)

### Code
- **Components**: PascalCase with default export
- **Hooks**: camelCase starting with `use`
- **Types/Interfaces**: PascalCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Variables/Functions**: camelCase

## Coding Conventions

### Component Structure
```tsx
'use client' // Only if needed

import { type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
// External imports first, then internal imports

type ComponentProps = {
  children: ReactNode
  // Use 'type' for props, 'interface' for extensible objects
}

/**
 * Component description with JSDoc
 * Include behavior notes for static vs DB mode if relevant
 */
export default function Component({ children }: ComponentProps) {
  // Hooks first
  // Event handlers
  // Render logic

  return <div>{children}</div>
}
```

### Hook Patterns
```tsx
// Use TanStack Query for data fetching
export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
    // Include error handling
  })
}

// Use mutations for data updates
export function useRecipeMutations() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}
```

### Dual Architecture Pattern
**CRITICAL**: The app supports both SQLite database and static export modes:

- **Static Mode**: Data stored in `public/data/data.json`
- **Database Mode**: Data stored in SQLite database
- **Detection**: Use `isStaticExport` from `@/lib/data-config`
- **Data Layer**: Abstract database operations in separate functions

**Copilot Rule**: When implementing data operations, always provide both implementations:

```tsx
import { isStaticExport } from '@/lib/data-config'

async function getRecipes() {
  if (isStaticExport) {
    // Read from JSON file
    const response = await fetch('/data/data.json')
    const data = await response.json()
    return data.recipes
  }
  
  // Database operation
  return await db.recipe.findMany()
}
```

**Authentication Pattern**:
```tsx
function MyComponent() {
  // Static mode = no auth needed
  if (isStaticExport) {
    return <MainContent />
  }
  
  // Database mode = require auth
  return (
    <AuthGuard>
      <MainContent />
    </AuthGuard>
  )
}
```

## Key Patterns

### Component Exports
- All custom components must be exported from `src/components/custom/index.ts`
- Use named exports in barrel file
- Components should have default exports in their files

**Copilot Action**: When creating a new component, automatically add export to index.ts:
```tsx
// In src/components/custom/index.ts
export { MyNewComponent } from './MyNewComponent'
```

### State Management
- Use TanStack Query for server state (data fetching)
- Use Zustand for client state (UI state, settings)
- Avoid prop drilling - prefer context or state management

**Query Pattern**:
```tsx
export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

**Mutation Pattern**:
```tsx
export function useCreateRecipe() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}
```

### Styling Guidelines
- Use Tailwind CSS classes exclusively
- Follow existing spacing patterns (`gap-4`, `p-4`, `m-4`)
- Use Radix UI components from `components/ui/` (do not modify these)
- Responsive design: `sm:`, `md:`, `lg:` breakpoints
- Dark mode: use `dark:` variants

**Common Patterns**:
```tsx
// Layout container
<div className="container mx-auto px-4 py-8">

// Card component
<div className="rounded-lg border bg-card p-6 shadow-sm">

// Button with icon
<Button className="gap-2">
  <PlusIcon className="h-4 w-4" />
  Add Recipe
</Button>

// Grid layouts
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
```

### Internationalization
- All user-facing text must use `useTranslations()` from next-intl
- Add new translations to both `messages/en.json` and `messages/hu.json`
- Use namespaced keys: `t('recipes.title')`

**Copilot Pattern**:
```tsx
// Client component
const t = useTranslations('recipes')
return <h1>{t('title')}</h1>

// Server component  
const t = await getTranslations('recipes')
return <h1>{t('title')}</h1>

// Add to messages/en.json and messages/hu.json
{
  "recipes": {
    "title": "My Recipes" // English
    "title": "Receptjeim" // Hungarian
  }
}
```

### Forms
- Use React Hook Form with Zod schemas
- Define validation schemas in component files or separate schema file
- Use form navigation guards for unsaved changes

**Form Pattern**:
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '' },
  })
  
  const onSubmit = (data: FormData) => {
    // Handle form submission
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

## Copilot-Specific Instructions

### When Generating Components:
1. **Always start with imports** in the correct order
2. **Define TypeScript types** before the component
3. **Add JSDoc comments** for complex components
4. **Include error boundaries** for components that might fail
5. **Use Suspense** for components with async data
6. **Add loading states** for better UX

### When Modifying Existing Code:
1. **Preserve existing patterns** and naming conventions
2. **Check for internationalization** before adding text
3. **Consider mobile responsiveness** for UI changes
4. **Test both static and database modes** mentally
5. **Update related exports** in index.ts files

### Common Generation Mistakes to Avoid:
- ❌ Don't edit `components/ui/` files (auto-generated)
- ❌ Don't use hardcoded strings (use translations)
- ❌ Don't forget to handle loading states
- ❌ Don't ignore the dual architecture pattern
- ❌ Don't use inline styles (use Tailwind classes)
- ❌ Don't create components without TypeScript types
- ❌ Don't forget to export new components

### When Creating API Routes:
```tsx
// app/api/recipes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { isStaticExport } from '@/lib/data-config'

export async function GET(request: NextRequest) {
  if (isStaticExport) {
    return NextResponse.json({ error: 'API not available in static mode' }, { status: 404 })
  }
  
  try {
    // Database operations
    const recipes = await getRecipes()
    return NextResponse.json(recipes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }
}
```

## Important Notes for Code Generation

### Data Handling
- Always consider both static and database modes when implementing features
- Use the data config utilities to detect current mode
- Implement graceful fallbacks for missing data
- **Copilot Rule**: Every data operation needs dual implementation

### Performance
- Use React.memo() for expensive components
- Implement proper loading states with Suspense
- Use TanStack Query's built-in caching
- Avoid unnecessary re-renders with proper dependency arrays

### Accessibility
- Use semantic HTML elements (`main`, `section`, `article`, `nav`)
- Radix UI components provide accessibility by default
- Test with keyboard navigation
- Include proper ARIA labels and descriptions

### Mobile-First Development
- Design responsive components with mobile-first approach
- Use `use-mobile.tsx` hook for mobile-specific behavior
- Test touch interactions and gestures
- Consider thumb-friendly tap targets (minimum 44px)

### Error Handling Pattern
```tsx
function MyComponent() {
  const { data, isLoading, error } = useMyQuery()
  
  if (isLoading) return <Loader />
  if (error) return <ErrorMessage error={error} />
  if (!data) return <EmptyState />
  
  return <DataComponent data={data} />
}
```

## Development Commands

```bash
npm run dev              # Development server
npm run dev:static       # Development in static export mode
npm run build            # Production build
npm run export           # Static export build
npm test                 # Run tests
npm run lint             # ESLint check
npm run lint:fix         # Fix linting issues
npm run migrate          # Convert JSON to SQLite
npm run export:json      # Convert SQLite to JSON
```

## Testing
- Write tests for complex logic and hooks
- Use Vitest testing framework
- Mock external dependencies appropriately
- Test both static and database modes where applicable

## Common Pitfalls for AI Code Generation
- ❌ **Don't edit files in `components/ui/`** (auto-generated Shadcn components)
- ❌ **Always handle loading and error states** in data components
- ❌ **Remember to invalidate queries after mutations** (`queryClient.invalidateQueries()`)
- ❌ **Consider offline functionality** when adding features
- ❌ **Test both authentication modes** (static vs database)
- ❌ **Don't use any/unknown types** - always define proper TypeScript interfaces
- ❌ **Don't skip internationalization** - use translation functions for all text
- ❌ **Don't ignore responsive design** - test on mobile viewports
- ❌ **Don't forget to update barrel exports** when creating new components

## Quick Reference for Copilot

### Essential Imports
```tsx
// Client components
'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery, useMutation } from '@tanstack/react-query'
import { isStaticExport } from '@/lib/data-config'

// Server components
import { getTranslations } from 'next-intl/server'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Custom components
import { PageLayout } from '@/components/custom'
```

### File Templates

**API Route Template**:
```tsx
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Implementation
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

**Page Template**:
```tsx
import { PageLayout } from '@/components/custom'
import { getTranslations } from 'next-intl/server'

export default async function MyPage() {
  const t = await getTranslations('pages.myPage')
  
  return (
    <PageLayout title={t('title')}>
      {/* Content */}
    </PageLayout>
  )
}
```

### Command Reference for Development
