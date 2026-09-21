import {
  OcgMessageType,
  OcgResponseType,
  OcgLocation,
  OcgPosition,
  OcgRace,
  OcgAttribute,
  SelectIdleCMDAction,
  SelectBattleCMDAction,
  type SelectFieldPlace,
  type OcgMessage,
  type OcgResponse,
  ocgPositionParse,
  ocgPhaseString,
} from 'ocgcore-wasm';
import { CardReaderService } from './cardReader.js';
import { RACE_NAME_MAP, ATTRIBUTE_NAME_MAP } from '../../shared/types/card.js';

export interface DecodedDuelEvent {
  type: string;
  rawType: number;
  player?: number;
  controller?: number;
  fromController?: number;
  code?: number;
  cardName?: string;
  location?: number;
  sequence?: number;
  position?: number;
  fromLocation?: number;
  fromSequence?: number;
  toLocation?: number;
  toSequence?: number;
  drawn?: { code: number; position: number; cardName: string }[];
  count?: number;
  phase?: string;
  turn?: number;
  amount?: number;
  lp?: number;
  reason?: number;
  target?: unknown;
  drawnCards?: { code: number; cardName: string }[];
  cards?: any[];
  fieldStats?: Array<{
    controller: 0 | 1;
    sequence: number;
    atk?: number;
    def?: number;
    level?: number;
    baseAtk?: number;
    baseDef?: number;
  }>;
  fieldMask?: number;
  disabledZones?: {
    p0Monster: number[];
    p0SpellTrap: number[];
    p1Monster: number[];
    p1SpellTrap: number[];
    extraMonster: number[];
  };
  equipCard?: { controller: number; location: number; sequence: number; position: number; cardName?: string };
  targetCard?: { controller: number; location: number; sequence: number; position: number; cardName?: string };
  hintType?: number;
  hintText?: string;
  turnCounter?: number;
  chainSize?: number;
  deckSize?: number;
  returnedToExtra?: number[];
  name?: string;
  descriptionText?: string;
  hintVal?: any;
  card?: any;
  card1?: any;
  card2?: any;
  isPrompt: boolean;
  promptPlayer?: number;
  promptType?: string;
  promptData?: unknown;
  description: string;
  raw: unknown;
}

/**
 * Parses the ocgcore field_mask bitmask for SELECT_PLACE / SELECT_DISFIELD.
 * The standard OCGCORE bit layout:
 * - Bits 0..4 (0x1F): Player's own Main Monster Zones (0..4)
 * - Bit 5 (0x20): Player's own Extra Monster Zone 0 (sequence 5)
 * - Bit 6 (0x40): Player's own Extra Monster Zone 1 (sequence 6)
 * - Bits 8..12 (0x1F00): Player's own Spell/Trap Zones (0..4)
 * - Bit 13 (0x2000): Player's own Field Spell Zone (0)
 * - Bits 16..20 (0x1F0000): Opponent's Main Monster Zones (0..4)
 * - Bit 21 (0x200000): Opponent's Extra Monster Zone 0 (sequence 5)
 * - Bit 22 (0x400000): Opponent's Extra Monster Zone 1 (sequence 6)
 * - Bits 24..28 (0x1F000000): Opponent's Spell/Trap Zones (0..4)
 * - Bit 29 (0x20000000): Opponent's Field Spell Zone (0)
 */
export function parseFieldMask(
  player: number,
  fieldMask: number,
  count: number,
): SelectFieldPlace[] {
  const places: SelectFieldPlace[] = [];
  const mask = ~fieldMask >>> 0;

  // 1. Player's own Monster Zones (bits 0..6: 0..4 = MMZ, 5..6 = EMZ)
  for (let seq = 0; seq < 7; seq++) {
    if ((mask & (1 << seq)) !== 0) {
      places.push({ player, location: OcgLocation.MZONE, sequence: seq });
      if (places.length === count) return places;
    }
  }

  // 2. Player's own Spell/Trap Zones (bits 8..12)
  for (let seq = 0; seq < 5; seq++) {
    if ((mask & (1 << (seq + 8))) !== 0) {
      places.push({ player, location: OcgLocation.SZONE, sequence: seq });
      if (places.length === count) return places;
    }
  }

  // 3. Player's own Field Zone (bit 13)
  if ((mask & (1 << 13)) !== 0) {
    places.push({ player, location: OcgLocation.FZONE, sequence: 0 });
    if (places.length === count) return places;
  }

  // 4. Opponent's Monster Zones (bits 16..22: 16..20 = MMZ, 21..22 = EMZ)
  for (let seq = 0; seq < 7; seq++) {
    if ((mask & (1 << (seq + 16))) !== 0) {
      places.push({ player: 1 - player, location: OcgLocation.MZONE, sequence: seq });
      if (places.length === count) return places;
    }
  }

  // 5. Opponent's Spell/Trap Zones (bits 24..28)
  for (let seq = 0; seq < 5; seq++) {
    if ((mask & (1 << (seq + 24))) !== 0) {
      places.push({ player: 1 - player, location: OcgLocation.SZONE, sequence: seq });
      if (places.length === count) return places;
    }
  }

  // 6. Opponent's Field Zone (bit 29)
  if ((mask & (1 << 29)) !== 0) {
    places.push({ player: 1 - player, location: OcgLocation.FZONE, sequence: 0 });
    if (places.length === count) return places;
  }

  return places;
}

/**
 * Returns the "first legal option" auto-response for any prompt from the engine.
 */
export function getAutoResponse(msg: OcgMessage): OcgResponse | null {
  switch (msg.type) {
    case OcgMessageType.SELECT_IDLECMD: {
      // 1. Activate available spell/trap/monster effects
      if (msg.activates && msg.activates.length > 0) {
        return {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.SELECT_ACTIVATE,
          index: 0,
        };
      }
      // 2. Normal Summon available monsters
      if (msg.summons && msg.summons.length > 0) {
        return {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.SELECT_SUMMON,
          index: 0,
        };
      }
      // 3. Special Summon if available
      if (msg.special_summons && msg.special_summons.length > 0) {
        return {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.SELECT_SPECIAL_SUMMON,
          index: 0,
        };
      }
      // 4. Set spells/traps if available
      if (msg.spell_sets && msg.spell_sets.length > 0) {
        return {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.SELECT_SPELL_SET,
          index: 0,
        };
      }
      // 5. Enter Battle Phase if permitted
      if (msg.to_bp) {
        return {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.TO_BP,
          index: null,
        };
      }
      // 6. Otherwise proceed to End Phase
      if (msg.to_ep) {
        return {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.TO_EP,
          index: null,
        };
      }
      return null;
    }

    case OcgMessageType.SELECT_BATTLECMD: {
      // 1. Attack with first available monster
      if (msg.attacks && msg.attacks.length > 0) {
        return {
          type: OcgResponseType.SELECT_BATTLECMD,
          action: SelectBattleCMDAction.SELECT_BATTLE,
          index: 0,
        };
      }
      // 2. Chain/activate during battle step if available
      if (msg.chains && msg.chains.length > 0) {
        return {
          type: OcgResponseType.SELECT_BATTLECMD,
          action: SelectBattleCMDAction.SELECT_CHAIN,
          index: 0,
        };
      }
      // 3. Move to Main Phase 2 or End Phase
      if (msg.to_m2) {
        return {
          type: OcgResponseType.SELECT_BATTLECMD,
          action: SelectBattleCMDAction.TO_M2,
          index: null,
        };
      }
      if (msg.to_ep) {
        return {
          type: OcgResponseType.SELECT_BATTLECMD,
          action: SelectBattleCMDAction.TO_EP,
          index: null,
        };
      }
      return null;
    }

    case OcgMessageType.SELECT_CHAIN: {
      return {
        type: OcgResponseType.SELECT_CHAIN,
        index: msg.forced && msg.selects.length > 0 ? 0 : null,
      };
    }

    case OcgMessageType.SELECT_EFFECTYN: {
      return {
        type: OcgResponseType.SELECT_EFFECTYN,
        yes: true,
      };
    }

    case OcgMessageType.SELECT_YESNO: {
      return {
        type: OcgResponseType.SELECT_YESNO,
        yes: true,
      };
    }

    case OcgMessageType.SELECT_OPTION: {
      return {
        type: OcgResponseType.SELECT_OPTION,
        index: 0,
      };
    }

    case OcgMessageType.SELECT_CARD: {
      const minCount = Math.max(1, msg.min ?? 1);
      const count = Math.min(minCount, msg.selects.length);
      const indicies = Array.from({ length: count }, (_, i) => i);
      return {
        type: OcgResponseType.SELECT_CARD,
        indicies,
      };
    }

    case OcgMessageType.SELECT_POSITION: {
      const positions = ocgPositionParse(msg.positions);
      return {
        type: OcgResponseType.SELECT_POSITION,
        position: positions[0] ?? OcgPosition.FACEUP_ATTACK,
      };
    }

    case OcgMessageType.SELECT_TRIBUTE: {
      const minCount = Math.max(1, msg.min ?? 1);
      const indicies: number[] = [];
      let totalTribute = 0;
      for (let i = 0; i < (msg.selects?.length || 0); i++) {
        indicies.push(i);
        const param = (msg.selects[i] as any)?.release_param || 1;
        totalTribute += param;
        if (totalTribute >= minCount) break;
      }
      return {
        type: OcgResponseType.SELECT_TRIBUTE,
        indicies,
      };
    }

    case OcgMessageType.SELECT_PLACE:
    case OcgMessageType.SELECT_DISFIELD: {
      const minCount = Math.max(1, msg.count || 1);
      const places = parseFieldMask(msg.player, msg.field_mask, minCount);
      if (!places || places.length < minCount) return null;
      return {
        type: msg.type === OcgMessageType.SELECT_DISFIELD ? OcgResponseType.SELECT_DISFIELD : OcgResponseType.SELECT_PLACE,
        places,
      };
    }

    case OcgMessageType.SELECT_SUM: {
      const candidates = [...(msg.selects_must || []), ...(msg.selects || [])];
      if (candidates.length === 0) {
        return {
          type: OcgResponseType.SELECT_SUM,
          indicies: [],
        };
      }

      const targetSum = msg.amount ?? 0;
      const minCount = Math.max(1, msg.min || 1);
      const maxCount = msg.max && msg.max > 0 ? msg.max : candidates.length;
      const isEqualMode = msg.select_max === 0; // 0: Equal, 1: Greater or equal (or vice versa)

      // Helper to get card values (primary level and alternate ritual tribute level if any)
      const getCardValues = (c: any): number[] => {
        const rawAmt = c.amount ?? 0;
        const v1 = rawAmt & 0xffff;
        const v2 = (rawAmt >> 16) & 0xffff;
        const values: number[] = [];
        if (v1 > 0) values.push(v1);
        if (v2 > 0 && v2 !== v1) values.push(v2);
        if (values.length === 0) values.push(1);
        return values;
      };

      // Find combination of indices satisfying the sum condition
      let bestIndices: number[] | null = null;
      let bestSum = Infinity;

      const search = (
        idx: number,
        currentIndices: number[],
        currentSum: number,
      ) => {
        if (currentIndices.length >= minCount && currentIndices.length <= maxCount) {
          if (isEqualMode && currentSum === targetSum) {
            bestIndices = [...currentIndices];
            return true;
          } else if (!isEqualMode && currentSum >= targetSum) {
            if (currentSum < bestSum) {
              bestSum = currentSum;
              bestIndices = [...currentIndices];
            }
            // Once we reach or exceed in greater mode, don't keep adding cards unnecessarily
            return;
          }
        }

        if (idx >= candidates.length || currentIndices.length >= maxCount) {
          return;
        }

        // Try including candidate idx
        const vals = getCardValues(candidates[idx]);
        for (const v of vals) {
          currentIndices.push(idx);
          const foundExact = search(idx + 1, currentIndices, currentSum + v);
          currentIndices.pop();
          if (foundExact) return true;
        }

        // Try skipping candidate idx
        const found = search(idx + 1, currentIndices, currentSum);
        if (found) return true;

        return false;
      };

      search(0, [], 0);

      const indicies = bestIndices ?? Array.from({ length: Math.min(minCount, candidates.length) }, (_, i) => i);
      return {
        type: OcgResponseType.SELECT_SUM,
        indicies,
      };
    }

    case OcgMessageType.SELECT_UNSELECT_CARD: {
      if (msg.select_cards && msg.select_cards.length > 0) {
        return {
          type: OcgResponseType.SELECT_UNSELECT_CARD,
          index: 0,
        };
      }
      return {
        type: OcgResponseType.SELECT_UNSELECT_CARD,
        index: null,
      };
    }

    case OcgMessageType.ANNOUNCE_RACE: {
      const avail = (msg as any).available !== undefined && (msg as any).available !== null ? BigInt((msg as any).available) : 0n;
      const count = (msg as any).count ?? 1;
      const validRaces: bigint[] = [];
      if (avail > 0n) {
        for (const raceVal of Object.values(OcgRace)) {
          if (typeof raceVal === 'bigint' && (avail & raceVal) !== 0n) {
            validRaces.push(raceVal);
            if (validRaces.length >= count) break;
          }
        }
      }
      return {
        type: OcgResponseType.ANNOUNCE_RACE,
        races: validRaces.length > 0 ? validRaces : [OcgRace.WARRIOR],
      };
    }

    case OcgMessageType.ANNOUNCE_ATTRIB: {
      const avail = typeof (msg as any).available === 'number' ? (msg as any).available : ((msg as any).available ? Number((msg as any).available) : 0);
      const count = (msg as any).count ?? 1;
      const validAttrs: number[] = [];
      if (avail > 0) {
        for (const attrVal of Object.values(OcgAttribute)) {
          if (typeof attrVal === 'number' && (avail & attrVal) !== 0) {
            validAttrs.push(attrVal);
            if (validAttrs.length >= count) break;
          }
        }
      }
      return {
        type: OcgResponseType.ANNOUNCE_ATTRIB,
        attributes: validAttrs.length > 0 ? validAttrs : [OcgAttribute.DARK],
      };
    }

    case OcgMessageType.ANNOUNCE_CARD: {
      return {
        type: OcgResponseType.ANNOUNCE_CARD,
        card: 91152256, // Celtic Guardian
      };
    }

    case OcgMessageType.ANNOUNCE_NUMBER: {
      return {
        type: OcgResponseType.ANNOUNCE_NUMBER,
        value: 0,
        index: 0,
      };
    }

    case OcgMessageType.ROCK_PAPER_SCISSORS: {
      return {
        type: OcgResponseType.ROCK_PAPER_SCISSORS,
        value: 2, // Rock
      };
    }

    case OcgMessageType.SORT_CHAIN:
    case OcgMessageType.SORT_CARD: {
      return {
        type: OcgResponseType.SORT_CARD,
        order: null,
      };
    }

    case OcgMessageType.SELECT_COUNTER: {
      let remaining = msg.count ?? 0;
      const counters: number[] = [];
      for (const c of msg.cards ?? []) {
        const take = Math.min(remaining, c.count ?? 0);
        counters.push(take);
        remaining -= take;
      }
      return {
        type: OcgResponseType.SELECT_COUNTER,
        counters,
      };
    }

    default:
      return null;
  }
}

/**
 * Convert any BigInt values in an object to strings for safe JSON/IPC serialization.
 */
export function sanitizeBigInts<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return (obj as bigint).toString() as unknown as T;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeBigInts(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = sanitizeBigInts(v);
    }
    return res as unknown as T;
  }
  return obj;
}

export class MessageDecoder {
  private cardReader: CardReaderService;
  private lastAttackCard: { code: number; controller?: number; location?: number; sequence?: number; can_direct?: boolean } | null = null;
  private lastChainingCard: { code: number; player: number } | null = null;
  private lastHintCard: number | null = null;
  private lastActivatedCard: { code: number; player?: number } | null = null;

  // Tracks confirmed cards known to each player: confirmedCards[viewerPlayerId].get(`${controller}:${location}:${sequence}`) -> code
  private confirmedCards: [Map<string, number>, Map<string, number>] = [new Map(), new Map()];

  constructor(cardReader: CardReaderService) {
    this.cardReader = cardReader;
  }

  public resetConfirmedCards(): void {
    this.confirmedCards[0].clear();
    this.confirmedCards[1].clear();
  }

  public recordConfirmedCards(
    viewerPlayer: number,
    cards: Array<{ code: number; controller: number; location: number; sequence: number }>,
  ): void {
    if (!cards || !Array.isArray(cards)) return;
    for (const c of cards) {
      if (c && c.code > 0) {
        const key = `${c.controller}:${c.location}:${c.sequence}`;
        if (this.confirmedCards[viewerPlayer]) {
          this.confirmedCards[viewerPlayer].set(key, c.code);
        }
        if (this.confirmedCards[c.controller]) {
          this.confirmedCards[c.controller].set(key, c.code);
        }
      }
    }
  }

  public getConfirmedCode(viewerPlayer: number, controller: number, location: number, sequence: number): number {
    const key = `${controller}:${location}:${sequence}`;
    return this.confirmedCards[viewerPlayer]?.get(key) ?? 0;
  }

  public isConfirmed(viewerPlayer: number, controller: number, location: number, sequence: number): boolean {
    return this.getConfirmedCode(viewerPlayer, controller, location, sequence) > 0;
  }

  public removeConfirmedCardAt(controller: number, location: number, sequence: number): void {
    const key = `${controller}:${location}:${sequence}`;
    this.confirmedCards[0].delete(key);
    this.confirmedCards[1].delete(key);
  }

  public clearConfirmedLocation(controller: number, location: number): void {
    const prefix = `${controller}:${location}:`;
    for (const p of [0, 1]) {
      for (const key of Array.from(this.confirmedCards[p].keys())) {
        if (key.startsWith(prefix)) {
          this.confirmedCards[p].delete(key);
        }
      }
    }
  }

  public setLastAttackCard(card: { code: number; controller?: number; location?: number; sequence?: number; can_direct?: boolean } | null): void {
    this.lastAttackCard = card;
  }

  public setLastActivatedCard(card: { code: number; player?: number } | null): void {
    this.lastActivatedCard = card;
  }

  public decode(msg: OcgMessage): DecodedDuelEvent {
    const rawType = msg.type;
    let type = 'UNKNOWN';
    let description = '';
    let isPrompt = false;
    let promptPlayer: number | undefined;
    let promptType: string | undefined;
    let promptData: unknown;

    switch (rawType) {
      case OcgMessageType.NEW_TURN: {
        type = 'NEW_TURN';
        description = `Turn begins. Active player: Player ${msg.player}`;
        return {
          type,
          rawType,
          player: msg.player,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.NEW_PHASE: {
        type = 'NEW_PHASE';
        const phaseName =
          ocgPhaseString.get(msg.phase as Parameters<typeof ocgPhaseString.get>[0]) ??
          `PHASE_${msg.phase}`;
        
        let phaseCode = 'M1';
        const pLower = phaseName.toLowerCase();
        if (pLower.includes('draw')) phaseCode = 'DP';
        else if (pLower.includes('standby')) phaseCode = 'SP';
        else if (pLower.includes('main1')) phaseCode = 'M1';
        else if (pLower.includes('battle') || pLower.includes('damage')) phaseCode = 'BP';
        else if (pLower.includes('main2')) phaseCode = 'M2';
        else if (pLower.includes('end')) phaseCode = 'EP';

        if (phaseCode !== 'BP') {
          this.lastAttackCard = null;
        }

        description = `Phase changed to ${phaseName.toUpperCase()}`;
        return {
          type,
          rawType,
          phase: phaseCode,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.DRAW: {
        type = 'DRAW';
        const drawnCards = msg.drawn.map((d) => ({
          code: d.code,
          cardName: this.cardReader.getCardName(d.code),
        }));
        const names = drawnCards.map((c) => c.cardName).join(', ');
        description = `Player ${msg.player} drew: ${names}`;
        return {
          type,
          rawType,
          player: msg.player,
          drawnCards,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SUMMONING: {
        type = 'SUMMONING';
        const name = this.cardReader.getCardName(msg.code);
        description = `Player ${msg.controller} is Normal Summoning ${name}`;
        return {
          type,
          rawType,
          controller: msg.controller,
          code: msg.code,
          cardName: name,
          location: msg.location,
          sequence: msg.sequence,
          position: msg.position,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SUMMONED: {
        type = 'SUMMONED';
        description = `Normal Summon successful.`;
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.SPSUMMONING: {
        type = 'SPSUMMONING';
        const name = this.cardReader.getCardName(msg.code);
        description = `Player ${msg.controller} is Special Summoning ${name}`;
        return {
          type,
          rawType,
          controller: msg.controller,
          code: msg.code,
          cardName: name,
          location: msg.location,
          sequence: msg.sequence,
          position: msg.position,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SPSUMMONED: {
        type = 'SPSUMMONED';
        description = `Special Summon successful.`;
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.FLIPSUMMONING: {
        type = 'FLIPSUMMONING';
        const name = this.cardReader.getCardName(msg.code);
        description = `Player ${msg.controller} is Flip Summoning ${name}.`;
        return {
          type,
          rawType,
          controller: msg.controller,
          code: msg.code,
          cardName: name,
          location: msg.location,
          sequence: msg.sequence,
          position: msg.position,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.FLIPSUMMONED: {
        type = 'FLIPSUMMONED';
        description = `Flip Summon successful.`;
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.POS_CHANGE: {
        type = 'POS_CHANGE';
        const name = this.cardReader.getCardName(msg.code);
        description = `Player ${msg.controller} changed position of ${name}.`;
        return {
          type,
          rawType,
          controller: msg.controller,
          code: msg.code,
          cardName: name,
          location: msg.location,
          sequence: msg.sequence,
          position: msg.position,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SET: {
        type = 'SET';
        const name = msg.code > 0 ? this.cardReader.getCardName(msg.code) : 'Card';
        description = `Player ${msg.controller} Set a card on the field.`;
        return {
          type,
          rawType,
          controller: msg.controller,
          code: msg.code,
          cardName: name,
          location: msg.location,
          sequence: msg.sequence,
          position: msg.position,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.MOVE: {
        type = 'MOVE';
        if (msg.from) {
          this.removeConfirmedCardAt(msg.from.controller, msg.from.location, msg.from.sequence);
        }
        const name = msg.card > 0 ? this.cardReader.getCardName(msg.card) : 'Card';
        description = `Card moved to new location.`;
        return {
          type,
          rawType,
          code: msg.card,
          cardName: name,
          controller: msg.to.controller,
          fromController: msg.from.controller,
          fromLocation: msg.from.location,
          fromSequence: msg.from.sequence,
          toLocation: msg.to.location,
          toSequence: msg.to.sequence,
          position: msg.to.position,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.CHAINING: {
        type = 'CHAINING';
        this.lastChainingCard = {
          code: msg.code,
          player: msg.triggering_controller ?? (msg as any).player ?? 0,
        };
        this.lastActivatedCard = {
          code: msg.code,
          player: msg.triggering_controller ?? (msg as any).player ?? 0,
        };
        const name = this.cardReader.getCardName(msg.code);
        description = `Player ${msg.triggering_controller} activated effect of ${name} (Chain Link ${msg.chain_size})`;
        return {
          type,
          rawType,
          controller: msg.triggering_controller,
          code: msg.code,
          cardName: name,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.CHAIN_SOLVED: {
        type = 'CHAIN_SOLVED';
        description = `Chain link (${msg.chain_size}) resolved.`;
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.CHAIN_NEGATED: {
        type = 'CHAIN_NEGATED';
        description = `💥 Chain link (${msg.chain_size}) activation was NEGATED!`;
        return {
          type,
          rawType,
          chainSize: msg.chain_size,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.CHAIN_DISABLED: {
        type = 'CHAIN_DISABLED';
        description = `⚡ Chain link (${msg.chain_size}) effect was NEGATED!`;
        return {
          type,
          rawType,
          chainSize: msg.chain_size,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.ATTACK: {
        type = 'ATTACK';
        const cardSeq = msg.card?.sequence ?? 0;
        const cardCtrl = msg.card?.controller ?? 0;
        if (msg.card?.code) {
          this.lastAttackCard = {
            code: msg.card.code,
            controller: cardCtrl,
            sequence: cardSeq,
            location: msg.card.location,
          };
        }
        if (msg.target) {
          description = `Player ${cardCtrl}'s monster declared an attack on opponent monster.`;
        } else {
          description = `Player ${cardCtrl}'s monster declared a DIRECT ATTACK!`;
        }
        return {
          type,
          rawType,
          controller: cardCtrl,
          sequence: cardSeq,
          target: msg.target,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.ATTACK_DISABLED: {
        type = 'ATTACK_DISABLED';
        description = `🛡️ The declared attack was NEGATED!`;
        return {
          type,
          rawType,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.BATTLE: {
        type = 'BATTLE';
        const targetAtk = msg.target ? msg.target.attack : 0;
        description = `Battle clash: Attacker (ATK ${msg.card.attack}) vs Defender (ATK ${targetAtk}).`;
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.DAMAGE: {
        type = 'DAMAGE';
        description = `Player ${msg.player} took ${msg.amount} damage.`;
        return {
          type,
          rawType,
          player: msg.player,
          amount: msg.amount,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.RECOVER: {
        type = 'RECOVER';
        description = `Player ${msg.player} recovered ${msg.amount} Life Points.`;
        return {
          type,
          rawType,
          player: msg.player,
          amount: msg.amount,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.LPUPDATE: {
        type = 'LPUPDATE';
        description = `Player ${msg.player} Life Points updated to ${msg.lp}.`;
        return {
          type,
          rawType,
          player: msg.player,
          lp: msg.lp,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.PAY_LPCOST: {
        type = 'PAY_LPCOST';
        const costVal = (msg as any).cost ?? (msg as any).amount ?? (msg as any).val ?? (msg as any).value ?? (msg as any).lp ?? 0;
        description = `Player ${msg.player} paid ${costVal} LP as cost.`;
        return {
          type,
          rawType,
          player: msg.player,
          cost: costVal,
          amount: costVal,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.WIN: {
        type = 'WIN';
        const isDraw = msg.player === 2;
        description = isDraw
          ? `⚖️ Duel ended in a DRAW! (Reason: ${msg.reason}).`
          : `👑 Duel ended! Winner: Player ${msg.player} (Reason: ${msg.reason}).`;
        return {
          type,
          rawType,
          player: msg.player,
          reason: msg.reason,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.MISSED_EFFECT: {
        type = 'MISSED_EFFECT';
        const cardName = msg.code > 0 ? this.cardReader.getCardName(msg.code) : 'Card';
        description = `⚠️ Effect of [${cardName}] missed the timing ("When... you can") and could not activate.`;
        return {
          type,
          rawType,
          code: msg.code,
          cardName,
          controller: msg.controller,
          location: msg.location,
          sequence: msg.sequence,
          position: msg.position,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SWAP: {
        type = 'SWAP';
        const name1 = msg.card1?.code > 0 ? this.cardReader.getCardName(msg.card1.code) : 'Card';
        const name2 = msg.card2?.code > 0 ? this.cardReader.getCardName(msg.card2.code) : 'Card';
        description = `🔄 Control of [${name1}] and [${name2}] was swapped!`;
        return {
          type,
          rawType,
          card1: {
            code: msg.card1?.code,
            controller: msg.card1?.controller,
            location: msg.card1?.location,
            sequence: msg.card1?.sequence,
            position: msg.card1?.position,
            cardName: name1,
          },
          card2: {
            code: msg.card2?.code,
            controller: msg.card2?.controller,
            location: msg.card2?.location,
            sequence: msg.card2?.sequence,
            position: msg.card2?.position,
            cardName: name2,
          },
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.TOSS_DICE: {
        type = 'TOSS_DICE';
        const diceResults = msg.results || [];
        const resultStr = diceResults.join(', ');
        description = `🎲 Player ${msg.player} rolled dice: [${resultStr}]`;
        return {
          type,
          rawType,
          player: msg.player,
          results: diceResults,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.TOSS_COIN: {
        type = 'TOSS_COIN';
        const coinResults = (msg.results || []).map((r) => Boolean(r));
        const resultStr = coinResults.map((r) => (r ? 'Heads' : 'Tails')).join(', ');
        description = `🪙 Player ${msg.player} flipped coins: [${resultStr}]`;
        return {
          type,
          rawType,
          player: msg.player,
          results: coinResults,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.ADD_COUNTER: {
        type = 'ADD_COUNTER';
        description = `Added ${msg.count} counter(s) (Type #${msg.counter_type}) to card at ${msg.location === 4 ? 'Monster Zone' : 'Spell/Trap Zone'} ${msg.sequence}.`;
        return {
          type,
          rawType,
          controller: msg.controller,
          location: msg.location,
          sequence: msg.sequence,
          count: msg.count,
          counterType: msg.counter_type,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.REMOVE_COUNTER: {
        type = 'REMOVE_COUNTER';
        description = `Removed ${msg.count} counter(s) (Type #${msg.counter_type}) from card at ${msg.location === 4 ? 'Monster Zone' : 'Spell/Trap Zone'} ${msg.sequence}.`;
        return {
          type,
          rawType,
          controller: msg.controller,
          location: msg.location,
          sequence: msg.sequence,
          count: msg.count,
          counterType: msg.counter_type,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.CARD_HINT: {
        type = 'CARD_HINT';
        const hintType = (msg as any).card_hint;
        const hintVal = Number((msg as any).description ?? (msg as any).value ?? 0);
        const HINT_TYPE_MAP: Record<number, string> = {
          1: 'TURN',
          2: 'CARD',
          3: 'RACE',
          4: 'ATTRIBUTE',
          5: 'NUMBER',
          6: 'DESC_ADD',
          7: 'DESC_REMOVE',
        };
        const hintCategory = HINT_TYPE_MAP[hintType] || 'UNKNOWN';
        let hintText = '';

        if (hintType === 1) {
          hintText = `Turn: ${hintVal}`;
        } else if (hintType === 2) {
          hintText = `Declared Card: ${this.cardReader.getCardName(hintVal) || hintVal}`;
        } else if (hintType === 3) {
          hintText = `Declared Type: ${RACE_NAME_MAP[hintVal] || `0x${hintVal.toString(16)}`}`;
        } else if (hintType === 4) {
          hintText = `Declared Attribute: ${ATTRIBUTE_NAME_MAP[hintVal] || `0x${hintVal.toString(16)}`}`;
        } else if (hintType === 5) {
          hintText = `Declared Number: ${hintVal}`;
        } else if (hintType === 6) {
          const resolved = this.cardReader.resolveString((msg as any).description ?? (msg as any).value);
          hintText = resolved && !resolved.startsWith('Option #') ? resolved : 'Granted Ability';
        } else if (hintType === 7) {
          hintText = 'Effect Expired';
        } else {
          hintText = `Hint: ${hintVal}`;
        }

        description = `Card hint (${hintText})`;
        return {
          type,
          rawType,
          controller: (msg as any).controller ?? (msg as any).player,
          location: (msg as any).location,
          sequence: (msg as any).sequence,
          hintType,
          hintCategory,
          hintText,
          resolvedText: RACE_NAME_MAP[hintVal] || ATTRIBUTE_NAME_MAP[hintVal] || hintText,
          turnCounter: hintType === 1 ? hintVal : undefined,
          value: (msg as any).description ?? (msg as any).value,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.RANDOM_SELECTED: {
        type = 'RANDOM_SELECTED';
        description = `Player ${msg.player} randomly selected card(s).`;
        return {
          type,
          rawType,
          player: msg.player,
          cards: (msg.cards || []).map((c) => ({
            controller: c.controller,
            location: c.location,
            sequence: c.sequence,
          })),
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      // Prompt Message Types
      case OcgMessageType.SELECT_IDLECMD: {
        isPrompt = true;
        type = 'SELECT_IDLECMD';
        promptType = 'SELECT_IDLECMD';
        promptPlayer = msg.player;
        description = `Main Phase: Choose an action (Normal Summon, Set, Activate Effect, Battle Phase, End Phase).`;

        promptData = {
          player: msg.player,
          summons: msg.summons.map((s) => ({ ...s, cardName: this.cardReader.getCardName(s.code) })),
          special_summons: msg.special_summons.map((s) => ({ ...s, cardName: this.cardReader.getCardName(s.code) })),
          pos_changes: msg.pos_changes.map((s) => ({ ...s, cardName: this.cardReader.getCardName(s.code) })),
          monster_sets: msg.monster_sets.map((s) => ({ ...s, cardName: this.cardReader.getCardName(s.code) })),
          spell_sets: msg.spell_sets.map((s) => ({ ...s, cardName: this.cardReader.getCardName(s.code) })),
          activates: msg.activates.map((s) => ({
            ...s,
            cardName: this.cardReader.getCardName(s.code),
            description: this.cardReader.resolveString(s.description),
          })),
          to_bp: msg.to_bp,
          to_ep: msg.to_ep,
          shuffle: msg.shuffle,
        };

        return {
          type,
          rawType,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SELECT_BATTLECMD: {
        isPrompt = true;
        type = 'SELECT_BATTLECMD';
        promptType = 'SELECT_BATTLECMD';
        promptPlayer = msg.player;
        description = `Battle Phase: Choose a monster to declare an attack, or proceed to Main Phase 2 / End Phase.`;

        promptData = {
          player: msg.player,
          chains: msg.chains.map((c) => ({
            ...c,
            cardName: this.cardReader.getCardName(c.code),
            description: this.cardReader.resolveString(c.description),
          })),
          attacks: msg.attacks.map((a) => ({
            ...a,
            cardName: this.cardReader.getCardName(a.code),
          })),
          to_m2: msg.to_m2,
          to_ep: msg.to_ep,
        };

        return {
          type,
          rawType,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SELECT_CARD: {
        isPrompt = true;
        type = 'SELECT_CARD';
        promptType = 'SELECT_CARD';
        promptPlayer = msg.player;

        const description =
          msg.min === 0
            ? `Select up to ${msg.max} card(s).`
            : `Select ${msg.min}${msg.max > msg.min ? ` to ${msg.max}` : ''} card(s).`;

        promptData = {
          player: msg.player,
          can_cancel: msg.can_cancel,
          min: msg.min,
          max: msg.max,
          isDiscardPrompt: false,
          selects: msg.selects.map((s) => {
            const resolvedCode = s.code > 0 ? s.code : this.getConfirmedCode(msg.player, s.controller, s.location, s.sequence);
            if (s.code === 0 && resolvedCode > 0) {
              s.code = resolvedCode;
            }
            return {
              ...s,
              code: resolvedCode,
              cardName: resolvedCode > 0 ? this.cardReader.getCardName(resolvedCode) : 'Card',
            };
          }),
        };

        return {
          type,
          rawType,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SELECT_UNSELECT_CARD: {
        isPrompt = true;
        type = 'SELECT_UNSELECT_CARD';
        promptType = 'SELECT_UNSELECT_CARD';
        promptPlayer = msg.player;

        const description =
          msg.min === 0
            ? `Select up to ${msg.max} card(s).`
            : `Select ${msg.min}${msg.max > msg.min ? ` to ${msg.max}` : ''} card(s).`;

        promptData = {
          player: msg.player,
          can_finish: msg.can_finish,
          can_cancel: msg.can_cancel,
          min: msg.min,
          max: msg.max,
          selects: (msg.select_cards || []).map((s) => {
            const resolvedCode = s.code > 0 ? s.code : this.getConfirmedCode(msg.player, s.controller, s.location, s.sequence);
            if (s.code === 0 && resolvedCode > 0) {
              s.code = resolvedCode;
            }
            return {
              ...s,
              code: resolvedCode,
              cardName: resolvedCode > 0 ? this.cardReader.getCardName(resolvedCode) : 'Card',
            };
          }),
          unselects: (msg.unselect_cards || []).map((u) => {
            const resolvedCode = u.code > 0 ? u.code : this.getConfirmedCode(msg.player, u.controller, u.location, u.sequence);
            if (u.code === 0 && resolvedCode > 0) {
              u.code = resolvedCode;
            }
            return {
              ...u,
              code: resolvedCode,
              cardName: resolvedCode > 0 ? this.cardReader.getCardName(resolvedCode) : 'Card',
            };
          }),
        };

        return {
          type,
          rawType,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SELECT_CHAIN: {
        isPrompt = true;
        type = 'SELECT_CHAIN';
        promptType = 'SELECT_CHAIN';
        promptPlayer = msg.player;
        description = msg.forced
          ? `Mandatory trigger effect requires activation.`
          : `Activate an effect in response, or pass priority.`;

        promptData = {
          player: msg.player,
          forced: msg.forced,
          selects: msg.selects.map((s) => ({
            ...s,
            cardName: this.cardReader.getCardName(s.code),
            description: this.cardReader.resolveString(s.description),
          })),
        };

        return {
          type,
          rawType,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SELECT_POSITION: {
        isPrompt = true;
        type = 'SELECT_POSITION';
        promptType = 'SELECT_POSITION';
        promptPlayer = msg.player;
        const name = this.cardReader.getCardName(msg.code);
        description = `Choose battle position for ${name}.`;

        promptData = {
          player: msg.player,
          code: msg.code,
          cardName: name,
          positions: ocgPositionParse(msg.positions),
        };

        return {
          type,
          rawType,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SELECT_EFFECTYN: {
        isPrompt = true;
        type = 'SELECT_EFFECTYN';
        promptType = 'SELECT_EFFECTYN';
        promptPlayer = msg.player;
        const name = this.cardReader.getCardName(msg.code);
        const cardDetail = this.cardReader.getCardDetail(msg.code);
        let resolvedEffectDesc = this.cardReader.resolveString(msg.description);
        if (
          !resolvedEffectDesc ||
          resolvedEffectDesc === '0' ||
          resolvedEffectDesc.startsWith('Option #') ||
          !isNaN(Number(resolvedEffectDesc))
        ) {
          resolvedEffectDesc = cardDetail?.desc || `Activate effect of "${name}"?`;
        }
        description = resolvedEffectDesc;

        promptData = {
          player: msg.player,
          code: msg.code,
          cardName: name,
          description: resolvedEffectDesc,
          promptTitle: 'Optional Card Effect',
          badgeLabel: 'CARD EFFECT TRIGGER',
          badgeIcon: '✨',
          yesText: 'Yes, Activate Effect',
          noText: 'No, Decline',
          isDirectAttack: false,
          isReplay: false,
        };

        return {
          type,
          rawType,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SELECT_YESNO: {
        isPrompt = true;
        type = 'SELECT_YESNO';
        promptType = 'SELECT_YESNO';
        promptPlayer = msg.player;

        const rawDesc = (msg as any).description ?? (msg as any).desc ?? 0;
        const resolvedString = this.cardReader.resolveString(rawDesc);

        // 1. Try to extract card code from string ID
        let code = this.cardReader.extractCardCodeFromStringId(rawDesc);

        const numDesc = Number(rawDesc);
        const isDirectAttack =
          numDesc === 31 ||
          (typeof resolvedString === 'string' && resolvedString.toLowerCase().includes('attack directly'));
        const isReplay =
          numDesc === 30 ||
          (typeof resolvedString === 'string' && resolvedString.toLowerCase().includes('replay'));

        const isMaintenanceCost =
          typeof resolvedString === 'string' &&
          /pay\s*(\d+)?\s*lp/i.test(resolvedString);
        let lpCost = '';
        if (isMaintenanceCost && typeof resolvedString === 'string') {
          const m = resolvedString.match(/\d+/);
          if (m) lpCost = m[0];
        }

        if (!code) {
          if ((isDirectAttack || isReplay) && this.lastAttackCard?.code) {
            code = this.lastAttackCard.code;
          } else if (this.lastChainingCard?.code) {
            code = this.lastChainingCard.code;
          } else if (this.lastHintCard) {
            code = this.lastHintCard;
          } else if (this.lastActivatedCard?.code) {
            code = this.lastActivatedCard.code;
          }
        }

        const cardDetail = code ? this.cardReader.getCardDetail(code) : null;
        const cardName = cardDetail?.name ?? (code ? this.cardReader.getCardName(code) : undefined);

        let promptTitle = 'Optional Card Effect';
        let badgeLabel = 'CARD EFFECT TRIGGER';
        let badgeIcon = '✨';
        let yesText = 'Yes, Activate Effect';
        let noText = 'No, Decline';
        let finalDescription = '';

        if (isDirectAttack) {
          promptTitle = 'Declare Direct Attack';
          badgeLabel = 'DIRECT ATTACK CHOICE';
          badgeIcon = '⚔️';
          yesText = 'Attack Directly';
          noText = 'Attack Opponent Monster';
          finalDescription = cardName
            ? `"${cardName}" can attack your opponent directly. Do you wish to declare a direct attack on opponent Life Points?`
            : `Do you wish to declare a direct attack on opponent Life Points?`;
        } else if (isReplay) {
          promptTitle = 'Battle Replay';
          badgeLabel = 'BATTLE REPLAY';
          badgeIcon = '⚔️';
          yesText = 'Continue Attack';
          noText = 'Cancel Attack';
          finalDescription = cardName
            ? `A battle replay occurred. Do you want to continue the attack with "${cardName}"?`
            : `A battle replay occurred. Do you wish to continue the attack?`;
        } else if (isMaintenanceCost) {
          promptTitle = 'Maintenance Cost';
          badgeLabel = 'MAINTENANCE COST';
          badgeIcon = '🪙';
          yesText = lpCost ? `Pay ${lpCost} LP` : 'Pay LP Cost';
          noText = 'Do Not Pay (Destroy)';
          finalDescription = cardName
            ? `Pay ${lpCost ? lpCost + ' ' : ''}LP to maintain "${cardName}", or decline to destroy it.`
            : `Pay ${lpCost ? lpCost + ' ' : ''}LP to maintain this card, or decline to destroy it.`;
        } else if (resolvedString && !resolvedString.startsWith('Option #') && isNaN(Number(resolvedString))) {
          finalDescription = resolvedString;
        } else if (cardName) {
          finalDescription = `Do you wish to activate the effect of "${cardName}"?`;
        } else {
          finalDescription = `Do you wish to proceed?`;
        }

        description = finalDescription;

        promptData = {
          player: msg.player,
          code,
          cardName,
          description: finalDescription,
          promptTitle,
          badgeLabel,
          badgeIcon,
          yesText,
          noText,
          isDirectAttack,
          isReplay,
          isMaintenanceCost,
        };

        return {
          type,
          rawType,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SELECT_OPTION: {
        isPrompt = true;
        type = 'SELECT_OPTION';
        promptType = 'SELECT_OPTION';
        promptPlayer = msg.player;
        description = `Choose an option.`;

        promptData = {
          player: msg.player,
          options: msg.options.map((o) => this.cardReader.resolveString(o)),
        };

        return {
          type,
          rawType,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SELECT_TRIBUTE: {
        isPrompt = true;
        type = 'SELECT_TRIBUTE';
        promptType = 'SELECT_TRIBUTE';
        promptPlayer = msg.player;
        description = `Select ${msg.min} monster(s) to Tribute.`;

        promptData = {
          player: msg.player,
          can_cancel: msg.can_cancel,
          min: msg.min,
          max: msg.max,
          selects: msg.selects.map((s) => ({
            ...s,
            cardName: this.cardReader.getCardName(s.code),
          })),
        };

        return {
          type,
          rawType,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SELECT_SUM: {
        isPrompt = true;
        type = 'SELECT_SUM';
        promptType = 'SELECT_SUM';
        promptPlayer = msg.player;
        const targetSum = msg.amount ?? 0;
        const isEqual = msg.select_max === 0;
        description = isEqual
          ? `Select monsters whose total Level equals ${targetSum}.`
          : `Select monsters whose total Level equals or exceeds ${targetSum}.`;

        const allSelects = [...(msg.selects_must || []), ...(msg.selects || [])];

        promptData = {
          player: msg.player,
          select_max: msg.select_max,
          amount: msg.amount,
          min: msg.min,
          max: msg.max,
          selects: allSelects.map((s) => ({
            ...s,
            cardName: this.cardReader.getCardName(s.code),
          })),
        };

        return {
          type,
          rawType,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SELECT_PLACE: {
        isPrompt = true;
        type = 'SELECT_PLACE';
        promptType = 'SELECT_PLACE';
        promptPlayer = msg.player;
        description = `Select a zone on the field.`;

        promptData = {
          player: msg.player,
          count: msg.count,
          field_mask: msg.field_mask,
          availablePlaces: parseFieldMask(msg.player, msg.field_mask, 999),
        };

        return {
          type,
          rawType,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SELECT_DISFIELD: {
        isPrompt = true;
        type = 'SELECT_DISFIELD';
        promptType = 'SELECT_DISFIELD';
        promptPlayer = msg.player;
        const count = msg.count ?? 1;
        description = `Select ${count} zone${count > 1 ? 's' : ''} to disable.`;

        promptData = {
          player: msg.player,
          count,
          field_mask: msg.field_mask,
          availablePlaces: parseFieldMask(msg.player, msg.field_mask, 999),
        };

        return {
          type,
          rawType,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SHUFFLE_HAND: {
        type = 'SHUFFLE_HAND';
        const p = msg.player ?? 0;
        this.clearConfirmedLocation(p, OcgLocation.HAND);
        const cards = Array.isArray(msg.cards) ? msg.cards.map((c: any) => Number(c)) : [];
        return {
          type,
          rawType,
          player: p,
          cards,
          isPrompt: false,
          description: `Player ${p} shuffled hand.`,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SHUFFLE_SET_CARD: {
        type = 'SHUFFLE_SET_CARD';
        const loc = (msg as any).location ?? OcgLocation.MZONE;
        this.clearConfirmedLocation(0, loc);
        this.clearConfirmedLocation(1, loc);
        const cards = Array.isArray((msg as any).cards)
          ? (msg as any).cards.map((c: any) => ({
              from: c.from ? sanitizeBigInts(c.from) : undefined,
              to: c.to ? sanitizeBigInts(c.to) : undefined,
            }))
          : [];
        const locName = loc === OcgLocation.SZONE ? 'Spell & Trap Zone' : 'Monster Zone';
        description = `Face-down cards in ${locName} were shuffled.`;
        return {
          type,
          rawType,
          location: loc,
          cards,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.ANNOUNCE_CARD: {
        isPrompt = true;
        type = 'ANNOUNCE_CARD';
        promptType = 'ANNOUNCE_CARD';
        promptPlayer = msg.player;
        description = `Declare a card name.`;

        const opcodes = Array.isArray(msg.opcodes) ? msg.opcodes.map((o: any) => sanitizeBigInts(o)) : [];

        promptData = {
          player: msg.player,
          opcodes,
        };

        return {
          type,
          rawType,
          player: msg.player,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.ANNOUNCE_RACE: {
        isPrompt = true;
        type = 'ANNOUNCE_RACE';
        promptType = 'ANNOUNCE_RACE';
        promptPlayer = msg.player;
        description = `Declare ${msg.count} Monster Type(s).`;

        promptData = {
          player: msg.player,
          count: msg.count,
          available: sanitizeBigInts(msg.available),
        };

        return {
          type,
          rawType,
          player: msg.player,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.ANNOUNCE_ATTRIB: {
        isPrompt = true;
        type = 'ANNOUNCE_ATTRIB';
        promptType = 'ANNOUNCE_ATTRIB';
        promptPlayer = msg.player;
        description = `Declare ${msg.count} Attribute(s).`;

        promptData = {
          player: msg.player,
          count: msg.count,
          available: msg.available,
        };

        return {
          type,
          rawType,
          player: msg.player,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.ANNOUNCE_NUMBER: {
        isPrompt = true;
        type = 'ANNOUNCE_NUMBER';
        promptType = 'ANNOUNCE_NUMBER';
        promptPlayer = msg.player;
        description = `Declare a number.`;

        promptData = {
          player: msg.player,
          options: Array.isArray(msg.options) ? msg.options.map((o: any) => sanitizeBigInts(o)) : [],
        };

        return {
          type,
          rawType,
          player: msg.player,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SORT_CARD: {
        isPrompt = true;
        type = 'SORT_CARD';
        promptType = 'SORT_CARD';
        promptPlayer = msg.player;
        description = `Select the order for the cards.`;

        promptData = {
          player: msg.player,
          cards: (msg.cards || []).map((c: any) => ({
            ...c,
            cardName: this.cardReader.getCardName(c.code),
            desc: this.cardReader.getCardTextsRow(c.code)?.desc,
          })),
        };

        return {
          type,
          rawType,
          player: msg.player,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SORT_CHAIN: {
        isPrompt = true;
        type = 'SORT_CHAIN';
        promptType = 'SORT_CHAIN';
        promptPlayer = msg.player;
        description = `Select chain resolution order.`;

        promptData = {
          player: msg.player,
          cards: (msg.cards || []).map((c: any) => ({
            ...c,
            cardName: this.cardReader.getCardName(c.code),
            desc: this.cardReader.getCardTextsRow(c.code)?.desc,
          })),
        };

        return {
          type,
          rawType,
          player: msg.player,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SELECT_COUNTER: {
        isPrompt = true;
        type = 'SELECT_COUNTER';
        promptType = 'SELECT_COUNTER';
        promptPlayer = msg.player;
        description = `Select ${msg.count} counter(s) to remove.`;

        promptData = {
          player: msg.player,
          counter_type: msg.counter_type,
          count: msg.count,
          cards: (msg.cards || []).map((c: any) => ({
            ...c,
            cardName: this.cardReader.getCardName(c.code),
          })),
        };

        return {
          type,
          rawType,
          player: msg.player,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.ROCK_PAPER_SCISSORS: {
        isPrompt = true;
        type = 'ROCK_PAPER_SCISSORS';
        promptType = 'ROCK_PAPER_SCISSORS';
        promptPlayer = msg.player;
        description = `Choose Rock, Paper, or Scissors.`;

        promptData = {
          player: msg.player,
        };

        return {
          type,
          rawType,
          player: msg.player,
          isPrompt,
          promptPlayer,
          promptType,
          promptData,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.HAND_RES: {
        type = 'HAND_RES';
        const r0 = msg.results?.[0] ?? 0;
        const r1 = msg.results?.[1] ?? 0;
        const rpsName = (v: number) => {
          if (v === 1) return 'Scissors ✂️';
          if (v === 2) return 'Rock 🪨';
          if (v === 3) return 'Paper 📄';
          return 'None';
        };
        let outcome = 'Tie! Replaying...';
        if ((r0 === 2 && r1 === 1) || (r0 === 1 && r1 === 3) || (r0 === 3 && r1 === 2)) {
          outcome = 'Player 0 won the round!';
        } else if ((r1 === 2 && r0 === 1) || (r1 === 1 && r0 === 3) || (r1 === 3 && r0 === 2)) {
          outcome = 'Player 1 won the round!';
        }
        description = `Rock-Paper-Scissors: Player 0 chose ${rpsName(r0)}, Player 1 chose ${rpsName(r1)}. ${outcome}`;
        return {
          type,
          rawType,
          results: [r0, r1],
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.CONFIRM_CARDS: {
        type = 'CONFIRM_CARDS';
        const p = msg.player ?? 0;
        const rawCards = (msg as any).cards || [];
        this.recordConfirmedCards(p, rawCards);
        const confirmedCards = rawCards.map((c: any) => ({
          code: c.code,
          controller: c.controller,
          location: c.location,
          sequence: c.sequence,
          cardName: c.code > 0 ? this.cardReader.getCardName(c.code) : 'Card',
        }));
        const cardOwner = rawCards[0]?.controller ?? (1 - p);
        description =
          rawCards.length === 1
            ? `Player ${cardOwner} revealed ${confirmedCards[0]?.cardName || 'a card'} to Player ${p}.`
            : `Player ${cardOwner} revealed ${rawCards.length} card(s) to Player ${p}.`;
        return {
          type,
          rawType,
          player: p,
          controller: cardOwner,
          cards: confirmedCards,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.CONFIRM_DECKTOP: {
        type = 'CONFIRM_DECKTOP';
        const p = msg.player ?? 0;
        const rawCards = (msg as any).cards || [];
        this.recordConfirmedCards(p, rawCards);
        const confirmedCards = rawCards.map((c: any) => ({
          code: c.code,
          controller: c.controller,
          location: c.location,
          sequence: c.sequence,
          cardName: c.code > 0 ? this.cardReader.getCardName(c.code) : 'Card',
        }));
        const count = confirmedCards.length || msg.count || 1;
        description = `Player ${p} revealed top ${count} card(s) of Deck.`;
        return {
          type,
          rawType,
          player: p,
          count,
          cards: confirmedCards,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.CONFIRM_EXTRATOP: {
        type = 'CONFIRM_EXTRATOP';
        const p = msg.player ?? 0;
        const rawCards = (msg as any).cards || [];
        this.recordConfirmedCards(p, rawCards);
        const confirmedCards = rawCards.map((c: any) => ({
          code: c.code,
          controller: c.controller,
          location: c.location,
          sequence: c.sequence,
          cardName: c.code > 0 ? this.cardReader.getCardName(c.code) : 'Card',
        }));
        const count = confirmedCards.length || 1;
        description = `Player ${p} revealed top ${count} card(s) of Extra Deck.`;
        return {
          type,
          rawType,
          player: p,
          count,
          cards: confirmedCards,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SHUFFLE_DECK: {
        type = 'SHUFFLE_DECK';
        const p = msg.player ?? 0;
        this.clearConfirmedLocation(p, OcgLocation.DECK);
        description = `Player ${p} shuffled Deck.`;
        return { type, rawType, player: p, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.EQUIP: {
        type = 'EQUIP';
        const cardLoc = (msg as any).card ?? (msg as any).equipCard;
        const targetLoc = (msg as any).target ?? (msg as any).targetCard;
        const equipCard = cardLoc
          ? {
              controller: cardLoc.controller,
              location: cardLoc.location,
              sequence: cardLoc.sequence,
              position: cardLoc.position,
            }
          : undefined;
        const targetCard = targetLoc
          ? {
              controller: targetLoc.controller,
              location: targetLoc.location,
              sequence: targetLoc.sequence,
              position: targetLoc.position,
            }
          : undefined;

        description = `Card equipped.`;
        return {
          type,
          rawType,
          equipCard,
          targetCard,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.FIELD_DISABLED: {
        type = 'FIELD_DISABLED';
        const mask = (msg as any).field_mask ?? (msg as any).bitmask ?? 0;
        const p0Monster: number[] = [];
        const p0SpellTrap: number[] = [];
        const p1Monster: number[] = [];
        const p1SpellTrap: number[] = [];
        const extraMonster: number[] = [];

        // P0 Monster: bits 0..4
        for (let i = 0; i < 5; i++) {
          if ((mask & (1 << i)) !== 0) p0Monster.push(i);
        }
        // EMZ 0: bit 5, EMZ 1: bit 6
        if ((mask & (1 << 5)) !== 0) extraMonster.push(0);
        if ((mask & (1 << 6)) !== 0) extraMonster.push(1);

        // P0 Spell/Trap: bits 8..12
        for (let i = 0; i < 5; i++) {
          if ((mask & (1 << (i + 8))) !== 0) p0SpellTrap.push(i);
        }

        // P1 Monster: bits 16..20
        for (let i = 0; i < 5; i++) {
          if ((mask & (1 << (i + 16))) !== 0) p1Monster.push(i);
        }
        // Opponent EMZ perspective: bits 21, 22
        if ((mask & (1 << 21)) !== 0 && !extraMonster.includes(0)) extraMonster.push(0);
        if ((mask & (1 << 22)) !== 0 && !extraMonster.includes(1)) extraMonster.push(1);

        // P1 Spell/Trap: bits 24..28
        for (let i = 0; i < 5; i++) {
          if ((mask & (1 << (i + 24))) !== 0) p1SpellTrap.push(i);
        }

        description = `Zone disabled update (mask: 0x${mask.toString(16)}).`;
        return {
          type,
          rawType,
          fieldMask: mask,
          disabledZones: {
            p0Monster,
            p0SpellTrap,
            p1Monster,
            p1SpellTrap,
            extraMonster,
          },
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.BECOME_TARGET: {
        type = 'BECOME_TARGET';
        description = `Card targeted by effect.`;
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.CARD_TARGET: {
        type = 'CARD_TARGET';
        description = `Target acquired.`;
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.DAMAGE_STEP_START: {
        type = 'DAMAGE_STEP_START';
        description = `Damage Step begins.`;
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.DAMAGE_STEP_END: {
        type = 'DAMAGE_STEP_END';
        description = `Damage Step ended.`;
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.RETRY: {
        type = 'RETRY';
        description = 'Duel engine requested command retry.';
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.HINT: {
        type = 'HINT';
        const hintType = (msg as any).hint_type;
        const hintVal = (msg as any).hint;
        let hintText = '';
        if (hintType === 3) {
          // SELECTMSG
          const resolved = this.cardReader.resolveString(hintVal);
          hintText = resolved || `Select instruction #${hintVal}`;
        } else if (hintType === 8 || hintType === 10) {
          // CODE / CARD
          hintText = this.cardReader.getCardName(Number(hintVal)) || `Card #${hintVal}`;
        } else if (hintType === 6) {
          hintText = `Type: ${RACE_NAME_MAP[Number(hintVal)] || hintVal}`;
        } else if (hintType === 7) {
          hintText = `Attribute: ${ATTRIBUTE_NAME_MAP[Number(hintVal)] || hintVal}`;
        } else {
          const resolved = this.cardReader.resolveString(hintVal);
          hintText = resolved || `Hint #${hintVal}`;
        }
        description = hintText ? `Hint: ${hintText}` : 'Engine hint';
        return {
          type,
          rawType,
          hintType,
          hintVal: sanitizeBigInts(hintVal),
          hintText,
          player: (msg as any).player,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.REQUEST_DECK: {
        type = 'REQUEST_DECK';
        description = 'Engine requested deck validation.';
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.REFRESH_DECK: {
        type = 'REFRESH_DECK';
        description = 'Deck state refreshed.';
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.SWAP_GRAVE_DECK: {
        type = 'SWAP_GRAVE_DECK';
        const p = (msg as any).player ?? 0;
        const deckSize = (msg as any).deck_size ?? 0;
        description = `Player ${p} swapped Graveyard and Deck (New Deck Size: ${deckSize}).`;
        return {
          type,
          rawType,
          player: p,
          deckSize,
          returnedToExtra: sanitizeBigInts((msg as any).returned_to_extra || []),
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.REVERSE_DECK: {
        type = 'REVERSE_DECK';
        description = 'Decks were reversed face-up.';
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.DECK_TOP: {
        type = 'DECK_TOP';
        const p = (msg as any).player ?? 0;
        const code = (msg as any).code ?? 0;
        const cardName = code > 0 ? this.cardReader.getCardName(code) : 'Card';
        description = `Card placed on top of Player ${p}'s Deck (${cardName}).`;
        return {
          type,
          rawType,
          player: p,
          code,
          cardName,
          position: (msg as any).position,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SHUFFLE_EXTRA: {
        type = 'SHUFFLE_EXTRA';
        const p = (msg as any).player ?? 0;
        description = `Player ${p} shuffled Extra Deck.`;
        return {
          type,
          rawType,
          player: p,
          cards: sanitizeBigInts((msg as any).cards || []),
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.CHAIN_SOLVING: {
        type = 'CHAIN_SOLVING';
        const chainSize = (msg as any).chain_size ?? 1;
        description = `Resolving Chain Link ${chainSize}...`;
        return {
          type,
          rawType,
          chainSize,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.CHAIN_END: {
        type = 'CHAIN_END';
        description = 'Chain finished resolving.';
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.CARD_SELECTED: {
        type = 'CARD_SELECTED';
        const cards = ((msg as any).cards || []).map((c: any) => ({
          controller: c.controller,
          location: c.location,
          sequence: c.sequence,
          position: c.position,
        }));
        description = `Card(s) selected (${cards.length}).`;
        return {
          type,
          rawType,
          cards,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.CANCEL_TARGET: {
        type = 'CANCEL_TARGET';
        const cardLoc = (msg as any).card;
        const targetLoc = (msg as any).target;
        description = 'Card target cancelled.';
        return {
          type,
          rawType,
          card: cardLoc ? sanitizeBigInts(cardLoc) : undefined,
          target: targetLoc ? sanitizeBigInts(targetLoc) : undefined,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.BE_CHAIN_TARGET: {
        type = 'BE_CHAIN_TARGET';
        description = 'Card targeted by chain effect.';
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.CREATE_RELATION: {
        type = 'CREATE_RELATION';
        description = 'Card relation established.';
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.RELEASE_RELATION: {
        type = 'RELEASE_RELATION';
        description = 'Card relation released.';
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.TAG_SWAP: {
        type = 'TAG_SWAP';
        const p = (msg as any).player ?? 0;
        description = `Player ${p} swapped with Tag Partner.`;
        return {
          type,
          rawType,
          player: p,
          deckSize: (msg as any).deck_size,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.RELOAD_FIELD: {
        type = 'RELOAD_FIELD';
        description = 'Field state reloaded.';
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.AI_NAME: {
        type = 'AI_NAME';
        const name = (msg as any).name || 'AI Opponent';
        description = `Opponent engine: ${name}`;
        return {
          type,
          rawType,
          name,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.SHOW_HINT: {
        type = 'SHOW_HINT';
        const hintText = (msg as any).hint || '';
        description = hintText ? `Hint: ${hintText}` : 'Hint displayed.';
        return {
          type,
          rawType,
          hintText,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.PLAYER_HINT: {
        type = 'PLAYER_HINT';
        const p = (msg as any).player ?? 0;
        const descRaw = (msg as any).description ?? 0;
        const resolved = this.cardReader.resolveString(descRaw);
        description = resolved ? `Player ${p} Hint: ${resolved}` : `Player ${p} Hint displayed.`;
        return {
          type,
          rawType,
          player: p,
          hintType: (msg as any).player_hint,
          descriptionText: resolved,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.MATCH_KILL: {
        type = 'MATCH_KILL';
        const cardCode = (msg as any).card ?? 0;
        const cardName = cardCode > 0 ? this.cardReader.getCardName(cardCode) : 'Card';
        description = `Match victory! "${cardName}" won the match!`;
        return {
          type,
          rawType,
          card: cardCode,
          cardName,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      case OcgMessageType.CUSTOM_MSG: {
        type = 'CUSTOM_MSG';
        description = 'Custom script message.';
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }

      case OcgMessageType.REMOVE_CARDS: {
        type = 'REMOVE_CARDS';
        const cards = ((msg as any).cards || []).map((c: any) => ({
          controller: c.controller,
          location: c.location,
          sequence: c.sequence,
          position: c.position,
        }));
        description = `${cards.length} card(s) removed from duel.`;
        return {
          type,
          rawType,
          cards,
          isPrompt: false,
          description,
          raw: sanitizeBigInts(msg),
        };
      }

      default: {
        type = OcgMessageType[rawType] ?? `MSG_${rawType}`;
        description = `Engine message: ${type}`;
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }
    }
  }
}

