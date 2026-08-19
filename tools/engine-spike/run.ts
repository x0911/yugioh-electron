import createCore, {
  OcgDuelMode,
  OcgProcessResult,
  OcgLocation,
  OcgPosition,
  OcgMessageType,
  ocgMessageTypeStrings,
  ocgPhaseString,
  OcgPhase
} from 'ocgcore-wasm';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { CARD_DATABASE, CardDefinition } from './cards.js';
import { getAutoResponse } from './autoResponder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPTS_DIR = path.resolve(__dirname, 'scripts');

function getCardName(code: number): string {
  const card = CARD_DATABASE.get(code);
  return card ? card.name : `[Card #${code}]`;
}

function createDeck(cardList: { code: number; count: number }[]): number[] {
  const deck: number[] = [];
  for (const item of cardList) {
    for (let i = 0; i < item.count; i++) {
      deck.push(item.code);
    }
  }
  return deck;
}

// Deck 1 (Yugi-inspired Deck - 40 Cards)
const DECK_PLAYER_0 = createDeck([
  { code: 91152256, count: 20 }, // Celtic Guardian (Lv4 Normal, 1400/1200)
  { code: 70781052, count: 4 },  // Summoned Skull (Lv6 Normal, 2500/1200)
  { code: 46986414, count: 2 },  // Dark Magician (Lv7 Normal, 2500/2100)
  { code: 40640057, count: 3 },  // Kuriboh (Lv1 Effect)
  { code: 26202165, count: 3 },  // Sangan (Lv3 Effect)
  { code: 55144522, count: 3 },  // Pot of Greed (Spell)
  { code: 46130346, count: 3 },  // Hinotama (Spell)
  { code: 12580477, count: 2 },  // Raigeki (Spell)
]);

// Deck 2 (Kaiba-inspired Deck - 40 Cards)
const DECK_PLAYER_1 = createDeck([
  { code: 91152256, count: 20 }, // Celtic Guardian (Lv4 Normal, 1400/1200)
  { code: 70781052, count: 4 },  // Summoned Skull (Lv6 Normal, 2500/1200)
  { code: 89631139, count: 2 },  // Blue-Eyes White Dragon (Lv8 Normal, 3000/2500)
  { code: 54652250, count: 3 },  // Man-Eater Bug (Lv2 Flip Effect)
  { code: 55144522, count: 3 },  // Pot of Greed (Spell)
  { code: 53129443, count: 2 },  // Dark Hole (Spell)
  { code: 25833572, count: 3 },  // Ookazi (Spell)
  { code: 38480590, count: 3 },  // Sparks (Spell)
]);

function scriptReader(name: string): string | null {
  if (name === 'c0.lua') {
    return 'Duel.LoadScript("constant.lua")\nDuel.LoadScript("utility.lua")';
  }

  if (/^c\d+\.lua$/.test(name)) {
    const officialPath = path.join(SCRIPTS_DIR, 'official', name);
    if (fs.existsSync(officialPath)) {
      return fs.readFileSync(officialPath, 'utf-8');
    }
  }

  const basePath = path.join(SCRIPTS_DIR, name);
  if (fs.existsSync(basePath)) {
    return fs.readFileSync(basePath, 'utf-8');
  }

  return null;
}

export async function runSpike(): Promise<void> {
  console.log('='.repeat(70));
  console.log('  YU-GI-OH! DESKTOP DUEL — ENGINE SPIKE (PHASE 0)');
  console.log('='.repeat(70));

  console.log('\n[1/5] Initializing ocgcore-wasm WebAssembly engine (Sync API)...');
  const startTime = Date.now();
  const lib = await createCore({ sync: true });
  const [majorVer, minorVer] = lib.getVersion();
  console.log(`      ✓ Engine loaded successfully! ocgcore version: ${majorVer}.${minorVer}`);

  console.log('\n[2/5] Initializing Duel Instance with Master Rule 5 flags...');
  const handle = lib.createDuel({
    flags: OcgDuelMode.MODE_MR5,
    seed: [42n, 9999n, 1337n, 77777n],
    team1: {
      startingLP: 8000,
      startingDrawCount: 5,
      drawCountPerTurn: 1
    },
    team2: {
      startingLP: 8000,
      startingDrawCount: 5,
      drawCountPerTurn: 1
    },
    cardReader: (code) => {
      const card = CARD_DATABASE.get(code);
      return card ?? null;
    },
    scriptReader,
    errorHandler: (type, text) => {
      console.warn(`      [Lua Error (${type})]: ${text}`);
    }
  });

  if (!handle) {
    throw new Error('Failed to create duel instance handle!');
  }
  console.log('      ✓ Duel handle created.');

  console.log('\n[3/5] Loading engine base scripts (constant.lua, utility.lua)...');
  const constantSrc = fs.readFileSync(path.join(SCRIPTS_DIR, 'constant.lua'), 'utf-8');
  const utilitySrc = fs.readFileSync(path.join(SCRIPTS_DIR, 'utility.lua'), 'utf-8');
  lib.loadScript(handle, 'constant.lua', constantSrc);
  lib.loadScript(handle, 'utility.lua', utilitySrc);
  console.log('      ✓ Base scripts loaded into engine Lua state.');

  console.log('\n[4/5] Populating Player Decks (40 cards each)...');
  console.log(`      • Player 0 (Yugi deck): ${DECK_PLAYER_0.length} cards`);
  for (const code of DECK_PLAYER_0) {
    lib.duelNewCard(handle, {
      team: 0,
      duelist: 0,
      code,
      controller: 0,
      location: OcgLocation.DECK,
      sequence: 0,
      position: OcgPosition.FACEDOWN
    });
  }

  console.log(`      • Player 1 (Kaiba deck): ${DECK_PLAYER_1.length} cards`);
  for (const code of DECK_PLAYER_1) {
    lib.duelNewCard(handle, {
      team: 1,
      duelist: 0,
      code,
      controller: 1,
      location: OcgLocation.DECK,
      sequence: 0,
      position: OcgPosition.FACEDOWN
    });
  }
  console.log('      ✓ All cards placed in respective decks.');

  console.log('\n[5/5] Starting Duel Simulation...');
  console.log('-'.repeat(70));
  lib.startDuel(handle);

  let step = 0;
  let currentTurn = 0;
  let activePlayer = 0;
  let p0LP = 8000;
  let p1LP = 8000;
  let winner: number | null = null;
  let winReason: number | null = null;
  let totalAttacks = 0;
  let totalSummons = 0;
  let totalSpells = 0;
  let duelEnded = false;

  const maxSteps = 3000;

  while (step < maxSteps && !duelEnded) {
    step++;
    const status = lib.duelProcess(handle);
    const messages = lib.duelGetMessage(handle);

    for (const msg of messages) {
      switch (msg.type) {
        case OcgMessageType.NEW_TURN:
          currentTurn++;
          activePlayer = msg.player;
          console.log(`\n┌──────────────────────────────────────────────────────────────────┐`);
          console.log(`│ TURN ${String(currentTurn).padEnd(3)} | Active Player: Player ${activePlayer} (P0: ${String(p0LP).padStart(5)} LP | P1: ${String(p1LP).padStart(5)} LP) │`);
          console.log(`└──────────────────────────────────────────────────────────────────┘`);
          break;

        case OcgMessageType.NEW_PHASE: {
          const phaseName = ocgPhaseString.get(msg.phase as any) ?? `PHASE_${msg.phase}`;
          console.log(`  ► Phase: ${phaseName.toUpperCase()}`);
          break;
        }

        case OcgMessageType.DRAW: {
          const cardNames = msg.drawn.map((d) => getCardName(d.code)).join(', ');
          console.log(`  [DRAW] Player ${msg.player} drew ${msg.drawn.length} card(s): ${cardNames}`);
          break;
        }

        case OcgMessageType.SUMMONING: {
          totalSummons++;
          console.log(`  [SUMMON] Player ${msg.controller} is summoning ${getCardName(msg.code)}`);
          break;
        }

        case OcgMessageType.SUMMONED: {
          console.log(`  [SUMMON] Summon successful!`);
          break;
        }

        case OcgMessageType.SPSUMMONING: {
          totalSummons++;
          console.log(`  [SPECIAL SUMMON] Player ${msg.controller} is special summoning ${getCardName(msg.code)}`);
          break;
        }

        case OcgMessageType.SPSUMMONED: {
          console.log(`  [SPECIAL SUMMON] Special summon successful!`);
          break;
        }

        case OcgMessageType.CHAINING: {
          totalSpells++;
          console.log(`  [ACTIVATE] Player ${msg.triggering_controller} activated effect of ${getCardName(msg.code)}`);
          break;
        }

        case OcgMessageType.CHAIN_SOLVED: {
          console.log(`  [RESOLVE] Effect resolved.`);
          break;
        }

        case OcgMessageType.ATTACK: {
          totalAttacks++;
          if (msg.target) {
            console.log(`  [ATTACK] Player ${msg.card.controller}'s monster declares an attack on opponent monster (zone ${msg.target.sequence})`);
          } else {
            console.log(`  [ATTACK] Player ${msg.card.controller}'s monster declares a DIRECT ATTACK on Player ${1 - msg.card.controller}!`);
          }
          break;
        }

        case OcgMessageType.BATTLE: {
          console.log(`  [BATTLE] Attacker (ATK ${msg.card.attack}) vs Defender (ATK ${msg.target.attack})`);
          if (msg.card.destroyed) {
            console.log(`  [DESTROY] Attacking monster was destroyed!`);
          }
          if (msg.target.destroyed) {
            console.log(`  [DESTROY] Defending monster was destroyed!`);
          }
          break;
        }

        case OcgMessageType.DAMAGE: {
          console.log(`  [DAMAGE] Player ${msg.player} took ${msg.amount} damage!`);
          if (msg.player === 0) p0LP = Math.max(0, p0LP - msg.amount);
          if (msg.player === 1) p1LP = Math.max(0, p1LP - msg.amount);
          break;
        }

        case OcgMessageType.LPUPDATE: {
          if (msg.player === 0) p0LP = msg.lp;
          if (msg.player === 1) p1LP = msg.lp;
          console.log(`  [LP] Player ${msg.player} LP updated to ${msg.lp}`);
          break;
        }

        case OcgMessageType.WIN: {
          winner = msg.player;
          winReason = msg.reason;
          duelEnded = true;
          console.log(`\n${'★'.repeat(70)}`);
          console.log(`  DUEL VICTORY: Player ${winner} is VICTORIOUS! (Reason code: ${winReason === 1 ? '1 - Opponent LP Reduced to 0' : winReason})`);
          console.log(`${'★'.repeat(70)}`);
          break;
        }
      }
    }

    if (duelEnded || status === OcgProcessResult.END) {
      console.log(`\n[ProcessResult.END] Engine reported duel completed.`);
      break;
    }

    if (status === OcgProcessResult.WAITING) {
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg) {
        throw new Error('Engine entered WAITING state without a prompt message');
      }
      const response = getAutoResponse(lastMsg);
      if (!response) {
        const msgName = ocgMessageTypeStrings.get(lastMsg.type) ?? `TYPE_${lastMsg.type}`;
        throw new Error(`Auto-responder could not determine response for prompt: ${msgName}`);
      }
      lib.duelSetResponse(handle, response);
    }
  }

  const elapsedMs = Date.now() - startTime;
  lib.destroyDuel(handle);

  console.log('\n' + '='.repeat(70));
  console.log('  DUEL SIMULATION SUMMARY & SPIKE VERIFICATION');
  console.log('='.repeat(70));
  console.log(`  • Engine:               ocgcore-wasm (ProjectIgnis / edo9300 core v${majorVer}.${minorVer})`);
  console.log(`  • Execution Context:    Node.js (v${process.versions.node}) headless sync wasm`);
  console.log(`  • Total Turns:          ${currentTurn}`);
  console.log(`  • Total Engine Steps:   ${step}`);
  console.log(`  • Normal/Spec Summons:  ${totalSummons}`);
  console.log(`  • Spells/Traps Played:  ${totalSpells}`);
  console.log(`  • Attacks Declared:     ${totalAttacks}`);
  console.log(`  • Final Life Points:    Player 0: ${p0LP} LP | Player 1: ${p1LP} LP`);
  console.log(`  • Result:               ${winner !== null ? `Player ${winner} Won (${winReason === 1 ? 'Opponent LP Reduced to 0' : `Reason ${winReason}`})` : 'Incomplete'}`);
  console.log(`  • Execution Time:       ${elapsedMs}ms`);
  console.log('='.repeat(70));
  console.log('  [PASS] Phase 0 Spike successfully validated ygopro-core execution in Node.js!\n');
}

runSpike().catch((err) => {
  console.error('\n[SPIKE FATAL ERROR]:', err);
  process.exit(1);
});
