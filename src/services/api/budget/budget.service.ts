import { apiRequest } from '../../apiClient'
import type {
  PaginatedBudgetsResponse,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  Budget,
  MonthlyBudgetResponse,
  BudgetApiModel,
  BudgetsOverviewResponse,
} from './budget.models'

export const budgetService = {
  // Legacy endpoints (singular "Budget") kept for backward compatibility
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

  // New plural /api/Budgets endpoints

  async apiGetBudgets(): Promise<BudgetApiModel[]> {
    return apiRequest<BudgetApiModel[]>('Budgets', {
      method: 'GET',
    })
  },

  async apiCreateBudget(data: { categoryId: number; limitAmount: number }): Promise<number> {
    return apiRequest<number>('Budgets', {
      method: 'POST',
      body: data,
    })
  },

  async apiGetBudgetById(id: number): Promise<BudgetApiModel> {
    return apiRequest<BudgetApiModel>(`Budgets/${id}`, {
      method: 'GET',
    })
  },

  async apiUpdateBudget(id: number, limitAmount: number): Promise<void> {
    return apiRequest<void>(`Budgets/${id}`, {
      method: 'PUT',
      body: { id, limitAmount },
    })
  },

  async apiDeleteBudget(id: number): Promise<void> {
    return apiRequest<void>(`Budgets/${id}`, {
      method: 'DELETE',
    })
  },

  async apiGetBudgetsOverview(): Promise<BudgetsOverviewResponse> {
    return apiRequest<BudgetsOverviewResponse>('Budgets/overview', {
      method: 'GET',
    })
  },
}
