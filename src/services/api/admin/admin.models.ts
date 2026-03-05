export interface MetricsUserResponse {
  totalUserCount: number
  activeUserCount: number
  totalTransactionCount: number
  totalErrorCount: number
  activeGoalCount: number
  lastAlertTime: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: string
  totalNetWorth: number
}

export interface PaginatedUsersResponse {
  pageNumber: number
  pageSize: number
  data: User[]
  hasMoreItems: boolean
  totalCount: number
  totalPages: number
}

export interface SystemMetricsResponse {
  totalTransactionCountLastMonth: number
  totalTransactionCountNow: number
  totalUserCountLastMonth: number
  totalUserCountNow: number
  averageResponseTimeMs: number
  errorRate: number
  serverUptime: {
    ticks: number
    days: number
    hours: number
    milliseconds: number
    microseconds: number
    nanoseconds: number
    minutes: number
    seconds: number
    totalDays: number
    totalHours: number
    totalMilliseconds: number
    totalMicroseconds: number
    totalNanoseconds: number
    totalMinutes: number
    totalSeconds: number
  }
  dailyActiveUserCount: number
}

export interface ErrorLog {
  id: number
  message: string
  stackTrace: string
  timestamp: string
  userId?: string
}

export interface PaginatedErrorLogsResponse {
  pageNumber: number
  pageSize: number
  data: ErrorLog[]
  hasMoreItems: boolean
  totalCount: number
  totalPages: number
}
