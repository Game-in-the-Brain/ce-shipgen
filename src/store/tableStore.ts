import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { DataTable, TableId, ShipDesign } from '../types';

type ActiveTableSource = 'default' | 'custom';

const BASE = import.meta.env.BASE_URL;

const TABLE_FILES: Record<TableId, string> = {
  ship_hulls: `${BASE}data/ship_hulls.json`,
  hull_configurations: `${BASE}data/hull_configurations.json`,
  ship_armor: `${BASE}data/ship_armor.json`,
  hull_options: `${BASE}data/hull_options.json`,
  ship_bridge: `${BASE}data/ship_bridge.json`,
  computer_options: `${BASE}data/computer_options.json`,
  ship_software: `${BASE}data/ship_software.json`,
  ship_weapons: `${BASE}data/ship_weapons.json`,
  ship_drives: `${BASE}data/ship_drives.json`,
  ship_crew: `${BASE}data/ship_crew.json`,
  life_support: `${BASE}data/life_support.json`,
  ship_modules: `${BASE}data/ship_modules.json`,
  ship_sensors: `${BASE}data/ship_sensors.json`,
  ship_vehicles: `${BASE}data/ship_vehicles.json`,
  ship_supplies: `${BASE}data/ship_supplies.json`,
  power_plants: `${BASE}data/power_plants.json`,
  life_support_expenses: `${BASE}data/life_support_expenses.json`,
  engine_performance: `${BASE}data/engine_performance.json`,
  ship_computers: `${BASE}data/ship_computers.json`,
};

const TABLE_NAMES: Record<TableId, string> = {
  ship_hulls: 'Ship Hulls',
  hull_configurations: 'Hull Configurations',
  ship_armor: 'Ship Armor',
  hull_options: 'Hull Options',
  ship_bridge: 'Bridge / Cockpit',
  computer_options: 'Computer Options',
  ship_software: 'Ship Software',
  ship_weapons: 'Weapons',
  ship_drives: 'Drives',
  ship_crew: 'Crew',
  life_support: 'Life Support',
  ship_modules: 'Modules',
  ship_sensors: 'Sensors',
  ship_vehicles: 'Vehicles',
  ship_supplies: 'Supplies',
  power_plants: 'Power Plants',
  life_support_expenses: 'Life Support Expenses',
  engine_performance: 'Engine Performance',
  ship_computers: 'Ship Computers',
};

interface TableState {
  tables: Record<TableId, DataTable>;
  defaults: Record<TableId, DataTable>;
  loaded: boolean;
  loading: boolean;
  error: string | null;
  currentTable: TableId | null;
  ships: ShipDesign[];
  currentShip: ShipDesign | null;
  activeTables: Record<TableId, ActiveTableSource>;
}

interface TableActions {
  loadTables: () => Promise<void>;
  updateTable: (id: TableId, table: DataTable) => void;
  updateRow: (id: TableId, rowIndex: number, row: Record<string, string | number | null>) => void;
  addRow: (id: TableId) => void;
  deleteRow: (id: TableId, rowIndex: number) => void;
  resetTable: (id: TableId) => void;
  resetAll: () => void;
  setCurrentTable: (id: TableId | null) => void;
  importTables: (data: Record<TableId, DataTable>) => void;
  exportTables: () => Record<TableId, DataTable>;
  addShip: (ship: ShipDesign) => void;
  updateShip: (ship: ShipDesign) => void;
  deleteShip: (id: string) => void;
  setCurrentShip: (ship: ShipDesign | null) => void;
  loadDefaultShips: () => Promise<void>;
  setActiveTable: (id: TableId, source: ActiveTableSource) => void;
  resetActiveTables: () => void;
}

export const useTableStore = create<TableState & TableActions>()(
  immer(
    persist(
      (set, get) => ({
        tables: {} as Record<TableId, DataTable>,
        defaults: {} as Record<TableId, DataTable>,
        loaded: false,
        loading: false,
        error: null,
        currentTable: null,
        ships: [],
        currentShip: null,
        activeTables: {} as Record<TableId, ActiveTableSource>,

        loadTables: async () => {
          set({ loading: true, error: null });
          try {
            const tables = {} as Record<TableId, DataTable>;
            const defaults = {} as Record<TableId, DataTable>;
            
            for (const [id, path] of Object.entries(TABLE_FILES)) {
              const response = await fetch(path);
              if (!response.ok) throw new Error(`Failed to load ${path}`);
              const data = await response.json();
              
              const headers = data.length > 0 ? Object.keys(data[0]) : [];
              const table: DataTable = {
                id: id as TableId,
                name: TABLE_NAMES[id as TableId],
                headers,
                rows: data,
              };
              
              tables[id as TableId] = table;
              defaults[id as TableId] = JSON.parse(JSON.stringify(table));
            }
            
            set({ tables, defaults, loaded: true, loading: false });
          } catch (err) {
            set({ error: (err as Error).message, loading: false });
          }
        },

        updateTable: (id, table) => {
          set((state) => {
            state.tables[id] = table;
          });
        },

        updateRow: (id, rowIndex, row) => {
          set((state) => {
            if (state.tables[id]) {
              state.tables[id].rows[rowIndex] = row;
            }
          });
        },

        addRow: (id) => {
          set((state) => {
            const table = state.tables[id];
            if (table) {
              const newRow: Record<string, string | number | null> = {};
              table.headers.forEach((h) => {
                const sample = table.rows[0]?.[h];
                newRow[h] = typeof sample === 'number' ? 0 : '';
              });
              table.rows.push(newRow);
            }
          });
        },

        deleteRow: (id, rowIndex) => {
          set((state) => {
            if (state.tables[id]) {
              state.tables[id].rows.splice(rowIndex, 1);
            }
          });
        },

        resetTable: (id) => {
          set((state) => {
            if (state.defaults[id]) {
              state.tables[id] = JSON.parse(JSON.stringify(state.defaults[id]));
            }
          });
        },

        resetAll: () => {
          set((state) => {
            Object.keys(state.defaults).forEach((id) => {
              state.tables[id as TableId] = JSON.parse(JSON.stringify(state.defaults[id as TableId]));
            });
          });
        },

        setCurrentTable: (id) => set({ currentTable: id }),

        importTables: (data) => {
          set((state) => {
            Object.entries(data).forEach(([id, table]) => {
              if (state.tables[id as TableId]) {
                state.tables[id as TableId] = table;
              }
            });
          });
        },

        exportTables: () => {
          return JSON.parse(JSON.stringify(get().tables));
        },

        addShip: (ship) => {
          set((state) => {
            state.ships.push(ship);
          });
        },

        updateShip: (ship) => {
          set((state) => {
            const idx = state.ships.findIndex((s) => s.id === ship.id);
            if (idx >= 0) state.ships[idx] = ship;
          });
        },

        deleteShip: (id) => {
          set((state) => {
            state.ships = state.ships.filter((s) => s.id !== id);
          });
        },

        setCurrentShip: (ship) => set({ currentShip: ship }),

        loadDefaultShips: async () => {
          const state = get();
          if (state.ships.length > 0) return; // Don't overwrite existing library
          try {
            const base = import.meta.env.BASE_URL || '/';
            const response = await fetch(`${base}data/all_ships.json`);
            if (!response.ok) throw new Error('Failed to load default ships');
            const ships: ShipDesign[] = await response.json();
            set((state) => {
              for (const ship of ships) {
                // Prevent duplicates by ID
                if (!state.ships.find((s) => s.id === ship.id)) {
                  state.ships.push(ship);
                }
              }
            });
          } catch (err) {
            console.warn('Could not load default ship library:', err);
          }
        },

        setActiveTable: (id, source) => {
          set((state) => {
            state.activeTables[id] = source;
          });
        },

        resetActiveTables: () => {
          set((state) => {
            Object.keys(state.defaults).forEach((id) => {
              state.activeTables[id as TableId] = 'custom';
            });
          });
        },
      }),
      {
        name: 'ce-shipgen-storage',
        partialize: (state) => ({ 
          tables: state.tables, 
          ships: state.ships,
          currentShip: state.currentShip,
          activeTables: state.activeTables,
        }),
      }
    )
  )
);
