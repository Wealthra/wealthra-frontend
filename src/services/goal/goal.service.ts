import { apiRequest } from '../apiClient'
import type {
  PaginatedGoalsResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
  Goal,
  GoalTotalResponse,
} from './goal.models'

export const goalService = {
  async getGoals(pageNumber: number = 1, pageSize: number = 10): Promise<PaginatedGoalsResponse> {
    return apiRequest<PaginatedGoalsResponse>(
      `Goal?PageNumber=${pageNumber}&PageSize=${pageSize}`,
      {
        method: 'GET',
      }
    )
  },

  async createGoal(goalData: CreateGoalRequest): Promise<void> {
    return apiRequest<void>('Goal', {
      method: 'POST',
      body: goalData,
    })
  },

  async getGoalById(id: number): Promise<Goal> {
    return apiRequest<Goal>(`Goal/${id}`, {
      method: 'GET',
    })
  },

  async updateGoal(id: number, goalData: UpdateGoalRequest): Promise<void> {
    return apiRequest<void>(`Goal/${id}`, {
      method: 'PUT',
      body: goalData,
    })
  },

  async deleteGoal(id: number): Promise<void> {
    return apiRequest<void>(`Goal/${id}`, {
      method: 'DELETE',
    })
  },

  async getUserGoals(): Promise<Goal[]> {
    return apiRequest<Goal[]>(`Goal/user`, {
      method: 'GET',
    })
  },

  async getGoalTotal(): Promise<GoalTotalResponse> {
    return apiRequest<GoalTotalResponse>(`Goal/total`, {
      method: 'GET',
    })
  },
}
