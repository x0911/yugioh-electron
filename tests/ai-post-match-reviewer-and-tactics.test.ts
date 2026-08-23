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
    hand: Array.from({ length: oppHandCount }, (_, i) => ({
      id: `opp-hand-${i}`,
      code: 0,
      name: 'Card Back',
      controller: 0,
      location: 'hand',
      sequence: i,
      position: 'facedown_spell',
      statuses: [],
    })),
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

  it('5. Tribute Fodder Preservation: Indestructible stall walls (Marshmallon) are protected from sacrifice', async () => {
    const { DefaultExecutor } = await import('../src/main/ai/executors/DefaultExecutor.js');
    const { aiController } = await import('../src/main/ai/AIController.js');
    const { OcgMessageType, OcgResponseType } = await import('ocgcore-wasm');

    const executor = new DefaultExecutor();
    const context = createMockContext(2, 2);

    // Marshmallon (31305911, 300 ATK) vs normal monster (1200 ATK)
    const msg = {
      type: OcgMessageType.SELECT_TRIBUTE,
      min: 1,
      max: 1,
      selects: [
        { code: 31305911, controller: 1, location: 'monster', sequence: 0 }, // Marshmallon
        { code: 1000, controller: 1, location: 'monster', sequence: 1 }, // Generic 1200 ATK
      ],
    };

    const tributes = executor.onSelectTribute(msg as any, context);
    assert.deepEqual(tributes, [1], 'Must choose index 1 (generic monster) instead of index 0 (Marshmallon)');

    const aiResp = aiController.decideResponse(msg as any, context);
    assert.equal(aiResp.type, OcgResponseType.SELECT_TRIBUTE);
    assert.deepEqual((aiResp as any).indicies, [1], 'AIController must preserve Marshmallon');
  });

  it('6. Post-Match Reviewer: Detects WALL_SACRIFICE when AI tributes indestructible stall monster', async () => {
    const testPath = '/tmp/test-tactical-memory-wall.json';
    try {
      const fs = await import('node:fs');
      if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
    } catch {}
    const memoryStore = new TacticalMemoryStore(testPath);
    const reviewer = new DuelReviewerService(memoryStore);

    const wallSacrificeLog = `=== YU-GI-OH! DUEL LOG & DIAGNOSTIC REPORT ===
• Turn: 28 | Phase: M1 | Turn Player: Opponent
--- EVENT STREAM ---
[42:52.9] [NEW_TURN] Turn 24 begins. Active player: Player 1
[42:53.5] [DRAW] Player 1 drew: Marshmallon
[42:53.5] [SET] Player 1 Set a card on the field.
[43:11.9] [NEW_TURN] Turn 28 begins. Active player: Player 1
[43:11.9] [DRAW] Player 1 drew: Cyber Prima
[43:13.3] [SELECT_TRIBUTE] Select 1 monster(s) to Tribute.
[43:13.3] [SET] Player 1 Set a card on the field.
[43:32.1] [WIN] Duel ended! Winner: Player 0 (Reason: 1).
==============================================`;

    const report = await reviewer.reviewDuel(wallSacrificeLog, null, 1, 'Yugi Muto');
    assert.ok(report.blunders.some((b) => b.type === 'WALL_SACRIFICE'), 'Must detect WALL_SACRIFICE blunder');
    assert.ok(report.learnedLessons.some((l) => l.includes('indestructible stall walls')));
  });

  it('7. High-DEF Wall Avoidance in decideSelectCard: Giant Soldier of Stone (2000 DEF) is avoided', async () => {
    const { aiController } = await import('../src/main/ai/AIController.js');
    const { OcgMessageType, OcgResponseType } = await import('ocgcore-wasm');

    const context = createMockContext(2, 2);
    const oppField = context.boardState.userField;
    // Set opp monster 0: Giant Soldier of Stone in face-up defense (2000 DEF)
    oppField.monsterZones[0] = createMockCard({
      code: 13039848,
      name: 'Giant Soldier of Stone',
      controller: 0,
      position: 'faceup_defense',
      atk: 1300,
      def: 2000,
      sequence: 0,
    });
    // Set opp monster 1: Face-down unknown monster (sanitized for anti-cheat)
    oppField.monsterZones[1] = {
      id: 'opp-m2',
      code: 0,
      name: 'Face-down Card',
      controller: 0,
      location: 'monster',
      sequence: 1,
      position: 'facedown_defense',
      atk: undefined,
      def: undefined,
      level: undefined,
      statuses: [],
    };

    const msg = {
      type: OcgMessageType.SELECT_CARD,
      min: 1,
      max: 1,
      selects: [
        { code: 13039848, controller: 0, location: 0x4, sequence: 0, position: 4 }, // Giant Soldier of Stone
        { code: 0, controller: 0, location: 0x4, sequence: 1, position: 8 }, // Face-down monster
      ],
    };

    const aiResp = aiController.decideResponse(msg as any, context);
    assert.equal(aiResp.type, OcgResponseType.SELECT_CARD);
    // Index 1 (face-down monster) must be chosen over Index 0 (2000 DEF wall)
    assert.deepEqual((aiResp as any).indicies, [1], 'AI must target face-down card and avoid 2000 DEF wall');
  });

  it('8. Stolen Monster Tribute Priority: Stolen monster under Snatch Steal is sacrificed first', async () => {
    const { DefaultExecutor } = await import('../src/main/ai/executors/DefaultExecutor.js');
    const { aiController } = await import('../src/main/ai/AIController.js');
    const { OcgMessageType, OcgResponseType } = await import('ocgcore-wasm');

    const executor = new DefaultExecutor();
    const context = createMockContext(2, 2);
    // AI has Snatch Steal in spell zone
    const aiField = context.boardState.opponentField;
    aiField.spellTrapZones[0] = createMockCard({
      code: 45986603,
      name: 'Snatch Steal',
      controller: 1,
      location: 'spell',
    });

    const msg = {
      type: OcgMessageType.SELECT_TRIBUTE,
      min: 1,
      max: 1,
      selects: [
        { code: 10000, controller: 1, owner: 1, location: 'monster', sequence: 0 }, // AI native monster (1400 ATK)
        { code: 20000, controller: 1, owner: 0, location: 'monster', sequence: 1 }, // Stolen Celtic Guardian (1400 ATK)
      ],
    };

    const tributes = executor.onSelectTribute(msg as any, context);
    assert.deepEqual(tributes, [1], 'DefaultExecutor must prioritize sacrificing stolen monster (index 1)');

    const aiResp = aiController.decideResponse(msg as any, context);
    assert.equal(aiResp.type, OcgResponseType.SELECT_TRIBUTE);
    assert.deepEqual((aiResp as any).indicies, [1], 'AIController must prioritize sacrificing stolen monster');
  });

  it('9. Post-Match Reviewer: Auto-detects aiPlayerId = 0 when human is Player 1 and detects recoil attacks', async () => {
    const testPath = '/tmp/test-tactical-memory-recoil.json';
    try {
      const fs = await import('node:fs');
      if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
    } catch {}
    const memoryStore = new TacticalMemoryStore(testPath);
    const reviewer = new DuelReviewerService(memoryStore);

    // Duel log where Player 1 is Human (has card names in draw) and Player 0 is AI attacking into defense wall
    const userLog = `=== YU-GI-OH! DUEL LOG & DIAGNOSTIC REPORT ===
• Turn: 7 | Phase: BP | Turn Player: Player (You)
--- EVENT STREAM ---
[28:52.0] [DRAW] Player 0 drew 5 card(s).
[28:52.0] [DRAW] Player 1 drew: Buster Blader, Dark Hole, Giant Soldier of Stone
[29:32.6] [NEW_TURN] Turn 7 begins. Active player: Player 0
[29:32.6] [ATTACK] Player 0's monster declared an attack on opponent monster.
[29:32.6] [BATTLE] Battle clash: Attacker (ATK 1900) vs Defender (ATK 1300).
[29:32.6] [DAMAGE] Player 0 took 100 damage.
[29:33.9] [ATTACK] Player 0's monster declared an attack on opponent monster.
[29:33.9] [BATTLE] Battle clash: Attacker (ATK 1500) vs Defender (ATK 1300).
[29:33.9] [DAMAGE] Player 0 took 500 damage.
[29:35.4] [ATTACK] Player 0's monster declared an attack on opponent monster.
[29:35.4] [BATTLE] Battle clash: Attacker (ATK 1400) vs Defender (ATK 1300).
[29:35.4] [DAMAGE] Player 0 took 600 damage.
[29:40.0] [WIN] Duel ended! Winner: Player 1 (Reason: 1).
==============================================`;

    const report = await reviewer.reviewDuel(userLog, null, 1, 'Marik Ishtar');
    assert.equal(report.matchResult, 'DEFEAT');
    // Must detect all 3 recoil attack blunders for Player 0
    assert.equal(report.blunders.filter((b) => b.type === 'SUICIDAL_ATTACK').length, 3);
    assert.ok(report.gradeScore < 50);
  });
});

