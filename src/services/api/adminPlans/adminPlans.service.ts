import { apiRequest } from '../../apiClient'
import type {
  AdminPlan,
  CreateAdminPlanRequest,
  UpdateAdminPlanRequest,
  UserPlanAssignmentRequest,
  AdminUserUsageSummary,
} from './adminPlans.models'

export const adminPlansService = {
  async getPlans(): Promise<AdminPlan[]> {
    return apiRequest<AdminPlan[]>('AdminPlans', {
      method: 'GET',
    })
  },

  async createPlan(data: CreateAdminPlanRequest): Promise<AdminPlan> {
    return apiRequest<AdminPlan>('AdminPlans', {
      method: 'POST',
      body: data,
    })
  },

  async updatePlan(id: number, data: UpdateAdminPlanRequest): Promise<void> {
    return apiRequest<void>(`AdminPlans/${id}`, {
      method: 'PUT',
      body: data,
    })
  },

  async deletePlan(id: number): Promise<void> {
    return apiRequest<void>(`AdminPlans/${id}`, {
      method: 'DELETE',
    })
  },

  async assignPlanToUser(data: UserPlanAssignmentRequest): Promise<void> {
    return apiRequest<void>('AdminPlans/assign', {
      method: 'POST',
      body: data,
    })
  },

  async getUserUsages(): Promise<AdminUserUsageSummary[]> {
    return apiRequest<AdminUserUsageSummary[]>('AdminPlans/usages', {
      method: 'GET',
    })
  },
}
