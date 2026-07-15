import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Network, ZoomIn, ZoomOut, Maximize, FileText, X, Search, Filter, ArrowLeft } from 'lucide-react'
import ForceGraph2D from 'react-force-graph-2d'
import type { ForceGraphMethods } from 'react-force-graph-2d'
import { PageHeader } from '@/components/common/PageElements'
import { useGraph } from '@/data/graph'
import { useCrimes } from '@/data/crimes'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { GraphNode } from '@/types/graph'
import type { FIR } from '@/types/crime'

function GraphView({ caseId, onBack }: { caseId: string, onBack: () => void }) {
  const { graphData, loading } = useGraph(caseId)
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      })
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node)
    
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000)
      fgRef.current.zoom(2.5, 1000)
    }
  }, [])

  const handleZoomIn = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom()
      fgRef.current.zoom(currentZoom * 1.5, 400)
    }
  }

  const handleZoomOut = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom()
      fgRef.current.zoom(currentZoom / 1.5, 400)
    }
  }

  const handleFit = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 50)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground font-medium">Loading investigation graph...</p>
      </div>
    )
  }

  if (!graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="mb-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Case List
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center bg-background/50 rounded-xl border border-border/50">
          <Network className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg font-medium text-foreground">No investigation graph is available for this case.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Case List
        </button>
      </div>
      <div className="flex-1 flex gap-4 min-h-0 relative">
        {/* Main Graph Area */}
        <div 
          ref={containerRef} 
          className="flex-1 glass-card rounded-xl overflow-hidden relative border border-border/50"
        >
          {dimensions.width > 0 && (
            <ForceGraph2D
              ref={fgRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeLabel="label"
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const iconMap: Record<string, string> = {
                  'CaseMaster': '📄',
                  'Victim': '👤',
                  'Accused': '🚨',
                  'Police Station': '🏢',
                  'Investigating Officer': '👮',
                  'Evidence': '🔍',
                  'Acts': '⚖️',
                  'Sections': '📜',
                  'Chargesheet': '📁',
                  'Court': '🏛️'
                };
                const icon = iconMap[node.type] || '🔵';
                const fontSize = 16 / globalScale;
                ctx.font = `${fontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(icon, node.x, node.y);
              }}
              linkColor={() => 'hsla(215, 20%, 55%, 0.4)'}
              linkWidth={(link: any) => (link as any).strength * 3}
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={1.5}
              onNodeClick={handleNodeClick}
              backgroundColor="transparent"
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
            />
          )}

          {/* Graph Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
            <button onClick={handleZoomIn} className="p-2 glass rounded-lg text-muted-foreground hover:text-foreground transition-colors border border-border/50">
              <ZoomIn className="w-5 h-5" />
            </button>
            <button onClick={handleZoomOut} className="p-2 glass rounded-lg text-muted-foreground hover:text-foreground transition-colors border border-border/50">
              <ZoomOut className="w-5 h-5" />
            </button>
            <button onClick={handleFit} className="p-2 glass rounded-lg text-muted-foreground hover:text-foreground transition-colors border border-border/50">
              <Maximize className="w-5 h-5" />
            </button>
          </div>

          {/* Legend */}
          <div className="absolute top-4 left-4 z-10 glass rounded-lg p-3 border border-border/50">
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Entity Types</div>
            <div className="space-y-1.5">
              {[
                { type: 'CaseMaster', color: '#60A5FA' },
                { type: 'Accused', color: '#F59E0B' },
                { type: 'Victim', color: '#94A3B8' },
                { type: 'Police Station', color: '#F8FAFC' },
                { type: 'Investigating Officer', color: '#38BDF8' },
                { type: 'Evidence', color: '#22C55E' },
                { type: 'Acts', color: '#60A5FA' },
                { type: 'Sections', color: '#F59E0B' }
              ].map(item => (
                <div key={item.type} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-foreground">{item.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-xl overflow-hidden shrink-0 border border-border/50"
            >
              <div className="p-5 h-full overflow-y-auto">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedNode.color, color: selectedNode.color }} />
                    <h3 className="text-sm font-semibold capitalize">{selectedNode.type} Details</h3>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-foreground leading-tight">{selectedNode.label}</h4>
                    <p className="text-xs text-muted-foreground mt-1">ID: {selectedNode.id}</p>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Properties</h5>
                    {Object.entries(selectedNode.details || {}).map(([key, value]) => (
                      <div key={key} className="bg-secondary/30 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground capitalize mb-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <div className="text-sm font-medium text-foreground">{value as string}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Connected Entities</h5>
                    <div className="space-y-2">
                      {graphData.links
                        .filter(l => (l.source as any).id === selectedNode.id || (l.target as any).id === selectedNode.id)
                        .map((link, i) => {
                          const isSource = (link.source as any).id === selectedNode.id;
                          const connectedNode = isSource ? link.target as any : link.source as any;
                          return (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-border/30 hover:bg-secondary/20 cursor-pointer transition-colors"
                                 onClick={() => handleNodeClick(connectedNode)}>
                               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: connectedNode.color }} />
                               <div className="flex-1 overflow-hidden">
                                 <div className="text-xs text-muted-foreground truncate">{link.label}</div>
                                 <div className="text-sm font-medium text-foreground truncate">{connectedNode.label}</div>
                               </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors">
                    <FileText className="w-4 h-4" />
                    Full Report
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function RelationshipGraphPage() {
  const { crimes, loading } = useCrimes()
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('All')
  const [filterCrimeHead, setFilterCrimeHead] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  const uniqueDistricts = useMemo(() => Array.from(new Set(crimes.map(c => c.district))), [crimes])
  const uniqueCrimeHeads = useMemo(() => Array.from(new Set(crimes.map(c => c.crimeHead))), [crimes])
  const uniqueStatuses = useMemo(() => Array.from(new Set(crimes.map(c => c.status))), [crimes])

  const filteredCrimes = useMemo(() => {
    return crimes.filter(crime => {
      const matchesSearch = 
        crime.firNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crime.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crime.crimeHead.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesDistrict = filterDistrict === 'All' || crime.district === filterDistrict
      const matchesCrimeHead = filterCrimeHead === 'All' || crime.crimeHead === filterCrimeHead
      const matchesStatus = filterStatus === 'All' || crime.status === filterStatus

      return matchesSearch && matchesDistrict && matchesCrimeHead && matchesStatus
    })
  }, [crimes, searchQuery, filterDistrict, filterCrimeHead, filterStatus])

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader
        title="Investigation Graph"
        description="Visual analysis of connections between cases, accused, and evidence"
        icon={Network}
      />

      {!selectedCaseId ? (
        <div className="flex-1 flex flex-col min-h-0 bg-background/50 rounded-xl border border-border/50">
          <div className="p-4 border-b border-border/50 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 relative min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search FIR, District, or Crime Type..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={filterDistrict} 
                  onChange={e => setFilterDistrict(e.target.value)}
                  className="px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground outline-none"
                >
                  <option value="All">All Districts</option>
                  {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select 
                  value={filterCrimeHead} 
                  onChange={e => setFilterCrimeHead(e.target.value)}
                  className="px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground outline-none"
                >
                  <option value="All">All Crime Types</option>
                  {uniqueCrimeHeads.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select 
                  value={filterStatus} 
                  onChange={e => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground outline-none"
                >
                  <option value="All">All Statuses</option>
                  {uniqueStatuses.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredCrimes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Network className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium">Investigation Graph</p>
                <p className="text-sm mt-2 max-w-sm text-center">Select a case from the list to visualize relationships between suspects, victims, evidence, locations and connected entities.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="pb-3 px-4 font-semibold">FIR Number</th>
                      <th className="pb-3 px-4 font-semibold">Crime Head</th>
                      <th className="pb-3 px-4 font-semibold">District</th>
                      <th className="pb-3 px-4 font-semibold">Police Station</th>
                      <th className="pb-3 px-4 font-semibold">Status</th>
                      <th className="pb-3 px-4 font-semibold">Reported Date</th>
                      <th className="pb-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCrimes.map((crime) => (
                      <tr key={crime.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-4 font-medium text-sm text-foreground">{crime.firNumber}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{crime.crimeHead}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{crime.district}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{crime.location.policeUnit || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            crime.status === 'Open' || crime.status === 'Under Investigation' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            crime.status === 'Closed' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                            "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          )}>
                            {crime.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(crime.reportedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedCaseId(crime.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-md text-xs font-medium transition-colors"
                          >
                            <Network className="w-3.5 h-3.5" /> View Graph
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <GraphView caseId={selectedCaseId} onBack={() => setSelectedCaseId(null)} />
      )}
    </div>
  )
}
