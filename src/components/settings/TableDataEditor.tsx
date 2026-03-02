import { useState, useMemo, useCallback } from 'react'
import { Plus, Trash2, AlertCircle, ArrowUpDown } from 'lucide-react'

interface TableDataEditorProps {
  data: any[]
  onChange: (newData: any[]) => void
  validationErrors?: string[]
}

export default function TableDataEditor({ data, onChange, validationErrors = [] }: TableDataEditorProps) {
  const [editingCell, setEditingCell] = useState<{row: number, key: string} | null>(null)
  const [sortConfig, setSortConfig] = useState<{key: string; direction: 'asc' | 'desc'} | null>(null)

  // Get column headers from first object
  const columns = useMemo(() => {
    if (!data || data.length === 0) return []
    return Object.keys(data[0])
  }, [data])

  // Sort data if needed
  const sortedData = useMemo(() => {
    if (!sortConfig) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  const handleCellEdit = useCallback((rowIndex: number, key: string, value: string) => {
    const newData = [...data]
    const originalValue = newData[rowIndex][key]
    
    // Try to preserve type
    let typedValue: any = value
    if (typeof originalValue === 'number') {
      typedValue = parseFloat(value) || 0
    } else if (typeof originalValue === 'boolean') {
      typedValue = value === 'true' || value === '1'
    }
    
    newData[rowIndex] = { ...newData[rowIndex], [key]: typedValue }
    onChange(newData)
    setEditingCell(null)
  }, [data, onChange])

  const handleAddRow = useCallback(() => {
    const newRow: any = {}
    columns.forEach(col => {
      // Infer type from existing data
      const sample = data[0]?.[col]
      if (typeof sample === 'number') newRow[col] = 0
      else if (typeof sample === 'boolean') newRow[col] = false
      else newRow[col] = ''
    })
    onChange([...data, newRow])
  }, [data, columns, onChange])

  const handleDeleteRow = useCallback((rowIndex: number) => {
    if (!confirm('Delete this row?')) return
    const newData = data.filter((_, i) => i !== rowIndex)
    onChange(newData)
  }, [data, onChange])

  const handleSort = useCallback((key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }, [])

  const getCellError = (rowIndex: number) => {
    return validationErrors.find(err => err.includes(`row ${rowIndex}`) || err.includes(`item ${rowIndex}`))
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No data to display</p>
        <button onClick={handleAddRow} className="mt-4 btn-primary">
          <Plus size={18} />
          Add First Row
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-space-700">
            <th className="p-2 text-left text-gray-400 font-medium w-10">#</th>
            {columns.map(col => (
              <th 
                key={col} 
                className="p-2 text-left text-gray-300 font-medium cursor-pointer hover:bg-space-600 transition-colors"
                onClick={() => handleSort(col)}
              >
                <div className="flex items-center gap-1">
                  {col}
                  {sortConfig?.key === col && (
                    <ArrowUpDown size={14} className={sortConfig.direction === 'desc' ? 'rotate-180' : ''} />
                  )}
                </div>
              </th>
            ))}
            <th className="p-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, _rowIndex) => {
            const originalIndex = data.indexOf(row)
            const rowError = getCellError(originalIndex)
            
            return (
              <tr 
                key={originalIndex} 
                className={`border-t border-space-700 hover:bg-space-700/30 ${rowError ? 'bg-accent-red/10' : ''}`}
              >
                <td className="p-2 text-gray-500">
                  {originalIndex + 1}
                  {rowError && <AlertCircle size={14} className="text-accent-red inline ml-1" />}
                </td>
                {columns.map(col => {
                  const isEditing = editingCell?.row === originalIndex && editingCell?.key === col
                  const value = row[col]
                  
                  return (
                    <td key={col} className="p-1">
                      {isEditing ? (
                        <input
                          type={typeof value === 'number' ? 'number' : 'text'}
                          defaultValue={String(value)}
                          autoFocus
                          className="w-full px-2 py-1 bg-space-600 border border-accent-cyan rounded text-white text-sm"
                          onBlur={(e) => handleCellEdit(originalIndex, col, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCellEdit(originalIndex, col, e.currentTarget.value)
                            if (e.key === 'Escape') setEditingCell(null)
                          }}
                        />
                      ) : (
                        <div
                          onClick={() => setEditingCell({ row: originalIndex, key: col })}
                          className="px-2 py-1 rounded cursor-pointer hover:bg-space-600/50 text-gray-200 truncate"
                          title={String(value)}
                        >
                          {String(value)}
                        </div>
                      )}
                    </td>
                  )
                })}
                <td className="p-1">
                  <button
                    onClick={() => handleDeleteRow(originalIndex)}
                    className="p-1.5 text-gray-500 hover:text-accent-red hover:bg-accent-red/10 rounded transition-colors"
                    title="Delete row"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      
      <div className="mt-4 flex items-center gap-3">
        <button onClick={handleAddRow} className="btn-secondary flex items-center gap-2">
          <Plus size={18} />
          Add Row
        </button>
        <span className="text-sm text-gray-500">
          {data.length} rows total • Click any cell to edit
        </span>
      </div>
    </div>
  )
}
