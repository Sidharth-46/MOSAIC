export interface PatrolZone {
  id: string
  name: string
  district: string
  priority: 'High' | 'Medium' | 'Low'
  riskScore: number
  suggestedOfficers: number
  startTime: string
  endTime: string
  latitude: number
  longitude: number
  radius: number
  crimeTypes: string[]
  notes: string
}

export interface ReportEntity {
  type: 'Crime' | 'Location' | 'Date' | 'Time' | 'Vehicle' | 'Weapon' | 'Victim' | 'Suspect'
  value: string
  confidence: number
}

export interface ResponsibleAIMetric {
  label: string
  value: number
  status: 'Good' | 'Warning' | 'Critical'
  description: string
}

export * from './crime'
export * from './analytics'
export * from './map'
export * from './prediction'
export * from './graph'
export * from './user'
