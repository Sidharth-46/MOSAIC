import { useState, useEffect } from 'react';
import type { FIR } from '@/types/crime';
import { fetchFromAPI } from '@/lib/api';
import { KARNATAKA_INCIDENTS } from './karnataka-incidents';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import karnatakaGeoJSON from './karnataka.json';

// Define the bounding box for Karnataka to optimize random point generation
const KA_BBOX = {
  minLat: 11.5947,
  maxLat: 18.4727,
  minLng: 74.0543,
  maxLng: 78.5770
};

/**
 * Ensures a coordinate strictly falls inside the actual Karnataka GeoJSON polygon.
 * If not, it generates random points within the bounding box until one hits inside.
 */
function enforceKarnatakaBoundary(lat: number, lng: number): [number, number] {
  // First check if the original point is valid
  if (booleanPointInPolygon(point([lng, lat]), karnatakaGeoJSON as any)) {
    return [lat, lng];
  }

  // If outside, generate random points until one falls inside the polygon
  // Fallback limit of 100 attempts to prevent infinite loops
  for (let i = 0; i < 100; i++) {
    const randomLat = KA_BBOX.minLat + Math.random() * (KA_BBOX.maxLat - KA_BBOX.minLat);
    const randomLng = KA_BBOX.minLng + Math.random() * (KA_BBOX.maxLng - KA_BBOX.minLng);
    if (booleanPointInPolygon(point([randomLng, randomLat]), karnatakaGeoJSON as any)) {
      return [randomLat, randomLng];
    }
  }

  // Fallback to a known safe central coordinate (Bengaluru) if generation fails
  return [12.9716, 77.5946];
}

/**
 * Determines if backend data is "rich" enough to display meaningfully.
 */
function isBackendDataRich(data: FIR[]): boolean {
  if (data.length === 0) return false;

  const uniqueHeads = new Set(data.map(d => d.crimeHead));
  const uniqueGroups = new Set(data.map(d => d.crimeGroup));

  if (uniqueHeads.size <= 1 && uniqueHeads.has('Others' as any)) return false;
  if (uniqueGroups.size <= 1) return false;

  return true;
}

/**
 * Merges backend live data with the handcrafted fallback data,
 * and forces ALL coordinates to strictly lie within the Karnataka state boundary polygon.
 */
function mergeWithFallbackAndValidate(backendData: FIR[]): FIR[] {
  let finalData: FIR[] = [];
  
  if (isBackendDataRich(backendData)) {
    finalData = backendData;
  } else {
    const fallbackIds = new Set(KARNATAKA_INCIDENTS.map(f => f.id));
    const uniqueBackend = backendData.filter(b => !fallbackIds.has(b.id));
    finalData = [...KARNATAKA_INCIDENTS, ...uniqueBackend];
  }

  // Validate and correct every coordinate
  return finalData.map(crime => {
    const [validLat, validLng] = enforceKarnatakaBoundary(crime.location.latitude, crime.location.longitude);
    return {
      ...crime,
      location: {
        ...crime.location,
        latitude: validLat,
        longitude: validLng,
      }
    };
  });
}

export function useCrimes() {
  const [crimes, setCrimes] = useState<FIR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadCrimes() {
      try {
        setLoading(true);
        const data = await fetchFromAPI<FIR[]>('/cases?limit=200');

        const validData = mergeWithFallbackAndValidate(data);

        const sorted = [...validData].sort(
          (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
        );

        setCrimes(sorted);
        setError(null);
      } catch (err) {
        console.warn('[useCrimes] Backend unavailable, using fallback data:', err);
        const validData = mergeWithFallbackAndValidate([]);
        const sorted = [...validData].sort(
          (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
        );
        setCrimes(sorted);
        setError(null);
      } finally {
        setLoading(false);
      }
    }

    loadCrimes();
  }, []);

  return { crimes, loading, error };
}
