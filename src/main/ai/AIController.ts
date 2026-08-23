import {
  OcgMessageType,
  OcgResponseType,
  OcgLocation,
  OcgPosition,
  OcgRace,
  OcgAttribute,
  SelectIdleCMDAction,
  SelectBattleCMDAction,
  ocgPositionParse,
  type OcgMessage,
  type OcgResponse,
} from 'ocgcore-wasm';
import type { EvaluatorContext, ScoredAction } from './types.js';
import type { CharacterPersonality } from '../../shared/types/character.js';
import type { FieldCard, PlayerFieldState } from '../../shared/types/field.js';
import { parseFieldMask } from '../engine/messageDecoder.js';
import { evaluateBoard } from './evaluators/boardEvaluator.js';
import { evaluateAdvantage } from './evaluators/advantageEvaluator.js';
import { evaluateAttackOption, type AttackCandidate } from './evaluators/combatEvaluator.js';
import { evaluateSpellActivation, evaluateSpellTrapSet } from './evaluators/spellTrapEvaluator.js';
import { resolveArchetypePlan } from './strategies/archetypeStrategy.js';
import { assertAiStateSanitized } from './antiCheatAssert.js';
import { getExecutorForDeck } from './executors/index.js';

export class AIController {
  /**
   * Main entrypoint to decide an AI response for an engine prompt.
   * Strictly expects a sanitized AI-side board state.
   */
  public decideResponse(msg: OcgMessage, context: EvaluatorContext): OcgResponse {
    // 1. Anti-cheat assertion verification
    assertAiStateSanitized(context.boardState, context.aiPlayerId);

    // 2. Route prompt to specialized evaluators
    switch (msg.type) {
      case OcgMessageType.SELECT_IDLECMD:
        return this.decideIdleCmd(msg, context);

      case OcgMessageType.SELECT_BATTLECMD:
        return this.decideBattleCmd(msg, context);

      case OcgMessageType.SELECT_CARD:
        return this.decideSelectCard(msg, context);

      case OcgMessageType.SELECT_TRIBUTE:
        return this.decideSelectTribute(msg, context);

      case OcgMessageType.SELECT_CHAIN:
        return this.decideSelectChain(msg, context);

      case OcgMessageType.SELECT_EFFECTYN:
      case OcgMessageType.SELECT_YESNO:
        return this.decideSelectYesNo(msg, context);

      case OcgMessageType.SELECT_POSITION:
        return this.decideSelectPosition(msg, context);

      case OcgMessageType.SELECT_PLACE:
      case OcgMessageType.SELECT_DISFIELD:
        return this.decideSelectPlace(msg, context);

      case OcgMessageType.SELECT_SUM:
        return this.decideSelectSum(msg, context);

      case OcgMessageType.SELECT_OPTION:
        return {
          type: OcgResponseType.SELECT_OPTION,
          index: 0,
        };

      case OcgMessageType.SELECT_UNSELECT_CARD:
        return {
          type: OcgResponseType.SELECT_UNSELECT_CARD,
          index: msg.select_cards && msg.select_cards.length > 0 ? 0 : null,
        };

      case OcgMessageType.ANNOUNCE_RACE: {
        const { aiPlayerId, boardState } = context;
        const oppField: PlayerFieldState = aiPlayerId === 0 ? boardState.opponentField : boardState.userField;
        const oppMonsters = oppField.monsterZones.filter(
          (m): m is FieldCard => !!m && (m.position === 'faceup_attack' || m.position === 'faceup_defense')
        );

        let targetRace: bigint | null = null;
        if (oppMonsters.length > 0) {
          const strongestOpp = oppMonsters.reduce((prev, curr) => (curr.atk > prev.atk ? curr : prev), oppMonsters[0]);
          if (strongestOpp && strongestOpp.code) {
            const detail = context.cardReader.getCardDetail(strongestOpp.code);
            if (detail && detail.race !== undefined && detail.race !== null) {
              if (typeof detail.race === 'number' || typeof detail.race === 'bigint') {
                targetRace = BigInt(detail.race);
              } else if (typeof detail.race === 'string') {
                const raceName = String(detail.race).toUpperCase().replace(/[-_ ]/g, '');
                const ocgRaceKey = Object.keys(OcgRace).find(
                  (k) => k.replace(/_/g, '') === raceName
                ) as keyof typeof OcgRace | undefined;
                if (ocgRaceKey && OcgRace[ocgRaceKey]) {
                  targetRace = OcgRace[ocgRaceKey];
                }
              }
            }
          }
        }

        const archetype = resolveArchetypePlan(context.deckArchetype);
        const rawRace = targetRace ?? (archetype.preferredRaces[0] ?? OcgRace.WARRIOR);
        const race = typeof rawRace === 'bigint' ? rawRace : BigInt(rawRace);
        return {
          type: OcgResponseType.ANNOUNCE_RACE,
          races: [race],
        };
      }

      case OcgMessageType.ANNOUNCE_ATTRIB: {
        const { aiPlayerId, boardState } = context;
        const oppField: PlayerFieldState = aiPlayerId === 0 ? boardState.opponentField : boardState.userField;
        const oppMonsters = oppField.monsterZones.filter(
          (m): m is FieldCard => !!m && (m.position === 'faceup_attack' || m.position === 'faceup_defense')
        );

        let targetAttr: number | null = null;
        if (oppMonsters.length > 0) {
          const strongestOpp = oppMonsters.reduce((prev, curr) => (curr.atk > prev.atk ? curr : prev), oppMonsters[0]);
          if (strongestOpp && strongestOpp.code) {
            const detail = context.cardReader.getCardDetail(strongestOpp.code);
            if (detail && detail.attribute) {
              targetAttr = Number(detail.attribute);
            }
          }
        }

        const archetype = resolveArchetypePlan(context.deckArchetype);
        const rawAttr = targetAttr ?? (archetype.preferredAttributes[0] ?? OcgAttribute.DARK);
        const attr = typeof rawAttr === 'number' ? rawAttr : Number(rawAttr);
        return {
          type: OcgResponseType.ANNOUNCE_ATTRIB,
          attributes: [attr],
        };
      }

      case OcgMessageType.ANNOUNCE_CARD: {
        const defaultCard = context.signatureCardIds[0] ?? 91152256;
        return {
          type: OcgResponseType.ANNOUNCE_CARD,
          card: typeof defaultCard === 'number' ? defaultCard : Number(defaultCard),
        };
      }

      case OcgMessageType.ANNOUNCE_NUMBER: {
        const val = msg.options && msg.options.length > 0 ? Number(msg.options[0]) : 1;
        return {
          type: OcgResponseType.ANNOUNCE_NUMBER,
          value: val,
        };
      }

      case OcgMessageType.ROCK_PAPER_SCISSORS: {
        return {
          type: OcgResponseType.ROCK_PAPER_SCISSORS,
          value: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3,
        };
      }

      case OcgMessageType.SORT_CHAIN:
      case OcgMessageType.SORT_CARD: {
        const order = msg.cards ? Array.from({ length: msg.cards.length }, (_, i) => i) : null;
        return {
          type: OcgResponseType.SORT_CARD,
          order,
        };
      }

      case OcgMessageType.SELECT_COUNTER: {
        let remaining = msg.count ?? 0;
        const counters: number[] = [];
        for (const c of msg.cards ?? []) {
          const take = Math.min(remaining, c.count ?? 0);
          counters.push(take);
          remaining -= take;
        }
        return {
          type: OcgResponseType.SELECT_COUNTER,
          counters,
        };
      }

      default:
        return {
          type: OcgResponseType.SELECT_CHAIN,
          index: null,
        };
    }
  }

  /**
   * Calculates an artificial think-delay in milliseconds with natural jitter.
   */
  public getThinkDelay(personality: CharacterPersonality, promptType?: string): number {
    const base = personality.thinkDelayBaseMs ?? 650;
    const jitter = personality.thinkDelayJitterMs ?? 200;
    const randomJitter = Math.floor((Math.random() * 2 - 1) * jitter);

    // Fast-pass simple yes/no or placements
    if (promptType === 'SELECT_PLACE' || promptType === 'SELECT_DISFIELD') {
      return Math.max(150, Math.floor(base * 0.4 + randomJitter * 0.3));
    }

    // Extended thinking for complex chain windows / idle decisions
    return Math.max(250, base + randomJitter);
  }

  // ===========================================================================
  // SELECT_IDLECMD
  // ===========================================================================

  private decideIdleCmd(msg: OcgMessage, context: EvaluatorContext): OcgResponse {
    const executor = getExecutorForDeck(context, context.aiDeckCards);
    const executorActions = executor.onIdleCmd ? executor.onIdleCmd(msg, context) : null;
    if (executorActions && executorActions.length > 0) {
      return this.selectWeightedAction(executorActions);
    }

    const candidates: ScoredAction[] = [];
    const { personality, cardReader, signatureCardIds, deckArchetype } = context;
    const archetypePlan = resolveArchetypePlan(deckArchetype);
    const board = evaluateBoard(context);
    const adv = evaluateAdvantage(context);

    const oppField = context.boardState.userField.playerId === context.aiPlayerId ? context.boardState.opponentField : context.boardState.userField;
    const oppFaceUpMonsters = oppField.monsterZones.filter((m) => !!m && (m.position === 'faceup_attack' || m.position === 'faceup_defense'));
    const hasOppSlifer = oppFaceUpMonsters.some((m) => m.code === 10000020);
    const hasOppWanghu = oppFaceUpMonsters.some((m) => m.code === 83986578);

    // 1. Evaluate Activations (Spells / Traps / Monster Effects)
    if (msg.activates && msg.activates.length > 0) {
      for (let i = 0; i < msg.activates.length; i++) {
        const act = msg.activates[i];
        const code = act.code ?? 0;
        const name = act.cardName || (code > 0 ? cardReader.getCardName(code) : 'Effect');
        const evalResult = evaluateSpellActivation(code, name, context);
        let score = evalResult.score;

        // Apply archetype weights
        if (name.includes('Fusion') || code === 24094653) {
          score *= archetypePlan.fusionWeight;
        }

        candidates.push({
          action: {
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_ACTIVATE,
            index: i,
          },
          score,
          reason: evalResult.reason,
          cardCode: code,
          cardName: name,
        });
      }
    }

    // 2. Evaluate Normal Summons
    if (msg.summons && msg.summons.length > 0) {
      for (let i = 0; i < msg.summons.length; i++) {
        const summon = msg.summons[i];
        const code = summon.code ?? 0;
        const detail = code > 0 ? cardReader.getCardDetail(code) : null;
        const name = detail?.name || (code > 0 ? cardReader.getCardName(code) : 'Monster');
        const atk = detail?.isMonster ? detail.atk : 1000;
        const level = detail?.isMonster ? detail.level : 4;

        let score = 500 + atk * 0.8 * personality.aggression * archetypePlan.beatdownWeight;

        // Suicidal summon penalty against Slifer / King Tiger Wanghu
        if (hasOppSlifer && atk <= 2000) {
          score -= 1800; // Will be destroyed immediately upon summon
        }
        if (hasOppWanghu && atk <= 1400) {
          score -= 1800;
        }

        // Avoid summoning weak monsters in Attack Position when opponent controls high-ATK boss monsters
        const oppMaxAtk = Math.max(0, ...oppFaceUpMonsters.map((m) => m?.atk ?? 0));
        if (oppMaxAtk >= 1900 && atk < oppMaxAtk && atk <= 1600) {
          score -= 3500;
        }

        // Tribute summon reward or wall preservation penalty
        if (level >= 5) {
          const aiField = context.aiPlayerId === 0 ? context.boardState.userField : context.boardState.opponentField;
          const aiMonsters = aiField.monsterZones.filter((m): m is FieldCard => !!m);
          const hasStallWall = aiMonsters.some(
            (m) =>
              m.code === 31305911 || // Marshmallon
              m.code === 23205979 || // Spirit Reaper
              m.code === 37412656 || // Arcana Force 0
              m.code === 78371393    // Yubel
          );
          if (hasStallWall && aiMonsters.length <= 1 && oppMaxAtk > atk) {
            score -= 5000; // Do not sacrifice our indestructible stall wall when facing superior monster!
          } else {
            score += 400 * personality.riskTolerance;
          }
        }

        // Signature card boost
        if (signatureCardIds.includes(code)) {
          score += 600 * personality.signatureFavoritism;
        }

        candidates.push({
          action: {
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_SUMMON,
            index: i,
          },
          score,
          reason: `Normal Summon ${name} (${atk} ATK, Lv ${level})`,
          cardCode: code,
          cardName: name,
        });
      }
    }

    // 3. Evaluate Special Summons (Extra deck, Ritual, effect)
    if (msg.special_summons && msg.special_summons.length > 0) {
      for (let i = 0; i < msg.special_summons.length; i++) {
        const sp = msg.special_summons[i];
        const code = sp.code ?? 0;
        const detail = code > 0 ? cardReader.getCardDetail(code) : null;
        const name = detail?.name || (code > 0 ? cardReader.getCardName(code) : 'Special Summon Monster');
        const atk = detail?.isMonster ? detail.atk : 2000;

        let score = 900 + atk * 0.6 * personality.comboFocus;
        if (hasOppSlifer && atk <= 2000) {
          score -= 1800;
        }
        if (hasOppWanghu && atk <= 1400) {
          score -= 1800;
        }
        if (signatureCardIds.includes(code)) {
          score += 800 * personality.signatureFavoritism;
        }

        candidates.push({
          action: {
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_SPECIAL_SUMMON,
            index: i,
          },
          score,
          reason: `Special Summon ${name} (${atk} ATK)`,
          cardCode: code,
          cardName: name,
        });
      }
    }

    // 4. Evaluate Monster Sets (Face-down defense)
    if (msg.monster_sets && msg.monster_sets.length > 0) {
      for (let i = 0; i < msg.monster_sets.length; i++) {
        const mset = msg.monster_sets[i];
        const code = mset.code ?? 0;
        const detail = code > 0 ? cardReader.getCardDetail(code) : null;
        const name = detail?.name || (code > 0 ? cardReader.getCardName(code) : 'Monster');
        const def = detail?.isMonster ? detail.def : 1000;
        const atk = detail?.isMonster ? detail.atk : 1000;
        const level = detail?.isMonster ? detail.level : 4;

        // Favorable to set if DEF > ATK, or when defensive
        let score = 300 + (def - atk) * 0.4 + def * 0.5 * personality.defensiveness * archetypePlan.defenseWeight;

        // Tribute Set check: NEVER sacrifice our only indestructible wall for a mortal defense set against a boss monster!
        if (level >= 5) {
          const aiField = context.aiPlayerId === 0 ? context.boardState.userField : context.boardState.opponentField;
          const aiMonsters = aiField.monsterZones.filter((m): m is FieldCard => !!m);
          const hasStallWall = aiMonsters.some(
            (m) =>
              m.code === 31305911 || // Marshmallon
              m.code === 23205979 || // Spirit Reaper
              m.code === 37412656 || // Arcana Force 0
              m.code === 78371393    // Yubel
          );
          if (hasStallWall && aiMonsters.length <= 1 && oppMaxAtk > def) {
            score -= 6000; // Throwing away stall wall to set a monster that will die next turn is fatal blunder
          }
        }

        // Prioritize setting defensively when opponent controls a boss monster
        const oppMaxAtk = Math.max(0, ...oppFaceUpMonsters.map((m) => m?.atk ?? 0));
        if (oppMaxAtk >= 1900 && atk < oppMaxAtk) {
          score += 1200;
        }

        // Prioritize setting face-down to protect monster from Slifer / Wanghu destruction
        if (hasOppSlifer && atk <= 2000) {
          score += 1000;
        }
        if (hasOppWanghu && atk <= 1400) {
          score += 1000;
        }

        if (detail?.isFlip) {
          score += 450; // Flip monsters love being set
        }

        candidates.push({
          action: {
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_MONSTER_SET,
            index: i,
          },
          score,
          reason: `Set monster ${name} face-down in defense (${def} DEF)`,
          cardCode: code,
          cardName: name,
        });
      }
    }

    // 5. Evaluate Spell / Trap Sets
    if (msg.spell_sets && msg.spell_sets.length > 0) {
      for (let i = 0; i < msg.spell_sets.length; i++) {
        const sset = msg.spell_sets[i];
        const code = sset.code ?? 0;
        const name = sset.cardName || (code > 0 ? cardReader.getCardName(code) : 'Spell/Trap');
        const evalResult = evaluateSpellTrapSet(code, name, context);

        candidates.push({
          action: {
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_SPELL_SET,
            index: i,
          },
          score: evalResult.score,
          reason: evalResult.reason,
          cardCode: code,
          cardName: name,
        });
      }
    }

    // 6. Evaluate Position Changes
    if (msg.pos_changes && msg.pos_changes.length > 0) {
      for (let i = 0; i < msg.pos_changes.length; i++) {
        const pc = msg.pos_changes[i];
        const code = pc.code ?? 0;
        const name = pc.cardName || (code > 0 ? cardReader.getCardName(code) : 'Monster');
        const detail = code > 0 ? cardReader.getCardDetail(code) : null;
        const atk = detail?.isMonster ? detail.atk : 1500;

        let score = 400 + atk * 0.3 * personality.aggression;
        if (hasOppSlifer && atk <= 2000) {
          score -= 1500; // Don't Flip Summon into Slifer destruction
        }
        if (board.oppVisibleMaxAtk > atk) {
          score -= 300 * personality.defensiveness;
        }

        candidates.push({
          action: {
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_POS_CHANGE,
            index: i,
          },
          score,
          reason: `Change position / Flip Summon ${name}`,
          cardCode: code,
          cardName: name,
        });
      }
    }

    // 7. Evaluate Transition to Battle Phase
    if (msg.to_bp) {
      const hasAttackMonsters = board.aiTotalAtk > 0 && board.aiMonsterCount > 0;
      let score = 0;

      if (hasAttackMonsters) {
        const oppFaceUpAttack = oppField.monsterZones.filter(
          (m) => m && m.position === 'faceup_attack' && (m.atk ?? 0) > 0,
        );
        const oppStrongerCount = oppFaceUpAttack.filter(
          (m) => (m?.atk ?? 0) > board.aiMaxAtk,
        ).length;

        // If opponent has only stronger face-up attack monsters, do not enter BP to commit suicide
        if (oppFaceUpAttack.length > 0 && oppStrongerCount === oppFaceUpAttack.length) {
          score = -2500;
        } else {
          score = 650 + (board.aiTotalAtk - board.oppVisibleTotalAtk) * 0.2 * personality.aggression;
        }
      } else {
        score = -500; // Low score if no attack monsters
      }

      candidates.push({
        action: {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.TO_BP,
          index: null,
        },
        score,
        reason: score < 0
          ? 'Hold in Main Phase (opposing field is superior)'
          : `Enter Battle Phase with ${board.aiMonsterCount} monster(s) (${board.aiTotalAtk} total ATK)`,
      });
    }

    // 8. Evaluate Transition to End Phase / M2
    if (msg.to_ep) {
      candidates.push({
        action: {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.TO_EP,
          index: null,
        },
        score: 100, // Baseline pass
        reason: `Pass to End Phase`,
      });
    }

    if (msg.to_m2) {
      candidates.push({
        action: {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.TO_M2,
          index: null,
        },
        score: 200,
        reason: `Proceed to Main Phase 2`,
      });
    }

    return this.selectWeightedAction(candidates);
  }

  // ===========================================================================
  // SELECT_BATTLECMD
  // ===========================================================================

  private decideBattleCmd(msg: OcgMessage, context: EvaluatorContext): OcgResponse {
    const executor = getExecutorForDeck(context, context.aiDeckCards);
    const executorActions = executor.onBattleCmd ? executor.onBattleCmd(msg, context) : null;
    if (executorActions && executorActions.length > 0) {
      return this.selectWeightedAction(executorActions);
    }

    const candidates: ScoredAction[] = [];
    const { cardReader } = context;

    // 1. Evaluate Monster Attacks
    if (msg.attacks && msg.attacks.length > 0) {
      for (let i = 0; i < msg.attacks.length; i++) {
        const att = msg.attacks[i];
        const code = att.code ?? 0;
        const detail = code > 0 ? cardReader.getCardDetail(code) : null;
        const name = detail?.name || (code > 0 ? cardReader.getCardName(code) : 'Monster');
        const atk = typeof att.atk === 'number' ? att.atk : (detail?.isMonster ? detail.atk : 1500);

        const candidate: AttackCandidate = {
          attackerIndex: i,
          attackerSeq: att.sequence ?? 0,
          attackerAtk: atk,
          attackerName: name,
          attackerCode: code,
        };

        const scored = evaluateAttackOption(candidate, context);
        candidates.push(scored);
      }
    }

    // 2. Battle Step Chains
    if (msg.chains && msg.chains.length > 0) {
      for (let i = 0; i < msg.chains.length; i++) {
        const ch = msg.chains[i];
        const code = ch.code ?? 0;
        const name = ch.cardName || (code > 0 ? cardReader.getCardName(code) : 'Battle Effect');
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_BATTLECMD,
            action: SelectBattleCMDAction.SELECT_CHAIN,
            index: i,
          },
          score: 600,
          reason: `Activate battle response ${name}`,
          cardCode: code,
          cardName: name,
        });
      }
    }

    // 3. Move to M2 or End Phase
    if (msg.to_m2) {
      candidates.push({
        action: {
          type: OcgResponseType.SELECT_BATTLECMD,
          action: SelectBattleCMDAction.TO_M2,
          index: null,
        },
        score: 0,
        reason: `Finish Battle Phase and enter Main Phase 2`,
      });
    }

    if (msg.to_ep) {
      candidates.push({
        action: {
          type: OcgResponseType.SELECT_BATTLECMD,
          action: SelectBattleCMDAction.TO_EP,
          index: null,
        },
        score: 0,
        reason: `Finish Battle Phase and end turn`,
      });
    }

    return this.selectWeightedAction(candidates);
  }

  // ===========================================================================
  // SELECT_CARD & SELECT_TRIBUTE
  // ===========================================================================

  private decideSelectCard(msg: OcgMessage, context: EvaluatorContext): OcgResponse {
    const executor = getExecutorForDeck(context, context.aiDeckCards);
    const customCards = executor.onSelectCard ? executor.onSelectCard(msg, context) : null;
    if (customCards && customCards.length > 0) {
      return {
        type: OcgResponseType.SELECT_CARD,
        indicies: customCards,
      };
    }

    const minCount = Math.max(1, msg.min ?? 1);
    const { aiPlayerId, cardReader, signatureCardIds, boardState } = context;
    const oppField = boardState.userField.playerId === aiPlayerId ? boardState.opponentField : boardState.userField;

    const aiField = boardState.userField.playerId === aiPlayerId ? boardState.userField : boardState.opponentField;
    const aiLp = aiField.currentLp;

    // Score each candidate in msg.selects
    const scoredCandidates = msg.selects.map((c: any, index: number) => {
      const code = c.code ?? 0;
      const detail = code > 0 ? cardReader.getCardDetail(code) : null;
      const atk = detail?.isMonster ? detail.atk : 1000;
      const isAiCard = c.controller === aiPlayerId;

      let score = 0;
      if (isAiCard) {
        // If selecting own card to keep / protect / search: prefer signature / high ATK
        score = atk + (signatureCardIds.includes(code) ? 1000 : 0);
      } else {
        // If selecting opponent card to target / destroy / attack:
        const isBattleImmuneDef =
          (code === 23205979 || code === 31305911 || code === 11662742 || code === 37412656 || code === 78371393) &&
          (c.position === 8 || (c.position !== undefined && (c.position & 0x8) !== 0));

        // Find monster in oppField if on monster zone
        const oppMonster = (c.location === 0x4 && c.sequence !== undefined)
          ? oppField.monsterZones[c.sequence]
          : null;

        const isFaceupDefense = (c.position !== undefined && ((c.position & 0x4) !== 0 || c.position === 4)) ||
          oppMonster?.position === 'faceup_defense';
        const isFacedownDefense = (c.position !== undefined && ((c.position & 0x8) !== 0 || c.position === 8)) ||
          oppMonster?.position === 'facedown_defense';
        const isFaceupAttack = (c.position !== undefined && ((c.position & 0x1) !== 0 || c.position === 1)) ||
          oppMonster?.position === 'faceup_attack';

        const def = detail?.isMonster ? detail.def : (oppMonster?.def ?? 1000);

        if (isBattleImmuneDef) {
          score = -5000;
        } else if (isFaceupDefense) {
          // If in face-up defense: check DEF vs typical attacker ATK
          if (def >= 1800) {
            // High-DEF wall (e.g. Giant Soldier of Stone 2000 DEF, Labyrinth Wall 3000 DEF)
            // Attacking this deals self recoil damage and fails to destroy it!
            score = -12000 - def;
          } else {
            // Weaker defense wall (can be destroyed by beatsticks)
            score = 2200 - def * 0.5;
          }
        } else if (isFacedownDefense) {
          // Unknown face-down card: moderate score if healthy, heavily penalized if low LP
          score = aiLp <= 2000 ? -2000 : 900;
        } else if (isFaceupAttack) {
          // Face-up attack monster: prioritize destroying it and inflicting damage
          score = 3000 + atk;
        } else {
          score = atk + 500;
        }
      }

      return { index, score, code, name: detail?.name };
    });

    // Sort descending by score
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Pick top `minCount` indices
    const indices = scoredCandidates.slice(0, minCount).map((c) => c.index);

    return {
      type: OcgResponseType.SELECT_CARD,
      indicies: indices,
    };
  }

  private decideSelectTribute(msg: OcgMessage, context: EvaluatorContext): OcgResponse {
    const executor = getExecutorForDeck(context, context.aiDeckCards);
    const customTributes = executor.onSelectTribute ? executor.onSelectTribute(msg, context) : null;
    if (customTributes && customTributes.length > 0) {
      return {
        type: OcgResponseType.SELECT_TRIBUTE,
        indicies: customTributes,
      };
    }

    const minCount = Math.max(1, msg.min ?? 1);
    const { cardReader, boardState, aiPlayerId } = context;
    const aiField = boardState.userField.playerId === aiPlayerId ? boardState.userField : boardState.opponentField;
    const hasSnatchStealActive = aiField.spellTrapZones.some((s) => s && s.code === 45986603);

    // For tribute sacrifice: sacrifice LOWEST ATK monsters first, but PRESERVE indestructible walls
    // AND PRIORITIZE SACRIFICING STOLEN / TEMPORARY OPPONENT MONSTERS (e.g. Snatch Steal / Change of Heart)
    const scoredCandidates = msg.selects.map((c: any, index: number) => {
      const code = c.code ?? 0;
      const detail = code > 0 ? cardReader.getCardDetail(code) : null;
      const atk = detail?.isMonster ? detail.atk : 1000;
      const isIndestructibleWall =
        code === 31305911 || // Marshmallon
        code === 23205979 || // Spirit Reaper
        code === 37412656 || // Arcana Force 0 - The Fool
        code === 78371393;   // Yubel

      let sacrificePriority = 5000 - atk;
      if (isIndestructibleWall) {
        sacrificePriority -= 50000; // Never sacrifice indestructible stall wall unless forced
      }

      // If monster is stolen from opponent:
      // PRIORITIZE SACRIFICING IT to deny opponent +1000 LP and dispose of their monster!
      const isStolenMonster = (c.owner !== undefined && c.owner !== aiPlayerId) || (c.controller === aiPlayerId && c.owner !== undefined && c.owner !== aiPlayerId);
      if (isStolenMonster) {
        sacrificePriority += 100000;
      } else if (hasSnatchStealActive && c.equipped) {
        sacrificePriority += 100000;
      }

      return { index, sacrificePriority };
    });

    scoredCandidates.sort((a, b) => b.sacrificePriority - a.sacrificePriority);
    const indices = scoredCandidates.slice(0, minCount).map((c) => c.index);

    return {
      type: OcgResponseType.SELECT_TRIBUTE,
      indicies: indices,
    };
  }

  // ===========================================================================
  // SELECT_CHAIN, YESNO & EFFECTYN
  // ===========================================================================

  private decideSelectChain(msg: OcgMessage, context: EvaluatorContext): OcgResponse {
    const executor = getExecutorForDeck(context, context.aiDeckCards);
    const executorActions = executor.onSelectChain ? executor.onSelectChain(msg, context) : null;
    if (executorActions && executorActions.length > 0) {
      return this.selectWeightedAction(executorActions);
    }

    if (msg.forced && msg.selects && msg.selects.length > 0) {
      return {
        type: OcgResponseType.SELECT_CHAIN,
        index: 0,
      };
    }

    if (!msg.selects || msg.selects.length === 0) {
      return {
        type: OcgResponseType.SELECT_CHAIN,
        index: null,
      };
    }

    // Score chain opportunities
    let bestIndex: number | null = null;
    let bestScore = 0;

    for (let i = 0; i < msg.selects.length; i++) {
      const ch = msg.selects[i];
      const code = ch.code ?? 0;
      const name = ch.cardName || context.cardReader.getCardName(code);
      const evalResult = evaluateSpellActivation(code, name, context);
      if (evalResult.score > bestScore) {
        bestScore = evalResult.score;
        bestIndex = i;
      }
    }

    if (bestIndex !== null && bestScore >= 300) {
      return {
        type: OcgResponseType.SELECT_CHAIN,
        index: bestIndex,
      };
    }

    return {
      type: OcgResponseType.SELECT_CHAIN,
      index: null,
    };
  }

  private decideSelectYesNo(msg: OcgMessage, _context: EvaluatorContext): OcgResponse {
    return {
      type: (msg.type === OcgMessageType.SELECT_EFFECTYN ? OcgResponseType.SELECT_EFFECTYN : OcgResponseType.SELECT_YESNO) as any,
      yes: true,
    };
  }

  // ===========================================================================
  // SELECT_POSITION, SELECT_PLACE & SELECT_SUM
  // ===========================================================================

  private decideSelectPosition(msg: OcgMessage, context: EvaluatorContext): OcgResponse {
    const positions = ocgPositionParse(msg.positions);
    const { personality, cardReader, aiPlayerId, boardState, currentPhase } = context;

    // Check monster stats if code is provided
    const code = (msg as any).code ?? 0;
    const detail = code > 0 ? cardReader.getCardDetail(code) : null;
    const atk = detail?.isMonster ? detail.atk : 1500;
    const def = detail?.isMonster ? detail.def : 1000;

    const oppField = aiPlayerId === 0 ? boardState.opponentField : boardState.userField;
    const oppMonsters = oppField.monsterZones.filter(
      (m): m is FieldCard => !!m && (m.position === 'faceup_attack' || m.position === 'faceup_defense')
    );
    const oppMaxAtk = Math.max(0, ...oppMonsters.map((m) => m.atk ?? 0));

    // If it's AI's turn during Main Phase 1 and opponent has no monsters or weaker monsters,
    // choose Attack Position so the monster can declare direct attacks / battle attacks!
    const isAiTurn = (boardState.turnNumber % 2 !== 0 && aiPlayerId === 0) || (boardState.turnNumber % 2 === 0 && aiPlayerId === 1);
    const canAttackFreely = isAiTurn && (currentPhase === 'MAIN1' || currentPhase === 'DP' || currentPhase === 'SP') && (oppMonsters.length === 0 || atk >= oppMaxAtk);

    if (canAttackFreely && positions.includes(OcgPosition.FACEUP_ATTACK) && atk >= 1000) {
      return {
        type: OcgResponseType.SELECT_POSITION,
        position: OcgPosition.FACEUP_ATTACK,
      };
    }

    if (atk >= 1400 || personality.aggression >= 0.7) {
      if (positions.includes(OcgPosition.FACEUP_ATTACK)) {
        return {
          type: OcgResponseType.SELECT_POSITION,
          position: OcgPosition.FACEUP_ATTACK,
        };
      }
    } else if (def > atk || personality.defensiveness >= 0.7) {
      if (positions.includes(OcgPosition.FACEDOWN_DEFENSE)) {
        return {
          type: OcgResponseType.SELECT_POSITION,
          position: OcgPosition.FACEDOWN_DEFENSE,
        };
      }
      if (positions.includes(OcgPosition.FACEUP_DEFENSE)) {
        return {
          type: OcgResponseType.SELECT_POSITION,
          position: OcgPosition.FACEUP_DEFENSE,
        };
      }
    }

    return {
      type: OcgResponseType.SELECT_POSITION,
      position: positions[0] ?? OcgPosition.FACEUP_ATTACK,
    };
  }

  private decideSelectPlace(msg: OcgMessage, _context: EvaluatorContext): OcgResponse {
    const places = parseFieldMask(msg.player, msg.field_mask, msg.count);
    return {
      type: msg.type === OcgMessageType.SELECT_DISFIELD ? OcgResponseType.SELECT_DISFIELD : OcgResponseType.SELECT_PLACE,
      places,
    };
  }

  private decideSelectSum(msg: OcgMessage, _context: EvaluatorContext): OcgResponse {
    const candidates = [...(msg.selects_must || []), ...(msg.selects || [])];
    if (candidates.length === 0) {
      return {
        type: OcgResponseType.SELECT_SUM,
        indicies: [],
      };
    }

    const targetSum = msg.amount ?? 0;
    const minCount = Math.max(1, msg.min || 1);
    const maxCount = msg.max && msg.max > 0 ? msg.max : candidates.length;
    const isEqualMode = msg.select_max === 0;

    const getCardValues = (c: any): number[] => {
      const rawAmt = c.amount ?? 0;
      const v1 = rawAmt & 0xffff;
      const v2 = (rawAmt >> 16) & 0xffff;
      const values: number[] = [];
      if (v1 > 0) values.push(v1);
      if (v2 > 0 && v2 !== v1) values.push(v2);
      if (values.length === 0) values.push(1);
      return values;
    };

    let bestIndices: number[] | null = null;
    let bestSum = Infinity;

    const search = (idx: number, currentIndices: number[], currentSum: number) => {
      if (currentIndices.length >= minCount && currentIndices.length <= maxCount) {
        if (isEqualMode && currentSum === targetSum) {
          bestIndices = [...currentIndices];
          return true;
        } else if (!isEqualMode && currentSum >= targetSum) {
          if (currentSum < bestSum) {
            bestSum = currentSum;
            bestIndices = [...currentIndices];
          }
          return;
        }
      }

      if (idx >= candidates.length || currentIndices.length >= maxCount) return;

      const vals = getCardValues(candidates[idx]);
      for (const v of vals) {
        currentIndices.push(idx);
        const foundExact = search(idx + 1, currentIndices, currentSum + v);
        currentIndices.pop();
        if (foundExact) return true;
      }

      const found = search(idx + 1, currentIndices, currentSum);
      if (found) return true;

      return false;
    };

    search(0, [], 0);

    const indicies = bestIndices ?? Array.from({ length: Math.min(minCount, candidates.length) }, (_, i) => i);
    return {
      type: OcgResponseType.SELECT_SUM,
      indicies,
    };
  }

  // ===========================================================================
  // Weighted Random Selection (Non-Deterministic Softmax)
  // ===========================================================================

  private selectWeightedAction(candidates: ScoredAction[]): OcgResponse {
    if (candidates.length === 0) {
      return {
        type: OcgResponseType.SELECT_CHAIN,
        index: null,
      };
    }

    if (candidates.length === 1) {
      return candidates[0].action;
    }

    const maxScore = Math.max(...candidates.map((c) => c.score));

    // When neutral/positive actions (score >= 0) exist, prune heavily negative futile/suicidal actions (< -100)
    let eligibleCandidates = candidates;
    if (maxScore >= 0) {
      const filtered = candidates.filter((c) => c.score >= -100);
      if (filtered.length > 0) {
        eligibleCandidates = filtered;
      }
    }

    if (eligibleCandidates.length === 1) {
      return eligibleCandidates[0].action;
    }

    // Softmax temperature (higher = more uniform, lower = more deterministic)
    const temperature = 250;
    const eligibleMaxScore = Math.max(...eligibleCandidates.map((c) => c.score));

    // Exponentiate shifted scores to prevent numerical overflow
    const expScores = eligibleCandidates.map((c) => Math.exp((c.score - eligibleMaxScore) / (temperature / 100)));
    const sumExp = expScores.reduce((sum, val) => sum + val, 0);

    // Sample from categorical distribution
    let randomSample = Math.random() * sumExp;
    for (let i = 0; i < eligibleCandidates.length; i++) {
      randomSample -= expScores[i];
      if (randomSample <= 0) {
        return eligibleCandidates[i].action;
      }
    }

    return eligibleCandidates[0].action;
  }
}

export const aiController = new AIController();
