import { apiRequest } from '../../apiClient'
import type {
  PaginatedExpensesResponse,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  Expense,
  ExpenseGeneralInfoApiResponse,
  ExpensesApiListResponse,
  ExpenseApiModel,
  ExpenseSummaryResponse,
} from './expense.models'

export const expenseService = {

  async getExpenseGeneralInfo(currency?: string): Promise<ExpenseGeneralInfoApiResponse> {
    const query = currency ? `?currency=${encodeURIComponent(currency)}` : ''
    return apiRequest<ExpenseGeneralInfoApiResponse>(`Expenses/generalinfo${query}`, {
      method: 'GET',
    })
  },


  // /api/Expenses endpoints (paginated list, CRUD, summary)

  async getExpenses(params: {
    StartDate?: string
    EndDate?: string
    CategoryId?: number
    PageNumber?: number
    PageSize?: number
    currency?: string
  } = {}): Promise<ExpensesApiListResponse> {
    const searchParams = new URLSearchParams()
    if (params.StartDate) searchParams.append('StartDate', params.StartDate)
    if (params.EndDate) searchParams.append('EndDate', params.EndDate)
    if (params.CategoryId != null) searchParams.append('CategoryId', String(params.CategoryId))
    if (params.PageNumber != null) searchParams.append('PageNumber', String(params.PageNumber))
    if (params.PageSize != null) searchParams.append('PageSize', String(params.PageSize))
    if (params.currency) searchParams.append('currency', params.currency)

    const query = searchParams.toString()
    const endpoint = query ? `Expenses?${query}` : 'Expenses'

    return apiRequest<ExpensesApiListResponse>(endpoint, {
      method: 'GET',
    })
  },

  async getExpensesUser(params: {
    StartDate?: string
    EndDate?: string
    CategoryId?: number
    PageNumber?: number
    PageSize?: number
    currency?: string
  } = {}): Promise<ExpensesApiListResponse> {
    const searchParams = new URLSearchParams()
    if (params.StartDate) searchParams.append('startDate', params.StartDate)
    if (params.EndDate) searchParams.append('endDate', params.EndDate)
    if (params.CategoryId != null) searchParams.append('categoryId', String(params.CategoryId))
    if (params.PageNumber != null) searchParams.append('pageNumber', String(params.PageNumber))
    if (params.PageSize != null) searchParams.append('pageSize', String(params.PageSize))
    if (params.currency) searchParams.append('currency', params.currency)

    const query = searchParams.toString()
    const endpoint = query ? `Expenses/user?${query}` : 'Expenses/user'

    return apiRequest<ExpensesApiListResponse>(endpoint, {
      method: 'GET',
    })
  },

  async createExpense(data: CreateExpenseRequest): Promise<number> {
    return apiRequest<number>('Expenses', {
      method: 'POST',
      body: data,
    })
  },

  async getExpenseById(id: number, currency?: string): Promise<ExpenseApiModel> {
    const query = currency ? `?currency=${encodeURIComponent(currency)}` : ''
    return apiRequest<ExpenseApiModel>(`Expenses/${id}${query}`, {
      method: 'GET',
    })
  },

  async updateExpense(id: number, data: Omit<ExpenseApiModel, 'id'>): Promise<void> {
    return apiRequest<void>(`Expenses/${id}`, {
      method: 'PUT',
      body: { id, ...data },
    })
  },

  async deleteExpense(id: number): Promise<void> {
    return apiRequest<void>(`Expenses/${id}`, {
      method: 'DELETE',
    })
  },

  async getExpenseSummary(period: string = 'Monthly', currency?: string): Promise<ExpenseSummaryResponse> {
    const params = new URLSearchParams({ period })
    if (currency) params.append('currency', currency)
    return apiRequest<ExpenseSummaryResponse>(`Expenses/summary?${params.toString()}`, {
      method: 'GET',
    })
  },
}
