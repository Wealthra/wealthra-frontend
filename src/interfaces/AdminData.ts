export interface AdminData {
  totalUserCount: number
  activeUserCount: number
  totalTransactionCount: number
  totalErrorCount: number
  activeGoalCount: number
  lastAlertTime: string

  pageNumber: number
  pageSize: number
  data: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    createdAt: string
    totalNetWorth: number
  }>
  hasMoreItems: boolean
  totalCount: number
  totalPages: number

  totalTransactionCountLastMonth: number
  totalTransactionCountNow: number
  totalUserCountLastMonth: number
  totalUserCountNow: number
  averageResponseTimeMs: number
  errorRate: number
  serverUptime: string
  dailyActiveUserCount: number

  pageNumberError: number
  pageSizeError: number
  dataError: Array<{
    id: number
    message: string
    source: string
    endpoint: string
    timestamp: string
    userId: string
    stackTraceSummary: null
  }>
  hasMoreItemsError: boolean
  totalCountError: number
  totalPagesError: number
}
