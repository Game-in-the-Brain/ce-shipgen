import type { EncounterCrew, CrewRole } from '../types/encounter';

const FIRST_NAMES = [
  'Akira', 'Bao', 'Chen', 'Dmitri', 'Elena', 'Fatima', 'Goro', 'Hassan',
  'Ingrid', 'Jin', 'Kofi', 'Lena', 'Mikhail', 'Nia', 'Omar', 'Priya',
  'Quinn', 'Ravi', 'Sven', 'Tara', 'Umar', 'Viktor', 'Wang', 'Xiu',
  'Yuki', 'Zara', 'Abe', 'Boris', 'Carmen', 'Diana', 'Evan', 'Faye',
];

const LAST_NAMES = [
  'Volkov', 'Zhang', 'Patel', 'Kim', 'Ivanov', 'Al-Farsi', 'Sato', 'Okafor',
  'Jensen', 'Singh', 'Kowalski', 'Tanaka', 'Müller', 'Rossi', 'Silva', 'Nkosi',
  'Chen', 'Park', 'Ali', 'Popov', 'Yamamoto', 'Dubois', 'Schmidt', 'Ferrari',
];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function roll2D6(): number {
  return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
}

function roll1D6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function generateName(): string {
  return `${randomPick(FIRST_NAMES)} ${randomPick(LAST_NAMES)}`;
}

function tlBonus(tl: number): number {
  return Math.floor(tl / 3);
}

export function generateCrew(role: CrewRole, tl: number): EncounterCrew {
  const baseSkill = roll1D6() + tlBonus(tl);

  const stats: EncounterCrew['stats'] = {
    int: roll2D6() + tlBonus(tl),
    dex: roll2D6() + tlBonus(tl),
    edu: roll2D6() + tlBonus(tl),
    skill: baseSkill,
  };

  // Role-specific skill bonuses
  switch (role) {
    case 'captain':
      stats.leadership = baseSkill + 2;
      stats.tactics = baseSkill + 1;
      break;
    case 'navcomm':
      stats.sensors = baseSkill + 2;
      break;
    case 'pilot':
      stats.piloting = baseSkill + 2;
      break;
    case 'gunner':
      stats.gunnery = baseSkill + 2;
      break;
    case 'engineer':
      stats.engineering = baseSkill + 2;
      break;
    case 'sensor':
      stats.sensors = baseSkill + 1;
      break;
    case 'captain_assistant':
      stats.leadership = baseSkill;
      break;
    case 'navcomm_assistant':
      stats.sensors = baseSkill;
      break;
    case 'copilot':
      stats.piloting = baseSkill + 1;
      break;
  }

  return {
    id: `crew-${role}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: generateName(),
    role,
    stats,
    status: 'active',
    reactionsUsed: 0,
  };
}

export function generateCrewForShip(tl: number, weaponCount: number): EncounterCrew[] {
  const crew: EncounterCrew[] = [];

  // Captain always present
  crew.push(generateCrew('captain', tl));

  // NavComm always present
  crew.push(generateCrew('navcomm', tl));

  // Pilot always present
  crew.push(generateCrew('pilot', tl));

  // Gunner: 1 per weapon mount
  const gunners = Math.max(1, weaponCount);
  for (let i = 0; i < gunners; i++) {
    crew.push(generateCrew('gunner', tl));
  }

  // Engineer
  crew.push(generateCrew('engineer', tl));

  // Sensor operator (if sensors exist)
  crew.push(generateCrew('sensor', tl));

  // Additional crew for larger ships
  if (crew.length >= 6) {
    // Captain's Assistant
    crew.push(generateCrew('captain_assistant', tl));
  }
  if (crew.length >= 8) {
    // NavComm Assistant
    crew.push(generateCrew('navcomm_assistant', tl));
  }
  if (crew.length >= 10) {
    // Copilot
    crew.push(generateCrew('copilot', tl));
  }

  // Medic (if crew > 5)
  if (crew.length >= 5) {
    crew.push(generateCrew('medic', tl));
  }

  return crew;
}

export function generateMoreCrew(_existing: EncounterCrew[], role: CrewRole, tl: number): EncounterCrew {
  return generateCrew(role, tl);
}
