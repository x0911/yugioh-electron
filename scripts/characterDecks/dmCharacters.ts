import { buildDeck } from '../deckGenHelper.js';
import type { CharacterData, CharacterDeckData } from '../../src/shared/types/character.js';

export function getDmCharacters(): CharacterData[] {
  return [
    // 1. Yugi Muto
    {
      id: 'yugi-muto',
      name: 'Yugi Muto',
      series: 'DM',
      title: 'King of Games',
      tagline: 'Heart of the Cards & Master Tactician',
      description: 'A kind-hearted high school student who solved the ancient Millennium Puzzle. Yugi trusts completely in the Heart of the Cards and uses clever defensive and toolbox combos.',
      avatar: 'resources/characters/portraits/yugi-muto.png',
      video: 'resources/videos/characters/yugi-muto.mp4',
      themeColor: '#c9a227',
      decks: [
        makeDeckData('yugi_deck_1', 'Magnet & Gadget Arsenal', 'Magnet Warriors / Gadgets', 'Combines the magnetic force of Alpha, Beta, and Gamma with mechanical Gadget draw engines.', 'yugi-muto', 1,
          buildDeck(['Alpha The Magnet Warrior', 'Beta The Magnet Warrior', 'Gamma The Magnet Warrior', 'Valkyrion the Magna Warrior', 'Red Gadget', 'Green Gadget', 'Yellow Gadget', 'Stronghold the Moving Fortress', 'Blockman', 'Sangan', 'Marshmallon', 'Swords of Revealing Light', 'Card Destruction', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Call of the Haunted'], { race: 'Rock', era: 'DM' })
        ),
        makeDeckData('yugi_deck_2', 'Silent Swordsman Level-Up', 'Silent LV Series / Spellcasters', 'Patience and defensive fortresses power up the Silent Swordsman and Skilled Magicians.', 'yugi-muto', 2,
          buildDeck(['Silent Swordsman LV3', 'Silent Swordsman LV5', 'Silent Swordsman LV7', 'Skilled White Magician', 'Buster Blader', 'Silent Paladin', 'Level Up!', 'Level Modulation', 'Marshmallon', 'Swords of Revealing Light', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'DM' })
        ),
        makeDeckData('yugi_deck_3', 'Gandora Dragon of Destruction', 'Destruction & Toolbox', 'Unleashes Gandora the Dragon of Destruction to banish all cards and clear the arena.', 'yugi-muto', 3,
          buildDeck(['Gandora the Dragon of Destruction', 'Morphing Jar', 'Sangan', 'Witch of the Black Forest', 'Cyber Jar', 'Big Shield Gardna', 'Marshmallon', 'Card Destruction', 'Heavy Storm', 'Raigeki', 'Dark Hole', 'Monster Reborn', 'Pot of Greed', 'Graceful Charity', 'Torrential Tribute', 'Mirror Force'], { race: 'Dragon', era: 'DM' })
        ),
        makeDeckData('yugi_deck_4', 'Silent Magician Spellbook', 'Silent Magician / Spellcasters', 'Harnesses raw magical power as Silent Magician grows with each drawn spell.', 'yugi-muto', 4,
          buildDeck(['Silent Magician LV4', 'Silent Magician LV8', 'Skilled Dark Magician', 'Apprentice Magician', 'Old Vindictive Magician', 'Magical Dimension', 'Spell Absorption', 'Level Up!', 'Level Modulation', 'Pot of Greed', 'Graceful Charity', 'Swords of Revealing Light'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('yugi_deck_5', 'Electromagnetic Magna Overlord', 'Magnet Warriors', 'Assembles the electromagnetic warriors to summon the mighty Magna Warriors.', 'yugi-muto', 5,
          buildDeck(['Alpha The Magnet Warrior', 'Beta The Magnet Warrior', 'Gamma The Magnet Warrior', 'Valkyrion the Magna Warrior', 'Berserkion the Electromagna Warrior', 'Alpha The Electromagnet Warrior', 'Beta The Electromagnet Warrior', 'Gamma The Electromagnet Warrior', 'Magnetic Field', 'Magnet Reverse', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Rock', era: 'DM' })
        ),
        makeDeckData('yugi_deck_6', 'Royal Poker Knights', 'King, Queen & Jack Knights', 'Summons the Court Cards in royal formation to summon Arcana Knight Joker.', 'yugi-muto', 6,
          buildDeck(["King's Knight", "Queen's Knight", "Jack's Knight", 'Arcana Triumph Joker', 'Joker\'s Straight', 'Joker\'s Wild', 'Polymerization', 'Reinforcement of the Army', 'Pot of Greed', 'Graceful Charity', 'Mirror Force'], { race: 'Warrior', era: 'DM' }, ['Arcana Knight Joker'])
        ),
        makeDeckData('yugi_deck_7', 'Toy Box & Block Defenders', 'Earth Machine & Rock', 'Playful toy soldiers and sturdy block sentinels stall the enemy for devastating counterattacks.', 'yugi-muto', 7,
          buildDeck(['Toy Soldier', 'Toy Magician', 'Blockman', 'Block Golem', 'Giant Soldier of Stone', 'Morphing Jar', 'Swords of Revealing Light', 'Scapegoat', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { attribute: 'EARTH', era: 'DM' })
        ),
        makeDeckData('yugi_deck_8', 'Golden Castle of Stromberg', 'Fairy Tale & Level Up', 'Special summons mystical fable monsters from the Golden Castle of Stromberg.', 'yugi-muto', 8,
          buildDeck(['Golden Castle of Stromberg', 'Hexe Trude', 'Glife the Phantom Bird', 'Prinzessin', 'Pumpkin Carriage', 'Iron Hans', 'Iron Knight', 'Pot of Greed', 'Graceful Charity', 'Terraforming', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('yugi_deck_9', 'Marshmallon Defense Stall', 'Defense & Burn', 'An impenetrable wall of cute indestructible defenders chipping down the foe.', 'yugi-muto', 9,
          buildDeck(['Marshmallon', 'Marshmallon Glasses', 'Big Shield Gardna', 'Spirit Reaper', 'Gellenduo', 'Solar Flare Dragon', 'Wave-Motion Cannon', 'Swords of Revealing Light', 'Level Limit - Area B', 'Gravity Bind', 'Secret Barrel', 'Just Desserts', 'Pot of Greed', 'Graceful Charity'], { type: 'Monster', era: 'DM' })
        ),
        makeDeckData('yugi_deck_10', 'Ceremonial Duel Farewell', 'Final Duel Masterpiece', 'Yugi\'s ultimate deck combining Silent LV champions, Gadgets, and the supreme Gandora.', 'yugi-muto', 10,
          buildDeck(['Silent Swordsman LV7', 'Silent Magician LV8', 'Gandora the Dragon of Destruction', 'Valkyrion the Magna Warrior', 'Red Gadget', 'Green Gadget', 'Yellow Gadget', 'Marshmallon', 'Blockman', 'Swords of Revealing Light', 'Card Destruction', 'Monster Reborn', 'Pot of Greed', 'Graceful Charity', 'Mirror Force'], { era: 'DM' })
        ),
      ],
    },

    // 2. Yami Yugi (Atem)
    {
      id: 'yami-yugi',
      name: 'Yami Yugi',
      series: 'DM',
      title: 'Pharaoh of the Millennium',
      tagline: 'Master of Dark Magic & The Egyptian Gods',
      description: 'The ancient Egyptian Pharaoh Atem. He commands the Ultimate Wizard Dark Magician, the Egyptian God Slifer the Sky Dragon, and legendary rituals.',
      avatar: 'resources/characters/portraits/yami-yugi.png',
      video: 'resources/videos/characters/yami-yugi.mp4',
      themeColor: '#e3c567',
      decks: [
        makeDeckData('yami_deck_1', 'Dark Magician Arcana', 'Dark Magician / Spellcasters', 'Commands the Ultimate Wizard in terms of attack and defense with powerful spell support.', 'yami-yugi', 1,
          buildDeck(['Dark Magician', 'Dark Magician Girl', 'Magician\'s Valkyria', 'Skilled Dark Magician', 'Buster Blader', 'Dark Magic Curtain', 'Thousand Knives', 'Dark Magic Attack', 'Eye of Timaeus', 'Magical Dimension', 'Polymerization', 'Monster Reborn', 'Pot of Greed', 'Graceful Charity', 'Mirror Force', 'Magician\'s Circle'], { race: 'Spellcaster', era: 'DM' }, ['Dark Paladin', 'Dark Magician Girl the Dragon Knight', 'Dark Magician the Dragon Knight'])
        ),
        makeDeckData('yami_deck_2', 'Slifer the Sky Dragon Descent', 'Egyptian God / Slifer Turbo', 'Gathers three tributes and accumulates card advantage to power up Slifer the Sky Dragon.', 'yami-yugi', 2,
          buildDeck(['Slifer the Sky Dragon', 'Dark Magician', 'Dark Magician Girl', 'Big Shield Gardna', 'Watapon', 'Kuriboh', 'Multiply', 'Card of Safe Return', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Premature Burial', 'Call of the Haunted', 'Swords of Revealing Light', 'Mirror Force'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('yami_deck_3', 'Black Luster & Ritual Chaos', 'Chaos & Ritual Masters', 'Awakens the legendary soldier Black Luster Soldier and Magician of Black Chaos.', 'yami-yugi', 3,
          buildDeck(['Black Luster Soldier', 'Black Luster Ritual', 'Magician of Black Chaos', 'Black Magic Ritual', 'Dark Magician', 'Gaia The Fierce Knight', 'Curse of Dragon', 'Polymerization', 'Sonic Bird', 'Senju of the Thousand Hands', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'DM' }, ['Gaia the Dragon Champion'])
        ),
        makeDeckData('yami_deck_4', 'Legendary Dragons & Hermos', 'Legendary Dragons & Fusion', 'Unites the Three Legendary Dragons: Timaeus, Critias, and Hermos with royal knights.', 'yami-yugi', 4,
          buildDeck(['Dark Magician', 'Dark Magician Girl', 'Buster Blader', 'The Eye of Timaeus', 'The Fang of Critias', 'The Claw of Hermos', 'Mirror Force Dragon', 'Red-Eyes Black Dragon Sword', 'Time Magic Hammer', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Mirror Force', 'Ring of Destruction', 'Torrential Tribute'], { era: 'DM' }, ['Dark Paladin', 'Dark Magician the Dragon Knight', 'Mirror Force Dragon', 'Red-Eyes Black Dragon Sword', 'Time Magic Hammer'])
        ),
        makeDeckData('yami_deck_5', 'Dark Paladin Dragon Slayer', 'Dark Paladin Fusion', 'Combines Buster Blader and Dark Magician into the ultimate Dragon-slaying paladin.', 'yami-yugi', 5,
          buildDeck(['Dark Magician', 'Buster Blader', 'King of the Swamp', 'Skilled Dark Magician', 'Skilled White Magician', 'Polymerization', 'Fusion Sage', 'Emblem of Dragon Destroyer', 'Dark Magic Attack', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Spellcaster', era: 'DM' }, ['Dark Paladin'])
        ),
        makeDeckData('yami_deck_6', 'Chimera Mythical Phantom Beast', 'Beast & Fusion Illusion', 'Fuses Gazelle the King of Mythical Beasts and Berfomet into Chimera.', 'yami-yugi', 6,
          buildDeck(['Gazelle the King of Mythical Beasts', 'Berfomet', 'Phantom Beast Cross-Wing', 'Phantom Beast Wild-Horn', 'Polymerization', 'Fusion Recovery', 'Monster Reborn', 'Pot of Greed', 'Graceful Charity', 'Mirror Force'], { race: 'Beast', era: 'DM' }, ['Chimera the Flying Mythical Beast'])
        ),
        makeDeckData('yami_deck_7', 'Kuriboh Brothers Defense', 'Kuriboh Swarm & Stall', 'The furry guardian Kuriboh multiplies into an impenetrable defensive shield.', 'yami-yugi', 7,
          buildDeck(['Kuriboh', 'Kuribabylon', 'Winged Kuriboh', 'Multiply', 'Flute of Summoning Kuriboh', 'Transcendent Wings', 'Morphing Jar', 'Swords of Revealing Light', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fiend', era: 'DM' }, ['Winged Kuriboh LV10'])
        ),
        makeDeckData('yami_deck_8', 'Buster Blader Destruction Sword', 'Dragon Slayer Beatdown', 'Equips Buster Blader with dragon-destroying swords to lock down monster effects.', 'yami-yugi', 8,
          buildDeck(['Buster Blader', 'Buster Blader, the Destruction Swordmaster', 'Dragon Buster Blade', 'Wizard Buster Blade', 'Robot Buster Blade', 'Emblem of Dragon Destroyer', 'Destruction Swordsman Fusion', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Warrior', era: 'DM' }, ['Buster Blader, the Dragon Destroyer Swordsman'])
        ),
        makeDeckData('yami_deck_9', 'Spellcaster Circle & Magician Girls', 'Spellcaster Swarm', 'Summons Magician Girls in tandem with Magician\'s Circle to overwhelm the opponent.', 'yami-yugi', 9,
          buildDeck(['Dark Magician Girl', 'Magician\'s Valkyria', 'Apprentice Magician', 'Old Vindictive Magician', 'Dark Magician', 'Magician\'s Circle', 'Secret Village of the Spellcasters', 'Magical Dimension', 'Pot of Greed', 'Graceful Charity', 'Mirror Force'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('yami_deck_10', 'Pharaoh\'s Golden Divine Wrath', 'Egyptian Gods Tri-Force', 'The ultimate divine manifestation commanding Slifer, Obelisk, and Ra in unity.', 'yami-yugi', 10,
          buildDeck(['Slifer the Sky Dragon', 'Obelisk the Tormentor', 'The Winged Dragon of Ra', 'Dark Magician', 'Dark Magician Girl', 'Big Shield Gardna', 'Marshmallon', 'Card of Safe Return', 'Monster Reborn', 'Pot of Greed', 'Graceful Charity', 'Swords of Revealing Light', 'Mirror Force'], { era: 'DM' }, ['Holactie the Creator of Light'])
        ),
      ],
    },

    // 3. Seto Kaiba
    {
      id: 'seto-kaiba',
      name: 'Seto Kaiba',
      series: 'DM',
      title: 'CEO of KaibaCorp',
      tagline: 'Unstoppable Power & High-Tech Domination',
      description: 'The president of KaibaCorp and master of Blue-Eyes White Dragon. Kaiba believes in overwhelming strength, crushing virus traps, and futuristic machine unions.',
      avatar: 'resources/characters/portraits/seto-kaiba.png',
      video: 'resources/videos/characters/seto-kaiba.mp4',
      themeColor: '#2f80ed',
      decks: [
        makeDeckData('kaiba_deck_1', 'Blue-Eyes Dragon Reign', 'Blue-Eyes White Dragon / Beatdown', 'Overwhelms the opponent with unstoppable 3000 ATK Blue-Eyes dragons and KaibaCorp technology.', 'seto-kaiba', 1,
          buildDeck(['Blue-Eyes White Dragon', 'Blue-Eyes Shining Dragon', 'Kaibaman', 'Lord of D.', 'The Flute of Summoning Dragon', 'Burst Stream of Destruction', 'King of the Swamp', 'Polymerization', 'Dragon\'s Mirror', 'Trade-In', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Ring of Destruction', 'Crush Card Virus'], { race: 'Dragon', era: 'DM' }, ['Blue-Eyes Ultimate Dragon', 'Dragon Master Knight', 'Neo Blue-Eyes Ultimate Dragon'])
        ),
        makeDeckData('kaiba_deck_2', 'XYZ Dragon Cannon Union', 'Union Machines / Cannon', 'Combines X-Head Cannon, Y-Dragon Head, and Z-Metal Tank into the XYZ Dragon Cannon.', 'seto-kaiba', 2,
          buildDeck(['X-Head Cannon', 'Y-Dragon Head', 'Z-Metal Tank', 'V-Tiger Jet', 'W-Wing Catapult', 'Heavy Mech Support Platform', 'Frontline Base', 'Limiter Removal', 'Roll Out!', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'DM' }, ['XYZ-Dragon Cannon', 'XY-Dragon Cannon', 'XZ-Tank Cannon', 'YZ-Tank Dragon', 'VWXYZ-Dragon Catapult Cannon'])
        ),
        makeDeckData('kaiba_deck_3', 'Obelisk the Tormentor Dominion', 'Egyptian God / High-Power Beatdown', 'Sacrifices two monsters to unleash the infinite Soul Energy MAX of Obelisk the Tormentor.', 'seto-kaiba', 3,
          buildDeck(['Obelisk the Tormentor', 'Blue-Eyes White Dragon', 'Vorse Raider', 'Blade Knight', 'Spear Dragon', 'Kaiser Sea Horse', 'Soul Exchange', 'Cost Down', 'Shrink', 'Enemy Controller', 'Crush Card Virus', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Ring of Destruction'], { race: 'Dragon', era: 'DM' })
        ),
        makeDeckData('kaiba_deck_4', 'Blue-Eyes Chaos MAX Ritual', 'Chaos Ritual Beatdown', 'Summons the impenetrable 4000 ATK Blue-Eyes Chaos MAX Dragon with double piercing damage.', 'seto-kaiba', 4,
          buildDeck(['Blue-Eyes Chaos MAX Dragon', 'Chaos Form', 'Blue-Eyes White Dragon', 'Manju of the Ten Thousand Hands', 'Sonic Bird', 'Senju of the Thousand Hands', 'The Melody of Awakening Dragon', 'Trade-In', 'Cards of Consonance', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dragon', era: 'DM' })
        ),
        makeDeckData('kaiba_deck_5', 'Crush Card Virus & Control', 'Dark / Virus Control', 'Infects the opponent\'s deck with devastating virus traps while Vorse Raider strikes.', 'seto-kaiba', 5,
          buildDeck(['Vorse Raider', 'La Jinn the Mystical Genie of the Lamp', 'Dark Blade', 'Sangan', 'Witch of the Black Forest', 'Crush Card Virus', 'Deck Devastation Virus', 'Eradicator Epidemic Virus', 'Enemy Controller', 'Shrink', 'Ring of Destruction', 'Pot of Greed', 'Graceful Charity'], { attribute: 'DARK', era: 'DM' })
        ),
        makeDeckData('kaiba_deck_6', 'Dragon Master Knight Colossus', 'Dragon & Warrior Ultimate Fusion', 'Fuses Blue-Eyes Ultimate Dragon and Black Luster Soldier into Dragon Master Knight.', 'seto-kaiba', 6,
          buildDeck(['Blue-Eyes White Dragon', 'Black Luster Soldier', 'King of the Swamp', 'Polymerization', 'Dragon\'s Mirror', 'Fusion Sage', 'The Flute of Summoning Dragon', 'Lord of D.', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dragon', era: 'DM' }, ['Blue-Eyes Ultimate Dragon', 'Dragon Master Knight'])
        ),
        makeDeckData('kaiba_deck_7', 'Battle City Power Beatdown', 'Warrior & Dragon Aggro', 'Kaiba\'s classic tournament deck featuring Vorse Raider, Spear Dragon, and Enemy Controller.', 'seto-kaiba', 7,
          buildDeck(['Vorse Raider', 'Spear Dragon', 'Blade Knight', 'Kaiser Sea Horse', 'Blue-Eyes White Dragon', 'Enemy Controller', 'Shrink', 'Shadow Spell', 'Crush Card Virus', 'Ring of Destruction', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'DM' })
        ),
        makeDeckData('kaiba_deck_8', 'White Stone & Eyes of Blue', 'Dragon Synchro / Support Engine', 'Uses Maiden and Sage with Eyes of Blue to repeatedly summon Blue-Eyes from the deck.', 'seto-kaiba', 8,
          buildDeck(['Blue-Eyes White Dragon', 'The White Stone of Legend', 'The White Stone of Ancients', 'Maiden with Eyes of Blue', 'Sage with Eyes of Blue', 'Dragon Shrine', 'Silver\'s Cry', 'Return of the Dragon Lords', 'Cards of Consonance', 'Trade-In', 'Pot of Greed', 'Graceful Charity'], { race: 'Dragon', era: 'DM' }, ['Blue-Eyes Twin Burst Dragon', 'Blue-Eyes Ultimate Dragon'])
        ),
        makeDeckData('kaiba_deck_9', 'Neo Blue-Eyes Supremacy', 'Triple Attack Fusion Turbo', 'Rushes out Neo Blue-Eyes Ultimate Dragon to attack three times in a single turn.', 'seto-kaiba', 9,
          buildDeck(['Blue-Eyes White Dragon', 'The White Stone of Legend', 'King of the Swamp', 'Polymerization', 'Dragon\'s Mirror', 'The Melody of Awakening Dragon', 'Burst Stream of Destruction', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dragon', era: 'DM' }, ['Neo Blue-Eyes Ultimate Dragon', 'Blue-Eyes Ultimate Dragon', 'Blue-Eyes Twin Burst Dragon'])
        ),
        makeDeckData('kaiba_deck_10', 'KaibaCorp Cyber Technology', 'Machine & Dragon Cyber Arsenal', 'High-tech KaibaCorp prototype machines backed by heavy artillery and dragons.', 'seto-kaiba', 10,
          buildDeck(['Cyber-Stein', 'X-Head Cannon', 'Y-Dragon Head', 'Z-Metal Tank', 'Blue-Eyes White Dragon', 'Megamorph', 'Limiter Removal', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' }, ['Blue-Eyes Ultimate Dragon', 'XYZ-Dragon Cannon'])
        ),
      ],
    },

    // 4. Joey Wheeler
    {
      id: 'joey-wheeler',
      name: 'Joey Wheeler',
      series: 'DM',
      title: 'The Underdog Duelist',
      tagline: 'Guts, Luck & Fiery Red-Eyes Spirit',
      description: 'A street-smart duelist with unyielding courage. Joey wins through daring gambles, coin-flip turnarounds, and his legendary Red-Eyes Black Dragon.',
      avatar: 'resources/characters/portraits/joey-wheeler.png',
      video: 'resources/videos/characters/joey-wheeler.mp4',
      themeColor: '#eb5757',
      decks: [
        makeDeckData('joey_deck_1', 'Red-Eyes & Hermos Dragon Power', 'Red-Eyes / Dragon / Warrior', 'Ignites the dueling spirit with Red-Eyes Black Dragon, Gearfried, and The Claw of Hermos.', 'joey-wheeler', 1,
          buildDeck(['Red-Eyes B. Dragon', 'Gearfried the Iron Knight', 'Gilford the Lightning', 'Jinzo', 'Time Wizard', 'Baby Dragon', 'The Claw of Hermos', 'Red-Eyes Black Dragon Sword', 'Rocket Hermos Cannon', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Scapegoat', 'Graceful Dice', 'Skull Dice', 'Bottomless Trap Hole'], { race: 'Warrior', era: 'DM' }, ['Thousand Dragon', 'Red-Eyes Black Dragon Sword', 'Rocket Hermos Cannon', 'Flame Swordsman', 'Alligator\'s Sword Dragon'])
        ),
        makeDeckData('joey_deck_2', 'Gamble & Fortune Luck', 'Dice / Coin Flip / Luck', 'Embraces high-risk, high-reward luck cards like Roulette Spider and Time Wizard.', 'joey-wheeler', 2,
          buildDeck(['Time Wizard', 'Snipe Hunter', 'Gamble', 'Graceful Dice', 'Skull Dice', 'Cup of Ace', 'Fairy Box', 'Roulette Spider', 'Dangerous Machine Type-6', 'Blind Destruction', 'Dicephoon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('joey_deck_3', 'Gilford & Warrior Battleguards', 'Warrior Tribute Beatdown', 'Marshals mighty warriors and Battleguards to tribute summon Gilford the Lightning.', 'joey-wheeler', 3,
          buildDeck(['Gilford the Lightning', 'Gearfried the Iron Knight', 'Swamp Battleguard', 'Lava Battleguard', 'Goblin Attack Force', 'Marauding Captain', 'Command Knight', 'Reinforcement of the Army', 'The Warrior Returning Alive', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'DM' })
        ),
        makeDeckData('joey_deck_4', 'Gearfried & Swords of Iron', 'Equip & Gearfried Engine', 'Equips Gearfried with powerful swords to trigger destruction and awaken Gearfried the Swordmaster.', 'joey-wheeler', 4,
          buildDeck(['Gearfried the Iron Knight', 'Gearfried the Swordmaster', 'Release Restraint', 'Iron Blacksmith Kotetsu', 'United We Stand', 'Mage Power', 'Axe of Despair', 'Premature Burial', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Warrior', era: 'DM' })
        ),
        makeDeckData('joey_deck_5', 'Jinzo Trap Annihilation', 'Machine Trap Lockdown', 'Deploys Jinzo to completely nullify all opponent Trap Cards on the field.', 'joey-wheeler', 5,
          buildDeck(['Jinzo', 'Jinzo - Returner', 'Jinzo - Lord', 'Amplifier', 'Cyber Energy Shock', 'Heavy Storm', 'Mystical Space Typhoon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Premature Burial', 'Call of the Haunted'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('joey_deck_6', 'Landstars & Warrior Legion', 'Warrior Swarm & Support', 'Brigade of Landstar warriors boosted by Command Knight and field power.', 'joey-wheeler', 6,
          buildDeck(['Swordsman of Landstar', 'Brigadier of Landstar', 'Command Knight', 'Marauding Captain', 'Goblin Attack Force', 'United We Stand', 'Reinforcement of the Army', 'Pot of Greed', 'Graceful Charity', 'Mirror Force'], { race: 'Warrior', era: 'DM' })
        ),
        makeDeckData('joey_deck_7', 'Flame Swordsman Classic Fusion', 'Warrior Fusion', 'Fuses Flame Manipulator and Masaki the Legendary Swordsman into Flame Swordsman.', 'joey-wheeler', 7,
          buildDeck(['Flame Manipulator', 'Masaki the Legendary Swordsman', 'Baby Dragon', 'Alligator\'s Sword', 'Polymerization', 'Fusion Sage', 'Salamandra', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'DM' }, ['Flame Swordsman', 'Alligator\'s Sword Dragon', 'Thousand Dragon'])
        ),
        makeDeckData('joey_deck_8', 'Red-Eyes Darkness Metal Dragon', 'Dragon Roar Turbo', 'Unleashes Red-Eyes Darkness Metal Dragon to revive dragons every turn.', 'joey-wheeler', 8,
          buildDeck(['Red-Eyes Darkness Metal Dragon', 'Red-Eyes B. Dragon', 'Red-Eyes Wyvern', 'Black Metal Dragon', 'Dragon Shrine', 'Cards of Red Stone', 'Return of the Red-Eyes', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dragon', era: 'DM' }, ['Meteor Black Dragon', 'Black Skull Dragon'])
        ),
        makeDeckData('joey_deck_9', 'Alligator & Beast Warrior Rush', 'Beast-Warrior Beatdown', 'Fast aggression with Alligator\'s Sword, Panther Warrior, and Scapegoat tokens.', 'joey-wheeler', 9,
          buildDeck(['Panther Warrior', 'Alligator\'s Sword', 'Baby Dragon', 'Scapegoat', 'Stray Lambs', 'Wild Nature\'s Release', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' }, ['Alligator\'s Sword Dragon'])
        ),
        makeDeckData('joey_deck_10', 'Joey\'s Ultimate Friendship Bonds', 'Anime Tribute Masterpiece', 'Joey\'s grand tournament deck with Red-Eyes, Gilford, Jinzo, and Time Wizard.', 'joey-wheeler', 10,
          buildDeck(['Red-Eyes B. Dragon', 'Gilford the Lightning', 'Jinzo', 'Gearfried the Iron Knight', 'Time Wizard', 'Baby Dragon', 'Scapegoat', 'Graceful Dice', 'Skull Dice', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' }, ['Thousand Dragon', 'Flame Swordsman'])
        ),
      ],
    },

    // 5. Téa Gardner
    {
      id: 'tea-gardner',
      name: 'Téa Gardner',
      series: 'DM',
      title: 'Heartwarming Spirit',
      tagline: 'Life Point Recovery & Fairy Radiance',
      description: 'The moral compass of the gang. Téa heals life points and commands radiant Fairies and Magician Girls with cheerful determination.',
      avatar: 'resources/characters/portraits/tea-gardner.png',
      video: 'resources/videos/characters/tea-gardner.mp4',
      themeColor: '#3ddc97',
      decks: [
        makeDeckData('tea_deck_1', 'Shining Friendship & Heal', 'Fairy / Life Point Recovery', 'Restores massive Life Points with Fairies while draining the opponent.', 'tea-gardner', 1,
          buildDeck(['Shining Friendship', 'Fire Princess', 'Marie the Fallen One', 'Nimble Momonga', 'Solemn Wishes', 'Dian Keto the Cure Maiden', 'Poison of the Old Man', 'Snatch Steal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Waboku'], { race: 'Fairy', era: 'DM' })
        ),
        makeDeckData('tea_deck_2', 'Magician Girls Beatdown', 'Spellcaster / Magician Girls', 'Commands Magician Girls with spell absorption and cheerful magical trickery.', 'tea-gardner', 2,
          buildDeck(['Dark Magician Girl', 'Magician\'s Valkyria', 'Apprentice Magician', 'Watapon', 'Magical Dimension', 'Secret Village of the Spellcasters', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Magician\'s Circle'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('tea_deck_3', 'Fire Princess Burn Sanctuary', 'Life Point Burn', 'Converts every Life Point gain into 500 damage with Fire Princess.', 'tea-gardner', 3,
          buildDeck(['Fire Princess', 'Marie the Fallen One', 'Dancing Fairy', 'Solemn Wishes', 'Dian Keto the Cure Maiden', 'Poison of the Old Man', 'Golden Ladybug', 'Emergency Provisions', 'Pot of Greed', 'Graceful Charity', 'Gravity Bind'], { race: 'Pyro', era: 'DM' })
        ),
        makeDeckData('tea_deck_4', 'Sacred Sanctuary of Light', 'Fairy Sanctuary', 'Counters attacks with The Sanctuary in the Sky and Herald of Green Light.', 'tea-gardner', 4,
          buildDeck(['The Sanctuary in the Sky', 'Zeradias, Herald of Heaven', 'Nova Summoner', 'Shining Angel', 'Airknight Parshath', 'Herald of Orange Light', 'Herald of Green Light', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fairy', era: 'DM' })
        ),
        makeDeckData('tea_deck_5', 'White Magician Pikeru Radiance', 'Spellcaster LP Gain', 'Pikeru restores 400 LP per monster each turn to fuel spellcaster dominance.', 'tea-gardner', 5,
          buildDeck(['White Magician Pikeru', 'Ebon Magician Curran', 'Pikeru\'s Circle of Enchantment', 'Trial of the Princesses', 'Magician\'s Valkyria', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('tea_deck_6', 'Watapon Light Swarm', 'Fairy Swarm', 'Watapon special summons itself on draw to flood the field for high-level fairies.', 'tea-gardner', 6,
          buildDeck(['Watapon', 'Shining Friendship', 'Freya, Spirit of Victory', 'Court of Justice', 'Valhalla, Hall of the Fallen', 'Athena', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fairy', era: 'DM' })
        ),
        makeDeckData('tea_deck_7', 'Angelic Counter Trap Lockdown', 'Fairy / Counter Trap', 'Banish opponent plays with Divine Wrath and Solemn Judgment.', 'tea-gardner', 7,
          buildDeck(['Meltiel, Sage of the Sky', 'Bountiful Artemis', 'Harvest Angel of Wisdom', 'The Sanctuary in the Sky', 'Solemn Judgment', 'Divine Wrath', 'Magic Jammer', 'Seven Tools of the Bandit', 'Pot of Greed', 'Graceful Charity'], { race: 'Fairy', era: 'DM' })
        ),
        makeDeckData('tea_deck_8', 'Fairy Toolbox & Token Guard', 'Fairy Tokens', 'Spawns fluffy fairy tokens with Scapegoat and Stray Lambs to block attacks.', 'tea-gardner', 8,
          buildDeck(['Shining Angel', 'Nova Summoner', 'Gellenduo', 'Marshmallon', 'Scapegoat', 'Stray Lambs', 'United We Stand', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fairy', era: 'DM' })
        ),
        makeDeckData('tea_deck_9', 'Friendship Bonds Overdrive', 'Burn & Heal Hybrid', 'Combines Friendship cards with burn damage and defensive protection.', 'tea-gardner', 9,
          buildDeck(['Shining Friendship', 'Fire Princess', 'Watapon', 'Marshmallon', 'Solemn Wishes', 'Waboku', 'Dian Keto the Cure Maiden', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('tea_deck_10', 'Téa\'s Ultimate Angelic Hope', 'Master Fairy Harmony', 'The ultimate combination of healing, fairy sanctuary, and Magician Girls.', 'tea-gardner', 10,
          buildDeck(['Dark Magician Girl', 'Fire Princess', 'Airknight Parshath', 'Marshmallon', 'The Sanctuary in the Sky', 'Solemn Wishes', 'Dian Keto the Cure Maiden', 'Waboku', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
      ],
    },

    // 6. Tristan Taylor
    {
      id: 'tristan-taylor',
      name: 'Tristan Taylor',
      series: 'DM',
      title: 'Tough-Guy Guardian',
      tagline: 'Cyber Commander & Ironclad Defense',
      description: 'Yugi\'s loyal protector who fights with gritty machine soldiers, heavy battle armor, and Cyber Commander tactics.',
      avatar: 'resources/characters/portraits/tristan-taylor.png',
      video: 'resources/videos/characters/tristan-taylor.mp4',
      themeColor: '#756f60',
      decks: [
        makeDeckData('tristan_deck_1', 'Cyber Commander Machine Guard', 'Machine / Warrior Beatdown', 'Commands Cyber Commander and armored warriors with machine support.', 'tristan-taylor', 1,
          buildDeck(['Cyber Commander', 'Battle Footballer', 'Command Knight', 'Goblin Attack Force', 'Machine King', 'Roboyarou', 'Robolady', 'Polymerization', 'Limiter Removal', 'Heavy Storm', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Trap Hole'], { race: 'Machine', era: 'DM' }, ['Super Roboyarou', 'Super Robolady'])
        ),
        makeDeckData('tristan_deck_2', 'Battle Footballer Defense', 'Machine Defense Stall', 'Impenetrable 2100 DEF Battle Footballers bolstered by Shield & Sword.', 'tristan-taylor', 2,
          buildDeck(['Battle Footballer', 'Cyber Commander', 'Giant Soldier of Stone', 'Shield & Sword', 'Chorus of Sanctuary', 'Waboku', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('tristan_deck_3', 'Super Roboyarou Fusion Assault', 'Machine Fusion', 'Fuses Roboyarou and Robolady into the tag-team powerhouse Super Roboyarou.', 'tristan-taylor', 3,
          buildDeck(['Roboyarou', 'Robolady', 'King of the Swamp', 'Polymerization', 'Fusion Sage', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'DM' }, ['Super Roboyarou', 'Super Robolady'])
        ),
        makeDeckData('tristan_deck_4', 'Machine King Iron Fortress', 'Machine Beatdown', 'Machine King gains 100 ATK for every machine on the field.', 'tristan-taylor', 4,
          buildDeck(['Machine King', 'Perfect Machine King', 'Cyber Commander', 'Blast Juggler', 'Limiter Removal', 'Heavy Mech Support Platform', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('tristan_deck_5', 'Lava & Swamp Battleguard Allies', 'Warrior Tag-Team', 'Lava and Swamp Battleguard boost each other\'s ATK by 500 when side-by-side.', 'tristan-taylor', 5,
          buildDeck(['Lava Battleguard', 'Swamp Battleguard', 'Command Knight', 'Goblin Attack Force', 'Reinforcement of the Army', 'United We Stand', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'DM' })
        ),
        makeDeckData('tristan_deck_6', 'Armored Cybernetic Shield', 'Machine Armor', 'Equips Heavy Mech Support Platforms to machines to protect them from destruction.', 'tristan-taylor', 6,
          buildDeck(['Heavy Mech Support Platform', 'Cyber Commander', 'Machine King', 'Limiter Removal', 'Frontline Base', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('tristan_deck_7', 'Heavy Metal Brawler', 'Warrior & Machine Beatdown', 'Raw physical power with high ATK level 4 monsters and ATK boosters.', 'tristan-taylor', 7,
          buildDeck(['Goblin Attack Force', 'Vorse Raider', 'Gene-Warped Warwolf', 'Axe of Despair', 'Mage Power', 'United We Stand', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('tristan_deck_8', 'Zombie & Fiend Virtual Realm', 'Zombie Defense', 'Tristan\'s virtual world defense deck featuring Dark Assailant and Skull Servant.', 'tristan-taylor', 8,
          buildDeck(['Skull Servant', 'King of the Skull Servants', 'Dark Assailant', 'Zombie Tiger', 'Book of Life', 'Call of the Haunted', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Zombie', era: 'DM' })
        ),
        makeDeckData('tristan_deck_9', 'Commander Tactical Toolbox', 'Tactical Machine Toolbox', 'Versatile machine effects and battle position traps.', 'tristan-taylor', 9,
          buildDeck(['Cyber Commander', 'Battle Footballer', 'Drillroid', 'Steamroid', 'Limiter Removal', 'Compulsory Evacuation Device', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('tristan_deck_10', 'Tristan\'s Iron Will', 'Ultimate Machine & Warrior', 'Tristan\'s strongest lineup of Cyber Commander, Machine King, and Super Roboyarou.', 'tristan-taylor', 10,
          buildDeck(['Cyber Commander', 'Battle Footballer', 'Machine King', 'Roboyarou', 'Robolady', 'Limiter Removal', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' }, ['Super Roboyarou', 'Super Robolady'])
        ),
      ],
    },

    // 7. Mai Valentine
    {
      id: 'mai-valentine',
      name: 'Mai Valentine',
      series: 'DM',
      title: 'Harpy Queen of the Wind',
      tagline: 'Harpie Lady Swarm & Amazoness Ferocity',
      description: 'A stylish and glamorous duelist who commands the Harpie Lady flock, Hunting Grounds, and fierce Amazoness warriors.',
      avatar: 'resources/characters/portraits/mai-valentine.png',
      video: 'resources/videos/characters/mai-valentine.mp4',
      themeColor: '#9b51e0',
      decks: [
        makeDeckData('mai_deck_1', 'Harpie Lady Swarm & Hunting Ground', 'Harpie / Winged Beast', 'Swarms the sky with Harpie Ladies and detonates backrow with Harpies\' Hunting Ground.', 'mai-valentine', 1,
          buildDeck(['Harpie Lady', 'Harpie Lady 1', 'Harpie Lady 2', 'Harpie Lady 3', 'Harpie Lady Sisters', 'Harpie\'s Pet Dragon', 'Cyber Harpie Lady', 'Harpie\'s Hunting Ground', 'Elegant Egotist', 'Harpie\'s Feather Duster', 'Harpie Lady Phoenix Formation', 'Icarus Attack', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Winged Beast', era: 'DM' })
        ),
        makeDeckData('mai_deck_2', 'Amazoness Tribal Warriors', 'Amazoness / Warrior', 'Fierce Amazoness warrior women who fight in relentless pack formations.', 'mai-valentine', 2,
          buildDeck(['Amazoness Paladin', 'Amazoness Swords Woman', 'Amazoness Tiger', 'Amazoness Blowpiper', 'Amazoness Archers', 'Amazoness Spellcaster', 'Amazoness Shamanism', 'Reinforcement of the Army', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'DM' })
        ),
        makeDeckData('mai_deck_3', 'Harpie\'s Pet Dragon Turbo', 'Dragon & Harpie Synergy', 'Protects Harpie Ladies while Harpie\'s Pet Dragon gains 300 ATK for each Harpie.', 'mai-valentine', 3,
          buildDeck(['Harpie\'s Pet Dragon', 'Harpie\'s Pet Baby Dragon', 'Harpie Lady 1', 'Cyber Harpie Lady', 'Elegant Egotist', 'Harpie\'s Hunting Ground', 'Dragon Shrine', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Winged Beast', era: 'DM' })
        ),
        makeDeckData('mai_deck_4', 'Harpie Channeler Flight', 'Harpie Swarm', 'Channeler summons Harpie monsters from the deck to trigger instant rank/fusion combos.', 'mai-valentine', 4,
          buildDeck(['Harpie Channeler', 'Harpie Harpist', 'Harpie Dancer', 'Harpie Lady 1', 'Harpie\'s Hunting Ground', 'Elegant Egotist', 'Hysteric Sign', 'Hysteric Party', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Winged Beast', era: 'DM' })
        ),
        makeDeckData('mai_deck_5', 'Amazoness Queen & Village', 'Amazoness Invulnerability', 'Amazoness Queen shields all Amazoness monsters from battle destruction.', 'mai-valentine', 5,
          buildDeck(['Amazoness Queen', 'Amazoness Swords Woman', 'Amazoness Paladin', 'Amazoness Tiger', 'Amazoness Village', 'Amazoness Fighting Spirit', 'Amazoness Archers', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Warrior', era: 'DM' })
        ),
        makeDeckData('mai_deck_6', 'Shadow Realm Orichalcos Harpies', 'Orichalcos / Harpie Aggro', 'Corrupted by The Seal of Orichalcos, Mai\'s Harpies gain 500 ATK and ruthless power.', 'mai-valentine', 6,
          buildDeck(['The Seal of Orichalcos', 'Harpie Lady 1', 'Cyber Harpie Lady', 'Harpie\'s Pet Dragon', 'Elegant Egotist', 'Harpie\'s Hunting Ground', 'Harpie Lady Phoenix Formation', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Winged Beast', era: 'DM' })
        ),
        makeDeckData('mai_deck_7', 'Claw of Hermos & Red-Eyes Sword', 'Hermos Equip Fusion', 'Mai uses The Claw of Hermos to forge the legendary Red-Eyes Black Dragon Sword.', 'mai-valentine', 7,
          buildDeck(['The Claw of Hermos', 'Cyber Harpie Lady', 'Amazoness Paladin', 'Harpie\'s Pet Dragon', 'Red-Eyes Black Dragon Sword', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' }, ['Red-Eyes Black Dragon Sword'])
        ),
        makeDeckData('mai_deck_8', 'Wind Storm & Feather Storm', 'Trap & Lock Control', 'Locks the opponent down with Windstorm of Etaqua and Harpie\'s Feather Storm.', 'mai-valentine', 8,
          buildDeck(['Harpie Lady 1', 'Cyber Harpie Lady', 'Windstorm of Etaqua', 'Harpie\'s Feather Storm', 'Harpie\'s Hunting Ground', 'Icarus Attack', 'Mirror Force', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Winged Beast', era: 'DM' })
        ),
        makeDeckData('mai_deck_9', 'Amazoness Swords Woman Reflect', 'Reflect Damage', 'Directs all battle damage from attacks on Swords Woman right back to the opponent.', 'mai-valentine', 9,
          buildDeck(['Amazoness Swords Woman', 'Amazoness Tiger', 'Amazoness Paladin', 'United We Stand', 'Mage Power', 'Amazoness Village', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'DM' })
        ),
        makeDeckData('mai_deck_10', 'Mai\'s Phoenix Formation Finale', 'Harpie Masterpiece', 'Mai\'s ultimate deck utilizing Harpie Lady Phoenix Formation to wipe enemy monsters.', 'mai-valentine', 10,
          buildDeck(['Harpie Lady 1', 'Cyber Harpie Lady', 'Harpie Lady Sisters', 'Harpie\'s Pet Dragon', 'Harpie Lady Phoenix Formation', 'Elegant Egotist', 'Harpie\'s Hunting Ground', 'Harpie\'s Feather Duster', 'Icarus Attack', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Winged Beast', era: 'DM' })
        ),
      ],
    },

    // 8. Bakura Ryou (Yami Bakura)
    {
      id: 'bakura-ryou',
      name: 'Bakura Ryou',
      series: 'DM',
      title: 'Tomb Robber of the Millennium Ring',
      tagline: 'Destiny Board Occult & Fiend Haunting',
      description: 'Host to the evil spirit of the Millennium Ring. Bakura plays deadly occult decks, Destiny Board word-spells, and graveyard-haunting fiends.',
      avatar: 'resources/characters/portraits/bakura-ryou.png',
      video: 'resources/videos/characters/bakura-ryou.mp4',
      themeColor: '#56ccf2',
      decks: [
        makeDeckData('bakura_deck_1', 'Destiny Board & Dark Sanctuary', 'Occult / Destiny Board', 'Spells out F-I-N-A-L on the board with Destiny Board and protects them with Dark Sanctuary.', 'bakura-ryou', 1,
          buildDeck(['Destiny Board', 'Spirit Message "I"', 'Spirit Message "N"', 'Spirit Message "A"', 'Spirit Message "L"', 'Dark Sanctuary', 'Dark Necrofear', 'Curse Necrofear', 'Jowgen the Spiritualist', 'Earl of Demise', 'Headless Knight', 'Dark Ruler Ha Des', 'Morphing Jar', 'Sangan', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Zoma the Spirit'], { race: 'Fiend', era: 'DM' })
        ),
        makeDeckData('bakura_deck_2', 'Dark Necrofear & Graveyard Haunting', 'Fiend / Graveyard Control', 'Banish 3 Fiends from the Graveyard to summon Dark Necrofear and possess enemy monsters.', 'bakura-ryou', 2,
          buildDeck(['Dark Necrofear', 'Curse Necrofear', 'Dark Ruler Ha Des', 'Doomcaliber Knight', 'Puppet Master', 'Sangan', 'Witch of the Black Forest', 'Armageddon Knight', 'Foolish Burial', 'Allure of Darkness', 'Pot of Greed', 'Graceful Charity', 'Call of the Haunted'], { race: 'Fiend', era: 'DM' })
        ),
        makeDeckData('bakura_deck_3', 'Morphing Jar Deck Out Mill', 'Mill & Deck Destruction', 'Forces the opponent to constantly draw and discard until their deck is emptied.', 'bakura-ryou', 3,
          buildDeck(['Morphing Jar', 'Morphing Jar #2', 'Cyber Jar', 'Needle Worm', 'Card Destruction', 'The Shallow Grave', 'Book of Moon', 'Book of Taiyou', 'Swords of Revealing Light', 'Gravity Bind', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Rock', era: 'DM' })
        ),
        makeDeckData('bakura_deck_4', 'Diabound Kernel Shadow', 'Shadow Fiend Aggro', 'Diabound Kernel steals the ATK of opposing monsters and sinks into the shadows.', 'bakura-ryou', 4,
          buildDeck(['Diabound Kernel', 'Dark Necrofear', 'Dark Ruler Ha Des', 'Doomcaliber Knight', 'Dark Sanctuary', 'Zoma the Spirit', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fiend', era: 'DM' })
        ),
        makeDeckData('bakura_deck_5', 'Dark Master Zorc Ritual', 'Ritual Fiend Destruction', 'Rolls the die with Dark Master Zorc to destroy all monsters on a roll of 1–5.', 'bakura-ryou', 5,
          buildDeck(['Dark Master - Zorc', 'Contract with the Dark Master', 'Manju of the Ten Thousand Hands', 'Senju of the Thousand Hands', 'Sonic Bird', 'Dark Necrofear', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fiend', era: 'DM' })
        ),
        makeDeckData('bakura_deck_6', 'Puppet Master & Triple Fiends', 'Fiend Revival Turbo', 'Pays 2000 LP to revive two high-level Fiend monsters simultaneously with Puppet Master.', 'bakura-ryou', 6,
          buildDeck(['Puppet Master', 'Dark Necrofear', 'Dark Ruler Ha Des', 'Archfiend of Gilfer', 'Sangan', 'Foolish Burial', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Call of the Haunted'], { race: 'Fiend', era: 'DM' })
        ),
        makeDeckData('bakura_deck_7', 'Zoma the Spirit Trap Monsters', 'Trap Monsters & Burn', 'Summons Zoma the Spirit to reflect double battle damage back to the attacker.', 'bakura-ryou', 7,
          buildDeck(['Zoma the Spirit', 'Embodiment of Apophis', 'Metal Reflect Slime', 'Dark Sanctuary', 'Destiny Board', 'Imperial Custom', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('bakura_deck_8', 'Final Countdown Shadow Stall', 'Turn Countdown Victory', 'Pays 2000 LP to initiate Final Countdown and stalls for 20 turns for instant victory.', 'bakura-ryou', 8,
          buildDeck(['Final Countdown', 'Marshmallon', 'Spirit Reaper', 'Gellenduo', 'Swords of Revealing Light', 'Gravity Bind', 'Level Limit - Area B', 'Threatening Roar', 'Waboku', 'Pot of Greed', 'Graceful Charity'], { era: 'DM' })
        ),
        makeDeckData('bakura_deck_9', 'Man-Eater Bug & Flip Nightmares', 'Flip Effect Trap Control', 'Deploys sneaky flip effect monsters like Man-Eater Bug and Night Assailant.', 'bakura-ryou', 9,
          buildDeck(['Man-Eater Bug', 'Night Assailant', 'Morphing Jar', 'Penguin Soldier', 'Old Vindictive Magician', 'Book of Moon', 'Swords of Revealing Light', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'DM' })
        ),
        makeDeckData('bakura_deck_10', 'Bakura\'s Millennium Occult Finale', 'Master Occult Darkness', 'Bakura\'s ultimate combination of Destiny Board, Dark Necrofear, and Zorc.', 'bakura-ryou', 10,
          buildDeck(['Dark Necrofear', 'Destiny Board', 'Dark Sanctuary', 'Dark Master - Zorc', 'Doomcaliber Knight', 'Morphing Jar', 'Zoma the Spirit', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
      ],
    },

    // 9. Marik Ishtar (Yami Marik)
    {
      id: 'marik-ishtar',
      name: 'Marik Ishtar',
      series: 'DM',
      title: 'Tomb Keeper of the Sun God',
      tagline: 'The Winged Dragon of Ra & Shadow Torture',
      description: 'Leader of the Rare Hunters and wielder of the Millennium Rod. Marik inflicts agonizing burn damage and commands The Winged Dragon of Ra.',
      avatar: 'resources/characters/portraits/marik-ishtar.png',
      video: 'resources/videos/characters/marik-ishtar.mp4',
      themeColor: '#f2c94c',
      decks: [
        makeDeckData('marik_deck_1', 'The Winged Dragon of Ra - Solar God', 'Egyptian God / Ra Turbo', 'Channels all Life Points into The Winged Dragon of Ra for a One-Turn Kill strike.', 'marik-ishtar', 1,
          buildDeck(['The Winged Dragon of Ra', 'The Winged Dragon of Ra - Sphere Mode', 'The Winged Dragon of Ra - Immortal Phoenix', 'Holding Arms', 'Holding Legs', 'Vilepawn Archfiend', 'Lava Golem', 'Bowganian', 'Card of Safe Return', 'Monster Reborn', 'Pot of Greed', 'Graceful Charity', 'Mirror Force', 'Nightmare Wheel', 'Metal Reflect Slime', 'Coffin Seller'], { race: 'Divine-Beast', era: 'DM' })
        ),
        makeDeckData('marik_deck_2', 'Lava Golem & Torture Burn', 'Burn / Tribute Removal', 'Tributes two opponent monsters to summon Lava Golem and locks them in Nightmare Wheel.', 'marik-ishtar', 2,
          buildDeck(['Lava Golem', 'Bowganian', 'Solar Flare Dragon', 'Stealth Bird', 'Des Koala', 'Nightmare Wheel', 'Mask of the Accursed', 'Wave-Motion Cannon', 'Secret Barrel', 'Just Desserts', 'Pot of Greed', 'Graceful Charity', 'Gravity Bind'], { race: 'Fiend', era: 'DM' })
        ),
        makeDeckData('marik_deck_3', 'Slime Defense & God Phoenix', 'Aqua / Slime Tokens', 'Summons invincible Slime tokens with Jam Breeding Machine and Metal Reflect Slime.', 'marik-ishtar', 3,
          buildDeck(['The Winged Dragon of Ra', 'Metal Reflect Slime', 'Jam Breeding Machine', 'Revival Jam', 'Card of Safe Return', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Aqua', era: 'DM' }, ['Egyptian God Slime'])
        ),
        makeDeckData('marik_deck_4', 'Masked Beast Des Gardius', 'Fiend / Mask Control', 'Summons Des Gardius to steal opponent monsters upon destruction with Mask of Remnants.', 'marik-ishtar', 4,
          buildDeck(['Masked Beast Des Gardius', 'The Masked Beast', 'Curse of the Masked Beast', 'Grand Tiki Elder', 'Melchid the Four-Face Beast', 'Mask of Remnants', 'Mask of Brutality', 'Mask of the Accursed', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fiend', era: 'DM' })
        ),
        makeDeckData('marik_deck_5', 'Helpoemer Graveyard Control', 'Graveyard Discard Lock', 'Forces the opponent to discard a card at the end of each turn while Helpoemer is in the GY.', 'marik-ishtar', 5,
          buildDeck(['Helpoemer', 'Gil Garth', 'Drillago', 'Lekunga', 'Foolish Burial', 'Armageddon Knight', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fiend', era: 'DM' })
        ),
        makeDeckData('marik_deck_6', 'Plasma Eel Parasite Lock', 'Machine Parasite ATK Drain', 'Attaches Plasma Eel to enemy monsters to drain 500 ATK each turn and make it indestructible.', 'marik-ishtar', 6,
          buildDeck(['Plasma Eel', 'Bowganian', 'Drillago', 'Nightmare Wheel', 'Mask of the Accursed', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('marik_deck_7', 'Ra - Immortal Phoenix Rebirth', 'Egyptian God Phoenix', 'When Ra is sent to the Graveyard, summon Immortal Phoenix unaffected by all card effects.', 'marik-ishtar', 7,
          buildDeck(['The Winged Dragon of Ra', 'The Winged Dragon of Ra - Immortal Phoenix', 'The Winged Dragon of Ra - Sphere Mode', 'Monster Reborn', 'Foolish Burial', 'Card of Safe Return', 'Pot of Greed', 'Graceful Charity', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('marik_deck_8', 'Holding Arms & Legs Lock', 'Sacred Lockdown', 'Holds the opponent\'s monsters and spells with Holding Arms and Holding Legs.', 'marik-ishtar', 8,
          buildDeck(['Holding Arms', 'Holding Legs', 'The Winged Dragon of Ra', 'Nightmare Wheel', 'Card of Safe Return', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('marik_deck_9', 'Rare Hunter Exodia Heist', 'Draw & Instant Win', 'Marik\'s Rare Hunter minion deck running high-speed draw engines to assemble Exodia.', 'marik-ishtar', 9,
          buildDeck(['Exodia the Forbidden One', 'Left Arm of the Forbidden One', 'Right Arm of the Forbidden One', 'Left Leg of the Forbidden One', 'Right Leg of the Forbidden One', 'Emissary of the Afterlife', 'Sangan', 'Witch of the Black Forest', 'Pot of Greed', 'Graceful Charity', 'Upstart Goblin'], { era: 'DM' })
        ),
        makeDeckData('marik_deck_10', 'Shadow Game Executioner', 'Ultimate Shadow Game', 'Marik\'s supreme deck combining Ra, Lava Golem, Des Gardius, and torture traps.', 'marik-ishtar', 10,
          buildDeck(['The Winged Dragon of Ra', 'The Winged Dragon of Ra - Sphere Mode', 'Lava Golem', 'Masked Beast Des Gardius', 'Bowganian', 'Nightmare Wheel', 'Metal Reflect Slime', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
      ],
    },

    // 10. Maximillion Pegasus
    {
      id: 'maximillion-pegasus',
      name: 'Maximillion Pegasus',
      series: 'DM',
      title: 'Creator of Duel Monsters',
      tagline: 'Toon World Whimsy & Relinquished Illusions',
      description: 'The eccentric creator of Duel Monsters and holder of the Millennium Eye. Pegasus bypasses defense with cartoonish Toons and absorbs souls with Relinquished.',
      avatar: 'resources/characters/portraits/maximillion-pegasus.png',
      video: 'resources/videos/characters/maximillion-pegasus.mp4',
      themeColor: '#c9a227',
      decks: [
        makeDeckData('pegasus_deck_1', 'Toon World Direct Invasion', 'Toon / Direct Attack', 'Hops directly over opposing monsters to strike Life Points with cartoonish fury.', 'maximillion-pegasus', 1,
          buildDeck(['Toon World', 'Toon Kingdom', 'Blue-Eyes Toon Dragon', 'Toon Summoned Skull', 'Toon Dark Magician Girl', 'Toon Mermaid', 'Toon Goblin Attack Force', 'Toon Gemini Elf', 'Toon Table of Contents', 'Comic Hand', 'Shadow Toon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { type: 'Toon', era: 'DM' })
        ),
        makeDeckData('pegasus_deck_2', 'Relinquished & Thousand-Eyes Lock', 'Ritual / Fusion Illusion', 'Absorbs opposing monsters as equip spells with Relinquished and Thousand-Eyes Restrict.', 'maximillion-pegasus', 2,
          buildDeck(['Relinquished', 'Black Illusion Ritual', 'Thousand-Eyes Idol', 'Polymerization', 'Sonic Bird', 'Senju of the Thousand Hands', 'Manju of the Ten Thousand Hands', 'Tsukuyomi', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Spellcaster', era: 'DM' }, ['Thousand-Eyes Restrict'])
        ),
        makeDeckData('pegasus_deck_3', 'Comic Hand & Shadow Toon', 'Toon Steal & Burn', 'Takes control of the opponent\'s strongest monster with Comic Hand and turns it into a Toon.', 'maximillion-pegasus', 3,
          buildDeck(['Comic Hand', 'Shadow Toon', 'Toon World', 'Toon Kingdom', 'Toon Table of Contents', 'Toon Mask', 'Toon Briefcase', 'Blue-Eyes Toon Dragon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { type: 'Toon', era: 'DM' })
        ),
        makeDeckData('pegasus_deck_4', 'Toon Dark Magician Girl Blitz', 'Toon Rush', 'Attacks directly on the turn she is summoned with Toon Dark Magician Girl.', 'maximillion-pegasus', 4,
          buildDeck(['Toon Dark Magician Girl', 'Toon World', 'Toon Kingdom', 'Toon Table of Contents', 'Toon Mermaid', 'Toon Gemini Elf', 'Toon Mask', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { type: 'Toon', era: 'DM' })
        ),
        makeDeckData('pegasus_deck_5', 'Golden Illusionist & Jigen Bakudan', 'Illusion & Bomb', 'Sets time bombs with Jigen Bakudan while Illusionist monsters warp the field.', 'maximillion-pegasus', 5,
          buildDeck(['Jigen Bakudan', 'Illusionist Faceless Mage', 'Dragon Piper', 'Ryu-Ran', 'Manga Ryu-Ran', 'Swords of Revealing Light', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('pegasus_deck_6', 'Toon Cyber Dragon Assault', 'Toon Machine Aggro', 'Special summons Toon Cyber Dragon to crush the opponent directly.', 'maximillion-pegasus', 6,
          buildDeck(['Toon Cyber Dragon', 'Toon World', 'Toon Kingdom', 'Toon Table of Contents', 'Toon Cannon Soldier', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { type: 'Toon', era: 'DM' })
        ),
        makeDeckData('pegasus_deck_7', 'Toon Buster Blader & Slayers', 'Toon Dragon Slayers', 'Deploys Toon Buster Blader to slaughter enemy dragons with Toon immunity.', 'maximillion-pegasus', 7,
          buildDeck(['Toon Buster Blader', 'Toon World', 'Toon Kingdom', 'Toon Table of Contents', 'Toon Gemini Elf', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { type: 'Toon', era: 'DM' })
        ),
        makeDeckData('pegasus_deck_8', 'Toon Kingdom Absolute Fortress', 'Toon Kingdom Protection', 'Toon Kingdom protects all Toon monsters from being targeted or destroyed.', 'maximillion-pegasus', 8,
          buildDeck(['Toon Kingdom', 'Toon Table of Contents', 'Terraforming', 'Toon World', 'Blue-Eyes Toon Dragon', 'Toon Summoned Skull', 'Toon Bookmark', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { type: 'Toon', era: 'DM' })
        ),
        makeDeckData('pegasus_deck_9', 'Prophecy of the Millennium Eye', 'Hand Reveal & Mind Scan', 'Uses Mind Scan tactics with Ceremonial Bell and Eye of Truth to see the opponent\'s hand.', 'maximillion-pegasus', 9,
          buildDeck(['The Eye of Truth', 'Respect Play', 'Ceremonial Bell', 'Mind on Air', 'Toon World', 'Toon Table of Contents', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'DM' })
        ),
        makeDeckData('pegasus_deck_10', 'Pegasus\'s Ultimate Toon Kingdom', 'Toon Masterpiece', 'Pegasus\'s grand masterpiece uniting Toon Kingdom, Relinquished, and comic tricks.', 'maximillion-pegasus', 10,
          buildDeck(['Toon Kingdom', 'Toon World', 'Blue-Eyes Toon Dragon', 'Toon Dark Magician Girl', 'Relinquished', 'Black Illusion Ritual', 'Comic Hand', 'Shadow Toon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' }, ['Thousand-Eyes Restrict'])
        ),
      ],
    },

    // 11. Bandit Keith (NEW)
    {
      id: 'bandit-keith',
      name: 'Bandit Keith',
      series: 'DM',
      title: 'US National Champion',
      tagline: 'Heavy Metal Machines & Coin-Toss Barrage',
      description: 'Former US Champion duelist known for his ruthless machine monsters, coin-toss artillery like Blowback and Gatling Dragon, and sneaky traps.',
      avatar: 'resources/characters/portraits/bandit-keith.png',
      video: 'resources/videos/characters/bandit-keith.mp4',
      themeColor: '#8c6e16',
      decks: [
        makeDeckData('keith_deck_1', 'Heavy Metal & Blowback Artillery', 'Machine / Coin Flip', 'Blows away cards on the field with 3-coin tosses and heavy machine firepower.', 'bandit-keith', 1,
          buildDeck(['Blowback Dragon', 'Slot Machine', 'Blast Sphere', 'Pendulum Machine', 'Mechanicalchaser', 'Heavy Mech Support Platform', 'Limiter Removal', 'Heavy Storm', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Time Machine', 'Metalmorph'], { race: 'Machine', era: 'DM' }, ['Gatling Dragon'])
        ),
        makeDeckData('keith_deck_2', 'Slot Machine 777 Jackpot', 'Machine Beatdown', 'Powers up Slot Machine with 7 Completed spells for massive stat boosts.', 'bandit-keith', 2,
          buildDeck(['Slot Machine', '7 Completed', 'Mechanicalchaser', 'Pendulum Machine', 'Blast Juggler', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('keith_deck_3', 'Zera the Mant Dark Ritual', 'Fiend Ritual Beatdown', 'Awakens the 2800 ATK demonic titan Zera the Mant with Zera Ritual.', 'bandit-keith', 3,
          buildDeck(['Zera the Mant', 'Zera Ritual', 'Warrior of Zera', 'Manju of the Ten Thousand Hands', 'Senju of the Thousand Hands', 'Sonic Bird', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fiend', era: 'DM' })
        ),
        makeDeckData('keith_deck_4', 'Machine King Iron Fortress Siege', 'Machine Swarm', 'Armored Machine Kings command endless mechanical troops.', 'bandit-keith', 4,
          buildDeck(['Machine King', 'Perfect Machine King', 'Mechanicalchaser', 'Blast Sphere', 'Limiter Removal', 'Frontline Base', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('keith_deck_5', 'Blast Sphere & Trap Destruction', 'Machine Burn & Destruction', 'Equips Blast Sphere to enemy monsters on attack, detonating them next turn.', 'bandit-keith', 5,
          buildDeck(['Blast Sphere', 'Blast Juggler', 'Secret Barrel', 'Barrel Behind the Door', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('keith_deck_6', 'Metalmorph & Metalzoa Evolution', 'Metal Evolution', 'Tributes Zoa equipped with Metalmorph to summon the indestructible Metalzoa.', 'bandit-keith', 6,
          buildDeck(['Metalzoa', 'Zoa', 'Metalmorph', 'Mechanicalchaser', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('keith_deck_7', 'Gatling Dragon Fusion Barrage', 'Machine Fusion Destruction', 'Fuses Barrel Dragon and Blowback Dragon into the destructive Gatling Dragon.', 'bandit-keith', 7,
          buildDeck(['Blowback Dragon', 'King of the Swamp', 'Polymerization', 'Fusion Sage', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'DM' }, ['Gatling Dragon'])
        ),
        makeDeckData('keith_deck_8', 'Motor Machine Interprocess Aggro', 'Machine Aggro', 'Motor-driven heavy machines with overwhelming ATK power.', 'bandit-keith', 8,
          buildDeck(['Mechanicalchaser', 'Pendulum Machine', 'Slot Machine', 'Limiter Removal', 'Heavy Storm', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('keith_deck_9', 'Bandit Keith\'s Secret Cheats', 'Gamble & Steal', 'Time Machine rewinds destroyed machines back onto the field with full stats.', 'bandit-keith', 9,
          buildDeck(['Time Machine', 'Metalmorph', 'Blast Sphere', 'Blowback Dragon', 'Snatch Steal', 'Change of Heart', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('keith_deck_10', 'Bandit Keith\'s Ultimate Heavy Arsenal', 'Master Machine Arsenal', 'Keith\'s ultimate tournament deck with Blowback, Gatling Dragon, and Metalzoa.', 'bandit-keith', 10,
          buildDeck(['Blowback Dragon', 'Slot Machine', 'Metalzoa', 'Zoa', 'Blast Sphere', 'Metalmorph', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' }, ['Gatling Dragon'])
        ),
      ],
    },

    // 12. Weevil Underwood (NEW)
    {
      id: 'weevil-underwood',
      name: 'Weevil Underwood',
      series: 'DM',
      title: 'Regional Insect Champion',
      tagline: 'Great Moth Metamorphosis & Insect Swarm',
      description: 'The calculating Japanese Regional Champion. Weevil traps opponents behind Insect Barrier and evolves Petit Moth into Perfectly Ultimate Great Moth.',
      avatar: 'resources/characters/portraits/weevil-underwood.png',
      video: 'resources/videos/characters/weevil-underwood.mp4',
      themeColor: '#3ddc97',
      decks: [
        makeDeckData('weevil_deck_1', 'Perfect Great Moth Metamorphosis', 'Insect / Evolution', 'Incubates Petit Moth inside Cocoon of Evolution to summon Perfectly Ultimate Great Moth.', 'weevil-underwood', 1,
          buildDeck(['Perfectly Ultimate Great Moth', 'Great Moth', 'Larvae Moth', 'Cocoon of Evolution', 'Petit Moth', 'Insect Queen', 'Pinch Hopper', 'Insect Barrier', 'DNA Surgery', 'Swords of Revealing Light', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Insect', era: 'DM' })
        ),
        makeDeckData('weevil_deck_2', 'Insect Queen Swarm & Tokens', 'Insect Swarm / Tokens', 'Insect Queen devours insect tokens to gain 200 ATK and launch devastating attacks.', 'weevil-underwood', 2,
          buildDeck(['Insect Queen', 'Pinch Hopper', 'Gokipon', 'Danipon', 'Parasite Paracide', 'Insect Barrier', 'DNA Surgery', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Insect', era: 'DM' })
        ),
        makeDeckData('weevil_deck_3', 'Insect Barrier & DNA Surgery Lock', 'Lockdown / DNA Surgery', 'DNA Surgery turns all monsters into Insects while Insect Barrier stops all attacks.', 'weevil-underwood', 3,
          buildDeck(['DNA Surgery', 'Insect Barrier', 'Pinch Hopper', 'Insect Queen', 'Parasite Paracide', 'Swords of Revealing Light', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Insect', era: 'DM' })
        ),
        makeDeckData('weevil_deck_4', 'Parasite Paracide Infestation', 'Deck Infestation & Burn', 'Shuffles Parasite Paracide into the opponent\'s deck to inflict 1000 damage on draw.', 'weevil-underwood', 4,
          buildDeck(['Parasite Paracide', 'Jade Insect Whistle', 'Insect Barrier', 'DNA Surgery', 'Pinch Hopper', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Insect', era: 'DM' })
        ),
        makeDeckData('weevil_deck_5', 'Pinch Hopper Special Swarm', 'Insect Swarm Special Summon', 'When Pinch Hopper is sent to the GY, immediately summon high-level insects from hand.', 'weevil-underwood', 5,
          buildDeck(['Pinch Hopper', 'Insect Queen', 'Great Moth', 'Gokipon', 'Danipon', 'Verdant Sanctuary', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Insect', era: 'DM' })
        ),
        makeDeckData('weevil_deck_6', 'Doom Dozer Banish Assault', 'Insect Banish Beatdown', 'Banishes 2 Insects from the Graveyard to special summon the 2800 ATK Doom Dozer.', 'weevil-underwood', 6,
          buildDeck(['Doom Dozer', 'Pinch Hopper', 'Gokipon', 'Danipon', 'Insect Knight', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Insect', era: 'DM' })
        ),
        makeDeckData('weevil_deck_7', 'Insect Knight Forest Army', 'Insect Beatdown', '1900 ATK Insect Knights and 4-Starred Ladybugs swarm the battlefield.', 'weevil-underwood', 7,
          buildDeck(['Insect Knight', '4-Starred Ladybug of Doom', 'Man-Eater Bug', 'Giriu Dragon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Insect', era: 'DM' })
        ),
        makeDeckData('weevil_deck_8', 'Verdant Sanctuary Protection', 'Insect Search & Recovery', 'Whenever an Insect is destroyed, Verdant Sanctuary fetches another from the deck.', 'weevil-underwood', 8,
          buildDeck(['Verdant Sanctuary', 'Pinch Hopper', 'Gokipon', 'Insect Queen', 'Doom Dozer', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Insect', era: 'DM' })
        ),
        makeDeckData('weevil_deck_9', 'Poison Butterfly & Insect Swarm', 'Insect Swarm', 'Summons poisonous insects to spread venom across the opponent\'s field.', 'weevil-underwood', 9,
          buildDeck(['Insect Queen', 'Pinch Hopper', 'Parasite Paracide', 'Insect Barrier', 'DNA Surgery', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Insect', era: 'DM' })
        ),
        makeDeckData('weevil_deck_10', 'Weevil\'s Ultimate Great Moth Reign', 'Master Insect Dominance', 'Weevil\'s supreme tournament deck combining Great Moth, Doom Dozer, and Insect Barrier.', 'weevil-underwood', 10,
          buildDeck(['Perfectly Ultimate Great Moth', 'Doom Dozer', 'Insect Queen', 'Pinch Hopper', 'Cocoon of Evolution', 'Insect Barrier', 'DNA Surgery', 'Parasite Paracide', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Insect', era: 'DM' })
        ),
      ],
    },

    // 13. Rex Raptor (NEW)
    {
      id: 'rex-raptor',
      name: 'Rex Raptor',
      series: 'DM',
      title: 'Dinosaur Tyrant',
      tagline: 'Prehistoric Dinosaurs & Dragon Might',
      description: 'Regional runner-up and dinosaur fanatic. Rex stomps rivals with prehistoric titans like Ultimate Tyranno, Black Tyranno, and Red-Eyes.',
      avatar: 'resources/characters/portraits/rex-raptor.png',
      video: 'resources/videos/characters/rex-raptor.mp4',
      themeColor: '#eb5757',
      decks: [
        makeDeckData('rex_deck_1', 'Ultimate Tyranno Prehistoric Rampage', 'Dinosaur / Beatdown', 'Crushes opponent defenses with Ultimate Tyranno, Black Tyranno, and Jurassic World.', 'rex-raptor', 1,
          buildDeck(['Ultimate Tyranno', 'Black Tyranno', 'Super Conductor Tyranno', 'Tyranno Infinity', 'Megazowler', 'Two-Headed King Rex', 'Crawling Dragon #2', 'Jurassic World', 'Ultra Evolution Pill', 'Tail Swipe', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Survival Instinct'], { race: 'Dinosaur', era: 'DM' })
        ),
        makeDeckData('rex_deck_2', 'Red-Eyes Black Dragon Classic', 'Dragon Beatdown', 'Rex\'s original ace monster Red-Eyes Black Dragon supported by Two-Headed Thunder Dragon.', 'rex-raptor', 2,
          buildDeck(['Red-Eyes B. Dragon', 'Thunder Dragon', 'Polymerization', 'Fusion Sage', 'Dragon Shrine', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dragon', era: 'DM' }, ['Twin-Headed Thunder Dragon', 'Meteor Black Dragon'])
        ),
        makeDeckData('rex_deck_3', 'Super Conductor Tyranno Burn', 'Dinosaur Burn', 'Tributes monsters with Super Conductor Tyranno to blast 1000 direct damage per turn.', 'rex-raptor', 3,
          buildDeck(['Super Conductor Tyranno', 'Babycerasaurus', 'Miracle Jurassic Egg', 'Jurassic World', 'Ultra Evolution Pill', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dinosaur', era: 'DM' })
        ),
        makeDeckData('rex_deck_4', 'Serpent Night Dragon Darkness', 'Dragon Darkness', 'Summons the sinister 2350 ATK Serpent Night Dragon to rule the sky.', 'rex-raptor', 4,
          buildDeck(['Serpent Night Dragon', 'Crawling Dragon #2', 'Dragon Shrine', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dragon', era: 'DM' })
        ),
        makeDeckData('rex_deck_5', 'Tyranno Infinity Banish Force', 'Dinosaur Banish ATK', 'Banishes dinosaurs with Survival Instinct to give Tyranno Infinity 1000 ATK per banished dino.', 'rex-raptor', 5,
          buildDeck(['Tyranno Infinity', 'Survival Instinct', 'Babycerasaurus', 'Jurassic World', 'Fossil Excavation', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dinosaur', era: 'DM' })
        ),
        makeDeckData('rex_deck_6', 'Ultra Evolution Pill Turbo', 'Dinosaur Evolution', 'Tributes Reptiles to special summon high-level Dinosaurs directly from the hand.', 'rex-raptor', 6,
          buildDeck(['Ultra Evolution Pill', 'Ultimate Tyranno', 'Black Tyranno', 'Gator Dragon', 'Jurassic World', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dinosaur', era: 'DM' })
        ),
        makeDeckData('rex_deck_7', 'Black Tyranno Direct Stomp', 'Direct Attack Dinosaur', 'When the opponent controls only defense monsters, Black Tyranno attacks directly for 2600.', 'rex-raptor', 7,
          buildDeck(['Black Tyranno', 'Earthquake', 'Swords of Concealing Light', 'Jurassic World', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dinosaur', era: 'DM' })
        ),
        makeDeckData('rex_deck_8', 'Jurassic World Dinosaur Kingdom', 'Dinosaur Field Buff', 'Jurassic World boosts the ATK and DEF of all Dinosaurs by 300.', 'rex-raptor', 8,
          buildDeck(['Jurassic World', 'Terraforming', 'Hydrogeddon', 'Oxygeddon', 'Babycerasaurus', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dinosaur', era: 'DM' })
        ),
        makeDeckData('rex_deck_9', 'Two-Headed Thunder Dragon Fusion', 'Thunder Fusion', 'Discards Thunder Dragon to thin the deck and fuse into 2800 ATK Twin-Headed Thunder Dragon.', 'rex-raptor', 9,
          buildDeck(['Thunder Dragon', 'Polymerization', 'Fusion Sage', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' }, ['Twin-Headed Thunder Dragon'])
        ),
        makeDeckData('rex_deck_10', 'Rex\'s Ultimate Apex Predator', 'Master Dinosaur Apex', 'Rex\'s ultimate tournament deck uniting Ultimate Tyranno, Super Conductor, and Red-Eyes.', 'rex-raptor', 10,
          buildDeck(['Ultimate Tyranno', 'Super Conductor Tyranno', 'Black Tyranno', 'Red-Eyes B. Dragon', 'Babycerasaurus', 'Jurassic World', 'Ultra Evolution Pill', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dinosaur', era: 'DM' }, ['Twin-Headed Thunder Dragon'])
        ),
      ],
    },

    // 14. Mako Tsunami (NEW)
    {
      id: 'mako-tsunami',
      name: 'Mako Tsunami',
      series: 'DM',
      title: 'Ocean Master of the Seas',
      tagline: 'Sea Stealth Umi & The Legendary Fisherman',
      description: 'A sea-faring fisherman duelist who hides his monsters beneath Umi waves and protects the honor of his father with The Legendary Fisherman.',
      avatar: 'resources/characters/portraits/mako-tsunami.png',
      video: 'resources/videos/characters/mako-tsunami.mp4',
      themeColor: '#56ccf2',
      decks: [
        makeDeckData('mako_deck_1', 'Sea Stealth & The Legendary Fisherman', 'WATER / Sea Stealth / Umi', 'Hides underwater with Umi while The Legendary Fisherman is immune to spells and attacks.', 'mako-tsunami', 1,
          buildDeck(['The Legendary Fisherman', 'Umi', 'A Legendary Ocean', 'Amphibian Beast', 'Fortress Whale', 'Fortress Whale\'s Oath', 'Tornado Wall', 'Torrential Tribute', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Levia-Dragon - Daedalus'], { attribute: 'WATER', era: 'DM' })
        ),
        makeDeckData('mako_deck_2', 'Fortress Whale Ritual Depths', 'WATER Ritual / Fish', 'Conducts the dark ocean ritual to summon the 2350 ATK armored Fortress Whale.', 'mako-tsunami', 2,
          buildDeck(['Fortress Whale', 'Fortress Whale\'s Oath', 'Senju of the Thousand Hands', 'Sonic Bird', 'A Legendary Ocean', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { attribute: 'WATER', era: 'DM' })
        ),
        makeDeckData('mako_deck_3', 'Levia-Dragon Daedalus Ocean Tsunami', 'Sea Serpent Wipe', 'Sends Umi to the Graveyard to destroy all other cards on the entire field.', 'mako-tsunami', 3,
          buildDeck(['Levia-Dragon - Daedalus', 'A Legendary Ocean', 'Umi', 'Terraforming', 'Hydrogeddon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { attribute: 'WATER', era: 'DM' })
        ),
        makeDeckData('mako_deck_4', 'A Legendary Ocean Level Reduction', 'WATER Beatdown', 'A Legendary Ocean reduces the level of all WATER monsters by 1 for free tribute summons.', 'mako-tsunami', 4,
          buildDeck(['A Legendary Ocean', 'The Legendary Fisherman', 'Giga Gagagigo', 'Terrorking Salmon', 'Amphibian Beast', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { attribute: 'WATER', era: 'DM' })
        ),
        makeDeckData('mako_deck_5', 'Tornado Wall Tidal Defense', 'WATER Damage Immunity', 'As long as Umi is active, Tornado Wall reduces all battle damage to 0.', 'mako-tsunami', 5,
          buildDeck(['Tornado Wall', 'Umi', 'A Legendary Ocean', 'The Legendary Fisherman', 'Torrential Tribute', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { attribute: 'WATER', era: 'DM' })
        ),
        makeDeckData('mako_deck_6', 'Amphibian Beast & Fish Warriors', 'Fish & Aqua Beatdown', 'Fast aggressive water monsters supported by Salvage and Water Hazard.', 'mako-tsunami', 6,
          buildDeck(['Amphibian Beast', '7 Colored Fish', 'Flying Fish', 'Salvage', 'A Legendary Ocean', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { attribute: 'WATER', era: 'DM' })
        ),
        makeDeckData('mako_deck_7', 'Torrential Tribute Ocean Surge', 'Field Clear Control', 'Triggers Torrential Tribute on summon to wash away opposing armies.', 'mako-tsunami', 7,
          buildDeck(['Torrential Tribute', 'The Legendary Fisherman', 'A Legendary Ocean', 'Surface', 'Salvage', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { attribute: 'WATER', era: 'DM' })
        ),
        makeDeckData('mako_deck_8', 'Deep Sea Warrior Infiltration', 'Aqua Infiltration', 'Unstoppable direct attacks while concealed beneath the ocean waves.', 'mako-tsunami', 8,
          buildDeck(['The Legendary Fisherman', 'A Legendary Ocean', 'Umi', 'Deep Sea Diva', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { attribute: 'WATER', era: 'DM' })
        ),
        makeDeckData('mako_deck_9', 'Ocean King Kairyu-Shin Torrent', 'Sea Serpent Control', 'Kairyu-Shin controls tidal currents to restrain enemy monsters.', 'mako-tsunami', 9,
          buildDeck(['A Legendary Ocean', 'Levia-Dragon - Daedalus', 'The Legendary Fisherman', 'Salvage', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { attribute: 'WATER', era: 'DM' })
        ),
        makeDeckData('mako_deck_10', 'Mako\'s Ultimate Tidal Masterpiece', 'Master Ocean Dominance', 'Mako\'s supreme deck uniting Legendary Fisherman, Daedalus, and Fortress Whale.', 'mako-tsunami', 10,
          buildDeck(['The Legendary Fisherman', 'Levia-Dragon - Daedalus', 'Fortress Whale', 'Fortress Whale\'s Oath', 'A Legendary Ocean', 'Tornado Wall', 'Torrential Tribute', 'Salvage', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { attribute: 'WATER', era: 'DM' })
        ),
      ],
    },

    // 15. Ishizu Ishtar (NEW)
    {
      id: 'ishizu-ishtar',
      name: 'Ishizu Ishtar',
      series: 'DM',
      title: 'Guardian of the Millennium Necklace',
      tagline: 'Exchange of the Spirit & Gravekeeper Prophecy',
      description: 'Keeper of the Egyptian Antiquities and the Millennium Necklace. Ishizu sees the future, commands Gravekeepers, and flips graveyards with Exchange of the Spirit.',
      avatar: 'resources/characters/portraits/ishizu-ishtar.png',
      video: 'resources/videos/characters/ishizu-ishtar.mp4',
      themeColor: '#c9a227',
      decks: [
        makeDeckData('ishizu_deck_1', 'Exchange of the Spirit Inversion', 'Graveyard Inversion / Fairies', 'Swaps the Graveyard and Deck when 15+ cards are in the GY for instant victory.', 'ishizu-ishtar', 1,
          buildDeck(['Exchange of the Spirit', 'Mudora', 'Keldo', 'Kelbek', 'Agido', 'Zolga', 'Blast Held by a Tribute', 'Necrovalley', 'Gravekeeper\'s Spy', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Rite of Spirit'], { race: 'Fairy', era: 'DM' })
        ),
        makeDeckData('ishizu_deck_2', 'Gravekeeper Necrovalley Domain', 'Gravekeeper / Anti-GY', 'Necrovalley shuts down all effects that touch the Graveyard while boosting Gravekeepers.', 'ishizu-ishtar', 2,
          buildDeck(['Necrovalley', 'Gravekeeper\'s Spy', 'Gravekeeper\'s Commandant', 'Gravekeeper\'s Assailant', 'Gravekeeper\'s Spear Soldier', 'Gravekeeper\'s Chief', 'Rite of Spirit', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('ishizu_deck_3', 'Mudora & Earth Fairy Beatdown', 'Earth Fairy Aggro', 'Mudora gains 200 ATK for each Fairy in the Graveyard.', 'ishizu-ishtar', 3,
          buildDeck(['Mudora', 'Keldo', 'Kelbek', 'Agido', 'Zolga', 'Shining Angel', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fairy', era: 'DM' })
        ),
        makeDeckData('ishizu_deck_4', 'Blast Held by a Tribute Retaliation', 'Tribute Punishment Trap', 'When opponent attacks with a tribute-summoned monster, destroy all their face-up monsters and burn 1000.', 'ishizu-ishtar', 4,
          buildDeck(['Blast Held by a Tribute', 'Gravekeeper\'s Spy', 'Mudora', 'Kelbek', 'Necrovalley', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('ishizu_deck_5', 'Zolga Divine Oracle LP Boost', 'Fairy LP Gain', 'Tributing Zolga restores 2000 Life Points to fuel high-cost prophecy plays.', 'ishizu-ishtar', 5,
          buildDeck(['Zolga', 'Mudora', 'Agido', 'Keldo', 'Solemn Wishes', 'Dian Keto the Cure Maiden', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fairy', era: 'DM' })
        ),
        makeDeckData('ishizu_deck_6', 'Gravekeeper Assailant Position Shift', 'Battle Position Shift', 'Assailant shifts enemy monsters to defense to pierce them with Spear Soldier.', 'ishizu-ishtar', 6,
          buildDeck(['Gravekeeper\'s Assailant', 'Gravekeeper\'s Spear Soldier', 'Gravekeeper\'s Spy', 'Necrovalley', 'Rite of Spirit', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('ishizu_deck_7', 'Millennium Necklace Foresight', 'Deck Prediction & Lock', 'Peeks at the top cards of both decks to control every turn in advance.', 'ishizu-ishtar', 7,
          buildDeck(['Exchange of the Spirit', 'Gravekeeper\'s Servant', 'Necrovalley', 'Mudora', 'Kelbek', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('ishizu_deck_8', 'Gravekeeper Chief Resurrection', 'Gravekeeper Special Summon', 'Chief allows you to use your Graveyard even while Necrovalley is active.', 'ishizu-ishtar', 8,
          buildDeck(['Gravekeeper\'s Chief', 'Gravekeeper\'s Spy', 'Gravekeeper\'s Commandant', 'Necrovalley', 'Rite of Spirit', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('ishizu_deck_9', 'Kelbek Bounce & Fairy Retaliation', 'Bounce Trap Control', 'Kelbek returns attacking monsters back to the opponent\'s hand upon battle.', 'ishizu-ishtar', 9,
          buildDeck(['Kelbek', 'Agido', 'Keldo', 'Mudora', 'Compulsory Evacuation Device', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fairy', era: 'DM' })
        ),
        makeDeckData('ishizu_deck_10', 'Ishizu\'s Prophecy of the Tomb', 'Master Tomb Keeper', 'Ishizu\'s supreme deck combining Exchange of the Spirit, Necrovalley, and Fairy masters.', 'ishizu-ishtar', 10,
          buildDeck(['Exchange of the Spirit', 'Necrovalley', 'Gravekeeper\'s Spy', 'Mudora', 'Kelbek', 'Zolga', 'Blast Held by a Tribute', 'Rite of Spirit', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
      ],
    },

    // 16. Odion (NEW)
    {
      id: 'odion',
      name: 'Odion',
      series: 'DM',
      title: 'Loyal Guardian of the Ishtar Tomb',
      tagline: 'Embodiment of Apophis & Mystical Beast Serket',
      description: 'Marik\'s sworn protector. Odion overwhelms opponents with continuous Trap Monsters like Apophis and the devastating Mystical Beast of Serket.',
      avatar: 'resources/characters/portraits/odion.png',
      video: 'resources/videos/characters/odion.mp4',
      themeColor: '#8c6e16',
      decks: [
        makeDeckData('odion_deck_1', 'Apophis Trap Monster Legion', 'Trap Monsters / Continuous Traps', 'Transforms continuous traps into an army of monsters with Embodiment of Apophis.', 'odion', 1,
          buildDeck(['Embodiment of Apophis', 'Zoma the Spirit', 'Metal Reflect Slime', 'Imperial Custom', 'Solemn Judgment', 'Curse of Anubis', 'Judgment of Anubis', 'Jar of Greed', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Dark Bribe'], { type: 'Trap', era: 'DM' })
        ),
        makeDeckData('odion_deck_2', 'Mystical Beast Serket & Temple of the Kings', 'Beast / Special Summon', 'Banishes cards with Serket while Temple of the Kings summons fusion gods from the Extra Deck.', 'odion', 2,
          buildDeck(['Mystical Beast of Serket', 'Temple of the Kings', 'Embodiment of Apophis', 'A Cat of Ill Omen', 'Jar of Greed', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' }, ['Blue-Eyes Ultimate Dragon', 'Dark Paladin', 'Gatling Dragon'])
        ),
        makeDeckData('odion_deck_3', 'Curse of Anubis Trap Lock', 'Trap Position Lock', 'Changes all Effect Monsters to Defense Position and drops their DEF to 0.', 'odion', 3,
          buildDeck(['Curse of Anubis', 'Judgment of Anubis', 'Embodiment of Apophis', 'A Cat of Ill Omen', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('odion_deck_4', 'Judgment of Anubis Spell Negation', 'Spell Destruction Counter', 'Negates spell cards that destroy spells/traps, destroys a monster, and burns its ATK.', 'odion', 4,
          buildDeck(['Judgment of Anubis', 'Dark Bribe', 'Solemn Judgment', 'Embodiment of Apophis', 'Imperial Custom', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { type: 'Trap', era: 'DM' })
        ),
        makeDeckData('odion_deck_5', 'Cat of Ill Omen Trap Search', 'Trap Search Engine', 'Flip summons A Cat of Ill Omen to place any Trap Card from the deck on top.', 'odion', 5,
          buildDeck(['A Cat of Ill Omen', 'Embodiment of Apophis', 'Jar of Greed', 'Imperial Custom', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('odion_deck_6', 'Metal Reflect Slime 3000 DEF Wall', 'Trap Wall Defense', 'Summons a 3000 DEF indestructible wall of slime from the trap zone.', 'odion', 6,
          buildDeck(['Metal Reflect Slime', 'Embodiment of Apophis', 'Zoma the Spirit', 'Imperial Custom', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('odion_deck_7', 'Pharaonic Curse & Trap Burn', 'Burn Traps', 'Inflicts constant burn damage with Coffin Seller, Secret Barrel, and Apophis.', 'odion', 7,
          buildDeck(['Coffin Seller', 'Secret Barrel', 'Just Desserts', 'Embodiment of Apophis', 'Curse of Anubis', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { type: 'Trap', era: 'DM' })
        ),
        makeDeckData('odion_deck_8', 'Solemn Trap Dominion', 'Counter Trap Lock', 'Nullifies summons, spells, and attacks with Solemn Judgment and Dark Bribe.', 'odion', 8,
          buildDeck(['Solemn Judgment', 'Dark Bribe', 'Seven Tools of the Bandit', 'Magic Jammer', 'Embodiment of Apophis', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { type: 'Trap', era: 'DM' })
        ),
        makeDeckData('odion_deck_9', 'Desert Mirage Trap Swarm', 'Continuous Trap Swarm', 'Endless stream of continuous traps protected by Imperial Custom.', 'odion', 9,
          buildDeck(['Imperial Custom', 'Embodiment of Apophis', 'Zoma the Spirit', 'Metal Reflect Slime', 'Jar of Greed', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { type: 'Trap', era: 'DM' })
        ),
        makeDeckData('odion_deck_10', 'Odion\'s Tomb Guardian Masterpiece', 'Master Trap Army', 'Odion\'s supreme deck combining Serket, Apophis, and the impenetrable Imperial Custom.', 'odion', 10,
          buildDeck(['Mystical Beast of Serket', 'Temple of the Kings', 'Embodiment of Apophis', 'Imperial Custom', 'Curse of Anubis', 'Judgment of Anubis', 'Metal Reflect Slime', 'Solemn Judgment', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' }, ['Blue-Eyes Ultimate Dragon'])
        ),
      ],
    },

    // 17. Espa Roba (NEW)
    {
      id: 'espa-roba',
      name: 'Espa Roba',
      series: 'DM',
      title: 'Psychic Duelist & Jinzo Master',
      tagline: 'Jinzo Trap Annihilation & Cyber Telepathy',
      description: 'The psychic duelist with extraordinary tactical mind-reading. Espa Roba shuts down all opponent Traps with Jinzo and Jinzo - Lord.',
      avatar: 'resources/characters/portraits/espa-roba.png',
      video: 'resources/videos/characters/espa-roba.mp4',
      themeColor: '#56ccf2',
      decks: [
        makeDeckData('espa_deck_1', 'Jinzo Trap Annihilation & Cyber Telepathy', 'Machine / Jinzo Trap Lock', 'Shuts down all Traps on the field with Jinzo, Jinzo - Returner, and Jinzo - Lord.', 'espa-roba', 1,
          buildDeck(['Jinzo', 'Jinzo - Returner', 'Jinzo - Lord', 'Jinzo #7', 'Amplifier', 'Cyber Energy Shock', 'Heavy Storm', 'Mystical Space Typhoon', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Premature Burial', 'Call of the Haunted'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('espa_deck_2', 'Jinzo - Lord Supreme Lockdown', 'Machine / Jinzo Lord', 'Tributes Jinzo to summon the 2600 ATK Jinzo - Lord to destroy opponent spells and traps every turn.', 'espa-roba', 2,
          buildDeck(['Jinzo - Lord', 'Jinzo', 'Jinzo - Returner', 'Amplifier', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('espa_deck_3', 'Jinzo Returner Graveyard Swarm', 'Machine Swarm', 'Sends Jinzo - Returner to the GY to instantly special summon Jinzo directly from the Graveyard.', 'espa-roba', 3,
          buildDeck(['Jinzo - Returner', 'Jinzo', 'Armageddon Knight', 'Foolish Burial', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('espa_deck_4', 'Amplifier One-Sided Trap Lock', 'Equip / Jinzo Amplifier', 'Equips Amplifier to Jinzo so Espa Roba can still activate Traps while the opponent cannot.', 'espa-roba', 4,
          buildDeck(['Jinzo', 'Amplifier', 'Mirror Force', 'Torrential Tribute', 'Call of the Haunted', 'Ring of Destruction', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('espa_deck_5', 'Reflect Bounder Psychic Shield', 'Machine Damage Reflection', 'Reflects battle damage directly back to the attacking monster with Reflect Bounder.', 'espa-roba', 5,
          buildDeck(['Reflect Bounder', 'Jinzo', 'Jinzo #7', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('espa_deck_6', 'Jinzo #7 Direct Strike', 'Direct Attack Machine', 'Bypasses enemy monsters with Jinzo #7 to inflict direct attacks and trigger Limiter Removal.', 'espa-roba', 6,
          buildDeck(['Jinzo #7', 'Opti-Camouflage Armor', 'United We Stand', 'Mage Power', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('espa_deck_7', 'Mind Control & ESP Psychic', 'Control / Steal', 'Uses Mind Control and Brain Control to turn opponent monsters into tribute fodder for Jinzo.', 'espa-roba', 7,
          buildDeck(['Brain Control', 'Snatch Steal', 'Change of Heart', 'Jinzo', 'Jinzo - Lord', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'DM' })
        ),
        makeDeckData('espa_deck_8', 'Cyber Energy Shock Destruction', 'Jinzo Spell Support', 'Destroys cards on the field and searches Jinzo whenever Jinzo is on the field.', 'espa-roba', 8,
          buildDeck(['Cyber Energy Shock', 'Jinzo', 'Jinzo - Returner', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('espa_deck_9', 'Telekinetic Psychic Fortress', 'Machine & Psychic Aggro', 'High-tech machine defense supported by telepathic board control.', 'espa-roba', 9,
          buildDeck(['Jinzo', 'Reflect Bounder', 'Mechanicalchaser', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'DM' })
        ),
        makeDeckData('espa_deck_10', 'Espa Roba\'s Ultimate Psychic Master', 'Master Jinzo Reign', 'Espa Roba\'s supreme tournament deck uniting Jinzo, Jinzo - Lord, and Reflect Bounder.', 'espa-roba', 10,
          buildDeck(['Jinzo', 'Jinzo - Lord', 'Jinzo - Returner', 'Reflect Bounder', 'Amplifier', 'Cyber Energy Shock', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'DM' })
        ),
      ],
    },

    // 18. Arkana (NEW)
    {
      id: 'arkana',
      name: 'Arkana',
      series: 'DM',
      title: 'Master of Dark Magic Illusion',
      tagline: 'Pandora Dark Magician & Ectoplasmer Sacrifices',
      description: 'The illusionist magician and Rare Hunter. Arkana wields the red-robed Dark Magician, sinister Ectoplasmer tributes, and sawblade traps.',
      avatar: 'resources/characters/portraits/arkana.png',
      video: 'resources/videos/characters/arkana.mp4',
      themeColor: '#eb5757',
      decks: [
        makeDeckData('arkana_deck_1', 'Red-Robe Dark Magician & Ectoplasmer', 'Dark Magician / Spellcaster Burn', 'Commands the red-robed Dark Magician and tributes monsters with Ectoplasmer for burn.', 'arkana', 1,
          buildDeck(['Dark Magician', 'Dark Magician Girl', 'Skilled Dark Magician', 'Legion the Fiend Jester', 'Dark Magic Curtain', 'Thousand Knives', 'Dark Magic Attack', 'Ectoplasmer', 'Magical Dimension', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Magician\'s Circle'], { race: 'Spellcaster', era: 'DM' }, ['Dark Paladin', 'Dark Magician the Dragon Knight'])
        ),
        makeDeckData('arkana_deck_2', 'Dark Magic Curtain Turbo', 'Spellcaster Special Summon', 'Pays half Life Points to summon Dark Magician directly from the deck on turn 1.', 'arkana', 2,
          buildDeck(['Dark Magic Curtain', 'Dark Magician', 'Thousand Knives', 'Dark Magic Attack', 'Skilled Dark Magician', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('arkana_deck_3', 'Ectoplasmer Soul Cannon', 'Tribute Burn', 'Sacrifices monsters at the end of each turn to blast half their original ATK as direct damage.', 'arkana', 3,
          buildDeck(['Ectoplasmer', 'Dark Magician', 'Skilled Dark Magician', 'Legion the Fiend Jester', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('arkana_deck_4', 'Legion the Fiend Jester Double Tribute', 'Spellcaster Tribute Engine', 'Grants an extra Normal Summon for Spellcasters and searches Dark Magician on send to GY.', 'arkana', 4,
          buildDeck(['Legion the Fiend Jester', 'Dark Magician', 'Dark Magician Girl', 'Magical Dimension', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('arkana_deck_5', 'Magical Dimension Ambush', 'Spellcaster Removal', 'Tributes a monster with Magical Dimension to special summon Dark Magician and destroy an opponent monster.', 'arkana', 5,
          buildDeck(['Magical Dimension', 'Dark Magician', 'Apprentice Magician', 'Old Vindictive Magician', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('arkana_deck_6', 'Thousand Knives Execution', 'Targeted Monster Destruction', 'When Dark Magician is on the field, Thousand Knives destroys any opponent monster without condition.', 'arkana', 6,
          buildDeck(['Thousand Knives', 'Dark Magic Attack', 'Dark Magician', 'Dark Magic Curtain', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('arkana_deck_7', 'Dark Magic Attack Backrow Clear', 'Spell/Trap Wipe', 'Dark Magic Attack destroys all spells and traps controlled by the opponent.', 'arkana', 7,
          buildDeck(['Dark Magic Attack', 'Dark Magician', 'Skilled Dark Magician', 'Dark Magic Curtain', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('arkana_deck_8', 'Secret Village Spellcaster Lock', 'Spell Lock', 'Secret Village of the Spellcasters prevents the opponent from activating any Spells.', 'arkana', 8,
          buildDeck(['Secret Village of the Spellcasters', 'Dark Magician', 'Skilled Dark Magician', 'Magician\'s Valkyria', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('arkana_deck_9', 'Illusionist Doll Control', 'Spellcaster & Fiend Control', 'Uses Doll Control tricks to manipulate battle positions and confuse attacks.', 'arkana', 9,
          buildDeck(['Dark Magician', 'Legion the Fiend Jester', 'Old Vindictive Magician', 'Magical Dimension', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Spellcaster', era: 'DM' })
        ),
        makeDeckData('arkana_deck_10', 'Arkana\'s Ultimate Illusion of Chaos', 'Master Red Dark Magician', 'Arkana\'s supreme deck combining Red Dark Magician, Ectoplasmer, and Dark Magic Curtain.', 'arkana', 10,
          buildDeck(['Dark Magician', 'Dark Magician Girl', 'Dark Magic Curtain', 'Thousand Knives', 'Dark Magic Attack', 'Ectoplasmer', 'Legion the Fiend Jester', 'Magical Dimension', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Spellcaster', era: 'DM' }, ['Dark Paladin'])
        ),
      ],
    },

    // 19. Rafael (NEW)
    {
      id: 'rafael',
      name: 'Rafael',
      series: 'DM',
      title: 'Noble Doma Guardian',
      tagline: 'Guardian Eatos & Dreadscythe Purity',
      description: 'The virtuous member of Doma. Rafael treats his Guardian monsters as comrades, never letting them fall to the Graveyard, and summons Guardian Eatos.',
      avatar: 'resources/characters/portraits/rafael.png',
      video: 'resources/videos/characters/rafael.mp4',
      themeColor: '#3ddc97',
      decks: [
        makeDeckData('rafael_deck_1', 'Guardian Eatos & Celestial Purity', 'Guardian / Equip Spells', 'Special summons Guardian Eatos when the Graveyard is empty and equips Celestial Sword.', 'rafael', 1,
          buildDeck(['Guardian Eatos', 'Guardian Dreadscythe', 'Celestial Sword - Eatos', 'Guardian Ceal', 'Guardian Kay\'est', 'Guardian Grarl', 'Arsenal Summoner', 'Backup Gardna', 'United We Stand', 'Mage Power', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { type: 'Monster', era: 'DM' })
        ),
        makeDeckData('rafael_deck_2', 'Guardian Dreadscythe Underworld', 'Underworld Guardian', 'When Eatos falls, awakens the 2500 ATK Guardian Dreadscythe wielding the Reaper Scythe.', 'rafael', 2,
          buildDeck(['Guardian Dreadscythe', 'Guardian Eatos', 'Celestial Sword - Eatos', 'Reaper Scythe - Dreadscythe', 'Arsenal Summoner', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { type: 'Monster', era: 'DM' })
        ),
        makeDeckData('rafael_deck_3', 'The Seal of Orichalcos Corrupted Guardian', 'Orichalcos / Guardian', 'Rafael\'s fateful duel using The Seal of Orichalcos to power up Guardians by 500 ATK.', 'rafael', 3,
          buildDeck(['The Seal of Orichalcos', 'Guardian Eatos', 'Guardian Grarl', 'Guardian Ceal', 'Guardian Kay\'est', 'Arsenal Summoner', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('rafael_deck_4', 'Arsenal Summoner & Equip Armory', 'Equip Search Engine', 'Arsenal Summoner searches any Guardian monster directly from the deck upon flip.', 'rafael', 4,
          buildDeck(['Arsenal Summoner', 'Guardian Eatos', 'Guardian Ceal', 'Celestial Sword - Eatos', 'United We Stand', 'Mage Power', 'Axe of Despair', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'DM' })
        ),
        makeDeckData('rafael_deck_5', 'Guardian Ceal & Shoot Bow', 'Direct Attack & Bounce', 'Guardian Ceal sends equip spells to the GY to destroy opponent monsters.', 'rafael', 5,
          buildDeck(['Guardian Ceal', 'Shooting Star Bow - Ceal', 'Guardian Eatos', 'Celestial Sword - Eatos', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('rafael_deck_6', 'Guardian Kay\'est & Rod of Silence', 'Spell Immunity', 'Kay\'est equipped with Rod of Silence is immune to attacks and negates spells.', 'rafael', 6,
          buildDeck(['Guardian Kay\'est', 'Rod of Silence - Kay\'est', 'Guardian Eatos', 'Arsenal Summoner', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('rafael_deck_7', 'Guardian Grarl Heavy Gravity', 'High-ATK Guardian', 'Special summons 2500 ATK Guardian Grarl with Gravity Axe to freeze opponent battle positions.', 'rafael', 7,
          buildDeck(['Guardian Grarl', 'Gravity Axe - Grarl', 'Guardian Eatos', 'Arsenal Summoner', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('rafael_deck_8', 'Backup Gardna Defense Transfer', 'Equip Transfer Tactics', 'Backup Gardna shifts equip spells across monsters to optimize battle power.', 'rafael', 8,
          buildDeck(['Backup Gardna', 'Guardian Eatos', 'Celestial Sword - Eatos', 'United We Stand', 'Mage Power', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'DM' })
        ),
        makeDeckData('rafael_deck_9', 'Pure Soul & Graveyard Emptiness', 'Graveyard Cleansing', 'Banishes cards from the Graveyard to keep Guardian Eatos at maximum power.', 'rafael', 9,
          buildDeck(['Guardian Eatos', 'Soul Release', 'Celestial Sword - Eatos', 'Arsenal Summoner', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('rafael_deck_10', 'Rafael\'s Ultimate Guardian Symphony', 'Master Guardian Army', 'Rafael\'s supreme deck uniting Eatos, Dreadscythe, and all 6 legendary Guardians.', 'rafael', 10,
          buildDeck(['Guardian Eatos', 'Guardian Dreadscythe', 'Celestial Sword - Eatos', 'Guardian Ceal', 'Guardian Kay\'est', 'Guardian Grarl', 'Arsenal Summoner', 'United We Stand', 'Mage Power', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
      ],
    },

    // 20. Dartz (NEW)
    {
      id: 'dartz',
      name: 'Dartz',
      series: 'DM',
      title: 'King of Atlantis',
      tagline: 'The Seal of Orichalcos & Great Leviathan',
      description: 'The ancient King of Atlantis and leader of Doma. Dartz harnesses the 10,000-year-old Seal of Orichalcos and awakens the Great Leviathan.',
      avatar: 'resources/characters/portraits/dartz.png',
      video: 'resources/videos/characters/dartz.mp4',
      themeColor: '#3ddc97',
      decks: [
        makeDeckData('dartz_deck_1', 'The Seal of Orichalcos & Shunoros', 'Orichalcos / Field Spell', 'Expands monster zones and gains 500 ATK with The Seal of Orichalcos while summoning Shunoros.', 'dartz', 1,
          buildDeck(['The Seal of Orichalcos', 'Orichalcos Shunoros', 'Gora Turtle', 'Marshmallon', 'Terraforming', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Ring of Destruction', 'Dark Hole', 'Raigeki'], { era: 'DM' })
        ),
        makeDeckData('dartz_deck_2', 'Orichalcos Kyutora & Shield', 'Damage Absorption', 'Absorbs all battle damage with Orichalcos Kyutora to power up Orichalcos Shunoros upon destruction.', 'dartz', 2,
          buildDeck(['The Seal of Orichalcos', 'Orichalcos Shunoros', 'Marshmallon', 'Spirit Reaper', 'Terraforming', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('dartz_deck_3', 'Mirror Knight Calling Token Swarm', 'Mirror Token Defense', 'Copies the ATK of opposing monsters to ensure mutual destruction or defensive stall.', 'dartz', 3,
          buildDeck(['The Seal of Orichalcos', 'Orichalcos Shunoros', 'Scapegoat', 'Marshmallon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('dartz_deck_4', 'Orichalcos Gigas Infinite Rebirth', 'Rebirth Beatdown', 'Orichalcos Gigas revives with 500 more ATK every time it is destroyed in battle.', 'dartz', 4,
          buildDeck(['The Seal of Orichalcos', 'Orichalcos Shunoros', 'Gene-Warped Warwolf', 'Vorse Raider', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('dartz_deck_5', 'Atlantis Ancient Dominion', 'Field Dominion', 'Uses legendary Atlantean spells to control the battlefield and dominate Life Points.', 'dartz', 5,
          buildDeck(['The Seal of Orichalcos', 'Terraforming', 'Marshmallon', 'Swords of Revealing Light', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('dartz_deck_6', 'Great Leviathan World Devourer', 'God-Level Destruction', 'Summons the apocalyptic serpent of Atlantis to devour all darkness.', 'dartz', 6,
          buildDeck(['The Seal of Orichalcos', 'Orichalcos Shunoros', 'Marshmallon', 'Raigeki', 'Dark Hole', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('dartz_deck_7', 'Orichalcos Deuteros & Tritos', 'Triple Tier Orichalcos', 'Advanced tiers of Orichalcos restore Life Points and negate opponent spells/traps.', 'dartz', 7,
          buildDeck(['The Seal of Orichalcos', 'Orichalcos Shunoros', 'Solemn Judgment', 'Dark Bribe', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('dartz_deck_8', 'Shadow Magic & Token Barrier', 'Token Lockdown', 'Walls behind tokens while The Seal of Orichalcos protects the back row monsters.', 'dartz', 8,
          buildDeck(['The Seal of Orichalcos', 'Scapegoat', 'Marshmallon', 'Spirit Reaper', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('dartz_deck_9', '10,000-Year Ancient Seals', 'Ancient Magic Control', 'Locks down opponent options with ancient Atlantean counter traps.', 'dartz', 9,
          buildDeck(['The Seal of Orichalcos', 'Solemn Judgment', 'Curse of Anubis', 'Torrential Tribute', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
        makeDeckData('dartz_deck_10', 'Dartz\'s Ultimate Reign of Atlantis', 'Master Orichalcos Apocalypse', 'Dartz\'s supreme deck combining The Seal of Orichalcos, Shunoros, and ancient power.', 'dartz', 10,
          buildDeck(['The Seal of Orichalcos', 'Orichalcos Shunoros', 'Marshmallon', 'Spirit Reaper', 'Terraforming', 'Solemn Judgment', 'Raigeki', 'Dark Hole', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'DM' })
        ),
      ],
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
