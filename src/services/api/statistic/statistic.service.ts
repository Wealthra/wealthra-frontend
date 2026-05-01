import { apiRequest } from '../../apiClient'
import type {
  CategorySpendingResponse,
  MonthlyDataResponse,
  StatisticsBreakdownResponse,
  StatisticsTrendsResponse,
} from './statistic.models'

export const statisticService = {

  // New /api/Statistics endpoints

  async getBreakdown(startDate: string, endDate: string): Promise<StatisticsBreakdownResponse> {
    const params = new URLSearchParams({ StartDate: startDate, EndDate: endDate })
    return apiRequest<StatisticsBreakdownResponse>(`Statistics/breakdown?${params.toString()}`, {
      method: 'GET',
    })
  },

  async getTrends(year: number): Promise<StatisticsTrendsResponse> {
    return apiRequest<StatisticsTrendsResponse>(`Statistics/trends?Year=${year}`, {
      method: 'GET',
    })
  },
}
