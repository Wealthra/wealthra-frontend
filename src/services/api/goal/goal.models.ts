export interface Goal {
  id: number
  name: string
  targetAmount: number
  currentAmount: number
  currency: string
  progressPercentage?: number
  deadline: string
  isCompleted?: boolean
  // Optional from /api/Goals/user
  achievedAmount?: number
  notAchievedAmount?: number
  // Legacy/compat
  initialAmount?: number
}

/** GET /api/Goals - returns array */
export type GoalsApiListResponse = Goal[]

/** GET /api/Goals/total */
export interface GoalsTotalResponse {
  totalTargetAmount: number
  totalCurrentAmount: number
  overallProgressPercentage?: number
  totalGoals: number
  achievedGoals: number
  notAchievedGoals: number
}

/** GET /api/Goals/user - paginated */
export interface GoalsUserResponse {
  items: Goal[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

/** POST /api/Goals body */
export interface CreateGoalRequest {
  name: string
  targetAmount: number
  currentAmount: number
  currency: string
  deadline: string
}

/** PUT /api/Goals/{id} body */
export interface UpdateGoalRequest {
  id: number
  name: string
  targetAmount: number
  currentAmount: number
  currency: string
  deadline: string
}
