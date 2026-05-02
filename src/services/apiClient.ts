import { production } from './production'
import { getAuthToken } from '../utils/auth'

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  // Accept any payload type; serialization/casting is handled inside apiRequest.
  body?: unknown
  headers?: Record<string, string>
  requiresAuth?: boolean
  isFormData?: boolean
  credentials?: RequestCredentials
}

export interface ApiError {
  message?: string
  detail?: string
  title?: string
  errors?: string[]
  status: number
}

export class ApiErrorException extends Error {
  status: number
  errors?: string[]

  constructor(message: string, status: number, errors?: string[]) {
    super(message)
    this.name = 'ApiErrorException'
    this.status = status
    this.errors = errors
  }
}

export async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, requiresAuth = true, isFormData = false } = options

  const url = `${production.apiUrl}/api/${endpoint}`

  const requestHeaders: Record<string, string> = { ...headers }

  if (!isFormData && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  if (requiresAuth) {
    const authToken = getAuthToken()
    if (authToken) {
      requestHeaders['Authorization'] = `Bearer ${authToken}`
    }
  }

  // Public endpoints should not send cookies by default: stale session cookies can cause 401
  // on endpoints meant to be anonymous (e.g. active announcements).
  const baseRequestInit: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: options.credentials || (requiresAuth ? 'include' : 'omit'),
  }

  const createRequestInit = (): RequestInit => {
    const init: RequestInit = { ...baseRequestInit }

    if (body) {
      if (isFormData) {
        init.body = body as BodyInit
      } else {
        init.body = JSON.stringify(body)
      }
    }

    return init
  }

  const response = await fetch(url, createRequestInit())

  if (!response.ok) {
    let errorData: ApiError
    try {
      const errorText = await response.text()
      if (errorText) {
        errorData = JSON.parse(errorText)
      } else {
        errorData = { message: response.statusText, status: response.status }
      }
    } catch {
      errorData = { message: response.statusText || 'An error occurred', status: response.status }
    }

    // Handle 401 Unauthorized - attempt to transparently refresh the access token
    if (response.status === 401 && requiresAuth) {
      try {
        const { accountService } = await import('./api/account/account.service')
        const authData = await accountService.refreshToken()

        if (authData && authData.token) {
          const authUtils = await import('../utils/auth')
          // Map backend response (id, email, token, refreshToken) to internal setAuth
          authUtils.setAuth(authData.token, authData.id, [], authData.email, authData.refreshToken)

          // Retry the original request with the new token
          return await apiRequest<T>(endpoint, options)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
      }

      // If refresh fails or returns no token, clear auth and redirect to login
      const authUtils = await import('../utils/auth')
      authUtils.clearAuth()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    throw new ApiErrorException(
      errorData.detail || errorData.message || errorData.title || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData.errors
    )
  }

  // Handle blob responses (for images, pdf, excel)
  const contentType = response.headers.get('content-type')
  if (contentType && (
    contentType.includes('image') || 
    contentType.includes('application/pdf') || 
    contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
    contentType.includes('application/octet-stream')
  )) {
    return (await response.blob()) as T
  }

  // Handle empty responses
  const text = await response.text()
  if (!text) {
    return {} as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    return text as T
  }
}
