import { calcMnemeCombatStats } from '../calculations';
import { Crosshair, Shield, Zap, Target } from 'lucide-react';
import type { ShipDesign } from '../types';

interface MnemeCombatPanelProps {
  ship: ShipDesign;
}

export function MnemeCombatPanel({ ship }: MnemeCombatPanelProps) {
  const weaponCount = (ship.weapons || []).reduce((s, w) => s + (w.qty || 1), 0);
  const stats = calcMnemeCombatStats(ship.hullDtons, weaponCount, 0);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
        <Crosshair className="w-4 h-4" /> Mneme Combat Stats
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Hull
          </div>
          <div className="text-lg font-semibold text-blue-400">{stats.hullPoints}</div>
        </div>
        <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Structure
          </div>
          <div className="text-lg font-semibold text-cyan-400">{stats.structurePoints}</div>
        </div>
        <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Target className="w-3 h-3" /> Hardpoints
          </div>
          <div className="text-lg font-semibold text-amber-400">{stats.usedHardpoints} / {stats.hardpoints}</div>
        </div>
        <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Weapons
          </div>
          <div className="text-lg font-semibold text-red-400">{stats.weaponCount}</div>
        </div>
      </div>

      {/* MAC Summary */}
      <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700">
        <div className="text-xs text-slate-500 mb-1">Multiple Attack Consolidation (MAC)</div>
        <div className="flex items-center gap-4">
          <div>
            <span className="text-sm text-slate-400">Attack DM: </span>
            <span className="text-sm font-semibold text-green-400">+{stats.mac.attackDm}</span>
          </div>
          <div>
            <span className="text-sm text-slate-400">Extra Damage: </span>
            <span className="text-sm font-semibold text-green-400">{stats.mac.extraDamage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
