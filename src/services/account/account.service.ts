import { apiRequest } from '../apiClient'
import type {
  AuthenticateRequest,
  AuthenticateResponse,
  RegisterRequest,
  UpdateUserRequest,
  UpdatePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UserInfoResponse,
} from './account.models'

export const accountService = {
  async authenticate(email: string, password: string): Promise<AuthenticateResponse> {
    return apiRequest<AuthenticateResponse>('Account/authenticate', {
      method: 'POST',
      body: { email, password } as AuthenticateRequest,
      requiresAuth: false,
    })
  },

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
      body: { email } as ForgotPasswordRequest,
      requiresAuth: false,
    })
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    return apiRequest<void>('Account/reset-password', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    })
  },

  async updateUser(userId: string, userData: Omit<UpdateUserRequest, 'userId'>): Promise<void> {
    return apiRequest<void>('Account/update-user', {
      method: 'PUT',
      body: { ...userData, userId } as UpdateUserRequest,
    })
  },

  async updatePassword(
    userId: string,
    passwordData: Omit<UpdatePasswordRequest, 'userId'>
  ): Promise<void> {
    return apiRequest<void>('Account/update-password', {
      method: 'PUT',
      body: { ...passwordData, userId } as UpdatePasswordRequest,
    })
  },

  async uploadProfileImage(userId: string, imageFile: File): Promise<void> {
    const formData = new FormData()
    formData.append('imageFile', imageFile)

    return apiRequest<void>(`Account/upload-profile-image?userId=${userId}`, {
      method: 'POST',
      body: formData,
      isFormData: true,
    })
  },

  async getProfileImage(userId: string): Promise<Blob> {
    return apiRequest<Blob>(`Account/profile-image/${userId}`, {
      method: 'GET',
    })
  },

  async deleteProfileImage(userId: string): Promise<void> {
    return apiRequest<void>(`Account/profile-image?userId=${userId}`, {
      method: 'DELETE',
    })
  },

  async getUserInfo(userId: string): Promise<UserInfoResponse> {
    return apiRequest<UserInfoResponse>(`Account/user-info?UserId=${userId}`, {
      method: 'GET',
    })
  },
}
