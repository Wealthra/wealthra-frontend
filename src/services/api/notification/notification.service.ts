import { apiRequest } from '../../apiClient'
import type {
  Notification,
  UserNotification,
  DeleteNotificationsRequest,
  MarkNotificationsReadRequest,
} from './notification.models'

export const notificationService = {

  // New plural /api/Notifications endpoints

  async getNotifications(unreadOnly: boolean = true, language: string = 'en'): Promise<UserNotification[]> {
    const flag = unreadOnly ? 'true' : 'false'
    return apiRequest<UserNotification[]>(`Notifications?unreadOnly=${flag}&language=${language}`, {
      method: 'GET',
    })
  },

  async deleteNotifications(payload: DeleteNotificationsRequest): Promise<void> {
    return apiRequest<void>('Notifications', {
      method: 'DELETE',
      body: payload,
    })
  },

  async markNotificationsRead(payload: MarkNotificationsReadRequest): Promise<void> {
    return apiRequest<void>('Notifications/mark-read', {
      method: 'POST',
      body: payload,
    })
  },
}
