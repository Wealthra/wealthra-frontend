export interface Goal {
  id: number
  name: string
  targetAmount: number
  initialAmount: number
  deadline: string
  created?: string
  createdBy?: string
  lastModified?: string
  lastModifiedBy?: string
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
  initialAmount: number
  deadline: string
}

export interface UpdateGoalRequest {
  name: string
  targetAmount: number
  initialAmount: number
  deadline: string
}

export interface GoalTotalResponse {
  totalInitialAmount: number
  totalTargetAmount: number
}
