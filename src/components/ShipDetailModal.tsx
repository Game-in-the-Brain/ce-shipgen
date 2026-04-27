import { BOQView } from './BOQView';
import { MnemeCombatPanel } from './MnemeCombatPanel';
import { calcHullPoints, calcStructurePoints, calcHardpoints } from '../calculations';
import { exportShipToFoundryVTT } from '../utils/exportImport';
import { X, Download, Edit3, Trash2, Gamepad2 } from 'lucide-react';
import type { ShipDesign } from '../types';

interface ShipDetailModalProps {
  ship: ShipDesign;
  onClose: () => void;
  onEdit: (ship: ShipDesign) => void;
  onDelete: (id: string) => void;
  onExport: (ship: ShipDesign) => void;
}

export function ShipDetailModal({ ship, onClose, onEdit, onDelete, onExport }: ShipDetailModalProps) {
  const hullPoints = calcHullPoints(ship.hullDtons);
  const structurePoints = calcStructurePoints(ship.hullDtons);
  const hardpoints = calcHardpoints(ship.hullDtons);
  const usedHardpoints = (ship.weapons || []).reduce((s, w) => s + (w.qty || 1), 0);

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold">{ship.name}</h2>
            <p className="text-sm text-slate-400">
              TL {ship.tl} | {ship.hullDtons} DT | {(ship.totalCost / 1e6).toFixed(2)} MCr
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(ship)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onExport(ship)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-green-400"
              title="Export JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const data = exportShipToFoundryVTT(ship);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `foundry-${ship.name.replace(/\s+/g, '_')}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-purple-400"
              title="Export to Foundry VTT"
            >
              <Gamepad2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete "${ship.name}"?`)) {
                  onDelete(ship.id);
                  onClose();
                }
              }}
              className="p-2 hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-400"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800 p-3 rounded-lg">
              <div className="text-xs text-slate-500">Hull Points</div>
              <div className="text-lg font-semibold text-blue-400">{hullPoints}</div>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg">
              <div className="text-xs text-slate-500">Structure</div>
              <div className="text-lg font-semibold text-cyan-400">{structurePoints}</div>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg">
              <div className="text-xs text-slate-500">Hardpoints</div>
              <div className="text-lg font-semibold text-amber-400">{usedHardpoints} / {hardpoints}</div>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg">
              <div className="text-xs text-slate-500">Available Tons</div>
              <div className="text-lg font-semibold text-green-400">{ship.availableDtons.toFixed(1)} DT</div>
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-xs text-slate-500">Configuration</div>
              <div className="font-medium">{ship.configuration}</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-xs text-slate-500">Armor</div>
              <div className="font-medium">{ship.armor || 'None'}</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-xs text-slate-500">M-Drive</div>
              <div className="font-medium">{ship.mDrive || 'None'}</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-xs text-slate-500">J-Drive</div>
              <div className="font-medium">{ship.jDrive || 'None'}</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-xs text-slate-500">Power Plant</div>
              <div className="font-medium">{ship.powerPlant || 'None'}</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-xs text-slate-500">Bridge</div>
              <div className="font-medium">{ship.bridge || 'None'}</div>
            </div>
          </div>

          {/* BOQ */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Bill of Quantities</h3>
            <BOQView
              components={ship.components}
              totalCost={ship.totalCost}
              hullDtons={ship.hullDtons}
              usedTons={ship.components.reduce((s, c) => s + c.dtons, 0)}
              availableDtons={ship.availableDtons}
            />
          </div>

          {/* Weapons */}
          {(ship.weapons || []).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Weapons</h3>
              <div className="bg-slate-800/50 rounded-lg divide-y divide-slate-700">
                {(ship.weapons || []).map((w, i) => (
                  <div key={i} className="px-3 py-2 flex justify-between text-sm">
                    <span>{w.module}</span>
                    <span className="text-slate-400">{w.qty || 1}× | {w.dtons} DT</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modules */}
          {ship.modules.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Modules</h3>
              <div className="bg-slate-800/50 rounded-lg divide-y divide-slate-700">
                {ship.modules.map((m, i) => (
                  <div key={i} className="px-3 py-2 flex justify-between text-sm">
                    <span>{m.module}</span>
                    <span className="text-slate-400">{m.qty || 1}× | {m.dtons} DT</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mneme Combat */}
          <MnemeCombatPanel ship={ship} />

          <div className="text-xs text-slate-500 pt-2">
            Created: {new Date(ship.createdAt).toLocaleString()} | {ship.components.length} components
          </div>
        </div>
      </div>
    </div>
  );
}
