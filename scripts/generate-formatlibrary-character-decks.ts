import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { generateManifest } from './generate-update-manifest.js';
import type { CharacterData, CharacterDeckData } from '../src/shared/types/character.js';
import type { CustomDeck } from '../src/shared/types/deck.js';

const ROOT_DIR = process.cwd();
const CACHE_FILE = path.resolve(ROOT_DIR, 'data/formatlibrary-cache/validated-tournament-decks.json');
const POOL_PATH = path.resolve(ROOT_DIR, 'data/card-pool-whitelist.json');
const CDB_PATH = path.resolve(ROOT_DIR, 'resources/cards.cdb');
const DECKS_DIR = path.resolve(ROOT_DIR, 'resources/decks');
const CHARACTERS_JSON_PATH = path.resolve(ROOT_DIR, 'data/characters.json');
const PREBUILT_DECKS_PATH = path.resolve(ROOT_DIR, 'data/prebuilt-decks.json');

if (!fs.existsSync(DECKS_DIR)) {
  fs.mkdirSync(DECKS_DIR, { recursive: true });
}

const pool = JSON.parse(fs.readFileSync(POOL_PATH, 'utf-8'));
const db = new Database(CDB_PATH, { readonly: true });
const checkDbStmt = db.prepare('SELECT d.id, t.name FROM datas d JOIN texts t ON d.id = t.id WHERE d.id = ?');

interface TournamentDeckRecord {
  id: number;
  name: string;
  deckTypeName: string;
  formatName: string;
  placement: number;
  event: string;
  builderName: string;
  main: number[];
  extra: number[];
  side: number[];
}

export function writeYdkFile(filePath: string, main: number[], extra: number[], side: number[] = []): void {
  const lines: string[] = ['#created by Format Library Tournament Importer', '#main'];
  for (const id of main) lines.push(String(id));
  lines.push('#extra');
  for (const id of extra) lines.push(String(id));
  lines.push('!side');
  for (const id of side) lines.push(String(id));
  lines.push('');
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
}

export interface CharacterRule {
  id: string;
  name: string;
  series: 'DM' | 'GX';
  mustIds?: number[];
  keywords: string[];
  preferred: string[];
  disallowed?: string[];
  maxPerArchetype?: number;
}

export const CHARACTER_RULES: CharacterRule[] = [
  // --- 20 DM CHARACTERS ---
  {
    id: 'yugi-muto',
    name: 'Yugi Muto',
    series: 'DM',
    mustIds: [39153],
    keywords: ['gadget', 'magnet warrior', 'valkyrion', 'silent swordsman', 'silent magician', 'gandora', 'marshmallon', 'blockman', 'alpha', 'beta', 'gamma'],
    preferred: ['gadget', 'pacman', 'earth beat', 'rock stun', 'counter fairy'],
    disallowed: ['dark magician', 'chimeratech', 'zombie'],
  },
  {
    id: 'yami-yugi',
    name: 'Yami Yugi',
    series: 'DM',
    mustIds: [39153, 36990, 48430],
    keywords: ['slifer', 'dark magician', 'buster blader', 'black luster soldier', 'breaker the magical warrior', 'dark paladin', 'skilled dark magician', 'kuriboh'],
    preferred: ['paladin turbo', 'dark magician turbo', 'creator turbo', 'chaos control', 'goat control', 'reasoning gate turbo'],
    disallowed: ['gadget', 'volcanic', 'harpie', 'amazoness'],
  },
  {
    id: 'seto-kaiba',
    name: 'Seto Kaiba',
    series: 'DM',
    mustIds: [39153, 54407, 52207, 35503],
    keywords: ['obelisk', 'blue-eyes', 'xyz-dragon', 'x-head', 'y-dragon', 'z-metal', 'vorse raider', 'enemy controller', 'crush card', 'ring of destruction'],
    preferred: ['blue-eyes', 'dragon turbo', 'stein otk', 'chaos return', 'virus control', 'chaos control'],
    disallowed: ['gadget', 'volcanic', 'harpie', 'amazoness', 'zombie'],
  },
  {
    id: 'joey-wheeler',
    name: 'Joey Wheeler',
    series: 'DM',
    mustIds: [3159, 84083, 35515, 35505],
    keywords: ['red-eyes', 'jinzo', 'gearfried', 'gilford', 'time wizard', 'scapegoat', 'rocket warrior', 'alligator'],
    preferred: ['coin control', 'gearfried', 'cat otk', 'ben kei otk', 'warrior control', 'warrior', 'reasoning gate turbo'],
    disallowed: ['dark magician', 'blue-eyes', 'counter fairy', 'gadget'],
  },
  {
    id: 'tea-gardner',
    name: 'Téa Gardner',
    series: 'DM',
    keywords: ['injection fairy lily', 'magician of faith', 'solemn wishes', 'shining angel', 'dunames dark witch', 'maha vailo', 'fire princess'],
    preferred: ['counter fairy', 'fairy', 'lily beat', 'goat control', 'chaos control'],
    disallowed: ['machine otk', 'zombie', 'demise'],
  },
  {
    id: 'tristan-taylor',
    name: 'Tristan Taylor',
    series: 'DM',
    keywords: ['berserk gorilla', 'enraged battle ox', 'cyber commander', 'command knight', 'exiled force'],
    preferred: ['earth beat', 'beast', 'warrior', 'skill drain'],
    disallowed: ['dark magician', 'blue-eyes', 'counter fairy'],
  },
  {
    id: 'mai-valentine',
    name: 'Mai Valentine',
    series: 'DM',
    keywords: ['harpie', 'amazoness', 'elegant egotist', 'birdface', 'sonic duck', 'icarus'],
    preferred: ['harpie', 'amazoness harpie', 'wind beat', 'warrior'],
    disallowed: ['machine', 'zombie', 'dark magician'],
  },
  {
    id: 'bakura-ryou',
    name: 'Bakura Ryou',
    series: 'DM',
    mustIds: [82261, 83815, 83818],
    keywords: ['dark necrofear', 'morphing jar', 'night assailant', 'doomcaliber knight', 'destiny board', 'sangan', 'witch of the black forest'],
    preferred: ['strike ninja return', 'empty jar', 'jar turbo', 'fiend', 'zombie', 'chaos control'],
    disallowed: ['blue-eyes', 'gadget', 'counter fairy'],
  },
  {
    id: 'marik-ishtar',
    name: 'Marik Ishtar',
    series: 'DM',
    mustIds: [39153, 83780, 83802],
    keywords: ['winged dragon of ra', 'lava golem', 'bowganian', 'nightmare wheel', 'mask of restrict', 'stealth bird'],
    preferred: ['stall burn', 'panda burn', 'chain burn', 'burn', 'drain burn'],
    disallowed: ['blue-eyes', 'machine otk', 'gadget'],
  },
  {
    id: 'maximillion-pegasus',
    name: 'Maximillion Pegasus',
    series: 'DM',
    mustIds: [79043, 77955, 75352],
    keywords: ['relinquished', 'thousand-eyes', 'toon', 'black illusion ritual', 'tsukuyomi'],
    preferred: ['relinquished', 'relinquished burn', 'goat control', 'toons'],
    disallowed: ['machine otk', 'zombie', 'gadget'],
  },
  {
    id: 'bandit-keith',
    name: 'Bandit Keith',
    series: 'DM',
    mustIds: [3159, 83872, 83875],
    keywords: ['blowback dragon', 'barrel dragon', 'machine king', 'limiter removal', 'heavy mech support', 'cyber dragon'],
    preferred: ['coin control', 'machine otk', 'chaos machine', 'machine beat'],
    disallowed: ['fairy', 'spellcaster', 'relinquished'],
  },
  {
    id: 'weevil-underwood',
    name: 'Weevil Underwood',
    series: 'DM',
    mustIds: [83881],
    keywords: ['doom dozer', 'insect queen', 'pinch hopper', 'howling insect', 'man-eater bug'],
    preferred: ['demise otk', 'insect', 'plant insect', 'earth beat'],
    disallowed: ['blue-eyes', 'dark magician', 'fairy'],
  },
  {
    id: 'rex-raptor',
    name: 'Rex Raptor',
    series: 'DM',
    keywords: ['tyranno', 'hydrogeddon', 'oxygeddon', 'frostosaurus', 'jurassic', 'sabersaurus', 'hyper hammerhead'],
    preferred: ['dinosaur', 'earth beat', 'vanilla beat'],
    disallowed: ['fairy', 'dark magician', 'spellcaster'],
  },
  {
    id: 'mako-tsunami',
    name: 'Mako Tsunami',
    series: 'DM',
    keywords: ['fisherman', 'daedalus', 'abyss soldier', 'legendary ocean', 'amphibian beast', 'fenrir', 'yomi ship'],
    preferred: ['ocean control', 'umi beat', 'water control', 'water beat'],
    disallowed: ['machine otk', 'fairy', 'zombie'],
  },
  {
    id: 'ishizu-ishtar',
    name: 'Ishizu Ishtar',
    series: 'DM',
    mustIds: [83890, 83891, 83892],
    keywords: ['gravekeeper', 'necrovalley', 'mudora', 'kelbek', 'agido', 'exchange of the spirit'],
    preferred: ['gravekeeper', 'gravekeeper burn', 'gravekeeper monarch'],
    disallowed: ['machine otk', 'volcanic', 'harpie'],
  },
  {
    id: 'odion',
    name: 'Odion',
    series: 'DM',
    keywords: ['serket', 'apophis', 'solemn judgment', 'metal reflect slime', 'trap monster', 'magic jammer'],
    preferred: ['macro stun', 'macro monarch', 'counter fairy', 'drain burn'],
    disallowed: ['blue-eyes', 'dark magician', 'gadget'],
  },
  {
    id: 'espa-roba',
    name: 'Espa Roba',
    series: 'DM',
    keywords: ['jinzo', 'cyber-stein', 'reflect bounder', 'heavy mech support'],
    preferred: ['machine beat', 'machine otk', 'chaos machine', 'stein otk'],
    disallowed: ['fairy', 'spellcaster', 'relinquished'],
  },
  {
    id: 'arkana',
    name: 'Arkana',
    series: 'DM',
    mustIds: [48430, 36990],
    keywords: ['dark magician', 'legion the fiend jester', 'skilled dark magician', 'dark magic curtain', 'ectoplasmer'],
    preferred: ['dark magician turbo', 'paladin turbo', 'spellcaster control', 'chaos control'],
    disallowed: ['gadget', 'volcanic', 'harpie'],
  },
  {
    id: 'rafael',
    name: 'Rafael',
    series: 'DM',
    keywords: ['guardian', 'eatos', 'grarl', 'arsenal summoner', 'butterfly dagger', 'mage power', 'united we stand'],
    preferred: ['warrior', 'equip beat', 'dimension fusion turbo'],
    disallowed: ['zombie', 'machine otk', 'demise'],
  },
  {
    id: 'dartz',
    name: 'Dartz',
    series: 'DM',
    keywords: ['ocean', 'atlantis', 'daedalus', 'underdog', 'seal of orichalcos'],
    preferred: ['ocean control', 'umi beat', 'anti-meta stun', 'scientist ftk'],
    disallowed: ['gadget', 'volcanic', 'harpie'],
  },

  // --- 20 GX CHARACTERS ---
  {
    id: 'jaden-yuki',
    name: 'Jaden Yuki',
    series: 'GX',
    mustIds: [46997, 79713],
    keywords: ['neos', 'flame wingman', 'elemental hero', 'stratos', 'sparkman', 'clayman', 'bubbleman', 'avian', 'miracle fusion'],
    preferred: ['hero beat', 'trooper hero', 'fusion hero', 'warrior'],
    disallowed: ['counter fairy', 'ocean control', 'gadget', 'demise'],
  },
  {
    id: 'zane-truesdale',
    name: 'Zane Truesdale',
    series: 'GX',
    mustIds: [82262, 82011],
    keywords: ['cyber end', 'chimeratech', 'cyber dragon', 'power bond', 'overload fusion'],
    preferred: ['bazoo return', 'macro monarch', 'machine otk', 'machine beat'],
    disallowed: ['fairy', 'spellcaster', 'relinquished'],
  },
  {
    id: 'syrus-truesdale',
    name: 'Syrus Truesdale',
    series: 'GX',
    keywords: ['steamroid', 'drillroid', 'gyroid', 'submarineroid', 'super vehicroid', 'power bond', 'limiter removal'],
    preferred: ['machine beat', 'machine otk'],
    disallowed: ['fairy', 'spellcaster', 'zombie'],
  },
  {
    id: 'chazz-princeton',
    name: 'Chazz Princeton',
    series: 'GX',
    mustIds: [3191, 83730, 83731],
    keywords: ['ojama', 'armed dragon', 'light and darkness dragon'],
    preferred: ['dragon beat', 'warrior', 'chaos turbo', 'dad return'],
    disallowed: ['counter fairy', 'ocean control', 'gravekeeper'],
  },
  {
    id: 'alexis-rhodes',
    name: 'Alexis Rhodes',
    series: 'GX',
    mustIds: [79469, 79939],
    keywords: ['cyber blader', 'cyber angel', 'benten', 'idaten', 'dakini', 'demise'],
    preferred: ['rat warrior', 'chaos control', 'demise otk'],
    disallowed: ['machine otk', 'volcanic', 'gadget'],
  },
  {
    id: 'bastion-misawa',
    name: 'Bastion Misawa',
    series: 'GX',
    keywords: ['hydrogeddon', 'oxygeddon', 'water dragon', 'carboneddon', 'plasma warrior eitom'],
    preferred: ['water control', 'earth beat', 'rat toolbox', 'hydrogeddon'],
    disallowed: ['demise', 'machine otk', 'fairy'],
  },
  {
    id: 'chumley-huffington',
    name: 'Chumley Huffington',
    series: 'GX',
    mustIds: [82678, 83681, 83944, 83935],
    keywords: ['master of oz', 'big koala', 'des kangaroo', 'nimble momonga', 'green baboon', 'beast'],
    preferred: ['clown control', 'chaos turbo', 'trooper beast', 'baboon burn', 'forest beat'],
    disallowed: ['machine otk', 'counter fairy', 'six samurai'],
  },
  {
    id: 'aster-phoenix',
    name: 'Aster Phoenix',
    series: 'GX',
    mustIds: [46997],
    keywords: ['plasma', 'diamond dude', 'malicious', 'destiny hero', 'dreadmaster', 'destiny draw', 'dark armed dragon'],
    preferred: ['diamond dude turbo', 'dad return', 'dad turbo', 'perfect circle monarch'],
    disallowed: ['gadget', 'volcanic', 'harpie'],
  },
  {
    id: 'jesse-anderson',
    name: 'Jesse Anderson',
    series: 'GX',
    keywords: ['crystal beast', 'pegasus', 'carbuncle', 'tiger', 'rainbow dragon', 'crystal abundance'],
    preferred: ['tiger stun', 'gladiator beast', 'warrior'],
    disallowed: ['machine otk', 'zombie', 'demise'],
  },
  {
    id: 'vellian-crowler',
    name: 'Dr. Vellian Crowler',
    series: 'GX',
    mustIds: [25104, 15931],
    keywords: ['ancient gear', 'golem', 'beast', 'engineer', 'castle', 'geartown', 'limiter removal'],
    preferred: ['ancient gear', 'machine beat', 'machine otk'],
    disallowed: ['fairy', 'spellcaster', 'zombie'],
  },
  {
    id: 'atticus-rhodes',
    name: 'Atticus Rhodes',
    series: 'GX',
    keywords: ['red-eyes', 'dragon', 'exploder', 'prime material dragon', 'darkness metal dragon', 'wyvern'],
    preferred: ['dragon turbo', 'dragon beat', 'blue-eyes'],
    disallowed: ['fairy', 'gadget', 'counter fairy'],
  },
  {
    id: 'tyranno-hassleberry',
    name: 'Tyranno Hassleberry',
    series: 'GX',
    keywords: ['ultimate tyranno', 'super conductor tyranno', 'babycerasaurus', 'fossil dig', 'jurassic world', 'hydrogeddon'],
    preferred: ['dinosaur', 'earth beat'],
    disallowed: ['fairy', 'spellcaster', 'machine otk'],
  },
  {
    id: 'jim-crocodile-cook',
    name: 'Jim Crocodile Cook',
    series: 'GX',
    keywords: ['grandmarg', 'jujitsu', 'morphing jar', 'rock', 'megarock', 'fossil dyna'],
    preferred: ['rock stun', 'earth beat', 'rock monarch'],
    disallowed: ['machine otk', 'fairy', 'six samurai'],
  },
  {
    id: 'axel-brodie',
    name: 'Axel Brodie',
    series: 'GX',
    mustIds: [48188],
    keywords: ['volcanic', 'rocket', 'scattershot', 'shell', 'blaze accelerator', 'doomfire'],
    preferred: ['volcanic monarch', 'volcanic', 'volcanic gadget'],
    disallowed: ['fairy', 'blue-eyes', 'dark magician'],
  },
  {
    id: 'adrian-gecko',
    name: 'Adrian Gecko',
    series: 'GX',
    keywords: ['cloudian', 'exodius', 'sanctuary in the sky', 'fog counter', 'spirit reaper'],
    preferred: ['rat toolbox', 'stall control', 'warrior'],
    disallowed: ['machine otk', 'volcanic', 'gadget'],
  },
  {
    id: 'sartorius-kumar',
    name: 'Sartorius Kumar',
    series: 'GX',
    keywords: ['artemis', 'harvest', 'meltiel', 'layard', 'arcana', 'solemn', 'bountiful', 'valhalla'],
    preferred: ['counter fairy', 'light beat', 'fairy'],
    disallowed: ['machine otk', 'zombie', 'demise'],
  },
  {
    id: 'yubel',
    name: 'Yubel',
    series: 'GX',
    keywords: ['fiend', 'dark necrofear', 'night assailant', 'sangan', 'witch of the black forest', 'chaos', 'yubel', 'raviel'],
    preferred: ['fiend', 'chaos control', 'strike ninja return'],
    disallowed: ['gadget', 'volcanic', 'counter fairy'],
  },
  {
    id: 'nightshroud',
    name: 'Nightshroud',
    series: 'GX',
    keywords: ['dragon', 'five-headed', 'red-eyes', 'chaos', 'future fusion', 'darkness'],
    preferred: ['dragon turbo', 'dragon beat', 'chaos control'],
    disallowed: ['fairy', 'counter fairy', 'gadget'],
  },
  {
    id: 'yusuke-fujiwara',
    name: 'Yusuke Fujiwara',
    series: 'GX',
    keywords: ['clear vice dragon', 'clear world', 'honest', 'chaos sorcerer', 'd.d. crow'],
    preferred: ['chaos control', 'anti-meta stun', 'light beat'],
    disallowed: ['machine otk', 'volcanic', 'gadget'],
  },
  {
    id: 'supreme-king-jaden',
    name: 'Supreme King Jaden',
    series: 'GX',
    mustIds: [24724],
    keywords: ['evil hero', 'dark gaia', 'malicious edge', 'dark calling', 'dark fusion', 'super polymerization'],
    preferred: ['soul control', 'dad turbo', 'phantom turbo'],
    disallowed: ['counter fairy', 'ocean control', 'gadget'],
  },
];

export async function generateAllCharacterDecks(): Promise<void> {
  if (!fs.existsSync(CACHE_FILE)) {
    throw new Error(`Tournament deck cache not found at ${CACHE_FILE}. Run fetch-expanded-deck-pool.ts first!`);
  }

  const allTournamentDecks: TournamentDeckRecord[] = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  console.log(`Loaded ${allTournamentDecks.length} validated decks from cache.`);

  const characters: CharacterData[] = JSON.parse(fs.readFileSync(CHARACTERS_JSON_PATH, 'utf-8'));
  const existingPrebuilts: CustomDeck[] = JSON.parse(fs.readFileSync(PREBUILT_DECKS_PATH, 'utf-8'));

  // Strictly preserve Popular and Custom decks
  const popularAndCustomDecks = existingPrebuilts.filter(
    (d) =>
      d.category === 'popular-dm' ||
      d.category === 'popular-gx' ||
      d.id.startsWith('pop-') ||
      d.characterName === 'Community Popular' ||
      d.category === 'custom',
  );

  console.log(`Preserved ${popularAndCustomDecks.length} Popular & Custom decks intact.`);

  const newPrebuiltDecks: CustomDeck[] = [...popularAndCustomDecks];
  let totalAssignedDecks = 0;

  for (const charRule of CHARACTER_RULES) {
    const char = characters.find((c) => c.id === charRule.id);
    if (!char) {
      console.warn(`Character ${charRule.id} not found in characters.json, skipping...`);
      continue;
    }

    console.log(`\n▶ Processing [${char.series}] ${char.name} (${char.id})...`);

    const candidates: { deck: TournamentDeckRecord; score: number; distinctKey: string; archetype: string }[] = [];
    const mustSet = new Set(charRule.mustIds || []);

    for (const tDeck of allTournamentDecks) {
      const cardNames = tDeck.main.map((id) => (pool[String(id)]?.name || '').toLowerCase());
      const extraNames = tDeck.extra.map((id) => (pool[String(id)]?.name || '').toLowerCase());
      const typeLower = (tDeck.deckTypeName || '').toLowerCase();
      const nameLower = (tDeck.name || '').toLowerCase();
      const allNames = [...cardNames, ...extraNames];

      // Disallowed check
      if (charRule.disallowed && charRule.disallowed.some((dis) => typeLower.includes(dis) || nameLower.includes(dis))) {
        continue;
      }

      let score = 0;
      if (mustSet.has(tDeck.id)) {
        score += 1000; // Guaranteed must-include
      }

      for (const kw of charRule.keywords) {
        if (allNames.some((cn) => cn.includes(kw.toLowerCase()))) score += 15;
      }
      for (const pref of charRule.preferred) {
        if (typeLower.includes(pref.toLowerCase())) score += 30;
      }

      if (score <= 0) continue;

      const sortedCore = [...tDeck.main].sort().slice(0, 8).join('-');
      const distinctKey = `${tDeck.deckTypeName}_${sortedCore}`;
      candidates.push({ deck: tDeck, score, distinctKey, archetype: tDeck.deckTypeName });
    }

    candidates.sort((a, b) => b.score - a.score);

    const selected: TournamentDeckRecord[] = [];
    const seenKeys = new Set<string>();
    const archetypeCount: Record<string, number> = {};
    const maxPerArch = charRule.maxPerArchetype || 2;

    for (const cand of candidates) {
      if (selected.length >= 10) break;
      if (seenKeys.has(cand.distinctKey)) continue;

      const count = archetypeCount[cand.archetype] || 0;
      if (count >= maxPerArch && !mustSet.has(cand.deck.id)) continue;

      seenKeys.add(cand.distinctKey);
      archetypeCount[cand.archetype] = count + 1;
      selected.push(cand.deck);
    }

    console.log(`  Found ${candidates.length} candidates, selected ${selected.length} top authentic decks.`);

    const charDeckList: CharacterDeckData[] = [];
    let deckIdx = 1;

    for (const tDeck of selected) {
      totalAssignedDecks++;
      const deckId = `${char.id}_deck_${deckIdx}`;
      const ydkFilename = `${char.id}_deck_${deckIdx}.ydk`;
      const ydkRelativePath = `resources/decks/${ydkFilename}`;
      const ydkAbsolutePath = path.join(DECKS_DIR, ydkFilename);

      // Ensure extra deck monsters in side deck are moved to extra if there is room (< 15) and not exceeding 3 copies
      const rawExtra = [...(tDeck.extra || [])];
      const extraCards: number[] = [];
      for (const cid of rawExtra) {
        const count = [...tDeck.main, ...extraCards].filter(id => id === cid).length;
        if (count < 3 && extraCards.length < 15) {
          extraCards.push(cid);
        }
      }

      const sideCards: number[] = [];
      const extraTypeMask = 0x40 | 0x2000 | 0x800000 | 0x4000000;
      for (const cid of (tDeck.side || [])) {
        const row = db.prepare('SELECT type FROM datas WHERE id = ?').get(cid) as { type: number } | undefined;
        const count = [...tDeck.main, ...extraCards].filter(id => id === cid).length;
        if (row && (row.type & extraTypeMask) && extraCards.length < 15 && count < 3) {
          extraCards.push(cid);
        } else {
          sideCards.push(cid);
        }
      }

      // Write YDK file
      writeYdkFile(ydkAbsolutePath, tDeck.main, extraCards, sideCards);

      // Clean, evocative tournament name
      let cleanName = tDeck.name && tDeck.name !== 'null' && tDeck.name !== 'Format Library Deck'
        ? tDeck.name
        : tDeck.deckTypeName;
      
      if (tDeck.id === 39153) {
        cleanName = 'Egyptian God [Format Library]';
      } else if (tDeck.id === 46997) {
        cleanName = 'HERO Neos [Format Library]';
      } else if (!cleanName.includes('[')) {
        cleanName = `${cleanName} [${tDeck.event || tDeck.formatName}]`;
      }

      const placementStr = tDeck.placement === 1 ? '1st Place Champion' : `Top Cut #${tDeck.placement}`;
      const description = `Authentic Format Library tournament deck (${placementStr}) from ${tDeck.event || tDeck.formatName} format, piloted by ${tDeck.builderName}. Features signature synergy for ${char.name}.`;

      // Character deck data
      const charDeckData: CharacterDeckData = {
        id: deckId,
        name: cleanName,
        archetype: tDeck.deckTypeName,
        description,
        ydkPath: ydkRelativePath,
        mainCards: tDeck.main,
        extraCards,
      };
      charDeckList.push(charDeckData);

      // CustomDeck data for prebuilt-decks.json
      const prebuiltDeck: CustomDeck = {
        id: deckId,
        name: `${char.name} — ${cleanName}`,
        main: tDeck.main,
        extra: extraCards,
        createdAt: 1700000000000 + totalAssignedDecks * 1000,
        updatedAt: 1700000000000 + totalAssignedDecks * 1000,
        series: char.series,
        archetype: tDeck.deckTypeName,
        characterId: char.id,
        characterName: char.name,
        avatar: `app-resource://characters/avatars/${char.id}.png`,
        portrait: `app-resource://characters/portraits/${char.id}.png`,
        category: char.series === 'DM' ? 'character-dm' : 'character-gx',
      };
      newPrebuiltDecks.push(prebuiltDeck);

      console.log(`    ✓ Deck #${deckIdx}: "${cleanName}" (${tDeck.main.length} Main, ${tDeck.extra.length} Extra)`);
      deckIdx++;
    }

    char.decks = charDeckList;
  }

  // Write out data/characters.json
  fs.writeFileSync(CHARACTERS_JSON_PATH, JSON.stringify(characters, null, 2), 'utf-8');
  console.log(`\n✓ Saved ${characters.length} characters to ${CHARACTERS_JSON_PATH}`);

  // Write out data/prebuilt-decks.json
  fs.writeFileSync(PREBUILT_DECKS_PATH, JSON.stringify(newPrebuiltDecks, null, 2), 'utf-8');
  console.log(`✓ Saved ${newPrebuiltDecks.length} prebuilt decks to ${PREBUILT_DECKS_PATH}`);

  // Regenerate manifest
  console.log('\nRegenerating update-manifest.json...');
  generateManifest();
  console.log('✓ update-manifest.json updated successfully.');

  console.log('\n===============================================================');
  console.log(`🎉 COMPLETED! Generated ${totalAssignedDecks} authentic tournament character decks.`);
  console.log(`Preserved ${popularAndCustomDecks.length} Popular & Custom decks.`);
  console.log('===============================================================\n');
}

if (process.argv[1] && process.argv[1].endsWith('generate-formatlibrary-character-decks.ts')) {
  generateAllCharacterDecks().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
