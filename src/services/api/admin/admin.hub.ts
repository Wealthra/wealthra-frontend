import * as signalR from '@microsoft/signalr'
import { getAuthToken } from '@/utils/auth'
import { production } from '@/services/production'

class AdminHub {
  private connection: signalR.HubConnection | null = null

  public async start(): Promise<void> {
    if (this.connection) return

    const token = getAuthToken()
    if (!token) return

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${production.apiUrl}/hubs/admin`, {
        accessTokenFactory: () => getAuthToken() || '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    this.connection.on('admin.activity', (activity: any) => {
      // console.log('AdminHub: Activity', activity)
      window.dispatchEvent(new CustomEvent('admin-activity', { detail: activity }))
    })

    this.connection.on('admin.snapshot', (snapshot: any) => {
      // console.log('AdminHub: Snapshot', snapshot)
      window.dispatchEvent(new CustomEvent('admin-snapshot', { detail: snapshot }))
    })

    try {
      await this.connection.start()
      // console.log('AdminHub: Connected.')
    } catch (err) {
      console.error('AdminHub: Connection Error:', err)
      this.connection = null
    }
  }

  public stop(): void {
    if (this.connection) {
      this.connection.stop()
      this.connection = null
    }
  }
}

export const adminHub = new AdminHub()
