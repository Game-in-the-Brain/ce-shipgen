import { BOQView } from './BOQView';
import { MnemeCombatPanel } from './MnemeCombatPanel';
import { calcHullPoints, calcStructurePoints, calcHardpoints } from '../calculations';
import { exportShipToFoundryVTT } from '../utils/exportImport';
import { X, Download, Edit3, Trash2, Gamepad2 } from 'lucide-react';
import { colors, fonts } from './shipgen/theme';
import { ShLabel, ShNum } from './shipgen/primitives';
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

  const iconBtn = (onClick: () => void, title: string, icon: React.ReactNode, hoverColor: string) => (
    <button
      onClick={onClick}
      title={title}
      style={{ padding: 8, background: 'transparent', border: 'none', color: colors.inkDim, cursor: 'pointer', borderRadius: 8 }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = colors.panelAlt; (e.currentTarget as HTMLButtonElement).style.color = hoverColor; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = colors.inkDim; }}
    >
      {icon}
    </button>
  );

  const statBox = (label: string, value: string | number, color: string) => (
    <div style={{ background: colors.panelAlt, border: `1px solid ${colors.hair}`, padding: '12px 14px' }}>
      <ShLabel size={11} dim>{label}</ShLabel>
      <div style={{ marginTop: 4 }}>
        <ShNum size={24} color={color}>{value}</ShNum>
      </div>
    </div>
  );

  const configBox = (label: string, value: string) => (
    <div style={{ background: colors.panelAlt, border: `1px solid ${colors.hair}`, padding: '10px 12px' }}>
      <ShLabel size={11} dim>{label}</ShLabel>
      <div style={{ marginTop: 4, fontFamily: fonts.mono, fontSize: 14, color: colors.inkSoft }}>{value}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: 'rgba(6,16,12,0.85)', backdropFilter: 'blur(4px)' }}>
      <div style={{
        background: colors.panel,
        border: `1px solid ${colors.hair}`,
        maxWidth: 900,
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${colors.hair}`, flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: fonts.display, fontSize: 24, color: colors.ink, letterSpacing: '0.12em' }}>{ship.name}</h2>
            <p style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.inkDim, marginTop: 4 }}>
              TL {ship.tl} | {ship.hullDtons} DT | {(ship.totalCost / 1e6).toFixed(2)} MCr
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {iconBtn(() => onEdit(ship), 'Edit', <Edit3 className="w-4 h-4" />, colors.glow)}
            {iconBtn(() => onExport(ship), 'Export JSON', <Download className="w-4 h-4" />, colors.good)}
            {iconBtn(() => {
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
            }, 'Export to Foundry VTT', <Gamepad2 className="w-4 h-4" />, colors.glowSoft)}
            {iconBtn(() => {
              if (confirm(`Delete "${ship.name}"?`)) {
                onDelete(ship.id);
                onClose();
              }
            }, 'Delete', <Trash2 className="w-4 h-4" />, colors.warn)}
            <div style={{ width: 1, height: 24, background: colors.hair, margin: '0 4px' }} />
            {iconBtn(onClose, 'Close', <X className="w-5 h-5" />, colors.ink)}
          </div>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            {statBox('HULL POINTS', hullPoints, colors.glow)}
            {statBox('STRUCTURE', structurePoints, colors.glowSoft)}
            {statBox('HARDPOINTS', `${usedHardpoints} / ${hardpoints}`, colors.amber)}
            {statBox('AVAILABLE TONS', `${ship.availableDtons.toFixed(1)} DT`, colors.good)}
          </div>

          {/* Configuration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {configBox('CONFIGURATION', ship.configuration)}
            {configBox('ARMOR', ship.armor || 'None')}
            {configBox('M-DRIVE', ship.mDrive || 'None')}
            {configBox('J-DRIVE', ship.jDrive || 'None')}
            {configBox('POWER PLANT', ship.powerPlant || 'None')}
            {configBox('BRIDGE', ship.bridge || 'None')}
          </div>

          {/* BOQ */}
          <div>
            <ShLabel size={13} style={{ marginBottom: 8, display: 'block' }}>BILL OF QUANTITIES</ShLabel>
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
              <ShLabel size={13} style={{ marginBottom: 8, display: 'block' }}>WEAPONS</ShLabel>
              <div style={{ background: colors.panelAlt, border: `1px solid ${colors.hair}` }}>
                {(ship.weapons || []).map((w, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 12px',
                    fontFamily: fonts.mono, fontSize: 13,
                    borderBottom: i < (ship.weapons || []).length - 1 ? `1px solid ${colors.hair}` : 'none',
                  }}>
                    <span style={{ color: colors.inkSoft }}>{w.module}</span>
                    <span style={{ color: colors.inkDim }}>{w.qty || 1}× | {w.dtons} DT</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modules */}
          {ship.modules.length > 0 && (
            <div>
              <ShLabel size={13} style={{ marginBottom: 8, display: 'block' }}>MODULES</ShLabel>
              <div style={{ background: colors.panelAlt, border: `1px solid ${colors.hair}` }}>
                {ship.modules.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 12px',
                    fontFamily: fonts.mono, fontSize: 13,
                    borderBottom: i < ship.modules.length - 1 ? `1px solid ${colors.hair}` : 'none',
                  }}>
                    <span style={{ color: colors.inkSoft }}>{m.module}</span>
                    <span style={{ color: colors.inkDim }}>{m.qty || 1}× | {m.dtons} DT</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mneme Combat */}
          <MnemeCombatPanel ship={ship} />

          <div style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.inkDim, paddingTop: 8 }}>
            CREATED: {new Date(ship.createdAt).toLocaleString()} | {ship.components.length} COMPONENTS
          </div>
        </div>
      </div>
    </div>
  );
}
