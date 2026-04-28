import { colors } from './theme';
import { ShPanel, ShLabel, ShNum, ShData } from './primitives';
import { TonnageGauge } from './TonnageGauge';
import type { ShipTotals } from './compute';

interface Props {
  totals: ShipTotals;
}

export function BillOfQuantities({ totals: t }: Props) {
  return (
    <ShPanel no="SHEET 02" title="Bill of Quantities" kw="BOQ">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
        <div>
          <ShLabel size={12} dim>Hull</ShLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <ShNum size={44}>{t.hullDt || '—'}</ShNum>
            <ShData size={14} dim>DT</ShData>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <ShLabel size={12} dim>Available</ShLabel>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'flex-end' }}>
            <ShNum size={44} color={t.available < 0 ? colors.warn : colors.glow}>
              {t.available > 0 ? '+' : ''}{t.available.toFixed(1)}
            </ShNum>
            <ShData size={14} dim>DT</ShData>
          </div>
        </div>
      </div>

      <TonnageGauge used={t.dt} total={t.hullDt} />

      <div style={{
        marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
        paddingTop: 14, borderTop: `1px solid ${colors.hair}`,
      }}>
        <div>
          <ShLabel size={11} dim>Total Tonnage</ShLabel>
          <div><ShData size={22} weight={500}>{t.dt.toFixed(1)} DT</ShData></div>
        </div>
        <div>
          <ShLabel size={11} dim>Total Cost</ShLabel>
          <div><ShData size={22} weight={500}>{t.cost.toFixed(2)} MCr</ShData></div>
        </div>
      </div>
    </ShPanel>
  );
}
