import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

interface CardRow {
  id: number;
  ot: number;
  alias: number;
  setcode: bigint | number;
  type: number;
  atk: number;
  def: number;
  level: number;
  race: number;
  attribute: number;
  category: number;
  name: string;
  desc: string;
  str1?: string;
  str2?: string;
  str3?: string;
  str4?: string;
  str5?: string;
  str6?: string;
  str7?: string;
  str8?: string;
  str9?: string;
  str10?: string;
  str11?: string;
  str12?: string;
  str13?: string;
  str14?: string;
  str15?: string;
  str16?: string;
}

const ARCHETYPE_PATTERNS: Array<{
  name: string;
  match: (c: CardRow) => boolean;
}> = [
  // 1. Skull Servant / Wight
  {
    name: 'Skull Servant / Wight',
    match: (c) =>
      c.name.includes('Skull Servant') ||
      c.name.includes('Wight') ||
      c.desc.includes('"Skull Servant"') ||
      c.name === 'Tri-Wight',
  },
  // 2. Dark Magician & Magician Girls
  {
    name: 'Dark Magician / Magician Girl',
    match: (c) =>
      c.name.includes('Dark Magician') ||
      c.name.includes('Magician Girl') ||
      c.name.includes("Magician's Rod") ||
      c.name.includes("Magician's Souls") ||
      c.name.includes("Magicians' Combination") ||
      c.name.includes('Magician Navigation') ||
      c.name.includes("Magician's Robe") ||
      c.name.includes("Magician's Valkyria") ||
      c.name.includes('Dark Magical Circle') ||
      c.name.includes('Eternal Soul') ||
      c.name.includes('The Dark Magicians') ||
      c.name.includes('Secrets of Dark Magic') ||
      c.name.includes('Illusion of Chaos') ||
      c.name.includes('Soul Servant') ||
      c.name.includes('Apprentice Illusion Magician') ||
      c.name.includes('Bond Between Teacher and Student') ||
      c.name.includes('Dark Magic Inheritance') ||
      c.name.includes('Dark Magic Veil') ||
      c.name.includes('Dark Magic Attack') ||
      c.name.includes('Thousand Knives') ||
      c.name.includes('Eye of Timaeus') ||
      c.name.includes('Timaeus the United Dragon') ||
      c.name.includes('Dark Magician the Dragon Knight') ||
      c.name.includes('Red-Eyes Dark Dragoon') ||
      c.name.includes('Magician of Chaos') ||
      c.name.includes('Master of Chaos') ||
      c.name.includes('Chronicle Sorceress') ||
      c.name.includes('Destined Rivals') ||
      c.desc.includes('"Dark Magician"') ||
      c.desc.includes('"Dark Magician Girl"'),
  },
  // 3. Blue-Eyes & Eyes of Blue
  {
    name: 'Blue-Eyes / Eyes of Blue',
    match: (c) =>
      c.name.includes('Blue-Eyes') ||
      c.name.includes('Eyes of Blue') ||
      c.name.includes('Dictator of D.') ||
      c.name.includes('The Flute of Summoning Dragon') ||
      c.name.includes('Lord of D.') ||
      c.name.includes('Dragon Shrine') ||
      c.name.includes('Return of the Dragon Lords') ||
      c.name.includes('True Light') ||
      c.name.includes('Ultimate Creature of Destruction') ||
      c.name.includes('Bingo Machine') ||
      c.name.includes('White Stone of') ||
      c.name.includes('Chaos Form') ||
      c.name.includes('Fang of Critias') ||
      c.name.includes('Doom Virus Dragon') ||
      c.name.includes('Tyrant Burst Dragon') ||
      c.name.includes('Mirror Force Dragon') ||
      c.name.includes('Destruction Dragon') ||
      c.name.includes('XYZ-Dragon Cannon') ||
      c.name.includes('ABC-Dragon Buster') ||
      c.name.includes('A-to-Z-Dragon Buster Cannon') ||
      c.name.includes('Union Hangar') ||
      c.name.includes('Union Activation') ||
      c.desc.includes('"Blue-Eyes'),
  },
  // 4. HERO & Neos
  {
    name: 'HERO / Neos',
    match: (c) =>
      c.name.includes('Elemental HERO') ||
      c.name.includes('Destiny HERO') ||
      c.name.includes('Evil HERO') ||
      c.name.includes('Vision HERO') ||
      c.name.includes('Masked HERO') ||
      c.name.includes('Neos') ||
      c.name.includes('Neo-Spacian') ||
      c.name.includes('Hero Signal') ||
      c.name.includes('A Hero Lives') ||
      c.name.includes('E - Emergency Call') ||
      c.name.includes('R - Righteous Justice') ||
      c.name.includes('H - Heated Heart') ||
      c.name.includes('O - Oversoul') ||
      c.name.includes('HERO Flash!!') ||
      c.name.includes('Miracle Fusion') ||
      c.name.includes('Parallel World Fusion') ||
      c.name.includes('Favorite Hero') ||
      c.name.includes('Favorite Contact') ||
      c.name.includes('Fusion Destiny') ||
      c.name.includes('D - Force') ||
      c.name.includes('Doctor D') ||
      c.name.includes('D-Tactics') ||
      c.name.includes('Dark Calling') ||
      c.name.includes('Supreme King\'s Castle') ||
      c.name.includes('Dark Supremacy') ||
      c.name.includes('Sinister Necrom') ||
      c.name.includes('Aduster Gold') ||
      c.name.includes('Clock Tower Prison') ||
      c.name.includes('Destiny End Dragoon') ||
      c.name.includes('Wake Up Your E-HERO') ||
      c.name.includes('Winged Kuriboh') ||
      c.name.includes('Sabatiel - The Philosopher\'s Stone') ||
      c.name.includes('Transcendent Wings') ||
      c.desc.includes('"Elemental HERO"') ||
      c.desc.includes('"Destiny HERO"') ||
      c.desc.includes('"Evil HERO"') ||
      c.desc.includes('"HERO" monster'),
  },
  // 5. Cyber Dragon & Cyberdark
  {
    name: 'Cyber Dragon / Cyberdark',
    match: (c) =>
      c.name.includes('Cyber Dragon') ||
      c.name.includes('Cyberdark') ||
      c.name.includes('Chimeratech') ||
      c.name.includes('Cyber Emergency') ||
      c.name.includes('Cyber Repair Plant') ||
      c.name.includes('Cyberload Fusion') ||
      c.name.includes('Cyber Network') ||
      c.name.includes('Cyber Revsystem') ||
      c.name.includes('Cybernetic Overflow') ||
      c.name.includes('Cybernetic Horizon') ||
      c.name.includes('Cybernetic Revolution') ||
      c.name.includes('Cybernetic Fusion Support') ||
      c.name.includes('Overload Fusion') ||
      c.name.includes('Power Bond') ||
      c.desc.includes('"Cyber Dragon"') ||
      c.desc.includes('"Cyberdark"'),
  },
  // 6. Red-Eyes & Joey
  {
    name: 'Red-Eyes / Flame Swordsman / Joey',
    match: (c) =>
      c.name.includes('Red-Eyes') ||
      c.name.includes('Flame Swordsman') ||
      c.name.includes('Flame Swordsrealm') ||
      c.name.includes('Salamandra') ||
      c.name.includes('Fighting Flame') ||
      c.name.includes('Gearfried') ||
      c.name.includes('Time Wizard') ||
      c.name.includes('Baby Dragon') ||
      c.name.includes('Alligator\'s Sword') ||
      c.name.includes('Claw of Hermos') ||
      c.name.includes('Lord of the Red') ||
      c.name.includes('Inferno Fire Blast') ||
      c.desc.includes('"Red-Eyes"'),
  },
  // 7. Toon & Relinquished
  {
    name: 'Toon / Relinquished / Pegasus',
    match: (c) =>
      c.name.includes('Toon') ||
      c.name.includes('Relinquished') ||
      c.name.includes('Eyes Restrict') ||
      c.name.includes('Golden-Eyes Idol') ||
      c.name.includes('Illusionist Faceless') ||
      c.name.includes('Black Illusion Ritual') ||
      c.desc.includes('Toon World') ||
      c.desc.includes('"Relinquished"'),
  },
  // 8. Egyptian Gods & Slimes
  {
    name: 'Egyptian Gods / Slime / Marik',
    match: (c) =>
      c.name.includes('Slifer the Sky Dragon') ||
      c.name.includes('Obelisk the Tormentor') ||
      c.name.includes('The Winged Dragon of Ra') ||
      c.name.includes('Guardian Slime') ||
      c.name.includes('Egyptian God Slime') ||
      c.name.includes('Reactor Slime') ||
      c.name.includes('The True Sun God') ||
      c.name.includes('Soul Crossing') ||
      c.name.includes('Millennium Revelation') ||
      c.name.includes('Revived Sky God') ||
      c.name.includes('Breaking Ruin God') ||
      c.name.includes('Thunderforce Attack') ||
      c.name.includes('Fist of Fate') ||
      c.name.includes('God Hand Crush') ||
      c.name.includes('Ultimate Fusion') ||
      c.name.includes('Juragedo') ||
      c.name.includes('Holding Arms') ||
      c.name.includes('Holding Legs') ||
      c.name.includes('Lava Golem') ||
      c.desc.includes('"Slifer the Sky Dragon"') ||
      c.desc.includes('"The Winged Dragon of Ra"') ||
      c.desc.includes('"Obelisk the Tormentor"'),
  },
  // 9. Sacred Beasts & Yubel
  {
    name: 'Sacred Beasts / Yubel',
    match: (c) =>
      c.name.includes('Uria, Lord of') ||
      c.name.includes('Hamon, Lord of') ||
      c.name.includes('Raviel, Lord of') ||
      c.name.includes('Armityle') ||
      c.name.includes('Dark Beckoning Beast') ||
      c.name.includes('Chaos Summoning Beast') ||
      c.name.includes('Opening of the Spirit Gates') ||
      c.name.includes('Cerulean Skyfire') ||
      c.name.includes('Hyper Blaze') ||
      c.name.includes('Dimension Fusion Destruction') ||
      c.name.includes('Yubel') ||
      c.name.includes('Nightmare Throne') ||
      c.name.includes('Samsara D Lotus') ||
      c.name.includes('Eternal Favorite') ||
      c.name.includes('Geist Grinder Golem') ||
      c.name.includes('Nightmare Pain') ||
      c.desc.includes('"Yubel"'),
  },
  // 10. Gate Guardian & Labyrinth
  {
    name: 'Gate Guardian / Labyrinth',
    match: (c) =>
      c.name.includes('Gate Guardian') ||
      c.name.includes('Suijin') ||
      c.name.includes('Kazejin') ||
      c.name.includes('Sanga of the Thunder') ||
      c.name.includes('Labyrinth Wall') ||
      c.name.includes('Shadow Ghoul of the Labyrinth') ||
      c.name.includes('Pre-Prepared Gate') ||
      c.name.includes('Riryoku Field') ||
      c.name.includes('Dark Element'),
  },
  // 11. Crystal Beast
  {
    name: 'Crystal Beast / Rainbow Dragon',
    match: (c) =>
      c.name.includes('Crystal Beast') ||
      c.name.includes('Rainbow Dragon') ||
      c.name.includes('Ultimate Crystal') ||
      c.name.includes('Rainbow Bridge') ||
      c.name.includes('Golden Rule') ||
      c.name.includes('Crystal Miracle') ||
      c.name.includes('Crystal Bond') ||
      c.name.includes('Awakening of the Crystal') ||
      c.name.includes('Over the Rainbow') ||
      c.desc.includes('"Crystal Beast"'),
  },
  // 12. Ancient Gear
  {
    name: 'Ancient Gear',
    match: (c) => c.name.includes('Ancient Gear') || c.desc.includes('"Ancient Gear"'),
  },
  // 13. Exodia & Millennium
  {
    name: 'Exodia / Millennium',
    match: (c) =>
      c.name.includes('Exodia') ||
      c.name.includes('Forbidden One') ||
      c.name.includes('Obliterate') ||
      c.name.includes('Exodius') ||
      c.name.includes('Millennium Ankh') ||
      c.name.includes('Sengenjin') ||
      c.name.includes('Millennium Shield'),
  },
  // 14. Harpie & Amazoness
  {
    name: 'Harpie / Amazoness',
    match: (c) =>
      c.name.includes('Harpie') ||
      c.name.includes('Amazoness') ||
      c.desc.includes('"Harpie Lady"') ||
      c.desc.includes('"Amazoness"'),
  },
  // 15. Volcanic
  {
    name: 'Volcanic / Blaze Cannon',
    match: (c) =>
      c.name.includes('Volcanic') ||
      c.name.includes('Blaze Cannon') ||
      c.desc.includes('"Blaze Cannon"'),
  },
  // 16. Fossil
  {
    name: 'Fossil / Jim Cook',
    match: (c) =>
      c.name.includes('Fossil') ||
      c.name.includes('Weathering Soldier') ||
      c.name.includes('Flint Cragger') ||
      c.name.includes('Shell Knight') ||
      c.name.includes('Specimen Inspection') ||
      c.name.includes('Time Stream'),
  },
  // 17. Ojama & Armed Dragon
  {
    name: 'Ojama / Armed Dragon',
    match: (c) =>
      c.name.includes('Ojama') ||
      c.name.includes('Armed Dragon') ||
      c.desc.includes('"Ojama"') ||
      c.desc.includes('"Armed Dragon"'),
  },
  // 18. Destiny Board & Necrofear
  {
    name: 'Destiny Board / Necrofear / Bakura',
    match: (c) =>
      c.name.includes('Destiny Board') ||
      c.name.includes('Spirit Message') ||
      c.name.includes('Dark Necrofear') ||
      c.name.includes('Curse Necrofear') ||
      c.name.includes('Dark Sanctuary') ||
      c.name.includes('Dark Spirit of') ||
      c.name.includes('Sentence of Doom') ||
      c.name.includes('Dark Occultism') ||
      c.name.includes('Diabound') ||
      c.name.includes('Necroface'),
  },
  // 19. Jinzo / Espa Roba
  {
    name: 'Jinzo / Espa Roba',
    match: (c) =>
      c.name.includes('Jinzo') ||
      c.name.includes('Psychic Bounder') ||
      c.name.includes('Psychic Megacyber') ||
      c.name.includes('Cyber Energy Shock') ||
      c.name.includes('Law of the Cosmos'),
  },
  // 20. Sea Stealth / Umi / Mako
  {
    name: 'Sea Stealth / Umi / Kairyu-Shin',
    match: (c) =>
      c.name.includes('Kairyu-Shin') ||
      c.name.includes('Sea Stealth') ||
      c.name.includes('Mega Fortress Whale') ||
      c.name.includes('Electric Jellyfish') ||
      c.name.includes('Doom Kraken') ||
      c.name.includes('The Legendary Fisherman') ||
      c.name.includes('Fish Sonar'),
  },
  // 21. Buster Blader, BLS, Gaia, Kuriboh, Magnet, Poker Knights, Silent, Gandora, Chimera
  {
    name: 'Buster Blader / BLS / Gaia / Kuriboh / Magnet / Poker Knights / Gandora / Chimera',
    match: (c) =>
      c.name.includes('Buster Blader') ||
      c.name.includes('Destruction Sword') ||
      c.name.includes('Black Luster Soldier') ||
      c.name.includes('Super Soldier') ||
      c.name.includes('Gateway to Chaos') ||
      c.name.includes('Gaia The Fierce Knight') ||
      c.name.includes('Gaia the Fierce Knight') ||
      c.name.includes('Gaia the Dragon Champion') ||
      c.name.includes('Curse of Dragon') ||
      c.name.includes('Galloping Gaia') ||
      c.name.includes('Spiral Fusion') ||
      c.name.includes('Spiral Spear Strike') ||
      c.name.includes('Kuriboh') ||
      c.name.includes('Kuribee') ||
      c.name.includes('Kuriboo') ||
      c.name.includes('Kuribah') ||
      c.name.includes('Kuribeh') ||
      c.name.includes('Five Star Twilight') ||
      c.name.includes('Magnet Warrior') ||
      c.name.includes('Magna Warrior') ||
      c.name.includes('Magnetic Field') ||
      c.name.includes('Magnet Induction') ||
      c.name.includes('Joker\'s Knight') ||
      c.name.includes('Joker\'s Straight') ||
      c.name.includes('Joker\'s Wild') ||
      c.name.includes('Arcana Triumph Joker') ||
      c.name.includes('Imperial Bower') ||
      c.name.includes('Thunderspeed Summon') ||
      c.name.includes('Face Card Fusion') ||
      c.name.includes('Court of Cards') ||
      c.name.includes('Silent Swordsman') ||
      c.name.includes('Silent Magician') ||
      c.name.includes('Silent Paladin') ||
      c.name.includes('Silent Slash') ||
      c.name.includes('Silent Burning') ||
      c.name.includes('Gandora') ||
      c.name.includes('Geas Gandora') ||
      c.name.includes('Gadget') ||
      c.name.includes('Boot-Up') ||
      c.name.includes('Chimera the Flying Mythical Beast') ||
      c.name.includes('Gazelle the King of Mythical Beasts') ||
      c.name.includes('Berfomet') ||
      c.name.includes('Chimera Fusion') ||
      c.name.includes('Mirror Swordknight') ||
      c.name.includes('Cornfield Coatl'),
  },
  // 22. Insect & Dinosaur & Machines
  {
    name: 'Insect / Dinosaur / Keith Machines',
    match: (c) =>
      c.name.includes('Cocoon of Ultra Evolution') ||
      c.name.includes('Parasite Paranoid') ||
      c.name.includes('Metamorphosed Insect Queen') ||
      c.name.includes('Corrosive Scales') ||
      c.name.includes('Giant Ballpark') ||
      c.name.includes('Resonance Insect') ||
      c.name.includes('Ultimate Conductor Tyranno') ||
      c.name.includes('Overtex Qoatlus') ||
      c.name.includes('Giant Rex') ||
      c.name.includes('Double Evolution Pill') ||
      c.name.includes('Petiteranodon') ||
      c.name.includes('Babycerasaurus') ||
      c.name.includes('Souleating Oviraptor') ||
      c.name.includes('Miscellaneousaurus') ||
      c.name.includes('Lost World') ||
      c.name.includes('Fossil Dig') ||
      c.name.includes('Desperado Barrel Dragon') ||
      c.name.includes('Heavy Metal Raiders') ||
      c.name.includes('Proton Blast') ||
      c.name.includes('BM-4 Blast Spider'),
  },
  // 23. Bastion Chemical & Syrus Roids & Arcana Force & Cloudian & Gravekeeper's / Ishizu
  {
    name: 'Chemical / Roids / Arcana Force / Cloudian / Ishizu',
    match: (c) =>
      c.name.includes('Water Dragon Cluster') ||
      c.name.includes('Duoterion') ||
      c.name.includes('Bonding - D2O') ||
      c.name.includes('Bonding - DHO') ||
      c.name.includes('Bonding - H2O') ||
      c.name.includes('Megaroid City') ||
      c.name.includes('Mixeroid') ||
      c.name.includes('Dragonroid') ||
      c.name.includes('Mobile Base') ||
      c.name.includes('Emergeroid Call') ||
      c.name.includes('Arcana Force') ||
      c.name.includes('Light Barrier') ||
      c.name.includes('Arcana Reading') ||
      c.name.includes('Arcana Spread') ||
      c.name.includes('Cloudian') ||
      c.name.includes('Fog Control') ||
      c.name.includes('Gravekeeper\'s') ||
      c.name.includes('Necrovalley') ||
      c.name.includes('Mudora') ||
      c.name.includes('Keldo') ||
      c.name.includes('Kelbek') ||
      c.name.includes('Agido') ||
      c.name.includes('Zolga the Prophet'),
  },
  // 24. Classic Staples & Pot series & Handtraps & Zombie engine
  {
    name: 'Classic Staples & Pot series & Handtraps & Zombie Engine',
    match: (c) =>
      c.name.includes('Pot of Extravagance') ||
      c.name.includes('Pot of Desires') ||
      c.name.includes('Pot of Duality') ||
      c.name.includes('Pot of Avarice') ||
      c.name.includes('Pot of Acquisitiveness') ||
      c.name.includes('Pot of Prosperity') ||
      c.name.includes('Infinite Impermanence') ||
      c.name.includes('Effect Veiler') ||
      c.name.includes('Ghost Ogre & Snow Rabbit') ||
      c.name.includes('Ash Blossom & Joyous Spring') ||
      c.name.includes('Ghost Belle & Haunted Mansion') ||
      c.name.includes('Ghost Reaper & Winter Cherries') ||
      c.name.includes('Ghost Mourner & Moonlit Chill') ||
      c.name.includes('Droll & Lock Bird') ||
      c.name.includes('Nibiru, the Primal Being') ||
      c.name.includes('Gozuki') ||
      c.name.includes('Mezuki') ||
      c.name.includes('Uni-Zombie') ||
      c.name.includes('Shiranui Solitaire') ||
      c.name.includes('Zombie World') ||
      c.name.includes('Doomking Balerdroch') ||
      c.name.includes('Glow-Up Bloom') ||
      c.name.includes('Jack-o-Bolan') ||
      c.name.includes('Necronize') ||
      c.name.includes('Dragonecro Nethersoul Dragon') ||
      c.name.includes('Called by the Grave') ||
      c.name.includes('Crossout Designator') ||
      c.name.includes('Lightning Storm') ||
      c.name.includes('Triple Tactics Talent') ||
      c.name.includes('Triple Tactics Thrust') ||
      c.name.includes('Dark Ruler No More') ||
      c.name.includes('Forbidden Droplet') ||
      c.name.includes('Forbidden Chalice') ||
      c.name.includes('Forbidden Lance') ||
      c.name.includes('Super Polymerization'),
  },
];

async function runImport() {
  console.log('=== STARTING DM & GX LEGACY CARDS IMPORT ===');

  const babelDbPath = path.resolve('tmp/babel-cards.cdb');
  const targetDbPath = path.resolve('resources/cards.cdb');
  const cardScriptsDir = path.resolve('tmp/CardScripts/official');
  const targetScriptsDir = path.resolve('resources/scripts/official');

  if (!fs.existsSync(babelDbPath)) {
    throw new Error(`BabelCDB not found at ${babelDbPath}`);
  }
  if (!fs.existsSync(cardScriptsDir)) {
    throw new Error(`CardScripts not found at ${cardScriptsDir}`);
  }
  if (!fs.existsSync(targetScriptsDir)) {
    fs.mkdirSync(targetScriptsDir, { recursive: true });
  }

  const babelDb = new Database(babelDbPath, { readonly: true });
  const targetDb = new Database(targetDbPath);

  const existingIds = new Set(
    targetDb.prepare('SELECT id FROM datas').all().map((r: any) => r.id)
  );
  console.log(`Current card count in resources/cards.cdb: ${existingIds.size}`);

  const allBabelCards: CardRow[] = babelDb
    .prepare(
      'SELECT datas.*, texts.name, texts.desc, texts.str1, texts.str2, texts.str3, texts.str4, texts.str5, texts.str6, texts.str7, texts.str8, texts.str9, texts.str10, texts.str11, texts.str12, texts.str13, texts.str14, texts.str15, texts.str16 FROM datas JOIN texts ON datas.id = texts.id'
    )
    .all() as CardRow[];

  const toInsert: CardRow[] = [];
  const toInsertSet = new Set<number>();

  for (const group of ARCHETYPE_PATTERNS) {
    let groupCount = 0;
    for (const card of allBabelCards) {
      if (group.match(card)) {
        if (!existingIds.has(card.id) && !toInsertSet.has(card.id)) {
          toInsert.push(card);
          toInsertSet.add(card.id);
          groupCount++;
        }
      }
    }
    console.log(`- ${group.name}: +${groupCount} cards`);
  }

  console.log(`\nTotal new legacy cards to insert: ${toInsert.length}`);

  const insertDataStmt = targetDb.prepare(
    `INSERT OR REPLACE INTO datas (id, ot, alias, setcode, type, atk, def, level, race, attribute, category)
     VALUES (@id, @ot, @alias, @setcode, @type, @atk, @def, @level, @race, @attribute, @category)`
  );

  const insertTextStmt = targetDb.prepare(
    `INSERT OR REPLACE INTO texts (id, name, desc, str1, str2, str3, str4, str5, str6, str7, str8, str9, str10, str11, str12, str13, str14, str15, str16)
     VALUES (@id, @name, @desc, @str1, @str2, @str3, @str4, @str5, @str6, @str7, @str8, @str9, @str10, @str11, @str12, @str13, @str14, @str15, @str16)`
  );

  let scriptCopiedCount = 0;
  let scriptMissingCount = 0;

  const insertTx = targetDb.transaction((cards: CardRow[]) => {
    for (const card of cards) {
      insertDataStmt.run({
        id: card.id,
        ot: card.ot,
        alias: card.alias,
        setcode: Number(card.setcode),
        type: card.type,
        atk: card.atk,
        def: card.def,
        level: card.level,
        race: card.race,
        attribute: card.attribute,
        category: card.category,
      });

      insertTextStmt.run({
        id: card.id,
        name: card.name,
        desc: card.desc,
        str1: card.str1 ?? '',
        str2: card.str2 ?? '',
        str3: card.str3 ?? '',
        str4: card.str4 ?? '',
        str5: card.str5 ?? '',
        str6: card.str6 ?? '',
        str7: card.str7 ?? '',
        str8: card.str8 ?? '',
        str9: card.str9 ?? '',
        str10: card.str10 ?? '',
        str11: card.str11 ?? '',
        str12: card.str12 ?? '',
        str13: card.str13 ?? '',
        str14: card.str14 ?? '',
        str15: card.str15 ?? '',
        str16: card.str16 ?? '',
      });

      // Copy Lua script
      const scriptName = `c${card.id}.lua`;
      const srcScript = path.join(cardScriptsDir, scriptName);
      const destScript = path.join(targetScriptsDir, scriptName);

      if (fs.existsSync(srcScript)) {
        fs.copyFileSync(srcScript, destScript);
        scriptCopiedCount++;
      } else {
        // If alias script exists, copy that too
        if (card.alias && card.alias > 0) {
          const aliasScriptName = `c${card.alias}.lua`;
          const srcAlias = path.join(cardScriptsDir, aliasScriptName);
          const destAlias = path.join(targetScriptsDir, aliasScriptName);
          if (fs.existsSync(srcAlias)) {
            fs.copyFileSync(srcAlias, destAlias);
            scriptCopiedCount++;
          } else {
            scriptMissingCount++;
          }
        } else {
          scriptMissingCount++;
        }
      }
    }
  });

  insertTx(toInsert);

  const finalCount = targetDb
    .prepare('SELECT COUNT(*) as c FROM datas')
    .get() as { c: number };
  console.log(`\n🎉 Import completed successfully!`);
  console.log(`- New Total Cards in cards.cdb: ${finalCount.c}`);
  console.log(`- Official Lua scripts synced: ${scriptCopiedCount}`);
  console.log(`- Scripts missing / vanilla: ${scriptMissingCount}`);

  targetDb.close();
  babelDb.close();
}

runImport().catch((err) => {
  console.error('[import-legacy-cards] Error:', err);
  process.exit(1);
});
