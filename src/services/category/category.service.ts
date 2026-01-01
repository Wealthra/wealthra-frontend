import { apiRequest } from '../ApiClient'
import type {
  PaginatedCategoriesResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from './category.models'

export const categoryService = {
  async createCategory(name: string): Promise<void> {
    return apiRequest<void>('Category', {
      method: 'POST',
      body: { name } as CreateCategoryRequest,
    })
  },

  async getUserCategories(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedCategoriesResponse> {
    return apiRequest<PaginatedCategoriesResponse>(
      `Category/users?PageNumber=${pageNumber}&PageSize=${pageSize}`,
      {
        method: 'GET',
      }
    )
  },

  async getAdminCategories(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedCategoriesResponse> {
    return apiRequest<PaginatedCategoriesResponse>(
      `Category/Admin?PageNumber=${pageNumber}&PageSize=${pageSize}`,
      {
        method: 'GET',
      }
    )
  },

  async updateCategory(id: number, name: string): Promise<void> {
    return apiRequest<void>(`Category/${id}`, {
      method: 'PUT',
      body: { name } as UpdateCategoryRequest,
    })
  },

  async deleteCategory(id: number): Promise<void> {
    return apiRequest<void>(`Category/${id}`, {
      method: 'DELETE',
    })
  },
}
