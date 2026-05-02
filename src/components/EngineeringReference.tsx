import { useState } from 'react';
import { useTableStore } from '../store/tableStore';
import { colors, fonts } from './shipgen/theme';
import { CollapsibleSection } from './CollapsibleSection';
import type { TableRow } from '../types';

function RefTable({ title, headers, rows }: {
  title: string;
  headers: string[];
  rows: (string | number | null)[][];
}) {
  if (rows.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: fonts.display, fontSize: 14, color: colors.glow, marginBottom: 10, letterSpacing: '0.1em' }}>
        {title}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: fonts.mono, fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.glow}` }}>
              {headers.map((h, i) => (
                <th key={i} style={{ padding: '8px 10px', textAlign: 'left', color: colors.inkDim, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: `1px solid ${colors.hair}` }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: '6px 10px', color: colors.ink, whiteSpace: 'nowrap' }}>
                    {cell === null || cell === undefined ? '—' : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EngineeringReference() {
  const tables = useTableStore((s) => s.tables);
  const [search, setSearch] = useState('');

  const weapons = tables.ship_weapons?.rows || [];
  const vehicles = tables.ship_vehicles?.rows || [];
  const supplies = tables.ship_supplies?.rows || [];
  const modules = tables.ship_modules?.rows || [];
  const drives = tables.ship_drives?.rows || [];
  const powerPlants = tables.power_plants?.rows || [];
  const armor = tables.ship_armor?.rows || [];

  const filter = (rows: TableRow[]) => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  };

  const toRows = (filtered: TableRow[], cols: string[]): (string | number | null)[][] => {
    return filtered.map((r) => cols.map((c) => r[c] ?? null));
  };

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontFamily: fonts.display, fontSize: 28, color: colors.glow, letterSpacing: '0.18em' }}>
          ENGINEERING REFERENCE
        </div>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH COMPONENTS..."
            style={{
              width: '100%', maxWidth: 320,
              padding: '8px 12px', fontFamily: fonts.mono, fontSize: 13,
              background: colors.panel, color: colors.ink,
              border: `1px solid ${colors.hair}`, outline: 'none',
            }}
          />
        </div>
      </div>

      <CollapsibleSection title="WEAPONS" defaultOpen={true}>
        <RefTable
          title={`${filter(weapons).length} entries`}
          headers={['WEAPON', 'TL', 'DTONS', 'COST (Cr)', 'NOTES']}
          rows={toRows(filter(weapons), ['WEAPONS', 'TL', 'DTONS', 'COST', 'Descirption'])}
        />
      </CollapsibleSection>

      <CollapsibleSection title="VEHICLES & DRONES" defaultOpen={false}>
        <RefTable
          title={`${filter(vehicles).length} entries`}
          headers={['VEHICLE', 'TL', 'DTONS', 'COST (Cr)', 'DESCRIPTION']}
          rows={toRows(filter(vehicles), ['Vehicle', 'TL', 'DTONS', 'COST', 'Description'])}
        />
      </CollapsibleSection>

      <CollapsibleSection title="SUPPLIES" defaultOpen={false}>
        <RefTable
          title={`${filter(supplies).length} entries`}
          headers={['SUPPLY', 'TL', 'DTONS', 'COST (Cr)', 'DESCRIPTION']}
          rows={toRows(filter(supplies), ['Supply', 'TL', 'DTONS', 'COST', 'Description'])}
        />
      </CollapsibleSection>

      <CollapsibleSection title="MODULES" defaultOpen={false}>
        <RefTable
          title={`${filter(modules).length} entries`}
          headers={['MODULE', 'TL', 'DTONS', 'COST (Cr)', 'NOTES']}
          rows={toRows(filter(modules), ['MODULES', 'TL', 'DTONS', 'COST', 'NOTES'])}
        />
      </CollapsibleSection>

      <CollapsibleSection title="DRIVES" defaultOpen={false}>
        <RefTable
          title={`${filter(drives).length} entries`}
          headers={['CODE', 'M-DRIVE DT', 'M-DRIVE CR', 'J-DRIVE DT', 'J-DRIVE CR', 'PP DT', 'PP CR', 'FUEL/WK', 'MIN FUEL', 'ENERGY']}
          rows={toRows(filter(drives), ['Drive Code', 'M-Drive\n Tons', 'M-Drive COST', 'J-Drive\n Tons', 'J-Drive COST', 'P-Plant\n Tons', 'PP COST', 'Fuel/Wk\n (tons)', 'Min. Fuel\n Volume', 'Energy Weapons'])}
        />
      </CollapsibleSection>

      <CollapsibleSection title="POWER PLANTS" defaultOpen={false}>
        <RefTable
          title={`${filter(powerPlants).length} entries`}
          headers={['PLANT TYPE', 'TL', 'DT MOD', 'COST MOD', 'MAINTENANCE']}
          rows={toRows(filter(powerPlants), ['Plant Type', 'TL', 'DT MODIFIER', 'COST MODIFIER', 'ANNUAL MAINTENANCE'])}
        />
      </CollapsibleSection>

      <CollapsibleSection title="ARMOR" defaultOpen={false}>
        <RefTable
          title={`${filter(armor).length} entries`}
          headers={['ARMOR TYPE', 'TL', 'PROTECTION (per 5%)', 'COST FACTOR']}
          rows={toRows(filter(armor), ['Armor Type', 'TL', 'Prot', 'Cost Factor'])}
        />
      </CollapsibleSection>
    </div>
  );
}
