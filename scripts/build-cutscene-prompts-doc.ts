import * as fs from 'fs';
import * as path from 'path';

export interface MonsterPromptSpec {
  id: number;
  name: string;
  series: 'DM' | 'GX' | '5Ds';
  archetype: string;
  icon: string;
  visualTraits: string;
  summonAnim: string;
  attackName: string;
  attackAnim: string;
  isVideoType?: 'victory' | 'both';
}

export const monsters: MonsterPromptSpec[] = [
  // ===========================================================================
  // PART 1: ORIGINAL SERIES (DM) — 21 MONSTERS
  // ===========================================================================
  {
    id: 102380,
    name: 'Lava Golem',
    series: 'DM',
    archetype: 'Marik Ishtar / Fiend',
    icon: '🌋',
    visualTraits: 'colossal infernal cage demon made of jagged obsidian stone and flowing orange-red magma, a massive iron cage ribcage holding glowing fiery skulls, twin smoking volcanic vents on its shoulders, and blazing yellow eyes.',
    summonAnim: 'Apocalyptic volcanic eruption cutscene. The dueling ground fractures into deep fissures glowing with bubbling molten magma. With a deafening roar, Lava Golem rises from the volcanic abyss, towering over the field as streams of liquid lava cascade off its rocky shoulders. Its iron cage ribs clang with eerie metallic resonance, and thick black sulfurous smoke billows into the sky. Volcanic embers swirling, cinematic low-angle camera push, heat distortion, 4k resolution, 60fps.',
    attackName: 'Golem Volcano',
    attackAnim: 'Devastating volcanic bombardment: "Golem Volcano". Lava Golem leans forward, its twin volcanic shoulder vents igniting with superheated white-hot magma. It launches colossal burning meteorites and torrents of bubbling liquid rock directly at the camera. The screen shakes violently under the concussive impacts, followed by an explosive shockwave of blazing orange fire and flying black volcanic shrapnel. Dynamic camera shake, cinematic lighting, 4k.'
  },
  {
    id: 423705,
    name: 'Gearfried the Iron Knight',
    series: 'DM',
    archetype: 'Joey Wheeler / Warrior',
    icon: '🛡️',
    visualTraits: 'stout and heavily armored medieval knight clad in riveted gunmetal-grey iron plating, restraining steel bands across its chest and limbs, a horned iron helmet with a glowing emerald-green visor, and a heavy double-edged iron broadsword.',
    summonAnim: 'Heavy metallic warrior summon sequence. An anvil strikes in darkness, sending brilliant orange sparks across the screen. Gearfried the Iron Knight materializes amidst clanking chains and locking armor plates. It draws its heavy iron broadsword in a sharp diagonal guard, iron boots stepping forward with resounding mechanical weight. Green visor flashes with determination, steel armor gleaming under harsh dueling lights. Gritty medieval anime aesthetic, spark particles, 4k, 60fps.',
    attackName: 'Iron Sword Slash',
    attackAnim: 'Powerhouse heavy sword strike: "Iron Sword Slash". Gearfried the Iron Knight breaks into an explosive sprint, dragging its heavy broadsword along the ground to kick up a shower of bright friction sparks. It leaps high into the air against a dramatic anime speed-line backdrop and brings the massive iron blade down in a crushing two-handed vertical cleave straight through the camera lens. Metal impact lines, shockwave ring, intense screen shake, 4k.'
  },
  {
    id: 3643300,
    name: 'The Legendary Fisherman',
    series: 'DM',
    archetype: 'Mako Tsunami / Warrior',
    icon: '🌊',
    visualTraits: 'rugged deep-sea ocean hunter in hydrodynamic navy-blue diving combat gear, weathered sea cape, sturdy harpoon holster, wielding a gleaming high-tensile steel harpoon spear, standing resolute against rushing tides.',
    summonAnim: 'Oceanic tidal surge cutscene. The arena floor vanishes beneath churning aquamarine ocean waves. A colossal tidal wave rises toward the sky, parting to reveal The Legendary Fisherman standing heroically on the crest. He grips his steel harpoon spear with practiced expertise, cape snapping in the sea gale as sea spray and sparkling water droplets mist across the screen. Volumetric ocean sunlight, fluid water dynamics, cinematic anime rendering, 4k, 60fps.',
    attackName: 'Deep Sea Harpoon',
    attackAnim: 'High-velocity aquatic strike: "Deep Sea Harpoon". The Legendary Fisherman drops into a deep throwing stance, pulling his arm back as swirling spirals of pressurized ocean water coil around his harpoon shaft. He hurls the spear forward with supersonic force; the weapon hurtles directly toward the camera enveloped in a roaring aquatic drill vortex, piercing the screen with an explosive water burst. Hydrodynamic shockwave, splashing water droplets, 4k.'
  },
  {
    id: 5405694,
    name: 'Black Luster Soldier',
    series: 'DM',
    archetype: 'Yugi Muto / Ritual Warrior',
    icon: '⚔️',
    visualTraits: 'legendary supreme ritual warrior, clad in ornate midnight-blue and polished gold filigree armor, majestic horned ceremonial helm with flowing crimson hair, wielding an ornate golden broadsword and sacred crest shield.',
    summonAnim: 'Sacred Chaos ritual transcendence sequence. Twin pillars of radiant solar gold and abyssal midnight-purple light erupt from an ancient runic ritual circle. The two cosmic forces spiral together into a singularity, shattering outward into golden starlight. Black Luster Soldier descends gracefully through the aura, golden blade held in a master salute, crimson hair flowing majestically. Heroic grandeur, sacred anime runes, godlike presence, 4k, 60fps.',
    attackName: 'Chaos Blade',
    attackAnim: 'Supreme legendary slash: "Chaos Blade". Black Luster Soldier draws back his golden broadsword as twin ribbons of golden solar radiance and dark violet cosmic energy wrap around the blade. He vanishes in an instant, reappearing inches from the camera delivering an earth-shattering diagonal cross slash that cleaves space itself. Shimmering gold and purple impact lines, cosmic particle dispersion, 4k.'
  },
  {
    id: 10000000,
    name: 'Obelisk the Tormentor',
    series: 'DM',
    archetype: 'Egyptian God / Seto Kaiba',
    icon: '🏛️',
    visualTraits: 'monumental Egyptian God titan, indestructible cobalt-blue stone physique, colossal gargoyle-like draconic wings, sweeping horns, burning red eyes, and immense spiked fists crackling with divine blue energy.',
    summonAnim: 'Cataclysmic Egyptian God summon sequence. The sky turns pitch-black as violent bolts of blue divine lightning strike the earth repeatedly. The ground shakes with seismic tremors as Obelisk the Tormentor rises from the thunderclouds, an incomprehensibly vast blue colossus blotting out the horizon. It spreads its immense stone wings and lets out an earth-shattering divine roar, red eyes glowing with absolute dominion. Tremor camera shake, volumetric storm clouds, godlike scale, 4k, 60fps.',
    attackName: 'Fist of Fate',
    attackAnim: 'Almighty divine strike: "Fist of Fate". Obelisk the Tormentor pulls back its titanic right fist, concentrating crackling blue divine plasma and cosmic lightning until the knuckles glow blinding white-hot. It steps forward, shattering the earth beneath its feet, and drives its colossal punch directly down into the camera. The screen shatters under the impact in an apocalyptic explosion of blue divine energy and seismic shockwaves. Maximum screen shake, 4k.'
  },
  {
    id: 10000010,
    name: 'The Winged Dragon of Ra',
    series: 'DM',
    archetype: 'Egyptian God / Marik Ishtar',
    icon: '☀️',
    visualTraits: 'supreme Egyptian God solar deity, sculpted entirely of radiant gleaming hieroglyphic gold, majestic avian-dragon head, colossal multi-layered golden feathered wings, and an intensely glowing solar heart core.',
    summonAnim: 'Supreme solar manifestation cutscene. A blinding golden sphere of sacred Egyptian fire descends from the stratosphere, illuminating the entire sky in brilliant holy amber light. Ancient golden hieroglyphics circle the orb. The golden sphere unfolds gracefully, spreading immense feathered wings as The Winged Dragon of Ra emerges in divine majesty, radiating unbearable heat and blinding celestial brilliance. Holy choral aura, golden lens flares, breathtaking majesty, 4k, 60fps.',
    attackName: 'God Phoenix / Blaze Cannon',
    attackAnim: 'Apocalyptic solar incineration: "Blaze Cannon". The Winged Dragon of Ra arches its golden neck, drawing all ambient heat into its beak until an ultra-dense sphere of nuclear golden plasma forms. It unleashes a massive, blinding column of pure solar flame straight into the camera, melting the battlefield into molten glass and consuming the entire screen in incandescent holy fire. Blinding white-gold flash, heat haze distortion, 4k.'
  },
  {
    id: 12206212,
    name: 'Harpie Lady Sisters',
    series: 'DM',
    archetype: 'Mai Valentine / Winged Beast',
    icon: '🪶',
    visualTraits: 'glamorous trio of avian warrior sisters, wearing aerodynamic bodysuits in vibrant magenta, violet, and cyan, with sweeping feathered wings, razor-sharp silver talons, and styled golden anime hair.',
    summonAnim: 'Synchronous aerial ballet anime entrance. A fierce, fragrant gale sweeps across an azure sky, scattering luminescent feathers. The three Harpie Lady Sisters dive into view in tight aerodynamic formation, performing acrobatic barrel rolls and spins before landing in a glamorous, three-tiered battle pose, silver talons glistening in the sun with a metallic chime. Dynamic camera arc, fluttering feathers, vibrant 90s anime glamour aesthetic, 4k, 60fps.',
    attackName: 'Triangle Ecstasy Spark',
    attackAnim: 'Triangular energy barrage: "Triangle Ecstasy Spark". The three Harpie sisters soar high and position themselves into a perfect equilateral triangle across the sky. They link their silver talons, generating crackling beams of brilliant magenta, cyan, and gold electricity between them. From the center of the triangle, they unleash an explosive, pulsing laser beam directly into the camera. Vibrant electric sparks, intense anime speed lines, 4k.'
  },
  {
    id: 23995346,
    name: 'Blue-Eyes Ultimate Dragon',
    series: 'DM',
    archetype: 'Seto Kaiba / Dragon Fusion',
    icon: '🐉',
    visualTraits: 'colossal three-headed dragon titan, gleaming pearlescent silver-white armored scales, six sweeping horns, three pairs of piercing sapphire-blue eyes, and a gargantuan wingspan that blocks out the sky.',
    summonAnim: 'Legendary fusion climax cutscene. Three majestic Blue-Eyes White Dragons soar in a high-speed spiral toward the heavens, merging into an overwhelming vortex of blinding blue fusion lightning. Out of the cataclysm emerges Blue-Eyes Ultimate Dragon, all three heads roaring in deafening harmony as sapphire draconic aura detonates across the arena. Dramatic low-angle push, volumetric blue lightning arcs, legendary KaibaCorp aesthetic, 4k, 60fps.',
    attackName: 'Neutron Blast',
    attackAnim: 'Ultimate triple annihilation: "Neutron Blast". All three dragon heads pull back simultaneously, inhaling swirling rings of concentrated sapphire and cobalt plasma into their open maws. In perfect unison, all three heads unleash a colossal triple-helix beam of devastating blue-white nuclear energy straight into the camera, obliterating the screen in an apocalyptic burst of light. Shockwave rings, blinding flash, 4k.'
  },
  {
    id: 30208479,
    name: 'Magician of Black Chaos',
    series: 'DM',
    archetype: 'Yugi Muto / Spellcaster Ritual',
    icon: '🔮',
    visualTraits: 'supreme dark ritual sorcerer, adorned in flowing midnight-blue and black robes lined with glowing gold arcane runes, an ornate horned sorcerer headdress, and wielding the glowing golden Scepter of Chaos.',
    summonAnim: 'Occult Black Magic ritual cutscene. An ancient mystical circle ignites on the floor with dark purple and shimmering gold sorcery flames. Swirling geometric glyphs rise into the air as Magician of Black Chaos materializes from the dark vortex, levitating serenely with his chaos scepter resting across his chest. His eyes flash with ancient arcane wisdom as dark cosmic particles orbit his robes. Dark fantasy anime aesthetic, volumetric spell lighting, 4k, 60fps.',
    attackName: 'Chaos Scepter Blast',
    attackAnim: 'Devastating cosmic arcane blast: "Chaos Scepter Blast". Magician of Black Chaos raises his scepter high, spinning it with master precision. The orb atop the staff condenses swirling dark matter and glittering gold stardust into a pulsating singularity. He thrusts the scepter forward, unleashing a spiraling, high-frequency beam of black-and-gold destructive magic straight into the camera lens. Arcane impact lines, mystical smoke, 4k.'
  },
  {
    id: 31829185,
    name: 'Dark Necrofear',
    series: 'DM',
    archetype: 'Yami Bakura / Fiend',
    icon: '👻',
    visualTraits: 'haunting fiendish demon woman with pale porcelain skin, cracked mottled-grey limbs, hollow soulless dark eyes with glowing violet pupils, clutching a headless porcelain baby doll, surrounded by sickly green and violet ectoplasm.',
    summonAnim: 'Spine-chilling occult horror anime entrance. Shadows writhe unnaturally along the ground as the ambient temperature drops to freezing. A puddle of dark violet ectoplasm bubbles open, and Dark Necrofear slowly floats upward. Her porcelain doll twitches in her arms as a hollow, disembodied laugh echoes through the arena. Her gaze fixes onto the camera with chilling malevolence. Creepy gothic anime horror, volumetric mist, eerie flickering lighting, 4k, 60fps.',
    attackName: 'Dark Necromancy',
    attackAnim: 'Spectral soul assault: "Dark Necromancy". Dark Necrofear cradles her cracked doll as its hollow neck erupts with screaming, tormented ghostly faces. She points her skeletal hand forward; a torrent of swirling shadowy hands and screeching violet poltergeist spirits rushes directly at the viewer, shattering reality with psychic distortion. Violet chromatic aberration, screen-shattering spectral impact, 4k.'
  },
  {
    id: 33396948,
    name: 'Exodia the Forbidden One',
    series: 'DM',
    archetype: 'Yugi Muto / Spellcaster Instant Win',
    icon: '👑',
    visualTraits: 'immense golden Egyptian deity giant, muscular ancient physique adorned with ceremonial gold armor, shattered ancient iron chains dangling from wrist and leg cuffs, and ancient glowing hieroglyphic inscriptions across its chest.',
    summonAnim: 'Ultimate victory unsealing sequence. Five glowing golden pentagram seals appear sequentially across the screen, each shattering with an explosive sonic chime. The clouds part as Exodia the Forbidden One materializes, an incomprehensibly vast golden titan towering above the clouds. The broken chains on its wrists swing with heavy authority as it looks down with omnipotent divine power. Unstoppable victory aura, blinding golden radiance, epic anime finale scale, 4k, 60fps.',
    attackName: 'Exodo Flame',
    attackAnim: 'Supreme match-ending cataclysm: "Exodo Flame". Exodia brings both colossal hands together in front of its chest, generating a blinding sphere of white-hot golden cosmic energy that warps space itself. With a universe-shaking thrust, it fires an all-consuming beam of holy golden destruction straight through the camera, disintegrating all obstacles in an inescapable wave of light. Ultimate anime finishing move, pure whiteout flash, 4k.',
    isVideoType: 'victory'
  },
  {
    id: 38033120,
    name: 'Dark Magician Girl',
    series: 'DM',
    archetype: 'Yugi Muto / Spellcaster',
    icon: '💖',
    visualTraits: 'beloved energetic blonde anime sorceress, wearing a vibrant pastel-pink and sky-blue magical uniform, pointed wizard hat with gold trim, sparkling jewel star on her chest, and holding a golden magical wand with a ruby orb.',
    summonAnim: 'Sparkling magical girl anime entrance. Whimsical pink magical circles, floating sparkling stars, and translucent heart motifs swirl playfully through the air. Dark Magician Girl leaps gracefully out of the magical vortex, landing on one foot with an adorable wink and a twirl of her wand. She strikes her iconic smiling hand-on-hip pose as golden magical sparkles cascade around her. Vibrant, charming, high-end cel-shaded anime aesthetic, bloom lighting, 4k, 60fps.',
    attackName: 'Dark Burning Attack',
    attackAnim: 'Blazing magical burst: "Dark Burning Attack". Dark Magician Girl twirls her golden wand at rapid speed, carving a glowing pink heart-shaped sigil in the air. The sigil ignites with supercharged magenta and gold magical plasma. With a determined and cute shout, she points her wand forward, blasting a massive heart-shaped beam of dazzling pink magical flame directly at the camera. Sparkle bursts, starry lens flares, 4k.'
  },
  {
    id: 45231177,
    name: 'Flame Swordsman',
    series: 'DM',
    archetype: 'Joey Wheeler / Warrior',
    icon: '🗡️',
    visualTraits: 'heroic agile swordsman in crimson-and-silver plated armor, flowing scarlet scarf fluttering in the wind, holding a long steel broadsword fully engulfed in raging, active orange and gold flames.',
    summonAnim: 'Dynamic hero slash entrance. A dense cloud of black smoke billows across the screen, suddenly sliced in half by an intense arc of bright orange fire. Flame Swordsman emerges through the flames, sliding to a dramatic halt in a low combat crouch. He flourishes his blazing broadsword in a circular guard, flames licking the blade as his flowing red scarf catches the night breeze. High-octane anime action aesthetic, flying embers, 4k, 60fps.',
    attackName: 'Flaming Sword of Justice',
    attackAnim: 'Scorching flame slash: "Flaming Sword of Justice". Flame Swordsman breaks into an agile sprint, coating his entire sword in a roaring column of white-hot fire. He leaps forward with acrobatic grace, executing a sweeping horizontal crescent slash right across the camera lens. The strike releases a searing wave of blazing fire that fills the screen with heat distortion and fiery sparks. Dynamic impact lines, explosive fire burst, 4k.'
  },
  {
    id: 64631466,
    name: 'Relinquished',
    series: 'DM',
    archetype: 'Maximillion Pegasus / Ritual Illusion',
    icon: '👁️',
    visualTraits: 'bizarre occult entity composed of a giant golden Millennium Eye centered on an organic violet and obsidian fleshy sphere, surrounded by undulating tendrils and a bizarre skeletal cage mantle.',
    summonAnim: 'Eerie surrealist illusion ritual cutscene. The background melts into a psychedelic spiral of surreal purple and black optical patterns. An ancient dark ritual chalice spills black fog onto the ground, from which Relinquished rises silently. Its giant central Millennium Eye snaps open with an unblinking golden glare, pulsing with hypnotic rings of dark energy. Unsettling psychological anime horror, surrealist aesthetic, floating tendrils, 4k, 60fps.',
    attackName: 'Black Illusion',
    attackAnim: 'Mind-bending void pulse: "Black Illusion". The golden Millennium Eye of Relinquished dilates intensely, radiating concentric rings of dark violet hypnotic energy waves. Space around the screen bends and warps inward toward the eye like a gravitational black hole, releasing an overwhelming pulse of dark negative-energy shockwaves straight into the viewer. Chromatic reality distortion, hypnotic purple flashes, 4k.'
  },
  {
    id: 70781052,
    name: 'Summoned Skull',
    series: 'DM',
    archetype: 'Yugi Muto / Fiend',
    icon: '⚡',
    visualTraits: 'terrifying muscular skeletal fiend, exposed ribcage over dark sinewy flesh, swept-back ribbed demon horns, leathery gargoyle wings, and crackling high-voltage yellow electrical lightning enveloping its entire body.',
    summonAnim: 'Stormy underworld demonic summon cutscene. Black storm clouds gather violently as thunder claps with deafening fury. A massive bolt of yellow lightning strikes the center of the arena; out of the scorched crater rises Summoned Skull, unfurling its ragged bat wings. Electricity crackles furiously across its skeletal chest and horns as it glares forward with menacing yellow eyes. Heavy gothic anime lightning, ozone sparks, 4k, 60fps.',
    attackName: 'Lightning Strike',
    attackAnim: 'Cataclysmic electric execution: "Lightning Strike". Summoned Skull channels high-voltage electricity through its curved demonic horns, which glow blinding yellow. It thrusts both clawed skeletal hands forward, releasing a massive, fork-shaped thunderbolt that arcs across the screen with blinding intensity, shattering the camera lens with electric shockwaves. Blinding yellow-white flash, lightning branches, screen shake, 4k.'
  },
  {
    id: 71625222,
    name: 'Time Wizard',
    series: 'DM',
    archetype: 'Joey Wheeler / Spellcaster',
    icon: '⏰',
    visualTraits: 'quirky clockwork sorcerer with a brass pocket-watch body, spinning mechanical clock hands, red pointed cap, playful white mustache, and holding an ornate golden hourglass staff.',
    summonAnim: 'Charming clockwork anime entrance. Loud mechanical ticking and antique grandfather clock chimes echo playfully. A swirling temporal rift opens, and Time Wizard pops out headfirst, twirling in midair before landing on his little boots. He wiggles his mustache with a mischievous chuckle and begins spinning the roulette hand on his chest. Whimsical steampunk anime aesthetic, spinning gears, brass reflections, 4k, 60fps.',
    attackName: 'Time Roulette',
    attackAnim: 'Gamble of destiny: "Time Magic Roulette". Time Wizard spins the golden arrow on his chest dial at blurring speed. The dial locks onto the winning skull with a victorious chime! The hourglass atop his staff begins glowing with swirling chronal light, unleashing a vortex of golden temporal waves and clock gears that rush over the camera, aging and warping everything in its path. Clockwork particle effects, time-distortion waves, 4k.'
  },
  {
    id: 74677422,
    name: 'Red-Eyes Black Dragon',
    series: 'DM',
    archetype: 'Joey Wheeler / Dragon',
    icon: '🔥',
    visualTraits: 'sleek and ferocious dragon of potential, pitch-black jagged draconic scales, glowing crimson-ruby eyes, sharp ivory fangs and claws, and sweeping bat-like draconic wings.',
    summonAnim: 'Fiery underdog dragon summon sequence. A volcanic crater splits the ground amidst flying cinders and black ash. Red-Eyes Black Dragon erupts from the inferno, spreading its jagged wings against a blood-red twilight sky. It lets out a ferocious, guttural roar toward the heavens, its ruby eyes burning with fiery resolve and untamed wild spirit. Fiery embers, dynamic camera track, classic gritty anime dragon aesthetic, 4k, 60fps.',
    attackName: 'Inferno Fire Blast',
    attackAnim: 'Blazing dragon fireball: "Inferno Fire Blast". Red-Eyes Black Dragon gathers roaring crimson and black flames deep within its throat, glowing through its neck scales like liquid magma. It lunges forward and unleashes a gargantuan sphere of superheated black-and-red dragon fire directly at the camera, detonating in an all-consuming explosion of heat and flame. Expanding shockwave ring, firestorm particles, 4k.'
  },
  {
    id: 75347539,
    name: 'Valkyrion the Magna Warrior',
    series: 'DM',
    archetype: 'Yugi Muto / Rock Combiner',
    icon: '🧲',
    visualTraits: 'colossal magnetic warrior titan, composed of heavy interlocking geometric steel and brass armor plates, glowing electromagnetic polarity cores (red positive / blue negative), wielding a massive magnetic broadsword.',
    summonAnim: 'Super-robot magnetic docking sequence. Alpha, Beta, and Gamma Magna Warriors streak across the sky as red and blue electromagnetic energy trails. They collide in midair with deafening metallic impacts, interlocking seamlessly into Valkyrion the Magna Warrior. It lands with immense seismic weight, magnetic broadsword drawn, polarity cores pulsing with crackling blue lightning. Mecha docking anime aesthetic, magnetic sparks, 4k, 60fps.',
    attackName: 'Magnet Saber Shock',
    attackAnim: 'Electromagnetic cleave: "Magnet Saber Shock". Valkyrion energizes its colossal broadsword, channeling crackling blue and orange magnetic lightning along the blade edge. It swings the sword in an earth-shattering horizontal slash, releasing an immense crescent wave of polarized magnetic energy that carves through the ground and bursts straight through the camera lens. Magnetic distortion arcs, heavy metal impact, 4k.'
  },
  {
    id: 77585513,
    name: 'Jinzo',
    series: 'DM',
    archetype: 'Joey Wheeler & Espa Roba / Machine',
    icon: '🤖',
    visualTraits: 'menacing cybernetic android warrior, polished silver chrome faceplate, psychic amplifier headset with glowing circuitry cables, dark purple leather high-collar trench coat, and piercing glowing red optic eyes.',
    summonAnim: 'Sci-fi trap-destruction anime entrance. A digital blue holographic grid flickers across the screen with television static and glitch effects. Jinzo stomps forward through the static, purple trench coat flaring open. Holographic trap cards shatter into thousands of digital glass fragments around his boots as his red optic visor flashes with cold, unyielding calculation. Cyberpunk anime aesthetic, digital glitch particles, 4k, 60fps.',
    attackName: 'Cyber Energy Shock',
    attackAnim: 'Piercing cyber optic laser: "Cyber Energy Shock". The amplifier nodes on Jinzo\'s headset pulse with intense violet-green psychic electricity. He leans his head forward, locking his glowing red optic sensors onto the target. He fires twin high-intensity crimson laser beams straight down the camera lens, followed by a shockwave of crackling green cyber-energy that disintegrates everything. High-contrast laser burn, digital impact lines, 4k.'
  },
  {
    id: 82301904,
    name: 'Chaos Emperor Dragon - Envoy of the End',
    series: 'DM',
    archetype: 'Chaos / Dragon',
    icon: '🌌',
    visualTraits: 'fearsome primordial dragon emperor, iridescent dark violet and gold scales, sweeping dragon horns, glowing cosmic dual-energy spheres embedded on its wings, and ominous glowing crimson eyes.',
    summonAnim: 'Apocalyptic cosmic cataclysm cutscene. A total solar eclipse darkens the universe as twin vortexes of radiant holy light and abyssal dark matter spiral into a singularity. Chaos Emperor Dragon breaks through the event horizon, unfurling its immense wings as gravitational waves ripple through space. It hovers ominously, radiating terrifying, world-ending aura. Cosmic anime apocalypse aesthetic, gravitational lens flares, 4k, 60fps.',
    attackName: 'Primal Burst',
    attackAnim: 'Reality-wiping annihilation wave: "Primal Burst". Chaos Emperor Dragon gathers all ambient light, matter, and cards into a pulsating, ultra-dense sphere of black-and-gold antimatter between its horns. It unleashes the singularity in an omnidirectional, reality-wiping blast wave that washes over the camera, disintegrating all matter into cosmic dust. Screen whiteout, gravitational shockwave distortion, 4k.'
  },
  {
    id: 98502113,
    name: 'Dark Paladin',
    series: 'DM',
    archetype: 'Yugi Muto / Spellcaster Fusion',
    icon: '🪄',
    visualTraits: 'supreme Dragon-slaying fusion knight, combining Dark Magician\'s midnight-blue robes with Buster Blader\'s heavy engraved steel armor, flowing emerald-green cape, wielding an ornate dual-bladed dragon-slaying halberd.',
    summonAnim: 'Legendary fusion mastery cutscene. Dark Magician\'s mystic circle and Buster Blader\'s broadsword clash in a blinding explosion of cyan fusion energy. Dark Paladin emerges from the vortex, spinning his massive dragon-slaying halberd in a breathtaking martial display before planting the weapon firmly into the ground, emerald cape billowing heroically. Regal knight-sorcerer anime aesthetic, cyan magical runes, 4k, 60fps.',
    attackName: 'Dark Spiral Wave',
    attackAnim: 'Dragon-slaying magical blast: "Dark Spiral Wave". Dark Paladin spins his halberd overhead like a propeller, gathering both dark magical energy and dragon-slaying spirit into the twin blades. He thrusts the halberd forward, releasing an overwhelming spiraling tornado of radiant azure and indigo energy that tears through the ground straight into the camera. High-speed spiraling wave, intense anime impact lines, 4k.'
  },

  // ===========================================================================
  // PART 2: YU-GI-OH! GX — 17 MONSTERS
  // ===========================================================================
  {
    id: 1546123,
    name: 'Cyber End Dragon',
    series: 'GX',
    archetype: 'Zane Truesdale / Machine Fusion',
    icon: '🤖',
    visualTraits: 'colossal three-headed cybernetic machine dragon, polished chrome-silver armor plating, glowing red optic sensors, triple hydraulic serpentine necks, and vast mechanical wings venting glowing blue plasma.',
    summonAnim: 'Grand industrial cyber-fusion launch. In a high-tech underground silo, three Cyber Dragons lock into docking position amidst roaring steam vents and locking clamps. Cyber End Dragon powers up with a deafening electronic hum, all three mechanical heads extending forward with hydraulic hisses. It spreads its immense chrome wings, red optic sensors glowing, and lets out a synchronized synthesized metallic roar. Sci-fi mecha majesty, steam and lens flare, 4k, 60fps.',
    attackName: 'Super Strident Blaze',
    attackAnim: 'Apocalyptic triple beam cannon: "Super Strident Blaze" (Eternal Evolution Burst). All three heads charge concentrated spheres of blinding emerald-white laser plasma in their open mechanical maws. With a screen-shattering sonic boom, they fire a unified triple-laser barrage directly down the camera lens, annihilating everything in an expanding nuclear pillar of green-and-white light. Maximum impact flash, 4k.'
  },
  {
    id: 3897065,
    name: 'Super Vehicroid - Stealth Union',
    series: 'GX',
    archetype: 'Syrus Truesdale / Machine Fusion',
    icon: '✈️',
    visualTraits: 'colossal vehicular combiner fortress, featuring stealth bomber wings in matte charcoal, a heavy locomotive torso, bulldozer treads, rotating radar radomes, and dozens of concealed missile battery ports.',
    summonAnim: 'High-speed vehicular assembly cutscene. A train, stealth fighter jet, and construction vehicles rocket into formation across an aircraft carrier deck. They leap into the air and dock with explosive hydraulic bolts and locking clamps. Super Vehicroid - Stealth Union touches down with heavy suspension bounce, its jet turbines roaring at full thrust as twin headlights pierce through the darkness. Playful yet epic mecha anime aesthetic, 4k, 60fps.',
    attackName: 'Stealth Fire Barrage',
    attackAnim: 'Full ordnance missile swarm: "Stealth Fire Barrage". Stealth Union activates battle mode, opening every wing bay and chest compartment to reveal hundreds of glowing micro-missiles. It unleashes an overwhelming swarm of spiraling missiles, cannon shells, and twin laser beams straight at the camera, engulfing the screen in an explosive chain-reaction firestorm. High-density missile smoke trails, anime explosion physics, 4k.'
  },
  {
    id: 5861892,
    name: 'Arcana Force EX - The Light Ruler',
    series: 'GX',
    archetype: 'Sartorius Kumar / Fairy',
    icon: '🎴',
    visualTraits: 'celestial deity of supreme destiny, sculpted in transcendent porcelain-white and gold filigree, rotating tarot wheel halos, dual impassive cosmic mask faces, and ethereal multi-tiered angelic wings.',
    summonAnim: 'Sacred tarot divination cutscene. A giant glowing Arcana tarot card spins in the center of a celestial starfield. The card detonates into a column of blinding divine white-and-gold light, revealing Arcana Force EX - The Light Ruler floating serenely. The sacred tarot wheel behind its back rotates smoothly as divine celestial runes bathe the universe in holy illumination. Divine choral atmosphere, transcendent anime majesty, 4k, 60fps.',
    attackName: 'The Ray of Destiny',
    attackAnim: 'Cosmic beam of judgment: "The Ray of Destiny". The rotating tarot wheel behind The Light Ruler accelerates into a continuous ring of blinding starlight. The deity raises its golden palms forward, focusing the cosmic power of fate into a singular, razor-sharp beam of pure white holy laser light that cuts straight through the camera lens with absolute authority. Divine light beams, pure whiteout flash, 4k.'
  },
  {
    id: 10248389,
    name: 'Cyber Blader',
    series: 'GX',
    archetype: 'Alexis Rhodes / Warrior Fusion',
    icon: '⛸️',
    visualTraits: 'graceful and deadly cybernetic ballerina-warrior, aerodynamic white and crimson bodysuit, twin circular arm-mounted razor blades, high-speed figure skates, and a silver ponytail catching the light.',
    summonAnim: 'Elegant ice-skating anime combat entrance. Cyber Blader glides onto a frozen reflective arena floor with breathtaking speed, executing an intricate series of high-speed figure-skating spins and leaps. She slides to a flawless halt on one skate, striking a dynamic warrior pose as her twin circular arm blades spin with a high-pitched metallic whistle. Graceful, athletic, beautiful anime choreography, ice crystal spray, 4k, 60fps.',
    attackName: 'Whirlwind Slash',
    attackAnim: 'Acrobatic spinning blade storm: "Whirlwind Slash". Cyber Blader accelerates across the ice into an triple-axel jump, tucking her body and spinning horizontally into a blinding silver cyclone of razor-sharp steel. She carves directly through the camera in a flash of speed lines and metallic sparks, leaving glowing crescent blade trails in the air. High-speed anime action, slicing spark effects, 4k.'
  },
  {
    id: 15894048,
    name: 'Ultimate Tyranno',
    series: 'GX',
    archetype: 'Tyranno Hassleberry / Dinosaur',
    icon: '🦖',
    visualTraits: 'colossal prehistoric apex predator Tyrannosaurus, armored olive-green and crimson hide, muscular prehistoric physique, rows of dagger-sharp teeth, amber reptilian eyes, and devastating clawed feet.',
    summonAnim: 'Primeval dinosaur terror cutscene. Ancient jungle trees snap and shatter as seismic footsteps shake the arena. Ultimate Tyranno bursts through the dense prehistoric foliage, crushing giant boulders beneath its massive clawed feet. It raises its massive head and lets out a deafening, primeval roar that causes the camera to shake violently. Prehistoric earthiness, saliva and steam, raw primal anime power, 4k, 60fps.',
    attackName: 'Apex Jurassic Crunch',
    attackAnim: 'Ferocious apex predator charge: "Apex Jurassic Crunch". Ultimate Tyranno lowers its head and charges forward at thundering sprint speed, earth flying from its footsteps. It unhinges its massive jaws, teeth gleaming with primal savagery, and clamps down directly onto the camera lens with crushing, bone-shattering force. Screen-shaking impact, dust and debris explosion, 4k.'
  },
  {
    id: 32543380,
    name: 'Volcanic Doomfire',
    series: 'GX',
    archetype: 'Axel Brodie / Pyro',
    icon: '🔥',
    visualTraits: 'hulking demonic fire colossus, jagged volcanic rock armor plates, glowing veins of liquid magma coursing across its body, twin heavy cannon barrels mounted on its shoulders, and blazing fiery demonic eyes.',
    summonAnim: 'Explosive magma caldera eruption. A volcano caldera violently detonates, sending geysers of bubbling crimson lava into the sky. Volcanic Doomfire emerges from the molten magma pool, its heavy stone limbs dripping liquid fire. Its twin shoulder cannons cycle with heavy mechanical clicks, venting black smoke and roaring flames. Cataclysmic fire anime aesthetic, heat shimmer distortion, glowing embers, 4k, 60fps.',
    attackName: 'Guenon Cannon',
    attackAnim: 'Devastating artillery magma barrage: "Guenon Cannon". Volcanic Doomfire plants its rocky feet into the ground, locking both shoulder cannons forward. The cannons glow white-hot as liquid magma is pumped into the firing chambers. It unleashes a dual continuous stream of superheated lava shells and roaring flame straight into the camera, detonating in an apocalyptic firestorm. Heavy artillery recoil, fiery smoke, 4k.'
  },
  {
    id: 35809262,
    name: 'Elemental HERO Flame Wingman',
    series: 'GX',
    archetype: 'Jaden Yuki / Warrior Fusion',
    icon: '🪽',
    visualTraits: 'iconic superhero duelist, aerodynamic green battle armor, a magnificent ruby-red feathered wing on its left side, a ferocious dragon head forming its entire right arm, and a glowing yellow hero visor.',
    summonAnim: 'Classic rooftop hero entrance cutscene. Across the moonlit skyline of a metropolis, Elemental HERO Flame Wingman leaps from a skyscraper rooftop, red wing catching the moonlight. He dives toward the camera and lands in an iconic three-point superhero crouch, sparks flying from his boots. He rises and readies his dragon arm, which opens its jaws with a puff of flame. Iconic Jaden Yuki heroic aesthetic, dynamic moonlight, 4k, 60fps.',
    attackName: 'Skydive Scorcher',
    attackAnim: 'Heroic aerial dive finisher: "Skydive Scorcher". Flame Wingman rocket-boosts high into the upper atmosphere, tucking into a vertical nose-dive. His dragon arm ignites into a roaring inferno, enveloping his entire body in a flaming dragon-shaped comet. He drives the blazing dragon fist straight down into the camera, erupting into a glorious anime hero explosion. Heroic anime impact lines, blazing fire aura, 4k.'
  },
  {
    id: 39618799,
    name: 'Cyber Angel Dakini',
    series: 'GX',
    archetype: 'Alexis Rhodes / Fairy Ritual',
    icon: '🪷',
    visualTraits: 'four-armed divine warrior goddess, adorned in elegant white, gold, and crimson ceremonial robes, wielding four glowing curved ceremonial scimitars, with a serene yet authoritative divine visage.',
    summonAnim: 'Sacred celestial lotus ritual. A radiant golden lotus flower blooms on a tranquil reflecting pool. Cyber Angel Dakini rises from the lotus petals in meditative levitation, her four arms gracefully unfurling to draw four shining scimitars. She glides forward with transcendent grace, golden holy light radiating from her aura. Sacred eastern fantasy anime aesthetic, floating flower petals, 4k, 60fps.',
    attackName: 'Blade of Retribution',
    attackAnim: 'Four-blade flurry of judgment: "Blade of Retribution". Dakini dashes forward at blinding speed, her four arms moving in a mesmerizing blur. She carves an intricate geometric mandala of glowing golden sword slashes through the air, culminating in a simultaneous quadruple-cross slash that slices straight through the screen. Holy golden slash marks, sparkling light dissipation, 4k.'
  },
  {
    id: 59464593,
    name: 'Armed Dragon LV10',
    series: 'GX',
    archetype: 'Chazz Princeton / Dragon',
    icon: '⚡',
    visualTraits: 'ultimate pinnacle armored dragon, heavy navy and white metallic carapace plates, massive bladed wings, heavy forearm energy blades, and glowing red optical sensors.',
    summonAnim: 'Ultimate evolutionary breakout cutscene. A giant metallic chrysalis cracks with blinding internal energy before shattering into flying steel fragments. Armed Dragon LV10 bursts forth, fanning out its massive blade wings with sharp metallic clangs. It roars with supreme draconic arrogance, yellow electricity arcing across its armored chest. Chazz Princeton boss energy, high-contrast mecha-dragon anime aesthetic, 4k, 60fps.',
    attackName: 'Armored White Lightning',
    attackAnim: 'Screen-clearing lightning storm: "Armored White Lightning". Armed Dragon LV10 charges its chest turbine and forearm blade blasters, generating blinding spheres of crackling white and blue lightning. It unleashes an overwhelming screen-clearing blast wave of roaring electric thunderbolts directly into the camera, obliterating the entire field in a flash of whiteout energy. Shockwave rings, electric arcs, 4k.'
  },
  {
    id: 70095154,
    name: 'Cyber Dragon',
    series: 'GX',
    archetype: 'Zane Truesdale / Machine',
    icon: '🐍',
    visualTraits: 'sleek chrome-silver mechanical serpent dragon, segmented cybernetic spine, glowing cyan optical sensors, razor-sharp metallic fangs, and glowing blue vernier thrusters along its body.',
    summonAnim: 'Futuristic cyberspace materialization. Glowing blue cyber wireframe grids trace across the arena floor. Cyber Dragon materializes section by section along its chrome spine, slithering gracefully through midair with high-speed turbine hisses before coiling into an aggressive cobra strike pose. Clean sci-fi anime aesthetic, chrome reflections, glowing blue LEDs, 4k, 60fps.',
    attackName: 'Strident Blaze',
    attackAnim: 'High-power cyber laser: "Strident Blaze". Cyber Dragon rears back its serpentine neck, its open maw charging with super-concentrated blue electrical plasma. It lashes forward and discharges a high-velocity laser beam directly down the camera lens, followed by a shockwave of electrical sparks and smoke. High-speed camera tracking, piercing blue beam, 4k.'
  },
  {
    id: 78371393,
    name: 'Yubel',
    series: 'GX',
    archetype: 'Yubel / Fiend',
    icon: '👁️',
    visualTraits: 'haunting androgynous demonic dragon spirit, heterochromatic eyes (glowing amber right, emerald green left), a leathery bat wing on the right and a draconic feathered wing on the left, flowing dark violet hair, and skeletal claws.',
    summonAnim: 'Haunting dimensional spirit entrance. Dark violet fog rolls across the floor as a melancholy music-box melody echoes. Yubel floats upward through the mist with arms spread wide, mismatched eyes glowing with possessive affection and deep sorrow. Her dual wings unfurl slowly as dark spiritual feathers and purple sparkles drift around her. Eerie, emotional gothic anime aesthetic, dramatic rim lighting, 4k, 60fps.',
    attackName: 'Sorrowful Regret',
    attackAnim: 'Reflective soul shockwave: "Sorrowful Regret". Yubel embraces herself as her chest core pulses with radiant dark purple spiritual fire. She opens her arms with a haunting cry, releasing a chaotic shockwave of distorted purple soul-energy and shadowy dragon silhouettes that blast straight through the camera lens. Gravitational reality warping, violet shockwave, 4k.'
  },
  {
    id: 79856792,
    name: 'Rainbow Dragon',
    series: 'GX',
    archetype: 'Jesse Anderson / Crystal Beast Dragon',
    icon: '🌈',
    visualTraits: 'breathtaking serpentine crystal dragon deity, pearlescent white armored scales, seven brilliant rainbow gemstone orbs along its spine, and magnificent crystalline rainbow prism wings.',
    summonAnim: 'Prismatic crystal convergence cutscene. Seven beams of light in brilliant ruby, amethyst, topaz, emerald, sapphire, cobalt, and amber shoot down from the sky, converging into an explosion of pure rainbow radiance. Rainbow Dragon emerges gracefully from the prism, coiling through the aurora borealis as rainbow starlight glitters off its crystalline scales. Breathtaking color saturation, prismatic lens flares, 4k, 60fps.',
    attackName: 'Rainbow Overdragon',
    attackAnim: 'Supersonic prism ram: "Rainbow Overdragon" (Rainbow Refraction). Rainbow Dragon accelerates across the sky at near lightspeed, its entire serpentine body enveloped in an incandescent aurora of dazzling rainbow energy. It dives directly into the camera in a blinding lance of prismatic starlight, shattering the screen into sparkling diamond shards. Blinding whiteout, rainbow particle explosion, 4k.'
  },
  {
    id: 83104731,
    name: 'Ancient Gear Golem',
    series: 'GX',
    archetype: 'Dr. Vellian Crowler / Machine',
    icon: '⚙️',
    visualTraits: 'colossal ancient clockwork colossus, constructed from weathered bronze plating and exposed whirring iron cogs, a single glowing cyclopean red eye, and immense steam-powered piston fists.',
    summonAnim: 'Heavy industrial clockwork awakening. Deafening sounds of grinding iron gears and ticking escapements echo across the arena. Ancient Gear Golem rises from beneath the cobblestones with heavy mechanical stomps, high-pressure white steam hissing from its shoulder vents. Its single red eye flashes ominously as its giant bronze fists clench with crushing force. Steampunk mechanical anime aesthetic, rusted textures, steam clouds, 4k, 60fps.',
    attackName: 'Mechanized Melee',
    attackAnim: 'Piston-driven iron haymaker: "Mechanized Melee". Ancient Gear Golem\'s shoulder gears spin at maximum RPM with loud mechanical shrieks. It pulls back its colossal bronze right fist, pistons hissing with built-up steam pressure, and drives a devastating punch straight into the camera, shattering the ground and screen in an explosion of concussive force. Heavy screen shake, flying rubble, 4k.'
  },
  {
    id: 83965310,
    name: 'Destiny HERO - Plasma',
    series: 'GX',
    archetype: 'Aster Phoenix / Warrior',
    icon: '🩸',
    visualTraits: 'dark and imposing anti-hero, sleek obsidian and crimson biomechanical battle armor, leathery demonic wings embedded with glowing red ocular pods, razor-sharp arm gauntlets, and an arrogant duelist gaze.',
    summonAnim: 'Sinister eclipse descent sequence. The sky turns a brooding blood-red as an ominous eclipse forms. Destiny HERO - Plasma descends slowly from the crimson clouds, leathery wings spread wide to reveal glowing red eye pods. He lands silently on the arena floor as misty red tendrils coil around his boots, exuding absolute aristocratic dark dominance. Dark anti-hero anime aesthetic, crimson rim lighting, 4k, 60fps.',
    attackName: 'Blood Torrent',
    attackAnim: 'Devastating crimson lance barrage: "Blood Torrent". Plasma crosses his arms as all the eye pods on his wings flare with superheated crimson energy. He thrusts his hands forward, firing dozens of piercing dark-red plasma lances directly into the camera, followed by a shockwave of boiling crimson energy that engulfs the screen. High-contrast red and black anime impact lines, 4k.'
  },
  {
    id: 85066822,
    name: 'Water Dragon',
    series: 'GX',
    archetype: 'Bastion Misawa / Sea Serpent',
    icon: '💧',
    visualTraits: 'majestic serpentine dragon composed entirely of flowing, pressurized crystal-clear water, hydrodynamic aquatic fins, glowing blue chemical formula core, and graceful serpentine curves.',
    summonAnim: 'Chemical bonding synthesis cutscene. Two floating chemical beakers containing Oxygeddon and Hydrogeddon combine with a bright cyan chemical reaction. A massive, spiraling geyser of crystal-clear ocean water erupts upward, shaping itself into the magnificent serpentine body of Water Dragon. It glides through the air as water ripples and splashes in zero gravity. Fluid water simulation, refraction caustics, clean anime science aesthetic, 4k, 60fps.',
    attackName: 'Aqua Breath',
    attackAnim: 'Hydrodynamic tidal beam: "Aqua Breath" (Tsunami Wave). Water Dragon curls its serpentine body and opens its translucent jaws, drawing ambient moisture into a pulsating sphere of ultra-pressurized water. It blasts a high-velocity hydrodynamic water cannon beam straight into the camera, washing over the viewer in an overwhelming tidal wave of foaming water and bubbles. Splashing water droplets, aquatic lens effects, 4k.'
  },
  {
    id: 89943723,
    name: 'Elemental HERO Neos',
    series: 'GX',
    archetype: 'Jaden Yuki / Warrior',
    icon: '🦸',
    visualTraits: 'heroic space warrior, sleek pearl-white and ruby-red aerodynamic bodysuit, glowing cyan crystalline chest orb, golden shoulder pauldrons, and determined heroic anime eyes.',
    summonAnim: 'Cosmic hero touchdown cutscene. A brilliant beam of rainbow cosmic starlight descends from deep outer space onto the duel field. Elemental HERO Neos touches down in a classic superhero landing, fist planted on the ground as rainbow shockwaves pulse outward. He rises with absolute confidence, striking an iconic fighting pose, chest crystal glowing with cosmic power. Heroic tokusatsu anime aesthetic, starlight particles, 4k, 60fps.',
    attackName: 'Wrath of Neos',
    attackAnim: 'Supersonic cosmic punch: "Wrath of Neos" (Cosmic Crush). Neos pulls back his right fist as swirling ribbons of cyan and golden cosmic starlight wrap around his arm. He accelerates toward the camera at supersonic speed, punching forward with an earth-shattering straight right that erupts into an expanding rainbow galaxy nova. High-energy anime impact lines, cosmic lens flares, 4k.'
  },
  {
    id: 90140980,
    name: 'Ojama King',
    series: 'GX',
    archetype: 'Chazz Princeton / Beast Fusion',
    icon: '👑',
    visualTraits: 'hilariously grotesque and triumphant crowned monarch, gigantic yellow globular belly, tiny red royal cape, white polka-dot briefs, bulging goofy cartoon eyes, and a crooked jewel-encrusted golden crown.',
    summonAnim: 'Comedic fusion coronation cutscene. Ojama Yellow, Ojama Green, and Ojama Black crash into each other comically, squishing into a chaotic rolling ball. The ball pops with a goofy party horn sound, revealing Ojama King posing pompously on a throne of garbage. He adjusts his crooked crown with an arrogant laugh, tiny cape fluttering. Comedic cartoon anime exaggeration, vibrant colors, slapstick dust clouds, 4k, 60fps.',
    attackName: 'Flying Ojama Press',
    attackAnim: 'Hilarious belly-flop disaster: "Flying Ojama Press". Ojama King leaps impossibly high into the sky with a goofy yelp. He spreads his arms and legs wide, blocking out the sun with his gargantuan yellow belly, and belly-flops directly down onto the camera lens in a screen-flattening impact with cartoon shockwave lines and stars flying everywhere. Maximum comedy slapstick, squish impact frames, 4k.'
  },

  // ===========================================================================
  // PART 3: YU-GI-OH! 5D'S — 33 MONSTERS
  // ===========================================================================
  {
    id: 2403771,
    name: 'Power Tool Dragon',
    series: '5Ds',
    archetype: 'Leo / Machine Synchro',
    icon: '⚙️',
    visualTraits: 'industrial construction mecha dragon, vibrant hazard-yellow and dark grey steel plating, hydraulic piston limbs, excavator bucket head and tail, and heavy power drill arm.',
    summonAnim: 'High-octane mechanical assembly cutscene. Heavy industrial gears spin rapidly, and hydraulic pistons hiss violently releasing white pressurized steam. Heavy yellow steel crane and shovel components slam together with loud metallic clanks and sparks. Power Tool Dragon locks into full assembly, its drill arm revving up at high speed, hazard lights flashing amber. It stomps forward onto the metal plating with heavy robotic weight, roaring with a synthesized mechanical shriek. Industrial anime aesthetic, metallic reflections, grease and steam effects, 4k, 60fps.',
    attackName: 'Crafty Break',
    attackAnim: 'High-impact industrial strike: "Crafty Break". Power Tool Dragon charges forward on hydraulic treads, its colossal steel drill arm spinning at blinding RPM with intense friction sparks and glowing red-hot metal tips. Exhaust pipes on its back blast fiery orange backfire. It thrusts the spinning drill straight into the screen in an explosive, crunching drill attack that creates radial metallic sparks and shockwaves. High-contrast mecha anime impact frames, camera shake, 4k.'
  },
  {
    id: 7391448,
    name: 'Goyo Guardian',
    series: '5Ds',
    archetype: 'Tetsu Trudge / Warrior Synchro',
    icon: '⚔️',
    visualTraits: 'heavily armored cybernetic samurai lawman, deep blue and burnished gold armor, sweeping Kabuto helmet crest, glowing visor, wielding a weighted iron jitte truncheon.',
    summonAnim: 'High-tech law enforcement anime entrance. Flashing red and blue cybernetic emergency sirens illuminate a dark metropolis alleyway. Digital blue wireframes converge to form the armored frame of Goyo Guardian. It materializes with heavy mechanical footsteps, spins its weighted jitte truncheon in a practiced martial arc, and settles into an imposing, unyielding security stance, golden helmet horns catching the blue neon glow. Cyberpunk anime aesthetic, police neon reflections, 4k, 60fps.',
    attackName: 'Goyo Bind Strike',
    attackAnim: 'Arresting strike: "Goyo Bind Strike". Goyo Guardian lunges forward with surprising agility, swinging its weighted iron jitte weapon. The weapon trails crackling blue electro-magnetic chains of pure energy. It brings the truncheon down with crushing, concussive force straight into the camera, sending electric blue shockwaves and binding energy arcs across the screen. Impact sparks, anime motion trails, 4k.'
  },
  {
    id: 8967776,
    name: 'Sephylon, the Ultimate Timelord',
    series: '5Ds',
    archetype: 'Z-one / Fairy',
    icon: '🌟',
    visualTraits: 'supreme godlike golden titan, ten multi-colored celestial spheres floating around its body, majestic multi-tiered golden wings, intricate sacred filigree armor, and omnipotent glowing eyes.',
    summonAnim: 'Supreme apocalyptic deity summon. In the deep expanse of the universe, ten colored celestial Sephirot orbs align into the sacred Tree of Life. A blinding flash of divine white-gold light illuminates galaxies. Sephylon, the Ultimate Timelord materializes, its immense multi-tiered golden wings spreading infinitely across space. The ten spheres orbit its colossal form as golden cosmic dust and divine runes swirl majestically around it. Ultimate boss aura, breathtaking scale, 4k, 60fps.',
    attackName: 'Genesis Judgement Ray',
    attackAnim: 'Universal creation finisher: "Genesis Judgement Ray". The ten celestial spheres orbiting Sephylon accelerate into a blinding ring of rainbow light. Sephylon raises its giant golden hands, channeling the total energy of creation into a radiant orb in front of its chest. It unleashes a universe-shaking beam of supreme iridescent white-and-gold energy straight into the camera, disintegrating all reality into pure starlight. Blinding whiteout, epic anime finale visual, 4k.'
  },
  {
    id: 9012916,
    name: 'Black-Winged Dragon',
    series: '5Ds',
    archetype: 'Crow Hogan / Dragon Synchro',
    icon: '🖤',
    visualTraits: 'sleek aerodynamic draconic bird, polished jet-black and crimson armored plates, twin bladed feathered wings, razor-sharp tail plumage, and a glowing ruby-red core in its chest.',
    summonAnim: 'Midnight shadow tempest cutscene. The sky turns pitch black as an ominous gale of razor-sharp black feathers sweeps across the arena. Concentric crimson Synchro rings flare to life, through which Black-Winged Dragon dives at high speed. It flares its obsidian wings, scattering glowing red sparks, and lets out a piercing draconic cry into the stormy night. Dark speed-dueling anime aesthetic, crimson energy trails, 4k, 60fps.',
    attackName: 'Shadow Squall',
    attackAnim: 'Retaliatory shadow gale: "Shadow Squall". The ruby core in Black-Winged Dragon\'s chest absorbs incoming attacks, superheating into an intense dark-red vortex. The dragon spreads its wings wide and blasts an overwhelming squall of jet-black sonic shockwaves and crimson energy needles directly into the camera lens. Screen-shaking wind pressure, dark lightning sparks, 4k.'
  },
  {
    id: 10875327,
    name: 'Earthbound Immortal Aslla piscu',
    series: '5Ds',
    archetype: 'Carly Carmine / Dark Synchro Era',
    icon: '🪶',
    visualTraits: 'colossal shadowy hummingbird deity, towering silhouette of pure black darkness, glowing neon-cyan and violet Nazca line glyphs tracing along its body, and massive aerodynamic wings.',
    summonAnim: 'Apocalyptic Nazca geoglyph ignition. The ground cracks open as the giant hummingbird Nazca line ignites with roaring violet-and-cyan hellfire. From the flaming trench, Earthbound Immortal Aslla piscu ascends into the stormy sky, a mountain-sized shadowy entity that eclipses the clouds. Its wings beat with high-frequency rumbles, kicking up a cyclone of purple spiritual fog. Cataclysmic dark fantasy anime aesthetic, 4k, 60fps.',
    attackName: 'Soul Shaver',
    attackAnim: 'Devastating aerial soul cyclone: "Soul Shaver". Aslla piscu hovers high above the arena, beating its colossal wings at blinding frequency. It discharges thousands of razor-sharp feathers made of glowing violet dark matter, raining them down like a storm of arrows straight into the camera. Screen-shivering bass vibrations, purple energy explosions, 4k.'
  },
  {
    id: 15187079,
    name: 'Earthbound Immortal Uru',
    series: '5Ds',
    archetype: 'Roman Goodwin / Dark Synchro Era',
    icon: '🕷️',
    visualTraits: 'gargantuan arachnid shadow titan, eight colossal obsidian spider legs, glowing purple and crimson Nazca lines running along its segmented abdomen, and multi-faceted glowing demonic red eyes.',
    summonAnim: 'Underworld arachnid emergence. The earth collapses into a vast crater as the spider geoglyph blazes with eerie purple fire. Earthbound Immortal Uru crawls up from the abyss on eight titanic legs, each leg slamming into the ground like a fallen pillar. It looms over the city skyline, mandibles clicking with ominous intent as purple webs of dark energy lace across the sky. Spine-chilling kaiju anime aesthetic, 4k, 60fps.',
    attackName: 'Hell Thread Web',
    attackAnim: 'Binding dark-thread trap: "Hell Thread Web". Uru shoots thick ropes of glowing purple energy webbing from its abdomen, anchoring the arena down. It opens its mandibles and unleashes a massive projectile web of crushing dark gravity directly at the camera, trapping the viewer and detonating in an explosion of purple spiritual shockwaves. Crushing screen impact, 4k.'
  },
  {
    id: 24696097,
    name: 'Shooting Star Dragon',
    series: '5Ds',
    archetype: 'Yusei Fudo / Accel Synchro',
    icon: '🌠',
    visualTraits: 'streamlined aerodynamic cosmic dragon, translucent crystalline cyan wings, pearlescent silver-white chassis, red chest orb, and swept-back aerodynamic crest.',
    summonAnim: 'Accel Synchro warp-speed breakthrough sequence. The camera hurtles through a rainbow tachyon light-tunnel as speed of light is shattered. Sonic shockwave rings explode repeatedly. Shooting Star Dragon accelerates out of the light cone, leaving shimmering holographic afterimages behind it. It gracefully decelerates, spreading its translucent crystalline wings as trails of glittering blue and white cosmic stardust ribbon behind it in zero gravity. Hyper-speed anime visuals, prism refractions, dazzling starlight flares, 4k, 60fps.',
    attackName: 'Stardust Mirage',
    attackAnim: 'Ultimate Accel Synchro finisher: "Stardust Mirage". Shooting Star Dragon splits into five distinct luminous spectral copies, each soaring through the upper stratosphere at hypersonic speed. All five dragons dive toward the viewer simultaneously, converging into a single blinding, meteor-like lance of radiant blue starlight and celestial fire that pierces directly through the camera. Screen flashes pure white with cosmic starburst lens flare, 4k.'
  },
  {
    id: 25165047,
    name: 'Life Stream Dragon',
    series: '5Ds',
    archetype: 'Leo / Signer Dragon',
    icon: '💛',
    visualTraits: 'divine golden armored mecha dragon, gleaming white and gold plating, crystalline life-energy heart core, large multi-tiered dragon wings with glowing yellow veins, and a sacred acoustic vocal horn.',
    summonAnim: 'The true 6th Signer Dragon awakening! Golden Synchro tuning rings illuminate the cosmos as the industrial armor of Power Tool Dragon shatters away in brilliant golden light. Life Stream Dragon emerges in radiant glory, its golden wings beating with revitalizing warmth as crystalline life-energy sparkles shower the battlefield. It roars with divine triumph, yellow Signer Mark of the Heart blazing brightly. Sacred mechanical majesty, golden bloom, 4k, 60fps.',
    attackName: 'Life Stream Sound',
    attackAnim: 'Revitalizing acoustic shockwave: "Life Stream Sound". Life Stream Dragon channels pure golden spiritual vitality into its acoustic vocal horn. It unleashes a massive, expanding sonic shockwave of concentric golden sound rings directly into the camera, purifying corruption and blowing away all obstacles in a radiant acoustic blast. Shimmering golden particles, soundwave distortion, 4k.'
  },
  {
    id: 25862681,
    name: 'Ancient Fairy Dragon',
    series: '5Ds',
    archetype: 'Luna / Signer Dragon',
    icon: '🧚‍♀️',
    visualTraits: 'serene pearlescent pale green and cream scales, golden ceremonial armor trim, gossamer fairy-like wings, elegant serpentine dragon physique, and gentle glowing eyes.',
    summonAnim: 'Sacred magical anime cutscene. Shafts of heavenly emerald and golden morning sunlight pour through an enchanted ancient forest canopy. Luminescent crystalline butterflies and sparkling spiritual orbs flutter gracefully. Ancient Fairy Dragon descends gently from the light, its translucent gossamer wings trailing glittering fairy dust. It glides smoothly toward the viewer, radiating benevolent warmth and divine purity. Dreamy volumetric sunbeams, magical sparkle particles, serene high-fantasy anime cinematography, 4k, 60fps.',
    attackName: 'Eternal Sunshine',
    attackAnim: 'Holy divine anime blast: "Eternal Sunshine". Ancient Fairy Dragon loops gracefully in midair, curling its serpentine body as concentric rings of brilliant golden and emerald solar glyphs materialize around it. It releases a breathtaking, expanding nova wave of pure celestial sunlight and sparkling aura that cleanses the entire battlefield and rushes right into the camera. Blinding holy bloom, radiant rays, celestial particle dissipation, 4k.'
  },
  {
    id: 30604579,
    name: 'Thor, Lord of the Aesir',
    series: '5Ds',
    archetype: 'Team Ragnarok (Dragan) / Divine Synchro',
    icon: '🔨',
    visualTraits: 'titanic Norse god of thunder, towering muscular physique, gleaming cobalt-blue plate armor, flowing wolf-pelt mantle, winged helm, and wielding the divine electrified warhammer Mjolnir.',
    summonAnim: 'God of Thunder arrival cutscene. A violent blizzard rages across snow-covered Nordic peaks as the sky is torn open by blinding blue lightning bolts. Thor, Lord of the Aesir touches down with earth-shattering impact on a mountain crag, raising the warhammer Mjolnir high. High-voltage lightning arcs crackle along the hammer\'s runic engravings as Thor lets out a booming warrior roar. Epic Norse mythology anime aesthetic, snow and lightning particles, 4k, 60fps.',
    attackName: 'Thunder Hammer',
    attackAnim: 'Cataclysmic hammer strike: "Thunder Hammer". Thor leaps into the stormy heavens, spinning Mjolnir until it becomes a blinding wheel of pure blue electricity. He dives straight down at terminal velocity, driving the electrified hammer into the camera in a cataclysmic blast that shatters mountains and erupts in an expanding dome of blue lightning. Maximum seismic shake, electric sparks, 4k.'
  },
  {
    id: 37115575,
    name: 'Malefic Truth Dragon',
    series: '5Ds',
    archetype: 'Paradox / Malefic Boss',
    icon: '🖤',
    visualTraits: 'gargantuan corrupted dragon colossus, pitch-black armored carapace fused with bone-white Malefic masks, glowing crimson-purple veins, vast spiked wings, and terrifying 5000 ATK presence.',
    summonAnim: 'Apocalyptic Malefic singularity. The sky turns into a swirling black hole of corrupted purple lightning and flying dark matter. Malefic Truth Dragon forces its colossal way through the dimensional tear, its bone-mask faceplate gleaming with sinister malevolence. It spreads its immense shadow wings, blotting out all ambient light as dark gravitational shockwaves ripple across the screen. Terrifying apocalyptic anime aesthetic, 4k, 60fps.',
    attackName: 'Truth Judgment',
    attackAnim: 'Dimensional antimatter annihilation: "Truth Judgment". Malefic Truth Dragon unhinges its colossal jaws, gathering black-and-purple antimatter energy into a dense gravitational orb. It unleashes an overwhelming, screen-filling torrent of destructive dark energy straight into the camera, annihilating space and time in an inescapable cataclysm. Heavy screen-shivering distortion, purple flash, 4k.'
  },
  {
    id: 39823987,
    name: 'Sun Dragon Inti',
    series: '5Ds',
    archetype: 'Rex Goodwin / Incan Synchro',
    icon: '☀️',
    visualTraits: 'colossal Incan solar serpent dragon, body formed of a continuous ring of incandescent golden solar fire, radiant sun-disc head with sweeping gold rays, and glowing solar flare aura.',
    summonAnim: 'Solar flare manifestation cutscene. A total solar eclipse ends as a blinding burst of golden solar prominence erupts across space. Sun Dragon Inti emerges from the sun\'s corona, coiling majestically like a celestial solar ouroboros. Its golden sun-disc face radiates blinding amber sunlight, warming the entire cosmos with ancient Incan divine authority. Blinding golden bloom, solar particle ribbons, 4k, 60fps.',
    attackName: 'Solar Flare',
    attackAnim: 'Superheated solar incineration: "Solar Flare". Sun Dragon Inti accelerates its spinning solar ring body, drawing in all surrounding solar wind until its central core turns blinding white-hot. It releases an immense, concentrated wave of incandescent solar plasma directly into the camera, incinerating everything in a tidal wave of golden fire. Heat haze distortion, blinding amber whiteout, 4k.'
  },
  {
    id: 41181774,
    name: 'Earthbound Immortal Wiraqocha Rasca',
    series: '5Ds',
    archetype: 'Rex Goodwin / Dark Synchro Era',
    icon: '🦅',
    visualTraits: 'ultimate Earthbound Immortal Condor, immense shadowy silhouette that dwarfs mountain ranges, glowing violet and crimson Nazca geoglyph markings, and a hollow skeletal condor skull head.',
    summonAnim: 'Final cataclysmic dark god resurrection. The earth rips wide open as the enormous condor geoglyph blazes with towering purple hellfire. Earthbound Immortal Wiraqocha Rasca rises into the upper atmosphere, its gargantuan shadow wings blotting out the entire horizon. Wind howls at hurricane speed as violet spiritual lightning arcs through its hollow skull. Ultimate dark god presence, apocalyptic scale, 4k, 60fps.',
    attackName: 'Death Singularity',
    attackAnim: 'Soul-extinguishing dark vortex: "Death Singularity". Wiraqocha Rasca opens its hollow condor beak, creating a black gravitational vortex that vacuums in ambient souls and energy. It expels the collected energy as an expanding spherical pulse of dark violet annihilation that sweeps over the camera, leaving only desolation in its wake. Screen-tearing gravitational distortion, purple shockwave, 4k.'
  },
  {
    id: 45037489,
    name: 'Chevalier de Fleur',
    series: '5Ds',
    archetype: 'Sherry LeBlanc / Warrior Synchro',
    icon: '🌸',
    visualTraits: 'noble chivalric knight, polished silver filigree plate armor, ornate gold fleur-de-lis embellishments, flowing pure white cape, winged helm, and a slender fencing rapier.',
    summonAnim: 'Aristocratic chivalric anime entrance. In the grand courtyard of a sunlit French baroque palace, delicate white and golden flower petals swirl in a gentle breeze. Chevalier de Fleur materializes gracefully, pure white cape fluttering behind. The knight draws an ornate fencing rapier in a sweeping salute, the polished silver blade catching a brilliant glint of sunlight with a crystalline chime sound. Elegant, regal, high-fashion anime fantasy aesthetic, 4k, 60fps.',
    attackName: 'Fleur Fleche',
    attackAnim: 'Lightning-fast fencing thrust: "Fleur Fleche". Chevalier de Fleur drops into a master fencer\'s stance and lunges forward across the screen with breathtaking speed and grace. The tip of the rapier gathers a concentrated point of piercing white-and-gold starlight, piercing straight into the camera and releasing a brilliant burst of shimmering floral light and shockwave rings. Crisp anime impact, shimmering petal dissipation, 4k.'
  },
  {
    id: 46263076,
    name: 'Earthbound Immortal Ccapac Apu',
    series: '5Ds',
    archetype: 'Kalin Kessler / Dark Synchro Era',
    icon: '🗿',
    visualTraits: 'colossal shadowy humanoid giant, mountain-sized physique of pitch-black darkness, glowing neon-cyan and purple Nazca giant lines, and a grinning terrifying stone-like face.',
    summonAnim: 'Cataclysmic giant awakening. The giant Nazca geoglyph ignites with roaring purple and cyan fire across a desolate wasteland. Two colossal shadowy hands burst through the earth, gripping the terrain as Earthbound Immortal Ccapac Apu pulls his towering body out of the ground. He stands upright, head disappearing into the storm clouds, grinning down with apocalyptic hunger. Seismic kaiju anime aesthetic, 4k, 60fps.',
    attackName: 'Titan Cleave',
    attackAnim: 'Crushing mountain-strike: "Titan Cleave". Ccapac Apu pulls back a fist the size of an entire city block, cloaking his arm in raging purple spiritual fire. He swings his titanic fist downward with unstoppable inertia directly into the camera, shattering the ground into deep canyons and creating an immense expanding dust and fire shockwave. Maximum screen shake, debris flying, 4k.'
  },
  {
    id: 51447164,
    name: 'T.G. Blade Blaster',
    series: '5Ds',
    archetype: 'Antinomy (Vizor) / Tech Genus',
    icon: '🤖',
    visualTraits: 'sleek futuristic mecha warrior, crimson, white, and midnight-blue aerodynamic armor plates, glowing neon cyan lines, booster thrusters, and twin high-frequency laser beam blades.',
    summonAnim: 'Sci-fi Delta Accel launch sequence. Digital telemetry HUD displays flash at hyperspeed. In a high-tech orbital corridor, T.G. Blade Blaster ignites its rear vernier thrusters with bright blue plasma exhaust. It rocket-boosts forward, executing a flawless midair spin before landing with precision. It ignites both twin laser sabers from its forearms, the glowing blades humming with crackling plasma. High-end mecha anime rendering, lens reflections, clean sci-fi aesthetic, 4k, 60fps.',
    attackName: 'Blade Rush Overdrive',
    attackAnim: 'Blinding triple-slash mecha combo: "Blade Rush Overdrive". T.G. Blade Blaster activates maximum thruster overdrive, vanishing in a blur of cyan light. It executes three lightning-fast cross slashes with its dual beam sabers across the screen, carving glowing red-and-cyan plasma incisions into space, followed by a point-blank blast from its chest blasters directly into the camera. Mecha slash impact lines, intense anime speed lines, 4k.'
  },
  {
    id: 52687916,
    name: 'Trishula, Dragon of the Ice Barrier',
    series: '5Ds',
    archetype: 'Ice Barrier / Dragon Synchro',
    icon: '❄️',
    visualTraits: 'legendary three-headed glacial dragon deity, crystalline cyan and frost-white scales, razor-sharp icicle horns, frost-covered draconic wings, and piercing frozen blue eyes emitting freezing vapor.',
    summonAnim: 'Absolute zero glacial unsealing. An ancient subterranean ice glacier shatters with a deafening crystalline chime. Three dragon heads burst through the swirling blizzard, ice crystals and frost mist scattering across the arena. Trishula unfurls its immense crystalline wings, roaring in chilling three-part harmony as absolute-zero frost freezes the ground in expanding radial spikes. Majestic winter anime aesthetic, volumetric blizzard, 4k, 60fps.',
    attackName: 'Absolute Glacial Banishment',
    attackAnim: 'Triple absolute-zero frost breath: "Absolute Glacial Banishment". All three dragon heads inhale freezing polar winds, charging concentrated spheres of diamond-dust frost in their maws. They unleash an overwhelming, triple-stream blizzard beam directly into the camera, instantly flash-freezing the screen in solid ice before shattering it into a million sparkling crystalline fragments. Frost lens freeze, glass shatter impact, 4k.'
  },
  {
    id: 60800381,
    name: 'Junk Warrior',
    series: '5Ds',
    archetype: 'Yusei Fudo / Synchro Warrior',
    icon: '🥊',
    visualTraits: 'purple, silver, and orange armored humanoid warrior, twin jet booster turbines on back, spiked gauntlets, and determined robotic faceplate with green visor.',
    summonAnim: 'Iconic hero landing anime cutscene. A neon green Synchro tuning portal opens above a speedway at sunset. Junk Warrior rocket-dives through the portal, back turbines blazing with intense cyan exhaust flames. It touches down onto the asphalt in an explosive superhero slide, tires and metal boots throwing sparks. It rises into a classic fighting stance, clenching its heavy right fist while the back turbines flare up with power. Classic Yusei theme energy, vibrant anime lighting, heat distortion, 4k, 60fps.',
    attackName: 'Scrap Fist',
    attackAnim: 'Maximum-overdrive punch: "Scrap Fist". Junk Warrior leans forward as both twin rocket boosters on its back ignite with roaring supersonic blue flames. It blasts across the screen at near lightspeed, pulling back its glowing spiked gauntlet. As it gets within inches of the camera, it unleashes a catastrophic right cross surrounded by spiraling blue plasma shockwaves, shattering the screen glass with anime impact frames. Dynamic camera zoom, particle rush, 4k.'
  },
  {
    id: 63468625,
    name: 'Meklord Astro Mekanikle',
    series: '5Ds',
    archetype: 'Aporia / Machine',
    icon: '🤖',
    visualTraits: 'supreme combination anti-Synchro titan, white, dark-grey, and gold angular armor plating, glowing triangular absorption reactor core in chest, heavy spiked shoulder cannons, and glowing red optic visor.',
    summonAnim: 'Five-piece mechanical combination sequence. Five separate Meklord machine units plummet from the sky, locking together with deafening hydraulic impacts and magnetic clamps. Meklord Astro Mekanikle stands fully assembled as its central chest reactor pulses with blinding crimson anti-Synchro energy. It steps forward with terrifying robotic weight, eyes flashing scarlet. Grim dystopian mecha anime aesthetic, 4k, 60fps.',
    attackName: 'Astro Extinction Beam',
    attackAnim: 'Anti-Synchro chest laser: "Astro Extinction Beam". Mekanikle\'s chest reactor rotates, opening three internal focusing lenses that charge with blistering crimson energy. It unleashes a massive, continuous particle beam directly down the camera barrel, disintegrating matter and ripping through digital energy shields in an expanding shockwave. Violent camera vibration, crimson laser flash, 4k.'
  },
  {
    id: 66818682,
    name: 'Moon Dragon Quilla',
    series: '5Ds',
    archetype: 'Rex Goodwin / Incan Synchro',
    icon: '🌙',
    visualTraits: 'mystical Incan lunar serpent dragon, sleek pale silver and azure crystalline scales, crescent moon horn motifs, glowing cyan eyes, and a continuous flowing serpentine ring body.',
    summonAnim: 'Lunar emergence cutscene. A dark starry night sky is illuminated by a majestic crescent moon. Pale blue spectral mist rises from an ancient Incan reflecting pool, from which Moon Dragon Quilla glides silently upward. Its silver crystalline scales glisten under the moonlight as cool cyan spiritual energy ripples along its serpentine curves. Serene mystical anime aesthetic, moonlight bloom, 4k, 60fps.',
    attackName: 'Lunar Eclipse',
    attackAnim: 'Freezing lunar blast: "Lunar Eclipse". Quilla coils into a tight celestial loop, focusing ambient lunar radiance into its mouth. It fires a freezing, high-velocity beam of pale-blue moonlight plasma directly into the camera, enveloping the screen in freezing frost crystals and shimmering lunar stardust. Cryogenic mist, shimmering blue light, 4k.'
  },
  {
    id: 67098114,
    name: 'Loki, Lord of the Aesir',
    series: '5Ds',
    archetype: 'Team Ragnarok (Brodor) / Divine Synchro',
    icon: '🎭',
    visualTraits: 'sinister and cunning Norse trickster god, adorned in emerald-green and obsidian ceremonial robes, jester-like horned golden crown, sly smirk, and wielding a glowing emerald staff of deception.',
    summonAnim: 'Mystic illusion god summon. Dancing emerald fires flicker across a dark ancient hall as laughter echoes from every direction. The shadows twist and converge as Loki, Lord of the Aesir emerges from an emerald mist rift. He twirls his runic staff with a cunning flourish, eyes flashing with supernatural trickery as spectral illusions of himself dance around him. Eerie Norse sorcery aesthetic, green flame particles, 4k, 60fps.',
    attackName: 'Vanir Trick',
    attackAnim: 'Deceptive mirror barrage: "Vanir Trick". Loki raises his staff, duplicating into three mirror copies that surround the screen. All three copies thrust their staves forward simultaneously, unleashing a barrage of spiraling emerald energy snakes and illusory daggers straight into the camera lens. Shimmering green glass shatter, deceptive light pulses, 4k.'
  },
  {
    id: 69031175,
    name: 'Blackwing Armor Master',
    series: '5Ds',
    archetype: 'Crow Hogan / Winged Beast Synchro',
    icon: '🦅',
    visualTraits: 'sleek anthropomorphic avian warrior, impenetrable black-and-silver plated armor, twin bladed metal wings, glowing red visor slit, and black feathered mantle.',
    summonAnim: 'Swift, stealthy ninja-anime entrance. A sudden dark whirlwind sweeps across a stormy midnight sky, scattering razor-sharp jet-black feathers. Blackwing Armor Master drops from above like a hawk, landing in an agile, low three-point crouch. As it slowly stands up, the twin steel blade wings fan out and gleam under the moonlight, visor flashing sharp crimson. Wind howls, feathers swirl in slow motion, dark gritty anime shading, dramatic edge lighting, 4k, 60fps.',
    attackName: 'Black Hurricane',
    attackAnim: 'Blinding supersonic aerial assault: "Black Hurricane". Blackwing Armor Master dashes forward at mach speed, leaving three shadowy afterimage clones behind. It leaps high into the air, spins horizontally, and unleashes twin crescent-shaped sonic blade waves from its steel wings, cutting through the screen with jet-black wind pressure and razor feathers. High-speed anime action lines, dynamic camera tracking, slicing spark effects, 4k.'
  },
  {
    id: 69931927,
    name: 'Earthbound Immortal Chacu Challhua',
    series: '5Ds',
    archetype: 'Greiger / Dark Synchro Era',
    icon: '🐋',
    visualTraits: 'monumental shadowy killer whale deity, colossal aquatic silhouette swimming weightlessly through air, glowing cyan and violet Nazca whale markings along its dorsal and flanks.',
    summonAnim: 'Underworld oceanic breach cutscene. The arena ground transforms into a dark ocean of bubbling purple spiritual water. The massive killer whale Nazca geoglyph ignites below the surface. With an oceanic roar, Chacu Challhua breaches majestically into the sky, dwarfing buildings before swimming gracefully through the stormy clouds. Dark leviathan kaiju anime aesthetic, purple water spray, 4k, 60fps.',
    attackName: 'Dark Tsunami',
    attackAnim: 'Tidal wave of desolation: "Dark Tsunami". Chacu Challhua dives from the upper atmosphere back down into the dark spiritual ocean, creating a colossal tidal wave of churning violet hellfire that surges forward, washing over the camera and engulfing the entire battlefield in an inescapable dark deluge. Massive screen wash, water-flame particle collision, 4k.'
  },
  {
    id: 70780151,
    name: 'Thought Ruler Archfiend',
    series: '5Ds',
    archetype: 'Sayer / Psychic Synchro',
    icon: '🧠',
    visualTraits: 'towering psychic demonic emperor, biomechanical deep indigo and bronze armor plates, exposed glowing brain matter beneath a translucent cranial dome, psychic horns, and glowing violet eyes.',
    summonAnim: 'Dark psychic dimensional rupture cutscene. The space in front of the camera distorts with purple gravitational warping and psychic static interference. A dimensional rift tears open, revealing Thought Ruler Archfiend hovering ominously. Its exposed brain glows with pulsing violet telepathic synapses. It slowly descends to the ground, crossing its armored arms, exuding overwhelming mental dominance and sinister calm. Gravitational distortion waves, violet telepathic lightning, eerie high-concept sci-fi anime aesthetic, 4k, 60fps.',
    attackName: 'Telekinetic Pulse Shock',
    attackAnim: 'Mind-shattering psychic blast: "Telekinetic Pulse Shock". Thought Ruler Archfiend thrusts both open clawed hands toward the camera. Its eyes and cranial dome flash violently with blinding violet telekinetic energy. Concentric circular shockwaves of compressed gravitational energy ripple forward at high frequency, distorting reality and blasting straight into the viewer. Reality-bending visual distortion, purple chromatic aberration, heavy bass shockwave, 4k.'
  },
  {
    id: 72896720,
    name: 'Infernity Doom Dragon',
    series: '5Ds',
    archetype: 'Kalin Kessler / Dragon Synchro',
    icon: '💀',
    visualTraits: 'skeletal undead draconic beast, charcoal and bone-white armor plating, revolver cylinder gun mechanisms built into its chest and ribs, jagged bone wings, and glowing purple demonic eyes.',
    summonAnim: 'Desolate western underworld summon sequence. A dusty ghost town canyon is consumed by eerie purple hellfire. A bottomless crater opens, and Infernity Doom Dragon crawls upward from the abyss. The gun cylinder in its skeletal chest rotates with a crisp metallic clicking sound like a cocking revolver. It stretches its jagged wings and emits a bone-chilling screech into the dark purple night sky. Gritty dark anime aesthetic, purple flames, eerie shadows, 4k, 60fps.',
    attackName: 'Infernal Fire Blast',
    attackAnim: 'Zero-hand hellfire execution: "Infernal Fire Blast". The revolver cylinders in Infernity Doom Dragon\'s chest spin at high velocity, charging glowing dark violet hellfire into each chamber. The dragon lunges forward, unhinges its skeletal jaws, and fires a devastating, concentrated torrent of dark purple brimstone flames and ghostly skulls straight down the camera barrel. Blinding purple flash, smoke and ashes, 4k.'
  },
  {
    id: 73580471,
    name: 'Black Rose Dragon',
    series: '5Ds',
    archetype: 'Akiza Izinski / Signer Dragon',
    icon: '🌹',
    visualTraits: 'dragon formed of velvet ruby-red rose petals, sleek black thorny stem-like body, sharp glowing golden eyes, and whip-like thorny vine tails.',
    summonAnim: 'Ethereal and dangerous anime summon sequence. A whirlwind of razor-sharp scarlet and dark pink rose petals gathers in the center of the screen, entwined with whipping black brambles and thorns. From the blooming vortex of blossoms, Black Rose Dragon unfurls its magnificent rose-petal wings with aristocratic grace. It arches its neck, eyes flashing radiant gold, while thousands of fragrant glowing rose petals cascade around it in a slow-motion spiral. Soft bloom lighting, velvety textures, elegant gothic anime aesthetic, 4k, 60fps.',
    attackName: 'Black Rose Flare',
    attackAnim: 'Ferocious anime attack sequence: "Black Rose Flare". Black Rose Dragon lashes its thorny tail vines forward as its petal wings ignite with blazing ruby-red spiritual flames. It spreads its wings wide and blasts an overwhelming vortex of incandescent flaming rose petals and burning floral shockwaves straight into the camera. Heat distortion, burning embers flying everywhere, intense scarlet illumination, high-speed camera track, anime impact lines, 4k.'
  },
  {
    id: 74530899,
    name: 'Metaion, the Timelord',
    series: '5Ds',
    archetype: 'Z-one / Fairy',
    icon: '⌛',
    visualTraits: 'colossal celestial entity, stylized stoic mechanical mask face, gleaming red and gold sacred armor plating, radiant burning halo wings, glowing Sephirot sphere in chest.',
    summonAnim: 'Transcendent celestial entity summon. Cosmic space warps as the sacred glyphs of the Tree of Life glow with brilliant holy light. Metaion, the Timelord manifests, an immense and silent divine deity floating weightlessly in the cosmos. Its burning fiery halo wings spread wide, bathing the universe in ancient sacred radiance, while its impassive, godlike mask stares emotionlessly forward. Divine choral aura, cosmic grandeur, biblical sci-fi anime aesthetic, 4k, 60fps.',
    attackName: 'Divine Reversal Flare',
    attackAnim: 'Omnipotent time-reversal wave: "Divine Reversal Flare". Metaion, the Timelord raises its right hand slowly. The sphere on its chest spins, projecting an enormous revolving circular wheel of fiery solar glyphs and golden flames. The wheel detonates, releasing an omnidirectional wave of blinding golden fire that rushes over the camera, incinerating and reversing everything in its path. Overwhelming golden illumination, shockwave distortion, 4k.'
  },
  {
    id: 74860293,
    name: 'Junk Destroyer',
    series: '5Ds',
    archetype: 'Yusei Fudo / Synchro Warrior',
    icon: '🔨',
    visualTraits: 'colossal heavyweight dreadnought robot warrior, orange, white, and iron-grey heavy armor plating, twin smoke exhaust chimneys on shoulders, massive demolition fists.',
    summonAnim: 'Colossal heavyweight anime summon. The screen rumbles with seismic bass vibrations. Massive iron wrecking plates and engine blocks crash down from the sky, locking together with deafening hydraulic impacts. Junk Destroyer drops down with immense weight, cracking the ground into boulders and craters. Thick black exhaust smoke and white steam blast from its twin shoulder chimneys as its glowing yellow optic sensor sweeps across the field. Tremor camera shake, heavy mechanical physics, 4k, 60fps.',
    attackName: 'Tidal Iron Crush',
    attackAnim: 'Devastating demolition barrage: "Tidal Iron Crush". Junk Destroyer\'s shoulder exhausts roar with orange fire as it charges both titanic steel fists with glowing kinetic energy. It stomps forward and slams both massive fists together right into the camera, releasing a cataclysmic concussive blast wave that disintegrates rocks, buildings, and ground in an expanding spherical shockwave. Maximum screen shake, debris flying, anime explosion physics, 4k.'
  },
  {
    id: 79798060,
    name: 'Earthbound Immortal Ccarayhua',
    series: '5Ds',
    archetype: 'Misty Tredwell / Dark Synchro Era',
    icon: '🦎',
    visualTraits: 'gargantuan reptilian shadow behemoth, sleek scaly obsidian skin with burning neon-violet lizard Nazca lines, razor-sharp spiny back ridge, long whipping tail, and venomous glowing fangs.',
    summonAnim: 'Poisonous geoglyph eruption. The lizard Nazca line cracks open in an eerie hiss of toxic purple vapor and violet hellfire. Earthbound Immortal Ccarayhua crawls out of the trench, its immense reptilian body slithering forward with predatory menace. It rears its head, flicking a split tongue of purple fire as poisonous miasma billows across the battlefield. Toxic gothic anime aesthetic, creeping shadows, 4k, 60fps.',
    attackName: 'Cataclysmic Tail',
    attackAnim: 'Tail-sweep of destruction: "Cataclysmic Tail". Ccarayhua coils its massive body and whips its spiked tail in an enormous horizontal arc. The tail carries a tidal wave of poisonous purple flames and concussive kinetic force that obliterates terrain and smashes straight into the camera lens with bone-crushing impact. Screen shake, venomous mist explosion, 4k.'
  },
  {
    id: 84815190,
    name: 'Baronne de Fleur',
    series: '5Ds',
    archetype: 'Sherry LeBlanc / Warrior Synchro',
    icon: '🐎',
    visualTraits: 'majestic aristocratic duchess knight, royal midnight-blue and gold ornate armor, sweeping feathered plume helmet, riding a spectral armored war steed, wielding an ornate royal lance.',
    summonAnim: 'Grand royal knight summon cutscene. A mystical moonlit sky erupts with a vortex of swirling sapphire and gold flower petals. Baronne de Fleur charges forward atop her ethereal armored steed, hooves striking sparks of magic upon the air. The steed rears up heroically as Baronne raises her grand decorated lance, cape billowing dramatically under the moonlight, exuding absolute nobility and battlefield supremacy. Cinematic camera pan, royal fantasy anime aesthetic, 4k, 60fps.',
    attackName: 'Noble Lance Burst',
    attackAnim: 'Devastating cavalry charge: "Noble Lance Burst". Baronne de Fleur charges forward at full gallop directly toward the camera, her steed leaving glowing trails of golden light in its wake. She levels her massive lance, the tip erupting with super-compressed royal blue and golden vortex energy. She thrusts the lance forward, detonating an explosive shockwave of floral energy that shatters the screen. Dynamic camera track, explosive royal burst, 4k.'
  },
  {
    id: 93483212,
    name: 'Odin, Father of the Aesir',
    series: '5Ds',
    archetype: 'Team Ragnarok (Halldor) / Divine Synchro',
    icon: '⚡',
    visualTraits: 'gargantuan Norse god monarch, ornate golden and bronze armor with runic engravings, flowing white beard and hair, winged helmet, spectral ravens encircling him, holding the divine spear Gungnir.',
    summonAnim: 'God of the North summon sequence. Shimmering emerald and violet aurora borealis lights drape across a frigid snow-capped Nordic mountain range. Thunder cracks violently as a blinding bolt of golden lightning strikes the highest glacier peak. Odin, Father of the Aesir manifests from the strike, a towering divine monarch holding the spear Gungnir. Two spectral ravens dive past the camera as Odin\'s single glowing eye flashes with omniscient divine power. Mythological anime majesty, icy wind and snow, golden lightning arcs, 4k, 60fps.',
    attackName: 'Gungnir Heavenly Thunder',
    attackAnim: 'Divine thunder javelin: "Gungnir Heavenly Thunder". Odin raises the divine spear Gungnir high into the stormy heavens. The stormy sky detonates with crackling golden and violet lightning bolts, concentrating the fury of the storm into the tip of the spear. Odin hurls Gungnir forward with cataclysmic godly force straight into the camera, splitting mountains and leaving an ionized trail of holy lightning that shatters the screen. Godlike thunder impact, violent camera shake, 4k.'
  },
  {
    id: 97489701,
    name: 'Red Nova Dragon',
    series: '5Ds',
    archetype: 'Jack Atlas / Double Tuning',
    icon: '💥',
    visualTraits: 'titanic four-winged volcanic dragon god, jagged obsidian and fiery crimson armor, incandescent glowing magma horns, blazing heart core, and colossal wings radiating solar fire.',
    summonAnim: 'Apocalyptic Double Tuning summon sequence. Two fiery spirits of burning crimson flame spiral together in a double-helix pillar of roaring fire. The pillar detonates into a colossal supernova explosion. Out of the heart of the solar flare emerges Red Nova Dragon, roaring with primeval fury. Its four titanic wings ignite with raging solar prominences, and waves of superheated plasma radiate across space. Intense crimson heat, boiling lava sparks, godlike demonic presence, 4k, 60fps.',
    attackName: 'Burning Soul',
    attackAnim: 'Supernova cataclysm: "Burning Soul" (Blazing Gale). Red Nova Dragon folds its four flaming wings around itself, drawing in all surrounding fire and heat into an ultra-dense sphere of black and scarlet plasma. It opens its wings with a furious roar, discharging the entire burning star straight into the camera in a devastating apocalyptic firestorm. Screen vibrates violently, incandescent white-hot flash, burning magma debris, 4k.'
  },
  {
    id: 97836203,
    name: 'T.G. Halberd Cannon',
    series: '5Ds',
    archetype: 'Antinomy (Vizor) / Tech Genus',
    icon: '🚀',
    visualTraits: 'massive colossal orbital mecha titan, heavy scarlet, white, and charcoal armor, towering shoulder pauldrons, dual fusion reactors, and an enormous anti-matter halberd cannon.',
    summonAnim: 'Epic orbital weapon deployment cutscene. In the upper atmosphere above Earth, a giant space-station docking clamp unlocks with explosive decompression bolts. T.G. Halberd Cannon descends through the clouds, its dual fusion reactors glowing at maximum output. It deploys its immense halberd cannon, locking the weapon into firing position with heavy mechanical clanks as hexagonal energy shields pulse around its chassis. Volumetric space lighting, planetary curvature background, 4k, 60fps.',
    attackName: 'All-Clear Halberd Impact',
    attackAnim: 'Orbital cannon super-weapon: "All-Clear Halberd Impact". T.G. Halberd Cannon spins the gigantic halberd in a circle, drawing tachyon energy into the muzzle. Energy arcs crackle along the barrel as the weapon locks onto the screen. It fires an overwhelming, planet-busting beam of blinding red-and-white particle energy straight down the camera lens, filling the screen with pure destruction and shockwaves. Massive screen vibration, particle overload, 4k.'
  }
];

// Verify count
if (monsters.length !== 71) {
  console.error(`Error: Expected 71 monsters, got ${monsters.length}`);
  process.exit(1);
}

// Group by series
const bySeries = {
  DM: monsters.filter(m => m.series === 'DM'),
  GX: monsters.filter(m => m.series === 'GX'),
  '5Ds': monsters.filter(m => m.series === '5Ds'),
};

let md = `# Yu-Gi-Oh! Top Monsters — Summon & Attack Cutscene Generation Prompts

This document provides **copy/paste ready prompts** for generating high-definition animated cutscenes (Summon and Attack) for all **71 iconic Yu-Gi-Oh! monsters** registered in \`data/card-videos.json\` that do not yet have video cutscene files.

Monsters with existing completed videos on disk (\`Slifer the Sky Dragon\`, \`Stardust Dragon\`, \`Dark Magician\`, \`Red Dragon Archfiend\`, \`Buster Blader\`, \`Blue-Eyes White Dragon\`, and \`Elemental HERO Egyxos\`) are excluded.

Each prompt is explicitly crafted for modern AI video generation tools (**Runway Gen-3 Alpha**, **Luma Dream Machine**, **Kling AI**, **OpenAI Sora**, **Pika**, or **Midjourney + Animate**) where you attach the monster's official high-resolution card artwork as an image reference.

---

## 📋 Quick Setup & Directory Placement

- **Reference Art Location**: All monster reference card art images are located in the repository at:
  \`resources/cards/art/<id>.jpg\` (and full cards at \`resources/cards/full/<id>.jpg\`).
  *Always attach this image file into the AI prompt generator as the image reference.*
- **In-Game Video Destination**: Place completed \`.mp4\` video files into:
  - **Summon Video**: \`resources/videos/cards/summon_<id>.mp4\`
  - **Attack Video**: \`resources/videos/cards/attack_<id>.mp4\`
  *(For Exodia, victory animation: \`resources/videos/cards/victory_33396948.mp4\`)*
- **Recommended Video Specs**:
  - **Resolution**: 1920x1080 (16:9 widescreen) or 1280x720
  - **Framerate**: 30fps or 60fps
  - **Length**: 3.5 to 5.0 seconds (short, punchy, high-impact anime cutscene)
  - **Format**: MP4 (H.264 video codec, AAC audio)
- **Automatic In-Game Playback**: Once you drop the \`.mp4\` file into \`resources/videos/cards/\` and set \`"isPlaceholder": false\` in \`data/card-videos.json\`, the game engine automatically plays the cutscene during duels!

---

## 📑 Table of Contents

- [Part 1: Original Series (DM) — 21 Monsters](#part-1-original-series-dm--21-monsters)
${bySeries.DM.map((m, i) => `  ${i + 1}. [${m.name} (\`${m.id}\`)](#${m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')})`).join('\n')}
- [Part 2: Yu-Gi-Oh! GX — 17 Monsters](#part-2-yu-gi-oh-gx--17-monsters)
${bySeries.GX.map((m, i) => `  ${i + 1}. [${m.name} (\`${m.id}\`)](#${m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')})`).join('\n')}
- [Part 3: Yu-Gi-Oh! 5D's — 33 Monsters](#part-3-yu-gi-oh-5ds--33-monsters)
${bySeries['5Ds'].map((m, i) => `  ${i + 1}. [${m.name} (\`${m.id}\`)](#${m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')})`).join('\n')}

---
`;

function renderMonster(m: MonsterPromptSpec, index: number): string {
  if (m.isVideoType === 'victory') {
    return `
## ${m.icon} ${index}. ${m.name}

- **Card ID**: \`${m.id}\`
- **Series / Era**: ${m.series === 'DM' ? 'Original Series (DM)' : m.series === 'GX' ? 'Yu-Gi-Oh! GX' : "Yu-Gi-Oh! 5D's"}
- **Archetype / Duelist**: ${m.archetype}
- **Reference Image to Attach**: \`resources/cards/art/${m.id}.jpg\`
- **Victory Video Destination**: \`resources/videos/cards/victory_${m.id}.mp4\`
*(Note: Exodia does not have a monster summon or attack cutscene. In Yu-Gi-Oh!, Exodia is never summoned to the field; this cutscene triggers exclusively upon assembling all 5 Forbidden One pieces in hand to trigger Instant Victory).*

### Instant Victory Cutscene Prompt (Unsealing & Exodo Flame)
\`\`\`text
I have attached the character reference image for ${m.name}. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: ${m.visualTraits}

Animation: Supreme Instant Victory anime cutscene. The screen darkens as five ancient golden seal pentagrams (representing the head, left arm, right arm, left leg, right leg) illuminate sequentially in a circle and shatter with thunderous explosive chimes. Exodia the Forbidden One materializes in godlike grandeur, an incomprehensibly vast golden titan towering above the clouds, shattered iron chains swaying with colossal inertia. Exodia brings both titanic hands together, condensing a blinding sphere of white-hot golden cosmic plasma between his palms. With a universe-shaking shout, he unleashes the catastrophic "Exodo Flame" beam directly through the camera, obliterating the screen in an all-consuming wave of blinding holy golden light. Ultimate anime match-winner cinematic, pure whiteout flash, screen-shattering impact, 4k resolution, 60fps.
\`\`\`

---
`;
  }

  return `
## ${m.icon} ${index}. ${m.name}

- **Card ID**: \`${m.id}\`
- **Series / Era**: ${m.series === 'DM' ? 'Original Series (DM)' : m.series === 'GX' ? 'Yu-Gi-Oh! GX' : "Yu-Gi-Oh! 5D's"}
- **Archetype / Duelist**: ${m.archetype}
- **Reference Image to Attach**: \`resources/cards/art/${m.id}.jpg\`
- **Summon Video Destination**: \`resources/videos/cards/summon_${m.id}.mp4\`
- **Attack Video Destination**: \`resources/videos/cards/attack_${m.id}.mp4\`

### Summon Cutscene Prompt
\`\`\`text
I have attached the character reference image for ${m.name}. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: ${m.visualTraits}

Animation: ${m.summonAnim}
\`\`\`

### Attack Cutscene Prompt (${m.attackName})
\`\`\`text
I have attached the character reference image for ${m.name}. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: ${m.visualTraits}

Animation: ${m.attackAnim}
\`\`\`

---
`;
}

md += `\n# Part 1: Original Series (DM) — 21 Monsters\n`;
bySeries.DM.forEach((m, i) => {
  md += renderMonster(m, i + 1);
});

md += `\n# Part 2: Yu-Gi-Oh! GX — 17 Monsters\n`;
bySeries.GX.forEach((m, i) => {
  md += renderMonster(m, i + 1);
});

md += `\n# Part 3: Yu-Gi-Oh! 5D's — 33 Monsters\n`;
bySeries['5Ds'].forEach((m, i) => {
  md += renderMonster(m, i + 1);
});

if (process.argv[1]?.includes('build-cutscene-prompts-doc')) {
  const outputPath = path.join(process.cwd(), 'docs/MONSTER_CUTSCENE_PROMPTS.md');
  fs.writeFileSync(outputPath, md, 'utf-8');
  console.log(`🎉 Successfully generated ${outputPath}!`);
  console.log(`Document size: ${(md.length / 1024).toFixed(1)} KB across ${monsters.length} monsters (${monsters.length * 2} prompts).`);
}
