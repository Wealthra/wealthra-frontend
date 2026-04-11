import { apiRequest } from '../../apiClient'
import type { ExtractedExpenseItem, BulkExpenseRequest, CopilotChatRequest, CopilotChatResponse } from './copilot.models'

export const copilotService = {
  /**
   * Upload a receipt image and get extracted expense items.
   * POST /api/Expenses/extract-from-image  (multipart/form-data)
   */
  async extractFromImage(file: File): Promise<ExtractedExpenseItem[]> {
    const formData = new FormData()
    formData.append('file', file)

    return apiRequest<ExtractedExpenseItem[]>('Expenses/extract-from-image', {
      method: 'POST',
      body: formData,
      isFormData: true,
    })
  },

  /**
   * Upload an audio recording and get extracted expense items.
   * POST /api/Expenses/extract-from-audio  (multipart/form-data)
   */
  async extractFromAudio(file: File): Promise<ExtractedExpenseItem[]> {
    const formData = new FormData()
    formData.append('file', file)

    return apiRequest<ExtractedExpenseItem[]>('Expenses/extract-from-audio', {
      method: 'POST',
      body: formData,
      isFormData: true,
    })
  },

  /**
   * Save multiple expenses in one call.
   * POST /api/Expenses/bulk  (application/json)
   * Returns an array of created expense IDs.
   */
  async bulkCreateExpenses(items: BulkExpenseRequest[]): Promise<number[]> {
    return apiRequest<number[]>('Expenses/bulk', {
      method: 'POST',
      body: items,
    })
  },

  /**
   * Send a text message to Copilot.
   * POST /api/Copilot/chat  (application/json)
   */
  async chat(request: CopilotChatRequest): Promise<CopilotChatResponse> {
    return apiRequest<CopilotChatResponse>('Copilot/chat', {
      method: 'POST',
      body: request,
    })
  },
}
