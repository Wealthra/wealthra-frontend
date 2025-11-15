export interface Budget {
  id: number
  limitAmount: number
  currentAmount: number
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
  currentAmount: number
  categoryId: number
}

export interface UpdateBudgetRequest {
  limitAmount: number
  currentAmount: number
  categoryId: number
}

export interface MonthlyBudgetResponse {
  currentAmount: number
  limitAmount: number
}
