import { useState, useEffect } from 'react';
import type { FIR } from '@/types/crime';
import { fetchFromAPI } from '@/lib/api';

// Ensure we don't break the UI if the backend is down by providing empty array fallback
export function useCrimes() {
  const [crimes, setCrimes] = useState<FIR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadCrimes() {
      try {
        setLoading(true);
        const data = await fetchFromAPI<FIR[]>('/cases?limit=200');
        
        // Ensure data is properly formatted and sorted
        const sortedData = [...data].sort((a, b) => 
          new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
        );
        
        setCrimes(sortedData);
        setError(null);
      } catch (err) {
        console.error('Failed to load crimes:', err);
        setError(err instanceof Error ? err : new Error('Failed to load crimes'));
        // Could set fallbackCrimes here if we wanted
      } finally {
        setLoading(false);
      }
    }

    loadCrimes();
  }, []);

  return { crimes, loading, error };
}
