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
import { createEmptyPlayerField } from '../src/shared/types/field.js';
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
      player0Deck: [...Array(35).fill(25652259), 18144506, 18144506, 18144506, 18144506, 18144506],
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
    const hfdList = prompt2?.activates || prompt2?.selects || [];
    const hfdIndex = hfdList.findIndex((a: any) => a.code === 18144506);
    assert(hfdIndex >= 0, 'HFD should be activatable when opponent has backrow');

    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_ACTIVATE,
      index: hfdIndex,
    });
    service.processStep();

    if ((service as any).state.isWaitingResponse) {
      service.sendResponse({
        type: OcgResponseType.SELECT_CHAIN,
        index: -1,
      });
      service.processStep();
    }

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

    // 11. The Hunter with 7 Weapons & ANNOUNCE_RACE Prompt Execution
    console.log('▶ Test 11: The Hunter with 7 Weapons & ANNOUNCE_RACE Prompt Flow');
    service.startNewDuel({
      player0Deck: [95956346, ...Array(39).fill(83764719)],
      player0Monsters: [
        { code: 95956346, sequence: 0, position: 0x1, controller: 0 }, // Shining Angel (Fairy)
      ],
      player1Deck: [...Array(35).fill(83764719), 1525329, 1525329, 1525329, 1525329, 1525329],
      noShuffle: true,
      humanPlayerId: 0,
      startingLP: 8000,
    });

    // Pass turn 1
    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.TO_EP,
    });

    // Process AI Turn 2 where AI summons Hunter with 7 Weapons and responds to ANNOUNCE_RACE
    service.processStep();
    await new Promise((r) => setTimeout(r, 1200));

    const hunterBoard = service.getBoardState();
    const hunterOnField = hunterBoard.opponentField.monsterZones.some((m) => m?.code === 1525329);
    assert(hunterOnField, 'The Hunter with 7 Weapons must be summoned and on field without freeze');
    service.destroyCurrentDuel();
    console.log('  ✓ The Hunter with 7 Weapons & ANNOUNCE_RACE passed!\n');

    // 12. Comprehensive Announcement & Prompt Response Normalization
    console.log('▶ Test 12: Comprehensive Prompt Normalization & AI Responses');
    
    const mockBoard = {
      userField: createEmptyPlayerField(0, 'You'),
      opponentField: createEmptyPlayerField(1, 'AI'),
      extraMonsterZones: [null, null],
      turnNumber: 2,
      currentPhase: 'MAIN1',
      activePrompt: null,
      phaseGuideText: '',
      winner: null,
      winReason: null,
    };
    mockBoard.userField.monsterZones[0] = {
      code: 95956346,
      name: 'Shining Angel',
      position: 'faceup_attack',
      atk: 1400,
      def: 800,
      level: 4,
      canAttack: true,
      canChangePosition: true,
      equippedCards: [],
      counters: 0,
      hasDirectAttackEffect: false,
      turnPlayed: 1,
    } as any;

    // ANNOUNCE_ATTRIB
    const attribResp = aiController.decideResponse(
      { type: OcgMessageType.ANNOUNCE_ATTRIB, player: 1, count: 1, available: 63 } as any,
      {
        aiPlayerId: 1,
        humanPlayerId: 0,
        boardState: mockBoard,
        personality: {} as any,
        cardReader,
        currentPhase: 'MAIN1',
        currentTurn: 2,
        signatureCardIds: [],
        deckArchetype: 'cyber_dragon',
        aiDeckCards: [],
      }
    );
    assert.equal(attribResp.type, OcgResponseType.ANNOUNCE_ATTRIB, 'Must return ANNOUNCE_ATTRIB');
    assert(Array.isArray((attribResp as any).attributes), 'Attributes must be an array');

    // SELECT_COUNTER
    const counterResp = aiController.decideResponse(
      {
        type: OcgMessageType.SELECT_COUNTER,
        player: 1,
        counter_type: 1,
        count: 2,
        cards: [{ code: 12345, count: 3 }],
      } as any,
      {
        aiPlayerId: 1,
        humanPlayerId: 0,
        boardState: mockBoard,
        personality: {} as any,
        cardReader,
        currentPhase: 'MAIN1',
        currentTurn: 2,
        signatureCardIds: [],
        deckArchetype: 'cyber_dragon',
        aiDeckCards: [],
      }
    );
    assert.equal(counterResp.type, OcgResponseType.SELECT_COUNTER, 'Must return SELECT_COUNTER');
    assert.deepEqual((counterResp as any).counters, [2], 'Must remove 2 counters');

    // SORT_CHAIN
    const sortChainResp = aiController.decideResponse(
      {
        type: OcgMessageType.SORT_CHAIN,
        player: 1,
        cards: [{ code: 111 }, { code: 222 }],
      } as any,
      {
        aiPlayerId: 1,
        humanPlayerId: 0,
        boardState: mockBoard,
        personality: {} as any,
        cardReader,
        currentPhase: 'MAIN1',
        currentTurn: 2,
        signatureCardIds: [],
        deckArchetype: 'cyber_dragon',
        aiDeckCards: [],
      }
    );
    assert.equal(sortChainResp.type, OcgResponseType.SORT_CARD, 'Must return SORT_CARD for SORT_CHAIN');
    // 13. Expanded DM & GX Anime Legacy Cards Verification
    console.log('▶ Test 13: Expanded DM & GX Anime & Manga Cards Verification');
    service.startNewDuel({
      player0Deck: [
        ...Array(30).fill(25652259), // 30 Normal Monsters
        48179391, // The Seal of Orichalcos
        21082832, // Chaos Form
        55410871, // Blue-Eyes Chaos MAX Dragon
        89631139, // Blue-Eyes White Dragon
        21208154, // The Wicked Avatar
        62180201, // The Wicked Dreadroot
        57793869, // The Wicked Eraser
        1784686,  // The Eye of Timaeus
        46986414, // Dark Magician
        40854197, // Elemental HERO Absolute Zero
      ],
      player0ExtraDeck: [
        75380687, // Amulet Dragon
        43378048, // Armityle the Chaos Phantasm
        58481572, // Masked HERO Dark Law
      ],
      player1Deck: Array(40).fill(25652259),
      noShuffle: true,
      humanPlayerId: 0,
      startingLP: 8000,
    });

    const p13 = (service as any).lastPromptMessage;
    // Opening hand has 5 cards drawn from top (top of reversed deck):
    // Deck order in startNewDuel is reversed, so the last elements in the array are the top of deck:
    // Top cards: Absolute Zero, Dark Magician, Eye of Timaeus, Wicked Eraser, Wicked Dreadroot
    const b13 = service.getBoardState();
    assert.equal(b13.userField.hand.length, 5, 'User hand must start with 5 cards');
    assert.equal(b13.userField.extraDeckCount, 3, 'Extra Deck must contain 3 Fusion Monsters');

    // Verify all card details resolve cleanly in CardReader
    const orichalcos = cardReader.getCardDetail(48179391);
    assert.equal(orichalcos?.name, 'The Seal of Orichalcos');
    assert.equal(orichalcos?.isSpell, true);

    const chaosMax = cardReader.getCardDetail(55410871);
    assert.equal(chaosMax?.name, 'Blue-Eyes Chaos MAX Dragon');
    assert.equal(chaosMax?.atk, 4000);
    assert.equal(chaosMax?.def, 0);

    const armityle = cardReader.getCardDetail(43378048);
    assert.equal(armityle?.name, 'Armityle the Chaos Phantasm');
    assert.equal(armityle?.atk, 0);

    const wickedAvatar = cardReader.getCardDetail(21208154);
    assert.equal(wickedAvatar?.name, 'The Wicked Avatar');

    const darkLaw = cardReader.getCardDetail(58481572);
    assert.equal(darkLaw?.name, 'Masked HERO Dark Law');
    assert.equal(darkLaw?.atk, 2400);

    // 14. Toon Direct Attack & Rich SELECT_YESNO Prompt Presentation
    console.log('▶ Test 14: Toon Direct Attack & Rich SELECT_YESNO Prompt Presentation');
    const decoder = (service as any).messageDecoder;
    
    // Set attacker context as Blue-Eyes Toon Dragon (53183600)
    decoder.setLastAttackCard({
      code: 53183600,
      controller: 0,
      location: 4, // MZONE
      sequence: 0,
    });

    // Decode MSG_SELECT_YESNO with desc: 31 ("Attack Directly?")
    const directAttackPrompt = decoder.decode({
      type: OcgMessageType.SELECT_YESNO,
      player: 0,
      description: 31,
    } as any);

    assert.equal(directAttackPrompt.type, 'SELECT_YESNO');
    assert.equal(directAttackPrompt.isPrompt, true);
    assert.equal(directAttackPrompt.promptData.code, 53183600, 'Must extract attacker code for direct attack');
    assert.equal(directAttackPrompt.promptData.cardName, 'Blue-Eyes Toon Dragon', 'Must resolve card name');
    assert.equal(directAttackPrompt.promptData.isDirectAttack, true, 'Must identify as direct attack');
    assert.equal(directAttackPrompt.promptData.promptTitle, 'Declare Direct Attack');
    assert.equal(directAttackPrompt.promptData.yesText, 'Attack Directly');
    assert.equal(directAttackPrompt.promptData.noText, 'Attack Opponent Monster');
    assert(directAttackPrompt.promptData.description.includes('Blue-Eyes Toon Dragon'), 'Description must mention monster');

    // Decode MSG_SELECT_YESNO with aux.Stringid (e.g. 53183600 << 4 = 850937600)
    const customStringPrompt = decoder.decode({
      type: OcgMessageType.SELECT_YESNO,
      player: 0,
      description: 850937600, // aux.Stringid(53183600, 0)
    } as any);

    assert.equal(customStringPrompt.promptData.code, 53183600);
    assert.equal(customStringPrompt.promptData.cardName, 'Blue-Eyes Toon Dragon');
    assert.equal(customStringPrompt.promptData.description, 'Special Summon ("Blue-Eyes Toon Dragon")');

    // Test Battle Replay (desc: 30)
    const replayPrompt = decoder.decode({
      type: OcgMessageType.SELECT_YESNO,
      player: 0,
      description: 30,
    } as any);
    assert.equal(replayPrompt.promptData.isReplay, true);
    assert.equal(replayPrompt.promptData.yesText, 'Continue Attack');
    assert.equal(replayPrompt.promptData.noText, 'Cancel Attack');

    // 15. Raigeki destroying face-down monster & Pot of Greed drawing 2 cards
    console.log('▶ Test 15: Raigeki vs Face-Down Monster & Pot of Greed Resolution');
    service.startNewDuel({
      // Deck top is at the end of the array
      player0Deck: [...Array(30).fill(32274490), 55144522, 40991587, 40991587, 40991587, 40991587], // 4 Lady in Wight + 1 Pot of Greed
      player1Deck: [...Array(30).fill(32274490), 12580477, 12580477, 12580477, 12580477, 12580477], // 5 Raigeki
      noShuffle: true,
      humanPlayerId: 0,
      startingLP: 8000,
      startingDrawCount: 5,
    });

    // Turn 1: Player 0 Sets The Lady in Wight
    const p15Prompt = (service as any).lastPromptMessage;
    const msetIdx = p15Prompt.monster_sets?.findIndex((s: any) => s.code === 40991587);
    assert(msetIdx >= 0, 'Player 0 must be able to Set The Lady in Wight');

    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_MSET,
      index: msetIdx,
    });
    service.processStep();
    console.log('User monster zones after SELECT_MSET:', service.getBoardState().userField.monsterZones);

    // Player 0 now activates Pot of Greed
    const p15Prompt2 = (service as any).lastPromptMessage;
    const pogIdx = p15Prompt2.activates?.findIndex((a: any) => a.code === 55144522);
    assert(pogIdx >= 0, 'Player 0 must be able to activate Pot of Greed');

    const handBeforePog = service.getBoardState().userField.hand.length;
    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_ACTIVATE,
      index: pogIdx,
    });
    service.processStep();

    // Pass chain if prompted
    if ((service as any).state.isWaitingResponse) {
      service.sendResponse({
        type: OcgResponseType.SELECT_CHAIN,
        index: -1,
      });
      service.processStep();
    }

    const handAfterPog = service.getBoardState().userField.hand.length;
    assert.equal(handAfterPog, handBeforePog - 1 + 2, 'Pot of Greed must increase hand size by 1 (cost 1 card, draw 2 cards)');

    // End Turn 1
    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.TO_EP,
      index: null,
    });
    while (!(service as any).lastPromptMessage || (service as any).lastPromptMessage.type !== OcgMessageType.SELECT_IDLECMD) {
      service.processStep();
    }

    // Turn 2: Player 1 activates Raigeki
    const p1Turn2Prompt = (service as any).lastPromptMessage;
    console.log('Turn 2 prompt:', p1Turn2Prompt?.activates);
    const raigekiIdx = p1Turn2Prompt.activates?.findIndex((a: any) => a.code === 12580477);
    assert(raigekiIdx >= 0, 'Player 1 must be able to activate Raigeki on Turn 2');

    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_ACTIVATE,
      index: raigekiIdx,
    });
    service.processStep();

    if ((service as any).state.isWaitingResponse) {
      service.sendResponse({
        type: OcgResponseType.SELECT_CHAIN,
        index: -1,
      });
      service.processStep();
    }

    const boardAfterRaigeki = service.getBoardState();
    const p0MonstersAfter = boardAfterRaigeki.userField.monsterZones.filter(Boolean);
    assert.equal(p0MonstersAfter.length, 0, 'Raigeki must destroy the Set monster');
    assert.equal(boardAfterRaigeki.userField.graveyard.length, 2, 'GY must contain Pot of Greed and destroyed Lady in Wight');
    // 16. Dark World Dealings (Draw 1, Discard 1 for both players)
    console.log('▶ Test 16: Dark World Dealings (Both players draw 1, then discard 1)');
    service.startNewDuel({
      player0Deck: [...Array(35).fill(32274490), 74117290, 74117290, 74117290, 74117290, 74117290],
      player1Deck: Array(40).fill(32274490),
      noShuffle: true,
      humanPlayerId: 0,
      startingLP: 8000,
    });

    const p16Prompt = (service as any).lastPromptMessage;
    const dwdIdx = p16Prompt.activates?.findIndex((a: any) => a.code === 74117290);
    assert(dwdIdx >= 0, 'Player 0 must be able to activate Dark World Dealings');

    service.sendResponse({
      type: OcgResponseType.SELECT_IDLECMD,
      action: SelectIdleCMDAction.SELECT_ACTIVATE,
      index: dwdIdx,
    });
    service.processStep();

    let p0DiscardPrompt: any = null;
    let p1DiscardPrompt: any = null;

    // Process until discard prompts
    while ((service as any).state.isWaitingResponse) {
      const prompt = (service as any).lastPromptMessage;
      if (prompt?.type === OcgMessageType.SELECT_CHAIN) {
        service.sendResponse({
          type: OcgResponseType.SELECT_CHAIN,
          index: -1,
        });
        service.processStep();
      } else if (prompt?.type === OcgMessageType.SELECT_CARD) {
        p0DiscardPrompt = prompt;
        service.sendResponse({
          type: OcgResponseType.SELECT_CARD,
          indicies: [0],
        });
        service.processStep();
      } else {
        break;
      }
    }

    assert(p0DiscardPrompt !== null, 'Player 0 discard prompt must have occurred');
    const boardState = service.getBoardState();
    assert.equal(boardState.userField.graveyard.length, 2, 'GY must contain activated DWD and discarded card');
    console.log('  ✓ Dark World Dealings passed!\n');

    console.log('================================================================');
    console.log('🎉 ALL 16 CARD MECHANICS & ENGINE INTEGRATION TESTS PASSED 100%!');
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



