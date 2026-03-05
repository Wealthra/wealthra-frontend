import { apiRequest } from '../../apiClient'
import type { OcrExtractTextResponse } from './ocr.models'

export const ocrService = {
  async extractText(image: File, language: string): Promise<OcrExtractTextResponse> {
    const formData = new FormData()
    formData.append('Image', image)
    formData.append('Language', language)

    return apiRequest<OcrExtractTextResponse>('Ocr/extract-text', {
      method: 'POST',
      body: formData,
      isFormData: true,
    })
  },
}

