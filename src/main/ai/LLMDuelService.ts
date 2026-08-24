import { GoogleGenAI, Type } from '@google/genai';
import type { OcgMessage, OcgResponse } from 'ocgcore-wasm';
import type { EvaluatorContext, ScoredAction } from './types.js';
import { getAiAndOpponentFields } from './types.js';
import type { AiProviderType } from '../../shared/types/character.js';

export interface LLMDecisionResult {
  response: OcgResponse;
  dialogue?: string;
  reasoning?: string;
  provider?: string;
}

export interface ProviderConfig {
  provider: AiProviderType;
  apiKey?: string;
  model?: string;
  customEndpoint?: string;
}

export interface PromptPayload {
  systemInstruction: string;
  userPrompt: string;
  choices: { index: number; actionObj: any; description: string }[];
}

export const DEFAULT_MODELS: Record<string, string> = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o-mini',
  deepseek: 'deepseek-chat',
  anthropic: 'claude-3-5-haiku-20241022',
  groq: 'llama-3.1-8b-instant',
  ollama: 'llama3.2',
  custom: 'default-model',
};

export const DEFAULT_ENDPOINTS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  ollama: 'http://localhost:11434/v1/chat/completions',
};

export class LLMDuelService {
  private timeoutMs = 10000;

  /**
   * Decide AI response using the configured LLM provider.
   * Returns null on error/timeout so the caller can fall back to local heuristics immediately.
   */
  public async decideResponse(
    config: ProviderConfig,
    msg: OcgMessage,
    context: EvaluatorContext,
    candidateActions?: ScoredAction[] | null,
  ): Promise<LLMDecisionResult | null> {
    if (config.provider === 'builtin') {
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

      const decisionPromise = this.dispatchToProvider(config, promptData);
      const result = await Promise.race([decisionPromise, timeoutPromise]);
      return result;
    } catch (err) {
      console.warn(`[LLMDuelService] ${config.provider} decision error:`, err);
      return null;
    }
  }

  /**
   * Test API connectivity and authentication for a given provider.
   */
  public async testConnection(
    provider: string,
    apiKey: string,
    customEndpoint?: string,
    model?: string,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const targetModel = model || DEFAULT_MODELS[provider] || 'default-model';

      if (provider === 'gemini') {
        const key = apiKey || process.env.GEMINI_API_KEY || '';
        if (!key) {
          return { success: false, error: 'Gemini API Key is required.' };
        }
        const client = new GoogleGenAI({ apiKey: key });
        const resp = await client.models.generateContent({
          model: targetModel,
          contents: 'Reply with the word "READY" in JSON: {"status":"READY"}',
          config: { responseMimeType: 'application/json' },
        });
        if (resp.text) {
          return { success: true, message: `Connected successfully to Google Gemini (${targetModel})!` };
        }
        return { success: false, error: 'Empty response from Gemini.' };
      }

      if (provider === 'anthropic') {
        if (!apiKey) {
          return { success: false, error: 'Anthropic API Key is required.' };
        }
        const endpoint = customEndpoint || DEFAULT_ENDPOINTS.anthropic;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: targetModel,
            max_tokens: 50,
            messages: [{ role: 'user', content: 'Respond with {"status":"READY"} in JSON.' }],
          }),
        });
        if (!res.ok) {
          const errText = await res.text();
          return { success: false, error: `Anthropic Error (${res.status}): ${errText}` };
        }
        return { success: true, message: `Connected successfully to Anthropic Claude (${targetModel})!` };
      }

      // OpenAI / DeepSeek / Groq / Ollama / Custom (OpenAI-compatible)
      let endpoint = customEndpoint;
      if (!endpoint) {
        endpoint = DEFAULT_ENDPOINTS[provider] || 'https://api.openai.com/v1/chat/completions';
      }

      if (provider !== 'ollama' && !apiKey) {
        return { success: false, error: `${provider.toUpperCase()} API Key is required.` };
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: 'system', content: 'You are a testing assistant. Return JSON.' },
            { role: 'user', content: 'Respond with {"status":"READY"}' },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `${provider.toUpperCase()} Error (${res.status}): ${errText}` };
      }

      return { success: true, message: `Connected successfully to ${provider.toUpperCase()} (${targetModel})!` };
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) };
    }
  }

  private buildPrompt(
    msg: OcgMessage,
    context: EvaluatorContext,
    candidateActions?: ScoredAction[] | null,
  ): PromptPayload | null {
    const { personality, currentPhase, currentTurn } = context;
    const { aiField, oppField } = getAiAndOpponentFields(context);

    const characterName = personality.name || 'Duelist';
    const systemInstruction = `You are playing a high-stakes Yu-Gi-Oh! duel as ${characterName}.
Your objective is to play strategically to win while maintaining your authentic persona, tactical insight, and dramatic character flair.
Analyze the current board state, evaluate the legal choices available, and select the single best option.
You MUST reply strictly with a valid JSON object matching this exact structure:
{
  "selectedIndex": <number>,
  "reasoning": "<brief 1-sentence tactical rationale>",
  "characterDialogue": "<1 dramatic in-character voice line delivered to the opponent>"
}`;

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

  private async dispatchToProvider(
    config: ProviderConfig,
    promptData: PromptPayload,
  ): Promise<LLMDecisionResult | null> {
    const { provider } = config;

    if (provider === 'gemini') {
      return this.callGemini(config, promptData);
    }
    if (provider === 'anthropic') {
      return this.callAnthropic(config, promptData);
    }
    return this.callOpenAiCompatible(config, promptData);
  }

  private async callGemini(
    config: ProviderConfig,
    promptData: PromptPayload,
  ): Promise<LLMDecisionResult | null> {
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY || '';
    if (!apiKey) return null;

    const modelName = config.model || DEFAULT_MODELS.gemini;
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: modelName,
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

    return this.parseJsonResponse(response.text, promptData, 'Gemini');
  }

  private async callAnthropic(
    config: ProviderConfig,
    promptData: PromptPayload,
  ): Promise<LLMDecisionResult | null> {
    if (!config.apiKey) return null;

    const endpoint = config.customEndpoint || DEFAULT_ENDPOINTS.anthropic;
    const model = config.model || DEFAULT_MODELS.anthropic;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 512,
        system: promptData.systemInstruction,
        messages: [{ role: 'user', content: promptData.userPrompt }],
      }),
    });

    if (!res.ok) return null;
    const data: any = await res.json();
    const rawText = data?.content?.[0]?.text;
    return this.parseJsonResponse(rawText, promptData, 'Anthropic');
  }

  private async callOpenAiCompatible(
    config: ProviderConfig,
    promptData: PromptPayload,
  ): Promise<LLMDecisionResult | null> {
    const { provider, apiKey } = config;
    if (provider !== 'ollama' && !apiKey) return null;

    let endpoint = config.customEndpoint;
    if (!endpoint) {
      endpoint = DEFAULT_ENDPOINTS[provider] || 'https://api.openai.com/v1/chat/completions';
    }
    const model = config.model || DEFAULT_MODELS[provider] || 'gpt-4o-mini';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: promptData.systemInstruction },
          { role: 'user', content: promptData.userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
      }),
    });

    if (!res.ok) return null;
    const data: any = await res.json();
    const rawText = data?.choices?.[0]?.message?.content;
    return this.parseJsonResponse(rawText, promptData, provider.toUpperCase());
  }

  private parseJsonResponse(
    text: string | undefined | null,
    promptData: PromptPayload,
    providerName: string,
  ): LLMDecisionResult | null {
    if (!text) return null;

    try {
      // Clean potential markdown backticks if returned
      const cleanJson = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      const chosenIndex = typeof parsed.selectedIndex === 'number' ? parsed.selectedIndex : 0;
      const validChoice = promptData.choices[chosenIndex] || promptData.choices[0];

      if (!validChoice) return null;

      return {
        response: validChoice.actionObj,
        reasoning: parsed.reasoning || '',
        dialogue: parsed.characterDialogue || '',
        provider: providerName,
      };
    } catch (err) {
      console.warn(`[LLMDuelService] Failed to parse JSON from ${providerName}:`, err, text);
      return null;
    }
  }
}

export const llmDuelService = new LLMDuelService();
