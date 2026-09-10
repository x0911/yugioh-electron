import { buildDeck } from '../deckGenHelper.js';
import type { CharacterData, CharacterDeckData } from '../../src/shared/types/character.js';

export function getFiveDsCharacters(): CharacterData[] {
  return [
    // 1. Yusei Fudo
    {
      id: 'yusei-fudo',
      name: 'Yusei Fudo',
      series: '5Ds',
      title: 'Shooting Star Duelist',
      tagline: 'Synchro Summon & Junk Synchron Speed',
      description: 'A brilliant and honorable Signer from Satellite who connects bonds with his monsters. Masters Junk, Synchron, and the legendary Stardust Dragon.',
      avatar: 'app-resource://characters/avatars/yusei-fudo.png',
      portrait: 'app-resource://characters/portraits/yusei-fudo.png',
      video: 'resources/videos/characters/yusei-fudo.mp4',
      themeColor: '#1e88e5',
      decks: [
        makeDeckData('yusei_deck_1', 'Junk Doppel Synchro Speed', 'Junk Doppel / Accel Synchro', 'Spins Junk Synchron and Doppelwarrior into rapid Synchro chains leading to Stardust and Shooting Star Dragon.', 'yusei-fudo', 1,
          buildDeck(['Junk Synchron', 'Doppelwarrior', 'Quickdraw Synchron', 'Level Eater', 'Dandylion', 'Tuning', 'Quillbolt Hedgehog', 'Effect Veiler', 'Reinforcement of the Army', 'One for One', 'Foolish Burial', 'Pot of Avarice', 'Solemn Judgment', 'Mirror Force'], { race: 'Warrior', era: '5Ds' }, ['Stardust Dragon', 'Shooting Star Dragon', 'Formula Synchron', 'Junk Destroyer', 'Junk Warrior', 'T.G. Hyper Librarian', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('yusei_deck_2', 'Stardust Dragon Assault Mode', 'Stardust / Assault Mode', 'Summons Stardust Dragon and activates Assault Mode Activate to negate and destroy anything on the field.', 'yusei-fudo', 2,
          buildDeck(['Stardust Dragon/Assault Mode', 'Assault Beast', 'Assault Mode Activate', 'Junk Synchron', 'Debris Dragon', 'Dandylion', 'Tuning', 'Effect Veiler', 'One for One', 'Pot of Avarice', 'Mystical Space Typhoon', 'Mirror Force', 'Solemn Judgment'], { race: 'Warrior', era: '5Ds' }, ['Stardust Dragon', 'Formula Synchron', 'Junk Destroyer', 'Junk Warrior'])
        ),
        makeDeckData('yusei_deck_3', 'Quickdraw Dandywarrior Engine', 'Quickdraw Dandywarrior', 'Discards Dandylion with Quickdraw Synchron for immediate Fluff Token generation and Drill Warrior loops.', 'yusei-fudo', 3,
          buildDeck(['Quickdraw Synchron', 'Dandylion', 'Debris Dragon', 'Lonefire Blossom', 'Drill Synchron', 'Level Eater', 'Tuning', 'One for One', 'Foolish Burial', 'Pot of Avarice', 'Dark Hole', 'Monster Reborn'], { era: '5Ds' }, ['Drill Warrior', 'Nitro Warrior', 'Stardust Dragon', 'Formula Synchron', 'Junk Destroyer'])
        ),
        makeDeckData('yusei_deck_4', 'Scrap-Iron Defensive Synchro', 'Scrap-Iron / Junk Defense', 'Scrap-Iron Scarecrow, Sonic Chick, and Shield Wing provide unbreakable defense while setting up Synchros.', 'yusei-fudo', 4,
          buildDeck(['Scrap-Iron Scarecrow', 'Sonic Chick', 'Shield Wing', 'Fortress Warrior', 'Junk Synchron', 'Quillbolt Hedgehog', 'Tuning', 'Tuningware', 'Solemn Judgment', 'Mirror Force', 'Torrential Tribute'], { race: 'Warrior', era: '5Ds' }, ['Stardust Dragon', 'Junk Warrior', 'Junk Gardna', 'Formula Synchron'])
        ),
        makeDeckData('yusei_deck_5', 'Majestic Star Cosmic Miracle', 'Majestic Star / Cosmic Synchro', 'Calls upon the crimson dragon to combine Majestic Dragon, Stardust Dragon, and non-Tuners into Majestic Star Dragon.', 'yusei-fudo', 5,
          buildDeck(['Majestic Dragon', 'Junk Synchron', 'Doppelwarrior', 'Quickdraw Synchron', 'Level Eater', 'Tuning', 'One for One', 'Foolish Burial', 'Pot of Avarice', 'Reinforcement of the Army', 'Solemn Judgment'], { race: 'Warrior', era: '5Ds' }, ['Stardust Dragon', 'Formula Synchron', 'Junk Destroyer', 'Junk Warrior'])
        ),
        makeDeckData('yusei_deck_6', 'Nitro & Turbo Blaster Beatdown', 'Nitro & Turbo Synchro', 'Charges Nitro Warrior for huge ATK boosts and pierces defenses with Turbo Warrior.', 'yusei-fudo', 6,
          buildDeck(['Nitro Synchron', 'Turbo Synchron', 'Junk Synchron', 'Quickdraw Synchron', 'Level Eater', 'Tuning', 'Quillbolt Hedgehog', 'Reinforcement of the Army', 'Heavy Storm', 'Mystical Space Typhoon'], { race: 'Warrior', era: '5Ds' }, ['Nitro Warrior', 'Turbo Warrior', 'Stardust Dragon', 'Junk Warrior'])
        ),
        makeDeckData('yusei_deck_7', 'Road & Drill Machina Synchron', 'Road & Drill Warrior', 'Road Warrior calls Level 2 or lower monsters straight from the deck, while Drill Warrior recycles monsters.', 'yusei-fudo', 7,
          buildDeck(['Road Synchron', 'Drill Synchron', 'Quickdraw Synchron', 'Tuningware', 'Level Eater', 'Machine Duplication', 'Tuning', 'One for One', 'Pot of Avarice', 'Limiter Removal'], { era: '5Ds' }, ['Road Warrior', 'Drill Warrior', 'Stardust Dragon', 'Formula Synchron', 'Armory Arm'])
        ),
        makeDeckData('yusei_deck_8', 'Accel Synchro Delta Clear', 'Accel Synchro / Formula', 'Formula Synchron and Stardust Dragon execute Accel Synchro during the opponent’s turn into Shooting Star Dragon.', 'yusei-fudo', 8,
          buildDeck(['Junk Synchron', 'Doppelwarrior', 'Level Eater', 'Effect Veiler', 'Tuning', 'One for One', 'Foolish Burial', 'Pot of Avarice', 'Starlight Road', 'Solemn Judgment', 'Torrential Tribute'], { race: 'Warrior', era: '5Ds' }, ['Shooting Star Dragon', 'Stardust Dragon', 'Formula Synchron', 'T.G. Hyper Librarian', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('yusei_deck_9', 'Starlight Road Counter Strike', 'Starlight Road / Anti-Destruction', 'Negates mass destruction with Starlight Road to summon Stardust Dragon directly to the battlefield.', 'yusei-fudo', 9,
          buildDeck(['Starlight Road', 'Effect Veiler', 'Junk Synchron', 'Doppelwarrior', 'Debris Dragon', 'Tuning', 'Solemn Judgment', 'Solemn Warning', 'Bottomless Trap Hole', 'Mirror Force'], { race: 'Warrior', era: '5Ds' }, ['Stardust Dragon', 'Stardust Spark Dragon', 'Formula Synchron', 'Junk Destroyer'])
        ),
        makeDeckData('yusei_deck_10', "Yusei's Ultimate Shooting Quasar Supreme", 'Master Stardust Synchro', 'Yusei’s supreme deck gathering the strongest Synchro monsters: Shooting Star Dragon, Stardust, and Junk Warriors.', 'yusei-fudo', 10,
          buildDeck(['Junk Synchron', 'Quickdraw Synchron', 'Doppelwarrior', 'Level Eater', 'Dandylion', 'Debris Dragon', 'Effect Veiler', 'Tuning', 'One for One', 'Foolish Burial', 'Pot of Avarice', 'Starlight Road', 'Solemn Judgment', 'Mirror Force'], { race: 'Warrior', era: '5Ds' }, ['Shooting Star Dragon', 'Stardust Dragon', 'Formula Synchron', 'Junk Destroyer', 'Junk Warrior', 'Nitro Warrior', 'T.G. Hyper Librarian', 'Brionac, Dragon of the Ice Barrier'])
        ),
      ],
      signatureCards: [44508094, 24696097, 63977008],
    },

    // 2. Jack Atlas
    {
      id: 'jack-atlas',
      name: 'Jack Atlas',
      series: '5Ds',
      title: 'Master of Faster & The King',
      tagline: 'Red Dragon Archfiend & Resonator Power',
      description: 'The proud, former King of Turbo Duels. Crushes all opposition with overwhelming ATK, Resonators, Double Tuning, and Red Dragon Archfiend.',
      avatar: 'app-resource://characters/avatars/jack-atlas.png',
      portrait: 'app-resource://characters/portraits/jack-atlas.png',
      video: 'resources/videos/characters/jack-atlas.mp4',
      themeColor: '#d32f2f',
      decks: [
        makeDeckData('jack_deck_1', 'Red Dragon Archfiend Power Beatdown', 'Red Dragon Archfiend / Resonator', 'Special Summons Vice Dragon and Dark Resonator for instant Red Dragon Archfiend destruction.', 'jack-atlas', 1,
          buildDeck(['Dark Resonator', 'Creation Resonator', 'Flare Resonator', 'Vice Dragon', 'Battle Fader', 'Resonator Call', 'Resonator Engine', 'Fiendish Chain', 'Solemn Judgment', 'Mirror Force'], { race: 'Fiend', era: '5Ds' }, ['Red Dragon Archfiend', 'Exploder Dragonwing', 'Crimson Blader', 'Chaos King Archfiend'])
        ),
        makeDeckData('jack_deck_2', 'Red Nova Burning Soul Double Tuning', 'Red Nova Dragon / Double Tuning', 'Unleashes Double Tuning with 2 Resonators and Red Dragon Archfiend to call forth Red Nova Dragon at 4500+ ATK.', 'jack-atlas', 2,
          buildDeck(['Dark Resonator', 'Creation Resonator', 'Flare Resonator', 'Clock Resonator', 'Force Resonator', 'Red Nova', 'Resonator Call', 'Resonator Engine', 'Crimson Fire', 'Fiendish Chain'], { race: 'Fiend', era: '5Ds' }, ['Red Nova Dragon', 'Red Dragon Archfiend', 'Exploder Dragonwing', 'Chaos King Archfiend'])
        ),
        makeDeckData('jack_deck_3', 'Red Dragon Archfiend Assault Mode', 'Red Dragon / Assault Mode', 'Upgrades Red Dragon Archfiend into Assault Mode to eradicate all other monsters during damage calculation.', 'jack-atlas', 3,
          buildDeck(['Red Dragon Archfiend/Assault Mode', 'Assault Beast', 'Assault Mode Activate', 'Dark Resonator', 'Vice Dragon', 'Resonator Call', 'Fiendish Chain', 'Solemn Judgment', 'Mirror Force'], { race: 'Fiend', era: '5Ds' }, ['Red Dragon Archfiend', 'Exploder Dragonwing', 'Crimson Blader'])
        ),
        makeDeckData('jack_deck_4', 'Majestic Red Crimson Cataclysm', 'Majestic Red / Power', 'Combines Majestic Dragon and Red Dragon Archfiend to annihilate the opponent’s field and inflict burn damage.', 'jack-atlas', 4,
          buildDeck(['Majestic Dragon', 'Dark Resonator', 'Creation Resonator', 'Vice Dragon', 'Strong Wind Dragon', 'Resonator Call', 'Fiendish Chain', 'Heavy Storm', 'Mystical Space Typhoon'], { race: 'Fiend', era: '5Ds' }, ['Red Dragon Archfiend', 'Red Nova Dragon', 'Exploder Dragonwing'])
        ),
        makeDeckData('jack_deck_5', 'Resonator Engine Swarm', 'Resonator Swarm / Tuning', 'Resonator Call and Resonator Engine maintain endless hand advantage to fuel high-level Synchro Summons.', 'jack-atlas', 5,
          buildDeck(['Dark Resonator', 'Creation Resonator', 'Flare Resonator', 'Clock Resonator', 'Barrier Resonator', 'Resonator Call', 'Resonator Engine', 'Fiendish Chain', 'Solemn Judgment'], { race: 'Fiend', era: '5Ds' }, ['Red Dragon Archfiend', 'Chaos King Archfiend', 'Crimson Blader'])
        ),
        makeDeckData('jack_deck_6', 'Vice Dragon & Stronghold Fiends', 'Vice Dragon / Fiend Beatdown', 'Overwhelms the board with Vice Dragon, Strong Wind Dragon, and Battle Fader defensive pivots.', 'jack-atlas', 6,
          buildDeck(['Vice Dragon', 'Strong Wind Dragon', 'Battle Fader', 'Dark Resonator', 'Creation Resonator', 'Resonator Call', 'Fiendish Chain', 'Mirror Force', 'Torrential Tribute'], { race: 'Dragon', era: '5Ds' }, ['Red Dragon Archfiend', 'Exploder Dragonwing', 'Crimson Blader'])
        ),
        makeDeckData('jack_deck_7', 'Crimson Blader Tyrant Control', 'Crimson Blader / Lock', 'Destroys opponent monsters with Crimson Blader to lock them out of Level 5 or higher Special Summons.', 'jack-atlas', 7,
          buildDeck(['Dark Resonator', 'Creation Resonator', 'Vice Dragon', 'Tragoedia', 'Gorz the Emissary of Darkness', 'Resonator Call', 'Fiendish Chain', 'Solemn Warning', 'Mirror Force'], { race: 'Fiend', era: '5Ds' }, ['Crimson Blader', 'Red Dragon Archfiend', 'Exploder Dragonwing'])
        ),
        makeDeckData('jack_deck_8', 'Fiend Roar & Archfiend Might', 'Archfiend Fiends / Beatdown', 'Uses Chaos King Archfiend to invert ATK and DEF for devastating battle damage.', 'jack-atlas', 8,
          buildDeck(['Dark Resonator', 'Clock Resonator', 'Creation Resonator', 'Vice Dragon', 'Fiendish Chain', 'Trap Stun', 'Dark Hole', 'Heavy Storm', 'Solemn Judgment'], { race: 'Fiend', era: '5Ds' }, ['Chaos King Archfiend', 'Red Dragon Archfiend', 'Exploder Dragonwing'])
        ),
        makeDeckData('jack_deck_9', 'Absolute Powerforce Piercing', 'Absolute Powerforce / OTK', 'Empowers Red Dragon Archfiend with battle immunity, piercing damage, and opponent destruction effects.', 'jack-atlas', 9,
          buildDeck(['Dark Resonator', 'Creation Resonator', 'Vice Dragon', 'Battle Fader', 'Trap Stun', 'Fiendish Chain', 'Mystical Space Typhoon', 'Solemn Judgment', 'Solemn Warning'], { race: 'Fiend', era: '5Ds' }, ['Red Dragon Archfiend', 'Hot Red Dragon Archfiend', 'Exploder Dragonwing'])
        ),
        makeDeckData('jack_deck_10', "Jack's Ultimate King of the Turbo Duel", 'Master Red Dragon Dominion', 'The King’s definitive deck combining Red Nova Dragon, Red Dragon Archfiend, and Resonator perfection.', 'jack-atlas', 10,
          buildDeck(['Dark Resonator', 'Creation Resonator', 'Flare Resonator', 'Vice Dragon', 'Battle Fader', 'Gorz the Emissary of Darkness', 'Resonator Call', 'Resonator Engine', 'Crimson Fire', 'Fiendish Chain', 'Solemn Judgment', 'Mirror Force'], { race: 'Fiend', era: '5Ds' }, ['Red Nova Dragon', 'Red Dragon Archfiend', 'Crimson Blader', 'Exploder Dragonwing', 'Chaos King Archfiend'])
        ),
      ],
      signatureCards: [70902743, 97489701, 97021916],
    },

    // 3. Crow Hogan
    {
      id: 'crow-hogan',
      name: 'Crow Hogan',
      series: '5Ds',
      title: 'Blackwing Whirlwind',
      tagline: 'Blackwing Swarm & Feather Counter Assault',
      description: 'A fierce protector of orphans in the Satellite and a member of Team 5D\'s. Deploys rapid Blackwing swarms and deadly Icarus Attacks.',
      avatar: 'app-resource://characters/avatars/crow-hogan.png',
      portrait: 'app-resource://characters/portraits/crow-hogan.png',
      video: 'resources/videos/characters/crow-hogan.mp4',
      themeColor: '#f57c00',
      decks: [
        makeDeckData('crow_deck_1', 'Blackwing - Whirlwind Bora Gale Swarm', 'Blackwing Swarm', 'Searches Blackwings on every Normal Summon with Black Whirlwind and swarms with Bora and Gale.', 'crow-hogan', 1,
          buildDeck(['Blackwing - Bora the Spear', 'Blackwing - Gale the Whirlwind', 'Blackwing - Shura the Blue Flame', 'Blackwing - Kalut the Moon Shadow', 'Blackwing - Blizzard the Far North', 'Black Whirlwind', 'Icarus Attack', 'Allure of Darkness', 'Delta Crow - Anti Reverse', 'Solemn Judgment', 'Mirror Force'], { race: 'Winged Beast', era: '5Ds' }, ['Blackwing Armor Master', 'Blackwing Armed Wing', 'Blackwing - Silverwind the Ascendant', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('crow_deck_2', 'Blackwing Armor Master Wedge Control', 'Blackwing / Armor Master', 'Armor Master places Wedge Counters to reduce opponent monster ATK to 0 and cannot be destroyed in battle.', 'crow-hogan', 2,
          buildDeck(['Blackwing - Bora the Spear', 'Blackwing - Gale the Whirlwind', 'Blackwing - Shura the Blue Flame', 'Blackwing - Kalut the Moon Shadow', 'Black Whirlwind', 'Icarus Attack', 'Dark Hole', 'Monster Reborn', 'Solemn Warning'], { race: 'Winged Beast', era: '5Ds' }, ['Blackwing Armor Master', 'Blackwing Armed Wing', 'Blackwing - Silverwind the Ascendant'])
        ),
        makeDeckData('crow_deck_3', 'Black-Winged Dragon Dark Shield', 'Black-Winged Dragon', 'Black-Winged Dragon absorbs effect damage and places Black Feather Counters to weaken and burn the foe.', 'crow-hogan', 3,
          buildDeck(['Blackwing - Bora the Spear', 'Blackwing - Gale the Whirlwind', 'Blackwing - Shura the Blue Flame', 'Blackwing - Sirocco the Dawn', 'Blackwing - Kalut the Moon Shadow', 'Black Whirlwind', 'Icarus Attack', 'Allure of Darkness', 'Mirror Force', 'Torrential Tribute'], { race: 'Winged Beast', era: '5Ds' }, ['Black-Winged Dragon', 'Blackwing Armor Master', 'Blackwing Armed Wing'])
        ),
        makeDeckData('crow_deck_4', 'Blackwing Silverwind Gale Storm', 'Blackwing / Silverwind', 'Silverwind the Ascendant destroys up to 2 face-up monsters with DEF lower than its ATK upon Synchro Summon.', 'crow-hogan', 4,
          buildDeck(['Blackwing - Sirocco the Dawn', 'Blackwing - Gale the Whirlwind', 'Blackwing - Bora the Spear', 'Blackwing - Blizzard the Far North', 'Black Whirlwind', 'Icarus Attack', 'Delta Crow - Anti Reverse', 'Solemn Judgment'], { race: 'Winged Beast', era: '5Ds' }, ['Blackwing - Silverwind the Ascendant', 'Blackwing Armor Master', 'Blackwing Armed Wing'])
        ),
        makeDeckData('crow_deck_5', 'Vayu Turbo Graveyard Synchro', 'Vayu Turbo / Graveyard', 'Banishes Vayu and non-Tuners from the Graveyard to Special Summon Armed Wing and Armor Master directly.', 'crow-hogan', 5,
          buildDeck(['Blackwing - Vayu the Emblem of Honor', 'Blackwing - Sirocco the Dawn', 'Dark Grepher', 'Armageddon Knight', 'Burial from a Different Dimension', 'Allure of Darkness', 'Black Whirlwind', 'Icarus Attack', 'Foolish Burial'], { race: 'Winged Beast', era: '5Ds' }, ['Blackwing Armed Wing', 'Blackwing Armor Master', 'Blackwing - Silverwind the Ascendant'])
        ),
        makeDeckData('crow_deck_6', 'Icarus Attack Winged-Beast Control', 'Icarus Control', 'Tributes Winged Beast monsters to destroy any 2 cards on the field at Spell Speed 2.', 'crow-hogan', 6,
          buildDeck(['Icarus Attack', 'Blackwing - Bora the Spear', 'Blackwing - Shura the Blue Flame', 'Blackwing - Kalut the Moon Shadow', 'Blackwing - Zephyros the Elite', 'Black Whirlwind', 'Delta Crow - Anti Reverse', 'Solemn Judgment', 'Torrential Tribute'], { race: 'Winged Beast', era: '5Ds' }, ['Blackwing Armor Master', 'Blackwing Armed Wing', 'Blackwing - Silverwind the Ascendant'])
        ),
        makeDeckData('crow_deck_7', 'Delta Crow Trap Wipe Turbo', 'Delta Crow / Backrow Clear', 'Wipes out all of the opponent’s face-down Spell and Trap Cards while controlling Blackwing monsters.', 'crow-hogan', 7,
          buildDeck(['Delta Crow - Anti Reverse', 'Blackwing - Gale the Whirlwind', 'Blackwing - Bora the Spear', 'Blackwing - Shura the Blue Flame', 'Black Whirlwind', 'Heavy Storm', 'Mystical Space Typhoon', 'Allure of Darkness'], { race: 'Winged Beast', era: '5Ds' }, ['Blackwing Armor Master', 'Blackwing Armed Wing', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('crow_deck_8', 'Blizzard the Far North Rapid Revival', 'Blizzard Revival', 'Blizzard revives a Level 4 Blackwing on Normal Summon for an immediate Level 6 Armed Wing Synchro.', 'crow-hogan', 8,
          buildDeck(['Blackwing - Blizzard the Far North', 'Blackwing - Bora the Spear', 'Blackwing - Shura the Blue Flame', 'Blackwing - Kalut the Moon Shadow', 'Black Whirlwind', 'Icarus Attack', 'Allure of Darkness', 'Solemn Warning'], { race: 'Winged Beast', era: '5Ds' }, ['Blackwing Armed Wing', 'Blackwing Armor Master', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('crow_deck_9', 'Shura Blue Flame Special Summon Beat', 'Shura Beatdown', 'Shura destroys monsters by battle to Special Summon Blackwings with 1500 or less ATK straight from the deck.', 'crow-hogan', 9,
          buildDeck(['Blackwing - Shura the Blue Flame', 'Blackwing - Kalut the Moon Shadow', 'Blackwing - Bora the Spear', 'Blackwing - Gale the Whirlwind', 'Blackwing - Vayu the Emblem of Honor', 'Black Whirlwind', 'Icarus Attack', 'Solemn Judgment'], { race: 'Winged Beast', era: '5Ds' }, ['Blackwing Armed Wing', 'Blackwing Armor Master', 'Black-Winged Dragon'])
        ),
        makeDeckData('crow_deck_10', "Crow's Ultimate Blackwing Tempest", 'Master Blackwing Dominion', 'Crow’s tournament-grade Blackwing deck uniting Bora, Gale, Kalut, Icarus Attack, and Black Whirlwind.', 'crow-hogan', 10,
          buildDeck(['Blackwing - Bora the Spear', 'Blackwing - Gale the Whirlwind', 'Blackwing - Kalut the Moon Shadow', 'Blackwing - Shura the Blue Flame', 'Blackwing - Blizzard the Far North', 'Blackwing - Zephyros the Elite', 'Black Whirlwind', 'Icarus Attack', 'Delta Crow - Anti Reverse', 'Allure of Darkness', 'Solemn Judgment', 'Mirror Force'], { race: 'Winged Beast', era: '5Ds' }, ['Blackwing Armor Master', 'Blackwing Armed Wing', 'Blackwing - Silverwind the Ascendant', 'Black-Winged Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
      ],
      signatureCards: [49003716, 69488544, 9012916],
    },

    // 4. Akiza Izinski
    {
      id: 'akiza-izinski',
      name: 'Akiza Izinski',
      series: '5Ds',
      title: 'Black Rose Witch',
      tagline: 'Black Rose Dragon & Botanical Thorn Thickets',
      description: 'A telekinetic Signer possessing the Mark of the Dragon. Clears battlefields with Black Rose Dragon and dominates with fertile Plant engines.',
      avatar: 'app-resource://characters/avatars/akiza-izinski.png',
      portrait: 'app-resource://characters/portraits/akiza-izinski.png',
      video: 'resources/videos/characters/akiza-izinski.mp4',
      themeColor: '#c2185b',
      decks: [
        makeDeckData('akiza_deck_1', 'Black Rose Dragon Nuke & Thorn', 'Black Rose / Thorn', 'Summons Black Rose Dragon to wipe all cards on the field or shift monsters to Attack Position with 0 ATK.', 'akiza-izinski', 1,
          buildDeck(['Lonefire Blossom', 'Dandylion', 'Spore', 'Glow-Up Bulb', 'Debris Dragon', 'Botanical Lion', 'Mark of the Rose', 'One for One', 'Foolish Burial', 'Pot of Avarice', 'Solemn Judgment', 'Mirror Force'], { race: 'Plant', era: '5Ds' }, ['Black Rose Dragon', 'Splendid Rose', 'Queen of Thorns', 'Formula Synchron', 'Stardust Dragon'])
        ),
        makeDeckData('akiza_deck_2', 'Black Garden Rose Token Field', 'Black Garden / Token Stall', 'Halves monster ATK when summoned and spawns Rose Tokens, setting up Synchro combos and field control.', 'akiza-izinski', 2,
          buildDeck(['Black Garden', 'Botanical Lion', 'Lord Poison', 'Tytannial, Princess of Camellias', 'Lonefire Blossom', 'Spore', 'Glow-Up Bulb', 'Terraforming', 'Pollinosis', 'Mirror Force'], { race: 'Plant', era: '5Ds' }, ['Black Rose Dragon', 'Queen of Thorns', 'Splendid Rose'])
        ),
        makeDeckData('akiza_deck_3', 'Plant Synchro Debris & Dandy', 'Plant Synchro', 'Debris Dragon revives Dandylion for an instant Level 7 Black Rose Dragon and two Fluff Tokens.', 'akiza-izinski', 3,
          buildDeck(['Debris Dragon', 'Dandylion', 'Lonefire Blossom', 'Spore', 'Glow-Up Bulb', 'One for One', 'Foolish Burial', 'Pot of Avarice', 'Solemn Judgment', 'Torrential Tribute'], { race: 'Plant', era: '5Ds' }, ['Black Rose Dragon', 'Stardust Dragon', 'Formula Synchron', 'Brionac, Dragon of the Ice Barrier', 'Trishula, Dragon of the Ice Barrier'])
        ),
        makeDeckData('akiza_deck_4', 'Tytannial Princess of Camellias Tribute', 'Tytannial / Plant Tribute', 'Tributes Plant monsters to negate card activations that target cards on the field with Tytannial.', 'akiza-izinski', 4,
          buildDeck(['Tytannial, Princess of Camellias', 'Lonefire Blossom', 'Dandylion', 'Botanical Lion', 'Mark of the Rose', 'Pollinosis', 'Wall of Thorns', 'Monster Reborn', 'Solemn Judgment'], { race: 'Plant', era: '5Ds' }, ['Black Rose Dragon', 'Queen of Thorns'])
        ),
        makeDeckData('akiza_deck_5', 'Spore & Glow-Up Bulb Miracle Plants', 'Miracle Plants', 'Spore and Glow-Up Bulb revive themselves from the Graveyard for multi-level Synchro summons.', 'akiza-izinski', 5,
          buildDeck(['Spore', 'Glow-Up Bulb', 'Lonefire Blossom', 'Dandylion', 'Debris Dragon', 'One for One', 'Foolish Burial', 'Pot of Avarice', 'Dark Hole', 'Heavy Storm'], { race: 'Plant', era: '5Ds' }, ['Black Rose Dragon', 'Trishula, Dragon of the Ice Barrier', 'Formula Synchron', 'Stardust Dragon'])
        ),
        makeDeckData('akiza_deck_6', 'Queen of Thorns Spell/Trap Punisher', 'Queen of Thorns', 'Queen of Thorns taxes players 1000 LP every time they Normal or Special Summon a non-Plant monster.', 'akiza-izinski', 6,
          buildDeck(['Queen Angel of Roses', 'Lonefire Blossom', 'Botanical Lion', 'Twilight Rose Knight', 'Mark of the Rose', 'Wall of Thorns', 'Solemn Warning', 'Mirror Force'], { race: 'Plant', era: '5Ds' }, ['Queen of Thorns', 'Black Rose Dragon', 'Splendid Rose'])
        ),
        makeDeckData('akiza_deck_7', 'Splendid Rose Graveyard Harvest', 'Splendid Rose', 'Splendid Rose banishes Plants from the Graveyard to halve an opponent monster’s ATK and attack twice.', 'akiza-izinski', 7,
          buildDeck(['Lonefire Blossom', 'Spore', 'Glow-Up Bulb', 'Seed of Deception', 'Miracle Fertilizer', 'Mark of the Rose', 'Wall of Thorns', 'Pot of Avarice'], { race: 'Plant', era: '5Ds' }, ['Splendid Rose', 'Black Rose Dragon', 'Queen of Thorns'])
        ),
        makeDeckData('akiza_deck_8', 'Gigaplant Gemini Fertilizer Swarm', 'Gigaplant / Gemini', 'Normal Summons Gigaplant a second time with Supervise to revive Plant monsters from hand or GY every turn.', 'akiza-izinski', 8,
          buildDeck(['Gigaplant', 'Lonefire Blossom', 'Supervise', 'Spore', 'Glow-Up Bulb', 'Miracle Fertilizer', 'Foolish Burial', 'Solemn Judgment'], { race: 'Plant', era: '5Ds' }, ['Black Rose Dragon', 'Queen of Thorns', 'Stardust Dragon'])
        ),
        makeDeckData('akiza_deck_9', 'Mark of the Rose Mind Control', 'Mark of the Rose', 'Banishes Plant monsters from the Graveyard to take control of opponent boss monsters with Mark of the Rose.', 'akiza-izinski', 9,
          buildDeck(['Mark of the Rose', 'Lonefire Blossom', 'Dandylion', 'Debris Dragon', 'Botanical Lion', 'Heavy Storm', 'Mystical Space Typhoon', 'Solemn Judgment'], { race: 'Plant', era: '5Ds' }, ['Black Rose Dragon', 'Black Rose Moonlight Dragon', 'Splendid Rose'])
        ),
        makeDeckData('akiza_deck_10', "Akiza's Ultimate Witch of the Black Rose", 'Master Plant Synchro', 'Akiza’s tournament Plant Synchro deck uniting Black Rose Dragon, Lonefire, Dandylion, and Spore.', 'akiza-izinski', 10,
          buildDeck(['Lonefire Blossom', 'Dandylion', 'Spore', 'Glow-Up Bulb', 'Debris Dragon', 'Tytannial, Princess of Camellias', 'Botanical Lion', 'Mark of the Rose', 'One for One', 'Foolish Burial', 'Pot of Avarice', 'Wall of Thorns', 'Solemn Judgment', 'Mirror Force'], { race: 'Plant', era: '5Ds' }, ['Black Rose Dragon', 'Black Rose Moonlight Dragon', 'Splendid Rose', 'Queen of Thorns', 'Stardust Dragon', 'Formula Synchron', 'Trishula, Dragon of the Ice Barrier'])
        ),
      ],
      signatureCards: [73580471, 33698022, 57421866],
    },

    // 5. Leo
    {
      id: 'leo',
      name: 'Leo',
      series: '5Ds',
      title: 'Morphtronic Gadget Whiz',
      tagline: 'Power Tool Dragon & Morphtronic Tools',
      description: 'Luna\'s energetic twin brother whose passion burns bright. Equips Morphtronic appliances with powerful gear and unleashes Power Tool Dragon.',
      avatar: 'app-resource://characters/avatars/leo.png',
      portrait: 'app-resource://characters/portraits/leo.png',
      video: 'resources/videos/characters/leo.mp4',
      themeColor: '#7cb342',
      decks: [
        makeDeckData('leo_deck_1', 'Power Tool Dragon Equip Mastery', 'Power Tool / Equips', 'Power Tool Dragon reveals 3 Equip Spells from the deck to add one to hand and protect itself from destruction.', 'leo', 1,
          buildDeck(['Morphtronic Celfon', 'Morphtronic Scopen', 'Morphtronic Boomboxen', 'Morphtronic Radion', 'Double Tool C&D', 'United We Stand', 'Mage Power', 'Machine Duplication', 'Junk Box', 'Limiter Removal'], { race: 'Machine', era: '5Ds' }, ['Power Tool Dragon', 'Life Stream Dragon', 'Armory Arm', 'Formula Synchron'])
        ),
        makeDeckData('leo_deck_2', 'Morphtronic Celfon Roll & Summon', 'Morphtronic Celfon', 'Rolls a die with Morphtronic Celfon to reveal cards and Special Summon a Level 4 or lower Morphtronic.', 'leo', 2,
          buildDeck(['Morphtronic Celfon', 'Morphtronic Scopen', 'Morphtronic Boomboxen', 'Morphtronic Radion', 'Morphtronic Remoten', 'Machine Duplication', 'Junk Box', 'Double Tool C&D', 'Limiter Removal'], { race: 'Machine', era: '5Ds' }, ['Power Tool Dragon', 'Armory Arm'])
        ),
        makeDeckData('leo_deck_3', 'Morphtronic Boomboxen Double Strike', 'Morphtronic OTK', 'Morphtronic Boomboxen attacks twice per Battle Phase in Attack Position, doubled with Radion and Limiter Removal.', 'leo', 3,
          buildDeck(['Morphtronic Boomboxen', 'Morphtronic Radion', 'Morphtronic Celfon', 'Double Tool C&D', 'Limiter Removal', 'United We Stand', 'Heavy Storm', 'Mystical Space Typhoon'], { race: 'Machine', era: '5Ds' }, ['Power Tool Dragon', 'Armory Arm'])
        ),
        makeDeckData('leo_deck_4', 'Double Tool C&D Lockdown', 'Double Tool Lockdown', 'Double Tool C&D boosts ATK by 1000, prevents opponent monster effects during battle, and redirects attacks.', 'leo', 4,
          buildDeck(['Double Tool C&D', 'Morphtronic Scopen', 'Morphtronic Remoten', 'Morphtronic Celfon', 'Morphtronic Repair Unit', 'Morphtronic Map', 'Solemn Judgment', 'Mirror Force'], { race: 'Machine', era: '5Ds' }, ['Power Tool Dragon', 'Life Stream Dragon'])
        ),
        makeDeckData('leo_deck_5', 'Morphtronic Radion Overdrive', 'Radion Beatdown', 'Morphtronic Radion gives all Morphtronics +800 ATK in Attack Position and +1000 DEF in Defense Position.', 'leo', 5,
          buildDeck(['Morphtronic Radion', 'Morphtronic Boomboxen', 'Morphtronic Celfon', 'Morphtronic Boarden', 'Limiter Removal', 'Junk Box', 'Solemn Judgment'], { race: 'Machine', era: '5Ds' }, ['Power Tool Dragon', 'Armory Arm'])
        ),
        makeDeckData('leo_deck_6', 'Morphtronic Vacuumen Removal Swarm', 'Vacuumen Control', 'Equips opponent monsters directly to Morphtronic Vacuumen to clear pesky threats without destroying them.', 'leo', 6,
          buildDeck(['Morphtronic Vacuumen', 'Morphtronic Celfon', 'Morphtronic Scopen', 'Morphtronic Bind', 'Junk Box', 'Machine Duplication', 'Torrential Tribute'], { race: 'Machine', era: '5Ds' }, ['Power Tool Dragon', 'Armory Arm'])
        ),
        makeDeckData('leo_deck_7', 'Machine Duplication Swarm Engine', 'Machine Duplication', 'Targets Celfon or Remoten with Machine Duplication to swarm three copies straight from the deck.', 'leo', 7,
          buildDeck(['Machine Duplication', 'Morphtronic Celfon', 'Morphtronic Remoten', 'Morphtronic Scopen', 'Double Tool C&D', 'United We Stand', 'Limiter Removal'], { race: 'Machine', era: '5Ds' }, ['Power Tool Dragon', 'Armory Arm', 'Formula Synchron'])
        ),
        makeDeckData('leo_deck_8', 'Morphtronic Accelerator Blaster', 'Accelerator Burn', 'Returns a Morphtronic from hand to deck to destroy any card on the field and draw 1 card.', 'leo', 8,
          buildDeck(['Morphtronic Accelerator', 'Morphtronic Celfon', 'Morphtronic Scopen', 'Morphtronic Boomboxen', 'Morphtronic Forcefield', 'Heavy Storm', 'Solemn Judgment'], { race: 'Machine', era: '5Ds' }, ['Power Tool Dragon', 'Armory Arm'])
        ),
        makeDeckData('leo_deck_9', 'Life Stream Dragon Healing Sanctuary', 'Life Stream / Healing', 'Synchro Summons Life Stream Dragon with Power Tool Dragon to restore Life Points up to 4000.', 'leo', 9,
          buildDeck(['Morphtronic Scopen', 'Morphtronic Remoten', 'Morphtronic Celfon', 'Double Tool C&D', 'Morphtronic Repair Unit', 'Solemn Judgment', 'Mirror Force'], { race: 'Machine', era: '5Ds' }, ['Life Stream Dragon', 'Power Tool Dragon', 'Armory Arm'])
        ),
        makeDeckData('leo_deck_10', "Leo's Ultimate Morphtronic Power Tool", 'Master Morphtronic Toolbox', 'Leo’s ultimate deck uniting Celfon, Scopen, Double Tool C&D, Power Tool Dragon, and Life Stream Dragon.', 'leo', 10,
          buildDeck(['Morphtronic Celfon', 'Morphtronic Scopen', 'Morphtronic Boomboxen', 'Morphtronic Radion', 'Morphtronic Remoten', 'Double Tool C&D', 'Machine Duplication', 'Junk Box', 'Morphtronic Accelerator', 'United We Stand', 'Limiter Removal', 'Solemn Judgment', 'Mirror Force'], { race: 'Machine', era: '5Ds' }, ['Power Tool Dragon', 'Life Stream Dragon', 'Armory Arm', 'Formula Synchron'])
        ),
      ],
      signatureCards: [2403771, 25165047, 93542102],
    },

    // 6. Luna
    {
      id: 'luna',
      name: 'Luna',
      series: '5Ds',
      title: 'Voice of the Duel Spirits',
      tagline: 'Ancient Fairy Dragon & Forest Sanctuary',
      description: 'A gentle Signer who can communicate directly with Duel Spirits. Protects her friends with Ancient Fairy Dragon, Kuribon, and enchanted forests.',
      avatar: 'app-resource://characters/avatars/luna.png',
      portrait: 'app-resource://characters/portraits/luna.png',
      video: 'resources/videos/characters/luna.mp4',
      themeColor: '#26a69a',
      decks: [
        makeDeckData('luna_deck_1', 'Ancient Fairy Dragon Field Sanctuary', 'Ancient Fairy / Field Spell', 'Destroys active Field Spells with Ancient Fairy Dragon to gain 1000 LP and search another Field Spell.', 'luna', 1,
          buildDeck(['Ancient Forest', 'The Sanctuary in the Sky', 'Kuribon', 'Regulus', 'Sunlight Unicorn', 'Terraforming', 'Honest', 'Solemn Judgment', 'Mirror Force'], { race: 'Fairy', era: '5Ds' }, ['Ancient Fairy Dragon', 'Naturia Beast', 'Formula Synchron'])
        ),
        makeDeckData('luna_deck_2', 'Ancient Forest Beast Domain', 'Ancient Forest / Beasts', 'Destroys monsters that declare attacks while Ancient Forest is active, shielding Luna from aggressive strikes.', 'luna', 2,
          buildDeck(['Ancient Forest', 'Regulus', 'Sunlight Unicorn', 'Horn of the Phantom Beast', 'Terraforming', 'Solidarity', 'Mirror Force', 'Torrential Tribute'], { race: 'Beast', era: '5Ds' }, ['Ancient Fairy Dragon', 'Naturia Beast', 'Naturia Barkion'])
        ),
        makeDeckData('luna_deck_3', 'Kuribon & Fairy Protection', 'Kuribon / Fairy Defense', 'Kuribon prevents battle damage and returns to hand while opponent gains LP, paving the way for counters.', 'luna', 3,
          buildDeck(['Kuribon', 'Watapon', 'Honest', 'Marshmallon', 'Valhalla, Hall of the Fallen', 'Hecatrice', 'Solemn Judgment', 'Mirror Force'], { race: 'Fairy', era: '5Ds' }, ['Ancient Fairy Dragon', 'Formula Synchron'])
        ),
        makeDeckData('luna_deck_4', 'Regulus Beast Beatdown & Recovery', 'Regulus / Beast Beatdown', 'Regulus recycles Field Spells from the Graveyard to deck and attacks with high Beast power.', 'luna', 4,
          buildDeck(['Regulus', 'Sunlight Unicorn', 'Ancient Forest', 'Horn of the Phantom Beast', 'Solidarity', 'Heavy Storm', 'Mystical Space Typhoon'], { race: 'Beast', era: '5Ds' }, ['Ancient Fairy Dragon', 'Naturia Beast'])
        ),
        makeDeckData('luna_deck_5', 'Sunlight Unicorn Spell Search', 'Sunlight Unicorn', 'Excavates the top card of the deck with Sunlight Unicorn to add Equip Spells straight to hand.', 'luna', 5,
          buildDeck(['Sunlight Unicorn', 'Kuribon', 'Regulus', 'Ancient Forest', 'Horn of the Phantom Beast', 'Solemn Wishes', 'Solemn Judgment'], { race: 'Beast', era: '5Ds' }, ['Ancient Fairy Dragon', 'Naturia Barkion'])
        ),
        makeDeckData('luna_deck_6', 'Sanctuary in the Sky Fairy Light', 'Sanctuary / Archlord', 'Nullifies battle damage to Fairy controllers and locks Special Summons with Archlord Kristya.', 'luna', 6,
          buildDeck(['The Sanctuary in the Sky', 'Honest', 'Hecatrice', 'Archlord Kristya', 'Valhalla, Hall of the Fallen', 'Terraforming', 'Solemn Judgment', 'Solemn Warning'], { race: 'Fairy', era: '5Ds' }, ['Ancient Fairy Dragon', 'Naturia Beast'])
        ),
        makeDeckData('luna_deck_7', 'Spirit of the Breeze Life Point Engine', 'LP Recovery / Stall', 'Gains massive Life Points with Spirit of the Breeze, Golden Ladybug, and Solemn Wishes while Fire Princess burns.', 'luna', 7,
          buildDeck(['Spirit of the Breeze', 'Golden Ladybug', 'Solemn Wishes', 'Fire Princess', 'Kuribon', 'Marshmallon', 'Mirror Force', 'Torrential Tribute'], { race: 'Fairy', era: '5Ds' }, ['Ancient Fairy Dragon'])
        ),
        makeDeckData('luna_deck_8', 'Fairy & Beast Hybrid Harmony', 'Fairy-Beast Hybrid', 'Harmonizes light Fairies and Beasts with Honest and Horn of the Phantom Beast combat tricks.', 'luna', 8,
          buildDeck(['Kuribon', 'Regulus', 'Sunlight Unicorn', 'Honest', 'Horn of the Phantom Beast', 'Ancient Forest', 'Solemn Judgment', 'Mirror Force'], { race: 'Fairy', era: '5Ds' }, ['Ancient Fairy Dragon', 'Naturia Beast', 'Formula Synchron'])
        ),
        makeDeckData('luna_deck_9', 'Naturia Forest Guardians', 'Naturia Synchro', 'Deploys Naturia forest creatures and Spore to Synchro Summon Naturia Beast and Barkion.', 'luna', 9,
          buildDeck(['Spore', 'Regulus', 'Sunlight Unicorn', 'Horn of the Phantom Beast', 'Mystical Space Typhoon', 'Heavy Storm', 'Solemn Judgment'], { race: 'Beast', era: '5Ds' }, ['Naturia Beast', 'Naturia Barkion', 'Ancient Fairy Dragon'])
        ),
        makeDeckData('luna_deck_10', "Luna's Ultimate Ancient Fairy Sanctuary", 'Master Spirit Sanctuary', 'Luna’s supreme deck combining Ancient Fairy Dragon, Naturia Beast, Archlord Kristya, and enchanted forests.', 'luna', 10,
          buildDeck(['Kuribon', 'Regulus', 'Sunlight Unicorn', 'Honest', 'Archlord Kristya', 'The Sanctuary in the Sky', 'Ancient Forest', 'Terraforming', 'Horn of the Phantom Beast', 'Solemn Judgment', 'Solemn Warning', 'Mirror Force'], { race: 'Fairy', era: '5Ds' }, ['Ancient Fairy Dragon', 'Naturia Beast', 'Naturia Barkion', 'Formula Synchron'])
        ),
      ],
      signatureCards: [25862681, 47432275, 20210570],
    },

    // 7. Kalin Kessler
    {
      id: 'kalin-kessler',
      name: 'Kalin Kessler',
      series: '5Ds',
      title: 'Leader of the Enforcers',
      tagline: 'Infernity Handless Combo & Void Doom',
      description: 'Former leader of the Enforcers and Dark Signer who embraces the void. When his hand is empty, his Infernity combo engine unleashes devastation.',
      avatar: 'app-resource://characters/avatars/kalin-kessler.png',
      portrait: 'app-resource://characters/portraits/kalin-kessler.png',
      video: 'resources/videos/characters/kalin-kessler.mp4',
      themeColor: '#455a64',
      decks: [
        makeDeckData('kalin_deck_1', 'Infernity Archfiend Handless Combo', 'Infernity Handless Combo', 'Empties hand to search cards with Infernity Archfiend and loop summons with Infernity Necromancer.', 'kalin-kessler', 1,
          buildDeck(['Infernity Archfiend', 'Infernity Necromancer', 'Infernity Mirage', 'Infernity Beetle', 'Infernity Launcher', 'Infernity Barrier', 'Infernity Break', 'Foolish Burial', 'One for One', 'Allure of Darkness', 'Solemn Judgment'], { race: 'Fiend', era: '5Ds' }, ['Infernity Doom Dragon', 'Hundred Eyes Dragon', 'Trishula, Dragon of the Ice Barrier', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('kalin_deck_2', 'Infernity Launcher Infinite Loop', 'Infernity Launcher Turbo', 'Sends Infernity Launcher to the GY while handless to Special Summon 2 Infernities and chain synchros.', 'kalin-kessler', 2,
          buildDeck(['Infernity Launcher', 'Infernity Archfiend', 'Infernity Necromancer', 'Infernity Mirage', 'Infernity Beetle', 'Infernity Break', 'Allure of Darkness', 'Foolish Burial', 'Solemn Warning'], { race: 'Fiend', era: '5Ds' }, ['Infernity Doom Dragon', 'Hundred Eyes Dragon', 'Trishula, Dragon of the Ice Barrier'])
        ),
        makeDeckData('kalin_deck_3', 'Infernity Doom Dragon Hellfire Burst', 'Infernity Doom Dragon', 'Summons Infernity Doom Dragon to destroy an opponent monster and burn for half its ATK while handless.', 'kalin-kessler', 3,
          buildDeck(['Infernity Doom Dragon', 'Infernity Archfiend', 'Infernity Necromancer', 'Infernity Beetle', 'Infernity Inferno', 'Infernity Break', 'Dark Hole', 'Mirror Force'], { race: 'Fiend', era: '5Ds' }, ['Infernity Doom Dragon', 'Hundred Eyes Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('kalin_deck_4', 'Hundred Eyes Dragon Dark Synchro', 'Hundred Eyes Dragon', 'Banishes DARK monsters from the Graveyard to copy their effects and searches any card when destroyed.', 'kalin-kessler', 4,
          buildDeck(['Infernity Mirage', 'Infernity Necromancer', 'Infernity Archfiend', 'Dark Grepher', 'Armageddon Knight', 'Allure of Darkness', 'Foolish Burial', 'Infernity Break'], { race: 'Fiend', era: '5Ds' }, ['Hundred Eyes Dragon', 'Infernity Doom Dragon', 'Stardust Dragon'])
        ),
        makeDeckData('kalin_deck_5', 'Earthbound Immortal Ccapac Apu Giant', 'Earthbound Immortal Ccapac Apu', 'Summons the 3000 ATK giant Ccapac Apu to attack directly and burn for destroyed monsters’ ATK.', 'kalin-kessler', 5,
          buildDeck(['Earthbound Immortal Ccapac Apu', 'Infernity Archfiend', 'Infernity Necromancer', 'Infernity Beetle', 'Infernity Launcher', 'Terraforming', 'Dark Hole', 'Heavy Storm'], { race: 'Fiend', era: '5Ds' }, ['Infernity Doom Dragon', 'Hundred Eyes Dragon'])
        ),
        makeDeckData('kalin_deck_6', 'Infernity Barrier & Break Lockdown', 'Infernity Trap Lockdown', 'Sets Infernity Barrier and Break to negate and destroy all opponent plays while holding 0 cards in hand.', 'kalin-kessler', 6,
          buildDeck(['Infernity Barrier', 'Infernity Break', 'Infernity Archfiend', 'Infernity Necromancer', 'Infernity Beetle', 'Infernity Guardian', 'Solemn Judgment', 'Solemn Warning'], { race: 'Fiend', era: '5Ds' }, ['Infernity Doom Dragon', 'Hundred Eyes Dragon'])
        ),
        makeDeckData('kalin_deck_7', 'Infernity Mirage Graveyard Revival', 'Infernity Mirage Swarm', 'Tributes Infernity Mirage while handless to revive 2 Infernity monsters from the Graveyard.', 'kalin-kessler', 7,
          buildDeck(['Infernity Mirage', 'Infernity Archfiend', 'Infernity Necromancer', 'One for One', 'Foolish Burial', 'Infernity Break', 'Allure of Darkness', 'Mirror Force'], { race: 'Fiend', era: '5Ds' }, ['Infernity Doom Dragon', 'Hundred Eyes Dragon', 'Trishula, Dragon of the Ice Barrier'])
        ),
        makeDeckData('kalin_deck_8', 'Infernity Beetle Multi-Tuning Swarm', 'Infernity Beetle Synchro', 'Tributes Infernity Beetle while handless to summon 2 more Beetles from the deck for Level 8/9 Synchros.', 'kalin-kessler', 8,
          buildDeck(['Infernity Beetle', 'Infernity Archfiend', 'Infernity Necromancer', 'Infernity Launcher', 'Infernity Break', 'Heavy Storm', 'Mystical Space Typhoon'], { race: 'Fiend', era: '5Ds' }, ['Infernity Doom Dragon', 'Trishula, Dragon of the Ice Barrier', 'Hundred Eyes Dragon'])
        ),
        makeDeckData('kalin_deck_9', 'Dark Grepher Handless Graveyard Dump', 'Dark Grepher Dump', 'Dark Grepher rapidly discards cards from hand to empty hand and load Infernities into the GY.', 'kalin-kessler', 9,
          buildDeck(['Dark Grepher', 'Armageddon Knight', 'Infernity Archfiend', 'Infernity Necromancer', 'Infernity Mirage', 'Allure of Darkness', 'Foolish Burial', 'Infernity Break'], { race: 'Warrior', era: '5Ds' }, ['Infernity Doom Dragon', 'Hundred Eyes Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('kalin_deck_10', "Kalin's Ultimate Infernity Zero Void", 'Master Infernity Dominion', 'Kalin’s world-championship tier Infernity deck featuring Archfiend loops, Barrier locks, and Doom Dragon.', 'kalin-kessler', 10,
          buildDeck(['Infernity Archfiend', 'Infernity Necromancer', 'Infernity Mirage', 'Infernity Beetle', 'Infernity Launcher', 'Infernity Barrier', 'Infernity Break', 'Dark Grepher', 'Foolish Burial', 'One for One', 'Allure of Darkness', 'Solemn Judgment', 'Mirror Force'], { race: 'Fiend', era: '5Ds' }, ['Infernity Doom Dragon', 'Hundred Eyes Dragon', 'Trishula, Dragon of the Ice Barrier', 'Brionac, Dragon of the Ice Barrier', 'Stardust Dragon'])
        ),
      ],
      signatureCards: [72896720, 95453143, 99177923],
    },

    // 8. Antinomy
    {
      id: 'antinomy',
      name: 'Antinomy',
      series: '5Ds',
      title: 'Visor & Delta Accel Master',
      tagline: 'T.G. Tech Genus & Top Clear Mind',
      description: 'A warrior from the apocalyptic future who taught Yusei the secrets of Accel Synchro. Deploys high-tech Tech Genus cyborgs and Halberd Cannon.',
      avatar: 'app-resource://characters/avatars/antinomy.png',
      portrait: 'app-resource://characters/portraits/antinomy.png',
      video: 'resources/videos/characters/antinomy.mp4',
      themeColor: '#00acc1',
      decks: [
        makeDeckData('antinomy_deck_1', 'T.G. Hyper Librarian Draw Engine', 'T.G. Hyper Librarian', 'T.G. Hyper Librarian draws a card every time any monster is Synchro Summoned, providing infinite fuel.', 'antinomy', 1,
          buildDeck(['T.G. Striker', 'T.G. Warwolf', 'T.G. Rush Rhino', 'T.G. Cyber Magician', 'Reinforcement of the Army', 'Horn of the Phantom Beast', 'Pot of Avarice', 'Solemn Judgment', 'Mirror Force'], { era: '5Ds' }, ['T.G. Hyper Librarian', 'T.G. Wonder Magician', 'T.G. Blade Blaster', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('antinomy_deck_2', 'T.G. Blade Blaster Accel Synchro', 'T.G. Blade Blaster', 'Synchro Summons 1 Synchro Tuner and 1 Synchro monster into T.G. Blade Blaster to negate spells and banish to evade attacks.', 'antinomy', 2,
          buildDeck(['T.G. Striker', 'T.G. Warwolf', 'T.G. Rush Rhino', 'TG1-EM1', 'TGX300', 'Horn of the Phantom Beast', 'Mystical Space Typhoon', 'Solemn Warning'], { era: '5Ds' }, ['T.G. Blade Blaster', 'T.G. Wonder Magician', 'T.G. Hyper Librarian', 'T.G. Power Gladiator'])
        ),
        makeDeckData('antinomy_deck_3', 'T.G. Halberd Cannon Delta Accel Summon', 'T.G. Halberd Cannon', 'Achieves Delta Accel Synchro using 1 Synchro Tuner and 2+ non-Tuner Synchros to summon the 4000 ATK Halberd Cannon.', 'antinomy', 3,
          buildDeck(['T.G. Striker', 'T.G. Warwolf', 'T.G. Rush Rhino', 'T.G. Cyber Magician', 'TGX300', 'TG1-EM1', 'Pot of Avarice', 'Solemn Judgment'], { era: '5Ds' }, ['T.G. Halberd Cannon', 'T.G. Blade Blaster', 'T.G. Wonder Magician', 'T.G. Hyper Librarian', 'T.G. Recipro Dragonfly'])
        ),
        makeDeckData('antinomy_deck_4', 'T.G. Striker & Warwolf Rapid Swarm', 'T.G. Swarm', 'Special Summons Striker and chains Warwolf from hand for instant Level 5 Synchro plays without normal summoning.', 'antinomy', 4,
          buildDeck(['T.G. Striker', 'T.G. Warwolf', 'T.G. Rush Rhino', 'Reinforcement of the Army', 'TG1-EM1', 'Dark Hole', 'Heavy Storm', 'Mirror Force'], { era: '5Ds' }, ['T.G. Wonder Magician', 'T.G. Hyper Librarian', 'T.G. Power Gladiator'])
        ),
        makeDeckData('antinomy_deck_5', 'T.G. Wonder Magician Spell/Trap Shatter', 'T.G. Wonder Magician', 'Wonder Magician destroys an opponent Spell or Trap upon Synchro Summon and draws 1 card when destroyed.', 'antinomy', 5,
          buildDeck(['T.G. Wonder Magician', 'T.G. Striker', 'T.G. Warwolf', 'T.G. Rush Rhino', 'TG1-EM1', 'Mystical Space Typhoon', 'Heavy Storm', 'Solemn Judgment'], { era: '5Ds' }, ['T.G. Wonder Magician', 'T.G. Blade Blaster', 'T.G. Hyper Librarian'])
        ),
        makeDeckData('antinomy_deck_6', 'TG1-EM1 Creature Swap Control', 'TG1-EM1 Control', 'Activates TG1-EM1 to trade a T.G. monster for an opponent boss monster and search another T.G. card upon its destruction.', 'antinomy', 6,
          buildDeck(['TG1-EM1', 'T.G. Rush Rhino', 'T.G. Warwolf', 'T.G. Striker', 'T.G. Cyber Magician', 'Horn of the Phantom Beast', 'Solemn Warning', 'Mirror Force'], { era: '5Ds' }, ['T.G. Wonder Magician', 'T.G. Hyper Librarian', 'T.G. Blade Blaster'])
        ),
        makeDeckData('antinomy_deck_7', 'T.G. Rush Rhino Beast Beatdown', 'T.G. Rush Rhino', 'Rush Rhino gains 400 ATK when attacking and synergizes with Horn of the Phantom Beast for 2800 ATK draws.', 'antinomy', 7,
          buildDeck(['T.G. Rush Rhino', 'T.G. Warwolf', 'Horn of the Phantom Beast', 'T.G. Striker', 'TGX300', 'Heavy Storm', 'Solemn Judgment', 'Torrential Tribute'], { race: 'Beast', era: '5Ds' }, ['T.G. Hyper Librarian', 'T.G. Blade Blaster', 'T.G. Power Gladiator'])
        ),
        makeDeckData('antinomy_deck_8', 'TGX300 Team Boost Overdrive', 'TGX Team Boost', 'TGX300 powers up all face-up monsters by 300 ATK for each face-up T.G. monster on the field.', 'antinomy', 8,
          buildDeck(['TGX300', 'TGX1-HL', 'TGX3-DX2', 'T.G. Rush Rhino', 'T.G. Warwolf', 'T.G. Striker', 'Pot of Avarice', 'Mirror Force'], { era: '5Ds' }, ['T.G. Hyper Librarian', 'T.G. Wonder Magician', 'T.G. Blade Blaster'])
        ),
        makeDeckData('antinomy_deck_9', 'T.G. Cyber Magician Hand Tuning', 'Cyber Magician Tuning', 'Uses non-Tuner T.G. monsters directly from the hand as Synchro Materials with T.G. Cyber Magician.', 'antinomy', 9,
          buildDeck(['T.G. Cyber Magician', 'T.G. Rush Rhino', 'T.G. Warwolf', 'T.G. Catapult Dragon', 'TG1-EM1', 'Pot of Duality', 'Solemn Judgment'], { era: '5Ds' }, ['T.G. Wonder Magician', 'T.G. Hyper Librarian', 'T.G. Blade Blaster'])
        ),
        makeDeckData('antinomy_deck_10', "Antinomy's Ultimate Delta Accel Halberd", 'Master Tech Genus Dominion', 'Antinomy’s peak tournament deck capable of unleashing Halberd Cannon and negating summons.', 'antinomy', 10,
          buildDeck(['T.G. Striker', 'T.G. Warwolf', 'T.G. Rush Rhino', 'T.G. Cyber Magician', 'TG1-EM1', 'TGX300', 'Horn of the Phantom Beast', 'Reinforcement of the Army', 'Pot of Avarice', 'Solemn Judgment', 'Solemn Warning', 'Mirror Force'], { era: '5Ds' }, ['T.G. Halberd Cannon', 'T.G. Blade Blaster', 'T.G. Wonder Magician', 'T.G. Hyper Librarian', 'T.G. Power Gladiator', 'T.G. Recipro Dragonfly', 'Brionac, Dragon of the Ice Barrier'])
        ),
      ],
      signatureCards: [97836203, 51447164, 90953320],
    },

    // 9. Sherry LeBlanc
    {
      id: 'sherry-leblanc',
      name: 'Sherry LeBlanc',
      series: '5Ds',
      title: 'Noble Knight of the Revolution',
      tagline: 'Chevalier de Fleur & Noble Chivalry',
      description: 'A fierce French noblewoman seeking vengeance and truth. Combines elegant floral Tuners, Chevalier de Fleur, and counter-traps like Liberty at Last!.',
      avatar: 'app-resource://characters/avatars/sherry-leblanc.png',
      portrait: 'app-resource://characters/portraits/sherry-leblanc.png',
      video: 'resources/videos/characters/sherry-leblanc.mp4',
      themeColor: '#ab47bc',
      decks: [
        makeDeckData('sherry_deck_1', 'Chevalier de Fleur Noble Negation', 'Chevalier de Fleur', 'Chevalier de Fleur negates the activation of opponent Spells and Traps during each player’s turn.', 'sherry-leblanc', 1,
          buildDeck(['Fleur Synchron', 'Sorciere de Fleur', 'Necro Fleur', 'Evocator Chevalier', 'Liberty at Last!', 'Reinforcement of the Army', 'Pot of Avarice', 'Solemn Judgment', 'Mirror Force'], { race: 'Warrior', era: '5Ds' }, ['Chevalier de Fleur', 'Baronne de Fleur', 'Stardust Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('sherry_deck_2', 'Fleur Synchron Floral Tuning', 'Fleur Synchron', 'When Fleur Synchron is sent to the Graveyard for a Synchro Summon, Special Summons a monster from hand.', 'sherry-leblanc', 2,
          buildDeck(['Fleur Synchron', 'Necro Fleur', 'Sorciere de Fleur', 'Evocator Chevalier', 'The Warrior Returning Alive', 'Reinforcement of the Army', 'Solemn Warning'], { race: 'Warrior', era: '5Ds' }, ['Chevalier de Fleur', 'Baronne de Fleur', 'Stardust Dragon'])
        ),
        makeDeckData('sherry_deck_3', 'Sorciere de Fleur Spellcaster Steal', 'Sorciere de Fleur', 'When Sorciere de Fleur is summoned, targets 1 monster in the opponent’s Graveyard and Special Summons it.', 'sherry-leblanc', 3,
          buildDeck(['Sorciere de Fleur', 'Necro Fleur', 'Fleur Synchron', 'Foolish Burial', 'One for One', 'Monster Reborn', 'Solemn Judgment'], { race: 'Spellcaster', era: '5Ds' }, ['Chevalier de Fleur', 'Baronne de Fleur'])
        ),
        makeDeckData('sherry_deck_4', 'Necro Fleur Graveyard Blossom', 'Necro Fleur', 'When destroyed by a card effect and sent to the Graveyard, Necro Fleur summons Sorciere de Fleur from the deck.', 'sherry-leblanc', 4,
          buildDeck(['Necro Fleur', 'Sorciere de Fleur', 'Fleur Synchron', 'Dark Hole', 'Torrential Tribute', 'Foolish Burial', 'One for One'], { race: 'Plant', era: '5Ds' }, ['Chevalier de Fleur', 'Baronne de Fleur'])
        ),
        makeDeckData('sherry_deck_5', 'Noble Chivalry Warrior Light', 'Noble Chivalry', 'Marshals noble warriors and Guardian Angel Joan to maintain dominant battlefield presence.', 'sherry-leblanc', 5,
          buildDeck(['Evocator Chevalier', 'Guardian Angel Joan', 'Command Knight', 'Marauding Captain', 'Reinforcement of the Army', 'United We Stand', 'Solemn Judgment'], { race: 'Warrior', era: '5Ds' }, ['Chevalier de Fleur', 'Baronne de Fleur'])
        ),
        makeDeckData('sherry_deck_6', 'Liberty at Last! Trap Counter', 'Liberty at Last!', 'When a monster is destroyed by battle and sent to the GY, Liberty at Last! shuffles 2 face-up monsters into the deck.', 'sherry-leblanc', 6,
          buildDeck(['Liberty at Last!', 'Fleur Synchron', 'Sorciere de Fleur', 'Necro Fleur', 'Evocator Chevalier', 'Dimensional Prison', 'Mirror Force', 'Solemn Judgment'], { race: 'Warrior', era: '5Ds' }, ['Chevalier de Fleur', 'Baronne de Fleur'])
        ),
        makeDeckData('sherry_deck_7', 'Baronne de Fleur Supreme Aristocracy', 'Baronne de Fleur', 'Unleashes Baronne de Fleur to destroy any card on the field and negate any effect activation.', 'sherry-leblanc', 7,
          buildDeck(['Fleur Synchron', 'Sorciere de Fleur', 'Necro Fleur', 'Evocator Chevalier', 'One for One', 'Foolish Burial', 'Pot of Avarice', 'Solemn Warning'], { race: 'Warrior', era: '5Ds' }, ['Baronne de Fleur', 'Chevalier de Fleur', 'Stardust Dragon'])
        ),
        makeDeckData('sherry_deck_8', 'Fleur Shield & Defensive Chivalry', 'Fleur Defense', 'Shields Fleur Synchron and Sorciere with defensive traps and counters while assembling Synchro combos.', 'sherry-leblanc', 8,
          buildDeck(['Fleur Synchron', 'Necro Fleur', 'Sorciere de Fleur', 'Liberty at Last!', 'Mirror Force', 'Torrential Tribute', 'Dimensional Prison', 'Solemn Judgment'], { race: 'Warrior', era: '5Ds' }, ['Chevalier de Fleur', 'Baronne de Fleur'])
        ),
        makeDeckData('sherry_deck_9', 'Noble Equipments & Lances', 'Noble Equips', 'Equips Chevalier and warriors with United We Stand and Mage Power for unstoppable battle power.', 'sherry-leblanc', 9,
          buildDeck(['Evocator Chevalier', 'Command Knight', 'Fleur Synchron', 'United We Stand', 'Mage Power', 'Reinforcement of the Army', 'Heavy Storm'], { race: 'Warrior', era: '5Ds' }, ['Chevalier de Fleur', 'Baronne de Fleur'])
        ),
        makeDeckData('sherry_deck_10', "Sherry's Ultimate Fleur Revolution", 'Master Fleur Dominion', 'Sherry’s ultimate deck uniting Chevalier de Fleur, Baronne de Fleur, Sorciere de Fleur, and Liberty at Last!.', 'sherry-leblanc', 10,
          buildDeck(['Fleur Synchron', 'Sorciere de Fleur', 'Necro Fleur', 'Evocator Chevalier', 'Guardian Angel Joan', 'Liberty at Last!', 'Reinforcement of the Army', 'One for One', 'Foolish Burial', 'Pot of Avarice', 'Solemn Judgment', 'Mirror Force'], { race: 'Warrior', era: '5Ds' }, ['Baronne de Fleur', 'Chevalier de Fleur', 'Stardust Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
      ],
      signatureCards: [45037489, 84815190, 19642774],
    },

    // 10. Zone
    {
      id: 'zone',
      name: 'Zone',
      series: '5Ds',
      title: 'Architect of the Future',
      tagline: 'Sephylon & Metaion Timelord Apocalypse',
      description: 'The final survivor of humanity\'s ruin who traveled back in time to alter history. Wields the invincible Timelords and the ultimate deity Sephylon.',
      avatar: 'app-resource://characters/avatars/zone.png',
      portrait: 'app-resource://characters/portraits/zone.png',
      video: 'resources/videos/characters/zone.mp4',
      themeColor: '#3949ab',
      decks: [
        makeDeckData('zone_deck_1', 'Sephylon Ultimate Timelord Cataclysm', 'Sephylon / Timelord', 'Sephylon summons up to 4 Level 8+ Fairy monsters from hand or Graveyard with 4000 ATK each.', 'zone', 1,
          buildDeck(['Sephylon, the Ultimate Timelord', 'Metaion, the Timelord', 'Sandaion, the Timelord', 'Archlord Kristya', 'Athena', 'Valhalla, Hall of the Fallen', 'Hecatrice', 'Foolish Burial', 'Pot of Duality', 'Solemn Judgment'], { race: 'Fairy', era: '5Ds' }, ['Stardust Dragon', 'Trishula, Dragon of the Ice Barrier', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('zone_deck_2', 'Metaion the Timelord Bouncing Storm', 'Metaion / Field Wipe', 'Metaion cannot be destroyed by battle or effects, and returns all opponent monsters to hand while dealing 300 burn per card.', 'zone', 2,
          buildDeck(['Metaion, the Timelord', 'Sandaion, the Timelord', 'Battle Fader', 'Cyber Valley', 'Pot of Duality', 'Dark Hole', 'Solemn Judgment', 'Solemn Warning'], { era: '5Ds' }, ['Stardust Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('zone_deck_3', 'Sandaion 4000 Burn Apocalypse', 'Sandaion / Direct Burn', 'Sandaion possesses 4000 ATK, battle immunity, and burns the opponent for 2000 or 4000 direct damage.', 'zone', 3,
          buildDeck(['Sandaion, the Timelord', 'Metaion, the Timelord', 'Sephylon, the Ultimate Timelord', 'Battle Fader', 'Gorz the Emissary of Darkness', 'Pot of Duality', 'Solemn Judgment', 'Torrential Tribute'], { era: '5Ds' }, ['Stardust Dragon', 'Trishula, Dragon of the Ice Barrier'])
        ),
        makeDeckData('zone_deck_4', 'Celestial Transformation Timelord Blitz', 'Celestial Transformation', 'Special Summons Level 10 Timelords from hand with Celestial Transformation for immediate battle effects.', 'zone', 4,
          buildDeck(['Celestial Transformation', 'Metaion, the Timelord', 'Sandaion, the Timelord', 'Archlord Kristya', 'Athena', 'Hecatrice', 'Valhalla, Hall of the Fallen', 'Solemn Judgment'], { race: 'Fairy', era: '5Ds' }, ['Stardust Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('zone_deck_5', 'Valhalla Fairy Timelord Heavens', 'Valhalla / Fairies', 'Valhalla Special Summons massive Fairy deities like Kristya and Athena straight from the hand every turn.', 'zone', 5,
          buildDeck(['Valhalla, Hall of the Fallen', 'Hecatrice', 'Archlord Kristya', 'Athena', 'Sephylon, the Ultimate Timelord', 'Metaion, the Timelord', 'Terraforming', 'Solemn Judgment'], { race: 'Fairy', era: '5Ds' }, ['Stardust Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('zone_deck_6', 'Archlord Kristya Lockdown & Time', 'Kristya / Timelord Lock', 'Prevents all Special Summons with Archlord Kristya while Timelords clean up whatever remains.', 'zone', 6,
          buildDeck(['Archlord Kristya', 'Metaion, the Timelord', 'Sandaion, the Timelord', 'Hecatrice', 'Valhalla, Hall of the Fallen', 'Honest', 'Solemn Judgment', 'Solemn Warning'], { race: 'Fairy', era: '5Ds' }, ['Stardust Dragon'])
        ),
        makeDeckData('zone_deck_7', 'Athena & Timelord Burn Cycle', 'Athena / Burn', 'Athena inflicts 600 damage whenever a Fairy is summoned and revives Fairies from the Graveyard.', 'zone', 7,
          buildDeck(['Athena', 'Sephylon, the Ultimate Timelord', 'Metaion, the Timelord', 'Hecatrice', 'Valhalla, Hall of the Fallen', 'Celestial Transformation', 'Mirror Force'], { race: 'Fairy', era: '5Ds' }, ['Stardust Dragon', 'Trishula, Dragon of the Ice Barrier'])
        ),
        makeDeckData('zone_deck_8', 'Cyber Valley & Timelord Defense', 'Cyber Valley / Stall', 'Banishes Cyber Valley to draw cards or end Battle Phases while setting up Timelord normal summons.', 'zone', 8,
          buildDeck(['Cyber Valley', 'Metaion, the Timelord', 'Sandaion, the Timelord', 'Battle Fader', 'Tragoedia', 'Gorz the Emissary of Darkness', 'Threatening Roar', 'Waboku'], { era: '5Ds' }, ['Stardust Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('zone_deck_9', 'Apocalyptic Solemn Trap Domain', 'Timelord Solemn Control', 'Controls the duel with Solemn Judgment, Solemn Warning, and Torrential Tribute while Timelords reset the board.', 'zone', 9,
          buildDeck(['Metaion, the Timelord', 'Sandaion, the Timelord', 'Sephylon, the Ultimate Timelord', 'Solemn Judgment', 'Solemn Warning', 'Torrential Tribute', 'Mirror Force', 'Dark Hole', 'Pot of Duality'], { era: '5Ds' }, ['Stardust Dragon', 'Trishula, Dragon of the Ice Barrier'])
        ),
        makeDeckData('zone_deck_10', "Zone's Ultimate Future of Ruin", 'Master Timelord Omega', 'Zone’s supreme deck wielding the invincible Timelords Metaion, Sandaion, and the 4000 ATK creator Sephylon.', 'zone', 10,
          buildDeck(['Sephylon, the Ultimate Timelord', 'Metaion, the Timelord', 'Sandaion, the Timelord', 'Archlord Kristya', 'Athena', 'Valhalla, Hall of the Fallen', 'Hecatrice', 'Battle Fader', 'Gorz the Emissary of Darkness', 'Pot of Duality', 'Pot of Avarice', 'Solemn Judgment', 'Solemn Warning', 'Mirror Force'], { race: 'Fairy', era: '5Ds' }, ['Stardust Dragon', 'Trishula, Dragon of the Ice Barrier', 'Brionac, Dragon of the Ice Barrier'])
        ),
      ],
      signatureCards: [8967776, 74530899, 33015627],
    },

    // 11. Carly Carmine
    {
      id: 'carly-carmine',
      name: 'Carly Carmine',
      series: '5Ds',
      title: 'Fortune Teller & Dark Signer Hummingbird',
      tagline: 'Fortune Lady Draw Power & Earthbound Immortal Aslla piscu',
      description: 'An enthusiastic reporter who fell to the dark side as a Dark Signer. Wields Level-scaling Fortune Ladies and Earthbound Immortal Aslla piscu.',
      avatar: 'app-resource://characters/avatars/carly-carmine.png',
      portrait: 'app-resource://characters/portraits/carly-carmine.png',
      video: 'resources/videos/characters/carly-carmine.mp4',
      themeColor: '#ff80ab',
      decks: [
        makeDeckData('carly_deck_1', 'Fortune Lady Draw & Swarm', 'Fortune Lady', 'Accelerates draws with Fortune Lady Water and Light while swarming the field.', 'carly-carmine', 1,
          buildDeck(['Fortune Lady Light', 'Fortune Lady Fire', 'Fortune Lady Wind', 'Fortune Lady Water', 'Fortune Lady Dark', 'Fortune Lady Earth', "Fortune's Future", 'Inherited Fortune', 'Slip of Fortune', 'Dark Hole', 'Mirror Force'], { race: 'Spellcaster', era: '5Ds' }, ['Stardust Dragon', 'Black Rose Dragon', 'Brionac, Dragon of the Ice Barrier', 'Magical Android'])
        ),
        makeDeckData('carly_deck_2', 'Dark Signer Aslla piscu Wrath', 'Aslla piscu / Fortune Lady', 'Earthbound Immortal Aslla piscu wipes opposing monsters and inflicts direct battle damage.', 'carly-carmine', 2,
          buildDeck(['Earthbound Immortal Aslla piscu', 'Fortune Lady Light', 'Fortune Lady Water', 'Fortune Lady Dark', 'Earthbound Immortal Revival', 'Earthbound Wave', "Fortune's Future", 'Mausoleum of the Emperor', 'Terraforming', 'Mirror Force', 'Solemn Judgment'], { race: 'Spellcaster', era: '5Ds' }, ['Stardust Dragon', 'Black Rose Dragon'])
        ),
        makeDeckData('carly_deck_3', 'Fortune Lady Water Draw Engine', 'Fortune Lady Water / Draw', 'Special summons Fortune Lady Water with Fortune Lady Light and Debris Dragon to draw continuously.', 'carly-carmine', 3,
          buildDeck(['Fortune Lady Water', 'Fortune Lady Light', 'Fortune Lady Dark', 'Debris Dragon', "Fortune's Future", 'One for One', 'Dark Hole', 'Monster Reborn', 'Torrential Tribute', 'Mirror Force'], { race: 'Spellcaster', era: '5Ds' }, ['Black Rose Dragon', 'Brionac, Dragon of the Ice Barrier', 'Ancient Fairy Dragon'])
        ),
        makeDeckData('carly_deck_4', 'Inherited Fortune Surprise Turn', 'Inherited Fortune / Special', 'Activates Inherited Fortune when a monster is destroyed to summon 2 Fortune Ladies from hand next turn.', 'carly-carmine', 4,
          buildDeck(['Inherited Fortune', 'Fortune Lady Light', 'Fortune Lady Fire', 'Fortune Lady Water', 'Fortune Lady Dark', "Fortune's Future", 'Slip of Fortune', 'Bottomless Trap Hole', 'Solemn Warning'], { race: 'Spellcaster', era: '5Ds' }, ['Stardust Dragon', 'Black Rose Dragon'])
        ),
        makeDeckData('carly_deck_5', 'Fortune Lady Dark Necro Revive', 'Fortune Lady Dark / Graveyard', 'Destroys opponent monsters with Fortune Lady Dark to revive Fortune Ladies from the Graveyard.', 'carly-carmine', 5,
          buildDeck(['Fortune Lady Dark', 'Fortune Lady Fire', 'Fortune Lady Light', 'Fortune Lady Water', 'Foolish Burial', 'Monster Reborn', "Fortune's Future", 'Call of the Haunted', 'Mirror Force'], { race: 'Spellcaster', era: '5Ds' }, ['Black Rose Dragon', 'Magical Android'])
        ),
        makeDeckData('carly_deck_6', 'Ominous Fortunetelling Control', 'Ominous Fortunetelling / Burn', 'Calls card types with Ominous Fortunetelling to reveal and discard opposing cards with burn damage.', 'carly-carmine', 6,
          buildDeck(['Ominous Fortunetelling', 'Fortune Lady Light', 'Fortune Lady Earth', 'Fortune Lady Wind', 'Slip of Fortune', 'Inherited Fortune', 'Compulsory Evacuation Device', 'Dark Bribe'], { race: 'Spellcaster', era: '5Ds' }, ['Stardust Dragon', 'Ancient Fairy Dragon'])
        ),
        makeDeckData('carly_deck_7', 'Mausoleum Earthbound Hummingbird', 'Mausoleum / Aslla piscu', 'Uses Mausoleum of the Emperor LP tribute to normal summon Earthbound Immortal Aslla piscu without tributes.', 'carly-carmine', 7,
          buildDeck(['Earthbound Immortal Aslla piscu', 'Mausoleum of the Emperor', 'Terraforming', 'Fortune Lady Light', 'Fortune Lady Water', 'Battle Fader', 'Roar of the Earthbound Immortal'], { race: 'Spellcaster', era: '5Ds' }, ['Stardust Dragon', 'Black Rose Dragon'])
        ),
        makeDeckData('carly_deck_8', 'Fortune Lady Synchro Dimension', 'Fortune Lady / Synchro', 'Combines Fortune Ladies with Krebons and Debris Dragon to unleash powerful Level 7 and 8 Synchro dragons.', 'carly-carmine', 8,
          buildDeck(['Fortune Lady Light', 'Fortune Lady Fire', 'Fortune Lady Water', 'Krebons', 'Emergency Teleport', 'Debris Dragon', "Fortune's Future", 'Mystical Space Typhoon', 'Solemn Judgment'], { race: 'Spellcaster', era: '5Ds' }, ['Black Rose Dragon', 'Brionac, Dragon of the Ice Barrier', 'Magical Android', 'Thought Ruler Archfiend', 'Stardust Dragon'])
        ),
        makeDeckData('carly_deck_9', 'Slip of Fortune Counter Defense', 'Slip of Fortune / Counter', 'Negates attacks and banishes attacking monsters temporarily with Slip of Fortune.', 'carly-carmine', 9,
          buildDeck(['Slip of Fortune', 'Fortune Lady Dark', 'Fortune Lady Light', 'Fortune Lady Water', 'Threatening Roar', 'Waboku', 'Mirror Force', 'Dimensional Prison', 'Solemn Warning'], { race: 'Spellcaster', era: '5Ds' }, ['Black Rose Dragon', 'Stardust Dragon'])
        ),
        makeDeckData('carly_deck_10', "Carly's Ultimate Destiny of Aslla piscu", 'Master Fortune Earthbound', "Carly's crowning deck uniting high-tier Fortune Ladies with the supreme flying menace Aslla piscu.", 'carly-carmine', 10,
          buildDeck(['Earthbound Immortal Aslla piscu', 'Fortune Lady Light', 'Fortune Lady Dark', 'Fortune Lady Water', 'Fortune Lady Fire', 'Fortune Lady Wind', "Fortune's Future", 'Mausoleum of the Emperor', 'Terraforming', 'Earthbound Wave', 'Monster Reborn', 'Mirror Force', 'Solemn Judgment'], { race: 'Spellcaster', era: '5Ds' }, ['Stardust Dragon', 'Black Rose Dragon', 'Brionac, Dragon of the Ice Barrier', 'Ancient Fairy Dragon'])
        ),
      ],
      signatureCards: [10875327, 34471458, 55586621],
    },

    // 12. Rex Goodwin
    {
      id: 'rex-goodwin',
      name: 'Rex Goodwin',
      series: '5Ds',
      title: 'Director of Sector Security & Condor Signer',
      tagline: 'Sun Dragon Inti, Moon Dragon Quilla & Wiraqocha Rasca',
      description: 'The former Director of Sector Security who bore both the Signer and Dark Signer marks. Wields the eternal cycle of Sun Dragon Inti and Moon Dragon Quilla.',
      avatar: 'app-resource://characters/avatars/rex-goodwin.png',
      portrait: 'app-resource://characters/portraits/rex-goodwin.png',
      video: 'resources/videos/characters/rex-goodwin.mp4',
      themeColor: '#ffb300',
      decks: [
        makeDeckData('rex_deck_1', 'Sun Dragon Inti Solar Radiance', 'Sun Dragon Inti', 'Special summons Oracle of the Sun and Fire Ant Ascator to summon Sun Dragon Inti and punish attackers.', 'rex-goodwin', 1,
          buildDeck(['Fire Ant Ascator', 'Apocatequil', 'Oracle of the Sun', 'Cyber Dragon', 'Giant Soldier of Stone', 'Dark Hole', 'Heavy Storm', 'Mirror Force', 'Call of the Haunted'], { era: '5Ds' }, ['Sun Dragon Inti', 'Moon Dragon Quilla', 'Stardust Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('rex_deck_2', 'Moon Dragon Quilla Lunar Resurrection', 'Moon Dragon Quilla', 'Uses Supay and Level 5 monsters to summon Moon Dragon Quilla, reviving Inti upon its destruction.', 'rex-goodwin', 2,
          buildDeck(['Supay', 'Oracle of the Sun', 'Apocatequil', 'Giant Soldier of Stone', 'Foolish Burial', 'Monster Reborn', 'Limit Reverse', 'Call of the Haunted', 'Torrential Tribute'], { era: '5Ds' }, ['Moon Dragon Quilla', 'Sun Dragon Inti', 'Stardust Dragon'])
        ),
        makeDeckData('rex_deck_3', 'Inti & Quilla Eternal Cycle', 'Inti & Quilla Loop', 'Creates an unending loop between Sun Dragon Inti and Moon Dragon Quilla reviving each other turn after turn.', 'rex-goodwin', 3,
          buildDeck(['Fire Ant Ascator', 'Supay', 'Oracle of the Sun', 'Apocatequil', 'Limit Reverse', 'Call of the Haunted', 'Monster Reborn', 'Pot of Avarice', 'Solemn Judgment'], { era: '5Ds' }, ['Sun Dragon Inti', 'Moon Dragon Quilla', 'Stardust Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('rex_deck_4', 'Dark Signer Wiraqocha Rasca Condor', 'Wiraqocha Rasca', 'Summons the giant Condor Earthbound Immortal Wiraqocha Rasca to reduce the opponent to 1 Life Point.', 'rex-goodwin', 4,
          buildDeck(['Earthbound Immortal Wiraqocha Rasca', 'Earthbound Wave', 'Earthbound Immortal Revival', 'Oracle of the Sun', 'Apocatequil', 'Mausoleum of the Emperor', 'Terraforming', 'Roar of the Earthbound Immortal'], { era: '5Ds' }, ['Sun Dragon Inti', 'Moon Dragon Quilla'])
        ),
        makeDeckData('rex_deck_5', 'Inca Temple & Oracle Swarm', 'Oracle & Apocatequil', 'Synergizes Apocatequil becoming Level 5 with Tuners for instantaneous Level 6 to 8 Synchro plays.', 'rex-goodwin', 5,
          buildDeck(['Oracle of the Sun', 'Apocatequil', 'Fire Ant Ascator', 'Supay', 'Pot of Duality', 'Compulsory Evacuation Device', 'Bottomless Trap Hole', 'Solemn Warning'], { era: '5Ds' }, ['Sun Dragon Inti', 'Moon Dragon Quilla'])
        ),
        makeDeckData('rex_deck_6', 'Limit Reverse Ascator-Supay Engine', 'Limit Reverse Synchro', 'Uses Limit Reverse to revive the 0 ATK Supay or Fire Ant Ascator directly from the Graveyard for Synchros.', 'rex-goodwin', 6,
          buildDeck(['Limit Reverse', 'Fire Ant Ascator', 'Supay', 'Apocatequil', 'Oracle of the Sun', 'One for One', 'Foolish Burial', 'Dark Hole', 'Mirror Force'], { era: '5Ds' }, ['Sun Dragon Inti', 'Moon Dragon Quilla', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('rex_deck_7', 'Signer & Dark Signer Transcendence', 'Inca Duality', 'Blends the righteous light of the Sun Dragon and the shadowy power of the Earthbound Immortal.', 'rex-goodwin', 7,
          buildDeck(['Earthbound Immortal Wiraqocha Rasca', 'Fire Ant Ascator', 'Supay', 'Oracle of the Sun', 'Apocatequil', 'Mausoleum of the Emperor', 'Terraforming', 'Solemn Judgment'], { era: '5Ds' }, ['Sun Dragon Inti', 'Moon Dragon Quilla', 'Stardust Dragon', 'Red Dragon Archfiend'])
        ),
        makeDeckData('rex_deck_8', 'Apocatequil Light Rush', 'Apocatequil Beatdown', 'Uses Honest and Shining Angel to empower Apocatequil while maintaining field presence for Synchro summons.', 'rex-goodwin', 8,
          buildDeck(['Apocatequil', 'Fire Ant Ascator', 'Supay', 'Shining Angel', 'Honest', 'Oracle of the Sun', 'Compulsory Evacuation Device', 'Mirror Force'], { era: '5Ds' }, ['Sun Dragon Inti', 'Moon Dragon Quilla'])
        ),
        makeDeckData('rex_deck_9', 'Earthbound Linewalker Inca Shield', 'Linewalker Defense', 'Earthbound Linewalker prevents Earthbound Immortals from being destroyed when Field Spells leave the field.', 'rex-goodwin', 9,
          buildDeck(['Earthbound Immortal Wiraqocha Rasca', 'Earthbound Linewalker', 'Fire Ant Ascator', 'Supay', 'Oracle of the Sun', 'Mausoleum of the Emperor', 'Terraforming', 'Threatening Roar'], { era: '5Ds' }, ['Sun Dragon Inti', 'Moon Dragon Quilla'])
        ),
        makeDeckData('rex_deck_10', "Goodwin's Ultimate Solar Eclipse", 'Master Inca Supreme', 'Rex Goodwin’s absolute supreme deck commanding Sun Dragon Inti, Moon Dragon Quilla, and Wiraqocha Rasca.', 'rex-goodwin', 10,
          buildDeck(['Earthbound Immortal Wiraqocha Rasca', 'Fire Ant Ascator', 'Supay', 'Oracle of the Sun', 'Apocatequil', 'Earthbound Wave', 'Limit Reverse', 'Call of the Haunted', 'Monster Reborn', 'Solemn Judgment', 'Mirror Force'], { era: '5Ds' }, ['Sun Dragon Inti', 'Moon Dragon Quilla', 'Stardust Dragon', 'Red Dragon Archfiend', 'Brionac, Dragon of the Ice Barrier'])
        ),
      ],
      signatureCards: [39823987, 66818682, 41181774],
    },

    // 13. Roman Goodwin
    {
      id: 'roman-goodwin',
      name: 'Roman Goodwin',
      series: '5Ds',
      title: 'Leader of the Dark Signers & Spider Mark',
      tagline: 'Underground Arachnid & Earthbound Immortal Uru',
      description: 'The terrifying leader of the Dark Signers who sacrificed his humanity for the power of the Netherworld. Commands spider fiends and Earthbound Immortal Uru.',
      avatar: 'app-resource://characters/avatars/roman-goodwin.png',
      portrait: 'app-resource://characters/portraits/roman-goodwin.png',
      video: 'resources/videos/characters/roman-goodwin.mp4',
      themeColor: '#7b1fa2',
      decks: [
        makeDeckData('roman_deck_1', 'Underground Arachnid Dark Synchro', 'Underground Arachnid', 'Summons Underground Arachnid to equip opponent monsters to itself and negate spell/trap activations when attacking.', 'roman-goodwin', 1,
          buildDeck(['Mother Spider', 'Relinquished Spider', 'Spyder Spider', 'Dark Hole', 'Foolish Burial', 'Monster Reborn', 'Call of the Haunted', 'Mirror Force', 'Torrential Tribute'], { race: 'Insect', era: '5Ds' }, ['Underground Arachnid', 'Brionac, Dragon of the Ice Barrier', 'Stardust Dragon'])
        ),
        makeDeckData('roman_deck_2', 'Earthbound Immortal Uru Puppet Mastery', 'Earthbound Uru', 'Tributes his own monsters to take control of opponent monsters and strike directly with 3000 ATK.', 'roman-goodwin', 2,
          buildDeck(['Earthbound Immortal Uru', 'Mother Spider', 'Relinquished Spider', 'Spyder Spider', 'Earthbound Wave', 'Earthbound Immortal Revival', 'Mausoleum of the Emperor', 'Terraforming', 'Solemn Judgment'], { race: 'Insect', era: '5Ds' }, ['Underground Arachnid'])
        ),
        makeDeckData('roman_deck_3', 'Mother Spider Level 5 Swarm', 'Mother Spider Swarm', 'Sends Dark monsters to the GY to special summon Mother Spider for immediate high-level beatdown.', 'roman-goodwin', 3,
          buildDeck(['Mother Spider', 'Relinquished Spider', 'Spyder Spider', 'Gokipon', 'Informer Spider', 'Verdant Sanctuary', 'Dark Hole', 'Torrential Tribute', 'Mirror Force'], { race: 'Insect', era: '5Ds' }, ['Underground Arachnid'])
        ),
        makeDeckData('roman_deck_4', 'Relinquished Spider Position Lock', 'Position Control', 'Changes opposing monsters to defense position and destroys them with Relinquished Spider.', 'roman-goodwin', 4,
          buildDeck(['Relinquished Spider', 'Spyder Spider', 'Mother Spider', 'Compulsory Evacuation Device', 'Bottomless Trap Hole', 'Mirror Force', 'Dimensional Prison'], { race: 'Insect', era: '5Ds' }, ['Underground Arachnid'])
        ),
        makeDeckData('roman_deck_5', 'Spyder Spider Graveyard Harvest', 'Spyder Spider Revive', 'Destroys defense position monsters in battle to special summon Level 4 or lower Insects from the GY.', 'roman-goodwin', 5,
          buildDeck(['Spyder Spider', 'Mother Spider', 'Relinquished Spider', 'Gokipon', 'Foolish Burial', 'Limit Reverse', 'Call of the Haunted', 'Mirror Force'], { race: 'Insect', era: '5Ds' }, ['Underground Arachnid'])
        ),
        makeDeckData('roman_deck_6', 'Verdant Sanctuary Insect Flood', 'Verdant Sanctuary', 'Adds an Insect to hand every time an Insect is destroyed on the field, maintaining infinite card advantage.', 'roman-goodwin', 6,
          buildDeck(['Verdant Sanctuary', 'Mother Spider', 'Relinquished Spider', 'Spyder Spider', 'Gokipon', 'Howling Insect', 'Heavy Storm', 'Solemn Judgment'], { race: 'Insect', era: '5Ds' }, ['Underground Arachnid'])
        ),
        makeDeckData('roman_deck_7', 'Earthbound Uru Mind Takeover', 'Uru Mind Control', 'Combines Brain Control, Enemy Controller, and Uru’s tribute theft to systematically dismantle opposing boards.', 'roman-goodwin', 7,
          buildDeck(['Earthbound Immortal Uru', 'Spyder Spider', 'Mother Spider', 'Enemy Controller', 'Earthbound Wave', 'Call of the Haunted', 'Mirror Force'], { race: 'Insect', era: '5Ds' }, ['Underground Arachnid'])
        ),
        makeDeckData('roman_deck_8', 'Insect Swarm & Doom Dozer Assault', 'Doom Dozer Insect', 'Banishes Insects from the Graveyard to summon the 2800 ATK Doom Dozer alongside Underground Arachnid.', 'roman-goodwin', 8,
          buildDeck(['Doom Dozer', 'Mother Spider', 'Relinquished Spider', 'Spyder Spider', 'Gokipon', 'Howling Insect', 'Foolish Burial', 'Dark Hole'], { race: 'Insect', era: '5Ds' }, ['Underground Arachnid', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('roman_deck_9', 'Shadow Drone Web of Despair', 'Shadow Drone Defense', 'Wields defensive stall cards and Earthbound Linewalker to safeguard Earthbound Immortal Uru.', 'roman-goodwin', 9,
          buildDeck(['Earthbound Immortal Uru', 'Earthbound Linewalker', 'Earthbound Wave', 'Mother Spider', 'Relinquished Spider', 'Threatening Roar', 'Waboku', 'Solemn Warning'], { race: 'Insect', era: '5Ds' }, ['Underground Arachnid'])
        ),
        makeDeckData('roman_deck_10', "Roman's Ultimate Spider Netherworld", 'Master Spider Uru', 'Roman Goodwin’s supreme deck commanding Underground Arachnid and the invincible giant Earthbound Immortal Uru.', 'roman-goodwin', 10,
          buildDeck(['Earthbound Immortal Uru', 'Mother Spider', 'Relinquished Spider', 'Spyder Spider', 'Verdant Sanctuary', 'Earthbound Wave', 'Earthbound Immortal Revival', 'Mausoleum of the Emperor', 'Terraforming', 'Monster Reborn', 'Solemn Judgment'], { race: 'Insect', era: '5Ds' }, ['Underground Arachnid', 'Stardust Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
      ],
      signatureCards: [15187079, 17021204, 17243896],
    },

    // 14. Misty Tredwell
    {
      id: 'misty-tredwell',
      name: 'Misty Tredwell',
      series: '5Ds',
      title: 'Top Model & Dark Signer Lizard',
      tagline: 'Reptilianne 0-ATK Gorgon Lock & Earthbound Immortal Ccarayhua',
      description: 'A famous supermodel who became a Dark Signer seeking vengeance. Wields petrifying Reptilianne monsters that reduce opponent ATK to 0 and Earthbound Immortal Ccarayhua.',
      avatar: 'app-resource://characters/avatars/misty-tredwell.png',
      portrait: 'app-resource://characters/portraits/misty-tredwell.png',
      video: 'resources/videos/characters/misty-tredwell.mp4',
      themeColor: '#00897b',
      decks: [
        makeDeckData('misty_deck_1', 'Reptilianne 0-ATK Gorgon Lock', 'Reptilianne Gorgon', 'Reduces opponent monster ATK to 0 with Reptilianne Gorgon and Medusa, locking down attack options.', 'misty-tredwell', 1,
          buildDeck(['Reptilianne Gorgon', 'Reptilianne Medusa', 'Reptilianne Viper', 'Reptilianne Scylla', 'Reptilianne Gardna', 'Reptilianne Spawn', 'Reptilianne Poison', 'Dark Hole', 'Mirror Force'], { race: 'Reptile', era: '5Ds' }, ['Reptilianne Hydra', 'Brionac, Dragon of the Ice Barrier', 'Stardust Dragon'])
        ),
        makeDeckData('misty_deck_2', 'Reptilianne Hydra Multi-Synchro Strike', 'Reptilianne Hydra', 'Synchro summons Reptilianne Hydra to destroy all 0 ATK monsters and draw cards equal to destroyed cards.', 'misty-tredwell', 2,
          buildDeck(['Reptilianne Viper', 'Reptilianne Spawn', 'Reptilianne Gardna', 'Reptilianne Gorgon', 'Reptilianne Poison', 'Reptilianne Rage', 'Foolish Burial', 'Monster Reborn', 'Torrential Tribute'], { race: 'Reptile', era: '5Ds' }, ['Reptilianne Hydra', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('misty_deck_3', 'Earthbound Ccarayhua Death Wipe', 'Ccarayhua Field Wipe', 'When Earthbound Immortal Ccarayhua is destroyed, all cards on the field are wiped clean from existence.', 'misty-tredwell', 3,
          buildDeck(['Earthbound Immortal Ccarayhua', 'Earthbound Wave', 'Earthbound Immortal Revival', 'Reptilianne Viper', 'Reptilianne Gardna', 'Mausoleum of the Emperor', 'Terraforming', 'Solemn Judgment'], { race: 'Reptile', era: '5Ds' }, ['Reptilianne Hydra'])
        ),
        makeDeckData('misty_deck_4', 'Reptilianne Vaskii Double Theft', 'Reptilianne Vaskii', 'Special summons Reptilianne Vaskii by tributing 2 face-up 0 ATK monsters anywhere on the field.', 'misty-tredwell', 4,
          buildDeck(['Reptilianne Vaskii', 'Reptilianne Gorgon', 'Reptilianne Viper', 'Reptilianne Spawn', 'Reptilianne Poison', 'Enemy Controller', 'Compulsory Evacuation Device', 'Mirror Force'], { race: 'Reptile', era: '5Ds' }, ['Reptilianne Hydra'])
        ),
        makeDeckData('misty_deck_5', 'Snake Rain & Reptilianne Grave Surge', 'Snake Rain Engine', 'Uses Snake Rain to send 4 Reptiles from deck to Graveyard, priming massive recursion.', 'misty-tredwell', 5,
          buildDeck(['Snake Rain', 'Reptilianne Viper', 'Reptilianne Gardna', 'Reptilianne Medusa', 'Reptilianne Naga', 'Monster Reborn', 'Call of the Haunted', 'Pot of Avarice'], { race: 'Reptile', era: '5Ds' }, ['Reptilianne Hydra', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('misty_deck_6', 'Reptilianne Naga Unyielding Defense', 'Naga Wall', 'Reptilianne Naga cannot be destroyed in battle and reduces attacking monster ATK to 0 at the end of the Battle Phase.', 'misty-tredwell', 6,
          buildDeck(['Reptilianne Naga', 'Reptilianne Gardna', 'Reptilianne Viper', 'Reptilianne Vaskii', 'Waboku', 'Threatening Roar', 'Mirror Force', 'Dimensional Prison'], { race: 'Reptile', era: '5Ds' }, ['Reptilianne Hydra'])
        ),
        makeDeckData('misty_deck_7', 'Reptilianne Scylla Grave Theft', 'Scylla Battle Steal', 'Destroys 0 ATK monsters in battle with Reptilianne Scylla to special summon them to her side.', 'misty-tredwell', 7,
          buildDeck(['Reptilianne Scylla', 'Reptilianne Gorgon', 'Reptilianne Viper', 'Reptilianne Poison', 'Shrink', 'Mirror Force', 'Bottomless Trap Hole'], { race: 'Reptile', era: '5Ds' }, ['Reptilianne Hydra'])
        ),
        makeDeckData('misty_deck_8', 'Reptilianne Spawn Token Explosion', 'Spawn Token Tuning', 'Banishes a Reptilianne from GY to generate 2 Reptilianne Tokens for instant Level 6 Hydra Synchro.', 'misty-tredwell', 8,
          buildDeck(['Reptilianne Spawn', 'Reptilianne Viper', 'Reptilianne Vaskii', 'Reptilianne Medusa', 'One for One', 'Dark Hole', 'Solemn Warning'], { race: 'Reptile', era: '5Ds' }, ['Reptilianne Hydra', 'Stardust Dragon'])
        ),
        makeDeckData('misty_deck_9', 'Ccarayhua & Earthbound Linewalker', 'Linewalker Ccarayhua', 'Protects Ccarayhua with Linewalker while using Reptilianne debuffs to paralyze the enemy.', 'misty-tredwell', 9,
          buildDeck(['Earthbound Immortal Ccarayhua', 'Earthbound Linewalker', 'Earthbound Wave', 'Reptilianne Gardna', 'Reptilianne Viper', 'Mausoleum of the Emperor', 'Terraforming', 'Solemn Judgment'], { race: 'Reptile', era: '5Ds' }, ['Reptilianne Hydra'])
        ),
        makeDeckData('misty_deck_10', "Misty's Ultimate Reptilianne Retribution", 'Master Reptilianne Retribution', 'Misty’s supreme deck combining petrifying Reptiliannes, Vaskii, Hydra, and the apocalyptic Ccarayhua.', 'misty-tredwell', 10,
          buildDeck(['Earthbound Immortal Ccarayhua', 'Reptilianne Vaskii', 'Reptilianne Viper', 'Reptilianne Spawn', 'Reptilianne Gorgon', 'Reptilianne Medusa', 'Snake Rain', 'Earthbound Wave', 'Monster Reborn', 'Mirror Force', 'Solemn Judgment'], { race: 'Reptile', era: '5Ds' }, ['Reptilianne Hydra', 'Brionac, Dragon of the Ice Barrier', 'Stardust Dragon'])
        ),
      ],
      signatureCards: [79798060, 16886617, 43426903],
    },

    // 15. Greiger
    {
      id: 'greiger',
      name: 'Greiger',
      series: '5Ds',
      title: 'Giant Bomber Duelist & Dark Signer Whale',
      tagline: 'Flying Fortress SKY FIRE & Dark Strike Fighter',
      description: 'A proud, imposing warrior from an impoverished village who wields giant military machines, Flying Fortress SKY FIRE, and Earthbound Immortal Chacu Challhua.',
      avatar: 'app-resource://characters/avatars/greiger.png',
      portrait: 'app-resource://characters/portraits/greiger.png',
      video: 'resources/videos/characters/greiger.mp4',
      themeColor: '#d32f2f',
      decks: [
        makeDeckData('greiger_deck_1', 'Flying Fortress SKY FIRE Heavy Artillery', 'Flying Fortress SKY FIRE', 'Sends Summon Reactor, Trap Reactor, and Spell Reactor to the GY to call Flying Fortress SKY FIRE.', 'greiger', 1,
          buildDeck(['Flying Fortress SKY FIRE', 'Summon Reactor ・SK', 'Trap Reactor ・Y FI', 'Spell Reactor ・RE', 'Dark Hole', 'Heavy Storm', 'Monster Reborn', 'Call of the Haunted', 'Mirror Force'], { race: 'Machine', era: '5Ds' }, ['Dark Strike Fighter', 'Brionac, Dragon of the Ice Barrier', 'Stardust Dragon'])
        ),
        makeDeckData('greiger_deck_2', 'Dark Strike Fighter Catapult Burn', 'Dark Strike Burn', 'Synchro summons Dark Strike Fighter to tribute monsters and inflict massive direct damage equal to Level x 200.', 'greiger', 2,
          buildDeck(['Summon Reactor ・SK', 'Trap Reactor ・Y FI', 'Spell Reactor ・RE', 'Cyber Dragon', 'Limiter Removal', 'Heavy Storm', 'Torrential Tribute', 'Solemn Warning'], { race: 'Machine', era: '5Ds' }, ['Dark Strike Fighter', 'Stardust Dragon', 'Brionac, Dragon of the Ice Barrier', 'Colossal Fighter'])
        ),
        makeDeckData('greiger_deck_3', 'Earthbound Chacu Challhua Killer Whale', 'Chacu Challhua Burn', 'Switches Earthbound Immortal Chacu Challhua to defense mode to inflict half its DEF as direct burn damage.', 'greiger', 3,
          buildDeck(['Earthbound Immortal Chacu Challhua', 'Earthbound Wave', 'Earthbound Immortal Revival', 'Summon Reactor ・SK', 'Mausoleum of the Emperor', 'Terraforming', 'Mirror Force', 'Solemn Judgment'], { race: 'Machine', era: '5Ds' }, ['Dark Strike Fighter'])
        ),
        makeDeckData('greiger_deck_4', 'Reactor Reaction Intercept Lock', 'Reactor Reaction', 'Summon Reactor punishes summons, Trap Reactor punishes traps, and Spell Reactor punishes spell activations.', 'greiger', 4,
          buildDeck(['Summon Reactor ・SK', 'Trap Reactor ・Y FI', 'Spell Reactor ・RE', 'Flying Fortress SKY FIRE', 'Compulsory Evacuation Device', 'Bottomless Trap Hole', 'Solemn Judgment'], { race: 'Machine', era: '5Ds' }, ['Dark Strike Fighter'])
        ),
        makeDeckData('greiger_deck_5', 'Machine Duplication Reactor Overload', 'Machine Duplication', 'Duplicates low ATK Reactors with Machine Duplication and boosts them with Limiter Removal.', 'greiger', 5,
          buildDeck(['Summon Reactor ・SK', 'Trap Reactor ・Y FI', 'Spell Reactor ・RE', 'Machine Duplication', 'Limiter Removal', 'Flying Fortress SKY FIRE', 'Dark Hole', 'Mirror Force'], { race: 'Machine', era: '5Ds' }, ['Dark Strike Fighter', 'Stardust Dragon'])
        ),
        makeDeckData('greiger_deck_6', 'Cyber Dragon Machine Alliance', 'Cyber Dragon Heavy', 'Pairs Cyber Dragon and Chimeratech with military Reactor firepower for unstoppable offensive assaults.', 'greiger', 6,
          buildDeck(['Cyber Dragon', 'Summon Reactor ・SK', 'Trap Reactor ・Y FI', 'Spell Reactor ・RE', 'Limiter Removal', 'Heavy Storm', 'Solemn Warning'], { race: 'Machine', era: '5Ds' }, ['Dark Strike Fighter', 'Chimeratech Fortress Dragon', 'Stardust Dragon'])
        ),
        makeDeckData('greiger_deck_7', 'Chacu Challhua Defense Wall Stance', 'Chacu Challhua Wall', 'Earthbound Immortal Chacu Challhua prevents the opponent from conducting their Battle Phase.', 'greiger', 7,
          buildDeck(['Earthbound Immortal Chacu Challhua', 'Summon Reactor ・SK', 'Trap Reactor ・Y FI', 'Threatening Roar', 'Waboku', 'Earthbound Wave', 'Mausoleum of the Emperor', 'Terraforming'], { race: 'Machine', era: '5Ds' }, ['Dark Strike Fighter'])
        ),
        makeDeckData('greiger_deck_8', 'Level Eater & Dark Strike Rush', 'Level Eater Synchro', 'Eats monster levels to swarm the field with tokens and Synchro material for Dark Strike Fighter.', 'greiger', 8,
          buildDeck(['Level Eater', 'Summon Reactor ・SK', 'Trap Reactor ・Y FI', 'Spell Reactor ・RE', 'Quickdraw Synchron', 'Tuning', 'One for One', 'Foolish Burial'], { race: 'Machine', era: '5Ds' }, ['Dark Strike Fighter', 'Stardust Dragon', 'Formula Synchron', 'Junk Destroyer'])
        ),
        makeDeckData('greiger_deck_9', 'Solidarity Heavy Machine Battalion', 'Solidarity Machine', 'Powers every Machine monster with a permanent +800 ATK boost via Solidarity.', 'greiger', 9,
          buildDeck(['Solidarity', 'Summon Reactor ・SK', 'Trap Reactor ・Y FI', 'Spell Reactor ・RE', 'Flying Fortress SKY FIRE', 'Limiter Removal', 'Mirror Force', 'Solemn Warning'], { race: 'Machine', era: '5Ds' }, ['Dark Strike Fighter'])
        ),
        makeDeckData('greiger_deck_10', "Greiger's Ultimate Sky-Fire Armageddon", 'Master Sky-Fire Armageddon', 'Greiger’s supreme deck commanding Flying Fortress SKY FIRE, Dark Strike Fighter, and Chacu Challhua.', 'greiger', 10,
          buildDeck(['Flying Fortress SKY FIRE', 'Earthbound Immortal Chacu Challhua', 'Summon Reactor ・SK', 'Trap Reactor ・Y FI', 'Spell Reactor ・RE', 'Limiter Removal', 'Earthbound Wave', 'Monster Reborn', 'Mirror Force', 'Solemn Judgment'], { race: 'Machine', era: '5Ds' }, ['Dark Strike Fighter', 'Stardust Dragon', 'Colossal Fighter', 'Brionac, Dragon of the Ice Barrier'])
        ),
      ],
      signatureCards: [16898077, 69931927, 89493368],
    },

    // 16. Aporia
    {
      id: 'aporia',
      name: 'Aporia',
      series: '5Ds',
      title: 'Embodiment of Despair & Yliaster Leader',
      tagline: 'Meklord Emperors Wisel, Granel & Mekanikle',
      description: 'The combined form of Jakob, Primo, and Lester born from the despair of humanity’s destroyed future. Commands the anti-Synchro Meklord Emperors.',
      avatar: 'app-resource://characters/avatars/aporia.png',
      portrait: 'app-resource://characters/portraits/aporia.png',
      video: 'resources/videos/characters/aporia.mp4',
      themeColor: '#455a64',
      decks: [
        makeDeckData('aporia_deck_1', 'Meklord Emperor Wisel Anti-Synchro', 'Meklord Wisel', 'Special summons Wisel upon card destruction to absorb opposing Synchro monsters and negate spell activations.', 'aporia', 1,
          buildDeck(['Meklord Emperor Wisel', 'Meklord Army of Wisel', 'Meklord Army of Granel', 'Meklord Fortress', 'Boon of the Meklord Emperor', 'Dark Hole', 'Torrential Tribute', 'Mirror Force', 'Solemn Judgment'], { race: 'Machine', era: '5Ds' })
        ),
        makeDeckData('aporia_deck_2', 'Meklord Emperor Granel Colossal LP', 'Meklord Granel', 'Meklord Emperor Granel gains ATK and DEF equal to half of your Life Points, reaching titanic proportions.', 'aporia', 2,
          buildDeck(['Meklord Emperor Granel', 'Meklord Army of Granel', 'Meklord Army of Wisel', 'Meklord Fortress', 'Poison of the Old Man', 'Draining Shield', 'Mirror Force', 'Solemn Warning'], { race: 'Machine', era: '5Ds' })
        ),
        makeDeckData('aporia_deck_3', 'Meklord Emperor Skiel Direct Flight', 'Meklord Skiel', 'Meklord Emperor Skiel sends absorbed Synchro monsters to the Graveyard to attack directly.', 'aporia', 3,
          buildDeck(['Meklord Emperor Skiel', 'Meklord Army of Skiel', 'Meklord Army of Wisel', 'Meklord Fortress', 'Boon of the Meklord Emperor', 'Limiter Removal', 'Compulsory Evacuation Device'], { race: 'Machine', era: '5Ds' })
        ),
        makeDeckData('aporia_deck_4', 'Meklord Astro Mekanikle Devastation', 'Meklord Astro Mekanikle', 'Sends 3 Meklord monsters from hand to Graveyard to summon the 4000 ATK god of machine devastation.', 'aporia', 4,
          buildDeck(['Meklord Astro Mekanikle', 'Meklord Emperor Wisel', 'Meklord Emperor Granel', 'Meklord Emperor Skiel', 'Meklord Army of Wisel', 'Meklord Army of Granel', 'Meklord Fortress', 'Dark Hole', 'Torrential Tribute'], { race: 'Machine', era: '5Ds' })
        ),
        makeDeckData('aporia_deck_5', 'Meklord Army Cybernetic Swarm', 'Meklord Army Beatdown', 'Meklord Armies gain ATK for each other Meklord on the field, overwhelming the foe with high stats.', 'aporia', 5,
          buildDeck(['Meklord Army of Wisel', 'Meklord Army of Granel', 'Meklord Army of Skiel', 'The Resolute Meklord Army', 'Meklord Fortress', 'Limiter Removal', 'Solidarity', 'Mirror Force'], { race: 'Machine', era: '5Ds' })
        ),
        makeDeckData('aporia_deck_6', 'Meklord Astro Dragon Asterisk Flood', 'Meklord Asterisk', 'Special summons Asterisk when controlling 3 or more Meklords, burning the opponent upon every Synchro summon.', 'aporia', 6,
          buildDeck(['Meklord Astro Dragon Asterisk', 'Meklord Army of Wisel', 'Meklord Army of Granel', 'Meklord Army of Skiel', 'Meklord Fortress', 'Machine Duplication', 'Torrential Tribute'], { race: 'Machine', era: '5Ds' })
        ),
        makeDeckData('aporia_deck_7', 'Self-Destruction Triggered Despair', 'Self-Destruction Triggers', 'Uses Torrential Tribute, Dark Hole, and self-destruction traps to summon Meklord Emperors at will.', 'aporia', 7,
          buildDeck(['Meklord Emperor Wisel', 'Meklord Emperor Granel', 'Meklord Army of Wisel', 'Dark Hole', 'Torrential Tribute', 'Mirror Force', 'Solemn Judgment'], { race: 'Machine', era: '5Ds' })
        ),
        makeDeckData('aporia_deck_8', 'Meklord Fortress Anti-Targeting Bastion', 'Meklord Fortress Bastion', 'Meklord Fortress prevents Meklord Emperors from being targeted by Synchro monster effects.', 'aporia', 8,
          buildDeck(['Meklord Fortress', 'Terraforming', 'Meklord Emperor Wisel', 'Meklord Emperor Granel', 'Meklord Factory', 'Boon of the Meklord Emperor', 'Solemn Warning', 'Bottomless Trap Hole'], { race: 'Machine', era: '5Ds' })
        ),
        makeDeckData('aporia_deck_9', 'Machine Duplication Meklord Rush', 'Machine Duplication Meklord', 'Duplicates Meklord Army monsters with Machine Duplication to set up Asterisk or Mekanikle.', 'aporia', 9,
          buildDeck(['Meklord Army of Wisel', 'Meklord Army of Granel', 'Machine Duplication', 'Limiter Removal', 'Meklord Emperor Wisel', 'Heavy Storm', 'Mirror Force'], { race: 'Machine', era: '5Ds' })
        ),
        makeDeckData('aporia_deck_10', "Aporia's Ultimate Future of Despair", 'Master Meklord Apocalypse', 'Aporia’s supreme deck commanding all 3 Meklord Emperors and the 4000 ATK Meklord Astro Mekanikle.', 'aporia', 10,
          buildDeck(['Meklord Astro Mekanikle', 'Meklord Emperor Wisel', 'Meklord Emperor Granel', 'Meklord Emperor Skiel', 'Meklord Army of Wisel', 'Meklord Army of Granel', 'Meklord Fortress', 'Boon of the Meklord Emperor', 'Limiter Removal', 'Dark Hole', 'Torrential Tribute', 'Solemn Judgment'], { race: 'Machine', era: '5Ds' })
        ),
      ],
      signatureCards: [63468625, 68140974, 4545683],
    },

    // 17. Paradox
    {
      id: 'paradox',
      name: 'Paradox',
      series: '5Ds',
      title: 'Temporal Duelist & Destroyer of Eras',
      tagline: 'Malefic Stardust, Cyber End & Truth Dragon',
      description: 'A time traveler who traveled across eras stealing legendary dragons to alter the future. Corrupts iconic monsters into colossal Malefic juggernauts.',
      avatar: 'app-resource://characters/avatars/paradox.png',
      portrait: 'app-resource://characters/portraits/paradox.png',
      video: 'resources/videos/characters/paradox.mp4',
      themeColor: '#37474f',
      decks: [
        makeDeckData('paradox_deck_1', 'Malefic Stardust & Cyber End 4000 ATK', 'Malefic Behemoths', 'Banishes Stardust Dragon and Cyber End Dragon from Extra Deck to summon 4000 ATK behemoths instantly.', 'paradox', 1,
          buildDeck(['Malefic Stardust Dragon', 'Malefic Cyber End Dragon', 'Malefic World', 'Terraforming', 'Dark Hole', 'Mirror Force', 'Solemn Judgment'], { era: '5Ds' }, ['Stardust Dragon', 'Cyber End Dragon', 'Malefic Paradox Dragon'])
        ),
        makeDeckData('paradox_deck_2', 'Malefic Paradox Dragon Synchro Theft', 'Malefic Paradox Dragon', 'Uses Malefic Parallel Gear to Synchro summon Malefic Paradox Dragon and steal Synchro monsters from any GY.', 'paradox', 2,
          buildDeck(['Malefic Parallel Gear', 'Malefic Rainbow Dragon', 'Malefic Stardust Dragon', 'Malefic World', 'Terraforming', 'Monster Reborn', 'Solemn Warning'], { era: '5Ds' }, ['Malefic Paradox Dragon', 'Stardust Dragon', 'Cyber End Dragon', 'Rainbow Dragon'])
        ),
        makeDeckData('paradox_deck_3', 'Malefic Truth Dragon 5000 ATK Wrath', 'Malefic Truth Dragon', 'When a Malefic monster is destroyed, Malefic Truth Dragon emerges with 5000 ATK and wipes opponent monsters.', 'paradox', 3,
          buildDeck(['Malefic Truth Dragon', 'Malefic Stardust Dragon', 'Malefic Cyber End Dragon', 'Malefic World', 'Terraforming', 'Torrential Tribute', 'Mirror Force'], { era: '5Ds' }, ['Stardust Dragon', 'Cyber End Dragon', 'Malefic Paradox Dragon'])
        ),
        makeDeckData('paradox_deck_4', 'Malefic Blue-Eyes & Red-Eyes Legacy', 'Malefic Dragons', 'Banishes Blue-Eyes White Dragon and Red-Eyes Black Dragon to field dark corrupted versions.', 'paradox', 4,
          buildDeck(['Malefic Blue-Eyes White Dragon', 'Malefic Red-Eyes Black Dragon', 'Blue-Eyes White Dragon', 'Red-Eyes Black Dragon', 'Malefic World', 'Terraforming', 'Trade-In', 'Cards of Consonance'], { era: '5Ds' }, ['Malefic Paradox Dragon', 'Stardust Dragon'])
        ),
        makeDeckData('paradox_deck_5', 'Malefic Rainbow Dragon Colossal Power', 'Malefic Rainbow', 'Banishes Rainbow Dragon from deck to summon Malefic Rainbow Dragon with 4000 ATK.', 'paradox', 5,
          buildDeck(['Malefic Rainbow Dragon', 'Rainbow Dragon', 'Malefic Stardust Dragon', 'Malefic World', 'Terraforming', 'Trade-In', 'Mirror Force', 'Solemn Judgment'], { era: '5Ds' }, ['Malefic Paradox Dragon', 'Stardust Dragon'])
        ),
        makeDeckData('paradox_deck_6', 'Malefic Claw Stream Destruction', 'Malefic Claw Stream', 'Destroys any target card on the field while controlling a Malefic monster.', 'paradox', 6,
          buildDeck(['Malefic Claw Stream', 'Malefic Stardust Dragon', 'Malefic Cyber End Dragon', 'Malefic World', 'Terraforming', 'Solemn Warning'], { era: '5Ds' }, ['Stardust Dragon', 'Cyber End Dragon', 'Malefic Paradox Dragon'])
        ),
        makeDeckData('paradox_deck_7', 'Skill Drain Malefic Unchained Might', 'Skill Drain Malefic', 'Activates Skill Drain so all Malefic monsters can attack freely without restrictions.', 'paradox', 7,
          buildDeck(['Skill Drain', 'Malefic Stardust Dragon', 'Malefic Cyber End Dragon', 'Malefic Rainbow Dragon', 'Malefic World', 'Terraforming', 'Rainbow Dragon'], { era: '5Ds' }, ['Stardust Dragon', 'Cyber End Dragon', 'Malefic Paradox Dragon'])
        ),
        makeDeckData('paradox_deck_8', 'Field Barrier Malefic World Lockdown', 'Field Barrier World', 'Field Barrier protects Malefic World from being destroyed, securing Malefic monster survival.', 'paradox', 8,
          buildDeck(['Field Barrier', 'Malefic World', 'Terraforming', 'Malefic Stardust Dragon', 'Malefic Cyber End Dragon', 'Solemn Judgment'], { era: '5Ds' }, ['Stardust Dragon', 'Cyber End Dragon', 'Malefic Paradox Dragon'])
        ),
        makeDeckData('paradox_deck_9', 'Malefic Parallel Gear Level 10 Accel', 'Parallel Gear Synchro', 'Uses Malefic Parallel Gear with in-hand Malefic Level 8 or 10 monsters to perform immediate Synchro summons.', 'paradox', 9,
          buildDeck(['Malefic Parallel Gear', 'Malefic Cyber End Dragon', 'Malefic Rainbow Dragon', 'Rainbow Dragon', 'Malefic World', 'Terraforming', 'Allure of Darkness'], { era: '5Ds' }, ['Malefic Paradox Dragon', 'Stardust Dragon'])
        ),
        makeDeckData('paradox_deck_10', "Paradox's Ultimate Timeline Overdrive", 'Master Malefic Distortion', 'Paradox’s supreme deck commanding Malefic Truth Dragon, Malefic Paradox Dragon, and 4000 ATK dragons.', 'paradox', 10,
          buildDeck(['Malefic Truth Dragon', 'Malefic Stardust Dragon', 'Malefic Cyber End Dragon', 'Malefic Rainbow Dragon', 'Malefic Blue-Eyes White Dragon', 'Malefic Parallel Gear', 'Malefic World', 'Terraforming', 'Skill Drain', 'Monster Reborn', 'Solemn Judgment'], { era: '5Ds' }, ['Malefic Paradox Dragon', 'Stardust Dragon', 'Cyber End Dragon'])
        ),
      ],
      signatureCards: [37115575, 8310162, 36521459],
    },

    // 18. Tetsu Trudge
    {
      id: 'tetsu-trudge',
      name: 'Tetsu Trudge',
      series: '5Ds',
      title: 'Sector Security Chief & High-Speed Law',
      tagline: 'Goyo Guardian & Sector Security Beatdown',
      description: 'The relentless Sector Security officer who chases lawbreakers on his police Duel Runner. Commands police pursuit monsters, Montage Dragon, and Goyo Guardian.',
      avatar: 'app-resource://characters/avatars/tetsu-trudge.png',
      portrait: 'app-resource://characters/portraits/tetsu-trudge.png',
      video: 'resources/videos/characters/tetsu-trudge.mp4',
      themeColor: '#1565c0',
      decks: [
        makeDeckData('trudge_deck_1', 'Goyo Guardian Security Patrol', 'Goyo Guardian Patrol', 'Summons the 2800 ATK Goyo Guardian to apprehend and take control of opponent monsters destroyed in battle.', 'tetsu-trudge', 1,
          buildDeck(['Jutte Fighter', 'Torapart', 'Handcuffs Dragon', 'Reinforcement of the Army', 'The Warrior Returning Alive', 'Dark Hole', 'Mirror Force', 'Solemn Judgment'], { race: 'Warrior', era: '5Ds' }, ['Goyo Guardian', 'Brionac, Dragon of the Ice Barrier', 'Stardust Dragon', 'Colossal Fighter'])
        ),
        makeDeckData('trudge_deck_2', 'Montage Dragon One-Turn Massive ATK', 'Montage Dragon Beat', 'Sends 3 high-level monsters from hand to Graveyard to summon Montage Dragon with thousands of ATK.', 'tetsu-trudge', 2,
          buildDeck(['Montage Dragon', 'Jutte Fighter', 'Cyber Dragon', 'Tragoedia', 'Gorz the Emissary of Darkness', 'Heavy Storm', 'Giant Trunade'], { era: '5Ds' }, ['Goyo Guardian', 'Stardust Dragon'])
        ),
        makeDeckData('trudge_deck_3', 'Torapart Defensive Piercing Assault', 'Torapart Synchro', 'Uses Torapart as Synchro material so the Synchro monster prevents opponent trap activations upon attacking.', 'tetsu-trudge', 3,
          buildDeck(['Torapart', 'Jutte Fighter', 'Handcuffs Dragon', 'Reinforcement of the Army', 'Solidarity', 'Mirror Force', 'Dimensional Prison'], { race: 'Warrior', era: '5Ds' }, ['Goyo Guardian', 'Colossal Fighter'])
        ),
        makeDeckData('trudge_deck_4', 'Stygian Security Underworld Crackdown', 'Stygian Security', 'Employs Stygian Street Patrol and Stygian Security to swarm and search during Sector Security raids.', 'tetsu-trudge', 4,
          buildDeck(['Stygian Street Patrol', 'Stygian Security', 'Stygian Dirge', 'Allure of Darkness', 'Foolish Burial', 'Mirror Force', 'Torrential Tribute'], { era: '5Ds' }, ['Stygian Sergeants', 'Goyo Guardian', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('trudge_deck_5', 'Gate Blocker Speed Spell Lockdown', 'Gate Blocker Defense', 'Gate Blocker halts Speed Counters and nullifies opponent Field Spell activations.', 'tetsu-trudge', 5,
          buildDeck(['Gate Blocker', 'Jutte Fighter', 'Torapart', 'Handcuffs Dragon', 'Compulsory Evacuation Device', 'Bottomless Trap Hole', 'Solemn Warning'], { era: '5Ds' }, ['Goyo Guardian', 'Stardust Dragon'])
        ),
        makeDeckData('trudge_deck_6', 'Handcuffs Dragon Retaliation Arrest', 'Handcuffs Arrest', 'When destroyed by an attacking monster, Handcuffs Dragon equips to that monster and drops its ATK by 1800.', 'tetsu-trudge', 6,
          buildDeck(['Handcuffs Dragon', 'Jutte Fighter', 'Torapart', 'Reinforcement of the Army', 'Waboku', 'Threatening Roar', 'Mirror Force'], { era: '5Ds' }, ['Goyo Guardian', 'Colossal Fighter'])
        ),
        makeDeckData('trudge_deck_7', 'Stygian Dirge Level Suppression', 'Stygian Dirge Lock', 'Stygian Dirge lowers all opponent monster levels by 1, completely crippling their Synchro plays.', 'tetsu-trudge', 7,
          buildDeck(['Stygian Dirge', 'Stygian Street Patrol', 'Stygian Security', 'Jutte Fighter', 'Dark Hole', 'Solemn Judgment'], { era: '5Ds' }, ['Stygian Sergeants', 'Goyo Guardian'])
        ),
        makeDeckData('trudge_deck_8', 'Solidarity Warrior Police Force', 'Solidarity Warrior', 'A pure Warrior deck leveraging Solidarity for permanent +800 ATK to all officers.', 'tetsu-trudge', 8,
          buildDeck(['Solidarity', 'Jutte Fighter', 'Torapart', 'Reinforcement of the Army', 'The Warrior Returning Alive', 'Mirror Force', 'Solemn Warning'], { race: 'Warrior', era: '5Ds' }, ['Goyo Guardian', 'Colossal Fighter'])
        ),
        makeDeckData('trudge_deck_9', 'Warrior Returning Alive Tactical Speed', 'Warrior Speed Retrieval', 'Recycles Jutte Fighter and Warrior tuners with The Warrior Returning Alive for continuous Synchro.', 'tetsu-trudge', 9,
          buildDeck(['Reinforcement of the Army', 'The Warrior Returning Alive', 'Jutte Fighter', 'Torapart', 'Montage Dragon', 'Pot of Avarice', 'Solemn Judgment'], { race: 'Warrior', era: '5Ds' }, ['Goyo Guardian', 'Stardust Dragon'])
        ),
        makeDeckData('trudge_deck_10', "Trudge's Ultimate Sector Security Chief", 'Master Police Enforcement', 'Trudge’s supreme deck commanding Goyo Guardian, Montage Dragon, and the full force of Sector Security.', 'tetsu-trudge', 10,
          buildDeck(['Montage Dragon', 'Jutte Fighter', 'Torapart', 'Handcuffs Dragon', 'Stygian Street Patrol', 'Stygian Security', 'Reinforcement of the Army', 'Monster Reborn', 'Mirror Force', 'Solemn Judgment'], { era: '5Ds' }, ['Goyo Guardian', 'Stygian Sergeants', 'Colossal Fighter', 'Stardust Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
      ],
      signatureCards: [7391448, 23303072, 60410769],
    },

    // 19. Sayer
    {
      id: 'sayer',
      name: 'Sayer',
      series: '5Ds',
      title: 'Arcadia Movement Leader & Psychic Commander',
      tagline: 'Thought Ruler Archfiend & Psychic Synchro Power',
      description: 'The cold, calculating founder of the Arcadia Movement. Wields psychic energy, Brain Research Lab, Magical Android, and Thought Ruler Archfiend.',
      avatar: 'app-resource://characters/avatars/sayer.png',
      portrait: 'app-resource://characters/portraits/sayer.png',
      video: 'resources/videos/characters/sayer.mp4',
      themeColor: '#8e24aa',
      decks: [
        makeDeckData('sayer_deck_1', 'Thought Ruler Archfiend LP Siphon', 'Thought Ruler Archfiend', 'Synchro summons Thought Ruler Archfiend to gain Life Points equal to destroyed monsters and negate targeting spells.', 'sayer', 1,
          buildDeck(['Krebons', 'Psychic Commander', 'Telekinetic Power Well', 'Emergency Teleport', 'Brain Research Lab', 'Dark Hole', 'Mirror Force', 'Solemn Judgment'], { race: 'Psychic', era: '5Ds' }, ['Thought Ruler Archfiend', 'Magical Android', 'Hyper Psychic Blaster', 'Brionac, Dragon of the Ice Barrier', 'Stardust Dragon'])
        ),
        makeDeckData('sayer_deck_2', 'Magical Android Life Stream', 'Magical Android', 'Summons Magical Android early to gain 600 Life Points for every Psychic monster on the field each End Phase.', 'sayer', 2,
          buildDeck(['Krebons', 'Psychic Commander', 'Emergency Teleport', 'Brain Research Lab', 'Telekinetic Power Well', 'Monster Reborn', 'Solemn Warning', 'Mirror Force'], { race: 'Psychic', era: '5Ds' }, ['Magical Android', 'Thought Ruler Archfiend', 'Stardust Dragon'])
        ),
        makeDeckData('sayer_deck_3', 'Hyper Psychic Blaster Piercing Force', 'Hyper Psychic Blaster', 'Unleashes Hyper Psychic Blaster with 3000 ATK, piercing defense damage, and massive LP gain.', 'sayer', 3,
          buildDeck(['Krebons', 'Psychic Commander', 'Emergency Teleport', 'Brain Research Lab', 'Telekinetic Power Well', 'Heavy Storm', 'Torrential Tribute'], { race: 'Psychic', era: '5Ds' }, ['Hyper Psychic Blaster', 'Thought Ruler Archfiend', 'Magical Android'])
        ),
        makeDeckData('sayer_deck_4', 'Krebons & Emergency Teleport Engine', 'Emergency Teleport Engine', 'Krebons pays 800 LP to negate attacks, while Emergency Teleport summons it instantly from deck.', 'sayer', 4,
          buildDeck(['Krebons', 'Emergency Teleport', 'Psychic Commander', 'Brain Research Lab', 'Allure of Darkness', 'Solemn Judgment', 'Mirror Force'], { race: 'Psychic', era: '5Ds' }, ['Thought Ruler Archfiend', 'Magical Android', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('sayer_deck_5', 'Brain Research Lab Psychic Overdrive', 'Brain Research Lab', 'Grants an extra Normal Summon of a Psychic monster per turn by placing psychic counters on the field spell.', 'sayer', 5,
          buildDeck(['Brain Research Lab', 'Terraforming', 'Telekinetic Charging Cell', 'Krebons', 'Psychic Commander', 'Emergency Teleport', 'Mirror Force'], { race: 'Psychic', era: '5Ds' }, ['Thought Ruler Archfiend', 'Hyper Psychic Blaster'])
        ),
        makeDeckData('sayer_deck_6', 'Telekinetic Power Well Multi-Revive', 'Telekinetic Power Well', 'Special summons any number of Level 2 or lower Psychic monsters from the GY for huge Synchro chains.', 'sayer', 6,
          buildDeck(['Telekinetic Power Well', 'Krebons', 'Psychic Commander', 'Emergency Teleport', 'Foolish Burial', 'Pot of Avarice', 'Dark Hole'], { race: 'Psychic', era: '5Ds' }, ['Thought Ruler Archfiend', 'Magical Android', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('sayer_deck_7', 'Telekinetic Charging Cell Free Activation', 'Charging Cell Free LP', 'Equips Telekinetic Charging Cell to negate all LP costs for Psychic monster effects.', 'sayer', 7,
          buildDeck(['Telekinetic Charging Cell', 'Psychic Commander', 'Krebons', 'Brain Research Lab', 'Emergency Teleport', 'Compulsory Evacuation Device'], { race: 'Psychic', era: '5Ds' }, ['Thought Ruler Archfiend', 'Magical Android'])
        ),
        makeDeckData('sayer_deck_8', 'Hyper Psychic Blaster Assault Mode', 'Hyper Psychic Assault', 'Activates Assault Mode Activate to summon the unstoppable 3500 ATK Hyper Psychic Blaster/Assault Mode.', 'sayer', 8,
          buildDeck(['Hyper Psychic Blaster/Assault Mode', 'Assault Mode Activate', 'Assault Beast', 'Krebons', 'Psychic Commander', 'Emergency Teleport', 'Brain Research Lab'], { race: 'Psychic', era: '5Ds' }, ['Hyper Psychic Blaster', 'Thought Ruler Archfiend', 'Magical Android'])
        ),
        makeDeckData('sayer_deck_9', 'Psychic Commander Battle Modulation', 'Psychic Commander Beat', 'Psychic Commander pays Life Points during damage calculation to drop opposing monster ATK by 500 per 100 LP.', 'sayer', 9,
          buildDeck(['Psychic Commander', 'Krebons', 'Emergency Teleport', 'Brain Research Lab', 'Bottomless Trap Hole', 'Dimensional Prison', 'Solemn Warning'], { race: 'Psychic', era: '5Ds' }, ['Thought Ruler Archfiend', 'Stardust Dragon'])
        ),
        makeDeckData('sayer_deck_10', "Sayer's Ultimate Arcadia Movement", 'Master Arcadia Psychic', 'Sayer’s supreme deck commanding Thought Ruler Archfiend, Hyper Psychic Blaster, and the Arcadia psychic syndicate.', 'sayer', 10,
          buildDeck(['Krebons', 'Psychic Commander', 'Emergency Teleport', 'Brain Research Lab', 'Telekinetic Power Well', 'Telekinetic Charging Cell', 'Monster Reborn', 'Pot of Avarice', 'Mirror Force', 'Solemn Judgment'], { race: 'Psychic', era: '5Ds' }, ['Thought Ruler Archfiend', 'Hyper Psychic Blaster', 'Magical Android', 'Brionac, Dragon of the Ice Barrier', 'Stardust Dragon'])
        ),
      ],
      signatureCards: [70780151, 43385557, 59575539],
    },

    // 20. Halldor
    {
      id: 'halldor',
      name: 'Halldor',
      series: '5Ds',
      title: 'Leader of Team Ragnarok & Odin Wielder',
      tagline: 'Odin, Father of the Aesir & Nordic Gods Trinity',
      description: 'The noble, god-chosen leader of Team Ragnarok who bears the Rune Eye. Commands the divine Aesir: Odin, Thor, and Loki.',
      avatar: 'app-resource://characters/avatars/halldor.png',
      portrait: 'app-resource://characters/portraits/halldor.png',
      video: 'resources/videos/characters/halldor.mp4',
      themeColor: '#0288d1',
      decks: [
        makeDeckData('halldor_deck_1', 'Odin Father of the Aesir Divine Might', 'Odin Aesir', 'Synchro summons Odin, Father of the Aesir with 4000 ATK and immunity to all spell and trap cards.', 'halldor', 1,
          buildDeck(['Valkyrie of the Nordic Ascendant', 'Vanadis of the Nordic Ascendant', 'Mimir of the Nordic Ascendant', 'Nordic Relic Gungnir', 'Nordic Relic Draupnir', 'The Nordic Lights', 'Dark Hole', 'Solemn Judgment'], { era: '5Ds' }, ['Odin, Father of the Aesir', 'Thor, Lord of the Aesir', 'Loki, Lord of the Aesir', 'Stardust Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('halldor_deck_2', 'Thor Lord of the Aesir Thunder Hammer', 'Thor Aesir', 'Synchro summons Thor, Lord of the Aesir with 3500 ATK to negate all opposing face-up monster effects.', 'halldor', 2,
          buildDeck(['Tanngrisnir of the Nordic Beasts', 'Tanngnjostr of the Nordic Beasts', 'Guldfaxe of the Nordic Beasts', 'Garmr of the Nordic Beasts', 'Nordic Relic Gungnir', 'Torrential Tribute', 'Mirror Force'], { era: '5Ds' }, ['Thor, Lord of the Aesir', 'Odin, Father of the Aesir', 'Stardust Dragon'])
        ),
        makeDeckData('halldor_deck_3', 'Loki Lord of the Aesir Trickster Magic', 'Loki Aesir', 'Synchro summons Loki, Lord of the Aesir with 3300 ATK to negate spell and trap cards activated during battle.', 'halldor', 3,
          buildDeck(['Mara of the Nordic Alfar', 'Svartalf of the Nordic Alfar', 'Ljosalf of the Nordic Alfar', 'Dverg of the Nordic Alfar', 'Nordic Relic Brisingamen', 'Nordic Relic Laevateinn', 'Solemn Warning'], { era: '5Ds' }, ['Loki, Lord of the Aesir', 'Odin, Father of the Aesir'])
        ),
        makeDeckData('halldor_deck_4', 'Nordic Ascendant Valkyrie Instant Synchro', 'Valkyrie Ascendant', 'Banishes 2 Nordic monsters from hand when opponent controls a monster to summon 2 Einherjar Tokens for instant Odin.', 'halldor', 4,
          buildDeck(['Valkyrie of the Nordic Ascendant', 'Vanadis of the Nordic Ascendant', 'Mimir of the Nordic Ascendant', 'Nordic Relic Gungnir', 'Nordic Relic Draupnir', 'One for One', 'Monster Reborn'], { era: '5Ds' }, ['Odin, Father of the Aesir', 'Thor, Lord of the Aesir'])
        ),
        makeDeckData('halldor_deck_5', 'Nordic Beasts Tanngrisnir Swarm Engine', 'Nordic Beasts Swarm', 'Generates 2 Nordic Beast Tokens when destroyed by battle, instantly setting up Thor or Odin.', 'halldor', 5,
          buildDeck(['Tanngrisnir of the Nordic Beasts', 'Tanngnjostr of the Nordic Beasts', 'Guldfaxe of the Nordic Beasts', 'Nordic Relic Gungnir', 'Torrential Tribute', 'Mirror Force'], { era: '5Ds' }, ['Thor, Lord of the Aesir', 'Odin, Father of the Aesir', 'Brionac, Dragon of the Ice Barrier'])
        ),
        makeDeckData('halldor_deck_6', 'Nordic Alfar Mara Hand Synchro Ambush', 'Nordic Alfar Hand Synchro', 'Mara of the Nordic Alfar uses 2 non-Tuner Nordic monsters from hand as Synchro material for instant Aesir.', 'halldor', 6,
          buildDeck(['Mara of the Nordic Alfar', 'Svartalf of the Nordic Alfar', 'Ljosalf of the Nordic Alfar', 'Dverg of the Nordic Alfar', 'The Nordic Lights', 'Dark Hole', 'Solemn Judgment'], { era: '5Ds' }, ['Loki, Lord of the Aesir', 'Odin, Father of the Aesir'])
        ),
        makeDeckData('halldor_deck_7', 'Nordic Relic Gungnir Godly Arsenal', 'Nordic Relic Arsenal', 'Banishes an Aesir or Nordic monster to destroy any card on the field with Nordic Relic Gungnir.', 'halldor', 7,
          buildDeck(['Nordic Relic Gungnir', 'Nordic Relic Draupnir', 'Nordic Relic Brisingamen', 'Vanadis of the Nordic Ascendant', 'Valkyrie of the Nordic Ascendant', 'Tanngrisnir of the Nordic Beasts', 'Solemn Warning'], { era: '5Ds' }, ['Odin, Father of the Aesir', 'Thor, Lord of the Aesir', 'Loki, Lord of the Aesir'])
        ),
        makeDeckData('halldor_deck_8', 'Vanadis Universal Wildcard Synchro', 'Vanadis Wildcard', 'Vanadis can substitute for any Nordic Tuner and sends a Nordic monster to GY to copy its level.', 'halldor', 8,
          buildDeck(['Vanadis of the Nordic Ascendant', 'Valkyrie of the Nordic Ascendant', 'Tanngrisnir of the Nordic Beasts', 'Foolish Burial', 'Monster Reborn', 'Pot of Avarice', 'Mirror Force'], { era: '5Ds' }, ['Odin, Father of the Aesir', 'Thor, Lord of the Aesir', 'Loki, Lord of the Aesir', 'Stardust Dragon'])
        ),
        makeDeckData('halldor_deck_9', 'The Nordic Lights Sanctuary Bastion', 'The Nordic Lights', 'The Nordic Lights prevents Nordic monsters from being destroyed by battle while on the field.', 'halldor', 9,
          buildDeck(['The Nordic Lights', 'Terraforming', 'Valkyrie of the Nordic Ascendant', 'Tanngrisnir of the Nordic Beasts', 'Nordic Relic Gungnir', 'Solemn Judgment', 'Bottomless Trap Hole'], { era: '5Ds' }, ['Odin, Father of the Aesir', 'Thor, Lord of the Aesir'])
        ),
        makeDeckData('halldor_deck_10', "Halldor's Ultimate Team Ragnarok Aesir Trinity", 'Master Aesir Trinity', 'Halldor’s supreme deck commanding all 3 divine Aesir: Odin, Thor, and Loki together on the battlefield.', 'halldor', 10,
          buildDeck(['Vanadis of the Nordic Ascendant', 'Valkyrie of the Nordic Ascendant', 'Tanngrisnir of the Nordic Beasts', 'Tanngnjostr of the Nordic Beasts', 'Guldfaxe of the Nordic Beasts', 'Mara of the Nordic Alfar', 'Nordic Relic Gungnir', 'Nordic Relic Draupnir', 'The Nordic Lights', 'Monster Reborn', 'Mirror Force', 'Solemn Judgment'], { era: '5Ds' }, ['Odin, Father of the Aesir', 'Thor, Lord of the Aesir', 'Loki, Lord of the Aesir', 'Stardust Dragon', 'Brionac, Dragon of the Ice Barrier'])
        ),
      ],
      signatureCards: [93483212, 30604579, 67098114],
    },
  ];
}

function makeDeckData(
  id: string,
  name: string,
  archetype: string,
  description: string,
  charId: string,
  index: number,
  deckObj: { main: number[]; extra: number[]; signature: number[] },
): CharacterDeckData {
  return {
    id,
    name,
    archetype,
    description,
    ydkPath: `resources/decks/${charId}_deck_${index}.ydk`,
    mainCards: deckObj.main,
    extraCards: deckObj.extra,
    signatureCardIds: deckObj.signature,
  };
}
