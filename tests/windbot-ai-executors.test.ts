import assert from 'node:assert/strict';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import {
  ExecutorRegistry,
  getExecutorForDeck,
  SynchronExecutor,
  BlackwingExecutor,
  ToonExecutor,
  ResonatorExecutor,
  InfernityExecutor,
  GravekeeperExecutor,
  DefaultExecutor,
} from '../src/main/ai/executors/index.js';
import { evaluateSynchroOpportunities } from '../src/main/ai/evaluators/synchroSolver.js';
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
      currentTurn: 2,
      currentPhase: 'M1',
      activeChain: [],
      duelPhaseName: 'Main Phase 1',
    },
    personality: {
      aggression: 0.7,
      defensiveness: 0.6,
      riskTolerance: 0.5,
      comboFocus: 0.8,
      signatureFavoritism: 0.9,
      cardAdvantageWeight: 1.0,
      respectFaceDownSpells: 0.6,
    },
    cardReader,
    currentPhase: 'M1',
    currentTurn: 2,
    signatureCardIds: [],
    deckArchetype: 'SYNCHRO',
    aiDeckCards: [],
    ...overrides,
  };
}

async function runTests() {
  console.log('=== RUNNING WINDBOT AI EXECUTOR INTEGRATION TEST SUITE ===');

  // Test 1: SynchronExecutor (Yusei)
  console.log('\n▶ Test 1: SynchronExecutor (Yusei Junk & Tuning Combos)');
  {
    const ctx = createMockContext({ deckArchetype: 'synchron' });
    const executor = getExecutorForDeck(ctx, [63977008, 44508094, 96363153]);
    assert.ok(executor instanceof SynchronExecutor, 'Expected SynchronExecutor to be resolved');

    // Tuning priority
    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      activates: [{ code: 96363153 }], // Tuning
      summons: [{ code: 63977008, level: 3, atk: 1300 }], // Junk Synchron
    };
    const candidates = executor.onIdleCmd(idleMsg, ctx) || [];
    const tuningCandidate = candidates.find((c) => c.cardCode === 96363153);
    assert.ok(tuningCandidate, 'Tuning must be scored');
    assert.ok(tuningCandidate.score > 3000, 'Tuning must have high score bonus');

    // Stardust Dragon chain protection
    const chainMsg: any = {
      type: OcgMessageType.SELECT_CHAIN,
      selects: [{ code: 44508094 }], // Stardust Dragon
    };
    const chainCandidates = executor.onSelectChain(chainMsg, ctx) || [];
    const stardustChain = chainCandidates.find((c) => c.cardCode === 44508094);
    assert.ok(stardustChain, 'Stardust Dragon chain option must be present');
    assert.ok(stardustChain.score >= 5000, 'Stardust protection must be top tier score');
    console.log('  ✓ SynchronExecutor combos passed!');
  }

  // Test 2: BlackwingExecutor (Crow Hogan)
  console.log('\n▶ Test 2: BlackwingExecutor (Crow Whirlwind Swarm & Kalut Hand Trap)');
  {
    const ctx = createMockContext({ deckArchetype: 'blackwing' });
    const executor = getExecutorForDeck(ctx, [91351370, 58820853, 2009101]);
    assert.ok(executor instanceof BlackwingExecutor, 'Expected BlackwingExecutor to be resolved');

    // Black Whirlwind must have higher priority than Normal Summon
    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      activates: [{ code: 91351370 }], // Black Whirlwind
      summons: [{ code: 58820853, level: 4, atk: 1800 }], // Shura
    };
    const candidates = executor.onIdleCmd(idleMsg, ctx) || [];
    const whirlwind = candidates.find((c) => c.cardCode === 91351370);
    const shura = candidates.find((c) => c.cardCode === 58820853);
    assert.ok(whirlwind && shura, 'Whirlwind and Shura must be evaluated');
    assert.ok(whirlwind.score > shura.score, 'Black Whirlwind must be activated before Normal Summon!');

    // Kalut in Damage Step
    ctx.boardState.currentPhase = 'DAMAGE_STEP' as any;
    const chainMsg: any = {
      type: OcgMessageType.SELECT_CHAIN,
      selects: [{ code: 85215458 }], // Kalut
    };
    const chainCandidates = executor.onSelectChain(chainMsg, ctx) || [];
    const kalutChain = chainCandidates.find((c) => c.cardCode === 85215458);
    assert.ok(kalutChain && kalutChain.score >= 5000, 'Kalut must trigger with high score in Damage Step');
    console.log('  ✓ BlackwingExecutor combos passed!');
  }

  // Test 3: ToonExecutor (Pegasus)
  console.log('\n▶ Test 3: ToonExecutor (Pegasus Toon Table & Kingdom Setup)');
  {
    const ctx = createMockContext({ deckArchetype: 'toon' });
    const executor = getExecutorForDeck(ctx, [89997728, 43175858, 42386471]);
    assert.ok(executor instanceof ToonExecutor, 'Expected ToonExecutor to be resolved');

    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      activates: [
        { code: 89997728 }, // Toon Table of Contents
        { code: 43175858 }, // Toon Kingdom
      ],
    };
    const candidates = executor.onIdleCmd(idleMsg, ctx) || [];
    const table = candidates.find((c) => c.cardCode === 89997728);
    const kingdom = candidates.find((c) => c.cardCode === 43175858);
    assert.ok(table && kingdom, 'Table and Kingdom must be scored');
    assert.ok(table.score >= 4500 && kingdom.score >= 4500, 'Toon setup must have high priority');
    console.log('  ✓ ToonExecutor combos passed!');
  }

  // Test 4: ResonatorExecutor (Jack Atlas)
  console.log('\n▶ Test 4: ResonatorExecutor (Jack Vice Dragon & Level 8 Red Dragon)');
  {
    const ctx = createMockContext({ deckArchetype: 'resonator' });
    // User controls a monster, AI controls none
    ctx.boardState.userField.monsterZones[0] = { code: 89631139, position: 'faceup_attack', atk: 3000, def: 2500 } as any;

    const executor = getExecutorForDeck(ctx, [70902743, 54343893, 97021916]);
    assert.ok(executor instanceof ResonatorExecutor, 'Expected ResonatorExecutor to be resolved');

    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      special_summons: [{ code: 54343893 }], // Vice Dragon
      summons: [{ code: 97021916 }], // Dark Resonator
    };
    const candidates = executor.onIdleCmd(idleMsg, ctx) || [];
    const vice = candidates.find((c) => c.cardCode === 54343893);
    assert.ok(vice && vice.score >= 4000, 'Vice Dragon free special summon must have top priority');
    console.log('  ✓ ResonatorExecutor combos passed!');
  }

  // Test 5: InfernityExecutor (Kalin Kessler)
  console.log('\n▶ Test 5: InfernityExecutor (Kalin Handless Loop & Barrier Omni-Negate)');
  {
    const ctx = createMockContext({ deckArchetype: 'infernity' });
    const executor = getExecutorForDeck(ctx, [99177923, 66957584, 9059700]);
    assert.ok(executor instanceof InfernityExecutor, 'Expected InfernityExecutor to be resolved');

    // Setting cards when having cards in hand to reach 0 hand
    ctx.boardState.opponentField.hand = [{ code: 9059700 }] as any;
    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      spell_sets: [{ code: 9059700 }],
    };
    const candidates = executor.onIdleCmd(idleMsg, ctx) || [];
    const setAction = candidates.find((c) => (c.action as any).action === SelectIdleCMDAction.SELECT_SPELL_SET);
    assert.ok(setAction && setAction.score >= 2000, 'Infernity hand dump setting must be prioritized');

    // Barrier omni-negate
    const chainMsg: any = {
      type: OcgMessageType.SELECT_CHAIN,
      selects: [{ code: 9059700 }],
    };
    const chainCandidates = executor.onSelectChain(chainMsg, ctx) || [];
    const barrier = chainCandidates.find((c) => c.cardCode === 9059700);
    assert.ok(barrier && barrier.score >= 6000, 'Infernity Barrier must have maximum omni-negate score');
    console.log('  ✓ InfernityExecutor combos passed!');
  }

  // Test 6: GravekeeperExecutor (Ishizu Ishtar)
  console.log('\n▶ Test 6: GravekeeperExecutor (Ishizu Necrovalley & Spy Wall)');
  {
    const ctx = createMockContext({ deckArchetype: 'gravekeeper' });
    const executor = getExecutorForDeck(ctx, [47355498, 24317029, 30213599]);
    assert.ok(executor instanceof GravekeeperExecutor, 'Expected GravekeeperExecutor to be resolved');

    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      activates: [{ code: 47355498 }], // Necrovalley
      monster_sets: [{ code: 24317029 }], // Spy
    };
    const candidates = executor.onIdleCmd(idleMsg, ctx) || [];
    const necrovalley = candidates.find((c) => c.cardCode === 47355498);
    const spySet = candidates.find((c) => c.cardCode === 24317029);
    assert.ok(necrovalley && necrovalley.score >= 4500, 'Necrovalley must be prioritized');
    assert.ok(spySet && spySet.score >= 3500, 'Gravekeeper Spy defense set must be prioritized');
    console.log('  ✓ GravekeeperExecutor combos passed!');
  }

  // Test 7: Universal Synchro Solver
  console.log('\n▶ Test 7: Universal Synchro Solver Math Engine');
  {
    const ctx = createMockContext();
    // AI has Tuner Level 3 (Junk Synchron 63977008) and Non-Tuner Level 5 (Catastor or any Level 5)
    ctx.boardState.opponentField.monsterZones[0] = {
      code: 63977008, // Junk Synchron (Tuner, Level 3)
      position: 'faceup_attack',
      atk: 1300,
      def: 1000,
      level: 3,
    } as any;
    ctx.boardState.opponentField.monsterZones[1] = {
      code: 54343893, // Vice Dragon (Non-Tuner, Level 5)
      position: 'faceup_attack',
      atk: 2000,
      def: 2400,
      level: 5,
    } as any;
    // Extra Deck contains Stardust Dragon (Level 8, 44508094)
    ctx.boardState.opponentField.extraDeck = [44508094] as any;

    const opps = evaluateSynchroOpportunities(ctx);
    assert.ok(opps.length > 0, 'Synchro opportunities must be found');
    assert.equal(opps[0].synchroCode, 44508094, 'Must solve for Stardust Dragon (3 + 5 = 8)');
    assert.equal(opps[0].synchroLevel, 8, 'Synchro Level must be 8');
    assert.ok(opps[0].scoreBonus >= 2500, 'Must award high score bonus');
    console.log('  ✓ Synchro Solver math engine passed!');
  }

  // Test 8: WindBot Staple Rules in DefaultExecutor
  console.log('\n▶ Test 8: WindBot Staple Rules in DefaultExecutor (End-Phase MST, Battle Trap Hold)');
  {
    const ctx = createMockContext();
    const defaultExec = new DefaultExecutor();

    // 1. Battle Trap Hold: AI has 3000 ATK Blue-Eyes, opponent attacks with 1400 ATK monster
    ctx.boardState.opponentField.monsterZones[0] = {
      code: 89631139,
      position: 'faceup_attack',
      atk: 3000,
      def: 2500,
    } as any;
    (ctx as any).currentBattleAttacker = { code: 12345, sequence: 0, atk: 1400 };

    const chainMsg: any = {
      type: OcgMessageType.SELECT_CHAIN,
      selects: [{ code: 44095762 }], // Mirror Force
    };
    const chainCandidates = defaultExec.onSelectChain(chainMsg, ctx) || [];
    const mirrorForce = chainCandidates.find((c) => c.cardCode === 44095762);
    assert.ok(mirrorForce, 'Mirror Force must be evaluated');
    assert.ok(mirrorForce.score < 0, 'Mirror force must be HELD (negative score) when AI monster already overpowers attacker');

    // 2. End-Phase MST
    ctx.currentPhase = 'EP';
    ctx.boardState.currentPhase = 'EP' as any;
    const mstMsg: any = {
      type: OcgMessageType.SELECT_CHAIN,
      selects: [{ code: 5318639 }], // MST
    };
    const mstCandidates = defaultExec.onSelectChain(mstMsg, ctx) || [];
    const mst = mstCandidates.find((c) => c.cardCode === 5318639);
    assert.ok(mst && mst.score >= 3500, 'MST must have elevated score during End Phase');
    console.log('  ✓ WindBot staple rules in DefaultExecutor passed!');
  }

  // Test 9: CrystalBeastExecutor (Abundance board clear & Pegasus)
  console.log('\n▶ Test 9: CrystalBeastExecutor (Crystal Abundance & Sapphire Pegasus)');
  {
    const ctx = createMockContext({ deckArchetype: 'Crystal Beast' });
    const exec = getExecutorForDeck(ctx, [7093411, 72881007]);
    assert.equal(exec.id, 'crystal-beast-rainbow');

    // 4 Crystal Beasts in ST zones
    ctx.boardState.opponentField.spellTrapZones = [
      { code: 7093411, position: 'faceup' } as any,
      { code: 95600067, position: 'faceup' } as any,
      { code: 69937550, position: 'faceup' } as any,
      { code: 32710364, position: 'faceup' } as any,
      null,
    ];
    // Opponent has 2 cards
    ctx.boardState.userField.monsterZones[0] = { code: 12345, position: 'faceup_attack' } as any;

    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      activates: [{ code: 72881007, response: 0 }], // Crystal Abundance
      summons: [{ code: 7093411, response: 1 }],   // Sapphire Pegasus
    };
    const candidates = exec.onIdleCmd(idleMsg, ctx) || [];
    const abundance = candidates.find((c) => c.cardCode === 72881007);
    assert.ok(abundance && abundance.score >= 7000, 'Crystal Abundance must receive massive priority when 4 CB in backrow');
    console.log('  ✓ CrystalBeastExecutor passed!');
  }

  // Test 10: DinosaurExecutor (Fossil Dig & Hydrogeddon)
  console.log('\n▶ Test 10: DinosaurExecutor (Fossil Dig & Hydrogeddon)');
  {
    const ctx = createMockContext({ deckArchetype: 'Dinosaur / Beatdown' });
    const exec = getExecutorForDeck(ctx, [47325505, 22587018]);
    assert.equal(exec.id, 'dinosaur-beatdown');

    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      activates: [{ code: 47325505, response: 0 }], // Fossil Dig
      summons: [{ code: 22587018, response: 1 }],   // Hydrogeddon
    };
    const candidates = exec.onIdleCmd(idleMsg, ctx) || [];
    const fossilDig = candidates.find((c) => c.cardCode === 47325505);
    const hydro = candidates.find((c) => c.cardCode === 22587018);
    assert.ok(fossilDig && hydro, 'Both actions evaluated');
    assert.ok(fossilDig.score > hydro.score, 'Fossil Dig must be activated before Normal Summoning');
    console.log('  ✓ DinosaurExecutor passed!');
  }

  // Test 11: HarpieExecutor (Hunting Ground priority before summon)
  console.log('\n▶ Test 11: HarpieExecutor (Harpies\' Hunting Ground Priority)');
  {
    const ctx = createMockContext({ deckArchetype: 'Harpie / Winged Beast' });
    const exec = getExecutorForDeck(ctx, [75782277, 91932350]);
    assert.equal(exec.id, 'harpie-winged-beast');

    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      activates: [{ code: 75782277, response: 0 }], // Harpies' Hunting Ground
      summons: [{ code: 91932350, response: 1 }],   // Harpie Lady 1
    };
    const candidates = exec.onIdleCmd(idleMsg, ctx) || [];
    const fieldSpell = candidates.find((c) => c.cardCode === 75782277);
    const harpieLady = candidates.find((c) => c.cardCode === 91932350);
    assert.ok(fieldSpell && harpieLady, 'Both actions evaluated');
    assert.ok(fieldSpell.score > harpieLady.score, 'Hunting Ground must activate before normal summon');
    console.log('  ✓ HarpieExecutor passed!');
  }

  // Test 12: SixSamuraiExecutor (United counter accumulation & Shi En)
  console.log('\n▶ Test 12: SixSamuraiExecutor (United Counter Priority)');
  {
    const ctx = createMockContext({ deckArchetype: 'Six Samurai / Warriors' });
    const exec = getExecutorForDeck(ctx, [72345736, 83039729]);
    assert.equal(exec.id, 'six-samurai-bushido');

    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      activates: [{ code: 72345736, response: 0 }], // Six Samurai United
      summons: [{ code: 95519486, response: 1 }],   // Zanji
    };
    const candidates = exec.onIdleCmd(idleMsg, ctx) || [];
    const united = candidates.find((c) => c.cardCode === 72345736);
    const zanji = candidates.find((c) => c.cardCode === 95519486);
    assert.ok(united && zanji, 'Both actions evaluated');
    assert.ok(united.score > zanji.score, 'United must be activated before normal summon');
    console.log('  ✓ SixSamuraiExecutor passed!');
  }

  // Test 13: DarkWorldExecutor (Dealings Discard Trigger)
  console.log('\n▶ Test 13: DarkWorldExecutor (Dark World Dealings Discard Trigger)');
  {
    const ctx = createMockContext({ deckArchetype: 'Dark World Fiends' });
    const exec = getExecutorForDeck(ctx, [74117290, 78004197]);
    assert.equal(exec.id, 'dark-world-discard');

    // Holding Goldd in hand
    ctx.boardState.opponentField.hand = [{ code: 78004197 } as any];

    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      activates: [{ code: 74117290, response: 0 }], // Dealings
      summons: [{ code: 6214884, response: 1 }],   // Brron
    };
    const candidates = exec.onIdleCmd(idleMsg, ctx) || [];
    const dealings = candidates.find((c) => c.cardCode === 74117290);
    assert.ok(dealings && dealings.score >= 4800, 'Dealings must have elevated score when holding Goldd');
    console.log('  ✓ DarkWorldExecutor passed!');
  }

  // Test 14: YubelSacredBeastExecutor (Damage reflection attack)
  console.log('\n▶ Test 14: YubelSacredBeastExecutor (Damage Reflection Suicide Crash)');
  {
    const ctx = createMockContext({ deckArchetype: 'Yubel / Damage Reflection' });
    const exec = getExecutorForDeck(ctx, [78371393]);
    assert.equal(exec.id, 'yubel-sacred-beast');

    // Opponent controls 3000 ATK monster
    ctx.boardState.userField.monsterZones[0] = { code: 89631139, position: 'faceup_attack', attack: 3000 } as any;

    const battleMsg: any = {
      type: OcgMessageType.SELECT_BATTLECMD,
      attacks: [{ code: 78371393, response: 0 }], // Yubel attacks
    };
    const candidates = exec.onBattleCmd(battleMsg, ctx) || [];
    const yubelAttack = candidates.find((c) => c.cardCode === 78371393);
    assert.ok(yubelAttack && yubelAttack.score >= 6000, 'Yubel must aggressively attack high-ATK target to inflict reflection damage');
    console.log('  ✓ YubelSacredBeastExecutor passed!');
  }

  // Test 15: WaterOceanExecutor (A Legendary Ocean & Daedalus)
  console.log('\n▶ Test 15: WaterOceanExecutor (A Legendary Ocean & Daedalus Wipe)');
  {
    const ctx = createMockContext({ deckArchetype: 'Umi / Daedalus Tsunami' });
    const exec = getExecutorForDeck(ctx, [295517, 37721209]);
    assert.equal(exec.id, 'water-ocean-daedalus');

    ctx.boardState.opponentField.fieldZone = { code: 295517, position: 'faceup' } as any;
    // Opponent has 3 cards
    ctx.boardState.userField.monsterZones[0] = { code: 111, position: 'faceup_attack' } as any;
    ctx.boardState.userField.monsterZones[1] = { code: 222, position: 'faceup_attack' } as any;

    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      activates: [{ code: 37721209, response: 0 }], // Daedalus effect
    };
    const candidates = exec.onIdleCmd(idleMsg, ctx) || [];
    const daedalus = candidates.find((c) => c.cardCode === 37721209);
    assert.ok(daedalus && daedalus.score >= 7000, 'Daedalus tsunami nuke must have game-winning priority');
    console.log('  ✓ WaterOceanExecutor passed!');
  }

  // Test 16: EgyptianGodExecutor (Obelisk Megaton Crush)
  console.log('\n▶ Test 16: EgyptianGodExecutor (Obelisk Megaton Crush)');
  {
    const ctx = createMockContext({ deckArchetype: 'Egyptian God / Obelisk' });
    const exec = getExecutorForDeck(ctx, [10000000, 74875003]);
    assert.equal(exec.id, 'egyptian-god-divinity');

    // 3 monsters on AI field
    ctx.boardState.opponentField.monsterZones = [
      { code: 10000000, position: 'faceup_attack' } as any,
      { code: 74875003, position: 'faceup_attack' } as any,
      { code: 74875003, position: 'faceup_attack' } as any,
      null, null
    ];

    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      activates: [{ code: 10000000, response: 0 }], // Megaton crush
    };
    const candidates = exec.onIdleCmd(idleMsg, ctx) || [];
    const crush = candidates.find((c) => c.cardCode === 10000000);
    assert.ok(crush && crush.score >= 7000, 'Obelisk Megaton Crush must wipe opponent field');
    console.log('  ✓ EgyptianGodExecutor passed!');
  }

  console.log('\n================================================================');
  console.log('🎉 ALL 16 WINDBOT AI EXECUTOR INTEGRATION TESTS PASSED 100%!');
  console.log('================================================================\n');

}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
