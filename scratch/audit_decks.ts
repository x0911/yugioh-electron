import fs from 'node:fs';
import { CardReaderService } from '../src/main/engine/cardReader.js';

const cr = new CardReaderService();
const prebuiltDecks = JSON.parse(fs.readFileSync('./data/prebuilt-decks.json', 'utf-8'));

console.log(`Loaded ${prebuiltDecks.length} prebuilt decks.`);

interface Issue {
  deckId: string;
  deckName: string;
  cardId: number;
  cardName: string;
  reason: string;
}

const issues: Issue[] = [];

for (const deck of prebuiltDecks) {
  const allCards = [...deck.main, ...(deck.extra || [])];
  const cardNames = allCards.map((id) => cr.getCardName(id).toLowerCase());
  const cardDetails = allCards.map((id) => cr.getCardDetail(id));

  const hasJinzo = allCards.some((id) => [77585513, 17092736, 2403771, 59966558].includes(id));
  const hasDarkMagician = allCards.some((id) => [46986414, 36975314].includes(id));
  const hasDMG = allCards.some((id) => id === 38033121);
  const hasBlueEyes = allCards.some((id) => [89631139, 23995346].includes(id));
  const hasRedEyes = allCards.some((id) => [74677422, 96561011].includes(id));
  const hasToon = allCards.some((id) => {
    const d = cr.getCardDetail(id);
    return d?.isToon || (d?.name || '').toLowerCase().includes('toon');
  });
  const hasToonTable = allCards.includes(15259703); // Toon Table of Contents
  const hasFusionMonsters = (deck.extra || []).length > 0;
  const hasRitualMonsters = allCards.some((id) => cr.getCardDetail(id)?.isRitual && cr.getCardDetail(id)?.isMonster);

  for (const cid of allCards) {
    const detail = cr.getCardDetail(cid);
    if (!detail) {
      issues.push({ deckId: deck.id, deckName: deck.name, cardId: cid, cardName: `Unknown #${cid}`, reason: 'Missing from database' });
      continue;
    }

    const name = detail.name;
    const desc = detail.desc || '';

    // 1. Amplifier without Jinzo
    if (cid === 303660 || name === 'Amplifier') {
      if (!hasJinzo) {
        issues.push({ deckId: deck.id, deckName: deck.name, cardId: cid, cardName: name, reason: 'Amplifier in deck without Jinzo' });
      }
    }

    // 2. Toon World / Toon cards without Toon monsters or Toon Table
    if (name === 'Toon World' || name === 'Toon Defense' || name === 'Toon Rollback' || name === 'Shadow Toon') {
      if (!hasToon && !hasToonTable) {
        issues.push({ deckId: deck.id, deckName: deck.name, cardId: cid, cardName: name, reason: 'Toon support in deck without Toon monsters' });
      }
    }

    // 3. Thousand Knives / Dark Magic Attack / Dark Magic Curtain without DM
    if (['Thousand Knives', 'Dark Magic Attack', 'Dark Magic Curtain', 'Dedication through Light and Darkness'].includes(name)) {
      if (!hasDarkMagician) {
        issues.push({ deckId: deck.id, deckName: deck.name, cardId: cid, cardName: name, reason: `Requires Dark Magician but none in deck` });
      }
    }

    // 4. Burst Stream of Destruction without Blue-Eyes
    if (name === 'Burst Stream of Destruction' && !hasBlueEyes) {
      issues.push({ deckId: deck.id, deckName: deck.name, cardId: cid, cardName: name, reason: 'Requires Blue-Eyes White Dragon' });
    }

    // 5. Inferno Fire Blast without Red-Eyes
    if (name === 'Inferno Fire Blast' && !hasRedEyes) {
      issues.push({ deckId: deck.id, deckName: deck.name, cardId: cid, cardName: name, reason: 'Requires Red-Eyes Black Dragon' });
    }

    // 6. Fusion spells without fusion monsters
    if (['Polymerization', 'Fusion Sage', 'Fusion Recovery', 'Power Bond', 'Miracle Fusion', 'Dragon\'s Mirror', 'Overload Fusion'].includes(name)) {
      if (!hasFusionMonsters) {
        issues.push({ deckId: deck.id, deckName: deck.name, cardId: cid, cardName: name, reason: 'Fusion Spell in deck with empty Extra Deck' });
      }
    }

    // 7. Ritual Spells without Ritual Monsters
    if (detail.isSpell && (detail.isRitual || name.includes('Ritual'))) {
      if (!hasRitualMonsters) {
        issues.push({ deckId: deck.id, deckName: deck.name, cardId: cid, cardName: name, reason: 'Ritual Spell in deck with 0 Ritual Monsters' });
      }
    }
  }
}

console.log(`Found ${issues.length} synergy/filler issues:`);
for (const iss of issues.slice(0, 30)) {
  console.log(`- [${iss.deckId}] "${iss.deckName}": ${iss.cardName} (${iss.reason})`);
}
if (issues.length > 30) {
  console.log(`... and ${issues.length - 30} more.`);
}
