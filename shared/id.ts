/**
 * Generates a cryptographically secure 8-character string using a-z and 0-9.
 * Uses Web Crypto so it runs in the browser and in the Worker.
 */
export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const randomBytes = crypto.getRandomValues(new Uint8Array(8))
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars[randomBytes[i] % chars.length]
  }
  return result
}
