import { GoogleGenAI, Type } from '@google/genai';
import {
  OcgMessageType,
  OcgResponseType,
  SelectIdleCMDAction,
  SelectBattleCMDAction,
  type OcgMessage,
  type OcgResponse,
} from 'ocgcore-wasm';
import type { EvaluatorContext, ScoredAction } from './types.js';
import { getAiAndOpponentFields } from './types.js';

export interface GeminiDecisionResult {
  response: OcgResponse;
  dialogue?: string;
  reasoning?: string;
}

export class GeminiDuelService {
  private ai: GoogleGenAI | null = null;
  private modelName = 'gemini-3.6-flash';
  private timeoutMs = 10000;

  constructor() {
    this.initClient();
  }

  private initClient(): void {
    try {
      const apiKey = process.env.GEMINI_API_KEY || 'AQ.00000000000000000000000000000000000000000000000000';
      if (apiKey) {
        this.ai = new GoogleGenAI({ apiKey });
      }
    } catch (err) {
      console.warn('[GeminiDuelService] Failed to initialize GoogleGenAI client:', err);
    }
  }

  public isAvailable(): boolean {
    return this.ai !== null;
  }

  /**
   * Decide the AI's response using Gemini LLM reasoning.
   * Returns null on timeout or error to allow instant fallback to the heuristic engine.
   */
  public async decideResponse(
    msg: OcgMessage,
    context: EvaluatorContext,
    candidateActions?: ScoredAction[] | null,
  ): Promise<GeminiDecisionResult | null> {
    if (!this.ai) {
      return null;
    }

    try {
      const promptData = this.buildPrompt(msg, context, candidateActions);
      if (!promptData) {
        return null;
      }

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), this.timeoutMs),
      );

      const decisionPromise = this.callGeminiApi(promptData, context);

      const result = await Promise.race([decisionPromise, timeoutPromise]);
      return result;
    } catch (err) {
      console.warn('[GeminiDuelService] Gemini API call error:', err);
      return null;
    }
  }

  private buildPrompt(
    msg: OcgMessage,
    context: EvaluatorContext,
    candidateActions?: ScoredAction[] | null,
  ): { systemInstruction: string; userPrompt: string; choices: { index: number; actionObj: any; description: string }[] } | null {
    const { personality, currentPhase, currentTurn, cardReader } = context;
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const characterName = personality.name || 'Duelist';
    const systemInstruction = `You are playing a high-stakes Yu-Gi-Oh! duel as ${characterName}.
Your objective is to play strategically to win while maintaining your authentic persona and character flair.
Analyze the current board state, evaluate the legal choices available, and select the single best option.
Always return valid JSON matching the requested schema.`;

    const aiMonsters = aiField.monsterZones
      .filter(Boolean)
      .map((m) => `${m!.name} (${m!.atk} ATK / ${m!.def} DEF, ${m!.position})`);
    const aiSpells = aiField.spellTrapZones.filter(Boolean).map((s) => s!.name || 'Set Card');
    const aiHand = aiField.hand.map((h) => h.name || 'Card');

    const oppMonsters = oppField.monsterZones
      .filter(Boolean)
      .map((m) => (m!.isRevealed ? `${m!.name} (${m!.atk} ATK / ${m!.def} DEF, ${m!.position})` : `Face-down Monster (${m!.position})`));
    const oppBackrowCount = oppField.spellTrapZones.filter(Boolean).length;
    const oppHandCount = oppField.hand.length;

    const choices: { index: number; actionObj: any; description: string }[] = [];

    if (candidateActions && candidateActions.length > 0) {
      for (let i = 0; i < candidateActions.length; i++) {
        const c = candidateActions[i];
        choices.push({
          index: i,
          actionObj: c.action,
          description: c.reason || `Action ${i}`,
        });
      }
    } else {
      return null;
    }

    if (choices.length === 0) {
      return null;
    }

    const userPrompt = `=== CURRENT DUEL SITUATION ===
- Turn: ${currentTurn} | Phase: ${currentPhase}
- Your Life Points (LP): ${aiField.currentLp} | Opponent LP: ${oppField.currentLp}
- Your Hand (${aiHand.length}): ${aiHand.join(', ') || 'Empty'}
- Your Monsters (${aiMonsters.length}): ${aiMonsters.join(', ') || 'None'}
- Your Spells/Traps (${aiSpells.length}): ${aiSpells.join(', ') || 'None'}
- Opponent Monsters (${oppMonsters.length}): ${oppMonsters.join(', ') || 'None'}
- Opponent Backrow Count: ${oppBackrowCount} | Opponent Hand Count: ${oppHandCount}

=== LEGAL ACTION CHOICES ===
${choices.map((c) => `[Option ${c.index}]: ${c.description}`).join('\n')}

Select the single best Option Index [0 to ${choices.length - 1}], provide your tactical reasoning, and write 1 dramatic in-character spoken dialogue line.`;

    return { systemInstruction, userPrompt, choices };
  }

  private async callGeminiApi(
    promptData: { systemInstruction: string; userPrompt: string; choices: { index: number; actionObj: any; description: string }[] },
    context: EvaluatorContext,
  ): Promise<GeminiDecisionResult | null> {
    if (!this.ai) return null;

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: promptData.userPrompt,
      config: {
        systemInstruction: promptData.systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            selectedIndex: {
              type: Type.INTEGER,
              description: 'The option index number of your chosen legal action',
            },
            reasoning: {
              type: Type.STRING,
              description: 'Brief 1-sentence tactical rationale for this move',
            },
            characterDialogue: {
              type: Type.STRING,
              description: '1 dramatic in-character voice line delivered to the opponent',
            },
          },
          required: ['selectedIndex', 'reasoning', 'characterDialogue'],
        },
      },
    });

    const text = response.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    const chosenIndex = typeof parsed.selectedIndex === 'number' ? parsed.selectedIndex : 0;
    const validChoice = promptData.choices[chosenIndex] || promptData.choices[0];

    if (!validChoice) return null;

    return {
      response: validChoice.actionObj,
      reasoning: parsed.reasoning,
      dialogue: parsed.characterDialogue,
    };
  }
}

export const geminiDuelService = new GeminiDuelService();
