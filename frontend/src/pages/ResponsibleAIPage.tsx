import { Brain, ShieldCheck, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { PageHeader } from '@/components/common/PageElements'
import { useMisc } from '@/data/misc'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ResponsibleAIPage() {
  const { responsibleAIMetrics, loading } = useMisc()

  if (loading || !responsibleAIMetrics.length) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const chartData = [
    { group: 'Age < 25', accuracy: 88, fairness: 92 },
    { group: 'Age 25-45', accuracy: 91, fairness: 94 },
    { group: 'Age > 45', accuracy: 89, fairness: 90 },
    { group: 'District A', accuracy: 93, fairness: 95 },
    { group: 'District B', accuracy: 86, fairness: 82 }, // Highlights the warning in metrics
  ]

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Responsible AI & Governance"
        description="Monitoring AI models for bias, fairness, and transparency"
        icon={Brain}
        actions={
          <button className="px-4 py-2 bg-secondary/80 text-foreground rounded-lg text-sm font-medium hover:bg-secondary border border-border transition-colors flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            Generate Compliance Report
          </button>
        }
      />

      {/* Notice */}
      <div className="glass-card rounded-xl p-5 border-l-4 border-l-primary flex items-start gap-4">
        <Info className="w-6 h-6 text-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-foreground mb-1">Decision Support Notice</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            MOSAIC's predictive models are designed for <strong>decision support only</strong>. AI recommendations are advisory only and must always be reviewed by investigating officers. AI outputs must be combined with human intelligence, historical context, and on-ground assessments before executing tactical deployments or initiating investigations. The platform continuously monitors for demographic and spatial biases.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Metrics */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Model Health Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {responsibleAIMetrics.map((metric, i) => (
              <div key={i} className="glass-card rounded-xl p-4 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{metric.label}</span>
                  {metric.status === 'Good' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : metric.status === 'Warning' ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className={cn(
                    "text-3xl font-bold font-mono",
                    metric.status === 'Good' ? "text-green-400" : metric.status === 'Warning' ? "text-yellow-400" : "text-red-400"
                  )}>
                    {metric.value}%
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed h-8 line-clamp-2">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Charts */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-5 border border-border/50">
            <h3 className="text-sm font-semibold mb-4">Fairness Evaluation by Subgroup</h3>
            <p className="text-xs text-muted-foreground mb-4">Comparing model accuracy and fairness constraints across different demographic and geographic slices.</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(222, 30%, 25%, 0.5)" vertical={false} />
                <XAxis dataKey="group" tick={{ fontSize: 11, fill: 'hsl(215, 20%, 55%)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(215, 20%, 55%)' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'hsl(222, 40%, 10%)', border: '1px solid hsla(210, 100%, 56%, 0.15)', borderRadius: '8px', fontSize: '12px' }} 
                  itemStyle={{ color: 'hsl(210, 40%, 90%)' }}
                />
                <Bar name="Accuracy Score" dataKey="accuracy" fill="hsl(210, 100%, 56%)" radius={[4, 4, 0, 0]} />
                <Bar name="Fairness Constraint" dataKey="fairness" fill="hsl(142, 76%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card rounded-xl p-5 border border-border/50">
            <h3 className="text-sm font-semibold mb-4">Audit Logs & Model Versioning</h3>
            <div className="space-y-3">
              {[
                { version: 'v2.4.1', date: '2026-07-10', event: 'Retrained predictive model with Q2 dataset. Fairness constraints verified.' },
                { version: 'v2.4.0', date: '2026-06-15', event: 'Major update to NLP extraction engine. Improved entity resolution by 14%.' },
                { version: 'v2.3.5', date: '2026-05-22', event: 'Routine bias audit completed. No critical violations found.' },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 p-3 bg-secondary/30 rounded-lg text-sm">
                  <div className="shrink-0 text-muted-foreground w-20">
                    <div className="font-mono text-xs">{log.version}</div>
                    <div className="text-[10px] mt-1">{log.date}</div>
                  </div>
                  <div className="text-foreground">{log.event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
