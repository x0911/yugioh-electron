import fs from 'node:fs';
import { CardReaderService } from '../src/main/engine/cardReader.js';

const cr = new CardReaderService();
const decks = JSON.parse(fs.readFileSync('./data/prebuilt-decks.json', 'utf-8'));
const libraryDeck = decks.find((d: any) => d.name.includes('Royal Magical Library'));
console.log('Deck:', libraryDeck.name);
console.log('Cards:');
for (const cid of libraryDeck.main) {
  console.log(`- ${cr.getCardName(cid)} (${cid})`);
}
