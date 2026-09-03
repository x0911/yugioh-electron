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
  signatureKeywords: string[];
  preferredArchetypes: string[];
  minSignatureMatches?: number;
}

export const CHARACTER_RULES: CharacterRule[] = [
  // --- 20 DM CHARACTERS ---
  {
    id: 'yugi-muto',
    name: 'Yugi Muto',
    series: 'DM',
    signatureKeywords: ['gadget', 'magnet warrior', 'valkyrion', 'silent swordsman', 'silent magician', 'gandora', 'marshmallon', 'blockman'],
    preferredArchetypes: ['gadget', 'chaos gadget', 'pacman', 'earth beat', 'goat control', 'rock stun'],
  },
  {
    id: 'yami-yugi',
    name: 'Yami Yugi',
    series: 'DM',
    signatureKeywords: ['dark magician', 'black luster soldier', 'buster blader', 'breaker the magical warrior', 'dark paladin', 'slifer', 'magician of faith', 'skilled dark magician'],
    preferredArchetypes: ['chaos control', 'warrior', 'goat control', 'chaos return', 'spellcaster', 'dark magician'],
  },
  {
    id: 'seto-kaiba',
    name: 'Seto Kaiba',
    series: 'DM',
    signatureKeywords: ['blue-eyes', 'cyber jar', 'ring of destruction', 'vorse raider', 'enemy controller', 'crush card', 'obelisk', 'xyz-dragon'],
    preferredArchetypes: ['dragon', 'chaos control', 'stein otk', 'hand control', 'virus control', 'chaos return'],
  },
  {
    id: 'joey-wheeler',
    name: 'Joey Wheeler',
    series: 'DM',
    signatureKeywords: ['red-eyes', 'jinzo', 'gearfried', 'gilford', 'scapegoat', 'time wizard', 'rocket warrior', 'alligator'],
    preferredArchetypes: ['warrior', 'gearfried', 'ben kei', 'beast beat', 'jinzo control', 'cat otk'],
  },
  {
    id: 'tea-gardner',
    name: 'Téa Gardner',
    series: 'DM',
    signatureKeywords: ['injection fairy lily', 'magician of faith', 'solemn wishes', 'shining angel', 'dunames dark witch', 'maha vailo'],
    preferredArchetypes: ['counter fairy', 'fairy', 'lily beat', 'goat control', 'chaos control'],
  },
  {
    id: 'tristan-taylor',
    name: 'Tristan Taylor',
    series: 'DM',
    signatureKeywords: ['berserk gorilla', 'enraged battle ox', 'cyber commander', 'super roboyarou', 'command knight', 'exiled force'],
    preferredArchetypes: ['beast', 'baboon burn', 'earth beat', 'skill drain', 'warrior'],
  },
  {
    id: 'mai-valentine',
    name: 'Mai Valentine',
    series: 'DM',
    signatureKeywords: ['harpie', 'amazoness', 'elegant egotist', 'birdface', 'sonic duck', 'icarus'],
    preferredArchetypes: ['harpie', 'amazoness harpie', 'birdman', 'wind control'],
  },
  {
    id: 'bakura-ryou',
    name: 'Bakura Ryou',
    series: 'DM',
    signatureKeywords: ['dark necrofear', 'morphing jar', 'night assailant', 'doomcaliber knight', 'destiny board', 'sangan', 'witch of the black forest'],
    preferredArchetypes: ['fiend control', 'dark necrofear', 'empty jar', 'jar turbo', 'zombie', 'chaos control'],
  },
  {
    id: 'marik-ishtar',
    name: 'Marik Ishtar',
    series: 'DM',
    signatureKeywords: ['lava golem', 'bowganian', 'nightmare wheel', 'mask of restrict', 'winged dragon of ra', 'stealth bird'],
    preferredArchetypes: ['burn', 'panda burn', 'lava golem control', 'drain burn', 'dark world burn', 'pacman'],
  },
  {
    id: 'maximillion-pegasus',
    name: 'Maximillion Pegasus',
    series: 'DM',
    signatureKeywords: ['relinquished', 'thousand-eyes', 'toon', 'black illusion ritual', 'tsukuyomi'],
    preferredArchetypes: ['relinquished', 'goat control', 'toons', 'toon table turbo'],
  },
  {
    id: 'bandit-keith',
    name: 'Bandit Keith',
    series: 'DM',
    signatureKeywords: ['blowback dragon', 'barrel dragon', 'machine king', 'limiter removal', 'heavy mech support', 'cyber dragon', 'card trooper'],
    preferredArchetypes: ['machine beat', 'chaos machine', 'troop dupe', 'blowback dragon', 'stein monarch'],
  },
  {
    id: 'weevil-underwood',
    name: 'Weevil Underwood',
    series: 'DM',
    signatureKeywords: ['doom dozer', 'insect queen', 'pinch hopper', 'howling insect', 'man-eater bug', '4-starred ladybug'],
    preferredArchetypes: ['insect', 'doom dozer otk', 'demise dozer', 'spider control', 'earth beat'],
  },
  {
    id: 'rex-raptor',
    name: 'Rex Raptor',
    series: 'DM',
    signatureKeywords: ['tyranno', 'hydrogeddon', 'oxygeddon', 'frostosaurus', 'jurassic', 'sabersaurus', 'hyper hammerhead'],
    preferredArchetypes: ['dinosaur', 'hydrogeddon control', 'earth beat', 'dino beat'],
  },
  {
    id: 'mako-tsunami',
    name: 'Mako Tsunami',
    series: 'DM',
    signatureKeywords: ['fisherman', 'daedalus', 'abyss soldier', 'legendary ocean', 'amphibian beast', 'fenrir', 'yomi ship', 'mobius'],
    preferredArchetypes: ['water control', 'water beat', 'daedalus turbo', 'diva frog', 'water monarch'],
  },
  {
    id: 'ishizu-ishtar',
    name: 'Ishizu Ishtar',
    series: 'DM',
    signatureKeywords: ['gravekeeper', 'necrovalley', 'mudora', 'kelbek', 'agido', 'exchange of the spirit'],
    preferredArchetypes: ['gravekeeper', 'necrovalley stun', 'exchange of the spirit', 'keeper beatdown'],
  },
  {
    id: 'odion',
    name: 'Odion',
    series: 'DM',
    signatureKeywords: ['serket', 'apophis', 'solemn judgment', 'metal reflect slime', 'trap monster', 'magic jammer', 'seven tools'],
    preferredArchetypes: ['trap monster', 'counter trap control', 'macro stun', 'solemn judgment stun', 'chain burn'],
  },
  {
    id: 'espa-roba',
    name: 'Espa Roba',
    series: 'DM',
    signatureKeywords: ['jinzo', 'cyber-stein', 'reflect bounder', 'heavy mech support'],
    preferredArchetypes: ['jinzo returner', 'stein otk', 'machine beat', 'chaos machine'],
  },
  {
    id: 'arkana',
    name: 'Arkana',
    series: 'DM',
    signatureKeywords: ['dark magician', 'legion the fiend jester', 'skilled dark magician', 'dark magic curtain', 'ectoplasmer'],
    preferredArchetypes: ['dark magician', 'dark world spellcaster', 'spellcaster beatdown', 'chaos control'],
  },
  {
    id: 'rafael',
    name: 'Rafael',
    series: 'DM',
    signatureKeywords: ['guardian', 'eatos', 'grarl', 'arsenal summoner', 'butterfly dagger', 'mage power', 'united we stand'],
    preferredArchetypes: ['warrior', 'guardian eatos beat', 'equip beat', 'dimension fusion turbo'],
  },
  {
    id: 'dartz',
    name: 'Dartz',
    series: 'DM',
    signatureKeywords: ['ocean', 'atlantis', 'daedalus', 'underdog', 'amphibian', 'seal of orichalcos'],
    preferredArchetypes: ['atlantis water beat', 'normal monster beat', 'anti-meta stun', 'seal stun', 'chaos control'],
  },

  // --- 20 GX CHARACTERS ---
  {
    id: 'jaden-yuki',
    name: 'Jaden Yuki',
    series: 'GX',
    signatureKeywords: ['elemental hero', 'stratos', 'sparkman', 'clayman', 'bubbleman', 'avian', 'flame wingman', 'neos', 'miracle fusion', 'egyxos'],
    preferredArchetypes: ['hero beat', 'trooper hero', 'gemini hero', 'miracle fusion beat', 'hero frog'],
  },
  {
    id: 'zane-truesdale',
    name: 'Zane Truesdale',
    series: 'GX',
    signatureKeywords: ['cyber dragon', 'cyber twin dragon', 'cyber end dragon', 'chimeratech', 'power bond', 'overload fusion', 'future fusion'],
    preferredArchetypes: ['cyber dragon', 'chimeratech future overload', 'machine beat', 'troop dupe', 'stein otk', 'cyber monarch'],
  },
  {
    id: 'syrus-truesdale',
    name: 'Syrus Truesdale',
    series: 'GX',
    signatureKeywords: ['steamroid', 'drillroid', 'gyroid', 'submarineroid', 'super vehicroid', 'power bond', 'limiter removal'],
    preferredArchetypes: ['machina roid', 'machine beat', 'drillroid control', 'machine stun'],
  },
  {
    id: 'chazz-princeton',
    name: 'Chazz Princeton',
    series: 'GX',
    signatureKeywords: ['armed dragon', 'ojama', 'light and darkness dragon', 'ojamagic', 'ojama delta', 'ojama king'],
    preferredArchetypes: ['light and darkness dragon', 'ojama', 'armed dragon', 'dragon turbo'],
  },
  {
    id: 'alexis-rhodes',
    name: 'Alexis Rhodes',
    series: 'GX',
    signatureKeywords: ['cyber angel', 'benten', 'idaten', 'dakini', 'cyber blader', 'machine angel ritual', 'demise'],
    preferredArchetypes: ['demise otk', 'ritual control', 'cyber blader beat', 'warrior'],
  },
  {
    id: 'bastion-misawa',
    name: 'Bastion Misawa',
    series: 'GX',
    signatureKeywords: ['hydrogeddon', 'oxygeddon', 'water dragon', 'bonding - h2o', 'carboneddon', 'plasma warrior eitom'],
    preferredArchetypes: ['hydrogeddon beat', 'water control', 'earth beat', 'rat toolbox'],
  },
  {
    id: 'chumley-huffington',
    name: 'Chumley Huffington',
    series: 'GX',
    signatureKeywords: ['master of oz', 'big koala', 'des kangaroo', 'ayers rock sunrise', 'nimble momonga', 'green baboon', 'beast'],
    preferredArchetypes: ['baboon burn', 'trooper beast', 'beast beatdown', 'cat otk'],
  },
  {
    id: 'aster-phoenix',
    name: 'Aster Phoenix',
    series: 'GX',
    signatureKeywords: ['destiny hero', 'malicious', 'diamond dude', 'plasma', 'dasher', 'destiny draw', 'dark armed dragon'],
    preferredArchetypes: ['diamond dude turbo', 'perfect circle monarch', 'destiny hero', 'dad return', 'dad turbo'],
  },
  {
    id: 'jesse-anderson',
    name: 'Jesse Anderson',
    series: 'GX',
    signatureKeywords: ['crystal beast', 'pegasus', 'carbuncle', 'tiger', 'rainbow dragon', 'crystal abundance', 'crystal beacon'],
    preferredArchetypes: ['crystal beast', 'crystal abundance otk', 'rainbow dragon turbo'],
  },
  {
    id: 'vellian-crowler',
    name: 'Dr. Vellian Crowler',
    series: 'GX',
    signatureKeywords: ['ancient gear', 'golem', 'beast', 'engineer', 'castle', 'geartown', 'limiter removal'],
    preferredArchetypes: ['ancient gear machina', 'ancient gear dark', 'machine beat', 'geartown'],
  },
  {
    id: 'atticus-rhodes',
    name: 'Atticus Rhodes',
    series: 'GX',
    signatureKeywords: ['red-eyes', 'dragon', 'exploder', 'prime material dragon', 'darkness metal dragon', 'wyvern'],
    preferredArchetypes: ['red-eyes turbo', 'dragon turbo', 'disaster dragon', 'hopeless dragon'],
  },
  {
    id: 'tyranno-hassleberry',
    name: 'Tyranno Hassleberry',
    series: 'GX',
    signatureKeywords: ['ultimate tyranno', 'super conductor tyranno', 'babycerasaurus', 'fossil dig', 'jurassic world', 'hydrogeddon'],
    preferredArchetypes: ['dinosaur', 'hydrogeddon beat', 'survival dino beat'],
  },
  {
    id: 'jim-crocodile-cook',
    name: 'Jim Crocodile Cook',
    series: 'GX',
    signatureKeywords: ['grandmarg', 'jujitsu', 'morphing jar', 'rock', 'megarock', 'fossil dyna'],
    preferredArchetypes: ['fossil dyna rock stun', 'megarock dragon otk', 'earth beat', 'rock monarch'],
  },
  {
    id: 'axel-brodie',
    name: 'Axel Brodie',
    series: 'GX',
    signatureKeywords: ['volcanic', 'rocket', 'scattershot', 'shell', 'blaze accelerator', 'doomfire', 'solar flare'],
    preferredArchetypes: ['volcanic', 'volcanic monarch', 'volcanic counter fairy', 'burn'],
  },
  {
    id: 'adrian-gecko',
    name: 'Adrian Gecko',
    series: 'GX',
    signatureKeywords: ['cloudian', 'exodius', 'sanctuary in the sky', 'fog counter', 'spirit reaper'],
    preferredArchetypes: ['cloudian', 'exodius turbo', 'sanctuary control'],
  },
  {
    id: 'sartorius-kumar',
    name: 'Sartorius Kumar',
    series: 'GX',
    signatureKeywords: ['artemis', 'harvest', 'meltiel', 'layard', 'arcana', 'solemn', 'bountiful', 'valhalla'],
    preferredArchetypes: ['counter fairy', 'valhalla light beat', 'arcana force turn skip turbo'],
  },
  {
    id: 'yubel',
    name: 'Yubel',
    series: 'GX',
    signatureKeywords: ['fiend', 'dark necrofear', 'night assailant', 'sangan', 'witch of the black forest', 'chaos', 'yubel', 'raviel'],
    preferredArchetypes: ['yubel limit reverse', 'fiend burn', 'chaos control', 'dark armageddon control'],
  },
  {
    id: 'nightshroud',
    name: 'Nightshroud',
    series: 'GX',
    signatureKeywords: ['dragon', 'five-headed', 'red-eyes', 'chaos', 'future fusion', 'darkness'],
    preferredArchetypes: ['red-eyes darkness beat', 'dragon\'s mirror five-headed dragon otk', 'chaos dragon'],
  },
  {
    id: 'yusuke-fujiwara',
    name: 'Yusuke Fujiwara',
    series: 'GX',
    signatureKeywords: ['clear vice dragon', 'clear world', 'honest', 'chaos sorcerer', 'd.d. crow'],
    preferredArchetypes: ['clear world control', 'chaos control', 'anti-meta stun'],
  },
  {
    id: 'supreme-king-jaden',
    name: 'Supreme King Jaden',
    series: 'GX',
    signatureKeywords: ['evil hero', 'dark gaia', 'malicious edge', 'dark calling', 'dark fusion', 'super polymerization', 'malicious', 'destiny hero', 'elemental hero'],
    preferredArchetypes: ['evil hero dark gaia otk', 'dark calling beat', 'dad turbo'],
  },
];

export async function generateAllCharacterDecks(): Promise<void> {
  if (!fs.existsSync(CACHE_FILE)) {
    throw new Error(`Tournament deck cache not found at ${CACHE_FILE}. Run scrape-formatlibrary-decks.ts first!`);
  }

  const allTournamentDecks: TournamentDeckRecord[] = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  console.log(`Loaded ${allTournamentDecks.length} validated tournament decks from cache.`);

  // Load existing data
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

    // Score all tournament decks for this character
    const candidates: { deck: TournamentDeckRecord; score: number; distinctKey: string }[] = [];

    for (const tDeck of allTournamentDecks) {
      const cardNames = tDeck.main.map((id) => (pool[String(id)]?.name || '').toLowerCase());
      const typeLower = tDeck.deckTypeName.toLowerCase();

      // Count signature keyword hits
      let sigHits = 0;
      for (const kw of charRule.signatureKeywords) {
        if (cardNames.some((cName) => cName.includes(kw.toLowerCase()))) {
          sigHits++;
        }
      }

      if (sigHits < (charRule.minSignatureMatches || 1)) {
        continue;
      }

      let score = sigHits * 10;

      // Bonus for preferred archetype match
      for (const pref of charRule.preferredArchetypes) {
        if (typeLower.includes(pref.toLowerCase())) {
          score += 25;
          break;
        }
      }

      // Flagship signature card bonus
      if ((charRule.id === 'yami-yugi' || charRule.id === 'arkana') && cardNames.includes('dark magician')) score += 50;
      if (charRule.id === 'seto-kaiba' && cardNames.some(n => n.includes('blue-eyes'))) score += 50;
      if (charRule.id === 'joey-wheeler' && cardNames.some(n => n.includes('red-eyes'))) score += 30;
      if (charRule.id === 'zane-truesdale' && cardNames.some(n => n.includes('cyber dragon'))) score += 30;
      if (charRule.id === 'jaden-yuki' && cardNames.some(n => n.includes('elemental hero'))) score += 30;

      // Bonus for high tournament placement (1st place > 2nd > Top Cut)
      if (tDeck.placement === 1) score += 15;
      else if (tDeck.placement === 2) score += 10;
      else if (tDeck.placement <= 4) score += 5;

      // Distinct key based on archetype and core cards to prevent duplicate decks
      const sortedCore = [...tDeck.main].sort().slice(0, 8).join('-');
      const distinctKey = `${tDeck.deckTypeName}_${sortedCore}`;

      candidates.push({ deck: tDeck, score, distinctKey });
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    // Pick top unique decks (up to 10)
    const selected: TournamentDeckRecord[] = [];
    const seenKeys = new Set<string>();

    for (const cand of candidates) {
      if (selected.length >= 10) break;
      if (!seenKeys.has(cand.distinctKey)) {
        seenKeys.add(cand.distinctKey);
        selected.push(cand.deck);
      }
    }

    console.log(`  Found ${candidates.length} candidates, selected ${selected.length} top tournament decks.`);

    const charDeckList: CharacterDeckData[] = [];
    let deckIdx = 1;

    for (const tDeck of selected) {
      totalAssignedDecks++;
      const deckId = `${char.id}_deck_${deckIdx}`;
      const ydkFilename = `${char.id}_deck_${deckIdx}.ydk`;
      const ydkRelativePath = `resources/decks/${ydkFilename}`;
      const ydkAbsolutePath = path.join(DECKS_DIR, ydkFilename);

      // Write YDK file
      writeYdkFile(ydkAbsolutePath, tDeck.main, tDeck.extra, tDeck.side);

      const cleanName = `${tDeck.deckTypeName} [${tDeck.event || tDeck.formatName}]`;
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
        extraCards: tDeck.extra,
      };
      charDeckList.push(charDeckData);

      // CustomDeck data for prebuilt-decks.json
      const prebuiltDeck: CustomDeck = {
        id: deckId,
        name: `${char.name} — ${cleanName}`,
        main: tDeck.main,
        extra: tDeck.extra,
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
