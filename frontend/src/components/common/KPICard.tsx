import { motion } from 'framer-motion'
import { cn, formatNumber } from '@/lib/utils'
import { 
  Shield, Flame, AlertTriangle, UserCheck, CheckCircle, Brain,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react'
import { useEffect, useState } from 'react'

const iconMap: Record<string, React.ElementType> = {
  Shield, Flame, AlertTriangle, UserCheck, CheckCircle, Brain
}

interface KPICardProps {
  label: string
  value: number | string
  change: number
  changeLabel: string
  icon: string
  trend: 'up' | 'down' | 'stable'
  index?: number
}

function AnimatedValue({ value }: { value: number | string }) {
  const [displayed, setDisplayed] = useState(0)
  const numericValue = typeof value === 'string' ? parseFloat(value) : value

  useEffect(() => {
    if (isNaN(numericValue)) return
    const duration = 1200
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.floor(numericValue * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    tick()
  }, [numericValue])

  if (typeof value === 'string' && value.includes('%')) {
    return <>{displayed.toFixed(1)}%</>
  }
  return <>{formatNumber(displayed)}</>
}

export function KPICard({ label, value, change, changeLabel, icon, trend, index = 0 }: KPICardProps) {
  const Icon = iconMap[icon] || Shield
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  const isPositive = (trend === 'down' && label.includes('Crime')) || 
                     (trend === 'up' && !label.includes('Crime'))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="glass-card rounded-xl p-5 relative overflow-hidden group"
    >

      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
          isPositive ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"
        )}>
          <TrendIcon className="w-3 h-3" />
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground tracking-tight mb-1">
        {typeof value === 'string' ? value : <AnimatedValue value={value} />}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xs text-muted-foreground/60 mt-1">{changeLabel}</div>
    </motion.div>
  )
}
