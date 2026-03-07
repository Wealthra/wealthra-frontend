export interface IncomeApiModel {
  id?: number
  name: string
  amount: number
  method: string
  isRecurring: boolean
  transactionDate: string
}

export interface IncomesApiListResponse {
  items: IncomeApiModel[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface IncomeSummaryItem {
  period: string
  totalAmount: number
  incomeCount: number
}

export type IncomeSummaryResponse = IncomeSummaryItem[]

export interface IncomesGeneralInfoResponse {
  weeklyTotal: number
  monthlyTotal: number
  yearlyTotal: number
  averageMonthlyIncome: number
}
