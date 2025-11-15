export interface Income {
  id: number
  name: string
  amount: number
  method: string
  isRecurring: boolean
  created?: string
  createdBy?: string
  lastModified?: string
  lastModifiedBy?: string
}

export interface PaginatedIncomesResponse {
  pageNumber: number
  pageSize: number
  data: Income[]
  hasMoreItems: boolean
  totalCount: number
  totalPages: number
}

export interface CreateIncomeRequest {
  name: string
  amount: number
  method: string
  isRecurring: boolean
}

export interface UpdateIncomeRequest {
  name: string
  amount: number
  method: string
  isRecurring: boolean
}

export interface IncomeGeneralInfoResponse {
  weeklyTotalIncome: number
  monthlyTotalIncome: number
  yearlyTotalIncome: number
  previousWeekTotalIncome: number
  previousMonthTotalIncome: number
  previousYearTotalIncome: number
  recentTransactions: Income[]
}
