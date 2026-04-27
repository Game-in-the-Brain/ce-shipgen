import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { ChildItem } from '../types';

interface ChildTableProps {
  title: string;
  items: ChildItem[];
  onChange: (items: ChildItem[]) => void;
  columns: { key: keyof ChildItem; label: string; width?: string; editable?: boolean; type?: 'text' | 'number' }[];
  renderRow?: (item: ChildItem, index: number, update: (patch: Partial<ChildItem>) => void) => React.ReactNode;
  renderSubTable?: (item: ChildItem, index: number) => React.ReactNode;
  maxItems?: number;
  addButtonLabel?: string;
  createNewItem: () => ChildItem;
  summary?: React.ReactNode;
}

export function ChildTable({
  title,
  items,
  onChange,
  columns,
  renderRow,
  renderSubTable,
  maxItems,
  addButtonLabel = 'Add Row',
  createNewItem,
  summary,
}: ChildTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const updateItem = (index: number, patch: Partial<ChildItem>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    if (maxItems && items.length >= maxItems) return;
    onChange([...items, createNewItem()]);
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-300">{title}</h4>
        {summary}
      </div>

      {items.length === 0 ? (
        <div className="text-xs text-slate-500 italic">No items added.</div>
      ) : (
        <div className="space-y-1">
          {items.map((item, idx) => (
            <div key={item.id} className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
              <div className="flex items-center gap-1 p-2">
                {renderSubTable && (
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="p-1 hover:bg-slate-700 rounded text-slate-400"
                  >
                    {expanded.has(item.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}

                {renderRow ? (
                  <div className="flex-1">{renderRow(item, idx, (patch) => updateItem(idx, patch))}</div>
                ) : (
                  <div className="flex-1 flex items-center gap-2">
                    {columns.map((col) => (
                      <div key={col.key as string} className={col.width || 'flex-1'}>
                        {col.editable ? (
                          <input
                            type={col.type || 'text'}
                            className="input w-full text-xs py-1"
                            value={item[col.key] as string | number}
                            onChange={(e) => {
                              const val = col.type === 'number' ? Number(e.target.value) : e.target.value;
                              updateItem(idx, { [col.key]: val } as Partial<ChildItem>);
                            }}
                          />
                        ) : (
                          <span className="text-xs text-slate-300">{String(item[col.key] ?? '')}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => removeItem(idx)}
                  className="p-1.5 hover:bg-red-900/30 rounded text-slate-400 hover:text-red-400"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {renderSubTable && expanded.has(item.id) && (
                <div className="px-2 pb-2 border-t border-slate-700/50">
                  {renderSubTable(item, idx)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(!maxItems || items.length < maxItems) && (
        <button
          onClick={addItem}
          className="w-full py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded border border-dashed border-slate-700 flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> {addButtonLabel}
        </button>
      )}
    </div>
  );
}
