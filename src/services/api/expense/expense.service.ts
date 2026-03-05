import { apiRequest } from '../../apiClient'
import type {
  PaginatedExpensesResponse,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  Expense,
  ExpenseGeneralInfoResponse,
  ExpensesApiListResponse,
  ExpenseApiModel,
  ExpenseSummaryResponse,
} from './expense.models'

export const expenseService = {
  // Legacy endpoints (singular "Expense") kept for backward compatibility
  async getExpenses(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedExpensesResponse> {
    return apiRequest<PaginatedExpensesResponse>(
      `Expense?PageNumber=${pageNumber}&PageSize=${pageSize}`,
      {
        method: 'GET',
      }
    )
  },

  async createExpense(expenseData: CreateExpenseRequest): Promise<void> {
    return apiRequest<void>('Expense', {
      method: 'POST',
      body: expenseData,
    })
  },

  async getExpenseById(id: number): Promise<Expense> {
    return apiRequest<Expense>(`Expense/${id}`, {
      method: 'GET',
    })
  },

  async updateExpense(id: number, expenseData: UpdateExpenseRequest): Promise<void> {
    return apiRequest<void>(`Expense/${id}`, {
      method: 'PUT',
      body: expenseData,
    })
  },

  async deleteExpense(id: number): Promise<void> {
    return apiRequest<void>(`Expense/${id}`, {
      method: 'DELETE',
    })
  },

  async getUserExpenses(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedExpensesResponse> {
    return apiRequest<PaginatedExpensesResponse>(
      `Expense/user?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: 'GET',
      }
    )
  },

  async getExpenseGeneralInfo(): Promise<ExpenseGeneralInfoResponse> {
    return apiRequest<ExpenseGeneralInfoResponse>(`Expense/generalinfo`, {
      method: 'GET',
    })
  },

  async getExpensesByCategory(
    categoryId: number,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedExpensesResponse> {
    return apiRequest<PaginatedExpensesResponse>(
      `Expense/category/${categoryId}/user?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: 'GET',
      }
    )
  },

  // New plural /api/Expenses endpoints

  async apiGetExpenses(params: {
    StartDate?: string
    EndDate?: string
    CategoryId?: number
    PageNumber?: number
    PageSize?: number
  } = {}): Promise<ExpensesApiListResponse> {
    const searchParams = new URLSearchParams()
    if (params.StartDate) searchParams.append('StartDate', params.StartDate)
    if (params.EndDate) searchParams.append('EndDate', params.EndDate)
    if (params.CategoryId != null) searchParams.append('CategoryId', String(params.CategoryId))
    if (params.PageNumber != null) searchParams.append('PageNumber', String(params.PageNumber))
    if (params.PageSize != null) searchParams.append('PageSize', String(params.PageSize))

    const query = searchParams.toString()
    const endpoint = query ? `Expenses?${query}` : 'Expenses'

    return apiRequest<ExpensesApiListResponse>(endpoint, {
      method: 'GET',
    })
  },

  async apiCreateExpense(data: ExpenseApiModel & { id?: number }): Promise<number> {
    const { id, ...payload } = data
    return apiRequest<number>('Expenses', {
      method: 'POST',
      body: payload,
    })
  },

  async apiGetExpenseById(id: number): Promise<ExpenseApiModel> {
    return apiRequest<ExpenseApiModel>(`Expenses/${id}`, {
      method: 'GET',
    })
  },

  async apiUpdateExpense(id: number, data: Omit<ExpenseApiModel, 'id'>): Promise<void> {
    return apiRequest<void>(`Expenses/${id}`, {
      method: 'PUT',
      body: { id, ...data },
    })
  },

  async apiDeleteExpense(id: number): Promise<void> {
    return apiRequest<void>(`Expenses/${id}`, {
      method: 'DELETE',
    })
  },

  async apiGetExpenseSummary(period: string = 'Monthly'): Promise<ExpenseSummaryResponse> {
    return apiRequest<ExpenseSummaryResponse>(`Expenses/summary?period=${encodeURIComponent(period)}`, {
      method: 'GET',
    })
  },
}
