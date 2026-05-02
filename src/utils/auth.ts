let currentAccessToken: string | null = localStorage.getItem('access_token') || null
let currentRefreshToken: string | null = localStorage.getItem('refresh_token') || null
let currentRoles: string[] = JSON.parse(localStorage.getItem('user_roles') || '[]')
let currentUserId: string | null = localStorage.getItem('user_id') || null
let currentEmail: string | null = localStorage.getItem('user_email') || null
let currentIsAdmin: boolean = localStorage.getItem('is_admin') === 'true'
let isBootstrapping: boolean = false

export function isAuthenticated(): boolean {
  return !!currentAccessToken
}

export function isAuthBootstrapping(): boolean {
  return isBootstrapping
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

export function getRefreshToken(): string | null {
  return currentRefreshToken
}

export function getUserEmail(): string | null {
  return currentEmail
}

export function setAuth(
  token: string,
  userId: string,
  roles: Array<string> = [],
  email?: string,
  refreshToken?: string
): void {
  currentAccessToken = token
  currentRefreshToken = refreshToken || currentRefreshToken
  currentUserId = userId || null
  currentEmail = email || null

  // Decode roles from the JWT if none were explicitly provided
  let resolvedRoles = roles
  if (resolvedRoles.length === 0) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        || payload['role']
        || payload['roles']
      if (Array.isArray(roleClaim)) resolvedRoles = roleClaim
      else if (typeof roleClaim === 'string') resolvedRoles = [roleClaim]
    } catch {
      // Not a valid JWT, keep empty
    }
  }

  currentRoles = resolvedRoles

  localStorage.setItem('access_token', token)
  localStorage.setItem('user_roles', JSON.stringify(resolvedRoles))
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken)
  }
  if (userId) {
    localStorage.setItem('user_id', userId)
  }
  if (email) {
    localStorage.setItem('user_email', email)
  }
}

export function setAdminStatus(isAdmin: boolean): void {
  currentIsAdmin = isAdmin
  localStorage.setItem('is_admin', isAdmin.toString())
}

export function clearAuth(): void {
  currentAccessToken = null
  currentRefreshToken = null
  currentRoles = []
  currentUserId = null
  currentEmail = null
  currentIsAdmin = false

  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_roles')
  localStorage.removeItem('user_id')
  localStorage.removeItem('user_email')
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
  isBootstrapping = true
  try {
    const { accountService } = await import('../services/api/account/account.service')
    const authData = await accountService.refreshToken()
    if (authData && authData.token) {
      setAuth(authData.token, authData.id, [], authData.email, authData.refreshToken)
      
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
    clearAuth()
  } finally {
    isBootstrapping = false
  }
}
