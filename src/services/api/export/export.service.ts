import { apiRequest } from '../../apiClient'
import type { ExportRequest } from './export.models'

export const exportService = {
  async exportData(params: ExportRequest): Promise<Blob> {
    const queryParams = new URLSearchParams()
    queryParams.append('startDate', params.startDate)
    queryParams.append('endDate', params.endDate)
    queryParams.append('format', params.format)
    queryParams.append('currency', params.currency)
    queryParams.append('lang', params.lang)

    return apiRequest<Blob>(`Export?${queryParams.toString()}`, {
      method: 'GET',
    })
  },
}
