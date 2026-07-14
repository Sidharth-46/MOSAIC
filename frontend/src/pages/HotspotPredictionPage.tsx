import { motion } from 'framer-motion'
import { Flame, Target, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react'
import { PageHeader } from '@/components/common/PageElements'
import { usePredictions } from '@/data/predictions'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts'
import { RiskBadge, ConfidenceBadge } from '@/components/common/InsightCard'
import { useState } from 'react'

export default function HotspotPredictionPage() {
  const [selectedPrediction, setSelectedPrediction] = useState(0)
  const { predictions, loading } = usePredictions()

  if (loading || !predictions.length) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const active = predictions[selectedPrediction]

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Risk Assessment"
        description="AI-driven predictive modeling for crime risk assessment"
        icon={Flame}
        actions={
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Run Latest Model
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of predictions */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            High Risk Zones ({predictions.length})
          </h3>
          <div className="space-y-3 pr-2 overflow-y-auto max-h-[calc(100vh-16rem)] custom-scrollbar">
            {predictions.map((pred, i) => (
              <motion.div
                key={pred.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedPrediction(i)}
                className={cn(
                  "p-4 rounded-xl cursor-pointer transition-all border",
                  active.id === pred.id 
                    ? "bg-primary/10 border-primary/30" 
                    : "glass-card border-transparent hover:border-primary/20"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">{pred.area}</h4>
                    <p className="text-xs text-muted-foreground">{pred.district}</p>
                  </div>
                  <RiskBadge severity={pred.riskScore >= 80 ? 'Critical' : pred.riskScore >= 70 ? 'High' : 'Medium'} />
                </div>
                <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-border/50">
                  <span className="text-muted-foreground">Target: <strong className="text-foreground">{pred.predictedCrimeType}</strong></span>
                  <ConfidenceBadge value={pred.confidence} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Details & Explanations */}
        <div className="lg:col-span-2 space-y-4">
          {active ? (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">{active.area}</h2>
                  <p className="text-sm text-muted-foreground">Predicted risk for: {active.predictedDate}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Risk Score</div>
                    <div className={cn(
                      "text-3xl font-bold font-mono",
                      active.riskScore >= 80 ? 'text-red-400' : active.riskScore >= 70 ? 'text-orange-400' : 'text-yellow-400'
                    )}>
                      {active.riskScore}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-primary" />
                    Model Explanation
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {active.explanation}
                  </p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4 border border-border/50">
                   <h4 className="text-sm font-semibold mb-4">Feature Importance</h4>
                   <ResponsiveContainer width="100%" height={160}>
                     <BarChart data={active.featureImportance} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                       <XAxis type="number" hide />
                       <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={120} />
                       <RechartsTooltip 
                         cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                         contentStyle={{ background: 'rgba(18, 22, 30, 0.95)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}
                         itemStyle={{ fontSize: '12px', color: '#F8FAFC' }}
                       />
                       <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={12}>
                         {active.featureImportance.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={entry.direction === 'positive' ? '#FF4D6D' : '#38BDF8'} />
                         ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                   <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground justify-center">
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Increases Risk</span>
                      <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Decreases Risk</span>
                   </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 border-t border-border/50 pt-5 mt-auto">
                <button className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors">
                  Create Patrol Plan
                </button>
                <button className="px-4 py-2 bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg text-sm font-medium transition-colors">
                  View on Map
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center glass-card rounded-xl">
              <p className="text-muted-foreground">Select a prediction to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
