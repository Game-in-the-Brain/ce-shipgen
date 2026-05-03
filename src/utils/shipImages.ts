/**
 * Ship Image Mapping
 * Links ships in the library to their token and deckplan images
 */

export interface ShipImageSet {
  tokens: string[];      // Paths to token PNGs
  deckplans: string[];   // Paths to deckplan images
  hasToken: boolean;
  hasDeckplan: boolean;
}

const TOKEN_BASE = '/images/tokens';
const DECKPLAN_BASE = '/images/deckplans';

// Token mappings by ship name pattern
const TOKEN_MAP: Record<string, string[]> = {
  'frontier trader': ['Frontier Trader.png'],
  'merchant liner': [
    'Merchant Liner A.png', 'Merchant Liner B.png', 'Merchant Liner C.png',
    'Merchant Liner D.png', 'Merchant Liner D1.png', 'Merchant Liner D2.png',
    'Merchant Liner Original.png'
  ],
  'boat': [
    'Ship Tokens 2 Boat A.png', 'Ship Tokens 2 Boat B.png', 'Ship Tokens 2 Boat C.png',
    'Ship Tokens 2 Boat D.png', 'Ship Tokens 2 Boat E.png'
  ],
  "ship's boat": [
    'Ship Tokens 2 Boat A.png', 'Ship Tokens 2 Boat B.png', 'Ship Tokens 2 Boat C.png',
    'Ship Tokens 2 Boat D.png', 'Ship Tokens 2 Boat E.png'
  ],
  'shuttle': [
    'Ship Tokens 2 Boat A.png', 'Ship Tokens 2 Boat B.png', 'Ship Tokens 2 Boat C.png',
    'Ship Tokens 2 Boat D.png', 'Ship Tokens 2 Boat E.png'
  ],
  'courier': [
    'Ship Tokens 2 Courier A.png', 'Ship Tokens 2 Courier B.png', 'Ship Tokens 2 Courier C.png',
    'Ship Tokens 2 Courier D.png', 'Ship Tokens 2 Courier E.png'
  ],
  'tender': [
    'Ship Tokens 2 Courier A.png', 'Ship Tokens 2 Courier B.png', 'Ship Tokens 2 Courier C.png',
    'Ship Tokens 2 Courier D.png', 'Ship Tokens 2 Courier E.png'
  ],
  'yacht': [
    'Ship Tokens 2 Courier A.png', 'Ship Tokens 2 Courier B.png', 'Ship Tokens 2 Courier C.png',
    'Ship Tokens 2 Courier D.png', 'Ship Tokens 2 Courier E.png'
  ],
  'escort frigate': [
    'Ship Tokens 2 Escort Frigate A.png', 'Ship Tokens 2 Escort Frigate B.png',
    'Ship Tokens 2 Escort Frigate C.png', 'Ship Tokens 2 Escort Frigate D.png',
    'Ship Tokens 2 Escort Frigate E.png'
  ],
  'fighter': [
    'Ship Tokens 2 FIghter A.png', 'Ship Tokens 2 FIghter B.png',
    'Ship Tokens 2 FIghter C.png', 'Ship Tokens 2 FIghter D.png',
    'Ship Tokens 2 FIghter E.png',
    'Ship Tokens 2 Light Fighter A.png', 'Ship Tokens 2 Light Fighter B.png',
    'Ship Tokens 2 Light Fighter C.png', 'Ship Tokens 2 Light Fighter D.png',
    'Ship Tokens 2 Light Fighter E.png',
    'Ship Tokens 2 Small FIghter A.png', 'Ship Tokens 2 Small FIghter B.png',
    'Ship Tokens 2 Small FIghter C.png', 'Ship Tokens 2 Small FIghter D.png',
    'Ship Tokens 2 Small FIghter E.png'
  ],
  'merchant trader': [
    'Ship Tokens 2 Merchant A.png', 'Ship Tokens 2 Merchant B.png',
    'Ship Tokens 2 Merchant C.png', 'Ship Tokens 2 Merchant D.png',
    'Ship Tokens 2 Merchant E.png'
  ],
  'merchant freighter': [
    'Ship Tokens 2 Merchant Freighter A.png', 'Ship Tokens 2 Merchant Freighter B.png',
    'Ship Tokens 2 Merchant Freighter C.png', 'Ship Tokens 2 Merchant Freighter D.png',
    'Ship Tokens 2 Merchant Freighter E.png'
  ],
  'missile frigate': [
    'Ship Tokens 2 Missile Frigate A.png', 'Ship Tokens 2 Missile Frigate B.png',
    'Ship Tokens 2 Missile Frigate C.png', 'Ship Tokens 2 Missile Frigate D.png',
    'Ship Tokens 2 Missile Frigate E.png'
  ],
  'raider': [
    'Ship Tokens 2 Raider A.png', 'Ship Tokens 2 Raider B.png',
    'Ship Tokens 2 Raider C.png', 'Ship Tokens 2 Raider D.png',
    'Ship Tokens 2 Raider E.png'
  ],
};

// Deckplan mappings by ship name pattern
const DECKPLAN_MAP: Record<string, string[]> = {
  'courier': ['231024_courier_100DT_00.png'],
  'escort frigate': ['231024_escort_frigate_400DT_00.png'],
  'fighter': [
    '231024_fighter_A_10DT_00.png',
    '231024_fighter_B_10DT_00.png',
    '231024_fighter_C_10DT_00.png'
  ],
  'merchant freighter': [
    '231024_merchant_freighter_400DT_00.png',
    '231024_merchant_freighter_400DT_01.png',
    '231024_TL9_Merchant_Freighter_400DT.jpg'
  ],
  'merchant trader': ['231024_merchant_trader_01.png'],
  'missile frigate': ['231024_missile_frigate_01.png'],
  'raider': ['231024_raider_02.png'],
  "ship's boat": ['231024_ships_boat_30DT_00.png'],
  'shuttle': ['231024_ships_boat_30DT_00.png'],
};

function matchPattern(name: string, pattern: string): boolean {
  const n = name.toLowerCase();
  const p = pattern.toLowerCase();
  return n.includes(p);
}

export function getShipImages(shipName: string, _hullDtons: number): ShipImageSet {
  const name = shipName.toLowerCase();
  const tokens: string[] = [];
  const deckplans: string[] = [];

  // Find token matches
  for (const [pattern, files] of Object.entries(TOKEN_MAP)) {
    if (matchPattern(name, pattern)) {
      tokens.push(...files.map(f => `${TOKEN_BASE}/${f}`));
    }
  }

  // Find deckplan matches
  for (const [pattern, files] of Object.entries(DECKPLAN_MAP)) {
    if (matchPattern(name, pattern)) {
      deckplans.push(...files.map(f => `${DECKPLAN_BASE}/${f}`));
    }
  }

  // Remove duplicates
  return {
    tokens: [...new Set(tokens)],
    deckplans: [...new Set(deckplans)],
    hasToken: tokens.length > 0,
    hasDeckplan: deckplans.length > 0,
  };
}

export function getRandomToken(shipName: string, hullDtons: number): string | null {
  const images = getShipImages(shipName, hullDtons);
  if (!images.hasToken) return null;
  return images.tokens[Math.floor(Math.random() * images.tokens.length)];
}

export function getAllShipImagePaths(): { tokens: string[]; deckplans: string[] } {
  const tokens = Object.values(TOKEN_MAP).flat().map(f => `${TOKEN_BASE}/${f}`);
  const deckplans = Object.values(DECKPLAN_MAP).flat().map(f => `${DECKPLAN_BASE}/${f}`);
  return {
    tokens: [...new Set(tokens)],
    deckplans: [...new Set(deckplans)]
  };
}
