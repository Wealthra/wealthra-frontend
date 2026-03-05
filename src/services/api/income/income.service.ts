import { apiRequest } from '../../apiClient'
import type {
  PaginatedIncomesResponse,
  CreateIncomeRequest,
  UpdateIncomeRequest,
  Income,
  IncomeGeneralInfoResponse,
  IncomesApiListResponse,
  IncomeApiModel,
  IncomeSummaryResponse,
} from './income.models'

export const incomeService = {
  // Legacy endpoints (singular "Income") kept for backward compatibility
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

  // New plural /api/Incomes endpoints

  async apiGetIncomes(params: {
    StartDate?: string
    EndDate?: string
    PageNumber?: number
    PageSize?: number
  } = {}): Promise<IncomesApiListResponse> {
    const searchParams = new URLSearchParams()
    if (params.StartDate) searchParams.append('StartDate', params.StartDate)
    if (params.EndDate) searchParams.append('EndDate', params.EndDate)
    if (params.PageNumber != null) searchParams.append('PageNumber', String(params.PageNumber))
    if (params.PageSize != null) searchParams.append('PageSize', String(params.PageSize))

    const query = searchParams.toString()
    const endpoint = query ? `Incomes?${query}` : 'Incomes'

    return apiRequest<IncomesApiListResponse>(endpoint, {
      method: 'GET',
    })
  },

  async apiCreateIncome(data: IncomeApiModel & { id?: number }): Promise<number> {
    const { id, ...payload } = data
    return apiRequest<number>('Incomes', {
      method: 'POST',
      body: payload,
    })
  },

  async apiGetIncomeById(id: number): Promise<IncomeApiModel> {
    return apiRequest<IncomeApiModel>(`Incomes/${id}`, {
      method: 'GET',
    })
  },

  async apiUpdateIncome(id: number, data: Omit<IncomeApiModel, 'id'>): Promise<void> {
    return apiRequest<void>(`Incomes/${id}`, {
      method: 'PUT',
      body: { id, ...data },
    })
  },

  async apiDeleteIncome(id: number): Promise<void> {
    return apiRequest<void>(`Incomes/${id}`, {
      method: 'DELETE',
    })
  },

  async apiGetIncomeSummary(period: string = 'Monthly'): Promise<IncomeSummaryResponse> {
    return apiRequest<IncomeSummaryResponse>(`Incomes/summary?period=${encodeURIComponent(period)}`, {
      method: 'GET',
    })
  },
}
