import {
  OcgLocation,
  OcgPosition,
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  SelectBattleCMDAction,
  SelectFieldPlace,
  OcgMessage,
  OcgResponse,
  ocgPositionParse,
  OcgRace,
  OcgAttribute
} from 'ocgcore-wasm';

/**
 * Parses the ocgcore field_mask bitmask for SELECT_PLACE / SELECT_DISFIELD.
 * The mask is encoded relative to the requesting player:
 * - Bits 0..4 (0x1F): Player's own Main Monster Zones (0..4)
 * - Bits 8..12 (0x1F00): Player's own Spell/Trap Zones (0..4)
 * - Bit 13 (0x2000): Player's own Field Spell Zone (0)
 * - Bits 16..20 (0x1F0000): Opponent's Main Monster Zones (0..4)
 * - Bits 24..28 (0x1F000000): Opponent's Spell/Trap Zones (0..4)
 * - Bit 29 (0x20000000): Opponent's Field Spell Zone (0)
 *
 * In the mask, a 0 bit means the slot is available, and a 1 bit means unavailable.
 */
export function parseFieldMask(player: number, fieldMask: number, count: number): SelectFieldPlace[] {
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
      // 1. Activate any available spell/trap/monster effects
      if (msg.activates && msg.activates.length > 0) {
        return {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.SELECT_ACTIVATE,
          index: 0
        };
      }
      // 2. Normal Summon available monsters
      if (msg.summons && msg.summons.length > 0) {
        return {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.SELECT_SUMMON,
          index: 0
        };
      }
      // 3. Special Summon if available
      if (msg.special_summons && msg.special_summons.length > 0) {
        return {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.SELECT_SPECIAL_SUMMON,
          index: 0
        };
      }
      // 4. Set spells/traps if available
      if (msg.spell_sets && msg.spell_sets.length > 0) {
        return {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.SELECT_SPELL_SET,
          index: 0
        };
      }
      // 5. Enter Battle Phase if permitted
      if (msg.to_bp) {
        return {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.TO_BP,
          index: null
        };
      }
      // 6. Otherwise proceed to End Phase
      if (msg.to_ep) {
        return {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.TO_EP,
          index: null
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
          index: 0
        };
      }
      // 2. Chain/activate during battle step if available
      if (msg.chains && msg.chains.length > 0) {
        return {
          type: OcgResponseType.SELECT_BATTLECMD,
          action: SelectBattleCMDAction.SELECT_CHAIN,
          index: 0
        };
      }
      // 3. Move to Main Phase 2 or End Phase
      if (msg.to_m2) {
        return {
          type: OcgResponseType.SELECT_BATTLECMD,
          action: SelectBattleCMDAction.TO_M2,
          index: null
        };
      }
      if (msg.to_ep) {
        return {
          type: OcgResponseType.SELECT_BATTLECMD,
          action: SelectBattleCMDAction.TO_EP,
          index: null
        };
      }
      return null;
    }

    case OcgMessageType.SELECT_CHAIN: {
      // Pass on optional chains to keep turns moving; select 0 if forced
      return {
        type: OcgResponseType.SELECT_CHAIN,
        index: msg.forced && msg.selects.length > 0 ? 0 : null
      };
    }

    case OcgMessageType.SELECT_EFFECTYN: {
      return {
        type: OcgResponseType.SELECT_EFFECTYN,
        yes: true
      };
    }

    case OcgMessageType.SELECT_YESNO: {
      return {
        type: OcgResponseType.SELECT_YESNO,
        yes: true
      };
    }

    case OcgMessageType.SELECT_OPTION: {
      return {
        type: OcgResponseType.SELECT_OPTION,
        index: 0
      };
    }

    case OcgMessageType.SELECT_CARD: {
      const minCount = Math.max(1, msg.min ?? 1);
      const count = Math.min(minCount, msg.selects.length);
      const indicies = Array.from({ length: count }, (_, i) => i);
      return {
        type: OcgResponseType.SELECT_CARD,
        indicies
      };
    }

    case OcgMessageType.SELECT_POSITION: {
      const positions = ocgPositionParse(msg.positions);
      return {
        type: OcgResponseType.SELECT_POSITION,
        position: positions[0] ?? OcgPosition.FACEUP_ATTACK
      };
    }

    case OcgMessageType.SELECT_TRIBUTE: {
      const minCount = Math.max(1, msg.min ?? 1);
      const count = Math.min(minCount, msg.selects.length);
      const indicies = Array.from({ length: count }, (_, i) => i);
      return {
        type: OcgResponseType.SELECT_TRIBUTE,
        indicies
      };
    }

    case OcgMessageType.SELECT_PLACE:
    case OcgMessageType.SELECT_DISFIELD: {
      const places = parseFieldMask(msg.player, msg.field_mask, msg.count);
      return {
        type: OcgResponseType.SELECT_PLACE,
        places
      };
    }

    case OcgMessageType.SELECT_SUM: {
      // Select first elements up to min
      const count = Math.max(1, msg.min ?? 1);
      const indicies = Array.from({ length: count }, (_, i) => i);
      return {
        type: OcgResponseType.SELECT_SUM,
        indicies
      };
    }

    case OcgMessageType.SELECT_UNSELECT_CARD: {
      if (msg.select_cards && msg.select_cards.length > 0) {
        return {
          type: OcgResponseType.SELECT_UNSELECT_CARD,
          index: 0
        };
      }
      return {
        type: OcgResponseType.SELECT_UNSELECT_CARD,
        index: null
      };
    }

    case OcgMessageType.SELECT_CARD_CODES: {
      return {
        type: OcgResponseType.SELECT_CARD_CODES,
        codes: msg.codes && msg.codes.length > 0 ? [msg.codes[0]] : null
      };
    }

    case OcgMessageType.ANNOUNCE_RACE: {
      return {
        type: OcgResponseType.ANNOUNCE_RACE,
        races: [OcgRace.WARRIOR]
      };
    }

    case OcgMessageType.ANNOUNCE_ATTRIB: {
      return {
        type: OcgResponseType.ANNOUNCE_ATTRIB,
        attributes: [OcgAttribute.DARK]
      };
    }

    case OcgMessageType.ANNOUNCE_CARD: {
      return {
        type: OcgResponseType.ANNOUNCE_CARD,
        card: 91152256
      };
    }

    case OcgMessageType.ANNOUNCE_NUMBER: {
      const val = msg.options && msg.options.length > 0 ? Number(msg.options[0]) : 1;
      return {
        type: OcgResponseType.ANNOUNCE_NUMBER,
        value: val
      };
    }

    case OcgMessageType.ROCK_PAPER_SCISSORS: {
      return {
        type: OcgResponseType.ROCK_PAPER_SCISSORS,
        value: 2 // Rock
      };
    }

    case OcgMessageType.SORT_CARD: {
      const order = msg.cards ? Array.from({ length: msg.cards.length }, (_, i) => i) : null;
      return {
        type: OcgResponseType.SORT_CARD,
        order
      };
    }

    default:
      return null;
  }
}
