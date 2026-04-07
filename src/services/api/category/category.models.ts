export interface Category {
  id: number
  name: string
  created?: string
}

export interface PaginatedCategoriesResponse {
  pageNumber: number
  pageSize: number
  data: Category[]
  hasMoreItems: boolean
  totalCount: number
  totalPages: number
}

export interface CreateCategoryRequest {
  name: string
}

export interface UpdateCategoryRequest {
  name: string
}

// New API models based on /api/Categories spec
export interface ApiCategory {
  id: number
  categoryName: string
}

export type CategoriesListResponse = ApiCategory[]
