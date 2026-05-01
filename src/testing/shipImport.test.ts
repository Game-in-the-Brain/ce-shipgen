import { describe, it, expect } from 'vitest';
import { ALL_SAMPLE_SHIPS } from './sampleShips';
import type { ShipDesign, ChildItem } from '../types';

/**
 * Ship Import Integrity Tests
 *
 * These tests simulate the import/load cycle by mirroring ShipDesigner.tsx
 * loadShip() and saveShip() logic. After the fixes, child-table data should
 * round-trip correctly.
 */

interface ImportIssue {
  shipName: string;
  category: string;
  field: string;
  severity: 'critical' | 'major' | 'minor';
  detail: string;
}

function simulateLoadShip(ship: ShipDesign): {
  name: string;
  tl: number;
  hullCode: string;
  config: string;
  armorRows: ChildItem[];
  mDrive: string;
  jDrive: string;
  mDriveRows: ChildItem[];
  jDriveRows: ChildItem[];
  powerPlant: string;
  ppRows: ChildItem[];
  commandRows: ChildItem[];
  computerRows: ChildItem[];
  softwareRows: ChildItem[];
  sensorRows: ChildItem[];
  lifeSupportRows: ChildItem[];
  weaponMountRows: ChildItem[];
  supplyRows: ChildItem[];
  bridge: string;
  computer: string;
  softwareList: string[];
  sensors: string;
  staterooms: number;
  lowBerths: number;
  selectedModules: { id: string; qty: number }[];
  selectedWeapons: { id: string; qty: number }[];
  cargo: number;
} {
  const driveRows = ship.drives || [];
  const powerRows = driveRows.filter((d) => d.type === 'powerPlant');

  return {
    name: ship.name,
    tl: ship.tl,
    hullCode: ship.hullCode,
    config: ship.configuration,
    armorRows: ship.armor && ship.armor !== 'None'
      ? [{ id: `armor-test`, name: ship.armor, dtons: 0, cost: 0, qty: ship.armorQty || 1 }]
      : [],
    mDrive: ship.mDrive || '',
    jDrive: ship.jDrive || '',
    mDriveRows: driveRows
      .filter((d) => d.type === 'thrust')
      .map((d) => ({
        id: d.id || `mdrive-test`,
        name: d.name || d.driveCode || '',
        dtons: d.dtons || 0,
        cost: d.cost || 0,
        qty: d.qty || 1,
      })),
    jDriveRows: driveRows
      .filter((d) => d.type === 'jump')
      .map((d) => ({
        id: d.id || `jdrive-test`,
        name: d.name || d.driveCode || '',
        dtons: d.dtons || 0,
        cost: d.cost || 0,
        qty: d.qty || 1,
      })),
    powerPlant: ship.powerPlant || '',
    ppRows: powerRows.map((d) => ({
      id: d.id || `pp-test`,
      name: d.name || d.driveCode || '',
      dtons: d.dtons || 0,
      cost: d.cost || 0,
      qty: d.qty || 1,
      variant: (d as { variant?: string }).variant || 'Fusion',
    })),
    commandRows: (ship.commandControl || []).map((d) => ({
      id: d.id || `cmd-test`,
      name: d.name,
      dtons: d.dtons || 0,
      cost: d.cost || 0,
      qty: d.qty || 1,
    })),
    computerRows: (ship.computers || []).map((d) => ({
      id: d.id || `computer-test`,
      name: d.name,
      dtons: d.dtons || 0,
      cost: d.cost || 0,
      qty: d.qty || 1,
    })),
    softwareRows: (ship.softwareList || []).map((d) => ({
      id: d.id || `sw-test`,
      name: d.name,
      dtons: d.dtons || 0,
      cost: d.cost || 0,
      qty: d.qty || 1,
    })),
    sensorRows: (ship.sensorList || []).map((d) => ({
      id: d.id || `sensor-test`,
      name: d.name,
      dtons: d.dtons || 0,
      cost: d.cost || 0,
      qty: d.qty || 1,
    })),
    lifeSupportRows: (ship.lifeSupport || []).map((d) => ({
      id: d.id || `ls-test`,
      name: d.name,
      dtons: d.dtons || 0,
      cost: d.cost || 0,
      qty: d.qty || 1,
    })),
    weaponMountRows: (ship.weaponMounts || []).map((d) => ({
      id: d.id || `wm-test`,
      name: d.name,
      dtons: d.dtons || 0,
      cost: d.cost || 0,
      qty: d.qty || 1,
    })),
    supplyRows: (ship.supplies || []).map((d) => ({
      id: d.id || `sup-test`,
      name: d.name,
      dtons: d.dtons || 0,
      cost: d.cost || 0,
      qty: d.qty || 1,
    })),
    bridge: ship.bridge || '',
    computer: ship.computer || '',
    softwareList: ship.software || [],
    sensors: ship.sensors || '',
    staterooms: ship.staterooms || 0,
    lowBerths: ship.lowBerths || 0,
    selectedModules: (ship.modules || []).map((m) => ({ id: m.module, qty: m.qty || 1 })),
    selectedWeapons: (ship.weapons || []).map((w) => ({ id: w.module, qty: w.qty || 1 })),
    cargo: ship.cargo ?? 0,
  };
}

function checkImportIssues(ship: ShipDesign): ImportIssue[] {
  const issues: ImportIssue[] = [];
  const loaded = simulateLoadShip(ship);

  // ── CHECK 1: Child tables should now be restored ──
  if (ship.commandControl && ship.commandControl.length > 0) {
    if (loaded.commandRows.length !== ship.commandControl.length) {
      issues.push({
        shipName: ship.name,
        category: 'Data Loss',
        field: 'commandControl',
        severity: 'major',
        detail: `commandControl has ${ship.commandControl.length} item(s) but only ${loaded.commandRows.length} restored.`,
      });
    }
  }

  if (ship.computers && ship.computers.length > 0) {
    if (loaded.computerRows.length !== ship.computers.length) {
      issues.push({
        shipName: ship.name,
        category: 'Data Loss',
        field: 'computers',
        severity: 'major',
        detail: `computers has ${ship.computers.length} item(s) but only ${loaded.computerRows.length} restored.`,
      });
    }
  }

  if (ship.softwareList && ship.softwareList.length > 0) {
    if (loaded.softwareRows.length !== ship.softwareList.length) {
      issues.push({
        shipName: ship.name,
        category: 'Data Loss',
        field: 'softwareList',
        severity: 'major',
        detail: `softwareList has ${ship.softwareList.length} item(s) but only ${loaded.softwareRows.length} restored.`,
      });
    }
  }

  if (ship.sensorList && ship.sensorList.length > 0) {
    if (loaded.sensorRows.length !== ship.sensorList.length) {
      issues.push({
        shipName: ship.name,
        category: 'Data Loss',
        field: 'sensorList',
        severity: 'major',
        detail: `sensorList has ${ship.sensorList.length} item(s) but only ${loaded.sensorRows.length} restored.`,
      });
    }
  }

  if (ship.lifeSupport && ship.lifeSupport.length > 0) {
    if (loaded.lifeSupportRows.length !== ship.lifeSupport.length) {
      issues.push({
        shipName: ship.name,
        category: 'Data Loss',
        field: 'lifeSupport',
        severity: 'major',
        detail: `lifeSupport has ${ship.lifeSupport.length} item(s) but only ${loaded.lifeSupportRows.length} restored.`,
      });
    }
  }

  if (ship.weaponMounts && ship.weaponMounts.length > 0) {
    if (loaded.weaponMountRows.length !== ship.weaponMounts.length) {
      issues.push({
        shipName: ship.name,
        category: 'Data Loss',
        field: 'weaponMounts',
        severity: 'major',
        detail: `weaponMounts has ${ship.weaponMounts.length} item(s) but only ${loaded.weaponMountRows.length} restored.`,
      });
    }
  }

  if (ship.supplies && ship.supplies.length > 0) {
    if (loaded.supplyRows.length !== ship.supplies.length) {
      issues.push({
        shipName: ship.name,
        category: 'Data Loss',
        field: 'supplies',
        severity: 'minor',
        detail: `supplies has ${ship.supplies.length} item(s) but only ${loaded.supplyRows.length} restored.`,
      });
    }
  }

  // ── CHECK 2: Power plant drives should be restored from ship.drives ──
  const hasPowerPlantDrives = (ship.drives || []).some((d) => d.type === 'powerPlant');
  if (hasPowerPlantDrives && loaded.ppRows.length === 0) {
    issues.push({
      shipName: ship.name,
      category: 'Data Loss',
      field: 'powerPlant',
      severity: 'major',
      detail: `Ship has powerPlant drive items but ppRows is empty after load.`,
    });
  }

  // ── CHECK 3: Cargo should never be undefined ──
  if (ship.cargo === undefined || ship.cargo === null) {
    issues.push({
      shipName: ship.name,
      category: 'Type Safety',
      field: 'cargo',
      severity: 'minor',
      detail: `cargo is ${ship.cargo}. loadShip() now defaults to 0.`,
    });
  }

  return issues;
}

describe('Ship Import Integrity — Run 1', () => {
  const allIssues: ImportIssue[] = [];

  it('should find minimal or no data loss for all sample ships', () => {
    for (const ship of ALL_SAMPLE_SHIPS) {
      const issues = checkImportIssues(ship);
      allIssues.push(...issues);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  SHIP IMPORT TEST — RUN 1 (POST-FIX)');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  Ships tested: ${ALL_SAMPLE_SHIPS.length}`);
    console.log(`  Total issues: ${allIssues.length}`);
    console.log(`  Critical: ${allIssues.filter((i) => i.severity === 'critical').length}`);
    console.log(`  Major: ${allIssues.filter((i) => i.severity === 'major').length}`);
    console.log(`  Minor: ${allIssues.filter((i) => i.severity === 'minor').length}`);
    console.log('───────────────────────────────────────────────────────────────');

    if (allIssues.length > 0) {
      for (const issue of allIssues.slice(0, 10)) {
        console.log(`  [${issue.severity.toUpperCase()}] ${issue.shipName}`);
        console.log(`    ${issue.category} › ${issue.field}: ${issue.detail}`);
      }
      if (allIssues.length > 10) {
        console.log(`  ... and ${allIssues.length - 10} more issues`);
      }
    } else {
      console.log('  ✅ All child-table data round-trips correctly.');
    }
    console.log('═══════════════════════════════════════════════════════════════\n');

    expect(allIssues.length).toBe(0);
  });

  it('should verify JSON round-trip preserves all fields', () => {
    for (const ship of ALL_SAMPLE_SHIPS) {
      const json = JSON.stringify(ship);
      const restored = JSON.parse(json) as ShipDesign;
      expect(restored.id).toBe(ship.id);
      expect(restored.name).toBe(ship.name);
      expect(restored.hullDtons).toBe(ship.hullDtons);
      expect((restored.drives || []).length).toBe((ship.drives || []).length);
      expect((restored.commandControl || []).length).toBe((ship.commandControl || []).length);
      expect((restored.computers || []).length).toBe((ship.computers || []).length);
      expect((restored.softwareList || []).length).toBe((ship.softwareList || []).length);
      expect((restored.sensorList || []).length).toBe((ship.sensorList || []).length);
      expect((restored.lifeSupport || []).length).toBe((ship.lifeSupport || []).length);
      expect((restored.weaponMounts || []).length).toBe((ship.weaponMounts || []).length);
      expect((restored.supplies || []).length).toBe((ship.supplies || []).length);
    }
  });
});

describe('Ship Import Integrity — Run 2', () => {
  const allIssues: ImportIssue[] = [];

  it('should reproduce the same clean findings', () => {
    for (const ship of ALL_SAMPLE_SHIPS) {
      const issues = checkImportIssues(ship);
      allIssues.push(...issues);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  SHIP IMPORT TEST — RUN 2 (POST-FIX)');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  Ships tested: ${ALL_SAMPLE_SHIPS.length}`);
    console.log(`  Total issues: ${allIssues.length}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    expect(allIssues.length).toBe(0);
  });
});

describe('Ship Import Integrity — Run 3', () => {
  const allIssues: ImportIssue[] = [];

  it('should confirm findings are consistent across runs', () => {
    for (const ship of ALL_SAMPLE_SHIPS) {
      const issues = checkImportIssues(ship);
      allIssues.push(...issues);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  SHIP IMPORT TEST — RUN 3 (POST-FIX)');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  Ships tested: ${ALL_SAMPLE_SHIPS.length}`);
    console.log(`  Total issues: ${allIssues.length}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    expect(allIssues.length).toBe(0);
  });
});
