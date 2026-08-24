import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || 'AQ.00000000000000000000000000000000000000000000000000';
const ai = new GoogleGenAI({ apiKey });

async function testConnection() {
  console.log('Testing Gemini API with gemini-3.6-flash...');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'You are Seto Kaiba in Yu-Gi-Oh!. Say a short 1-sentence line when summoning Blue-Eyes White Dragon.',
    });
    console.log('✅ Response from gemini-3.6-flash:', response.text);
  } catch (err: any) {
    console.error('❌ Error with gemini-3.6-flash:', err?.message || err);
  }
}

testConnection();
