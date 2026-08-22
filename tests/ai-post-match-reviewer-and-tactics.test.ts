import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSpellActivation } from '../src/main/ai/evaluators/spellTrapEvaluator.js';
import { evaluateAttackOption, type AttackCandidate } from '../src/main/ai/evaluators/combatEvaluator.js';
import { DuelReviewerService } from '../src/main/ai/reviewer/DuelReviewerService.js';
import { TacticalMemoryStore } from '../src/main/ai/reviewer/tacticalMemory.js';
import type { EvaluatorContext } from '../src/main/ai/types.js';
import type { FieldCard, PlayerFieldState } from '../src/shared/types/field.js';

function createMockCard(params: Partial<FieldCard>): FieldCard {
  return {
    id: `card-${Math.random().toString(36).slice(2, 7)}`,
    code: params.code ?? 1000,
    name: params.name ?? 'Mock Monster',
    controller: params.controller ?? 0,
    location: params.location ?? 'monster',
    sequence: params.sequence ?? 0,
    position: params.position ?? 'faceup_attack',
    atk: params.atk ?? 1000,
    def: params.def ?? 1000,
    level: 4,
    statuses: [],
    ...params,
  };
}

function createMockContext(aiHandCount = 2, oppHandCount = 4): EvaluatorContext {
  const aiField: PlayerFieldState = {
    playerId: 1,
    name: 'AI Duelist',
    currentLp: 8000,
    maxLp: 8000,
    isTurn: true,
    deckCount: 30,
    extraDeckCount: 0,
    hand: Array.from({ length: aiHandCount }, (_, i) =>
      createMockCard({ code: 72892420, name: 'Card Destruction', location: 'hand', sequence: i, controller: 1 }),
    ),
    monsterZones: [null, null, null, null, null],
    spellTrapZones: [null, null, null, null, null],
    fieldZone: null,
    graveyard: [],
    banished: [],
    extraDeck: [],
  };

  const oppField: PlayerFieldState = {
    playerId: 0,
    name: 'Player',
    currentLp: 8000,
    maxLp: 8000,
    isTurn: false,
    deckCount: 30,
    extraDeckCount: 0,
    hand: Array.from({ length: oppHandCount }, (_, i) =>
      createMockCard({ code: 89631139, name: 'Opponent Card', location: 'hand', sequence: i, controller: 0 }),
    ),
    monsterZones: [null, null, null, null, null],
    spellTrapZones: [null, null, null, null, null],
    fieldZone: null,
    graveyard: [],
    banished: [],
    extraDeck: [],
  };

  return {
    aiPlayerId: 1,
    boardState: {
      userField: oppField,
      opponentField: aiField,
      extraMonsterZones: [null, null],
      turnNumber: 2,
      currentPhase: 'MAIN1',
      activePrompt: null,
      phaseGuideText: '',
      winner: null,
    },
    personality: {
      characterId: 'kaiba',
      characterName: 'Seto Kaiba',
      aggression: 0.8,
      defensiveness: 0.3,
      comboFocus: 0.8,
      riskTolerance: 0.5,
      signatureFavoritism: 0.9,
      cardAdvantageWeight: 0.8,
    },
    signatureCardIds: [],
    aiDeckCards: [],
    deckArchetype: 'standard',
    cardReader: {
      getCardDetail: () => null,
      getCardName: () => 'Card',
      resolveString: () => '',
    },
  };
}

describe('AI Tactical Improvements & Autonomous Post-Match Reviewer', () => {
  it('1. Card Destruction: Penalized when AI has <= 2 cards and opponent has >= 3 cards', () => {
    const context = createMockContext(2, 4); // AI has 2 cards, opponent has 4
    const result = evaluateSpellActivation(72892420, 'Card Destruction', context);
    assert.ok(result.score < 0, `Expected negative score, got ${result.score}`);
    assert.match(result.reason, /give opponent \+4 fresh cards/);
  });

  it('2. Card Destruction: Favored when AI hand is larger or opponent has >= 5 cards', () => {
    const context = createMockContext(5, 2); // AI has 5 cards, opponent has 2
    const result = evaluateSpellActivation(72892420, 'Card Destruction', context);
    assert.ok(result.score > 1000, `Expected positive score, got ${result.score}`);
  });

  it('3. Face-Down Combat: Beatstick attackers (>= 1600 ATK) aggressively attack face-down defenders', () => {
    const context = createMockContext(3, 3);
    const oppField = context.boardState.userField;
    oppField.monsterZones[0] = createMockCard({
      code: 1000,
      name: 'Face-down Monster',
      controller: 0,
      position: 'facedown_defense',
    });

    const candidate: AttackCandidate = {
      attackerIndex: 0,
      attackerSeq: 0,
      attackerAtk: 1700, // Beta The Magnet Warrior
      attackerName: 'Beta The Magnet Warrior',
      attackerCode: 39256679,
    };

    const action = evaluateAttackOption(candidate, context);
    assert.ok(action.score > 300, `Expected confident attack score against face-down, got ${action.score}`);
  });

  it('4. Post-Match Reviewer: Detects suicidal attacks & Card Destruction leaks, logs learned remedies', async () => {
    const testPath = '/tmp/test-tactical-memory.json';
    try {
      const fs = await import('node:fs');
      if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
    } catch {}
    const memoryStore = new TacticalMemoryStore(testPath);
    const reviewer = new DuelReviewerService(memoryStore);

    const sampleLog = `=== YU-GI-OH! DUEL LOG & DIAGNOSTIC REPORT ===
• Turn: 4 | Phase: BP | Turn Player: Opponent
• Player LP: 8000/8000 | Opponent LP: 0/8000
--- EVENT STREAM ---
[10:14.9] [NEW_TURN] Turn 2 begins. Active player: Player 1
[10:20.4] [CHAINING] Player 1 activated effect of Card Destruction (Chain Link 1)
[10:20.4] [DRAW] Player 1 drew 2 card(s).
[10:20.4] [DRAW] Player 0 drew 4 card(s).
[10:20.4] [CHAIN_SOLVED] Chain link (1) resolved.
[12:02.5] [NEW_TURN] Turn 4 begins. Active player: Player 1
[12:02.5] [ATTACK] Player 1's monster declared an attack on opponent monster.
[12:02.5] [BATTLE] Battle clash: Attacker (ATK 1300) vs Defender (ATK 5600).
[12:02.5] [DAMAGE] Player 1 took 4300 damage.
[12:02.5] [WIN] Duel ended! Winner: Player 0 (Reason: 1).
==============================================`;

    const report = await reviewer.reviewDuel(sampleLog, null, 1, 'Yugi Muto');

    assert.equal(report.tacticalGrade, 'D');
    assert.equal(report.blunders.length, 2);
    assert.equal(report.blunders[0].type, 'CARD_ADVANTAGE_LEAK');
    assert.equal(report.blunders[1].type, 'SUICIDAL_ATTACK');
    assert.ok(report.learnedLessons.length >= 2);

    // Verify persistence in tactical memory store
    const mem = memoryStore.getMemory();
    assert.equal(mem.blunders.length, 2);
    assert.ok(mem.learnedRules.some((r) => r.includes('avoid declaring attacks when attacker ATK is lower')));
  });
});
