import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: React.ElementType
  actions?: ReactNode
}

export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  )
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-secondary/50 rounded-lg", className)} />
  )
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-xl p-5 space-y-3">
          <LoadingSkeleton className="h-4 w-2/3" />
          <LoadingSkeleton className="h-8 w-1/2" />
          <LoadingSkeleton className="h-3 w-full" />
          <LoadingSkeleton className="h-3 w-4/5" />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon,
  action 
}: { 
  title: string
  description: string
  icon?: React.ElementType
  action?: ReactNode 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="w-12 h-12 text-muted-foreground/40 mb-4" />}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
      {action}
    </div>
  )
}

export function ErrorState({ 
  title = 'Something went wrong', 
  description = 'An unexpected error occurred. Please try again.',
  onRetry 
}: { 
  title?: string
  description?: string
  onRetry?: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
        <X className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export function StatusDot({ status }: { status: 'online' | 'offline' | 'warning' }) {
  return (
    <span className={cn(
      "inline-block w-2 h-2 rounded-full",
      status === 'online' && "bg-green-400 animate-pulse",
      status === 'offline' && "bg-red-400",
      status === 'warning' && "bg-yellow-400 animate-pulse"
    )} />
  )
}

export function Badge({ children, variant = 'default', className }: { children: ReactNode; variant?: 'default' | 'outline' | 'destructive' | 'success' | 'warning'; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      variant === 'default' && "bg-primary/10 text-primary border border-primary/20",
      variant === 'outline' && "bg-transparent text-muted-foreground border border-border",
      variant === 'destructive' && "bg-red-500/10 text-red-400 border border-red-500/20",
      variant === 'success' && "bg-green-500/10 text-green-400 border border-green-500/20",
      variant === 'warning' && "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
      className
    )}>
      {children}
    </span>
  )
}
