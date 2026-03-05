export interface Goal {
  id: number
  name: string
  targetAmount: number
  // Legacy field from old API
  initialAmount: number
  // New API field corresponding to backend "currentAmount"
  currentAmount?: number
  deadline: string
  created?: string
  createdBy?: string
  lastModified?: string
  lastModifiedBy?: string
  // New API fields from /api/Goals DTO
  progressPercentage?: number
  isCompleted?: boolean
}

export interface PaginatedGoalsResponse {
  pageNumber: number
  pageSize: number
  data: Goal[]
  hasMoreItems: boolean
  totalCount: number
  totalPages: number
}

export interface CreateGoalRequest {
  name: string
  targetAmount: number
  // Legacy field from old API
  initialAmount: number
  // New API field corresponding to backend "currentAmount"
  currentAmount?: number
  deadline: string
}

export interface UpdateGoalRequest {
  name: string
  targetAmount: number
  // Legacy field from old API
  initialAmount: number
  // New API field corresponding to backend "currentAmount"
  currentAmount?: number
  deadline: string
}

export interface GoalTotalResponse {
  totalInitialAmount: number
  totalTargetAmount: number
}

// New API models based on /api/Goals spec

export type GoalsApiListResponse = Goal[]
