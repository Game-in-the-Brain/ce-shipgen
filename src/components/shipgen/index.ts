// Public API — import from '@/components/shipgen'

export { ShipGenDesktop } from './ShipGenDesktop';
export type { ShipGenDesktopProps } from './ShipGenDesktop';
export { ShipGenPhone } from './ShipGenPhone';
export type { ShipGenPhoneProps } from './ShipGenPhone';

// Pieces — use these to assemble custom layouts
export { DesignSteps } from './DesignSteps';
export { BillOfQuantities } from './BillOfQuantities';
export { OperatingEconomics } from './OperatingEconomics';
export { ComponentManifest } from './ComponentManifest';
export { TonnageGauge } from './TonnageGauge';
export { DeckPlan } from './DeckPlan';

// Primitives
export { ShLabel, ShData, ShNum, ShPanel, ShField } from './primitives';

// Data + math
export {
  HULLS, CONFIGS, ARMOR, MDRIVES, JDRIVES, POWER, BRIDGES, COMPUTERS,
  STARTER_LIBRARY, DEFAULT_SHIP,
} from './data';
export type {
  Hull, Config, Armor, MDrive, JDrive, Power, Bridge, Computer, ShipSpec,
} from './data';
export { computeShip } from './compute';
export type { ComputedShip, ShipTotals, BoqItem } from './compute';

// Tokens
export { colors, fonts } from './theme';
export type { ThemeName } from './theme';
