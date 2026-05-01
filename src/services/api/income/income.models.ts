export interface IncomeApiModel {
  id?: number
  name: string
  amount: number
  currency: string
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
  /** Present when API returns per-category breakdown (optional). */
  categoryBreakdown?: Record<string, number>
}

export type IncomeSummaryResponse = IncomeSummaryItem[]

export interface IncomesGeneralInfoResponse {
  weeklyTotal: number
  monthlyTotal: number
  yearlyTotal: number
  averageMonthlyIncome: number
}
