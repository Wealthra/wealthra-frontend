import { apiRequest } from '../../apiClient'
import type {
  PaginatedBudgetsResponse,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  Budget,
  MonthlyBudgetResponse,
} from './budget.models'

export const budgetService = {
  async getBudgets(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedBudgetsResponse> {
    return apiRequest<PaginatedBudgetsResponse>(
      `Budget?PageNumber=${pageNumber}&PageSize=${pageSize}`,
      {
        method: 'GET',
      }
    )
  },

  async createBudget(budgetData: CreateBudgetRequest): Promise<void> {
    return apiRequest<void>('Budget', {
      method: 'POST',
      body: budgetData,
    })
  },

  async getBudgetById(id: number): Promise<Budget> {
    return apiRequest<Budget>(`Budget/${id}`, {
      method: 'GET',
    })
  },

  async updateBudget(id: number, budgetData: UpdateBudgetRequest): Promise<void> {
    return apiRequest<void>(`Budget/${id}`, {
      method: 'PUT',
      body: budgetData,
    })
  },

  async deleteBudget(id: number): Promise<void> {
    return apiRequest<void>(`Budget/${id}`, {
      method: 'DELETE',
    })
  },

  async getUserBudgets(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedBudgetsResponse> {
    return apiRequest<PaginatedBudgetsResponse>(
      `Budget/user?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: 'GET',
      }
    )
  },

  async getMonthlyBudget(): Promise<MonthlyBudgetResponse> {
    return apiRequest<MonthlyBudgetResponse>(`Budget/monthly`, {
      method: 'GET',
    })
  },
}
