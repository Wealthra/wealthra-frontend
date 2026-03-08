export interface FinancialData {
  firstName?: string
  totalBalance: number
  lastMonthBalance: number
  currentMonthSpending: number
  lastMonthSpending: number
  totalRecurringExpenses: number
  goalProgress: number
  latestGoal: {
    created: string
    createdBy: string
    deadline: string
    id: number
    initialAmount: number
    lastModified: string
    lastModifiedBy: string
    name: string
    targetAmount: number
  }

  topSpendingCategories: {
    categoryId: number
    categoryName: string
    totalAmount: number
  }[]

  categorySpending: Record<string, number>
  monthlyExpensesLastYear: Record<string, number>
  monthlyIncomesLastYear: Record<string, number>

  incomeSources: {
    id: number
    name: string
    amount: number
    isRecurring: boolean
    method: string
  }[]
  incomeHasMoreItems: boolean
  pageNumberIncome: number
  pageSizeIncome: number
  totalCountIncome: number
  totalPagesIncome: number

  incomeRecentTransactions: {
    amount: number
    created: string
    createdBy: string
    id: number
    isRecurring: boolean
    lastModified: string
    lastModifiedBy: string
    method: string
    name: string
  }[]
  weeklyTotalIncome: number
  monthlyTotalIncome: number
  yearlyTotalIncome: number
  averageMonthlyIncome: number

  weeklyTotalExpense: number
  previousWeekTotalExpense: number
  monthlyTotalExpense: number
  previousMonthTotalExpense: number
  yearlyTotalExpense: number
  previousYearTotalExpense: number
  recurringExpensesThisMonth?: number

  expenseHasMoreItems: boolean
  pageNumberExpense: number
  pageSizeExpense: number
  totalCountExpense: number
  totalPagesExpense: number

  expenseSources: {
    amount: number
    categoryId: number
    categoryName: string
    created?: string
    transactionDate?: string
    id: number
    isRecurring: boolean
    description: string
    paymentMethod: string
  }[]
  expenseRecentTransactions: {
    amount: number
    created: string
    createdBy: string
    id: number
    isRecurring: boolean
    lastModified: string
    lastModifiedBy: string
    paymentMethod: string
    name: string
  }[]

  expenseDistribution?: { category: string; amount: number }[]
  incomeExpenseData?: {
    month: string
    income: number
    expenses: number
  }[]

  currentAmount: number
  limitAmount: number

  budgetCategoriesData: {
    id: number
    limitAmount: number
    currentAmount: number
    created: string
    categoryId: number
    categoryName: string
  }[]

  budgetHasMoreItems: boolean
  pageNumberBudget: number
  pageSizeBudget: number
  totalCountBudget: number
  totalPagesBudget: number

  budgetNotifications: Array<{
    id: number
    message: string
    type: number
    created: string
    budgetId: number
    categoryName: string
  }>

  goalCategoriesData: {
    id: number
    name: string
    deadline: string
    targetAmount: number
    initialAmount: number
  }[]

  totalInitialAmount: number
  totalTargetAmount: number
}
