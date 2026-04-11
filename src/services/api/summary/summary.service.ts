import { apiRequest } from '../../apiClient'
import type { DashboardSummaryResponse } from './summary.models'

export interface DashboardSummaryRequest {
  /**
   * Optional date range for which the summary should be calculated.
   * If omitted, the backend applies its default (e.g. current month or last 3 months).
   */
  dateRange?: {
    from?: string
    to?: string
    preset?: 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'year_to_date'
  }
  /**
   * Optional aggregation preferences to control how charts are generated.
   */
  aggregation?: {
    lineChartGranularity?: 'day' | 'week' | 'month'
    donutGrouping?: 'category' | 'tag' | 'merchant'
    topSpendingsLimit?: number
  }
  /**
   * Optional section flags to allow the backend to skip heavy calculations.
   */
  includeSections?: {
    summaryCards?: boolean
    spendingsBreakdown?: boolean
    incomeExpenseTrend?: boolean
    recentTransactions?: boolean
    budgetAlerts?: boolean
    goalsOverview?: boolean
    recommendations?: boolean
  }
}

export const summaryService = {
  /**
   * Fetch the dashboard summary.
   *
   * The backend currently accepts a simple GET without body.
   * The optional `request` parameter is reserved for future
   * enhancements (e.g. mapping to query params or POST body)
   * without breaking the call sites.
   */
  async getDashboardSummary(_request?: DashboardSummaryRequest): Promise<DashboardSummaryResponse> {
    return apiRequest<DashboardSummaryResponse>('Summary/dashboard-web', {
      method: 'GET',
    })
  },
}

