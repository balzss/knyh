import { Hono } from 'hono'
import { api } from './api'
import type { Env } from './env'
import { getRecipe } from './db/recipes'

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
app.get('/r/:id', async (c) => {
  const page = await c.env.ASSETS.fetch(new URL('/', c.req.url))
  const recipe = await getRecipe(c.env.DB, c.req.param('id'))
  if (!recipe || recipe.archived) return page

  const description = recipeDescription(recipe)
  const tags = [
    ['og:type', 'article'],
    ['og:site_name', 'KONYHA'],
    ['og:title', recipe.title],
    ['og:description', description],
    ['og:url', c.req.url],
    ['og:image', new URL('/cooking-pot-512.png', c.req.url).href],
    ['twitter:card', 'summary'],
  ]
  const html = new HTMLRewriter()
    .on('title', { element: (el) => void el.setInnerContent(`${recipe.title} | KONYHA`) })
    .on('meta[name="description"]', {
      element: (el) => void el.setAttribute('content', description),
    })
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

function recipeDescription(recipe: {
  ingredients: { items: string[] }[]
  totalTime: string | null
  yield: string | null
}) {
  const facts = [recipe.totalTime, recipe.yield].filter(Boolean).join(' · ')
  const ingredients = recipe.ingredients.flatMap((group) => group.items).join(', ')
  const text = [facts, ingredients].filter(Boolean).join(' | ')
  return text.length > 200 ? `${text.slice(0, 197)}...` : text || 'Recipe'
}
