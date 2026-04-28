import { colors } from './theme';
import { ShPanel, ShLabel, ShNum, ShData } from './primitives';
import type { ShipTotals } from './compute';

interface Props {
  totals: ShipTotals;
}

export function OperatingEconomics({ totals: t }: Props) {
  return (
    <ShPanel no="SHEET 04" title="Operating Economics" kw="OPEX">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div>
          <ShLabel size={11} dim>Overhead / mo</ShLabel>
          <div>
            <ShNum size={28} color={colors.amber}>{(t.monthlyOps * 1000).toFixed(2)}</ShNum>
            <ShData size={12} dim> KCr</ShData>
          </div>
        </div>
        <div>
          <ShLabel size={11} dim>Revenue / mo</ShLabel>
          <div>
            <ShNum size={28}>{(t.monthlyRevenue * 1000).toFixed(2)}</ShNum>
            <ShData size={12} dim> KCr</ShData>
          </div>
        </div>
        <div>
          <ShLabel size={11} dim>Net / mo</ShLabel>
          <div>
            <ShNum size={28} color={t.monthlyProfit >= 0 ? colors.good : colors.warn}>
              {(t.monthlyProfit * 1000).toFixed(2)}
            </ShNum>
            <ShData size={12} dim> KCr</ShData>
          </div>
        </div>
        <div>
          <ShLabel size={11} dim>Break-Even</ShLabel>
          <div>
            <ShNum size={28}>
              {Number.isFinite(t.breakEvenMonths) ? t.breakEvenMonths.toFixed(1) : '∞'}
            </ShNum>
            <ShData size={12} dim> mo</ShData>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${colors.hair}` }}>
        <ShData size={12} dim>// 4 jumps/mo · 1 Cr/DT/parsec freight · 0.1% maint · 5 KCr/crew salary</ShData>
      </div>
    </ShPanel>
  );
}
