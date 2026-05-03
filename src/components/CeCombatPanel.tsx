import { calcHullPoints, calcStructurePoints, calcHardpoints } from '../calculations';
import { Shield, Zap, Target, Rocket, Users } from 'lucide-react';
import { colors } from './shipgen/theme';
import { ShLabel, ShNum, ShData } from './shipgen/primitives';
import type { ShipDesign } from '../types';

interface CeCombatPanelProps {
  ship: ShipDesign;
}

export function CeCombatPanel({ ship }: CeCombatPanelProps) {
  const weaponCount = (ship.weapons || []).reduce((s, w) => s + (w.qty || 1), 0);
  const hullPoints = calcHullPoints(ship.hullDtons);
  const structurePoints = calcStructurePoints(ship.hullDtons);
  const hardpoints = calcHardpoints(ship.hullDtons);

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
        <Shield className="w-4 h-4" style={{ color: colors.glow }} />
        <ShLabel size={13} style={{ color: colors.glow }}>CE SPACE COMBAT STATS</ShLabel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {statBox('HULL', hullPoints, <Shield className="w-3 h-3" />, colors.glow)}
        {statBox('STRUCTURE', structurePoints, <Shield className="w-3 h-3" />, colors.glowSoft)}
        {statBox('HARDPOINTS', `${weaponCount} / ${hardpoints}`, <Target className="w-3 h-3" />, colors.amber)}
        {statBox('WEAPONS', weaponCount, <Zap className="w-3 h-3" />, colors.warn)}
      </div>

      {/* CE Combat Summary */}
      <div style={{
        background: colors.panelAlt,
        border: `1px solid ${colors.hair}`,
        padding: '12px 14px',
      }}>
        <ShLabel size={11} dim>CE COMBAT SUMMARY</ShLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Rocket className="w-3.5 h-3.5" style={{ color: colors.inkDim }} />
            <ShData size={12} dim>THRUST: </ShData>
            <ShData size={14} glow good>{ship.mDrive ? `${ship.mDrive} Drive` : 'None'}</ShData>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Zap className="w-3.5 h-3.5" style={{ color: colors.inkDim }} />
            <ShData size={12} dim>JUMP: </ShData>
            <ShData size={14} glow good>{ship.jDrive ? `${ship.jDrive} Drive` : 'None'}</ShData>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Users className="w-3.5 h-3.5" style={{ color: colors.inkDim }} />
            <ShData size={12} dim>CREW: </ShData>
            <ShData size={14} glow good>{ship.crew?.length || 0} positions</ShData>
          </div>
        </div>
      </div>
    </div>
  );
}
