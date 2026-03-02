import { useState, useEffect, useCallback } from 'react'
import { Check, AlertCircle, Download, Upload, RotateCcw, Save, ChevronDown, FileJson, Table as TableIcon } from 'lucide-react'
import TableDataEditor from './TableDataEditor'

// List of all data tables
const DATA_TABLES = [
  { id: 'ship_hulls', name: 'Hull Specifications', file: 'ship_hulls.json', description: '18 hull sizes from 10 to 5000 tons' },
  { id: 'ship_drives', name: 'Standard Drives', file: 'ship_drives.json', description: '26 drive codes (A-Z) with J-drive, M-drive, Power Plant' },
  { id: 'smallcraft_drives', name: 'Small Craft Drives', file: 'smallcraft_drives.json', description: '21 small craft drive codes (sA-sW)' },
  { id: 'ship_armor', name: 'Armor Types', file: 'ship_armor.json', description: 'Titanium, Crystaliron, Bonded Superdense' },
  { id: 'hull_configurations', name: 'Hull Configurations', file: 'hull_configurations.json', description: 'Distributed, Standard, Streamlined' },
  { id: 'ship_bridge_computer', name: 'Bridge & Computer', file: 'ship_bridge_computer.json', description: 'Bridge sizes and computer models' },
  { id: 'ship_software', name: 'Ship Software', file: 'ship_software.json', description: 'Auto-Repair, Evade, Fire Control, Jump Control' },
  { id: 'ship_sensors', name: 'Sensor Systems', file: 'ship_sensors.json', description: 'Standard, Civilian, Military, Advanced sensors' },
  { id: 'ship_crew', name: 'Crew Requirements', file: 'ship_crew.json', description: 'All crew positions and requirements' },
  { id: 'life_support', name: 'Life Support & Accommodations', file: 'life_support.json', description: 'Staterooms, berths, facilities' },
  { id: 'ship_weapons', name: 'Weapons', file: 'ship_weapons.json', description: 'Turrets, bays, missiles' },
  { id: 'ship_missiles', name: 'Missile Types', file: 'ship_missiles.json', description: 'Standard, Smart, Nuclear missiles' },
  { id: 'ship_vehicles', name: 'Vehicles & Drones', file: 'ship_vehicles.json', description: 'Small craft, vehicles, drones' },
] as const

type ValidationStatus = 'valid' | 'invalid' | 'parsing' | null
type ViewMode = 'json' | 'table'

interface JsonEditorProps {
  onDataChange?: (tableId: string, data: any) => void
}

export default function JsonTableEditor({ onDataChange }: JsonEditorProps) {
  const [selectedTable, setSelectedTable] = useState<string>(DATA_TABLES[0].id)
  const [jsonContent, setJsonContent] = useState<string>('')
  const [originalContent, setOriginalContent] = useState<string>('')
  const [parsedData, setParsedData] = useState<any[]>([])
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>(null)
  const [validationError, setValidationError] = useState<string>('')
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [storageKey, setStorageKey] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('table') // Default to table view

  // Load table data
  const loadTable = useCallback(async (tableId: string) => {
    setIsLoading(true)
    setValidationStatus(null)
    setValidationError('')
    
    const table = DATA_TABLES.find(t => t.id === tableId)
    if (!table) return

    const key = `ce_shipgen_table_${tableId}`
    setStorageKey(key)

    try {
      // First try to load from localStorage (customized data)
      const saved = localStorage.getItem(key)
      
      if (saved) {
        setJsonContent(saved)
        setOriginalContent(saved)
        validateJson(saved)
      } else {
        // Load from default data file
        const response = await fetch(`${import.meta.env.BASE_URL}data/${table.file}`)
        if (response.ok) {
          const data = await response.json()
          const formatted = JSON.stringify(data, null, 2)
          setJsonContent(formatted)
          setOriginalContent(formatted)
          validateJson(formatted)
        } else {
          // If file doesn't exist, create empty template
          setJsonContent('[]')
          setOriginalContent('[]')
          validateJson('[]')
        }
      }
    } catch (error) {
      console.error('Error loading table:', error)
      setJsonContent('[]')
      setOriginalContent('[]')
      validateJson('[]')
    } finally {
      setIsLoading(false)
      setHasChanges(false)
    }
  }, [])

  // Load initial table
  useEffect(() => {
    loadTable(selectedTable)
  }, [selectedTable, loadTable])

  // Validate JSON and parse data
  const validateJson = (content: string): boolean => {
    setValidationStatus('parsing')
    
    try {
      const parsed = JSON.parse(content)
      setParsedData(Array.isArray(parsed) ? parsed : [parsed])
      setValidationStatus('valid')
      setValidationError('')
      return true
    } catch (error) {
      setValidationStatus('invalid')
      setValidationError(error instanceof Error ? error.message : 'Invalid JSON')
      return false
    }
  }

  // Handle table data changes from TableDataEditor
  const handleTableDataChange = (newData: any[]) => {
    const formatted = JSON.stringify(newData, null, 2)
    setJsonContent(formatted)
    setParsedData(newData)
    setHasChanges(formatted !== originalContent)
    validateJson(formatted)
  }

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setJsonContent(newContent)
    validateJson(newContent)
    setHasChanges(newContent !== originalContent)
  }

  // Save changes
  const handleSave = () => {
    if (validationStatus !== 'valid') {
      alert('Cannot save: JSON is invalid. Please fix the errors first.')
      return
    }

    try {
      const parsed = JSON.parse(jsonContent)
      localStorage.setItem(storageKey, jsonContent)
      setOriginalContent(jsonContent)
      setHasChanges(false)
      onDataChange?.(selectedTable, parsed)
      alert('Changes saved successfully!')
    } catch (error) {
      alert('Error saving: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // Reset to original
  const handleReset = () => {
    if (hasChanges && !confirm('Are you sure? All unsaved changes will be lost.')) {
      return
    }

    localStorage.removeItem(storageKey)
    loadTable(selectedTable)
    alert('Table reset to default values.')
  }

  // Export table
  const handleExport = () => {
    if (validationStatus !== 'valid') {
      alert('Cannot export: JSON is invalid.')
      return
    }

    const table = DATA_TABLES.find(t => t.id === selectedTable)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = table?.file || `${selectedTable}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Import table
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        // Validate before setting
        JSON.parse(content)
        setJsonContent(content)
        validateJson(content)
        setHasChanges(true)
        alert('File imported successfully. Click "Save Changes" to apply.')
      } catch (error) {
        alert('Error importing file: Invalid JSON')
      }
    }
    reader.readAsText(file)
  }

  const selectedTableInfo = DATA_TABLES.find(t => t.id === selectedTable)

  return (
    <div className="bg-space-800 rounded-xl border border-space-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-space-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Data Tables</h3>
          <p className="text-sm text-gray-400">Edit ship component definitions</p>
        </div>
        {hasChanges && (
          <span className="px-2 py-1 bg-accent-orange/20 text-accent-orange text-xs rounded-full">
            Unsaved Changes
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Table Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Table
          </label>
          <div className="relative">
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full dropdown bg-space-700 text-white"
            >
              {DATA_TABLES.map(table => (
                <option key={table.id} value={table.id}>
                  {table.name} - {table.description}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Current Table Info */}
        {selectedTableInfo && (
          <div className="p-3 bg-space-700/50 rounded-lg">
            <div className="text-sm text-gray-300">{selectedTableInfo.description}</div>
            <div className="text-xs text-gray-500 mt-1">File: {selectedTableInfo.file}</div>
          </div>
        )}

        {/* Validation Status */}
        <div className="flex items-center gap-2">
          {validationStatus === 'valid' && (
            <>
              <Check size={18} className="text-accent-green" />
              <span className="text-sm text-accent-green">Valid JSON</span>
            </>
          )}
          {validationStatus === 'invalid' && (
            <>
              <AlertCircle size={18} className="text-accent-red" />
              <span className="text-sm text-accent-red">{validationError}</span>
            </>
          )}
          {validationStatus === 'parsing' && (
            <span className="text-sm text-gray-400">Validating...</span>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between p-3 bg-space-700/50 rounded-lg">
          <span className="text-sm text-gray-300">Edit Mode</span>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'table' 
                  ? 'bg-accent-cyan text-space-900' 
                  : 'bg-space-600 text-gray-300 hover:bg-space-500'
              }`}
            >
              <TableIcon size={16} />
              <span className="text-sm">Table</span>
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'json' 
                  ? 'bg-accent-cyan text-space-900' 
                  : 'bg-space-600 text-gray-300 hover:bg-space-500'
              }`}
            >
              <FileJson size={16} />
              <span className="text-sm">JSON</span>
            </button>
          </div>
        </div>

        {/* Table or JSON Editor */}
        {isLoading ? (
          <div className="p-8 text-center border border-space-600 rounded-lg">
            <div className="animate-pulse text-gray-400">Loading data...</div>
          </div>
        ) : viewMode === 'table' && validationStatus === 'valid' ? (
          <div className="border border-space-600 rounded-lg overflow-hidden">
            <div className="p-3 bg-space-700 border-b border-space-600 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Data Editor</span>
              <span className="text-xs text-gray-500">Click cells to edit • Click column headers to sort</span>
            </div>
            <div className="p-4 max-h-96 overflow-auto">
              <TableDataEditor 
                data={parsedData} 
                onChange={handleTableDataChange}
              />
            </div>
          </div>
        ) : viewMode === 'table' && validationStatus !== 'valid' ? (
          <div className="p-8 text-center border border-space-600 rounded-lg">
            <AlertCircle size={48} className="text-accent-orange mx-auto mb-3" />
            <p className="text-gray-400">Cannot display table view - JSON is invalid</p>
            <p className="text-sm text-gray-500 mt-2">Switch to JSON view to fix errors</p>
            <button 
              onClick={() => setViewMode('json')}
              className="mt-4 btn-secondary"
            >
              Switch to JSON View
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              JSON Content
            </label>
            <textarea
              value={jsonContent}
              onChange={handleContentChange}
              disabled={isLoading}
              className="w-full h-96 p-4 bg-space-900 border border-space-600 rounded-lg font-mono text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-cyan resize-none"
              spellCheck={false}
              placeholder="Loading..."
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            disabled={!hasChanges || validationStatus !== 'valid'}
            className="flex items-center gap-2 px-4 py-2 bg-accent-cyan hover:bg-cyan-400 disabled:bg-space-700 disabled:text-gray-500 text-space-900 font-medium rounded-lg transition-colors"
          >
            <Save size={18} />
            <span>Save Changes</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-space-700 hover:bg-space-600 text-gray-200 rounded-lg transition-colors"
          >
            <RotateCcw size={18} />
            <span>Reset to Default</span>
          </button>

          <button
            onClick={handleExport}
            disabled={validationStatus !== 'valid'}
            className="flex items-center gap-2 px-4 py-2 bg-space-700 hover:bg-space-600 disabled:opacity-50 text-gray-200 rounded-lg transition-colors"
          >
            <Download size={18} />
            <span>Export JSON</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-space-700 hover:bg-space-600 text-gray-200 rounded-lg transition-colors cursor-pointer">
            <Upload size={18} />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Changes are saved to browser storage and persist between sessions</p>
          <p>• Use "Reset to Default" to restore original values from the rulebook</p>
          <p>• Export/Import allows sharing customized tables with others</p>
          <p>• Invalid JSON will show an error and cannot be saved</p>
        </div>
      </div>
    </div>
  )
}
