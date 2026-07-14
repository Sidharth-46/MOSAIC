export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low'

export interface Prediction {
  id: string
  area: string
  district: string
  predictedCrimeType: string
  riskScore: number
  confidence: number
  predictedDate: string
  featureImportance: FeatureImportance[]
  explanation: string
  latitude: number
  longitude: number
}

export interface FeatureImportance {
  feature: string
  importance: number
  direction: 'positive' | 'negative'
}

export interface PatternInsight {
  id: string
  type: 'recurring_hotspot' | 'emerging_cluster' | 'temporal_pattern' | 'spatial_pattern' | 'repeat_incident'
  title: string
  description: string
  confidence: number
  severity: RiskLevel
  relatedCrimes: number
  detectedAt: string
  data?: Record<string, unknown>
}
