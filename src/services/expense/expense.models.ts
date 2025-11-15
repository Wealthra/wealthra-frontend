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
