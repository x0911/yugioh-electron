import Database from 'better-sqlite3';

const db = new Database('./resources/cards.cdb');

const heroFusions = db.prepare(`SELECT t.id, t.name FROM texts t JOIN datas d ON t.id = d.id WHERE (d.type & 64) != 0 AND (t.name LIKE '%HERO%' OR t.name LIKE '%Cyber%' OR t.name LIKE '%Gatling%' OR t.name LIKE '%Roboyarou%')`).all() as any[];
console.log('Hero & Cyber & Machine fusions:', heroFusions);
