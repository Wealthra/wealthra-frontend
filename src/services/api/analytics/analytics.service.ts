import { apiRequest } from '../../apiClient'
import type { MonthlyCategoryMetricDto } from './analytics.models'

export const analyticsService = {
  async getMetrics(year?: number | string, month?: number | string): Promise<MonthlyCategoryMetricDto[]> {
    const params = new URLSearchParams()
    if (year) params.append('year', String(year))
    if (month) params.append('month', String(month))
    const q = params.toString() ? `?${params.toString()}` : ''

    return apiRequest<MonthlyCategoryMetricDto[]>(`Analytics/metrics${q}`, {
      method: 'GET',
    })
  },
}
