import { apiRequest } from '../../apiClient'
import type {
  Notification,
  UserNotification,
  DeleteNotificationsRequest,
  MarkNotificationsReadRequest,
} from './notification.models'

export const notificationService = {
  // Legacy endpoints (singular "Notification") kept for backward compatibility
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

  // New plural /api/Notifications endpoints

  async apiGetNotifications(unreadOnly: boolean = true, language: string = 'en'): Promise<UserNotification[]> {
    const flag = unreadOnly ? 'true' : 'false'
    return apiRequest<UserNotification[]>(`Notifications?unreadOnly=${flag}&language=${language}`, {
      method: 'GET',
    })
  },

  async apiDeleteNotifications(payload: DeleteNotificationsRequest): Promise<void> {
    return apiRequest<void>('Notifications', {
      method: 'DELETE',
      body: payload,
    })
  },

  async apiMarkNotificationsRead(payload: MarkNotificationsReadRequest): Promise<void> {
    return apiRequest<void>('Notifications/mark-read', {
      method: 'POST',
      body: payload,
    })
  },
}
