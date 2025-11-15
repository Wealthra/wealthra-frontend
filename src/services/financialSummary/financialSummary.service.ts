import { apiRequest } from '../apiClient'
import type { FinancialSummaryResponse } from './financialSummary.models'

export const financialSummaryService = {
  async getUserFinancialSummary(userId: string): Promise<FinancialSummaryResponse> {
    return apiRequest<FinancialSummaryResponse>(`FinancialSummary/user/${userId}`, {
      method: 'GET',
    })
  },
}
