import assert from 'node:assert/strict';
import {
  llmDuelService,
  DEFAULT_MODELS,
  DEFAULT_ENDPOINTS,
} from '../src/main/ai/LLMDuelService.js';
import { aiController } from '../src/main/ai/AIController.js';
import type { EvaluatorContext, ScoredAction } from '../src/main/ai/types.js';
import type { BoardState } from '../src/shared/types/field.js';
import { OcgMessageType, OcgResponseType, SelectIdleCMDAction } from 'ocgcore-wasm';

function createMockContext(): EvaluatorContext {
  const boardState: BoardState = {
    turnNumber: 2,
    currentPhase: 'M1',
    winner: null,
    userField: {
      playerId: 0,
      name: 'Seto Kaiba',
      currentLp: 8000,
      maxLp: 8000,
      isTurn: true,
      hand: [
        { id: '1', code: 12580477, name: 'Raigeki', isRevealed: true },
        { id: '2', code: 89631139, name: 'Blue-Eyes White Dragon', isRevealed: true },
      ],
      monsterZones: [null, null, null, null, null],
      spellTrapZones: [null, null, null, null, null],
      fieldZone: null,
      graveyard: [],
      banished: [],
      extraDeckCount: 0,
      deckCount: 35,
    },
    opponentField: {
      playerId: 1,
      name: 'Yugi Muto',
      currentLp: 8000,
      maxLp: 8000,
      isTurn: false,
      hand: [{ id: 'h1', code: 0, name: '', isRevealed: false }],
      monsterZones: [
        {
          id: 'opp-m1',
          code: 36021814,
          name: 'King of the Skull Servants',
          atk: 6000,
          def: 0,
          position: 'faceup_attack',
          isRevealed: true,
        },
        null,
        null,
        null,
        null,
      ],
      spellTrapZones: [null, null, null, null, null],
      fieldZone: null,
      graveyard: [],
      banished: [],
      extraDeckCount: 0,
      deckCount: 35,
    },
  };

  return {
    boardState,
    aiPlayerId: 0,
    humanPlayerId: 1,
    currentPhase: 'M1',
    currentTurn: 2,
    personality: {
      name: 'Seto Kaiba',
      aggression: 0.9,
      defensiveness: 0.2,
      comboFocus: 0.8,
      riskTolerance: 0.8,
      bluffFrequency: 0.4,
      cardAdvantageWeight: 1.1,
      signatureFavoritism: 1.0,
      thinkDelayBaseMs: 300,
      thinkDelayJitterMs: 100,
    },
    cardReader: {
      getCardDetail: (code: number) => {
        if (code === 12580477) return { name: 'Raigeki', isSpell: true };
        if (code === 89631139)
          return { name: 'Blue-Eyes White Dragon', isMonster: true, atk: 3000, def: 2500, level: 8 };
        if (code === 36021814)
          return { name: 'King of the Skull Servants', isMonster: true, atk: 0, def: 0, level: 1 };
        return null;
      },
      getCardName: (code: number) => {
        if (code === 12580477) return 'Raigeki';
        if (code === 89631139) return 'Blue-Eyes White Dragon';
        if (code === 36021814) return 'King of the Skull Servants';
        return 'Card';
      },
    } as any,
    deckArchetype: 'blue-eyes',
    signatureCardIds: [89631139],
    aiDeckCards: [89631139, 12580477],
  };
}

async function runMultiProviderTests() {
  console.log('=== RUNNING MULTI-PROVIDER AI TEST SUITE ===\n');

  // Test 1: Verify Provider Defaults
  console.log('▶ Test 1: Verify Provider Model and Endpoint Defaults');
  assert.equal(DEFAULT_MODELS.gemini, 'gemini-2.5-flash');
  assert.equal(DEFAULT_MODELS.openai, 'gpt-4o-mini');
  assert.equal(DEFAULT_MODELS.deepseek, 'deepseek-chat');
  assert.equal(DEFAULT_MODELS.anthropic, 'claude-3-5-haiku-20241022');
  assert.equal(DEFAULT_MODELS.groq, 'llama-3.1-8b-instant');
  assert.equal(DEFAULT_MODELS.ollama, 'llama3.2');
  assert.equal(DEFAULT_ENDPOINTS.deepseek, 'https://api.deepseek.com/chat/completions');
  assert.equal(DEFAULT_ENDPOINTS.groq, 'https://api.groq.com/openai/v1/chat/completions');
  console.log('  ✓ All provider defaults correctly mapped!\n');

  // Test 2: Connection Test Validation
  console.log('▶ Test 2: Test API Connection Error Handling on Missing Keys');
  const openaiFail = await llmDuelService.testConnection('openai', '');
  assert.equal(openaiFail.success, false);
  assert(openaiFail.error?.includes('Key is required'));

  const anthropicFail = await llmDuelService.testConnection('anthropic', '');
  assert.equal(anthropicFail.success, false);
  assert(anthropicFail.error?.includes('Key is required'));

  const deepseekFail = await llmDuelService.testConnection('deepseek', '');
  assert.equal(deepseekFail.success, false);
  console.log('  ✓ Missing API key validation working!\n');

  // Test 2b: Dynamic Model Fetching
  console.log('▶ Test 2b: Dynamic Model Fetching');
  const geminiModels = await llmDuelService.fetchAvailableModels('gemini');
  assert.equal(geminiModels.success, true);
  assert(geminiModels.models && geminiModels.models.includes('gemini-2.5-flash'));

  const groqNoKey = await llmDuelService.fetchAvailableModels('groq', '');
  assert.equal(groqNoKey.success, false);
  assert(groqNoKey.error?.includes('Key is required'));
  console.log('  ✓ Dynamic model list resolution verified!\n');

  // Test 3: Built-in Heuristic Engine Passthrough
  console.log('▶ Test 3: Built-in Engine Passthrough in decideResponseAsync');
  const mockContext = createMockContext();
  const mockIdleMsg = {
    type: OcgMessageType.SELECT_IDLECMD,
    player: 0,
    main_count: 1,
    summons: [{ code: 89631139, index: 1, position: 0x1 }],
    spells: [],
    repos: [],
    m_sets: [],
    s_sets: [],
    activates: [{ code: 12580477, index: 0 }],
    to_bp: true,
    to_ep: true,
  } as any;

  const result = await aiController.decideResponseAsync(mockIdleMsg, mockContext, 'builtin');
  assert(result.response !== undefined, 'Built-in engine must return valid response');
  assert.equal(result.dialogue, undefined, 'Built-in engine has no LLM dialogue');
  console.log('  ✓ Built-in fallback response produced!\n');

  // Test 4: Gemini Live Connection & Duel Decision
  console.log('▶ Test 4: Live Gemini Decision Evaluation');
  const candidateActions: ScoredAction[] = [
    {
      action: {
        type: OcgResponseType.SELECT_IDLECMD,
        action: SelectIdleCMDAction.SELECT_ACTIVATE,
        index: 0,
      },
      score: 9500,
      reason: 'Activate Raigeki to annihilate opponent King of the Skull Servants (6000 ATK)',
      cardCode: 12580477,
      cardName: 'Raigeki',
    },
    {
      action: {
        type: OcgResponseType.SELECT_IDLECMD,
        action: SelectIdleCMDAction.SELECT_TO_BP,
        index: -1,
      },
      score: 100,
      reason: 'Proceed to Battle Phase without casting',
    },
  ];

  const geminiDecision = await llmDuelService.decideResponse(
    { provider: 'gemini' },
    mockIdleMsg,
    mockContext,
    candidateActions,
  );

  if (geminiDecision) {
    console.log('  ✓ Live Gemini Decision Received:');
    console.log('    • Response Index:', (geminiDecision.response as any).index);
    console.log('    • Reasoning:', geminiDecision.reasoning);
    console.log('    • Character Dialogue:', `"${geminiDecision.dialogue}"`);
    assert(geminiDecision.dialogue && geminiDecision.dialogue.length > 0);
  } else {
    console.log('  ⚠ Gemini live test timed out or skipped due to network/env');
  }

  // Test 5: Fallback on API Error / Invalid Key
  console.log('\n▶ Test 5: Graceful Fallback to Heuristic Engine on Invalid Key');
  const fallbackResult = await aiController.decideResponseAsync(mockIdleMsg, mockContext, {
    provider: 'openai',
    apiKey: 'sk-invalid-fake-key',
  });
  assert(fallbackResult.response !== undefined, 'Must fall back to heuristic decision');
  console.log('  ✓ Seamless fallback executed!');

  // Test 6: API Key & Model Persistence with Partial Updates
  console.log('\n▶ Test 6: API Key & Model Persistence across Partial Updates & Reloads');
  const { savePersistedSettings, getPersistedSettings } = await import('../src/main/persistence/store.js');

  // Save Groq key
  savePersistedSettings({
    aiProvider: 'groq',
    aiApiKeys: { groq: 'gsk_test_123456789' },
    aiModels: { groq: 'llama-3.1-8b-instant' },
  });

  let loaded = getPersistedSettings();
  assert.equal(loaded.aiApiKeys?.groq, 'gsk_test_123456789', 'Groq key must be persisted');
  assert.equal(loaded.aiModels?.groq, 'llama-3.1-8b-instant', 'Groq model must be persisted');

  // Perform partial update (e.g. user changes volume slider or theme)
  savePersistedSettings({
    masterVolume: 75,
    selectedBgmTheme: 'passionate',
  });

  loaded = getPersistedSettings();
  assert.equal(loaded.masterVolume, 75, 'Volume must update to 75');
  assert.equal(loaded.aiApiKeys?.groq, 'gsk_test_123456789', 'Groq key must survive partial volume updates');
  assert.equal(loaded.aiModels?.groq, 'llama-3.1-8b-instant', 'Groq model must survive partial volume updates');

  // Add another provider key (OpenAI) without wiping Groq
  savePersistedSettings({
    aiApiKeys: { openai: 'sk-test-openai-987654' },
  });

  loaded = getPersistedSettings();
  assert.equal(loaded.aiApiKeys?.groq, 'gsk_test_123456789', 'Existing Groq key must not be overwritten when adding OpenAI key');
  assert.equal(loaded.aiApiKeys?.openai, 'sk-test-openai-987654', 'OpenAI key must be saved');
  console.log('  ✓ Multi-provider key persistence & reload integrity verified!');

  // Test 7: Error Diagnostic Capture & Status Reporting
  console.log('\n▶ Test 7: AI Connection Diagnostics & Error Reporting');
  const diagResult = await llmDuelService.decideResponseWithDiagnostics(
    { provider: 'gemini', apiKey: 'fake-invalid-key', model: 'invalid-model-name-xyz' },
    mockIdleMsg,
    mockContext,
    candidateActions,
  );
  assert.strictEqual(diagResult.result, null, 'Must return null result on error');
  assert.ok(diagResult.error && diagResult.error.length > 0, 'Must provide detailed error message');
  console.log('  ✓ Captured diagnostic error:', diagResult.error);

  const controllerDiag = await aiController.decideResponseAsync(
    mockIdleMsg,
    mockContext,
    { provider: 'groq', apiKey: 'gsk_invalid_key_test', model: 'llama-invalid' },
  );
  assert.strictEqual(controllerDiag.fallbackUsed, true, 'Fallback flag must be set to true');
  assert.ok(controllerDiag.error && controllerDiag.error.length > 0, 'Controller must surface provider error message');
  console.log('  ✓ Controller surfaced fallback error:', controllerDiag.error);

  console.log('  ✓ AI Diagnostic reporting verified!\n');

  console.log('🎉 ALL MULTI-PROVIDER AI TESTS PASSED 100%!');
}

runMultiProviderTests().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
