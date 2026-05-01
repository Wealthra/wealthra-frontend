import { apiRequest } from '../../apiClient'
import type {
  PaginatedBudgetsResponse,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  Budget,
  MonthlyBudgetResponse,
  BudgetApiModel,
  BudgetsOverviewResponse,
  BudgetsMonthlyResponse,
} from './budget.models'

export const budgetService = {

  // New plural /api/Budgets endpoints

  async getBudgets(): Promise<BudgetApiModel[]> {
    return apiRequest<BudgetApiModel[]>('Budgets', {
      method: 'GET',
    })
  },

  async createBudget(data: { categoryId: number; limitAmount: number; currency: string }): Promise<number> {
    return apiRequest<number>('Budgets', {
      method: 'POST',
      body: data,
    })
  },

  async getBudgetById(id: number): Promise<BudgetApiModel> {
    return apiRequest<BudgetApiModel>(`Budgets/${id}`, {
      method: 'GET',
    })
  },

  async updateBudget(id: number, limitAmount: number, currency: string): Promise<void> {
    return apiRequest<void>(`Budgets/${id}`, {
      method: 'PUT',
      body: { id, limitAmount, currency },
    })
  },

  async deleteBudget(id: number): Promise<void> {
    return apiRequest<void>(`Budgets/${id}`, {
      method: 'DELETE',
    })
  },

  async getBudgetsOverview(currency?: string): Promise<BudgetsOverviewResponse> {
    const query = currency ? `?currency=${encodeURIComponent(currency)}` : ''
    return apiRequest<BudgetsOverviewResponse>(`Budgets/overview${query}`, {
      method: 'GET',
    })
  },

  async getBudgetsMonthly(): Promise<BudgetsMonthlyResponse> {
    return apiRequest<BudgetsMonthlyResponse>('Budgets/monthly', {
      method: 'GET',
    })
  },
}
