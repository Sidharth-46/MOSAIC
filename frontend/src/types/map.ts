import type { CrimeGroup, CrimeHead } from './crime'

export interface MapMarker {
  id: string
  latitude: number
  longitude: number
  crimeHead: CrimeHead
  crimeGroup: CrimeGroup
  description: string
  timestamp: string
  district: string
  firNumber: string
  status: string
}

export interface HeatmapPoint {
  lat: number
  lng: number
  intensity: number
}

export interface MapFilter {
  crimeHeads: CrimeHead[]
  districts: string[]
  crimeGroups: CrimeGroup[]
  dateRange: [string, string]
  timeRange: [number, number]
}
