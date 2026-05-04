import * as signalR from '@microsoft/signalr'
import { getAuthToken } from '@/utils/auth'
import { production } from '@/services/production'

export enum NotificationType {
  Info = 0,
  Alert = 1,
  System = 2,
}

export interface NotificationDto {
  id: number
  message: string
  type: NotificationType
  isRead: boolean
  createdOn: string
  relatedEntityId: number
}

class NotificationHub {
  private connection: signalR.HubConnection | null = null
  private listeners: ((notification: NotificationDto) => void)[] = []

  public async start(): Promise<void> {
    if (this.connection) return

    const token = getAuthToken()
    if (!token) {
      console.warn('SignalR: No token found, skipping connection.')
      return
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${production.apiUrl}/hubs/notifications`, {
        accessTokenFactory: () => getAuthToken() || '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    this.connection.on('ReceiveNotification', (notification: NotificationDto) => {
      this.listeners.forEach((callback) => callback(notification))
    })

    try {
      await this.connection.start()
    } catch (err) {
      console.error('SignalR: Connection Error:', err)
      this.connection = null
    }
  }

  public stop(): void {
    if (this.connection) {
      this.connection.stop()
      this.connection = null
    }
  }

  public onNotificationReceived(callback: (notification: NotificationDto) => void): void {
    this.listeners.push(callback)
  }

  public offNotificationReceived(callback: (notification: NotificationDto) => void): void {
    this.listeners = this.listeners.filter((l) => l !== callback)
  }
}

export const notificationHub = new NotificationHub()
