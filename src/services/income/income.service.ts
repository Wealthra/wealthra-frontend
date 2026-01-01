import { apiRequest } from '../ApiClient'
import type {
  PaginatedIncomesResponse,
  CreateIncomeRequest,
  UpdateIncomeRequest,
  Income,
  IncomeGeneralInfoResponse,
} from './income.models'

export const incomeService = {
  async getIncomes(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedIncomesResponse> {
    return apiRequest<PaginatedIncomesResponse>(
      `Income?PageNumber=${pageNumber}&PageSize=${pageSize}`,
      {
        method: 'GET',
      }
    )
  },

  async createIncome(incomeData: CreateIncomeRequest): Promise<void> {
    return apiRequest<void>('Income', {
      method: 'POST',
      body: incomeData,
    })
  },

  async getIncomeById(id: number): Promise<Income> {
    return apiRequest<Income>(`Income/${id}`, {
      method: 'GET',
    })
  },

  async updateIncome(id: number, incomeData: UpdateIncomeRequest): Promise<void> {
    return apiRequest<void>(`Income/${id}`, {
      method: 'PUT',
      body: incomeData,
    })
  },

  async deleteIncome(id: number): Promise<void> {
    return apiRequest<void>(`Income/${id}`, {
      method: 'DELETE',
    })
  },

  async getUserIncomes(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedIncomesResponse> {
    return apiRequest<PaginatedIncomesResponse>(
      `Income/user?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: 'GET',
      }
    )
  },

  async getIncomeGeneralInfo(): Promise<IncomeGeneralInfoResponse> {
    return apiRequest<IncomeGeneralInfoResponse>(`Income/generalinfo`, {
      method: 'GET',
    })
  },
}
