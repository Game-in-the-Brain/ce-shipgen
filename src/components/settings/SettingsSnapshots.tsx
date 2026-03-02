import { useState, useEffect, useRef } from 'react'
import { Save, Upload, RotateCcw, Check, Trash2, Download } from 'lucide-react'
import { DATA_TABLES } from './JsonTableEditor'
import type { RuleSet } from './RuleSettings'

interface SettingsSnapshot {
  id: string
  name: string
  createdAt: string
  tables: Record<string, any[]>
  rules: RuleSet
}

interface SettingsSnapshotsProps {
  onSnapshotLoad?: () => void
}

const STORAGE_KEY = 'ce_shipgen_presets'
const MAX_SNAPSHOTS = 50
const WARN_SNAPSHOTS = 40

function generateId(): string {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  const nnn = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `${yy}${mm}${dd}:${hh}${min}${ss}-${nnn}`
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function loadSnapshots(): SettingsSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SettingsSnapshot[]
  } catch {
    return []
  }
}

function saveSnapshots(list: SettingsSnapshot[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function SettingsSnapshots({ onSnapshotLoad }: SettingsSnapshotsProps) {
  const [snapshots, setSnapshots] = useState<SettingsSnapshot[]>(() => loadSnapshots())
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [newSnapshotName, setNewSnapshotName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(msg)
    toastTimerRef.current = setTimeout(() => setToast(null), 3000)
  }

  const handleShowSaveForm = () => {
    setNewSnapshotName(generateId())
    setShowSaveForm(true)
  }

  const handleConfirmSave = async () => {
    if (!newSnapshotName.trim()) return
    if (snapshots.length >= MAX_SNAPSHOTS) {
      alert(`Maximum ${MAX_SNAPSHOTS} snapshots reached. Delete some before saving.`)
      return
    }

    setIsSaving(true)
    try {
      const tables: Record<string, any[]> = {}
      for (const table of DATA_TABLES) {
        const key = `ce_shipgen_table_${table.id}`
        const saved = localStorage.getItem(key)
        if (saved) {
          try {
            tables[table.id] = JSON.parse(saved)
          } catch {
            tables[table.id] = []
          }
        } else {
          // Fetch from default data file
          try {
            const response = await fetch(`${import.meta.env.BASE_URL}data/${table.file}`)
            if (response.ok) {
              tables[table.id] = await response.json()
            } else {
              tables[table.id] = []
            }
          } catch {
            tables[table.id] = []
          }
        }
      }

      const rulesRaw = localStorage.getItem('ce_shipgen_rules')
      const rules: RuleSet = rulesRaw ? JSON.parse(rulesRaw) : {
        ruleSet: 'cepheus',
        bridgeCalculation: 'ce_fixed',
        lifePods: 'ce_standard',
        navCommSkill: 'ce_electronics',
        useSuperiority: false,
        onlyPlayersRoll: false,
        useMAC: false,
        customRules: []
      }

      const snapshot: SettingsSnapshot = {
        id: crypto.randomUUID ? crypto.randomUUID() : generateId(),
        name: newSnapshotName.trim(),
        createdAt: new Date().toISOString(),
        tables,
        rules,
      }

      const updated = [...snapshots, snapshot]
      saveSnapshots(updated)
      setSnapshots(updated)
      setShowSaveForm(false)
      setNewSnapshotName('')

      if (updated.length >= WARN_SNAPSHOTS) {
        showToast(`Snapshot saved. Note: ${updated.length}/${MAX_SNAPSHOTS} slots used.`)
      } else {
        showToast(`Snapshot "${snapshot.name}" saved.`)
      }
    } catch {
      alert('Error saving snapshot.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRenameConfirm = (id: string) => {
    if (!renameValue.trim()) return
    const updated = snapshots.map(s => s.id === id ? { ...s, name: renameValue.trim() } : s)
    saveSnapshots(updated)
    setSnapshots(updated)
    setRenamingId(null)
  }

  const handleDelete = (id: string) => {
    const updated = snapshots.filter(s => s.id !== id)
    saveSnapshots(updated)
    setSnapshots(updated)
    setDeleteConfirmId(null)
    showToast('Snapshot deleted.')
  }

  const handleLoad = (snapshot: SettingsSnapshot) => {
    if (!confirm(`Load snapshot "${snapshot.name}"? This will overwrite current table data and rules.`)) return

    for (const [tableId, data] of Object.entries(snapshot.tables)) {
      localStorage.setItem(`ce_shipgen_table_${tableId}`, JSON.stringify(data))
    }
    localStorage.setItem('ce_shipgen_rules', JSON.stringify(snapshot.rules))
    onSnapshotLoad?.()
    showToast(`Loaded "${snapshot.name}". Re-select tables to refresh editor.`)
  }

  const handleExport = (snapshot: SettingsSnapshot) => {
    const date = new Date(snapshot.createdAt)
    const yy = String(date.getFullYear()).slice(2)
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const dateStr = `${yy}${mm}${dd}`
    const slug = slugify(snapshot.name) || dateStr
    const filename = `ce-shipgen-${slug}-${dateStr}.json`
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string
        const parsed = JSON.parse(raw) as unknown

        // Validate shape
        if (
          typeof parsed !== 'object' || parsed === null ||
          !('id' in parsed) || !('name' in parsed) || !('createdAt' in parsed) ||
          !('tables' in parsed) || !('rules' in parsed)
        ) {
          alert('Invalid snapshot file: missing required fields.')
          return
        }

        const snapshot = parsed as SettingsSnapshot
        // Assign a fresh id to avoid collision
        const imported: SettingsSnapshot = {
          ...snapshot,
          id: crypto.randomUUID ? crypto.randomUUID() : generateId(),
          name: `${snapshot.name} (imported)`,
        }

        if (snapshots.length >= MAX_SNAPSHOTS) {
          alert(`Maximum ${MAX_SNAPSHOTS} snapshots reached. Delete some before importing.`)
          return
        }

        const updated = [...snapshots, imported]
        saveSnapshots(updated)
        setSnapshots(updated)
        showToast(`Imported "${imported.name}".`)
      } catch {
        alert('Error importing: invalid JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleResetAll = () => {
    if (!confirm('Reset ALL table data to web defaults? This cannot be undone. (Snapshots and ships are not affected.)')) return

    // Remove all table keys and rules
    for (const table of DATA_TABLES) {
      localStorage.removeItem(`ce_shipgen_table_${table.id}`)
    }
    localStorage.removeItem('ce_shipgen_rules')
    onSnapshotLoad?.()
    showToast('Reset to defaults. Re-select a table to see changes.')
  }

  const reversed = [...snapshots].reverse()

  return (
    <div className="bg-space-800 rounded-xl border border-space-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-space-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Settings Snapshots</h3>
          <p className="text-sm text-gray-400">Save and restore complete settings configurations</p>
        </div>
        {toast && (
          <span className="flex items-center gap-1 px-2 py-1 bg-accent-green/20 text-accent-green text-xs rounded-full">
            <Check size={14} />
            {toast}
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Save button / form */}
        {!showSaveForm ? (
          <button
            onClick={handleShowSaveForm}
            className="flex items-center gap-2 px-4 py-2 bg-accent-cyan hover:bg-cyan-400 text-space-900 font-medium rounded-lg transition-colors"
          >
            <Save size={18} />
            Save Snapshot
          </button>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-space-700/50 rounded-lg">
            <input
              type="text"
              value={newSnapshotName}
              onChange={e => setNewSnapshotName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') void handleConfirmSave()
                if (e.key === 'Escape') setShowSaveForm(false)
              }}
              className="flex-1 px-3 py-1.5 bg-space-900 border border-space-600 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-cyan font-mono"
              placeholder="Snapshot name"
              autoFocus
            />
            <button
              onClick={() => void handleConfirmSave()}
              disabled={isSaving || !newSnapshotName.trim()}
              className="px-3 py-1.5 bg-accent-cyan hover:bg-cyan-400 disabled:opacity-50 text-space-900 font-medium rounded-lg text-sm transition-colors"
            >
              {isSaving ? 'Saving…' : 'Confirm'}
            </button>
            <button
              onClick={() => setShowSaveForm(false)}
              className="px-3 py-1.5 bg-space-600 hover:bg-space-500 text-gray-300 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Snapshot list */}
        {reversed.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No snapshots saved yet.</p>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">{snapshots.length}/{MAX_SNAPSHOTS} snapshots</div>
            {reversed.map(snapshot => (
              <div key={snapshot.id} className="p-3 bg-space-700/50 rounded-lg">
                {/* Name row */}
                <div className="flex items-center gap-2 mb-2">
                  {renamingId === snapshot.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRenameConfirm(snapshot.id)
                        if (e.key === 'Escape') setRenamingId(null)
                      }}
                      className="flex-1 px-2 py-1 bg-space-900 border border-space-600 rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-accent-cyan font-mono"
                      autoFocus
                    />
                  ) : (
                    <button
                      className="flex-1 text-left text-sm font-mono text-gray-200 hover:text-white truncate"
                      onClick={() => { setRenamingId(snapshot.id); setRenameValue(snapshot.name) }}
                      title="Click to rename"
                    >
                      {snapshot.name}
                    </button>
                  )}
                  <span className="text-xs text-gray-500 shrink-0">
                    {new Date(snapshot.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Action buttons */}
                {deleteConfirmId === snapshot.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-accent-red">Delete permanently?</span>
                    <button
                      onClick={() => handleDelete(snapshot.id)}
                      className="px-2 py-1 bg-accent-red/20 hover:bg-accent-red/40 text-accent-red text-xs rounded transition-colors"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1 bg-space-600 hover:bg-space-500 text-gray-300 text-xs rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleLoad(snapshot)}
                      className="flex items-center gap-1 px-2 py-1 bg-accent-cyan/20 hover:bg-accent-cyan/40 text-accent-cyan text-xs rounded transition-colors"
                    >
                      <Upload size={12} />
                      Load
                    </button>
                    <button
                      onClick={() => handleExport(snapshot)}
                      className="flex items-center gap-1 px-2 py-1 bg-space-600 hover:bg-space-500 text-gray-300 text-xs rounded transition-colors"
                    >
                      <Download size={12} />
                      Export
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(snapshot.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-space-600 hover:bg-accent-red/30 text-gray-400 hover:text-accent-red text-xs rounded transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Import / Reset All */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-space-700">
          <label className="flex items-center gap-2 px-4 py-2 bg-space-700 hover:bg-space-600 text-gray-200 rounded-lg transition-colors cursor-pointer text-sm">
            <Upload size={16} />
            Import Snapshot
            <input
              ref={importRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 px-4 py-2 bg-space-700 hover:bg-accent-red/30 text-gray-400 hover:text-accent-red rounded-lg transition-colors text-sm"
          >
            <RotateCcw size={16} />
            Reset All to Defaults
          </button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Snapshots save all table data and rule settings together</p>
          <p>• Click a snapshot name to rename it</p>
          <p>• Load overwrites current settings; re-select a table to see changes</p>
          <p>• Reset All removes all customizations (ships and snapshots are kept)</p>
        </div>
      </div>
    </div>
  )
}
