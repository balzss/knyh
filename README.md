# KNYH Recipe Manager

KNYH (pronounced "KONYHA", Hungarian for "kitchen") is a recipe site. Anyone can browse the recipes. The owner signs in on the settings page to add and change them.

## How it works

- **Frontend:** Vite, React and React Router, with Tailwind and shadcn/ui. English and Hungarian via `use-intl`. Installable as a PWA.
- **Backend:** one Cloudflare Worker ([Hono](https://hono.dev)) in `worker/`. It serves the API under `/api/*` and the built site as static assets.
- **Data:** Cloudflare D1 (SQLite). Schema in `migrations/`, starter recipes in `db/seed.sql`.
- **Auth:** Cloudflare Access. The Worker checks the Access token on every write and on the shopping list. Reads are public.
- **Deploys:** Cloudflare Workers Builds deploys on every push or merge to `main`.

## Develop locally

```sh
npm install
cp .dev.vars.example .dev.vars   # treats you as the signed-in editor, local only
npm run db:migrate:local
npm run db:seed:local            # optional starter recipes
npm run dev
```

Other scripts: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
`npm run db:gen-seed` rebuilds `db/seed.sql` from `db/seed-data.json`.

## Deploy to Cloudflare (one time)

1. **Database.** Run `npx wrangler login`, then `npx wrangler d1 create knyh`. Put the printed `database_id` into `wrangler.jsonc`. Then run `npm run db:migrate:remote` and, if you want the starter recipes, `npm run db:seed:remote`.
2. **Site.** In the Cloudflare dashboard go to Workers & Pages, Create, Import a repository, and pick this repo. Production branch `main`, build command `npm run build`, deploy command `npx wrangler deploy`.
3. **Domain.** Add a custom domain to the Worker (Settings, Domains & Routes). Access works on it, and you can then turn off the `workers.dev` and preview URLs. The Worker rejects writes without a valid token on every hostname, so the `workers.dev` URL stays read-only either way.
4. **Sign-in.** In Zero Trust, Access, Applications, add a self-hosted application for `your.domain/auth/*`. Add one Allow policy that includes only your email. Copy the application's **Audience tag** and your **team domain** (`<team>.cloudflareaccess.com`) into the `vars` block of `wrangler.jsonc` as `POLICY_AUD` and `TEAM_DOMAIN`, and push.

Until `TEAM_DOMAIN` and `POLICY_AUD` are set, nobody can edit.

## How sign-in works

The settings page links to `/auth/login`. Access guards that path, so you sign in there. Access sets a `CF_Authorization` cookie for the whole domain. The Worker validates that token (issuer, audience, expiry, signature) on every write, on the shopping list and on export. `GET /api/session` tells the UI whether to show edit controls. Hiding buttons is only a convenience. The Worker enforces the rules.

## Data

- Export and import (JSON) are on the settings page in edit mode. Import replaces everything.
- Dates are stored as ISO strings, and ingredients and instructions as JSON text.
- The shopping list is only visible in edit mode.
- Site settings (name, language) live in D1. How a visitor sorts and lays out the lists is saved in their own browser, so anyone can change it.

## Project layout

```
src/        React app (pages, components, hooks, providers)
worker/     Worker: API routes (api.ts), D1 queries (db.ts), Access check (auth.ts)
migrations/ D1 schema migrations
db/         Seed data
test/       Worker tests (run in the Workers runtime)
```

## License

See [LICENSE](LICENSE).
