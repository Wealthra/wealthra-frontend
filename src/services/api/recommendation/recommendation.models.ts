export interface AnalyzeRecommendationRequest {
  year?: number | string
  month?: number | string
}

export type AnalyzeRecommendationResponse = string[]

export interface PersonalizedSignal {
  title: string
  description: string
  type: 'Positive' | 'Negative' | 'Neutral'
  impact: string
}

export interface PersonalizedSuggestion {
  title: string
  description: string
  priority: 'High' | 'Medium' | 'Low'
  category: string
}

export interface PersonalizedTip {
  title: string
  content: string
}

export interface PersonalizedRecommendationResponse {
  summary: string
  signals: PersonalizedSignal[]
  suggestions: PersonalizedSuggestion[]
  tips: PersonalizedTip[]
  analysisDate: string
}
