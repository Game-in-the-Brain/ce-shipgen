import { useState, useEffect } from 'react'
import { ArrowLeft, Monitor, Smartphone, Moon, Sun, Laptop, Clock, ChevronDown, ChevronUp, Tag } from 'lucide-react'
import JsonTableEditor from '../settings/JsonTableEditor'
import RuleSettings from '../settings/RuleSettings'
import SettingsSnapshots from '../settings/SettingsSnapshots'
import TablesInPlay from '../settings/TablesInPlay'

interface VersionEntry {
  version: string
  date: string
  buildTime: string
  changes: string[]
}

interface SettingsScreenProps {
  layoutMode: 'desktop' | 'phone'
  onLayoutChange: (mode: 'desktop' | 'phone') => void
  onBack: () => void
}

export default function SettingsScreen({ layoutMode, onLayoutChange, onBack }: SettingsScreenProps) {
  const [snapshotVersion, setSnapshotVersion] = useState(0)
  const [history, setHistory] = useState<VersionEntry[]>([])
  const [currentVersion, setCurrentVersion] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}version.json`)
      .then(r => r.json())
      .then((data: { version: string }) => setCurrentVersion(data.version))
      .catch(() => setCurrentVersion(''))

    fetch(`${import.meta.env.BASE_URL}version-history.json`)
      .then(r => r.json())
      .then((data: VersionEntry[]) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
  }, [])

  const toggleExpand = (version: string) => {
    setExpanded(prev => ({ ...prev, [version]: !prev[version] }))
  }

  return (
    <div className="h-full flex flex-col bg-space-900">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-space-700 bg-space-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h2 className="text-xl font-semibold text-white">Settings</h2>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Layout Settings */}
          <section className="bg-space-800 rounded-xl border border-space-700 overflow-hidden">
            <div className="p-4 border-b border-space-700">
              <h3 className="font-semibold text-white">Layout</h3>
              <p className="text-sm text-gray-400 mt-1">Choose your preferred display mode</p>
            </div>
            <div className="p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => onLayoutChange('desktop')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    layoutMode === 'desktop'
                      ? 'border-accent-cyan bg-accent-cyan/10'
                      : 'border-space-600 hover:border-space-500'
                  }`}
                >
                  <Monitor size={32} className={layoutMode === 'desktop' ? 'text-accent-cyan' : 'text-gray-400'} />
                  <span className={`font-medium ${layoutMode === 'desktop' ? 'text-accent-cyan' : 'text-gray-300'}`}>
                    Desktop
                  </span>
                  <span className="text-xs text-gray-500">Horizontal tiling</span>
                </button>

                <button
                  onClick={() => onLayoutChange('phone')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    layoutMode === 'phone'
                      ? 'border-accent-cyan bg-accent-cyan/10'
                      : 'border-space-600 hover:border-space-500'
                  }`}
                >
                  <Smartphone size={32} className={layoutMode === 'phone' ? 'text-accent-cyan' : 'text-gray-400'} />
                  <span className={`font-medium ${layoutMode === 'phone' ? 'text-accent-cyan' : 'text-gray-300'}`}>
                    Phone
                  </span>
                  <span className="text-xs text-gray-500">Vertical tiling</span>
                </button>
              </div>
            </div>
          </section>

          {/* Rule Settings */}
          <RuleSettings />

          {/* Tables In Play */}
          <TablesInPlay />

          {/* Snapshots */}
          <SettingsSnapshots onSnapshotLoad={() => setSnapshotVersion(v => v + 1)} />

          {/* JSON Table Editor */}
          <JsonTableEditor key={snapshotVersion} />

          {/* Theme Settings */}
          <section className="bg-space-800 rounded-xl border border-space-700 overflow-hidden">
            <div className="p-4 border-b border-space-700">
              <h3 className="font-semibold text-white">Theme</h3>
              <p className="text-sm text-gray-400 mt-1">Choose your color scheme</p>
            </div>
            <div className="p-4">
              <div className="flex gap-3">
                <button className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-accent-cyan bg-accent-cyan/10">
                  <Moon size={24} className="text-accent-cyan" />
                  <span className="font-medium text-accent-cyan">Dark</span>
                </button>
                <button className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-space-600 hover:border-space-500">
                  <Sun size={24} className="text-gray-400" />
                  <span className="font-medium text-gray-300">Light</span>
                </button>
                <button className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-space-600 hover:border-space-500">
                  <Laptop size={24} className="text-gray-400" />
                  <span className="font-medium text-gray-300">Auto</span>
                </button>
              </div>
            </div>
          </section>

          {/* Version History */}
          <section className="bg-space-800 rounded-xl border border-space-700 overflow-hidden">
            <div className="p-4 border-b border-space-700">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Clock size={18} className="text-accent-cyan" />
                Version History
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {currentVersion ? `Current: v${currentVersion}` : 'Build information'}
              </p>
            </div>
            <div className="p-4 space-y-3">
              {history.length === 0 && (
                <p className="text-sm text-gray-500">No version history available.</p>
              )}
              {history.map((entry, idx) => {
                const isCurrent = entry.version === currentVersion
                const isExpanded = expanded[entry.version] ?? idx === 0
                return (
                  <div
                    key={entry.version}
                    className={`rounded-lg border p-3 transition-all ${
                      isCurrent
                        ? 'border-accent-cyan bg-accent-cyan/10'
                        : 'border-space-600 bg-space-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className={isCurrent ? 'text-accent-cyan' : 'text-gray-500'} />
                        <span className={`font-semibold ${isCurrent ? 'text-accent-cyan' : 'text-gray-300'}`}>
                          v{entry.version}
                        </span>
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent-cyan/20 text-accent-cyan font-medium">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{entry.date}</span>
                    </div>
                    <button
                      onClick={() => toggleExpand(entry.version)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-white mt-2 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Hide changes' : `Show ${entry.changes?.length || 0} changes`}
                    </button>
                    {isExpanded && entry.changes && entry.changes.length > 0 && (
                      <ul className="mt-2 space-y-1 pl-4">
                        {entry.changes.map((change, i) => (
                          <li key={i} className="text-sm text-gray-400 list-disc">
                            {change}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
