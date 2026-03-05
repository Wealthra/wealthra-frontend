import { apiRequest } from '../../apiClient'
import type {
  CategorySpendingResponse,
  MonthlyDataResponse,
  StatisticsBreakdownResponse,
  StatisticsTrendsResponse,
} from './statistic.models'

export const statisticService = {
  // Legacy endpoints kept for backward compatibility
  async getCategorySpendingByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<CategorySpendingResponse> {
    return apiRequest<CategorySpendingResponse>(
      `Statistic/expenses/category-spending-by-date-range/${userId}?startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
      }
    )
  },

  async getMonthlyUserExpensesByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<MonthlyDataResponse> {
    return apiRequest<MonthlyDataResponse>(
      `Statistic/expenses/monthly-user-expenses-by-date-range/${userId}?startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
      }
    )
  },

  async getMonthlyUserIncomesByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<MonthlyDataResponse> {
    return apiRequest<MonthlyDataResponse>(
      `Statistic/incomes/monthly-user-incomes-by-date-range/${userId}?startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
      }
    )
  },

  // New /api/Statistics endpoints

  async apiGetBreakdown(startDate: string, endDate: string): Promise<StatisticsBreakdownResponse> {
    const params = new URLSearchParams({ StartDate: startDate, EndDate: endDate })
    return apiRequest<StatisticsBreakdownResponse>(`Statistics/breakdown?${params.toString()}`, {
      method: 'GET',
    })
  },

  async apiGetTrends(year: number): Promise<StatisticsTrendsResponse> {
    return apiRequest<StatisticsTrendsResponse>(`Statistics/trends?Year=${year}`, {
      method: 'GET',
    })
  },
}
