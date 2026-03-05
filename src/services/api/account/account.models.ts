export interface AuthenticateRequest {
  email: string
  password: string
}

export interface AuthenticateResponse {
  jwToken: string
  id: string
  roles: string[]
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface UpdateUserRequest {
  userId: string
  firstName: string
  lastName: string
  email: string
}

export interface UpdatePasswordRequest {
  userId: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  password: string
  confirmPassword: string
}

export interface UserInfoResponse {
  id: string
  firstName: string
  lastName: string
  email: string
}
