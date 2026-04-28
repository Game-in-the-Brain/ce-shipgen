import { useState, useCallback } from 'react';
import { useTableStore } from '../store/tableStore';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import type { TableId } from '../types';

interface Props {
  tableId: TableId;
}

export function TableEditor({ tableId }: Props) {
  const table = useTableStore((s) => s.tables[tableId]);
  const updateRow = useTableStore((s) => s.updateRow);
  const addRow = useTableStore((s) => s.addRow);
  const deleteRow = useTableStore((s) => s.deleteRow);
  const resetTable = useTableStore((s) => s.resetTable);
  const [editingCell, setEditingCell] = useState<{row: number; col: string} | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = useCallback((rowIndex: number, col: string, value: string | number | null) => {
    setEditingCell({ row: rowIndex, col });
    setEditValue(value !== null && value !== undefined ? String(value) : '');
  }, []);

  const commitEdit = useCallback(() => {
    if (!editingCell || !table) return;
    const { row, col } = editingCell;
    const raw = table.rows[row][col];
    const isNumber = typeof raw === 'number';
    const cleaned = editValue.replace(/<[^>]*>/g, '').trim();
    const newValue = isNumber ? (Number(cleaned) || 0) : cleaned;
    const newRow = { ...table.rows[row], [col]: newValue };
    updateRow(tableId, row, newRow);
    setEditingCell(null);
  }, [editingCell, editValue, table, tableId, updateRow]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditingCell(null);
  };

  if (!table) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={() => addRow(tableId)} className="btn-secondary flex items-center gap-1 text-sm">
          <Plus className="w-3.5 h-3.5" /> Add Row
        </button>
        <button onClick={() => resetTable(tableId)} className="btn-secondary flex items-center gap-1 text-sm">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <div className="overflow-x-auto" style={{ border: '1px solid var(--sh-hair)' }}>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="table-header w-10">#</th>
              {table.headers.map((h) => (
                <th key={h} className="table-header whitespace-nowrap">{h}</th>
              ))}
              <th className="table-header w-10"></th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-sh-panel/50">
                <td className="table-cell text-xs" style={{ color: 'var(--sh-ink-dim)' }}>{rowIndex + 1}</td>
                {table.headers.map((col) => {
                  const isEditing = editingCell?.row === rowIndex && editingCell?.col === col;
                  const value = row[col];
                  return (
                    <td key={col} className="table-cell">
                      {isEditing ? (
                        <input
                          autoFocus
                          className="input w-full text-sm py-1"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={handleKeyDown}
                        />
                      ) : (
                        <div
                          className="cursor-pointer min-w-[60px] min-h-[24px] px-1 py-0.5 rounded truncate max-w-[200px]" style={{ color: 'var(--sh-ink-soft)' }} onMouseEnter={(e)=>{(e.currentTarget as HTMLSpanElement).style.background='var(--sh-panel-alt)'}} onMouseLeave={(e)=>{(e.currentTarget as HTMLSpanElement).style.background='transparent'}}
                          onClick={() => startEdit(rowIndex, col, value)}
                          title={value !== null && value !== undefined ? String(value) : ''}
                        >
                          {value !== null && value !== undefined ? String(value) : ''}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="table-cell">
                  <button
                    onClick={() => deleteRow(tableId, rowIndex)}
                    className="p-1 rounded" style={{ color: 'var(--sh-ink-dim)' }} onMouseEnter={(e)=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(255,122,90,0.12)';(e.currentTarget as HTMLButtonElement).style.color='var(--sh-warn)'}} onMouseLeave={(e)=>{(e.currentTarget as HTMLButtonElement).style.background='transparent';(e.currentTarget as HTMLButtonElement).style.color='var(--sh-ink-dim)'}}
                    title="Delete row"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {table.rows.length === 0 && (
              <tr>
                <td colSpan={table.headers.length + 2} className="table-cell text-center py-8" style={{ color: 'var(--sh-ink-dim)' }}>
                  No rows. Click "Add Row" to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
