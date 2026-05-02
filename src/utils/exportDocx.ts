/**
 * Ship Specification Docx Export
 *
 * Generates a 4-page military/aerospace vessel datasheet
 * following the approved Aero-Spec layout (Stitch design v1.0).
 */

import {
  Document,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  Packer,
  convertInchesToTwip,
  VerticalAlign,
  type IParagraphOptions,
} from 'docx';
import type { ShipDesign, ShipOperations } from '../types';
import { calculateShipOperations } from './shipOperations';
import { lookupThrust } from '../data/enginePerformanceTable';

// ─── Color Palette ───

const COLORS = {
  ink: '#0A1612',
  teal: '#0A8A5A',
  amber: '#B48A15',
  rust: '#A44A2A',
  hairline: '#D0D8D4',
  lightGrey: '#F4F6F5',
  white: '#FFFFFF',
};

// ─── Helpers ───

function fmtMCr(val: number): string {
  return `${val.toFixed(3)}`;
}

function fmtCr(val: number): string {
  return val.toLocaleString();
}

function getOperations(ship: ShipDesign): ShipOperations {
  if (ship.operations) return ship.operations;
  return calculateShipOperations(ship);
}

function getJumpDrive(ship: ShipDesign) {
  return (ship.drives || []).find(d => d.type === 'jump');
}

function getThrustDrive(ship: ShipDesign) {
  return (ship.drives || []).find(d => d.type === 'thrust');
}

function getPowerPlant(ship: ShipDesign) {
  return (ship.drives || []).find(d => d.type === 'powerPlant');
}

function extractDriveRating(code: string): number {
  if (!code) return 1;
  const match = code.match(/([A-V])/i);
  if (!match) return 1;
  const ratings: Record<string, number> = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
    J: 9, K: 10, L: 11, M: 12, N: 13, P: 14, Q: 15,
    R: 16, S: 17, T: 18, U: 19, V: 20,
  };
  return ratings[match[1].toUpperCase()] || 1;
}

function calculateThrustG(ship: ShipDesign): { thrustG: number; weightClass: string } {
  const drive = getThrustDrive(ship);
  if (!drive) return { thrustG: 0, weightClass: 'None' };
  const driveCode = drive.driveCode || drive.name;
  const hull = ship.hullDtons || 1;
  const tlMultipliers: Record<number, number> = { 9: 1.0, 10: 1.0, 11: 1.5, 12: 1.5, 13: 2.5, 14: 2.5 };
  const multiplier = tlMultipliers[ship.tl] || 4.0;

  const baseThrust = lookupThrust(driveCode, hull);
  if (baseThrust === null) return { thrustG: 0, weightClass: 'None' };

  const thrustG = baseThrust * multiplier;

  let weightClass = 'Very Heavy';
  if (thrustG > 40 * multiplier) weightClass = 'Very Light';
  else if (thrustG > 20 * multiplier) weightClass = 'Light';
  else if (thrustG > 5 * multiplier) weightClass = 'Medium';
  else if (thrustG > 1 * multiplier) weightClass = 'Heavy';

  return { thrustG: parseFloat(thrustG.toFixed(2)), weightClass };
}

function calculateArmorPercent(ship: ShipDesign): number {
  if (!ship.hullDtons) return 0;
  return parseFloat(((ship.armorQty || 0) / ship.hullDtons * 100).toFixed(1));
}

function getArmorLimit(roleId: string, isNonJump: boolean): number {
  const limits: Record<string, { standard: number; nonJump: number }> = {
    civilian: { standard: 10, nonJump: 15 },
    vanguard: { standard: 15, nonJump: 25 },
    striker: { standard: 10, nonJump: 20 },
    brawler: { standard: 20, nonJump: 50 },
    support: { standard: 15, nonJump: 25 },
    capital: { standard: 25, nonJump: 40 },
  };
  const role = (roleId || 'civilian').toLowerCase();
  const l = limits[role] || limits.civilian;
  return isNonJump ? l.nonJump : l.standard;
}

function calculateFuelCapacity(ship: ShipDesign): number {
  return (ship.components || [])
    .filter(c => c.section === 'Fuel')
    .reduce((s, c) => s + (c.dtons || 0), 0);
}

function calculateJumpFuel(hullDtons: number, parsecs: number): number {
  return hullDtons * 0.1 * parsecs;
}

function calculateEndurance(ship: ShipDesign): number {
  const fuel = calculateFuelCapacity(ship);
  const pp = getPowerPlant(ship);
  if (!pp) return 0;
  const rating = extractDriveRating(pp.driveCode || pp.name);
  const weeklyBurn = rating * 0.5;
  return weeklyBurn > 0 ? Math.floor(fuel / weeklyBurn) : 0;
}

// ─── Paragraph Builders ───

type DocxChild = Paragraph | Table;

function p(text: string, opts?: {
  bold?: boolean;
  color?: string;
  size?: number;
  font?: string;
  allCaps?: boolean;
  align?: any;
  spacing?: { before?: number; after?: number };
  shading?: { fill: string };
  border?: IParagraphOptions['border'];
}): Paragraph {
  const runs: TextRun[] = [new TextRun({
    text,
    bold: opts?.bold,
    color: opts?.color,
    size: opts?.size,
    font: opts?.font,
    allCaps: opts?.allCaps,
  })];
  return new Paragraph({
    children: runs,
    alignment: opts?.align,
    spacing: opts?.spacing,
    shading: opts?.shading,
    border: opts?.border,
  });
}

function tealRule(): Paragraph {
  return new Paragraph({
    border: { bottom: { color: COLORS.teal, space: 1, style: BorderStyle.SINGLE, size: 12 } },
    spacing: { after: 120 },
  });
}

function sectionHeader(text: string): Paragraph {
  return p(text, {
    bold: true,
    allCaps: true,
    color: COLORS.ink,
    font: 'JetBrains Mono',
    size: 22,
    spacing: { before: 240, after: 120 },
  });
}

function subHeader(text: string): Paragraph {
  return p(text, {
    bold: true,
    allCaps: true,
    color: COLORS.ink,
    font: 'JetBrains Mono',
    size: 20,
    spacing: { before: 160, after: 80 },
  });
}

function bodyText(text: string, opts?: { bold?: boolean; color?: string; size?: number }): Paragraph {
  return p(text, {
    font: 'JetBrains Mono',
    size: opts?.size || 18,
    color: opts?.color || COLORS.ink,
    bold: opts?.bold || false,
    spacing: { after: 60 },
  });
}

function emptyPara(): Paragraph {
  return new Paragraph({ spacing: { after: 60 } });
}

// ─── Table Builders ───

function makeCell(text: string, opts?: {
  bold?: boolean;
  color?: string;
  bg?: string;
  align?: any;
  width?: { size: number; type: any };
  size?: number;
}): TableCell {
  return new TableCell({
    children: [p(text, {
      align: opts?.align,
      font: 'JetBrains Mono',
      size: opts?.size || 16,
      color: opts?.color,
      bold: opts?.bold,
    })],
    shading: opts?.bg ? { fill: opts.bg, type: 'clear' } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    width: opts?.width || { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
  });
}

function makeHeaderRow(cells: string[], widths?: number[]): TableRow {
  return new TableRow({
    children: cells.map((text, i) => makeCell(text, {
      bold: true,
      bg: COLORS.lightGrey,
      size: 15,
      width: widths ? { size: widths[i], type: WidthType.PERCENTAGE } : undefined,
    })),
    tableHeader: true,
  });
}

function makeDataRow(cells: string[], widths?: number[], opts?: { bold?: boolean }): TableRow {
  return new TableRow({
    children: cells.map((text, i) => makeCell(text, {
      size: 15,
      width: widths ? { size: widths[i], type: WidthType.PERCENTAGE } : undefined,
      bold: opts?.bold || false,
    })),
  });
}

function borderedTable(rows: TableRow[], colCount: number): Table {
  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.hairline },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.hairline },
      left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.hairline },
      right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.hairline },
      insideHorizontal: { style: BorderStyle.DOTTED, size: 2, color: COLORS.hairline },
      insideVertical: { style: BorderStyle.NIL, size: 0, color: COLORS.hairline },
    },
    columnWidths: Array(colCount).fill(100 / colCount),
  });
}

// ─── Page Builders ───

function buildPage1(ship: ShipDesign, _ops: ShipOperations): DocxChild[] {
  const { thrustG, weightClass } = calculateThrustG(ship);
  const jumpDrive = getJumpDrive(ship);
  const jumpRange = jumpDrive?.performance || 1;
  const jumpFuel = calculateJumpFuel(ship.hullDtons || 0, jumpRange);
  const fuelCap = calculateFuelCapacity(ship);
  const armorPct = calculateArmorPercent(ship);
  const roleId = ship.classification?.roleId || 'civilian';
  const hasJump = !!jumpDrive;
  const armorLimit = getArmorLimit(roleId, !hasJump);
  const armorStatus = armorPct <= armorLimit ? 'LEGAL' : 'OVER-LIMIT';
  const endurance = calculateEndurance(ship);

  const content: DocxChild[] = [];

  // Header
  content.push(p('BUREAU OF INTERSTELLAR TRANSPORT', {
    font: 'JetBrains Mono', size: 14, color: COLORS.ink, allCaps: true, spacing: { after: 40 },
  }));

  content.push(p(ship.name, {
    font: 'VT323', size: 48, color: COLORS.ink, allCaps: true, spacing: { after: 40 },
  }));

  content.push(tealRule());

  const className = (ship.classification?.className || 'Unknown').toUpperCase();
  const sizeClass = (ship.classification?.sizeClass || 'Unknown').toUpperCase();
  content.push(p(`${className}  /  ${sizeClass}`, {
    font: 'VT323', size: 24, color: COLORS.teal, allCaps: true, spacing: { after: 240 },
  }));

  // Section A: Identity
  content.push(sectionHeader('SECTION A — VESSEL IDENTITY'));

  const idRows = [
    makeDataRow(['HULL', `${ship.hullDtons} DT ${ship.configuration || 'Standard'}`]),
    makeDataRow(['TECH LEVEL', `TL ${ship.tl}`]),
    makeDataRow(['TOTAL COST', `${(ship.totalCost / 1e6).toFixed(2)} MCr`]),
    makeDataRow(['ARMOR', `${ship.armor || 'None'} (${ship.armorQty || 0} DT)`]),
    makeDataRow(['CARGO CAPACITY', `${ship.cargo || 0} DT`]),
    makeDataRow(['STATEROOMS', `${ship.staterooms || 0}`]),
    makeDataRow(['LOW BERTHS', `${ship.lowBerths || 0}`]),
  ];
  content.push(borderedTable(idRows, 2));
  content.push(emptyPara());

  // Section B: BOM
  content.push(sectionHeader('SECTION B — BILL OF MATERIALS'));

  const bomHeader = makeHeaderRow(['SECTION', 'MODULE', 'DTONS', 'COST', 'QTY'], [20, 40, 15, 15, 10]);
  const bomRows: TableRow[] = [bomHeader];

  const components = ship.components || [];
  for (const c of components) {
    bomRows.push(makeDataRow([
      c.section,
      c.module,
      String(c.dtons || 0),
      String(c.cost || 0),
      String(c.qty || 1),
    ], [20, 40, 15, 15, 10]));
  }
  content.push(borderedTable(bomRows, 5));
  content.push(emptyPara());

  // Section C: Performance
  content.push(sectionHeader('SECTION C — PERFORMANCE METRICS'));

  const perfRows = [
    makeDataRow(['THRUST', `${thrustG} G (${weightClass})`]),
    makeDataRow(['JUMP RANGE', `${jumpRange} parsecs`]),
    makeDataRow(['JUMP FUEL', `${jumpFuel} DT per jump`]),
    makeDataRow(['FUEL CAPACITY', `${fuelCap} DT`]),
    makeDataRow(['ENDURANCE', `${endurance} weeks`]),
    makeDataRow(['ANNUAL OVERHAUL', '2 weeks']),
    makeDataRow(['ARMOR STATUS', `${armorPct}% [${armorStatus}]${armorStatus === 'OVER-LIMIT' ? ' — LIMIT: ' + armorLimit + '%' : ''}`]),
  ];
  content.push(borderedTable(perfRows, 2));

  return content;
}

function buildPage2(ship: ShipDesign, ops: ShipOperations): DocxChild[] {
  const content: DocxChild[] = [];

  // Page break paragraph
  content.push(new Paragraph({ pageBreakBefore: true }));

  // Section D: Cargo & Supplies
  content.push(sectionHeader('SECTION D — CARGO & SUPPLIES'));

  content.push(subHeader('CARGO HOLD'));
  content.push(bodyText(`TOTAL CAPACITY: ${ship.cargo || 0} DT`));
  content.push(bodyText(`FREIGHT-CONFIGURED: ${ship.cargo || 0} DT`));

  const supplies = (ship.components || []).filter(c => c.section === 'Supplies');
  if (supplies.length > 0) {
    content.push(subHeader('SUPPLY INVENTORY'));
    const supHeader = makeHeaderRow(['ITEM', 'TONS', 'COST', 'QTY'], [50, 20, 20, 10]);
    const supRows: TableRow[] = [supHeader];
    for (const s of supplies) {
      supRows.push(makeDataRow([s.module, String(s.dtons || 0), String(s.cost || 0), String(s.qty || 1)], [50, 20, 20, 10]));
    }
    content.push(borderedTable(supRows, 4));
  }
  content.push(emptyPara());

  // Section E: Crew
  content.push(sectionHeader('SECTION E — CREW COMPLEMENT'));

  const crew = ops.crew;
  const crewHeader = makeHeaderRow(['POSITION', 'COUNT', 'SALARY (Cr/mo)', 'ANNUAL (Cr)'], [30, 15, 30, 25]);
  const crewRows: TableRow[] = [crewHeader];

  const crewData: [string, number, number][] = [
    ['Command', crew.command, 6000],
    ['Pilot', crew.pilot, 5000],
    ['Navigator', crew.navigator, 4000],
    ['Engineer', crew.engineer, 4000],
    ['Medic', crew.medic, 3000],
    ['Gunner', crew.gunner, 3000],
    ['Marine', crew.marine, 2000],
    ['Steward', crew.steward, 1500],
    ['Maintenance', crew.maintenance, 2500],
    ['Deck Crew', crew.deckCrew, 2500],
  ];

  let totalMonthly = 0;
  for (const [pos, count, salary] of crewData) {
    const annual = count * salary * 12;
    totalMonthly += count * salary;
    crewRows.push(makeDataRow([
      pos,
      String(count),
      count > 0 ? fmtCr(salary) : '—',
      count > 0 ? fmtCr(annual) : '—',
    ], [30, 15, 30, 25]));
  }

  crewRows.push(makeDataRow([
    'TOTAL',
    String(crew.total),
    fmtCr(totalMonthly),
    fmtCr(totalMonthly * 12),
  ], [30, 15, 30, 25], { bold: true }));

  content.push(borderedTable(crewRows, 4));
  content.push(emptyPara());

  // Payroll summary box
  content.push(p(
    `MONTHLY PAYROLL: ${fmtCr(totalMonthly)} Cr    |    ANNUAL PAYROLL: ${(totalMonthly * 12 / 1e6).toFixed(3)} MCr    |    LIFE SUPPORT: ${ops.costs.lifeSupport.toFixed(3)} MCr/year`,
    {
      font: 'JetBrains Mono',
      size: 16,
      color: COLORS.ink,
      bold: true,
      spacing: { before: 120, after: 120 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.teal },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.teal },
        left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.teal },
        right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.teal },
      },
      shading: { fill: COLORS.lightGrey },
    }
  ));

  return content;
}

function buildPage3(_ship: ShipDesign, ops: ShipOperations): DocxChild[] {
  const content: DocxChild[] = [];
  content.push(new Paragraph({ pageBreakBefore: true }));

  // Section F: Operating Overhead
  content.push(sectionHeader('SECTION F — OPERATING OVERHEAD'));

  const annual = ops.costs.annual;
  const finHeader = makeHeaderRow(['COST CATEGORY', 'FIXED', '@ 12j/y', '@ 24j/y', '@ 36j/y'], [30, 17.5, 17.5, 17.5, 17.5]);
  const finRows: TableRow[] = [finHeader];

  finRows.push(makeDataRow(['Mortgage', fmtMCr(annual.mortgage), fmtMCr(annual.mortgage), fmtMCr(annual.mortgage), fmtMCr(annual.mortgage)], [30, 17.5, 17.5, 17.5, 17.5]));
  finRows.push(makeDataRow(['Maintenance', fmtMCr(annual.maintenance), fmtMCr(annual.maintenance), fmtMCr(annual.maintenance), fmtMCr(annual.maintenance)], [30, 17.5, 17.5, 17.5, 17.5]));
  finRows.push(makeDataRow(['Crew Salaries', fmtMCr(annual.crewSalaries), fmtMCr(annual.crewSalaries), fmtMCr(annual.crewSalaries), fmtMCr(annual.crewSalaries)], [30, 17.5, 17.5, 17.5, 17.5]));
  finRows.push(makeDataRow(['Life Support', fmtMCr(annual.lifeSupport), fmtMCr(annual.lifeSupport), fmtMCr(annual.lifeSupport), fmtMCr(annual.lifeSupport)], [30, 17.5, 17.5, 17.5, 17.5]));
  finRows.push(makeDataRow(['Variable (Fuel + Port)', '—', fmtMCr(annual.variableAt12), fmtMCr(annual.variableAt24), fmtMCr(annual.variableAt36)], [30, 17.5, 17.5, 17.5, 17.5]));
  finRows.push(makeDataRow(['TOTAL', fmtMCr(annual.fixedCosts), fmtMCr(annual.totalAt12), fmtMCr(annual.totalAt24), fmtMCr(annual.totalAt36)], [30, 17.5, 17.5, 17.5, 17.5], { bold: true }));

  content.push(borderedTable(finRows, 5));
  content.push(emptyPara());

  // Fixed cost callout
  content.push(p(
    `FIXED COSTS (INCURRED REGARDLESS OF DEPLOYMENT): ${fmtMCr(annual.fixedCosts)} MCr/year`,
    {
      font: 'JetBrains Mono',
      size: 18,
      color: COLORS.white,
      bold: true,
      spacing: { before: 120, after: 120 },
      shading: { fill: COLORS.teal },
    }
  ));
  content.push(emptyPara());

  // Section G: Commercial Viability
  content.push(sectionHeader('SECTION G — COMMERCIAL VIABILITY'));

  const rev = ops.revenue;
  content.push(subHeader('REVENUE PER JUMP'));

  const revHeader = makeHeaderRow(['SOURCE', 'QUANTITY', 'RATE', 'REVENUE (MCr)'], [30, 25, 25, 20]);
  const revRows: TableRow[] = [revHeader];

  if (rev.highPassengers > 0) {
    const rate = 10000 * ops.jumpRange;
    const revenue = (rev.highPassengers * rate) / 1e6;
    revRows.push(makeDataRow(['High Passage', String(rev.highPassengers), fmtCr(rate), fmtMCr(revenue)], [30, 25, 25, 20]));
  }
  if (rev.midPassengers > 0) {
    const rate = 2000 * ops.jumpRange;
    const revenue = (rev.midPassengers * rate) / 1e6;
    revRows.push(makeDataRow(['Middle Passage', String(rev.midPassengers), fmtCr(rate), fmtMCr(revenue)], [30, 25, 25, 20]));
  }
  if (rev.lowPassengers > 0) {
    const rate = 500 * ops.jumpRange;
    const revenue = (rev.lowPassengers * rate) / 1e6;
    revRows.push(makeDataRow(['Low Passage', String(rev.lowPassengers), fmtCr(rate), fmtMCr(revenue)], [30, 25, 25, 20]));
  }
  revRows.push(makeDataRow(['Freight', `${rev.freightDtons} DT`, '1,000 Cr/DT/pc', fmtMCr(rev.freightRevenue)], [30, 25, 25, 20]));
  if (rev.mailContracts > 0) {
    revRows.push(makeDataRow(['Mail Contract', '—', '25,000 Cr/jump', fmtMCr(rev.mailContracts)], [30, 25, 25, 20]));
  }
  revRows.push(makeDataRow(['TOTAL', '—', '—', fmtMCr(rev.totalRevenue)], [30, 25, 25, 20], { bold: true }));

  content.push(borderedTable(revRows, 4));
  content.push(emptyPara());

  // Break-even
  content.push(subHeader('BREAK-EVEN ANALYSIS'));
  const be24 = rev.totalRevenue > 0 ? (annual.totalAt24 / rev.totalRevenue).toFixed(1) : 'N/A';
  const margin24 = rev.totalRevenue * 24 - annual.totalAt24;

  content.push(bodyText(`Break-even @ 24 jumps/year: ${be24} jumps`));
  content.push(bodyText(`Annual margin @ 24 jumps/year: ${margin24 >= 0 ? '+' : ''}${margin24.toFixed(3)} MCr`));
  content.push(emptyPara());

  // Status badge
  const isProfitable = margin24 > 0;
  const isMarginal = Math.abs(margin24) <= annual.totalAt24 * 0.05;
  const badgeText = isMarginal ? 'MARGINAL' : isProfitable ? 'PROFITABLE' : 'SUBSIDIZED';
  const badgeColor = isMarginal ? COLORS.amber : isProfitable ? COLORS.teal : COLORS.rust;

  content.push(p(badgeText, {
    align: AlignmentType.CENTER,
    font: 'JetBrains Mono',
    size: 28,
    color: COLORS.white,
    bold: true,
    allCaps: true,
    spacing: { before: 160, after: 160 },
    shading: { fill: badgeColor },
  }));

  return content;
}

function buildPage4(ship: ShipDesign, ops: ShipOperations): DocxChild[] {
  const content: DocxChild[] = [];
  content.push(new Paragraph({ pageBreakBefore: true }));

  // Section H: Escape Systems
  content.push(sectionHeader('SECTION H — ESCAPE SYSTEMS'));

  const esc = ops.escapeSystems;
  const escHeader = makeHeaderRow(['SYSTEM', 'COUNT', 'CAPACITY EACH', 'TOTAL CAPACITY'], [35, 20, 25, 20]);
  const escRows: TableRow[] = [escHeader];

  escRows.push(makeDataRow(['Life Pods (4-person)', String(esc.lifePods), '4', String(esc.lifePods * 4)], [35, 20, 25, 20]));
  if (esc.escapePods > 0) {
    escRows.push(makeDataRow(['Escape Pods (1-person)', String(esc.escapePods), '1', String(esc.escapePods)], [35, 20, 25, 20]));
  }
  if (esc.lifeBoats > 0) {
    escRows.push(makeDataRow(['Life Boats (10-person)', String(esc.lifeBoats), '10', String(esc.lifeBoats * 10)], [35, 20, 25, 20]));
  }
  escRows.push(makeDataRow(['TOTAL EVACUATION CAPACITY', '—', '—', String(esc.totalCapacity)], [35, 20, 25, 20], { bold: true }));

  content.push(borderedTable(escRows, 4));
  content.push(emptyPara());

  // Compliance check
  const personnel = ops.crew.total + (ship.staterooms || 0);
  const compliant = esc.totalCapacity >= personnel;
  content.push(subHeader('COMPLIANCE CHECK'));
  content.push(bodyText(`EVACUATION CAPACITY:    ${esc.totalCapacity} persons`));
  content.push(bodyText(`PERSONNEL ONBOARD:      ${personnel} persons (${ops.crew.total} crew + ${ship.staterooms || 0} passengers)`));
  content.push(p(
    compliant ? 'STATUS: COMPLIANT' : 'STATUS: INSUFFICIENT CAPACITY',
    {
      font: 'JetBrains Mono',
      size: 18,
      color: COLORS.white,
      bold: true,
      spacing: { before: 80, after: 120 },
      shading: { fill: compliant ? COLORS.teal : COLORS.rust },
    }
  ));
  content.push(emptyPara());

  // Authorization
  content.push(sectionHeader('AUTHORIZATION'));

  const authHeader = makeHeaderRow(['COMMANDING OFFICER', 'BUREAU VALIDATION'], [50, 50]);
  const authRows: TableRow[] = [authHeader];
  authRows.push(makeDataRow([
    '\n\n_________________________\nPrint Name & Rank\n\nDate: _______________\n',
    '\n\n_________________________\nCertifying Authority\n\nDate: _______________\n',
  ], [50, 50]));
  content.push(borderedTable(authRows, 2));
  content.push(emptyPara());

  // Security status
  content.push(p('LVL 5 CLEARANCE REQUIRED', {
    align: AlignmentType.RIGHT,
    font: 'JetBrains Mono',
    size: 16,
    color: COLORS.white,
    bold: true,
    spacing: { before: 200, after: 0 },
    shading: { fill: COLORS.ink },
  }));

  return content;
}

// ─── Main Export Function ───

export async function exportShipToDocx(ship: ShipDesign): Promise<Blob> {
  const ops = getOperations(ship);

  const children = [
    ...buildPage1(ship, ops),
    ...buildPage2(ship, ops),
    ...buildPage3(ship, ops),
    ...buildPage4(ship, ops),
  ];

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.5),
            right: convertInchesToTwip(0.5),
            bottom: convertInchesToTwip(0.5),
            left: convertInchesToTwip(0.5),
          },
        },
      },
      children,
    }],
  });

  return await Packer.toBlob(doc);
}
