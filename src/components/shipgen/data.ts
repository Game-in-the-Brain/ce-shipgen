// Ship-component reference tables.
// Numbers are Cepheus Engine SRD orders-of-magnitude — adjust for your campaign.

export interface Hull   { code: string; dt: number; hp: number; sp: number; cost: number; }
export interface Config { id: string; label: string; pct: number; note: string; }
export interface Armor  { id: string; label: string; protection: number; pct: number; costPct: number; }
export interface MDrive { code: string; thrust: number; dt: number; cost: number; }
export interface JDrive { code: string; jump: number; dt: number; cost: number; }
export interface Power  { code: string; dt: number; cost: number; }
export interface Bridge { id: string; label: string; dt: number; cost: number; crew: number; }
export interface Computer { id: string; label: string; rating: number; dt: number; cost: number; }

export const HULLS: Hull[] = [
  { code: 'A', dt: 100,  hp: 2,  sp: 2,  cost: 2.0  },
  { code: 'B', dt: 200,  hp: 4,  sp: 4,  cost: 8.0  },
  { code: 'C', dt: 300,  hp: 6,  sp: 6,  cost: 12.0 },
  { code: 'D', dt: 400,  hp: 8,  sp: 8,  cost: 16.0 },
  { code: 'E', dt: 500,  hp: 10, sp: 10, cost: 32.0 },
  { code: 'F', dt: 600,  hp: 12, sp: 12, cost: 48.0 },
  { code: 'G', dt: 800,  hp: 16, sp: 16, cost: 64.0 },
  { code: 'H', dt: 1000, hp: 20, sp: 20, cost: 80.0 },
  { code: 'J', dt: 1200, hp: 24, sp: 24, cost: 100.0 },
];

export const CONFIGS: Config[] = [
  { id: 'standard',    label: 'Standard',         pct: 1.00, note: 'Streamlined hull' },
  { id: 'distributed', label: 'Distributed',      pct: 0.50, note: 'Non-streamlined cluster' },
  { id: 'close',       label: 'Close Structure',  pct: 1.50, note: 'Compact reinforced' },
];

export const ARMOR: Armor[] = [
  { id: 'titanium', label: 'Titanium Steel',     protection: 2, pct: 0.05, costPct: 0.05 },
  { id: 'crystal',  label: 'Crystaliron',        protection: 4, pct: 0.05, costPct: 0.20 },
  { id: 'bonded',   label: 'Bonded Superdense',  protection: 6, pct: 0.05, costPct: 0.50 },
];

export const MDRIVES: MDrive[] = [
  { code: 'A', thrust: 1, dt: 2,  cost: 4 },
  { code: 'B', thrust: 1, dt: 3,  cost: 8 },
  { code: 'C', thrust: 2, dt: 5,  cost: 12 },
  { code: 'D', thrust: 2, dt: 7,  cost: 16 },
  { code: 'E', thrust: 3, dt: 9,  cost: 20 },
  { code: 'F', thrust: 3, dt: 11, cost: 24 },
];

export const JDRIVES: JDrive[] = [
  { code: 'A', jump: 1, dt: 10, cost: 10 },
  { code: 'B', jump: 1, dt: 15, cost: 20 },
  { code: 'C', jump: 2, dt: 20, cost: 30 },
  { code: 'D', jump: 2, dt: 25, cost: 40 },
  { code: 'E', jump: 3, dt: 30, cost: 50 },
];

export const POWER: Power[] = [
  { code: 'A', dt: 4,  cost: 8 },
  { code: 'B', dt: 7,  cost: 16 },
  { code: 'C', dt: 10, cost: 24 },
  { code: 'D', dt: 13, cost: 32 },
  { code: 'E', dt: 16, cost: 40 },
];

export const BRIDGES: Bridge[] = [
  { id: 'cockpit',    label: 'Cockpit',     dt: 1.5, cost: 0.01, crew: 1 },
  { id: 'bridge',     label: 'Bridge',      dt: 20,  cost: 0.5,  crew: 2 },
  { id: 'fullbridge', label: 'Full Bridge', dt: 40,  cost: 2.0,  crew: 4 },
];

export const COMPUTERS: Computer[] = [
  { id: 'm1', label: 'Model/1', rating: 5,  dt: 1, cost: 0.03 },
  { id: 'm2', label: 'Model/2', rating: 10, dt: 1, cost: 0.16 },
  { id: 'm3', label: 'Model/3', rating: 15, dt: 1, cost: 2.0 },
  { id: 'm4', label: 'Model/4', rating: 20, dt: 1, cost: 5.0 },
];

export interface ShipSpec {
  name:     string;
  tl:       number;
  hull:     string | null;
  config:   string;
  armor:    string | null;
  mdrive:   string | null;
  jdrive:   string | null;
  power:    string | null;
  bridge:   string;
  computer: string;
}

export const DEFAULT_SHIP: ShipSpec = {
  name: 'ARGONAUT',
  tl: 9,
  hull: 'B',
  config: 'standard',
  armor: null,
  mdrive: 'B',
  jdrive: 'A',
  power: 'B',
  bridge: 'bridge',
  computer: 'm2',
};

export const STARTER_LIBRARY: Array<ShipSpec & { id: string }> = [
  { id: 'shuttle', name: 'Shuttle',        hull: 'A', tl: 9,
    config: 'standard', mdrive: 'B', jdrive: null, power: 'A',
    bridge: 'cockpit', computer: 'm1', armor: null },
  { id: 'trader',  name: 'Free Trader',    hull: 'B', tl: 9,
    config: 'standard', mdrive: 'B', jdrive: 'A', power: 'B',
    bridge: 'bridge', computer: 'm2', armor: null },
  { id: 'patrol',  name: 'Patrol Cruiser', hull: 'D', tl: 9,
    config: 'standard', mdrive: 'C', jdrive: 'B', power: 'C',
    bridge: 'bridge', computer: 'm3', armor: 'titanium' },
];
