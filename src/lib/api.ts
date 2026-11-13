export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type ApiOptions = Omit<RequestInit, 'body'> & { json?: unknown }

/**
 * Fetches JSON from the Worker API. Throws ApiError with the server's message on a non-2xx response.
 * Same-origin requests carry the Cloudflare Access cookie automatically.
 */
export async function api<T>(
  path: string,
  { json, headers, ...init }: ApiOptions = {}
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(body?.message ?? `Request failed (${response.status})`, response.status)
  }
  return response.json() as Promise<T>
}
