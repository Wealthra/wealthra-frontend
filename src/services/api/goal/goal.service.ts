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
  async getGoals(currency?: string): Promise<Goal[]> {
    const query = currency ? `?currency=${encodeURIComponent(currency)}` : ''
    return apiRequest<Goal[]>(`Goals${query}`, { method: 'GET' })
  },

  /** POST /api/Goals - body: name, targetAmount, currentAmount, deadline */
  async createGoal(data: CreateGoalRequest): Promise<number> {
    return apiRequest<number>('Goals', {
      method: 'POST',
      body: {
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount,
        currency: data.currency,
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
        currency: data.currency,
        deadline: data.deadline,
      },
    })
  },

  /** DELETE /api/Goals/{id} */
  async deleteGoal(id: number): Promise<void> {
    return apiRequest<void>(`Goals/${id}`, { method: 'DELETE' })
  },

  /** GET /api/Goals/user - paginated list */
  async getGoalsUser(
    pageNumber: number = 1,
    pageSize: number = 10,
    currency?: string
  ): Promise<GoalsUserResponse> {
    let url = `Goals/user?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (currency) url += `&currency=${encodeURIComponent(currency)}`
    return apiRequest<GoalsUserResponse>(url, { method: 'GET' })
  },

  /** GET /api/Goals/total */
  async getGoalsTotal(currency?: string): Promise<GoalsTotalResponse> {
    const query = currency ? `?currency=${encodeURIComponent(currency)}` : ''
    return apiRequest<GoalsTotalResponse>(`Goals/total${query}`, { method: 'GET' })
  },
}
