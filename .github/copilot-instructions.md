# KNYH development notes

KNYH is a recipe site: Vite + React + React Router on the front, one Cloudflare Worker (Hono) on the back, D1 for data, Cloudflare Access for the owner's sign-in. Read the README for the full picture.

## Rules that matter

- Reads are public. Every write, the shopping list and export need a valid Access token, checked in `worker/auth.ts`. New write endpoints go under `/api` and are protected by the existing middleware in `worker/api.ts`. Never rely on hiding UI.
- UI that edits data is shown only when `useEditMode().editor` is true. Wrap whole edit-only pages in `EditorOnly`.
- Talk to the API through `api()` in `src/lib/api.ts`. Server state goes through TanStack Query hooks that live with their feature (`src/features/<name>/use-*.ts`, or `hooks/` inside `features/recipes`).
- Strings go in `messages/en.json` and `messages/hu.json`. Use `useTranslations` from `use-intl`.
- Routing is React Router (`src/app/router.tsx`). The theme is per visitor (`src/app/providers/ThemeProvider.tsx`). Site config such as language lives in D1. View preferences (sort order, list or grid, columns) are per visitor, in localStorage, through `useViewPreferences`.
- Spacing is on a 4 px grid: 4 inside a line, 8 between siblings, 12 between groups and between cards, 16 for a card's inset (12 on phones). Follow it for new cards and panels.
- Schema changes are new files in `migrations/`. Never edit an applied migration.

## Where code goes

```
src/app/         entry (main.tsx), router, providers/, and the app shell:
                 AppSidebar, PageShell, BottomNav, NotFoundPage
src/features/    one folder per feature: recipes, tags, ideas, shopping-list, settings
src/components/  generic UI: ui/ (shadcn), layout/, inputs/, feedback/
src/hooks/       hooks used by more than one feature
src/lib/         generic helpers (api, utils, urls, view-preferences)
shared/          code the worker and the frontend both import: types, id, time, import-validation
worker/db/       D1 queries, one file per entity. index.ts lists what api.ts can call.
```

- A page is `<Name>Page.tsx` in its feature. Wrap its content in `PageShell`, which gives it the top bar, sidebar and main area.
- `features/recipes` is split into `components/`, `hooks/`, `lib/`, `edit/` (the edit form), `view/` (the recipe page) and `pages/` (list pages). The smaller features are flat.
- A component or hook used by one feature stays in that feature. Move it to `components/` or `hooks/` once a second feature needs it.

### Imports

- `components/`, `hooks/` and `lib/` never import from `features/`. A feature imports another feature only when it has to (`recipes` uses `tags` and `ideas`). `app/` can import any feature.
- Any layer can use the hooks in `src/app/providers/` (edit mode, theme, confirm dialog), since they apply everywhere.
- Import files by path, with `@/` for `src/` and `@shared/` for `shared/`. There are no barrel files that re-export components or hooks. `worker/db/index.ts` is the one re-export list, for the Worker's queries.
- The worker, `scripts/` and `test/` import `shared/` by relative path (`../shared/types`), because `@shared` is a frontend alias.
- Keep the import graph free of cycles. `npx madge --circular --extensions ts,tsx --ts-config tsconfig.app.json src shared` should report none.

### Naming

- Components, pages and providers: `PascalCase.tsx`, named after the component. Hooks, helpers and other modules: `kebab-case.ts`. Use `.tsx` only when the file has JSX.
- Named exports. A default export is only for what the router loads: the pages, the two views that `features/recipes/routes.tsx` wraps (`RecipePage`, `EditRecipeView`) and `Providers`.
- `components/ui/` is shadcn output. Leave its style and file names as generated.
- Tests sit next to the code in a `__tests__` folder. Worker tests are in `test/worker/`.

## Checks before finishing

`npm run typecheck && npm run lint && npm test && npm run build`
