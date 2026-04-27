import type { DataTable, TableId, ShipDesign } from '../types';

export function exportTablesToJson(tables: Record<TableId, DataTable>): string {
  return JSON.stringify(tables, null, 2);
}

export function exportShipsToJson(ships: ShipDesign[]): string {
  return JSON.stringify(ships, null, 2);
}

export function downloadJson(data: string, filename: string) {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function validateTableData(data: unknown): data is Record<TableId, DataTable> {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    const table = obj[key];
    if (typeof table !== 'object' || table === null) return false;
    const t = table as Record<string, unknown>;
    if (!Array.isArray(t.rows) || !Array.isArray(t.headers)) return false;
  }
  return true;
}

export function generateSnapshotName(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yy}${mm}${dd}:${hh}${min}${ss}`;
}

// ─── Foundry VTT Export ───

export function exportShipToFoundryVTT(ship: ShipDesign): string {
  const actor = {
    name: ship.name,
    type: 'vehicle',
    img: 'icons/svg/mystery-man.svg',
    system: {
      characteristics: {
        hull: { value: ship.hullDtons, max: ship.hullDtons },
        structure: { value: ship.components.find(c => c.section === 'Hull')?.dtons || ship.hullDtons },
        armor: { value: ship.armor || 'None' },
      },
      cargo: { value: ship.cargo, max: ship.hullDtons },
      notes: `<p><strong>TL ${ship.tl}</strong> | ${ship.hullDtons} DT | ${ship.configuration}</p>
<p><strong>Drives:</strong> M-${ship.mDrive || 'None'} / J-${ship.jDrive || 'None'} / PP-${ship.powerPlant || 'None'}</p>
<p><strong>Bridge:</strong> ${ship.bridge || 'None'}</p>
<p><strong>Cost:</strong> ${(ship.totalCost / 1e6).toFixed(2)} MCr</p>
<p><strong>Components:</strong> ${ship.components.length}</p>`,
    },
    items: (ship.weapons || []).map((w, i) => ({
      name: w.module,
      type: 'weapon',
      _id: `weapon${i}`,
      system: {
        description: `${w.qty || 1}× | ${w.dtons} DT`,
      },
    })),
    prototypeToken: {
      name: ship.name,
      texture: { src: 'icons/svg/mystery-man.svg' },
      width: Math.max(1, Math.min(3, Math.round(ship.hullDtons / 200))),
      height: Math.max(1, Math.min(3, Math.round(ship.hullDtons / 200))),
    },
    flags: {
      'ce-shipgen': {
        version: '0.02',
        exportedAt: new Date().toISOString(),
        raw: ship,
      },
    },
  };
  return JSON.stringify(actor, null, 2);
}
