import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const ROOT_DIR = process.cwd();
const POOL_PATH = path.resolve(ROOT_DIR, 'data/card-pool-whitelist.json');
const CDB_PATH = path.resolve(ROOT_DIR, 'resources/cards.cdb');

const pool: Record<string, any> = JSON.parse(fs.readFileSync(POOL_PATH, 'utf-8'));
const db = new Database(CDB_PATH, { readonly: true });

interface CardRow {
  id: number;
  alias: number;
  type: number;
  name: string;
}

const allCards = db
  .prepare('SELECT datas.id, datas.alias, datas.type, texts.name FROM datas JOIN texts ON datas.id = texts.id')
  .all() as CardRow[];

const nameToCardMap = new Map<string, CardRow[]>();
const idToCardMap = new Map<number, CardRow>();

function normalizeCardName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\u2018\u2019']/g, "'")
    .replace(/[\u2013\u2014-]/g, '-')
    .replace(/\s+/g, ' ');
}

for (const c of allCards) {
  idToCardMap.set(c.id, c);
  const norm = normalizeCardName(c.name);
  if (!nameToCardMap.has(norm)) {
    nameToCardMap.set(norm, []);
  }
  nameToCardMap.get(norm)!.push(c);
}

export function isExtraDeckCardType(type: number): boolean {
  // Fusion: 0x40, Synchro: 0x2000, Xyz: 0x800000, Link: 0x4000000
  return Boolean(type & (0x40 | 0x2000 | 0x800000 | 0x4000000));
}

export function resolveCard(nameOrId: string | number): { id: number; name: string; isExtra: boolean } {
  if (typeof nameOrId === 'number') {
    let card = idToCardMap.get(nameOrId);
    if (!card) {
      throw new Error(`Card ID ${nameOrId} not found in cards.cdb!`);
    }
    // If it's an alternate art, resolve to canonical
    if (card.alias !== 0 && idToCardMap.has(card.alias)) {
      card = idToCardMap.get(card.alias)!;
    }
    if (!pool[String(card.id)]) {
      throw new Error(`Card ID ${card.id} (${card.name}) is missing from card-pool-whitelist.json!`);
    }
    return { id: card.id, name: card.name, isExtra: isExtraDeckCardType(card.type) };
  }

  const norm = normalizeCardName(nameOrId);
  const matches = nameToCardMap.get(norm);
  if (!matches || matches.length === 0) {
    // Try substring / fuzzy lookup
    for (const [key, list] of nameToCardMap.entries()) {
      if (key === norm || key.startsWith(norm) || norm.startsWith(key)) {
        let canonical = list.find((c) => c.alias === 0) || list[0];
        if (canonical.alias !== 0 && idToCardMap.has(canonical.alias)) {
          canonical = idToCardMap.get(canonical.alias)!;
        }
        if (!pool[String(canonical.id)]) {
          throw new Error(`Card ID ${canonical.id} (${canonical.name}) is missing from whitelist!`);
        }
        return { id: canonical.id, name: canonical.name, isExtra: isExtraDeckCardType(canonical.type) };
      }
    }
    throw new Error(`Card "${nameOrId}" could not be resolved in cards.cdb!`);
  }

  let canonical = matches.find((c) => c.alias === 0) || matches[0];
  if (canonical.alias !== 0 && idToCardMap.has(canonical.alias)) {
    canonical = idToCardMap.get(canonical.alias)!;
  }

  if (!pool[String(canonical.id)]) {
    throw new Error(`Card ID ${canonical.id} (${canonical.name}) is missing from whitelist!`);
  }

  return { id: canonical.id, name: canonical.name, isExtra: isExtraDeckCardType(canonical.type) };
}

export interface DeckItemDefinition {
  card: string | number;
  count?: number;
}

export interface DeckDefinition {
  id: string;
  name: string;
  archetype: string;
  description: string;
  characterId: string;
  main: (string | number | [string | number, number])[];
  extra?: (string | number | [string | number, number])[];
  signatureCards?: (string | number)[];
}

export function compileDeck(def: DeckDefinition): {
  id: string;
  name: string;
  archetype: string;
  description: string;
  ydkPath: string;
  mainCards: number[];
  extraCards: number[];
  signatureCardIds: number[];
} {
  const mainCards: number[] = [];
  const extraCards: number[] = [];
  const cardCounts = new Map<number, number>();

  // Process Main Deck
  for (const entry of def.main) {
    let nameOrId: string | number;
    let count = 1;
    if (Array.isArray(entry)) {
      nameOrId = entry[0];
      count = entry[1];
    } else {
      nameOrId = entry;
    }

    const card = resolveCard(nameOrId);
    if (card.isExtra) {
      throw new Error(`Card "${card.name}" in Main Deck of "${def.name}" is an Extra Deck monster!`);
    }

    const current = cardCounts.get(card.id) || 0;
    if (current + count > 3) {
      throw new Error(`Card "${card.name}" in "${def.name}" exceeds 3-copy limit (${current + count})!`);
    }
    cardCounts.set(card.id, current + count);

    for (let i = 0; i < count; i++) {
      mainCards.push(card.id);
    }
  }

  // Process Extra Deck
  if (def.extra) {
    for (const entry of def.extra) {
      let nameOrId: string | number;
      let count = 1;
      if (Array.isArray(entry)) {
        nameOrId = entry[0];
        count = entry[1];
      } else {
        nameOrId = entry;
      }

      const card = resolveCard(nameOrId);
      if (!card.isExtra) {
        throw new Error(`Card "${card.name}" in Extra Deck of "${def.name}" is a Main Deck card!`);
      }

      const current = cardCounts.get(card.id) || 0;
      if (current + count > 3) {
        throw new Error(`Card "${card.name}" in "${def.name}" Extra Deck exceeds 3-copy limit (${current + count})!`);
      }
      cardCounts.set(card.id, current + count);

      for (let i = 0; i < count; i++) {
        extraCards.push(card.id);
      }
    }
  }

  // Validations
  if (mainCards.length < 40) {
    throw new Error(`Deck "${def.name}" for character ${def.characterId} has only ${mainCards.length} Main cards (minimum 40 required)!`);
  }
  if (mainCards.length > 60) {
    throw new Error(`Deck "${def.name}" for character ${def.characterId} has ${mainCards.length} Main cards (maximum 60 allowed)!`);
  }
  if (extraCards.length > 15) {
    throw new Error(`Deck "${def.name}" for character ${def.characterId} has ${extraCards.length} Extra cards (maximum 15 allowed)!`);
  }

  // Signature Cards
  const signatureCardIds: number[] = [];
  if (def.signatureCards && def.signatureCards.length > 0) {
    for (const sig of def.signatureCards) {
      const card = resolveCard(sig);
      if (!signatureCardIds.includes(card.id)) {
        signatureCardIds.push(card.id);
      }
    }
  } else {
    // Default signature: first 2-3 main cards
    for (const cid of mainCards.slice(0, 2)) {
      if (!signatureCardIds.includes(cid)) signatureCardIds.push(cid);
    }
  }

  const ydkFilename = `${def.id}.ydk`;
  const ydkPath = `resources/decks/${ydkFilename}`;

  return {
    id: def.id,
    name: def.name,
    archetype: def.archetype,
    description: def.description,
    ydkPath,
    mainCards,
    extraCards,
    signatureCardIds,
  };
}

export function compileDecks(defs: DeckDefinition[]) {
  return defs.map(compileDeck);
}
