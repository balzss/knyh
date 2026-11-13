import { env } from 'cloudflare:workers'
import { SignJWT, exportJWK, generateKeyPair, type JWK } from 'jose'
import { vi } from 'vitest'
import app from '../../worker'
import type { Env } from '../../worker/env'

export const testEnv = env as unknown as Env

const ORIGIN = 'https://knyh.test'
const ISSUER = `https://${testEnv.TEAM_DOMAIN}`

const { publicKey, privateKey } = await generateKeyPair('RS256')
const publicJwk: JWK = {
  ...(await exportJWK(publicKey)),
  kid: 'test-key',
  alg: 'RS256',
  use: 'sig',
}

// jose fetches the Access signing keys from the team domain. Serve ours instead.
const realFetch = globalThis.fetch
vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  if (url === `${ISSUER}/cdn-cgi/access/certs`) {
    return Promise.resolve(Response.json({ keys: [publicJwk] }))
  }
  return realFetch(input, init)
})

export async function makeToken(
  overrides: { audience?: string; issuer?: string; expiresIn?: string } = {}
): Promise<string> {
  return new SignJWT({ email: 'owner@example.com' })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
    .setIssuer(overrides.issuer ?? ISSUER)
    .setAudience(overrides.audience ?? testEnv.POLICY_AUD)
    .setIssuedAt()
    .setExpirationTime(overrides.expiresIn ?? '1h')
    .sign(privateKey)
}

type CallOptions = {
  method?: string
  json?: unknown
  token?: string | null
  headers?: Record<string, string>
}

/** Calls the Worker the way the browser does. Pass a token to act as the signed-in editor. */
export function call(
  path: string,
  { method = 'GET', json, token, headers = {} }: CallOptions = {}
) {
  const requestHeaders: Record<string, string> = { ...headers }
  if (json !== undefined) requestHeaders['Content-Type'] = 'application/json'
  if (token) requestHeaders.Cookie = `CF_Authorization=${token}`
  return app.request(
    `${ORIGIN}${path}`,
    {
      method,
      headers: requestHeaders,
      body: json !== undefined ? JSON.stringify(json) : undefined,
    },
    testEnv
  )
}

export async function asEditor(path: string, options: Omit<CallOptions, 'token'> = {}) {
  return call(path, { ...options, token: await makeToken() })
}
