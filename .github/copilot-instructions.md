# Copilot Instructions for KNYH Recipe Manager

## Project Overview
KNYH is a Next.js 15 recipe management app with **dual architecture** supporting both SQLite database operations and static data export capabilities. It intelligently switches between SQLite (dev/production) and JSON (static export) based on the build environment.

## Key Architecture Patterns

### Data Layer - Dual Architecture
- **SQLite Mode**: Development and production use SQLite database (`/data/recipes.db`) with API routes
- **JSON Mode**: Static exports use JSON file (`/public/data/data.json`) for GitHub Pages deployment
- **Environment Detection**: `src/lib/data-config.ts` determines data mode based on `NEXT_OUTPUT_MODE`
- **Dynamic Data Source**: Hooks automatically switch between `/api/data` (SQLite) and JSON file (static)
- **Migration Scripts**: `scripts/migrate-to-sqlite.mjs` and `scripts/export-to-json.mjs` for data conversion
- **Type Safety**: Dedicated SQLite row interfaces (`RecipeRow`, `TagRow`, `ConfigRow`) in `database.ts`

### Component Architecture
- **Barrel Exports**: Components exported from `/src/components/custom/index.ts` 
- **Compound Components**: `TopBar` + `TopBarContent/*` for dynamic toolbar switching
- **Loading States**: Always check both `loading` and `tagsLoading` before showing content/empty states
- **Selection Mode**: Many components have dual rendering based on `selectionList.length > 0`

### State Management
- **TanStack Query**: Primary data fetching/caching layer (`queryKey: ['recipes']`, `['tags']`)
- **URL State**: Tag filtering via `?tag=id1,id2` search params
- **Local State**: Component state for UI interactions, selection lists
- **Hydration Fix**: Use `useStore()` hook when persisting to localStorage

### Internationalization
- **Dynamic Locale**: Determined from `data.json` userConfig.language in `i18n/request.ts`
- **Messages**: Stored in `/messages/{locale}.json`
- **Usage**: `const t = useTranslations('ComponentName')` for scoped translations

## Development Workflows

### Running the App
```bash
npm run dev                 # Development server (SQLite mode) at localhost:3000/knyh
npm run export             # Static export (JSON mode) for deployment
npm run migrate:sqlite     # Convert JSON data to SQLite database
npm run export:json        # Convert SQLite data to JSON for static export
```

### Adding New Components
1. Create in `/src/components/custom/ComponentName.tsx`
2. Export from `/src/components/custom/index.ts`
3. Use `cn()` utility for conditional styling with Tailwind

### Data Mutations
```typescript
const { updateRecipes, deleteRecipes } = useRecipeMutations()
// Always use optimistic updates with onSuccess callbacks
```

### Testing
```bash
npm test                   # Vitest with @/ alias support
npm run test:ci           # CI mode without coverage
```

## Critical Conventions

### Loading States
Always handle both data sources before rendering:
```typescript
const { recipes, loading } = useRecipes()
const { tags, loading: tagsLoading } = useTags()

// Show loading, then content OR empty state
{(loading || tagsLoading) && <Loader />}
{!loading && !tagsLoading && content}
```

### Route Structure
- `/` - Home page with random recipe sort
- `/archive` - Archived recipes with restore/delete actions  
- `/recipes/[id]` - Recipe detail/edit pages
- All pages use same `TopBar` + `AppSidebar` + `PageLayout` structure

### Component Props Patterns
- `selectionMode`: Boolean for bulk selection UI state
- `compact`: Boolean for grid vs list layouts
- `archivedMode`: Boolean for archive-specific actions
- `onSelect`: Callback with (id: string, selected: boolean)

### File-based Data Schema
```typescript
type DatabaseSchema = {
  recipes: Recipe[]      // ingredients as GroupData[], tags as string[]
  tags: Tag[]           // id + displayName  
  userConfig: UserConfig // language, theme, userId
}
```

## Integration Points
- **ShadCN/ui**: Radix-based components with custom styling
- **Motion**: Animation library for page transitions
- **DND Kit**: Drag and drop for sortable ingredients/instructions
- **Sonner**: Toast notifications via `myToast()` utility
- **Next-Intl**: Server-side locale detection with client hydration
