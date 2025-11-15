import { production } from './production'
import { getAuthToken } from '../utils/auth'

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  requiresAuth?: boolean
  isFormData?: boolean
}

export interface ApiError {
  message: string
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

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  if (body) {
    if (isFormData) {
      requestOptions.body = body
    } else {
      requestOptions.body = JSON.stringify(body)
    }
  }

  const response = await fetch(url, requestOptions)

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

    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      // Clear auth data
      const authUtils = await import('../utils/auth')
      authUtils.clearAuth()
      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    throw new ApiErrorException(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData.errors
    )
  }

  // Handle blob responses (for images)
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('image')) {
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
