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
} from './account.models'

export const accountService = {
  async register(userData: RegisterRequest): Promise<void> {
    return apiRequest<void>('Account/register', {
      method: 'POST',
      body: userData,
      requiresAuth: false,
    })
  },

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

  // New API endpoints based on /api/Account spec

  async apiRegister(data: AccountRegisterRequest): Promise<string> {
    return apiRequest<string>('Account/register', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    })
  },

  async apiLogin(credentials: AccountLoginRequest): Promise<AccountAuthResponse> {
    return apiRequest<AccountAuthResponse>('Account/login', {
      method: 'POST',
      body: credentials,
      requiresAuth: false,
    })
  },

  async refreshToken(): Promise<AccountAuthResponse> {
    // Refresh relies on the backend-managed refresh-token cookie, not the access token.
    // We explicitly disable requiresAuth so that 401 handling does not recurse on this call.
    return apiRequest<AccountAuthResponse>('Account/refresh-token', {
      method: 'POST',
      requiresAuth: false,
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
}
