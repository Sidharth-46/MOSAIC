import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout, AuthLayout } from '@/layouts/MainLayout'

// Pages
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import CrimeMapPage from '@/pages/CrimeMapPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import HotspotPredictionPage from '@/pages/HotspotPredictionPage'
import PatternDiscoveryPage from '@/pages/PatternDiscoveryPage'
import RelationshipGraphPage from '@/pages/RelationshipGraphPage'
import AIAssistantPage from '@/pages/AIAssistantPage'
import ReportParserPage from '@/pages/ReportParserPage'
import PatrolPlannerPage from '@/pages/PatrolPlannerPage'
import ResponsibleAIPage from '@/pages/ResponsibleAIPage'
import SettingsPage from '@/pages/SettingsPage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/map" element={<CrimeMapPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/predictions" element={<HotspotPredictionPage />} />
          <Route path="/patterns" element={<PatternDiscoveryPage />} />
          <Route path="/graph" element={<RelationshipGraphPage />} />
          <Route path="/assistant" element={<AIAssistantPage />} />
          <Route path="/reports" element={<ReportParserPage />} />
          <Route path="/patrol" element={<PatrolPlannerPage />} />
          <Route path="/responsible-ai" element={<ResponsibleAIPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
