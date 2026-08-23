import Database from 'better-sqlite3';

const db = new Database('./resources/cards.cdb');

const rows = db.prepare(`SELECT t.id, t.name FROM texts t JOIN datas d ON t.id = d.id WHERE (d.type & 2) != 0 AND (t.name LIKE '%Fusion%' OR t.name LIKE '%Polymerization%' OR t.name LIKE '%Power Bond%' OR t.name LIKE '%Dark Calling%' OR t.name LIKE '%Dragon%Mirror%')`).all() as any[];
console.log(`Found ${rows.length} fusion-related spells:`);
for (const r of rows) {
  console.log(`  ${r.id}: "${r.name}"`);
}
