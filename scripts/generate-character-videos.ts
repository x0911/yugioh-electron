import { GoogleGenAI } from '@google/genai';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Load API key from env or fallback
const API_KEY = process.env.GEMINI_API_KEY || 'AQ.00000000000000000000000000000000000000000000000000';

interface CharacterPrompt {
  id: string;
  name: string;
  series: 'DM' | 'GX';
  introPrompt: string;
}

const CHARACTER_PROMPTS: CharacterPrompt[] = [
  {
    id: 'yugi-muto',
    name: 'Yugi Muto',
    series: 'DM',
    introPrompt: 'Cinematic anime cutscene. Yugi Muto touches the golden Millennium Puzzle around his neck, eyes shining with resolve. He draws a card from his deck with a sharp, fluid arc, setting his stance on the Ancient Arena dueling platform as the KaibaCorp Duel Disk snaps open with glowing cyan blades. Wind blows through his spiky tricolor hair. High quality cel-shaded anime animation, 4K, vivid lighting.',
  },
  {
    id: 'yami-yugi',
    name: 'Yami Yugi',
    series: 'DM',
    introPrompt: 'Epic theatrical anime intro. Yami Yugi stands under a dramatic spotlight as his dark jacket billows like a royal cape. He draws a card from the deck with blazing speed, slicing through the air with golden energy trails. The Millennium Puzzle flashes a blinding divine light. He points firmly forward with absolute authority. Cel-shaded high quality animation.',
  },
  {
    id: 'seto-kaiba',
    name: 'Seto Kaiba',
    series: 'DM',
    introPrompt: 'High-tech dramatic anime intro. Seto Kaiba turns sharply toward the camera, his long white trenchcoat flaring outward. The KaibaCorp Duel Disk lights up with neon blue lasers. He smirks arrogantly, flicking his wrist to draw a card with razor precision. Cold intense blue eyes, high-budget anime cutscene.',
  },
  {
    id: 'joey-wheeler',
    name: 'Joey Wheeler',
    series: 'DM',
    introPrompt: 'Energetic high-spirited anime entrance. Joey Wheeler punches the air with a determined grin, rubs his nose with his thumb, and snaps his Duel Disk into battle position. Red fiery aura sparks around his feet in a classic duel stance. High quality anime motion.',
  },
  {
    id: 'tea-gardner',
    name: 'Téa Gardner',
    series: 'DM',
    introPrompt: 'Graceful spirited anime intro. Téa Gardner smiles warmly, eyes shining with friendship and confidence. She draws a card with a light rhythmic motion like a dancer, her Duel Disk lighting up with pastel pink and gold sparkles. High quality anime animation.',
  },
  {
    id: 'tristan-taylor',
    name: 'Tristan Taylor',
    series: 'DM',
    introPrompt: 'Rugged pumped-up anime intro. Tristan Taylor rolls his shoulders, cracks his knuckles, and locks his Duel Disk into place with a heavy click. He stands with chest out and a confident smirk, ready for a brawl. High quality anime cutscene.',
  },
  {
    id: 'mai-valentine',
    name: 'Mai Valentine',
    series: 'DM',
    introPrompt: 'Glamorous sophisticated anime intro. Mai Valentine fans her cards like a feather fan, smelling the top card with a seductive cunning smirk. She snaps her Duel Disk active with purple Harpie feather petals swirling around her. High quality anime animation.',
  },
  {
    id: 'bakura-ryou',
    name: 'Bakura Ryou',
    series: 'DM',
    introPrompt: 'Dark eerie anime intro. The Millennium Ring points twitch and gleam ominously. Dark shadow energy swirls around Bakura as his eyes glow with sadistic crimson malevolence. He draws a card through a veil of purple Netherworld mist. High quality dark anime cutscene.',
  },
  {
    id: 'marik-ishtar',
    name: 'Marik Ishtar',
    series: 'DM',
    introPrompt: 'Terrifying high-intensity anime intro. Yami Marik glares with a manic deranged grin. He brandishes the golden Millennium Rod, glinting with dark solar energy. Ancient Winged Dragon of Ra flames erupt behind him. High quality anime animation.',
  },
  {
    id: 'maximillion-pegasus',
    name: 'Maximillion Pegasus',
    series: 'DM',
    introPrompt: 'Flamboyant theatrical anime intro. Maximillion Pegasus chuckles softly with sophisticated amusement. His golden Millennium Eye gleams through silver bangs with a mystical flash. Toon book pages flutter around him as he draws a card with effortless flair.',
  },
  {
    id: 'jaden-yuki',
    name: 'Jaden Yuki',
    series: 'GX',
    introPrompt: 'Upbeat energetic anime intro. Jaden Yuki grins widely, taps his deck, and delivers his signature two-finger salute: Get your game on! His Slifer Red jacket whips in the wind as the GX Duel Disk snaps active with glowing red blades. High quality anime animation.',
  },
  {
    id: 'zane-truesdale',
    name: 'Zane Truesdale',
    series: 'GX',
    introPrompt: 'Cold master-level anime entrance. Zane Truesdale stands perfectly composed. Silver Cyber Dragon coils shimmer in holographic blue light behind him. He draws a card with flawless surgical precision, icy blue eyes focused. High quality anime animation.',
  },
  {
    id: 'syrus-truesdale',
    name: 'Syrus Truesdale',
    series: 'GX',
    introPrompt: 'Nervous yet determined anime intro. Syrus Truesdale pushes up his round glasses with trembling fingers, gulps, then clenches his fists. He activates his Duel Disk with a burst of mechanical Vehicroid energy. High quality anime cutscene.',
  },
  {
    id: 'chazz-princeton',
    name: 'Chazz Princeton',
    series: 'GX',
    introPrompt: 'Arrogant theatrical anime intro. Chazz Princeton throws his black trenchcoat open, points dramatically into the sky: Chazz it up! Holographic dark dragon flames and comedy Ojama sparkles erupt around him as he sneers with absolute confidence.',
  },
  {
    id: 'alexis-rhodes',
    name: 'Alexis Rhodes',
    series: 'GX',
    introPrompt: 'Graceful athletic anime intro. Alexis Rhodes draws a card smoothly like a skilled ice skater. Her Obelisk Blue coat swirls as cold crystalline ice sparks dance across her Duel Disk. Confident, focused gaze. High quality anime cutscene.',
  },
  {
    id: 'bastion-misawa',
    name: 'Bastion Misawa',
    series: 'GX',
    introPrompt: 'Intellectual tactical anime intro. Bastion Misawa adjusts his Ra Yellow collar. He draws his opening card as glowing chalk mathematical formulas orbit his Duel Disk with precision. High quality anime animation.',
  },
  {
    id: 'chumley-huffington',
    name: 'Chumley Huffington',
    series: 'GX',
    introPrompt: 'Laid-back endearing anime intro. Chumley Huffington stretches lazily, yawns, then pulls out a card with a warm and earnest smile: Totally licious! Outback eucalyptus leaves drift around his Duel Disk. High quality anime animation.',
  },
  {
    id: 'aster-phoenix',
    name: 'Aster Phoenix',
    series: 'GX',
    introPrompt: 'Sleek pro-league anime intro. Aster Phoenix adjusts his lavender tie smoothly, flipping a card between his fingers. A dark clock tower with spinning golden gears appears behind him as his Duel Disk glows with silver moonlight.',
  },
  {
    id: 'jesse-anderson',
    name: 'Jesse Anderson',
    series: 'GX',
    introPrompt: 'Vibrant joyful anime intro. Jesse Anderson winks as Ruby Carbuncle chirps on his shoulder. He draws his opening card with a burst of shimmering rainbow crystal prisms dancing across the arena floor. High quality anime animation.',
  },
  {
    id: 'vellian-crowler',
    name: 'Dr. Vellian Crowler',
    series: 'GX',
    introPrompt: 'Theatrical pompous anime intro. Dr. Crowler flaps his fan dramatically, laughing with high-pitched aristocratic snobbery: Na-no da! Massive brass gears and hissing steam vents erupt behind him as his Ancient Gear Duel Vest hums to life.',
  },
];

async function generateSingleVideo(ai: GoogleGenAI, character: CharacterPrompt, outputDir: string): Promise<boolean> {
  const targetPath = path.join(outputDir, `${character.id}.mp4`);
  if (existsSync(targetPath)) {
    console.log(`[Veo] Video already exists: ${character.id}.mp4 — skipping.`);
    return true;
  }

  console.log(`\n========================================`);
  console.log(`[Veo] Generating intro video for: ${character.name} (${character.series})`);
  console.log(`[Veo] Prompt: "${character.introPrompt}"`);
  console.log(`========================================`);

  const models = ['veo-3.1-fast-generate-preview', 'veo-3.1-generate-preview', 'veo-3.1-lite-generate-preview'];

  for (const model of models) {
    try {
      console.log(`[Veo] Requesting model ${model}...`);
      let operation = await ai.models.generateVideos({
        model,
        source: { prompt: character.introPrompt },
        config: {
          numberOfVideos: 1,
          aspectRatio: '16:9',
          resolution: '720p',
          durationSeconds: 4,
        },
      });

      console.log(`[Veo] Operation queued: ${operation.name}`);

      while (!operation.done) {
        console.log(`[Veo] Generation in progress... waiting 10s`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const generated = operation.response?.generatedVideos?.[0];
      const videoUri = generated?.video?.uri;
      if (!videoUri) {
        console.error(`[Veo] No video URI returned from operation.`);
        continue;
      }

      console.log(`[Veo] Video generated! Downloading from ${videoUri}...`);
      const downloadRes = await fetch(`${videoUri}&key=${API_KEY}`);
      const arrayBuffer = await downloadRes.arrayBuffer();
      await writeFile(targetPath, Buffer.from(arrayBuffer));
      console.log(`[Veo] ✓ Successfully saved to: ${targetPath} (${arrayBuffer.byteLength} bytes)`);
      return true;
    } catch (err: unknown) {
      const errorObj = err as { message?: string; status?: number };
      console.warn(`[Veo] Model ${model} returned:`, errorObj?.message || String(err));
      if (errorObj?.status === 429) {
        console.error(`[Veo] Quota exceeded on Google AI Studio account. Veo requires a Tier 1 (pay-as-you-go) billing account.`);
        return false;
      }
    }
  }

  return false;
}

async function main() {
  const outputDir = path.resolve(process.cwd(), 'resources/videos/characters');
  await mkdir(outputDir, { recursive: true });

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const targetCharArg = process.argv.find((a) => a.startsWith('--character='))?.split('=')[1];
  const charactersToProcess = targetCharArg
    ? CHARACTER_PROMPTS.filter((c) => c.id === targetCharArg || c.name.toLowerCase().includes(targetCharArg.toLowerCase()))
    : CHARACTER_PROMPTS;

  if (charactersToProcess.length === 0) {
    console.error(`No matching character found for: ${targetCharArg}`);
    process.exit(1);
  }

  console.log(`Starting automated video generation for ${charactersToProcess.length} character(s)...`);

  for (const character of charactersToProcess) {
    const success = await generateSingleVideo(ai, character, outputDir);
    if (!success) {
      console.log(`Stopped batch generation due to API quota or error.`);
      break;
    }
  }
}

main().catch((err) => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
