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

export interface LLMCallResult {
  result: LLMDecisionResult | null;
  error?: string;
  statusCode?: number;
  durationMs?: number;
}

export class LLMDuelService {
  private timeoutMs = 10000;

  /**
   * Decide AI response with full error diagnostics so callers can surface connection issues.
   */
  public async decideResponseWithDiagnostics(
    config: ProviderConfig,
    msg: OcgMessage,
    context: EvaluatorContext,
    candidateActions?: ScoredAction[] | null,
  ): Promise<LLMCallResult> {
    if (config.provider === 'builtin') {
      return { result: null };
    }

    const startTime = Date.now();
    const promptData = this.buildPrompt(msg, context, candidateActions);
    if (!promptData) {
      return { result: null, error: 'No legal candidate actions to evaluate' };
    }

    try {
      let timeoutId: any;
      const timeoutPromise = new Promise<LLMCallResult>((resolve) => {
        timeoutId = setTimeout(() => {
          resolve({
            result: null,
            error: `API Call Timed Out (${this.timeoutMs / 1000}s). Network slow or provider endpoint unresponsive.`,
          });
        }, this.timeoutMs);
      });

      const callPromise = this.dispatchToProviderDetailed(config, promptData);
      const callRes = await Promise.race([callPromise, timeoutPromise]);
      clearTimeout(timeoutId);

      const durationMs = Date.now() - startTime;
      return { ...callRes, durationMs };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const errorMsg = err?.message || String(err);
      console.warn(`[LLMDuelService] ${config.provider} decision error:`, err);
      return { result: null, error: errorMsg, durationMs };
    }
  }

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
    const diag = await this.decideResponseWithDiagnostics(config, msg, context, candidateActions);
    return diag.result;
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

  /**
   * Fetch live list of available models for a given provider.
   */
  public async fetchAvailableModels(
    provider: string,
    apiKey?: string,
    customEndpoint?: string,
  ): Promise<{ success: boolean; models?: string[]; error?: string }> {
    try {
      if (provider === 'gemini') {
        return {
          success: true,
          models: [
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-3.6-flash',
          ],
        };
      }

      if (provider === 'anthropic') {
        return {
          success: true,
          models: [
            'claude-3-5-haiku-20241022',
            'claude-3-5-sonnet-20241022',
            'claude-3-haiku-20240307',
            'claude-3-opus-20240229',
          ],
        };
      }

      if (provider === 'deepseek') {
        return {
          success: true,
          models: ['deepseek-chat', 'deepseek-reasoner'],
        };
      }

      if (provider === 'groq') {
        const key = apiKey || process.env.GROQ_API_KEY || '';
        if (!key) {
          return { success: false, error: 'Groq API Key is required to fetch models.' };
        }
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          const err = await res.text();
          return { success: false, error: `Groq Error (${res.status}): ${err}` };
        }
        const json: any = await res.json();
        const rawModels: any[] = Array.isArray(json.data) ? json.data : [];
        const filtered = rawModels
          .map((m) => (typeof m === 'string' ? m : m.id))
          .filter((id: string) => {
            const lower = id.toLowerCase();
            return (
              !lower.includes('whisper') &&
              !lower.includes('tts') &&
              !lower.includes('guard') &&
              !lower.includes('embed')
            );
          });

        filtered.sort((a, b) => {
          if (a.includes('8b-instant') && !b.includes('8b-instant')) return -1;
          if (!a.includes('8b-instant') && b.includes('8b-instant')) return 1;
          return a.localeCompare(b);
        });

        return { success: true, models: filtered.length > 0 ? filtered : ['llama-3.1-8b-instant'] };
      }

      if (provider === 'openai') {
        const key = apiKey || process.env.OPENAI_API_KEY || '';
        if (!key) {
          return { success: false, error: 'OpenAI API Key is required to fetch models.' };
        }
        const res = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          const err = await res.text();
          return { success: false, error: `OpenAI Error (${res.status}): ${err}` };
        }
        const json: any = await res.json();
        const rawModels: any[] = Array.isArray(json.data) ? json.data : [];
        const filtered = rawModels
          .map((m) => (typeof m === 'string' ? m : m.id))
          .filter((id: string) => {
            const lower = id.toLowerCase();
            return (
              lower.startsWith('gpt-') ||
              lower.startsWith('o1') ||
              lower.startsWith('o3') ||
              lower.startsWith('chatgpt')
            );
          });

        filtered.sort((a, b) => {
          if (a.includes('4o-mini') && !b.includes('4o-mini')) return -1;
          if (!a.includes('4o-mini') && b.includes('4o-mini')) return 1;
          return a.localeCompare(b);
        });

        return { success: true, models: filtered.length > 0 ? filtered : ['gpt-4o-mini', 'gpt-4o'] };
      }

      if (provider === 'ollama') {
        try {
          const base = customEndpoint
            ? customEndpoint.replace(/\/v1\/chat\/completions\/?$/, '')
            : 'http://localhost:11434';
          const res = await fetch(`${base}/api/tags`);
          if (res.ok) {
            const json: any = await res.json();
            const models = (json.models || []).map((m: any) => m.name || m.model);
            if (models.length > 0) return { success: true, models };
          }
        } catch {
          // ignore and fallback
        }
        return { success: true, models: ['llama3.2', 'llama3.1', 'mistral', 'qwen2.5', 'deepseek-r1'] };
      }

      if (provider === 'custom') {
        return { success: true, models: ['default-model'] };
      }

      return { success: true, models: [] };
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

    const characterName = personality.name || (context.boardState.userField.playerId === context.aiPlayerId ? context.boardState.userField.name : context.boardState.opponentField.name) || 'Duelist';
    const systemInstruction = `You are playing a high-stakes Yu-Gi-Oh! duel as ${characterName}.
Your objective is to play strategically to win while maintaining your authentic persona, tactical insight, and dramatic character flair.
Tactical Principles:
1. Preserve defensive traps (Mirror Force, Sakuretsu Armor, Dimensional Prison, Magic Cylinder) for major threats; do not waste removal on 0 ATK or weak attackers.
2. Spot removal (Mystical Space Typhoon, Dust Tornado) should eliminate active continuous spells/traps, field spells, or dangerous face-down backrow; never target your own assets.
3. Conserve resources and pass chain priority when the active trigger does not require disruption.
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
      // Filter out severe blunder / suicide actions (e.g. setting normal spells, popping own cards) when viable alternatives exist
      const nonBlunderActions = candidateActions.filter((c) => c.score > -2000);
      const effectiveActions = nonBlunderActions.length > 0 ? nonBlunderActions : candidateActions;

      for (let i = 0; i < effectiveActions.length; i++) {
        const c = effectiveActions[i];
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

Select the single best Option Index [0 to ${choices.length - 1}], provide your tactical reasoning, and write 1 dramatic in-character spoken dialogue line.
Reply with a valid JSON object: {"selectedIndex": <number>, "reasoning": "...", "characterDialogue": "..."}`;

    return { systemInstruction, userPrompt, choices };
  }

  private async dispatchToProviderDetailed(
    config: ProviderConfig,
    promptData: PromptPayload,
  ): Promise<LLMCallResult> {
    const { provider } = config;

    if (provider === 'gemini') {
      return this.callGeminiDetailed(config, promptData);
    }
    if (provider === 'anthropic') {
      return this.callAnthropicDetailed(config, promptData);
    }
    return this.callOpenAiCompatibleDetailed(config, promptData);
  }

  private async callGeminiDetailed(
    config: ProviderConfig,
    promptData: PromptPayload,
  ): Promise<LLMCallResult> {
    const apiKey = config.apiKey || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return { result: null, error: 'Gemini API Key is missing. Enter your key in Settings > AI Duelist.' };
    }

    const modelName = config.model || DEFAULT_MODELS.gemini;
    const ai = new GoogleGenAI({ apiKey });

    try {
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

      const parsed = this.parseJsonResponse(response.text, promptData, 'Gemini');
      if (!parsed) {
        return { result: null, error: `Invalid response format from Gemini model "${modelName}"` };
      }
      return { result: parsed };
    } catch (err: any) {
      let errMsg = err?.message || String(err);
      if (errMsg.includes('404') || errMsg.toLowerCase().includes('not found')) {
        errMsg = `HTTP 404 (Model Not Found: "${modelName}" is not available or does not exist. Choose e.g. gemini-2.5-flash or gemini-2.0-flash in Settings > AI Duelist)`;
      } else if (errMsg.includes('401') || errMsg.includes('403') || errMsg.toLowerCase().includes('api_key_invalid')) {
        errMsg = `HTTP 401/403 (Invalid or unauthorized API key for Gemini).`;
      } else if (errMsg.includes('429') || errMsg.toLowerCase().includes('resource_exhausted')) {
        errMsg = `HTTP 429 (Gemini Rate Limit / Quota Exceeded on free tier).`;
      }
      return { result: null, error: errMsg };
    }
  }

  private async callAnthropicDetailed(
    config: ProviderConfig,
    promptData: PromptPayload,
  ): Promise<LLMCallResult> {
    if (!config.apiKey) {
      return { result: null, error: 'Anthropic API Key is missing. Enter your key in Settings > AI Duelist.' };
    }

    const endpoint = config.customEndpoint || DEFAULT_ENDPOINTS.anthropic;
    const model = config.model || DEFAULT_MODELS.anthropic;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 300,
          system: promptData.systemInstruction,
          messages: [{ role: 'user', content: promptData.userPrompt }],
        }),
      });

      if (!res.ok) {
        let errText = await res.text();
        try {
          const j = JSON.parse(errText);
          if (j.error?.message) errText = j.error.message;
        } catch {}
        return { result: null, error: `Anthropic Error HTTP ${res.status}: ${errText}`, statusCode: res.status };
      }
      const data: any = await res.json();
      const rawText = data?.content?.[0]?.text;
      const parsed = this.parseJsonResponse(rawText, promptData, 'Anthropic');
      if (!parsed) {
        return { result: null, error: `Invalid response format from Anthropic model "${model}"` };
      }
      return { result: parsed };
    } catch (err: any) {
      return { result: null, error: err?.message || String(err) };
    }
  }

  private async callOpenAiCompatibleDetailed(
    config: ProviderConfig,
    promptData: PromptPayload,
  ): Promise<LLMCallResult> {
    const { provider, apiKey } = config;
    if (provider !== 'ollama' && !apiKey) {
      return { result: null, error: `${provider.toUpperCase()} API Key is missing. Enter your key in Settings > AI Duelist.` };
    }

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

    try {
      let res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: promptData.systemInstruction },
            { role: 'user', content: promptData.userPrompt },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 300,
          temperature: 0.6,
        }),
      });

      if (!res.ok) {
        let errText = await res.text();
        try {
          const j = JSON.parse(errText);
          if (j.error?.message) errText = j.error.message;
        } catch {}

        // If provider rejected json_object response format (e.g. Qwen on Groq), retry in raw mode
        if (
          res.status === 400 &&
          (errText.includes('validate JSON') || errText.includes('response_format') || errText.includes('failed_generation'))
        ) {
          try {
            const retryRes = await fetch(endpoint, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: promptData.systemInstruction },
                  { role: 'user', content: promptData.userPrompt },
                ],
                max_tokens: 300,
                temperature: 0.3,
              }),
            });
            if (retryRes.ok) {
              const retryData: any = await retryRes.json();
              const retryText = retryData?.choices?.[0]?.message?.content;
              const parsed = this.parseJsonResponse(retryText, promptData, provider.toUpperCase());
              if (parsed) {
                return { result: parsed };
              }
            }
          } catch {}
        }

        return { result: null, error: `${provider.toUpperCase()} Error HTTP ${res.status}: ${errText}`, statusCode: res.status };
      }

      const data: any = await res.json();
      const rawText = data?.choices?.[0]?.message?.content;
      const parsed = this.parseJsonResponse(rawText, promptData, provider.toUpperCase());
      if (!parsed) {
        return { result: null, error: `Invalid JSON response from ${provider.toUpperCase()} model "${model}"` };
      }
      return { result: parsed };
    } catch (err: any) {
      return { result: null, error: err?.message || String(err) };
    }
  }

  private parseJsonResponse(
    text: string | undefined | null,
    promptData: PromptPayload,
    providerName: string,
  ): LLMDecisionResult | null {
    if (!text) return null;

    try {
      // Strip any <think>...</think> reasoning tags emitted by Qwen/DeepSeek
      let cleanText = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

      let parsed: any;
      try {
        parsed = JSON.parse(cleanText);
      } catch {
        // Fallback regex to search for embedded JSON object { ... }
        const match = cleanText.match(/\{[\s\S]*?\}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch {}
        }
      }

      if (!parsed || typeof parsed !== 'object') return null;

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
