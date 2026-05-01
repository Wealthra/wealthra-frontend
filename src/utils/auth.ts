// In-memory authentication state fallback, but mainly backed by localStorage now.
let currentAccessToken: string | null = localStorage.getItem('access_token') || null
let currentRoles: string[] = JSON.parse(localStorage.getItem('user_roles') || '[]')
let currentUserId: string | null = localStorage.getItem('user_id') || null
let currentIsAdmin: boolean = localStorage.getItem('is_admin') === 'true'

export function isAuthenticated(): boolean {
  return !!currentAccessToken
}

export function isAdmin(): boolean {
  return currentIsAdmin || currentRoles.includes('Admin')
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

  localStorage.setItem('access_token', token)
  localStorage.setItem('user_roles', JSON.stringify(roles))
  if (userId) {
    localStorage.setItem('user_id', userId)
  }
}

export function setAdminStatus(isAdmin: boolean): void {
  currentIsAdmin = isAdmin
  localStorage.setItem('is_admin', isAdmin.toString())
}

export function clearAuth(): void {
  currentAccessToken = null
  currentRoles = []
  currentUserId = null
  currentIsAdmin = false

  localStorage.removeItem('access_token')
  localStorage.removeItem('user_roles')
  localStorage.removeItem('user_id')
  localStorage.removeItem('is_admin')
}

export async function logout(): Promise<void> {
  try {
    const { accountService } = await import('../services/api/account/account.service')
    await accountService.revokeToken()
  } catch (err) {
    console.error('Failed to revoke token during logout:', err)
  } finally {
    clearAuth()
  }
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

// bootstrapAuth attempts to retrieve a fresh access token using the
// backend-managed refresh-token cookie on application startup.
export async function bootstrapAuth(): Promise<void> {
  try {
    const { accountService } = await import('../services/api/account/account.service')
    const authData = await accountService.refreshToken()
    if (authData && authData.token) {
      setAuth(authData.token, authData.id, [])
      
      // Fetch /me to ensure isAdmin is correct
      try {
        const profile = await accountService.getMe()
        setAdminStatus(profile.isAdmin)
      } catch (profileError) {
        console.error('Failed to fetch profile during bootstrap:', profileError)
      }
    }
  } catch (err) {
    // Failure simply means the user needs to log in manually.
  }
}
