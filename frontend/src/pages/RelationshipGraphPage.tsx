import { useState, useRef, useEffect, useCallback } from 'react'
import { Network, ZoomIn, ZoomOut, Maximize, FileText, X } from 'lucide-react'
import ForceGraph2D from 'react-force-graph-2d'
import type { ForceGraphMethods } from 'react-force-graph-2d'
import { PageHeader, Badge } from '@/components/common/PageElements'
import { useGraph } from '@/data/graph'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { GraphNode } from '@/types/graph'

export default function RelationshipGraphPage() {
  const { graphData, loading } = useGraph()
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
      // Zoom in slightly on the node
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
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader
        title="Entity Relationship Graph"
        description="Visual analysis of connections between cases, accused, and evidence"
        icon={Network}
      />

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
                { type: 'Sections', color: '#F59E0B' },
                { type: 'Chargesheet', color: '#38BDF8' },
                { type: 'Court', color: '#94A3B8' }
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
