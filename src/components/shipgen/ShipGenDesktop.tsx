import * as React from 'react';
import { colors, fonts, type ThemeName } from './theme';
import { ShLabel, ShNum, ShData, ShPanel } from './primitives';
import { DesignSteps } from './DesignSteps';
import { BillOfQuantities } from './BillOfQuantities';
import { OperatingEconomics } from './OperatingEconomics';
import { ComponentManifest } from './ComponentManifest';
import { DeckPlan } from './DeckPlan';
import { computeShip } from './compute';
import { DEFAULT_SHIP, STARTER_LIBRARY, type ShipSpec } from './data';

export interface ShipGenDesktopProps {
  /** 'horizontal' = steps + readouts side-by-side; 'vertical' = stacked */
  layout?: 'horizontal' | 'vertical';
  /** Theme name — sets [data-shipgen-theme] on the wrapper */
  theme?: ThemeName;
  /** Show CRT scanline overlay */
  scanlines?: boolean;
  initialShip?: ShipSpec;
}

export function ShipGenDesktop({
  layout = 'horizontal',
  theme = 'mainframe',
  scanlines = true,
  initialShip = DEFAULT_SHIP,
}: ShipGenDesktopProps) {
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

  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const i = window.setInterval(() => setTick(x => x + 1), 900);
    return () => window.clearInterval(i);
  }, []);

  const isVertical = layout === 'vertical';
  const gridStyle: React.CSSProperties = isVertical
    ? { gridTemplateColumns: '1fr', gap: 18 }
    : { gridTemplateColumns: 'minmax(0, 1fr) 460px', gap: 22 };

  return (
    <div
      data-shipgen-theme={theme === 'mainframe' ? undefined : theme}
      className={scanlines ? 'sh-scanlines' : undefined}
      style={{
        position: 'relative',
        width: '100%', minHeight: '100vh',
        background: colors.bg, color: colors.ink,
        fontFamily: fonts.mono, overflow: 'hidden',
      }}
    >
      {/* faint grid backdrop */}
      <div className="sh-grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* HEADER */}
      <header style={{
        position: 'relative', zIndex: 20, height: 64, padding: '0 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.hair}`, background: colors.panelAlt,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 38, height: 38, border: `1.5px solid ${colors.glow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 8px ${colors.glow}66, inset 0 0 8px ${colors.glow}33`,
          }}>
            <ShNum size={22} color={colors.glow}>◆</ShNum>
          </div>
          <div>
            <ShNum size={26} color={colors.glow} style={{ letterSpacing: '0.32em' }}>CE · SHIPGEN</ShNum>
            <div style={{ marginTop: -2 }}>
              <ShData size={11} dim>
                MAINFRAME · v0.02 · TL{ship.tl} · CYCLE {String(tick).padStart(5, '0')}
              </ShData>
            </div>
          </div>
        </div>
      </header>

      {/* TITLE STRIP */}
      <div style={{ position: 'relative', zIndex: 20, padding: '24px 28px 14px' }}>
        <ShLabel size={12} dim style={{ letterSpacing: '0.32em' }}>
          {`>`} EXEC SHIPDESIGN.PRG · CONSTRUCTION DOCKET
        </ShLabel>
        <div style={{ marginTop: 6 }}>
          <ShNum size={48} color={colors.ink}>SHIP DESIGNER</ShNum>
        </div>
      </div>

      {/* MAIN GRID */}
      <main style={{
        position: 'relative', zIndex: 20, display: 'grid',
        ...gridStyle, padding: '8px 28px 60px',
      }}>
        <div>
          <DesignSteps
            ship={ship}
            computed={computed}
            onChange={update}
            onLoad={loadFromLibrary}
          />
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <BillOfQuantities totals={t} />
          <ShPanel no="SHEET 03" title="Plan View · Top-Down" kw="GA-01">
            <DeckPlan ship={ship} totals={t} />
          </ShPanel>
          <OperatingEconomics totals={t} />
          <ComponentManifest items={computed.items} />
        </aside>
      </main>
    </div>
  );
}
