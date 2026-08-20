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

export interface DecodedDuelEvent {
  type: string;
  rawType: number;
  player?: number;
  controller?: number;
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
  isPrompt: boolean;
  promptPlayer?: number;
  promptType?: string;
  promptData?: unknown;
  description: string;
  raw: unknown;
}

/**
 * Parses the ocgcore field_mask bitmask for SELECT_PLACE / SELECT_DISFIELD.
 * The mask is encoded relative to the requesting player:
 * - Bits 0..4 (0x1F): Player's own Main Monster Zones (0..4)
 * - Bits 8..12 (0x1F00): Player's own Spell/Trap Zones (0..4)
 * - Bit 13 (0x2000): Player's own Field Spell Zone (0)
 * - Bits 16..20 (0x1F0000): Opponent's Main Monster Zones (0..4)
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

  // 1. Player's own Monster Zones (bits 0..4)
  for (let seq = 0; seq < 5; seq++) {
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

  // 4. Opponent's Monster Zones (bits 16..20)
  for (let seq = 0; seq < 5; seq++) {
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
      const count = Math.min(minCount, msg.selects.length);
      const indicies = Array.from({ length: count }, (_, i) => i);
      return {
        type: OcgResponseType.SELECT_TRIBUTE,
        indicies,
      };
    }

    case OcgMessageType.SELECT_PLACE:
    case OcgMessageType.SELECT_DISFIELD: {
      const places = parseFieldMask(msg.player, msg.field_mask, msg.count);
      return {
        type: OcgResponseType.SELECT_PLACE,
        places,
      };
    }

    case OcgMessageType.SELECT_SUM: {
      const count = Math.max(1, msg.min ?? 1);
      const indicies = Array.from({ length: count }, (_, i) => i);
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
      return {
        type: OcgResponseType.ANNOUNCE_RACE,
        races: [OcgRace.WARRIOR],
      };
    }

    case OcgMessageType.ANNOUNCE_ATTRIB: {
      return {
        type: OcgResponseType.ANNOUNCE_ATTRIB,
        attributes: [OcgAttribute.DARK],
      };
    }

    case OcgMessageType.ANNOUNCE_CARD: {
      return {
        type: OcgResponseType.ANNOUNCE_CARD,
        card: 91152256, // Celtic Guardian
      };
    }

    case OcgMessageType.ANNOUNCE_NUMBER: {
      const val = msg.options && msg.options.length > 0 ? Number(msg.options[0]) : 1;
      return {
        type: OcgResponseType.ANNOUNCE_NUMBER,
        value: val,
      };
    }

    case OcgMessageType.ROCK_PAPER_SCISSORS: {
      return {
        type: OcgResponseType.ROCK_PAPER_SCISSORS,
        value: 2, // Rock
      };
    }

    case OcgMessageType.SORT_CARD: {
      const order = msg.cards ? Array.from({ length: msg.cards.length }, (_, i) => i) : null;
      return {
        type: OcgResponseType.SORT_CARD,
        order,
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

  constructor(cardReader: CardReaderService) {
    this.cardReader = cardReader;
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
        const name = msg.card > 0 ? this.cardReader.getCardName(msg.card) : 'Card';
        description = `Card moved to new location.`;
        return {
          type,
          rawType,
          code: msg.card,
          cardName: name,
          controller: msg.to.controller,
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

      case OcgMessageType.ATTACK: {
        type = 'ATTACK';
        const cardSeq = msg.card?.sequence ?? 0;
        const cardCtrl = msg.card?.controller ?? 0;
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

      case OcgMessageType.WIN: {
        type = 'WIN';
        description = `Duel ended! Winner: Player ${msg.player} (Reason: ${msg.reason}).`;
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
          selects: msg.selects.map((s) => ({
            ...s,
            cardName: s.code > 0 ? this.cardReader.getCardName(s.code) : 'Card',
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
        const resolvedEffectDesc = this.cardReader.resolveString(msg.description);
        description = resolvedEffectDesc || `Activate effect of "${name}"?`;

        promptData = {
          player: msg.player,
          code: msg.code,
          cardName: name,
          description: resolvedEffectDesc,
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
        description = `Do you wish to proceed?`;

        promptData = {
          player: msg.player,
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

      case OcgMessageType.SELECT_PLACE:
      case OcgMessageType.SELECT_DISFIELD: {
        isPrompt = true;
        type = 'SELECT_PLACE';
        promptType = 'SELECT_PLACE';
        promptPlayer = msg.player;
        description = `Select a zone on the field.`;

        promptData = {
          player: msg.player,
          count: msg.count,
          field_mask: msg.field_mask,
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

      default: {
        type = OcgMessageType[rawType] ?? `MSG_${rawType}`;
        description = `Engine message: ${type}`;
        return { type, rawType, isPrompt: false, description, raw: sanitizeBigInts(msg) };
      }
    }
  }
}

