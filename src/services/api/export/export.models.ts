export interface ExportRequest {
  startDate: string
  endDate: string
  format: 'PDF' | 'Excel'
  currency: 'USD' | 'EUR' | 'TRY'
  language: 'English' | 'Turkish'
}
