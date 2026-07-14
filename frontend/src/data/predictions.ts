import { useState, useEffect } from 'react';
import { fetchFromAPI } from '@/lib/api';

const defaultInsightsSummary = [
  { label: 'Loading insights...', type: 'warning' as const },
]

const defaultPredictions: any[] = []
const defaultPatterns: any[] = []

export function usePredictions() {
  const [data, setData] = useState({
    insightsSummary: defaultInsightsSummary,
    predictions: defaultPredictions,
    patterns: defaultPatterns,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPredictions() {
      try {
        const res = await fetchFromAPI<any>('/predictions');
        setData({
          insightsSummary: res.insightsSummary || defaultInsightsSummary,
          predictions: res.predictions || defaultPredictions,
          patterns: res.patterns || defaultPatterns,
        });
      } catch (err) {
        console.error('Failed to load predictions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPredictions();
  }, []);

  return { ...data, loading };
}
