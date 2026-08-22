# AI Deck Strategy & Executor Development Guide

This guide explains how the AI in this Yu-Gi-Oh! game plays any deck at a tournament level and how you can add or customize AI decks in the future.

---

## 1. How the AI Plays Any Deck Out of the Box

The game uses a **Dual-Layer Modular AI Architecture** inspired by **WindBot-Ignite** (the gold-standard competitive AI used in EDOPro / Project Ignis):

1. **Layer 1: Universal Competitive Core (`DefaultExecutor`)**
   - Whenever an AI character is assigned **any arbitrary deck** (even custom or rogue decks), it automatically uses the `DefaultExecutor`.
   - Heuristics included:
     - **Card Advantage Sequencing**: Always plays *Pot of Greed*, *Graceful Charity*, *Upstart Goblin*, *Allure of Darkness*, *Trade-In*, etc., first to build resources.
     - **Board Wipe Timing**: Activates *Harpie's Feather Duster*, *Heavy Storm*, or *Mystical Space Typhoon* before committing normal summons into backrow. Plays *Raigeki* / *Dark Hole* when facing superior opposing fields.
     - **Smart Tribute Engine**: Calculates optimal tribute fodder (tokens, low-ATK monsters, spent searchers like Sangan) and never sacrifices high-ATK boss monsters or continuous floodgates.
     - **Battle Phase Lethal Math**: Continuously calculates total on-board damage against the player's Life Points. If lethal is reachable, it executes an optimal attack sequence (lowest ATK first to bait battle traps, piercing/highest ATK for game).
     - **Anti-Wall Combat Intelligence**: Detects continuous battle-immune monsters (*Spirit Reaper*, *Marshmallon*, *Gellenduo*, etc.) and avoids futile attacks; prioritizes effect destroyers (*Ninja Grandmaster Sasuke*, *Drillroid*, *Ehren*).
     - **Interruption & Negation Matrix**:
       - *Counter Traps & Omni-negates* (*Solemn Judgment*, *Solemn Strike*, *Dark Bribe*) reserved for search engines, board wipes, or Extra Deck boss summons.
       - *Battle Traps* (*Mirror Force*, *Sakuretsu Armor*, *Dimensional Prison*) triggered on high-ATK attackers.

2. **Layer 2: Dedicated Archetype Executors (`src/main/ai/executors/archetypes/`)**
   - For signature anime and competitive decks, dedicated executors execute multi-step combo lines:
     - **`BlueEyesExecutor`** (Kaiba / Dragons): *Sage with Eyes of Blue* $\to$ *White Stone of Ancients* $\to$ *Cards of Consonance* $\to$ *Blue-Eyes Ultimate / Twin Burst* $\to$ *Return of the Dragon Lords*.
     - **`CyberDragonExecutor`** (Zane / Machines): *Cyber Dragon Core* search $\to$ *Power Bond* / *Overload Fusion* $\to$ *Cyber Twin Dragon* (5600 ATK $\times$ 2) / *Limiter Removal* OTK.
     - **`DarkMagicianExecutor`** (Yugi / Spellcasters): *Magician's Rod* search $\to$ *Dark Magical Circle* banish $\to$ *Eternal Soul* / *Navigation* quick-effect summons.
     - **`HeroFusionExecutor`** (Jaden / HERO): *Stratos* search $\to$ *Shadow Mist* $\to$ *Miracle Fusion* $\to$ *Flame Wingman / Sunrise / Absolute Zero*.
     - **`AntiMetaStunExecutor`**: Normal summons *Fossil Dyna*, *Thunder King Rai-Oh*, *Banisher*, backed by *Solemn* traps and *Macro Cosmos*.
     - **`BurnOTKExecutor`**: Reverse-chain burn multiplier calculation and *Wave-Motion Cannon* accumulation.

---

## 2. What to Do When Adding New Decks to AI Characters

### Scenario A: Zero Code Needed (Default Behavior)
If you add a new `.ydk` deck file to a character in `data/characters.json`:
- **You don't need to write any code!**
- The game will automatically pass the deck to the `DefaultExecutor`, which will play it with full competitive heuristics.

### Scenario B: Adding a Custom Combo Archetype Executor
If you want to give a new archetype custom combo lines (e.g. *Blackwing*, *Six Samurai*, *Monarchs*, *Lightsworn*, *Exodia*):

1. **Create a new executor file in `src/main/ai/executors/archetypes/`**:
   ```typescript
   // src/main/ai/executors/archetypes/MonarchExecutor.ts
   import { DefaultExecutor } from '../DefaultExecutor.js';
   import type { EvaluatorContext, ScoredAction } from '../../types.js';
   import type { OcgMessage } from 'ocgcore-wasm';

   export class MonarchExecutor extends DefaultExecutor {
     public override readonly id = 'monarch';
     public override readonly name = 'Monarch Tribute Executor';
     public override readonly description = 'Domain lockdown and tribute summoning.';

     public override isApplicable(context: EvaluatorContext, deckCards: number[]): boolean {
       return (
         context.deckArchetype.toLowerCase().includes('monarch') ||
         deckCards.includes(23064604) // Mobius the Frost Monarch
       );
     }

     public override onIdleCmd(msg: OcgMessage, context: EvaluatorContext): ScoredAction[] | null {
       const baseCandidates = super.onIdleCmd(msg, context) || [];

       // Boost custom Monarch plays here
       for (const c of baseCandidates) {
         if (c.cardCode === 23064604) { // Mobius
           c.score += 2500;
           c.reason = `[MONARCH TRIBUTE] Tribute summon Mobius to destroy 2 backrow cards`;
         }
       }

       return baseCandidates;
     }
   }
   ```

2. **Register it in `src/main/ai/executors/registry.ts`**:
   ```typescript
   import { MonarchExecutor } from './archetypes/MonarchExecutor.js';

   // In constructor:
   this.registerExecutor(new MonarchExecutor());
   ```

3. **Export it in `src/main/ai/executors/index.ts`**:
   ```typescript
   export * from './archetypes/MonarchExecutor.js';
   ```

Done! The AI will automatically detect when playing that deck and execute the specialized combo lines.
