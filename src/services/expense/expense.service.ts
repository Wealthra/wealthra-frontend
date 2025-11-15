import { apiRequest } from '../apiClient'
import type {
  PaginatedExpensesResponse,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  Expense,
  ExpenseGeneralInfoResponse,
} from './expense.models'

export const expenseService = {
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
}
