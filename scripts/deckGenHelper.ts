import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import type { CharacterData, CharacterDeckData } from '../src/shared/types/character.js';
import type { CustomDeck } from '../src/shared/types/deck.js';

interface WhitelistCard {
  id: number;
  name: string;
  era: string;
  type: string;
  atk?: number;
  def?: number;
  level?: number;
  race?: string;
  attribute?: string;
}

const ROOT_DIR = process.cwd();
const POOL_PATH = path.resolve(ROOT_DIR, 'data/card-pool-whitelist.json');
const CDB_PATH = path.resolve(ROOT_DIR, 'resources/cards.cdb');
const DECKS_DIR = path.resolve(ROOT_DIR, 'resources/decks');

if (!fs.existsSync(DECKS_DIR)) {
  fs.mkdirSync(DECKS_DIR, { recursive: true });
}

const pool: Record<string, WhitelistCard> = JSON.parse(fs.readFileSync(POOL_PATH, 'utf-8'));
const db = new Database(CDB_PATH, { readonly: true });
const checkDbStmt = db.prepare('SELECT id FROM datas WHERE id = ?');

const nameToCardMap = new Map<string, WhitelistCard>();
for (const card of Object.values(pool)) {
  nameToCardMap.set(card.name.trim().toLowerCase(), card);
}

export function findCardId(nameOrId: string | number): number {
  if (typeof nameOrId === 'number') {
    if (pool[String(nameOrId)]) return nameOrId;
    throw new Error(`Card ID ${nameOrId} not found in whitelist!`);
  }
  const norm = nameOrId.trim().toLowerCase();
  const direct = nameToCardMap.get(norm);
  if (direct) return direct.id;

  for (const [key, card] of nameToCardMap.entries()) {
    if (key === norm || key.startsWith(norm) || key.includes(norm)) {
      return card.id;
    }
  }
  throw new Error(`Card "${nameOrId}" not found in whitelist!`);
}

export function findCardsByCriteria(criteria: {
  race?: string;
  type?: string;
  attribute?: string;
  nameContains?: string;
  minAtk?: number;
  maxAtk?: number;
  level?: number;
  era?: string;
}): WhitelistCard[] {
  return Object.values(pool).filter((card) => {
    if (criteria.race && card.race !== criteria.race) return false;
    if (criteria.type && !card.type.toLowerCase().includes(criteria.type.toLowerCase()))
      return false;
    if (criteria.attribute && card.attribute !== criteria.attribute) return false;
    if (
      criteria.nameContains &&
      !card.name.toLowerCase().includes(criteria.nameContains.toLowerCase())
    )
      return false;
    if (criteria.minAtk !== undefined && (card.atk ?? 0) < criteria.minAtk) return false;
    if (criteria.maxAtk !== undefined && (card.atk ?? 0) > criteria.maxAtk) return false;
    if (criteria.level !== undefined && card.level !== criteria.level) return false;
    if (criteria.era && card.era !== criteria.era) return false;
    return true;
  });
}

export const DM_GX_STAPLES = [
  'Pot of Greed',
  'Graceful Charity',
  'Raigeki',
  'Dark Hole',
  'Monster Reborn',
  'Premature Burial',
  'Mystical Space Typhoon',
  'Heavy Storm',
  'Swords of Revealing Light',
  'Snatch Steal',
  'Change of Heart',
  'Mirror Force',
  'Torrential Tribute',
  'Call of the Haunted',
  'Ring of Destruction',
  'Magic Cylinder',
  'Sakuretsu Armor',
  'Bottomless Trap Hole',
  'Compulsory Evacuation Device',
  'Sangan',
  'Witch of the Black Forest',
  'Kuriboh',
  'Marshmallon',
  'Scapegoat',
  'Card Destruction',
  'Dust Tornado',
  'Smashing Ground',
  'Fissure',
];

export function buildDeck(
  keyCards: (string | number)[],
  fillCriteria: {
    race?: string;
    type?: string;
    attribute?: string;
    nameContains?: string;
    era?: string;
  },
  extraCardNamesOrIds: (string | number)[] = [],
): { main: number[]; extra: number[]; signature: number[] } {
  const main: number[] = [];
  const signature: number[] = [];

  for (const item of keyCards) {
    try {
      const id = findCardId(item);
      if (signature.length < 3) signature.push(id);
      const currentCount = main.filter((c) => c === id).length;
      if (currentCount < 3) {
        main.push(id);
      }
    } catch (e) {
      console.warn(`[DeckGen Warning] ${e}`);
    }
  }

  const poolCandidates = findCardsByCriteria(fillCriteria);
  let poolIdx = 0;
  while (main.length < 32 && poolIdx < poolCandidates.length) {
    const card = poolCandidates[poolIdx++];
    if (card.type.toLowerCase().includes('fusion')) continue;
    const count = main.filter((id) => id === card.id).length;
    if (count < 3) {
      main.push(card.id);
    }
  }

  let stapleIdx = 0;
  while (main.length < 40 && stapleIdx < DM_GX_STAPLES.length) {
    try {
      const stapleId = findCardId(DM_GX_STAPLES[stapleIdx++]);
      const count = main.filter((id) => id === stapleId).length;
      if (count < 1) {
        main.push(stapleId);
      }
    } catch {
      // ignore
    }
  }

  let dupIdx = 0;
  while (main.length < 40 && dupIdx < main.length) {
    const id = main[dupIdx++];
    const count = main.filter((c) => c === id).length;
    if (count < 3) {
      main.push(id);
    }
  }

  const finalMain = main.slice(0, 40);

  const extra: number[] = [];
  for (const item of extraCardNamesOrIds) {
    try {
      const id = findCardId(item);
      extra.push(id);
    } catch (e) {
      console.warn(`[DeckGen Extra Warning] ${e}`);
    }
  }

  return { main: finalMain, extra, signature };
}

export function writeYdkFile(filepath: string, mainCards: number[], extraCards: number[]): void {
  let content = '#created by YGO Desktop Duel Engine\n#main\n';
  for (const id of mainCards) {
    content += `${id}\n`;
  }
  content += '#extra\n';
  for (const id of extraCards) {
    content += `${id}\n`;
  }
  content += '!side\n';
  fs.writeFileSync(filepath, content, 'utf-8');
}
