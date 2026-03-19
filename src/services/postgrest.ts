const API_BASE_URL = (import.meta.env.VITE_AXCIFRAS_API_URL ?? 'https://rest.axory.com.br').replace(
  /\/$/,
  '',
)
const API_SCHEMA = 'axcifras'

let authToken: string | null = null
let authUserId: string | null = null

export function setPostgrestAuthToken(nextToken: string | null) {
  authToken = nextToken
}

export function setPostgrestAuthUserId(nextUserId: string | null) {
  authUserId = nextUserId
}

export function getPostgrestAuthUserId() {
  return authUserId
}

interface PostgrestRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  query?: string
  body?: unknown
  prefer?: string
}

function getDefaultHeaders() {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Profile': API_SCHEMA,
    'Content-Profile': API_SCHEMA,
    'Content-Type': 'application/json',
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  return headers
}

export async function postgrestRequest<T = unknown>(
  path: string,
  { method = 'GET', query, body, prefer }: PostgrestRequestOptions = {},
) {
  const url = `${API_BASE_URL}/${path}${query ? `?${query}` : ''}`
  const headers = getDefaultHeaders()

  if (prefer) {
    headers.Prefer = prefer
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `PostgREST request failed (${response.status})`)
  }

  if (response.status === 204) {
    return null as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return null as T
  }

  return (await response.json()) as T
}
