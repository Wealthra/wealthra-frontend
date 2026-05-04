import { apiRequest } from '../../apiClient'
import type { AnalyzeRecommendationResponse, PersonalizedRecommendationResponse } from './recommendation.models'

export const recommendationService = {
  async analyze(
    year?: number | string,
    month?: number | string,
    language: string = 'en',
    currency?: string
  ): Promise<AnalyzeRecommendationResponse> {
    const params = new URLSearchParams()
    if (year) params.append('year', String(year))
    if (month) params.append('month', String(month))
    params.append('language', language)
    if (currency) params.append('currency', currency)
    const q = params.toString() ? `?${params.toString()}` : ''

    return apiRequest<AnalyzeRecommendationResponse>(`Recommendations/analyze${q}`, {
      method: 'POST',
    })
  },

  async getPersonalized(
    year?: number | string,
    month?: number | string,
    language: string = 'en',
    currency?: string
  ): Promise<PersonalizedRecommendationResponse> {
    const params = new URLSearchParams()
    if (year) params.append('year', String(year))
    if (month) params.append('month', String(month))
    params.append('language', language)
    if (currency) params.append('currency', currency)
    const q = params.toString() ? `?${params.toString()}` : ''

    return apiRequest<PersonalizedRecommendationResponse>(`Recommendations/personalized${q}`, {
      method: 'GET',
    })
  },
}
