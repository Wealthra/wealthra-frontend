// In-memory authentication state. Tokens and identity are not persisted in storage.
let currentAccessToken: string | null = null
let currentRoles: string[] = []
let currentUserId: string | null = null

export function isAuthenticated(): boolean {
  return !!currentAccessToken
}

export function isAdmin(): boolean {
  return currentRoles.includes('Admin')
}

export function getAuthToken(): string | null {
  return currentAccessToken
}

export function getUserId(): string | null {
  return currentUserId
}

export function setAuth(token: string, userId: string, roles: Array<string> = []): void {
  currentAccessToken = token
  currentRoles = roles
  currentUserId = userId || null
}

export function clearAuth(): void {
  currentAccessToken = null
  currentRoles = []
  currentUserId = null
}

export function getAuthenticatedURL(route: string = '/dashboard'): string {
  const token = getAuthToken()
  if (!token) return '/'

  // For in-app deep links, passing the raw token is sufficient because it is never persisted.
  return `${route}?auth=${encodeURIComponent(token)}`
}

export function getUserRoles(): Array<string> {
  return currentRoles
}

// NOTE: bootstrapAuth is intentionally a no-op for now to avoid
// hitting the refresh-token endpoint automatically before the
// backend cookie setup is finalized.
export async function bootstrapAuth(): Promise<void> {
  return
}
