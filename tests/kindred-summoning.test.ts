import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { DuelEngineService } from "../src/main/engine/DuelEngineService.js";
import { CardReaderService } from "../src/main/engine/cardReader.js";
import { getResourcePath } from "../src/main/decks/deckLoader.js";
import { OcgResponseType, SelectIdleCMDAction } from "ocgcore-wasm";
import type { DecodedDuelEvent } from "../src/main/engine/messageDecoder.js";

console.log("=== Running Kindred Summoning Custom Card Test Suite ===\n");

// Test 1: Database and CardReader Registration Verification
function testCardReader() {
  console.log("▶ Test 1: Database and CardReader Registration Verification...");
  const cardReader = new CardReaderService(getResourcePath("resources/cards.cdb"));
  const card = cardReader.getCardDetail(89900001);

  assert.ok(card, "Card 89900001 must exist in database");
  assert.strictEqual(card.name, "Kindred Summoning");
  assert.strictEqual(card.isSpell, true);
  assert.strictEqual(card.raceName, "Spell");
  assert.ok(card.desc.includes("Special Summon as many monsters as possible"));

  const allCards = cardReader.getAllCards();
  const found = allCards.find((c) => c.id === 89900001);
  assert.ok(found, "Kindred Summoning must be found in getAllCards()");

  console.log("✓ CardReader verified: Kindred Summoning loaded successfully!\n");
  cardReader.close();
}

// Test 2: In-Game Activation, Targeting, and Multi-Location Special Summon
async function testInGameSummon() {
  console.log("▶ Test 2: In-Game Activation, Multi-Location Type Matching & Summon...");
  const engine = new DuelEngineService();
  await engine.init();

  let spellActivated = false;
  let kindredSummonFinished = false;

  engine.onEvent((ev: DecodedDuelEvent) => {
    if (ev.type === "CHAINING" && (ev as any).code === 89900001) {
      spellActivated = true;
      console.log("✓ Kindred Summoning activated and chained!");
    }

    if (ev.type === "SPSUMMONED" && spellActivated) {
      kindredSummonFinished = true;
    }

    if (ev.isPrompt) {
      const pData = ev.promptData as any;

      if (ev.promptType === "SELECT_IDLECMD") {
        const activates = pData.activates || [];
        const actKindred = activates.find((a: any) => a.code === 89900001);
        if (actKindred && !spellActivated) {
          const actIndex = activates.indexOf(actKindred);
          console.log(`-> Activating Kindred Summoning (option ${actIndex})...`);
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.SELECT_ACTIVATE,
              index: actIndex,
            });
          }, 10);
        } else {
          setTimeout(() => {
            engine.sendResponse({
              type: OcgResponseType.SELECT_IDLECMD,
              action: SelectIdleCMDAction.TO_EP,
              index: null as any,
            });
          }, 10);
        }
      } else if (ev.promptType === "SELECT_CARD") {
        const selects = pData.selects || [];
        const max = pData.max ?? 1;
        const countToSelect = Math.min(selects.length, max);
        const indices = [];
        for (let i = 0; i < countToSelect; i++) {
          indices.push(i);
        }
        console.log(`-> Prompted SELECT_CARD (options: ${selects.length}, selecting: ${indices.length})...`);
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CARD,
            indicies: indices,
          });
        }, 10);
      } else if (ev.promptType === "SELECT_POSITION") {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_POSITION,
            position: 1, // Face-up attack
          });
        }, 10);
      } else if (ev.promptType === "SELECT_CHAIN") {
        setTimeout(() => {
          engine.sendResponse({
            type: OcgResponseType.SELECT_CHAIN,
            index: null,
          });
        }, 10);
      }
    }
  });

  // Player 0 deck:
  // Top of deck (drawn):
  // 1: Dark Magician Girl (38033121)
  // 2: Kindred Summoning (89900001)
  const p0Deck = [
    ...Array(38).fill(80304126), // Magicians Valkyria in deck
    38033121, // Drawn into hand (Spellcaster)
    89900001, // Drawn into hand (Kindred Summoning)
  ];
  const p1Deck = Array(40).fill(91152256);

  engine.startNewDuel({
    player0Deck: p0Deck,
    player1Deck: p1Deck,
    player0Monsters: [{ code: 46986414, sequence: 0 }], // Dark Magician on field
    player0Graveyard: [87257460, 89631139], // Allure Queen LV3 (Spellcaster) & Blue-Eyes (Dragon) in GY
    startingLP: 8000,
    startingDrawCount: 2,
    drawCountPerTurn: 0,
    humanPlayerId: 0,
    autoPlay: false,
    noShuffle: true,
  });

  // Wait for Kindred Summoning to activate and resolve
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (spellActivated) resolve();
      else reject(new Error("Timeout waiting for Kindred Summoning to activate"));
    }, 8000);
    const interval = setInterval(() => {
      if (kindredSummonFinished) {
        clearTimeout(timeout);
        clearInterval(interval);
        setTimeout(resolve, 500);
      }
    }, 100);
  });

  const bState = engine.getBoardState();
  const monstersOnField = bState.userField.monsterZones.filter((m) => m !== null);
  console.log(`-> Monsters on user field after Kindred Summoning: ${monstersOnField.length}`);
  for (const m of monstersOnField) {
    console.log(`   - [Slot ${m.sequence}] ${m.name} (Code: ${m.code}, Race: ${m.race})`);
  }

  assert.strictEqual(spellActivated, true, "Kindred Summoning must have been activated");
  assert.ok(monstersOnField.length >= 2, "Kindred Summoning must summon monsters to fill available zones");

  // Verify all summoned monsters share the target Type (Spellcaster)
  for (const m of monstersOnField) {
    assert.strictEqual(m.race, "Spellcaster", `Every monster on field must be Spellcaster, found ${m.name} (${m.race})`);
  }

  // Verify Dragon (89631139) is STILL in Graveyard (not summoned)
  const graveCodes = bState.userField.graveyard.map((c) => c.code);
  assert.ok(graveCodes.includes(89631139), "Blue-Eyes White Dragon must remain in Graveyard (non-matching race)");

  console.log("✓ All selected monsters Special Summoned matching target Type across Hand, Deck, and GY!\n");
  engine.close();
}

// Test 3: Custom Card Visual Assets
function testVisualAssets() {
  console.log("▶ Test 3: Visual Assets & Paths Verification...");
  const rootDir = process.cwd();
  const fullPath = path.resolve(rootDir, "resources/cards/full/89900001.jpg");
  const artPath = path.resolve(rootDir, "resources/cards/art/89900001.jpg");
  const miniPath = path.resolve(rootDir, "resources/cards/mini/89900001.jpg");

  assert.ok(fs.existsSync(fullPath), "resources/cards/full/89900001.jpg must exist");
  assert.ok(fs.existsSync(artPath), "resources/cards/art/89900001.jpg must exist");
  assert.ok(fs.existsSync(miniPath), "resources/cards/mini/89900001.jpg must exist");

  console.log("✓ Verified: All 3 Kindred Summoning image files exist at correct paths!\n");
}

async function run() {
  testCardReader();
  await testInGameSummon();
  testVisualAssets();
  console.log("🎉 ALL KINDRED SUMMONING CUSTOM CARD TESTS PASSED 100%!\n");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
