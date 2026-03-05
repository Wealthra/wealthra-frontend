import { apiRequest } from '../../apiClient'
import type {
  PaginatedGoalsResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
  Goal,
  GoalTotalResponse,
  GoalsApiListResponse,
} from './goal.models'

export const goalService = {
  // Legacy endpoints (singular "Goal") kept for backward compatibility
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

  // New plural /api/Goals endpoints

  async apiGetGoals(): Promise<GoalsApiListResponse> {
    return apiRequest<GoalsApiListResponse>('Goals', {
      method: 'GET',
    })
  },

  async apiCreateGoal(data: Omit<Goal, 'id' | 'created' | 'createdBy' | 'lastModified' | 'lastModifiedBy'>): Promise<number> {
    const payload = {
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount ?? data.initialAmount,
      deadline: data.deadline,
    }
    return apiRequest<number>('Goals', {
      method: 'POST',
      body: payload,
    })
  },

  async apiGetGoalById(id: number): Promise<Goal> {
    return apiRequest<Goal>(`Goals/${id}`, {
      method: 'GET',
    })
  },

  async apiUpdateGoal(
    id: number,
    data: Omit<Goal, 'id' | 'created' | 'createdBy' | 'lastModified' | 'lastModifiedBy'>
  ): Promise<void> {
    const payload = {
      id,
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount ?? data.initialAmount,
      deadline: data.deadline,
    }
    return apiRequest<void>(`Goals/${id}`, {
      method: 'PUT',
      body: payload,
    })
  },

  async apiDeleteGoal(id: number): Promise<void> {
    return apiRequest<void>(`Goals/${id}`, {
      method: 'DELETE',
    })
  },
}
