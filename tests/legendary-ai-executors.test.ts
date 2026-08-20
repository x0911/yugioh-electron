import assert from 'node:assert/strict';
import { AIController } from '../src/main/ai/AIController.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import {
  ExecutorRegistry,
  getExecutorForDeck,
  BlueEyesExecutor,
  CyberDragonExecutor,
  DarkMagicianExecutor,
  HeroFusionExecutor,
  AntiMetaStunExecutor,
  BurnOTKExecutor,
  DefaultExecutor,
} from '../src/main/ai/executors/index.js';
import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  SelectBattleCMDAction,
} from 'ocgcore-wasm';
import type { EvaluatorContext } from '../src/main/ai/types.js';

async function runTestSuite() {
  console.log('================================================================');
  console.log('=== RUNNING LEGENDARY AI & DECK EXECUTORS TEST SUITE ===');
  console.log('================================================================\n');

  const cardReader = new CardReaderService();
  const aiController = new AIController();

  try {
    // -------------------------------------------------------------------------
    // Test 1: Executor Auto-Detection & Registry
    // -------------------------------------------------------------------------
    console.log('▶ Test 1: Executor Auto-Detection & Registry');
    const baseContext: EvaluatorContext = {
      aiPlayerId: 1,
      humanPlayerId: 0,
      boardState: {
        userField: {
          playerId: 0,
          name: 'Human',
          currentLp: 8000,
          maxLp: 8000,
          isTurn: false,
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
        opponentField: {
          playerId: 1,
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
        turnNumber: 2,
        currentPhase: 'M1',
        activePrompt: null,
        phaseGuideText: '',
        winner: null,
        winReason: null,
      },
      personality: {
        id: 'seto-kaiba',
        name: 'Seto Kaiba',
        aggression: 0.95,
        defensiveness: 0.15,
        riskTolerance: 0.85,
        comboFocus: 0.7,
        signatureFavoritism: 0.95,
      },
      cardReader,
      currentPhase: 'M1',
      currentTurn: 2,
      signatureCardIds: [89631139],
      deckArchetype: 'blue-eyes',
      aiDeckCards: [89631139, 8240199, 23995346],
    };

    const blueEyesExec = getExecutorForDeck(baseContext, [89631139]);
    assert.equal(blueEyesExec.id, 'blue-eyes', 'Must auto-detect BlueEyesExecutor for Kaiba / Blue-Eyes deck');

    const cyberExec = getExecutorForDeck({ ...baseContext, deckArchetype: 'cyber dragon' }, [70095154, 23893227]);
    assert.equal(cyberExec.id, 'cyber-dragon', 'Must auto-detect CyberDragonExecutor for Zane deck');

    const dmExec = getExecutorForDeck({ ...baseContext, deckArchetype: 'dark magician' }, [46986414, 70791372]);
    assert.equal(dmExec.id, 'dark-magician', 'Must auto-detect DarkMagicianExecutor for Yugi deck');

    const heroExec = getExecutorForDeck({ ...baseContext, deckArchetype: 'hero' }, [40044918, 45906428]);
    assert.equal(heroExec.id, 'hero-fusion', 'Must auto-detect HeroFusionExecutor for Jaden deck');

    const stunExec = getExecutorForDeck({ ...baseContext, deckArchetype: 'anti-meta stun' }, [98954124, 19847532]);
    assert.equal(stunExec.id, 'anti-meta-stun', 'Must auto-detect AntiMetaStunExecutor for Stun deck');

    const burnExec = getExecutorForDeck({ ...baseContext, deckArchetype: 'burn' }, [38992735, 24068492]);
    assert.equal(burnExec.id, 'burn-otk', 'Must auto-detect BurnOTKExecutor for Burn deck');

    const defaultExec = getExecutorForDeck({ ...baseContext, deckArchetype: 'unknown rogue deck' }, [12345678]);
    assert.equal(defaultExec.id, 'default-universal', 'Must fall back to Universal Competitive Executor for unknown decks');
    console.log('  ✓ Executor Auto-Detection & Registry verified!\n');

    // -------------------------------------------------------------------------
    // Test 2: Universal Competitive Core: Card Advantage & Board Clear Sequencing
    // -------------------------------------------------------------------------
    console.log('▶ Test 2: Universal Competitive Core (Draw & Board Clear Priorities)');
    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      player: 1,
      activates: [
        { code: 55144522, sequence: 0, controller: 1, cardName: 'Pot of Greed' }, // Draw spell
        { code: 18144506, sequence: 1, controller: 1, cardName: "Harpie's Feather Duster" }, // Backrow clear
      ],
      summons: [
        { code: 89631139, sequence: 2, controller: 1, cardName: 'Blue-Eyes White Dragon' },
      ],
      to_bp: true,
      to_ep: true,
    };

    // Opponent has 2 backrow cards set
    const oppWithBackrow = {
      ...baseContext,
      boardState: {
        ...baseContext.boardState,
        userField: {
          ...baseContext.boardState.userField,
          spellTrapZones: [
            { id: 'h-s1', code: 44095762, name: 'Mirror Force', controller: 0, location: 'spell', sequence: 0, position: 'facedown_spell', statuses: [] },
            { id: 'h-s2', code: 41420027, name: 'Solemn Judgment', controller: 0, location: 'spell', sequence: 1, position: 'facedown_spell', statuses: [] },
            null, null, null,
          ],
        },
      },
    };

    const idleActions = defaultExec.onIdleCmd!(idleMsg, oppWithBackrow);
    assert(idleActions && idleActions.length > 0, 'DefaultExecutor must generate scored actions');

    const potAction = idleActions.find((a) => a.cardCode === 55144522);
    const dusterAction = idleActions.find((a) => a.cardCode === 18144506);
    assert(potAction && potAction.score >= 2500, 'Pot of Greed must receive high priority card advantage score');
    assert(dusterAction && dusterAction.score >= 2000, 'Feather Duster must receive board clear priority against 2 backrow cards');
    console.log('  ✓ Universal Draw & Board Clear Sequencing verified!\n');

    // -------------------------------------------------------------------------
    // Test 3: Universal Competitive Core: Smart Tribute Fodder Selection
    // -------------------------------------------------------------------------
    console.log('▶ Test 3: Universal Competitive Core (Smart Tribute Fodder Selection)');
    const tributeMsg: any = {
      type: OcgMessageType.SELECT_TRIBUTE,
      player: 1,
      min: 1,
      max: 1,
      selects: [
        { code: 89631139, controller: 1, sequence: 0, cardName: 'Blue-Eyes White Dragon' }, // 3000 ATK Boss
        { code: 0, controller: 1, sequence: 1, cardName: 'Sheep Token' },                   // 0 ATK Token
        { code: 26202165, controller: 1, sequence: 2, cardName: 'Sangan' },                // 1000 ATK Searcher
      ],
    };

    const tributeIndices = defaultExec.onSelectTribute!(tributeMsg, baseContext);
    assert(tributeIndices && tributeIndices.length === 1, 'Must select exactly 1 tribute');
    assert.equal(tributeIndices[0], 1, 'Must sacrifice Token (index 1) rather than 3000 ATK Blue-Eyes');
    console.log('  ✓ Smart Tribute Fodder Selection verified!\n');

    // -------------------------------------------------------------------------
    // Test 4: Battle Phase Lethal OTK Sequencing
    // -------------------------------------------------------------------------
    console.log('▶ Test 4: Battle Phase Lethal OTK Sequencing');
    const lethalBattleMsg: any = {
      type: OcgMessageType.SELECT_BATTLECMD,
      player: 1,
      attacks: [
        { code: 89631139, sequence: 0, controller: 1, atk: 3000 },
        { code: 89631139, sequence: 1, controller: 1, atk: 3000 },
      ],
      to_m2: true,
      to_ep: true,
    };

    // Opponent has 4000 LP and 0 monsters on field (total ATK 6000 >= 4000 LP)
    const lethalContext: EvaluatorContext = {
      ...baseContext,
      boardState: {
        ...baseContext.boardState,
        userField: {
          ...baseContext.boardState.userField,
          currentLp: 4000,
          monsterZones: [null, null, null, null, null],
        },
      },
    };

    const battleActions = defaultExec.onBattleCmd!(lethalBattleMsg, lethalContext);
    assert(battleActions && battleActions.length > 0, 'Must generate battle actions');
    const lethalAction = battleActions.find((a) => a.score >= 15000);
    assert(lethalAction, 'Must trigger [LETHAL] bonus score for game-ending direct attack');
    console.log('  ✓ Battle Phase Lethal OTK Sequencing verified!\n');

    // -------------------------------------------------------------------------
    // Test 5: Cyber Dragon Power Bond Combo Boost
    // -------------------------------------------------------------------------
    console.log('▶ Test 5: Cyber Dragon Power Bond Combo Boost');
    const cyberIdleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      player: 1,
      activates: [
        { code: 23893227, sequence: 0, controller: 1, cardName: 'Cyber Dragon Core' },
        { code: 37630732, sequence: 1, controller: 1, cardName: 'Power Bond' },
      ],
      to_bp: true,
      to_ep: true,
    };

    const cyberActions = cyberExec.onIdleCmd!(cyberIdleMsg, baseContext);
    assert(cyberActions && cyberActions.length > 0, 'CyberDragonExecutor must generate actions');
    const powerBondAction = cyberActions.find((a) => a.cardCode === 37630732);
    assert(powerBondAction && powerBondAction.score >= 3500, 'Power Bond must receive high-velocity combo boost');
    console.log('  ✓ Cyber Dragon Power Bond Combo Boost verified!\n');

    console.log('================================================================');
    console.log('🎉 ALL LEGENDARY AI & DECK EXECUTOR TESTS PASSED 100%!');
    console.log('================================================================\n');
  } finally {
    cardReader.close();
  }
}

runTestSuite().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
