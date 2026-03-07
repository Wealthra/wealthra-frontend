// In-memory authentication state. Tokens are not persisted in storage.
let currentAccessToken: string | null = null
let currentRoles: string[] = []

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
  return localStorage.getItem('userId')
}

export function setUserId(userId: string): void {
  localStorage.setItem('userId', userId)
}

export function setAuth(token: string, userId: string, roles: Array<string> = []): void {
  currentAccessToken = token
  currentRoles = roles

  if (userId) {
    setUserId(userId)
  }
}

export function clearAuth(): void {
  currentAccessToken = null
  currentRoles = []
  localStorage.removeItem('userId')
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
