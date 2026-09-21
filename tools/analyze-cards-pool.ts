import Database from 'better-sqlite3';

const db = new Database('resources/cards.cdb');

// 1. Core card counts
const total = db.prepare('SELECT count(*) as c FROM datas').get() as { c: number };
const monsters = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 1) != 0').get() as { c: number };
const normalMonsters = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 0x11) = 0x11').get() as { c: number };
const effectMonsters = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 0x21) = 0x21').get() as { c: number };
const fusions = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 0x40) != 0').get() as { c: number };
const rituals = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 0x80) != 0').get() as { c: number };
const synchros = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 0x2000) != 0').get() as { c: number };
const tuners = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 0x1000) != 0').get() as { c: number };
const flips = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 0x200000) != 0').get() as { c: number };

const spells = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 2) != 0').get() as { c: number };
const normalSpells = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 2) != 0 AND (type & (0x10000 | 0x20000 | 0x40000 | 0x80000 | 0x80)) = 0').get() as { c: number };
const quickplaySpells = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 0x10000) != 0').get() as { c: number };
const continuousSpells = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 2) != 0 AND (type & 0x20000) != 0').get() as { c: number };
const equipSpells = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 0x40000) != 0').get() as { c: number };
const fieldSpells = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 0x80000) != 0').get() as { c: number };

const traps = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 4) != 0').get() as { c: number };
const normalTraps = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 4) != 0 AND (type & (0x20000 | 0x100000)) = 0').get() as { c: number };
const continuousTraps = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 4) != 0 AND (type & 0x20000) != 0').get() as { c: number };
const counterTraps = db.prepare('SELECT count(*) as c FROM datas WHERE (type & 0x100000) != 0').get() as { c: number };

console.log('=== YUGIOH DATABASE INVENTORY ===');
console.log({
  totalCards: total.c,
  monsters: monsters.c,
  normalMonsters: normalMonsters.c,
  effectMonsters: effectMonsters.c,
  fusions: fusions.c,
  rituals: rituals.c,
  synchros: synchros.c,
  tuners: tuners.c,
  flips: flips.c,
  spells: spells.c,
  normalSpells: normalSpells.c,
  quickplaySpells: quickplaySpells.c,
  continuousSpells: continuousSpells.c,
  equipSpells: equipSpells.c,
  fieldSpells: fieldSpells.c,
  traps: traps.c,
  normalTraps: normalTraps.c,
  continuousTraps: continuousTraps.c,
  counterTraps: counterTraps.c,
});

// 2. High-impact staple search
const staples = [
  'Mirror Force', 'Torrential Tribute', 'Bottomless Trap Hole', 'Solemn Judgment',
  'Solemn Warning', 'Dimensional Prison', 'Compulsory Evacuation Device',
  'Raigeki', 'Dark Hole', 'Heavy Storm', 'Giant Trunade', 'Mystical Space Typhoon',
  'Book of Moon', 'Enemy Controller', 'Smashing Ground', 'Fissure', 'Brain Control',
  'Mind Control', 'Snatch Steal', 'Premature Burial', 'Monster Reborn', 'Call of the Haunted',
  'Gorz the Emissary of Darkness', 'Tragoedia', 'Battle Fader', 'D.D. Crow', 'Effect Veiler',
  'Honest', 'Blackwing - Kalut the Moon Shadow', 'Necro Gardna',
  'Cyber Dragon', 'Chaos Sorcerer', 'Black Luster Soldier - Envoy of the Beginning',
  'Dark Armed Dragon', 'Judgment Dragon', 'Stardust Dragon', 'Brionac, Dragon of the Ice Barrier',
  'Goyo Guardian', 'Colossal Fighter', 'Black Rose Dragon', 'Royal Oppression', 'Skill Drain'
];

console.log('\n=== PREMIER STAPLES SCAN ===');
for (const s of staples) {
  const card = db.prepare('SELECT d.id, t.name, d.atk, d.def FROM datas d JOIN texts t ON d.id = t.id WHERE t.name = ?').get(s) as { id: number; name: string; atk: number; def: number } | undefined;
  if (card) {
    console.log(`✓ ${card.name} (ID: ${card.id})`);
  } else {
    console.log(`✗ ${s} (not present)`);
  }
}
