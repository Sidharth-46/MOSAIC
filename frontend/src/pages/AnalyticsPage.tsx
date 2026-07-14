import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Filter, Calendar } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart } from 'recharts'
import { PageHeader, Badge } from '@/components/common/PageElements'
import { ChartCard } from '@/components/common/ChartCard'
import { useAnalytics } from '@/data/analytics'
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

const tabs = ['Trends Overview', 'Police Unit Analysis', 'Temporal Patterns', 'Seasonal Shifts']

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState(0)
  const { trendData, districtStats, seasonalData, weeklyData, loading } = useAnalytics()

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Deep Analytics"
        description="Comprehensive crime statistics and historical analysis"
        icon={BarChart3}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60 text-muted-foreground hover:text-foreground text-sm transition-colors">
              <Calendar className="w-4 h-4" />
              YTD 2026
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-lg w-fit mb-6">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === i 
                ? "bg-primary/20 text-primary shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 0 && (
          <div className="space-y-4">
            <ChartCard title="Crime by Month (2025-2026)" subtitle="Aggregated monthly volume across all districts">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="gradTotalLong" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip {...chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Area type="monotone" name="Registered FIRs" dataKey="total" stroke="#38BDF8" fill="url(#gradTotalLong)" strokeWidth={2} />
                  <Area type="monotone" name="Violent Crimes" dataKey="assault" stroke="#FF4D6D" fill="none" strokeWidth={2} />
                  <Area type="monotone" name="Property Crimes" dataKey="burglary" stroke="#60A5FA" fill="none" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-5">
                <div className="text-sm font-medium text-muted-foreground mb-1">Year-over-Year Growth</div>
                <div className="text-3xl font-bold text-green-400">-4.2%</div>
                <div className="text-xs text-muted-foreground mt-2">Overall reduction in reported incidents compared to same period last year.</div>
              </div>
              <div className="glass-card rounded-xl p-5">
                <div className="text-sm font-medium text-muted-foreground mb-1">Highest Reduction</div>
                <div className="text-3xl font-bold text-blue-400">Vehicle Theft</div>
                <div className="text-xs text-muted-foreground mt-2">12.5% decrease following implementation of smart parking surveillance.</div>
              </div>
              <div className="glass-card rounded-xl p-5">
                <div className="text-sm font-medium text-muted-foreground mb-1">Area of Concern</div>
                <div className="text-3xl font-bold text-red-400">Cybercrime</div>
                <div className="text-xs text-muted-foreground mt-2">22% increase in financial fraud and phishing reports.</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-4">
            <ChartCard title="Crime by Police Unit" subtitle="Comparison of total FIRs vs resolution rates">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={districtStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
                  <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip {...chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar yAxisId="left" name="Registered FIRs" dataKey="totalCrimes" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" name="Resolved Cases" dataKey="resolved" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  {/* <LineChart data={districtStats}> */}
                     {/* Overlay Line for Arrest Rate - using a workaround in recharts by rendering a separate chart inside or using ComposedChart (simplified here) */}
                  {/* </LineChart> */}
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {activeTab === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Crime by Time of Day" subtitle="FIR volume by day and time of day">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={weeklyData} layout="vertical" stackOffset="expand">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={80} />
                  <RechartsTooltip {...chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="morning" name="Morning (6AM-12PM)" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="afternoon" name="Afternoon (12PM-6PM)" stackId="a" fill="#60A5FA" />
                  <Bar dataKey="evening" name="Evening (6PM-12AM)" stackId="a" fill="#38BDF8" />
                  <Bar dataKey="night" name="Night (12AM-6AM)" stackId="a" fill="#22C55E" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Crime by Crime Head" subtitle="Distribution of specific crime heads across time periods">
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                  { subject: 'Morning', theft: 120, assault: 40, burglary: 30, fraud: 150 },
                  { subject: 'Afternoon', theft: 180, assault: 60, burglary: 50, fraud: 120 },
                  { subject: 'Evening', theft: 250, assault: 140, burglary: 90, fraud: 80 },
                  { subject: 'Night', theft: 80, assault: 110, burglary: 180, fraud: 30 },
                ]}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.04)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 300]} tick={false} axisLine={false} />
                  <Radar name="Theft" dataKey="theft" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.2} />
                  <Radar name="Assault" dataKey="assault" stroke="#FF4D6D" fill="#FF4D6D" fillOpacity={0.2} />
                  <Radar name="Burglary" dataKey="burglary" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.2} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <RechartsTooltip {...chartTooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {activeTab === 3 && (
           <div className="space-y-4">
             <ChartCard title="Crime by Crime Group" subtitle="Variation in crime groups across seasons">
               <ResponsiveContainer width="100%" height={400}>
                 <BarChart data={seasonalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
                   <XAxis dataKey="season" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                   <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                   <RechartsTooltip {...chartTooltipStyle} />
                   <Legend wrapperStyle={{ fontSize: '12px' }} />
                   <Bar name="Violent Crimes" dataKey="violent" fill="#FF4D6D" radius={[4, 4, 0, 0]} />
                   <Bar name="Property Crimes" dataKey="property" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                   <Bar name="Cyber Crimes" dataKey="cyber" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </ChartCard>
           </div>
        )}
      </motion.div>
    </div>
  )
}
