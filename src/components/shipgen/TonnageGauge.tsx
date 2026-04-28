import { colors, fonts } from './theme';
import { ShLabel, ShData } from './primitives';

interface Props {
  used: number;
  total: number;
}

/** Drafting-style tonnage gauge with tick rule + glowing fill. */
export function TonnageGauge({ used, total }: Props) {
  const pct = total ? Math.min(100, (used / total) * 100) : 0;
  const over = used > total;
  const fillColor = over ? colors.warn : colors.glow;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <ShLabel size={12} dim>Tonnage Allocation</ShLabel>
        <div>
          <ShData size={20} weight={500} style={{ color: over ? colors.warn : colors.ink }}>
            {used.toFixed(1)}
          </ShData>
          <ShData size={14} dim> / {total.toFixed(0)} DT · </ShData>
          <ShData size={20} weight={500} glow style={{ color: fillColor }}>{pct.toFixed(0)}%</ShData>
        </div>
      </div>

      {/* tick rule */}
      <div style={{ position: 'relative', height: 12, marginBottom: 4 }}>
        {Array.from({ length: 21 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${i * 5}%`, bottom: 0, width: 1,
            height: i % 5 === 0 ? 12 : 6, background: colors.hair,
          }} />
        ))}
      </div>

      {/* bar */}
      <div style={{
        position: 'relative', height: 18,
        background: colors.panelAlt,
        border: `1px solid ${colors.hair}`,
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: fillColor,
          boxShadow: `0 0 12px ${fillColor}, inset 0 0 8px ${fillColor}cc`,
          transition: 'width .2s ease-out, background .2s',
        }} />
      </div>

      {/* labels */}
      <div style={{ position: 'relative', height: 16, marginTop: 4 }}>
        {[0, 25, 50, 75, 100].map(p => (
          <div key={p} style={{
            position: 'absolute', left: `${p}%`, top: 0, transform: 'translateX(-50%)',
            fontFamily: fonts.mono, fontSize: 11, color: colors.inkDim, letterSpacing: '0.05em',
          }}>{p}</div>
        ))}
      </div>
    </div>
  );
}
