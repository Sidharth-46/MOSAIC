import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Route, Clock, Users, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { MapContainer, TileLayer, Circle, Popup, Tooltip as LeafletTooltip } from 'react-leaflet'
import { PageHeader, Badge } from '@/components/common/PageElements'
import { useMisc } from '@/data/misc'
import { cn } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'

export default function PatrolPlannerPage() {
  const { patrolZones, loading } = useMisc()
  const [selectedZone, setSelectedZone] = useState<any>(null)

  useEffect(() => {
    if (patrolZones && patrolZones.length > 0 && !selectedZone) {
      setSelectedZone(patrolZones[0])
    }
  }, [patrolZones, selectedZone])

  if (loading || !selectedZone) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader
        title="Resource Allocation Planner"
        description="AI-optimized deployment recommendations based on predictive risk models"
        icon={Route}
        actions={
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Approve Deployment Plan
          </button>
        }
      />

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left List */}
        <div className="w-[380px] shrink-0 flex flex-col gap-4">
          <div className="glass-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Resource Utilization</div>
              <div className="text-2xl font-bold text-foreground">84% Optimal</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Est. Response Improvement</div>
              <div className="text-2xl font-bold text-primary">18% Faster</div>
            </div>
          </div>

          <div className="flex-1 glass-card rounded-xl overflow-hidden flex flex-col border border-border/50">
            <div className="p-4 border-b border-border/50 font-semibold text-sm">Suggested Zones</div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {patrolZones.map((zone, i) => (
                <motion.button
                  key={zone.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedZone(zone)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all border",
                    selectedZone.id === zone.id
                      ? "bg-primary/10 border-primary/30"
                      : "bg-secondary/30 border-transparent hover:border-border/50"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-sm">{zone.name}</span>
                    <Badge variant={zone.priority === 'High' ? 'destructive' : zone.priority === 'Medium' ? 'warning' : 'success'}>
                      {zone.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {zone.startTime}-{zone.endTime}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {zone.suggestedOfficers} Off.</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Area (Map + Details) */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Details Card */}
          <div className="glass-card rounded-xl p-5 border border-border/50 shrink-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  {selectedZone.name}
                  {selectedZone.priority === 'High' && <ShieldAlert className="w-5 h-5 text-red-500" />}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" /> {selectedZone.district} District
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Risk Index</div>
                <div className={cn(
                  "text-2xl font-bold",
                  selectedZone.riskScore >= 80 ? "text-red-400" : selectedZone.riskScore >= 60 ? "text-yellow-400" : "text-green-400"
                )}>{selectedZone.riskScore}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-secondary/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Coverage</div>
                <div className="text-sm font-medium">{(selectedZone.radius / 1000).toFixed(1)} sq. km</div>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Recommended Police Unit</div>
                <div className="text-sm font-medium">{selectedZone.district} Division</div>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Required Personnel</div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  {selectedZone.suggestedOfficers} Officers
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
              <strong className="text-primary block mb-1">Recommended Patrol Route:</strong>
              <span className="text-muted-foreground">{selectedZone.notes}</span>
            </div>
          </div>

          {/* Map View */}
          <div className="flex-1 glass-card rounded-xl overflow-hidden border border-border/50 relative z-0">
             <MapContainer
                center={[15.3173, 75.7139]}
                zoom={7}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {patrolZones.map(zone => {
                  const isSelected = selectedZone.id === zone.id
                  const color = zone.priority === 'High' ? '#ef4444' : zone.priority === 'Medium' ? '#f59e0b' : '#22c55e'
                  return (
                    <Circle
                      key={zone.id}
                      center={[zone.latitude, zone.longitude]}
                      radius={zone.radius}
                      pathOptions={{
                        color: color,
                        fillColor: color,
                        fillOpacity: isSelected ? 0.3 : 0.1,
                        weight: isSelected ? 3 : 1,
                        dashArray: isSelected ? '' : '4 4'
                      }}
                      eventHandlers={{
                        click: () => setSelectedZone(zone)
                      }}
                    >
                      <LeafletTooltip direction="top" offset={[0, -10]} opacity={1} permanent={isSelected}>
                        <div className="text-xs font-semibold">{zone.name}</div>
                      </LeafletTooltip>
                    </Circle>
                  )
                })}
             </MapContainer>
             
             {/* Map Legend overlay */}
             <div className="absolute bottom-4 left-4 z-[400] glass rounded-lg p-3">
               <div className="text-xs font-semibold mb-2">Priority Zones</div>
               <div className="space-y-1 text-xs">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500" /> High</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500/50 border border-yellow-500" /> Medium</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500/50 border border-green-500" /> Low</div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
