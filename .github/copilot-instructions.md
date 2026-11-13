# KNYH development notes

KNYH is a recipe site: Vite + React + React Router on the front, one Cloudflare Worker (Hono) on the back, D1 for data, Cloudflare Access for the owner's sign-in. Read the README for the full picture.

## Rules that matter

- Reads are public. Every write, the shopping list and export need a valid Access token, checked in `worker/auth.ts`. New write endpoints go under `/api` and are protected by the existing middleware in `worker/api.ts`. Never rely on hiding UI.
- UI that edits data is shown only when `useEditMode().editor` is true. Wrap whole edit-only pages in `EditorOnly`.
- Talk to the API through `api()` in `src/lib/api.ts`. Server state goes through TanStack Query hooks in `src/hooks/`.
- Strings go in `messages/en.json` and `messages/hu.json`. Use `useTranslations` from `use-intl`.
- Routing is React Router (`src/router.tsx`). The theme is per visitor (`src/providers/ThemeProvider.tsx`). Site config such as language lives in D1. View preferences (sort order, list or grid, columns) are per visitor, in localStorage, through `useViewPreferences`.
- Spacing is on a 4 px grid (4 inside a line, 8 between siblings, 12 between groups and cards, 16 for a card's inset). The scale is written out above `RecipeCard`; follow it for new cards and panels.
- Schema changes are new files in `migrations/`. Never edit an applied migration.

## Checks before finishing

`npm run typecheck && npm run lint && npm test && npm run build`
