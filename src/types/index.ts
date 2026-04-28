export interface TableRow {
  [key: string]: string | number | null;
}

export interface DataTable {
  id: string;
  name: string;
  headers: string[];
  rows: TableRow[];
}

// Normalized Ship Component Models
export interface HullModel {
  id: string;
  dtons: number;
  cost: number;
  constructionWeeks: number;
  performanceColumn: number;
  pricePerDton: number;
}

export interface DriveModel {
  id: string;
  jDriveTons: number;
  jDriveCost: number;
  mDriveTons: number;
  mDriveCost: number;
  powerPlantTons: number;
  powerPlantCost: number;
  fuelPerWeek: number;
  minFuelVolume: number;
  maxEnergyWeapons: number;
}

export interface ArmorModel {
  id: string;
  name: string;
  tl: number;
  protectionPer5Pct: number;
  costMultiplier: number;
}

export interface HullConfigModel {
  id: string;
  name: string;
  costModifier: number;
  atmosphericDm: number;
  fuelScoops: boolean;
  notes: string;
}

export interface HullOptionModel {
  id: string;
  name: string;
  tl: number;
  costPerTon: number;
  notes: string;
}

export interface BridgeModel {
  id: string;
  name: string;
  minDtons: number;
  tons: number;
  stations: number;
  cost: number;
  notes: string;
}

export interface ComputerModel {
  id: string;
  name: string;
  tl: number;
  rating: number;
  cost: number;
}

export interface ComputerOptionModel {
  id: string;
  name: string;
  costMultiplier: number;
  notes: string;
}

export interface SoftwareModel {
  id: string;
  name: string;
  tl: number;
  rating: number;
  cost: number;
  notes: string;
}

export interface SensorModel {
  id: string;
  name: string;
  tl: number;
  dm: number;
  includes: string;
  tons: number;
  cost: number;
}

export interface WeaponModel {
  id: string;
  name: string;
  tl: number;
  tons: number;
  cost: number;
  range?: string;
  damage?: string;
  notes?: string;
}

export interface ModuleModel {
  id: string;
  name: string;
  tl: number;
  dtons: number;
  cost: number;
  notes: string;
}

export interface VehicleModel {
  id: string;
  name: string;
  tl: number;
  dtons: number;
  cost: number;
  notes: string;
}

export interface SupplyModel {
  id: string;
  name: string;
  tl: number | null;
  dtons: number | null;
  cost: number | null;
  notes: string;
}

export interface CrewPositionModel {
  id: string;
  position: string;
  minimum: string;
  fullComplement: string;
  salary: number;
  shift: number;
}

export interface LifeSupportModel {
  id: string;
  name: string;
  tl: number;
  dtons: number;
  cost: number;
  notes: string;
}

export interface PowerPlantModel {
  id: string;
  name: string;
  tl: number;
  multiplier: number;
  fuelRate: number;
}

export interface LifeSupportExpenseModel {
  id: string;
  passageType: string;
  cost: number;
  base: number;
}

export interface EnginePerformanceModel {
  id: string;
  driveCode: string;
  // Dynamic hull size columns: 100, 200, 300, ...
  [hullSize: string]: string | number | null;
}

// ─── Child Table Items ───

export interface ChildItem {
  id: string;
  name: string;
  dtons: number;
  cost: number;
  qty: number;
  tl?: number;
  notes?: string;
  variant?: string;
  rating?: number;
  options?: string[];
  slots?: number;
  slotItems?: ChildItem[];
}

export interface DriveItem extends ChildItem {
  type: 'thrust' | 'powerPlant' | 'jump';
  driveCode: string;
  performance?: number;
}

export interface BridgeItem extends ChildItem {
  type: 'cockpit' | 'bridge' | 'commandStation' | 'cabin';
  stations?: number;
}

export interface ComputerItem extends ChildItem {
  model: string;
  slots: number;
  options: string[];
}

export interface SoftwareItem extends ChildItem {
  program: string;
  rating: number;
  active: boolean;
}

export interface SensorItem extends ChildItem {
  sensorType: string;
}

export interface LifeSupportItem extends ChildItem {
  facilityType: string;
  capacity: number;
}

export interface WeaponMountItem extends ChildItem {
  mountType: 'turret' | 'bay' | 'hardpoint';
  maxWeapons: number;
  weapons: ChildItem[];
}

export interface SupplyItem extends ChildItem {
  supplyType: string;
}

// Ship Design
export interface ShipComponent {
  section: string;
  module: string;
  dtons: number;
  cost: number;
  tl?: number;
  notes?: string;
  qty?: number;
}

export interface ShipDesign {
  id: string;
  name: string;
  tl: number;
  hullCode: string;
  hullDtons: number;
  configuration: string;
  armor: string;
  armorQty: number;
  // New child-table architecture (v0.02+)
  drives?: DriveItem[];
  commandControl?: BridgeItem[];
  computers?: ComputerItem[];
  softwareList?: SoftwareItem[];
  sensorList?: SensorItem[];
  lifeSupport?: LifeSupportItem[];
  weaponMounts?: WeaponMountItem[];
  supplies?: SupplyItem[];
  // Legacy flat fields (pre-v0.02 compatibility)
  mDrive?: string;
  jDrive?: string;
  powerPlant?: string;
  bridge?: string;
  computer?: string;
  software?: string[];
  sensors?: string;
  staterooms?: number;
  lowBerths?: number;
  weapons?: ShipComponent[];
  // Common fields
  modules: ShipComponent[];
  cargo: number;
  crew: ShipComponent[];
  components: ShipComponent[];
  totalCost: number;
  availableDtons: number;
  createdAt: string;
}

export interface VariantParams {
  hullVariance: number;
  driveVariance: number;
  armorVariance: number;
  moduleVariance: number;
  weaponVariance: number;
  cargoVariance: number;
}

export type TableId =
  | 'ship_hulls'
  | 'hull_configurations'
  | 'ship_armor'
  | 'hull_options'
  | 'ship_bridge'
  | 'computer_options'
  | 'ship_software'
  | 'ship_weapons'
  | 'ship_drives'
  | 'ship_crew'
  | 'life_support'
  | 'ship_modules'
  | 'ship_sensors'
  | 'ship_vehicles'
  | 'ship_supplies'
  | 'power_plants'
  | 'life_support_expenses'
  | 'engine_performance'
  | 'ship_computers';

export type ComponentType =
  | 'hull'
  | 'configuration'
  | 'armor'
  | 'm_drive'
  | 'j_drive'
  | 'power_plant'
  | 'bridge'
  | 'computer'
  | 'software'
  | 'sensors'
  | 'accommodations'
  | 'features'
  | 'weapons'
  | 'vehicles';

export interface ValidationResult {
  valid: boolean;
  hardErrors: ValidationError[];
  softWarnings: ValidationError[];
}

export interface ValidationError {
  code: string;
  message: string;
  section: string;
  severity: 'hard' | 'soft';
}
