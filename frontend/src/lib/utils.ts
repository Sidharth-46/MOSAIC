import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export function formatPercent(num: number): string {
  return num.toFixed(1) + '%'
}

export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20'
    case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20'
    default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  }
}

export function getRiskColor(risk: number): string {
  if (risk >= 80) return 'text-red-400'
  if (risk >= 60) return 'text-orange-400'
  if (risk >= 40) return 'text-yellow-400'
  return 'text-green-400'
}
