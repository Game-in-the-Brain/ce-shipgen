import { useState, useMemo, useEffect } from 'react';
import { useTableStore } from '../store/tableStore';
import { CollapsibleSection } from './CollapsibleSection';
import { BOQView } from './BOQView';
import { ChildTable } from './ChildTable';
import { MnemeCombatPanel } from './MnemeCombatPanel';
import { downloadJson, generateSnapshotName } from '../utils/exportImport';
import {
  calcArmorTonnage, calcArmorCost, calcJumpFuel, calcPowerFuel,
  getMinPowerPlantLetter, calcStateroomTonnage, calcStateroomCost,
  calcLowBerthTonnage, calcLowBerthCost, calcCrewRequirements,
} from '../calculations';
import { validateShip } from '../validations';
import { Save, Calculator, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
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

// ─── Component ───

export function ShipDesigner() {
  const tables = useTableStore((s) => s.tables);
  const addShip = useTableStore((s) => s.addShip);
  const ships = useTableStore((s) => s.ships);
  const updateShip = useTableStore((s) => s.updateShip);
  const deleteShip = useTableStore((s) => s.deleteShip);
  const setCurrentShip = useTableStore((s) => s.setCurrentShip);
  const currentShip = useTableStore((s) => s.currentShip);

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
    // Crew costs (monthly salaries as a one-line summary, not tonnage)
    if (crewReqs) {
      list.push({ section: 'Crew', module: `Minimum Crew (${crewReqs.totalMinimum})`, dtons: 0, cost: 0 });
      crewReqs.positions.forEach(p => {
        if (p.fullComplement > 0) {
          list.push({ section: 'Crew', module: `${p.position} ×${p.fullComplement}`, dtons: 0, cost: p.salary * p.fullComplement, notes: `${p.salary.toLocaleString()} Cr/mo each` });
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
    // Legacy armor load
    if (ship.armor && ship.armor !== 'None') {
      setArmorRows([{ id: `armor-${Date.now()}`, name: ship.armor, dtons: 0, cost: 0, qty: ship.armorQty || 1 }]);
    } else {
      setArmorRows([]);
    }
    // armorRows is the new state
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

  // ─── Render ───
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ship Designer</h1>
          <div className="flex gap-2">
            <button onClick={saveShip} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> {currentShip ? 'Update' : 'Save'}
            </button>
            {currentShip && (
              <button onClick={exportShip} className="btn-secondary flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Export
              </button>
            )}
            <button onClick={resetDesigner} className="btn-secondary flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* Validation */}
        {validation && (
          <div className={`rounded-lg p-3 text-sm ${validation.valid ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
            <div className="flex items-center gap-2 font-semibold mb-1">
              {validation.valid ? <CheckCircle size={16} className="text-green-400"/> : <AlertTriangle size={16} className="text-red-400"/>}
              <span className={validation.valid ? 'text-green-300' : 'text-red-300'}>
                {validation.valid ? 'Design Valid' : `${validation.hardErrors.length} Issue${validation.hardErrors.length > 1 ? 's' : ''}`}
              </span>
            </div>
            {!validation.valid && (
              <ul className="list-disc list-inside text-red-200 space-y-0.5">
                {validation.hardErrors.map((err: {message: string}, i: number) => (
                  <li key={i}>{err.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Available DTons Summary */}
        {hullDtons > 0 && (
          <div className="tile">
            <div className="tile-header">
              <span className="font-semibold">Tonnage Budget</span>
              <span className={`text-sm font-medium ${availableDtons < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {availableDtons.toFixed(1)} DT available / {hullDtons} DT total
              </span>
            </div>
            <div className="tile-content">
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${availableDtons < 0 ? 'bg-red-500' : availableDtons < hullDtons * 0.1 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, (allocatedTons / hullDtons) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Allocated: {allocatedTons.toFixed(1)} DT</span>
                <span>{((allocatedTons / hullDtons) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* 1. Basic Info */}
        <CollapsibleSection title="1. Basic Info" defaultOpen>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Ship Name</label>
              <input className="input w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder={hullDtons > 0 ? generateShipName(hullDtons) : 'Ship Name'} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Tech Level</label>
              <input className="input w-full" type="number" min={6} max={15} value={tl} onChange={(e) => setTl(Number(e.target.value))} />
            </div>
          </div>
        </CollapsibleSection>

        {/* 2. Hull & Configuration */}
        <CollapsibleSection title="2. Hull & Configuration" defaultOpen>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Hull Size</label>
              <select className="input w-full" value={hullCode} onChange={(e) => setHullCode(e.target.value)}>
                <option value="">Select Hull...</option>
                {hulls.map((h: Record<string, unknown>, i: number) => (
                  <option key={i} value={String(h['DTONS'])}>
                    {String(h['DTONS'])} DT — {Number(h['COST']).toLocaleString()} Cr
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Configuration</label>
              <select className="input w-full" value={config} onChange={(e) => setConfig(e.target.value)}>
                {configs.map((c: Record<string, unknown>, i: number) => (
                  <option key={i} value={String(c['Configuration'])}>
                    {String(c['Configuration'])} {Number(c['Hull Cost Modifier']) > 0 ? '+' : ''}{Number(c['Hull Cost Modifier']) * 100}%
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CollapsibleSection>

        {/* 3. Armor */}
        <CollapsibleSection title="3. Armor" defaultOpen>
          <ChildTable
            title="Armor Layers"
            items={armorRows}
            onChange={setArmorRows}
            columns={[
              { key: 'name', label: 'Type', editable: true, type: 'text' },
              { key: 'qty', label: 'Layers', editable: true, type: 'number', width: 'w-20' },
            ]}
            createNewItem={() => ({
              id: `armor-${Date.now()}`,
              name: 'Titanium Steel TL7+',
              dtons: 0,
              cost: 0,
              qty: 1,
            })}
            addButtonLabel="Add Armor Layer"
          />

          <div className="pt-2 border-t border-slate-700">
            <label className="block text-sm text-slate-400 mb-1">Quick Add Armor</label>
            <select
              className="input w-full"
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                const a = armors.find((ar: Record<string, unknown>) => String(ar['Armor Type']) === e.target.value);
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
                e.target.value = '';
              }}
            >
              <option value="">Select from table...</option>
              {armors.map((a: Record<string, unknown>, i: number) => (
                <option key={i} value={String(a['Armor Type'])}>
                  {String(a['Armor Type'])} — Prot {Number(a['Prot'] || a['Protection'] || 0)} | TL {Number(a['TL'])}
                </option>
              ))}
            </select>
          </div>

          {armorTons > 0 && (
            <div className="mt-2 text-sm text-slate-400">
              Total Armor: {armorTons.toFixed(1)} DT | Cost: {armorCost.toLocaleString()} Cr
            </div>
          )}
        </CollapsibleSection>

        {/* 4. Drives & Power */}
        <CollapsibleSection title="4. Drives & Power" defaultOpen>
          <div className="space-y-4">
            {/* M-Drive */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">M-Drive (Thrust)</label>
              <select className="input w-full" value={mDrive} onChange={(e) => setMDrive(e.target.value)}>
                <option value="">None</option>
                {validMDrives.map((d: Record<string, unknown>, i: number) => (
                  <option key={i} value={String(d['Drive Code'])}>
                    {String(d['Drive Code'])} — {String(d['M-Drive\n Tons'])} DT
                  </option>
                ))}
              </select>
              {mDrive && (
                <div className="text-xs mt-1 text-slate-500">
                  {mDriveTons} DT | {mDriveCost.toLocaleString()} Cr
                </div>
              )}
            </div>

            {/* Jump Drive */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Jump Parsecs</label>
                <select className="input w-full" value={jumpParsecs} onChange={(e) => setJumpParsecs(Number(e.target.value))}>
                  {[0,1,2,3,4,5,6].map((n) => (
                    <option key={n} value={n}>{n === 0 ? '0 (None)' : n}</option>
                  ))}
                </select>
                {jumpParsecs > 0 && tl < 9 && (
                  <div className="text-xs mt-1 text-red-400">Jump requires TL 9+</div>
                )}
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">J-Drive</label>
                <select className="input w-full" value={jDrive} onChange={(e) => setJDrive(e.target.value)} disabled={jumpParsecs === 0}>
                  <option value="">{jumpParsecs === 0 ? 'N/A' : 'None'}</option>
                  {validJDrives.map((d: Record<string, unknown>, i: number) => (
                    <option key={i} value={String(d['Drive Code'])}>
                      {String(d['Drive Code'])} — {String(d['J-Drive\n Tons'])} DT
                    </option>
                  ))}
                </select>
                {jDrive && jumpParsecs > 0 && (
                  <div className="text-xs mt-1 text-slate-500">
                    {jDriveTons} DT | {jDriveCost.toLocaleString()} Cr
                  </div>
                )}
              </div>
            </div>

            {/* Power Plant */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Power Plant</label>
              <select className="input w-full" value={powerPlant} onChange={(e) => setPowerPlant(e.target.value)}>
                <option value="">None</option>
                {validPPs.map((d: Record<string, unknown>, i: number) => (
                  <option key={i} value={String(d['Drive Code'])}>
                    {String(d['Drive Code'])} — {String(d['P-Plant\n Tons'])} DT
                  </option>
                ))}
              </select>
              {mDrive && jDrive && powerPlant && (
                <div className={`text-xs mt-1 flex items-center gap-1 ${
                  getMinPowerPlantLetter(mDrive, jDrive) <= powerPlant ? 'text-green-400' : 'text-red-400'
                }`}>
                  {getMinPowerPlantLetter(mDrive, jDrive) <= powerPlant ? <CheckCircle size={12}/> : <AlertTriangle size={12}/>}
                  PP ≥ {getMinPowerPlantLetter(mDrive, jDrive)} required
                </div>
              )}
              {ppTons > 0 && (
                <div className="text-xs mt-1 text-slate-500">
                  {ppTons} DT | {ppCost.toLocaleString()} Cr | Fuel/Wk: {ppFuelWk} tons
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* 5. Command & Control */}
        <CollapsibleSection title="5. Command & Control" defaultOpen>
          <div className="space-y-3">
            <div className="text-xs text-slate-500">
              {hullDtons <= 90
                ? 'Small craft: Cockpit options available. Ships ≤90 DT use cockpits.'
                : 'Ship size: Bridge options available. Ships >90 DT require bridges.'}
            </div>

            <ChildTable
              title="Bridges / Cockpits / Cabins"
              items={commandRows}
              onChange={setCommandRows}
              columns={[
                { key: 'name', label: 'Type', editable: true, type: 'text' },
                { key: 'dtons', label: 'DTons', editable: true, type: 'number', width: 'w-20' },
                { key: 'cost', label: 'Cost', editable: true, type: 'number', width: 'w-24' },
                { key: 'qty', label: 'Qty', editable: true, type: 'number', width: 'w-14' },
              ]}
              createNewItem={() => {
                const isSmall = hullDtons <= 90;
                const defaultBridge = isSmall
                  ? smallCraftBridges[0]
                  : shipBridges[0];
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
              addButtonLabel="Add Bridge/Cockpit"
            />

            {/* Legacy bridge selector for quick pick */}
            <div className="pt-2 border-t border-slate-700">
              <label className="block text-sm text-slate-400 mb-1">Quick Add Bridge/Cockpit</label>
              <select
                className="input w-full"
                value=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  const b = bridges.find((br: Record<string, unknown>) => String(br['CONTROLS/BRidge'] || br['Bridge Size'] || br['WEAPONS']) === e.target.value);
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
                  e.target.value = '';
                }}
              >
                <option value="">Select from table...</option>
                {availableBridges.map((b: Record<string, unknown>, i: number) => (
                  <option key={i} value={String(b['CONTROLS/BRidge'] || b['Bridge Size'] || b['WEAPONS'])}>
                    {String(b['CONTROLS/BRidge'] || b['Bridge Size'] || b['WEAPONS'])} — {Number(b['CONTROLS/ BRIDGE'] || b['DTONS'] || b['Tons'] || 0)} DT
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CollapsibleSection>

        {/* 6. Computer Options */}
        <CollapsibleSection title="6. Computer Options" defaultOpen>
          <ChildTable
            title="Computers (Max 2)"
            items={computerRows}
            onChange={setComputerRows}
            maxItems={2}
            columns={[
              { key: 'name', label: 'Model', editable: true, type: 'text' },
              { key: 'dtons', label: 'DTons', editable: true, type: 'number', width: 'w-20' },
              { key: 'cost', label: 'Cost', editable: true, type: 'number', width: 'w-24' },
              { key: 'qty', label: 'Qty', editable: true, type: 'number', width: 'w-14' },
            ]}
            createNewItem={() => ({
              id: `comp-${Date.now()}`,
              name: 'Model 1',
              dtons: 1,
              cost: 30000,
              qty: 1,
            })}
            addButtonLabel="Add Computer"
          />

          <div className="pt-2 border-t border-slate-700">
            <label className="block text-sm text-slate-400 mb-1">Quick Add Computer</label>
            <select
              className="input w-full"
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                const c = computers.find((comp: Record<string, unknown>) => String(comp['Model']) === e.target.value);
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
                e.target.value = '';
              }}
            >
              <option value="">Select from table...</option>
              {computers.map((c: Record<string, unknown>, i: number) => (
                <option key={i} value={String(c['Model'])}>
                  {String(c['Model'])} — TL {Number(c['TL'])} | Rating {Number(c['Rating'])} | {Number(c['Cost']).toLocaleString()} Cr
                </option>
              ))}
            </select>
          </div>
        </CollapsibleSection>

        {/* 7. Software */}
        <CollapsibleSection title="7. Software" defaultOpen>
          <ChildTable
            title="Software Programs"
            items={softwareRows}
            onChange={setSoftwareRows}
            columns={[
              { key: 'name', label: 'Program', editable: true, type: 'text' },
              { key: 'tl', label: 'TL', editable: true, type: 'number', width: 'w-14' },
              { key: 'cost', label: 'Cost', editable: true, type: 'number', width: 'w-24' },
              { key: 'qty', label: 'Qty', editable: true, type: 'number', width: 'w-14' },
            ]}
            createNewItem={() => ({
              id: `sw-${Date.now()}`,
              name: 'Jump Control',
              dtons: 0,
              cost: 0,
              qty: 1,
              tl: tl,
            })}
            addButtonLabel="Add Software"
          />

          {/* Auto software flags */}
          <div className="flex gap-2 mt-2">
            {jDrive && jumpParsecs > 0 && (
              <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">Jump Control required</span>
            )}
            <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">Security TL{tl}</span>
            {selectedWeapons.length > 0 && (
              <span className="text-xs bg-amber-900/30 text-amber-400 px-2 py-1 rounded">Fire Control recommended</span>
            )}
          </div>

          {/* Legacy software toggle */}
          <div className="pt-3 border-t border-slate-700">
            <label className="block text-sm text-slate-400 mb-2">Legacy Software Selection</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {software.map((sw: Record<string, unknown>, i: number) => {
                const swName = String(sw['Program'] || '');
                const isSelected = softwareList.includes(swName);
                return (
                  <label key={i} className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${isSelected ? 'bg-blue-900/20 border border-blue-700' : 'bg-slate-800/50 border border-slate-700'}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setSoftwareList(prev => isSelected ? prev.filter(s => s !== swName) : [...prev, swName]);
                      }}
                      className="rounded border-slate-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{swName}</div>
                      <div className="text-xs text-slate-500">TL {Number(sw['TL'])} | {String(sw['Cost (MCr)'])}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </CollapsibleSection>

        {/* 8. Sensors */}
        <CollapsibleSection title="8. Sensors" defaultOpen>
          <ChildTable
            title="Sensor Systems"
            items={sensorRows}
            onChange={setSensorRows}
            columns={[
              { key: 'name', label: 'Sensor', editable: true, type: 'text' },
              { key: 'dtons', label: 'DTons', editable: true, type: 'number', width: 'w-20' },
              { key: 'cost', label: 'Cost', editable: true, type: 'number', width: 'w-24' },
              { key: 'qty', label: 'Qty', editable: true, type: 'number', width: 'w-14' },
            ]}
            createNewItem={() => ({
              id: `sensor-${Date.now()}`,
              name: 'Standard Sensors',
              dtons: 0,
              cost: 0,
              qty: 1,
            })}
            addButtonLabel="Add Sensor"
          />

          <div className="pt-2 border-t border-slate-700">
            <label className="block text-sm text-slate-400 mb-1">Quick Add Sensor</label>
            <select
              className="input w-full"
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                const s = sensorList.find((sen: Record<string, unknown>) => String(sen['Sensors']) === e.target.value);
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
                e.target.value = '';
              }}
            >
              <option value="">Select from table...</option>
              {sensorList.map((s: Record<string, unknown>, i: number) => (
                <option key={i} value={String(s['Sensors'])}>
                  {String(s['Sensors'])} — {Number(s['Tons'])} DT | DM {String(s['DM'])} | {Number(s['Cost']).toLocaleString()} Cr
                </option>
              ))}
            </select>
          </div>
        </CollapsibleSection>

        {/* 9. Life Support */}
        <CollapsibleSection title="9. Life Support & Facilities" defaultOpen>
          <ChildTable
            title="Life Support Facilities"
            items={lifeSupportRows}
            onChange={setLifeSupportRows}
            columns={[
              { key: 'name', label: 'Facility', editable: true, type: 'text' },
              { key: 'dtons', label: 'DTons', editable: true, type: 'number', width: 'w-20' },
              { key: 'cost', label: 'Cost', editable: true, type: 'number', width: 'w-24' },
              { key: 'qty', label: 'Qty', editable: true, type: 'number', width: 'w-14' },
            ]}
            createNewItem={() => ({
              id: `ls-${Date.now()}`,
              name: 'Stateroom',
              dtons: 4,
              cost: 500000,
              qty: 1,
            })}
            addButtonLabel="Add Facility"
          />

          <div className="pt-2 border-t border-slate-700">
            <label className="block text-sm text-slate-400 mb-1">Quick Add Facility</label>
            <select
              className="input w-full"
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                const ls = tables.life_support?.rows?.find((l: Record<string, unknown>) => String(l['LIFE SUPPORT']) === e.target.value);
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
                e.target.value = '';
              }}
            >
              <option value="">Select from table...</option>
              {(tables.life_support?.rows || []).map((l: Record<string, unknown>, i: number) => (
                <option key={i} value={String(l['LIFE SUPPORT'])}>
                  {String(l['LIFE SUPPORT'])} — {Number(l['DTONS'])} DT | {Number(l['COST']).toLocaleString()} Cr
                </option>
              ))}
            </select>
          </div>

          {/* Legacy staterooms/low berths */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-700">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Staterooms (legacy)</label>
              <input className="input w-full" type="number" min={0} value={staterooms} onChange={(e) => setStaterooms(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Low Berths (legacy)</label>
              <input className="input w-full" type="number" min={0} value={lowBerths} onChange={(e) => setLowBerths(Number(e.target.value))} />
            </div>
          </div>
        </CollapsibleSection>

        {/* 10. Modules */}
        <CollapsibleSection title="10. Modules (No Life Support)" defaultOpen>
          <ChildTable
            title="Modules"
            items={moduleRows}
            onChange={setModuleRows}
            columns={[
              { key: 'name', label: 'Module', editable: true, type: 'text' },
              { key: 'dtons', label: 'DTons', editable: true, type: 'number', width: 'w-20' },
              { key: 'cost', label: 'Cost', editable: true, type: 'number', width: 'w-24' },
              { key: 'qty', label: 'Qty', editable: true, type: 'number', width: 'w-14' },
            ]}
            createNewItem={() => ({
              id: `mod-${Date.now()}`,
              name: 'Fuel Scoops',
              dtons: 0,
              cost: 1000000,
              qty: 1,
            })}
            addButtonLabel="Add Module"
          />

          <div className="pt-2 border-t border-slate-700">
            <label className="block text-sm text-slate-400 mb-1">Quick Add Module</label>
            <select
              className="input w-full"
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                const m = modules.find((mod: Record<string, unknown>) => String(mod['MODULES'] || mod['Module']) === e.target.value);
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
                e.target.value = '';
              }}
            >
              <option value="">Select from table...</option>
              {modules.map((m: Record<string, unknown>, i: number) => (
                <option key={i} value={String(m['MODULES'] || m['Module'])}>
                  {String(m['MODULES'] || m['Module'])} — {Number(m['DTONS'] || m['Dtons'] || 0)} DT | {Number(m['COST'] || m['Cost'] || 0).toLocaleString()} Cr
                </option>
              ))}
            </select>
          </div>

          {/* Legacy module toggles */}
          <div className="pt-3 border-t border-slate-700">
            <label className="block text-sm text-slate-400 mb-2">Legacy Module Selection</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {modules.map((mod: Record<string, unknown>, i: number) => {
                const modName = String(mod['MODULES'] || mod['Module'] || '');
                const selected = selectedModules.find(m => m.id === modName);
                return (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
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
                      className="rounded border-slate-600"
                    />
                    <span className="text-sm flex-1">{modName}</span>
                    {selected && (
                      <input
                        type="number"
                        min={1}
                        value={selected.qty}
                        onChange={(e) => {
                          setSelectedModules(prev => prev.map(m => m.id === modName ? { ...m, qty: Math.max(1, Number(e.target.value)) } : m));
                        }}
                        className="input w-14 text-xs py-1"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleSection>

        {/* 11. Weapons / Turrets / Hardmounts */}
        <CollapsibleSection title="11. Weapons, Turrets & Hardmounts" defaultOpen>
          <div className="space-y-3">
            <ChildTable
              title="Weapon Mounts"
              items={weaponMountRows}
              onChange={setWeaponMountRows}
              columns={[
                { key: 'name', label: 'Mount', editable: true, type: 'text' },
                { key: 'dtons', label: 'DTons', editable: true, type: 'number', width: 'w-20' },
                { key: 'cost', label: 'Cost', editable: true, type: 'number', width: 'w-24' },
                { key: 'qty', label: 'Qty', editable: true, type: 'number', width: 'w-14' },
              ]}
              createNewItem={() => ({
                id: `mount-${Date.now()}`,
                name: 'Turret, Single',
                dtons: 1,
                cost: 200000,
                qty: 1,
              })}
              addButtonLabel="Add Mount"
            />

            <div className="pt-2 border-t border-slate-700">
              <label className="block text-sm text-slate-400 mb-1">Quick Add Mount</label>
              <select
                className="input w-full"
                value=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  const w = weapons.find((wpn: Record<string, unknown>) => String(wpn['WEAPONS']).includes('Turret') && String(wpn['WEAPONS']) === e.target.value);
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
                  e.target.value = '';
                }}
              >
                <option value="">Select mount from table...</option>
                {weapons.filter((w: Record<string, unknown>) => String(w['WEAPONS']).includes('Turret') || String(w['WEAPONS']).includes('Bay') || String(w['WEAPONS']).includes('Hard')).map((w: Record<string, unknown>, i: number) => (
                  <option key={i} value={String(w['WEAPONS'])}>
                    {String(w['WEAPONS'])} — {Number(w['DTONS'])} DT | {Number(w['COST']).toLocaleString()} Cr
                  </option>
                ))}
              </select>
            </div>

            {/* Legacy weapon toggles */}
            <div className="pt-3 border-t border-slate-700">
              <label className="block text-sm text-slate-400 mb-2">Legacy Weapon Selection</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {weapons.map((wpn: Record<string, unknown>, i: number) => {
                  const wpnName = String(wpn['WEAPONS'] || '');
                  const selected = selectedWeapons.find(w => w.id === wpnName);
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
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
                        className="rounded border-slate-600"
                      />
                      <span className="text-sm flex-1">{wpnName}</span>
                      {selected && (
                        <input
                          type="number"
                          min={1}
                          value={selected.qty}
                          onChange={(e) => {
                            setSelectedWeapons(prev => prev.map(w => w.id === wpnName ? { ...w, qty: Math.max(1, Number(e.target.value)) } : w));
                          }}
                          className="input w-14 text-xs py-1"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* 12. Cargo */}
        <CollapsibleSection title="12. Cargo & Supplies" defaultOpen>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Cargo Hold (DT)</label>
                <input className="input w-full" type="number" min={0} value={cargo} onChange={(e) => setCargo(Number(e.target.value))} />
              </div>
              <div className="flex items-end">
                <div className="text-sm text-slate-400">
                  Cargo has no life support. Vacc suits required for entry.
                </div>
              </div>
            </div>

            <ChildTable
              title="Supplies in Cargo"
              items={supplyRows}
              onChange={setSupplyRows}
              columns={[
                { key: 'name', label: 'Supply', editable: true, type: 'text' },
                { key: 'dtons', label: 'DTons', editable: true, type: 'number', width: 'w-20' },
                { key: 'cost', label: 'Cost', editable: true, type: 'number', width: 'w-24' },
                { key: 'qty', label: 'Qty', editable: true, type: 'number', width: 'w-14' },
              ]}
              createNewItem={() => ({
                id: `supply-${Date.now()}`,
                name: 'Missile Pack',
                dtons: 1,
                cost: 15000,
                qty: 1,
              })}
              addButtonLabel="Add Supply"
            />

            <div className="pt-2 border-t border-slate-700">
              <label className="block text-sm text-slate-400 mb-1">Quick Add Supply</label>
              <select
                className="input w-full"
                value=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  const s = tables.ship_supplies?.rows?.find((sup: Record<string, unknown>) => String(sup['Supply']) === e.target.value);
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
                  e.target.value = '';
                }}
              >
                <option value="">Select from table...</option>
                {(tables.ship_supplies?.rows || []).map((s: Record<string, unknown>, i: number) => (
                  <option key={i} value={String(s['Supply'])}>
                    {String(s['Supply'])} — {Number(s['Dtons'])} DT | {Number(s['Cost']).toLocaleString()} Cr
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CollapsibleSection>

        {/* 13. Crew */}
        <CollapsibleSection title="13. Crew Requirements (CE)" defaultOpen>
          {crewReqs ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800/50 p-2 rounded-lg">
                  <div className="text-xs text-slate-500">Minimum Crew</div>
                  <div className="text-xl font-bold text-blue-400">{crewReqs.totalMinimum}</div>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-lg">
                  <div className="text-xs text-slate-500">Full Complement</div>
                  <div className="text-xl font-bold text-cyan-400">{crewReqs.totalFull}</div>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-lg">
                  <div className="text-xs text-slate-500">Monthly Payroll</div>
                  <div className="text-xl font-bold text-green-400">{(crewReqs.monthlySalary / 1000).toFixed(0)}k Cr</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-700">
                      <th className="pb-1">Position</th>
                      <th className="pb-1 text-center">Min</th>
                      <th className="pb-1 text-center">Full</th>
                      <th className="pb-1 text-right">Salary/mo</th>
                      <th className="pb-1 text-right">Shift</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {crewReqs.positions.map((p, i) => (
                      <tr key={i} className={p.minimum > 0 ? 'text-slate-200' : 'text-slate-500'}>
                        <td className="py-1.5">{p.position}</td>
                        <td className="py-1.5 text-center">{p.minimum}</td>
                        <td className="py-1.5 text-center">{p.fullComplement}</td>
                        <td className="py-1.5 text-right">{p.salary.toLocaleString()} Cr</td>
                        <td className="py-1.5 text-right">{p.shiftPay.toLocaleString()} Cr</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">Select a hull to calculate crew requirements.</div>
          )}
        </CollapsibleSection>
      </div>

      {/* Right Column: BOQ & Summary */}
      <div className="space-y-4">
        <BOQView
          components={components}
          totalCost={totalCost}
          hullDtons={hullDtons}
          usedTons={allocatedTons}
          availableDtons={availableDtons}
        />

        {hullDtons > 0 && (
          <div className="tile">
            <div className="tile-content">
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
            </div>
          </div>
        )}

        {/* Ship Library Quick List */}
        {ships.length > 0 && (
          <div className="tile">
            <div className="tile-header">
              <span className="font-semibold">Ship Library</span>
            </div>
            <div className="tile-content space-y-2 max-h-64 overflow-y-auto">
              {ships.map((ship) => (
                <div key={ship.id} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                  <button onClick={() => loadShip(ship)} className="text-left flex-1">
                    <div className="text-sm font-medium">{ship.name}</div>
                    <div className="text-xs text-slate-400">{ship.hullDtons}DT | TL{ship.tl} | {(ship.totalCost / 1e6).toFixed(1)} MCr</div>
                  </button>
                  <button onClick={() => deleteShip(ship.id)} className="p-1 hover:bg-red-900/30 rounded text-slate-500 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
