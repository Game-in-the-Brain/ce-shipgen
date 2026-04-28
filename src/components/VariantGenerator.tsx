import { useState, useMemo } from 'react';
import { useTableStore } from '../store/tableStore';
import { CollapsibleSection } from './CollapsibleSection';
import { BOQView } from './BOQView';
import { downloadJson, generateSnapshotName } from '../utils/exportImport';
import { Shuffle, Save, FileJson } from 'lucide-react';
import type { ShipDesign, ShipComponent, VariantParams } from '../types';

export function VariantGenerator() {
  const ships = useTableStore((s) => s.ships);
  const tables = useTableStore((s) => s.tables);
  const addShip = useTableStore((s) => s.addShip);

  const [selectedBaseId, setSelectedBaseId] = useState('');
  const [count, setCount] = useState(3);
  const [params, setParams] = useState<VariantParams>({
    hullVariance: 0,
    driveVariance: 20,
    armorVariance: 30,
    moduleVariance: 40,
    weaponVariance: 50,
    cargoVariance: 20,
  });
  const [generated, setGenerated] = useState<ShipDesign[]>([]);

  const baseShip = useMemo(() => ships.find(s => s.id === selectedBaseId), [ships, selectedBaseId]);

  const hulls = tables.ship_hulls?.rows || [];
  const drives = tables.ship_drives?.rows || [];
  const armors = tables.ship_armor?.rows || [];
  const modules = tables.ship_modules?.rows || [];
  const weapons = tables.ship_weapons?.rows || [];

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
  const pickRandom = <T,>(arr: T[]): T | undefined => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : undefined;
  const vary = (value: number, percent: number) => {
    const delta = value * (percent / 100);
    return Math.max(0, value + randomInRange(-delta, delta));
  };
  const varyInt = (value: number, percent: number) => Math.round(vary(value, percent));

  const generateVariants = () => {
    if (!baseShip) return;
    const variants: ShipDesign[] = [];

    for (let i = 0; i < count; i++) {
      // Vary hull (occasionally)
      let hullDtons = baseShip.hullDtons;
      let hullCode = baseShip.hullCode;
      let hullCost = baseShip.components.find(c => c.section === 'Hull')?.cost || 0;

      if (params.hullVariance > 0 && Math.random() < 0.3) {
        const nearby = hulls.filter((h: Record<string, unknown>) => {
          const dt = Number(h['DTONS']);
          return dt >= baseShip.hullDtons * 0.7 && dt <= baseShip.hullDtons * 1.3;
        });
        const newHull = pickRandom(nearby);
        if (newHull) {
          hullDtons = Number(newHull['DTONS']);
          hullCode = String(newHull['DTONS']);
          hullCost = Number(newHull['COST']);
        }
      }

      // Vary drives
      const mDriveCode = baseShip.mDrive || '';
      const jDriveCode = baseShip.jDrive || '';
      const ppCode = baseShip.powerPlant || '';

      const newMDrive = params.driveVariance > 0 && Math.random() < 0.4
        ? String(pickRandom(drives.filter((d: Record<string, unknown>) => Number(d['M-Drive\n Tons']) > 0))?.['Drive Code'] || mDriveCode)
        : mDriveCode;

      const newJDrive = params.driveVariance > 0 && Math.random() < 0.3
        ? String(pickRandom(drives.filter((d: Record<string, unknown>) => Number(d['J-Drive\n Tons']) > 0))?.['Drive Code'] || jDriveCode)
        : jDriveCode;

      const newPP = params.driveVariance > 0 && Math.random() < 0.3
        ? String(pickRandom(drives)?.['Drive Code'] || ppCode)
        : ppCode;

      // Vary armor
      let armorType = baseShip.armor;
      let armorQty = Math.round(vary(1, params.armorVariance));
      if (params.armorVariance > 0 && Math.random() < 0.4) {
        const newArmor = pickRandom(armors);
        if (newArmor) armorType = String(newArmor['Armor Type']).split(' ')[0];
      }
      armorQty = Math.max(0, armorQty);

      // Vary modules
      const newModules: ShipComponent[] = baseShip.modules
        .filter(() => Math.random() > (params.moduleVariance / 200))
        .map(m => ({ ...m, qty: varyInt(m.qty || 1, params.moduleVariance) }));

      // Add random modules
      if (params.moduleVariance > 0 && Math.random() < 0.3) {
        const extraMod = pickRandom(modules);
        if (extraMod) {
          const modName = String(extraMod['Module'] || extraMod['WEAPONS']);
          if (!newModules.find(m => m.module === modName)) {
            newModules.push({
              section: 'Module',
              module: modName,
              dtons: Number(extraMod['Dtons'] || extraMod['DTONS'] || 0),
              cost: Number(extraMod['Cost'] || extraMod['COST'] || 0),
              qty: 1,
            });
          }
        }
      }

      // Vary weapons
      const newWeapons: ShipComponent[] = (baseShip.weapons || [])
        .filter(() => Math.random() > (params.weaponVariance / 200))
        .map(w => ({ ...w, qty: varyInt(w.qty || 1, params.weaponVariance) }));

      if (params.weaponVariance > 0 && Math.random() < 0.3) {
        const extraWpn = pickRandom(weapons);
        if (extraWpn) {
          const wpnName = String(extraWpn['WEAPONS']);
          if (!newWeapons.find(w => w.module === wpnName)) {
            newWeapons.push({
              section: 'Weapon',
              module: wpnName,
              dtons: Number(extraWpn['DTONS'] || 0),
              cost: Number(extraWpn['COST'] || 0),
              qty: 1,
            });
          }
        }
      }

      // Vary cargo
      const cargo = Math.max(0, varyInt(baseShip.cargo, params.cargoVariance));

      // Recompute costs
      const selectedHull = hulls.find((h: Record<string, unknown>) => String(h['DTONS']) === hullCode || String(h['Performance Column']) === hullCode);
      const actualHullDtons = selectedHull ? Number(selectedHull['DTONS']) : hullDtons;
      const actualHullCost = selectedHull ? Number(selectedHull['COST']) : hullCost;

      const selectedConfig = tables.hull_configurations?.rows?.find((c: Record<string, unknown>) => String(c['Configuration']).includes(baseShip.configuration));
      const configMod = selectedConfig ? Number(selectedConfig['Hull Cost Modifier'] || 0) : 0;

      const selectedArmor = armors.find((a: Record<string, unknown>) => String(a['Armor Type']).includes(armorType));
      const armorCostMod = selectedArmor ? Number(selectedArmor['Cost'] || 0) : 0;
      const armorCost = actualHullCost * armorCostMod * armorQty;

      const selectedMDrive = drives.find((d: Record<string, unknown>) => String(d['Drive Code']) === newMDrive);
      const mDriveCost = selectedMDrive ? Number(selectedMDrive['M-Drive COST'] || 0) : 0;
      const mDriveTons = selectedMDrive ? Number(selectedMDrive['M-Drive\n Tons'] || 0) : 0;

      const selectedJDrive = drives.find((d: Record<string, unknown>) => String(d['Drive Code']) === newJDrive);
      const jDriveCost = selectedJDrive ? Number(selectedJDrive['J-Drive COST'] || 0) : 0;
      const jDriveTons = selectedJDrive ? Number(selectedJDrive['J-Drive\n Tons'] || 0) : 0;

      const selectedPP = drives.find((d: Record<string, unknown>) => String(d['Drive Code']) === newPP);
      const ppCost = selectedPP ? Number(selectedPP['PP COST'] || 0) : 0;
      const ppTons = selectedPP ? Number(selectedPP['P-Plant\n Tons'] || 0) : 0;
      const ppFuelWk = selectedPP ? Number(selectedPP['Fuel/Wk\n (tons)'] || 0) : 0;

      const selectedBridge = tables.ship_bridge?.rows?.find((b: Record<string, unknown>) => String(b['WEAPONS'] || b['Bridge Size']).includes(baseShip.bridge || ''));
      const bridgeTons = selectedBridge ? Number(selectedBridge['DTONS'] || selectedBridge['Tons'] || 0) : 0;
      const bridgeCost = selectedBridge ? Number(selectedBridge['COST'] || 0) : 0;

      const jumpFuel = actualHullDtons * 0.1 * 2;
      const powerFuel = ppFuelWk * 2;
      const totalFuel = jumpFuel + powerFuel;

      const stateroomTons = (baseShip.staterooms || 0) * 4;
      const stateroomCost = (baseShip.staterooms || 0) * 500000;
      const lowBerthTons = (baseShip.lowBerths || 0) * 0.5;
      const lowBerthCost = (baseShip.lowBerths || 0) * 50000;

      const armorTons = actualHullDtons * 0.05 * armorQty;

      const components: ShipComponent[] = [
        { section: 'Hull', module: `Hull ${actualHullDtons}DT`, dtons: actualHullDtons, cost: actualHullCost },
        { section: 'Config', module: baseShip.configuration, dtons: 0, cost: actualHullCost * configMod },
      ];
      if (armorTons > 0) components.push({ section: 'Armor', module: armorType, dtons: armorTons, cost: armorCost });
      if (mDriveTons > 0) components.push({ section: 'M-Drive', module: newMDrive, dtons: mDriveTons, cost: mDriveCost });
      if (jDriveTons > 0) components.push({ section: 'J-Drive', module: newJDrive, dtons: jDriveTons, cost: jDriveCost });
      if (ppTons > 0) components.push({ section: 'Power Plant', module: newPP, dtons: ppTons, cost: ppCost });
      if (bridgeTons > 0) components.push({ section: 'Bridge', module: baseShip.bridge || '', dtons: bridgeTons, cost: bridgeCost });
      if (totalFuel > 0) components.push({ section: 'Fuel', module: 'Jump + Power Plant', dtons: totalFuel, cost: 0 });
      if (stateroomTons > 0) components.push({ section: 'Life Support', module: `${baseShip.staterooms || 0} Staterooms`, dtons: stateroomTons, cost: stateroomCost });
      if (lowBerthTons > 0) components.push({ section: 'Life Support', module: `${baseShip.lowBerths || 0} Low Berths`, dtons: lowBerthTons, cost: lowBerthCost });
      components.push(...newModules, ...newWeapons);
      if (cargo > 0) components.push({ section: 'Cargo', module: 'Cargo Hold', dtons: cargo, cost: 0 });

      const totalCost = components.reduce((s, c) => s + c.cost, 0);
      const usedTons = components.reduce((s, c) => s + c.dtons, 0);
      const availableDtons = actualHullDtons - usedTons + cargo;

      const variant: ShipDesign = {
        id: `variant-${Date.now()}-${i}`,
        name: `${baseShip.name} Variant ${i + 1}`,
        tl: baseShip.tl,
        hullCode,
        hullDtons: actualHullDtons,
        configuration: baseShip.configuration,
        armor: armorType,
        armorQty,
        mDrive: newMDrive,
        jDrive: newJDrive,
        powerPlant: newPP,
        bridge: baseShip.bridge || '',
        computer: baseShip.computer || '',
        software: baseShip.software || [],
        sensors: baseShip.sensors || '',
        staterooms: baseShip.staterooms || 0,
        lowBerths: baseShip.lowBerths || 0,
        crew: [],
        modules: newModules,
        weapons: newWeapons,
        cargo,
        components,
        totalCost,
        availableDtons,
        createdAt: new Date().toISOString(),
      };

      variants.push(variant);
    }

    setGenerated(variants);
  };

  const saveAll = () => {
    generated.forEach(ship => addShip(ship));
    setGenerated([]);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--sh-ink)', fontFamily: 'var(--font-sh-display), monospace', letterSpacing: '0.12em' }}>VARIANT GENERATOR</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <CollapsibleSection title="Base Ship" defaultOpen>
            <select 
              className="input w-full"
              value={selectedBaseId}
              onChange={(e) => setSelectedBaseId(e.target.value)}
            >
              <option value="">Select a base ship...</option>
              {ships.map(ship => (
                <option key={ship.id} value={ship.id}>{ship.name} ({ship.hullDtons}DT)</option>
              ))}
            </select>
            {ships.length === 0 && (
              <p className="text-sm mt-2" style={{ color: 'var(--sh-ink-dim)' }}>Save a ship in the Designer first.</p>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Parameters" defaultOpen>
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm mb-1" style={{ color: 'var(--sh-ink-dim)' }}>
                  <span>Number of Variants</span>
                  <span style={{ color: 'var(--sh-glow)' }}>{count}</span>
                </label>
                <input 
                  type="range" min={1} max={10} value={count} 
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {([
                ['driveVariance', 'Drive Variance'],
                ['armorVariance', 'Armor Variance'],
                ['moduleVariance', 'Module Variance'],
                ['weaponVariance', 'Weapon Variance'],
                ['cargoVariance', 'Cargo Variance'],
                ['hullVariance', 'Hull Variance'],
              ] as [keyof VariantParams, string][]).map(([key, label]) => (
                <div key={key}>
                  <label className="flex justify-between text-sm mb-1" style={{ color: 'var(--sh-ink-dim)' }}>
                    <span>{label}</span>
                    <span style={{ color: 'var(--sh-glow)' }}>{params[key]}%</span>
                  </label>
                  <input 
                    type="range" min={0} max={100} value={params[key]} 
                    onChange={(e) => setParams(p => ({ ...p, [key]: Number(e.target.value) }))}
                    className="w-full accent-blue-500"
                  />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <button 
            onClick={generateVariants}
            disabled={!baseShip}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-4 h-4" /> Generate Variants
          </button>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {generated.length > 0 && (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{generated.length} Variants Generated</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => downloadJson(JSON.stringify(generated, null, 2), `variants-${generateSnapshotName()}.json`)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FileJson className="w-4 h-4" /> Export
                </button>
                <button onClick={saveAll} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save All to Library
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            {generated.map((ship) => (
              <div key={ship.id} className="tile">
                <div className="tile-header">
                  <span className="font-semibold">{ship.name}</span>
                  <span className="text-sm" style={{ color: 'var(--sh-ink-dim)' }}>{(ship.totalCost / 1e6).toFixed(2)} MCr</span>
                </div>
                <div className="tile-content">
                  <BOQView 
                    components={ship.components}
                    totalCost={ship.totalCost}
                    hullDtons={ship.hullDtons}
                    usedTons={ship.components.reduce((s, c) => s + c.dtons, 0)}
                    availableDtons={ship.availableDtons}
                  />
                </div>
              </div>
            ))}
          </div>

          {generated.length === 0 && (
            <div className="text-center py-16" style={{ color: 'var(--sh-ink-dim)' }}>
              <p>Select a base ship and generate variants.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
