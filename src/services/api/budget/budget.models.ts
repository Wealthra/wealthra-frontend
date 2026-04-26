export interface Budget {
  id: number
  limitAmount: number
  currentAmount: number
  currency: string
  // Legacy field from old API
  created: string
  categoryId: number
  categoryName: string
}

export interface PaginatedBudgetsResponse {
  pageNumber: number
  pageSize: number
  data: Budget[]
  hasMoreItems: boolean
  totalCount: number
  totalPages: number
}

export interface CreateBudgetRequest {
  limitAmount: number
  categoryId: number
  currency: string
}

export interface UpdateBudgetRequest {
  limitAmount: number
  categoryId: number
  currency: string
}

export interface MonthlyBudgetResponse {
  currentAmount: number
  limitAmount: number
}

// New API models based on /api/Budgets spec

export interface BudgetApiModel {
  id: number
  limitAmount: number
  currentAmount: number
  currency: string
  percentageUsed: number
  status: string
  categoryId: number
  categoryName: string
}

export interface BudgetsOverviewResponse {
  totalLimit: number
  totalSpent: number
  percentageUsed: number
  overallStatus: string
  totalBudgets: number
  budgetsExceeded: number
  budgetsWarning: number
}

export interface BudgetMonthlyCategoryBreakdownItem {
  budgetId: number
  categoryName: string
  limitAmount: number
  spentThisMonth: number
  remainingAmount: number
  percentageUsed: number
  status: string
}

export interface BudgetsMonthlyResponse {
  totalLimitAmount: number
  totalSpentThisMonth: number
  totalRemainingAmount: number
  overallPercentageUsed: number
  overallStatus: string
  totalBudgets: number
  budgetsExceeded: number
  budgetsOnWarning: number
  categoryBreakdown: BudgetMonthlyCategoryBreakdownItem[]
}
