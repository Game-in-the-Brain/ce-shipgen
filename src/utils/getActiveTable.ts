import type { DataTable, TableId, ComponentType } from '../types';

const COMPONENT_TO_TABLE: Record<ComponentType, TableId> = {
  hull: 'ship_hulls',
  configuration: 'hull_configurations',
  armor: 'ship_armor',
  m_drive: 'ship_drives',
  j_drive: 'ship_drives',
  power_plant: 'ship_drives',
  bridge: 'ship_bridge',
  computer: 'ship_computers',
  software: 'ship_software',
  sensors: 'ship_sensors',
  accommodations: 'life_support',
  features: 'ship_modules',
  weapons: 'ship_weapons',
  vehicles: 'ship_vehicles',
};

/**
 * Get the active table for a given component type.
 * Returns the default table if activeTables says 'default', otherwise returns the current (potentially customized) table.
 */
export function getActiveTable(
  type: ComponentType,
  tables: Record<TableId, DataTable>,
  defaults: Record<TableId, DataTable>,
  activeTables: Record<TableId, 'default' | 'custom'>
): DataTable | null {
  const tableId = COMPONENT_TO_TABLE[type];
  const table = tables[tableId];
  const defaultTable = defaults[tableId];
  if (!table || !defaultTable) return null;

  const source = activeTables[tableId] ?? 'custom';
  if (source === 'default') {
    return defaultTable;
  }
  return table;
}

/**
 * Get the active table directly by TableId (for components that don't need ComponentType mapping).
 */
export function getActiveTableById(
  id: TableId,
  tables: Record<TableId, DataTable>,
  defaults: Record<TableId, DataTable>,
  activeTables: Record<TableId, 'default' | 'custom'>
): DataTable | null {
  const table = tables[id];
  const defaultTable = defaults[id];
  if (!table || !defaultTable) return null;

  const source = activeTables[id] ?? 'custom';
  if (source === 'default') {
    return defaultTable;
  }
  return table;
}

/**
 * List available table sources for a component type.
 * Returns the default and current custom options.
 */
export function listAvailableTableSources(
  type: ComponentType,
  tables: Record<TableId, DataTable>,
  defaults: Record<TableId, DataTable>
): { key: string; name: string; isDefault: boolean }[] {
  const tableId = COMPONENT_TO_TABLE[type];
  const defaultTable = defaults[tableId];
  const currentTable = tables[tableId];
  const result: { key: string; name: string; isDefault: boolean }[] = [];

  if (defaultTable) {
    result.push({ key: 'default', name: `${defaultTable.name} (Default)`, isDefault: true });
  }
  if (currentTable) {
    const isModified = JSON.stringify(currentTable.rows) !== JSON.stringify(defaultTable?.rows);
    result.push({
      key: 'custom',
      name: isModified ? `${currentTable.name} (Custom)` : `${currentTable.name} (Current)`,
      isDefault: false,
    });
  }

  return result;
}

/**
 * List available table sources by TableId.
 */
export function listAvailableTableSourcesById(
  id: TableId,
  tables: Record<TableId, DataTable>,
  defaults: Record<TableId, DataTable>
): { key: string; name: string; isDefault: boolean }[] {
  const defaultTable = defaults[id];
  const currentTable = tables[id];
  const result: { key: string; name: string; isDefault: boolean }[] = [];

  if (defaultTable) {
    result.push({ key: 'default', name: `${defaultTable.name} (Default)`, isDefault: true });
  }
  if (currentTable) {
    const isModified = JSON.stringify(currentTable.rows) !== JSON.stringify(defaultTable?.rows);
    result.push({
      key: 'custom',
      name: isModified ? `${currentTable.name} (Custom)` : `${currentTable.name} (Current)`,
      isDefault: false,
    });
  }

  return result;
}
