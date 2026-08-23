import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const cdbPath = path.resolve(process.cwd(), 'resources/cards.cdb');
const whitelistPath = path.resolve(process.cwd(), 'data/card-pool-whitelist.json');

const db = new Database(cdbPath);

// Bitmasks
const TYPE_TOKEN = 0x4011; // TYPE_MONSTER (0x1) | TYPE_NORMAL (0x10) | TYPE_TOKEN (0x4000)

export interface TokenDef {
  id: number;
  name: string;
  desc: string;
  atk: number;
  def: number;
  level: number;
  race: number;
  raceName: string;
  attribute: number;
  attributeName: string;
  parentCardName: string;
}

const TOKENS: TokenDef[] = [
  // Scapegoat
  {
    id: 73915052,
    name: 'Sheep Token',
    desc: 'Special Summoned with the effect of "Scapegoat". This token cannot be Tributed for a Tribute Summon.',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x4000,
    raceName: 'Beast',
    attribute: 0x1,
    attributeName: 'EARTH',
    parentCardName: 'Scapegoat',
  },
  {
    id: 73915053,
    name: 'Sheep Token',
    desc: 'Special Summoned with the effect of "Scapegoat". This token cannot be Tributed for a Tribute Summon.',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x4000,
    raceName: 'Beast',
    attribute: 0x1,
    attributeName: 'EARTH',
    parentCardName: 'Scapegoat',
  },
  {
    id: 73915054,
    name: 'Sheep Token',
    desc: 'Special Summoned with the effect of "Scapegoat". This token cannot be Tributed for a Tribute Summon.',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x4000,
    raceName: 'Beast',
    attribute: 0x1,
    attributeName: 'EARTH',
    parentCardName: 'Scapegoat',
  },
  {
    id: 73915055,
    name: 'Sheep Token',
    desc: 'Special Summoned with the effect of "Scapegoat". This token cannot be Tributed for a Tribute Summon.',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x4000,
    raceName: 'Beast',
    attribute: 0x1,
    attributeName: 'EARTH',
    parentCardName: 'Scapegoat',
  },

  // Stray Lambs
  {
    id: 60764582,
    name: 'Lamb Token',
    desc: 'Special Summoned with the effect of "Stray Lambs".',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x4000,
    raceName: 'Beast',
    attribute: 0x1,
    attributeName: 'EARTH',
    parentCardName: 'Stray Lambs',
  },
  {
    id: 60764583,
    name: 'Lamb Token',
    desc: 'Special Summoned with the effect of "Stray Lambs".',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x4000,
    raceName: 'Beast',
    attribute: 0x1,
    attributeName: 'EARTH',
    parentCardName: 'Stray Lambs',
  },

  // Ojama Trio
  {
    id: 29843092,
    name: 'Ojama Token',
    desc: 'Special Summoned in Defense Position on your opponent\'s side of the field with the effect of "Ojama Trio". It cannot be Tributed for a Tribute Summon. When destroyed, inflict 300 damage to its controller.',
    atk: 0,
    def: 1000,
    level: 2,
    race: 0x4000,
    raceName: 'Beast',
    attribute: 0x10,
    attributeName: 'LIGHT',
    parentCardName: 'Ojama Trio',
  },
  {
    id: 29843093,
    name: 'Ojama Token',
    desc: 'Special Summoned in Defense Position on your opponent\'s side of the field with the effect of "Ojama Trio". It cannot be Tributed for a Tribute Summon. When destroyed, inflict 300 damage to its controller.',
    atk: 0,
    def: 1000,
    level: 2,
    race: 0x4000,
    raceName: 'Beast',
    attribute: 0x10,
    attributeName: 'LIGHT',
    parentCardName: 'Ojama Trio',
  },
  {
    id: 29843094,
    name: 'Ojama Token',
    desc: 'Special Summoned in Defense Position on your opponent\'s side of the field with the effect of "Ojama Trio". It cannot be Tributed for a Tribute Summon. When destroyed, inflict 300 damage to its controller.',
    atk: 0,
    def: 1000,
    level: 2,
    race: 0x4000,
    raceName: 'Beast',
    attribute: 0x10,
    attributeName: 'LIGHT',
    parentCardName: 'Ojama Trio',
  },

  // Jam Breeding Machine (Slime Token)
  {
    id: 21770261,
    name: 'Slime Token',
    desc: 'Special Summoned in Attack Position with the effect of "Jam Breeding Machine".',
    atk: 500,
    def: 500,
    level: 1,
    race: 0x40,
    raceName: 'Aqua',
    attribute: 0x2,
    attributeName: 'WATER',
    parentCardName: 'Jam Breeding Machine',
  },

  // Dandylion
  {
    id: 15341822,
    name: 'Fluff Token',
    desc: 'Special Summoned in Defense Position with the effect of "Dandylion". These tokens cannot be Tributed for a Tribute Summon during the turn they are Special Summoned.',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x400,
    raceName: 'Plant',
    attribute: 0x8,
    attributeName: 'WIND',
    parentCardName: 'Dandylion',
  },
  {
    id: 15341823,
    name: 'Fluff Token',
    desc: 'Special Summoned in Defense Position with the effect of "Dandylion". These tokens cannot be Tributed for a Tribute Summon during the turn they are Special Summoned.',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x400,
    raceName: 'Plant',
    attribute: 0x8,
    attributeName: 'WIND',
    parentCardName: 'Dandylion',
  },

  // Fires of Doomsday
  {
    id: 46173680,
    name: 'Doomsday Token',
    desc: 'Special Summoned in Defense Position with the effect of "Fires of Doomsday". These tokens cannot be Tributed for a Tribute Summon, except for a DARK monster.',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x8,
    raceName: 'Fiend',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Fires of Doomsday',
  },
  {
    id: 46173681,
    name: 'Doomsday Token',
    desc: 'Special Summoned in Defense Position with the effect of "Fires of Doomsday". These tokens cannot be Tributed for a Tribute Summon, except for a DARK monster.',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x8,
    raceName: 'Fiend',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Fires of Doomsday',
  },

  // Grinder Golem
  {
    id: 75732623,
    name: 'Grinder Token',
    desc: 'Special Summoned in Attack Position on your field with the effect of "Grinder Golem".',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x8,
    raceName: 'Fiend',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Grinder Golem',
  },
  {
    id: 75732624,
    name: 'Grinder Token',
    desc: 'Special Summoned in Attack Position on your field with the effect of "Grinder Golem".',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x8,
    raceName: 'Fiend',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Grinder Golem',
  },

  // Raviel, Lord of Phantasms
  {
    id: 69890968,
    name: 'Phantasm Token',
    desc: 'Special Summoned with the effect of "Raviel, Lord of Phantasms". This token cannot declare an attack.',
    atk: 1000,
    def: 1000,
    level: 1,
    race: 0x8,
    raceName: 'Fiend',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Raviel, Lord of Phantasms',
  },

  // Gorz the Emissary of Darkness
  {
    id: 44330099,
    name: 'Emissary of Darkness Token',
    desc: 'Special Summoned with the effect of "Gorz the Emissary of Darkness". Its ATK and DEF are equal to the amount of battle damage you took.',
    atk: 0,
    def: 0,
    level: 7,
    race: 0x4,
    raceName: 'Fairy',
    attribute: 0x10,
    attributeName: 'LIGHT',
    parentCardName: 'Gorz the Emissary of Darkness',
  },

  // Fiend's Sanctuary
  {
    id: 24874631,
    name: 'Metal Fiend Token',
    desc: 'Special Summoned with the effect of "Fiend\'s Sanctuary". It cannot attack. Your opponent takes any battle damage you would have taken from battles involving this token.',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x8,
    raceName: 'Fiend',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: "Fiend's Sanctuary",
  },

  // Phantom Skyblaster
  {
    id: 12958920,
    name: 'Skyblaster Token',
    desc: 'Special Summoned with the effect of "Phantom Skyblaster".',
    atk: 500,
    def: 500,
    level: 4,
    race: 0x8,
    raceName: 'Fiend',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Phantom Skyblaster',
  },

  // Destiny HERO - Double Dude
  {
    id: 28355719,
    name: 'Double Dude Token',
    desc: 'Special Summoned during your Standby Phase with the effect of "Destiny HERO - Double Dude".',
    atk: 1000,
    def: 1000,
    level: 4,
    race: 0x1,
    raceName: 'Warrior',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Destiny HERO - Double Dude',
  },

  // Insect Queen
  {
    id: 91512836,
    name: 'Insect Monster Token',
    desc: 'Special Summoned in Attack Position with the effect of "Insect Queen".',
    atk: 100,
    def: 100,
    level: 1,
    race: 0x800,
    raceName: 'Insect',
    attribute: 0x1,
    attributeName: 'EARTH',
    parentCardName: 'Insect Queen',
  },

  // Statue of the Wicked
  {
    id: 65810490,
    name: 'Wicked Token',
    desc: 'Special Summoned when "Statue of the Wicked" is destroyed while Set.',
    atk: 1000,
    def: 1000,
    level: 4,
    race: 0x8,
    raceName: 'Fiend',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Statue of the Wicked',
  },

  // Cloning
  {
    id: 86871615,
    name: 'Clone Token',
    desc: 'Special Summoned with the effect of "Cloning".',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x1,
    raceName: 'Warrior',
    attribute: 0x1,
    attributeName: 'EARTH',
    parentCardName: 'Cloning',
  },

  // Victory Viper / Power Capsule
  {
    id: 93130022,
    name: 'Option Token',
    desc: 'Special Summoned with the effect of "Victory Viper XX03". Its ATK, DEF, Level, Race, and Attribute are always identical to Victory Viper XX03.',
    atk: 0,
    def: 0,
    level: 4,
    race: 0x20,
    raceName: 'Machine',
    attribute: 0x10,
    attributeName: 'LIGHT',
    parentCardName: 'Victory Viper XX03',
  },

  // Multiplication of Ants
  {
    id: 22493812,
    name: 'Army Ant Token',
    desc: 'Special Summoned in Attack Position with the effect of "Multiplication of Ants". These tokens cannot be Tributed for a Tribute Summon.',
    atk: 500,
    def: 1200,
    level: 4,
    race: 0x800,
    raceName: 'Insect',
    attribute: 0x1,
    attributeName: 'EARTH',
    parentCardName: 'Multiplication of Ants',
  },
  {
    id: 22493813,
    name: 'Army Ant Token',
    desc: 'Special Summoned in Attack Position with the effect of "Multiplication of Ants". These tokens cannot be Tributed for a Tribute Summon.',
    atk: 500,
    def: 1200,
    level: 4,
    race: 0x800,
    raceName: 'Insect',
    attribute: 0x1,
    attributeName: 'EARTH',
    parentCardName: 'Multiplication of Ants',
  },

  // Synthetic Seraphim
  {
    id: 16946850,
    name: 'Synthetic Seraph Token',
    desc: 'Special Summoned with the effect of "Synthetic Seraphim".',
    atk: 300,
    def: 300,
    level: 1,
    race: 0x4,
    raceName: 'Fairy',
    attribute: 0x10,
    attributeName: 'LIGHT',
    parentCardName: 'Synthetic Seraphim',
  },

  // Cloudian - Sheep Cloud
  {
    id: 56597273,
    name: 'Cloudian Token',
    desc: 'Special Summoned in Defense Position with the effect of "Cloudian - Sheep Cloud". These tokens cannot be Tributed for a Tribute Summon, except for a "Cloudian" monster.',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x4,
    raceName: 'Fairy',
    attribute: 0x2,
    attributeName: 'WATER',
    parentCardName: 'Cloudian - Sheep Cloud',
  },
  {
    id: 56597274,
    name: 'Cloudian Token',
    desc: 'Special Summoned in Defense Position with the effect of "Cloudian - Sheep Cloud". These tokens cannot be Tributed for a Tribute Summon, except for a "Cloudian" monster.',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x4,
    raceName: 'Fairy',
    attribute: 0x2,
    attributeName: 'WATER',
    parentCardName: 'Cloudian - Sheep Cloud',
  },

  // Lekunga
  {
    id: 62543393,
    name: 'Lekunga Token',
    desc: 'Special Summoned in Attack Position with the effect of "Lekunga".',
    atk: 700,
    def: 700,
    level: 2,
    race: 0x400,
    raceName: 'Plant',
    attribute: 0x2,
    attributeName: 'WATER',
    parentCardName: 'Lekunga',
  },

  // Phantasmal Martyrs
  {
    id: 93224849,
    name: 'Phantasmal Martyr Token',
    desc: 'Special Summoned in Attack Position with the effect of "Phantasmal Martyrs".',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x8,
    raceName: 'Fiend',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Phantasmal Martyrs',
  },
  {
    id: 93224850,
    name: 'Phantasmal Martyr Token',
    desc: 'Special Summoned in Attack Position with the effect of "Phantasmal Martyrs".',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x8,
    raceName: 'Fiend',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Phantasmal Martyrs',
  },
  {
    id: 93224851,
    name: 'Phantasmal Martyr Token',
    desc: 'Special Summoned in Attack Position with the effect of "Phantasmal Martyrs".',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x8,
    raceName: 'Fiend',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Phantasmal Martyrs',
  },

  // Cobra Jar
  {
    id: 86801872,
    name: 'Poisonous Snake Token',
    desc: 'Special Summoned with the effect of "Cobra Jar". During each of your End Phases, inflict 500 damage to your opponent.',
    atk: 1200,
    def: 1200,
    level: 3,
    race: 0x80000,
    raceName: 'Reptile',
    attribute: 0x1,
    attributeName: 'EARTH',
    parentCardName: 'Cobra Jar',
  },

  // Physical Double
  {
    id: 63442605,
    name: 'Mirage Token',
    desc: 'Special Summoned with the effect of "Physical Double". It has the same Level, Type, Attribute, ATK, and DEF as the targeted monster.',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x1,
    raceName: 'Warrior',
    attribute: 0x1,
    attributeName: 'EARTH',
    parentCardName: 'Physical Double',
  },

  // Wild Fire
  {
    id: 68815402,
    name: 'Wild Fire Token',
    desc: 'Special Summoned in Attack Position with the effect of "Wild Fire". It cannot declare an attack.',
    atk: 1000,
    def: 1000,
    level: 3,
    race: 0x80,
    raceName: 'Pyro',
    attribute: 0x4,
    attributeName: 'FIRE',
    parentCardName: 'Wild Fire',
  },

  // Sinister Seeds
  {
    id: 60406592,
    name: 'Sinister Seed Token',
    desc: 'Special Summoned in Attack Position with the effect of "Sinister Seeds".',
    atk: 100,
    def: 100,
    level: 1,
    race: 0x400,
    raceName: 'Plant',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Sinister Seeds',
  },

  // Regenerating Rose
  {
    id: 31986289,
    name: 'Rose Token',
    desc: 'Special Summoned in Attack Position with the effect of "Regenerating Rose".',
    atk: 800,
    def: 800,
    level: 3,
    race: 0x400,
    raceName: 'Plant',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Regenerating Rose',
  },
  {
    id: 31986290,
    name: 'Rose Token',
    desc: 'Special Summoned in Attack Position with the effect of "Regenerating Rose".',
    atk: 800,
    def: 800,
    level: 3,
    race: 0x400,
    raceName: 'Plant',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Regenerating Rose',
  },

  // Arcana Force XVIII - The Moon
  {
    id: 97452818,
    name: 'Moon Token',
    desc: 'Special Summoned during the Standby Phase with the effect of "Arcana Force XVIII - The Moon".',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x4,
    raceName: 'Fairy',
    attribute: 0x10,
    attributeName: 'LIGHT',
    parentCardName: 'Arcana Force XVIII - The Moon',
  },

  // Vicious Claw
  {
    id: 75524093,
    name: 'Evil Token',
    desc: 'Special Summoned to your opponent\'s side of the field in Attack Position with the effect of "Vicious Claw".',
    atk: 2500,
    def: 2500,
    level: 7,
    race: 0x8,
    raceName: 'Fiend',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Vicious Claw',
  },

  // Darklord Asmodeus
  {
    id: 85771020,
    name: 'Asmo Token',
    desc: 'Special Summoned in Attack Position when "Darklord Asmodeus" is destroyed by a card effect and sent to the GY. It cannot be destroyed by card effects.',
    atk: 1800,
    def: 1300,
    level: 5,
    race: 0x4,
    raceName: 'Fairy',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Darklord Asmodeus',
  },
  {
    id: 85771021,
    name: 'Deus Token',
    desc: 'Special Summoned in Attack Position when "Darklord Asmodeus" is destroyed by a card effect and sent to the GY. It cannot be destroyed by battle.',
    atk: 1200,
    def: 1200,
    level: 3,
    race: 0x4,
    raceName: 'Fairy',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Darklord Asmodeus',
  },

  // Des Dendle
  {
    id: 12965762,
    name: 'Wicked Plant Token',
    desc: 'Special Summoned with the effect of "Des Dendle".',
    atk: 800,
    def: 800,
    level: 1,
    race: 0x400,
    raceName: 'Plant',
    attribute: 0x1,
    attributeName: 'EARTH',
    parentCardName: 'Des Dendle',
  },

  // Blue Thunder T-45
  {
    id: 14089429,
    name: 'Thunder Option Token',
    desc: 'Special Summoned when "Blue Thunder T-45" destroys an opponent monster by battle. It cannot be Tributed for a Tribute Summon.',
    atk: 1500,
    def: 1500,
    level: 4,
    race: 0x20,
    raceName: 'Machine',
    attribute: 0x10,
    attributeName: 'LIGHT',
    parentCardName: 'Blue Thunder T-45',
  },

  // Metabo Globster
  {
    id: 49808197,
    name: 'Globster Token',
    desc: 'Special Summoned with the effect of "Metabo Globster". These tokens cannot be Tributed for a Tribute Summon, except for a DARK monster.',
    atk: 0,
    def: 0,
    level: 1,
    race: 0x8,
    raceName: 'Fiend',
    attribute: 0x20,
    attributeName: 'DARK',
    parentCardName: 'Metabo Globster',
  },
];

console.log(`Populating ${TOKENS.length} Token monsters into cards.cdb and card-pool-whitelist.json...`);

const insertDataStmt = db.prepare(`
  INSERT OR REPLACE INTO datas (id, ot, alias, setcode, type, atk, def, level, race, attribute, category)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertTextStmt = db.prepare(`
  INSERT OR REPLACE INTO texts (id, name, desc, str1, str2, str3, str4, str5, str6, str7, str8, str9, str10, str11, str12, str13, str14, str15, str16)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const whitelistJson = JSON.parse(fs.readFileSync(whitelistPath, 'utf-8'));

db.transaction(() => {
  for (const token of TOKENS) {
    // 1. Insert into datas table
    insertDataStmt.run(
      token.id,
      3, // ot: OCG/TCG
      0, // alias
      0, // setcode
      TYPE_TOKEN,
      token.atk,
      token.def,
      token.level,
      token.race,
      token.attribute,
      0, // category
    );

    // 2. Insert into texts table
    insertTextStmt.run(
      token.id,
      token.name,
      token.desc,
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
    );

    // 3. Add to whitelist JSON
    whitelistJson[String(token.id)] = {
      id: token.id,
      name: token.name,
      era: 'DM',
      type: 'Token Monster',
      atk: token.atk,
      def: token.def,
      level: token.level,
      race: token.raceName,
      attribute: token.attributeName,
    };
  }
})();

fs.writeFileSync(whitelistPath, JSON.stringify(whitelistJson, null, 2), 'utf-8');

console.log(`✓ Successfully inserted all ${TOKENS.length} Token monsters into cards.cdb and updated whitelist!`);
