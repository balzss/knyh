import { describe, expect, it } from 'vitest'
import app from '../../worker'
import { testEnv } from './helpers'

describe('auth redirect', () => {
  it('sends the visitor back into the app', async () => {
    const response = await app.request(
      'https://knyh.test/auth/login?next=/recipes/new',
      {},
      testEnv
    )
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/recipes/new')
  })

  it('does not redirect to other sites', async () => {
    for (const next of ['https://evil.example', '//evil.example', 'javascript:alert(1)']) {
      const response = await app.request(
        `https://knyh.test/auth/login?next=${encodeURIComponent(next)}`,
        {},
        testEnv
      )
      expect(response.headers.get('location'), next).toBe('/settings')
    }
  })

  it('defaults to the settings page', async () => {
    const response = await app.request('https://knyh.test/auth/login', {}, testEnv)
    expect(response.headers.get('location')).toBe('/settings')
  })
})

describe('unknown routes', () => {
  it('returns JSON 404 for unknown API paths', async () => {
    const response = await app.request('https://knyh.test/api/nothing', {}, testEnv)
    expect(response.status).toBe(404)
  })
})
