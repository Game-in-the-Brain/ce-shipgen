import { colors, fonts } from './shipgen/theme';
import { ShLabel, ShNum, ShData } from './shipgen/primitives';
import type { ShipComponent } from '../types';

interface Props {
  components: ShipComponent[];
  totalCost: number;
  hullDtons: number;
  usedTons: number;
  availableDtons: number;
}

export function BOQView({ components, totalCost, hullDtons, usedTons, availableDtons }: Props) {
  const bySection: Record<string, ShipComponent[]> = {};
  components.forEach((c) => {
    if (!bySection[c.section]) bySection[c.section] = [];
    bySection[c.section].push(c);
  });

  const totalTons = components.reduce((s, c) => s + c.dtons, 0);
  const isValid = hullDtons > 0 && usedTons <= hullDtons;

  return (
    <div style={{
      position: 'sticky', top: 20,
      background: colors.panel,
      border: `1px solid ${colors.hair}`,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px',
        borderBottom: `1px solid ${colors.hair}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: colors.panelAlt,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ShData size={14} dim weight={500}>SHEET 02</ShData>
          <div style={{ width: 1, height: 14, background: colors.hair }} />
          <ShLabel size={14} weight={600} style={{ color: colors.glow, letterSpacing: '0.18em' }}>
            BILL OF QUANTITIES
          </ShLabel>
        </div>
        <ShData size={12} dim>BOQ</ShData>
      </div>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ border: `1px solid ${colors.hair}`, padding: '10px 12px', background: colors.panelAlt }}>
            <ShLabel size={11} dim>HULL SIZE</ShLabel>
            <div style={{ marginTop: 4 }}>
              <ShNum size={22}>{hullDtons > 0 ? `${hullDtons} DT` : '—'}</ShNum>
            </div>
          </div>
          <div style={{
            border: `1px solid ${isValid ? colors.good : hullDtons > 0 ? colors.warn : colors.hair}`,
            padding: '10px 12px',
            background: isValid ? `${colors.good}10` : hullDtons > 0 ? `${colors.warn}10` : colors.panelAlt,
          }}>
            <ShLabel size={11} dim>AVAILABLE</ShLabel>
            <div style={{ marginTop: 4 }}>
              <ShNum size={22} color={isValid ? colors.good : hullDtons > 0 ? colors.warn : colors.ink}>
                {availableDtons.toFixed(1)} DT
              </ShNum>
            </div>
          </div>
          <div style={{ border: `1px solid ${colors.hair}`, padding: '10px 12px', background: colors.panelAlt }}>
            <ShLabel size={11} dim>TOTAL TONNAGE</ShLabel>
            <div style={{ marginTop: 4 }}>
              <ShNum size={22}>{totalTons.toFixed(1)} DT</ShNum>
            </div>
          </div>
          <div style={{ border: `1px solid ${colors.hair}`, padding: '10px 12px', background: colors.panelAlt }}>
            <ShLabel size={11} dim>TOTAL COST</ShLabel>
            <div style={{ marginTop: 4 }}>
              <ShNum size={22}>{(totalCost / 1e6).toFixed(2)} MCR</ShNum>
            </div>
          </div>
        </div>

        {/* Section lists */}
        {Object.entries(bySection).map(([section, items]) => (
          <div key={section}>
            <div style={{
              fontFamily: fonts.mono, fontSize: 11, fontWeight: 600,
              color: colors.inkDim, letterSpacing: '0.14em', textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              {section}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontFamily: fonts.mono, fontSize: 13,
                  padding: '4px 0',
                  borderBottom: `1px dotted ${colors.hairFaint}`,
                }}>
                  <span style={{ color: colors.inkSoft }}>
                    {item.qty && item.qty > 1 ? `${item.qty}× ` : ''}{item.module}
                  </span>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ color: colors.inkDim, width: 64, textAlign: 'right' }}>
                      {item.dtons > 0 ? `${item.dtons.toFixed(1)} DT` : ''}
                    </span>
                    <span style={{ color: colors.inkDim, width: 80, textAlign: 'right' }}>
                      {item.cost > 0 ? `${(item.cost / 1e6).toFixed(2)} M` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {components.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: colors.inkDim, fontFamily: fonts.mono, fontSize: 13 }}>
            // SELECT A HULL TO BEGIN DESIGNING
          </div>
        )}
      </div>
    </div>
  );
}
