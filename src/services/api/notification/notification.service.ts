import { apiRequest } from '../../apiClient'
import type { Notification } from './notification.models'

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    return apiRequest<Notification[]>(`Notification`, {
      method: 'GET',
    })
  },

  async deleteNotifications(): Promise<void> {
    return apiRequest<void>(`Notification`, {
      method: 'DELETE',
    })
  },
}
