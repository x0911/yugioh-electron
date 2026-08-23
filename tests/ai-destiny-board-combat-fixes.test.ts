import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DefaultExecutor } from '../src/main/ai/executors/DefaultExecutor.js';
import { aiController } from '../src/main/ai/AIController.js';
import { evaluateSpellActivation, evaluateSpellTrapSet } from '../src/main/ai/evaluators/spellTrapEvaluator.js';
import { getAiAndOpponentFields } from '../src/main/ai/types.js';
import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  SelectBattleCMDAction,
} from 'ocgcore-wasm';
import type { EvaluatorContext } from '../src/main/ai/types.js';
import type { PlayerFieldState, FieldCard } from '../src/shared/types/field.js';

function createMockContext(aiPlayerId: 0 | 1 = 0): EvaluatorContext {
  const humanPlayerId = (aiPlayerId === 0 ? 1 : 0) as 0 | 1;

  const player0Field: PlayerFieldState = {
    playerId: 0,
    name: 'Player 0',
    currentLp: 8000,
    maxLp: 8000,
    isTurn: true,
    deckCount: 35,
    extraDeckCount: 0,
    hand: [],
    monsterZones: [null, null, null, null, null],
    spellTrapZones: [null, null, null, null, null],
    fieldZone: null,
    graveyard: [],
    banished: [],
    extraDeck: [],
  };

  const player1Field: PlayerFieldState = {
    playerId: 1,
    name: 'Player 1',
    currentLp: 8000,
    maxLp: 8000,
    isTurn: false,
    deckCount: 35,
    extraDeckCount: 0,
    hand: [],
    monsterZones: [null, null, null, null, null],
    spellTrapZones: [null, null, null, null, null],
    fieldZone: null,
    graveyard: [],
    banished: [],
    extraDeck: [],
  };

  // Human field is userField, AI field is opponentField (or vice-versa based on humanPlayerId)
  const userField = humanPlayerId === 0 ? player0Field : player1Field;
  const opponentField = humanPlayerId === 0 ? player1Field : player0Field;

  return {
    aiPlayerId,
    humanPlayerId,
    boardState: {
      userField,
      opponentField,
      extraMonsterZones: [null, null],
      turnNumber: 5,
      currentPhase: 'MAIN1',
    },
    personality: {
      id: 'bakura-ryou',
      name: 'Bakura Ryou',
      cardAdvantageWeight: 1.0,
      comboFocus: 0.8,
      signatureFavoritism: 0.8,
      defensiveness: 0.6,
      aggression: 0.6,
      riskTolerance: 0.4,
    },
    cardReader: {
      getCardName: (code: number) => {
        if (code === 94212438) return 'Destiny Board';
        if (code === 31893528) return 'Spirit Message "I"';
        if (code === 67287533) return 'Spirit Message "N"';
        if (code === 94772232) return 'Spirit Message "A"';
        if (code === 30170981) return 'Spirit Message "L"';
        if (code === 16625614) return 'Dark Sanctuary';
        if (code === 31829185) return 'Dark Necrofear';
        if (code === 49888191) return 'Buster Blader';
        if (code === 269012) return 'Celtic Guardian';
        if (code === 8581705) return 'Infernalqueen Archfiend';
        return `Card_${code}`;
      },
      getCardDetail: (code: number) => {
        if (code === 94212438) return { code, name: 'Destiny Board', isTrap: true, isContinuous: true };
        if (code === 16625614) return { code, name: 'Dark Sanctuary', isSpell: true, isField: true };
        if (code === 31829185) return { code, name: 'Dark Necrofear', isMonster: true, atk: 2200, def: 2800, level: 8 };
        if (code === 49888191) return { code, name: 'Buster Blader', isMonster: true, atk: 2600, def: 2300, level: 7 };
        if (code === 269012) return { code, name: 'Celtic Guardian', isMonster: true, atk: 1400, def: 1200, level: 4 };
        if (code === 8581705) return { code, name: 'Infernalqueen Archfiend', isMonster: true, atk: 1900, def: 1500, level: 4 };
        return null;
      },
    } as any,
    currentPhase: 'M1',
    currentTurn: 5,
    signatureCardIds: [94212438, 31829185],
    deckArchetype: 'Occult / Destiny Board',
  };
}

describe('AI Tactical Bug Fixes & Destiny Board Mechanics', () => {
  it('1. Duplicate Destiny Board: AI strictly avoids activating a 2nd Destiny Board when one is already face-up', () => {
    const context = createMockContext(0); // AI is Player 0
    const { aiField } = getAiAndOpponentFields(context);

    // AI already has Destiny Board face-up in S/T zone 0
    aiField.spellTrapZones[0] = {
      id: 'st-0',
      code: 94212438,
      name: 'Destiny Board',
      controller: 0,
      location: 'spell',
      sequence: 0,
      position: 'faceup_spell',
      statuses: [],
    };

    const evalResult = evaluateSpellActivation(94212438, 'Destiny Board', context);
    assert.ok(
      evalResult.score <= -10000,
      `Duplicate Destiny Board must have massive negative score (got ${evalResult.score})`,
    );
    assert.match(evalResult.reason, /duplicate Destiny Board/i);
  });

  it('2. Backrow Preservation: AI avoids setting extra Spells/Traps when Destiny Board needs open zones for Spirit Messages', () => {
    const context = createMockContext(0);
    const { aiField } = getAiAndOpponentFields(context);

    // AI has Destiny Board (S0) and Spirit Message "I" (S1)
    aiField.spellTrapZones[0] = {
      id: 'st-0',
      code: 94212438,
      name: 'Destiny Board',
      controller: 0,
      location: 'spell',
      sequence: 0,
      position: 'faceup_spell',
      statuses: [],
    };
    aiField.spellTrapZones[1] = {
      id: 'st-1',
      code: 31893528,
      name: 'Spirit Message "I"',
      controller: 0,
      location: 'spell',
      sequence: 1,
      position: 'faceup_spell',
      statuses: [],
    };
    // S2 is set with a trap (3 occupied, 2 open zones left)
    aiField.spellTrapZones[2] = {
      id: 'st-2',
      code: 44095762,
      name: 'Mirror Force',
      controller: 0,
      location: 'spell',
      sequence: 2,
      position: 'facedown_spell',
      statuses: [],
    };

    // Remaining Spirit Messages needed: N, A, L (3 messages).
    // Open zones left: 2 (less than 3 needed).
    // Setting another card must be heavily penalized!
    const setResult = evaluateSpellTrapSet(94192409, 'Compulsory Evacuation Device', context);
    assert.ok(
      setResult.score <= -9000,
      `Setting non-essential backrow during Destiny Board must be penalized (got ${setResult.score})`,
    );
    assert.match(setResult.reason, /preserve open Spell\/Trap zones for Destiny Board/i);
  });

  it('3. Anti-Suicide Attack Target: AI targets weaker 1400 ATK Celtic Guardian instead of stronger 2600 ATK Buster Blader', () => {
    const context = createMockContext(0);
    const { aiField, oppField } = getAiAndOpponentFields(context);

    // AI controls Dark Necrofear (2200 ATK) in Attack Position
    aiField.monsterZones[0] = {
      id: 'ai-m0',
      code: 31829185,
      name: 'Dark Necrofear',
      controller: 0,
      location: 'monster',
      sequence: 0,
      position: 'faceup_attack',
      atk: 2200,
      def: 2800,
      level: 8,
      statuses: [],
    };

    // Opponent controls Buster Blader (2600 ATK) in zone 0 and Celtic Guardian (1400 ATK) in zone 1
    oppField.monsterZones[0] = {
      id: 'opp-m0',
      code: 49888191,
      name: 'Buster Blader',
      controller: 1,
      location: 'monster',
      sequence: 0,
      position: 'faceup_attack',
      atk: 2600,
      def: 2300,
      level: 7,
      statuses: [],
    };
    oppField.monsterZones[1] = {
      id: 'opp-m1',
      code: 269012,
      name: 'Celtic Guardian',
      controller: 1,
      location: 'monster',
      sequence: 1,
      position: 'faceup_attack',
      atk: 1400,
      def: 1200,
      level: 4,
      statuses: [],
    };

    context.boardState.currentPhase = 'BP';

    const selectTargetMsg = {
      type: OcgMessageType.SELECT_CARD,
      min: 1,
      max: 1,
      selects: [
        { code: 49888191, controller: 1, location: 0x4, sequence: 0, position: 1 }, // Buster Blader (2600 ATK)
        { code: 269012, controller: 1, location: 0x4, sequence: 1, position: 1 },   // Celtic Guardian (1400 ATK)
      ],
    };

    const resp = aiController.decideResponse(selectTargetMsg as any, context);
    assert.equal(resp.type, OcgResponseType.SELECT_CARD);
    // Must select index 1 (Celtic Guardian) and NOT index 0 (Buster Blader suicide)
    assert.deepEqual(
      (resp as any).indicies,
      [1],
      'AI must target the destroyable monster (Celtic Guardian) rather than suicidal Buster Blader',
    );
  });

  it('4. Battle Phase Transition: AI eagerly enters Battle Phase when holding superior 1900 ATK monster against weaker board', () => {
    const context = createMockContext(0); // AI is Player 0
    const { aiField, oppField } = getAiAndOpponentFields(context);

    // AI controls Infernalqueen Archfiend (1900 ATK)
    aiField.monsterZones[0] = {
      id: 'ai-m0',
      code: 8581705,
      name: 'Infernalqueen Archfiend',
      controller: 0,
      location: 'monster',
      sequence: 0,
      position: 'faceup_attack',
      atk: 1900,
      def: 1500,
      level: 4,
      statuses: [],
    };

    // Opponent controls Giant Soldier of Stone (1300 ATK) and Sangan (1000 ATK)
    oppField.monsterZones[0] = {
      id: 'opp-m0',
      code: 13039848,
      name: 'Giant Soldier of Stone',
      controller: 1,
      location: 'monster',
      sequence: 0,
      position: 'faceup_attack',
      atk: 1300,
      def: 2000,
      level: 3,
      statuses: [],
    };
    oppField.monsterZones[1] = {
      id: 'opp-m1',
      code: 26202165,
      name: 'Sangan',
      controller: 1,
      location: 'monster',
      sequence: 1,
      position: 'faceup_attack',
      atk: 1000,
      def: 600,
      level: 3,
      statuses: [],
    };

    const executor = new DefaultExecutor();
    const idleMsg = {
      type: OcgMessageType.SELECT_IDLECMD,
      to_bp: true,
      to_ep: true,
      summons: [],
      special_summons: [],
      monster_sets: [],
      spell_sets: [],
      pos_changes: [],
      activates: [],
    };

    const actions = executor.onIdleCmd(idleMsg as any, context);
    assert.ok(actions && actions.length > 0);

    const bpAction = actions.find((a) => (a.action as any).action === SelectIdleCMDAction.TO_BP);
    const epAction = actions.find((a) => (a.action as any).action === SelectIdleCMDAction.TO_EP);

    assert.ok(bpAction, 'Battle Phase action must be generated');
    assert.ok(epAction, 'End Phase action must be generated');
    assert.ok(
      bpAction.score > epAction.score,
      `TO_BP score (${bpAction.score}) must exceed TO_EP score (${epAction.score}) when AI has superior ATK`,
    );

    const aiDecision = aiController.decideResponse(idleMsg as any, context);
    assert.equal(
      (aiDecision as any).action,
      SelectIdleCMDAction.TO_BP,
      'AI must advance to Battle Phase to attack weaker opponent monsters',
    );
  });
});
