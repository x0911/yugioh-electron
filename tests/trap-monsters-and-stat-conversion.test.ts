import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTrapMonsterStats, isTreatedAsMonster } from '../src/shared/utils/cardStats.js';
import { DuelEngineService } from '../src/main/engine/DuelEngineService.js';
import { DefaultExecutor } from '../src/main/ai/executors/DefaultExecutor.js';
import { CardReaderService } from '../src/main/engine/cardReader.js';
import { OcgResponseType, SelectIdleCMDAction, OcgMessageType, OcgPosition } from 'ocgcore-wasm';
import type { EvaluatorContext } from '../src/main/ai/types.js';

test('Trap Monster Dynamic Stat Parsing & Global Conversion Matrix', async (t) => {
  await t.test('1. parseTrapMonsterStats parses all canonical Trap Monster descriptions', () => {
    const zoma = parseTrapMonsterStats(
      'Special Summon this card in Defense Position as an Effect Monster (Zombie/DARK/Level 4/ATK 1800/DEF 500). (This card is also still a Trap.) If this card Summoned this way is destroyed by battle: Inflict damage to your opponent equal to the ATK of the monster that destroyed it.'
    );
    assert.equal(zoma.race, 'Zombie');
    assert.equal(zoma.attribute, 'DARK');
    assert.equal(zoma.level, 4);
    assert.equal(zoma.atk, 1800);
    assert.equal(zoma.def, 500);

    const apophis = parseTrapMonsterStats(
      'Special Summon this card as a Normal Monster (Reptile-Type/EARTH/Level 4/ATK 1600/DEF 1800). (This card is also still a Trap.)'
    );
    assert.equal(apophis.race, 'Reptile');
    assert.equal(apophis.attribute, 'EARTH');
    assert.equal(apophis.level, 4);
    assert.equal(apophis.atk, 1600);
    assert.equal(apophis.def, 1800);

    const slime = parseTrapMonsterStats(
      'Special Summon this card in Defense Position as an Effect Monster (Aqua/WATER/Level 10/ATK 0/DEF 3000). (This card is also still a Trap.)'
    );
    assert.equal(slime.race, 'Aqua');
    assert.equal(slime.attribute, 'WATER');
    assert.equal(slime.level, 10);
    assert.equal(slime.atk, 0);
    assert.equal(slime.def, 3000);

    const anguish = parseTrapMonsterStats(
      'Special Summon this card as an Effect Monster (Rock/EARTH/Level 7/ATK 0/DEF 2500). (This card is also still a Trap.)'
    );
    assert.equal(anguish.race, 'Rock');
    assert.equal(anguish.attribute, 'EARTH');
    assert.equal(anguish.level, 7);
    assert.equal(anguish.atk, 0);
    assert.equal(anguish.def, 2500);

    const shadowVeil = parseTrapMonsterStats(
      'Special Summon this card in Defense Position as a Normal Monster (Warrior/DARK/Level 4/ATK 0/DEF 300). (This card is NOT treated as a Trap.)'
    );
    assert.equal(shadowVeil.race, 'Warrior');
    assert.equal(shadowVeil.attribute, 'DARK');
    assert.equal(shadowVeil.level, 4);
    assert.equal(shadowVeil.atk, 0);
    assert.equal(shadowVeil.def, 300);
  });

  await t.test('2. isTreatedAsMonster handles monster vs spell-trap zone conversions', () => {
    // In MZONE: Always treated as monster, even if base card is a Trap (Trap Monster)
    assert.equal(isTreatedAsMonster('monster', false), true);
    assert.equal(isTreatedAsMonster('monster', true), true);
    assert.equal(isTreatedAsMonster('extra-monster', false), true);

    // In SZONE: Never treated as monster, even if base card is a Monster (equipped monster / continuous spell)
    assert.equal(isTreatedAsMonster('spell-trap', true), false);
    assert.equal(isTreatedAsMonster('spell-trap', false), false);
    assert.equal(isTreatedAsMonster('field', true), false);

    // In other zones (hand, graveyard, deck, banished): follows base card type
    assert.equal(isTreatedAsMonster('hand', true), true);
    assert.equal(isTreatedAsMonster('hand', false), false);
    assert.equal(isTreatedAsMonster('graveyard', true), true);
    assert.equal(isTreatedAsMonster('graveyard', false), false);
  });

  await t.test('3. DuelEngineService: Zoma the Spirit (79852326) activates into MZONE with full stats', async () => {
    const service = new DuelEngineService();
    await service.init();

    service.startNewDuel({
      player0Deck: Array(40).fill(25652259),
      player0SpellTraps: [
        { code: 79852326, sequence: 0, position: 0x8 }, // Zoma the Spirit Set
      ],
      player1Deck: Array(40).fill(25652259),
      noShuffle: true,
      humanPlayerId: 0,
      startingLP: 8000,
    });

    // Check initial SZONE state: no monster stats
    let board = service.getBoardState();
    const initSt = board.userField.spellTrapZones[0];
    assert(initSt, 'Zoma should be in SZONE 0');
    assert.equal(initSt.atk, undefined);
    assert.equal(initSt.def, undefined);
    assert.equal(initSt.level, undefined);

    // Activate Zoma in Draw Phase chain
    const prompt = (service as any).lastPromptMessage;
    if (prompt?.type === OcgMessageType.SELECT_CHAIN) {
      service.sendResponse({
        type: OcgResponseType.SELECT_CHAIN,
        index: 0,
      });
      service.processStep();
    }

    board = service.getBoardState();
    const zomaMonster = board.userField.monsterZones[0];
    assert(zomaMonster, 'Zoma the Spirit must be in MZONE 0');
    assert.equal(zomaMonster.code, 79852326);
    assert.equal(zomaMonster.name, 'Zoma the Spirit');
    assert.equal(zomaMonster.atk, 1800, 'Zoma must have 1800 ATK');
    assert.equal(zomaMonster.def, 500, 'Zoma must have 500 DEF');
    assert.equal(zomaMonster.level, 4, 'Zoma must have Level 4');
    assert.equal(zomaMonster.attribute, 'DARK', 'Zoma must have DARK attribute');
    assert.equal(zomaMonster.race, 'Zombie', 'Zoma must have Zombie race');
    assert.equal(board.userField.spellTrapZones[0], null, 'SZONE 0 must be vacated');

    service.close();
  });

  await t.test('4. DuelEngineService: SZONE monster cards never leak combat stats', async () => {
    const service = new DuelEngineService();
    await service.init();

    service.startNewDuel({
      player0Deck: Array(40).fill(25652259),
      player0SpellTraps: [
        { code: 46986414, sequence: 0, position: 0x1 }, // Dark Magician placed in SZONE (e.g. Relinquished equip)
      ],
      player1Deck: Array(40).fill(25652259),
      noShuffle: true,
      humanPlayerId: 0,
      startingLP: 8000,
    });

    const board = service.getBoardState();
    const equipCard = board.userField.spellTrapZones[0];
    assert(equipCard, 'Equipped card must be in SZONE 0');
    assert.equal(equipCard.code, 46986414);
    assert.equal(equipCard.atk, undefined, 'SZONE card must not have ATK');
    assert.equal(equipCard.def, undefined, 'SZONE card must not have DEF');
    assert.equal(equipCard.level, undefined, 'SZONE card must not have Level');
    assert.equal(equipCard.baseAtk, undefined, 'SZONE card must not have baseAtk');
    assert.equal(equipCard.baseDef, undefined, 'SZONE card must not have baseDef');

    service.close();
  });

  await t.test('5. AI Tactical Intelligence: Penalizes suicidal Normal Summon of weak Spirit monster (Yata-Garasu)', () => {
    const executor = new DefaultExecutor();
    const cardReader = new CardReaderService();

    const ctx: EvaluatorContext = {
      boardState: {
        userPlayerId: 1,
        opponentPlayerId: 0,
        userField: {
          playerId: 1,
          name: 'Player',
          currentLp: 8000,
          maxLp: 8000,
          isTurn: false,
          monsterZones: [
            {
              id: 'm-0',
              code: 91152256,
              name: 'Royal Keeper',
              controller: 1,
              location: 'monster',
              sequence: 0,
              position: 'faceup_attack',
              atk: 1600,
              def: 1700,
              level: 4,
            },
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
          name: 'Bakura Ryou',
          currentLp: 3900,
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
        turnNumber: 7,
        currentPhase: 'M1',
        activePrompt: null,
        phaseGuideText: '',
        winner: null,
        winReason: null,
      },
      personality: {
        id: 'bakura',
        name: 'Bakura Ryou',
        aggression: 0.8,
        defensiveness: 0.6,
        riskTolerance: 0.7,
        comboFocus: 0.8,
        signatureFavoritism: 0.9,
      },
      cardReader,
      currentPhase: 'M1',
      currentTurn: 7,
      signatureCardIds: [],
    };

    // Idle cmd offering Normal Summon of Yata-Garasu (33064647, 200 ATK)
    const idleMsg: any = {
      type: OcgMessageType.SELECT_IDLECMD,
      player: 0,
      summons: [
        { code: 33064647, sequence: 0, controller: 0 }, // Yata-Garasu
      ],
      monster_sets: [
        { code: 33064647, sequence: 0, controller: 0 },
      ],
      activates: [],
    };

    const evaluated = executor.onIdleCmd(idleMsg, ctx) || [];
    const yataSummon = evaluated.find((c: any) => c.action.action === SelectIdleCMDAction.SELECT_SUMMON);
    assert(yataSummon, 'Must evaluate Yata-Garasu summon candidate');
    assert(yataSummon.score < 0, 'Normal Summoning Yata-Garasu into 1600 ATK opponent monster must be penalized');
  });
});
