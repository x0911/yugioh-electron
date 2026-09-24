import { CARD_TYPES } from '../../../shared/types/card.js';
import type { EvaluatorContext } from '../types.js';
import { getAiAndOpponentFields } from '../types.js';
import type { FieldCard } from '../../../shared/types/field.js';

export interface SynchroOpportunity {
  synchroCode: number;
  synchroName: string;
  synchroLevel: number;
  tunerCode: number;
  tunerSeq: number;
  materialCodes: number[];
  scoreBonus: number;
}

/**
 * Universal Synchro Solver (WindBot Synchro Math Engine).
 * Dynamically computes if face-up Tuners and Non-Tuners on field match
 * the exact level sum of any Synchro monster in the Extra Deck.
 */
export function evaluateSynchroOpportunities(context: EvaluatorContext): SynchroOpportunity[] {
  const { aiField } = getAiAndOpponentFields(context);
  const { cardReader } = context;
  if (!cardReader) return [];

  // 1. Gather all face-up monsters controlled by AI
  const faceUpMonsters = (aiField.monsterZones || [])
    .map((m, seq) => ({ card: m, seq }))
    .filter(
      (item): item is { card: FieldCard; seq: number } =>
        !!item.card &&
        (item.card.position === 'faceup_attack' || item.card.position === 'faceup_defense'),
    );

  if (faceUpMonsters.length < 2) return [];

  const tuners: Array<{ code: number; level: number; seq: number; atk: number }> = [];
  const nonTuners: Array<{ code: number; level: number; seq: number; atk: number }> = [];

  for (const item of faceUpMonsters) {
    const code = item.card.code;
    const data = cardReader.getCardData(code);
    if (!data || (data.type & CARD_TYPES.MONSTER) === 0) continue;

    const level = data.level || item.card.level || 0;
    if (level <= 0) continue;

    const isTuner = (data.type & CARD_TYPES.TUNER) !== 0;
    const entry = { code, level, seq: item.seq, atk: item.card.atk ?? data.attack ?? 0 };

    if (isTuner) {
      tuners.push(entry);
    } else {
      nonTuners.push(entry);
    }
  }

  if (tuners.length === 0 || nonTuners.length === 0) return [];

  // 2. Gather all Synchro monsters in AI Extra Deck
  const extraDeck = aiField.extraDeck || [];
  const opportunities: SynchroOpportunity[] = [];

  for (const extraCard of extraDeck) {
    const code = typeof extraCard === 'number' ? extraCard : (extraCard as any)?.code;
    if (!code) continue;

    const data = cardReader.getCardData(code);
    if (!data || (data.type & CARD_TYPES.SYNCHRO) === 0) continue;

    const synchroLevel = data.level;
    if (!synchroLevel) continue;

    const synchroName = cardReader.getCardName(code);

    // 3. Find 1 Tuner + 1 Non-Tuner 2-card combos
    for (const tuner of tuners) {
      for (const nonTuner of nonTuners) {
        if (tuner.level + nonTuner.level === synchroLevel) {
          // Calculate score based on monster power relative to current board
          const currentCombinedAtk = tuner.atk + nonTuner.atk;
          const synchroAtk = data.attack || 0;
          const isAtkUpgrade = synchroAtk >= currentCombinedAtk;
          const baseBonus = isAtkUpgrade ? 3500 : 2500;

          opportunities.push({
            synchroCode: code,
            synchroName,
            synchroLevel,
            tunerCode: tuner.code,
            tunerSeq: tuner.seq,
            materialCodes: [tuner.code, nonTuner.code],
            scoreBonus: baseBonus,
          });
        }
      }
    }

    // 4. Find 1 Tuner + 2 Non-Tuners 3-card combos (e.g. 2 + 3 + 3 = 8 or 1 + 3 + 4 = 8)
    if (nonTuners.length >= 2) {
      for (const tuner of tuners) {
        for (let i = 0; i < nonTuners.length; i++) {
          for (let j = i + 1; j < nonTuners.length; j++) {
            const nt1 = nonTuners[i];
            const nt2 = nonTuners[j];
            if (tuner.level + nt1.level + nt2.level === synchroLevel) {
              opportunities.push({
                synchroCode: code,
                synchroName,
                synchroLevel,
                tunerCode: tuner.code,
                tunerSeq: tuner.seq,
                materialCodes: [tuner.code, nt1.code, nt2.code],
                scoreBonus: 3200,
              });
            }
          }
        }
      }
    }
  }

  // Sort by highest score bonus and highest ATK
  return opportunities.sort((a, b) => b.scoreBonus - a.scoreBonus);
}
