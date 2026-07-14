import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Download, Maximize2 } from 'lucide-react'
import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  actions?: ReactNode
  index?: number
}

export function ChartCard({ title, subtitle, children, className, actions, index = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn("glass-card rounded-xl overflow-hidden", className)}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          {actions}
          <button className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="px-5 pb-5">
        {children}
      </div>
    </motion.div>
  )
}
