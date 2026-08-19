import { CARD_LOCATIONS, CARD_POSITIONS, type DuelCardSummary } from '../../shared/types/duel.js';
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
   * Filters decoded duel events before they are transmitted over IPC to the renderer (human view)
   * or passed to AIController (AI view).
   */
  public filterEventForViewer(
    event: DecodedDuelEvent,
    viewerPlayerId: number,
  ): DecodedDuelEvent {
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

    return event;
  }
}
