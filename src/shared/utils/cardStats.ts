// =============================================================================
// Shared Card Stats & Trap Monster Parsing Utilities
// =============================================================================

export interface ParsedTrapMonsterStats {
  race?: string;
  attribute?: string;
  level?: number;
  atk?: number;
  def?: number;
}

const KNOWN_ATTRIBUTES = new Set(['LIGHT', 'DARK', 'WATER', 'FIRE', 'EARTH', 'WIND', 'DIVINE']);

/**
 * Parses dynamic monster stats from a Trap Monster / Spell Token description text.
 * Handles patterns such as:
 * - "Special Summon this card in Defense Position as an Effect Monster (Zombie/DARK/Level 4/ATK 1800/DEF 500)."
 * - "Special Summon this card as a Normal Monster (Reptile-Type/EARTH/Level 4/ATK 1600/DEF 1800)."
 * - "Special Summon this card in Defense Position as an Effect Monster (Aqua/WATER/Level 10/ATK 0/DEF 3000)."
 */
export function parseTrapMonsterStats(desc?: string): ParsedTrapMonsterStats {
  if (!desc) return {};

  const match = desc.match(/\(([^)]*?ATK\s*[\d?]+\/DEF\s*[\d?]+[^)]*?)\)/i);
  if (!match) return {};

  const parts = match[1].split('/').map((s) => s.trim());
  let race: string | undefined;
  let attribute: string | undefined;
  let level: number | undefined;
  let atk: number | undefined;
  let def: number | undefined;

  for (const part of parts) {
    const upper = part.toUpperCase();
    if (KNOWN_ATTRIBUTES.has(upper)) {
      attribute = upper;
    } else if (upper.startsWith('LEVEL') || upper.startsWith('RANK')) {
      const num = parseInt(part.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(num)) level = num;
    } else if (upper.startsWith('ATK')) {
      const val = part.replace(/^ATK\s*/i, '').trim();
      atk = val === '?' ? -1 : parseInt(val, 10);
    } else if (upper.startsWith('DEF')) {
      const val = part.replace(/^DEF\s*/i, '').trim();
      def = val === '?' ? -1 : parseInt(val, 10);
    } else if (part.length > 0) {
      race = part.replace(/-Type$/i, '').trim();
    }
  }

  return { race, attribute, level, atk, def };
}

/**
 * Determines whether a card on the field / in hand / in deck should currently be
 * treated as a monster with monster visual properties (ATK, DEF, Level stars).
 *
 * Rules:
 * 1. If currently in a Monster Zone (or Extra Monster Zone), it is ALWAYS treated as a monster
 *    (e.g., Trap Monsters like Zoma the Spirit, Embodiment of Apophis, Metal Reflect Slime).
 * 2. If currently in a Spell/Trap Zone (or Field Zone), it is NEVER treated as a monster
 *    (e.g., monsters equipped to Relinquished, Snatch Steal, Union monsters, Crystal Beasts in SZONE).
 * 3. In other zones (hand, grave, banished, deck, extra), it relies on its base card definition.
 */
export function isTreatedAsMonster(location: string, isBaseMonster: boolean): boolean {
  if (location === 'monster' || location === 'extra-monster') {
    return true;
  }
  if (location === 'spell-trap' || location === 'field') {
    return false;
  }
  return isBaseMonster;
}
