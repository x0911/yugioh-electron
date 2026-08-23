import fs from 'node:fs';
import { CardReaderService } from '../src/main/engine/cardReader.js';

const cr = new CardReaderService();
const decks = JSON.parse(fs.readFileSync('./data/prebuilt-decks.json', 'utf-8'));
const chars = JSON.parse(fs.readFileSync('./data/characters.json', 'utf-8'));

console.log(`Verifying ${decks.length} prebuilt decks...`);
let totalCards = 0;
let errors = 0;

for (const d of decks) {
  if (d.main.length < 40) {
    console.error(`Deck ${d.id} has only ${d.main.length} main cards!`);
    errors++;
  }
  for (const cid of d.main) {
    if (!cr.getCardDetail(cid)) {
      console.error(`Deck ${d.id} has invalid card ${cid}!`);
      errors++;
    }
  }
  for (const cid of d.extra || []) {
    if (!cr.getCardDetail(cid)) {
      console.error(`Deck ${d.id} has invalid extra card ${cid}!`);
      errors++;
    }
  }
  totalCards += d.main.length + (d.extra?.length || 0);
}

console.log(`Verification complete: ${decks.length} decks, ${totalCards} total cards, ${errors} errors.`);
