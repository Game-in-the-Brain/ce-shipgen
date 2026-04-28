import { calcMnemeCombatStats } from '../calculations';
import { Crosshair, Shield, Zap, Target } from 'lucide-react';
import { colors } from './shipgen/theme';
import { ShLabel, ShNum, ShData } from './shipgen/primitives';
import type { ShipDesign } from '../types';

interface MnemeCombatPanelProps {
  ship: ShipDesign;
}

export function MnemeCombatPanel({ ship }: MnemeCombatPanelProps) {
  const weaponCount = (ship.weapons || []).reduce((s, w) => s + (w.qty || 1), 0);
  const stats = calcMnemeCombatStats(ship.hullDtons, weaponCount, 0);

  const statBox = (label: string, value: string | number, icon: React.ReactNode, color: string) => (
    <div style={{
      background: colors.panelAlt,
      border: `1px solid ${colors.hair}`,
      padding: '10px 12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ color: colors.inkDim }}>{icon}</span>
        <ShLabel size={10} dim>{label}</ShLabel>
      </div>
      <ShNum size={24} color={color}>{value}</ShNum>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Crosshair className="w-4 h-4" style={{ color: colors.glow }} />
        <ShLabel size={13} style={{ color: colors.glow }}>MNEME COMBAT STATS</ShLabel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {statBox('HULL', stats.hullPoints, <Shield className="w-3 h-3" />, colors.glow)}
        {statBox('STRUCTURE', stats.structurePoints, <Shield className="w-3 h-3" />, colors.glowSoft)}
        {statBox('HARDPOINTS', `${stats.usedHardpoints} / ${stats.hardpoints}`, <Target className="w-3 h-3" />, colors.amber)}
        {statBox('WEAPONS', stats.weaponCount, <Zap className="w-3 h-3" />, colors.warn)}
      </div>

      {/* MAC Summary */}
      <div style={{
        background: colors.panelAlt,
        border: `1px solid ${colors.hair}`,
        padding: '12px 14px',
      }}>
        <ShLabel size={11} dim>MULTIPLE ATTACK CONSOLIDATION (MAC)</ShLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 8 }}>
          <div>
            <ShData size={12} dim>ATTACK DM: </ShData>
            <ShData size={14} glow good>+{stats.mac.attackDm}</ShData>
          </div>
          <div>
            <ShData size={12} dim>EXTRA DAMAGE: </ShData>
            <ShData size={14} glow good>{stats.mac.extraDamage}</ShData>
          </div>
        </div>
      </div>
    </div>
  );
}
