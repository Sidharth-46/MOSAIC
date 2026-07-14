export interface TrendDataPoint {
  month: string
  total: number
  theft: number
  assault: number
  robbery: number
  burglary: number
  fraud: number
}

export interface DistrictStats {
  district: string
  totalCrimes: number
  resolved: number
  pending: number
  arrestRate: number
  topCrimeType: string
}

export interface CategoryData {
  name: string
  value: number
  percentage: number
  color: string
}

export interface HourlyData {
  hour: string
  count: number
}

export interface WeeklyData {
  day: string
  morning: number
  afternoon: number
  evening: number
  night: number
}

export interface MonthlyData {
  month: string
  current: number
  previous: number
}

export interface SeasonalData {
  season: string
  total: number
  violent: number
  property: number
  cyber: number
}

export interface DashboardKPI {
  label: string
  value: number | string
  change: number
  changeLabel: string
  icon: string
  trend: 'up' | 'down' | 'stable'
}
