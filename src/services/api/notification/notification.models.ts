// Legacy notification model used by existing UI
export interface Notification {
  id: number
  message: string
  type: number
  created: string
  budgetId: number
  categoryName: string
}

// New API models based on /api/Notifications spec

export interface UserNotification {
  id: number
  message: string
  type: number
  isRead: boolean
  createdOn: string
  relatedEntityId: number
}

export interface DeleteNotificationsRequest {
  notificationIds: number[]
  clearAll: boolean
}

export interface MarkNotificationsReadRequest {
  notificationIds: number[]
  markAll: boolean
}
