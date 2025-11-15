import { apiRequest } from '../apiClient'
import type { CategorySpendingResponse, MonthlyDataResponse } from './statistic.models'

export const statisticService = {
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
}
