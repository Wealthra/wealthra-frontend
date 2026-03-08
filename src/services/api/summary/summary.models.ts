export interface SummaryRecentTransaction {
  id: number
  type: string
  description: string
  amount: number
  transactionDate: string
  categoryName: string | null
}

export interface SummaryTopSpendingCategory {
  categoryName: string
  totalAmount: number
  transactionCount: number
}

export interface SummaryBudgetAlert {
  budgetId: number
  categoryName: string
  limitAmount: number
  currentAmount: number
  percentageUsed: number
  status: string
}

export interface DashboardSummaryResponse {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  recentTransactions: SummaryRecentTransaction[]
  topSpendingCategories: SummaryTopSpendingCategory[]
  budgetAlerts: SummaryBudgetAlert[]
  unreadNotificationsCount: number
}

