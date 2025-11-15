export interface FinancialSummaryResponse {
  firstName: string
  totalBalance: number
  lastMonthBalance: number
  currentMonthSpending: number
  lastMonthSpending: number
  totalRecurringExpenses: number
  topSpendingCategories: {
    categoryId: number
    categoryName: string
    totalAmount: number
  }[]
  latestGoal: {
    id: number
    createdBy: string
    created: string
    lastModifiedBy: string
    lastModified: string
    name: string
    targetAmount: number
    initialAmount: number
    deadline: string
  }
  goalProgress: number
  categorySpending: Record<string, number>
  monthlyExpensesLastYear: Record<string, number>
  monthlyIncomesLastYear: Record<string, number>
}
