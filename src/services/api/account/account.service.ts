import { apiRequest } from '../../apiClient'
import type {
  RegisterRequest,
  AccountRegisterRequest,
  AccountLoginRequest,
  AccountAuthResponse,
  AccountProfileResponse,
  AccountUpdateProfileRequest,
  AccountUpdatePasswordRequest,
  AccountForgotPasswordRequest,
  AccountResetPasswordRequest,
  AccountChangePreferredCurrencyRequest,
  AccountUpdateUserTierRequest,
  AccountUserUsageResponse
} from './account.models'

export const accountService = {

  async confirmEmail(userId: string, code: string): Promise<void> {
    return apiRequest<void>(`Account/confirm-email?userId=${userId}&code=${code}`, {
      method: 'GET',
      requiresAuth: false,
    })
  },

  async forgotPassword(email: string): Promise<void> {
    return apiRequest<void>('Account/forgot-password', {
      method: 'POST',
      body: { email } as AccountForgotPasswordRequest,
      requiresAuth: false,
    })
  },

  async resetPassword(data: AccountResetPasswordRequest): Promise<void> {
    return apiRequest<void>('Account/reset-password', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    })
  },

  async verifyResetCode(email: string, code: string): Promise<void> {
    return apiRequest<void>('Account/verify-reset-code', {
      method: 'POST',
      body: { email, code },
      requiresAuth: false,
    })
  },

  // New API endpoints based on /api/Account spec

  async register(data: AccountRegisterRequest): Promise<string> {
    return apiRequest<string>('Account/register', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    })
  },

  async login(credentials: AccountLoginRequest): Promise<AccountAuthResponse> {
    return apiRequest<AccountAuthResponse>('Account/login', {
      method: 'POST',
      body: credentials,
      requiresAuth: false,
    })
  },

  async refreshToken(): Promise<AccountAuthResponse> {
    const { getAuthToken, getRefreshToken } = await import('../../../utils/auth')
    const currentToken = getAuthToken()
    const currentRefreshToken = getRefreshToken()

    const headers: Record<string, string> = {}
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`
    }

    return apiRequest<AccountAuthResponse>('Account/refresh-token', {
      method: 'POST',
      headers,
      body: {
        token: currentToken || '',
        refreshToken: currentRefreshToken || '',
      },
      requiresAuth: false,
      credentials: 'include',
    })
  },

  async revokeToken(): Promise<void> {
    return apiRequest<void>('Account/revoke-token', {
      method: 'POST',
    })
  },

  async getMe(): Promise<AccountProfileResponse> {
    return apiRequest<AccountProfileResponse>('Account/me', {
      method: 'GET',
    })
  },

  async updateProfile(data: AccountUpdateProfileRequest): Promise<void> {
    return apiRequest<void>('Account/update-profile', {
      method: 'PUT',
      body: data,
    })
  },

  async changePassword(data: AccountUpdatePasswordRequest): Promise<void> {
    return apiRequest<void>('Account/update-password', {
      method: 'PUT',
      body: data,
    })
  },

  async deleteMe(): Promise<void> {
    return apiRequest<void>('Account/me', {
      method: 'DELETE',
    })
  },

  async changePreferredCurrency(data: AccountChangePreferredCurrencyRequest): Promise<void> {
    return apiRequest<void>('Account/preferred-currency', {
      method: 'PUT',
      body: data,
    })
  },

  async updateTier(data: AccountUpdateUserTierRequest): Promise<void> {
    return apiRequest<void>('Account/admin/update-tier', {
      method: 'PUT',
      body: data,
    })
  },

  async getMeUsage(): Promise<AccountUserUsageResponse> {
    return apiRequest<AccountUserUsageResponse>('Account/me/usage', {
      method: 'GET',
    })
  },

  async getAdminUsages(email?: string, name?: string): Promise<AccountUserUsageResponse[]> {
    const params = new URLSearchParams()
    if (email) params.append('email', email)
    if (name) params.append('name', name)
    const q = params.toString() ? `?${params.toString()}` : ''
    
    return apiRequest<AccountUserUsageResponse[]>(`Account/admin/usages${q}`, {
      method: 'GET',
    })
  },
}
