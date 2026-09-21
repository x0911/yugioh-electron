# 01: Lethal Calculation & Combat Mastery Engine

## 1. Tactical Overview

Combat in Yu-Gi-Oh! is not merely about attacking with the highest ATK monster. An elite duelist calculates exact lethal margins, navigates hidden backrow threats (Mirror Force, Dimensional Prison), respects hand-activated battle traps (Gorz the Emissary of Darkness, Tragoedia, Honest, Kalut), and sequences attacks to maximize damage while minimizing blowback.

---

## 2. On-Board Lethal & Combat Thresholds

### 2.1 Direct Lethal Calculation
When the opponent controls **0 monsters**:
$$\text{Total Direct Damage} = \sum_{m \in \text{Ready Attackers}} \text{ATK}(m)$$

- If $\text{Total Direct Damage} \ge \text{Opponent LP}$:
  - The board state is **DIRECT LETHAL**.
  - **Macro Policy**: Prohibit non-essential Main Phase 1 card activations (especially symmetrical hand disruption or extra card plays that open response windows).
  - Elevate `TO_BP` score to `+25000` (`[LETHAL RUSH]`).

### 2.2 Combat Clearing Lethal Calculation
When the opponent controls $K \ge 1$ monsters:
1. Sort AI ready attackers descending by ATK: $[A_1, A_2, \dots, A_n]$.
2. Sort Opponent monsters ascending by defensive stat (ATK or DEF depending on position): $[D_1, D_2, \dots, D_k]$.
3. Match top AI attackers against opponent defenders to calculate overkill damage and remaining attackers:
$$\text{Projected Battle Damage} = \sum_{\text{Overcoming Clashes}} (A_{\text{clash}} - D_{\text{clash}}) + \sum_{\text{Uncontested Attackers}} A_{\text{uncontested}}$$
4. If $\text{Projected Battle Damage} \ge \text{Opponent LP}$:
   - Trigger **COMBAT LETHAL RUSH**. Transition immediately to Battle Phase.

---

## 3. Attack Sequencing Optimization

### 3.1 Baiting Backrow Removal (Mirror Force / Dimensional Prison)
When the opponent has $\ge 1$ unknown face-down Spell/Trap card:
- **Rule**: Never declare the first direct attack with the AI's primary Boss Monster (e.g., *Judgment Dragon*, *Dark Armed Dragon*, *Stardust Dragon*).
- **Sequencing**:
  1. Attack first with a **Secondary / Medium Attacker** (e.g. 1500–2100 ATK).
  2. If the opponent activates *Mirror Force*, *Dimensional Prison*, or *Sakuretsu Armor*, only the probe attacker is sacrificed, or the trap is baited before the boss swings.
  3. If no trap responds, declare attack with the Boss Monster.
- **Exception**: If total damage equals exact direct lethal and the AI controls a negate (e.g. *Solemn Judgment*, *Stardust Dragon*, *My Body as a Shield*), attack aggressively.

### 3.2 The Gorz & Tragoedia Dilemma
When attacking directly against an opponent with **empty field but $\ge 1$ card in hand**:
- *Gorz the Emissary of Darkness* (44330098) triggers when taking damage from a card the opponent controls while controlling no cards, summoning Gorz (2700 ATK) plus an Emissary of Darkness Token with ATK/DEF equal to the battle damage taken.
- *Tragoedia* (98777036) triggers when taking battle damage, summoning itself with 600 ATK per card in hand.
- **Counter-Tactics**:
  - **Attack with the Lowest ATK Monster First**:
    - If the opponent drops Gorz on the first attack, the Token spawned has low ATK (equal to the weak monster's damage).
    - The remaining high-ATK monsters can then destroy Gorz or the Token during the same Battle Phase.
    - If the AI attacked with a 3000 ATK boss first, Gorz spawns a 3000/3000 Token, stonewalling all subsequent attacks!

---

## 4. Damage Step Combat Tricks & Hand Traps

The Damage Step represents the most restricted timing window in Yu-Gi-Oh! (only Counter Traps, ATK/DEF modifiers, and mandatory triggers can activate).

### 4.1 Premier Damage Step Hand Traps in `cards.cdb`
- **Honest (37742478)**: During damage calculation, sends itself from hand to GY to boost a LIGHT monster's ATK by the opposing monster's ATK.
  - *AI Behavior*: If controlling a face-up LIGHT monster battling a stronger monster, hold Honest until Damage Step, then activate for a guaranteed blowout.
- **Blackwing - Kalut the Moon Shadow (85215458)**: Discards from hand to boost a Blackwing by +1400 ATK.
- **Necro Gardna (4906301)**: Banishes from GY to negate an incoming attack.

### 4.2 Quick-Play Spell Modifiers
- **Shrink (55713623)**: Halves the original ATK of a face-up monster until End Phase.
- **Rush Recklessly (70046172)**: Targets a face-up monster for +700 ATK until End Phase.
- **Book of Moon (14087893)**: Flips the attacking or defending monster face-down.
  - *AI Policy*: Retain Quick-Play combat spells in hand during Main Phase 1 so they can be cast directly from hand during the Battle Step / Damage Step!

---

## 5. Battle Position Discipline

1. **Flip Monsters (Cyber Jar, Morphing Jar, Ryko, Man-Eater Bug)**:
   - **NEVER** Normal Summon Flip monsters in attack position. Always set face-down in Defense.
2. **Defensive Walls (DEF > ATK + 400)**:
   - Monsters like *Giant Soldier of Stone* (1300/2000), *Spirit Reaper* (0/200), *Marshmallon* (300/500) must remain face-down or in Defense Position to absorb attacks.
3. **Attack Position Preservation**:
   - Never switch a monster with $\ge 1400$ ATK to Defense Position unless opponent controls a superior face-up monster that can destroy it on the upcoming turn.
