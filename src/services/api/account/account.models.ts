export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword?: string
}

export interface UpdateUserRequest {
  userId: string
  firstName: string
  lastName: string
  email: string
}

export interface UserInfoResponse {
  id: string
  firstName: string
  lastName: string
  email: string
}

// New API models based on /api/Account spec

export interface AccountRegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AccountLoginRequest {
  email: string
  password: string
}

export interface AccountAuthResponse {
  id: string
  email: string
  token: string
  refreshToken: string
  refreshTokenExpiration: string
}

export interface AccountProfileResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl: string
  preferredCurrency: string
  isAdmin: boolean
  createdAt: string
}

export interface AccountUpdateProfileRequest {
  firstName: string
  lastName: string
  avatarUrl: string
}

export interface AccountUpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface AccountForgotPasswordRequest {
  email: string
}

export interface AccountResetPasswordRequest {
  email: string
  code: string
  newPassword: string
}

export interface AccountChangePreferredCurrencyRequest {
  currency: string
}

export interface AccountUpdateUserTierRequest {
  email: string
  tier: string
}

export interface AccountUserUsageResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  subscriptionTier: number
  subscriptionPlanId: number
  subscriptionPlanName: string
  ocrRequestsThisMonth: number
  sttRequestsThisMonth: number
  lastUsageActivityDate: string | null
}
