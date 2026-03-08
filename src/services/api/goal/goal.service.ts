import { apiRequest } from '../../apiClient'
import type {
  Goal,
  GoalsApiListResponse,
  GoalsTotalResponse,
  GoalsUserResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
} from './goal.models'

export const goalService = {
  /** GET /api/Goals - list all goals */
  async getGoals(): Promise<Goal[]> {
    return apiRequest<GoalsApiListResponse>('Goals', { method: 'GET' })
  },

  /** POST /api/Goals - body: name, targetAmount, currentAmount, deadline */
  async createGoal(data: CreateGoalRequest): Promise<number> {
    return apiRequest<number>('Goals', {
      method: 'POST',
      body: {
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount,
        deadline: data.deadline,
      },
    })
  },

  /** GET /api/Goals/{id} */
  async getGoalById(id: number): Promise<Goal> {
    return apiRequest<Goal>(`Goals/${id}`, { method: 'GET' })
  },

  /** PUT /api/Goals/{id} - body: id, name, targetAmount, currentAmount, deadline */
  async updateGoal(id: number, data: UpdateGoalRequest): Promise<void> {
    return apiRequest<void>(`Goals/${id}`, {
      method: 'PUT',
      body: {
        id,
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount,
        deadline: data.deadline,
      },
    })
  },

  /** DELETE /api/Goals/{id} */
  async deleteGoal(id: number): Promise<void> {
    return apiRequest<void>(`Goals/${id}`, { method: 'DELETE' })
  },

  /** GET /api/Goals/user - paginated list */
  async getGoalsUser(pageNumber: number = 1, pageSize: number = 10): Promise<GoalsUserResponse> {
    return apiRequest<GoalsUserResponse>(
      `Goals/user?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { method: 'GET' }
    )
  },

  /** GET /api/Goals/total */
  async getGoalsTotal(): Promise<GoalsTotalResponse> {
    return apiRequest<GoalsTotalResponse>('Goals/total', { method: 'GET' })
  },
}
