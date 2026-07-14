export type NodeType = 'CaseMaster' | 'Victim' | 'Accused' | 'Police Station' | 'Court' | 'Acts' | 'Sections' | 'Chargesheet' | 'Investigating Officer' | 'Evidence'

export interface GraphNode {
  id: string
  type: NodeType
  label: string
  details: Record<string, string | number>
  color?: string
  size?: number
}

export interface GraphLink {
  source: string
  target: string
  label: string
  strength: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}
