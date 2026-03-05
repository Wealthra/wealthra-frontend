import { apiRequest } from '../../apiClient'
import type { DashboardSummaryResponse } from './summary.models'

export const summaryService = {
  async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    return apiRequest<DashboardSummaryResponse>('Summary/dashboard', {
      method: 'GET',
    })
  },
}

