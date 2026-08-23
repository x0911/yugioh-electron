import Database from 'better-sqlite3';

const db = new Database('./resources/cards.cdb');
const names = ['Arcana', 'Chimera', 'Meteor', 'Dragon Champion', 'Flame Swordsman', 'Thousand Dragon', 'Dark Paladin', 'B. Skull Dragon'];

for (const name of names) {
  const row = db.prepare(`SELECT t.id, t.name, d.type FROM texts t JOIN datas d ON t.id = d.id WHERE (d.type & 64) != 0 AND t.name LIKE ?`).all(`%${name}%`);
  console.log(`Fusion matching ${name}:`, row);
}
