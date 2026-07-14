import { motion } from 'framer-motion'
import { LayoutDashboard, Clock, MapPin, Flame } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line } from 'recharts'
import { PageHeader, Badge } from '@/components/common/PageElements'
import { KPICard } from '@/components/common/KPICard'
import { ChartCard } from '@/components/common/ChartCard'
import { MiniInsight, RiskBadge } from '@/components/common/InsightCard'
import { useAnalytics } from '@/data/analytics'
import { useCrimes } from '@/data/crimes'
import { usePredictions } from '@/data/predictions'
import { cn } from '@/lib/utils'

const chartTooltipStyle = {
  contentStyle: {
    background: 'rgba(18, 22, 30, 0.95)',
    backdropFilter: 'blur(14px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#F8FAFC',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },
  itemStyle: { color: '#F8FAFC' },
}

export default function DashboardPage() {
  const { crimes, loading: crimesLoading } = useCrimes()
  const { dashboardKPIs, trendData, categoryData, hourlyData, districtStats, loading: analyticsLoading } = useAnalytics()
  const { insightsSummary, loading: predictionsLoading } = usePredictions()

  const recentCrimes = crimes.slice(0, 8)

  if (crimesLoading || analyticsLoading || predictionsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Karnataka Crime Operations Center"
        description="AI-powered operational intelligence for crime analytics, investigation and decision support."
        icon={LayoutDashboard}
        actions={
          <Badge variant="default" className="text-xs">Prototype for Karnataka State Police Datathon 2026</Badge>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {dashboardKPIs.map((kpi, i) => (
          <KPICard key={kpi.label} {...kpi} index={i} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Registered FIR Trend" subtitle="Jan — Dec 2025" index={0}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Area type="monotone" dataKey="total" stroke="#38BDF8" fill="url(#gradTotal)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="theft" stroke="#FF4D6D" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              <Area type="monotone" dataKey="assault" stroke="#F59E0B" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Crime Head Distribution" subtitle="Distribution by type" index={1}>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={260}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryData.slice(0, 6).map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Police Unit Comparison" subtitle="Top districts by FIR volume" index={2}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={districtStats.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="district" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="totalCrimes" fill="#38BDF8" radius={[0, 4, 4, 0]} barSize={16} />
              <Bar dataKey="resolved" fill="#22C55E" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Hourly Incident Trend" subtitle="24-hour incident distribution" index={3}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Incidents */}
        <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recent FIRs</h3>
              <p className="text-xs text-muted-foreground">Latest reported cases</p>
            </div>
            <button className="text-xs text-primary hover:text-primary/80 font-medium">View All →</button>
          </div>
          <div className="px-5 pb-5">
            <div className="space-y-2">
              {recentCrimes.map((crime, i) => (
                <motion.div
                  key={crime.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      crime.crimeGroup === 'Critical' ? 'bg-red-500/10' :
                      crime.crimeGroup === 'High' ? 'bg-orange-500/10' :
                      crime.crimeGroup === 'Medium' ? 'bg-yellow-500/10' :
                      'bg-green-500/10'
                    )}>
                      <Clock className={cn(
                        "w-4 h-4",
                        crime.crimeGroup === 'Critical' ? 'text-red-400' :
                        crime.crimeGroup === 'High' ? 'text-orange-400' :
                        crime.crimeGroup === 'Medium' ? 'text-yellow-400' :
                        'text-green-400'
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{crime.crimeHead} — {crime.firNumber}</p>
                      <p className="text-xs text-muted-foreground">{crime.district} • {new Date(crime.reportedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiskBadge severity={crime.crimeGroup as any} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* AI Insights */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20">
                <Flame className="w-4 h-4 text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
            </div>
            <div className="space-y-2">
              {insightsSummary.map((insight, i) => (
                <MiniInsight key={i} label={insight.label} type={insight.type} />
              ))}
            </div>
          </div>

          {/* Top Hotspots */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <MapPin className="w-4 h-4 text-red-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Top Hotspots</h3>
            </div>
            <div className="space-y-3">
              {[
                { area: 'Whitefield (Bengaluru)', risk: 87, type: 'Chain Snatching' },
                { area: 'Mysuru Central', risk: 82, type: 'Robbery' },
                { area: 'Hubballi Market', risk: 78, type: 'Vehicle Theft' },
                { area: 'Mangaluru North', risk: 75, type: 'Assault' },
                { area: 'Belagavi Checkpost', risk: 71, type: 'Fraud' },
              ].map((spot, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{spot.area}</p>
                    <p className="text-xs text-muted-foreground">{spot.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          spot.risk >= 80 ? 'bg-red-400' : spot.risk >= 70 ? 'bg-orange-400' : 'bg-yellow-400'
                        )}
                        style={{ width: `${spot.risk}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-xs font-bold min-w-[32px] text-right",
                      spot.risk >= 80 ? 'text-red-400' : spot.risk >= 70 ? 'text-orange-400' : 'text-yellow-400'
                    )}>
                      {spot.risk}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
