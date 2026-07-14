import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { AlertTriangle, TrendingUp, MapPin, Clock, Repeat, Lightbulb } from 'lucide-react'

const typeIcons: Record<string, React.ElementType> = {
  recurring_hotspot: MapPin,
  emerging_cluster: TrendingUp,
  temporal_pattern: Clock,
  spatial_pattern: MapPin,
  repeat_incident: Repeat,
}

const typeLabels: Record<string, string> = {
  recurring_hotspot: 'Recurring Hotspot',
  emerging_cluster: 'Emerging Cluster',
  temporal_pattern: 'Temporal Pattern',
  spatial_pattern: 'Spatial Pattern',
  repeat_incident: 'Repeat Incident',
}

interface InsightCardProps {
  type: string
  title: string
  description: string
  confidence: number
  severity: string
  relatedCrimes?: number
  index?: number
}

export function InsightCard({ type, title, description, confidence, severity, relatedCrimes, index = 0 }: InsightCardProps) {
  const Icon = typeIcons[type] || Lightbulb
  const label = typeLabels[type] || 'Insight'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="glass-card rounded-xl p-5 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-lg",
            severity === 'Critical' ? 'bg-red-500/10 border border-red-500/20' :
            severity === 'High' ? 'bg-orange-500/10 border border-orange-500/20' :
            severity === 'Medium' ? 'bg-yellow-500/10 border border-yellow-500/20' :
            'bg-green-500/10 border border-green-500/20'
          )}>
            <Icon className={cn(
              "w-4 h-4",
              severity === 'Critical' ? 'text-red-400' :
              severity === 'High' ? 'text-orange-400' :
              severity === 'Medium' ? 'text-yellow-400' :
              'text-green-400'
            )} />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        <RiskBadge severity={severity} />
      </div>
      <h4 className="text-sm font-semibold text-foreground mb-2 leading-snug">{title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{description}</p>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <ConfidenceBadge value={confidence} />
          {relatedCrimes !== undefined && (
            <span className="text-muted-foreground">
              {relatedCrimes} related cases
            </span>
          )}
        </div>
        <button className="text-primary hover:text-primary/80 font-medium transition-colors">
          Investigate →
        </button>
      </div>
    </motion.div>
  )
}

export function RiskBadge({ severity }: { severity: string }) {
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-xs font-semibold border",
      severity === 'Critical' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
      severity === 'High' ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' :
      severity === 'Medium' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' :
      'text-green-400 bg-green-500/10 border-green-500/30'
    )}>
      {severity}
    </span>
  )
}

export function ConfidenceBadge({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            value >= 90 ? 'bg-green-400' :
            value >= 70 ? 'bg-blue-400' :
            value >= 50 ? 'bg-yellow-400' :
            'bg-red-400'
          )}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn(
        "text-xs font-medium",
        value >= 90 ? 'text-green-400' :
        value >= 70 ? 'text-blue-400' :
        value >= 50 ? 'text-yellow-400' :
        'text-red-400'
      )}>
        {value}%
      </span>
    </div>
  )
}

interface MiniInsightProps {
  label: string
  type: 'positive' | 'negative' | 'warning'
}

export function MiniInsight({ label, type }: MiniInsightProps) {
  return (
    <div className={cn(
      "flex items-start gap-2 p-3 rounded-lg border text-xs",
      type === 'positive' ? 'bg-green-500/5 border-green-500/20 text-green-400' :
      type === 'negative' ? 'bg-red-500/5 border-red-500/20 text-red-400' :
      'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'
    )}>
      {type === 'positive' ? <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0" /> :
       type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> :
       <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
      <span className="leading-relaxed">{label}</span>
    </div>
  )
}
