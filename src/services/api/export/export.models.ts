/** Query param `lang` matches OpenAPI `/api/Export` (e.g. en, tr). */
export interface ExportRequest {
  startDate: string
  endDate: string
  format: 'PDF' | 'Excel'
  currency: 'USD' | 'EUR' | 'TRY'
  lang: 'en' | 'tr'
}
