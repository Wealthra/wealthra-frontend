export interface CategorySpendingResponse {
  [categoryId: string]: number
}

export interface MonthlyDataResponse {
  [month: string]: number
}

// New API models based on /api/Statistics spec

export interface StatisticsCategoryBreakdownItem {
  categoryName: string
  amount: number
  percentage: number
  transactionCount: number
}

export interface StatisticsBreakdownResponse {
  categoryBreakdown: StatisticsCategoryBreakdownItem[]
  totalAmount: number
  startDate: string
  endDate: string
}

export interface StatisticsMonthlyDataItem {
  month: number
  monthName: string
  totalIncome: number
  totalExpenses: number
  netAmount: number
}

export interface StatisticsTrendsResponse {
  year: number
  monthlyData: StatisticsMonthlyDataItem[]
}
