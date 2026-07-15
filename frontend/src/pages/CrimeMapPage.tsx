import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { Map as MapIcon, Filter, X, AlertTriangle, Clock, MapPin, ChevronDown, ExternalLink, Shield, Radio } from 'lucide-react'
import { PageHeader, Badge } from '@/components/common/PageElements'
import { RiskBadge } from '@/components/common/InsightCard'
import { useCrimes } from '@/data/crimes'
import { cn } from '@/lib/utils'
import type { FIR, CrimeHead, CrimeGroup } from '@/types/crime'
import 'leaflet/dist/leaflet.css'
// @ts-ignore
import 'react-leaflet-markercluster/styles'

/* ── Severity-based marker colors ─────────────────────────────── */
const severityColors: Record<string, string> = {
  Critical: '#EF4444', // red
  High:     '#EF4444', // red
  Medium:   '#F97316', // orange
  Low:      '#3B82F6', // blue
}

const crimeTypeColors: Record<string, string> = {
  'Theft': '#60A5FA',
  'Robbery': '#FF4D6D',
  'Assault': '#FF4D6D',
  'Burglary': '#F59E0B',
  'Murder': '#FF4D6D',
  'Kidnapping': '#FF4D6D',
  'Fraud': '#F59E0B',
  'Cybercrime': '#38BDF8',
  'Drug Offense': '#22C55E',
  'Vandalism': '#60A5FA',
  'Domestic Violence': '#FF4D6D',
  'Vehicle Theft': '#60A5FA',
  'Chain Snatching': '#F59E0B',
  'Eve Teasing': '#FF4D6D',
}

function createSeverityIcon(severity: string) {
  const color = severityColors[severity] || '#3B82F6'
  return L.divIcon({
    className: 'custom-severity-marker',
    html: `<div style="
      width: 16px; height: 16px; border-radius: 50%;
      background: ${color};
      border: 2.5px solid rgba(255,255,255,0.9);
      box-shadow: 0 0 8px ${color}88, 0 0 20px ${color}44;
      animation: marker-pulse 2s ease-in-out infinite;
    "></div>
    <style>
      @keyframes marker-pulse {
        0%, 100% { box-shadow: 0 0 8px ${color}88, 0 0 20px ${color}44; transform: scale(1); }
        50% { box-shadow: 0 0 14px ${color}aa, 0 0 30px ${color}66; transform: scale(1.1); }
      }
    </style>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  })
}

/* ── Auto-fit bounds component ────────────────────────────────── */
function FitBounds({ crimes }: { crimes: FIR[] }) {
  const map = useMap()

  useEffect(() => {
    if (crimes.length === 0) return

    const validCrimes = crimes.filter(
      c => c.location.latitude >= 11.5 && c.location.latitude <= 18.5 &&
           c.location.longitude >= 74.0 && c.location.longitude <= 78.5
    )

    if (validCrimes.length === 0) return

    const bounds = L.latLngBounds(
      validCrimes.map(c => [c.location.latitude, c.location.longitude] as [number, number])
    )

    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 })
  }, [crimes, map])

  return null
}

/* ── Severity badge for popup ─────────────────────────────────── */
function SeverityBadge({ severity }: { severity: string }) {
  const colorMap: Record<string, string> = {
    Critical: 'bg-red-500/20 text-red-400 border-red-500/40',
    High:     'bg-red-500/20 text-red-400 border-red-500/40',
    Medium:   'bg-orange-500/20 text-orange-400 border-orange-500/40',
    Low:      'bg-blue-500/20 text-blue-400 border-blue-500/40',
  }
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
      colorMap[severity] || colorMap.Low
    )}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: severityColors[severity] || '#3B82F6' }} />
      {severity}
    </span>
  )
}

const allCrimeGroups: CrimeGroup[] = ['Critical', 'High', 'Medium', 'Low']
const allCrimeHeads: CrimeHead[] = ['Theft', 'Robbery', 'Assault', 'Burglary', 'Murder', 'Kidnapping', 'Fraud', 'Cybercrime', 'Drug Offense', 'Vandalism', 'Domestic Violence', 'Vehicle Theft', 'Chain Snatching', 'Eve Teasing']

const karnatakaBounds: L.LatLngBoundsExpression = [
  [11.5, 74.0], // South-West
  [18.5, 78.6], // North-East
]

export default function CrimeMapPage() {
  const { crimes, loading } = useCrimes()
  const allDistricts = useMemo(() => [...new Set(crimes.map(c => c.district))].sort(), [crimes])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFIR, setSelectedFIR] = useState<FIR | null>(null)
  const [filters, setFilters] = useState({
    crimeHeads: [] as CrimeHead[],
    districts: [] as string[],
    crimeGroups: [] as CrimeGroup[],
  })

  const filteredCrimes = useMemo(() => {
    return crimes.filter(c => {
      if (filters.crimeHeads.length > 0 && !filters.crimeHeads.includes(c.crimeHead)) return false
      if (filters.districts.length > 0 && !filters.districts.includes(c.district)) return false
      if (filters.crimeGroups.length > 0 && !filters.crimeGroups.includes(c.crimeGroup)) return false
      
      // Map Validation Logic: Handled centrally by useCrimes turf.js point-in-polygon
      return true
    })
  }, [crimes, filters])

  const toggleFilter = <T extends string>(arr: T[], item: T): T[] => {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader
        title="Incident Intelligence Map"
        description={`Displaying ${filteredCrimes.length} FIRs across Karnataka`}
        icon={MapIcon}
        actions={
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              showFilters ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground hover:text-foreground"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filters.crimeHeads.length + filters.districts.length + filters.crimeGroups.length) > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
                {filters.crimeHeads.length + filters.districts.length + filters.crimeGroups.length}
              </span>
            )}
          </button>
        }
      />

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-xl overflow-hidden shrink-0"
            >
              <div className="p-4 h-full overflow-y-auto space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Filters</h3>
                  <button onClick={() => setFilters({ crimeHeads: [], districts: [], crimeGroups: [] })} className="text-xs text-primary hover:underline">
                    Clear All
                  </button>
                </div>

                {/* Crime Type */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Crime Head</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {allCrimeHeads.map(type => (
                      <button
                        key={type}
                        onClick={() => setFilters(f => ({ ...f, crimeHeads: toggleFilter(f.crimeHeads, type) }))}
                        className={cn(
                          "px-2 py-1 rounded-md text-xs transition-colors border",
                          filters.crimeHeads.includes(type)
                            ? "bg-primary/20 text-primary border-primary/30"
                            : "bg-secondary/30 text-muted-foreground border-transparent hover:border-border"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* District */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">District</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {allDistricts.map(district => (
                      <button
                        key={district}
                        onClick={() => setFilters(f => ({ ...f, districts: toggleFilter(f.districts, district) }))}
                        className={cn(
                          "px-2 py-1 rounded-md text-xs transition-colors border",
                          filters.districts.includes(district)
                            ? "bg-primary/20 text-primary border-primary/30"
                            : "bg-secondary/30 text-muted-foreground border-transparent hover:border-border"
                        )}
                      >
                        {district}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Crime Group</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {allCrimeGroups.map(group => (
                      <button
                        key={group}
                        onClick={() => setFilters(f => ({ ...f, crimeGroups: toggleFilter(f.crimeGroups, group) }))}
                        className={cn(
                          "px-2 py-1 rounded-md text-xs transition-colors border",
                          filters.crimeGroups.includes(group)
                            ? "bg-primary/20 text-primary border-primary/30"
                            : "bg-secondary/30 text-muted-foreground border-transparent hover:border-border"
                        )}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity Legend */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Severity Legend</h4>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                      High / Critical
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F97316' }} />
                      Medium
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
                      Low
                    </div>
                  </div>
                </div>

                {/* Crime Type Legend */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Crime Types</h4>
                  <div className="space-y-1.5">
                    {Object.entries(crimeTypeColors).slice(0, 8).map(([type, color]) => (
                      <div key={type} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        {type}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map */}
        <div className="flex-1 rounded-xl overflow-hidden border border-border/50 relative">
          <MapContainer
            center={[15.3173, 75.7139]}
            zoom={7}
            minZoom={6}
            maxBounds={karnatakaBounds}
            maxBoundsViscosity={1.0}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <FitBounds crimes={filteredCrimes} />
            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={40}
              spiderfyOnMaxZoom
              showCoverageOnHover={false}
              iconCreateFunction={(cluster: any) => {
                const count = cluster.getChildCount()
                const children = cluster.getAllChildMarkers()
                // Determine cluster color based on highest severity child
                let hasRed = false
                let hasOrange = false
                children.forEach((m: any) => {
                  const el = m._icon?.querySelector('div')
                  if (!el) return
                  const bg = el.style.background
                  if (bg?.includes('#EF4444')) hasRed = true
                  if (bg?.includes('#F97316')) hasOrange = true
                })
                const clusterColor = hasRed ? '#EF4444' : hasOrange ? '#F97316' : '#3B82F6'
                return L.divIcon({
                  html: `<div style="
                    width: 36px; height: 36px; border-radius: 50%;
                    background: ${clusterColor}30;
                    border: 2px solid ${clusterColor};
                    display: flex; align-items: center; justify-content: center;
                    font-size: 12px; font-weight: 700; color: ${clusterColor};
                    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
                  ">${count}</div>`,
                  className: 'custom-cluster-icon',
                  iconSize: L.point(36, 36),
                })
              }}
            >
              {filteredCrimes.map((crime) => (
                <Marker
                  key={crime.id}
                  position={[crime.location.latitude, crime.location.longitude]}
                  icon={createSeverityIcon(crime.crimeGroup)}
                  eventHandlers={{
                    click: () => setSelectedFIR(crime)
                  }}
                >
                  <Popup className="mosaic-popup" maxWidth={300} minWidth={260}>
                    <div className="p-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-blue-400 tracking-wide">{crime.firNumber}</span>
                        <SeverityBadge severity={crime.crimeGroup} />
                      </div>

                      {/* Crime type */}
                      <h3 className="text-sm font-bold text-white mb-1">{crime.crimeHead}</h3>

                      {/* Details grid */}
                      <div className="space-y-1.5 mt-2">
                        <div className="flex items-center gap-2 text-xs">
                          <Shield className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-slate-400">Station:</span>
                          <span className="text-slate-200 font-medium">{crime.location.policeUnit}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-slate-400">District:</span>
                          <span className="text-slate-200 font-medium">{crime.district}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Radio className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-slate-400">Status:</span>
                          <span className={cn(
                            "font-medium",
                            crime.status === 'Open' ? 'text-yellow-400' :
                            crime.status === 'Under Investigation' ? 'text-orange-400' :
                            crime.status === 'Closed' ? 'text-green-400' : 'text-slate-300'
                          )}>{crime.status}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-slate-400">Reported:</span>
                          <span className="text-slate-200">{new Date(crime.reportedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Action button */}
                      <button
                        onClick={() => setSelectedFIR(crime)}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-semibold transition-colors border border-blue-500/30"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open Case Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>

          {/* Map Stats Overlay */}
          <div className="absolute top-4 left-4 z-[400] glass rounded-lg px-3 py-2 flex items-center gap-4">
            <div className="text-xs">
              <span className="text-muted-foreground">Markers:</span>
              <span className="text-foreground font-semibold ml-1">{filteredCrimes.length}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="text-xs">
              <span className="text-muted-foreground">Critical:</span>
              <span className="text-red-400 font-semibold ml-1">{filteredCrimes.filter(c => c.crimeGroup === 'Critical').length}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="text-xs">
              <span className="text-muted-foreground">High:</span>
              <span className="text-red-400 font-semibold ml-1">{filteredCrimes.filter(c => c.crimeGroup === 'High').length}</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="text-xs">
              <span className="text-muted-foreground">Medium:</span>
              <span className="text-orange-400 font-semibold ml-1">{filteredCrimes.filter(c => c.crimeGroup === 'Medium').length}</span>
            </div>
          </div>
        </div>

        {/* Detail Drawer */}
        <AnimatePresence>
          {selectedFIR && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-xl overflow-hidden shrink-0"
            >
              <div className="p-4 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Incident Details</h3>
                  <button onClick={() => setSelectedFIR(null)} className="p-1 rounded hover:bg-secondary/60">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge>{selectedFIR.firNumber}</Badge>
                    <RiskBadge severity={selectedFIR.crimeGroup as any} />
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-foreground">{selectedFIR.crimeHead}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{selectedFIR.description}</p>
                  </div>

                  <div className="space-y-3">
                    <InfoRow icon={MapPin} label="Location" value={`${selectedFIR.location.address}, ${selectedFIR.district}`} />
                    <InfoRow icon={Shield} label="Police Station" value={selectedFIR.location.policeUnit} />
                    <InfoRow icon={Clock} label="Reported" value={new Date(selectedFIR.reportedAt).toLocaleString()} />
                    <InfoRow icon={AlertTriangle} label="Status" value={selectedFIR.status} />
                  </div>

                  {selectedFIR.suspects.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Accused</h5>
                      {selectedFIR.suspects.map(s => (
                        <div key={s.id} className="p-2 bg-secondary/30 rounded-lg text-xs mb-1.5">
                          <p className="font-medium text-foreground">{s.name}</p>
                          <p className="text-muted-foreground">Age: {s.age} • {s.gender} • {s.status}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedFIR.vehicles.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Vehicles</h5>
                      {selectedFIR.vehicles.map(v => (
                        <div key={v.id} className="p-2 bg-secondary/30 rounded-lg text-xs mb-1.5">
                          <p className="font-medium text-foreground">{v.color} {v.make} {v.model}</p>
                          <p className="text-muted-foreground">{v.plateNumber}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Assigned IO: <span className="text-foreground font-medium">{selectedFIR.investigatingOfficer}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
    </div>
  )
}
