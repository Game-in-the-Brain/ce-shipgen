import { useState, useMemo } from 'react';
import { RotateCcw, Check, Table2 } from 'lucide-react';
import { useTableStore } from '../../store/tableStore';
import { listAvailableTableSourcesById } from '../../utils/getActiveTable';
import type { TableId } from '../../types';

const TABLE_ORDER: { id: TableId; label: string; category: string }[] = [
  { id: 'ship_hulls', label: 'Hull', category: 'Foundation' },
  { id: 'hull_configurations', label: 'Configuration', category: 'Foundation' },
  { id: 'ship_armor', label: 'Armor', category: 'Foundation' },
  { id: 'ship_drives', label: 'Drives (M/J/Power)', category: 'Propulsion' },
  { id: 'ship_bridge', label: 'Bridge / Cockpit', category: 'Command' },
  { id: 'ship_computers', label: 'Computers', category: 'Command' },
  { id: 'ship_software', label: 'Software', category: 'Command' },
  { id: 'ship_sensors', label: 'Sensors', category: 'Command' },
  { id: 'life_support', label: 'Life Support / Accommodations', category: 'Operations' },
  { id: 'ship_modules', label: 'Modules / Features', category: 'Operations' },
  { id: 'ship_weapons', label: 'Weapons', category: 'Combat' },
  { id: 'ship_vehicles', label: 'Vehicles', category: 'Combat' },
];

export default function TablesInPlay() {
  const tables = useTableStore((s) => s.tables);
  const defaults = useTableStore((s) => s.defaults);
  const activeTables = useTableStore((s) => s.activeTables);
  const setActiveTable = useTableStore((s) => s.setActiveTable);
  const resetActiveTables = useTableStore((s) => s.resetActiveTables);
  const [toast, setToast] = useState<string | null>(null);

  const categories = useMemo(() => {
    const map = new Map<string, typeof TABLE_ORDER>();
    for (const t of TABLE_ORDER) {
      const list = map.get(t.category) || [];
      list.push(t);
      map.set(t.category, list);
    }
    return map;
  }, []);

  const handleChange = (id: TableId, source: 'default' | 'custom') => {
    setActiveTable(id, source);
    setToast('Active table updated');
    setTimeout(() => setToast(null), 1500);
  };

  const handleReset = () => {
    if (!confirm('Reset all tables to current custom versions?')) return;
    resetActiveTables();
    setToast('All tables reset to custom');
    setTimeout(() => setToast(null), 1500);
  };

  return (
    <div className="bg-space-800 rounded-xl border border-space-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-space-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table2 size={18} className="text-accent-cyan" />
          <div>
            <h3 className="font-semibold text-white">Tables In Play</h3>
            <p className="text-sm text-gray-400">Choose which table each ship component reads from</p>
          </div>
        </div>
        {toast && (
          <span className="flex items-center gap-1 px-2 py-1 bg-accent-green/20 text-accent-green text-xs rounded-full">
            <Check size={14} />
            {toast}
          </span>
        )}
      </div>

      <div className="p-4 space-y-6">
        {Array.from(categories.entries()).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {category}
            </h4>
            <div className="space-y-2">
              {items.map((item) => {
                const sources = listAvailableTableSourcesById(item.id, tables, defaults);
                const currentSource = activeTables[item.id] ?? 'custom';
                const isDefault = currentSource === 'default';

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isDefault
                        ? 'border-space-600 bg-space-700/30'
                        : 'border-accent-cyan/30 bg-accent-cyan/5'
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        isDefault ? 'text-gray-300' : 'text-accent-cyan'
                      }`}
                    >
                      {item.label}
                    </span>
                    <select
                      value={currentSource}
                      onChange={(e) => handleChange(item.id, e.target.value as 'default' | 'custom')}
                      className="px-3 py-1.5 bg-space-900 border border-space-600 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-cyan font-mono"
                    >
                      {sources.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Reset All */}
        <div className="pt-2 border-t border-space-700">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-space-700 hover:bg-accent-cyan/20 text-gray-300 hover:text-accent-cyan rounded-lg transition-colors text-sm"
          >
            <RotateCcw size={16} />
            Reset All to Custom
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Default = factory CE tables. Custom = your edited tables (including any snapshot-loaded data).
          </p>
        </div>
      </div>
    </div>
  );
}
