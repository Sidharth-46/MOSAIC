import { useState } from 'react'
import { Settings, Save, Bell, Shield, Moon, Monitor, Eye, Key } from 'lucide-react'
import { PageHeader } from '@/components/common/PageElements'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('appearance')

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <PageHeader
        title="System Settings"
        description="Manage your preferences and security configurations"
        icon={Settings}
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {[
            { id: 'appearance', label: 'Appearance', icon: Eye },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'api', label: 'API Keys', icon: Key },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                activeTab === tab.id 
                  ? "bg-primary/20 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="glass-card rounded-xl border border-border/50 p-6">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold mb-1">Theme Preferences</h3>
                  <p className="text-sm text-muted-foreground mb-4">Select the visual appearance of the platform.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'dark', label: 'Command Center (Dark)', icon: Moon },
                      { id: 'system', label: 'System Default', icon: Monitor },
                    ].map(theme => (
                      <button
                        key={theme.id}
                        className={cn(
                          "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all",
                          theme.id === 'dark' ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"
                        )}
                      >
                        <theme.icon className={cn("w-8 h-8", theme.id === 'dark' ? "text-primary" : "text-muted-foreground")} />
                        <span className={theme.id === 'dark' ? "text-primary font-medium" : "text-muted-foreground"}>{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <h3 className="text-base font-semibold mb-4">Interface Density</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-secondary/20 cursor-pointer transition-colors">
                      <div>
                        <div className="font-medium">Comfortable</div>
                        <div className="text-xs text-muted-foreground">More spacing between elements</div>
                      </div>
                      <input type="radio" name="density" className="accent-primary w-4 h-4" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-secondary/20 cursor-pointer transition-colors">
                      <div>
                        <div className="font-medium">Compact</div>
                        <div className="text-xs text-muted-foreground">Fits more data on screen. Ideal for analytics.</div>
                      </div>
                      <input type="radio" name="density" className="accent-primary w-4 h-4" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-base font-semibold mb-1">Notification Settings</h3>
                <p className="text-sm text-muted-foreground mb-4">Manage how and when you receive alerts.</p>

                <div className="space-y-4">
                  {[
                    { title: 'Critical Hotspot Alerts', desc: 'Push notifications when risk score > 80%' },
                    { title: 'New Pattern Discoveries', desc: 'Daily summary of AI-detected patterns' },
                    { title: 'Patrol Plan Updates', desc: 'When automatic recommendations change' },
                    { title: 'System Audits', desc: 'Weekly responsible AI compliance reports' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                      <div>
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                        <div className="w-9 h-5 bg-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
