import { apiRequest } from '../ApiClient'
import type {
  MetricsUserResponse,
  PaginatedUsersResponse,
  SystemMetricsResponse,
  PaginatedErrorLogsResponse,
} from './admin.models'

export const adminService = {
  async getMetricsUser(): Promise<MetricsUserResponse> {
    return apiRequest<MetricsUserResponse>('AdminControler/user', {
      method: 'GET',
    })
  },

  async getUsers(pageNumber: number = 1, pageSize: number = 10): Promise<PaginatedUsersResponse> {
    return apiRequest<PaginatedUsersResponse>(
      `AdminControler/users?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: 'GET',
      }
    )
  },

  async getSystemMetrics(): Promise<SystemMetricsResponse> {
    return apiRequest<SystemMetricsResponse>('AdminControler/system', {
      method: 'GET',
    })
  },

  async getErrorLogs(
    pageNumber: number = 1,
    pageSize: number = 5
  ): Promise<PaginatedErrorLogsResponse> {
    return apiRequest<PaginatedErrorLogsResponse>(
      `AdminControler/errorlogs?PageNumber=${pageNumber}&PageSize=${pageSize}`,
      {
        method: 'GET',
      }
    )
  },

  async deleteUser(id: string): Promise<void> {
    return apiRequest<void>(`AdminControler/user/${id}`, {
      method: 'DELETE',
    })
  },
}
