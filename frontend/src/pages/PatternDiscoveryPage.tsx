import { useState } from 'react'
import { Sparkles, Filter } from 'lucide-react'
import { PageHeader } from '@/components/common/PageElements'
import { InsightCard } from '@/components/common/InsightCard'
import { usePredictions } from '@/data/predictions'
import { cn } from '@/lib/utils'

const filterCategories = [
  { id: 'all', label: 'All Patterns' },
  { id: 'recurring_hotspot', label: 'Recurring Hotspots' },
  { id: 'emerging_cluster', label: 'Emerging Clusters' },
  { id: 'temporal_pattern', label: 'Temporal Patterns' },
  { id: 'spatial_pattern', label: 'Spatial Patterns' },
  { id: 'repeat_incident', label: 'Repeat Incidents' },
]

export default function PatternDiscoveryPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const { patterns, loading } = usePredictions()

  if (loading || !patterns.length) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }



  const filteredPatterns = activeFilter === 'all' 
    ? patterns 
    : patterns.filter(p => p.type === activeFilter)

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Pattern Discovery"
        description="AI-detected anomalous clusters and recurring behavioral signatures"
        icon={Sparkles}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/60 text-muted-foreground hover:text-foreground text-sm transition-colors">
              <Filter className="w-4 h-4" />
              Filter Options
            </button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
              activeFilter === cat.id 
                ? "bg-primary/20 text-primary border-primary/30" 
                : "bg-secondary/30 text-muted-foreground border-transparent hover:border-border"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Masonry/Grid Layout for Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-max">
        {filteredPatterns.map((pattern, i) => (
          <InsightCard 
            key={pattern.id}
            type={pattern.type}
            title={pattern.title}
            description={pattern.description}
            confidence={pattern.confidence}
            severity={pattern.severity}
            relatedCrimes={pattern.relatedCrimes}
            index={i}
          />
        ))}
        {filteredPatterns.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            No patterns found for the selected category.
          </div>
        )}
      </div>
    </div>
  )
}
