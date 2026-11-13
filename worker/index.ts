import { Hono } from 'hono'
import { api } from './api'
import type { Env } from './env'

const app = new Hono<{ Bindings: Env }>()

app.route('/api', api)

// Cloudflare Access protects /auth/*. A request only gets here after the visitor
// signed in, so the redirect lands them back in the app as an editor.
app.get('/auth/login', (c) => {
  const next = c.req.query('next') ?? '/settings'
  const safe = next.startsWith('/') && !next.startsWith('//') ? next : '/settings'
  return c.redirect(safe, 302)
})

app.notFound((c) => c.json({ message: 'Not found' }, 404))

export default app
