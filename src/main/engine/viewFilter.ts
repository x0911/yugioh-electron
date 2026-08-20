import { CARD_LOCATIONS, CARD_POSITIONS, type DuelCardSummary } from '../../shared/types/duel.js';
import type { FieldCard, PlayerFieldState } from '../../shared/types/field.js';
import { type DecodedDuelEvent } from './messageDecoder.js';

export class ViewFilterService {
  /**
   * Filters a single card summary based on the viewing player's perspective.
   * If the card is in a hidden zone belonging to the opponent (opponent's hand, deck, face-down on field),
   * its passcode/code is redacted to 0 unless it is publicly face-up.
   */
  public filterCardForViewer(
    card: DuelCardSummary,
    cardOwner: number,
    viewerPlayerId: number,
  ): DuelCardSummary {
    const isOwner = cardOwner === viewerPlayerId;

    // Public locations (Graveyard, Banished Face-Up, Field Face-Up)
    const isPublicLocation =
      card.location === CARD_LOCATIONS.GRAVE ||
      (card.location === CARD_LOCATIONS.REMOVED && (card.position & CARD_POSITIONS.FACEUP) !== 0) ||
      (card.location === CARD_LOCATIONS.MZONE && (card.position & CARD_POSITIONS.FACEUP) !== 0) ||
      (card.location === CARD_LOCATIONS.SZONE && (card.position & CARD_POSITIONS.FACEUP) !== 0);

    if (isOwner || isPublicLocation) {
      return { ...card };
    }

    // Otherwise, card is in a hidden zone from the perspective of viewerPlayerId
    return {
      ...card,
      code: 0,
    };
  }

  /**
   * Filters a FieldCard instance for a viewer player.
   * If the card is in a private/hidden zone of the opponent, redacts code, stats, description, and statuses.
   */
  public filterFieldCardForViewer(card: FieldCard | null, viewerPlayerId: number): FieldCard | null {
    if (!card) return null;
    const isOwner = card.controller === viewerPlayerId;
    const isFaceup = card.position === 'faceup_attack' || card.position === 'faceup_defense' || card.position === 'faceup_spell';
    const isPublicLocation = card.location === 'graveyard' || card.location === 'banished' || (isFaceup && (card.location === 'monster' || card.location === 'spell-trap' || card.location === 'field'));

    if (isOwner || isPublicLocation) {
      return { ...card };
    }

    // Redacted secret card
    return {
      ...card,
      code: 0,
      name: card.location === 'hand' ? 'Card Back' : card.location === 'monster' ? 'Face-down Monster' : 'Face-down Card',
      atk: undefined,
      def: undefined,
      baseAtk: undefined,
      baseDef: undefined,
      level: undefined,
      attribute: undefined,
      race: undefined,
      type: undefined,
      description: undefined,
      statuses: [],
    };
  }

  /**
   * Sanitizes an entire PlayerFieldState for a viewer.
   */
  public filterPlayerFieldForViewer(pf: PlayerFieldState, viewerPlayerId: number): PlayerFieldState {
    const isOwner = pf.playerId === viewerPlayerId;
    if (isOwner) {
      return JSON.parse(JSON.stringify(pf));
    }

    return {
      ...pf,
      hand: pf.hand.map((c) => this.filterFieldCardForViewer(c, viewerPlayerId)!),
      monsterZones: pf.monsterZones.map((c) => this.filterFieldCardForViewer(c, viewerPlayerId)),
      spellTrapZones: pf.spellTrapZones.map((c) => this.filterFieldCardForViewer(c, viewerPlayerId)),
      fieldZone: this.filterFieldCardForViewer(pf.fieldZone, viewerPlayerId),
      graveyard: pf.graveyard.map((c) => this.filterFieldCardForViewer(c, viewerPlayerId)!),
      banished: pf.banished.map((c) => this.filterFieldCardForViewer(c, viewerPlayerId)!),
      extraDeck: pf.extraDeck.map((c) => this.filterFieldCardForViewer(c, viewerPlayerId)!),
    };
  }

  /**
   * Filters decoded duel events before they are transmitted over IPC to the renderer (human view)
   * or passed to AIController (AI view).
   */
  public filterEventForViewer(event: DecodedDuelEvent, viewerPlayerId: number): DecodedDuelEvent {
    // If event is DRAW:
    if (event.type === 'DRAW' && event.drawnCards && event.player !== undefined) {
      if (event.player !== viewerPlayerId) {
        // Redact opponent drawn cards
        const redactedDrawnCards = event.drawnCards.map(() => ({
          code: 0,
          cardName: 'Card Back',
        }));
        return {
          ...event,
          drawnCards: redactedDrawnCards,
          description: `Player ${event.player} drew ${event.drawnCards.length} card(s).`,
        };
      }
    }

    // Redact opponent face-down / hidden cards in selection prompt targets
    if (event.promptData && (event.promptData as any).selects && Array.isArray((event.promptData as any).selects)) {
      const sanitizedSelects = (event.promptData as any).selects.map((s: any) => {
        const isOwner = s.controller === viewerPlayerId;
        const isFacedown =
          s.position === 8 ||
          (s.position !== undefined && (s.position & 0x8) !== 0) ||
          s.location === 1 || // deck
          s.location === 2 || // hand
          s.location === 64; // extra-deck

        if (!isOwner && isFacedown) {
          const loc = s.location;
          return {
            ...s,
            code: 0,
            cardName:
              loc === 4
                ? 'Face-down Monster'
                : loc === 8
                  ? 'Face-down Card'
                  : loc === 2
                    ? 'Card Back'
                    : 'Face-down Card',
          };
        }
        return { ...s };
      });

      return {
        ...event,
        promptData: {
          ...event.promptData,
          selects: sanitizedSelects,
        },
      };
    }

    return event;
  }
}
