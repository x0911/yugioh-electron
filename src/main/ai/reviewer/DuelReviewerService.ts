import { GoogleGenAI } from '@google/genai';
import { tacticalMemory, type BlunderEntry, type TacticalMemoryStore } from './tacticalMemory.js';
import type { DuelBoardState } from '../../../shared/types/field.js';

export interface TacticalReviewReport {
  id: string;
  duelTimestamp: string;
  tacticalGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  gradeScore: number; // 0 - 100
  summary: string;
  blunders: BlunderEntry[];
  bestMoves: string[];
  learnedLessons: string[];
  coachCommentary: string;
  aiOpponentName?: string;
  matchResult: 'VICTORY' | 'DEFEAT' | 'DRAW';
}

export class DuelReviewerService {
  private memoryStore: TacticalMemoryStore;

  constructor(memoryStore: TacticalMemoryStore = tacticalMemory) {
    this.memoryStore = memoryStore;
  }

  /**
   * Performs automated post-match retrospective analysis on a completed duel log.
   */
  public async reviewDuel(
    logMarkdown: string,
    finalBoard?: DuelBoardState | null,
    aiPlayerId: number = 1,
    opponentName = 'Opponent',
  ): Promise<TacticalReviewReport> {
    const blunders: BlunderEntry[] = [];
    const bestMoves: string[] = [];
    const learnedLessons: string[] = [];

    const lines = logMarkdown.split('\n');
    let currentTurn = 1;
    let turnPlayer = 0;
    let aiHandCount = 5;
    let oppHandCount = 5;
    let lastSummonedMonster: { name: string; atk: number; turn: number } | null = null;
    let battleDeclaredThisPhase = false;
    let inAiBattlePhase = false;
    let aiReadyAttackersCount = 0;

    // Scan event stream
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track Turn
      const turnMatch = line.match(/\[NEW_TURN\] Turn (\d+) begins\. Active player: Player (\d+)/);
      if (turnMatch) {
        currentTurn = parseInt(turnMatch[1], 10);
        turnPlayer = parseInt(turnMatch[2], 10);
        inAiBattlePhase = false;
        battleDeclaredThisPhase = false;
        continue;
      }

      // Track Hand Counts
      if (line.includes('[DRAW] Player 1 drew')) {
        const drawMatch = line.match(/drew (\d+) card/);
        const count = drawMatch ? parseInt(drawMatch[1], 10) : 1;
        if (aiPlayerId === 1) aiHandCount += count;
        else oppHandCount += count;
      } else if (line.includes('[DRAW] Player 0 drew')) {
        const drawMatch = line.match(/drew (\d+) card/);
        const count = drawMatch ? parseInt(drawMatch[1], 10) : 1;
        if (aiPlayerId === 0) aiHandCount += count;
        else oppHandCount += count;
      }

      // Track Phase
      if (line.includes('[NEW_PHASE] Phase changed to BATTLE_START') && turnPlayer === aiPlayerId) {
        inAiBattlePhase = true;
        battleDeclaredThisPhase = false;
        aiReadyAttackersCount = (lastSummonedMonster && lastSummonedMonster.turn === currentTurn ? 1 : 2);
      }

      if (inAiBattlePhase && line.includes('[NEW_PHASE] Phase changed to MAIN2')) {
        inAiBattlePhase = false;
        if (!battleDeclaredThisPhase && aiReadyAttackersCount >= 2 && currentTurn >= 4) {
          const blunder: Omit<BlunderEntry, 'id' | 'timestamp'> = {
            turn: currentTurn,
            type: 'PASSIVE_PHASE_SKIP',
            cardName: 'Battle Phase',
            description: `AI entered Battle Phase with superior monster presence but passed without declaring any attack.`,
            remedy: `Proactively declare attacks on opponent monsters or face-down defense cards when holding board advantage.`,
          };
          blunders.push({ ...blunder, id: `blunder-${Date.now()}-${blunders.length}`, timestamp: new Date().toISOString() });
          this.memoryStore.recordBlunder(blunder);
        }
      }

      // Track Attacks & Suicides
      if (line.includes('[ATTACK] Player 1\'s monster declared an attack') || line.includes('[ATTACK] Player 0\'s monster declared an attack')) {
        const isAiAttack = (line.includes(`Player ${aiPlayerId}`));
        if (isAiAttack) {
          battleDeclaredThisPhase = true;
          // Check subsequent battle clash lines
          for (let j = i + 1; j < Math.min(lines.length, i + 20); j++) {
            const clashLine = lines[j];
            const match = clashLine.match(/\[BATTLE\] Battle clash: Attacker \(ATK (\d+)\) vs Defender \(ATK (\d+)\)/);
            if (match) {
              const attackerAtk = parseInt(match[1], 10);
              const defenderAtk = parseInt(match[2], 10);
              if (attackerAtk < defenderAtk && defenderAtk > 0) {
                const selfDmg = defenderAtk - attackerAtk;
                const blunder: Omit<BlunderEntry, 'id' | 'timestamp'> = {
                  turn: currentTurn,
                  type: 'SUICIDAL_ATTACK',
                  cardName: lastSummonedMonster?.name || 'Attacking Monster',
                  description: `AI declared a suicidal attack with ${attackerAtk} ATK into a ${defenderAtk} ATK defender, suffering ${selfDmg} self-damage.`,
                  remedy: `Strictly avoid declaring attacks when attacker ATK is lower than target defender ATK.`,
                  damagePenalty: selfDmg,
                };
                blunders.push({ ...blunder, id: `blunder-${Date.now()}-${blunders.length}`, timestamp: new Date().toISOString() });
                this.memoryStore.recordBlunder(blunder);
              }
              break;
            }
          }
        }
      }

      // Track Card Destruction Advantage Leaks
      if (line.includes(`Player ${aiPlayerId} activated effect of Card Destruction`)) {
        let drawnByAi = 0;
        let drawnByOpp = 0;
        for (let j = i + 1; j < Math.min(lines.length, i + 10); j++) {
          const drawLine = lines[j];
          if (drawLine.includes(`[DRAW] Player ${aiPlayerId} drew`)) {
            const m = drawLine.match(/drew (\d+) card/);
            if (m) drawnByAi = parseInt(m[1], 10);
          } else if (drawLine.includes(`[DRAW] Player ${1 - aiPlayerId} drew`) || drawLine.includes(`[DRAW] Player ${aiPlayerId === 0 ? 1 : 0} drew`)) {
            const m = drawLine.match(/drew (\d+) card/);
            if (m) drawnByOpp = parseInt(m[1], 10);
          }
          if (drawLine.includes('[CHAIN_SOLVED]')) break;
        }

        if ((drawnByAi <= 2 && drawnByOpp >= 3) || (aiHandCount <= 2 && oppHandCount >= 3)) {
          const blunder: Omit<BlunderEntry, 'id' | 'timestamp'> = {
            turn: currentTurn,
            type: 'CARD_ADVANTAGE_LEAK',
            cardName: 'Card Destruction',
            description: `Activated Card Destruction with only ${drawnByAi || aiHandCount} card(s) while opponent held/drew ${drawnByOpp || oppHandCount} cards, gifting opponent card advantage.`,
            remedy: `Hold Card Destruction when opponent has more cards in hand than AI.`,
          };
          blunders.push({ ...blunder, id: `blunder-${Date.now()}-${blunders.length}`, timestamp: new Date().toISOString() });
          this.memoryStore.recordBlunder(blunder);
        }
      }

      // Track Normal Summons
      const summonMatch = line.match(/Player (\d+) is Normal Summoning (.+)/);
      if (summonMatch) {
        const p = parseInt(summonMatch[1], 10);
        const name = summonMatch[2].trim();
        if (p === aiPlayerId) {
          lastSummonedMonster = { name, atk: 1500, turn: currentTurn };
        }
      }

      // Track Best Moves
      if (line.includes(`Player ${aiPlayerId} activated effect of Raigeki`) || line.includes(`Player ${aiPlayerId} activated effect of Dark Hole`)) {
        bestMoves.push(`Turn ${currentTurn}: Timely board clear activation to reset opponent monster presence.`);
      }
      if (line.includes(`Player ${aiPlayerId} activated effect of Power Bond`)) {
        bestMoves.push(`Turn ${currentTurn}: Power Bond fusion summon doubling ATK for lethal pressure.`);
      }
    }

    // Determine Grade & Score
    let gradeScore = 100;
    for (const b of blunders) {
      if (b.type === 'SUICIDAL_ATTACK') gradeScore -= 35;
      else if (b.type === 'CARD_ADVANTAGE_LEAK') gradeScore -= 20;
      else if (b.type === 'PASSIVE_PHASE_SKIP') gradeScore -= 15;
      else gradeScore -= 10;
    }
    gradeScore = Math.max(10, Math.min(100, gradeScore));

    let tacticalGrade: TacticalReviewReport['tacticalGrade'] = 'A+';
    if (gradeScore >= 95) tacticalGrade = 'A+';
    else if (gradeScore >= 85) tacticalGrade = 'A';
    else if (gradeScore >= 70) tacticalGrade = 'B';
    else if (gradeScore >= 55) tacticalGrade = 'C';
    else if (gradeScore >= 40) tacticalGrade = 'D';
    else tacticalGrade = 'F';

    // Lessons learned
    for (const b of blunders) {
      if (!learnedLessons.includes(b.remedy)) {
        learnedLessons.push(b.remedy);
      }
    }

    // Determine match result
    const isAiWinner = finalBoard?.winner === aiPlayerId;
    const matchResult: TacticalReviewReport['matchResult'] = finalBoard?.winner === null ? 'DRAW' : isAiWinner ? 'VICTORY' : 'DEFEAT';

    // Generate Commentary (LLM or deterministic)
    const coachCommentary = await this.generateCoachCommentary(
      tacticalGrade,
      blunders,
      bestMoves,
      learnedLessons,
      matchResult,
      opponentName,
    );

    this.memoryStore.incrementDuelsReviewed();

    return {
      id: `review-${Date.now()}`,
      duelTimestamp: new Date().toLocaleTimeString(),
      tacticalGrade,
      gradeScore,
      summary: `Duel evaluated with ${blunders.length} tactical blunder(s) and ${bestMoves.length} strong decision(s). Grade: ${tacticalGrade} (${gradeScore}/100).`,
      blunders,
      bestMoves,
      learnedLessons,
      coachCommentary,
      aiOpponentName: opponentName,
      matchResult,
    };
  }

  private async generateCoachCommentary(
    grade: string,
    blunders: BlunderEntry[],
    bestMoves: string[],
    lessons: string[],
    result: string,
    oppName: string,
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are an elite Yu-Gi-Oh! Grandmaster Coach analyzing a completed duel.
Opponent: ${oppName}
Outcome: ${result}
Grade: ${grade}
Detected Blunders: ${blunders.map((b) => `${b.type} on Turn ${b.turn}: ${b.description}`).join('; ') || 'None!'}
Key Good Moves: ${bestMoves.join('; ') || 'Solid fundamentals'}
Key Lessons: ${lessons.join('; ') || 'Maintain current discipline'}

Provide a 2-3 sentence charismatic, sharp anime-style tactical review analyzing the match mistakes and self-improvement advice.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response && response.text) {
          return response.text.trim();
        }
      } catch {
        // Fallback to deterministic commentary if API call fails
      }
    }

    // High quality deterministic coaching fallback
    if (grade === 'A+' || grade === 'A') {
      return `Outstanding tactical execution against ${oppName}! Card advantage was preserved cleanly, removal spells were timed well, and attack declarations were decisive.`;
    }
    if (grade === 'B') {
      return `A respectable duel, but minor timing inefficiencies were detected. Ensure quick-play and draw cards are sequenced before combat declarations.`;
    }
    if (grade === 'C' || grade === 'D') {
      return `Tactical discipline broke down under pressure. Avoid attacking into unknown or superior defenders without backrow support.`;
    }
    return `Critical tactical failure: Suicidal combat declarations and resource leaks handed victory to ${oppName}. Self-correction rules have been logged into memory to strictly avoid these mistakes in subsequent duels.`;
  }
}

export const duelReviewer = new DuelReviewerService();
