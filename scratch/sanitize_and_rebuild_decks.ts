import fs from 'node:fs';
import { CardReaderService } from '../src/main/engine/cardReader.js';

const cr = new CardReaderService();

const prebuiltPath = './data/prebuilt-decks.json';
const charactersPath = './data/characters.json';

const prebuiltDecks: any[] = JSON.parse(fs.readFileSync(prebuiltPath, 'utf-8'));
const characters: any[] = JSON.parse(fs.readFileSync(charactersPath, 'utf-8'));

console.log(`Starting comprehensive sanitization of ${prebuiltDecks.length} decks...`);

// High-quality competitive staples for padding/fixing
const TOP_STAPLES = [
  55144522, // Pot of Greed
  79571449, // Graceful Charity
  83764719, // Monster Reborn
  5318639,  // Mystical Space Typhoon
  19613556, // Heavy Storm
  12580477, // Raigeki
  53129443, // Dark Hole
  44095762, // Mirror Force
  53582587, // Torrential Tribute
  70828912, // Premature Burial
  97077563, // Call of the Haunted
  45986603, // Snatch Steal
  4031928,  // Change of Heart
  72302403, // Swords of Revealing Light
  98319530, // Book of Moon
  98045062, // Enemy Controller
  29401950, // Bottomless Trap Hole
  94192409, // Compulsory Evacuation Device
  41420027, // Solemn Judgment
  26202165, // Sangan
  71413901, // Breaker the Magical Warrior
  7572887,  // D.D. Warrior Lady
  31560081, // Magician of Faith
  34124316, // Cyber Jar
  33508719, // Morphing Jar
  23205979, // Spirit Reaper
  27288416, // Marshmallon
  73915051, // Scapegoat
  71044499, // Nobleman of Crossout
  97169186, // Smashing Ground
  38280762, // Sakuretsu Armor
  62279055, // Magic Cylinder
  83555666, // Ring of Destruction
  99518961, // Dust Tornado
  70368879, // Upstart Goblin
  72892473, // Card Destruction
];

// Specific known junk filler IDs that were accidentally padded
const KNOWN_JUNK_IDS = new Set([
  32864, 62121, 102380, 111280, 126218, 218704, 242146, 269012, 295517, 296499,
  303660, 403847, 410904, 423705, 425934, 1102515, 1184620, 1434352, 1525329,
  1995985, 2311603, 2460565, 2694423, 2851070, 3056267, 3078576, 3134241,
  3370104, 3428069, 3549275, 3573512, 3627449, 3643300, 3657444, 3773196,
  3797883, 4035199, 4041838, 4266839, 4335645, 4545683, 4849037, 4920010,
  5257687, 5265750, 5373478, 5405694, 5434080, 5438492, 5556499, 6133894,
  7019529, 7080743, 7171149, 7180418, 7200041, 7359741, 8102334, 8581705,
  10262698, 11549357, 12160911, 12472242, 13039848, 14141448, 14261867,
  15023985, 15383415, 15717011, 16587243, 18654201, 22493811, 23615409,
  25773409, 26185991, 26566878, 27911549, 28470714, 31812496, 32588805,
  33508719, 74701381, 91512835, 93107608
]);

// Handcrafted authentic deck lists for special community / archetype decks
const CUSTOM_REAL_DECKS: Record<string, { main: number[]; extra?: number[] }> = {
  'pop-royal-magical-library-exodia-ftk': {
    main: [
      33396948, // Exodia the Forbidden One
      70903634, // Right Arm
      7902349,  // Left Arm
      8124921,  // Right Leg
      44519536, // Left Leg
      70791313, 70791313, 70791313, // 3x Royal Magical Library
      89997728, 89997728, 89997728, // 3x Toon Table of Contents
      15259703, // 1x Toon World
      81439173, 81439173, 81439173, // 3x Golden Bamboo Sword
      59464526, 59464526, 59464526, // 3x Cursed Bamboo Sword
      41587307, 41587307,           // 2x Broken Bamboo Sword
      70368879, 70368879, 70368879, // 3x Upstart Goblin
      74519184, 74519184, 74519184, // 3x Hand Destruction
      74117290, 74117290, 74117290, // 3x Dark World Dealings
      85852291, 85852291, 85852291, // 3x Magical Mallet
      22589918, 22589918,           // 2x Reload
      10080320, 10080320, 10080320, // 3x Cup of Ace
      55144522, // Pot of Greed
      79571449, // Graceful Charity
      72892473, // Card Destruction
      51481927, // Spell Absorption
    ],
    extra: [],
  },
};

function sanitizeDeck(deck: any): { main: number[]; extra: number[] } {
  if (CUSTOM_REAL_DECKS[deck.id]) {
    return {
      main: [...CUSTOM_REAL_DECKS[deck.id].main],
      extra: [...(CUSTOM_REAL_DECKS[deck.id].extra || [])],
    };
  }

  let main = [...deck.main];
  let extra = [...(deck.extra || [])];

  // 1. Identify core legitimate cards
  const legitimateCore: number[] = [];
  for (const cid of main) {
    const detail = cr.getCardDetail(cid);
    if (!detail) continue;

    if (KNOWN_JUNK_IDS.has(cid) && legitimateCore.length >= 15) {
      continue;
    }

    legitimateCore.push(cid);
  }

  let cleanedMain = legitimateCore.length >= 15 ? legitimateCore : [...main];

  // 2. Remove dead requirement cards
  const hasJinzo = cleanedMain.some((id) => [77585513, 17092736, 2403771, 59966558].includes(id));
  const hasDarkMagician = cleanedMain.some((id) => [46986414, 36975314].includes(id));
  const hasDMG = cleanedMain.includes(38033121);
  const hasBlueEyes = cleanedMain.some((id) => [89631139, 23995346].includes(id));
  const hasRedEyes = cleanedMain.some((id) => [74677422, 96561011].includes(id));
  const hasToon = cleanedMain.some((id) => {
    const d = cr.getCardDetail(id);
    return d?.isToon || (d?.name || '').toLowerCase().includes('toon');
  });
  const hasToonTable = cleanedMain.includes(89997728);

  cleanedMain = cleanedMain.filter((cid) => {
    const detail = cr.getCardDetail(cid);
    if (!detail) return false;
    const name = detail.name;

    if (cid === 303660 || name === 'Amplifier') {
      if (!hasJinzo) return false;
    }
    if (name === 'Toon World' || name === 'Toon Defense' || name === 'Toon Rollback') {
      if (!hasToon && !hasToonTable) return false;
    }
    if (['Thousand Knives', 'Dark Magic Attack', 'Dark Magic Curtain', 'Dedication through Light and Darkness'].includes(name)) {
      if (!hasDarkMagician) return false;
    }
    if (name === 'Burst Stream of Destruction' && !hasBlueEyes) return false;
    if (name === 'Inferno Fire Blast' && !hasRedEyes) return false;
    if (name === 'Kaibaman' && !hasBlueEyes) return false;

    return true;
  });

  // 3. Populate valid Fusion monsters for fusion decks
  const fusionSpellCodes = [
    1845204, 3659803, 12071500, 18511384, 23557835, 24094653, 26902560, 37630732,
    45906428, 48144509, 49469105, 54283059, 71490127, 94820406, 17236839, 43225434,
    48130397, 58199906, 95286165, 77565204, 74694807, 33550694
  ];
  const usesPoly = cleanedMain.some((cid) => fusionSpellCodes.includes(cid));
  const charId = (deck.characterId || '').toLowerCase();
  const deckName = (deck.name || '').toLowerCase();
  const arch = (deck.archetype || '').toLowerCase();

  if (usesPoly || extra.length > 0 || arch.includes('Fusion') || deckName.includes('Fusion')) {
    if (arch.includes('Ancient Gear') || charId.includes('crowler')) {
      extra = [12652643, 12652643]; // Ultimate Ancient Gear Golem
    } else if (arch.includes('Crystal') || charId.includes('jesse')) {
      extra = [86346643, 86346643]; // Rainbow Neos
    } else if (arch.includes('Cyber') || charId.includes('zane')) {
      extra = [1546123, 74157028, 64599569]; // Cyber End Dragon, Cyber Twin, Chimeratech Overdragon
    } else if (arch.includes('Ojama') || charId.includes('chazz')) {
      extra = [90140980, 58831685]; // Ojama King, Ojama Knight
    } else if (arch.includes('Evil HERO') || charId.includes('supreme-king') || deckName.includes('Evil HERO')) {
      extra = [58332301, 86676862, 21947653, 22160245]; // Dark Gaia, Malicious Fiend, Lightning Golem, Inferno Wing
    } else if (arch.includes('Destiny HERO') || charId.includes('aster')) {
      extra = [90579153, 41436536]; // Dystopia, Phoenix Enforcer
    } else if (arch.includes('HERO') || charId.includes('jaden')) {
      extra = [35809262, 25366484, 61204971, 83121692]; // Flame Wingman, Shining Flare, Thunder Giant, Tempest
    } else if (charId.includes('kaiba') || deckName.includes('Blue-Eyes')) {
      extra = [23995346, 23995346]; // Blue-Eyes Ultimate Dragon
    } else if (charId.includes('joey') || deckName.includes('Red-Eyes') || charId.includes('atticus')) {
      extra = [11901678, 45231177, 41462083]; // Black Skull Dragon, Flame Swordsman, Thousand Dragon
    } else if (charId.includes('yugi') || charId.includes('yami')) {
      extra = [98502113, 66889139]; // Dark Paladin, Gaia the Dragon Champion
    } else if (charId.includes('keith') || deckName.includes('Gatling')) {
      extra = [87751584, 87751584]; // Gatling Dragon
    } else if (charId.includes('tristan') || deckName.includes('Roboyarou')) {
      extra = [1412158, 1412158]; // Super Roboyarou
    } else if (charId.includes('alexis') || deckName.includes('Cyber Blader')) {
      extra = [10248389, 10248389]; // Cyber Blader
    } else if (charId.includes('chumley') || deckName.includes('Master of Oz')) {
      extra = [27134689, 27134689]; // Master of Oz
    } else if (charId.includes('rex') || deckName.includes('Thunder Dragon')) {
      extra = [54752875, 54752875]; // Twin-Headed Thunder Dragon
    } else if (charId.includes('syrus') || deckName.includes('Vehicroid') || deckName.includes('Barbaroid') || deckName.includes('Gyroid')) {
      extra = [5368615, 5368615]; // Steam Gyroid
    } else if (deckName.includes('chimeratech') || deckName.includes('troop dupe')) {
      extra = [64599569, 79229522, 1546123, 74157028]; // Chimeratech Overdragon, Fortress, Cyber End, Cyber Twin
    } else if (deckName.includes('Cyberdark')) {
      extra = [40418351, 40418351]; // Cyberdark Dragon
    } else {
      // If no matching fusion, clean out dead fusion spells
      cleanedMain = cleanedMain.filter((cid) => !fusionSpellCodes.includes(cid));
      extra = [];
    }
  }

  // 4. Duplicate legitimate archetype core cards up to 2-3 copies if under 40
  if (cleanedMain.length < 40) {
    const candidateCore = [...cleanedMain];
    for (const cid of candidateCore) {
      if (cleanedMain.length >= 40) break;
      const count = cleanedMain.filter((x) => x === cid).length;
      if (count < 3) {
        const detail = cr.getCardDetail(cid);
        if (detail && !detail.isRitual) {
          cleanedMain.push(cid);
        }
      }
    }
  }

  // 5. Fill remaining slots with top-tier tournament staples
  let stapleIdx = 0;
  while (cleanedMain.length < 40) {
    const staple = TOP_STAPLES[stapleIdx % TOP_STAPLES.length];
    const count = cleanedMain.filter((x) => x === staple).length;
    if (count < 3) {
      cleanedMain.push(staple);
    }
    stapleIdx++;
  }

  return { main: cleanedMain, extra };
}

// Sanitize all prebuilt decks
let updatedCount = 0;
for (const deck of prebuiltDecks) {
  const { main, extra } = sanitizeDeck(deck);
  deck.main = main;
  deck.extra = extra;
  updatedCount++;
}

// Sanitize all character decks in characters.json
for (const char of characters) {
  for (const deck of char.decks || []) {
    const { main, extra } = sanitizeDeck({
      id: deck.id,
      name: deck.name,
      archetype: deck.archetype,
      characterId: char.id,
      main: deck.mainCards || deck.main || [],
      extra: deck.extraCards || deck.extra || [],
    });
    deck.mainCards = main;
    deck.extraCards = extra;
    if (deck.main) deck.main = main;
    if (deck.extra) deck.extra = extra;
  }
}

fs.writeFileSync(prebuiltPath, JSON.stringify(prebuiltDecks, null, 2), 'utf-8');
fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2), 'utf-8');

console.log(`Successfully sanitized ${updatedCount} decks!`);
