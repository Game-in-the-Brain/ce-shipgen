/**
 * Ship Auditor — Table-Driven Data Integrity Validator
 *
 * Re-computes ship totals using reference tables and flags
 * violations where stored values don't match table lookups.
 *
 * Usage:
 *   const report = auditShip(ship, tables);
 *   if (report.hasViolations) console.log(report.violations);
 */

import type { ShipDesign, DataTable, TableRow } from '../types';

// ─── Violation Types ───

export interface AuditViolation {
  category: string;
  item: string;
  field: string;
  expected: number;
  actual: number;
  delta: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

export interface AuditReport {
  shipName: string;
  shipId: string;
  violations: AuditViolation[];
  hasViolations: boolean;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  correctedShip: ShipDesign;
}

// ─── Table Lookup Helpers ───

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/s$/, ''); // De-pluralize
}

function buildLookupTable(rows: TableRow[], nameKey: string): Map<string, TableRow> {
  const map = new Map<string, TableRow>();
  for (const row of rows) {
    const name = String(row[nameKey] || '');
    map.set(normalizeName(name), row);
    // Also store exact name for exact matches
    map.set(name.toLowerCase().trim(), row);
  }
  return map;
}

function findInTable(
  name: string,
  lookup: Map<string, TableRow>,
  dtKey = 'DTONS',
  costKey = 'COST'
): { dt: number; cost: number; found: boolean; row?: TableRow } {
  const norm = normalizeName(name);
  const exact = name.toLowerCase().trim();

  let row = lookup.get(norm) || lookup.get(exact);

  // Fuzzy fallback: try substring matches
  if (!row) {
    for (const [key, r] of lookup) {
      if (key.includes(norm) || norm.includes(key)) {
        row = r;
        break;
      }
    }
  }

  if (!row) {
    return { dt: 0, cost: 0, found: false };
  }

  const dt = Number(row[dtKey] ?? row['DTONS'] ?? row['dtons'] ?? 0);
  const cost = Number(row[costKey] ?? row['COST'] ?? row['cost'] ?? 0);
  return { dt, cost, found: true, row };
}

// ─── Section Auditors ───

function auditLifeSupport(
  ship: ShipDesign,
  table: DataTable | undefined
): AuditViolation[] {
  const violations: AuditViolation[] = [];
  if (!table || !ship.lifeSupport) return violations;

  const lookup = buildLookupTable(table.rows, 'LIFE SUPPORT');

  for (const item of ship.lifeSupport) {
    const result = findInTable(item.name || item.facilityType || '', lookup);
    if (!result.found) {
      violations.push({
        category: 'Life Support',
        item: item.name || item.facilityType || 'unknown',
        field: 'table-lookup',
        expected: 0,
        actual: 0,
        delta: 0,
        severity: 'warning',
        message: `No table entry found for "${item.name || item.facilityType}"`,
      });
      continue;
    }

    const expectedDt = result.dt;
    const expectedCost = result.cost;
    const storedDt = item.dtons || 0;
    const storedCost = item.cost || 0;

    if (Math.abs(storedDt - expectedDt) > 0.001) {
      violations.push({
        category: 'Life Support',
        item: item.name || item.facilityType || 'unknown',
        field: 'dtons (per-unit)',
        expected: expectedDt,
        actual: storedDt,
        delta: storedDt - expectedDt,
        severity: 'critical',
        message: `${item.name} per-unit dtons mismatch: stored ${storedDt}, table says ${expectedDt}`,
      });
    }

    if (Math.abs(storedCost - expectedCost) > 1) {
      violations.push({
        category: 'Life Support',
        item: item.name || item.facilityType || 'unknown',
        field: 'cost (per-unit)',
        expected: expectedCost,
        actual: storedCost,
        delta: storedCost - expectedCost,
        severity: 'critical',
        message: `${item.name} per-unit cost mismatch: stored ${storedCost}, table says ${expectedCost}`,
      });
    }
  }

  return violations;
}

function auditModules(
  ship: ShipDesign,
  table: DataTable | undefined
): AuditViolation[] {
  const violations: AuditViolation[] = [];
  if (!table || !ship.modules) return violations;

  const lookup = buildLookupTable(table.rows, 'MODULES');

  for (const item of ship.modules) {
    const moduleName = item.module || '';
    const result = findInTable(moduleName, lookup);
    if (!result.found) {
      violations.push({
        category: 'Modules',
        item: moduleName,
        field: 'table-lookup',
        expected: 0,
        actual: 0,
        delta: 0,
        severity: 'warning',
        message: `No table entry found for module "${moduleName}"`,
      });
      continue;
    }

    const expectedDt = result.dt;
    const expectedCost = result.cost;
    const storedDt = item.dtons || 0;
    const storedCost = item.cost || 0;

    if (Math.abs(storedDt - expectedDt) > 0.001) {
      violations.push({
        category: 'Modules',
        item: moduleName,
        field: 'dtons (per-unit)',
        expected: expectedDt,
        actual: storedDt,
        delta: storedDt - expectedDt,
        severity: 'critical',
        message: `${moduleName} per-unit dtons mismatch: stored ${storedDt}, table says ${expectedDt}`,
      });
    }

    if (Math.abs(storedCost - expectedCost) > 1) {
      violations.push({
        category: 'Modules',
        item: moduleName,
        field: 'cost (per-unit)',
        expected: expectedCost,
        actual: storedCost,
        delta: storedCost - expectedCost,
        severity: 'critical',
        message: `${moduleName} per-unit cost mismatch: stored ${storedCost}, table says ${expectedCost}`,
      });
    }
  }

  return violations;
}

function auditWeapons(
  ship: ShipDesign,
  table: DataTable | undefined
): AuditViolation[] {
  const violations: AuditViolation[] = [];
  if (!table || !ship.weaponMounts) return violations;

  const lookup = buildLookupTable(table.rows, 'WEAPONS');

  for (const item of ship.weaponMounts) {
    const result = findInTable(item.name || '', lookup);
    if (!result.found) {
      violations.push({
        category: 'Weapons',
        item: item.name || 'unknown',
        field: 'table-lookup',
        expected: 0,
        actual: 0,
        delta: 0,
        severity: 'warning',
        message: `No table entry found for weapon "${item.name}"`,
      });
      continue;
    }

    const expectedDt = result.dt;
    const expectedCost = result.cost;
    const storedDt = item.dtons || 0;
    const storedCost = item.cost || 0;

    if (Math.abs(storedDt - expectedDt) > 0.001) {
      violations.push({
        category: 'Weapons',
        item: item.name || 'unknown',
        field: 'dtons (per-unit)',
        expected: expectedDt,
        actual: storedDt,
        delta: storedDt - expectedDt,
        severity: 'critical',
        message: `${item.name} per-unit dtons mismatch: stored ${storedDt}, table says ${expectedDt}`,
      });
    }

    if (Math.abs(storedCost - expectedCost) > 1) {
      violations.push({
        category: 'Weapons',
        item: item.name || 'unknown',
        field: 'cost (per-unit)',
        expected: expectedCost,
        actual: storedCost,
        delta: storedCost - expectedCost,
        severity: 'critical',
        message: `${item.name} per-unit cost mismatch: stored ${storedCost}, table says ${expectedCost}`,
      });
    }
  }

  return violations;
}

function auditSupplies(
  ship: ShipDesign,
  table: DataTable | undefined
): AuditViolation[] {
  const violations: AuditViolation[] = [];
  if (!table || !ship.supplies) return violations;

  const lookup = buildLookupTable(table.rows, 'Supply');

  for (const item of ship.supplies) {
    const result = findInTable(item.name || '', lookup);
    if (!result.found) {
      violations.push({
        category: 'Supplies',
        item: item.name || 'unknown',
        field: 'table-lookup',
        expected: 0,
        actual: 0,
        delta: 0,
        severity: 'warning',
        message: `No table entry found for supply "${item.name}"`,
      });
      continue;
    }

    const expectedDt = result.dt;
    const expectedCost = result.cost;
    const storedDt = item.dtons || 0;
    const storedCost = item.cost || 0;

    if (Math.abs(storedDt - expectedDt) > 0.001) {
      violations.push({
        category: 'Supplies',
        item: item.name || 'unknown',
        field: 'dtons (per-unit)',
        expected: expectedDt,
        actual: storedDt,
        delta: storedDt - expectedDt,
        severity: 'critical',
        message: `${item.name} per-unit dtons mismatch: stored ${storedDt}, table says ${expectedDt}`,
      });
    }

    if (Math.abs(storedCost - expectedCost) > 1) {
      violations.push({
        category: 'Supplies',
        item: item.name || 'unknown',
        field: 'cost (per-unit)',
        expected: expectedCost,
        actual: storedCost,
        delta: storedCost - expectedCost,
        severity: 'critical',
        message: `${item.name} per-unit cost mismatch: stored ${storedCost}, table says ${expectedCost}`,
      });
    }
  }

  return violations;
}

function auditVehicles(
  ship: ShipDesign,
  table: DataTable | undefined
): AuditViolation[] {
  const violations: AuditViolation[] = [];
  if (!table || !ship.vehicles) return violations;

  const lookup = buildLookupTable(table.rows, 'Vehicle');

  for (const item of ship.vehicles) {
    const result = findInTable(item.name || '', lookup);
    if (!result.found) {
      violations.push({
        category: 'Vehicles',
        item: item.name || 'unknown',
        field: 'table-lookup',
        expected: 0,
        actual: 0,
        delta: 0,
        severity: 'info',
        message: `No table entry found for vehicle "${item.name}"`,
      });
      continue;
    }

    const expectedDt = result.dt;
    const expectedCost = result.cost;
    const storedDt = item.dtons || 0;
    const storedCost = item.cost || 0;

    if (Math.abs(storedDt - expectedDt) > 0.001) {
      violations.push({
        category: 'Vehicles',
        item: item.name || 'unknown',
        field: 'dtons (per-unit)',
        expected: expectedDt,
        actual: storedDt,
        delta: storedDt - expectedDt,
        severity: 'warning',
        message: `${item.name} per-unit dtons mismatch: stored ${storedDt}, table says ${expectedDt}`,
      });
    }

    if (Math.abs(storedCost - expectedCost) > 1) {
      violations.push({
        category: 'Vehicles',
        item: item.name || 'unknown',
        field: 'cost (per-unit)',
        expected: expectedCost,
        actual: storedCost,
        delta: storedCost - expectedCost,
        severity: 'warning',
        message: `${item.name} per-unit cost mismatch: stored ${storedCost}, table says ${expectedCost}`,
      });
    }
  }

  return violations;
}

// ─── Correct a ship using table values ───

export function correctShip(ship: ShipDesign, tables: Record<string, DataTable>): ShipDesign {
  const corrected: ShipDesign = JSON.parse(JSON.stringify(ship));

  // Correct life support
  const lifeSupportTable = tables['life_support'];
  if (lifeSupportTable && corrected.lifeSupport) {
    const lookup = buildLookupTable(lifeSupportTable.rows, 'LIFE SUPPORT');
    for (const item of corrected.lifeSupport) {
      const result = findInTable(item.name || item.facilityType || '', lookup);
      if (result.found) {
        item.dtons = result.dt;
        item.cost = result.cost;
      }
    }
  }

  // Correct modules
  const modulesTable = tables['ship_modules'];
  if (modulesTable && corrected.modules) {
    const lookup = buildLookupTable(modulesTable.rows, 'MODULES');
    for (const item of corrected.modules) {
      const result = findInTable(item.module || '', lookup);
      if (result.found) {
        item.dtons = result.dt;
        item.cost = result.cost;
      }
    }
  }

  // Correct weapons
  const weaponsTable = tables['ship_weapons'];
  if (weaponsTable && corrected.weaponMounts) {
    const lookup = buildLookupTable(weaponsTable.rows, 'WEAPONS');
    for (const item of corrected.weaponMounts) {
      const result = findInTable(item.name || '', lookup);
      if (result.found) {
        item.dtons = result.dt;
        item.cost = result.cost;
      }
    }
  }

  // Correct supplies
  const suppliesTable = tables['ship_supplies'];
  if (suppliesTable && corrected.supplies) {
    const lookup = buildLookupTable(suppliesTable.rows, 'Supply');
    for (const item of corrected.supplies) {
      const result = findInTable(item.name || '', lookup);
      if (result.found) {
        item.dtons = result.dt;
        item.cost = result.cost;
      }
    }
  }

  // Correct vehicles
  const vehiclesTable = tables['ship_vehicles'];
  if (vehiclesTable && corrected.vehicles) {
    const lookup = buildLookupTable(vehiclesTable.rows, 'Vehicle');
    for (const item of corrected.vehicles) {
      const result = findInTable(item.name || '', lookup);
      if (result.found) {
        item.dtons = result.dt;
        item.cost = result.cost;
      }
    }
  }

  // Re-compute components totals from child tables
  const newComponents: typeof corrected.components = [];
  for (const c of corrected.components) {
    if (c.section === 'Life Support') {
      // Skip — will be regenerated
      continue;
    }
    if (c.section === 'Module') {
      continue;
    }
    if (c.section === 'Weapon') {
      continue;
    }
    if (c.section === 'Supplies') {
      continue;
    }
    if (c.section === 'VEHICLES') {
      continue;
    }
    newComponents.push(c);
  }

  // Add corrected life support components
  for (const item of corrected.lifeSupport || []) {
    const totalDt = (item.dtons || 0) * (item.qty || 1);
    const totalCost = (item.cost || 0) * (item.qty || 1);
    newComponents.push({
      section: 'Life Support',
      module: `${item.qty || 1} ${item.name || item.facilityType}`,
      dtons: totalDt,
      cost: totalCost,
      qty: 1,
    });
  }

  // Add corrected module components
  for (const item of corrected.modules || []) {
    const totalDt = (item.dtons || 0) * (item.qty || 1);
    const totalCost = (item.cost || 0) * (item.qty || 1);
    newComponents.push({
      section: 'Module',
      module: item.module || '',
      dtons: totalDt,
      cost: totalCost,
      qty: 1,
    });
  }

  // Add corrected weapon components
  for (const item of corrected.weaponMounts || []) {
    const totalDt = (item.dtons || 0) * (item.qty || 1);
    const totalCost = (item.cost || 0) * (item.qty || 1);
    newComponents.push({
      section: 'Weapon',
      module: item.name || '',
      dtons: totalDt,
      cost: totalCost,
      qty: 1,
    });
  }

  // Add corrected supply components
  for (const item of corrected.supplies || []) {
    const totalDt = (item.dtons || 0) * (item.qty || 1);
    const totalCost = (item.cost || 0) * (item.qty || 1);
    newComponents.push({
      section: 'Supplies',
      module: `${item.qty || 1} ${item.name}`,
      dtons: totalDt,
      cost: totalCost,
      qty: 1,
      notes: 'Stored in cargo space',
    });
  }

  corrected.components = newComponents;

  return corrected;
}

// ─── Main Audit Function ───

export function auditShip(ship: ShipDesign, tables: Record<string, DataTable>): AuditReport {
  const violations: AuditViolation[] = [];

  violations.push(...auditLifeSupport(ship, tables['life_support']));
  violations.push(...auditModules(ship, tables['ship_modules']));
  violations.push(...auditWeapons(ship, tables['ship_weapons']));
  violations.push(...auditSupplies(ship, tables['ship_supplies']));
  violations.push(...auditVehicles(ship, tables['ship_vehicles']));

  const criticalCount = violations.filter((v) => v.severity === 'critical').length;
  const warningCount = violations.filter((v) => v.severity === 'warning').length;
  const infoCount = violations.filter((v) => v.severity === 'info').length;

  const correctedShip = correctShip(ship, tables);

  return {
    shipName: ship.name,
    shipId: ship.id,
    violations,
    hasViolations: violations.length > 0,
    criticalCount,
    warningCount,
    infoCount,
    correctedShip,
  };
}

/**
 * Audit all ships in the library and return a summary.
 */
export function auditAllShips(
  ships: ShipDesign[],
  tables: Record<string, DataTable>
): { reports: AuditReport[]; totalViolations: number; shipsWithViolations: number } {
  const reports = ships.map((ship) => auditShip(ship, tables));
  const totalViolations = reports.reduce((sum, r) => sum + r.violations.length, 0);
  const shipsWithViolations = reports.filter((r) => r.hasViolations).length;
  return { reports, totalViolations, shipsWithViolations };
}
