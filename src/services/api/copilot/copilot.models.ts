/** Response item from POST /api/Expenses/extract-from-image and extract-from-audio */
export interface ExtractedExpenseItem {
  id: number
  description: string
  amount: number
  currency: string
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
  currency: string
  paymentMethod: string
  isRecurring: boolean
  categoryId: number
  transactionDate: string
}

export interface CopilotChatRequest {
  message: string
  updated_batch?: any // Support for passing final edited items back to AI
}

export interface CopilotChatResponse {
  type?: string
  message: string
  response?: string
  payload?: any
  ui_hints?: {
    show_confirm_buttons?: boolean
  }
}
