import { apiRequest } from '../../apiClient'
import type {
  PaginatedCategoriesResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoriesListResponse,
} from './category.models'

export const categoryService = {

  // New plural /api/Categories endpoints

  async getCategories(): Promise<CategoriesListResponse> {
    return apiRequest<CategoriesListResponse>('Categories', {
      method: 'GET',
    })
  },

  async createCategory(name: string): Promise<number> {
    return apiRequest<number>('Categories', {
      method: 'POST',
      body: { name } as CreateCategoryRequest,
    })
  },

  async updateCategory(id: number, name: string): Promise<void> {
    return apiRequest<void>(`Categories/${id}`, {
      method: 'PUT',
      body: { id, name } as UpdateCategoryRequest & { id: number },
    })
  },

  async deleteCategory(id: number): Promise<void> {
    return apiRequest<void>(`Categories/${id}`, {
      method: 'DELETE',
    })
  },
}
