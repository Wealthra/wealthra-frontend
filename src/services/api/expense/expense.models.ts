export interface Expense {
  id: number
  description: string
  amount: number
  paymentMethod: string
  isRecurring: boolean
  categoryId: number
  categoryName?: string
  created?: string
}

export interface PaginatedExpensesResponse {
  pageNumber: number
  pageSize: number
  data: Expense[]
  hasMoreItems: boolean
  totalCount: number
  totalPages: number
}

export interface CreateExpenseRequest {
  description: string
  amount: number
  paymentMethod: string
  isRecurring: boolean
  categoryId: number
}

export interface UpdateExpenseRequest {
  description: string
  amount: number
  paymentMethod: string
  isRecurring: boolean
  categoryId: number
}

export interface ExpenseGeneralInfoResponse {
  weeklyTotalExpense: number
  monthlyTotalExpense: number
  yearlyTotalExpense: number
  previousWeekTotalExpense: number
  previousMonthTotalExpense: number
  previousYearTotalExpense: number
  recentTransactions: Expense[]
}

// New API models based on /api/Expenses spec

export interface ExpenseApiModel extends Expense {
  transactionDate: string
}

export interface ExpensesApiListResponse {
  items: ExpenseApiModel[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface ExpenseSummaryItem {
  period: string
  totalAmount: number
  expenseCount: number
  categoryBreakdown: Record<string, number>
}

export type ExpenseSummaryResponse = ExpenseSummaryItem[]
