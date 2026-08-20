import { GoogleGenAI } from '@google/genai';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Load API key from environment variable or provided key
const API_KEY = process.env.GEMINI_API_KEY || 'AQ.00000000000000000000000000000000000000000000000000';

const UNIVERSAL_STYLE_ANCHOR =
  'Cinematic high-budget anime cutscene, crisp cel-shaded lines, dynamic anime lighting, vibrant holographic energy, dramatic rim lighting, 4K resolution, Studio Bridge/Toei high-end theatrical animation quality, volumetric smoke and glowing particle embers, no watermarks, no distorted faces, no extra limbs.';

interface CharacterVideoConfig {
  id: string;
  name: string;
  series: 'DM' | 'GX';
  visualAnchor: string;
  actionAnchor: string;
}

const CHARACTERS: CharacterVideoConfig[] = [
  {
    id: 'yugi-muto',
    name: 'Yugi Muto',
    series: 'DM',
    visualAnchor:
      'Small stature, iconic tricolor spiked hair (black/magenta/blond tips), domino high school uniform with leather buckled collar, silver Millennium Puzzle around neck, classic KaibaCorp Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Yugi Muto touches the Millennium Puzzle around his neck with determination, eyes shining with resolve. He draws a card from his deck with a sharp, fluid arc, setting his stance on the Ancient Arena dueling platform as the KaibaCorp Duel Disk snaps open with a glowing cyan blade. Wind blows through his spiky tricolor hair. Dynamic low-angle camera push.',
  },
  {
    id: 'seto-kaiba',
    name: 'Seto Kaiba',
    series: 'DM',
    visualAnchor:
      'Tall athletic build, sleek brown hair, signature long white high-collar trench coat with silver KaibaCorp studs, dark high-tech sleeveless undershirt, KaibaCorp Duel Disk with glowing cyan blade on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Seto Kaiba turns sharply toward the camera, white trench coat flaring dramatically in the wind. He smirks with arrogance and sharp determination, drawing a card from his deck with razor precision. Holographic blue dragon aura pulses across the arena floor as his piercing blue eyes flash with confidence. Dynamic low-angle camera push.',
  },
  {
    id: 'yami-yugi',
    name: 'Yami Yugi',
    series: 'DM',
    visualAnchor:
      'Powerful commanding presence, sharp crimson eyes, gold Millennium Puzzle glowing brightly on chest, dark blue school jacket draped over shoulders like a royal cape, KaibaCorp Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime medium shot. Yami Yugi stands under a dramatic arena spotlight, jacket billowing like a royal mantle. He draws a card with blazing speed, slicing through the air with glowing golden energy trails. The Eye of Anubis shines brilliantly on his forehead as he points forward with absolute authority. Golden particle embers and dynamic camera push.',
  },
  {
    id: 'joey-wheeler',
    name: 'Joey Wheeler',
    series: 'DM',
    visualAnchor:
      'Lean athletic build, messy golden-blond hair, open green varsity jacket over white shirt, blue jeans, classic Battle City Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Joey Wheeler punches his fist into his palm with a fiery grin, rubs his nose with his thumb, and snaps his Duel Disk into battle position with a metallic click. Red flame aura sparks around his boots as he takes a resolute dueling stance, grinning boldly at the opponent. Dynamic camera sweep.',
  },
  {
    id: 'tea-gardner',
    name: 'Téa Gardner',
    series: 'DM',
    visualAnchor:
      'Brown bob haircut with neat bangs, bright teal eyes, Domino High sailor school uniform with pink ribbon, Battle City Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Téa Gardner smiles warmly with unwavering resolve, eyes shining with friendship and confidence. She draws a card in a light, rhythmic motion like a skilled dancer, her Duel Disk lighting up with pastel pink and sparkling gold light ribbons. Dynamic camera pan.',
  },
  {
    id: 'tristan-taylor',
    name: 'Tristan Taylor',
    series: 'DM',
    visualAnchor:
      'Broad-shouldered muscular build, tall spiky brown pompadour hair, open brown school jacket with rolled-up sleeves, Battle City Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime medium shot. Tristan Taylor rolls his shoulders, cracks his knuckles with a determined grin, and locks his Duel Disk into dueling mode with a heavy click. He sets his stance with chest out, ready for an intense match as dust swirls around his boots. Low-angle hero shot.',
  },
  {
    id: 'mai-valentine',
    name: 'Mai Valentine',
    series: 'DM',
    visualAnchor:
      'Voluminous long blonde hair, striking purple eyes, stylish purple corset vest with white cropped leather bolero, Battle City Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Mai Valentine fans her hand of cards gracefully like a feather fan, lifting the top card to smell its subtle perfume with a seductive, confident smirk. She snaps her Duel Disk into attack mode as purple Harpie feather petals swirl dramatically around her. Glamorous dynamic camera track.',
  },
  {
    id: 'bakura-ryou',
    name: 'Bakura Ryou',
    series: 'DM',
    visualAnchor:
      'Flowing silver-white hair, pale skin, striped blue-and-white sweater, golden Millennium Ring hanging with twitching pointer needles, Battle City Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime medium shot. Bakura tilts his head up with a chilling, sadistic smirk, eyes flashing with malevolent crimson fire. Dark shadow energy and purple Netherworld mist swirl around his silhouette as the Millennium Ring gleams ominously. He draws a card through the shadows with eerie elegance.',
  },
  {
    id: 'marik-ishtar',
    name: 'Marik Ishtar',
    series: 'DM',
    visualAnchor:
      'Sun-tanned skin, spiky platinum-blond hair, shirtless under purple cape with gold armbands, holding the golden Millennium Rod, Battle City Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Yami Marik laughs with manic, deranged intensity, his face twisted in a menacing grimace. He brandishes the golden Millennium Rod as ancient hieroglyphics and searing solar flames from The Winged Dragon of Ra erupt behind him. Dynamic spiral camera push.',
  },
  {
    id: 'maximillion-pegasus',
    name: 'Maximillion Pegasus',
    series: 'DM',
    visualAnchor:
      'Long flowing silver hair partially covering left eye, lavish red suit jacket with ruffled white cravat, golden Millennium Eye gleaming through hair, Battle City Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Maximillion Pegasus chuckles softly with flamboyant sophistication. The golden Millennium Eye flashes with mystical yellow radiance through his silver bangs. Whimsical holographic Toon sparkles and storybook pages flutter around him as he draws a card with effortless theatrical flair.',
  },
  {
    id: 'jaden-yuki',
    name: 'Jaden Yuki',
    series: 'GX',
    visualAnchor:
      'Dual-toned brown hair (curved winged fringe), wide brown eyes, Slifer Red Academy jacket with white trim, red Academy Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Jaden Yuki grins brightly, taps his deck, and snaps his two fingers in his signature salute: "Get your game on!" His Slifer Red jacket flutters in the breeze as his Duel Disk blades slide into position with glowing red energy. Golden hero embers drift across the frame.',
  },
  {
    id: 'zane-truesdale',
    name: 'Zane Truesdale',
    series: 'GX',
    visualAnchor:
      'Sharp features, parted dark navy-blue hair, stylish white and blue Obelisk Blue trench coat, Academy Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Zane Truesdale stands in absolute composure, his piercing icy eyes fixed on the opponent. Giant holographic chrome Cyber Dragon coils shimmer behind him. He draws a card with surgical precision, the Duel Disk humming with electric blue lightning.',
  },
  {
    id: 'syrus-truesdale',
    name: 'Syrus Truesdale',
    series: 'GX',
    visualAnchor:
      'Short stature, light blue hair, round glasses, Slifer Red Academy uniform, red Academy Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Syrus Truesdale nervously pushes up his round glasses, gulps, then tightens his grip on his cards with newfound determination. He snaps his Duel Disk active as glowing mechanical gears and exhaust steam pop energetically around him.',
  },
  {
    id: 'chazz-princeton',
    name: 'Chazz Princeton',
    series: 'GX',
    visualAnchor:
      'Spiky black hair, sharp sneering expression, tailored black Society of Light / Slifer Red modified trenchcoat, black Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime medium shot. Chazz Princeton sweeps his black coat open dramatically, pointing two fingers high into the sky: "Chazz it up!" Dark dragon flames and comedic sparkling Ojama spirits burst outward around him as he smirks with supreme arrogance.',
  },
  {
    id: 'alexis-rhodes',
    name: 'Alexis Rhodes',
    series: 'GX',
    visualAnchor:
      'Long dirty-blond hair with high ponytail, hazel eyes, elegant white and blue Obelisk Blue Academy duelist uniform with high collar, blue Academy Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Alexis Rhodes draws a card with the fluid, graceful rhythm of a figure skater. Her Obelisk Blue coat swirls as crystalline ice sparks and diamond dust dance across her Duel Disk. She gazes forward with calm, focused determination.',
  },
  {
    id: 'bastion-misawa',
    name: 'Bastion Misawa',
    series: 'GX',
    visualAnchor:
      'Broad athletic build, neat black crew cut, Ra Yellow Academy uniform with yellow collar, yellow Academy Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Bastion Misawa adjusts his collar, analyzing the duel with sharp tactical intellect. He draws his opening card smoothly as glowing chalk mathematical formulas, chemical equations, and geometric grids orbit his Duel Disk in mid-air.',
  },
  {
    id: 'chumley-huffington',
    name: 'Chumley Huffington',
    series: 'GX',
    visualAnchor:
      'Heavy-set build, messy brown hair, small mustache, Slifer Red uniform with brown undershirt, red Academy Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Chumley Huffington stretches lazily with a sleepy yawn, then breaks into a warm, heartfelt smile: "Totally licious!" Eucalyptus leaves and a cute Des Koala spirit drift peacefully around his Duel Disk as he readies his hand.',
  },
  {
    id: 'aster-phoenix',
    name: 'Aster Phoenix',
    series: 'GX',
    visualAnchor:
      'Pale silver-gray parted hair, sharp purple eyes, tailored lavender suit jacket over white shirt and black tie, Academy Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Aster Phoenix smoothly adjusts his lavender tie and flips a card between his fingers like a pro duelist. An ominous dark clock tower with turning golden clockwork gears materializes behind him as silver moonlight bathes the arena.',
  },
  {
    id: 'jesse-anderson',
    name: 'Jesse Anderson',
    series: 'GX',
    visualAnchor:
      'Spiky teal-cyan hair, bright emerald green eyes, open white vest over black shirt, brown leather pants, red Academy Duel Disk on left forearm.',
    actionAnchor:
      'Cinematic anime close-up to medium shot. Jesse Anderson winks cheerfully as a sparkling Ruby Carbuncle spirit perches on his shoulder. He draws a card with vibrant joy, sending shimmering rainbow prisms and glistening crystal gemstone reflections dancing across the arena platform.',
  },
  {
    id: 'vellian-crowler',
    name: 'Dr. Vellian Crowler',
    series: 'GX',
    visualAnchor:
      'Tall lanky frame, aristocratic face with lipstick and earrings, blonde hair in long ponytail, blue-and-yellow Academy coat, mechanical Ancient Gear Duel Vest.',
    actionAnchor:
      'Cinematic anime medium shot. Dr. Crowler flaps his fan with high-pitched snobbish theatricality: "Na-no da!" Massive clanking brass gears, spinning cogs, and hissing steam clouds erupt around him as his wearable Ancient Gear Duel Vest whirs loudly to life.',
  },
];

export function buildPrompt(character: CharacterVideoConfig): string {
  return `Creating a video for YuGiOh character ${character.name}.
- Aspect Ratio: 16:9 widescreen (1920x1080).
- Target Duration: 4 seconds per clip.
- Framerate: 24fps or 30fps (smooth cinematic anime motion).
- Output Format: H.264 .mp4, audio optional or muted (in-game audio engine mixes SFX/BGM dynamically).
- Universal Style Anchor:
  "${UNIVERSAL_STYLE_ANCHOR}"
- Visual Anchor: ${character.visualAnchor}
- Action Anchor: ${character.actionAnchor}`;
}

async function generateSingleVideo(ai: GoogleGenAI, character: CharacterVideoConfig, outputDir: string): Promise<boolean> {
  const targetPath = path.join(outputDir, `${character.id}.mp4`);
  if (existsSync(targetPath)) {
    console.log(`[Veo/Omni] Video already exists: ${character.id}.mp4 — skipping.`);
    return true;
  }

  const prompt = buildPrompt(character);

  console.log(`\n========================================`);
  console.log(`[Veo/Omni] Generating YuGiOh video for: ${character.name} (${character.series})`);
  console.log(`[Veo/Omni] Target file: ${character.id}.mp4`);
  console.log(`========================================`);

  const models = ['veo-3.1-fast-generate-preview', 'veo-3.1-generate-preview', 'veo-3.1-lite-generate-preview'];

  for (const model of models) {
    try {
      console.log(`[Veo/Omni] Requesting model ${model}...`);
      let operation = await ai.models.generateVideos({
        model,
        source: { prompt },
        config: {
          numberOfVideos: 1,
          aspectRatio: '16:9',
          resolution: '720p',
          durationSeconds: 4,
        },
      });

      console.log(`[Veo/Omni] Operation queued: ${operation.name}`);

      while (!operation.done) {
        console.log(`[Veo/Omni] Generation in progress... waiting 10s`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const generated = operation.response?.generatedVideos?.[0];
      const videoUri = generated?.video?.uri;
      if (!videoUri) {
        console.error(`[Veo/Omni] No video URI returned from operation.`);
        continue;
      }

      console.log(`[Veo/Omni] Video generated! Downloading from ${videoUri}...`);
      const downloadRes = await fetch(`${videoUri}&key=${API_KEY}`);
      const arrayBuffer = await downloadRes.arrayBuffer();
      await writeFile(targetPath, Buffer.from(arrayBuffer));
      console.log(`[Veo/Omni] ✓ Successfully saved to: ${targetPath} (${arrayBuffer.byteLength} bytes)`);
      return true;
    } catch (err: unknown) {
      const errorObj = err as { message?: string; status?: number };
      console.warn(`[Veo/Omni] Model ${model} returned:`, errorObj?.message || String(err));
      if (errorObj?.status === 429) {
        console.error(`[Veo/Omni] Quota exceeded (429 RESOURCE_EXHAUSTED). Video generation models (Veo) require an API project with active billing / quota.`);
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
    ? CHARACTERS.filter((c) => c.id === targetCharArg || c.name.toLowerCase().includes(targetCharArg.toLowerCase()))
    : CHARACTERS;

  if (charactersToProcess.length === 0) {
    console.error(`No matching character found for: ${targetCharArg}`);
    process.exit(1);
  }

  console.log(`Starting YuGiOh character video generator for ${charactersToProcess.length} character(s)...`);

  for (const character of charactersToProcess) {
    const success = await generateSingleVideo(ai, character, outputDir);
    if (!success) {
      console.log(`\nGeneration paused for ${character.name}.`);
      break;
    }
  }
}

main().catch((err) => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
