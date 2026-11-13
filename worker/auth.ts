import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { MiddlewareHandler } from 'hono'
import type { Env } from './env'

const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

function getKeySet(teamDomain: string) {
  let keySet = keySets.get(teamDomain)
  if (!keySet) {
    keySet = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`))
    keySets.set(teamDomain, keySet)
  }
  return keySet
}

function readToken(req: Request): string | null {
  const header = req.headers.get('cf-access-jwt-assertion')
  if (header) return header
  const match = (req.headers.get('cookie') ?? '').match(/(?:^|;\s*)CF_Authorization=([^;]+)/)
  return match ? match[1] : null
}

/**
 * True when the request carries a valid Cloudflare Access token for this app.
 * Fails closed when the Access settings are missing.
 */
export async function isEditor(env: Env, req: Request): Promise<boolean> {
  if (env.DEV_AUTH_BYPASS === 'true') return true
  if (!env.TEAM_DOMAIN || !env.POLICY_AUD) return false

  const token = readToken(req)
  if (!token) return false

  try {
    await jwtVerify(token, getKeySet(env.TEAM_DOMAIN), {
      issuer: `https://${env.TEAM_DOMAIN}`,
      audience: env.POLICY_AUD,
    })
    return true
  } catch {
    return false
  }
}

export const requireEditor: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  if (!(await isEditor(c.env, c.req.raw))) {
    return c.json({ message: 'Unauthorized' }, 401)
  }
  await next()
}

/**
 * The Access cookie rides along on cross-site requests, so reject state-changing
 * requests whose Origin header names another site.
 */
export const sameOriginWrites: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const method = c.req.method
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    const origin = c.req.header('origin')
    if (origin && origin !== new URL(c.req.url).origin) {
      return c.json({ message: 'Forbidden' }, 403)
    }
  }
  await next()
}
