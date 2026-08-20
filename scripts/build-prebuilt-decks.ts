import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import type { CustomDeck } from '../src/shared/types/deck.js';

const ROOT_DIR = process.cwd();
const CDB_PATH = path.resolve(ROOT_DIR, 'resources/cards.cdb');
const CHARACTERS_PATH = path.resolve(ROOT_DIR, 'data/characters.json');
const OUTPUT_PATH = path.resolve(ROOT_DIR, 'data/prebuilt-decks.json');

const db = new Database(CDB_PATH, { readonly: true });
const getCardByIdStmt = db.prepare('SELECT d.id, t.name, d.type, d.atk, d.def FROM datas d JOIN texts t ON d.id = t.id WHERE d.id = ?');
const getCardByNameStmt = db.prepare('SELECT d.id, t.name, d.type FROM datas d JOIN texts t ON d.id = t.id WHERE LOWER(t.name) = LOWER(?) LIMIT 1');
const getCardByLikeStmt = db.prepare('SELECT d.id, t.name, d.type FROM datas d JOIN texts t ON d.id = t.id WHERE t.name LIKE ? LIMIT 1');

function resolveCard(nameOrId: string | number): number {
  if (typeof nameOrId === 'number') {
    const row = getCardByIdStmt.get(nameOrId);
    if (!row) throw new Error(`Card ID ${nameOrId} not found in SQLite database!`);
    return nameOrId;
  }
  const exact = getCardByNameStmt.get(nameOrId) as { id: number; name: string } | undefined;
  if (exact) return exact.id;

  const like = getCardByLikeStmt.get(`%${nameOrId}%`) as { id: number; name: string } | undefined;
  if (like) return like.id;

  throw new Error(`Card name "${nameOrId}" not found in SQLite database!`);
}

// 1. Load 60 Character Decks from characters.json
const charactersData = JSON.parse(fs.readFileSync(CHARACTERS_PATH, 'utf-8'));
const allDecks: CustomDeck[] = [];

for (const char of charactersData) {
  for (const deck of char.decks) {
    const mainCards = (deck.mainCards as (number | string)[]).map(resolveCard);
    const extraCards = (deck.extraCards || []).map(resolveCard);

    assert.ok(mainCards.length >= 40, `Character deck ${char.name} - ${deck.name} has ${mainCards.length} cards (< 40 min)`);

    const series = char.series as 'DM' | 'GX';
    const customDeck: CustomDeck = {
      id: deck.id,
      name: `${char.name} — ${deck.name}`,
      main: mainCards,
      extra: extraCards,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      series,
      archetype: deck.archetype || char.title,
      characterName: char.name,
      category: series === 'DM' ? 'character-dm' : 'character-gx',
    };
    allDecks.push(customDeck);
  }
}

console.log(`Loaded ${allDecks.length} character decks from characters.json.`);

// 2. Define 20 Popular Community / Fan-Favorite Decks
const POPULAR_DECKS_RAW: Array<{
  id: string;
  name: string;
  series: 'DM' | 'GX';
  archetype: string;
  main: (string | number)[];
  extra: (string | number)[];
}> = [
  // 1. Cyber Dragon OTK (GX)
  {
    id: 'pop-cyber-dragon-otk',
    name: 'Cyber Dragon OTK',
    series: 'GX',
    archetype: 'Cyber Dragons / Machine Fusion',
    main: [
      'Cyber Dragon', 'Cyber Dragon', 'Cyber Dragon',
      'Cyber Phoenix', 'Cyber Phoenix', 'Cyber Phoenix',
      'Proto-Cyber Dragon', 'Proto-Cyber Dragon', 'Proto-Cyber Dragon',
      'Shining Angel', 'Shining Angel', 'Shining Angel',
      'Sangan', 'Sangan',
      'Reflect Bounder', 'Reflect Bounder',
      'Power Bond', 'Power Bond', 'Power Bond',
      'Overload Fusion', 'Overload Fusion', 'Overload Fusion',
      'Future Fusion', 'Future Fusion',
      'Polymerization', 'Polymerization',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
    ],
    extra: [
      'Cyber Twin Dragon', 'Cyber Twin Dragon',
      'Cyber End Dragon', 'Cyber End Dragon',
      'Chimeratech Overdragon', 'Chimeratech Overdragon',
    ],
  },
  // 2. Monarch Control (DM/GX)
  {
    id: 'pop-monarch-control',
    name: 'Monarch Control',
    series: 'GX',
    archetype: 'Monarch Tribute Control',
    main: [
      'Zaborg the Thunder Monarch', 'Zaborg the Thunder Monarch', 'Zaborg the Thunder Monarch',
      'Mobius the Frost Monarch', 'Mobius the Frost Monarch', 'Mobius the Frost Monarch',
      'Thestalos the Firestorm Monarch', 'Thestalos the Firestorm Monarch',
      'Treeborn Frog', 'Treeborn Frog', 'Treeborn Frog',
      'Sangan', 'Sangan',
      'Breaker the Magical Warrior', 'Breaker the Magical Warrior',
      'D.D. Warrior Lady', 'D.D. Warrior Lady',
      'Enemy Controller', 'Enemy Controller',
      'Soul Exchange', 'Soul Exchange', 'Soul Exchange',
      'Brain Control', 'Brain Control',
      'Heavy Storm',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
    ],
    extra: [],
  },
  // 3. Chaos Control (BLS & CED) (DM)
  {
    id: 'pop-chaos-control-bls',
    name: 'Chaos Control (BLS & CED)',
    series: 'DM',
    archetype: 'Chaos Light & Dark',
    main: [
      'Black Luster Soldier - Envoy of the Beginning', 'Black Luster Soldier - Envoy of the Beginning',
      'Chaos Sorcerer', 'Chaos Sorcerer',
      'Breaker the Magical Warrior', 'Breaker the Magical Warrior',
      'D.D. Warrior Lady', 'D.D. Warrior Lady', 'D.D. Warrior Lady',
      'Sangan', 'Sangan',
      'Shining Angel', 'Shining Angel', 'Shining Angel',
      'Mystic Tomato', 'Mystic Tomato', 'Mystic Tomato',
      'Magician of Faith', 'Magician of Faith',
      'Sinister Serpent',
      'Snatch Steal',
      'Premature Burial',
      'Pot of Greed', 'Pot of Greed',
      'Graceful Charity', 'Graceful Charity',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force',
      'Ring of Destruction', 'Ring of Destruction',
      'Torrential Tribute', 'Torrential Tribute',
      'Solemn Judgment', 'Solemn Judgment',
    ],
    extra: [],
  },
  // 4. Gladiator Beast War (GX)
  {
    id: 'pop-gladiator-beasts',
    name: 'Gladiator Beast War',
    series: 'GX',
    archetype: 'Gladiator Beasts',
    main: [
      'Gladiator Beast Bestiari', 'Gladiator Beast Bestiari', 'Gladiator Beast Bestiari',
      'Gladiator Beast Laquari', 'Gladiator Beast Laquari', 'Gladiator Beast Laquari',
      'Gladiator Beast Darius', 'Gladiator Beast Darius', 'Gladiator Beast Darius',
      'Gladiator Beast Hoplomus', 'Gladiator Beast Hoplomus', 'Gladiator Beast Hoplomus',
      'Gladiator Beast Murmillo', 'Gladiator Beast Murmillo', 'Gladiator Beast Murmillo',
      'Gladiator Beast Andal', 'Gladiator Beast Andal', 'Gladiator Beast Andal',
      "Gladiator Beast's Respite", "Gladiator Beast's Respite", "Gladiator Beast's Respite",
      'Sangan', 'Sangan',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
      'Trap Hole', 'Trap Hole', 'Trap Hole',
    ],
    extra: [
      'Gladiator Beast Gyzarus', 'Gladiator Beast Gyzarus', 'Gladiator Beast Gyzarus',
      'Gladiator Beast Heraklinos', 'Gladiator Beast Heraklinos',
    ],
  },
  // 5. Lightsworn Judgement (GX)
  {
    id: 'pop-lightsworn-judgement',
    name: 'Lightsworn Judgement',
    series: 'GX',
    archetype: 'Lightsworn Mill',
    main: [
      'Judgment Dragon', 'Judgment Dragon', 'Judgment Dragon',
      'Lumina, Lightsworn Summoner', 'Lumina, Lightsworn Summoner', 'Lumina, Lightsworn Summoner',
      'Lyla, Lightsworn Sorceress', 'Lyla, Lightsworn Sorceress', 'Lyla, Lightsworn Sorceress',
      'Wulf, Lightsworn Beast', 'Wulf, Lightsworn Beast', 'Wulf, Lightsworn Beast',
      'Garoth, Lightsworn Warrior', 'Garoth, Lightsworn Warrior', 'Garoth, Lightsworn Warrior',
      'Ehren, Lightsworn Monk', 'Ehren, Lightsworn Monk', 'Ehren, Lightsworn Monk',
      'Solar Recharge', 'Solar Recharge', 'Solar Recharge',
      'Foolish Burial', 'Foolish Burial',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
      'Trap Hole', 'Trap Hole', 'Trap Hole',
    ],
    extra: [],
  },
  // 6. Dark World Discard (GX)
  {
    id: 'pop-dark-world-discard',
    name: 'Dark World Discard',
    series: 'GX',
    archetype: 'Dark World Fiends',
    main: [
      'Sillva, Warlord of Dark World', 'Sillva, Warlord of Dark World', 'Sillva, Warlord of Dark World',
      'Goldd, Wu-Lord of Dark World', 'Goldd, Wu-Lord of Dark World', 'Goldd, Wu-Lord of Dark World',
      'Broww, Huntsman of Dark World', 'Broww, Huntsman of Dark World', 'Broww, Huntsman of Dark World',
      'Brron, Mad King of Dark World', 'Brron, Mad King of Dark World', 'Brron, Mad King of Dark World',
      'Sangan', 'Sangan', 'Sangan',
      'Night Assailant', 'Night Assailant', 'Night Assailant',
      'Dark World Dealings', 'Dark World Dealings', 'Dark World Dealings',
      'Dark World Lightning', 'Dark World Lightning', 'Dark World Lightning',
      'Card Destruction',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
    ],
    extra: [],
  },
  // 7. Six Samurai Bushido (GX)
  {
    id: 'pop-six-samurai-bushido',
    name: 'Six Samurai Bushido',
    series: 'GX',
    archetype: 'Six Samurai Warriors',
    main: [
      'Grandmaster of the Six Samurai', 'Grandmaster of the Six Samurai', 'Grandmaster of the Six Samurai',
      'The Six Samurai - Zanji', 'The Six Samurai - Zanji', 'The Six Samurai - Zanji',
      'The Six Samurai - Irou', 'The Six Samurai - Irou', 'The Six Samurai - Irou',
      'The Six Samurai - Yaichi', 'The Six Samurai - Yaichi', 'The Six Samurai - Yaichi',
      'The Six Samurai - Kamon', 'The Six Samurai - Kamon', 'The Six Samurai - Kamon',
      'Great Shogun Shien', 'Great Shogun Shien', 'Great Shogun Shien',
      'Six Samurai United', 'Six Samurai United', 'Six Samurai United',
      'Reinforcement of the Army', 'Reinforcement of the Army', 'Reinforcement of the Army',
      'Heavy Storm',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
    ],
    extra: [],
  },
  // 8. Zombie Swarm / Vampire Lord (DM/GX)
  {
    id: 'pop-zombie-swarm-vampire',
    name: 'Zombie Swarm & Vampire Lord',
    series: 'DM',
    archetype: 'Zombies / Vampire Lord',
    main: [
      'Vampire Lord', 'Vampire Lord', 'Vampire Lord',
      'Ryu Kokki', 'Ryu Kokki', 'Ryu Kokki',
      'Pyramid Turtle', 'Pyramid Turtle', 'Pyramid Turtle',
      'Spirit Reaper', 'Spirit Reaper', 'Spirit Reaper',
      'Zombie Master', 'Zombie Master', 'Zombie Master',
      'Mezuki', 'Mezuki', 'Mezuki',
      'Sangan',
      'Book of Life', 'Book of Life', 'Book of Life',
      'Card of Safe Return', 'Card of Safe Return',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Torrential Tribute', 'Torrential Tribute',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
    ],
    extra: [],
  },
  // 9. Volcanic Burn & Blaze (GX)
  {
    id: 'pop-volcanic-burn',
    name: 'Volcanic Burn & Blaze',
    series: 'GX',
    archetype: 'Volcanic Pyros',
    main: [
      'Volcanic Doomfire', 'Volcanic Doomfire', 'Volcanic Doomfire',
      'Volcanic Rocket', 'Volcanic Rocket', 'Volcanic Rocket',
      'Volcanic Scattershot', 'Volcanic Scattershot', 'Volcanic Scattershot',
      'Volcanic Shell', 'Volcanic Shell', 'Volcanic Shell',
      'Sangan', 'Sangan', 'Sangan',
      'Solar Flare Dragon', 'Solar Flare Dragon', 'Solar Flare Dragon',
      'Blaze Accelerator', 'Blaze Accelerator', 'Blaze Accelerator',
      'Tri-Blaze Accelerator', 'Tri-Blaze Accelerator',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
      'Secret Barrel', 'Secret Barrel', 'Secret Barrel',
    ],
    extra: [],
  },
  // 10. Ancient Gear Titan (GX)
  {
    id: 'pop-ancient-gear-titan',
    name: 'Ancient Gear Titan',
    series: 'GX',
    archetype: 'Ancient Gear Machines',
    main: [
      'Ancient Gear Golem', 'Ancient Gear Golem', 'Ancient Gear Golem',
      'Ancient Gear Beast', 'Ancient Gear Beast', 'Ancient Gear Beast',
      'Ancient Gear Engineer', 'Ancient Gear Engineer', 'Ancient Gear Engineer',
      'Ancient Gear Soldier', 'Ancient Gear Soldier', 'Ancient Gear Soldier',
      'Sangan', 'Sangan', 'Sangan',
      'Ancient Gear Castle', 'Ancient Gear Castle', 'Ancient Gear Castle',
      'Ancient Gear Drill', 'Ancient Gear Drill', 'Ancient Gear Drill',
      'Heavy Storm',
      'Polymerization', 'Polymerization', 'Polymerization',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
    ],
    extra: [
      'Ultimate Ancient Gear Golem', 'Ultimate Ancient Gear Golem', 'Ultimate Ancient Gear Golem',
    ],
  },
  // 11. Gravekeeper's Necrovalley (DM)
  {
    id: 'pop-gravekeepers-necrovalley',
    name: "Gravekeeper's Necrovalley",
    series: 'DM',
    archetype: "Gravekeeper's Spellcasters",
    main: [
      "Gravekeeper's Spy", "Gravekeeper's Spy", "Gravekeeper's Spy",
      "Gravekeeper's Commandant", "Gravekeeper's Commandant", "Gravekeeper's Commandant",
      "Gravekeeper's Assailant", "Gravekeeper's Assailant", "Gravekeeper's Assailant",
      "Gravekeeper's Guard", "Gravekeeper's Guard", "Gravekeeper's Guard",
      "Gravekeeper's Chief", "Gravekeeper's Chief", "Gravekeeper's Chief",
      'Sangan', 'Sangan',
      'Necrovalley', 'Necrovalley', 'Necrovalley',
      'Royal Tribute', 'Royal Tribute',
      'Rite of Spirit', 'Rite of Spirit', 'Rite of Spirit',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
      'Torrential Tribute', 'Torrential Tribute',
    ],
    extra: [],
  },
  // 12. Toon Chaos Realm (DM)
  {
    id: 'pop-toon-chaos-realm',
    name: 'Toon Chaos Realm',
    series: 'DM',
    archetype: 'Toon Monsters',
    main: [
      'Toon Dark Magician Girl', 'Toon Dark Magician Girl', 'Toon Dark Magician Girl',
      'Toon Gemini Elf', 'Toon Gemini Elf', 'Toon Gemini Elf',
      'Toon Summoned Skull', 'Toon Summoned Skull', 'Toon Summoned Skull',
      'Toon Mermaid', 'Toon Mermaid', 'Toon Mermaid',
      'Sangan', 'Sangan', 'Sangan',
      'Toon World', 'Toon World', 'Toon World',
      'Toon Table of Contents', 'Toon Table of Contents', 'Toon Table of Contents',
      'Toon Defense', 'Toon Defense', 'Toon Defense',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
      'Magic Jammer', 'Magic Jammer', 'Magic Jammer',
    ],
    extra: [],
  },
  // 13. Destiny HERO Turbo (GX)
  {
    id: 'pop-destiny-hero-turbo',
    name: 'Destiny HERO Turbo',
    series: 'GX',
    archetype: 'Destiny HERO Warriors',
    main: [
      'Destiny HERO - Plasma', 'Destiny HERO - Plasma', 'Destiny HERO - Plasma',
      'Destiny HERO - Dogma', 'Destiny HERO - Dogma', 'Destiny HERO - Dogma',
      'Destiny HERO - Malicious', 'Destiny HERO - Malicious', 'Destiny HERO - Malicious',
      'Destiny HERO - Diamond Dude', 'Destiny HERO - Diamond Dude', 'Destiny HERO - Diamond Dude',
      'Destiny HERO - Disk Commander',
      'Elemental HERO Stratos',
      'Sangan', 'Sangan',
      'Destiny Draw', 'Destiny Draw', 'Destiny Draw',
      'Allure of Darkness', 'Allure of Darkness', 'Allure of Darkness',
      'Reinforcement of the Army', 'Reinforcement of the Army', 'Reinforcement of the Army',
      'Heavy Storm',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
    ],
    extra: [
      'Destiny End Dragoon', 'Destiny End Dragoon',
    ],
  },
  // 14. Crystal Beast Rainbow OTK (GX)
  {
    id: 'pop-crystal-beast-rainbow',
    name: 'Crystal Beast Rainbow OTK',
    series: 'GX',
    archetype: 'Crystal Beasts',
    main: [
      'Rainbow Dragon', 'Rainbow Dragon', 'Rainbow Dragon',
      'Crystal Beast Sapphire Pegasus', 'Crystal Beast Sapphire Pegasus', 'Crystal Beast Sapphire Pegasus',
      'Crystal Beast Ruby Carbuncle', 'Crystal Beast Ruby Carbuncle', 'Crystal Beast Ruby Carbuncle',
      'Crystal Beast Topaz Tiger', 'Crystal Beast Topaz Tiger', 'Crystal Beast Topaz Tiger',
      'Crystal Beast Amber Mammoth', 'Crystal Beast Amber Mammoth', 'Crystal Beast Amber Mammoth',
      'Crystal Beast Cobalt Eagle', 'Crystal Beast Cobalt Eagle',
      'Crystal Beast Amethyst Cat', 'Crystal Beast Amethyst Cat',
      'Crystal Beast Emerald Tortoise', 'Crystal Beast Emerald Tortoise',
      'Crystal Abundance', 'Crystal Abundance', 'Crystal Abundance',
      'Crystal Beacon', 'Crystal Beacon', 'Crystal Beacon',
      'Crystal Promise', 'Crystal Promise',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
    ],
    extra: [],
  },
  // 15. Armed Dragon LV Wind (GX)
  {
    id: 'pop-armed-dragon-level',
    name: 'Armed Dragon LV Wind',
    series: 'GX',
    archetype: 'Armed Dragons / Level-Up',
    main: [
      'Armed Dragon LV10', 'Armed Dragon LV10', 'Armed Dragon LV10',
      'Armed Dragon LV7', 'Armed Dragon LV7', 'Armed Dragon LV7',
      'Armed Dragon LV5', 'Armed Dragon LV5', 'Armed Dragon LV5',
      'Armed Dragon LV3', 'Armed Dragon LV3', 'Armed Dragon LV3',
      'Flying Kamakiri #1', 'Flying Kamakiri #1', 'Flying Kamakiri #1',
      'Sangan', 'Sangan',
      'Level Up!', 'Level Up!', 'Level Up!',
      'Level Modulation', 'Level Modulation', 'Level Modulation',
      'Stamping Destruction', 'Stamping Destruction',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
      'Threatening Roar', 'Threatening Roar',
    ],
    extra: [],
  },
  // 16. Relinquished Illusion Ritual (DM)
  {
    id: 'pop-relinquished-illusion',
    name: 'Relinquished Illusion Ritual',
    series: 'DM',
    archetype: 'Illusion / Ritual',
    main: [
      'Relinquished', 'Relinquished', 'Relinquished',
      'Manju of the Ten Thousand Hands', 'Manju of the Ten Thousand Hands', 'Manju of the Ten Thousand Hands',
      'Senju of the Thousand Hands', 'Senju of the Thousand Hands', 'Senju of the Thousand Hands',
      'Sonic Bird', 'Sonic Bird', 'Sonic Bird',
      'Sangan', 'Sangan', 'Sangan',
      'Kuriboh', 'Kuriboh', 'Kuriboh',
      'Black Illusion Ritual', 'Black Illusion Ritual', 'Black Illusion Ritual',
      'Polymerization', 'Polymerization', 'Polymerization',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
      'Waboku', 'Waboku',
    ],
    extra: [
      'Thousand-Eyes Restrict', 'Thousand-Eyes Restrict', 'Thousand-Eyes Restrict',
    ],
  },
  // 17. Harpie Lady Swarm (DM)
  {
    id: 'pop-harpie-lady-swarm',
    name: 'Harpie Lady Swarm',
    series: 'DM',
    archetype: 'Harpies / Winged Beasts',
    main: [
      'Cyber Harpie Lady', 'Cyber Harpie Lady', 'Cyber Harpie Lady',
      'Harpie Lady 1', 'Harpie Lady 1', 'Harpie Lady 1',
      'Harpie Queen', 'Harpie Queen', 'Harpie Queen',
      "Harpie's Pet Baby Dragon", "Harpie's Pet Baby Dragon", "Harpie's Pet Baby Dragon",
      'Flying Kamakiri #1', 'Flying Kamakiri #1', 'Flying Kamakiri #1',
      'Sangan',
      "Harpies' Hunting Ground", "Harpies' Hunting Ground", "Harpies' Hunting Ground",
      'Elegant Egotist', 'Elegant Egotist', 'Elegant Egotist',
      'Harpie Lady Sisters',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Icarus Attack', 'Icarus Attack', 'Icarus Attack',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
    ],
    extra: [],
  },
  // 18. Dinosaur Beatdown / Hydrogeddon (GX)
  {
    id: 'pop-dinosaur-hydrogeddon',
    name: 'Dinosaur Beatdown & Hydrogeddon',
    series: 'GX',
    archetype: 'Dinosaurs / Jurassic Swarm',
    main: [
      'Ultimate Tyranno', 'Ultimate Tyranno', 'Ultimate Tyranno',
      'Super Conductor Tyranno', 'Super Conductor Tyranno', 'Super Conductor Tyranno',
      'Hydrogeddon', 'Hydrogeddon', 'Hydrogeddon',
      'Oxygeddon', 'Oxygeddon', 'Oxygeddon',
      'Black Veloci', 'Black Veloci', 'Black Veloci',
      'Hyper Hammerhead', 'Hyper Hammerhead', 'Hyper Hammerhead',
      'Big Evolution Pill', 'Big Evolution Pill', 'Big Evolution Pill',
      'Fossil Excavation', 'Fossil Excavation', 'Fossil Excavation',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Survival Instinct', 'Survival Instinct',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
    ],
    extra: [],
  },
  // 19. Ojama Lockdown (GX)
  {
    id: 'pop-ojama-lockdown',
    name: 'Ojama Lockdown & Hurricane',
    series: 'GX',
    archetype: 'Ojamas / Zone Blocker',
    main: [
      'Ojama Yellow', 'Ojama Yellow', 'Ojama Yellow',
      'Ojama Green', 'Ojama Green', 'Ojama Green',
      'Ojama Black', 'Ojama Black', 'Ojama Black',
      'Ojamagic', 'Ojamagic', 'Ojamagic',
      'Ojama Delta Hurricane!!', 'Ojama Delta Hurricane!!', 'Ojama Delta Hurricane!!',
      'Ojama Trio', 'Ojama Trio', 'Ojama Trio',
      'Polymerization', 'Polymerization', 'Polymerization',
      'Sangan', 'Sangan', 'Sangan',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
      'Threatening Roar', 'Threatening Roar', 'Threatening Roar',
    ],
    extra: [
      'Ojama King', 'Ojama King', 'Ojama King',
      'Ojama Knight', 'Ojama Knight', 'Ojama Knight',
    ],
  },
  // 20. Frog Control / Water Stall (GX)
  {
    id: 'pop-frog-control-water',
    name: 'Frog Control & Water Stall',
    series: 'GX',
    archetype: 'Frogs / Aqua Control',
    main: [
      'Treeborn Frog', 'Treeborn Frog', 'Treeborn Frog',
      'Des Frog', 'Des Frog', 'Des Frog',
      'T.A.D.P.O.L.E.', 'T.A.D.P.O.L.E.', 'T.A.D.P.O.L.E.',
      'Unifrog', 'Unifrog', 'Unifrog',
      'Mother Grizzly', 'Mother Grizzly', 'Mother Grizzly',
      'Sangan', 'Sangan', 'Sangan',
      'Salvage', 'Salvage', 'Salvage',
      'A Legendary Ocean', 'A Legendary Ocean', 'A Legendary Ocean',
      'Polymerization', 'Polymerization', 'Polymerization',
      'Pot of Greed', 'Pot of Greed',
      'Raigeki',
      'Dark Hole',
      'Monster Reborn', 'Monster Reborn',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force', 'Mirror Force',
      'Solemn Judgment', 'Solemn Judgment', 'Solemn Judgment',
    ],
    extra: [
      'D.3.S. Frog', 'D.3.S. Frog', 'D.3.S. Frog',
    ],
  },
  // 21. Slifer the Sky Dragon — Divine Overflow (DM)
  {
    id: 'pop-slifer-sky-dragon',
    name: 'Slifer the Sky Dragon — Divine Overflow',
    series: 'DM',
    archetype: 'Egyptian God / Hand Overflow',
    main: [
      'Slifer the Sky Dragon', 'Slifer the Sky Dragon', 'Slifer the Sky Dragon',
      'Gorz the Emissary of Darkness',
      'Cyber Valley', 'Cyber Valley',
      'Treeborn Frog', 'Treeborn Frog',
      'Marshmallon', 'Marshmallon',
      'Spirit Reaper', 'Spirit Reaper',
      'Sangan', 'Sangan',
      'Witch of the Black Forest', 'Witch of the Black Forest',
      'Gellenduo', 'Gellenduo',
      'Morphing Jar',
      'Infinite Cards', 'Infinite Cards',
      'Card of Safe Return', 'Card of Safe Return',
      'Soul Exchange', 'Soul Exchange',
      'Brain Control', 'Brain Control',
      'Double Summon', 'Double Summon',
      'Swords of Revealing Light', 'Swords of Revealing Light',
      'Pot of Greed', 'Pot of Greed',
      'Graceful Charity', 'Graceful Charity',
      'Monster Reborn', 'Monster Reborn',
      'Premature Burial',
      'Snatch Steal',
      'Change of Heart',
      'Card Destruction',
      'Raigeki',
      'Harpie\'s Feather Duster',
      'Mystical Space Typhoon', 'Mystical Space Typhoon',
      'Mirror Force', 'Mirror Force',
      'Call of the Haunted',
      'Ultimate Offering',
      'Solemn Judgment', 'Solemn Judgment',
    ],
    extra: [],
  },
];

for (const pDeck of POPULAR_DECKS_RAW) {
  const mainCards = pDeck.main.map(resolveCard);
  const extraCards = pDeck.extra.map(resolveCard);

  assert.ok(mainCards.length >= 40, `Popular deck ${pDeck.name} has ${mainCards.length} cards (< 40 min)`);

  const customDeck: CustomDeck = {
    id: pDeck.id,
    name: pDeck.name,
    main: mainCards,
    extra: extraCards,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    series: pDeck.series,
    archetype: pDeck.archetype,
    characterName: 'Community Popular',
    category: pDeck.series === 'DM' ? 'popular-dm' : 'popular-gx',
  };
  allDecks.push(customDeck);
}

// Generate .ydk file helper
const DECKS_DIR = path.resolve(ROOT_DIR, 'resources/decks');
if (!fs.existsSync(DECKS_DIR)) {
  fs.mkdirSync(DECKS_DIR, { recursive: true });
}

for (const deck of allDecks) {
  const ydkPath = path.resolve(DECKS_DIR, `${deck.id}.ydk`);
  const lines: string[] = ['#created by yugioh-desktop-app', '#main'];
  for (const id of deck.main) {
    lines.push(String(id));
  }
  lines.push('#extra');
  for (const id of deck.extra) {
    lines.push(String(id));
  }
  lines.push('!side');
  fs.writeFileSync(ydkPath, lines.join('\n') + '\n', 'utf-8');
}

console.log(`Total decks assembled: ${allDecks.length}`);

// Write formatted JSON
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allDecks, null, 2), 'utf-8');
console.log(`Saved all ${allDecks.length} pre-built decks to ${OUTPUT_PATH}!`);
