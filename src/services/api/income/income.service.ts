import { apiRequest } from '../../apiClient'
import type {
  IncomesApiListResponse,
  IncomeApiModel,
  IncomeSummaryResponse,
  IncomesGeneralInfoResponse,
} from './income.models'

export const incomeService = {
  async getIncomes(params: {
    StartDate?: string
    EndDate?: string
    PageNumber?: number
    PageSize?: number
    currency?: string
  } = {}): Promise<IncomesApiListResponse> {
    const searchParams = new URLSearchParams()
    if (params.StartDate) searchParams.append('StartDate', params.StartDate)
    if (params.EndDate) searchParams.append('EndDate', params.EndDate)
    if (params.PageNumber != null) searchParams.append('PageNumber', String(params.PageNumber))
    if (params.PageSize != null) searchParams.append('PageSize', String(params.PageSize))
    if (params.currency) searchParams.append('currency', params.currency)

    const query = searchParams.toString()
    const endpoint = query ? `Incomes?${query}` : 'Incomes'

    return apiRequest<IncomesApiListResponse>(endpoint, {
      method: 'GET',
    })
  },

  async createIncome(data: IncomeApiModel & { id?: number }): Promise<number> {
    const { id, ...payload } = data
    return apiRequest<number>('Incomes', {
      method: 'POST',
      body: payload,
    })
  },

  async getIncomeById(id: number, currency?: string): Promise<IncomeApiModel> {
    const query = currency ? `?currency=${encodeURIComponent(currency)}` : ''
    return apiRequest<IncomeApiModel>(`Incomes/${id}${query}`, {
      method: 'GET',
    })
  },

  async updateIncome(id: number, data: Omit<IncomeApiModel, 'id'>): Promise<void> {
    return apiRequest<void>(`Incomes/${id}`, {
      method: 'PUT',
      body: { id, ...data },
    })
  },

  async deleteIncome(id: number): Promise<void> {
    return apiRequest<void>(`Incomes/${id}`, {
      method: 'DELETE',
    })
  },

  async getIncomeSummary(period: string = 'Monthly', currency?: string): Promise<IncomeSummaryResponse> {
    const params = new URLSearchParams({ period })
    if (currency) params.append('currency', currency)
    return apiRequest<IncomeSummaryResponse>(
      `Incomes/summary?${params.toString()}`,
      {
        method: 'GET',
      }
    )
  },

  async getIncomeGeneralInfo(currency?: string): Promise<IncomesGeneralInfoResponse> {
    const query = currency ? `?currency=${encodeURIComponent(currency)}` : ''
    return apiRequest<IncomesGeneralInfoResponse>(`Incomes/generalinfo${query}`, {
      method: 'GET',
    })
  },
}
