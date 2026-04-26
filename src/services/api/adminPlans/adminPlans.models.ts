export interface AdminPlan {
  id: number
  name: string
  price: number
  currency: string
  aiChatLimit: number
  receiptScanLimit: number
  features: string[]
  isPopular: boolean
}

export interface CreateAdminPlanRequest {
  name: string
  price: number
  currency: string
  aiChatLimit: number
  receiptScanLimit: number
  features: string[]
  isPopular: boolean
}

export interface UpdateAdminPlanRequest extends CreateAdminPlanRequest {
  id: number
}

export interface UserPlanAssignmentRequest {
  email: string
  planId: number
}

export interface AdminUserUsageSummary {
  email: string
  name: string
  tier: string
  aiChatUsage: number
  aiChatLimit: number
  receiptScanUsage: number
  receiptScanLimit: number
  lastActive: string
}
