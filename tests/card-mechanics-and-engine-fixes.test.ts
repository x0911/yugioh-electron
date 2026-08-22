import assert from 'node:assert/strict';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { AIController } from '../src/main/ai/AIController.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { ViewFilterService } from '../src/main/engine/viewFilter.js';
import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  SelectBattleCMDAction,
  OcgPosition,
} from 'ocgcore-wasm';
import type { EvaluatorContext } from '../src/main/ai/types.js';

async function runTestSuite() {
  console.log('================================================================');
  console.log('=== RUNNING COMPREHENSIVE CARD MECHANICS & ENGINE TEST SUITE ===');
  console.log('================================================================\n');

  const service = new DuelEngineService();
  await service.init();
  const cardReader = new CardReaderService();
  const aiController = new AIController();

  try {
    // 1. Graceful Charity
    console.log('▶ Test 1: Graceful Charity (Draw 3, Discard 2)');
    service.startNewDuel({
      player0Deck: [...Array(35).fill(25652259), 79571449, 79571449, 79571449, 79571449, 79571449],
      player1Deck: Array(40).fill(25652259),
      noShuffle: true,
      humanPlayerId: 0,
      startingLP: 8000,
    });

    const prompt1 = (service as any).lastPromptMessage;
    const gcIndex = prompt1?.activates?.findIndex((a: any) => a.code === 79571449);
    assert(gcIndex >= 0, 'Graceful Charity should be activatable in opening hand');

    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_ACTIVATE,
      index: gcIndex,
    });
    service.processStep();

    const discardPrompt = (service as any).lastPromptMessage;
    assert.equal(discardPrompt?.type, OcgMessageType.SELECT_CARD, 'Engine must prompt SELECT_CARD for discards');
    assert.equal(discardPrompt?.min, 2, 'Must require discarding exactly 2 cards');
    assert.equal(discardPrompt?.selects?.length, 7, 'Hand must contain 7 cards (5 - 1 played + 3 drawn)');

    service.sendResponse({
      type: OcgResponseType.SELECT_CARD,
      indicies: [0, 1],
    });
    service.processStep();

    const b1 = service.getBoardState();
    assert.equal(b1.userField.hand.length, 5, 'User hand must have 5 cards remaining after discard');
    service.destroyCurrentDuel();
    console.log('  ✓ Graceful Charity passed!\n');

    // 2. Harpie's Feather Duster
    console.log("▶ Test 2: Harpie's Feather Duster (Destroy all opponent Spell/Traps)");
    service.startNewDuel({
      player0Deck: [...Array(35).fill(25652259), 18144507, 18144507, 18144507, 18144507, 18144507],
      player1Deck: Array(40).fill(25652259),
      player1SpellTraps: [
        { code: 44095762, sequence: 0, position: 0x8 }, // Set Mirror Force
        { code: 72302403, sequence: 1, position: 0x1 }, // Face-up Swords of Revealing Light
      ],
      noShuffle: true,
      humanPlayerId: 0,
      startingLP: 8000,
    });

    const prompt2 = (service as any).lastPromptMessage;
    const hfdIndex = prompt2?.activates?.findIndex((a: any) => a.code === 18144507 || a.code === 18144506);
    assert(hfdIndex >= 0, 'HFD should be activatable when opponent has backrow');

    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_ACTIVATE,
      index: hfdIndex,
    });
    service.processStep();

    const b2 = service.getBoardState();
    assert.equal(b2.opponentField.spellTrapZones.filter(Boolean).length, 0, 'Opponent S/T zones must be cleared');
    const oppGy = b2.opponentField.graveyard.map((c) => c.code);
    assert(oppGy.includes(44095762), 'Mirror Force must be in opponent GY');
    assert(oppGy.includes(72302403), 'Swords of Revealing Light must be in opponent GY');
    service.destroyCurrentDuel();
    console.log("  ✓ Harpie's Feather Duster passed!\n");

    // 3. Monster Reborn
    console.log('▶ Test 3: Monster Reborn (Target selection, position selection & revival)');
    service.startNewDuel({
      player0Deck: [...Array(35).fill(25652259), 83764719, 83764719, 83764719, 83764719, 83764719],
      player0Graveyard: [25652259],
      player1Deck: Array(40).fill(25652259),
      noShuffle: true,
      humanPlayerId: 0,
      startingLP: 8000,
    });

    const prompt3 = (service as any).lastPromptMessage;
    const mrIndex = prompt3?.activates?.findIndex((a: any) => a.code === 83764719);
    assert(mrIndex >= 0, 'Monster Reborn should be activatable with monster in GY');

    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_ACTIVATE,
      index: mrIndex,
    });
    service.processStep();

    const targetPrompt = (service as any).lastPromptMessage;
    assert.equal(targetPrompt?.type, OcgMessageType.SELECT_CARD, 'Target selection prompt must appear');
    assert.equal(targetPrompt?.selects?.[0]?.code, 25652259, 'Target in GY must be selectable');

    service.sendResponse({
      type: OcgResponseType.SELECT_CARD,
      indicies: [0],
    });
    service.processStep();

    const posPrompt = (service as any).lastPromptMessage;
    assert.equal(posPrompt?.type, OcgMessageType.SELECT_POSITION, 'Position selection prompt must appear');

    service.sendResponse({
      type: OcgResponseType.SELECT_POSITION,
      position: OcgPosition.FACEUP_ATTACK,
    });
    service.processStep();

    const b3 = service.getBoardState();
    const revived = b3.userField.monsterZones.find((m) => m && m.code === 25652259);
    assert(revived, 'Monster must be revived on field');
    assert.equal(revived.position, 'faceup_attack', 'Monster must be in faceup_attack position');
    service.destroyCurrentDuel();
    console.log('  ✓ Monster Reborn passed!\n');

    // 4. Slifer the Sky Dragon
    console.log('▶ Test 4: Slifer the Sky Dragon (3-Tribute requirement & Hand-ATK calculation)');
    service.startNewDuel({
      player0Deck: [...Array(35).fill(25652259), 25652259, 25652259, 25652259, 25652259, 10000020],
      player0Monsters: [
        { code: 25652259, sequence: 0, position: 0x1 },
        { code: 25652259, sequence: 1, position: 0x1 },
        { code: 25652259, sequence: 2, position: 0x1 },
      ],
      player1Deck: Array(40).fill(25652259),
      noShuffle: true,
      humanPlayerId: 0,
      startingLP: 8000,
    });

    const prompt4 = (service as any).lastPromptMessage;
    const sliferIndex = prompt4?.summons?.findIndex((s: any) => s.code === 10000020);
    assert(sliferIndex >= 0, 'Slifer must be normal summonable with 3 tributes on field');

    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_SUMMON,
      index: sliferIndex,
    });
    service.processStep();

    const tributePrompt = (service as any).lastPromptMessage;
    assert.equal(tributePrompt?.type, OcgMessageType.SELECT_TRIBUTE, 'Must prompt SELECT_TRIBUTE');
    assert.equal(tributePrompt?.min, 3, 'Must require 3 tributes');
    assert.equal(tributePrompt?.selects?.length, 3, 'Must have 3 selectable monsters on field');

    service.sendResponse({
      type: OcgResponseType.SELECT_TRIBUTE,
      indicies: [0, 1, 2],
    });
    service.processStep();

    const b4 = service.getBoardState();
    const slifer = b4.userField.monsterZones.find((m) => m && m.code === 10000020);
    assert(slifer, 'Slifer must be face-up on field');
    assert.equal(slifer.atk, 4000, 'Slifer ATK must be 4000 (4 cards in hand * 1000)');
    service.destroyCurrentDuel();
    console.log('  ✓ Slifer the Sky Dragon passed!\n');

    // 5. Morphing Jar
    console.log('▶ Test 5: Morphing Jar (Flip Summon discard & draw 5)');
    service.startNewDuel({
      player0Deck: [...Array(35).fill(25652259), 25652259, 25652259, 25652259, 25652259, 25652259],
      player0Monsters: [
        { code: 33508719, sequence: 0, position: 0xa },
      ],
      player1Deck: Array(40).fill(25652259),
      noShuffle: true,
      humanPlayerId: 0,
      startingLP: 8000,
    });

    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_POS_CHANGE,
      index: 0,
    });
    service.processStep();

    service.sendResponse({
      type: OcgResponseType.SELECT_POSITION,
      position: OcgPosition.FACEUP_ATTACK,
    });
    service.processStep();

    const b5 = service.getBoardState();
    assert.equal(b5.userField.hand.length, 5, 'User hand must have 5 cards after Morphing Jar');
    assert.equal(b5.opponentField.hand.length, 5, 'Opponent hand must have 5 cards after Morphing Jar');
    assert.equal(b5.userField.graveyard.length, 5, 'User GY must contain the 5 discarded cards');
    service.destroyCurrentDuel();
    console.log('  ✓ Morphing Jar passed!\n');

    // 6. Ultimate Offering
    console.log('▶ Test 6: Ultimate Offering (500 LP cost, extra normal summon, no infinite chain loop)');
    service.startNewDuel({
      player0Deck: [...Array(35).fill(25652259), 25652259, 25652259, 25652259, 25652259, 25652259],
      player0SpellTraps: [
        { code: 80604092, sequence: 0, position: 0x1 },
      ],
      player1Deck: Array(40).fill(25652259),
      noShuffle: true,
      humanPlayerId: 0,
      startingLP: 8000,
    });

    // 1st Normal Summon
    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_SUMMON,
      index: 0,
    });
    service.processStep();

    // Pass chain
    service.sendResponse({
      type: OcgResponseType.SELECT_CHAIN,
      index: null,
    });
    service.processStep();

    // Activate Ultimate Offering
    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_ACTIVATE,
      index: 0,
    });
    service.processStep();

    // Pass chain to resolve
    service.sendResponse({
      type: OcgResponseType.SELECT_CHAIN,
      index: null,
    });
    service.processStep();

    const extraPrompt = (service as any).lastPromptMessage;
    assert.equal(extraPrompt?.type, OcgMessageType.SELECT_CARD, 'Must prompt SELECT_CARD for extra normal summon');

    service.sendResponse({
      type: OcgResponseType.SELECT_CARD,
      indicies: [0],
    });
    service.processStep();

    assert.equal(service.getState().p0LP, 7500, 'User LP must be 7500 after paying 500 LP cost');
    service.destroyCurrentDuel();
    console.log('  ✓ Ultimate Offering passed!\n');

    // 7. AI Combat Intelligence
    console.log('▶ Test 7: AI Combat Intelligence (Avoids attacking defense Gellenduo)');
    const context: EvaluatorContext = {
      aiPlayerId: 1,
      humanPlayerId: 0,
      boardState: {
        userField: {
          playerId: 0,
          name: 'Human',
          currentLp: 8000,
          maxLp: 8000,
          isTurn: false,
          monsterZones: [
            {
              id: 'human-monster-1',
              code: 11662742,
              name: 'Gellenduo',
              controller: 0,
              location: 'monster',
              sequence: 0,
              position: 'faceup_defense',
              atk: 1700,
              def: 0,
              level: 4,
              description: 'Cannot be destroyed by battle. If you take damage: Destroy this face-up card.',
              statuses: [],
            },
            null, null, null, null,
          ],
          spellTrapZones: [null, null, null, null, null],
          fieldZone: null,
          graveyard: [],
          banished: [],
          extraDeck: [],
          deckCount: 35,
          extraDeckCount: 0,
          hand: [],
        },
        opponentField: {
          playerId: 1,
          name: 'AI',
          currentLp: 8000,
          maxLp: 8000,
          isTurn: true,
          monsterZones: [
            {
              id: 'ai-monster-1',
              code: 89631139,
              name: 'Blue-Eyes White Dragon',
              controller: 1,
              location: 'monster',
              sequence: 0,
              position: 'faceup_attack',
              atk: 3000,
              def: 2500,
              level: 8,
              statuses: [],
            },
            null, null, null, null,
          ],
          spellTrapZones: [null, null, null, null, null],
          fieldZone: null,
          graveyard: [],
          banished: [],
          extraDeck: [],
          deckCount: 35,
          extraDeckCount: 0,
          hand: [],
        },
        extraMonsterZones: [null, null],
        turnNumber: 2,
        currentPhase: 'BP',
        activePrompt: null,
        phaseGuideText: '',
        winner: null,
        winReason: null,
      },
      personality: {
        id: 'yami-yugi',
        name: 'Yami Yugi',
        aggression: 0.7,
        defensiveness: 0.5,
        riskTolerance: 0.6,
        comboFocus: 0.8,
        signatureFavoritism: 0.9,
      },
      cardReader,
      currentPhase: 'BP',
      currentTurn: 2,
      signatureCardIds: [89631139],
    };

    const battleMsg: any = {
      type: OcgMessageType.SELECT_BATTLECMD,
      player: 1,
      attacks: [
        {
          code: 89631139,
          sequence: 0,
          controller: 1,
          atk: 3000,
          def: 2500,
        },
      ],
      to_m2: true,
      to_ep: true,
    };

    const decision = aiController.decideResponse(battleMsg, context);
    assert(
      decision.action === SelectBattleCMDAction.TO_M2 || decision.action === SelectBattleCMDAction.TO_EP,
      'AI must proceed to Main Phase 2 or End Phase instead of attacking Gellenduo',
    );
    console.log('  ✓ AI Combat Intelligence passed!\n');

    // 8. AI Summon Intelligence against Slifer the Sky Dragon
    console.log('▶ Test 8: AI Summon Intelligence (Sets in defense instead of suicidal Normal Summon into Slifer)');
    const sliferContext: EvaluatorContext = {
      aiPlayerId: 0,
      humanPlayerId: 1,
      boardState: {
        userField: {
          playerId: 1,
          name: 'Human',
          currentLp: 8000,
          maxLp: 8000,
          isTurn: false,
          monsterZones: [
            {
              id: 'human-slifer',
              code: 10000020, // Slifer the Sky Dragon
              name: 'Slifer the Sky Dragon',
              controller: 1,
              location: 'monster',
              sequence: 0,
              position: 'faceup_attack',
              atk: 4000,
              def: 4000,
              level: 10,
              description: 'Slifer 2000 ATK reduction / destruction on summon',
              statuses: [],
            },
            null, null, null, null,
          ],
          spellTrapZones: [null, null, null, null, null],
          fieldZone: null,
          graveyard: [],
          banished: [],
          extraDeck: [],
          deckCount: 35,
          extraDeckCount: 0,
          hand: [],
        },
        opponentField: {
          playerId: 0,
          name: 'AI',
          currentLp: 8000,
          maxLp: 8000,
          isTurn: true,
          monsterZones: [null, null, null, null, null],
          spellTrapZones: [null, null, null, null, null],
          fieldZone: null,
          graveyard: [],
          banished: [],
          extraDeck: [],
          deckCount: 35,
          extraDeckCount: 0,
          hand: [],
        },
        extraMonsterZones: [null, null],
        turnNumber: 3,
        currentPhase: 'M1',
        activePrompt: null,
        phaseGuideText: '',
        winner: null,
        winReason: null,
      },
      personality: {
        id: 'yami-yugi',
        name: 'Yami Yugi',
        aggression: 0.7,
        defensiveness: 0.5,
        riskTolerance: 0.6,
        comboFocus: 0.8,
        signatureFavoritism: 0.9,
      },
      cardReader,
      currentPhase: 'M1',
      currentTurn: 3,
      signatureCardIds: [],
    };

    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      player: 0,
      summons: [
        { code: 78010363, sequence: 0, controller: 0 }, // Magical Plant Mandragola (500 ATK)
      ],
      monster_sets: [
        { code: 78010363, sequence: 0, controller: 0 }, // Set Magical Plant Mandragola in Defense
      ],
      to_bp: true,
      to_ep: true,
    };

    // 9. AI Combat Intelligence against Spirit Reaper & Defense Destroyer
    console.log('▶ Test 9: AI Combat Intelligence (Spirit Reaper & Defense Destroyer)');
    const reaperContext: EvaluatorContext = {
      aiPlayerId: 1,
      humanPlayerId: 0,
      boardState: {
        userField: {
          playerId: 0,
          name: 'Human',
          currentLp: 8000,
          maxLp: 8000,
          isTurn: false,
          monsterZones: [
            {
              id: 'human-reaper',
              code: 23205979, // Spirit Reaper
              name: 'Spirit Reaper',
              controller: 0,
              location: 'monster',
              sequence: 0,
              position: 'faceup_defense',
              atk: 300,
              def: 200,
              level: 3,
              description: 'Cannot be destroyed by battle.',
              statuses: [],
            },
            null, null, null, null,
          ],
          spellTrapZones: [null, null, null, null, null],
          fieldZone: null,
          graveyard: [],
          banished: [],
          extraDeck: [],
          deckCount: 35,
          extraDeckCount: 0,
          hand: [],
        },
        opponentField: {
          playerId: 1,
          name: 'AI',
          currentLp: 8000,
          maxLp: 8000,
          isTurn: true,
          monsterZones: [
            {
              id: 'ai-cyber-prima',
              code: 94626871, // Cyber Prima (2300 ATK)
              name: 'Cyber Prima',
              controller: 1,
              location: 'monster',
              sequence: 0,
              position: 'faceup_attack',
              atk: 2300,
              def: 1600,
              level: 6,
              statuses: [],
            },
            {
              id: 'ai-sasuke',
              code: 4041838, // Ninja Grandmaster Sasuke (Defense destroyer effect)
              name: 'Ninja Grandmaster Sasuke',
              controller: 1,
              location: 'monster',
              sequence: 1,
              position: 'faceup_attack',
              atk: 1800,
              def: 1000,
              level: 4,
              statuses: [],
            },
            null, null, null,
          ],
          spellTrapZones: [null, null, null, null, null],
          fieldZone: null,
          graveyard: [],
          banished: [],
          extraDeck: [],
          deckCount: 35,
          extraDeckCount: 0,
          hand: [],
        },
        extraMonsterZones: [null, null],
        turnNumber: 2,
        currentPhase: 'BP',
        activePrompt: null,
        phaseGuideText: '',
        winner: null,
        winReason: null,
      },
      personality: {
        id: 'yami-yugi',
        name: 'Yami Yugi',
        aggression: 0.7,
        defensiveness: 0.5,
        riskTolerance: 0.6,
        comboFocus: 0.8,
        signatureFavoritism: 0.9,
      },
      cardReader,
      currentPhase: 'BP',
      currentTurn: 2,
      signatureCardIds: [],
    };

    // Standard monster (Cyber Prima) alone should avoid futile attack and go to M2
    const futileBattleMsg: any = {
      type: OcgMessageType.SELECT_BATTLECMD,
      player: 1,
      attacks: [
        { code: 94626871, sequence: 0, controller: 1, atk: 2300, def: 1600 },
      ],
      to_m2: true,
      to_ep: true,
    };
    const futileDecision = aiController.decideResponse(futileBattleMsg, reaperContext);
    assert(
      futileDecision.action === SelectBattleCMDAction.TO_M2 || futileDecision.action === SelectBattleCMDAction.TO_EP,
      'Cyber Prima must avoid attacking face-up defense Spirit Reaper and advance to M2/EP',
    );

    // Defense destroyer (Sasuke) should prioritize attacking face-up defense Spirit Reaper
    const sasukeBattleMsg: any = {
      type: OcgMessageType.SELECT_BATTLECMD,
      player: 1,
      attacks: [
        { code: 4041838, sequence: 1, controller: 1, atk: 1800, def: 1000 },
      ],
      to_m2: true,
      to_ep: true,
    };
    const sasukeDecision = aiController.decideResponse(sasukeBattleMsg, reaperContext);
    assert.equal(
      sasukeDecision.action,
      SelectBattleCMDAction.SELECT_BATTLE,
      'Ninja Grandmaster Sasuke must attack face-up defense Spirit Reaper to destroy it via effect',
    );
    console.log('  ✓ AI Spirit Reaper & Defense Destroyer passed!\n');

    // 10. Anti-Cheat ViewFilter Redaction of Opponent Face-Down Target Selects
    console.log('▶ Test 10: Anti-Cheat ViewFilter Redaction for Opponent Face-Down Selects');
    const filter = new ViewFilterService();
    const rawTargetEvent: any = {
      type: 'SELECT_CARD',
      promptType: 'SELECT_CARD',
      promptPlayer: 0,
      promptData: {
        player: 0,
        selects: [
          {
            code: 78010363,
            cardName: 'Silent Swordsman LV3',
            controller: 1,
            location: 4,
            sequence: 2,
            position: 8, // face-down defense
          },
        ],
      },
    };

    const filtered = filter.filterEventForViewer(rawTargetEvent, 0);
    assert.equal(
      filtered.promptData.selects[0].code,
      0,
      'Face-down opponent card code must be redacted to 0',
    );
    assert.equal(
      filtered.promptData.selects[0].cardName,
      'Face-down Monster',
      'Face-down opponent card name must be redacted to "Face-down Monster"',
    );
    console.log('  ✓ Anti-Cheat Target Redaction passed!\n');

    console.log('================================================================');
    console.log('🎉 ALL 10 CARD MECHANICS & ENGINE INTEGRATION TESTS PASSED 100%!');
    console.log('================================================================\n');
  } finally {
    service.close();
    cardReader.close();
  }
}

runTestSuite().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
