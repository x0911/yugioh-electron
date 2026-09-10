# Yu-Gi-Oh! 5D's Top 20 Monsters — Summon & Attack Cutscene Generation Prompts

This document provides **copy/paste ready prompts** for generating high-definition animated cutscenes (Summon and Attack) for the **Top 20 Yu-Gi-Oh! 5D's Monsters**.

Each prompt is explicitly crafted for modern video AI generation platforms (Runway Gen-3 Alpha, Luma Dream Machine, Kling AI, OpenAI Sora, Pika, Midjourney + Animate) where you upload the monster's official card art as an image reference.

---

## 📋 Quick Setup & Directory Placement

- **Reference Art Location**: All monster reference card art images are located at:
  `resources/cards/art/<id>.jpg` (and full cards at `resources/cards/full/<id>.jpg`).
  *Always attach this image file into the AI prompt generator as the image reference.*
- **In-Game Video Destination**: Place completed `.mp4` video files into:
  - **Summon Video**: `resources/videos/cards/summon_<id>.mp4`
  - **Attack Video**: `resources/videos/cards/attack_<id>.mp4`
- **Recommended Video Specs**:
  - **Resolution**: 1920x1080 (16:9 widescreen) or 1280x720
  - **Framerate**: 30fps or 60fps
  - **Length**: 3.5 to 5.0 seconds (short, punchy, high-impact anime cutscene)
  - **Format**: MP4 (H.264 / AAC)
- **Automatic In-Game Playback**: These 20 monsters are already registered in `data/card-videos.json`. Once you drop the `.mp4` files into `resources/videos/cards/`, the game engine will automatically detect and play them during duels! Until then, an animated hero card fallback sequence plays seamlessly with full SFX ducking.

---

## 🐉 1. Stardust Dragon

- **Card ID**: `44508094`
- **Archetype / Series**: Signer Dragon / Yusei Fudo
- **Reference Image to Attach**: `resources/cards/art/44508094.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_44508094.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_44508094.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Stardust Dragon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: sleek pearlescent silver-white draconic armor plates, crystalline turquoise chest and wing accents, long swept-back horns, and wide ethereal wings.

Animation: Cinematic high-budget anime cutscene. Multiple concentric glowing emerald-green Synchro tuning rings illuminate deep outer space. A brilliant beam of iridescent starlight pierces through the rings. Stardust Dragon emerges gracefully from the luminous pillar, unfurling its majestic wings in slow motion as glittery cosmic stardust particles and glittering diamonds swirl across the screen. The dragon arches back and lets out a heroic draconic roar towards the camera, starlight gleaming off its polished silver scales. Dynamic camera dolly-in, volumetric lighting, epic anime cinematic rendering, 4k resolution, 60fps.
```

### Attack Cutscene Prompt (Shooting Sonic)
```text
I have attached the character reference image for Stardust Dragon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: sleek pearlescent silver-white draconic armor plates, crystalline turquoise chest and wing accents, long swept-back horns, and wide ethereal wings.

Animation: Dynamic high-action anime attack sequence: "Shooting Sonic". Stardust Dragon glides through a starfield, dipping downwards before soaring directly toward the camera. Its mouth opens as rings of concentrated cosmic cyan energy and bright stardust spiral into its maw. It unleashes a massive, blinding beam of supercharged turquoise and white celestial energy directly at the viewer. Screen shakes violently with shockwaves, starlight lens flare, motion blur, impactful anime impact frames, cinematic lighting, 4k resolution.
```

---

## 🔥 2. Red Dragon Archfiend

- **Card ID**: `70902743`
- **Archetype / Series**: Signer Dragon / Jack Atlas
- **Reference Image to Attach**: `resources/cards/art/70902743.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_70902743.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_70902743.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Red Dragon Archfiend. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: massive muscular humanoid dragon demon, deep crimson and obsidian dark plates, twin sweeping horns, fiery molten accents, and gargantuan spiked dragon wings.

Animation: Cataclysmic anime summon cutscene. The obsidian volcanic ground cracks open into molten glowing magma fissures. A towering geyser of roaring crimson flames and black smoke erupts violently. Red Dragon Archfiend rises from the inferno, spreading its colossal wings as volcanic ash and blazing embers scatter into the atmosphere. It flexes its colossal claws and roars ferociously into the sky, fiery red eyes burning with tyrannical power. Dramatic low-angle heroic perspective, heat haze distortion, volcanic sparks, hyper-detailed anime aesthetic, 4k resolution.
```

### Attack Cutscene Prompt (Absolute Powerforce)
```text
I have attached the character reference image for Red Dragon Archfiend. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: massive muscular humanoid dragon demon, deep crimson and obsidian dark plates, twin sweeping horns, fiery molten accents, and gargantuan spiked dragon wings.

Animation: Overwhelming anime finishing move: "Absolute Powerforce". Red Dragon Archfiend gathers colossal roaring crimson flames into its clenched right fist, which ignites with superheated molten magma and crackling dark-lightning arcs. The dragon lunges forward with earth-shattering acceleration and drives an explosive fiery punch directly downward into the camera. Screen shatters into volcanic impact lines, shockwave rings expand violently, blinding explosion of crimson flame, cinematic shake, 4k resolution.
```

---

## 🌹 3. Black Rose Dragon

- **Card ID**: `73580471`
- **Archetype / Series**: Signer Dragon / Akiza Izinski
- **Reference Image to Attach**: `resources/cards/art/73580471.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_73580471.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_73580471.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Black Rose Dragon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: dragon formed of velvet ruby-red rose petals, sleek black thorny stem-like body, sharp glowing golden eyes, and whip-like thorny vine tails.

Animation: Ethereal and dangerous anime summon sequence. A whirlwind of razor-sharp scarlet and dark pink rose petals gathers in the center of the screen, entwined with whipping black brambles and thorns. From the blooming vortex of blossoms, Black Rose Dragon unfurls its magnificent rose-petal wings with aristocratic grace. It arches its neck, eyes flashing radiant gold, while thousands of fragrant glowing rose petals cascade around it in a slow-motion spiral. Soft bloom lighting, velvety textures, elegant gothic anime aesthetic, 4k, 60fps.
```

### Attack Cutscene Prompt (Black Rose Flare)
```text
I have attached the character reference image for Black Rose Dragon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: dragon formed of velvet ruby-red rose petals, sleek black thorny stem-like body, sharp glowing golden eyes, and whip-like thorny vine tails.

Animation: Ferocious anime attack sequence: "Black Rose Flare". Black Rose Dragon lashes its thorny tail vines forward as its petal wings ignite with blazing ruby-red spiritual flames. It spreads its wings wide and blasts an overwhelming vortex of incandescent flaming rose petals and burning floral shockwaves straight into the camera. Heat distortion, burning embers flying everywhere, intense scarlet illumination, high-speed camera track, anime impact lines, 4k.
```

---

## 🧚‍♀️ 4. Ancient Fairy Dragon

- **Card ID**: `25862681`
- **Archetype / Series**: Signer Dragon / Luna
- **Reference Image to Attach**: `resources/cards/art/25862681.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_25862681.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_25862681.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Ancient Fairy Dragon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: serene pearlescent pale green and cream scales, golden ceremonial armor trim, gossamer fairy-like wings, elegant serpentine dragon physique, and gentle glowing eyes.

Animation: Sacred magical anime cutscene. Shafts of heavenly emerald and golden morning sunlight pour through an enchanted ancient forest canopy. Luminescent crystalline butterflies and sparkling spiritual orbs flutter gracefully. Ancient Fairy Dragon descends gently from the light, its translucent gossamer wings trailing glittering fairy dust. It glides smoothly toward the viewer, radiating benevolent warmth and divine purity. Dreamy volumetric sunbeams, magical sparkle particles, serene high-fantasy anime cinematography, 4k.
```

### Attack Cutscene Prompt (Eternal Sunshine)
```text
I have attached the character reference image for Ancient Fairy Dragon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: serene pearlescent pale green and cream scales, golden ceremonial armor trim, gossamer fairy-like wings, elegant serpentine dragon physique, and gentle glowing eyes.

Animation: Holy divine anime blast: "Eternal Sunshine". Ancient Fairy Dragon loops gracefully in midair, curling its serpentine body as concentric rings of brilliant golden and emerald solar glyphs materialize around it. It releases a breathtaking, expanding nova wave of pure celestial sunlight and sparkling aura that cleanses the entire battlefield and rushes right into the camera. Blinding holy bloom, radiant rays, celestial particle dissipation, 4k cinematic render.
```

---

## ⚙️ 5. Power Tool Dragon

- **Card ID**: `2403771`
- **Archetype / Series**: Leo
- **Reference Image to Attach**: `resources/cards/art/2403771.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_2403771.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_2403771.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Power Tool Dragon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: industrial construction mecha dragon, vibrant hazard-yellow and dark grey steel plating, hydraulic piston limbs, excavator bucket head and tail, and heavy power drill arm.

Animation: High-octane mechanical assembly cutscene. Heavy industrial gears spin rapidly, and hydraulic pistons hiss violently releasing white pressurized steam. Heavy yellow steel crane and shovel components slam together with loud metallic clanks and sparks. Power Tool Dragon locks into full assembly, its drill arm revving up at high speed, hazard lights flashing amber. It stomps forward onto the metal plating with heavy robotic weight, roaring with a synthesized mechanical shriek. Industrial anime aesthetic, metallic reflections, grease and steam effects, 4k.
```

### Attack Cutscene Prompt (Crafty Break)
```text
I have attached the character reference image for Power Tool Dragon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: industrial construction mecha dragon, vibrant hazard-yellow and dark grey steel plating, hydraulic piston limbs, excavator bucket head and tail, and heavy power drill arm.

Animation: High-impact industrial strike: "Crafty Break". Power Tool Dragon charges forward on hydraulic treads, its colossal steel drill arm spinning at blinding RPM with intense friction sparks and glowing red-hot metal tips. Exhaust pipes on its back blast fiery orange backfire. It thrusts the spinning drill straight into the screen in an explosive, crunching drill attack that creates radial metallic sparks and shockwaves. High-contrast mecha anime impact frames, camera shake, 4k.
```

---

## 🦅 6. Blackwing Armor Master

- **Card ID**: `69031175`
- **Archetype / Series**: Blackwing / Crow Hogan
- **Reference Image to Attach**: `resources/cards/art/69031175.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_69031175.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_69031175.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Blackwing Armor Master. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: sleek anthropomorphic avian warrior, impenetrable black-and-silver plated armor, twin bladed metal wings, glowing red visor slit, and black feathered mantle.

Animation: Swift, stealthy ninja-anime entrance. A sudden dark whirlwind sweeps across a stormy midnight sky, scattering razor-sharp jet-black feathers. Blackwing Armor Master drops from above like a hawk, landing in an agile, low three-point crouch. As it slowly stands up, the twin steel blade wings fan out and gleam under the moonlight, visor flashing sharp crimson. Wind howls, feathers swirl in slow motion, dark gritty anime shading, dramatic edge lighting, 4k.
```

### Attack Cutscene Prompt (Black Hurricane)
```text
I have attached the character reference image for Blackwing Armor Master. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: sleek anthropomorphic avian warrior, impenetrable black-and-silver plated armor, twin bladed metal wings, glowing red visor slit, and black feathered mantle.

Animation: Blinding supersonic aerial assault: "Black Hurricane". Blackwing Armor Master dashes forward at mach speed, leaving three shadowy afterimage clones behind. It leaps high into the air, spins horizontally, and unleashes twin crescent-shaped sonic blade waves from its steel wings, cutting through the screen with jet-black wind pressure and razor feathers. High-speed anime action lines, dynamic camera tracking, slicing spark effects, 4k.
```

---

## 🥊 7. Junk Warrior

- **Card ID**: `60800381`
- **Archetype / Series**: Junk / Synchro / Yusei Fudo
- **Reference Image to Attach**: `resources/cards/art/60800381.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_60800381.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_60800381.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Junk Warrior. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: purple, silver, and orange armored humanoid warrior, twin jet booster turbines on back, spiked gauntlets, and determined robotic faceplate with green visor.

Animation: Iconic hero landing anime cutscene. A neon green Synchro tuning portal opens above a speedway at sunset. Junk Warrior rocket-dives through the portal, back turbines blazing with intense cyan exhaust flames. It touches down onto the asphalt in an explosive superhero slide, tires and metal boots throwing sparks. It rises into a classic fighting stance, clenching its heavy right fist while the back turbines flare up with power. Classic Yusei theme energy, vibrant anime lighting, heat distortion, 4k.
```

### Attack Cutscene Prompt (Scrap Fist)
```text
I have attached the character reference image for Junk Warrior. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: purple, silver, and orange armored humanoid warrior, twin jet booster turbines on back, spiked gauntlets, and determined robotic faceplate with green visor.

Animation: Maximum-overdrive punch: "Scrap Fist". Junk Warrior leans forward as both twin rocket boosters on its back ignite with roaring supersonic blue flames. It blasts across the screen at near lightspeed, pulling back its glowing spiked gauntlet. As it gets within inches of the camera, it unleashes a catastrophic right cross surrounded by spiraling blue plasma shockwaves, shattering the screen glass with anime impact frames. Dynamic camera zoom, particle rush, 4k.
```

---

## 🔨 8. Junk Destroyer

- **Card ID**: `74860293`
- **Archetype / Series**: Junk / Synchro / Yusei Fudo
- **Reference Image to Attach**: `resources/cards/art/74860293.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_74860293.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_74860293.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Junk Destroyer. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: colossal heavyweight dreadnought robot warrior, orange, white, and iron-grey heavy armor plating, twin smoke exhaust chimneys on shoulders, massive demolition fists.

Animation: Colossal heavyweight anime summon. The screen rumbles with seismic bass vibrations. Massive iron wrecking plates and engine blocks crash down from the sky, locking together with deafening hydraulic impacts. Junk Destroyer drops down with immense weight, cracking the ground into boulders and craters. Thick black exhaust smoke and white steam blast from its twin shoulder chimneys as its glowing yellow optic sensor sweeps across the field. Tremor camera shake, heavy mechanical physics, 4k.
```

### Attack Cutscene Prompt (Tidal Iron Crush)
```text
I have attached the character reference image for Junk Destroyer. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: colossal heavyweight dreadnought robot warrior, orange, white, and iron-grey heavy armor plating, twin smoke exhaust chimneys on shoulders, massive demolition fists.

Animation: Devastating demolition barrage: "Tidal Iron Crush". Junk Destroyer's shoulder exhausts roar with orange fire as it charges both titanic steel fists with glowing kinetic energy. It stomps forward and slams both massive fists together right into the camera, releasing a cataclysmic concussive blast wave that disintegrates rocks, buildings, and ground in an expanding spherical shockwave. Maximum screen shake, debris flying, anime explosion physics, 4k.
```

---

## 🌠 9. Shooting Star Dragon

- **Card ID**: `24696097`
- **Archetype / Series**: Accel Synchro / Yusei Fudo
- **Reference Image to Attach**: `resources/cards/art/24696097.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_24696097.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_24696097.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Shooting Star Dragon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: streamlined aerodynamic cosmic dragon, translucent crystalline cyan wings, pearlescent silver-white chassis, red chest orb, and swept-back aerodynamic crest.

Animation: Accel Synchro warp-speed breakthrough sequence. The camera hurtles through a rainbow tachyon light-tunnel as speed of light is shattered. Sonic shockwave rings explode repeatedly. Shooting Star Dragon accelerates out of the light cone, leaving shimmering holographic afterimages behind it. It gracefully decelerates, spreading its translucent crystalline wings as trails of glittering blue and white cosmic stardust ribbon behind it in zero gravity. Hyper-speed anime visuals, prism refractions, dazzling starlight flares, 4k.
```

### Attack Cutscene Prompt (Stardust Mirage)
```text
I have attached the character reference image for Shooting Star Dragon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: streamlined aerodynamic cosmic dragon, translucent crystalline cyan wings, pearlescent silver-white chassis, red chest orb, and swept-back aerodynamic crest.

Animation: Ultimate Accel Synchro finisher: "Stardust Mirage". Shooting Star Dragon splits into five distinct luminous spectral copies, each soaring through the upper stratosphere at hypersonic speed. All five dragons dive toward the viewer simultaneously, converging into a single blinding, meteor-like lance of radiant blue starlight and celestial fire that pierces directly through the camera. Screen flashes pure white with cosmic starburst lens flare, 4k.
```

---

## 💥 10. Red Nova Dragon

- **Card ID**: `97489701`
- **Archetype / Series**: Double Tuning / Jack Atlas
- **Reference Image to Attach**: `resources/cards/art/97489701.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_97489701.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_97489701.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Red Nova Dragon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: titanic four-winged volcanic dragon god, jagged obsidian and fiery crimson armor, incandescent glowing magma horns, blazing heart core, and colossal wings radiating solar fire.

Animation: Apocalyptic Double Tuning summon sequence. Two fiery spirits of burning crimson flame spiral together in a double-helix pillar of roaring fire. The pillar detonates into a colossal supernova explosion. Out of the heart of the solar flare emerges Red Nova Dragon, roaring with primeval fury. Its four titanic wings ignite with raging solar prominences, and waves of superheated plasma radiate across space. Intense crimson heat, boiling lava sparks, godlike demonic presence, 4k.
```

### Attack Cutscene Prompt (Burning Soul / Blazing Gale)
```text
I have attached the character reference image for Red Nova Dragon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: titanic four-winged volcanic dragon god, jagged obsidian and fiery crimson armor, incandescent glowing magma horns, blazing heart core, and colossal wings radiating solar fire.

Animation: Supernova cataclysm: "Burning Soul". Red Nova Dragon folds its four flaming wings around itself, drawing in all surrounding fire and heat into an ultra-dense sphere of black and scarlet plasma. It opens its wings with a furious roar, discharging the entire burning star straight into the camera in a devastating apocalyptic firestorm. Screen vibrates violently, incandescent white-hot flash, burning magma debris, 4k.
```

---

## ⚔️ 11. Goyo Guardian

- **Card ID**: `7391448`
- **Archetype / Series**: Sector Security / Tetsu Trudge
- **Reference Image to Attach**: `resources/cards/art/7391448.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_7391448.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_7391448.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Goyo Guardian. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: heavily armored cybernetic samurai lawman, deep blue and burnished gold armor, sweeping Kabuto helmet crest, glowing visor, wielding a weighted iron jitte truncheon.

Animation: High-tech law enforcement anime entrance. Flashing red and blue cybernetic emergency sirens illuminate a dark metropolis alleyway. Digital blue wireframes converge to form the armored frame of Goyo Guardian. It materializes with heavy mechanical footsteps, spins its weighted jitte truncheon in a practiced martial arc, and settles into an imposing, unyielding security stance, golden helmet horns catching the blue neon glow. Cyberpunk anime aesthetic, police neon reflections, 4k.
```

### Attack Cutscene Prompt (Goyo Bind Strike)
```text
I have attached the character reference image for Goyo Guardian. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: heavily armored cybernetic samurai lawman, deep blue and burnished gold armor, sweeping Kabuto helmet crest, glowing visor, wielding a weighted iron jitte truncheon.

Animation: Arresting strike: "Goyo Bind Strike". Goyo Guardian lunges forward with surprising agility, swinging its weighted iron jitte weapon. The weapon trails crackling blue electro-magnetic chains of pure energy. It brings the truncheon down with crushing, concussive force straight into the camera, sending electric blue shockwaves and binding energy arcs across the screen. Impact sparks, anime motion trails, 4k.
```

---

## 🧠 12. Thought Ruler Archfiend

- **Card ID**: `70780151`
- **Archetype / Series**: Psychic / Sayer
- **Reference Image to Attach**: `resources/cards/art/70780151.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_70780151.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_70780151.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Thought Ruler Archfiend. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: towering psychic demonic emperor, biomechanical deep indigo and bronze armor plates, exposed glowing brain matter beneath a translucent cranial dome, psychic horns, and glowing violet eyes.

Animation: Dark psychic dimensional rupture cutscene. The space in front of the camera distorts with purple gravitational warping and psychic static interference. A dimensional rift tears open, revealing Thought Ruler Archfiend hovering ominously. Its exposed brain glows with pulsing violet telepathic synapses. It slowly descends to the ground, crossing its armored arms, exuding overwhelming mental dominance and sinister calm. Gravitational distortion waves, violet telepathic lightning, eerie high-concept sci-fi anime aesthetic, 4k.
```

### Attack Cutscene Prompt (Telekinetic Pulse Shock)
```text
I have attached the character reference image for Thought Ruler Archfiend. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: towering psychic demonic emperor, biomechanical deep indigo and bronze armor plates, exposed glowing brain matter beneath a translucent cranial dome, psychic horns, and glowing violet eyes.

Animation: Mind-shattering psychic blast: "Telekinetic Pulse Shock". Thought Ruler Archfiend thrusts both open clawed hands toward the camera. Its eyes and cranial dome flash violently with blinding violet telekinetic energy. Concentric circular shockwaves of compressed gravitational energy ripple forward at high frequency, distorting reality and blasting straight into the viewer. Reality-bending visual distortion, purple chromatic aberration, heavy bass shockwave, 4k.
```

---

## 💀 13. Infernity Doom Dragon

- **Card ID**: `72896720`
- **Archetype / Series**: Infernity / Kalin Kessler
- **Reference Image to Attach**: `resources/cards/art/72896720.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_72896720.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_72896720.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Infernity Doom Dragon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: skeletal undead draconic beast, charcoal and bone-white armor plating, revolver cylinder gun mechanisms built into its chest and ribs, jagged bone wings, and glowing purple demonic eyes.

Animation: Desolate western underworld summon sequence. A dusty ghost town canyon is consumed by eerie purple hellfire. A bottomless crater opens, and Infernity Doom Dragon crawls upward from the abyss. The gun cylinder in its skeletal chest rotates with a crisp metallic clicking sound like a cocking revolver. It stretches its jagged wings and emits a bone-chilling screech into the dark purple night sky. Gritty dark anime aesthetic, purple flames, eerie shadows, 4k.
```

### Attack Cutscene Prompt (Infernal Fire Blast)
```text
I have attached the character reference image for Infernity Doom Dragon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: skeletal undead draconic beast, charcoal and bone-white armor plating, revolver cylinder gun mechanisms built into its chest and ribs, jagged bone wings, and glowing purple demonic eyes.

Animation: Zero-hand hellfire execution: "Infernal Fire Blast". The revolver cylinders in Infernity Doom Dragon's chest spin at high velocity, charging glowing dark violet hellfire into each chamber. The dragon lunges forward, unhinges its skeletal jaws, and fires a devastating, concentrated torrent of dark purple brimstone flames and ghostly skulls straight down the camera barrel. Blinding purple flash, smoke and ashes, 4k.
```

---

## 🤖 14. T.G. Blade Blaster

- **Card ID**: `51447164`
- **Archetype / Series**: Tech Genus / Antinomy (Vizor)
- **Reference Image to Attach**: `resources/cards/art/51447164.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_51447164.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_51447164.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for T.G. Blade Blaster. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: sleek futuristic mecha warrior, crimson, white, and midnight-blue aerodynamic armor plates, glowing neon cyan lines, booster thrusters, and twin high-frequency laser beam blades.

Animation: Sci-fi Delta Accel launch sequence. Digital telemetry HUD displays flash at hyperspeed. In a high-tech orbital corridor, T.G. Blade Blaster ignites its rear vernier thrusters with bright blue plasma exhaust. It rocket-boosts forward, executing a flawless midair spin before landing with precision. It ignites both twin laser sabers from its forearms, the glowing blades humming with crackling plasma. High-end mecha anime rendering, lens reflections, clean sci-fi aesthetic, 4k, 60fps.
```

### Attack Cutscene Prompt (Blade Rush Overdrive)
```text
I have attached the character reference image for T.G. Blade Blaster. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: sleek futuristic mecha warrior, crimson, white, and midnight-blue aerodynamic armor plates, glowing neon cyan lines, booster thrusters, and twin high-frequency laser beam blades.

Animation: Blinding triple-slash mecha combo: "Blade Rush Overdrive". T.G. Blade Blaster activates maximum thruster overdrive, vanishing in a blur of cyan light. It executes three lightning-fast cross slashes with its dual beam sabers across the screen, carving glowing red-and-cyan plasma incisions into space, followed by a point-blank blast from its chest blasters directly into the camera. Mecha slash impact lines, intense anime speed lines, 4k.
```

---

## 🚀 15. T.G. Halberd Cannon

- **Card ID**: `97836203`
- **Archetype / Series**: Tech Genus / Antinomy (Vizor)
- **Reference Image to Attach**: `resources/cards/art/97836203.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_97836203.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_97836203.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for T.G. Halberd Cannon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: massive colossal orbital mecha titan, heavy scarlet, white, and charcoal armor, towering shoulder pauldrons, dual fusion reactors, and an enormous anti-matter halberd cannon.

Animation: Epic orbital weapon deployment cutscene. In the upper atmosphere above Earth, a giant space-station docking clamp unlocks with explosive decompression bolts. T.G. Halberd Cannon descends through the clouds, its dual fusion reactors glowing at maximum output. It deploys its immense halberd cannon, locking the weapon into firing position with heavy mechanical clanks as hexagonal energy shields pulse around its chassis. Volumetric space lighting, planetary curvature background, 4k.
```

### Attack Cutscene Prompt (All-Clear Halberd Impact)
```text
I have attached the character reference image for T.G. Halberd Cannon. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: massive colossal orbital mecha titan, heavy scarlet, white, and charcoal armor, towering shoulder pauldrons, dual fusion reactors, and an enormous anti-matter halberd cannon.

Animation: Orbital cannon super-weapon: "All-Clear Halberd Impact". T.G. Halberd Cannon spins the gigantic halberd in a circle, drawing tachyon energy into the muzzle. Energy arcs crackle along the barrel as the weapon locks onto the screen. It fires an overwhelming, planet-busting beam of blinding red-and-white particle energy straight down the camera lens, filling the screen with pure destruction and shockwaves. Massive screen vibration, particle overload, 4k.
```

---

## 🌸 16. Chevalier de Fleur

- **Card ID**: `45037489`
- **Archetype / Series**: Fleur / Sherry LeBlanc
- **Reference Image to Attach**: `resources/cards/art/45037489.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_45037489.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_45037489.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Chevalier de Fleur. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: noble chivalric knight, polished silver filigree plate armor, ornate gold fleur-de-lis embellishments, flowing pure white cape, winged helm, and a slender fencing rapier.

Animation: Aristocratic chivalric anime entrance. In the grand courtyard of a sunlit French baroque palace, delicate white and golden flower petals swirl in a gentle breeze. Chevalier de Fleur materializes gracefully, pure white cape fluttering behind. The knight draws an ornate fencing rapier in a sweeping salute, the polished silver blade catching a brilliant glint of sunlight with a crystalline chime sound. Elegant, regal, high-fashion anime fantasy aesthetic, 4k.
```

### Attack Cutscene Prompt (Fleur Fleche)
```text
I have attached the character reference image for Chevalier de Fleur. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: noble chivalric knight, polished silver filigree plate armor, ornate gold fleur-de-lis embellishments, flowing pure white cape, winged helm, and a slender fencing rapier.

Animation: Lightning-fast fencing thrust: "Fleur Fleche". Chevalier de Fleur drops into a master fencer's stance and lunges forward across the screen with breathtaking speed and grace. The tip of the rapier gathers a concentrated point of piercing white-and-gold starlight, piercing straight into the camera and releasing a brilliant burst of shimmering floral light and shockwave rings. Crisp anime impact, shimmering petal dissipation, 4k.
```

---

## 🐎 17. Baronne de Fleur

- **Card ID**: `84815190`
- **Archetype / Series**: Fleur / Sherry LeBlanc
- **Reference Image to Attach**: `resources/cards/art/84815190.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_84815190.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_84815190.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Baronne de Fleur. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: majestic aristocratic duchess knight, royal midnight-blue and gold ornate armor, sweeping feathered plume helmet, riding a spectral armored war steed, wielding an ornate royal lance.

Animation: Grand royal knight summon cutscene. A mystical moonlit sky erupts with a vortex of swirling sapphire and gold flower petals. Baronne de Fleur charges forward atop her ethereal armored steed, hooves striking sparks of magic upon the air. The steed rears up heroically as Baronne raises her grand decorated lance, cape billowing dramatically under the moonlight, exuding absolute nobility and battlefield supremacy. Cinematic camera pan, royal fantasy anime aesthetic, 4k, 60fps.
```

### Attack Cutscene Prompt (Noble Lance Burst)
```text
I have attached the character reference image for Baronne de Fleur. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: majestic aristocratic duchess knight, royal midnight-blue and gold ornate armor, sweeping feathered plume helmet, riding a spectral armored war steed, wielding an ornate royal lance.

Animation: Devastating cavalry charge: "Noble Lance Burst". Baronne de Fleur charges forward at full gallop directly toward the camera, her steed leaving glowing trails of golden light in its wake. She levels her massive lance, the tip erupting with super-compressed royal blue and golden vortex energy. She thrusts the lance forward, detonating an explosive shockwave of floral energy that shatters the screen. Dynamic camera track, explosive royal burst, 4k.
```

---

## ⌛ 18. Metaion, the Timelord

- **Card ID**: `74530899`
- **Archetype / Series**: Timelord / Z-one
- **Reference Image to Attach**: `resources/cards/art/74530899.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_74530899.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_74530899.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Metaion, the Timelord. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: colossal celestial entity, stylized stoic mechanical mask face, gleaming red and gold sacred armor plating, radiant burning halo wings, glowing Sephirot sphere in chest.

Animation: Transcendent celestial entity summon. Cosmic space warps as the sacred glyphs of the Tree of Life glow with brilliant holy light. Metaion, the Timelord manifests, an immense and silent divine deity floating weightlessly in the cosmos. Its burning fiery halo wings spread wide, bathing the universe in ancient sacred radiance, while its impassive, godlike mask stares emotionlessly forward. Divine choral aura, cosmic grandeur, biblical sci-fi anime aesthetic, 4k.
```

### Attack Cutscene Prompt (Divine Reversal Flare)
```text
I have attached the character reference image for Metaion, the Timelord. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: colossal celestial entity, stylized stoic mechanical mask face, gleaming red and gold sacred armor plating, radiant burning halo wings, glowing Sephirot sphere in chest.

Animation: Omnipotent time-reversal wave: "Divine Reversal Flare". Metaion, the Timelord raises its right hand slowly. The sphere on its chest spins, projecting an enormous revolving circular wheel of fiery solar glyphs and golden flames. The wheel detonates, releasing an omnidirectional wave of blinding golden fire that rushes over the camera, incinerating and reversing everything in its path. Overwhelming golden illumination, shockwave distortion, 4k.
```

---

## 🌟 19. Sephylon, the Ultimate Timelord

- **Card ID**: `8967776`
- **Archetype / Series**: Timelord / Z-one
- **Reference Image to Attach**: `resources/cards/art/8967776.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_8967776.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_8967776.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Sephylon, the Ultimate Timelord. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: supreme godlike golden titan, ten multi-colored celestial spheres floating around its body, majestic multi-tiered golden wings, intricate sacred filigree armor, and omnipotent glowing eyes.

Animation: Supreme apocalyptic deity summon. In the deep expanse of the universe, ten colored celestial Sephirot orbs align into the sacred Tree of Life. A blinding flash of divine white-gold light illuminates galaxies. Sephylon, the Ultimate Timelord materializes, its immense multi-tiered golden wings spreading infinitely across space. The ten spheres orbit its colossal form as golden cosmic dust and divine runes swirl majestically around it. Ultimate boss aura, breathtaking scale, 4k.
```

### Attack Cutscene Prompt (Genesis Judgement Ray)
```text
I have attached the character reference image for Sephylon, the Ultimate Timelord. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: supreme godlike golden titan, ten multi-colored celestial spheres floating around its body, majestic multi-tiered golden wings, intricate sacred filigree armor, and omnipotent glowing eyes.

Animation: Universal creation finisher: "Genesis Judgement Ray". The ten celestial spheres orbiting Sephylon accelerate into a blinding ring of rainbow light. Sephylon raises its giant golden hands, channeling the total energy of creation into a radiant orb in front of its chest. It unleashes a universe-shaking beam of supreme iridescent white-and-gold energy straight into the camera, disintegrating all reality into pure starlight. Blinding whiteout, epic anime finale visual, 4k.
```

---

## ⚡ 20. Odin, Father of the Aesir

- **Card ID**: `93483212`
- **Archetype / Series**: Nordic / Team Ragnarok (Halldor)
- **Reference Image to Attach**: `resources/cards/art/93483212.jpg`
- **Summon Video Destination**: `resources/videos/cards/summon_93483212.mp4`
- **Attack Video Destination**: `resources/videos/cards/attack_93483212.mp4`

### Summon Cutscene Prompt
```text
I have attached the character reference image for Odin, Father of the Aesir. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: gargantuan Norse god monarch, ornate golden and bronze armor with runic engravings, flowing white beard and hair, winged helmet, spectral ravens encircling him, holding the divine spear Gungnir.

Animation: God of the North summon sequence. Shimmering emerald and violet aurora borealis lights drape across a frigid snow-capped Nordic mountain range. Thunder cracks violently as a blinding bolt of golden lightning strikes the highest glacier peak. Odin, Father of the Aesir manifests from the strike, a towering divine monarch holding the spear Gungnir. Two spectral ravens dive past the camera as Odin's single glowing eye flashes with omniscient divine power. Mythological anime majesty, icy wind and snow, golden lightning arcs, 4k.
```

### Attack Cutscene Prompt (Gungnir Heavenly Thunder)
```text
I have attached the character reference image for Odin, Father of the Aesir. Maintain strict 1:1 visual fidelity to the creature's design, proportions, color palette, and textures in the attached reference image: gargantuan Norse god monarch, ornate golden and bronze armor with runic engravings, flowing white beard and hair, winged helmet, spectral ravens encircling him, holding the divine spear Gungnir.

Animation: Divine thunder javelin: "Gungnir Heavenly Thunder". Odin raises the divine spear Gungnir high into the stormy heavens. The stormy sky detonates with crackling golden and violet lightning bolts, concentrating the fury of the storm into the tip of the spear. Odin hurls Gungnir forward with cataclysmic godly force straight into the camera, splitting mountains and leaving an ionized trail of holy lightning that shatters the screen. Godlike thunder impact, violent camera shake, 4k.
```

---
