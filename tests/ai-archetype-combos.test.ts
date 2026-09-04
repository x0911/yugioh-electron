import assert from 'node:assert/strict';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import {
  ExecutorRegistry,
  getExecutorForDeck,
  HeroFusionExecutor,
  MonarchExecutor,
  GladiatorBeastExecutor,
  VolcanicExecutor,
  AncientGearExecutor,
  LightswornExecutor,
  ChaosDadExecutor,
  BlueEyesExecutor,
  DarkMagicianExecutor,
  CyberDragonExecutor,
} from '../src/main/ai/executors/index.js';
import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  SelectBattleCMDAction,
} from 'ocgcore-wasm';
import type { EvaluatorContext } from '../src/main/ai/types.js';

function createMockContext(overrides: Partial<EvaluatorContext> = {}): EvaluatorContext {
  const cardReader = new CardReaderService();
  return {
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
      aggression: 0.8,
      defensiveness: 0.3,
      riskTolerance: 0.7,
      comboFocus: 0.9,
      cardAdvantageWeight: 1.2,
      signatureFavoritism: 0.8,
      thinkDelayBaseMs: 0,
      thinkDelayJitterMs: 0,
    },
    cardReader,
    currentPhase: 'M1',
    currentTurn: 2,
    signatureCardIds: [],
    deckArchetype: '',
    aiDeckCards: [],
    ...overrides,
  };
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('=== RUNNING ARCHETYPE COMBO AI INTEGRATION TEST SUITE ===');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // Test 1: HERO & Destiny HERO Combo Executor
  // ---------------------------------------------------------------------------
  console.log('▶ Test 1: HERO & Destiny HERO (Stratos Modal, Malicious GY, Plasma Absorb)');
  const heroExec = new HeroFusionExecutor();

  // 1a. Stratos modal choice: With backrow & 2 HEROs -> Option 0 (Destroy S/T)
  const ctxWithBackrow = createMockContext({
    activeChainCards: [40044918], // Stratos
    deckArchetype: 'hero',
  });
  ctxWithBackrow.boardState.userField.spellTrapZones[0] = {
    code: 44095762,
    name: 'Mirror Force',
    position: 'facedown_spell',
    controller: 0,
    location: 'spell',
    sequence: 0,
  };
  ctxWithBackrow.boardState.opponentField.monsterZones[0] = {
    code: 40044918,
    name: 'Elemental HERO Stratos',
    position: 'faceup_attack',
    controller: 1,
    location: 'monster',
    sequence: 0,
    atk: 1800,
    def: 300,
    level: 4,
    attribute: 'WIND',
    race: 'Warrior',
  };
  ctxWithBackrow.boardState.opponentField.monsterZones[1] = {
    code: 21844576,
    name: 'Elemental HERO Avian',
    position: 'faceup_attack',
    controller: 1,
    location: 'monster',
    sequence: 1,
    atk: 1000,
    def: 1000,
    level: 3,
    attribute: 'WIND',
    race: 'Warrior',
  };
  assert.equal(
    heroExec.onSelectOption({ type: OcgMessageType.SELECT_OPTION, options: [0, 1] } as any, ctxWithBackrow),
    0,
    'Stratos should choose Option 0 (destroy backrow) when opponent has S/T and AI controls 2+ HEROs',
  );

  // 1b. Stratos modal choice: Without backrow -> Option 1 (Search HERO)
  const ctxNoBackrow = createMockContext({
    activeChainCards: [40044918],
    deckArchetype: 'hero',
  });
  assert.equal(
    heroExec.onSelectOption({ type: OcgMessageType.SELECT_OPTION, options: [0, 1] } as any, ctxNoBackrow),
    1,
    'Stratos should choose Option 1 (search HERO) when opponent has no backrow',
  );

  // 1c. Destiny Draw discard selection: Discards Malicious (9411399)
  const dDrawCtx = createMockContext({ activeChainCards: [45809008] });
  const dDrawPicks = heroExec.onSelectCard(
    {
      type: OcgMessageType.SELECT_CARD,
      selects: [
        { code: 21844576, controller: 1 }, // Avian
        { code: 9411399, controller: 1 },  // Malicious
      ],
      min: 1,
      max: 1,
    } as any,
    dDrawCtx,
  );
  assert.deepEqual(dDrawPicks, [1], 'Destiny Draw must prioritize discarding Malicious');

  // 1d. Plasma absorption: Targets opponent monster with highest ATK
  const plasmaCtx = createMockContext({ activeChainCards: [83965310] });
  const plasmaPicks = heroExec.onSelectCard(
    {
      type: OcgMessageType.SELECT_CARD,
      selects: [
        { code: 21844576, controller: 0 }, // Avian (1000 ATK)
        { code: 89631139, controller: 0 }, // Blue-Eyes White Dragon (3000 ATK)
      ],
      min: 1,
      max: 1,
    } as any,
    plasmaCtx,
  );
  assert.deepEqual(plasmaPicks, [1], 'Plasma must target opponent monster with highest ATK');
  console.log('  ✓ HERO & Destiny HERO combos passed!\n');

  // ---------------------------------------------------------------------------
  // Test 2: Monarch & Tribute Control Executor
  // ---------------------------------------------------------------------------
  console.log('▶ Test 2: Monarch Control (Treeborn Frog Loop, Soul Exchange, Caius Banish)');
  const monarchExec = new MonarchExecutor();

  // 2a. Treeborn Frog Standby Phase revival
  const spCtxNoBackrow = createMockContext({ currentPhase: 'SP' });
  spCtxNoBackrow.boardState.currentPhase = 'SP';
  assert.equal(
    monarchExec.onSelectYesNo({ type: OcgMessageType.SELECT_EFFECTYN, code: 12538374 } as any, spCtxNoBackrow),
    true,
    'Treeborn Frog effect must be activated during Standby Phase with no backrow',
  );

  // 2b. Treeborn Frog Tribute Priority
  const tribPicks = monarchExec.onSelectTribute(
    {
      type: OcgMessageType.SELECT_TRIBUTE,
      selects: [
        { code: 89631139, controller: 1 }, // Blue-Eyes (3000 ATK)
        { code: 12538374, controller: 1 }, // Treeborn Frog (100 ATK)
      ],
      min: 1,
      max: 1,
    } as any,
    createMockContext(),
  );
  assert.deepEqual(tribPicks, [1], 'Treeborn Frog must be sacrificed for Tribute Summon over high-ATK beaters');

  // 2c. Caius Banish targeting: Prioritizes DARK monster (+1000 burn)
  const caiusCtx = createMockContext({ activeChainCards: [9748752] });
  const caiusPicks = monarchExec.onSelectCard(
    {
      type: OcgMessageType.SELECT_CARD,
      selects: [
        { code: 89631139, controller: 0 }, // Blue-Eyes (LIGHT, 3000 ATK)
        { code: 46986414, controller: 0 }, // Dark Magician (DARK, 2500 ATK -> +1000 burn)
      ],
      min: 1,
      max: 1,
    } as any,
    caiusCtx,
  );
  assert.deepEqual(caiusPicks, [1], 'Caius must prioritize banishing DARK monster for 1000 burn damage');
  console.log('  ✓ Monarch Control passed!\n');

  // ---------------------------------------------------------------------------
  // Test 3: Gladiator Beast Executor
  // ---------------------------------------------------------------------------
  console.log('▶ Test 3: Gladiator Beast (Tag-Out, Gyzarus Pop 2, War Chariot Negate)');
  const gbExec = new GladiatorBeastExecutor();

  // 3a. Battle Phase tag-out trigger
  assert.equal(
    gbExec.onSelectYesNo({ type: OcgMessageType.SELECT_EFFECTYN, code: 78868776 } as any, createMockContext()),
    true,
    'Gladiator Beast must accept tag-out at End of Battle Phase',
  );

  // 3b. Gyzarus Target Selection: Pop up to 2 opponent cards
  const gyzarusCtx = createMockContext({ activeChainCards: [48156348] });
  const gyzarusPicks = gbExec.onSelectCard(
    {
      type: OcgMessageType.SELECT_CARD,
      selects: [
        { code: 89631139, controller: 0 }, // Opponent Blue-Eyes
        { code: 44095762, controller: 0 }, // Opponent Mirror Force
        { code: 21844576, controller: 1 }, // AI Avian (should NOT be targeted)
      ],
      min: 1,
      max: 2,
    } as any,
    gyzarusCtx,
  );
  assert.equal(gyzarusPicks?.length, 2, 'Gyzarus must target 2 opponent cards');
  assert(gyzarusPicks.includes(0) && gyzarusPicks.includes(1), 'Gyzarus must target opponent cards, not own cards');

  // 3c. War Chariot Counter-Trap Negate in Chain Window
  const chariotCandidates = gbExec.onSelectChain(
    {
      type: OcgMessageType.SELECT_CHAIN,
      selects: [{ code: 96216229, controller: 1 }], // War Chariot
    } as any,
    createMockContext(),
  );
  assert(chariotCandidates && chariotCandidates[0].score >= 4000, 'War Chariot must score >= 4000 to negate effect');
  console.log('  ✓ Gladiator Beast passed!\n');

  // ---------------------------------------------------------------------------
  // Test 4: Volcanic Burn & Board Control Executor
  // ---------------------------------------------------------------------------
  console.log('▶ Test 4: Volcanic (Rocket Search, Blaze Accelerator + Scattershot Wipe)');
  const volcExec = new VolcanicExecutor();

  // 4a. Volcanic Rocket search: Selects Blaze Accelerator (69537999)
  const rocketCtx = createMockContext({ activeChainCards: [76459806] });
  const rocketPicks = volcExec.onSelectCard(
    {
      type: OcgMessageType.SELECT_CARD,
      selects: [
        { code: 33365932, controller: 1 }, // Volcanic Shell
        { code: 69537999, controller: 1 }, // Blaze Accelerator
      ],
      min: 1,
      max: 1,
    } as any,
    rocketCtx,
  );
  assert.deepEqual(rocketPicks, [1], 'Volcanic Rocket must search Blaze Accelerator');

  // 4b. Blaze Accelerator Ammunition Discard: Selects Volcanic Scattershot (69750546)
  const blazeCtx = createMockContext({ activeChainCards: [69537999] });
  const blazePicks = volcExec.onSelectCard(
    {
      type: OcgMessageType.SELECT_CARD,
      selects: [
        { code: 33365932, controller: 1 }, // Volcanic Shell
        { code: 69750546, controller: 1 }, // Volcanic Scattershot
      ],
      min: 1,
      max: 1,
    } as any,
    blazeCtx,
  );
  assert.deepEqual(blazePicks, [1], 'Blaze Accelerator must prioritize Volcanic Scattershot for board wipe');

  // 4c. Scattershot GY trigger: Activates board wipe + 1500 burn
  assert.equal(
    volcExec.onSelectYesNo({ type: OcgMessageType.SELECT_EFFECTYN, code: 69750546 } as any, createMockContext()),
    true,
    'Volcanic Scattershot GY effect must be accepted',
  );
  console.log('  ✓ Volcanic Burn passed!\n');

  // ---------------------------------------------------------------------------
  // Test 5: Ancient Gear & Machine OTK Executor
  // ---------------------------------------------------------------------------
  console.log('▶ Test 5: Ancient Gear (Geartown Float, Limiter Removal Damage Step Timing)');
  const agExec = new AncientGearExecutor();

  // 5a. Geartown GY float trigger: Always returns true
  assert.equal(
    agExec.onSelectYesNo({ type: OcgMessageType.SELECT_EFFECTYN, code: 37694547 } as any, createMockContext()),
    true,
    'Geartown destruction float trigger must be accepted',
  );

  // 5b. Limiter Removal timing: Penalized in Main Phase
  const mp1Msg: any = {
    type: OcgMessageType.SELECT_IDLECMD,
    activates: [{ code: 23171610, controller: 1 }], // Limiter Removal
  };
  const mp1Actions = agExec.onIdleCmd(mp1Msg, createMockContext({ currentPhase: 'M1' }));
  const limiterMp1 = mp1Actions?.find((a) => a.cardCode === 23171610);
  assert(limiterMp1 && limiterMp1.score < 0, 'Limiter Removal must be suppressed in Main Phase 1');

  // 5c. Limiter Removal timing: Elevated in Battle Phase Damage Step
  const bpCtx = createMockContext({ currentPhase: 'BP' });
  bpCtx.boardState.currentPhase = 'BATTLE_STEP';
  const bpChain = agExec.onSelectChain(
    {
      type: OcgMessageType.SELECT_CHAIN,
      selects: [{ code: 23171610, controller: 1 }],
    } as any,
    bpCtx,
  );
  assert(bpChain && bpChain[0].score >= 4500, 'Limiter Removal must score >= 4500 during Battle Phase for OTK');
  console.log('  ✓ Ancient Gear passed!\n');

  // ---------------------------------------------------------------------------
  // Test 6: Lightsworn Swarm & Board Wipe Executor
  // ---------------------------------------------------------------------------
  console.log('▶ Test 6: Lightsworn (Charge Search, Solar Recharge Discard, Judgment Dragon Wipe)');
  const lsExec = new LightswornExecutor();

  // 6a. Charge of the Light Brigade Search: Selects Lumina (95503687)
  const chargeCtx = createMockContext({ activeChainCards: [94886282] });
  const chargePicks = lsExec.onSelectCard(
    {
      type: OcgMessageType.SELECT_CARD,
      selects: [
        { code: 21502796, controller: 1 }, // Ryko
        { code: 95503687, controller: 1 }, // Lumina
      ],
      min: 1,
      max: 1,
    } as any,
    chargeCtx,
  );
  assert.deepEqual(chargePicks, [1], 'Charge of the Light Brigade must search Lumina');

  // 6b. Judgment Dragon Summon Condition: 4+ Lightsworn names in GY
  const jdCtx = createMockContext({ deckArchetype: 'lightsworn' });
  jdCtx.boardState.opponentField.graveyard = [
    { code: 95503687, name: 'Lumina, Lightsworn Summoner' } as any,
    { code: 22624373, name: 'Lyla, Lightsworn Sorceress' } as any,
    { code: 21502796, name: 'Ryko, Lightsworn Hunter' } as any,
    { code: 58996430, name: 'Wulf, Lightsworn Beast' } as any,
  ];
  const jdIdle = lsExec.onIdleCmd(
    {
      type: OcgMessageType.SELECT_IDLECMD,
      special_summons: [{ code: 57774843, controller: 1 }],
      summons: [],
      monster_sets: [],
      spell_sets: [],
      activates: [],
    } as any,
    jdCtx,
  );
  const jdAction = jdIdle?.find((a) => a.cardCode === 57774843);
  assert(jdAction && jdAction.score >= 5000, 'Judgment Dragon summon must score >= 5000 with 4 Lightsworns in GY');
  console.log('  ✓ Lightsworn passed!\n');

  // ---------------------------------------------------------------------------
  // Test 7: Chaos & Dark Armed Dragon (DAD) Executor
  // ---------------------------------------------------------------------------
  console.log('▶ Test 7: Chaos & DAD (Exact 3 DARK Count Tracking, DAD Target Destruction)');
  const dadExec = new ChaosDadExecutor();

  // 7a. DAD Summon Score: Boosted when exactly 3 DARKs in GY
  const dadCtx3 = createMockContext({ deckArchetype: 'dad' });
  dadCtx3.boardState.opponentField.graveyard = [
    { code: 9411399, attribute: 'DARK' } as any,
    { code: 9411399, attribute: 'DARK' } as any,
    { code: 9411399, attribute: 'DARK' } as any,
  ];
  const dadActions3 = dadExec.onIdleCmd(
    {
      type: OcgMessageType.SELECT_IDLECMD,
      special_summons: [{ code: 65192027, controller: 1 }],
      summons: [],
      monster_sets: [],
      spell_sets: [],
      activates: [],
    } as any,
    dadCtx3,
  );
  const dadSummon = dadActions3?.find((a) => a.cardCode === 65192027);
  assert(dadSummon && dadSummon.score >= 4800, 'DAD summon must score >= 4800 when exactly 3 DARK monsters in GY');

  // 7b. DAD Destruction Targeting: Targets opponent boss monster
  const dadBanishCtx = createMockContext({ activeChainCards: [65192027] });
  const dadPicks = dadExec.onSelectCard(
    {
      type: OcgMessageType.SELECT_CARD,
      selects: [
        { code: 21844576, controller: 0 }, // Avian (1000 ATK)
        { code: 89631139, controller: 0 }, // Blue-Eyes (3000 ATK)
      ],
      min: 1,
      max: 1,
    } as any,
    dadBanishCtx,
  );
  assert.deepEqual(dadPicks, [1], 'DAD must target opponent monster with highest ATK to destroy');
  console.log('  ✓ Chaos & DAD passed!\n');

  // ---------------------------------------------------------------------------
  // Test 8: Deepened Blue-Eyes & Dark Magician Sub-Prompts
  // ---------------------------------------------------------------------------
  console.log('▶ Test 8: Deepened Blue-Eyes & Dark Magician Sub-Prompts');
  const bewdExec = new BlueEyesExecutor();
  const dmExec = new DarkMagicianExecutor();

  // 8a. Sage with Eyes of Blue searches The White Stone of Ancients (71039903)
  const sageCtx = createMockContext({ activeChainCards: [8240199] });
  const sagePicks = bewdExec.onSelectCard(
    {
      type: OcgMessageType.SELECT_CARD,
      selects: [
        { code: 88241506, controller: 1 }, // Maiden
        { code: 71039903, controller: 1 }, // White Stone of Ancients
      ],
      min: 1,
      max: 1,
    } as any,
    sageCtx,
  );
  assert.deepEqual(sagePicks, [1], 'Sage with Eyes of Blue must prioritize The White Stone of Ancients');

  // 8b. White Stone of Ancients End Phase trigger returns true
  assert.equal(
    bewdExec.onSelectYesNo({ type: OcgMessageType.SELECT_EFFECTYN, code: 71039903 } as any, createMockContext()),
    true,
    'White Stone of Ancients End Phase trigger must be accepted',
  );

  // 8c. Magician Rod searches Dark Magical Circle (47222536)
  const rodCtx = createMockContext({ activeChainCards: [70791372] });
  const rodPicks = dmExec.onSelectCard(
    {
      type: OcgMessageType.SELECT_CARD,
      selects: [
        { code: 48680970, controller: 1 }, // Eternal Soul
        { code: 47222536, controller: 1 }, // Dark Magical Circle
      ],
      min: 1,
      max: 1,
    } as any,
    rodCtx,
  );
  assert.deepEqual(rodPicks, [1], 'Magician Rod must prioritize Dark Magical Circle');

  // 8d. Circle Banish targets opponent boss monster
  const circleCtx = createMockContext({ activeChainCards: [47222536] });
  const circlePicks = dmExec.onSelectCard(
    {
      type: OcgMessageType.SELECT_CARD,
      selects: [
        { code: 21844576, controller: 0 }, // Avian (1000 ATK)
        { code: 89631139, controller: 0 }, // Blue-Eyes (3000 ATK)
      ],
      min: 1,
      max: 1,
    } as any,
    circleCtx,
  );
  assert.deepEqual(circlePicks, [1], 'Dark Magical Circle must target opponent boss monster to banish');
  console.log('  ✓ Deepened Blue-Eyes & Dark Magician passed!\n');

  console.log('================================================================');
  console.log('🎉 ALL 8 ARCHETYPE COMBO AI INTEGRATION TESTS PASSED 100%!');
  console.log('================================================================\n');
}

runTestSuite().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
