import * as React from 'react';
import { colors } from './theme';
import { ShPanel, ShLabel, ShData } from './primitives';
import type { BoqItem } from './compute';

interface Props {
  items: BoqItem[];
}

export function ComponentManifest({ items }: Props) {
  return (
    <ShPanel no="SHEET 05" title="Component Manifest" kw="MAN/Σ">
      {items.length === 0 && <ShData size={13} dim>// no components allocated</ShData>}
      {items.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}><ShLabel size={11} dim>#</ShLabel></th>
              <th style={th}><ShLabel size={11} dim>Item</ShLabel></th>
              <th style={{ ...th, textAlign: 'right' }}><ShLabel size={11} dim>DT</ShLabel></th>
              <th style={{ ...th, textAlign: 'right' }}><ShLabel size={11} dim>MCr</ShLabel></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td style={td}><ShData size={13} dim>{String(i + 1).padStart(2, '0')}</ShData></td>
                <td style={{ ...td, padding: '8px 12px 8px 0' }}><ShData size={14}>{it.label}</ShData></td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <ShData size={14} dim>{it.dt > 0 ? it.dt.toFixed(1) : '—'}</ShData>
                </td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <ShData size={14} dim>{it.cost.toFixed(2)}</ShData>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ShPanel>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '6px 0',
  borderBottom: `1px solid ${colors.hair}`,
};
const td: React.CSSProperties = {
  padding: '8px 0',
  borderBottom: `1px dotted ${colors.hairFaint}`,
};
