import { useState } from 'react';
import { Settings, User, Shield, Bell, Database, Wifi, Save } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import type { UserRole } from '@/types/greenhouse';

interface SettingsPageProps {
  userRole: UserRole;
}

export function SettingsPage({ userRole }: SettingsPageProps) {
  const [settings, setSettings] = useState({
    darkMode: true,
    autoRefresh: true,
    refreshInterval: 5,
    dataRetention: 30,
    mqttBroker: 'mqtt.greenhouse.local',
    mqttPort: 1883,
    notifications: true,
    soundAlerts: true
  });

  const isAdmin = userRole === 'admin';

  return (
    <div className="p-0 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-[#7d8590] mt-1">System configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Display Settings */}
        <div className="panel p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#58a6ff]/15 flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#58a6ff]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Display Settings</h3>
              <p className="text-xs text-[#7d8590]">Interface preferences</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#161b22] cursor-pointer">
              <span className="text-sm text-white">Dark Mode</span>
              <Switch 
                checked={settings.darkMode}
                onCheckedChange={(v) => setSettings(p => ({ ...p, darkMode: v }))}
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#161b22] cursor-pointer">
              <span className="text-sm text-white">Auto Refresh</span>
              <Switch 
                checked={settings.autoRefresh}
                onCheckedChange={(v) => setSettings(p => ({ ...p, autoRefresh: v }))}
              />
            </label>

            {settings.autoRefresh && (
              <div className="p-3 rounded-lg bg-[#161b22]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#7d8590]">Refresh Interval</span>
                  <span className="text-sm font-medium text-[#58a6ff]">{settings.refreshInterval}s</span>
                </div>
                <Slider
                  value={[settings.refreshInterval]}
                  onValueChange={(v) => setSettings(p => ({ ...p, refreshInterval: v[0] }))}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="panel p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d29922]/15 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#d29922]" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Notifications</h3>
              <p className="text-xs text-[#7d8590]">Alert preferences</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-[#161b22] cursor-pointer">
              <span className="text-sm text-white">Enable Notifications</span>
              <Switch 
                checked={settings.notifications}
                onCheckedChange={(v) => setSettings(p => ({ ...p, notifications: v }))}
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#161b22] cursor-pointer">
              <span className="text-sm text-white">Sound Alerts</span>
              <Switch 
                checked={settings.soundAlerts}
                onCheckedChange={(v) => setSettings(p => ({ ...p, soundAlerts: v }))}
              />
            </label>
          </div>
        </div>

        {/* Data Settings - Admin Only */}
        {isAdmin && (
          <div className="panel p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3fb950]/15 flex items-center justify-center">
                <Database className="w-5 h-5 text-[#3fb950]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Data Management</h3>
                <p className="text-xs text-[#7d8590]">Storage and retention</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#161b22]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#7d8590]">Data Retention (days)</span>
                  <span className="text-sm font-medium text-[#58a6ff]">{settings.dataRetention}</span>
                </div>
                <Slider
                  value={[settings.dataRetention]}
                  onValueChange={(v) => setSettings(p => ({ ...p, dataRetention: v[0] }))}
                  min={7}
                  max={365}
                  step={7}
                  className="w-full"
                />
              </div>

              <button className="w-full btn-touch btn-secondary">
                <Database className="w-4 h-4" />
                Export Data
              </button>

              <button className="w-full btn-touch btn-danger">
                <Database className="w-4 h-4" />
                Clear Historical Data
              </button>
            </div>
          </div>
        )}

        {/* MQTT Settings - Admin Only */}
        {isAdmin && (
          <div className="panel p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#a371f7]/15 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-[#a371f7]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">MQTT Configuration</h3>
                <p className="text-xs text-[#7d8590]">Broker connection settings</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-[#7d8590] mb-1 block">Broker Address</label>
                <input
                  type="text"
                  value={settings.mqttBroker}
                  onChange={(e) => setSettings(p => ({ ...p, mqttBroker: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-[#161b22] border border-[#21262d] text-white text-sm focus:border-[#58a6ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-[#7d8590] mb-1 block">Port</label>
                <input
                  type="number"
                  value={settings.mqttPort}
                  onChange={(e) => setSettings(p => ({ ...p, mqttPort: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-lg bg-[#161b22] border border-[#21262d] text-white text-sm focus:border-[#58a6ff] focus:outline-none"
                />
              </div>

              <button className="w-full btn-touch btn-primary">
                <Wifi className="w-4 h-4" />
                Test Connection
              </button>
            </div>
          </div>
        )}

        {/* User Management - Admin Only */}
        {isAdmin && (
          <div className="panel p-5 space-y-4 col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f85149]/15 flex items-center justify-center">
                <User className="w-5 h-5 text-[#f85149]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">User Management</h3>
                <p className="text-xs text-[#7d8590]">Manage system users and permissions</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#161b22]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#58a6ff]/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#58a6ff]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Administrator</p>
                      <p className="text-xs text-[#7d8590]">Full system access</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-[#58a6ff]/20 text-[#58a6ff] text-xs font-semibold">
                    ACTIVE
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#161b22]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#3fb950]/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#3fb950]" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Operator</p>
                      <p className="text-xs text-[#7d8590]">View and manual override only</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-[#7d8590]/20 text-[#7d8590] text-xs font-semibold">
                    INACTIVE
                  </span>
                </div>
              </div>
            </div>

            <button className="btn-touch btn-secondary">
              <User className="w-4 h-4" />
              Add New User
            </button>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn-touch btn-primary">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
