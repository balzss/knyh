import { Hono } from 'hono'
import { api } from './api'
import type { Env } from './env'
import { getConfig } from './db/config'
import { getRecipe } from './db/recipes'
import { renderCard } from './og'
import en from '../messages/en.json'
import hu from '../messages/hu.json'

const MESSAGES = { en, hu }

const app = new Hono<{ Bindings: Env }>()

app.route('/api', api)

// Cloudflare Access protects /auth/*. A request only gets here after the visitor
// signed in, so the redirect lands them back in the app as an editor.
app.get('/auth/login', (c) => {
  const next = c.req.query('next') ?? '/settings'
  const safe = next.startsWith('/') && !next.startsWith('//') ? next : '/settings'
  return c.redirect(safe, 302)
})

// Chat apps read the link preview from the HTML they get, without running the app, so the
// recipe page needs its title and description in the served markup. Archived recipes are
// private and keep the generic tags.
// The share card image. The ?v= query only exists to bust chat apps' preview caches.
app.get('/r/:id/og.png', async (c) => {
  const recipe = await getRecipe(c.env.DB, c.req.param('id'))
  if (!recipe || recipe.archived) return c.notFound()
  const { language } = await getConfig(c.env.DB)
  const timeLabels = (language === 'hu' ? MESSAGES.hu : MESSAGES.en).Time
  const png = await renderCard(c.env, new URL(c.req.url).origin, recipe, timeLabels)
  return new Response(png, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' },
  })
})

app.get('/r/:id', async (c) => {
  const page = await c.env.ASSETS.fetch(new URL('/', c.req.url))
  const recipe = await getRecipe(c.env.DB, c.req.param('id'))
  if (!recipe || recipe.archived) return page

  // The site language is stored in the config, so crawlers get it too.
  const { language } = await getConfig(c.env.DB)
  const template = (language === 'hu' ? MESSAGES.hu : MESSAGES.en).RecipeView.shareTitle
  const title = template.replace('{title}', recipe.title)
  const tags = [
    ['og:type', 'article'],
    ['og:title', title],
    ['og:url', c.req.url],
    [
      'og:image',
      new URL(`/r/${recipe.id}/og.png?v=${encodeURIComponent(recipe.updatedAt)}`, c.req.url).href,
    ],
    ['og:image:width', '1200'],
    ['og:image:height', '630'],
    ['twitter:card', 'summary_large_image'],
  ]
  const html = new HTMLRewriter()
    .on('title', { element: (el) => void el.setInnerContent(title) })
    .on('meta[name="description"]', { element: (el) => void el.remove() })
    .on('head', {
      element: (el) => {
        const markup = tags
          .map(([k, v]) => `<meta property="${k}" content="${escapeAttr(v)}" />`)
          .join('')
        el.append(markup, { html: true })
      },
    })
    .transform(page)
  return new Response(html.body, { headers: page.headers })
})

app.notFound((c) => c.json({ message: 'Not found' }, 404))

export default app

function escapeAttr(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
