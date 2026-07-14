import { useState, useEffect } from 'react';
import { fetchFromAPI } from '@/lib/api';

const defaultDummyChatHistory = [
  {
    id: 'msg-1',
    role: 'user' as const,
    content: 'Show me the recent chain snatching FIRs in Hubballi.',
    timestamp: '2026-07-13T09:00:00Z'
  },
  {
    id: 'msg-2',
    role: 'assistant' as const,
    content: 'Welcome to the Investigative Copilot. Connecting to live backend...',
    timestamp: '2026-07-13T09:00:15Z'
  }
]

const defaultSuggestedPrompts = [
  'Show theft FIRs in Bengaluru Urban this month',
  'Find repeat accused',
  'Summarize FIR KA202600124',
  'Find similar FIRs',
  'Compare Mysuru and Belagavi crime trends',
  'Show active hotspots near Whitefield',
  'Show pending investigations'
]

const defaultPatrolZones: any[] = [];
const defaultResponsibleAIMetrics: any[] = [];
const defaultReportEntities: any[] = [];

export function useMisc() {
  const [data, setData] = useState({
    patrolZones: defaultPatrolZones,
    responsibleAIMetrics: defaultResponsibleAIMetrics,
    suggestedPrompts: defaultSuggestedPrompts,
    dummyChatHistory: defaultDummyChatHistory,
    dummyReportEntities: defaultReportEntities,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMisc() {
      try {
        const res = await fetchFromAPI<any>('/misc');
        setData({
          patrolZones: res.patrolZones || defaultPatrolZones,
          responsibleAIMetrics: res.responsibleAIMetrics || defaultResponsibleAIMetrics,
          suggestedPrompts: res.suggestedPrompts || defaultSuggestedPrompts,
          dummyChatHistory: res.dummyChatHistory || defaultDummyChatHistory,
          dummyReportEntities: res.dummyReportEntities || defaultReportEntities,
        });
      } catch (err) {
        console.error('Failed to load misc data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMisc();
  }, []);

  return { ...data, loading };
}
