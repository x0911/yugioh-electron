# Character Video Prompts — AI-Generated Duel Cutscenes

This document provides detailed, cinematic video generation prompts for all **20 duelists** across both the **Original Series (Duel Monsters)** and **Yu-Gi-Oh! GX**. 

Use these prompts with modern AI video generation tools (**Runway Gen-3 Alpha, Kling AI, Luma Dream Machine, OpenAI Sora, Pika 2.0, Hailuo/Minimax**) to create short, looping or one-shot `.mp4` video cutscenes.

---

## 1. Video Specifications & Production Guidelines

- **Aspect Ratio:** `16:9` widescreen (1920×1080 or 2560×1440).
- **Target Duration:** 3 to 5 seconds per clip.
- **Framerate:** 24fps or 30fps (smooth cinematic anime motion).
- **Output Format:** H.264 `.mp4`, audio optional or muted (in-game audio engine mixes SFX/BGM dynamically).
- **Universal Style Anchor (prefix or incorporate into prompts):**
  > *"Cinematic high-budget anime cutscene, crisp cel-shaded lines, dynamic anime lighting, vibrant holographic energy, dramatic rim lighting, 4K resolution, Studio Bridge/Toei high-end theatrical animation quality, volumetric smoke and glowing particle embers, no watermarks, no distorted faces, no extra limbs."*

### File Naming & Folder Organization
Export and drop generated videos into `resources/videos/characters/`:

```
resources/videos/characters/
  ├── [id].mp4                 <-- Primary Pre-Duel intro video (used in Phase 8)
  ├── [id]_intro.mp4           <-- Pre-Duel intro
  ├── [id]_damage_light.mp4    <-- Light/standard damage reaction
  ├── [id]_damage_heavy.mp4    <-- Huge damage reaction
  ├── [id]_defeat_blast.mp4    <-- Fatal LP reduction to 0
  ├── [id]_win.mp4             <-- Post-duel victory scene
  └── [id]_loss.mp4            <-- Post-duel defeat scene
```

---

## 2. Duel Monsters (Original Series) Characters

---

### 1. Yugi Muto (`yugi-muto`)
*Visual Anchor: Small stature, iconic tricolor spiked hair (black/magenta/blond tips), domino high school uniform with leather buckled collar, silver Millennium Puzzle around neck, classic KaibaCorp Duel Disk on left forearm.*

- **Pre-Duel (Intro):**
  > *Cinematic anime close-up to medium shot. Yugi Muto touches the Millennium Puzzle around his neck with determination, eyes shining with resolve. He draws a card from his deck with a sharp, fluid arc, setting his stance on the Ancient Arena dueling platform as the KaibaCorp Duel Disk snaps open with a glowing cyan blade. Wind blows through his spiky tricolor hair. Dynamic low-angle camera push.*
- **Damage (Light / Medium):**
  > *Anime battle reaction shot. A burst of sonic shockwave wind hits Yugi Muto. He winces, gritting his teeth and crossing his arms to brace against the gust. Glowing sparks and holographic dust scatter across the field as his hair and school uniform jacket ruffle violently.*
- **Damage (Huge / Heavy Impact):**
  > *High-intensity anime impact cutscene. A colossal blast of fiery magical energy explodes directly before Yugi Muto. The shockwave forces him to skid backward across the stone floor, heels digging into the ground, grimacing in pain while shielding his face with a glowing forearm. Smoke swirls around him.*
- **Fatal LP 0 (Defeat Blast):**
  > *Dramatic slow-motion anime defeat sequence. A massive holographic energy burst overpowers Yugi. His eyes widen in shock as his Duel Disk screen flashes red warning glyphs. The blast blows him backward into a plume of illuminated smoke; he drops to one knee on the arena floor, breathing heavily, head bowed as glowing card holograms dissolve into golden sparkles.*
- **Post-Duel: Won Duel:**
  > *Triumphant anime victory shot. Yugi smiles warmly with pure happiness and pride. He places his hand over his heart, looking directly at the opponent with respect. He raises his index finger with a bright sparkle, the arena glowing with soft golden ambient light and ascending energy motes. Confident, heartwarming victory stance.*
- **Post-Duel: Lost Duel:**
  > *Gracious anime defeat shot. Yugi stands catching his breath, lowering his duel disk with a humble smile. He wipes a bead of sweat from his cheek, looks up at the opponent with admiring purple eyes, and gives a respectful nod of sportsmanship. Soft dusk lighting in the ruined arena.*

---

### 2. Yami Yugi / Pharaoh Atem (`yami-yugi`)
*Visual Anchor: Tall regal silhouette, intense sharp crimson/amethyst eyes, black leather collar with gold studs, dark blue jacket worn over shoulders like a cape, glowing golden Millennium Puzzle shining with eye emblem.*

- **Pre-Duel (Intro):**
  > *Epic theatrical anime intro. Yami Yugi stands under a dramatic spotlight as his dark jacket billows like a royal cape. He draws a card from the deck with blazing speed, slicing through the air with golden energy trails. The Millennium Puzzle flashes a blinding divine light. He points firmly forward at the camera with absolute authority. "It's time to duel!"*
- **Damage (Light / Medium):**
  > *Yami Yugi stands firm against an incoming burst of magical wind. He turns his head slightly, his jacket flapping fiercely, narrowed eyes glowing with undaunted focus as he absorbs the hit without stepping back.*
- **Damage (Huge / Heavy Impact):**
  > *Dramatic anime battle impact. A seismic burst of dark lightning strikes before Yami Yugi. He is pushed back by the tremendous force, his boots screeching against stone tiles. He raises a glowing arm to shield his face, grimacing as his cape whips violently in the gale, eyes burning with fierce intensity.*
- **Fatal LP 0 (Defeat Blast):**
  > *Cataclysmic slow-motion defeat cutscene. An overwhelming surge of divine light shatters the hologram field. Yami Yugi's eyes widen in solemn awe as the shockwave lifts his jacket. The duel disk flashes critical zero LP. He staggers backward into falling golden embers, dropping to one knee, fist resting against the stone arena floor as his cape settles.*
- **Post-Duel: Won Duel:**
  > *Majestic pharaoh victory scene. Yami Yugi lowers his duel disk smoothly and raises his right hand into the air, holding a shining card aloft. Golden celestial energy swirls around him like a sunburst. He turns sideways to the camera, giving a confident, charismatic smirk of the King of Games.*
- **Post-Duel: Lost Duel:**
  > *Solemn, noble defeat scene. Yami Yugi stands tall amidst fading smoke, closing his eyes calmly. He places his hand over the Millennium Puzzle, bowing his head in profound respect to a worthy rival. A gentle celestial breeze carries glowing motes into the twilight sky.*

---

### 3. Seto Kaiba (`seto-kaiba`)
*Visual Anchor: Sleek long white KaibaCorp trenchcoat with high collar and silver shoulder studs, dark turtleneck, blue eyes, brown hair, metallic silver/blue KaibaCorp Duel Disk.*

- **Pre-Duel (Intro):**
  > *High-tech dramatic anime intro. Seto Kaiba turns sharply toward the camera, his white trenchcoat flaring outward. The KaibaCorp Duel Disk lights up with neon blue lasers and holographic card projectors. He smirks arrogantly, flicking his wrist to draw a card with razor precision. Cold, intense blue eyes focused on total dominance.*
- **Damage (Light / Medium):**
  > *Seto Kaiba flinches slightly as a shockwave ripples past him. He snarls in irritation, his long coat snapping in the wind. He adjusts his stance with a disdainful scowl, completely unfazed by the minor damage.*
- **Damage (Huge / Heavy Impact):**
  > *Heavy combat shockwave. A massive explosion erupts at Kaiba's feet. The violent blast wave forces him to slide back across the holographic arena floor, his white trenchcoat whipping wildly. He clenches his teeth in fury, veins visible on his forehead, glaring through swirling blue embers.*
- **Fatal LP 0 (Defeat Blast):**
  > *Dramatic climactic defeat scene. A blinding beam of destructive energy overpowers Kaiba's monsters and hits the dueling platform. Kaiba's eyes widen in disbelief as his LP drops to 0 on his wrist monitor. He stumbles back, panting in shock, dropping to one knee with clenched trembling fists hitting the floor, coat draping over his shoulders.*
- **Post-Duel: Won Duel:**
  > *Arrogant triumphant victory scene. Seto Kaiba laughs triumphantly, crossing his arms and throwing his head back with an iconic smirk. The sky behind him fills with blue holographic dragons and KaibaCorp emblems. Camera arcs upward from a dramatic low angle.*
- **Post-Duel: Lost Duel:**
  > *Furious defeat scene. Seto Kaiba stands with clenched fists shaking in raw frustration. He turns his back to the camera, coat billowing, his Duel Disk powering down with a hiss of steam. He mutters bitterly into the wind, refusing to look back, preserving his stubborn pride.*

---

### 4. Joey Wheeler (`joey-wheeler`)
*Visual Anchor: Blond messy hair, green and white casual athletic jacket, blue jeans, eager fiery grin, Battle City Duel Disk.*

- **Pre-Duel (Intro):**
  > *Energetic, high-spirited anime entrance. Joey Wheeler punches the air with a determined grin, rubs his nose with his thumb, and snaps his Duel Disk into battle position. Red fiery aura sparks around his feet as he spreads his legs into a classic street-fighter duel stance. "Let's see what ya got!"*
- **Damage (Light / Medium):**
  > *Joey winces as a gust of wind hits him, raising his forearms to shield his face. He staggers one step back, shakes his head vigorously, and grins back with stubborn fighting spirit.*
- **Damage (Huge / Heavy Impact):**
  > *Heavy impact reaction. A fiery blast knocks Joey backward, causing him to tumble across the ground and quickly roll onto his feet, panting heavily. His jacket is scuffed with smoke. He grinds his teeth with fierce determination.*
- **Fatal LP 0 (Defeat Blast):**
  > *Dramatic defeat cutscene. An explosive blast knocks Joey completely off his feet in slow motion. He hits the arena platform, cards scattering. He sits up groggily, rubbing his head with a bewildered groan as his LP meter sounds the defeat chime, then sighs with a rueful grin.*
- **Post-Duel: Won Duel:**
  > *Wild, enthusiastic victory celebration. Joey pumps both fists into the air, jumping with joy and flashing a bright victory V-sign to the camera with a huge toothy grin. Red-Eyes dragon aura flares behind him in celebration.*
- **Post-Duel: Lost Duel:**
  > *Humorous yet heartfelt defeat scene. Joey scratches the back of his head with an embarrassed laugh, crouching down on the arena floor. He looks up with a warm, genuine smile of admiration: "Aw man, you really got me good!"*

---

### 5. Téa Gardner (`tea-gardner`)
*Visual Anchor: Brown bob hair, cheerful expressive eyes, Domino High school blazer or casual stylish vest, glowing wrist Duel Disk.*

- **Pre-Duel (Intro):**
  > *Graceful, spirited anime intro. Téa Gardner smiles warmly, eyes shining with friendship and confidence. She draws a card with a light, rhythmic motion like a dancer, her Duel Disk lighting up with pastel pink and gold sparkles. A gentle magical breeze swirls around her.*
- **Damage (Light / Medium):**
  > *Téa gasps, stepping back and holding her hands up defensively as a sparkling wind pushes her hair back. She regains her balance quickly with an earnest, determined expression.*
- **Damage (Huge / Heavy Impact):**
  > *Heavy shockwave hit. A sudden burst of force knocks Téa back several steps. She shields her eyes from blinding light and smoke, breathing fast, clutching her jacket as fairy light fragments scatter around her.*
- **Fatal LP 0 (Defeat Blast):**
  > *Dramatic slow-motion defeat. A magical energy burst sweeps across Téa's side of the field. She stumbles back and sinks gently onto both knees, looking down at her powered-down Duel Disk in surprise, then sighs softly with a gentle, accepting smile.*
- **Post-Duel: Won Duel:**
  > *Radiant victory scene. Téa clasps her hands together in delight, spinning with joy as shining sparkles and fairy wings shimmer in the air behind her. She beams a bright, warm smile at the player.*
- **Post-Duel: Lost Duel:**
  > *Encouraging sportsmanship scene. Téa brushes her hair behind her ear and smiles cheerfully at the opponent, clapping her hands together softly: "That was an amazing duel! You were wonderful!"*

---

### 6. Tristan Taylor (`tristan-taylor`)
*Visual Anchor: Tall muscular build, brown spiky pompadour hair, green high school jacket, confident tough-guy posture.*

- **Pre-Duel (Intro):**
  > *Rugged, pumped-up anime intro. Tristan Taylor rolls his shoulders, cracks his knuckles, and locks his Duel Disk into place with a heavy click. He stands with chest out and a confident smirk, ready for a brawl.*
- **Damage (Light / Medium):**
  > *Tristan takes a kinetic shockwave to the chest. He grunts loudly, muscles tensing as he absorbs the hit, standing his ground firmly with a stubborn frown.*
- **Damage (Huge / Heavy Impact):**
  > *Tristan is blasted backward by a heavy explosion, sliding back on his boots with smoke trailing from his jacket. He wipes his chin with the back of his hand, scowling with intense fighting grit.*
- **Fatal LP 0 (Defeat Blast):**
  > *Heavy defeat impact. The finishing explosion sends Tristan falling back onto the canvas. He groans, lying flat for a moment looking at the sky, before propping himself up on one elbow with a bewildered frown as his LP counter hits zero.*
- **Post-Duel: Won Duel:**
  > *Rowdy, macho victory celebration. Tristan flexes his bicep and laughs heartily, striking a triumphant bodybuilder pose with thumbs up and a broad grin.*
- **Post-Duel: Lost Duel:**
  > *Good-natured defeat scene. Tristan shakes his head with a goofy grimace, crossing his arms and sighing: "Man, I didn't see that coming at all! Good game, buddy."*

---

### 7. Mai Valentine (`mai-valentine`)
*Visual Anchor: Long flowing blond hair, purple velvet cropped jacket, corset, confident glamorous smirk, lavender perfume holographic petals, Battle City Duel Disk.*

- **Pre-Duel (Intro):**
  > *Glamorous, sophisticated anime intro. Mai Valentine fans her cards like a feather fan, smelling the top card with a seductive, cunning smirk. She snaps her Duel Disk active with a cascade of purple Harpie feather petals swirling around her. Stylish, alluring camera pan.*
- **Damage (Light / Medium):**
  > *Mai gasps softly, turning her shoulder to deflect an incoming shockwave. Her long blond hair whips around her face as she narrows her violet eyes sharply.*
- **Damage (Huge / Heavy Impact):**
  > *Violent wind blast. A massive cyclone strike forces Mai back, her purple jacket rustling fiercely. She grunts, planting one high-heeled boot into the ground, glaring through flying feathers with fierce pride.*
- **Fatal LP 0 (Defeat Blast):**
  > *Dramatic defeat cutscene. An overpowering storm blast shatters Mai's defenses. She gasps in genuine shock, her cards flying into the air as she falls back onto one knee, hand resting against the stone floor, blond hair draping over her downcast face.*
- **Post-Duel: Won Duel:**
  > *Elegant, confident victory scene. Mai winks at the camera, flipping her hair over her shoulder and placing a hand on her hip with a knowing, victorious smile. Purple Harpie feathers drift around her in cinematic slow motion.*
- **Post-Duel: Lost Duel:**
  > *Proud, respectful defeat scene. Mai stands upright, brushing a blond strand from her face. She gives an impressed, wry smile and crosses her arms: "Not bad, duelist... you've definitely earned my respect."*

---

### 8. Bakura Ryou / Yami Bakura (`bakura-ryou`)
*Visual Anchor: Wild fluffy white hair, dark striped shirt, ominous glowing Millennium Ring with five gold pointers floating around his chest, sinister dark purple shadowy mist.*

- **Pre-Duel (Intro):**
  > *Dark, eerie anime intro. The Millennium Ring points twitch and gleam ominously. Dark shadow energy swirls around Bakura as his eyes glow with sadistic crimson malevolence. He chuckles darkly, drawing a card through a veil of purple Netherworld mist. "Welcome to the Shadow Realm..."*
- **Damage (Light / Medium):**
  > *Dark magic recoil. Bakura twitches as spectral damage hits him. A creepy, twisted smirk spreads across his face as if enjoying the pain, his white hair swaying in a phantom chill.*
- **Damage (Huge / Heavy Impact):**
  > *Violent mystical blast. A holy light beam hits Bakura's shadows, scorching the ground. He recoils with a demonic hiss, clutching his shoulder as dark souls wail in the swirling smoke around him.*
- **Fatal LP 0 (Defeat Blast):**
  > *Supernatural defeat cutscene. A blinding burst of sacred energy shatters the Shadow Realm barrier. Bakura shrieks in fury as the Millennium Ring sparks violently. Shadows peel away from his body, and he sinks into darkness, glaring with venomous rage as his form dissolves into the shadows.*
- **Post-Duel: Won Duel:**
  > *Menacing victory scene. Yami Bakura throws his head back with manic, chilling laughter. Ghostly spirits and purple lightning dance in the sky above him as he holds up a cursed card.*
- **Post-Duel: Lost Duel:**
  > *Frustrated dark defeat scene. Bakura scowls with pure hatred, the Millennium Ring dimming. He glares with burning crimson eyes: "This isn't over... the shadows will claim you yet!"*

---

### 9. Marik Ishtar / Yami Marik (`marik-ishtar`)
*Visual Anchor: Tanned skin, spiky platinum-blond hair, Millennium Rod in gold grip, hieroglyphic tattoos etched onto his forehead and chest, psychotic golden/purple aura.*

- **Pre-Duel (Intro):**
  > *Terrifying high-intensity intro. Yami Marik's tongue slides along his teeth with a manic, deranged grin. He brandishes the golden Millennium Rod, its blade glinting with dark solar energy. Ancient Winged Dragon of Ra flames erupt behind him as he prepares to duel for your soul.*
- **Damage (Light / Medium):**
  > *Marik grins psychotically through the shockwave, his hair wild in the hot wind, eyes bulging with sadistic excitement.*
- **Damage (Huge / Heavy Impact):**
  > *Blazing explosion. A massive energy clash blasts Marik backward. He screams in manic rage, golden lightning crackling across his skin as he digs his heels into the scorched arena platform.*
- **Fatal LP 0 (Defeat Blast):**
  > *Climactic mythological defeat. Ra's golden flames consume his side of the field in a cataclysmic flash. Marik screams in agony as the Millennium Rod slips from his fingers, his eyes rolling back as the dark personality is violently purged in a pillar of golden light.*
- **Post-Duel: Won Duel:**
  > *Terrifying psychotic victory. Marik bursts into uncontrolled, maniacal laughter, golden lightning flashing around him as he spreads his arms to embrace the torment of his fallen opponent.*
- **Post-Duel: Lost Duel:**
  > *Dramatic collapse scene. Marik drops to both knees, the dark tattoos fading from his skin. He catches his breath with wide, trembling eyes, returning to his senses in quiet shock: "The darkness... has been broken..."*

---

### 10. Maximillion Pegasus (`maximillion-pegasus`)
*Visual Anchor: Long silver-white hair covering his left eye (concealing the golden Millennium Eye), red tailored suit jacket with gold frogging, flamboyant aristocratic elegance.*

- **Pre-Duel (Intro):**
  > *Flamboyant, theatrical anime intro. Maximillion Pegasus sips from a glass of red wine, chuckling softly with sophisticated amusement. He reveals his golden Millennium Eye gleaming through his silver bangs with a mystical flash. Toon book pages flutter around him as he draws a card with effortless flair: "Are you ready for my Toon World, boy?"*
- **Damage (Light / Medium):**
  > *Pegasus gasps dramatically in theatrical dismay, placing a manicured hand against his cheek with a whimsical pout as pastel sparkles burst around him.*
- **Damage (Huge / Heavy Impact):**
  > *Real impact shock. A heavy blast shatters his Toon barrier. Pegasus stumbles backward in genuine distress, his pristine red jacket ruffled by smoke, his Millennium Eye flashing warning pulses.*
- **Fatal LP 0 (Defeat Blast):**
  > *Dramatic theatrical defeat. An overwhelming wave of card energy blows away his cartoon illusions. Pegasus drops to one knee, panting in utter shock, his Millennium Eye dimming as he clutches his chest: "Oh no... my beautiful Toons...!"*
- **Post-Duel: Won Duel:**
  > *Delighted, theatrical victory scene. Pegasus claps his hands with childish glee, laughing melodiously as cartoon stars and fireworks pop around his head in joyful celebration.*
- **Post-Duel: Lost Duel:**
  > *Gracious, aristocratic defeat scene. Pegasus stands tall, brushing off his red lapels with a gentle, sophisticated smile: "Marvelous, simply marvelous! A truly splendid performance, my dear friend."*

---

## 3. Yu-Gi-Oh! GX Characters

---

### 11. Jaden Yuki (`jaden-yuki`)
*Visual Anchor: Two-tone brown hair, Slifer Red uniform jacket, bright amber eyes, signature index-and-middle finger salute, Winged Kuriboh floating nearby.*

- **Pre-Duel (Intro):**
  > *Upbeat, energetic anime intro. Jaden Yuki grins widely, taps his deck, and delivers his signature two-finger salute to the camera: "Get your game on!" His Slifer Red jacket whips in the wind as the GX Duel Disk snaps active with glowing red blades. Pure enthusiasm and hero energy.*
- **Damage (Light / Medium):**
  > *Jaden winces as a gust of battle energy pushes him back half a step. He shakes his head with a determined smirk, rubs his nose, and gives a cheerful grin: "Whoa, that had some kick!"*
- **Damage (Huge / Heavy Impact):**
  > *Heavy impact cutscene. An Elemental HERO clash explosion blows Jaden backward. He skids across the floor on his sneakers, kicking up smoke, clutching his arm with a grimace, eyes blazing with excitement for a comeback.*
- **Fatal LP 0 (Defeat Blast):**
  > *Dramatic defeat reaction. The final attack blast sweeps over Jaden. He falls back onto the grass/floor with a loud gasp as his LP counter hits 0. He lies back looking up at the sky, then sits up laughing with genuine joy and rubbing the back of his head.*
- **Post-Duel: Won Duel:**
  > *Iconic victory pose. Jaden points two fingers forward, winks at the camera with a brilliant smile: "That's game!" Fireworks and glowing Elemental HERO fusion spirals ignite the sky behind him.*
- **Post-Duel: Lost Duel:**
  > *Warm, enthusiastic sportsmanship scene. Jaden hops to his feet, wiping his brow with his jacket sleeve, grinning ear to ear as he offers a handshake: "Man, that was the most fun duel I've had in forever! Let's go again sometime!"*

---

### 12. Zane Truesdale (`zane-truesdale`)
*Visual Anchor: Sleek navy-blue/teal hair, pristine white Obelisk Blue trenchcoat with high silver trim, icy calm expression, Cyber Dragon metallic aesthetic.*

- **Pre-Duel (Intro):**
  > *Cold, master-level anime entrance. Zane Truesdale stands perfectly composed. High-tech silver Cyber Dragon coils shimmer in holographic blue light behind him. He draws a card with flawless, surgical economy of motion, his sharp blue eyes calculating every possible victory path.*
- **Damage (Light / Medium):**
  > *Zane doesn't flinch. A wave of wind blows his white coat open, revealing his dark uniform underneath. His eyes remain steely and laser-focused, completely unshaken.*
- **Damage (Huge / Heavy Impact):**
  > *Heavy shockwave hit. A massive explosion ripples before Zane. The force pushes his trenchcoat backward and forces him to take a firm bracing step, his jaw tight with cold, dangerous resolve.*
- **Fatal LP 0 (Defeat Blast):**
  > *Shocking defeat sequence. A devastating clash overpowers Cyber End Dragon. Zane's eyes widen in brief, profound realization as the blast wave washes over him. He drops down on one knee, head lowered, his white coat settling on the floor in absolute silence.*
- **Post-Duel: Won Duel:**
  > *Flawless, stoic victory. Zane lowers his Duel Disk smoothly, turning his back with quiet, undisputed authority. Cyber Dragon energy radiates outward in deep blue laser beams.*
- **Post-Duel: Lost Duel:**
  > *Respectful, introspective defeat. Zane stands tall amidst cooling smoke, looking at his deck with profound contemplation. He closes his eyes and bows his head slightly: "You have shown me true respect through your strength."*

---

### 13. Syrus Truesdale (`syrus-truesdale`)
*Visual Anchor: Short height, bright blue hair, round glasses, yellow Ra Yellow jacket (or Slifer Red), timid yet earnest demeanor.*

- **Pre-Duel (Intro):**
  > *Nervous yet determined anime intro. Syrus Truesdale pushes up his round glasses with trembling fingers, gulps, then clenches his fists tightly. He activates his Duel Disk with a burst of mechanical Vehicroid energy: "I won't let my friends down!"*
- **Damage (Light / Medium):**
  > *Syrus squeaks in fear, shielding his face with his arms as wind knocks his glasses askew. He straightens them quickly with a nervous gulp.*
- **Damage (Huge / Heavy Impact):**
  > *Heavy blast impact. Syrus is knocked onto his backside by a fiery burst. He scrambles back, terrified but refusing to quit, tears pricking his eyes as he bravely looks back at the field.*
- **Fatal LP 0 (Defeat Blast):**
  > *Defeat cutscene. An explosion sends Syrus rolling onto the arena floor. He sits up with swirling spiral eyes, dazed, sighing in disappointment as his Duel Disk powers down.*
- **Post-Duel: Won Duel:**
  > *Ecstatic victory celebration. Syrus jumps up and down with tears of joy streaming down his face, raising both arms in disbelief: "I did it! Big brother, Jaden, I actually won!"*
- **Post-Duel: Lost Duel:**
  > *Humble defeat scene. Syrus sits on his knees, scratching his cheek with a sheepish smile: "Aw shucks... I guess I still have a lot of practicing to do!"*

---

### 14. Chazz Princeton (`chazz-princeton`)
*Visual Anchor: Black sharp-spiked hair, dramatic black trenchcoat with red interior, sharp scowl, Ojama trio spirits floating around him.*

- **Pre-Duel (Intro):**
  > *Arrogant, theatrical anime intro. Chazz Princeton throws his black coat open, points dramatically into the sky, and leads his chant: "Chazz it up!" Holographic dark dragon flames and comedy Ojama sparkles erupt around him as he sneers with absolute confidence.*
- **Damage (Light / Medium):**
  > *Chazz scoffs in disgust as a shockwave ripples his coat: "Hah! You call that an attack? That barely tickled!" He dusts off his lapel with contempt.*
- **Damage (Huge / Heavy Impact):**
  > *Violent explosion. Chazz is blasted backward, skidding on his boots and gritting his teeth in furious outrage: "What?! Impossible! How dare you lay a finger on The Chazz!"*
- **Fatal LP 0 (Defeat Blast):**
  > *Humiliating, dramatic defeat. A titanic blast knocks Chazz flat on his back. The Ojama trio wail in panic around him. Chazz pushes himself up furiously, his black coat covered in soot, clenching his teeth in utter disbelief as his LP drops to zero.*
- **Post-Duel: Won Duel:**
  > *Over-the-top victory celebration. Chazz crosses his arms, throws his head back with an arrogant laugh, basking in imaginary crowd cheers with golden spotlights illuminating him.*
- **Post-Duel: Lost Duel:**
  > *Bitter, comedy defeat scene. Chazz crosses his arms, turning his back with a haughty pout while muttering: "You just got lucky, slacker! Next time, The Chazz will crush you!"*

---

### 15. Alexis Rhodes (`alexis-rhodes`)
*Visual Anchor: Long blond hair, sleeveless Obelisk Blue coat with white trim, confident athletic beauty, Cyber Tutu/Blader aesthetic.*

- **Pre-Duel (Intro):**
  > *Graceful, athletic anime intro. Alexis Rhodes performs a fluid pirouette, drawing a card smoothly like a skilled ice skater. Her Obelisk Blue coat swirls as cold crystalline ice sparks dance across her Duel Disk. Confident, focused gaze.*
- **Damage (Light / Medium):**
  > *Alexis gasps, crossing her forearms to block a burst of wind. Her blond hair whips past her shoulders, but she immediately recovers into a balanced dueling stance.*
- **Damage (Huge / Heavy Impact):**
  > *Heavy impact wave. A blast of energy forces Alexis to slide backward, her boots carving lines in the frost on the floor. She plants her hand to steady herself, breathing hard, eyes locked onto the opponent.*
- **Fatal LP 0 (Defeat Blast):**
  > *Dramatic defeat cutscene. An overpowering blast breaks her ice defenses. Alexis stumbles backward, her Duel Disk glowing red with zero LP. She sinks gracefully to one knee, looking down with a soft, respectful sigh.*
- **Post-Duel: Won Duel:**
  > *Elegant, triumphant victory. Alexis twirls her card with a satisfied smile, resting one hand on her hip and smiling warmly at the camera with sparkling blue ice motes drifting around her.*
- **Post-Duel: Lost Duel:**
  > *Gracious sportsmanship scene. Alexis stands tall, offering a warm smile and clapping her hands together softly: "You duel with real passion and skill. That was fantastic!"*

---

### 16. Bastion Misawa (`bastion-misawa`)
*Visual Anchor: Tall sturdy build, black hair, Ra Yellow blazer, mathematical formulas and chemistry equations glowing around him.*

- **Pre-Duel (Intro):**
  > *Intellectual, tactical anime intro. Bastion Misawa adjusts his Ra Yellow collar, reviewing six numbered deck boxes inside his coat. He selects his deck with mathematical precision, drawing his opening card as glowing chalk formulas orbit his Duel Disk.*
- **Damage (Light / Medium):**
  > *Bastion calmly observes the shockwave, calculating the damage mentally with a slight nod of his head: "An expected variable."*
- **Damage (Huge / Heavy Impact):**
  > *Seismic shockwave. A massive burst blasts Bastion backward. He staggers, gripping his arm with a grimace as his equations shatter in sparks: "A calculation error?! Impossible!"*
- **Fatal LP 0 (Defeat Blast):**
  > *Scientific defeat cutscene. A devastating attack obliterates his board. Bastion falls to his knees, staring in wide-eyed shock at his zero LP counter, dropping his head in analytical defeat.*
- **Post-Duel: Won Duel:**
  > *Scholarly victory scene. Bastion pushes his glasses up, smiling with intellectual satisfaction as mathematical equations form a glowing crown above his head: "Calculated to perfection."*
- **Post-Duel: Lost Duel:**
  > *Thoughtful defeat scene. Bastion takes out a notepad and scribbles notes vigorously, nodding with deep respect: "Fascinating strategy! I must re-analyze my entire tactical model."*

---

### 17. Chumley Huffington (`chumley-huffington`)
*Visual Anchor: Heavy-set build, long brown hair, Slifer Red uniform, lazy gentle eyes, Master of Oz koala aesthetic, grilled cheese obsession.*

- **Pre-Duel (Intro):**
  > *Laid-back, endearing anime intro. Chumley Huffington stretches lazily, yawns, then pulls out a card with an unexpectedly warm and earnest smile: "This duel is gonna be totally licious!" Outback eucalyptus leaves drift around his Duel Disk.*
- **Damage (Light / Medium):**
  > *Chumley flinches with a comical whimper, his belly shaking as a gust of wind pushes him back. He rubs his head with a bewildered frown.*
- **Damage (Huge / Heavy Impact):**
  > *Heavy shockwave. A fiery blast pushes Chumley back several paces, making him wobble and catch his breath, sweating nervously.*
- **Fatal LP 0 (Defeat Blast):**
  > *Comedy defeat impact. The blast knocks Chumley onto his bottom on the grass. He blinks in surprise, his stomach growls loudly, and he sighs with a sad smile as his LP drops to zero.*
- **Post-Duel: Won Duel:**
  > *Joyful celebration scene. Chumley raises both hands with huge koala ears appearing in a golden aura above him, cheering happily with a grilled cheese sandwich in hand.*
- **Post-Duel: Lost Duel:**
  > *Comfortable defeat scene. Chumley sits contentedly on the grass, scratching his tummy with a relaxed grin: "Well, that was totally unlicious, but I'm hungry now anyway!"*

---

### 18. Aster Phoenix (`aster-phoenix`)
*Visual Anchor: Silver hair, stylish grey/white suit jacket with lavender necktie, Destiny HERO dark clocktower motif, professional prodigy aura.*

- **Pre-Duel (Intro):**
  > *Sleek pro-league anime intro. Aster Phoenix adjusts his lavender tie smoothly, flipping a card between his fingers like a coin. A dark clock tower face with spinning golden gears appears behind him as his Duel Disk glows with silver moonlight: "Destiny has already chosen your defeat."*
- **Damage (Light / Medium):**
  > *Aster flinches with a cold scoff, side-stepping the shockwave smoothly, his silver hair brushing against his sharp, confident eyes.*
- **Damage (Huge / Heavy Impact):**
  > *Destructive shockwave. A massive explosion forces Aster back, his sharp grey suit rustling fiercely. He glares through the smoke, clenching his fists in fierce indignation.*
- **Fatal LP 0 (Defeat Blast):**
  > *Dramatic destiny-shattered defeat. The final blow strikes. The clock tower behind Aster shatters in slow motion. He falls back onto one knee, breath catching in his throat, staring at his trembling hand in shock.*
- **Post-Duel: Won Duel:**
  > *Polished pro-duelist victory. Aster points his card at the sky, smiling smoothly with confident professionalism as clock gears and blue flames illuminate the stage.*
- **Post-Duel: Lost Duel:**
  > *Humbled pro defeat. Aster stands up slowly, adjusting his jacket cuff with quiet respect: "My destiny... was rewritten by your hand today. Well played."*

---

### 19. Jesse Anderson (`jesse-anderson`)
*Visual Anchor: Bright teal hair, casual southern-accent charm, green vest over white shirt, Ruby Carbuncle perched on his shoulder, rainbow prismatic crystal aura.*

- **Pre-Duel (Intro):**
  > *Vibrant, joyful anime intro. Jesse Anderson winks at the camera as Ruby Carbuncle chirps happily on his shoulder. He draws his opening card with a burst of shimmering rainbow crystal prisms dancing across the arena floor: "Let's show 'em what we've got, family!"*
- **Damage (Light / Medium):**
  > *Jesse gasps, shielding Ruby Carbuncle with his arm as wind rushes past him. He recovers quickly with an eager, sparkling grin.*
- **Damage (Huge / Heavy Impact):**
  > *Heavy crystal clash. An explosion sends rainbow gem fragments flying. Jesse slides backward, his boots skidding across the stone, gritting his teeth while keeping a protective arm around his spirit monster.*
- **Fatal LP 0 (Defeat Blast):**
  > *Dramatic prismatic defeat. The final blast shatters his Crystal Beast barriers into a dazzling rainbow shower. Jesse falls back gently onto the grass, panting with a tired but joyful smile as his LP meter chimes zero.*
- **Post-Duel: Won Duel:**
  > *Dazzling rainbow victory. Jesse throws both arms wide as a brilliant seven-color rainbow arcs across the sky, with all seven Crystal Beasts sparkling around him in celebration.*
- **Post-Duel: Lost Duel:**
  > *Warm southern sportsmanship. Jesse rubs Ruby Carbuncle's chin and laughs happily, giving a two-finger salute: "Woo-wee! That was one wild ride of a duel, partner!"*

---

### 20. Dr. Vellian Crowler (`vellian-crowler`)
*Visual Anchor: Tall eccentric figure, tall blond hair in a high ponytail, elaborate blue and gold Obelisk Blue coat with high frilled collar, makeup, Ancient Gear mechanical steam motif.*

- **Pre-Duel (Intro):**
  > *Theatrical, pompous anime intro. Dr. Crowler flaps his fan dramatically, laughing with high-pitched aristocratic snobbery: "Na-no da!" Massive brass gears and hissing steam vents erupt behind him as his Ancient Gear Duel Vest hums to life.*
- **Damage (Light / Medium):**
  > *Crowler shrieks in indignity, clutching his frilled collar as a gust of wind messes up his tall ponytail: "My hair! You uncouth little delinquent!"*
- **Damage (Huge / Heavy Impact):**
  > *Heavy mechanical explosion. An attack explodes against his Ancient Gears, sending brass bolts and steam flying. Crowler screams in terror, stumbling backward with soot covering his frills.*
- **Fatal LP 0 (Defeat Blast):**
  > *Over-the-top comedy defeat. A massive blast detonates his Ancient Gear Golem. Crowler spins like a top before tumbling flat onto his stomach with his wig-like ponytail crooked, crying out in comic agony as his LP hits 0.*
- **Post-Duel: Won Duel:**
  > *Smug, pompous celebration. Dr. Crowler fans himself triumphantly with his golden fan, laughing loudly: "Naturally! A masterclass from Duel Academy's finest professor!"*
- **Post-Duel: Lost Duel:**
  > *Dramatic tantrum defeat. Crowler sits on the floor banging his fists on the tiles, crying comic tears: "I demand a re-examination! This is an outrage, na-no da!"*

---

## 4. Tips for AI Video Generation Prompts

1. **Keep camera movement concise:** Use explicit camera terms like *`dolly-in`, `low-angle hero shot`, `smooth orbital pan`, `high-contrast rim light`*.
2. **Control character consistency:** Reference specific outfit markers (e.g. *Slifer Red jacket, white trenchcoat, Millennium Puzzle*) in every prompt iteration.
3. **Pacing:** Request *`dynamic anime motion with snappy keyframe easing`* rather than slow realistic motion, to match Yu-Gi-Oh!'s signature high-energy anime aesthetic.
4. **Post-Processing:** After generating, use `ffmpeg` or an online converter to ensure 1080p, 30fps, H.264 `.mp4` format for optimal performance inside Electron Chromium.
