export interface AnalyzeRecommendationRequest {
  year?: number | string
  month?: number | string
}

export type AnalyzeRecommendationResponse = string[]

export interface PersonalizedSignal {
  source: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  reasonCode: string
  evidence: string
  categoryId: number
  categoryName: string
}

export interface PersonalizedSuggestion {
  categoryName: string
  score: number // 0 to 1
  evidence: string
  priority?: 'High' | 'Medium' | 'Low'
}

export interface PersonalizedTip {
  topic: string
  body: string
  matchReason?: string
}

export interface PersonalizedRecommendationResponse {
  summary?: string
  signals: PersonalizedSignal[]
  collaborativeSuggestions: PersonalizedSuggestion[]
  semanticTips: PersonalizedTip[]
  analysisDate?: string
}
