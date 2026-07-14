import { useState, useEffect } from 'react';
import type { GraphData } from '@/types/graph';
import { fetchFromAPI } from '@/lib/api';

const defaultGraphData: GraphData = {
  nodes: [],
  links: []
};

export function useGraph(caseId?: string) {
  const [graphData, setGraphData] = useState<GraphData>(defaultGraphData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGraph() {
      try {
        setLoading(true);
        // If caseId is provided, fetch graph for that specific case. Otherwise fetch global graph.
        const endpoint = caseId ? `/misc/graph/${caseId}` : '/misc/graph';
        const data = await fetchFromAPI<GraphData>(endpoint);
        setGraphData(data);
      } catch (err) {
        console.error('Failed to load graph:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, [caseId]);

  return { graphData, loading };
}
