import { useState, useEffect } from 'react';
import { fetchFromAPI } from '@/lib/api';

const defaultDashboardKPIs = [
  { label: 'Registered FIRs', value: '0', change: 0, changeLabel: 'vs last month', icon: 'FileText', trend: 'stable' as const },
  { label: 'Pending Investigations', value: '0', change: 0, changeLabel: 'vs last month', icon: 'Clock', trend: 'stable' as const },
  { label: 'Charge Sheets Filed', value: '0', change: 0, changeLabel: 'vs last month', icon: 'CheckCircle', trend: 'stable' as const },
  { label: 'Arrests Made', value: '0', change: 0, changeLabel: 'vs last month', icon: 'Users', trend: 'stable' as const },
  { label: 'Active Hotspots', value: '0', change: 0, changeLabel: 'vs last week', icon: 'Flame', trend: 'stable' as const },
  { label: 'Average Investigation Time', value: '0 days', change: 0, changeLabel: 'vs last quarter', icon: 'Clock', trend: 'stable' as const },
]

const defaultCategoryData = [
  { name: 'Loading', value: 100, percentage: 100, color: 'hsl(215, 20%, 35%)' },
]

const defaultHourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  count: 0
}))

const defaultTrendData = [
  { month: 'Jan', total: 0, assault: 0, burglary: 0 },
]

const defaultDistrictStats = [
  { district: 'Loading...', totalCrimes: 0, resolved: 0, pending: 0 },
]

const defaultSeasonalData = [
  { season: 'Q1 (Jan-Mar)', violent: 0, property: 0, cyber: 0 },
]

const defaultWeeklyData = [
  { day: 'Mon', morning: 0, afternoon: 0, evening: 0, night: 0 },
]

export function useAnalytics() {
  const [data, setData] = useState({
    dashboardKPIs: defaultDashboardKPIs,
    categoryData: defaultCategoryData,
    hourlyData: defaultHourlyData,
    trendData: defaultTrendData,
    districtStats: defaultDistrictStats,
    seasonalData: defaultSeasonalData,
    weeklyData: defaultWeeklyData,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [dashboardRes, analyticsRes] = await Promise.all([
          fetchFromAPI<any>('/dashboard'),
          fetchFromAPI<any>('/analytics')
        ]);
        
        setData({
          dashboardKPIs: dashboardRes.kpis || defaultDashboardKPIs,
          categoryData: analyticsRes.categoryData || defaultCategoryData,
          hourlyData: analyticsRes.hourlyData || defaultHourlyData,
          trendData: analyticsRes.trendData || defaultTrendData,
          districtStats: analyticsRes.districtStats || defaultDistrictStats,
          seasonalData: analyticsRes.seasonalData || defaultSeasonalData,
          weeklyData: analyticsRes.weeklyData || defaultWeeklyData,
        });
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return { ...data, loading };
}
