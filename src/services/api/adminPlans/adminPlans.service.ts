import { apiRequest } from '../../apiClient'
import type {
  AdminPlan,
  CreateAdminPlanRequest,
  UpdateAdminPlanRequest,
  UserPlanAssignmentRequest,
  AdminUsageSummary,
  AdminUserUsage,
} from './adminPlans.models'

export const adminPlansService = {
  async getPlans(includeInactive: boolean = false): Promise<AdminPlan[]> {
    return apiRequest<AdminPlan[]>(`AdminPlans/plans?includeInactive=${includeInactive}`, {
      method: 'GET',
    })
  },

  async createPlan(data: CreateAdminPlanRequest): Promise<number> {
    // Swagger shows POST returns 201 with the created ID as body (text/plain)
    return apiRequest<number>('AdminPlans/plans', {
      method: 'POST',
      body: data,
    })
  },

  async updatePlan(id: number, data: UpdateAdminPlanRequest): Promise<void> {
    return apiRequest<void>(`AdminPlans/plans/${id}`, {
      method: 'PUT',
      body: data,
    })
  },

  async deletePlan(id: number): Promise<void> {
    return apiRequest<void>(`AdminPlans/plans/${id}`, {
      method: 'DELETE',
    })
  },

  async assignPlanToUser(data: UserPlanAssignmentRequest): Promise<void> {
    return apiRequest<void>('AdminPlans/plans/assign', {
      method: 'PUT',
      body: data,
    })
  },

  async getPlanUsers(id: number): Promise<AdminUserUsage[]> {
    return apiRequest<AdminUserUsage[]>(`AdminPlans/plans/${id}/users`, {
      method: 'GET',
    })
  },

  async getUsageSummary(): Promise<AdminUsageSummary> {
    return apiRequest<AdminUsageSummary>('AdminPlans/usage/summary', {
      method: 'GET',
    })
  },
}
