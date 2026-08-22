import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  SelectBattleCMDAction,
  type OcgMessage,
} from 'ocgcore-wasm';
import type { DeckExecutor } from './types.js';
import type { EvaluatorContext, ScoredAction } from '../types.js';
import type { PlayerFieldState, FieldCard } from '../../../shared/types/field.js';
import { evaluateAttackOption, type AttackCandidate } from '../evaluators/combatEvaluator.js';

/**
 * Universal Competitive AI Executor.
 * Provides tournament-level heuristics for ANY deck in the game.
 */
export class DefaultExecutor implements DeckExecutor {
  public readonly id = 'default-universal';
  public readonly name = 'Universal Competitive Executor';
  public readonly description = 'High-level competitive heuristics for general Yu-Gi-Oh! play.';

  public isApplicable(_context: EvaluatorContext, _deckCards: number[]): boolean {
    return true; // Universal fallback
  }

  public onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const candidates: ScoredAction[] = [];
    const { cardReader, personality, signatureCardIds } = context;
    const oppField = context.aiPlayerId === 0 ? context.boardState.opponentField : context.boardState.userField;
    const aiField = context.aiPlayerId === 0 ? context.boardState.userField : context.boardState.opponentField;

    const oppMonsters = oppField.monsterZones.filter((m): m is FieldCard => !!m);
    const oppFaceUpMonsters = oppMonsters.filter((m) => m.position === 'faceup_attack' || m.position === 'faceup_defense');
    const oppBackrow = oppField.spellTrapZones.filter(Boolean);
    const hasOppSlifer = oppFaceUpMonsters.some((m) => m.code === 10000020);
    const hasOppWanghu = oppFaceUpMonsters.some((m) => m.code === 83986578);

    const cardAdvWeight = personality?.cardAdvantageWeight ?? 1.0;
    const comboFocus = personality?.comboFocus ?? 0.7;
    const sigFavoritism = personality?.signatureFavoritism ?? 0.8;
    const defensiveness = personality?.defensiveness ?? 0.5;
    const aggression = personality?.aggression ?? 0.65;

    // =========================================================================
    // 1. EVALUATE ACTIVATIONS (Draw power -> Board wipes -> Search -> Fusion/GY -> Extenders)
    // =========================================================================
    if (msg.activates && msg.activates.length > 0) {
      for (let i = 0; i < msg.activates.length; i++) {
        const act = msg.activates[i];
        const code = act.code ?? 0;
        const name = act.cardName || (code > 0 ? cardReader.getCardName(code) : 'Effect');
        const detail = code > 0 ? cardReader.getCardDetail(code) : null;
        let score = 500;
        let reason = `Activate ${name}`;

        // 1.1 Draw Power (Pot of Greed, Graceful Charity, Upstart, Allure, Trade-In, Cards of Consonance)
        if (
          code === 55144522 || // Pot of Greed
          code === 79571449 || // Graceful Charity
          code === 70368879 || // Upstart Goblin
          code === 1475311 ||  // Allure of Darkness
          code === 38120068 || // Trade-In
          code === 39701395    // Cards of Consonance
        ) {
          score = 3000 * cardAdvWeight;
          reason = `[PRIORITY DRAW] Activate draw accelerator ${name} (+card advantage)`;
        }
        // 1.2 Backrow Wipes (Harpie's Feather Duster, Heavy Storm, Mystical Space Typhoon)
        else if (code === 18144506 || code === 19613556 || code === 5318639) {
          if (oppBackrow.length === 0) {
            score = -1000;
            reason = `Hold ${name} (opponent has no backrow cards)`;
          } else {
            score = 2200 + oppBackrow.length * 500;
            reason = `[CLEAR BACKROW] Activate ${name} before summoning monsters into backrow`;
          }
        }
        // 1.3 Monster Board Wipes (Raigeki, Dark Hole, Lightning Vortex)
        else if (code === 12580477 || code === 53129443 || code === 63590062) {
          if (oppMonsters.length === 0) {
            score = -1200;
            reason = `Hold ${name} (opponent has no monsters)`;
          } else {
            const aiMonsterCount = aiField.monsterZones.filter(Boolean).length;
            if (code === 53129443 && aiMonsterCount > oppMonsters.length) {
              score = -800; // Don't wipe own board if we are ahead
              reason = `Hold Dark Hole (AI has superior field ${aiMonsterCount} vs ${oppMonsters.length})`;
            } else {
              score = 2500 + oppMonsters.length * 400;
              reason = `[CLEAR FIELD] Activate ${name} to wipe opponent monsters`;
            }
          }
        }
        // 1.4 Searchers & Deck Thinners (Reinforcement of the Army, E - Emergency Call, Terraforming, Sangan)
        else if (code === 32807846 || code === 75043725 || code === 73628505) {
          score = 2000 * comboFocus;
          reason = `[SEARCH] Activate search card ${name} to fetch combo pieces`;
        }
        // 1.5 Special Summons & Graveyard Revivals (Monster Reborn, Premature Burial, Call of the Haunted)
        else if (code === 83764719 || code === 70828912 || code === 97077563) {
          const hasSurvivingGraveTarget = [...aiField.graveyard, ...oppField.graveyard].some(
            (c) => c && c.atk && c.atk > 2000,
          );
          if (hasOppSlifer && !hasSurvivingGraveTarget) {
            score = -2000;
            reason = `Hold ${name} (opponent has active Slifer that would instantly destroy revived monster)`;
          } else {
            const powerfulGraveTarget = [...aiField.graveyard, ...oppField.graveyard].some(
              (c) => c && c.atk && c.atk >= 1800,
            );
            score = powerfulGraveTarget ? 1900 : 800;
            reason = `Activate ${name} to revive monster from GY`;
          }
        }
        // 1.6 Fusion & Ritual Spells (Polymerization, Power Bond, Miracle Fusion, Black Luster Ritual)
        else if (code === 24094653 || code === 37630732 || code === 45906428 || code === 55761792) {
          score = 2100 * comboFocus;
          reason = `[FUSION/RITUAL] Activate ${name} for boss monster summon`;
        }
        // 1.7 Signature Cards
        else if (signatureCardIds.includes(code)) {
          score = 1200 * sigFavoritism;
          reason = `Activate signature effect ${name}`;
        }

        candidates.push({
          action: {
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_ACTIVATE,
            index: i,
          },
          score,
          reason,
          cardCode: code,
          cardName: name,
        });
      }
    }

    // =========================================================================
    // 2. EVALUATE NORMAL SUMMONS
    // =========================================================================
    if (msg.summons && msg.summons.length > 0) {
      for (let i = 0; i < msg.summons.length; i++) {
        const sum = msg.summons[i];
        const code = sum.code ?? 0;
        const detail = code > 0 ? cardReader.getCardDetail(code) : null;
        const atk = detail?.atk ?? 1200;
        const level = detail?.level ?? 4;
        const name = detail?.name || (code > 0 ? cardReader.getCardName(code) : 'Monster');

        // Slifer Floodgate check: don't summon low-ATK into active Slifer
        if (hasOppSlifer && atk <= 2000) {
          candidates.push({
            action: {
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.SELECT_SUMMON,
              index: i,
            },
            score: -4000,
            reason: `[AVOID] Do not Normal Summon ${name} (${atk} ATK) into Slifer's 2000 ATK debuff`,
            cardCode: code,
            cardName: name,
          });
          continue;
        }

        // Avoid summoning weak monsters in Attack Position into opponent's high-ATK boss monsters
        const oppMaxAtk = Math.max(
          0,
          ...oppField.monsterZones
            .filter((m) => !!m && (m.position === 'faceup_attack' || m.position === 'faceup_defense'))
            .map((m) => m?.atk ?? 0),
        );
        if (oppMaxAtk >= 1900 && atk < oppMaxAtk && atk <= 1600) {
          candidates.push({
            action: {
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.SELECT_SUMMON,
              index: i,
            },
            score: -3500,
            reason: `[AVOID] Avoid Normal Summoning weak ${name} (${atk} ATK) in Attack Position into opponent's superior ${oppMaxAtk} ATK boss monster`,
            cardCode: code,
            cardName: name,
          });
          continue;
        }

        let score = atk * 0.7;
        if (level > 4) {
          score += 400; // Tribute boss monster bonus
        }
        if (signatureCardIds.includes(code)) {
          score += 800 * sigFavoritism;
        }

        candidates.push({
          action: {
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_SUMMON,
            index: i,
          },
          score,
          reason: `Normal Summon ${name} (${atk} ATK, Lv${level})`,
          cardCode: code,
          cardName: name,
        });
      }
    }

    // =========================================================================
    // 3. EVALUATE MONSTER SETS
    // =========================================================================
    if (msg.monster_sets && msg.monster_sets.length > 0) {
      const oppMaxAtk = Math.max(
        0,
        ...oppField.monsterZones
          .filter((m) => !!m && (m.position === 'faceup_attack' || m.position === 'faceup_defense'))
          .map((m) => m?.atk ?? 0),
      );

      for (let i = 0; i < msg.monster_sets.length; i++) {
        const set = msg.monster_sets[i];
        const code = set.code ?? 0;
        const detail = code > 0 ? cardReader.getCardDetail(code) : null;
        const def = detail?.def ?? 1000;
        const atk = detail?.atk ?? 1000;
        const name = detail?.name || (code > 0 ? cardReader.getCardName(code) : 'Monster');

        let score = def * 0.5 * (defensiveness + 0.3);
        if (hasOppSlifer && atk <= 2000) {
          score += 1500; // Prefer setting when Slifer is face-up
        }
        if (oppMaxAtk >= 1900 && atk < oppMaxAtk) {
          score += 1200; // Prefer setting defensively when opponent controls a boss monster
        }

        candidates.push({
          action: {
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_MONSTER_SET,
            index: i,
          },
          score,
          reason: `Set monster ${name} in Defense Position (${def} DEF)`,
          cardCode: code,
          cardName: name,
        });
      }
    }

    // =========================================================================
    // 4. EVALUATE SPELL / TRAP SETS
    // =========================================================================
    if (msg.sp_sets && msg.sp_sets.length > 0) {
      const currentBackrow = aiField.spellTrapZones.filter(Boolean).length;
      for (let i = 0; i < msg.sp_sets.length; i++) {
        const s = msg.sp_sets[i];
        const code = s.code ?? 0;
        const detail = code > 0 ? cardReader.getCardDetail(code) : null;
        const name = detail?.name || (code > 0 ? cardReader.getCardName(code) : 'Card');
        const isTrap = detail?.isTrap ?? name.includes('Trap');
        const isQuickPlay = detail?.isQuickPlay ?? name.includes('Quick-Play');

        let score = currentBackrow >= 4 ? -300 : (isTrap || isQuickPlay ? 400 + (3 - currentBackrow) * 100 : 100);

        candidates.push({
          action: {
            type: OcgResponseType.SELECT_IDLECMD,
            action: SelectIdleCMDAction.SELECT_SPELL_SET,
            index: i,
          },
          score,
          reason: `Set ${isTrap ? 'Trap' : isQuickPlay ? 'Quick-Play' : 'Spell'} ${name}`,
          cardCode: code,
          cardName: name,
        });
      }
    }

    // =========================================================================
    // 5. PHASE TRANSITIONS (Battle Phase / End Phase)
    // =========================================================================
    if (msg.to_bp) {
      const aiAttackers = aiField.monsterZones.filter(
        (m) => !!m && m.position === 'faceup_attack' && (m.atk ?? 0) > 0,
      );
      const aiMaxAtk = Math.max(0, ...aiAttackers.map((m) => m?.atk ?? 0));
      const oppFaceUpAttack = oppField.monsterZones.filter(
        (m) => !!m && m.position === 'faceup_attack' && (m.atk ?? 0) > 0,
      );
      const oppStrongerCount = oppFaceUpAttack.filter((m) => (m?.atk ?? 0) > aiMaxAtk).length;

      let bpScore = 0;
      if (aiAttackers.length === 0) {
        bpScore = -500;
      } else if (oppFaceUpAttack.length > 0 && oppStrongerCount === oppFaceUpAttack.length) {
        // Opponent has only stronger face-up attack monsters; entering BP would lead to suicide
        bpScore = -2500;
      } else {
        bpScore = 350 + aiAttackers.length * 150;
      }

      candidates.push({
        action: {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.TO_BP,
        },
        score: bpScore,
        reason: bpScore < 0 ? 'Hold in Main Phase (opposing field is superior)' : `Advance to Battle Phase (${aiAttackers.length} ready attackers)`,
      });
    }

    if (msg.to_ep) {
      candidates.push({
        action: {
          type: OcgResponseType.SELECT_IDLECMD,
          action: SelectIdleCMDAction.TO_EP,
        },
        score: 0,
        reason: 'End turn (no further productive Main Phase actions)',
      });
    }

    return candidates.length > 0 ? candidates : null;
  }

  public onBattleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    const candidates: ScoredAction[] = [];
    const { cardReader } = context;
    const oppField = context.aiPlayerId === 0 ? context.boardState.opponentField : context.boardState.userField;
    const aiField = context.aiPlayerId === 0 ? context.boardState.userField : context.boardState.opponentField;
    const oppLp = oppField.currentLp;

    // Check on-board total attack power for lethal calculation
    const readyAttackers = (msg.attacks || []).map((att: any, i: number) => {
      const code = att.code ?? 0;
      const detail = code > 0 ? cardReader.getCardDetail(code) : null;
      const name = detail?.name || (code > 0 ? cardReader.getCardName(code) : 'Monster');
      const atk = typeof att.atk === 'number' ? att.atk : (detail?.isMonster ? detail.atk : 1500);
      return { index: i, seq: att.sequence ?? 0, atk, name, code };
    });

    const oppMonsters = oppField.monsterZones.filter((m): m is FieldCard => !!m);

    // Direct Attack Lethal Push
    if (oppMonsters.length === 0 && readyAttackers.length > 0) {
      const totalDirectAtk = readyAttackers.reduce((acc, a) => acc + a.atk, 0);
      for (const att of readyAttackers) {
        const isLethalAttacker = att.atk >= oppLp || totalDirectAtk >= oppLp;
        const score = att.atk * 1.5 + (isLethalAttacker ? 15000 : 1000);
        candidates.push({
          action: {
            type: OcgResponseType.SELECT_BATTLECMD,
            action: SelectBattleCMDAction.SELECT_BATTLE,
            index: att.index,
          },
          score,
          reason: isLethalAttacker
            ? `[LETHAL] Direct attack with ${att.name} (${att.atk} ATK) for game!`
            : `Direct attack with ${att.name} (${att.atk} ATK)`,
          cardCode: att.code,
          cardName: att.name,
        });
      }
    } else if (msg.attacks && msg.attacks.length > 0) {
      // Monster combat evaluation
      for (const att of readyAttackers) {
        const candidate: AttackCandidate = {
          attackerIndex: att.index,
          attackerSeq: att.seq,
          attackerAtk: att.atk,
          attackerName: att.name,
          attackerCode: att.code,
        };
        candidates.push(evaluateAttackOption(candidate, context));
      }
    }

    if (msg.to_m2) {
      candidates.push({
        action: {
          type: OcgResponseType.SELECT_BATTLECMD,
          action: SelectBattleCMDAction.TO_M2,
        },
        score: 0,
        reason: 'Proceed to Main Phase 2',
      });
    }

    if (msg.to_ep) {
      candidates.push({
        action: {
          type: OcgResponseType.SELECT_BATTLECMD,
          action: SelectBattleCMDAction.TO_EP,
        },
        score: 0,
        reason: 'Proceed to End Phase',
      });
    }

    return candidates.length > 0 ? candidates : null;
  }

  public onSelectChain(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
    if (!msg.chains || msg.chains.length === 0) return null;
    const candidates: ScoredAction[] = [];
    const { cardReader, personality, boardState } = context;
    const defensiveness = personality?.defensiveness ?? 0.5;
    const isBattlePhase = boardState.currentPhase === 'BP' || boardState.currentPhase === 'BATTLE_START' || boardState.currentPhase === 'BATTLE_STEP';

    for (let i = 0; i < msg.chains.length; i++) {
      const c = msg.chains[i];
      const code = c.code ?? 0;
      const detail = code > 0 ? cardReader.getCardDetail(code) : null;
      const name = detail?.name || (code > 0 ? cardReader.getCardName(code) : 'Chain Trigger');

      let score = 400;
      let reason = `Chain effect of ${name}`;

      // Quick-play stat modifiers (Shrink: 55713623, Rush Recklessly: 70046172)
      if (code === 55713623 || code === 70046172 || name.includes('Shrink') || name.includes('Rush Recklessly')) {
        if (!isBattlePhase) {
          score = -3000;
          reason = `[HOLD] Hold ${name} for battle damage calculation (do not waste on phase exit)`;
        } else {
          score = 1200;
          reason = `[COMBAT] Activate ${name} during battle clash`;
        }
      }
      // Limiter Removal (2317163)
      else if (code === 2317163 || name.includes('Limiter Removal')) {
        if (!isBattlePhase) {
          score = -4000;
          reason = `[HOLD] Hold Limiter Removal for Battle Phase to avoid destroying machines at End Phase`;
        } else {
          score = 2500;
          reason = `[COMBAT] Activate Limiter Removal in Battle Phase`;
        }
      }
      // Counter Traps & Omni-negates (Solemn Judgment, Solemn Strike, Dark Bribe, Magic Jammer)
      else if (code === 41420027 || code === 84749824 || code === 77414722 || code === 77414722) {
        score = 2500 * defensiveness;
        reason = `[COUNTER NEGATE] Activate counter trap ${name} to negate opponent action`;
      }
      // Mass Removal Battle Traps (Mirror Force, Torrential Tribute, Dimensional Prison)
      else if (code === 44095762 || code === 53582587 || code === 29401950) {
        score = 2200;
        reason = `[BATTLE TRAP] Activate ${name} to punish attacking monsters`;
      }
      // Draw / Search quick triggers
      else if (code === 55144522 || code === 79571449) {
        score = 3000;
        reason = `[CHAIN DRAW] Resolve draw power ${name}`;
      }

      candidates.push({
        action: {
          type: OcgResponseType.SELECT_CHAIN,
          index: i,
        },
        score,
        reason,
        cardCode: code,
        cardName: name,
      });
    }

    // Pass priority option (default safely to 800 when no critical chain triggers exist)
    if (!msg.forced) {
      candidates.push({
        action: {
          type: OcgResponseType.SELECT_CHAIN,
          index: null,
        },
        score: 800,
        reason: 'Pass chain priority (save resources)',
      });
    }

    return candidates.length > 0 ? candidates : null;
  }

  public onSelectTribute(msg: OcgMessage, context: EvaluatorContext): number[] | null {
    if (!msg.selects || msg.selects.length === 0) return null;
    const { cardReader } = context;
    const minCount = msg.min ?? 1;

    // Score tribute candidates: lowest value monsters / tokens are best tribute fodder
    const scored = msg.selects.map((c: any, index: number) => {
      const code = c.code ?? 0;
      const detail = code > 0 ? cardReader.getCardDetail(code) : null;
      const atk = detail?.atk ?? 1000;
      const isToken = detail?.type ? (detail.type & 0x4000) !== 0 : false;

      let score = -atk; // Higher ATK = worse tribute choice
      if (isToken) score += 5000; // Tokens are ideal tributes
      if (code === 11662742) score += 2000; // Gellenduo counts as 2 tributes for LIGHT Fairy

      return { index, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, minCount).map((s) => s.index);
  }
}
