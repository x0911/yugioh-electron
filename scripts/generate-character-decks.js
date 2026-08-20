import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
const ROOT_DIR = process.cwd();
const POOL_PATH = path.resolve(ROOT_DIR, 'data/card-pool-whitelist.json');
const CDB_PATH = path.resolve(ROOT_DIR, 'resources/cards.cdb');
const DECKS_DIR = path.resolve(ROOT_DIR, 'resources/decks');
const OUTPUT_CHARACTERS_PATH = path.resolve(ROOT_DIR, 'data/characters.json');
if (!fs.existsSync(DECKS_DIR)) {
    fs.mkdirSync(DECKS_DIR, { recursive: true });
}
const pool = JSON.parse(fs.readFileSync(POOL_PATH, 'utf-8'));
const db = new Database(CDB_PATH, { readonly: true });
const checkDbStmt = db.prepare('SELECT id FROM datas WHERE id = ?');
function findCardByName(name) {
    const normalized = name.trim().toLowerCase();
    for (const card of Object.values(pool)) {
        if (card.name.toLowerCase() === normalized) {
            return card;
        }
    }
    for (const card of Object.values(pool)) {
        if (card.name.toLowerCase().includes(normalized)) {
            return card;
        }
    }
    return undefined;
}
function findCardId(nameOrId) {
    if (typeof nameOrId === 'number') {
        if (pool[String(nameOrId)])
            return nameOrId;
        throw new Error(`Card ID ${nameOrId} not in pool!`);
    }
    const card = findCardByName(nameOrId);
    if (!card) {
        throw new Error(`Card name "${nameOrId}" not found in card pool!`);
    }
    return card.id;
}
function findCardsByCriteria(criteria) {
    return Object.values(pool).filter((card) => {
        if (criteria.race && card.race !== criteria.race)
            return false;
        if (criteria.type && !card.type.toLowerCase().includes(criteria.type.toLowerCase()))
            return false;
        if (criteria.attribute && card.attribute !== criteria.attribute)
            return false;
        if (criteria.nameContains &&
            !card.name.toLowerCase().includes(criteria.nameContains.toLowerCase()))
            return false;
        if (criteria.minAtk !== undefined && (card.atk ?? 0) < criteria.minAtk)
            return false;
        if (criteria.maxAtk !== undefined && (card.atk ?? 0) > criteria.maxAtk)
            return false;
        if (criteria.level !== undefined && card.level !== criteria.level)
            return false;
        if (criteria.era && card.era !== criteria.era)
            return false;
        return true;
    });
}
function buildDeck(keyCards, fillCriteria, extraCardNamesOrIds = []) {
    const main = [];
    const signature = [];
    for (const item of keyCards) {
        try {
            const id = findCardId(item);
            if (signature.length < 3)
                signature.push(id);
            main.push(id);
        }
        catch (e) {
            console.warn(`[DeckGen Warning] ${e}`);
        }
    }
    const stapleNames = [
        'Pot of Greed',
        'Graceful Charity',
        'Raigeki',
        'Dark Hole',
        'Monster Reborn',
        'Premature Burial',
        'Mystical Space Typhoon',
        'Heavy Storm',
        'Swords of Revealing Light',
        'Snatch Steal',
        'Change of Heart',
        'Mirror Force',
        'Torrential Tribute',
        'Call of the Haunted',
        'Ring of Destruction',
        'Magic Cylinder',
        'Sakuretsu Armor',
        'Bottomless Trap Hole',
        'Compulsory Evacuation Device',
        'Sangan',
        'Witch of the Black Forest',
        'Kuriboh',
        'Marshmallon',
    ];
    const poolCandidates = findCardsByCriteria(fillCriteria);
    let poolIdx = 0;
    while (main.length < 32 && poolIdx < poolCandidates.length) {
        const card = poolCandidates[poolIdx++];
        if (card.type.toLowerCase().includes('fusion'))
            continue;
        const count = main.filter((id) => id === card.id).length;
        if (count < 3) {
            main.push(card.id);
        }
    }
    let stapleIdx = 0;
    while (main.length < 40 && stapleIdx < stapleNames.length) {
        try {
            const stapleId = findCardId(stapleNames[stapleIdx++]);
            const count = main.filter((id) => id === stapleId).length;
            if (count < 1) {
                main.push(stapleId);
            }
        }
        catch {
            // ignore
        }
    }
    let dupIdx = 0;
    while (main.length < 40 && dupIdx < main.length) {
        const id = main[dupIdx++];
        const count = main.filter((c) => c === id).length;
        if (count < 3) {
            main.push(id);
        }
    }
    const finalMain = main.slice(0, 40);
    const extra = [];
    for (const item of extraCardNamesOrIds) {
        try {
            const id = findCardId(item);
            extra.push(id);
        }
        catch (e) {
            console.warn(`[DeckGen Extra Warning] ${e}`);
        }
    }
    return { main: finalMain, extra, signature };
}
function writeYdkFile(filepath, mainCards, extraCards) {
    let content = '#created by YGO Desktop Duel Engine\n#main\n';
    for (const id of mainCards) {
        content += `${id}\n`;
    }
    content += '#extra\n';
    for (const id of extraCards) {
        content += `${id}\n`;
    }
    content += '!side\n';
    fs.writeFileSync(filepath, content, 'utf-8');
}
const CHARACTERS = [
    // ===========================================================================
    // 10 ORIGINAL SERIES (DM) CHARACTERS
    // ===========================================================================
    {
        id: 'yugi-muto',
        name: 'Yugi Muto',
        series: 'DM',
        title: 'King of Games',
        tagline: 'Heart of the Cards & Master Tactician',
        description: 'A kind-hearted high school student who solved the ancient Millennium Puzzle. Yugi trusts completely in the Heart of the Cards and uses clever defensive and toolbox combos.',
        themeColor: '#9b51e0',
        decks: [
            {
                id: 'yugi_deck_1',
                name: 'Magnet & Gadget Arsenal',
                archetype: 'Magnet Warriors / Gadgets',
                description: 'Combines the magnetic force of Alpha, Beta, and Gamma with mechanical Gadget draw engines.',
                keyCards: [
                    'Valkyrion the Magna Warrior',
                    'Alpha The Magnet Warrior',
                    'Beta The Magnet Warrior',
                    'Gamma The Magnet Warrior',
                    'Green Gadget',
                    'Red Gadget',
                    'Yellow Gadget',
                    'Buster Blader',
                    'Swords of Revealing Light',
                    'Card Destruction',
                ],
                fillCriteria: { race: 'Rock' },
            },
            {
                id: 'yugi_deck_2',
                name: 'Silent Swordsman Level-Up',
                archetype: 'Silent LV Series / Spellcasters',
                description: 'Patience and defensive fortresses power up the Silent Swordsman and Skilled Magicians.',
                keyCards: [
                    'Silent Swordsman LV3',
                    'Silent Swordsman LV5',
                    'Silent Swordsman LV7',
                    'Marshmallon',
                    'Big Shield Gardna',
                    'Level Modulation',
                    'Level Up!',
                    'Skilled White Magician',
                    'Skilled Dark Magician',
                ],
                fillCriteria: { race: 'Warrior' },
            },
            {
                id: 'yugi_deck_3',
                name: 'Exodia the Forbidden One',
                archetype: 'Exodia OTK / Stall',
                description: 'Gather all five pieces of the Forbidden One while using impenetrable defenses and search spells.',
                keyCards: [
                    'Exodia the Forbidden One',
                    'Right Arm of the Forbidden One',
                    'Left Arm of the Forbidden One',
                    'Right Leg of the Forbidden One',
                    'Left Leg of the Forbidden One',
                    'Emissary of the Afterlife',
                    'Sangan',
                    'Witch of the Black Forest',
                    'Backup Soldier',
                    'Dark Factory of Mass Production',
                ],
                fillCriteria: { race: 'Spellcaster' },
            },
        ],
    },
    {
        id: 'yami-yugi',
        name: 'Yami Yugi',
        series: 'DM',
        title: 'Pharaoh Atem',
        tagline: 'Ancient Egyptian Pharaoh & Master Duelist',
        description: 'The spirit of Pharaoh Atem residing within the Millennium Puzzle. Commands the ultimate Spellcaster monsters, the legendary Egyptian Gods, and heroic ritual warriors.',
        themeColor: '#7b1fa2',
        decks: [
            {
                id: 'yami_deck_1',
                name: "Pharaoh's Dark Magic",
                archetype: 'Dark Magician Spellcasters',
                description: 'The ultimate wizard in terms of attack and defense, supported by Dark Magician Girl and Thousand Knives.',
                keyCards: [
                    'Dark Magician',
                    'Dark Magician Girl',
                    'Magician of Black Chaos',
                    'Thousand Knives',
                    'Dark Magic Attack',
                    'Skilled Dark Magician',
                    'Dark Eradicator Warlock',
                    "Sage's Stone",
                    'Breaker the Magical Warrior',
                ],
                fillCriteria: { race: 'Spellcaster' },
            },
            {
                id: 'yami_deck_2',
                name: 'Slifer the Sky Dragon',
                archetype: 'Egyptian God / Hand Power',
                description: 'Summon the heavenly dragon Slifer whose ATK surges with every card held in hand.',
                keyCards: [
                    'Slifer the Sky Dragon',
                    'Summoned Skull',
                    'Celtic Guardian',
                    'Curse of Dragon',
                    'Gazelle the King of Mythical Beasts',
                    'Monster Reborn',
                    'Pot of Greed',
                    'Polymerization',
                    'Gaia The Fierce Knight',
                ],
                fillCriteria: { race: 'Spellcaster' },
            },
            {
                id: 'yami_deck_3',
                name: 'Black Luster Soldier Chaos',
                archetype: 'Ritual Chaos Warriors',
                description: 'Harness the supreme power of Black Luster Soldier and Gaia The Fierce Knight to shatter the opposition.',
                keyCards: [
                    'Black Luster Soldier',
                    'Black Luster Ritual',
                    'Gaia The Fierce Knight',
                    'Swift Gaia the Fierce Knight',
                    'Kuriboh',
                    'Manju of the Ten Thousand Hands',
                    'Senju of the Thousand Hands',
                    'Sonic Bird',
                ],
                fillCriteria: { race: 'Warrior' },
            },
        ],
    },
    {
        id: 'seto-kaiba',
        name: 'Seto Kaiba',
        series: 'DM',
        title: 'KaibaCorp President',
        tagline: 'Ruthless Visionary & Blue-Eyes Master',
        description: 'The billionaire head of Kaiba Corporation and creator of Duel Disks. Relies on overwhelming dragon beatdown power and high-tech destructive strategies.',
        themeColor: '#2f80ed',
        decks: [
            {
                id: 'kaiba_deck_1',
                name: 'Blue-Eyes Dragon Fury',
                archetype: 'Blue-Eyes White Dragon',
                description: 'Unleashes three legendary Blue-Eyes White Dragons and fuses them into Blue-Eyes Ultimate Dragon.',
                keyCards: [
                    'Blue-Eyes White Dragon',
                    'The Flute of Summoning Dragon',
                    'Lord of D.',
                    'Burst Stream of Destruction',
                    'Kaibaman',
                    'Kaiser Sea Horse',
                    'Polymerization',
                    "Dragon's Rage",
                ],
                fillCriteria: { race: 'Dragon' },
                extraCards: ['Blue-Eyes Ultimate Dragon'],
            },
            {
                id: 'kaiba_deck_2',
                name: 'Obelisk the Tormentor',
                archetype: 'Egyptian God Beatdown',
                description: 'Sacrifice two monsters to trigger the devastating Soul Energy Max effect of Obelisk the Tormentor.',
                keyCards: [
                    'Obelisk the Tormentor',
                    'Vorse Raider',
                    'Battle Ox',
                    'La Jinn the Mystical Genie of the Lamp',
                    'Blade Knight',
                    'Crush Card Virus',
                    'Ring of Destruction',
                    'Shrink',
                ],
                fillCriteria: { race: 'Beast-Warrior' },
            },
            {
                id: 'kaiba_deck_3',
                name: 'XYZ-Dragon Cannon Mech',
                archetype: 'Union Machine Fusion',
                description: 'Assemble X-Head Cannon, Y-Dragon Head, and Z-Metal Tank into impenetrable mobile assault fortresses.',
                keyCards: [
                    'X-Head Cannon',
                    'Y-Dragon Head',
                    'Z-Metal Tank',
                    'Heavy Mech Support Platform',
                    'Limiter Removal',
                    'Frontline Base',
                    'Roll Out!',
                ],
                fillCriteria: { race: 'Machine' },
                extraCards: ['XYZ-Dragon Cannon', 'XY-Dragon Cannon', 'XZ-Tank Cannon', 'YZ-Tank Dragon'],
            },
        ],
    },
    {
        id: 'joey-wheeler',
        name: 'Joey Wheeler',
        series: 'DM',
        title: 'The Godfather of Games',
        tagline: 'Underdog Spirit & High-Stakes Gambler',
        description: 'A fiercely loyal duelist who relies on guts, raw determination, warrior instincts, and high-risk luck cards that turn the tide in an instant.',
        themeColor: '#f2994a',
        decks: [
            {
                id: 'joey_deck_1',
                name: 'Red-Eyes Darkness Ferocity',
                archetype: 'Red-Eyes Black Dragon',
                description: 'Channel the potential of Red-Eyes Black Dragon and evolve into Red-Eyes Darkness Dragon.',
                keyCards: [
                    'Red-Eyes Black Dragon',
                    'Red-Eyes Darkness Dragon',
                    "Black Dragon's Chick",
                    'Baby Dragon',
                    'Time Wizard',
                    'Polymerization',
                    'Inferno Fire Blast',
                ],
                fillCriteria: { race: 'Dragon' },
                extraCards: ['Thousand Dragon'],
            },
            {
                id: 'joey_deck_2',
                name: "Gambler's Fortune & Warriors",
                archetype: 'Gamble Dice / Warriors',
                description: 'Roll the dice and flip coins with Graceful Dice, Skull Dice, and Fairy Box.',
                keyCards: [
                    'Gearfried the Iron Knight',
                    'Gilford the Lightning',
                    'Rocket Warrior',
                    'Panther Warrior',
                    'Graceful Dice',
                    'Skull Dice',
                    'Fairy Box',
                ],
                fillCriteria: { race: 'Warrior' },
            },
            {
                id: 'joey_deck_3',
                name: 'Jinzo Trap Annihilation',
                archetype: 'Jinzo / Beast-Warrior Beatdown',
                description: 'Shut down all opponent traps completely with Jinzo while swarming with warriors.',
                keyCards: [
                    'Jinzo',
                    'Little-Winguard',
                    'Marauding Captain',
                    'Reinforcement of the Army',
                    'The Warrior Returning Alive',
                    'Scapegoat',
                ],
                fillCriteria: { race: 'Warrior' },
            },
        ],
    },
    {
        id: 'tea-gardner',
        name: 'Téa Gardner',
        series: 'DM',
        title: 'Friendship Guardian',
        tagline: 'Fairy Harmony & Life Point Supremacy',
        description: 'Yugi’s closest friend whose deck focuses on radiant fairy monsters, continuous Life Point recovery, and peaceful stalling spells.',
        themeColor: '#56ccf2',
        decks: [
            {
                id: 'tea_deck_1',
                name: 'Shining Fairy Friendship',
                archetype: 'Fairy Beatdown & Heal',
                description: 'Strengthen gentle fairy creatures with healing blessings and defensive warding.',
                keyCards: [
                    'Shining Friendship',
                    'Dunames Dark Witch',
                    'Mystical Elf',
                    'Goddess of Whim',
                    'Dian Keto the Cure Master',
                    'Waboku',
                    'Solemn Wishes',
                    'Cure Mermaid',
                ],
                fillCriteria: { race: 'Fairy' },
            },
            {
                id: 'tea_deck_2',
                name: 'Maha Vailo Equip Power',
                archetype: 'Equip Spells / Light Spellcaster',
                description: 'Equip Mage Power and United We Stand to turn Maha Vailo into an untouchable juggernaut.',
                keyCards: [
                    'Maha Vailo',
                    'United We Stand',
                    'Mage Power',
                    'Malevolent Nuzzler',
                    'Horn of the Unicorn',
                    'Fairy Meteor Crush',
                    'Iron Blacksmith Kotetsu',
                ],
                fillCriteria: { race: 'Spellcaster' },
            },
            {
                id: 'tea_deck_3',
                name: 'Fire Princess Burn & Sanctuary',
                archetype: 'Burn & Healing',
                description: 'Deal direct effect damage to the opponent every time your Life Points are restored.',
                keyCards: [
                    'Fire Princess',
                    'Darklord Marie',
                    'Nimble Momonga',
                    'Snatch Steal',
                    'Just Desserts',
                    'Ookazi',
                    'Hinotama',
                    'Poison of the Old Man',
                ],
                fillCriteria: { race: 'Fairy' },
            },
        ],
    },
    {
        id: 'tristan-taylor',
        name: 'Tristan Taylor',
        series: 'DM',
        title: 'Cybernetic Striker',
        tagline: 'Heavy Machine Might & Combat Command',
        description: 'A tough and reliable ally who commands military machines, tactical commanders, and steadfast earth warriors.',
        themeColor: '#27ae60',
        decks: [
            {
                id: 'tristan_deck_1',
                name: 'Command Infantry Strike',
                archetype: 'Machine / Combat Infantry',
                description: 'Commanding mechanical infantry with Battle Footballer and high-defense Cyber units.',
                keyCards: [
                    'Field-Commander Rahz',
                    'Battle Footballer',
                    'Command Knight',
                    'Goblin Attack Force',
                    'Mechanicalchaser',
                    'Heavy Mech Support Platform',
                    'Limiter Removal',
                    'The Fiend Megacyber',
                ],
                fillCriteria: { race: 'Machine' },
            },
            {
                id: 'tristan_deck_2',
                name: 'Battleguard Brothers War',
                archetype: 'Warrior / Battleguard',
                description: 'Lava Battleguard and Swamp Battleguard fight side-by-side to amplify each other’s strength.',
                keyCards: [
                    'Lava Battleguard',
                    'Swamp Battleguard',
                    'Marauding Captain',
                    'Exiled Force',
                    'Reinforcement of the Army',
                    'The A. Forces',
                    'The Warrior Returning Alive',
                ],
                fillCriteria: { race: 'Warrior' },
            },
            {
                id: 'tristan_deck_3',
                name: 'Robotic Heavy Siege',
                archetype: 'Machine Beatdown',
                description: 'Crush enemy lines with Cyber-Tech Alligator and Machine King boosted by Limiter Removal.',
                keyCards: [
                    'Machine King',
                    'Cyber-Tech Alligator',
                    'Drillroid',
                    'Overload Fusion',
                    'Heavy Storm',
                    '7 Completed',
                ],
                fillCriteria: { race: 'Machine' },
            },
        ],
    },
    {
        id: 'mai-valentine',
        name: 'Mai Valentine',
        series: 'DM',
        title: 'Queen of the Sky',
        tagline: 'Aroma Tactics & Harpie Sky Sovereign',
        description: 'A glamorous and independent master duelist whose Harpie Lady flock controls the field with swift aerial strikes.',
        themeColor: '#e91e63',
        decks: [
            {
                id: 'mai_deck_1',
                name: 'Harpie Lady Sky Flurry',
                archetype: 'Harpie Ladies / Wind',
                description: 'Swarm the skies with Harpie Lady 1, 2, 3 and summon the fearsome Harpie’s Pet Dragon.',
                keyCards: [
                    'Harpie Lady 1',
                    'Harpie Lady 2',
                    'Harpie Lady 3',
                    'Cyber Harpie Lady',
                    "Harpie's Pet Dragon",
                    'Elegant Egotist',
                    "Harpies' Hunting Ground",
                    'Triangle Ecstasy Spark',
                    'Hysteric Party',
                ],
                fillCriteria: { race: 'Winged Beast' },
            },
            {
                id: 'mai_deck_2',
                name: 'Amazoness Tribal Onslaught',
                archetype: 'Amazoness Warriors',
                description: 'Amazoness Swords Woman and Amazoness Paladin turn opponent strength into self-destruction.',
                keyCards: [
                    'Amazoness Swords Woman',
                    'Amazoness Paladin',
                    'Amazoness Tiger',
                    'Amazoness Blowpiper',
                    'Amazoness Archers',
                    'Amazoness Spellcaster',
                ],
                fillCriteria: { race: 'Warrior' },
            },
            {
                id: 'mai_deck_3',
                name: 'Winged-Beast Tempest',
                archetype: 'Wind Aerial Control',
                description: 'Harness the gusting winds with Birdface and Sonic Shooter to strike directly over defenses.',
                keyCards: [
                    'Birdface',
                    'Sonic Shooter',
                    'Cyber Falcon',
                    'Slate Warrior',
                    'Rising Air Current',
                    'Icarus Attack',
                    'Dust Tornado',
                ],
                fillCriteria: { race: 'Winged Beast' },
            },
        ],
    },
    {
        id: 'bakura-ryou',
        name: 'Bakura Ryou',
        series: 'DM',
        title: 'Shadow Realm Wanderer',
        tagline: 'Millennium Ring & Occult Darkness',
        description: 'Possessed by the sinister spirit of the Millennium Ring, Bakura uses terrifying fiends, occult destiny boards, and deck destruction.',
        themeColor: '#673ab7',
        decks: [
            {
                id: 'bakura_deck_1',
                name: 'Destiny Board of Doom',
                archetype: 'Destiny Board / Dark Necrofear',
                description: 'Spell out F-I-N-A-L on the field to claim instant victory from the shadows.',
                keyCards: [
                    'Destiny Board',
                    'Spirit Message "I"',
                    'Spirit Message "N"',
                    'Spirit Message "A"',
                    'Spirit Message "L"',
                    'Dark Necrofear',
                    'Dark Ruler Ha Des',
                    'Man-Eater Bug',
                    'Mask of Darkness',
                ],
                fillCriteria: { race: 'Fiend' },
            },
            {
                id: 'bakura_deck_2',
                name: 'Undead Necromancy',
                archetype: 'Zombies / Vampire Lord',
                description: 'Command Vampire Lord and Ryu Kokki to continuously resurrect from the Graveyard.',
                keyCards: [
                    'Vampire Lord',
                    'Ryu Kokki',
                    'Pyramid Turtle',
                    'Spirit Reaper',
                    'Book of Life',
                    'Call of the Mummy',
                    'Card of Safe Return',
                ],
                fillCriteria: { race: 'Zombie' },
            },
            {
                id: 'bakura_deck_3',
                name: 'Fiendish Deck Destruction',
                archetype: 'Mill / Morphing Jar',
                description: 'Force the opponent to discard and mill their entire deck with Morphing Jar and Needle Worm.',
                keyCards: [
                    'Morphing Jar',
                    'Morphing Jar #2',
                    'Needle Worm',
                    'Giant Germ',
                    'Night Assailant',
                    'Dark Hole',
                    'Card Destruction',
                ],
                fillCriteria: { race: 'Fiend' },
            },
        ],
    },
    {
        id: 'marik-ishtar',
        name: 'Marik Ishtar',
        series: 'DM',
        title: 'Tomb Keeper of the Sun',
        tagline: 'Millennium Rod & The Winged Dragon of Ra',
        description: 'Leader of the Rare Hunters and wielder of the Millennium Rod. Binds his victims with sadistic burn damage and the golden sun god.',
        themeColor: '#ffc107',
        decks: [
            {
                id: 'marik_deck_1',
                name: 'The Winged Dragon of Ra',
                archetype: 'Egyptian God / Lava Golem',
                description: 'Incinerate everything with The Winged Dragon of Ra while tributing opponent monsters for Lava Golem.',
                keyCards: [
                    'The Winged Dragon of Ra',
                    'Lava Golem',
                    'Nightmare Wheel',
                    'Coffin Seller',
                    'Helpoemer',
                    'Byser Shock',
                    'Makyura the Destructor',
                    'Monster Reborn',
                ],
                fillCriteria: { race: 'Fiend' },
            },
            {
                id: 'marik_deck_2',
                name: "Gravekeeper's Necrovalley",
                archetype: "Gravekeeper's",
                description: 'Seal both Graveyards with Necrovalley while Gravekeeper monsters gain overwhelming attack.',
                keyCards: [
                    "Gravekeeper's Spy",
                    "Gravekeeper's Commandant",
                    "Gravekeeper's Assailant",
                    "Gravekeeper's Spear Soldier",
                    "Gravekeeper's Chief",
                    'Necrovalley',
                    'Rite of Spirit',
                    'Royal Tribute',
                ],
                fillCriteria: { nameContains: 'Gravekeeper' },
            },
            {
                id: 'marik_deck_3',
                name: 'Torture Chamber Burn',
                archetype: 'Burn / Continuous Damage',
                description: 'Inflict inescapable damage turn after turn with Bowganian and Wave-Motion Cannon.',
                keyCards: [
                    'Bowganian',
                    'Stealth Bird',
                    'Solar Flare Dragon',
                    'Wave-Motion Cannon',
                    'Secret Barrel',
                    'Just Desserts',
                    'Chain Energy',
                ],
                fillCriteria: { race: 'Fiend' },
            },
        ],
    },
    {
        id: 'maximillion-pegasus',
        name: 'Maximillion Pegasus',
        series: 'DM',
        title: 'Creator of Duel Monsters',
        tagline: 'Millennium Eye & Toon World Creator',
        description: 'The flamboyant president of Industrial Illusions and creator of the card game. Bypasses defenses with whimsical cartoon Toons and eldritch illusions.',
        themeColor: '#9c27b0',
        decks: [
            {
                id: 'pegasus_deck_1',
                name: 'Toon World Kingdom',
                archetype: 'Toon Monsters',
                description: 'Enter Toon World to attack directly with Toon Dark Magician Girl, Toon Summoned Skull, and Toon Blue-Eyes.',
                keyCards: [
                    'Toon World',
                    'Toon Table of Contents',
                    'Toon Dark Magician Girl',
                    'Toon Summoned Skull',
                    'Blue-Eyes Toon Dragon',
                    'Toon Mermaid',
                    'Toon Gemini Elf',
                    'Toon Goblin Attack Force',
                    'Toon Defense',
                ],
                fillCriteria: { nameContains: 'Toon' },
            },
            {
                id: 'pegasus_deck_2',
                name: 'Relinquished Illusion Eyes',
                archetype: 'Relinquished Ritual',
                description: 'Absorb enemy monsters and turn their attack power against them with Relinquished and Thousand-Eyes Restrict.',
                keyCards: [
                    'Relinquished',
                    'Black Illusion Ritual',
                    'Thousand-Eyes Idol',
                    'Manju of the Ten Thousand Hands',
                    'Senju of the Thousand Hands',
                    'Sonic Bird',
                    'Polymerization',
                ],
                fillCriteria: { race: 'Spellcaster' },
                extraCards: ['Thousand-Eyes Restrict'],
            },
            {
                id: 'pegasus_deck_3',
                name: 'Illusionist Mind Scan',
                archetype: 'Illusion / Control',
                description: 'Confuse the opponent with Jigen Bakudan, Magical Hats, and mysterious spellcaster tricks.',
                keyCards: [
                    'Illusionist Faceless Mage',
                    'Jigen Bakudan',
                    'Magical Hats',
                    'Mirror Force',
                    'Mystic Box',
                    'Bickuribox',
                ],
                fillCriteria: { race: 'Spellcaster' },
            },
        ],
    },
    // ===========================================================================
    // 10 YU-GI-OH! GX CHARACTERS
    // ===========================================================================
    {
        id: 'jaden-yuki',
        name: 'Jaden Yuki',
        series: 'GX',
        title: 'Slifer Red Champion',
        tagline: 'Elemental HERO & Neos Contact Master',
        description: 'The carefree hero of Duel Academy who loves the thrill of dueling. Fuses Elemental HEROes and contacts Neo-Spacians with boundless enthusiasm.',
        themeColor: '#eb5757',
        decks: [
            {
                id: 'jaden_deck_1',
                name: 'Elemental HERO Fusion Force',
                archetype: 'Elemental HERO Fusion',
                description: 'Fuse Avian, Burstinatrix, Clayman, and Sparkman into Flame Wingman and Thunder Giant.',
                keyCards: [
                    'Elemental HERO Avian',
                    'Elemental HERO Burstinatrix',
                    'Elemental HERO Clayman',
                    'Elemental HERO Sparkman',
                    'Elemental HERO Bubbleman',
                    'Polymerization',
                    'Miracle Fusion',
                    'Skyscraper',
                    'R - Righteous Justice',
                    'E - Emergency Call',
                ],
                fillCriteria: { nameContains: 'Elemental HERO' },
                extraCards: [
                    'Elemental HERO Flame Wingman',
                    'Elemental HERO Thunder Giant',
                    'Elemental HERO Rampart Blaster',
                    'Elemental HERO Steam Healer',
                ],
            },
            {
                id: 'jaden_deck_2',
                name: 'Neos Space Contact',
                archetype: 'Elemental HERO Neos / Neo-Spacian',
                description: 'Send Elemental HERO Neos into orbit to Contact Fuse with Neo-Spacians without Polymerization.',
                keyCards: [
                    'Elemental HERO Neos',
                    'Neo-Spacian Grand Mole',
                    'Neo-Spacian Flare Scarab',
                    'Neo-Spacian Aqua Dolphin',
                    'Neo-Spacian Air Hummingbird',
                    'Contact',
                    'Fake Hero',
                    'O - Oversoul',
                    'Hero Signal',
                ],
                fillCriteria: { nameContains: 'Neos' },
                extraCards: [
                    'Elemental HERO Flare Neos',
                    'Elemental HERO Aqua Neos',
                    'Elemental HERO Grand Neos',
                ],
            },
            {
                id: 'jaden_deck_3',
                name: 'Wildedge Bladedge Beatdown',
                archetype: 'Elemental HERO Beatdown',
                description: 'Pierce defenses and attack all monsters with Elemental HERO Bladedge and Wildedge.',
                keyCards: [
                    'Elemental HERO Bladedge',
                    'Elemental HERO Wildheart',
                    'Elemental HERO Necroshade',
                    'Elemental HERO Stratos',
                    'Hero Heart',
                    'Polymerization',
                    'Reinforcement of the Army',
                ],
                fillCriteria: { nameContains: 'HERO' },
                extraCards: ['Elemental HERO Wildedge', 'Elemental HERO Necroid Shaman'],
            },
        ],
    },
    {
        id: 'zane-truesdale',
        name: 'Zane Truesdale',
        series: 'GX',
        title: 'The Cyber Duelist (Hell Kaiser)',
        tagline: 'Cyber Dragon Evolution & Machine Overlord',
        description: 'The top student at Duel Academy who masters Cyber Dragon fusions before descending into the underworld of Cyberdark dragons.',
        themeColor: '#00bcd4',
        decks: [
            {
                id: 'zane_deck_1',
                name: 'Cyber Dragon Evolution',
                archetype: 'Cyber Dragon Fusion',
                description: 'Summon the twin-headed Cyber Twin Dragon and triple-headed Cyber End Dragon with Power Bond.',
                keyCards: [
                    'Cyber Dragon',
                    'Proto-Cyber Dragon',
                    'Cyber Phoenix',
                    'Cyber Valley',
                    'Power Bond',
                    'Overload Fusion',
                    'Cybernetic Zone',
                ],
                fillCriteria: { nameContains: 'Cyber' },
                extraCards: ['Cyber Twin Dragon', 'Cyber End Dragon', 'Chimeratech Overdragon'],
            },
            {
                id: 'zane_deck_2',
                name: 'Cyberdark Dragon Underworld',
                archetype: 'Cyberdark / Machine-Dragon',
                description: 'Equip dragons from the Graveyard to Cyberdark Horn, Edge, and Keel to create the ultimate Cyberdark Dragon.',
                keyCards: [
                    'Cyberdark Horn',
                    'Cyberdark Edge',
                    'Cyberdark Keel',
                    'Cyberdark Dragon',
                    'Future Fusion',
                    'Overload Fusion',
                    'Twin-Headed Behemoth',
                    'Masked Dragon',
                ],
                fillCriteria: { nameContains: 'Cyberdark' },
                extraCards: ['Cyberdark Dragon', 'Chimeratech Overdragon'],
            },
            {
                id: 'zane_deck_3',
                name: 'Cybernetic OTK Overload',
                archetype: 'Machine OTK',
                description: 'Double attack power with Limiter Removal and Megamorph for an unstoppable single-turn victory.',
                keyCards: [
                    'Cyber Dragon',
                    'Heavy Mech Support Platform',
                    'Limiter Removal',
                    'Megamorph',
                    'Cyber Barrier Dragon',
                    'Cyber Laser Dragon',
                    'Photon Generator Unit',
                ],
                fillCriteria: { race: 'Machine' },
            },
        ],
    },
    {
        id: 'syrus-truesdale',
        name: 'Syrus Truesdale',
        series: 'GX',
        title: 'Vehicroid Engineer',
        tagline: 'Vehicroid Assembly & Tactical Mechanics',
        description: 'Zane’s younger brother who overcomes self-doubt through the power of cheerful and quirky Vehicroid machines.',
        themeColor: '#2196f3',
        decks: [
            {
                id: 'syrus_deck_1',
                name: 'Super Vehicroid Connection',
                archetype: 'Vehicroid Fusion',
                description: 'Combine Gyroid, Steamroid, and Drillroid into Super Vehicroid Jumbo Drill.',
                keyCards: [
                    'Gyroid',
                    'Steamroid',
                    'Drillroid',
                    'Submarineroid',
                    'Vehicroid Connection Zone',
                    'Polymerization',
                    'Supercharge',
                ],
                fillCriteria: { nameContains: 'roid' },
                extraCards: ['Super Vehicroid - Stealth Union', 'Super Vehicroid Jumbo Drill'],
            },
            {
                id: 'syrus_deck_2',
                name: 'Ambulanceroid Rescue Corps',
                archetype: 'Vehicroid Swarm & Defense',
                description: 'Rescue fallen machine comrades with Ambulanceroid and Expressroid.',
                keyCards: [
                    'Ambulanceroid',
                    'Decoyroid',
                    'Expressroid',
                    'Rescueroid',
                    'Ambulance Rescueroid',
                    'Shield Crush',
                    'No Entry!!',
                ],
                fillCriteria: { nameContains: 'roid' },
                extraCards: ['Ambulance Rescueroid'],
            },
            {
                id: 'syrus_deck_3',
                name: 'Patroid Tactical Patrol',
                archetype: 'Machine Beatdown',
                description: 'Patrol the field with Truckroid and Stealthroid boosted by machine power.',
                keyCards: [
                    'Patroid',
                    'Truckroid',
                    'Stealthroid',
                    'Limiter Removal',
                    'Robotic Knight',
                    'Machine King',
                ],
                fillCriteria: { race: 'Machine' },
            },
        ],
    },
    {
        id: 'chazz-princeton',
        name: 'Chazz Princeton',
        series: 'GX',
        title: 'The Chazz (Manjyome Thunder)',
        tagline: 'Chazz It Up! Armed Dragons & Ojama Kings',
        description: 'The proud elite duelist who survived North Academy. Master of Armed Dragon evolutions, Ojama trios, and V-to-Z machine fusions.',
        themeColor: '#ff9800',
        decks: [
            {
                id: 'chazz_deck_1',
                name: 'Armed Dragon Level Evolution',
                archetype: 'Armed Dragon / Level Monsters',
                description: 'Level up Armed Dragon from LV3 to LV5, LV7, and LV10 to wipe out all enemy monsters.',
                keyCards: [
                    'Armed Dragon LV3',
                    'Armed Dragon LV5',
                    'Armed Dragon LV7',
                    'Level Up!',
                    'Level Modulation',
                    'Stamping Destruction',
                    'Masked Dragon',
                ],
                fillCriteria: { nameContains: 'Armed Dragon' },
            },
            {
                id: 'chazz_deck_2',
                name: 'Ojama Yellow Delta Hurricane',
                archetype: 'Ojama Trio / Field Lock',
                description: 'Unite the goofy Ojama Yellow, Green, and Black to unleash Ojama Delta Hurricane and Ojama King.',
                keyCards: [
                    'Ojama Yellow',
                    'Ojama Green',
                    'Ojama Black',
                    'Ojamagic',
                    'Ojama Delta Hurricane!!',
                    'Ojama Trio',
                    'Polymerization',
                    'Ojamuscle',
                ],
                fillCriteria: { nameContains: 'Ojama' },
                extraCards: ['Ojama King', 'Ojama Knight'],
            },
            {
                id: 'chazz_deck_3',
                name: 'VWXYZ-Dragon Catapult Mech',
                archetype: 'VWXYZ Union Fusion',
                description: 'Combine V-Tiger Jet, W-Wing Catapult, and the XYZ mechs into the ultimate VWXYZ-Dragon Catapult Cannon.',
                keyCards: [
                    'V-Tiger Jet',
                    'W-Wing Catapult',
                    'X-Head Cannon',
                    'Y-Dragon Head',
                    'Z-Metal Tank',
                    'Limiter Removal',
                    'Frontline Base',
                ],
                fillCriteria: { race: 'Machine' },
                extraCards: ['VW-Tiger Catapult', 'VWXYZ-Dragon Catapult Cannon'],
            },
        ],
    },
    {
        id: 'alexis-rhodes',
        name: 'Alexis Rhodes',
        series: 'GX',
        title: 'Obelisk Blue Queen',
        tagline: 'Cyber Blader Martial Arts & Ice Queen',
        description: 'The top female duelist at Duel Academy. Combines graceful Cyber martial artist warriors with deadly ice and ballerina fusions.',
        themeColor: '#3f51b5',
        decks: [
            {
                id: 'alexis_deck_1',
                name: 'Cyber Blader Tutu Ballet',
                archetype: 'Warrior / Fusion Blader',
                description: 'Fuse Blade Skater and Etoile Cyber to summon Cyber Blader whose abilities scale with opponent monster count.',
                keyCards: [
                    'Blade Skater',
                    'Etoile Cyber',
                    'Cyber Tutu',
                    'Cyber Prima',
                    'Cyber Gymnast',
                    'Polymerization',
                    'Fusion Sage',
                    'Reinforcement of the Army',
                ],
                fillCriteria: { race: 'Warrior' },
                extraCards: ['Cyber Blader'],
            },
            {
                id: 'alexis_deck_2',
                name: 'Cyber Shadow Martial Defense',
                archetype: 'Cyber Warrior / Counter',
                description: 'Counter enemy attacks with Cyber Shadow Gardna, Cyber Raider, and The Fiend Megacyber.',
                keyCards: [
                    'Cyber Shadow Gardna',
                    'Cyber Raider',
                    'The Fiend Megacyber',
                    'Cyber Prima',
                    'Cyber Tutu',
                    'Reinforcement of the Army',
                ],
                fillCriteria: { race: 'Warrior' },
            },
            {
                id: 'alexis_deck_3',
                name: 'Abyss Soldier Ocean Strike',
                archetype: 'Water / Ocean Control',
                description: 'Control the field with Abyss Soldier and A Legendary Ocean.',
                keyCards: [
                    'Abyss Soldier',
                    'Salvage',
                    'A Legendary Ocean',
                    'Hydrogeddon',
                    'Torrential Tribute',
                    'Levia-Dragon - Daedalus',
                ],
                fillCriteria: { attribute: 'WATER' },
            },
        ],
    },
    {
        id: 'bastion-misawa',
        name: 'Bastion Misawa',
        series: 'GX',
        title: 'The Analytical Duelist',
        tagline: 'Scientific Formulae & Chemical Reactions',
        description: 'A brilliant student who calculated six distinct element decks. Uses chemical bonding reactions to summon the colossal Water Dragon.',
        themeColor: '#4caf50',
        decks: [
            {
                id: 'bastion_deck_1',
                name: 'Water Dragon Chemical Bonding',
                archetype: 'Chemistry / Water Dragon',
                description: 'Combine Hydrogeddon and Oxygeddon through Bonding H2O to materialize Water Dragon.',
                keyCards: [
                    'Water Dragon',
                    'Hydrogeddon',
                    'Oxygeddon',
                    'Bonding - H2O',
                    'A Legendary Ocean',
                    'Torrential Tribute',
                ],
                fillCriteria: { race: 'Dinosaur' },
            },
            {
                id: 'bastion_deck_2',
                name: 'Vorse Earth Formula',
                archetype: 'Earth Beatdown',
                description: 'A scientifically optimized high-ATK Earth beatdown deck with Vorse Raider and Gemini Elf.',
                keyCards: [
                    'Vorse Raider',
                    'Gemini Elf',
                    'Skilled Dark Magician',
                    'Gaia Power',
                    'Shrink',
                    'Smashing Ground',
                    'Fissure',
                ],
                fillCriteria: { attribute: 'EARTH' },
            },
            {
                id: 'bastion_deck_3',
                name: 'Magnet & Rock Control',
                archetype: 'Rock / Magnet Synergy',
                description: 'Calculate defensive walls with Magnet Warriors and Megarock Dragon.',
                keyCards: [
                    'Alpha The Magnet Warrior',
                    'Beta The Magnet Warrior',
                    'Gamma The Magnet Warrior',
                    'Megarock Dragon',
                    'Book of Moon',
                    'Bottomless Trap Hole',
                ],
                fillCriteria: { race: 'Rock' },
            },
        ],
    },
    {
        id: 'chumley-huffington',
        name: 'Chumley Huffington',
        series: 'GX',
        title: 'Outback Beast Master',
        tagline: 'Giant Koalas & Beast Trample',
        description: 'A relaxed and creative duelist from Australia who loves grilled cheese and gentle Australian wildlife before becoming an Industrial Illusions card designer.',
        themeColor: '#8d6e63',
        decks: [
            {
                id: 'chumley_deck_1',
                name: 'Master of Oz Giant Koalas',
                archetype: 'Koala Beasts / Master of Oz',
                description: 'Fuse Big Koala and Des Kangaroo to summon the colossal 4200 ATK Master of Oz.',
                keyCards: [
                    'Big Koala',
                    'Des Kangaroo',
                    'Des Koala',
                    'Sea Koala',
                    'Polymerization',
                    'Fusion Sage',
                ],
                fillCriteria: { race: 'Beast' },
                extraCards: ['Master of Oz'],
            },
            {
                id: 'chumley_deck_2',
                name: 'Kangaroo Boxing Beatdown',
                archetype: 'Beast Trample',
                description: 'Overrun the opponent with Berserk Gorilla and Enraged Battle Ox dealing piercing damage.',
                keyCards: [
                    'Berserk Gorilla',
                    'Enraged Battle Ox',
                    'Chiron the Mage',
                    'Nimble Momonga',
                    'Rush Recklessly',
                ],
                fillCriteria: { race: 'Beast' },
            },
            {
                id: 'chumley_deck_3',
                name: 'Outback Wilderness Survival',
                archetype: 'Beast-Warrior / Forest',
                description: 'Survive enemy assaults with Giant Rat and counterattack with furious beast surges.',
                keyCards: [
                    'Giant Rat',
                    'Bazoo the Soul-Eater',
                    'Behemoth the King of All Animals',
                    'Spiritual Earth Art - Kurogane',
                    'Gaia Power',
                ],
                fillCriteria: { race: 'Beast' },
            },
        ],
    },
    {
        id: 'aster-phoenix',
        name: 'Aster Phoenix',
        series: 'GX',
        title: 'Destiny HERO Prodigy',
        tagline: 'Clock Tower Prison & Destiny End Dragoon',
        description: 'The genius pro league duelist who wields the dark mirror to Elemental HEROes: the philosophical and merciless Destiny HEROes.',
        themeColor: '#607d8b',
        decks: [
            {
                id: 'aster_deck_1',
                name: 'Destiny Clock Tower Prison',
                archetype: 'Destiny HERO / Clock Tower',
                description: 'Advance the clock counters on Clock Tower Prison to summon Destiny HERO - Dreadmaster and Plasma.',
                keyCards: [
                    'Destiny HERO - Plasma',
                    'Destiny HERO - Dogma',
                    'Destiny HERO - Dreadmaster',
                    'Clock Tower Prison',
                    'Destiny Draw',
                    'D - Time',
                    'Destiny Signal',
                ],
                fillCriteria: { nameContains: 'Destiny HERO' },
            },
            {
                id: 'aster_deck_2',
                name: 'Diamond Dude Spell-Turbo',
                archetype: 'Destiny HERO Turbo',
                description: 'Activate powerful normal spells directly from the top of the deck with Destiny HERO - Diamond Dude.',
                keyCards: [
                    'Destiny HERO - Diamond Dude',
                    'Destiny HERO - Malicious',
                    'Destiny HERO - Dasher',
                    'Destiny HERO - Fear Monger',
                    'D - Spirit',
                    'Over Destiny',
                    'Dark Hole',
                    'Heavy Storm',
                ],
                fillCriteria: { nameContains: 'Destiny HERO' },
            },
            {
                id: 'aster_deck_3',
                name: 'Destiny End Dragoon Assault',
                archetype: 'Destiny Fusion',
                description: 'Fuse Plasma and Dogma into Destiny End Dragoon to burn opponent Life Points every turn.',
                keyCards: [
                    'Destiny HERO - Double Dude',
                    'Destiny HERO - Defender',
                    'Destiny HERO - Captain Tenacious',
                    'Polymerization',
                    'Destiny Mirage',
                    'Reinforcement of the Army',
                ],
                fillCriteria: { nameContains: 'Destiny HERO' },
                extraCards: ['Destiny End Dragoon'],
            },
        ],
    },
    {
        id: 'jesse-anderson',
        name: 'Jesse Anderson',
        series: 'GX',
        title: 'Crystal Beast Sovereign',
        tagline: 'Rainbow Dragon & Gemstone Bonds',
        description: 'A warm-hearted transfer student from North Academy who speaks to the spirits of his seven Crystal Beasts and summons Rainbow Dragon.',
        themeColor: '#00e676',
        decks: [
            {
                id: 'jesse_deck_1',
                name: 'Rainbow Dragon Overdrive',
                archetype: 'Crystal Beast / Rainbow Dragon',
                description: 'Gather all seven Crystal Beasts in the Spell & Trap Zones to summon the almighty 4000 ATK Rainbow Dragon.',
                keyCards: [
                    'Rainbow Dragon',
                    'Crystal Beast Sapphire Pegasus',
                    'Crystal Beast Ruby Carbuncle',
                    'Crystal Beast Topaz Tiger',
                    'Crystal Beast Amber Mammoth',
                    'Crystal Beast Cobalt Eagle',
                    'Crystal Beast Emerald Tortoise',
                    'Crystal Beast Amethyst Cat',
                    'Crystal Promise',
                    'Crystal Abundance',
                ],
                fillCriteria: { nameContains: 'Crystal Beast' },
            },
            {
                id: 'jesse_deck_2',
                name: 'Crystal Pegasus Swarm',
                archetype: 'Crystal Beast Swarm',
                description: 'Continuously search and swarm the field with Sapphire Pegasus and Ruby Carbuncle.',
                keyCards: [
                    'Crystal Beast Sapphire Pegasus',
                    'Crystal Beast Ruby Carbuncle',
                    'Crystal Beast Topaz Tiger',
                    'Crystal Beacon',
                    'Crystal Tree',
                    'Crystal Blessing',
                    'Rare Value',
                ],
                fillCriteria: { nameContains: 'Crystal' },
            },
            {
                id: 'jesse_deck_3',
                name: 'Ancient City Rainbow Ruins',
                archetype: 'Crystal Beast Fortress',
                description: 'Fortify your defenses with Ancient City - Rainbow Ruins unlocking up to 5 tiers of continuous effects.',
                keyCards: [
                    'Ancient City - Rainbow Ruins',
                    'Crystal Beast Sapphire Pegasus',
                    'Crystal Beast Amethyst Cat',
                    'Crystal Raigeki',
                    'Crystal Pair',
                    'Terraforming',
                ],
                fillCriteria: { nameContains: 'Crystal' },
            },
        ],
    },
    {
        id: 'vellian-crowler',
        name: 'Dr. Vellian Crowler',
        series: 'GX',
        title: 'Department Chair of Obelisk Blue',
        tagline: 'Ancient Gear Golem & Mechanical Fortress',
        description: 'The flamboyant yet formidable professor at Duel Academy who possesses a PhD in Dueling and commands unstoppable Ancient Gear siege engines.',
        themeColor: '#c0ca33',
        decks: [
            {
                id: 'crowler_deck_1',
                name: 'Ancient Gear Golem Siege',
                archetype: 'Ancient Gear Golem',
                description: 'Summon the legendary 3000 ATK Ancient Gear Golem that prevents all Spell and Trap activations during battle.',
                keyCards: [
                    'Ancient Gear Golem',
                    'Ancient Gear Beast',
                    'Ancient Gear Soldier',
                    'Ancient Gear Castle',
                    'Ancient Gear Workshop',
                    'Ancient Gear Drill',
                    'Limiter Removal',
                    'Heavy Storm',
                ],
                fillCriteria: { nameContains: 'Ancient Gear' },
            },
            {
                id: 'crowler_deck_2',
                name: 'Ultimate Ancient Gear Fusion',
                archetype: 'Ancient Gear Fusion',
                description: 'Fuse three Ancient Gear titans into the devastating 4400 ATK Ultimate Ancient Gear Golem.',
                keyCards: [
                    'Ancient Gear Golem',
                    'Ancient Gear Engineer',
                    'Ancient Gear Knight',
                    'Polymerization',
                    'Power Bond',
                    'Overload Fusion',
                    'Ancient Gear Gadjiltron Dragon',
                ],
                fillCriteria: { nameContains: 'Ancient Gear' },
                extraCards: ['Ultimate Ancient Gear Golem'],
            },
            {
                id: 'crowler_deck_3',
                name: 'Ancient Gear Cannon Lockdown',
                archetype: 'Machine Duplication / Cannon',
                description: 'Duplicate Ancient Gear Cannon with Machine Duplication to lock down and burn opponent lines.',
                keyCards: [
                    'Ancient Gear Cannon',
                    'Ancient Gear',
                    'Machine Duplication',
                    'Limiter Removal',
                    'Ancient Gear Tank',
                    'Ancient Gear Explosive',
                ],
                fillCriteria: { nameContains: 'Ancient Gear' },
            },
        ],
    },
];
// -----------------------------------------------------------------------------
// Generation Execution
// -----------------------------------------------------------------------------
console.log('=== Starting Phase 6 Character & Deck Generation ===');
const finalCharacters = [];
let totalDecksGenerated = 0;
let totalCardsValidated = 0;
for (const charDef of CHARACTERS) {
    console.log(`Processing character: [${charDef.series}] ${charDef.name}...`);
    const builtDecks = [];
    const allCharSignatureCards = [];
    for (let dIdx = 0; dIdx < charDef.decks.length; dIdx++) {
        const deckDef = charDef.decks[dIdx];
        const { main, extra, signature } = buildDeck(deckDef.keyCards, deckDef.fillCriteria, deckDef.extraCards ?? []);
        if (main.length !== 40) {
            throw new Error(`Deck ${deckDef.name} for ${charDef.name} does not have 40 cards! Has: ${main.length}`);
        }
        for (const cardId of main) {
            const row = checkDbStmt.get(cardId);
            if (!row) {
                throw new Error(`Card ID ${cardId} in ${deckDef.name} not found in cards.cdb!`);
            }
            totalCardsValidated++;
        }
        for (const cardId of extra) {
            const row = checkDbStmt.get(cardId);
            if (!row) {
                throw new Error(`Extra Card ID ${cardId} in ${deckDef.name} not found in cards.cdb!`);
            }
            totalCardsValidated++;
        }
        const ydkFilename = `${charDef.id}_deck_${dIdx + 1}.ydk`;
        const ydkRelativePath = `resources/decks/${ydkFilename}`;
        const ydkFullPath = path.resolve(DECKS_DIR, ydkFilename);
        writeYdkFile(ydkFullPath, main, extra);
        totalDecksGenerated++;
        for (const sId of signature) {
            if (!allCharSignatureCards.includes(sId)) {
                allCharSignatureCards.push(sId);
            }
        }
        builtDecks.push({
            id: deckDef.id,
            name: deckDef.name,
            archetype: deckDef.archetype,
            description: deckDef.description,
            ydkPath: ydkRelativePath,
            mainCards: main,
            extraCards: extra,
            signatureCardIds: signature,
        });
    }
    finalCharacters.push({
        id: charDef.id,
        name: charDef.name,
        series: charDef.series,
        title: charDef.title,
        tagline: charDef.tagline,
        description: charDef.description,
        avatar: `resources/characters/portraits/${charDef.id}.png`,
        video: `resources/videos/characters/${charDef.id}.mp4`,
        decks: builtDecks,
        signatureCards: allCharSignatureCards.slice(0, 5),
        themeColor: charDef.themeColor,
    });
}
fs.writeFileSync(OUTPUT_CHARACTERS_PATH, JSON.stringify(finalCharacters, null, 2), 'utf-8');
db.close();
console.log(`\n[SUCCESS] Generated ${finalCharacters.length} characters (10 DM, 10 GX).`);
console.log(`[SUCCESS] Generated ${totalDecksGenerated} .ydk decks in resources/decks/ (40 cards each).`);
console.log(`[SUCCESS] Validated ${totalCardsValidated} card entries against resources/cards.cdb.`);
console.log(`[SUCCESS] Output written to data/characters.json.`);
