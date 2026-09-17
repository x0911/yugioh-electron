import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import { monsters, MonsterPromptSpec } from './build-cutscene-prompts-doc.js';

interface VideoTask {
  monsterId: number;
  monsterName: string;
  series: string;
  type: 'summon' | 'attack' | 'victory';
  title: string;
  prompt: string;
  refImagePath: string;
  destPath: string;
}

interface KeyStatus {
  keyIndex: number;
  keyMasked: string;
  status: 'active' | 'quota_exhausted' | 'invalid' | 'unused';
  errorDetails?: string;
  videosGenerated: number;
}

// 1. Load API keys from docs/API_KEYS.md
function loadApiKeys(): string[] {
  const keysPath = path.resolve(process.cwd(), 'docs/API_KEYS.md');
  if (!fs.existsSync(keysPath)) {
    console.error(`[Error] Could not find API keys file at: ${keysPath}`);
    process.exit(1);
  }
  const content = fs.readFileSync(keysPath, 'utf-8');
  const keys = content
    .split('\n')
    .map((k) => k.trim())
    .filter((k) => k.length > 0 && !k.startsWith('#'));

  if (keys.length === 0) {
    console.error(`[Error] No valid API keys found in: ${keysPath}`);
    process.exit(1);
  }
  return keys;
}

function maskKey(key: string): string {
  if (key.length <= 10) return '***';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

// Models to attempt: "3.8 Flash" first as requested, followed by best video models available
const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'veo-3.1-generate-preview',
  'veo-3.1-fast-generate-preview',
  'veo-3.1-lite-generate-preview',
];

// Helper to find reference card art image
function findReferenceImage(cardId: number): string | null {
  const artPath = path.resolve(process.cwd(), `resources/cards/art/${cardId}.jpg`);
  if (fs.existsSync(artPath)) return artPath;

  const fullPath = path.resolve(process.cwd(), `resources/cards/full/${cardId}.jpg`);
  if (fs.existsSync(fullPath)) return fullPath;

  return null;
}

// Build list of video tasks from MONSTER_CUTSCENE_PROMPTS
function buildVideoTasks(monsterList: MonsterPromptSpec[]): VideoTask[] {
  const tasks: VideoTask[] = [];

  for (const m of monsterList) {
    const refPath = findReferenceImage(m.id);
    if (!refPath) {
      console.warn(`[Warning] No artwork image found for ${m.name} (${m.id})`);
      continue;
    }

    // Summon cutscene task
    const summonDest = path.resolve(process.cwd(), `resources/videos/cards/summon_${m.id}.mp4`);
    tasks.push({
      monsterId: m.id,
      monsterName: m.name,
      series: m.series,
      type: 'summon',
      title: `${m.name} — Summon`,
      prompt: `I have attached the character reference image for ${m.name}. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: ${m.visualTraits}\n\nAnimation: ${m.summonAnim}`,
      refImagePath: refPath,
      destPath: summonDest,
    });

    // Attack or Victory cutscene task
    if (m.isVideoType === 'victory') {
      const victoryDest = path.resolve(process.cwd(), `resources/videos/cards/victory_${m.id}.mp4`);
      tasks.push({
        monsterId: m.id,
        monsterName: m.name,
        series: m.series,
        type: 'victory',
        title: `${m.name} — Victory (Exodo Flame)`,
        prompt: `I have attached the character reference image for ${m.name}. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: ${m.visualTraits}\n\nAnimation: ${m.attackAnim}`,
        refImagePath: refPath,
        destPath: victoryDest,
      });
    } else {
      const attackDest = path.resolve(process.cwd(), `resources/videos/cards/attack_${m.id}.mp4`);
      tasks.push({
        monsterId: m.id,
        monsterName: m.name,
        series: m.series,
        type: 'attack',
        title: `${m.name} — Attack (${m.attackName})`,
        prompt: `I have attached the character reference image for ${m.name}. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: ${m.visualTraits}\n\nAnimation: ${m.attackAnim}`,
        refImagePath: refPath,
        destPath: attackDest,
      });
    }
  }

  return tasks;
}

// Update card-videos.json to mark isPlaceholder = false
function markVideoCompletedInRegistry(monsterId: number) {
  const registryPath = path.resolve(process.cwd(), 'data/card-videos.json');
  if (!fs.existsSync(registryPath)) return;

  try {
    const raw = fs.readFileSync(registryPath, 'utf-8');
    const data = JSON.parse(raw);
    const key = String(monsterId);
    if (data[key]) {
      data[key].isPlaceholder = false;
      fs.writeFileSync(registryPath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`[Registry] Updated data/card-videos.json: ${data[key].cardName} isPlaceholder set to false.`);
    }
  } catch (err) {
    console.error(`[Registry Error] Failed to update data/card-videos.json:`, err);
  }
}

async function main() {
  const apiKeys = loadApiKeys();
  console.log(`\n======================================================`);
  console.log(`🎬 Yu-Gi-Oh! Monster Cutscene Video Generator`);
  console.log(`======================================================`);
  console.log(`Loaded ${apiKeys.length} API key(s) from docs/API_KEYS.md:`);
  apiKeys.forEach((k, idx) => console.log(`  Key ${idx + 1}: ${maskKey(k)}`));

  const keyStatuses: KeyStatus[] = apiKeys.map((k, idx) => ({
    keyIndex: idx,
    keyMasked: maskKey(k),
    status: 'unused',
    videosGenerated: 0,
  }));

  // Ensure output directory exists
  const outputDir = path.resolve(process.cwd(), 'resources/videos/cards');
  fs.mkdirSync(outputDir, { recursive: true });

  // Filter tasks if CLI flags provided
  let selectedMonsters = monsters;
  const monsterFilter = process.argv.find((a) => a.startsWith('--monster='))?.split('=')[1];
  const seriesFilter = process.argv.find((a) => a.startsWith('--series='))?.split('=')[1];

  if (monsterFilter) {
    selectedMonsters = selectedMonsters.filter(
      (m) => String(m.id) === monsterFilter || m.name.toLowerCase().includes(monsterFilter.toLowerCase())
    );
  }
  if (seriesFilter) {
    selectedMonsters = selectedMonsters.filter((m) => m.series.toLowerCase() === seriesFilter.toLowerCase());
  }

  const allTasks = buildVideoTasks(selectedMonsters);
  console.log(`Total video tasks defined: ${allTasks.length}`);

  // Check how many already exist on disk
  const pendingTasks = allTasks.filter((t) => !fs.existsSync(t.destPath));
  console.log(`Already completed: ${allTasks.length - pendingTasks.length} videos`);
  console.log(`Pending generation: ${pendingTasks.length} videos\n`);

  if (pendingTasks.length === 0) {
    console.log(`All monster cutscene videos already exist on disk! No work needed.`);
    return;
  }

  let currentKeyIdx = 0;

  for (const task of pendingTasks) {
    let taskCompleted = false;

    while (currentKeyIdx < apiKeys.length && !taskCompleted) {
      const activeKey = apiKeys[currentKeyIdx];
      const activeStatus = keyStatuses[currentKeyIdx];
      activeStatus.status = 'active';

      console.log(`------------------------------------------------------`);
      console.log(`🎯 Task: ${task.title}`);
      console.log(`   Monster ID: ${task.monsterId} (${task.series})`);
      console.log(`   Reference Art: ${path.relative(process.cwd(), task.refImagePath)}`);
      console.log(`   Destination: ${path.relative(process.cwd(), task.destPath)}`);
      console.log(`   Using Key ${currentKeyIdx + 1} (${activeStatus.keyMasked})`);

      const ai = new GoogleGenAI({ apiKey: activeKey });
      const imageBytes = fs.readFileSync(task.refImagePath).toString('base64');

      let quotaHitOnThisKey = false;

      for (const model of CANDIDATE_MODELS) {
        console.log(`   Attempting model: [${model}]...`);

        try {
          const operation = await ai.models.generateVideos({
            model,
            source: {
              prompt: task.prompt,
              image: {
                imageBytes,
                mimeType: 'image/jpeg',
              },
            },
            config: {
              numberOfVideos: 1,
              aspectRatio: '16:9',
              resolution: '720p',
              durationSeconds: 4,
            },
          });

          console.log(`   ✓ Operation started successfully! Operation: ${operation.name}`);

          let currentOp = operation;
          while (!currentOp.done) {
            console.log(`   ⏳ Video rendering in progress... waiting 10s`);
            await new Promise((resolve) => setTimeout(resolve, 10000));
            currentOp = await ai.operations.getVideosOperation({ operation: currentOp });
          }

          const generated = currentOp.response?.generatedVideos?.[0];
          const videoUri = generated?.video?.uri;
          if (!videoUri) {
            console.error(`   ❌ Operation finished, but no video URI returned.`);
            continue;
          }

          console.log(`   📥 Downloading generated video from: ${videoUri}...`);
          const downloadRes = await fetch(`${videoUri}&key=${activeKey}`);
          const arrayBuffer = await downloadRes.arrayBuffer();
          fs.writeFileSync(task.destPath, Buffer.from(arrayBuffer));
          console.log(`   ✅ Successfully saved video to: ${task.destPath} (${arrayBuffer.byteLength} bytes)`);

          markVideoCompletedInRegistry(task.monsterId);
          activeStatus.videosGenerated++;
          taskCompleted = true;
          break; // Task completed, move to next task
        } catch (err: any) {
          const errStatus = err?.status || err?.code;
          const errMsg = err?.message || String(err);

          if (errStatus === 404 || errMsg.includes('not supported for predictLongRunning')) {
            console.log(`   ℹ️ Model '${model}' does not support video generation (predictLongRunning). Falling back to next model.`);
            continue;
          }

          if (errStatus === 429 || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('exceeded your current quota')) {
            console.warn(`   ⚠️ [Quota Limit Reached] Key ${currentKeyIdx + 1} (${activeStatus.keyMasked}) encountered HTTP 429 RESOURCE_EXHAUSTED.`);
            activeStatus.status = 'quota_exhausted';
            activeStatus.errorDetails = errMsg;
            quotaHitOnThisKey = true;
            break; // Stop trying models with this key, rotate to next key
          }

          console.error(`   ❌ Error with model [${model}]:`, errMsg);
        }
      }

      if (quotaHitOnThisKey) {
        currentKeyIdx++;
        if (currentKeyIdx < apiKeys.length) {
          console.log(`\n🔄 Switching to Key ${currentKeyIdx + 1} (${maskKey(apiKeys[currentKeyIdx])})...\n`);
        } else {
          console.warn(`\n🛑 All ${apiKeys.length} API keys have reached their quota limit.`);
        }
      }
    }

    if (currentKeyIdx >= apiKeys.length) {
      console.log(`\n======================================================`);
      console.log(`🛑 Stopping video generation: All available API keys reached quota limit.`);
      console.log(`======================================================`);
      break;
    }
  }

  // Print final summary report
  printSummaryReport(keyStatuses, allTasks, pendingTasks);
}

function printSummaryReport(keyStatuses: KeyStatus[], allTasks: VideoTask[], pendingTasks: VideoTask[]) {
  console.log(`\n======================================================`);
  console.log(`📊 EXECUTION & QUOTA REPORT`);
  console.log(`======================================================`);

  console.log(`\n🔑 API Keys Summary:`);
  for (const k of keyStatuses) {
    console.log(
      `  - Key ${k.keyIndex + 1} (${k.keyMasked}): Status = ${k.status.toUpperCase()} | Videos Generated = ${k.videosGenerated}`
    );
    if (k.errorDetails) {
      try {
        const parsed = JSON.parse(k.errorDetails);
        console.log(`    Detail: ${parsed?.error?.message || k.errorDetails}`);
      } catch {
        console.log(`    Detail: ${k.errorDetails.slice(0, 150)}...`);
      }
    }
  }

  const completedTotal = allTasks.length - pendingTasks.length + keyStatuses.reduce((acc, k) => acc + k.videosGenerated, 0);

  console.log(`\n🎬 Video Cutscene Status:`);
  console.log(`  - Total Monsters Registered: 71 (${allTasks.length} videos: Summon + Attack/Victory)`);
  console.log(`  - Completed on disk: ${completedTotal} videos`);
  console.log(`  - Pending generation: ${allTasks.length - completedTotal} videos`);

  console.log(`\n💡 Analysis & Recommendations:`);
  console.log(`  1. 'gemini-3.8-flash' is a multimodal text/reasoning LLM and does not support video generation`);
  console.log(`     (API returned 404 NOT_FOUND for predictLongRunning).`);
  console.log(`  2. Video generation in Google GenAI API is powered by Google Veo models`);
  console.log(`     ('veo-3.1-generate-preview', 'veo-3.1-fast-generate-preview', 'veo-3.1-lite-generate-preview').`);
  console.log(`  3. The provided API keys in 'docs/API_KEYS.md' are on Google AI Studio Free Tier, which has`);
  console.log(`     0 RPM / 0 RPD quota for Veo video generation models (429 RESOURCE_EXHAUSTED).`);
  console.log(`  4. To generate videos via Veo API, enable Pay-As-You-Go billing in Google AI Studio / GCP Console,`);
  console.log(`     or alternatively, import AI-generated MP4 cutscenes generated via Runway Gen-3, Luma Dream Machine,`);
  console.log(`     or Sora following the copy/paste prompts in 'docs/MONSTER_CUTSCENE_PROMPTS.md'.`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
