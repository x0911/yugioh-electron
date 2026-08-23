import { buildDeck } from '../deckGenHelper.js';
import type { CharacterData, CharacterDeckData } from '../../src/shared/types/character.js';

export function getGxCharacters(): CharacterData[] {
  return [
    // 1. Jaden Yuki
    {
      id: 'jaden-yuki',
      name: 'Jaden Yuki',
      series: 'GX',
      title: 'Slifer Red Supreme Duelist',
      tagline: 'Elemental HERO & Neos Contact Fusion',
      description: 'A fun-loving student at Duel Academy with unmatched instinct. Jaden fuses Elemental HEROs and contacts Neo-Spacians into cosmic warriors.',
      avatar: 'resources/characters/portraits/jaden-yuki.png',
      video: 'resources/videos/characters/jaden-yuki.mp4',
      themeColor: '#eb5757',
      decks: [
        makeDeckData('jaden_deck_1', 'Elemental HERO Classic Fusion', 'Elemental HERO / Fusion', 'Fuses classic Elemental HEROs into Flame Wingman, Thunder Giant, and Shining Flare Wingman.', 'jaden-yuki', 1,
          buildDeck(['Elemental HERO Avian', 'Elemental HERO Burstinatrix', 'Elemental HERO Clayman', 'Elemental HERO Sparkman', 'Elemental HERO Bubbleman', 'Elemental HERO Wildheart', 'Polymerization', 'Miracle Fusion', 'Fusion Sage', 'Skyscraper', 'R - Righteous Justice', 'E - Emergency Call', 'Hero Signal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'GX' }, ['Elemental HERO Flame Wingman', 'Elemental HERO Thunder Giant', 'Elemental HERO Shining Flare Wingman', 'Elemental HERO Rampart Blaster', 'Elemental HERO Tempest', 'Elemental HERO Wildedge'])
        ),
        makeDeckData('jaden_deck_2', 'Elemental HERO Neos & Space Fusion', 'Elemental HERO / Neo-Spacian', 'Summons Elemental HERO Neos and contacts Neo-Spacians for contact fusions.', 'jaden-yuki', 2,
          buildDeck(['Elemental HERO Neos', 'Neo-Spacian Flare Scarab', 'Neo-Spacian Aqua Dolphin', 'Neo-Spacian Grand Mole', 'Neo-Spacian Air Hummingbird', 'Neo-Spacian Dark Panther', 'Neo-Spacian Glow Moss', 'Cross Porter', 'Neo Space', 'Fake Hero', 'Contact Out', 'Convert Contact', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' }, ['Elemental HERO Flare Neos', 'Elemental HERO Aqua Neos', 'Elemental HERO Grand Neos', 'Elemental HERO Air Neos', 'Elemental HERO Dark Neos', 'Elemental HERO Glow Neos', 'Elemental HERO Magma Neos', 'Elemental HERO Storm Neos'])
        ),
        makeDeckData('jaden_deck_3', 'Super Polymerization HERO Mastery', 'HERO / Super Polymerization', 'Uses Super Polymerization to absorb opponent monsters into Omni-Attribute HEROs.', 'jaden-yuki', 3,
          buildDeck(['Elemental HERO Stratos', 'Elemental HERO Shadow Mist', 'Elemental HERO Solid Soldier', 'Elemental HERO Liquid Soldier', 'Elemental HERO Honest Neos', 'Super Polymerization', 'Polymerization', 'Miracle Fusion', 'A Hero Lives', 'E - Emergency Call', 'Mask Change', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Warrior', era: 'GX' }, ['Elemental HERO Absolute Zero', 'Elemental HERO The Shining', 'Elemental HERO Great Tornado', 'Elemental HERO Nova Master', 'Elemental HERO Gaia', 'Elemental HERO Escuridao', 'Masked HERO Dark Law', 'Masked HERO Acid'])
        ),
        makeDeckData('jaden_deck_4', 'Masked & Vision HERO Strike', 'Masked HERO / Vision HERO', 'Vision HERO Faris and Increase set up rapid Mask Change transformations.', 'jaden-yuki', 4,
          buildDeck(['Vision HERO Faris', 'Vision HERO Increase', 'Vision HERO Vyon', 'Elemental HERO Shadow Mist', 'Elemental HERO Stratos', 'Mask Change', 'Form Change', 'A Hero Lives', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Warrior', era: 'GX' }, ['Masked HERO Dark Law', 'Masked HERO Acid', 'Masked HERO Anki', 'Masked HERO Koga', 'Vision HERO Trinity', 'Vision HERO Adoration'])
        ),
        makeDeckData('jaden_deck_5', 'Rainbow Neos Cosmic Light', 'Neos & Ultimate Crystal Fusion', 'Fuses Elemental HERO Neos with Rainbow Dragon into the 4500 ATK titan Rainbow Neos.', 'jaden-yuki', 5,
          buildDeck(['Elemental HERO Neos', 'Rainbow Dragon', 'King of the Swamp', 'Polymerization', 'Miracle Contact', 'E - Emergency Call', 'A Hero Lives', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' }, ['Rainbow Neos', 'Elemental HERO Absolute Zero'])
        ),
        makeDeckData('jaden_deck_6', 'Evil HERO Dark Gaia Ruin', 'Evil HERO Fiend & Rock', 'Fuses high-ATK Fiend and Rock monsters into Evil HERO Dark Gaia for 5000+ ATK.', 'jaden-yuki', 6,
          buildDeck(['Evil HERO Infernal Prodigy', 'Dark Fusion', 'Dark Calling', 'Valkyrion the Magna Warrior', 'Raviel, Lord of Phantasms', 'Elemental HERO Stratos', 'A Hero Lives', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' }, ['Evil HERO Dark Gaia', 'Evil HERO Malicious Bane', 'Evil HERO Lightning Golem'])
        ),
        makeDeckData('jaden_deck_7', 'Shining Flare Wingman Turbo', 'Skyscraper HERO', 'Shining Flare Wingman gains 300 ATK for every Elemental HERO in the Graveyard.', 'jaden-yuki', 7,
          buildDeck(['Elemental HERO Sparkman', 'Elemental HERO Flame Wingman', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix', 'Polymerization', 'Miracle Fusion', 'Skyscraper', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Warrior', era: 'GX' }, ['Elemental HERO Shining Flare Wingman', 'Elemental HERO Flame Wingman', 'Elemental HERO Phoenix Enforcer'])
        ),
        makeDeckData('jaden_deck_8', 'Yubel Neos Kluger Harmony', 'Neos & Yubel Fusion', 'Fuses Elemental HERO Neos and Yubel into the immortal battle demon Neos Kluger.', 'jaden-yuki', 8,
          buildDeck(['Elemental HERO Neos', 'Yubel', 'Elemental HERO Stratos', 'Neos Fusion', 'Miracle Contact', 'A Hero Lives', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' }, ['Elemental HERO Absolute Zero', 'Rainbow Neos'])
        ),
        makeDeckData('jaden_deck_9', 'Hero Flash & Fifth Hope', 'HERO Spell Combo', 'Activates H-E-R-O Flash to allow direct attacks from all HEROs on the field.', 'jaden-yuki', 9,
          buildDeck(['H - Heated Heart', 'E - Emergency Call', 'R - Righteous Justice', 'O - Oversoul', 'Hero Flash!!', 'Elemental HERO Stratos', 'Elemental HERO Bubbleman', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Warrior', era: 'GX' })
        ),
        makeDeckData('jaden_deck_10', 'Jaden\'s Ultimate HERO Supreme', 'Master Elemental HERO', 'Jaden\'s ultimate deck uniting Elemental HEROs, Neos, Super Polymerization, and Masked HEROs.', 'jaden-yuki', 10,
          buildDeck(['Elemental HERO Stratos', 'Elemental HERO Shadow Mist', 'Elemental HERO Neos', 'Vision HERO Faris', 'Vision HERO Increase', 'Super Polymerization', 'Miracle Fusion', 'Mask Change', 'A Hero Lives', 'E - Emergency Call', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'GX' }, ['Elemental HERO Absolute Zero', 'Masked HERO Dark Law', 'Elemental HERO Shining Flare Wingman', 'Rainbow Neos', 'Elemental HERO The Shining'])
        ),
      ],
    },

    // 2. Zane Truesdale (Hell Kaiser)
    {
      id: 'zane-truesdale',
      name: 'Zane Truesdale',
      series: 'GX',
      title: 'Kaiser of the Academy',
      tagline: 'Cyber Dragon Power Bond & Cyberdark Underworld',
      description: 'The undefeated top duelist of Duel Academy who later embraced the ruthless Hell Kaiser underworld style. Commands Cyber Dragon, Power Bond, and Cyberdarks.',
      avatar: 'resources/characters/portraits/zane-truesdale.png',
      video: 'resources/videos/characters/zane-truesdale.mp4',
      themeColor: '#2f80ed',
      decks: [
        makeDeckData('zane_deck_1', 'Cyber Dragon Power Bond OTK', 'Cyber Dragon / Power Bond', 'Powers up Cyber Twin Dragon and Cyber End Dragon to 8000+ ATK for an instant One-Turn Kill.', 'zane-truesdale', 1,
          buildDeck(['Cyber Dragon', 'Cyber Dragon Drei', 'Cyber Dragon Core', 'Cyber Dragon Herz', 'Proto-Cyber Dragon', 'Cyber Valley', 'Power Bond', 'Overload Fusion', 'Cyberload Fusion', 'Cyber Emergency', 'Cyber Repair Plant', 'Evolution Burst', 'Limiter Removal', 'Heavy Storm', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' }, ['Cyber Twin Dragon', 'Cyber End Dragon', 'Chimeratech Overdragon', 'Chimeratech Fortress Dragon', 'Chimeratech Rampage Dragon', 'Cyber Eternity Dragon'])
        ),
        makeDeckData('zane_deck_2', 'Cyberdark Underworld Dragon', 'Cyberdark / Dragon Equips', 'Equips level 3 Dragon monsters from the Graveyard onto Cyberdark Horn, Edge, and Keel.', 'zane-truesdale', 2,
          buildDeck(['Cyberdark Horn', 'Cyberdark Edge', 'Cyberdark Keel', 'Cyberdark Cannon', 'Cyberdark Claw', 'Cyberdark Dragon', 'Overload Fusion', 'Cyberdark Inferno', 'Cyberdark Impact!', 'Foolish Burial', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' }, ['Cyberdark Dragon', 'Cyberdarkness Dragon'])
        ),
        makeDeckData('zane_deck_3', 'Chimeratech Overdragon Rampage', 'Machine Graveyard Fusion', 'Fuses all machine monsters on the field and in the Graveyard into a multi-attacking Chimeratech Overdragon.', 'zane-truesdale', 3,
          buildDeck(['Cyber Dragon', 'Cyber Valley', 'Cyber Phoenix', 'Proto-Cyber Dragon', 'Overload Fusion', 'Future Fusion', 'Limiter Removal', 'Heavy Storm', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' }, ['Chimeratech Overdragon', 'Chimeratech Fortress Dragon', 'Cyber Twin Dragon'])
        ),
        makeDeckData('zane_deck_4', 'Cyber End Dragon 8000 Piercing', 'Cyber End Turbo', 'Power Bond summons 8000 ATK Cyber End Dragon to pierce through defense positions.', 'zane-truesdale', 4,
          buildDeck(['Cyber Dragon', 'Proto-Cyber Dragon', 'Cyber Dragon Core', 'Power Bond', 'Evolution Burst', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' }, ['Cyber End Dragon', 'Cyber Twin Dragon'])
        ),
        makeDeckData('zane_deck_5', 'Cyber Valley Control & Draw', 'Machine Stall & Draw', 'Banishes Cyber Valley to draw 2 cards or end the opponent\'s Battle Phase.', 'zane-truesdale', 5,
          buildDeck(['Cyber Valley', 'Cyber Dragon', 'Cyber Phoenix', 'Machine Duplication', 'One for One', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' })
        ),
        makeDeckData('zane_deck_6', 'Future Fusion & Overload OTK', 'Future Fusion Turbo', 'Dumps all Cyber Dragons from deck to Graveyard with Future Fusion and finishes with Overload Fusion.', 'zane-truesdale', 6,
          buildDeck(['Cyber Dragon', 'Proto-Cyber Dragon', 'Cyber Phoenix', 'Future Fusion', 'Overload Fusion', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' }, ['Chimeratech Overdragon', 'Cyber Twin Dragon'])
        ),
        makeDeckData('zane_deck_7', 'Cyber Phoenix Negation Shield', 'Machine Spell/Trap Defense', 'Cyber Phoenix protects Machine monsters from being targeted by spells and traps.', 'zane-truesdale', 7,
          buildDeck(['Cyber Phoenix', 'Cyber Dragon', 'Proto-Cyber Dragon', 'Limiter Removal', 'Heavy Storm', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' })
        ),
        makeDeckData('zane_deck_8', 'Cyberdarkness Dragon Darkness', 'Cyberdark Boss', 'Equips high-ATK dragon boss monsters to Cyberdarkness Dragon to negate card activations.', 'zane-truesdale', 8,
          buildDeck(['Cyberdark Horn', 'Cyberdark Edge', 'Cyberdark Keel', 'Cyberdark Claw', 'Cyberdark Cannon', 'Cyberdark Inferno', 'Overload Fusion', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'GX' }, ['Cyberdark Dragon', 'Cyberdarkness Dragon'])
        ),
        makeDeckData('zane_deck_9', 'Cyberload Fusion Recycle', 'Fusion Recycle', 'Cyberload Fusion shuffles banished Cyber Dragons back into the deck to summon fusion titans.', 'zane-truesdale', 9,
          buildDeck(['Cyber Dragon', 'Cyber Dragon Core', 'Cyberload Fusion', 'Cyber Emergency', 'Power Bond', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'GX' }, ['Cyber Twin Dragon', 'Chimeratech Rampage Dragon'])
        ),
        makeDeckData('zane_deck_10', 'Zane\'s Ultimate Kaiser Dominion', 'Master Cyber Overload', 'Zane\'s supreme deck combining Cyber Dragon, Power Bond, Cyberdark, and Chimeratech.', 'zane-truesdale', 10,
          buildDeck(['Cyber Dragon', 'Cyber Dragon Core', 'Cyberdark Horn', 'Cyberdark Edge', 'Cyberdark Keel', 'Power Bond', 'Overload Fusion', 'Cyberload Fusion', 'Cyber Emergency', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' }, ['Cyber Twin Dragon', 'Cyber End Dragon', 'Chimeratech Overdragon', 'Cyberdark Dragon'])
        ),
      ],
    },

    // 3. Syrus Truesdale
    {
      id: 'syrus-truesdale',
      name: 'Syrus Truesdale',
      series: 'GX',
      title: 'Vehicroid Engineer',
      tagline: 'Vehicroid Mobile Taskforce & Connection Zone',
      description: 'Zane\'s determined younger brother. Syrus engineers cute and powerful Vehicroid machines, combining them with Vehicroid Connection Zone.',
      avatar: 'resources/characters/portraits/syrus-truesdale.png',
      video: 'resources/videos/characters/syrus-truesdale.mp4',
      themeColor: '#f2c94c',
      decks: [
        makeDeckData('syrus_deck_1', 'Vehicroid Mobile Taskforce', 'Vehicroid / Machine Fusion', 'Combines utility roid machines like Gyroid, Steamroid, and Drillroid with Super Vehicroid fusions.', 'syrus-truesdale', 1,
          buildDeck(['Steamroid', 'Drillroid', 'Gyroid', 'Submarineroid', 'Truckroid', 'Expressroid', 'Armoroid', 'Ambulanceroid', 'Rescueroid', 'Vehicroid Connection Zone', 'Megaroid City', 'Limiter Removal', 'Supercharge', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' }, ['Super Vehicroid Jumbo Drill', 'Super Vehicroid - Stealth Union', 'Ambulance Rescueroid', 'Barbaroid, the Ultimate Battle Machine', 'Super Vehicroid Mobile Base'])
        ),
        makeDeckData('syrus_deck_2', 'Super Vehicroid Jumbo Drill Piercing', 'Piercing Machine Fusion', 'Jumbo Drill attacks with 3000 ATK and deals piercing battle damage to defense monsters.', 'syrus-truesdale', 2,
          buildDeck(['Steamroid', 'Drillroid', 'Submarineroid', 'Vehicroid Connection Zone', 'Megaroid City', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' }, ['Super Vehicroid Jumbo Drill', 'Barbaroid, the Ultimate Battle Machine'])
        ),
        makeDeckData('syrus_deck_3', 'Submarineroid Direct Infiltration', 'Direct Attack & Defense Shift', 'Submarineroid attacks directly for 800 damage and immediately switches to 1800 DEF.', 'syrus-truesdale', 3,
          buildDeck(['Submarineroid', 'Drillroid', 'Gyroid', 'Megaroid City', 'United We Stand', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' })
        ),
        makeDeckData('syrus_deck_4', 'Drillroid Defense Destruction', 'Defense Annihilation', 'Drillroid instantly destroys any defense position monster it attacks without damage calculation.', 'syrus-truesdale', 4,
          buildDeck(['Drillroid', 'Earthquake', 'Swords of Concealing Light', 'Megaroid City', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' })
        ),
        makeDeckData('syrus_deck_5', 'Gyroid Battle Immunity Stall', 'Battle Stall Machine', 'Gyroid cannot be destroyed by battle once per turn, providing continuous defense.', 'syrus-truesdale', 5,
          buildDeck(['Gyroid', 'Expressroid', 'Truckroid', 'Megaroid City', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' })
        ),
        makeDeckData('syrus_deck_6', 'Expressroid Graveyard Recovery', 'Graveyard Machine Search', 'When Normal or Special Summoned, Expressroid adds 2 roid monsters from GY to hand.', 'syrus-truesdale', 6,
          buildDeck(['Expressroid', 'Steamroid', 'Drillroid', 'Submarineroid', 'Vehicroid Connection Zone', 'Megaroid City', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'GX' })
        ),
        makeDeckData('syrus_deck_7', 'Ambulance & Rescueroid Life Saver', 'Life Point Recovery Fusion', 'Fuses Ambulanceroid and Rescueroid to save destroyed monsters and restore life points.', 'syrus-truesdale', 7,
          buildDeck(['Ambulanceroid', 'Rescueroid', 'Vehicroid Connection Zone', 'Expressroid', 'Megaroid City', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' }, ['Ambulance Rescueroid'])
        ),
        makeDeckData('syrus_deck_8', 'Barbaroid Ultimate Battle Machine', 'Machine Fusion Colossus', 'Barbaroid attacks twice per turn and burns 1000 damage when destroying enemy monsters.', 'syrus-truesdale', 8,
          buildDeck(['Steamroid', 'Drillroid', 'Submarineroid', 'Expressroid', 'Truckroid', 'Vehicroid Connection Zone', 'Power Bond', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'GX' }, ['Barbaroid, the Ultimate Battle Machine', 'Super Vehicroid Jumbo Drill'])
        ),
        makeDeckData('syrus_deck_9', 'Armoroid Heavy Wipe', 'Tribute Spell/Trap Wipe', 'Tribute summons Armoroid to banish all spells and traps on the entire field.', 'syrus-truesdale', 9,
          buildDeck(['Armoroid', 'Expressroid', 'Gyroid', 'Megaroid City', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' })
        ),
        makeDeckData('syrus_deck_10', 'Syrus\'s Ultimate Connection Zone', 'Master Vehicroid Connection', 'Syrus\'s supreme tournament deck uniting all Vehicroids, Barbaroid, and Megaroid City.', 'syrus-truesdale', 10,
          buildDeck(['Expressroid', 'Drillroid', 'Steamroid', 'Submarineroid', 'Gyroid', 'Armoroid', 'Vehicroid Connection Zone', 'Megaroid City', 'Power Bond', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' }, ['Super Vehicroid Jumbo Drill', 'Barbaroid, the Ultimate Battle Machine', 'Ambulance Rescueroid'])
        ),
      ],
    },

    // 4. Chazz Princeton
    {
      id: 'chazz-princeton',
      name: 'Chazz Princeton',
      series: 'GX',
      title: 'Chazz It Up! (The Manjoume)',
      tagline: 'Ojama Delta Hurricane & Armed Dragons',
      description: 'The arrogant and resilient prodigy of Duel Academy. Chazz commands the comical Ojama trio, evolving Armed Dragons, and VWXYZ catapult machines.',
      avatar: 'resources/characters/portraits/chazz-princeton.png',
      video: 'resources/videos/characters/chazz-princeton.mp4',
      themeColor: '#756f60',
      decks: [
        makeDeckData('chazz_deck_1', 'Ojama Trio & Delta Hurricane', 'Ojama / Beast', 'Locks opposing monster zones with Ojama King and wipes the field with Ojama Delta Hurricane!!', 'chazz-princeton', 1,
          buildDeck(['Ojama Green', 'Ojama Yellow', 'Ojama Black', 'Ojama Red', 'Ojama Blue', 'Ojamagic', 'Ojama Delta Hurricane!!', 'Ojama Country', 'Polymerization', 'Ojamuscle', 'Tri-Wight', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Ojama Trio'], { race: 'Beast', era: 'GX' }, ['Ojama King', 'Ojama Knight'])
        ),
        makeDeckData('chazz_deck_2', 'Armed Dragon LV3-LV10 Evolution', 'Armed Dragon / LV Series', 'Levels up Armed Dragon from LV3 all the way to the 3000 ATK field-wiping Armed Dragon LV10.', 'chazz-princeton', 2,
          buildDeck(['Armed Dragon LV3', 'Armed Dragon LV5', 'Armed Dragon LV7', 'Armed Dragon LV10', 'Level Up!', 'Level Modulation', 'Dragon Shrine', 'The Grave of Enkindling', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dragon', era: 'GX' })
        ),
        makeDeckData('chazz_deck_3', 'VWXYZ Dragon Catapult Cannon', 'Union Machine / Cannon', 'Combines V-Tiger Jet, W-Wing Catapult, X-Head Cannon, Y-Dragon Head, and Z-Metal Tank.', 'chazz-princeton', 3,
          buildDeck(['V-Tiger Jet', 'W-Wing Catapult', 'X-Head Cannon', 'Y-Dragon Head', 'Z-Metal Tank', 'Frontline Base', 'Limiter Removal', 'Roll Out!', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' }, ['VWXYZ-Dragon Catapult Cannon', 'VW-Tiger Catapult', 'XYZ-Dragon Cannon'])
        ),
        makeDeckData('chazz_deck_4', 'Light and Darkness Dragon Dominion', 'Dragon / Omni-Negate', 'Summons Light and Darkness Dragon to negate opponent spells, traps, and monster effects 4 times.', 'chazz-princeton', 4,
          buildDeck(['Light and Darkness Dragon', 'Ojama Blue', 'Ojama Red', 'Ojamagic', 'Treeborn Frog', 'Soul Exchange', 'Foolish Burial', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' })
        ),
        makeDeckData('chazz_deck_5', 'Ojama Armed Dragon Chaos', 'Ojama & Armed Dragon Synergy', 'Discards Ojamagic with Armed Dragon LV5/LV7 to search all 3 Ojamas and trigger Delta Hurricane.', 'chazz-princeton', 5,
          buildDeck(['Armed Dragon LV5', 'Armed Dragon LV7', 'Ojama Green', 'Ojama Yellow', 'Ojama Black', 'Ojamagic', 'Ojama Delta Hurricane!!', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' }, ['Ojama King', 'Ojama Knight'])
        ),
        makeDeckData('chazz_deck_6', 'Ojama Country ATK/DEF Swap', 'Beast ATK Swap', 'Ojama Country swaps the original ATK and DEF of all monsters, turning 3000 DEF Ojama King into 3000 ATK.', 'chazz-princeton', 6,
          buildDeck(['Ojama Country', 'Ojama Blue', 'Ojama Red', 'Ojama Green', 'Ojama Yellow', 'Ojama Black', 'Polymerization', 'Tri-Wight', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Beast', era: 'GX' }, ['Ojama King', 'Ojama Knight'])
        ),
        makeDeckData('chazz_deck_7', 'V-to-Z Union Machine Fleet', 'Union Machine Fleet', 'Fast union assembly using Frontline Base and Heavy Mech Support.', 'chazz-princeton', 7,
          buildDeck(['V-Tiger Jet', 'W-Wing Catapult', 'X-Head Cannon', 'Y-Dragon Head', 'Z-Metal Tank', 'Heavy Mech Support Platform', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'GX' }, ['VWXYZ-Dragon Catapult Cannon', 'VW-Tiger Catapult'])
        ),
        makeDeckData('chazz_deck_8', 'Ojama Knight Zone Lock', 'Zone Lockdown', 'Ojama Knight blocks 2 monster zones to starve opponent summon options.', 'chazz-princeton', 8,
          buildDeck(['Ojama Red', 'Ojama Blue', 'Ojama Green', 'Ojama Yellow', 'Ojama Black', 'Polymerization', 'Ojamagic', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Beast', era: 'GX' }, ['Ojama Knight', 'Ojama King'])
        ),
        makeDeckData('chazz_deck_9', 'Chazz It Up! Armed Thunder', 'Armed Dragon Beatdown', 'Fast discard and level escalation with Armed Dragon LV3, LV5, and LV7.', 'chazz-princeton', 9,
          buildDeck(['Armed Dragon LV3', 'Armed Dragon LV5', 'Armed Dragon LV7', 'Armed Dragon LV10', 'Dragon Shrine', 'Level Up!', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dragon', era: 'GX' })
        ),
        makeDeckData('chazz_deck_10', 'Chazz\'s Ultimate Tri-Force Supreme', 'Master Chazz Trio', 'Chazz\'s supreme deck uniting Ojamas, Armed Dragons, and VWXYZ machines.', 'chazz-princeton', 10,
          buildDeck(['Armed Dragon LV7', 'Armed Dragon LV10', 'Ojama Green', 'Ojama Yellow', 'Ojama Black', 'Ojamagic', 'Ojama Delta Hurricane!!', 'Ojama Country', 'Polymerization', 'Light and Darkness Dragon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' }, ['Ojama King', 'Ojama Knight', 'VWXYZ-Dragon Catapult Cannon'])
        ),
      ],
    },

    // 5. Alexis Rhodes
    {
      id: 'alexis-rhodes',
      name: 'Alexis Rhodes',
      series: 'GX',
      title: 'Queen of Obelisk Blue',
      tagline: 'Cyber Angel Rituals & Ice Ballet',
      description: 'The top female duelist at Duel Academy. Alexis performs graceful ice ballet with Cyber Blader and unleashes the divine Cyber Angel ritual goddesses.',
      avatar: 'resources/characters/portraits/alexis-rhodes.png',
      video: 'resources/videos/characters/alexis-rhodes.mp4',
      themeColor: '#2f80ed',
      decks: [
        makeDeckData('alexis_deck_1', 'Cyber Angel Ritual Goddesses', 'Cyber Angel / Fairy Ritual', 'Summons Cyber Angel Benten, Idaten, and Dakini with Ritual Sanctuary and Machine Angel Ritual.', 'alexis-rhodes', 1,
          buildDeck(['Cyber Angel Benten', 'Cyber Angel Idaten', 'Cyber Angel Dakini', 'Cyber Angel Vrash', 'Cyber Petit Angel', 'Manju of the Ten Thousand Hands', 'Sonic Bird', 'Senju of the Thousand Hands', 'Machine Angel Ritual', 'Machine Angel Absolute Ritual', 'Ritual Sanctuary', 'Preparation of Rites', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fairy', era: 'GX' })
        ),
        makeDeckData('alexis_deck_2', 'Cyber Tutu & Cyber Blader Ballet', 'Warrior Fusion / Ballet', 'Fuses Etoile Cyber and Blade Skater into Cyber Blader for lock effects based on opponent monsters.', 'alexis-rhodes', 2,
          buildDeck(['Blade Skater', 'Etoile Cyber', 'Cyber Tutu', 'Cyber Gymnast', 'Cyber Prima', 'Polymerization', 'Fusion Sage', 'Fusion Weapon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Doble Passe'], { race: 'Warrior', era: 'GX' }, ['Cyber Blader'])
        ),
        makeDeckData('alexis_deck_3', 'White Night Dragon Blizzard', 'Dragon / Ice Beatdown', 'Commands the 3000 ATK White Night Dragon that negates targeted spells and traps.', 'alexis-rhodes', 3,
          buildDeck(['White Night Dragon', 'White Night Queen', 'Blizzard Dragon', 'Dragon Shrine', 'Trade-In', 'Cards of Consonance', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dragon', era: 'GX' })
        ),
        makeDeckData('alexis_deck_4', 'Cyber Angel Dakini Removal', 'Non-Targeting Send to GY', 'Dakini forces the opponent to send one of their own monsters to the GY upon ritual summon.', 'alexis-rhodes', 4,
          buildDeck(['Cyber Angel Dakini', 'Cyber Angel Benten', 'Cyber Angel Idaten', 'Machine Angel Ritual', 'Ritual Sanctuary', 'Manju of the Ten Thousand Hands', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fairy', era: 'GX' })
        ),
        makeDeckData('alexis_deck_5', 'Cyber Prima Spell Destruction', 'Spell Wipe on Summon', 'Cyber Prima destroys all face-up spell cards on the field upon tribute summon.', 'alexis-rhodes', 5,
          buildDeck(['Cyber Prima', 'Cyber Tutu', 'Cyber Gymnast', 'Doble Passe', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'GX' })
        ),
        makeDeckData('alexis_deck_6', 'Ritual Sanctuary Fairy Engine', 'Spell Recycle & Ritual Search', 'Discards spells with Ritual Sanctuary to search Ritual Monsters and revive LIGHT Fairies.', 'alexis-rhodes', 6,
          buildDeck(['Ritual Sanctuary', 'Cyber Angel Benten', 'Cyber Petit Angel', 'Machine Angel Ritual', 'Terraforming', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fairy', era: 'GX' })
        ),
        makeDeckData('alexis_deck_7', 'Cyber Gymnast Monster Snipe', 'Discard Monster Destruction', 'Discards a card with Cyber Gymnast to destroy any opponent Attack Position monster.', 'alexis-rhodes', 7,
          buildDeck(['Cyber Gymnast', 'Cyber Tutu', 'Blade Skater', 'Etoile Cyber', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Warrior', era: 'GX' }, ['Cyber Blader'])
        ),
        makeDeckData('alexis_deck_8', 'Cyber Angel Vrash Apocalypse', 'Board Clear & Multi-Attack', 'Destroys all opponent Extra Deck monsters, burns 1000 for each, and attacks twice.', 'alexis-rhodes', 8,
          buildDeck(['Cyber Angel Vrash', 'Cyber Angel Dakini', 'Cyber Angel Benten', 'Machine Angel Absolute Ritual', 'Ritual Sanctuary', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fairy', era: 'GX' })
        ),
        makeDeckData('alexis_deck_9', 'Doble Passe Counter Strike', 'Direct Damage Retaliation', 'Doble Passe redirects an attack directly to Alexis and allows her monster to strike back directly.', 'alexis-rhodes', 9,
          buildDeck(['Doble Passe', 'Blade Skater', 'Etoile Cyber', 'Cyber Blader', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' }, ['Cyber Blader'])
        ),
        makeDeckData('alexis_deck_10', 'Alexis\'s Ultimate Machine Angel Queen', 'Master Cyber Angel', 'Alexis\'s supreme tournament deck uniting Cyber Angel Benten, Dakini, Vrash, and Cyber Blader.', 'alexis-rhodes', 10,
          buildDeck(['Cyber Angel Dakini', 'Cyber Angel Benten', 'Cyber Angel Idaten', 'Cyber Angel Vrash', 'Machine Angel Ritual', 'Ritual Sanctuary', 'Cyber Petit Angel', 'Blade Skater', 'Etoile Cyber', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' }, ['Cyber Blader'])
        ),
      ],
    },

    // 6. Bastion Misawa
    {
      id: 'bastion-misawa',
      name: 'Bastion Misawa',
      series: 'GX',
      title: 'The Formula Tactician',
      tagline: 'Water Dragon Chemistry & Six Attribute Decks',
      description: 'The analytical genius of Ra Yellow who created six distinct decks to counter every attribute. Commands Hydrogeddon, Bonding H2O, and Water Dragon.',
      avatar: 'resources/characters/portraits/bastion-misawa.png',
      video: 'resources/videos/characters/bastion-misawa.mp4',
      themeColor: '#f2c94c',
      decks: [
        makeDeckData('bastion_deck_1', 'Water Dragon & Chemical Bonding', 'Dinosaur / Sea Serpent / Chemistry', 'Combines 2 Hydrogeddons and 1 Oxygeddon with Bonding - H2O to summon Water Dragon.', 'bastion-misawa', 1,
          buildDeck(['Hydrogeddon', 'Oxygeddon', 'Water Dragon', 'Bonding - H2O', 'Carboneddon', 'Hyozanryu', 'Mathematician', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Torrential Tribute', 'A Hero Emerges'], { race: 'Dinosaur', era: 'GX' })
        ),
        makeDeckData('bastion_deck_2', 'Litmus Doom Swordsman Ritual', 'Ritual / Trap Immunity', 'Summons Litmus Doom Swordsman, completely immune to traps and monster battle destruction.', 'bastion-misawa', 2,
          buildDeck(['Litmus Doom Swordsman', 'Litmus Doom Ritual', 'Manju of the Ten Thousand Hands', 'Senju of the Thousand Hands', 'Sonic Bird', 'Imperial Order', 'Royal Decree', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'GX' })
        ),
        makeDeckData('bastion_deck_3', 'Carboneddon & Dragon Awakening', 'Dinosaur & Dragon Synergy', 'Sends Carboneddon to the GY to special summon high-level Dragon monsters from the deck.', 'bastion-misawa', 3,
          buildDeck(['Carboneddon', 'Hyozanryu', 'Hydrogeddon', 'Mathematician', 'Foolish Burial', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' })
        ),
        makeDeckData('bastion_deck_4', 'Hydrogeddon Battle Swarm', 'Dinosaur Swarm', 'When Hydrogeddon destroys an opponent monster, it summons another Hydrogeddon from the deck.', 'bastion-misawa', 4,
          buildDeck(['Hydrogeddon', 'Oxygeddon', 'Water Dragon', 'Bonding - H2O', 'Jurassic World', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dinosaur', era: 'GX' })
        ),
        makeDeckData('bastion_deck_5', 'Oxygeddon Pyro Burn', 'Pyro Destruction Burn', 'When destroyed by a Pyro monster, Oxygeddon inflicts 800 damage to both players.', 'bastion-misawa', 5,
          buildDeck(['Oxygeddon', 'Hydrogeddon', 'Water Dragon', 'Bonding - H2O', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dinosaur', era: 'GX' })
        ),
        makeDeckData('bastion_deck_6', 'Earth Magnet Warriors Formula', 'Earth Warrior & Rock', 'Bastion\'s calculated Earth deck utilizing Magnet Warriors and Ground Collapse.', 'bastion-misawa', 6,
          buildDeck(['Alpha The Magnet Warrior', 'Beta The Magnet Warrior', 'Gamma The Magnet Warrior', 'Valkyrion the Magna Warrior', 'Ground Collapse', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { attribute: 'EARTH', era: 'GX' })
        ),
        makeDeckData('bastion_deck_7', 'Fire Dragon & Plasma Heat', 'Fire Beatdown', 'Bastion\'s Fire deck designed to burn through defensive walls with blistering heat.', 'bastion-misawa', 7,
          buildDeck(['Solar Flare Dragon', 'Lava Golem', 'Fire Trooper', 'Oxygeddon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { attribute: 'FIRE', era: 'GX' })
        ),
        makeDeckData('bastion_deck_8', 'Wind & Lightning Formula', 'Wind Spell & Trap Control', 'Bastion\'s Wind deck controlling air currents to bounce opponent monsters.', 'bastion-misawa', 8,
          buildDeck(['Harpie Lady 1', 'Cyber Harpie Lady', 'Windstorm of Etaqua', 'Icarus Attack', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { attribute: 'WIND', era: 'GX' })
        ),
        makeDeckData('bastion_deck_9', 'Mathematician Precision Milling', 'Spellcaster Precision', 'Mathematician sends any Level 4 or lower monster from deck to GY on summon.', 'bastion-misawa', 9,
          buildDeck(['Mathematician', 'Carboneddon', 'Hydrogeddon', 'Sangan', 'Foolish Burial', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('bastion_deck_10', 'Bastion\'s Ultimate Seventh Formula', 'Master Chemical Synthesis', 'Bastion\'s ultimate combination of Water Dragon, Litmus Doom Swordsman, and Carboneddon.', 'bastion-misawa', 10,
          buildDeck(['Water Dragon', 'Bonding - H2O', 'Hydrogeddon', 'Oxygeddon', 'Litmus Doom Swordsman', 'Litmus Doom Ritual', 'Carboneddon', 'Hyozanryu', 'Mathematician', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' })
        ),
      ],
    },

    // 7. Chumley Huffington
    {
      id: 'chumley-huffington',
      name: 'Chumley Huffington',
      series: 'GX',
      title: 'Beast Master of the Australian Outback',
      tagline: 'Master of Oz & Ayers Rock Sunrise',
      description: 'The laid-back Australian student and passionate card designer. Chumley commands massive Outback beasts, Des Koalas, and the 4200 ATK Master of Oz.',
      avatar: 'resources/characters/portraits/chumley-huffington.png',
      video: 'resources/videos/characters/chumley-huffington.mp4',
      themeColor: '#eb5757',
      decks: [
        makeDeckData('chumley_deck_1', 'Master of Oz Outback Beasts', 'Beast / Fusion Beatdown', 'Fuses Big Koala and Des Kangaroo into the colossal 4200 ATK Master of Oz with Ayers Rock Sunrise.', 'chumley-huffington', 1,
          buildDeck(['Big Koala', 'Des Kangaroo', 'Des Koala', 'Sea Koala', 'Tree Otter', 'Ayers Rock Sunrise', 'Wild Nature\'s Release', 'Polymerization', 'Fusion Sage', 'Nimble Momonga', 'Behemoth the King of All Animals', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Beast', era: 'GX' }, ['Master of Oz', 'Koalo-Koala'])
        ),
        makeDeckData('chumley_deck_2', 'Des Koala Flip Burn', 'Beast / Flip Burn', 'Flips Des Koala to inflict 400 damage per card in the opponent\'s hand.', 'chumley-huffington', 2,
          buildDeck(['Des Koala', 'Nimble Momonga', 'Morphing Jar', 'Ayers Rock Sunrise', 'Book of Moon', 'Swords of Revealing Light', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Beast', era: 'GX' })
        ),
        makeDeckData('chumley_deck_3', 'Wild Nature\'s Release OTK', 'Beast ATK Surge', 'Wild Nature\'s Release boosts a Beast\'s ATK by its DEF for a game-ending blow.', 'chumley-huffington', 3,
          buildDeck(['Big Koala', 'Des Kangaroo', 'Master of Oz', 'Wild Nature\'s Release', 'Ayers Rock Sunrise', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Beast', era: 'GX' }, ['Master of Oz'])
        ),
        makeDeckData('chumley_deck_4', 'Ayers Rock Sunrise Rebirth', 'Beast Rebirth & ATK Drain', 'Revives a Beast from the GY and reduces all opponent monsters\' ATK by 200 per Beast in the GY.', 'chumley-huffington', 4,
          buildDeck(['Ayers Rock Sunrise', 'Big Koala', 'Des Kangaroo', 'Des Koala', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Beast', era: 'GX' }, ['Master of Oz'])
        ),
        makeDeckData('chumley_deck_5', 'Nimble Momonga LP Swarm', 'Beast LP Gain & Swarm', 'Nimble Momonga gains 1000 LP and special summons 2 more Momongas upon destruction.', 'chumley-huffington', 5,
          buildDeck(['Nimble Momonga', 'Des Koala', 'Ayers Rock Sunrise', 'Solemn Wishes', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Beast', era: 'GX' })
        ),
        makeDeckData('chumley_deck_6', 'Sea Koala & Tree Otter Team', 'Beast Debuff Tag-Team', 'Sea Koala drops an opponent monster\'s ATK to 0 while Tree Otter boosts ATK by 1000.', 'chumley-huffington', 6,
          buildDeck(['Sea Koala', 'Tree Otter', 'Big Koala', 'Des Kangaroo', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Beast', era: 'GX' }, ['Koalo-Koala', 'Master of Oz'])
        ),
        makeDeckData('chumley_deck_7', 'Behemoth King of All Animals', 'Beast Tribute Search', 'Tribute summons Behemoth to return multiple Beasts from the Graveyard to the hand.', 'chumley-huffington', 7,
          buildDeck(['Behemoth the King of All Animals', 'Nimble Momonga', 'Des Koala', 'Ayers Rock Sunrise', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Beast', era: 'GX' })
        ),
        makeDeckData('chumley_deck_8', 'Green Baboon Forest Defender', 'Beast Special Summon from Hand/GY', 'Special summons Green Baboon, Defender of the Forest whenever a Beast is destroyed.', 'chumley-huffington', 8,
          buildDeck(['Green Baboon, Defender of the Forest', 'Nimble Momonga', 'Des Koala', 'Big Koala', 'Ayers Rock Sunrise', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Beast', era: 'GX' })
        ),
        makeDeckData('chumley_deck_9', 'Eucalyptus Outback Stampede', 'Beast Aggro', 'Fast beast aggression with Ox, Koala, and Kangaroo power.', 'chumley-huffington', 9,
          buildDeck(['Big Koala', 'Des Kangaroo', 'Nimble Momonga', 'Wild Nature\'s Release', 'Ayers Rock Sunrise', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Beast', era: 'GX' }, ['Master of Oz'])
        ),
        makeDeckData('chumley_deck_10', 'Chumley\'s Ultimate Outback Masterpiece', 'Master Beast Colossus', 'Chumley\'s supreme tournament deck uniting Master of Oz, Ayers Rock Sunrise, and Baboon.', 'chumley-huffington', 10,
          buildDeck(['Big Koala', 'Des Kangaroo', 'Des Koala', 'Green Baboon, Defender of the Forest', 'Ayers Rock Sunrise', 'Wild Nature\'s Release', 'Polymerization', 'Nimble Momonga', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Beast', era: 'GX' }, ['Master of Oz', 'Koalo-Koala'])
        ),
      ],
    },

    // 8. Aster Phoenix (Edo Phoenix)
    {
      id: 'aster-phoenix',
      name: 'Aster Phoenix',
      series: 'GX',
      title: 'Pro League Destiny Duelist',
      tagline: 'Destiny HERO Plasma & Clock Tower Prison',
      description: 'The top-ranked professional duelist. Aster commands dark Destiny HEROs, the Clock Tower of fate, and the monster-stealing Destiny HERO - Plasma.',
      avatar: 'resources/characters/portraits/aster-phoenix.png',
      video: 'resources/videos/characters/aster-phoenix.mp4',
      themeColor: '#56ccf2',
      decks: [
        makeDeckData('aster_deck_1', 'Destiny HERO Dreadmaster & Clock Tower', 'Destiny HERO / Clock Tower', 'Accumulates Clock Counters on Clock Tower Prison to summon the invincible Dreadmaster.', 'aster-phoenix', 1,
          buildDeck(['Destiny HERO - Dreadmaster', 'Destiny HERO - Plasma', 'Destiny HERO - Dogma', 'Destiny HERO - Malicious', 'Destiny HERO - Diamond Dude', 'Destiny HERO - Dasher', 'Clock Tower Prison', 'Destiny Draw', 'D - Spirit', 'D - Time', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'GX' }, ['Destiny End Dragoon', 'Destiny HERO - Dystopia'])
        ),
        makeDeckData('aster_deck_2', 'Destiny HERO Plasma & Dogma Lockdown', 'Destiny HERO / Anti-Effect', 'Plasma absorbs enemy monsters and negates all monster effects on the opponent\'s field.', 'aster-phoenix', 2,
          buildDeck(['Destiny HERO - Plasma', 'Destiny HERO - Dogma', 'Destiny HERO - Malicious', 'Destiny HERO - Diamond Dude', 'Destiny Draw', 'Allure of Darkness', 'Reinforcement of the Army', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'GX' }, ['Destiny End Dragoon'])
        ),
        makeDeckData('aster_deck_3', 'Destiny End Dragoon Fusion Turbo', 'Destiny HERO Fusion / Burn', 'Fuses Plasma and Dogma into Destiny End Dragoon to destroy monsters and burn for their ATK.', 'aster-phoenix', 3,
          buildDeck(['Destiny HERO - Plasma', 'Destiny HERO - Dogma', 'King of the Swamp', 'Polymerization', 'Fusion Sage', 'Destiny Draw', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Warrior', era: 'GX' }, ['Destiny End Dragoon'])
        ),
        makeDeckData('aster_deck_4', 'Destiny HERO Diamond Dude Spell Turbo', 'Spell Excavation', 'Diamond Dude activates normal spells directly from the deck without paying costs.', 'aster-phoenix', 4,
          buildDeck(['Destiny HERO - Diamond Dude', 'Destiny HERO - Dasher', 'Destiny Draw', 'Raigeki', 'Dark Hole', 'Heavy Storm', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Warrior', era: 'GX' })
        ),
        makeDeckData('aster_deck_5', 'Destiny HERO Malicious Graveyard Swarm', 'Graveyard Swarm', 'Banishes Malicious from the GY to summon another Malicious directly from the deck.', 'aster-phoenix', 5,
          buildDeck(['Destiny HERO - Malicious', 'Destiny HERO - Dasher', 'Destiny Draw', 'Allure of Darkness', 'Foolish Burial', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Warrior', era: 'GX' })
        ),
        makeDeckData('aster_deck_6', 'Vision & Destiny HERO Fusion', 'HERO Fusion', 'Unites Vision HERO Faris with Destiny HEROs for multi-fusion beatdown.', 'aster-phoenix', 6,
          buildDeck(['Vision HERO Faris', 'Vision HERO Increase', 'Vision HERO Vyon', 'Destiny HERO - Malicious', 'Polymerization', 'Destiny Draw', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Warrior', era: 'GX' }, ['Vision HERO Trinity', 'Destiny End Dragoon'])
        ),
        makeDeckData('aster_deck_7', 'D-Time & D-Shield Defense', 'Destiny Trap Defense', 'D-Shield turns Destiny HEROs into indestructible defense shields upon attack.', 'aster-phoenix', 7,
          buildDeck(['D - Time', 'D - Shield', 'Destiny HERO - Diamond Dude', 'Destiny HERO - Dasher', 'Destiny Draw', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'GX' })
        ),
        makeDeckData('aster_deck_8', 'Elemental HERO Shining Phoenix Enforcer', 'Elemental HERO Enforcer', 'Aster\'s alternate HERO deck featuring Phoenix Enforcer and Shining Phoenix Enforcer.', 'aster-phoenix', 8,
          buildDeck(['Elemental HERO Sparkman', 'Elemental HERO Avian', 'Elemental HERO Burstinatrix', 'Polymerization', 'Miracle Fusion', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Warrior', era: 'GX' }, ['Elemental HERO Phoenix Enforcer', 'Elemental HERO Shining Phoenix Enforcer'])
        ),
        makeDeckData('aster_deck_9', 'Destiny HERO Dasher Special Rush', 'Draw Phase Special Summon', 'When a monster is drawn during the Draw Phase, Dasher special summons it immediately.', 'aster-phoenix', 9,
          buildDeck(['Destiny HERO - Dasher', 'Destiny HERO - Plasma', 'Destiny HERO - Dogma', 'Destiny Draw', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Warrior', era: 'GX' })
        ),
        makeDeckData('aster_deck_10', 'Aster\'s Ultimate Destiny Masterpiece', 'Master Destiny HERO', 'Aster\'s supreme tournament deck uniting Plasma, Dogma, Dreadmaster, and Destiny End Dragoon.', 'aster-phoenix', 10,
          buildDeck(['Destiny HERO - Plasma', 'Destiny HERO - Dogma', 'Destiny HERO - Dreadmaster', 'Destiny HERO - Malicious', 'Clock Tower Prison', 'Destiny Draw', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Warrior', era: 'GX' }, ['Destiny End Dragoon'])
        ),
      ],
    },

    // 9. Jesse Anderson (Johan Andersen)
    {
      id: 'jesse-anderson',
      name: 'Jesse Anderson',
      series: 'GX',
      title: 'Champion of the Crystal Beasts',
      tagline: 'Seven Crystal Beasts & Rainbow Dragon',
      description: 'The transfer student from North Academy who communicates with Duel Spirits. Jesse gathers all seven Crystal Beasts to summon Rainbow Dragon.',
      avatar: 'resources/characters/portraits/jesse-anderson.png',
      video: 'resources/videos/characters/jesse-anderson.mp4',
      themeColor: '#56ccf2',
      decks: [
        makeDeckData('jesse_deck_1', 'Seven Crystal Beasts & Rainbow Dragon', 'Crystal Beast / Ultimate Crystal', 'Gathers all seven Crystal Beasts in the Graveyard or field to awaken Rainbow Dragon.', 'jesse-anderson', 1,
          buildDeck(['Crystal Beast Sapphire Pegasus', 'Crystal Beast Topaz Tiger', 'Crystal Beast Ruby Carbuncle', 'Crystal Beast Amber Mammoth', 'Crystal Beast Cobalt Eagle', 'Crystal Beast Amethyst Cat', 'Crystal Beast Emerald Tortoise', 'Rainbow Dragon', 'Crystal Promise', 'Crystal Beacon', 'Crystal Abundance', 'Crystal Tree', 'Ancient City - Rainbow Ruins', 'Rare Value', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' }, ['Rainbow Overdragon'])
        ),
        makeDeckData('jesse_deck_2', 'Crystal Abundance OTK Board Wipe', 'Crystal Beast / Board Wipe', 'Sends 4 Crystal Beasts in the Spell/Trap zone to the GY to wipe the board and swarm the field.', 'jesse-anderson', 2,
          buildDeck(['Crystal Abundance', 'Crystal Beast Sapphire Pegasus', 'Crystal Beast Topaz Tiger', 'Crystal Beast Ruby Carbuncle', 'Ancient City - Rainbow Ruins', 'Crystal Promise', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('jesse_deck_3', 'Ancient City Rainbow Ruins Lockdown', 'Field Spell Lockdown', 'Ancient City unlocks 5 powerful effects as Crystal Beasts fill the Spell/Trap zones.', 'jesse-anderson', 3,
          buildDeck(['Ancient City - Rainbow Ruins', 'Terraforming', 'Crystal Beast Sapphire Pegasus', 'Crystal Beast Ruby Carbuncle', 'Rare Value', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('jesse_deck_4', 'Ruby Carbuncle Special Swarm', 'Crystal Beast Swarm', 'When Ruby Carbuncle is Special Summoned, it summons all Crystal Beasts from the Spell/Trap zone.', 'jesse-anderson', 4,
          buildDeck(['Crystal Beast Ruby Carbuncle', 'Crystal Beast Sapphire Pegasus', 'Crystal Promise', 'Crystal Beacon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('jesse_deck_5', 'Advanced Crystal Beast Darkness', 'Darkness Crystal Beasts', 'Jesse\'s dark persona wielding Advanced Crystal Beasts powered by Advanced Dark.', 'jesse-anderson', 5,
          buildDeck(['Rainbow Dark Dragon', 'Crystal Beast Sapphire Pegasus', 'Crystal Beast Topaz Tiger', 'Allure of Darkness', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' }, ['Rainbow Overdragon'])
        ),
        makeDeckData('jesse_deck_6', 'Sapphire Pegasus Search Turbo', 'Crystal Beast Search Engine', 'Sapphire Pegasus places a Crystal Beast from hand, deck, or GY into the Spell/Trap zone.', 'jesse-anderson', 6,
          buildDeck(['Crystal Beast Sapphire Pegasus', 'Rare Value', 'Crystal Beacon', 'Ancient City - Rainbow Ruins', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('jesse_deck_7', 'Topaz Tiger Battle Assault', 'Crystal Beast Beatdown', 'Topaz Tiger gains 400 ATK when attacking, striking with 2000 ATK as a Level 4.', 'jesse-anderson', 7,
          buildDeck(['Crystal Beast Topaz Tiger', 'Crystal Beast Amber Mammoth', 'Ancient City - Rainbow Ruins', 'Crystal Promise', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('jesse_deck_8', 'Rare Value Draw Engine', 'Crystal Beast Draw', 'Sends 1 Crystal Beast from the Spell/Trap zone to the Graveyard to draw 2 cards.', 'jesse-anderson', 8,
          buildDeck(['Rare Value', 'Crystal Beast Sapphire Pegasus', 'Crystal Beast Ruby Carbuncle', 'Ancient City - Rainbow Ruins', 'Pot of Greed', 'Graceful Charity'], { era: 'GX' })
        ),
        makeDeckData('jesse_deck_9', 'Rainbow Overdragon Fusion Ascension', 'Ultimate Crystal Fusion', 'Fuses 7 Crystal Beasts into the 4000 ATK Rainbow Overdragon to attack all monsters.', 'jesse-anderson', 9,
          buildDeck(['Rainbow Dragon', 'Crystal Beast Sapphire Pegasus', 'Crystal Beast Topaz Tiger', 'Crystal Beast Ruby Carbuncle', 'Polymerization', 'Dragon\'s Mirror', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' }, ['Rainbow Overdragon'])
        ),
        makeDeckData('jesse_deck_10', 'Jesse\'s Ultimate Rainbow Symphony', 'Master Crystal Beast God', 'Jesse\'s supreme tournament deck uniting all 7 Crystal Beasts, Rainbow Dragon, and Abundance.', 'jesse-anderson', 10,
          buildDeck(['Rainbow Dragon', 'Crystal Beast Sapphire Pegasus', 'Crystal Beast Topaz Tiger', 'Crystal Beast Ruby Carbuncle', 'Crystal Beast Amber Mammoth', 'Crystal Beast Cobalt Eagle', 'Crystal Beast Amethyst Cat', 'Crystal Beast Emerald Tortoise', 'Ancient City - Rainbow Ruins', 'Crystal Abundance', 'Crystal Promise', 'Rare Value', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' }, ['Rainbow Overdragon'])
        ),
      ],
    },

    // 10. Dr. Vellian Crowler
    {
      id: 'vellian-crowler',
      name: 'Dr. Vellian Crowler',
      series: 'GX',
      title: 'Head Professor of Duel Academy',
      tagline: 'Ancient Gear Golem & Geartown Industry',
      description: 'The eccentric Department Chair of Obelisk Blue. Crowler overwhelms students with Ancient Gear Golems that prevent spells and traps during battle.',
      avatar: 'resources/characters/portraits/vellian-crowler.png',
      video: 'resources/videos/characters/vellian-crowler.mp4',
      themeColor: '#9b51e0',
      decks: [
        makeDeckData('crowler_deck_1', 'Ancient Gear Golem & Castle', 'Ancient Gear / Machine Beatdown', 'Commands Ancient Gear Golem with Ancient Gear Castle and pierces defense with 3000 ATK.', 'vellian-crowler', 1,
          buildDeck(['Ancient Gear Golem', 'Ancient Gear Beast', 'Ancient Gear Engineer', 'Ancient Gear Soldier', 'Ancient Gear Knight', 'Ancient Gear Castle', 'Ancient Gear Workshop', 'Ancient Gear Drill', 'Limiter Removal', 'Heavy Storm', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' }, ['Ultimate Ancient Gear Golem', 'Ancient Gear Megaton Golem'])
        ),
        makeDeckData('crowler_deck_2', 'Ultimate Ancient Gear Golem Fusion', 'Machine Fusion Piercing', 'Fuses Ancient Gear Golem with 2 Ancient Gear monsters into the 4400 ATK Ultimate Ancient Gear Golem.', 'crowler_deck_2', 2,
          buildDeck(['Ancient Gear Golem', 'Ancient Gear Beast', 'Ancient Gear Engineer', 'Polymerization', 'Power Bond', 'Overload Fusion', 'Fusion Sage', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'GX' }, ['Ultimate Ancient Gear Golem', 'Ancient Gear Megaton Golem'])
        ),
        makeDeckData('crowler_deck_3', 'Geartown Demolition Turbo', 'Field Spell Special Summon', 'When Geartown is destroyed, it special summons Ancient Gear Golem directly from the deck.', 'vellian-crowler', 3,
          buildDeck(['Geartown', 'Ancient Gear Golem', 'Terraforming', 'Heavy Storm', 'Mystical Space Typhoon', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'GX' })
        ),
        makeDeckData('crowler_deck_4', 'Ancient Gear Castle Tribute Counters', 'Tribute Counter Engine', 'Ancient Gear Castle accumulates counters on Normal Summons to substitute for tributes.', 'vellian-crowler', 4,
          buildDeck(['Ancient Gear Castle', 'Ancient Gear Golem', 'Ancient Gear Beast', 'Ancient Gear Soldier', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'GX' })
        ),
        makeDeckData('crowler_deck_5', 'Ancient Gear Beast Effect Negation', 'Monster Effect Negation', 'Ancient Gear Beast negates the effects of any monster it destroys in battle.', 'vellian-crowler', 5,
          buildDeck(['Ancient Gear Beast', 'Ancient Gear Golem', 'Ancient Gear Castle', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' })
        ),
        makeDeckData('crowler_deck_6', 'Ancient Gear Engineer Trap Destruction', 'Trap Destruction on Attack', 'Ancient Gear Engineer destroys face-up Traps after attacking and cannot be targeted by Traps.', 'vellian-crowler', 6,
          buildDeck(['Ancient Gear Engineer', 'Ancient Gear Golem', 'Ancient Gear Castle', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'GX' })
        ),
        makeDeckData('crowler_deck_7', 'Ancient Gear Drill Spell Fetch', 'Spell Placement Engine', 'Discards a card with Ancient Gear Drill to set any Spell Card directly from the deck.', 'vellian-crowler', 7,
          buildDeck(['Ancient Gear Drill', 'Ancient Gear Golem', 'Power Bond', 'Raigeki', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'GX' })
        ),
        makeDeckData('crowler_deck_8', 'Ancient Gear Workshop Graveyard Salvage', 'Machine Salvage', 'Adds an Ancient Gear monster from the Graveyard directly back to the hand.', 'vellian-crowler', 8,
          buildDeck(['Ancient Gear Workshop', 'Ancient Gear Golem', 'Ancient Gear Beast', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Machine', era: 'GX' })
        ),
        makeDeckData('crowler_deck_9', 'Power Bond Mechanical Fortress', 'Power Bond Machine OTK', 'Doubles Ancient Gear Golem\'s ATK to 6000 with Power Bond for unstoppable destruction.', 'crowler_deck_9', 9,
          buildDeck(['Power Bond', 'Ancient Gear Golem', 'Ancient Gear Beast', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' }, ['Ultimate Ancient Gear Golem'])
        ),
        makeDeckData('crowler_deck_10', 'Crowler\'s Ultimate Antique Gear Master', 'Master Ancient Gear Industry', 'Crowler\'s supreme tournament deck uniting Geartown, Ultimate Golem, and Power Bond.', 'vellian-crowler', 10,
          buildDeck(['Ancient Gear Golem', 'Ancient Gear Beast', 'Ancient Gear Castle', 'Geartown', 'Power Bond', 'Polymerization', 'Limiter Removal', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Machine', era: 'GX' }, ['Ultimate Ancient Gear Golem', 'Ancient Gear Megaton Golem'])
        ),
      ],
    },

    // 11. Atticus Rhodes (Fubuki) (NEW)
    {
      id: 'atticus-rhodes',
      name: 'Atticus Rhodes',
      series: 'GX',
      title: 'The Charismatic Red-Eyes Idol',
      tagline: 'Red-Eyes Darkness Dragon & Dragon Roar',
      description: 'Alexis\'s flashy older brother and top Obelisk Blue duelist. Atticus commands Red-Eyes Darkness Dragon, Dragon\'s Roar, and soaring draconic firepower.',
      avatar: 'resources/characters/portraits/atticus-rhodes.png',
      video: 'resources/videos/characters/atticus-rhodes.mp4',
      themeColor: '#2f80ed',
      decks: [
        makeDeckData('atticus_deck_1', 'Red-Eyes Darkness Dragon Dominance', 'Red-Eyes / Dragon Beatdown', 'Tributes Red-Eyes B. Dragon to summon Red-Eyes Darkness Dragon, gaining 300 ATK per dragon in the GY.', 'atticus-rhodes', 1,
          buildDeck(['Red-Eyes B. Dragon', 'Red-Eyes Darkness Dragon', 'Red-Eyes Wyvern', 'Black Metal Dragon', 'Dragon Shrine', 'Return of the Red-Eyes', 'Polymerization', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dragon', era: 'GX' }, ['Meteor Black Dragon', 'Black Skull Dragon'])
        ),
        makeDeckData('atticus_deck_2', 'Red-Eyes Wyvern Graveyard Rebirth', 'Dragon Rebirth Engine', 'Banishes Red-Eyes Wyvern during the End Phase to revive Red-Eyes B. Dragon from the GY.', 'atticus-rhodes', 2,
          buildDeck(['Red-Eyes Wyvern', 'Red-Eyes B. Dragon', 'Dragon Shrine', 'Cards of Red Stone', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dragon', era: 'GX' })
        ),
        makeDeckData('atticus_deck_3', 'Meteor Black Dragon Classic Fusion', 'Dragon Fusion Aggro', 'Fuses Red-Eyes B. Dragon and Meteor Dragon into the 3500 ATK Meteor Black Dragon.', 'atticus-rhodes', 3,
          buildDeck(['Red-Eyes B. Dragon', 'Meteor Dragon', 'Polymerization', 'Dragon\'s Mirror', 'Fusion Sage', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dragon', era: 'GX' }, ['Meteor Black Dragon'])
        ),
        makeDeckData('atticus_deck_4', 'Mirage Dragon Attack Trap Lock', 'Dragon Trap Lockdown', 'While Mirage Dragon is on the field, opponent cannot activate Trap Cards during the Battle Phase.', 'atticus-rhodes', 4,
          buildDeck(['Mirage Dragon', 'Red-Eyes B. Dragon', 'Spear Dragon', 'Dragon Shrine', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dragon', era: 'GX' })
        ),
        makeDeckData('atticus_deck_5', 'Cards of Red Stone Draw Engine', 'Red-Eyes Draw Engine', 'Sends a Level 7 Red-Eyes monster from hand to GY to draw 2 cards and mill another Dragon.', 'atticus-rhodes', 5,
          buildDeck(['Cards of Red Stone', 'Red-Eyes B. Dragon', 'Red-Eyes Wyvern', 'Dragon Shrine', 'Pot of Greed', 'Graceful Charity'], { race: 'Dragon', era: 'GX' })
        ),
        makeDeckData('atticus_deck_6', 'Red-Eyes Spirit Resurrection', 'Trap Dragon Revival', 'Red-Eyes Spirit targets and revives any Red-Eyes monster from the Graveyard.', 'atticus-rhodes', 6,
          buildDeck(['Red-Eyes Spirit', 'Return of the Red-Eyes', 'Red-Eyes B. Dragon', 'Red-Eyes Darkness Dragon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dragon', era: 'GX' })
        ),
        makeDeckData('atticus_deck_7', 'Dragon\'s Roar Quick-Play Rush', 'Banish Quick-Play Dragon', 'Banishes a Dragon from the GY to special summon a Dragon from the deck until End Phase.', 'atticus-rhodes', 7,
          buildDeck(['Red-Eyes B. Dragon', 'Red-Eyes Wyvern', 'Dragon Shrine', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dragon', era: 'GX' })
        ),
        makeDeckData('atticus_deck_8', 'Red-Eyes Black Dragon Sword Hermos', 'Hermos Equip Fusion', 'The Claw of Hermos fuses with Red-Eyes to create the Red-Eyes Black Dragon Sword.', 'atticus-rhodes', 8,
          buildDeck(['The Claw of Hermos', 'Red-Eyes B. Dragon', 'Red-Eyes Wyvern', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' }, ['Red-Eyes Black Dragon Sword'])
        ),
        makeDeckData('atticus_deck_9', 'Shining Dragon Wings Idols', 'Dragon Beatdown', 'Fast aggressive dragon attacks backed by Stamping Destruction.', 'atticus-rhodes', 9,
          buildDeck(['Red-Eyes B. Dragon', 'Red-Eyes Darkness Dragon', 'Mirage Dragon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dragon', era: 'GX' })
        ),
        makeDeckData('atticus_deck_10', 'Atticus\'s Ultimate Red-Eyes Starlight', 'Master Red-Eyes Darkness', 'Atticus\'s supreme deck combining Red-Eyes Darkness Dragon, Wyvern, and Meteor Black Dragon.', 'atticus-rhodes', 10,
          buildDeck(['Red-Eyes B. Dragon', 'Red-Eyes Darkness Dragon', 'Red-Eyes Wyvern', 'Cards of Red Stone', 'Return of the Red-Eyes', 'Polymerization', 'Dragon Shrine', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dragon', era: 'GX' }, ['Meteor Black Dragon', 'Red-Eyes Black Dragon Sword'])
        ),
      ],
    },

    // 12. Tyranno Hassleberry (NEW)
    {
      id: 'tyranno-hassleberry',
      name: 'Tyranno Hassleberry',
      series: 'GX',
      title: 'The Dino-DNA Sergeant',
      tagline: 'Ultimate Tyranno & Jurassic World',
      description: 'The energetic sergeant of Ra Yellow with a dinosaur bone in his leg. Hassleberry leads his prehistoric squad with Ultimate Tyranno and Babycerasaurus.',
      avatar: 'resources/characters/portraits/tyranno-hassleberry.png',
      video: 'resources/videos/characters/tyranno-hassleberry.mp4',
      themeColor: '#eb5757',
      decks: [
        makeDeckData('hassleberry_deck_1', 'Ultimate Tyranno Jurassic Stomp', 'Dinosaur / Jurassic Beatdown', 'Ultimate Tyranno attacks every monster on the opponent\'s field in a single Battle Phase.', 'tyranno-hassleberry', 1,
          buildDeck(['Ultimate Tyranno', 'Super Conductor Tyranno', 'Babycerasaurus', 'Miracle Jurassic Egg', 'Jurassic World', 'Ultra Evolution Pill', 'Tail Swipe', 'Survival Instinct', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dinosaur', era: 'GX' })
        ),
        makeDeckData('hassleberry_deck_2', 'Babycerasaurus Destruction Search', 'Dinosaur Destruction Search', 'When destroyed by card effect, Babycerasaurus special summons any Level 4 or lower Dinosaur from deck.', 'tyranno-hassleberry', 2,
          buildDeck(['Babycerasaurus', 'Ultimate Tyranno', 'Jurassic World', 'Tail Swipe', 'Dark Hole', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dinosaur', era: 'GX' })
        ),
        makeDeckData('hassleberry_deck_3', 'Super Conductor Tyranno Railgun', 'Dinosaur Direct Burn', 'Tributes a Dinosaur with Super Conductor Tyranno to blast 1000 direct damage.', 'tyranno-hassleberry', 3,
          buildDeck(['Super Conductor Tyranno', 'Babycerasaurus', 'Miracle Jurassic Egg', 'Jurassic World', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dinosaur', era: 'GX' })
        ),
        makeDeckData('hassleberry_deck_4', 'Miracle Jurassic Egg Invulnerability', 'Dinosaur Egg Counters', 'Miracle Jurassic Egg cannot be destroyed in battle and hatches into giant dinosaurs upon tribute.', 'tyranno-hassleberry', 4,
          buildDeck(['Miracle Jurassic Egg', 'Ultimate Tyranno', 'Babycerasaurus', 'Jurassic World', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dinosaur', era: 'GX' })
        ),
        makeDeckData('hassleberry_deck_5', 'Ultra Evolution Pill Rapid Hatch', 'Dinosaur Special Summon', 'Tributes Reptiles to hatch giant Dinosaurs directly from the hand.', 'tyranno-hassleberry', 5,
          buildDeck(['Ultra Evolution Pill', 'Ultimate Tyranno', 'Super Conductor Tyranno', 'Jurassic World', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dinosaur', era: 'GX' })
        ),
        makeDeckData('hassleberry_deck_6', 'Survival Instinct Dinosaur Banish', 'Banish LP Recovery', 'Banishes Dinosaurs from the GY to restore 400 LP per dinosaur and fuel Tyranno Infinity.', 'tyranno-hassleberry', 6,
          buildDeck(['Survival Instinct', 'Tyranno Infinity', 'Babycerasaurus', 'Jurassic World', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dinosaur', era: 'GX' })
        ),
        makeDeckData('hassleberry_deck_7', 'Tail Swipe Multi-Bounce', 'Dinosaur Mass Bounce', 'Level 5+ Dinosaurs swipe their tails to return up to 2 lower-level opponent monsters to hand.', 'tyranno-hassleberry', 7,
          buildDeck(['Tail Swipe', 'Ultimate Tyranno', 'Super Conductor Tyranno', 'Jurassic World', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dinosaur', era: 'GX' })
        ),
        makeDeckData('hassleberry_deck_8', 'Jurassic World Field Fortress', 'Field Dinosaur Boost', 'Jurassic World boosts all Dinosaurs by 300 ATK and DEF.', 'tyranno-hassleberry', 8,
          buildDeck(['Jurassic World', 'Terraforming', 'Hydrogeddon', 'Babycerasaurus', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dinosaur', era: 'GX' })
        ),
        makeDeckData('hassleberry_deck_9', 'Hydrogeddon Dino Squad', 'Dinosaur Battle Swarm', 'Hydrogeddon swarms the field upon battle destruction.', 'tyranno-hassleberry', 9,
          buildDeck(['Hydrogeddon', 'Oxygeddon', 'Ultimate Tyranno', 'Jurassic World', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dinosaur', era: 'GX' })
        ),
        makeDeckData('hassleberry_deck_10', 'Hassleberry\'s Ultimate Dino-DNA Roar', 'Master Dinosaur Sergeant', 'Hassleberry\'s supreme tournament deck uniting Ultimate Tyranno, Super Conductor, and Babycerasaurus.', 'tyranno-hassleberry', 10,
          buildDeck(['Ultimate Tyranno', 'Super Conductor Tyranno', 'Babycerasaurus', 'Miracle Jurassic Egg', 'Jurassic World', 'Ultra Evolution Pill', 'Tail Swipe', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dinosaur', era: 'GX' })
        ),
      ],
    },

    // 13. Jim Crocodile Cook (NEW)
    {
      id: 'jim-crocodile-cook',
      name: 'Jim Crocodile Cook',
      series: 'GX',
      title: 'Fossil Excavation Specialist',
      tagline: 'Fossil Fusion & Ancient Skull Giants',
      description: 'The Australian archaeologist duelist who travels with his crocodile Shirley. Jim excavates monster bones from both graveyards with Fossil Fusion.',
      avatar: 'resources/characters/portraits/jim-crocodile-cook.png',
      video: 'resources/videos/characters/jim-crocodile-cook.mp4',
      themeColor: '#8c6e16',
      decks: [
        makeDeckData('jim_deck_1', 'Fossil Fusion Ancient Excavation', 'Rock / Fossil Fusion', 'Banishes monsters from both Graveyards with Fossil Fusion to summon prehistoric Skull kings.', 'jim-crocodile-cook', 1,
          buildDeck(['Fossil Dyna Pachycephalo', 'Fossil Tusker', 'Gaia Plate the Earth Giant', 'Grandmarg the Rock Monarch', 'Megarock Dragon', 'Fossil Excavation', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Rock', era: 'GX' })
        ),
        makeDeckData('jim_deck_2', 'Fossil Dyna Pachycephalo Special Lock', 'Anti-Special Summon', 'Fossil Dyna flips to destroy all special-summoned monsters and prevents all Special Summons.', 'jim-crocodile-cook', 2,
          buildDeck(['Fossil Dyna Pachycephalo', 'Gaia Plate the Earth Giant', 'Grandmarg the Rock Monarch', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Rock', era: 'GX' })
        ),
        makeDeckData('jim_deck_3', 'Gaia Plate the Earth Giant Colossus', 'Rock ATK Halving', 'Halves the ATK and DEF of any monster that battles the 2800 ATK Gaia Plate.', 'jim-crocodile-cook', 3,
          buildDeck(['Gaia Plate the Earth Giant', 'Fossil Dyna Pachycephalo', 'Megarock Dragon', 'Foolish Burial', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Rock', era: 'GX' })
        ),
        makeDeckData('jim_deck_4', 'Megarock Dragon Banish Powerhouse', 'Rock Banish ATK', 'Banishes all Rock monsters from the GY to give Megarock Dragon 700 ATK per rock.', 'jim-crocodile-cook', 4,
          buildDeck(['Megarock Dragon', 'Fossil Dyna Pachycephalo', 'Fossil Tusker', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Rock', era: 'GX' })
        ),
        makeDeckData('jim_deck_5', 'Grandmarg the Rock Monarch Crush', 'Monarch Set Destruction', 'Tribute summons Grandmarg to destroy any face-down card on the field.', 'jim-crocodile-cook', 5,
          buildDeck(['Grandmarg the Rock Monarch', 'Fossil Dyna Pachycephalo', 'Soul Exchange', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Rock', era: 'GX' })
        ),
        makeDeckData('jim_deck_6', 'Fossil Excavation Trap Revival', 'Trap Rock Revival', 'Discards a card to revive high-level Rock monsters directly from the Graveyard.', 'jim-crocodile-cook', 6,
          buildDeck(['Fossil Excavation', 'Gaia Plate the Earth Giant', 'Megarock Dragon', 'Foolish Burial', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Rock', era: 'GX' })
        ),
        makeDeckData('jim_deck_7', 'Rock Stun & Anti-Meta Dominion', 'Rock Lockdown', 'Combines Fossil Dyna with Banisher of the Radiance to lock opponent options.', 'jim-crocodile-cook', 7,
          buildDeck(['Fossil Dyna Pachycephalo', 'Banisher of the Radiance', 'Solemn Judgment', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' })
        ),
        makeDeckData('jim_deck_8', 'Fossil Tusker Ancient Mammoth', 'Rock Beatdown', '1800 ATK Fossil Tusker charges into battle with prehistoric strength.', 'jim-crocodile-cook', 8,
          buildDeck(['Fossil Tusker', 'Fossil Dyna Pachycephalo', 'Gaia Plate the Earth Giant', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Rock', era: 'GX' })
        ),
        makeDeckData('jim_deck_9', 'Shirley Crocodile Tag-Team', 'Reptile & Rock Synergy', 'Jim battles alongside his loyal companion with savage animal fury.', 'jim-crocodile-cook', 9,
          buildDeck(['Gator Dragon', 'Fossil Dyna Pachycephalo', 'Gaia Plate the Earth Giant', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('jim_deck_10', 'Jim\'s Ultimate Fossil Excavation', 'Master Fossil Archeology', 'Jim\'s supreme tournament deck uniting Fossil Dyna, Gaia Plate, and Megarock Dragon.', 'jim-crocodile-cook', 10,
          buildDeck(['Fossil Dyna Pachycephalo', 'Gaia Plate the Earth Giant', 'Megarock Dragon', 'Grandmarg the Rock Monarch', 'Fossil Tusker', 'Fossil Excavation', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Rock', era: 'GX' })
        ),
      ],
    },

    // 14. Axel Brodie (Austin O'Brien) (NEW)
    {
      id: 'axel-brodie',
      name: 'Axel Brodie',
      series: 'GX',
      title: 'Volcanic Mercenary',
      tagline: 'Volcanic Doomfire & Blaze Cannon Artillery',
      description: 'The stoic mercenary student from West Academy. Axel incinerates enemy boards with Blaze Cannon artillery, Volcanic Scattershot, and Volcanic Doomfire.',
      avatar: 'resources/characters/portraits/axel-brodie.png',
      video: 'resources/videos/characters/axel-brodie.mp4',
      themeColor: '#eb5757',
      decks: [
        makeDeckData('axel_deck_1', 'Volcanic Doomfire & Blaze Cannon', 'Volcanic / Pyro Burn', 'Loads Volcanic Shell and Scattershot into Blaze Cannon to destroy monsters and burn Life Points.', 'axel-brodie', 1,
          buildDeck(['Volcanic Doomfire', 'Volcanic Rocket', 'Volcanic Scattershot', 'Volcanic Shell', 'Volcanic Slicer', 'Volcanic Hammerer', 'Blaze Cannon', 'Blaze Cannon - Trident', 'Royal Firestorm Guards', 'Wild Fire', 'Solar Flare Dragon', 'Fire Trooper', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Pyro', era: 'GX' })
        ),
        makeDeckData('axel_deck_2', 'Volcanic Scattershot Triple Wipe', 'Pyro Mass Wipe & Burn', 'Sends Scattershot to GY via Blaze Cannon to destroy all opponent monsters and burn 1500 damage.', 'axel-brodie', 2,
          buildDeck(['Volcanic Scattershot', 'Blaze Cannon', 'Volcanic Rocket', 'Royal Firestorm Guards', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Pyro', era: 'GX' })
        ),
        makeDeckData('axel_deck_3', 'Volcanic Rocket Cannon Search', 'Blaze Cannon Search Engine', 'Volcanic Rocket searches Blaze Cannon or Blaze Cannon Trident directly from deck or GY.', 'axel-brodie', 3,
          buildDeck(['Volcanic Rocket', 'Blaze Cannon', 'Blaze Cannon - Trident', 'Volcanic Shell', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Pyro', era: 'GX' })
        ),
        makeDeckData('axel_deck_4', 'Royal Firestorm Guards Recycle', 'Pyro Recycle & Draw', 'Shuffles 4 Pyros from the Graveyard back into the deck to draw 2 cards.', 'axel-brodie', 4,
          buildDeck(['Royal Firestorm Guards', 'Volcanic Shell', 'Volcanic Scattershot', 'Blaze Cannon', 'Pot of Greed', 'Graceful Charity'], { race: 'Pyro', era: 'GX' })
        ),
        makeDeckData('axel_deck_5', 'Wild Fire Instant Board Clear', 'Quick-Play Wipe & Token', 'Pays 500 LP and destroys Blaze Cannon to wipe all monsters and summon a Wild Fire Token.', 'axel-brodie', 5,
          buildDeck(['Wild Fire', 'Blaze Cannon', 'Volcanic Rocket', 'Volcanic Doomfire', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Pyro', era: 'GX' })
        ),
        makeDeckData('axel_deck_6', 'Volcanic Shell Infinite Ammo', 'Pyro Ammo Engine', 'Pays 500 LP to search another Volcanic Shell from the deck to continuously load Blaze Cannon.', 'axel-brodie', 6,
          buildDeck(['Volcanic Shell', 'Blaze Cannon', 'Volcanic Rocket', 'Royal Firestorm Guards', 'Pot of Greed', 'Graceful Charity'], { race: 'Pyro', era: 'GX' })
        ),
        makeDeckData('axel_deck_7', 'Fire Trooper & Direct Burn', 'Burn Assault', 'Sends Fire Trooper to GY on summon to blast 1000 direct damage immediately.', 'axel-brodie', 7,
          buildDeck(['Fire Trooper', 'Solar Flare Dragon', 'Volcanic Slicer', 'Secret Barrel', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Pyro', era: 'GX' })
        ),
        makeDeckData('axel_deck_8', 'Solar Flare Dragon Burn Shield', 'Continuous Burn', 'Two Solar Flare Dragons protect each other from attacks while dealing 1000 burn damage every turn.', 'axel-brodie', 8,
          buildDeck(['Solar Flare Dragon', 'Volcanic Rocket', 'Blaze Cannon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Pyro', era: 'GX' })
        ),
        makeDeckData('axel_deck_9', 'Volcanic Hammerer Heavy Blast', 'Graveyard Scaled Burn', 'Volcanic Hammerer burns the opponent for 200 damage per Volcanic monster in the Graveyard.', 'axel-brodie', 9,
          buildDeck(['Volcanic Hammerer', 'Volcanic Shell', 'Volcanic Scattershot', 'Blaze Cannon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Pyro', era: 'GX' })
        ),
        makeDeckData('axel_deck_10', 'Axel\'s Ultimate Volcanic Inferno', 'Master Pyro Artillery', 'Axel\'s supreme tournament deck uniting Volcanic Doomfire, Trident, Scattershot, and Guards.', 'axel-brodie', 10,
          buildDeck(['Volcanic Doomfire', 'Volcanic Rocket', 'Volcanic Scattershot', 'Volcanic Shell', 'Blaze Cannon', 'Blaze Cannon - Trident', 'Royal Firestorm Guards', 'Wild Fire', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Pyro', era: 'GX' })
        ),
      ],
    },

    // 15. Adrian Gecko (Amon Garam) (NEW)
    {
      id: 'adrian-gecko',
      name: 'Adrian Gecko',
      series: 'GX',
      title: 'Master of the Skies & Exodia',
      tagline: 'Cloudian Fog Counters & Exodius Lord',
      description: 'The calculating heir of the Gecko financial empire. Adrian uses battle-indestructible Cloudians with Fog Counters and summons Exodius the Ultimate Forbidden Lord.',
      avatar: 'resources/characters/portraits/adrian-gecko.png',
      video: 'resources/videos/characters/adrian-gecko.mp4',
      themeColor: '#56ccf2',
      decks: [
        makeDeckData('adrian_deck_1', 'Cloudian Storm & Fog Counters', 'Cloudian / Fairy / Aqua', 'Cloudians cannot be destroyed by battle in Attack Position and accumulate Fog Counters.', 'adrian-gecko', 1,
          buildDeck(['Cloudian - Eye of the Typhoon', 'Cloudian - Nimbusman', 'Cloudian - Turbulence', 'Cloudian - Acid Cloud', 'Cloudian - Altus', 'Cloudian - Ghost Fog', 'The Sanctuary in the Sky', 'Fog Control', 'Diamond-Dust Cyclone', 'Cloudian Squall', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Spirit Barrier'], { era: 'GX' })
        ),
        makeDeckData('adrian_deck_2', 'Cloudian - Nimbusman 5000 ATK Surge', 'Fog Counter ATK Surge', 'Tributes all Fog Counters on the field to give Nimbusman 500 ATK per counter for OTKs.', 'adrian-gecko', 2,
          buildDeck(['Cloudian - Nimbusman', 'Cloudian - Turbulence', 'Cloudian Squall', 'Fog Control', 'The Sanctuary in the Sky', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('adrian_deck_3', 'Cloudian - Eye of the Typhoon Storm', 'Position Shift Beatdown', 'Eye of the Typhoon shifts all opposing monsters not named Cloudian to Defense Position on attack.', 'adrian-gecko', 3,
          buildDeck(['Cloudian - Eye of the Typhoon', 'Cloudian - Turbulence', 'The Sanctuary in the Sky', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' })
        ),
        makeDeckData('adrian_deck_4', 'Spirit Barrier Invulnerable Clouds', 'Zero Battle Damage', 'While a Cloudian monster is on the field, Spirit Barrier reduces all battle damage to 0.', 'adrian-gecko', 4,
          buildDeck(['Spirit Barrier', 'The Sanctuary in the Sky', 'Cloudian - Turbulence', 'Cloudian - Ghost Fog', 'Cloudian Squall', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('adrian_deck_5', 'Exodius the Ultimate Forbidden Lord', 'Exodia Spellcaster Boss', 'Attacks to send Exodia pieces from deck to GY, achieving instant victory on the 5th piece.', 'adrian-gecko', 5,
          buildDeck(['Exodia the Forbidden One', 'Left Arm of the Forbidden One', 'Right Arm of the Forbidden One', 'Left Leg of the Forbidden One', 'Right Leg of the Forbidden One', 'Sangan', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('adrian_deck_6', 'Cloudian Turbulence Smoke Swarm', 'Fog Token Swarm', 'Removes 1 Fog Counter to special summon Cloudian - Smoke Ball repeatedly for tribute fodder.', 'adrian-gecko', 6,
          buildDeck(['Cloudian - Turbulence', 'Cloudian - Smoke Ball', 'Cloudian - Nimbusman', 'Cloudian Squall', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('adrian_deck_7', 'Cloudian Acid Cloud Backrow Burst', 'Spell/Trap Removal', 'Removes 2 Fog Counters from Acid Cloud to target and destroy any Spell or Trap on the field.', 'adrian-gecko', 7,
          buildDeck(['Cloudian - Acid Cloud', 'Cloudian - Cirrostratus', 'Cloudian Squall', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' })
        ),
        makeDeckData('adrian_deck_8', 'Cloudian Squall Fog Shower', 'Continuous Fog Counter Engine', 'Cloudian Squall places 1 Fog Counter on every face-up monster on the field every Standby Phase.', 'adrian-gecko', 8,
          buildDeck(['Cloudian Squall', 'Diamond-Dust Cyclone', 'Cloudian - Nimbusman', 'The Sanctuary in the Sky', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('adrian_deck_9', 'Diamond-Dust Cyclone Destruction', 'Fog Counter Destruction', 'Destroys a monster with 4+ Fog Counters and draws 1 card for every 4 counters removed.', 'adrian-gecko', 9,
          buildDeck(['Diamond-Dust Cyclone', 'Cloudian Squall', 'Cloudian - Turbulence', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('adrian_deck_10', 'Adrian\'s Ultimate Sky Dominion', 'Master Cloudian Fortress', 'Adrian\'s supreme deck uniting Eye of the Typhoon, Nimbusman, Squall, and Spirit Barrier.', 'adrian-gecko', 10,
          buildDeck(['Cloudian - Eye of the Typhoon', 'Cloudian - Nimbusman', 'Cloudian - Turbulence', 'Cloudian - Acid Cloud', 'Cloudian Squall', 'Diamond-Dust Cyclone', 'Spirit Barrier', 'The Sanctuary in the Sky', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' })
        ),
      ],
    },

    // 16. Sartorius Kumar (Saiou Takuma) (NEW)
    {
      id: 'sartorius-kumar',
      name: 'Sartorius Kumar',
      series: 'GX',
      title: 'Leader of the Society of Light',
      tagline: 'Arcana Force Tarot of Destiny & Light Ruler',
      description: 'The enigmatic diviner and leader of the Society of Light. Sartorius spins the Wheel of Fate with Arcana Force monsters and summons the 4000 ATK Light Ruler.',
      avatar: 'resources/characters/portraits/sartorius-kumar.png',
      video: 'resources/videos/characters/sartorius-kumar.mp4',
      themeColor: '#c9a227',
      decks: [
        makeDeckData('sartorius_deck_1', 'Arcana Force EX Light Ruler', 'Arcana Force / Coin Toss Tarot', 'Spins the wheel of destiny to trigger powerful heads effects and awakens The Light Ruler.', 'sartorius-kumar', 1,
          buildDeck(['Arcana Force EX - The Light Ruler', 'Arcana Force XXI - The World', 'Arcana Force 0 - The Fool', 'Arcana Force I - The Magician', 'Arcana Force III - The Empress', 'Arcana Force IV - The Emperor', 'Arcana Force VII - The Chariot', 'Arcana Force XIV - Temperance', 'Light Barrier', 'Reversal of Fate', 'Second Coin Toss', 'Cup of Ace', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fairy', era: 'GX' })
        ),
        makeDeckData('sartorius_deck_2', 'Arcana Force XXI The World Turn Skip', 'Turn Skip Win Condition', 'Heads effect of The World sends 2 monsters to GY to completely skip the opponent\'s turn.', 'sartorius-kumar', 2,
          buildDeck(['Arcana Force XXI - The World', 'Light Barrier', 'Reversal of Fate', 'Arcana Force 0 - The Fool', 'Treeborn Frog', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fairy', era: 'GX' })
        ),
        makeDeckData('sartorius_deck_3', 'Arcana Force 0 The Fool Battle Wall', 'Battle Indestructibility', 'The Fool cannot be destroyed by battle and cannot change battle positions.', 'sartorius-kumar', 3,
          buildDeck(['Arcana Force 0 - The Fool', 'Light Barrier', 'Reversal of Fate', 'Spirit Barrier', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fairy', era: 'GX' })
        ),
        makeDeckData('sartorius_deck_4', 'Light Barrier Fixed Destiny', 'Field Coin Toss Control', 'Light Barrier allows Sartorius to choose heads or tails instead of flipping a coin.', 'sartorius-kumar', 4,
          buildDeck(['Light Barrier', 'Terraforming', 'Arcana Force XXI - The World', 'Arcana Force EX - The Light Ruler', 'Cup of Ace', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('sartorius_deck_5', 'Reversal of Fate Inversion', 'Trap Coin Flip Inversion', 'Reversal of Fate changes an Arcana Force monster\'s tails effect into its powerful heads effect.', 'sartorius-kumar', 5,
          buildDeck(['Reversal of Fate', 'Arcana Force EX - The Light Ruler', 'Arcana Force XXI - The World', 'Light Barrier', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('sartorius_deck_6', 'Arcana Force VII The Chariot Monster Steal', 'Monster Steal on Battle', 'When The Chariot destroys an opponent monster by battle, special summon it to your field.', 'sartorius-kumar', 6,
          buildDeck(['Arcana Force VII - The Chariot', 'Light Barrier', 'Reversal of Fate', 'Second Coin Toss', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fairy', era: 'GX' })
        ),
        makeDeckData('sartorius_deck_7', 'Arcana Force XIV Temperance Damage Shield', 'Hand Trap Damage Reducer', 'Discards Temperance from the hand during damage calculation to reduce battle damage to 0.', 'sartorius-kumar', 7,
          buildDeck(['Arcana Force XIV - Temperance', 'Arcana Force EX - The Light Ruler', 'Light Barrier', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fairy', era: 'GX' })
        ),
        makeDeckData('sartorius_deck_8', 'Cup of Ace Absolute Draw Engine', 'Draw Engine with Light Barrier', 'With Light Barrier active, Cup of Ace guarantees a Pot of Greed draw 2 cards effect.', 'sartorius-kumar', 8,
          buildDeck(['Cup of Ace', 'Light Barrier', 'Second Coin Toss', 'Arcana Force I - The Magician', 'Pot of Greed', 'Graceful Charity'], { era: 'GX' })
        ),
        makeDeckData('sartorius_deck_9', 'Society of Light White Veil', 'Light Fairy Swarm', 'High-speed Fairy aggression backed by Valhalla and the Society of Light.', 'sartorius-kumar', 9,
          buildDeck(['Arcana Force EX - The Light Ruler', 'Shining Angel', 'Nova Summoner', 'Light Barrier', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fairy', era: 'GX' })
        ),
        makeDeckData('sartorius_deck_10', 'Sartorius\'s Ultimate Tarot of Fate', 'Master Arcana Force God', 'Sartorius\'s supreme deck uniting The Light Ruler, The World, The Fool, and Light Barrier.', 'sartorius-kumar', 10,
          buildDeck(['Arcana Force EX - The Light Ruler', 'Arcana Force XXI - The World', 'Arcana Force 0 - The Fool', 'Arcana Force VII - The Chariot', 'Light Barrier', 'Reversal of Fate', 'Cup of Ace', 'Second Coin Toss', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fairy', era: 'GX' })
        ),
      ],
    },

    // 17. Yubel (NEW)
    {
      id: 'yubel',
      name: 'Yubel',
      series: 'GX',
      title: 'The Eternal Dark Soul',
      tagline: 'Yubel Ultimate Nightmare & Pain Reflection',
      description: 'The ancient Duel Spirit bonded to Jaden through eternity. Yubel cannot be destroyed in battle, turns all battle damage onto the attacker, and evolves through nightmares.',
      avatar: 'resources/characters/portraits/yubel.png',
      video: 'resources/videos/characters/yubel.mp4',
      themeColor: '#9b51e0',
      decks: [
        makeDeckData('yubel_deck_1', 'Yubel - The Ultimate Nightmare Evolution', 'Yubel / Fiend / Damage Reflection', 'Evolves Yubel into Terror Incarnate and Ultimate Nightmare, reflecting all battle damage.', 'yubel', 1,
          buildDeck(['Yubel', 'Yubel - Terror Incarnate', 'Yubel - The Ultimate Nightmare', 'Armageddon Knight', 'Dark Grepher', 'Mystic Tomato', 'Samsara Lotus', 'Limit Reverse', 'Allure of Darkness', 'Foolish Burial', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Torrential Tribute'], { race: 'Fiend', era: 'GX' })
        ),
        makeDeckData('yubel_deck_2', 'Yubel - Terror Incarnate Field Wipe', 'End Phase Field Wipe', 'Destroys all other monsters on the field at the end of each turn automatically.', 'yubel', 2,
          buildDeck(['Yubel', 'Yubel - Terror Incarnate', 'Yubel - The Ultimate Nightmare', 'Mystic Tomato', 'Limit Reverse', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fiend', era: 'GX' })
        ),
        makeDeckData('yubel_deck_3', 'Samsara Lotus Tribute Loop', 'End Phase Lotus Loop', 'Samsara Lotus revives during the End Phase to provide constant tribute fuel for Yubel.', 'yubel', 3,
          buildDeck(['Samsara Lotus', 'Yubel', 'Foolish Burial', 'Armageddon Knight', 'Limit Reverse', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fiend', era: 'GX' })
        ),
        makeDeckData('yubel_deck_4', 'Limit Reverse Instant Awakening', 'Trap Monster Evolution', 'Limit Reverse revives Yubel from GY in Attack Position; shifting to Defense destroys it and triggers Terror Incarnate.', 'yubel', 4,
          buildDeck(['Limit Reverse', 'Yubel', 'Yubel - Terror Incarnate', 'Mystic Tomato', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fiend', era: 'GX' })
        ),
        makeDeckData('yubel_deck_5', 'Mystic Tomato Dark Swarm', 'Dark Battle Recruitment', 'Mystic Tomato recruits Yubel directly from the deck when destroyed by battle.', 'yubel', 5,
          buildDeck(['Mystic Tomato', 'Yubel', 'Sangan', 'Armageddon Knight', 'Limit Reverse', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fiend', era: 'GX' })
        ),
        makeDeckData('yubel_deck_6', 'Armageddon Knight Dark Send', 'Dark Milling Engine', 'Sends Yubel or Samsara Lotus directly from deck to Graveyard on summon.', 'yubel', 6,
          buildDeck(['Armageddon Knight', 'Dark Grepher', 'Yubel', 'Samsara Lotus', 'Foolish Burial', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fiend', era: 'GX' })
        ),
        makeDeckData('yubel_deck_7', 'Hate Buster Fiend Retaliation', 'Fiend Destruction & Burn', 'When a Fiend is targeted for attack, Hate Buster destroys both monsters and burns for the attacker\'s ATK.', 'yubel', 7,
          buildDeck(['Hate Buster', 'Yubel', 'Mystic Tomato', 'Dark Grepher', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fiend', era: 'GX' })
        ),
        makeDeckData('yubel_deck_8', 'Allure of Darkness Fiend Draw', 'Dark Draw Engine', 'Draws 2 cards and banishes a DARK monster to accelerate toward Yubel nightmares.', 'yubel', 8,
          buildDeck(['Allure of Darkness', 'Yubel', 'Dark Grepher', 'Armageddon Knight', 'Pot of Greed', 'Graceful Charity'], { race: 'Fiend', era: 'GX' })
        ),
        makeDeckData('yubel_deck_9', 'Unchained Nightmare Fiend Swarm', 'Fiend Beatdown', 'Fiends that thrive on destruction and turn enemy aggression into agonizing pain.', 'yubel', 9,
          buildDeck(['Yubel', 'Yubel - Terror Incarnate', 'Dark Grepher', 'Mystic Tomato', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fiend', era: 'GX' })
        ),
        makeDeckData('yubel_deck_10', 'Yubel\'s Ultimate Eternal Bond', 'Master Nightmare Dominion', 'Yubel\'s supreme deck uniting Yubel, Terror Incarnate, Ultimate Nightmare, and Lotus.', 'yubel', 10,
          buildDeck(['Yubel', 'Yubel - Terror Incarnate', 'Yubel - The Ultimate Nightmare', 'Samsara Lotus', 'Armageddon Knight', 'Mystic Tomato', 'Limit Reverse', 'Allure of Darkness', 'Foolish Burial', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fiend', era: 'GX' })
        ),
      ],
    },

    // 18. Nightshroud (Darkness) (NEW)
    {
      id: 'nightshroud',
      name: 'Nightshroud',
      series: 'GX',
      title: 'Embodiment of Darkness',
      tagline: 'Darkness Field Spell & Red-Eyes Darkness Metal Dragon',
      description: 'The primordial void of Darkness. Commands the Darkness Field Spell (Zero and Infinity spell traps), Darkness Neosphere, and Red-Eyes Darkness Metal Dragon.',
      avatar: 'resources/characters/portraits/nightshroud.png',
      video: 'resources/videos/characters/nightshroud.mp4',
      themeColor: '#0a0c10',
      decks: [
        makeDeckData('nightshroud_deck_1', 'Red-Eyes Darkness Metal Dragon Reign', 'Dragon / Dark Beatdown', 'Banishes dragons to summon Red-Eyes Darkness Metal Dragon and revive dragons every turn.', 'nightshroud', 1,
          buildDeck(['Red-Eyes Darkness Metal Dragon', 'Red-Eyes B. Dragon', 'Red-Eyes Wyvern', 'Belial - Marquis of Darkness', 'Patrician of Darkness', 'Dragon Shrine', 'Allure of Darkness', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Dragon', era: 'GX' })
        ),
        makeDeckData('nightshroud_deck_2', 'Darkness Neosphere 4000 ATK Fiend', 'Fiend Boss / Bounce', 'Special summons 4000 ATK Darkness Neosphere during damage calculation to return traps to hand.', 'nightshroud', 2,
          buildDeck(['Belial - Marquis of Darkness', 'Patrician of Darkness', 'Mask of Darkness', 'Darkness Destroyer', 'Allure of Darkness', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fiend', era: 'GX' })
        ),
        makeDeckData('nightshroud_deck_3', 'Belial Marquis of Darkness Shield', 'Target Redirection Shield', 'While Belial is on the field, opponent cannot target any other monster with attacks or effects.', 'nightshroud', 3,
          buildDeck(['Belial - Marquis of Darkness', 'Patrician of Darkness', 'Red-Eyes Darkness Metal Dragon', 'Allure of Darkness', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fiend', era: 'GX' })
        ),
        makeDeckData('nightshroud_deck_4', 'Patrician of Darkness Attack Control', 'Attack Target Manipulation', 'Patrician of Darkness chooses the target for all opponent attacks.', 'nightshroud', 4,
          buildDeck(['Patrician of Darkness', 'Belial - Marquis of Darkness', 'Spirit Reaper', 'Allure of Darkness', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Zombie', era: 'GX' })
        ),
        makeDeckData('nightshroud_deck_5', 'Mask of Darkness Trap Retrieval', 'Trap Salvage', 'Flips Mask of Darkness to return any Trap Card from the Graveyard to the hand.', 'nightshroud', 5,
          buildDeck(['Mask of Darkness', 'Mirror Force', 'Torrential Tribute', 'Call of the Haunted', 'Allure of Darkness', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fiend', era: 'GX' })
        ),
        makeDeckData('nightshroud_deck_6', 'Forces of Darkness Fiend Recovery', 'Fiend Retrieval', 'Forces of Darkness returns 2 DARK Fiend monsters from the Graveyard directly to the hand.', 'nightshroud', 6,
          buildDeck(['Belial - Marquis of Darkness', 'Mask of Darkness', 'Allure of Darkness', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fiend', era: 'GX' })
        ),
        makeDeckData('nightshroud_deck_7', 'Dragon Shrine Red-Eyes Milling', 'Dragon Mill Engine', 'Dumps Red-Eyes and Wyvern to the GY to prepare Darkness Metal Dragon revivals.', 'nightshroud', 7,
          buildDeck(['Dragon Shrine', 'Red-Eyes Darkness Metal Dragon', 'Red-Eyes B. Dragon', 'Red-Eyes Wyvern', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Dragon', era: 'GX' })
        ),
        makeDeckData('nightshroud_deck_8', 'Allure of Darkness Void Draw', 'Dark Draw Acceleration', 'Banishes dark fiends and dragons to fuel high-speed draws.', 'nightshroud', 8,
          buildDeck(['Allure of Darkness', 'Red-Eyes Darkness Metal Dragon', 'Belial - Marquis of Darkness', 'Pot of Greed', 'Graceful Charity'], { era: 'GX' })
        ),
        makeDeckData('nightshroud_deck_9', 'Darkness Destroyer Double Strike', 'Piercing Multi-Attack', 'Darkness Destroyer attacks twice in a single Battle Phase with piercing damage.', 'nightshroud', 9,
          buildDeck(['Red-Eyes Darkness Metal Dragon', 'Belial - Marquis of Darkness', 'Allure of Darkness', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('nightshroud_deck_10', 'Nightshroud\'s Ultimate Void of Darkness', 'Master Darkness Void', 'Nightshroud\'s supreme deck uniting Red-Eyes Darkness Metal Dragon, Belial, and Patrician.', 'nightshroud', 10,
          buildDeck(['Red-Eyes Darkness Metal Dragon', 'Belial - Marquis of Darkness', 'Patrician of Darkness', 'Mask of Darkness', 'Red-Eyes B. Dragon', 'Red-Eyes Wyvern', 'Dragon Shrine', 'Allure of Darkness', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' })
        ),
      ],
    },

    // 19. Yusuke Fujiwara (NEW)
    {
      id: 'yusuke-fujiwara',
      name: 'Yusuke Fujiwara',
      series: 'GX',
      title: 'Wielder of Clear World',
      tagline: 'Clear World Attribute Void & Clear Vice Dragon',
      description: 'The mysterious student behind the Honest mystery. Fujiwara commands Clear World, punishing every attribute with severe handicaps while Clear Vice Dragon remains immune.',
      avatar: 'resources/characters/portraits/yusuke-fujiwara.png',
      video: 'resources/videos/characters/yusuke-fujiwara.mp4',
      themeColor: '#56ccf2',
      decks: [
        makeDeckData('fujiwara_deck_1', 'Clear World & Clear Vice Dragon', 'Clear / Attribute Punishment', 'Clear World penalizes monsters based on attribute while Clear Vice Dragon doubles ATK to match the foe.', 'yusuke-fujiwara', 1,
          buildDeck(['Clear Vice Dragon', 'Clear World', 'Terraforming', 'Marshmallon', 'Spirit Reaper', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force', 'Dark Hole', 'Raigeki'], { era: 'GX' })
        ),
        makeDeckData('fujiwara_deck_2', 'Clear Vice Dragon Combat Double', 'ATK Doubling Combat', 'When Clear Vice Dragon battles, its ATK becomes double the opponent monster\'s ATK.', 'yusuke-fujiwara', 2,
          buildDeck(['Clear Vice Dragon', 'Clear World', 'Marshmallon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' })
        ),
        makeDeckData('fujiwara_deck_3', 'Clear World LIGHT Hand Reveal Lock', 'LIGHT Penalty Hand Reveal', 'While Clear World is active, turn players with LIGHT monsters must keep their hand revealed.', 'yusuke-fujiwara', 3,
          buildDeck(['Clear World', 'Clear Vice Dragon', 'Ceremonial Bell', 'The Eye of Truth', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('fujiwara_deck_4', 'Clear World DARK Attack Denial', 'DARK Penalty Attack Lock', 'While Clear World is active, turn players with 2+ DARK monsters cannot declare attacks.', 'yusuke-fujiwara', 4,
          buildDeck(['Clear World', 'Clear Vice Dragon', 'Terraforming', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' })
        ),
        makeDeckData('fujiwara_deck_5', 'Clear World FIRE End Phase Burn', 'FIRE Penalty 1000 Burn', 'While Clear World is active, turn players with FIRE monsters take 1000 damage during the End Phase.', 'yusuke-fujiwara', 5,
          buildDeck(['Clear World', 'Clear Vice Dragon', 'Solar Flare Dragon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('fujiwara_deck_6', 'Clear World WATER Discard Penalty', 'WATER Penalty End Phase Discard', 'While Clear World is active, turn players with WATER monsters must discard 1 card during End Phase.', 'yusuke-fujiwara', 6,
          buildDeck(['Clear World', 'Clear Vice Dragon', 'Card Destruction', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('fujiwara_deck_7', 'Clear World EARTH Monster Destruction', 'EARTH Penalty Destruction', 'While Clear World is active, turn players with EARTH monsters destroy their own monster during Main 1.', 'yusuke-fujiwara', 7,
          buildDeck(['Clear World', 'Clear Vice Dragon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' })
        ),
        makeDeckData('fujiwara_deck_8', 'Clear World WIND Spell Cost 500', 'WIND Penalty Spell Cost', 'While Clear World is active, turn players with WIND monsters must pay 500 LP to activate any Spell.', 'yusuke-fujiwara', 8,
          buildDeck(['Clear World', 'Clear Vice Dragon', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('fujiwara_deck_9', 'Clear Mind Manipulation', 'Control / Attribute Lock', 'Fujiwara\'s mind-reading tactics supported by attribute nullification.', 'yusuke-fujiwara', 9,
          buildDeck(['Clear World', 'Clear Vice Dragon', 'Marshmallon', 'Swords of Revealing Light', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' })
        ),
        makeDeckData('fujiwara_deck_10', 'Fujiwara\'s Ultimate Attribute Void', 'Master Clear World Domain', 'Fujiwara\'s supreme tournament deck uniting Clear World, Clear Vice Dragon, and attribute penalties.', 'yusuke-fujiwara', 10,
          buildDeck(['Clear Vice Dragon', 'Clear World', 'Terraforming', 'Marshmallon', 'Spirit Reaper', 'Solemn Judgment', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' })
        ),
      ],
    },

    // 20. Supreme King Jaden (Haou Judai) (NEW)
    {
      id: 'supreme-king-jaden',
      name: 'Supreme King Jaden',
      series: 'GX',
      title: 'Haou Judai - Ruler of Darkness',
      tagline: 'Evil HERO Malicious Bane & Dark Fusion',
      description: 'The merciless dark ruler of the alternate dimension. Supreme King Jaden commands corrupted Evil HEROs summoned via Dark Fusion and Super Polymerization.',
      avatar: 'resources/characters/portraits/supreme-king-jaden.png',
      video: 'resources/videos/characters/supreme-king-jaden.mp4',
      themeColor: '#8c6e16',
      decks: [
        makeDeckData('supreme_deck_1', 'Evil HERO Malicious Bane & Dark Calling', 'Evil HERO / Dark Fusion', 'Corrupts Elemental HEROs with Dark Fusion and Dark Calling into unstoppable Evil HERO titans.', 'supreme-king-jaden', 1,
          buildDeck(['Evil HERO Infernal Prodigy', 'Evil HERO Malicious Edge', 'Dark Fusion', 'Dark Calling', 'Super Polymerization', 'Elemental HERO Stratos', 'Elemental HERO Shadow Mist', 'Valkyrion the Magna Warrior', 'A Hero Lives', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { race: 'Fiend', era: 'GX' }, ['Evil HERO Dark Gaia', 'Evil HERO Malicious Bane', 'Evil HERO Lightning Golem', 'Evil HERO Inferno Wing', 'Evil HERO Wild Cyclone', 'Evil HERO Infernal Sniper'])
        ),
        makeDeckData('supreme_deck_2', 'Evil HERO Dark Gaia 6000 ATK Ruin', 'Fiend & Rock Dark Fusion', 'Fuses Valkyrion the Magna Warrior and Evil HERO Malicious Edge into 6000+ ATK Dark Gaia.', 'supreme-king-jaden', 2,
          buildDeck(['Valkyrion the Magna Warrior', 'Evil HERO Malicious Edge', 'Evil HERO Infernal Prodigy', 'Dark Fusion', 'Dark Calling', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' }, ['Evil HERO Dark Gaia'])
        ),
        makeDeckData('supreme_deck_3', 'Evil HERO Lightning Golem Targeted Thunder', 'Destroy Any Monster on Field', 'Fuses Sparkman and Clayman with Dark Fusion into Lightning Golem to destroy any monster.', 'supreme-king-jaden', 3,
          buildDeck(['Elemental HERO Sparkman', 'Elemental HERO Clayman', 'Dark Fusion', 'Dark Calling', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' }, ['Evil HERO Lightning Golem'])
        ),
        makeDeckData('supreme_deck_4', 'Evil HERO Inferno Wing Piercing Burn', 'Piercing Battle Burn', 'Inferno Wing pierces defense and burns the opponent for the destroyed monster\'s ATK or DEF.', 'supreme-king-jaden', 4,
          buildDeck(['Elemental HERO Avian', 'Elemental HERO Burstinatrix', 'Dark Fusion', 'Dark Calling', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' }, ['Evil HERO Inferno Wing'])
        ),
        makeDeckData('supreme_deck_5', 'Evil HERO Wild Cyclone Backrow Annihilation', 'Backrow Destruction', 'Wild Cyclone attacks freely without trap response and wipes all opponent spells/traps upon battle.', 'supreme-king-jaden', 5,
          buildDeck(['Elemental HERO Avian', 'Elemental HERO Wildheart', 'Dark Fusion', 'Dark Calling', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' }, ['Evil HERO Wild Cyclone'])
        ),
        makeDeckData('supreme_deck_6', 'Evil HERO Infernal Sniper 1000 DEF Burn', 'Indestructible Burn Sniper', 'Cannot be destroyed by spell cards while in Defense Position and burns 1000 damage each turn.', 'supreme-king-jaden', 6,
          buildDeck(['Elemental HERO Clayman', 'Elemental HERO Burstinatrix', 'Dark Fusion', 'Dark Calling', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' }, ['Evil HERO Infernal Sniper'])
        ),
        makeDeckData('supreme_deck_7', 'Super Polymerization Absolute Dominance', 'Super Poly Fiend Fusion', 'Absorbs opponent monsters using Super Polymerization to summon Evil HEROs un-counterably.', 'supreme-king-jaden', 7,
          buildDeck(['Super Polymerization', 'Dark Fusion', 'Dark Calling', 'Elemental HERO Stratos', 'Evil HERO Infernal Prodigy', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { era: 'GX' }, ['Evil HERO Dark Gaia', 'Evil HERO Malicious Bane', 'Elemental HERO Absolute Zero'])
        ),
        makeDeckData('supreme_deck_8', 'Evil HERO Malicious Edge Piercing', 'Tribute Piercing', 'Tributes 1 monster when opponent controls a monster to summon 2600 ATK Malicious Edge with piercing.', 'supreme-king-jaden', 8,
          buildDeck(['Evil HERO Malicious Edge', 'Evil HERO Infernal Prodigy', 'Dark Fusion', 'Dark Calling', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fiend', era: 'GX' }, ['Evil HERO Dark Gaia'])
        ),
        makeDeckData('supreme_deck_9', 'Castle of Dark Illusions Evil Realm', 'Fiend Field Power', 'Boosts the stats of all Fiend and Zombie warriors under the Supreme King\'s dark rule.', 'supreme-king-jaden', 9,
          buildDeck(['Evil HERO Infernal Prodigy', 'Evil HERO Malicious Edge', 'Dark Fusion', 'Dark Calling', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn'], { race: 'Fiend', era: 'GX' }, ['Evil HERO Dark Gaia', 'Evil HERO Malicious Bane'])
        ),
        makeDeckData('supreme_deck_10', 'Supreme King\'s Ultimate Dark Armageddon', 'Master Evil HERO Haou', 'The Supreme King\'s ultimate deck combining Dark Gaia, Malicious Bane, Super Poly, and Dark Calling.', 'supreme-king-jaden', 10,
          buildDeck(['Evil HERO Malicious Edge', 'Evil HERO Infernal Prodigy', 'Valkyrion the Magna Warrior', 'Elemental HERO Stratos', 'Elemental HERO Shadow Mist', 'Dark Fusion', 'Dark Calling', 'Super Polymerization', 'A Hero Lives', 'Pot of Greed', 'Graceful Charity', 'Monster Reborn', 'Mirror Force'], { era: 'GX' }, ['Evil HERO Dark Gaia', 'Evil HERO Malicious Bane', 'Evil HERO Lightning Golem', 'Evil HERO Inferno Wing', 'Evil HERO Wild Cyclone'])
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
