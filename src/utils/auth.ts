import CryptoJS from 'crypto-js'

const AES_SECRET_KEY = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex)

// Encrypts the token using AES encryption
export function encryptToken(token: string): string {
  const secretKey = AES_SECRET_KEY
  return CryptoJS.AES.encrypt(token, secretKey).toString()
}

// Decrypts the token using AES decryption
export function decryptToken(encryptedToken: string): string | null {
  try {
    const secretKey = AES_SECRET_KEY
    const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (e) {
    console.error('Failed to decrypt token:', e)
    return null
  }
}

// Checks if the user is authenticated by checking the presence of a token
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

export function isAdmin(): boolean {
  const roles = getUserRoles()
  return roles.includes('Admin')
}

// Checks if the user is authenticated and has a valid token
export function getAuthToken(): string | null {
  const rememberMe = localStorage.getItem('rememberMe') === 'true'

  if (rememberMe) {
    return localStorage.getItem('authToken')
  } else {
    return sessionStorage.getItem('authToken')
  }
}

// Checks if the user is authenticated and has a valid token
export function getUserId(): string | null {
  return localStorage.getItem('userId')
}

// Sets the user ID in local storage
export function setUserId(userId: string): void {
  localStorage.setItem('userId', userId)
}

// Sets the authentication token in local or session storage based on the rememberMe flag
export function setAuth(
  token: string,
  rememberMe: boolean = false,
  userId: string,
  roles: Array<string> = []
): void {
  if (rememberMe) {
    localStorage.setItem('authToken', token)
    localStorage.setItem('rememberMe', 'true')
    localStorage.setItem('roles', JSON.stringify(roles))
    // Clear session storage to avoid duplicates
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('roles')
  } else {
    sessionStorage.setItem('authToken', token)
    sessionStorage.setItem('roles', JSON.stringify(roles))
    // Clear local storage auth items
    localStorage.removeItem('authToken')
    localStorage.removeItem('rememberMe')
    localStorage.removeItem('roles')
  }

  if (userId) {
    setUserId(userId)
  }
}

// Clears the authentication token and user ID from local and session storage
export function clearAuth(): void {
  localStorage.removeItem('authToken')
  localStorage.removeItem('rememberMe')
  localStorage.removeItem('userId')
  localStorage.removeItem('roles')
  sessionStorage.removeItem('authToken')
}

// Returns a URL with the encrypted authentication token as a query parameter
export function getAuthenticatedURL(route: string = '/dashboard'): string {
  const token = getAuthToken()
  if (!token) return '/'

  const encryptedToken = encryptToken(token)
  return `${route}?auth=${encryptedToken}`
}

// Gets user roles from the appropriate storage
export function getUserRoles(): Array<string> {
  const rememberMe = localStorage.getItem('rememberMe') === 'true'
  const rolesString = rememberMe ? localStorage.getItem('roles') : sessionStorage.getItem('roles')

  try {
    return rolesString ? JSON.parse(rolesString) : []
  } catch (e) {
    console.error('Failed to parse roles:', e)
    return []
  }
}
