export interface SummaryRecentTransaction {
  id: number
  type: string
  description: string
  amount: number
  transactionDate: string
  categoryName: string | null
  /**
   * Optional extended fields for richer dashboard views.
   * Backed by the API when available.
   */
  isRecurring?: boolean
  merchantName?: string | null
}

export interface SummaryTopSpendingCategory {
  categoryName: string
  totalAmount: number
  transactionCount: number
  /**
   * Optional percentage of total spend for the selected period.
   */
  percentage?: number
}

export interface SummaryBudgetAlert {
  budgetId: number
  categoryName: string
  limitAmount: number
  currentAmount: number
  percentageUsed: number
  status: string
}

/**
 * High-level KPIs and period metadata for the dashboard.
 */
export interface DashboardSummaryHeader {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  /**
   * Income - expenses within the selected period.
   */
  monthlyCashFlow?: number
  /**
   * Savings rate in the selected period (0–1).
   */
  savingsRate?: number
  /**
   * Optional period boundaries for the current summary.
   */
  periodStart?: string
  periodEnd?: string
  /**
   * Number of active budgets in the system.
   */
  activeBudgetsCount?: number
  /**
   * Optional aggregated goals info for quick KPIs.
   */
  goalsCount?: {
    total: number
    achieved: number
  }
  /**
   * Total number of unread notifications.
   */
  unreadNotificationsCount: number
}

export interface IncomeExpenseTrendPoint {
  label: string
  income: number
  expense: number
}

export interface DashboardIncomeExpenseTrend {
  granularity: 'day' | 'week' | 'month'
  points: IncomeExpenseTrendPoint[]
}

export interface DashboardSpendingsBreakdownCategory {
  categoryName: string
  totalAmount: number
  transactionCount: number
  /**
   * Share of the total spending in the selected period (0–1).
   */
  percentage?: number
}

export interface DashboardSpendingsBreakdown {
  groupBy: 'category' | 'tag' | 'merchant'
  totalAmount: number
  categories: DashboardSpendingsBreakdownCategory[]
}

export interface DashboardCharts {
  incomeExpenseTrend?: DashboardIncomeExpenseTrend
  spendingsBreakdown?: DashboardSpendingsBreakdown
}

export interface DashboardLists {
  recentTransactions: SummaryRecentTransaction[]
  topSpendingCategories: SummaryTopSpendingCategory[]
  budgetAlerts: SummaryBudgetAlert[]
}

export interface DashboardGoalsOverview {
  totalGoals: number
  achievedGoals: number
  currentAmount: number
  limitAmount: number
}

export interface DashboardRecommendation {
  id: string
  type: 'spending_insight' | 'goal_suggestion' | 'general'
  title: string
  description: string
  relatedCategory?: string | null
  severity?: 'low' | 'medium' | 'high'
}

/**
 * Extended dashboard summary response used by the DashboardView.
 *
 * Existing flat fields are kept for backward compatibility while
 * new nested structures enable a richer UI.
 */
export interface DashboardSummaryResponse {
  /**
   * Legacy flat fields (for backward compatibility).
   * Prefer using the nested `summary`, `charts`, and `lists` blocks.
   */
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  recentTransactions: SummaryRecentTransaction[]
  topSpendingCategories: SummaryTopSpendingCategory[]
  budgetAlerts: SummaryBudgetAlert[]
  unreadNotificationsCount: number

  /**
   * Nested, richer dashboard layout used by the new UI.
   */
  summary?: DashboardSummaryHeader
  charts?: DashboardCharts
  lists?: DashboardLists
  goalsOverview?: DashboardGoalsOverview | null
  recommendations?: DashboardRecommendation[]
}

