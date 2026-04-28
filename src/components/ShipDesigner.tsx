import { useState, useMemo, useEffect } from 'react';
import { useTableStore } from '../store/tableStore';
import { useSettings } from './ThemeProvider';
import { ChildTable } from './ChildTable';
import { BOQView } from './BOQView';
import { MnemeCombatPanel } from './MnemeCombatPanel';
import { downloadJson, generateSnapshotName } from '../utils/exportImport';
import { fmtNumber, fmtCost, fmtTons } from '../utils/formatters';
import {
  calcArmorTonnage, calcArmorCost, calcJumpFuel, calcPowerFuel,
  getMinPowerPlantLetter, calcStateroomTonnage, calcStateroomCost,
  calcLowBerthTonnage, calcLowBerthCost, calcCrewRequirements,
} from '../calculations';
import { validateShip } from '../validations';
import { Save, Calculator, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { colors, fonts } from './shipgen/theme';
import { ShLabel, ShNum, ShData, ShPanel, ShField } from './shipgen/primitives';
import { TonnageGauge } from './shipgen/TonnageGauge';
import type { ShipComponent, ShipDesign, ChildItem } from '../types';

// ─── Helpers ───

function generateShipName(hullDtons: number): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 90) + 10;
  return `${Math.round(hullDtons)}DT-${yy}${mm}${dd}-${rand}`;
}

function createDefaultShips(addShip: (ship: ShipDesign) => void) {
  const now = new Date().toISOString();
  const defaults: ShipDesign[] = [
    {
      id: `default-${Date.now()}-1`,
      name: 'Shuttle',
      tl: 9,
      hullCode: '100',
      hullDtons: 100,
      configuration: 'Standard',
      armor: 'None',
      armorQty: 0,
      mDrive: 'A',
      jDrive: '',
      powerPlant: 'A',
      bridge: '10-ton Bridge',
      computer: 'Model 1',
      software: [],
      sensors: 'Standard Sensors',
      staterooms: 0,
      lowBerths: 0,
      crew: [],
      modules: [],
      weapons: [],
      cargo: 10,
      components: [],
      totalCost: 0,
      availableDtons: 0,
      createdAt: now,
    },
    {
      id: `default-${Date.now()}-2`,
      name: 'Free Trader',
      tl: 9,
      hullCode: '200',
      hullDtons: 200,
      configuration: 'Standard',
      armor: 'None',
      armorQty: 0,
      mDrive: 'A',
      jDrive: 'A',
      powerPlant: 'A',
      bridge: '10-ton Bridge',
      computer: 'Model 1',
      software: [],
      sensors: 'Standard Sensors',
      staterooms: 10,
      lowBerths: 0,
      crew: [],
      modules: [],
      weapons: [],
      cargo: 50,
      components: [],
      totalCost: 0,
      availableDtons: 0,
      createdAt: now,
    },
    {
      id: `default-${Date.now()}-3`,
      name: 'Patrol Cruiser',
      tl: 9,
      hullCode: '400',
      hullDtons: 400,
      configuration: 'Standard',
      armor: 'Titanium Steel TL7+',
      armorQty: 1,
      mDrive: 'C',
      jDrive: 'B',
      powerPlant: 'C',
      bridge: '20-ton Bridge',
      computer: 'Model 2',
      software: [],
      sensors: 'Standard Sensors',
      staterooms: 10,
      lowBerths: 0,
      crew: [],
      modules: [],
      weapons: [],
      cargo: 20,
      components: [],
      totalCost: 0,
      availableDtons: 0,
      createdAt: now,
    },
  ];
  defaults.forEach(addShip);
}

// ─── Step Accordion ───

function Step({ num, title, kw, children, defaultOpen = true }: {
  num: number; title: string; kw?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section style={{ marginBottom: 14, background: colors.panel, border: `1px solid ${colors.hair}` }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px', background: 'transparent', border: 'none',
          cursor: 'pointer', borderBottom: open ? `1px solid ${colors.hair}` : 'none',
          textAlign: 'left',
        }}
      >
        <ShNum size={22} color={colors.glow}>{String(num).padStart(2, '0')}</ShNum>
        <div style={{ width: 1, height: 18, background: colors.hair }} />
        <ShLabel size={15} weight={600} style={{ color: colors.ink, letterSpacing: '0.16em', flex: 1 }}>
          {title}
        </ShLabel>
        {kw && <ShData size={12} dim>{kw}</ShData>}
        <ShData size={18} dim style={{ color: colors.glow }}>{open ? '−' : '+'}</ShData>
      </button>
      {open && <div style={{ padding: 18 }}>{children}</div>}
    </section>
  );
}

// ─── Component ───

export function ShipDesigner() {
  const tables = useTableStore((s) => s.tables);
  const addShip = useTableStore((s) => s.addShip);
  const ships = useTableStore((s) => s.ships);
  const updateShip = useTableStore((s) => s.updateShip);
  const deleteShip = useTableStore((s) => s.deleteShip);
  const setCurrentShip = useTableStore((s) => s.setCurrentShip);
  const currentShip = useTableStore((s) => s.currentShip);
  const { layoutMode } = useSettings();

  // ─── Basic Info ───
  const [name, setName] = useState('');
  const [tl, setTl] = useState(9);

  // ─── Hull & Config ───
  const [hullCode, setHullCode] = useState('');
  const [config, setConfig] = useState('Standard');

  // ─── Armor (child table) ───
  const [armorRows, setArmorRows] = useState<ChildItem[]>([]);

  const [jumpParsecs, setJumpParsecs] = useState(0);

  // ─── Command & Control (child table) ───
  const [commandRows, setCommandRows] = useState<ChildItem[]>([]);

  // ─── Computers (child table, max 2) ───
  const [computerRows, setComputerRows] = useState<ChildItem[]>([]);

  // ─── Software (child table) ───
  const [softwareRows, setSoftwareRows] = useState<ChildItem[]>([]);

  // ─── Sensors (child table) ───
  const [sensorRows, setSensorRows] = useState<ChildItem[]>([]);

  // ─── Life Support (child table) ───
  const [lifeSupportRows, setLifeSupportRows] = useState<ChildItem[]>([]);

  // ─── Modules (child table) ───
  const [moduleRows, setModuleRows] = useState<ChildItem[]>([]);

  // ─── Weapon Mounts (child table) ───
  const [weaponMountRows, setWeaponMountRows] = useState<ChildItem[]>([]);

  // ─── Cargo ───
  const [cargo, setCargo] = useState(0);
  const [supplyRows, setSupplyRows] = useState<ChildItem[]>([]);

  // ─── Legacy flat fields (for backward compat) ───
  const [mDrive, setMDrive] = useState('');
  const [jDrive, setJDrive] = useState('');
  const [powerPlant, setPowerPlant] = useState('');
  const [bridge, setBridge] = useState('');
  const [computer, setComputer] = useState('');
  const [softwareList, setSoftwareList] = useState<string[]>([]);
  const [sensors, setSensors] = useState('');
  const [staterooms, setStaterooms] = useState(0);
  const [lowBerths, setLowBerths] = useState(0);
  const [selectedModules, setSelectedModules] = useState<{id: string; qty: number}[]>([]);
  const [selectedWeapons, setSelectedWeapons] = useState<{id: string; qty: number}[]>([]);

  // ─── Table Data ───
  const hulls = tables.ship_hulls?.rows || [];
  const configs = tables.hull_configurations?.rows || [];
  const armors = tables.ship_armor?.rows || [];
  const drives = tables.ship_drives?.rows || [];
  const bridges = tables.ship_bridge?.rows || [];
  const computers = tables.ship_computers?.rows || [];
  const software = tables.ship_software?.rows || [];
  const sensorList = tables.ship_sensors?.rows || [];
  const modules = tables.ship_modules?.rows || [];
  const weapons = tables.ship_weapons?.rows || [];

  // ─── Thrust Performance Helper ───
  const getThrustPerformance = (driveCode: string): number | null => {
    const perfRows = tables.engine_performance?.rows || [];
    const driveIndex = drives.findIndex((d: Record<string, unknown>) => String(d['Drive Code']) === driveCode);
    if (driveIndex < 0 || driveIndex >= perfRows.length) return null;
    const row = perfRows[driveIndex];
    const colKey = String(hullDtons);
    const val = row[colKey];
    if (val === null || val === undefined || val === '' || val === '--') return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  // ─── Hull Calculations ───
  const selectedHull = hulls.find((h: Record<string, unknown>) => String(h['DTONS']) === hullCode || String(h['Performance Column']) === hullCode);
  const hullDtons = selectedHull ? Number(selectedHull['DTONS']) : 0;
  const hullCost = selectedHull ? Number(selectedHull['COST']) : 0;

  // Auto-generate name when hull changes
  useEffect(() => {
    if (hullDtons > 0 && !name) {
      setName(generateShipName(hullDtons));
    }
  }, [hullDtons]);

  // Pre-populate default ships on mount if library is empty
  useEffect(() => {
    if (ships.length === 0) {
      createDefaultShips(addShip);
    }
  }, []);

  // Auto-generate minimum bridge/cockpit when hull changes and command is empty
  useEffect(() => {
    if (hullDtons > 0 && commandRows.length === 0) {
      if (hullDtons <= 90) {
        const cockpit = smallCraftBridges[0];
        if (cockpit) {
          const dt = Number(cockpit['CONTROLS/ BRIDGE'] || cockpit['DTONS'] || cockpit['Tons'] || 0);
          const costPerDt = Number(cockpit['COST per DTON'] || cockpit['COST'] || 0);
          setCommandRows([{
            id: `cmd-${Date.now()}`,
            name: String(cockpit['CONTROLS/BRidge'] || cockpit['Bridge Size'] || '1-man Cockpit'),
            dtons: dt,
            cost: costPerDt * dt,
            qty: 1,
          }]);
        }
      } else {
        const bridge = shipBridges[0];
        if (bridge) {
          const dt = Number(bridge['CONTROLS/ BRIDGE'] || bridge['DTONS'] || bridge['Tons'] || 0);
          const costPerDt = Number(bridge['COST per DTON'] || bridge['COST'] || 0);
          setCommandRows([{
            id: `cmd-${Date.now()}`,
            name: String(bridge['CONTROLS/BRidge'] || bridge['Bridge Size'] || 'Bridge'),
            dtons: dt,
            cost: costPerDt * dt,
            qty: 1,
          }]);
        }
      }
    }
  }, [hullDtons]);

  const selectedConfig = configs.find((c: Record<string, unknown>) => String(c['Configuration']).includes(config));
  const configMod = selectedConfig ? Number(selectedConfig['Hull Cost Modifier'] || 0) : 0;

  // ─── Armor Calculations ───
  const armorTons = armorRows.reduce((s, r) => {
    const a = armors.find((ar: Record<string, unknown>) => String(ar['Armor Type']).includes(r.name));
    const pct = a ? Number(a['Cost Factor'] || a['Prot'] || 0.05) : 0.05;
    return s + calcArmorTonnage(hullDtons, pct, r.qty, 1.0);
  }, 0);
  const armorCost = armorRows.reduce((s, r) => {
    const a = armors.find((ar: Record<string, unknown>) => String(ar['Armor Type']).includes(r.name));
    const costMod = a ? Number(a['Cost Factor'] || a['Cost'] || 0) : 0;
    return s + calcArmorCost(hullCost, costMod, r.qty);
  }, 0);

  // ─── Legacy Drives (for backward compat calcs) ───
  const selectedMDrive = drives.find((d: Record<string, unknown>) => String(d['Drive Code']) === mDrive);
  const mDriveTons = selectedMDrive ? Number(selectedMDrive['M-Drive\n Tons'] || 0) : 0;
  const mDriveCost = selectedMDrive ? Number(selectedMDrive['M-Drive COST'] || 0) : 0;

  const selectedJDrive = drives.find((d: Record<string, unknown>) => String(d['Drive Code']) === jDrive);
  const jDriveTons = selectedJDrive ? Number(selectedJDrive['J-Drive\n Tons'] || 0) : 0;
  const jDriveCost = selectedJDrive ? Number(selectedJDrive['J-Drive COST'] || 0) : 0;

  const selectedPP = drives.find((d: Record<string, unknown>) => String(d['Drive Code']) === powerPlant);
  const ppTons = selectedPP ? Number(selectedPP['P-Plant\n Tons'] || 0) : 0;
  const ppCost = selectedPP ? Number(selectedPP['PP COST'] || 0) : 0;
  const ppFuelWk = selectedPP ? Number(selectedPP['Fuel/Wk\n (tons)'] || 0) : 0;

  // ─── Fuel ───
  const jumpFuel = calcJumpFuel(hullDtons, jumpParsecs);
  const powerFuel = calcPowerFuel(ppTons, 2);
  const totalFuel = jumpFuel + powerFuel;

  // ─── Legacy Life Support ───
  const stateroomTons = calcStateroomTonnage(staterooms);
  const stateroomCost = calcStateroomCost(staterooms);
  const lowBerthTons = calcLowBerthTonnage(lowBerths);
  const lowBerthCost = calcLowBerthCost(lowBerths);

  // ─── Crew Calculations ───
  const crewReqs = useMemo(() => {
    if (!hullDtons) return null;
    return calcCrewRequirements(
      hullDtons,
      !!(mDrive || powerPlant),
      !!(jDrive && jumpParsecs > 0),
      !!(sensors || sensorRows.length > 0),
      (selectedWeapons.length + weaponMountRows.length),
      staterooms + lifeSupportRows.filter(r => r.name.toLowerCase().includes('stateroom')).reduce((s, r) => s + r.qty, 0),
      lowBerths,
      commandRows.length,
    );
  }, [hullDtons, mDrive, powerPlant, jDrive, jumpParsecs, sensors, sensorRows, selectedWeapons, weaponMountRows, staterooms, lifeSupportRows, lowBerths, commandRows]);

  // ─── Legacy Bridge ───
  const selectedBridge = bridges.find((b: Record<string, unknown>) => String(b['CONTROLS/BRidge'] || b['Bridge Size'] || b['WEAPONS']).includes(bridge));
  const bridgeTons = selectedBridge ? Number(selectedBridge['CONTROLS/ BRIDGE'] || selectedBridge['DTONS'] || selectedBridge['Tons'] || 0) : 0;
  const bridgeCost = selectedBridge ? Number(selectedBridge['COST per DTON'] || selectedBridge['COST'] || 0) : 0;

  // ─── Child Table Components ───
  const moduleComponents: ShipComponent[] = moduleRows.map((m) => ({
    section: 'Module',
    module: m.name,
    dtons: m.dtons * m.qty,
    cost: m.cost * m.qty,
    qty: m.qty,
  }));

  const weaponComponents: ShipComponent[] = selectedWeapons.map((sw) => {
    const wpn = weapons.find((w: Record<string, unknown>) => String(w['WEAPONS']).includes(sw.id));
    const tons = wpn ? Number(wpn['DTONS'] || 0) : 0;
    const cost = wpn ? Number(wpn['COST'] || 0) : 0;
    return {
      section: 'Weapon',
      module: sw.id,
      dtons: tons * sw.qty,
      cost: cost * sw.qty,
      qty: sw.qty,
    };
  });

  // ─── Allocated Tons ───
  const allocatedTons = (
    armorTons + mDriveTons + jDriveTons + ppTons + bridgeTons + totalFuel +
    stateroomTons + lowBerthTons +
    moduleComponents.reduce((s, c) => s + c.dtons, 0) +
    weaponComponents.reduce((s, c) => s + c.dtons, 0) +
    commandRows.reduce((s, r) => s + r.dtons * r.qty, 0) +
    computerRows.reduce((s, r) => s + r.dtons * r.qty, 0) +
    sensorRows.reduce((s, r) => s + r.dtons * r.qty, 0) +
    lifeSupportRows.reduce((s, r) => s + r.dtons * r.qty, 0) +
    supplyRows.reduce((s, r) => s + r.dtons * r.qty, 0)
  );

  const availableDtons = hullDtons - allocatedTons;

  // ─── Total Cost ───
  const totalCost = hullCost + (hullCost * configMod) + armorCost + mDriveCost + jDriveCost + ppCost +
    bridgeCost + stateroomCost + lowBerthCost +
    moduleComponents.reduce((s, c) => s + c.cost, 0) +
    weaponComponents.reduce((s, c) => s + c.cost, 0) +
    commandRows.reduce((s, r) => s + r.cost * r.qty, 0) +
    computerRows.reduce((s, r) => s + r.cost * r.qty, 0) +
    sensorRows.reduce((s, r) => s + r.cost * r.qty, 0) +
    lifeSupportRows.reduce((s, r) => s + r.cost * r.qty, 0) +
    supplyRows.reduce((s, r) => s + r.cost * r.qty, 0);

  // ─── BOQ Components ───
  const components: ShipComponent[] = useMemo(() => {
    const list: ShipComponent[] = [];
    if (hullDtons > 0) {
      list.push({ section: 'Hull', module: `${hullDtons} DT Hull`, dtons: hullDtons, cost: hullCost });
      if (configMod !== 0) list.push({ section: 'Config', module: config, dtons: 0, cost: hullCost * configMod });
    }
    armorRows.forEach(r => {
      if (r.qty > 0) list.push({ section: 'Armor', module: r.name, dtons: calcArmorTonnage(hullDtons, 0.05, r.qty, 1.0), cost: calcArmorCost(hullCost, 0.05, r.qty), qty: r.qty });
    });
    if (mDriveTons > 0) list.push({ section: 'M-Drive', module: mDrive, dtons: mDriveTons, cost: mDriveCost });
    if (jDriveTons > 0) list.push({ section: 'J-Drive', module: jDrive, dtons: jDriveTons, cost: jDriveCost });
    if (ppTons > 0) list.push({ section: 'Power Plant', module: powerPlant, dtons: ppTons, cost: ppCost });
    if (bridgeTons > 0) list.push({ section: 'Bridge', module: bridge, dtons: bridgeTons, cost: bridgeCost });
    if (totalFuel > 0) list.push({ section: 'Fuel', module: `Jump-${jumpParsecs} + Power`, dtons: totalFuel, cost: 0 });
    if (stateroomTons > 0) list.push({ section: 'Life Support', module: `${staterooms} Staterooms`, dtons: stateroomTons, cost: stateroomCost });
    if (lowBerthTons > 0) list.push({ section: 'Life Support', module: `${lowBerths} Low Berths`, dtons: lowBerthTons, cost: lowBerthCost });
    commandRows.forEach(r => list.push({ section: 'Command', module: r.name, dtons: r.dtons * r.qty, cost: r.cost * r.qty, qty: r.qty }));
    computerRows.forEach(r => list.push({ section: 'Computer', module: r.name, dtons: r.dtons * r.qty, cost: r.cost * r.qty, qty: r.qty }));
    sensorRows.forEach(r => list.push({ section: 'Sensors', module: r.name, dtons: r.dtons * r.qty, cost: r.cost * r.qty, qty: r.qty }));
    lifeSupportRows.forEach(r => list.push({ section: 'Life Support', module: r.name, dtons: r.dtons * r.qty, cost: r.cost * r.qty, qty: r.qty }));
    list.push(...moduleComponents);
    list.push(...weaponComponents);
    supplyRows.forEach(r => list.push({ section: 'Supplies', module: r.name, dtons: r.dtons * r.qty, cost: r.cost * r.qty, qty: r.qty }));
    if (cargo > 0) list.push({ section: 'Cargo', module: 'Cargo Hold', dtons: cargo, cost: 0 });
    if (crewReqs) {
      list.push({ section: 'Crew', module: `Minimum Crew (${crewReqs.totalMinimum})`, dtons: 0, cost: 0 });
      crewReqs.positions.forEach(p => {
        if (p.fullComplement > 0) {
          list.push({ section: 'Crew', module: `${p.position} ×${p.fullComplement}`, dtons: 0, cost: p.salary * p.fullComplement, notes: `${fmtNumber(p.salary)} Cr/mo each` });
        }
      });
    }
    return list;
  }, [hullDtons, hullCost, config, configMod, armorTons, armorRows, armorCost, mDriveTons, mDrive, mDriveCost, jDriveTons, jDrive, jDriveCost, ppTons, powerPlant, ppCost, bridgeTons, bridge, bridgeCost, totalFuel, jumpParsecs, stateroomTons, staterooms, stateroomCost, lowBerthTons, lowBerths, lowBerthCost, commandRows, computerRows, sensorRows, lifeSupportRows, moduleComponents, weaponComponents, supplyRows, cargo]);

  // ─── Validation ───
  const validation = useMemo(() => {
    if (!hullDtons) return null;
    const design: ShipDesign = {
      id: currentShip?.id || 'temp',
      name, tl, hullCode, hullDtons, configuration: config,
      armor: armorRows.map(r => r.name).join(', ') || 'None',
      armorQty: armorRows.reduce((s, r) => s + r.qty, 0),
      mDrive, jDrive, powerPlant,
      bridge, computer, software: softwareList,
      sensors, staterooms, lowBerths,
      crew: [],
      modules: moduleComponents,
      weapons: weaponComponents,
      cargo, components, totalCost, availableDtons,
      createdAt: currentShip?.createdAt || new Date().toISOString(),
    };
    return validateShip(design);
  }, [name, tl, hullCode, hullDtons, config, armorRows, mDrive, jDrive, powerPlant, bridge, computer, softwareList, sensors, staterooms, lowBerths, moduleComponents, weaponComponents, cargo, components, totalCost, availableDtons, currentShip]);

  // ─── Actions ───
  const saveShip = () => {
    const ship: ShipDesign = {
      id: currentShip?.id || `ship-${Date.now()}`,
      name: name || generateShipName(hullDtons),
      tl,
      hullCode,
      hullDtons,
      configuration: config,
      armor: armorRows.map(r => r.name).join(', ') || 'None',
      armorQty: armorRows.reduce((s, r) => s + r.qty, 0),
      mDrive,
      jDrive,
      powerPlant,
      bridge,
      computer,
      software: softwareList,
      sensors,
      staterooms,
      lowBerths,
      crew: [],
      modules: moduleComponents,
      weapons: weaponComponents,
      cargo,
      components,
      totalCost,
      availableDtons,
      createdAt: currentShip?.createdAt || new Date().toISOString(),
    };
    if (currentShip) {
      updateShip(ship);
    } else {
      addShip(ship);
    }
  };

  const exportShip = () => {
    const ship: ShipDesign = {
      id: `export-${Date.now()}`,
      name: name || generateShipName(hullDtons),
      tl, hullCode, hullDtons, configuration: config,
      armor: armorRows.map(r => r.name).join(', ') || 'None',
      armorQty: armorRows.reduce((s, r) => s + r.qty, 0),
      mDrive, jDrive, powerPlant,
      bridge, computer, software: softwareList,
      sensors, staterooms, lowBerths,
      crew: [],
      modules: moduleComponents,
      weapons: weaponComponents,
      cargo, components, totalCost, availableDtons,
      createdAt: new Date().toISOString(),
    };
    downloadJson(JSON.stringify(ship, null, 2), `ship-${name.replace(/\s+/g, '_')}-${generateSnapshotName()}.json`);
  };

  const loadShip = (ship: ShipDesign) => {
    setName(ship.name);
    setTl(ship.tl);
    setHullCode(ship.hullCode);
    setConfig(ship.configuration);
    if (ship.armor && ship.armor !== 'None') {
      setArmorRows([{ id: `armor-${Date.now()}`, name: ship.armor, dtons: 0, cost: 0, qty: ship.armorQty || 1 }]);
    } else {
      setArmorRows([]);
    }
    setMDrive(ship.mDrive || '');
    setJDrive(ship.jDrive || '');
    setPowerPlant(ship.powerPlant || '');
    setBridge(ship.bridge || '');
    setComputer(ship.computer || '');
    setSoftwareList(ship.software || []);
    setSensors(ship.sensors || '');
    setStaterooms(ship.staterooms || 0);
    setLowBerths(ship.lowBerths || 0);
    setSelectedModules((ship.modules || []).map(m => ({ id: m.module, qty: m.qty || 1 })));
    setSelectedWeapons((ship.weapons || []).map(w => ({ id: w.module, qty: w.qty || 1 })));
    setCargo(ship.cargo);
  };

  const resetDesigner = () => {
    setName('');
    setTl(9);
    setHullCode('');
    setConfig('Standard');
    setArmorRows([]);
    setMDrive('');
    setJDrive('');
    setPowerPlant('');
    setBridge('');
    setComputer('');
    setSoftwareList([]);
    setSensors('');
    setStaterooms(0);
    setLowBerths(0);
    setSelectedModules([]);
    setSelectedWeapons([]);
    setJumpParsecs(0);
    setCargo(0);
    setCommandRows([]);
    setComputerRows([]);
    setSoftwareRows([]);
    setSensorRows([]);
    setLifeSupportRows([]);
    setModuleRows([]);
    setWeaponMountRows([]);
    setSupplyRows([]);
    setCurrentShip(null);
  };

  // ─── Drive filtering helpers ───
  const validMDrives = drives.filter((d: Record<string, unknown>) => Number(d['M-Drive\n Tons']) > 0);
  const validJDrives = drives.filter((d: Record<string, unknown>) => Number(d['J-Drive\n Tons']) > 0);
  const validPPs = drives;

  // ─── Cockpit/Bridge filtering ───
  const smallCraftBridges = bridges.filter((b: Record<string, unknown>) => {
    const max = Number(b['<='] || 999);
    return max <= 90;
  });
  const shipBridges = bridges.filter((b: Record<string, unknown>) => {
    const min = Number(b['>='] || 0);
    return min >= 100;
  });
  const availableBridges = hullDtons <= 90 ? smallCraftBridges : shipBridges;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: layoutMode === 'phone' ? '1fr' : 'minmax(0, 1fr) 420px',
      gap: layoutMode === 'phone' ? 14 : 22,
    }}>
      {/* LEFT: Design Steps */}
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <ShNum size={36} color={colors.ink}>SHIP DESIGNER</ShNum>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={saveShip} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> {currentShip ? 'UPDATE' : 'SAVE'}
            </button>
            {currentShip && (
              <button onClick={exportShip} className="btn-secondary flex items-center gap-2">
                <Calculator className="w-4 h-4" /> EXPORT
              </button>
            )}
            <button onClick={resetDesigner} className="btn-secondary flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> RESET
            </button>
          </div>
        </div>

        {/* Load from Library */}
        {ships.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <ShField
              label="LOAD FROM LIBRARY"
              value=""
              onChange={(v) => {
                if (!v) return;
                const ship = ships.find((s) => s.id === v);
                if (ship) loadShip(ship);
              }}
              options={[
                { value: '', label: '— SELECT SHIP —' },
                ...ships.map((ship) => ({ value: ship.id, label: `${ship.name} · ${fmtTons(ship.hullDtons)} · TL${ship.tl}` })),
              ]}
            />
          </div>
        )}

        {/* Validation */}
        {validation && (
          <div style={{
            marginBottom: 14,
            padding: '12px 16px',
            border: `1px solid ${validation.valid ? colors.good : colors.warn}`,
            background: validation.valid ? `${colors.good}10` : `${colors.warn}10`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: validation.valid ? 0 : 8 }}>
              {validation.valid
                ? <CheckCircle size={16} style={{ color: colors.good }} />
                : <AlertTriangle size={16} style={{ color: colors.warn }} />
              }
              <ShData size={13} glow={!validation.valid} warn={!validation.valid} good={validation.valid} weight={600}>
                {validation.valid ? 'DESIGN VALID' : `${validation.hardErrors.length} ISSUE${validation.hardErrors.length > 1 ? 'S' : ''}`}
              </ShData>
            </div>
            {!validation.valid && (
              <ul style={{ margin: '4px 0 0', paddingLeft: 20, listStyle: 'disc', color: colors.warn, fontFamily: fonts.mono, fontSize: 12 }}>
                {validation.hardErrors.map((err: { message: string }, i: number) => (
                  <li key={i}>{err.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Tonnage Budget */}
        {hullDtons > 0 && (
          <ShPanel no="SHEET 01" title="Tonnage Budget" kw="BOQ" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
              <div>
                <ShLabel size={12} dim>HULL</ShLabel>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <ShNum size={40}>{hullDtons}</ShNum>
                  <ShData size={14} dim>DT</ShData>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <ShLabel size={12} dim>AVAILABLE</ShLabel>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, justifyContent: 'flex-end' }}>
                  <ShNum size={40} color={availableDtons < 0 ? colors.warn : colors.glow}>
                    {availableDtons > 0 ? '+' : ''}{availableDtons.toFixed(1)}
                  </ShNum>
                  <ShData size={14} dim>DT</ShData>
                </div>
              </div>
            </div>
            <TonnageGauge used={allocatedTons} total={hullDtons} />
          </ShPanel>
        )}

        {/* Step 1: Basic Info */}
        <Step num={1} title="Basic Info" kw="ID">
          <div style={{ display: 'flex', gap: 14 }}>
            <ShField label="SHIP DESIGNATION" value={name} onChange={(v) => setName(v ?? '')} />
            <ShField label="TECH LEVEL" value={tl} type="number" flex={0.4} onChange={(v) => setTl(Number(v) || 0)} />
          </div>
        </Step>

        {/* Step 2: Hull & Configuration */}
        <Step num={2} title="Hull & Configuration" kw="HUL/CFG">
          <div style={{ display: 'flex', gap: 14 }}>
            <ShField
              label="HULL SIZE"
              value={hullCode}
              options={hulls.map((h: Record<string, unknown>) => ({ value: String(h['DTONS']), label: `${String(h['DTONS'])} DT · ${fmtCost(Number(h['COST']))}` }))}
              onChange={(v) => setHullCode(v ?? '')}
              hint={hullDtons > 0 ? `HP ${Math.floor(hullDtons / 50)} · SP ${Math.ceil(hullDtons / 50)} · HARDPOINTS ${Math.floor(hullDtons / 100)}` : 'SELECT HULL TO BEGIN'}
            />
            <ShField
              label="CONFIGURATION"
              value={config}
              options={configs.map((c: Record<string, unknown>) => ({ value: String(c['Configuration']), label: `${String(c['Configuration'])} ${Number(c['Hull Cost Modifier']) > 0 ? '+' : ''}${Number(c['Hull Cost Modifier']) * 100}%` }))}
              onChange={(v) => setConfig(v ?? 'Standard')}
            />
          </div>
        </Step>

        {/* Step 3: Armor */}
        <Step num={3} title="Armor" kw="ARM">
          <ChildTable
            title="ARMOR LAYERS"
            items={armorRows}
            onChange={setArmorRows}
            columns={[
              { key: 'name', label: 'TYPE', editable: true, type: 'text' },
              { key: 'qty', label: 'LAYERS', editable: true, type: 'number', width: 'w-20', step: '0.1' },
            ]}
            createNewItem={() => ({
              id: `armor-${Date.now()}`,
              name: 'Titanium Steel TL7+',
              dtons: 0,
              cost: 0,
              qty: 1,
            })}
            addButtonLabel="ADD ARMOR LAYER"
          />
          <div style={{ marginTop: 12 }}>
            <ShField
              label="QUICK ADD ARMOR"
              value=""
              options={[{ value: '', label: '— SELECT FROM TABLE —' }, ...armors.map((a: Record<string, unknown>) => ({ value: String(a['Armor Type']), label: `${String(a['Armor Type'])} · P${Number(a['Prot'] || a['Protection'] || 0)} · TL${Number(a['TL'])}` }))]}
              onChange={(v) => {
                if (!v) return;
                const a = armors.find((ar: Record<string, unknown>) => String(ar['Armor Type']) === v);
                if (a) {
                  setArmorRows(prev => [...prev, {
                    id: `armor-${Date.now()}`,
                    name: String(a['Armor Type']),
                    dtons: 0,
                    cost: 0,
                    qty: 1,
                    tl: Number(a['TL'] || 7),
                  }]);
                }
              }}
            />
          </div>
          {armorTons > 0 && (
            <div style={{ marginTop: 8 }}>
              <ShData size={13} dim>TOTAL ARMOR: {fmtTons(armorTons)} · COST: {fmtCost(armorCost)}</ShData>
            </div>
          )}
        </Step>

        {/* Step 4: Drives & Power */}
        <Step num={4} title="Drives & Power" kw="PRP/PWR">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ShField
              label="M-DRIVE (THRUST)"
              value={mDrive}
              options={[{ value: '', label: '— NONE —' }, ...validMDrives.map((d: Record<string, unknown>) => {
                const code = String(d['Drive Code']);
                const thrust = getThrustPerformance(code);
                const tons = Number(d['M-Drive\n Tons'] || 0);
                const cost = Number(d['M-Drive COST'] || 0);
                return { value: code, label: thrust !== null ? `THRUST-${thrust} · ${code} · ${fmtTons(tons)} · ${fmtCost(cost)}` : `${code} · ${fmtTons(tons)} · ${fmtCost(cost)}` };
              })]}
              onChange={(v) => setMDrive(v ?? '')}
              hint={mDrive ? `${fmtTons(mDriveTons)} · ${fmtCost(mDriveCost)}` : 'NO MANEUVER DRIVE'}
            />
            <div style={{ display: 'flex', gap: 14 }}>
              <ShField
                label="JUMP PARSECS"
                value={String(jumpParsecs)}
                options={[{ value: '0', label: '0 (NONE)' }, { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6', label: '6' }]}
                onChange={(v) => setJumpParsecs(Number(v))}
              />
              <ShField
                label="J-DRIVE"
                value={jDrive}
                options={[{ value: '', label: jumpParsecs === 0 ? 'N/A' : '— NONE —' }, ...validJDrives.map((d: Record<string, unknown>) => {
                  const code = String(d['Drive Code']);
                  const tons = Number(d['J-Drive\n Tons'] || 0);
                  const cost = Number(d['J-Drive COST'] || 0);
                  return { value: code, label: `${code} · ${fmtTons(tons)} · ${fmtCost(cost)}` };
                })]}
                onChange={(v) => setJDrive(v ?? '')}
                hint={jDrive && jumpParsecs > 0 ? `JUMP-${jumpParsecs} · ${fmtTons(jDriveTons)} · ${fmtCost(jDriveCost)}` : 'SUBLIGHT ONLY'}
              />
            </div>
            <ShField
              label="POWER PLANT"
              value={powerPlant}
              options={[{ value: '', label: '— NONE —' }, ...validPPs.map((d: Record<string, unknown>) => {
                const code = String(d['Drive Code']);
                const tons = Number(d['P-Plant\n Tons'] || 0);
                const cost = Number(d['PP COST'] || 0);
                return { value: code, label: `${code} · ${fmtTons(tons)} · ${fmtCost(cost)}` };
              })]}
              onChange={(v) => setPowerPlant(v ?? '')}
              hint={powerPlant ? `${fmtTons(ppTons)} · ${fmtCost(ppCost)} · FUEL/WK ${ppFuelWk} TONS` : '—'}
            />
            {mDrive && jDrive && powerPlant && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {getMinPowerPlantLetter(mDrive, jDrive) <= powerPlant
                  ? <CheckCircle size={14} style={{ color: colors.good }} />
                  : <AlertTriangle size={14} style={{ color: colors.warn }} />
                }
                <ShData size={12} good={getMinPowerPlantLetter(mDrive, jDrive) <= powerPlant} warn={getMinPowerPlantLetter(mDrive, jDrive) > powerPlant}>
                  PP ≥ {getMinPowerPlantLetter(mDrive, jDrive)} REQUIRED
                </ShData>
              </div>
            )}
          </div>
        </Step>

        {/* Step 5: Command & Control */}
        <Step num={5} title="Command & Control" kw="C&C">
          <ShData size={12} dim>
            {hullDtons <= 90
              ? '// SMALL CRAFT: COCKPIT OPTIONS · ≤90 DT USES COCKPITS'
              : '// SHIP SIZE: BRIDGE OPTIONS · >90 DT REQUIRES BRIDGES'}
          </ShData>
          <div style={{ marginTop: 12 }}>
            <ChildTable
              title="BRIDGES / COCKPITS / CABINS"
              items={commandRows}
              onChange={setCommandRows}
              columns={[
                { key: 'name', label: 'TYPE', editable: true, type: 'text' },
                { key: 'dtons', label: 'DTONS', editable: true, type: 'number', width: 'w-20' },
                { key: 'cost', label: 'COST', editable: true, type: 'number', width: 'w-24' },
                { key: 'qty', label: 'QTY', editable: true, type: 'number', width: 'w-14' },
              ]}
              createNewItem={() => {
                const isSmall = hullDtons <= 90;
                const defaultBridge = isSmall ? smallCraftBridges[0] : shipBridges[0];
                const bridgeName = defaultBridge ? String(defaultBridge['CONTROLS/BRidge'] || defaultBridge['Bridge Size'] || 'Bridge') : 'Bridge';
                const bridgeDt = defaultBridge ? Number(defaultBridge['CONTROLS/ BRIDGE'] || defaultBridge['DTONS'] || 0) : 10;
                const bridgeCostPerDt = defaultBridge ? Number(defaultBridge['COST per DTON'] || defaultBridge['COST'] || 0) : 0;
                return {
                  id: `cmd-${Date.now()}`,
                  name: bridgeName,
                  dtons: bridgeDt,
                  cost: bridgeCostPerDt * bridgeDt,
                  qty: 1,
                };
              }}
              addButtonLabel="ADD BRIDGE/COCKPIT"
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <ShField
              label="QUICK ADD BRIDGE/COCKPIT"
              value=""
              options={[{ value: '', label: '— SELECT FROM TABLE —' }, ...availableBridges.map((b: Record<string, unknown>) => {
                const name = String(b['CONTROLS/BRidge'] || b['Bridge Size'] || b['WEAPONS']);
                const dt = Number(b['CONTROLS/ BRIDGE'] || b['DTONS'] || b['Tons'] || 0);
                const costPerDt = Number(b['COST per DTON'] || b['COST'] || 0);
                return { value: name, label: `${name} · ${fmtTons(dt)} · ${fmtCost(costPerDt * dt)}` };
              })]}
              onChange={(v) => {
                if (!v) return;
                const b = bridges.find((br: Record<string, unknown>) => String(br['CONTROLS/BRidge'] || br['Bridge Size'] || br['WEAPONS']) === v);
                if (b) {
                  const dt = Number(b['CONTROLS/ BRIDGE'] || b['DTONS'] || b['Tons'] || 0);
                  const costPerDt = Number(b['COST per DTON'] || b['COST'] || 0);
                  setCommandRows(prev => [...prev, {
                    id: `cmd-${Date.now()}`,
                    name: String(b['CONTROLS/BRidge'] || b['Bridge Size'] || b['WEAPONS']),
                    dtons: dt,
                    cost: costPerDt * dt,
                    qty: 1,
                  }]);
                }
              }}
            />
          </div>
        </Step>

        {/* Step 6: Computer Options */}
        <Step num={6} title="Computer Options" kw="COMP">
          <ChildTable
            title="COMPUTERS (MAX 2)"
            items={computerRows}
            onChange={setComputerRows}
            maxItems={2}
            columns={[
              { key: 'name', label: 'MODEL', editable: true, type: 'text' },
              { key: 'dtons', label: 'DTONS', editable: true, type: 'number', width: 'w-20' },
              { key: 'cost', label: 'COST', editable: true, type: 'number', width: 'w-24' },
              { key: 'qty', label: 'QTY', editable: true, type: 'number', width: 'w-14' },
            ]}
            createNewItem={() => ({
              id: `comp-${Date.now()}`,
              name: 'Model 1',
              dtons: 1,
              cost: 30000,
              qty: 1,
            })}
            addButtonLabel="ADD COMPUTER"
          />
          <div style={{ marginTop: 12 }}>
            <ShField
              label="QUICK ADD COMPUTER"
              value=""
              options={[{ value: '', label: '— SELECT FROM TABLE —' }, ...computers.map((c: Record<string, unknown>) => ({
                value: String(c['Model']),
                label: `${String(c['Model'])} · ${fmtCost(Number(c['Cost'] || 0))} · TL${Number(c['TL'])}`,
              }))]}
              onChange={(v) => {
                if (!v) return;
                const c = computers.find((comp: Record<string, unknown>) => String(comp['Model']) === v);
                if (c) {
                  setComputerRows(prev => [...prev, {
                    id: `comp-${Date.now()}`,
                    name: String(c['Model']),
                    dtons: 1,
                    cost: Number(c['Cost'] || 0),
                    qty: 1,
                    tl: Number(c['TL'] || 7),
                  }]);
                }
              }}
            />
          </div>
        </Step>

        {/* Step 7: Software */}
        <Step num={7} title="Software" kw="SW">
          <ChildTable
            title="SOFTWARE PROGRAMS"
            items={softwareRows}
            onChange={setSoftwareRows}
            columns={[
              { key: 'name', label: 'PROGRAM', editable: true, type: 'text' },
              { key: 'tl', label: 'TL', editable: true, type: 'number', width: 'w-14' },
              { key: 'cost', label: 'COST', editable: true, type: 'number', width: 'w-24' },
              { key: 'qty', label: 'QTY', editable: true, type: 'number', width: 'w-14' },
            ]}
            createNewItem={() => ({
              id: `sw-${Date.now()}`,
              name: 'Jump Control',
              dtons: 0,
              cost: 0,
              qty: 1,
              tl: tl,
            })}
            addButtonLabel="ADD SOFTWARE"
          />
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {jDrive && jumpParsecs > 0 && (
              <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.glow, border: `1px solid ${colors.glow}44`, padding: '4px 8px', background: `${colors.glow}10` }}>
                JUMP CONTROL REQUIRED
              </span>
            )}
            <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.good, border: `1px solid ${colors.good}44`, padding: '4px 8px', background: `${colors.good}10` }}>
              SECURITY TL{tl}
            </span>
            {selectedWeapons.length > 0 && (
              <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.amber, border: `1px solid ${colors.amber}44`, padding: '4px 8px', background: `${colors.amber}10` }}>
                FIRE CONTROL RECOMMENDED
              </span>
            )}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${colors.hair}` }}>
            <ShLabel size={12} dim>LEGACY SOFTWARE SELECTION</ShLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 192, overflowY: 'auto', marginTop: 8 }}>
              {software.map((sw: Record<string, unknown>, i: number) => {
                const swName = String(sw['Program'] || '');
                const isSelected = softwareList.includes(swName);
                return (
                  <label key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px',
                    cursor: 'pointer',
                    fontFamily: fonts.mono,
                    fontSize: 13,
                    border: `1px solid ${isSelected ? colors.glow : colors.hair}`,
                    background: isSelected ? `${colors.glow}10` : colors.panelAlt,
                    color: isSelected ? colors.glow : colors.inkSoft,
                  }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setSoftwareList(prev => isSelected ? prev.filter(s => s !== swName) : [...prev, swName]);
                      }}
                      style={{ accentColor: colors.glow }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{swName}</div>
                      <div style={{ fontSize: 11, color: colors.inkDim }}>TL {Number(sw['TL'])} · {String(sw['Cost (MCr)'])}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </Step>

        {/* Step 8: Sensors */}
        <Step num={8} title="Sensors" kw="SNS">
          <ChildTable
            title="SENSOR SYSTEMS"
            items={sensorRows}
            onChange={setSensorRows}
            columns={[
              { key: 'name', label: 'SENSOR', editable: true, type: 'text' },
              { key: 'dtons', label: 'DTONS', editable: true, type: 'number', width: 'w-20' },
              { key: 'cost', label: 'COST', editable: true, type: 'number', width: 'w-24' },
              { key: 'qty', label: 'QTY', editable: true, type: 'number', width: 'w-14' },
            ]}
            createNewItem={() => ({
              id: `sensor-${Date.now()}`,
              name: 'Standard Sensors',
              dtons: 0,
              cost: 0,
              qty: 1,
            })}
            addButtonLabel="ADD SENSOR"
          />
          <div style={{ marginTop: 12 }}>
            <ShField
              label="QUICK ADD SENSOR"
              value=""
              options={[{ value: '', label: '— SELECT FROM TABLE —' }, ...sensorList.map((s: Record<string, unknown>) => ({
                value: String(s['Sensors']),
                label: `${String(s['Sensors'])} · ${fmtTons(Number(s['Tons'] || 0))} · ${fmtCost(Number(s['Cost'] || 0))} · TL${Number(s['TL'] || 8)}`,
              }))]}
              onChange={(v) => {
                if (!v) return;
                const s = sensorList.find((sen: Record<string, unknown>) => String(sen['Sensors']) === v);
                if (s) {
                  setSensorRows(prev => [...prev, {
                    id: `sensor-${Date.now()}`,
                    name: String(s['Sensors']),
                    dtons: Number(s['Tons'] || 0),
                    cost: Number(s['Cost'] || 0),
                    qty: 1,
                    tl: Number(s['TL'] || 8),
                  }]);
                }
              }}
            />
          </div>
        </Step>

        {/* Step 9: Life Support */}
        <Step num={9} title="Life Support & Facilities" kw="LSS">
          <ChildTable
            title="LIFE SUPPORT FACILITIES"
            items={lifeSupportRows}
            onChange={setLifeSupportRows}
            columns={[
              { key: 'name', label: 'FACILITY', editable: true, type: 'text' },
              { key: 'dtons', label: 'DTONS', editable: true, type: 'number', width: 'w-20' },
              { key: 'cost', label: 'COST', editable: true, type: 'number', width: 'w-24' },
              { key: 'qty', label: 'QTY', editable: true, type: 'number', width: 'w-14' },
            ]}
            createNewItem={() => ({
              id: `ls-${Date.now()}`,
              name: 'Stateroom',
              dtons: 4,
              cost: 500000,
              qty: 1,
            })}
            addButtonLabel="ADD FACILITY"
          />
          <div style={{ marginTop: 12 }}>
            <ShField
              label="QUICK ADD FACILITY"
              value=""
              options={[{ value: '', label: '— SELECT FROM TABLE —' }, ...(tables.life_support?.rows || []).map((l: Record<string, unknown>) => ({
                value: String(l['LIFE SUPPORT']),
                label: `${String(l['LIFE SUPPORT'])} · ${fmtTons(Number(l['DTONS'] || 0))} · ${fmtCost(Number(l['COST'] || 0))} · TL${Number(l['TL'] || 7)}`,
              }))]}
              onChange={(v) => {
                if (!v) return;
                const ls = tables.life_support?.rows?.find((l: Record<string, unknown>) => String(l['LIFE SUPPORT']) === v);
                if (ls) {
                  setLifeSupportRows(prev => [...prev, {
                    id: `ls-${Date.now()}`,
                    name: String(ls['LIFE SUPPORT']),
                    dtons: Number(ls['DTONS'] || 0),
                    cost: Number(ls['COST'] || 0),
                    qty: 1,
                    tl: Number(ls['TL'] || 7),
                  }]);
                }
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${colors.hair}` }}>
            <ShField label="STATEROOMS (LEGACY)" value={staterooms} type="number" onChange={(v) => setStaterooms(Number(v))} />
            <ShField label="LOW BERTHS (LEGACY)" value={lowBerths} type="number" onChange={(v) => setLowBerths(Number(v))} />
          </div>
        </Step>

        {/* Step 10: Modules */}
        <Step num={10} title="Modules (No Life Support)" kw="MOD">
          <ChildTable
            title="MODULES"
            items={moduleRows}
            onChange={setModuleRows}
            columns={[
              { key: 'name', label: 'MODULE', editable: true, type: 'text' },
              { key: 'dtons', label: 'DTONS', editable: true, type: 'number', width: 'w-20' },
              { key: 'cost', label: 'COST', editable: true, type: 'number', width: 'w-24' },
              { key: 'qty', label: 'QTY', editable: true, type: 'number', width: 'w-14' },
            ]}
            createNewItem={() => ({
              id: `mod-${Date.now()}`,
              name: 'Fuel Scoops',
              dtons: 0,
              cost: 1000000,
              qty: 1,
            })}
            addButtonLabel="ADD MODULE"
          />
          <div style={{ marginTop: 12 }}>
            <ShField
              label="QUICK ADD MODULE"
              value=""
              options={[{ value: '', label: '— SELECT FROM TABLE —' }, ...modules.map((m: Record<string, unknown>) => ({
                value: String(m['MODULES'] || m['Module']),
                label: `${String(m['MODULES'] || m['Module'])} · ${fmtTons(Number(m['DTONS'] || m['Dtons'] || 0))} · ${fmtCost(Number(m['COST'] || m['Cost'] || 0))} · TL${Number(m['TL'] || 7)}`,
              }))]}
              onChange={(v) => {
                if (!v) return;
                const m = modules.find((mod: Record<string, unknown>) => String(mod['MODULES'] || mod['Module']) === v);
                if (m) {
                  setModuleRows(prev => [...prev, {
                    id: `mod-${Date.now()}`,
                    name: String(m['MODULES'] || m['Module']),
                    dtons: Number(m['DTONS'] || m['Dtons'] || 0),
                    cost: Number(m['COST'] || m['Cost'] || 0),
                    qty: 1,
                    tl: Number(m['TL'] || 7),
                  }]);
                }
              }}
            />
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${colors.hair}` }}>
            <ShLabel size={12} dim>LEGACY MODULE SELECTION</ShLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 192, overflowY: 'auto', marginTop: 8 }}>
              {modules.map((mod: Record<string, unknown>, i: number) => {
                const modName = String(mod['MODULES'] || mod['Module'] || '');
                const selected = selectedModules.find(m => m.id === modName);
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px',
                    background: colors.panelAlt,
                    border: `1px solid ${colors.hair}`,
                    fontFamily: fonts.mono,
                    fontSize: 13,
                    color: colors.inkSoft,
                  }}>
                    <input
                      type="checkbox"
                      checked={!!selected}
                      onChange={() => {
                        setSelectedModules(prev => {
                          const exists = prev.find(m => m.id === modName);
                          if (exists) return prev.filter(m => m.id !== modName);
                          return [...prev, { id: modName, qty: 1 }];
                        });
                      }}
                      style={{ accentColor: colors.glow }}
                    />
                    <span style={{ flex: 1 }}>{modName}</span>
                    {selected && (
                      <input
                        type="number"
                        min={1}
                        value={selected.qty}
                        onChange={(e) => {
                          setSelectedModules(prev => prev.map(m => m.id === modName ? { ...m, qty: Math.max(1, Number(e.target.value)) } : m));
                        }}
                        style={{
                          width: 56,
                          padding: '4px 6px',
                          background: colors.panel,
                          border: `1px solid ${colors.hair}`,
                          color: colors.ink,
                          fontFamily: fonts.mono,
                          fontSize: 12,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Step>

        {/* Step 11: Weapons */}
        <Step num={11} title="Weapons, Turrets & Hardmounts" kw="WPN">
          <ChildTable
            title="WEAPON MOUNTS"
            items={weaponMountRows}
            onChange={setWeaponMountRows}
            columns={[
              { key: 'name', label: 'MOUNT', editable: true, type: 'text' },
              { key: 'dtons', label: 'DTONS', editable: true, type: 'number', width: 'w-20' },
              { key: 'cost', label: 'COST', editable: true, type: 'number', width: 'w-24' },
              { key: 'qty', label: 'QTY', editable: true, type: 'number', width: 'w-14' },
            ]}
            createNewItem={() => ({
              id: `mount-${Date.now()}`,
              name: 'Turret, Single',
              dtons: 1,
              cost: 200000,
              qty: 1,
            })}
            addButtonLabel="ADD MOUNT"
          />
          <div style={{ marginTop: 12 }}>
            <ShField
              label="QUICK ADD MOUNT"
              value=""
              options={[{ value: '', label: '— SELECT FROM TABLE —' }, ...weapons.filter((w: Record<string, unknown>) => {
                const wpn = String(w['WEAPONS']);
                return wpn.includes('Turret') || wpn.includes('Bay') || wpn.includes('Hard');
              }).map((w: Record<string, unknown>) => ({
                value: String(w['WEAPONS']),
                label: `${String(w['WEAPONS'])} · ${fmtTons(Number(w['DTONS'] || 0))} · ${fmtCost(Number(w['COST'] || 0))} · TL${Number(w['TL'] || 7)}`,
              }))]}
              onChange={(v) => {
                if (!v) return;
                const w = weapons.find((wpn: Record<string, unknown>) => String(wpn['WEAPONS']).includes('Turret') && String(wpn['WEAPONS']) === v);
                if (w) {
                  setWeaponMountRows(prev => [...prev, {
                    id: `mount-${Date.now()}`,
                    name: String(w['WEAPONS']),
                    dtons: Number(w['DTONS'] || 0),
                    cost: Number(w['COST'] || 0),
                    qty: 1,
                    tl: Number(w['TL'] || 7),
                  }]);
                }
              }}
            />
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${colors.hair}` }}>
            <ShLabel size={12} dim>LEGACY WEAPON SELECTION</ShLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 192, overflowY: 'auto', marginTop: 8 }}>
              {weapons.map((wpn: Record<string, unknown>, i: number) => {
                const wpnName = String(wpn['WEAPONS'] || '');
                const selected = selectedWeapons.find(w => w.id === wpnName);
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px',
                    background: colors.panelAlt,
                    border: `1px solid ${colors.hair}`,
                    fontFamily: fonts.mono,
                    fontSize: 13,
                    color: colors.inkSoft,
                  }}>
                    <input
                      type="checkbox"
                      checked={!!selected}
                      onChange={() => {
                        setSelectedWeapons(prev => {
                          const exists = prev.find(w => w.id === wpnName);
                          if (exists) return prev.filter(w => w.id !== wpnName);
                          return [...prev, { id: wpnName, qty: 1 }];
                        });
                      }}
                      style={{ accentColor: colors.glow }}
                    />
                    <span style={{ flex: 1 }}>{wpnName}</span>
                    {selected && (
                      <input
                        type="number"
                        min={1}
                        value={selected.qty}
                        onChange={(e) => {
                          setSelectedWeapons(prev => prev.map(w => w.id === wpnName ? { ...w, qty: Math.max(1, Number(e.target.value)) } : w));
                        }}
                        style={{
                          width: 56,
                          padding: '4px 6px',
                          background: colors.panel,
                          border: `1px solid ${colors.hair}`,
                          color: colors.ink,
                          fontFamily: fonts.mono,
                          fontSize: 12,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Step>

        {/* Step 12: Cargo */}
        <Step num={12} title="Cargo & Supplies" kw="CRG">
          <div style={{ display: 'flex', gap: 14 }}>
            <ShField label="CARGO HOLD (DT)" value={cargo} type="number" onChange={(v) => setCargo(Number(v))} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <ShData size={12} dim>// CARGO HAS NO LIFE SUPPORT · VACC SUITS REQUIRED</ShData>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <ChildTable
              title="SUPPLIES IN CARGO"
              items={supplyRows}
              onChange={setSupplyRows}
              columns={[
                { key: 'name', label: 'SUPPLY', editable: true, type: 'text' },
                { key: 'dtons', label: 'DTONS', editable: true, type: 'number', width: 'w-20' },
                { key: 'cost', label: 'COST', editable: true, type: 'number', width: 'w-24' },
                { key: 'qty', label: 'QTY', editable: true, type: 'number', width: 'w-14' },
              ]}
              createNewItem={() => ({
                id: `supply-${Date.now()}`,
                name: 'Missile Pack',
                dtons: 1,
                cost: 15000,
                qty: 1,
              })}
              addButtonLabel="ADD SUPPLY"
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <ShField
              label="QUICK ADD SUPPLY"
              value=""
              options={[{ value: '', label: '— SELECT FROM TABLE —' }, ...(tables.ship_supplies?.rows || []).map((s: Record<string, unknown>) => ({
                value: String(s['Supply']),
                label: `${String(s['Supply'])} · ${fmtTons(Number(s['Dtons'] || 0))} · ${fmtCost(Number(s['Cost'] || 0))} · TL${Number(s['TL'] || 6)}`,
              }))]}
              onChange={(v) => {
                if (!v) return;
                const s = tables.ship_supplies?.rows?.find((sup: Record<string, unknown>) => String(sup['Supply']) === v);
                if (s) {
                  setSupplyRows(prev => [...prev, {
                    id: `supply-${Date.now()}`,
                    name: String(s['Supply']),
                    dtons: Number(s['Dtons'] || 0),
                    cost: Number(s['Cost'] || 0),
                    qty: 1,
                    tl: Number(s['TL'] || 6),
                  }]);
                }
              }}
            />
          </div>
        </Step>

        {/* Step 13: Crew */}
        <Step num={13} title="Crew Requirements (CE)" kw="CREW" defaultOpen={false}>
          {crewReqs ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  ['MINIMUM CREW', String(crewReqs.totalMinimum), colors.glow],
                  ['FULL COMPLEMENT', String(crewReqs.totalFull), colors.glowSoft],
                  ['MONTHLY PAYROLL', `${(crewReqs.monthlySalary / 1000).toFixed(0)}K CR`, colors.amber],
                ].map(([label, val, c]) => (
                  <div key={label} style={{ border: `1px solid ${colors.hair}`, padding: '12px 14px', background: colors.panelAlt }}>
                    <ShLabel size={11} dim>{label}</ShLabel>
                    <div style={{ marginTop: 4 }}>
                      <ShNum size={28} color={c as string}>{val}</ShNum>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: fonts.mono, fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: `1px solid ${colors.hair}`, color: colors.inkDim, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>POSITION</th>
                      <th style={{ textAlign: 'center', padding: '8px 0', borderBottom: `1px solid ${colors.hair}`, color: colors.inkDim, fontSize: 11 }}>MIN</th>
                      <th style={{ textAlign: 'center', padding: '8px 0', borderBottom: `1px solid ${colors.hair}`, color: colors.inkDim, fontSize: 11 }}>FULL</th>
                      <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: `1px solid ${colors.hair}`, color: colors.inkDim, fontSize: 11 }}>SALARY/MO</th>
                      <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: `1px solid ${colors.hair}`, color: colors.inkDim, fontSize: 11 }}>SHIFT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crewReqs.positions.map((p, i) => (
                      <tr key={i} style={{ color: p.minimum > 0 ? colors.inkSoft : colors.inkDim }}>
                        <td style={{ padding: '6px 0', borderBottom: `1px dotted ${colors.hairFaint}` }}>{p.position}</td>
                        <td style={{ padding: '6px 0', borderBottom: `1px dotted ${colors.hairFaint}`, textAlign: 'center' }}>{p.minimum}</td>
                        <td style={{ padding: '6px 0', borderBottom: `1px dotted ${colors.hairFaint}`, textAlign: 'center' }}>{p.fullComplement}</td>
                        <td style={{ padding: '6px 0', borderBottom: `1px dotted ${colors.hairFaint}`, textAlign: 'right' }}>{fmtNumber(p.salary)} CR</td>
                        <td style={{ padding: '6px 0', borderBottom: `1px dotted ${colors.hairFaint}`, textAlign: 'right' }}>{fmtNumber(p.shiftPay)} CR</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <ShData size={13} dim>// SELECT A HULL TO CALCULATE CREW REQUIREMENTS</ShData>
          )}
        </Step>
      </div>

      {/* RIGHT: Summary Panel */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <BOQView
          components={components}
          totalCost={totalCost}
          hullDtons={hullDtons}
          usedTons={allocatedTons}
          availableDtons={availableDtons}
        />

        {hullDtons > 0 && (
          <ShPanel no="SHEET 03" title="Mneme Combat" kw="MAC">
            <MnemeCombatPanel ship={{
              id: 'preview', name, tl, hullCode, hullDtons, configuration: config,
              armor: armorRows.map(r => r.name).join(', ') || 'None',
              armorQty: armorRows.reduce((s, r) => s + r.qty, 0),
              bridge, computer, software: softwareList,
              sensors, staterooms, lowBerths,
              crew: [], modules: moduleComponents, weapons: weaponComponents,
              cargo, components, totalCost, availableDtons,
              createdAt: new Date().toISOString(),
            }} />
          </ShPanel>
        )}

        {/* Ship Library Quick List */}
        {ships.length > 0 && (
          <ShPanel no="SHEET 04" title="Ship Library" kw="LIB">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
              {ships.map((ship) => (
                <div key={ship.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: colors.panelAlt,
                  border: `1px solid ${colors.hair}`,
                }}>
                  <button onClick={() => loadShip(ship)} style={{ textAlign: 'left', flex: 1, background: 'transparent', border: 'none', cursor: 'pointer', color: colors.inkSoft, fontFamily: fonts.mono, fontSize: 13 }}>
                    <div style={{ fontWeight: 600, color: colors.ink }}>{ship.name}</div>
                    <div style={{ fontSize: 11, color: colors.inkDim, marginTop: 2 }}>{fmtTons(ship.hullDtons)} · TL{ship.tl} · {fmtCost(ship.totalCost)}</div>
                  </button>
                  <button
                    onClick={() => deleteShip(ship.id)}
                    style={{ padding: 6, background: 'transparent', border: 'none', color: colors.inkDim, cursor: 'pointer' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.warn; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = colors.inkDim; }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </ShPanel>
        )}
      </aside>
    </div>
  );
}
