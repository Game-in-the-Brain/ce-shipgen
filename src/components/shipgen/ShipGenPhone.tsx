import * as React from 'react';
import { colors, fonts, type ThemeName } from './theme';
import { ShLabel, ShNum, ShData } from './primitives';
import { DesignSteps } from './DesignSteps';
import { BillOfQuantities } from './BillOfQuantities';
import { OperatingEconomics } from './OperatingEconomics';
import { ComponentManifest } from './ComponentManifest';
import { computeShip } from './compute';
import { DEFAULT_SHIP, STARTER_LIBRARY, type ShipSpec } from './data';

export interface ShipGenPhoneProps {
  theme?: ThemeName;
  initialShip?: ShipSpec;
}

/** Mobile-optimized vertical stack with sticky live BOQ summary. */
export function ShipGenPhone({ theme = 'mainframe', initialShip = DEFAULT_SHIP }: ShipGenPhoneProps) {
  const [ship, setShip] = React.useState<ShipSpec>(initialShip);
  const computed = React.useMemo(() => computeShip(ship), [ship]);
  const t = computed.totals;

  const update = (patch: Partial<ShipSpec>) => setShip(s => ({ ...s, ...patch }));
  const loadFromLibrary = (id: string) => {
    const found = STARTER_LIBRARY.find(s => s.id === id);
    if (found) {
      const { id: _omit, ...rest } = found;
      setShip(rest);
    }
  };

  return (
    <div
      data-shipgen-theme={theme === 'mainframe' ? undefined : theme}
      style={{
        background: colors.bg, color: colors.ink,
        fontFamily: fonts.mono, minHeight: '100vh',
      }}
    >
      {/* Sticky summary header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: colors.panelAlt,
        borderBottom: `1px solid ${colors.hair}`,
        padding: '12px 16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <ShNum size={22} color={colors.glow} style={{ letterSpacing: '0.28em' }}>CE · SHIPGEN</ShNum>
          <ShData size={11} dim>{ship.name}</ShData>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {([
            ['AVAIL DT', t.available.toFixed(0), t.available < 0 ? colors.warn : colors.glow],
            ['NET/MO', (t.monthlyProfit * 1000).toFixed(0), t.monthlyProfit >= 0 ? colors.good : colors.warn],
            ['CREW', t.crew, colors.ink],
            ['BREAK-EVEN', Number.isFinite(t.breakEvenMonths) ? t.breakEvenMonths.toFixed(0) + 'mo' : '∞', colors.amber],
          ] as const).map(([label, val, c]) => (
            <div key={label} style={{ border: `1px solid ${colors.hair}`, padding: '8px 10px', background: colors.panel }}>
              <ShLabel size={10} dim>{label}</ShLabel>
              <div><ShNum size={22} color={c}>{val}</ShNum></div>
            </div>
          ))}
        </div>
      </header>

      <main style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <DesignSteps ship={ship} computed={computed} onChange={update} onLoad={loadFromLibrary} />
        <BillOfQuantities totals={t} />
        <OperatingEconomics totals={t} />
        <ComponentManifest items={computed.items} />
      </main>
    </div>
  );
}
