import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { colors, fonts } from './shipgen/theme';
import type { ChildItem } from '../types';

interface ChildTableProps {
  title: string;
  items: ChildItem[];
  onChange: (items: ChildItem[]) => void;
  columns: { key: keyof ChildItem; label: string; width?: string; editable?: boolean; type?: 'text' | 'number'; step?: string | number }[];
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

  const headerStyle: React.CSSProperties = {
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: 600,
    color: colors.inkDim,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    padding: '6px 0',
    borderBottom: `1px solid ${colors.hair}`,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 600, color: colors.inkSoft, letterSpacing: '0.08em' }}>
          {title}
        </span>
        {summary}
      </div>

      {items.length === 0 ? (
        <div style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.inkDim, fontStyle: 'italic' }}>
          // no items allocated
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Column headers */}
          <div style={{ display: 'flex', gap: 8, paddingRight: 32 }}>
            {columns.map((col) => (
              <div key={col.key as string} className={col.width || 'flex-1'} style={headerStyle}>
                {col.label}
              </div>
            ))}
          </div>

          {items.map((item, idx) => (
            <div key={item.id} style={{
              background: colors.panelAlt,
              border: `1px solid ${colors.hair}`,
              overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px' }}>
                {renderSubTable && (
                  <button
                    onClick={() => toggleExpand(item.id)}
                    style={{ padding: 4, background: 'transparent', border: 'none', color: colors.inkDim, cursor: 'pointer' }}
                  >
                    {expanded.has(item.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}

                {renderRow ? (
                  <div className="flex-1">{renderRow(item, idx, (patch) => updateItem(idx, patch))}</div>
                ) : (
                  <div className="flex-1" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {columns.map((col) => (
                      <div key={col.key as string} className={col.width || 'flex-1'}>
                        {col.editable ? (
                          <input
                            type={col.type || 'text'}
                            step={col.step}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              background: colors.panel,
                              border: `1px solid ${colors.hair}`,
                              color: colors.ink,
                              fontFamily: fonts.mono,
                              fontSize: 12,
                              outline: 'none',
                            }}
                            value={item[col.key] as string | number}
                            onChange={(e) => {
                              const val = col.type === 'number' ? Number(e.target.value) : e.target.value;
                              updateItem(idx, { [col.key]: val } as Partial<ChildItem>);
                            }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = colors.glow; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = colors.hair; }}
                          />
                        ) : (
                          <span style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.inkSoft }}>
                            {String(item[col.key] ?? '')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => removeItem(idx)}
                  title="Remove"
                  style={{
                    padding: 6,
                    background: 'transparent',
                    border: 'none',
                    color: colors.inkDim,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.warn; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.inkDim; }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {renderSubTable && expanded.has(item.id) && (
                <div style={{ padding: '0 10px 10px', borderTop: `1px solid ${colors.hair}` }}>
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
          style={{
            width: '100%',
            padding: '8px',
            fontFamily: fonts.mono,
            fontSize: 12,
            color: colors.inkDim,
            background: 'transparent',
            border: `1px dashed ${colors.hair}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.color = colors.glow;
            el.style.borderColor = colors.glow;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.color = colors.inkDim;
            el.style.borderColor = colors.hair;
          }}
        >
          <Plus className="w-3.5 h-3.5" /> {addButtonLabel}
        </button>
      )}
    </div>
  );
}
