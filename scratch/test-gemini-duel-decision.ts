import { GoogleGenAI, Type, Schema } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || 'AQ.00000000000000000000000000000000000000000000000000';
const ai = new GoogleGenAI({ apiKey });

interface DuelDecisionPrompt {
  characterName: string;
  turnNumber: number;
  phase: string;
  aiLp: number;
  oppLp: number;
  aiField: {
    hand: string[];
    monsters: string[];
    spellsTraps: string[];
  };
  oppField: {
    monsters: string[];
    spellsTrapsCount: number;
    handCount: number;
  };
  legalChoices: { index: number; action: string; description: string }[];
}

async function testGeminiDuelDecision(state: DuelDecisionPrompt) {
  const systemInstruction = `You are playing Yu-Gi-Oh! as the legendary duelist ${state.characterName}.
Your task is to analyze the duel state and select the single best strategic action from the legal choices available.
Respond with JSON matching the schema with:
- "selectedIndex": the numeric index of the choice you selected.
- "reasoning": 1 brief sentence explaining the tactical reason.
- "characterDialogue": 1 authentic, dramatic in-character line to say to the opponent.`;

  const prompt = `DUEL STATE:
- Turn: ${state.turnNumber} | Phase: ${state.phase}
- Your LP: ${state.aiLp} | Opponent LP: ${state.oppLp}
- Your Hand: ${state.aiField.hand.join(', ') || 'None'}
- Your Monsters: ${state.aiField.monsters.join(', ') || 'None'}
- Your Backrow: ${state.aiField.spellsTraps.join(', ') || 'None'}
- Opponent Monsters: ${state.oppField.monsters.join(', ') || 'None'}
- Opponent Backrow Count: ${state.oppField.spellsTrapsCount} | Opponent Hand Count: ${state.oppField.handCount}

LEGAL CHOICES:
${state.legalChoices.map((c) => `[${c.index}] (${c.action}) ${c.description}`).join('\n')}

Which action index do you choose?`;

  const startTime = Date.now();
  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          selectedIndex: { type: Type.INTEGER, description: 'The index of the chosen legal action' },
          reasoning: { type: Type.STRING, description: 'Tactical rationale' },
          characterDialogue: { type: Type.STRING, description: 'Dramatic character quote' },
        },
        required: ['selectedIndex', 'reasoning', 'characterDialogue'],
      },
    },
  });
  const elapsed = Date.now() - startTime;

  console.log(`⏱ Gemini Response Time: ${elapsed}ms`);
  console.log('🤖 Raw Response:', response.text);
  try {
    const parsed = JSON.parse(response.text || '{}');
    console.log('✅ Parsed Decision:', parsed);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
  }
}

// Test scenario: AI (Seto Kaiba) has Raigeki and Blue-Eyes White Dragon in hand, opponent has King of the Skull Servants (6000 ATK)
testGeminiDuelDecision({
  characterName: 'Seto Kaiba',
  turnNumber: 2,
  phase: 'MAIN1',
  aiLp: 8000,
  oppLp: 8000,
  aiField: {
    hand: ['Raigeki', 'Blue-Eyes White Dragon', 'Mirror Force'],
    monsters: [],
    spellsTraps: [],
  },
  oppField: {
    monsters: ['King of the Skull Servants (6000 ATK, Attack Position)'],
    spellsTrapsCount: 1,
    handCount: 3,
  },
  legalChoices: [
    { index: 0, action: 'ACTIVATE_SPELL', description: 'Activate Raigeki to destroy all opponent monsters' },
    { index: 1, action: 'SET_SPELL_TRAP', description: 'Set Mirror Force in Spell/Trap Zone' },
    { index: 2, action: 'TO_BP', description: 'Enter Battle Phase' },
    { index: 3, action: 'TO_EP', description: 'End Turn' },
  ],
}).catch(console.error);
