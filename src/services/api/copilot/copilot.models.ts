/** Response item from POST /api/Expenses/extract-from-image and extract-from-audio */
export interface ExtractedExpenseItem {
  id: number
  description: string
  amount: number
  paymentMethod: string
  isRecurring: boolean
  transactionDate: string
  categoryId: number
  categoryName: string
}

/** Request body item for POST /api/Expenses/bulk */
export interface BulkExpenseRequest {
  description: string
  amount: number
  paymentMethod: string
  isRecurring: boolean
  categoryId: number
  transactionDate: string
}

export interface CopilotChatRequest {
  message: string
}

export interface CopilotChatResponse {
  message: string
  response?: string
}
