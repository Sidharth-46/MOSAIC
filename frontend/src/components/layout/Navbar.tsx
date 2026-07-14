import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Search, Bell, User, ChevronRight, Settings, LogOut,
  Command, X, Shield
} from 'lucide-react'
import { StatusDot } from '@/components/common/PageElements'

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/map': 'Crime Map',
  '/analytics': 'Analytics',
  '/predictions': 'Hotspot Prediction',
  '/patterns': 'Pattern Discovery',
  '/graph': 'Relationship Graph',
  '/assistant': 'AI Assistant',
  '/reports': 'Report Parser',
  '/patrol': 'Patrol Planner',
  '/responsible-ai': 'Responsible AI',
  '/settings': 'Settings',
}

const notifications = [
  { id: 1, title: 'Critical Alert: Andheri Hotspot', message: 'Risk score exceeded 85% in Andheri West zone', time: '5 min ago', type: 'critical' as const },
  { id: 2, title: 'New Pattern Detected', message: 'Emerging vehicle theft corridor on Western Express Highway', time: '23 min ago', type: 'warning' as const },
  { id: 3, title: 'Patrol Update', message: 'Night shift deployment confirmed for Navi Mumbai Port area', time: '1 hr ago', type: 'info' as const },
  { id: 4, title: 'Report Generated', message: 'Weekly crime analytics report is ready for review', time: '2 hrs ago', type: 'info' as const },
  { id: 5, title: 'Model Updated', message: 'Prediction model retrained with latest data. Accuracy: 89.1%', time: '4 hrs ago', type: 'info' as const },
]

export function Navbar() {
  const location = useLocation()
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }))

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentPage = breadcrumbMap[location.pathname] || 'Dashboard'

  return (
    <>
      <header className="h-14 border-b border-border/50 glass-strong sticky top-0 z-30 flex items-center justify-between px-6">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">MOSAIC</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
          <span className="text-foreground font-medium">{currentPage}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* System Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/20 mr-2">
            <StatusDot status="online" />
            <span className="text-xs text-green-400 font-medium tracking-wide">SYSTEM ACTIVE</span>
          </div>

          {/* Threat Level */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/20 mr-2">
            <Shield className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-red-400 font-medium tracking-wide">THREAT: ELEVATED</span>
          </div>

          {/* Live Sync */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50 mr-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] text-muted-foreground font-mono">SYNC: {time} IST</span>
          </div>

          {/* Search */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-sm"
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background/50 text-[10px] font-mono">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false) }}
              className="relative p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-xl border border-border/50 shadow-2xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                    <span className="text-sm font-semibold">Notifications</span>
                    <span className="text-xs text-primary cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer border-b border-border/30 last:border-0">
                        <div className="flex items-start gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-1.5 shrink-0",
                            n.type === 'critical' && 'bg-red-400',
                            n.type === 'warning' && 'bg-yellow-400',
                            n.type === 'info' && 'bg-blue-400'
                          )} />
                          <div>
                            <p className="text-sm font-medium text-foreground">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false) }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary/60 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            </button>
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl border border-border/50 shadow-2xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-border/50">
                    <p className="text-sm font-semibold text-foreground">Inspector Priya Sharma</p>
                    <p className="text-xs text-muted-foreground">Crime Analytics Division</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors">
                      <Shield className="w-4 h-4" /> Security
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors">
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                  </div>
                  <div className="border-t border-border/50 py-1">
                    <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl glass-strong rounded-xl border border-border/50 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search crimes, locations, suspects, FIR numbers..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
                />
                <button onClick={() => setShowSearch(false)}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                Type to search across the MOSAIC intelligence database
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
