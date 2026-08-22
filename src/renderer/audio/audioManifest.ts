// =============================================================================
// Audio Manifest: BGM Themes & Sound Effects (SFX) Catalog
// =============================================================================

export interface BgmTheme {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  genre: string;
  src: string;
  durationSec?: number;
  previewStartSec?: number;
  color: string;
  icon: string;
}

export interface SfxDefinition {
  id: string;
  name: string;
  category: 'ui' | 'duel' | 'combat' | 'lp' | 'fanfare';
  src?: string;
  synthFallback: string; // Key for procedural synthesizer
  volumeMultiplier?: number;
}

/**
 * 6 Curated Main Background Music Themes
 */
export const BGM_THEMES: BgmTheme[] = [
  {
    id: 'passionate',
    name: 'Passionate Duelist',
    subtitle: 'Classic Anime Hero Theme',
    description: 'Iconic orchestral rock rallying anthem with driving brass and legendary heroic spirit.',
    genre: 'Symphonic Rock',
    src: 'app-resource://audio/bgm/theme_passionate.mp3',
    previewStartSec: 15,
    color: '#e3c567',
    icon: '⚔️',
  },
  {
    id: 'master-duel',
    name: 'Master Duel Arena',
    subtitle: 'Modern Holographic Anthem',
    description: 'High-tempo electronic stadium synth with punchy basslines and tournament energy.',
    genre: 'Electronic Orchestral',
    src: 'app-resource://audio/bgm/theme_master_duel.mp3',
    previewStartSec: 20,
    color: '#2f80ed',
    icon: '⚡',
  },
  {
    id: 'gx-rock',
    name: 'GX Generation',
    subtitle: 'Slifer Red J-Rock Anthem',
    description: 'Energetic, upbeat electric guitars inspired by Duel Academy comeback duels.',
    genre: 'Anime J-Rock',
    src: 'app-resource://audio/bgm/theme_gx_rock.mp3',
    previewStartSec: 10,
    color: '#eb5757',
    icon: '🔥',
  },
  {
    id: 'millennium',
    name: 'Millennium Mystery',
    subtitle: 'Ancient Egyptian Mysticism',
    description: 'Exotic Middle Eastern percussion, sacred flutes, and deep tomb resonance.',
    genre: 'Ancient World',
    src: 'app-resource://audio/bgm/theme_millennium.mp3',
    previewStartSec: 5,
    color: '#d4af37',
    icon: '👁️',
  },
  {
    id: 'kaibacorp',
    name: 'KaibaCorp Cyber Matrix',
    subtitle: 'Futuristic High-Tech Synth',
    description: 'Sleek cyberpunk arpeggios and crystalline synths built for deck mastery.',
    genre: 'Cyber Synthwave',
    src: 'app-resource://audio/bgm/theme_kaibacorp.mp3',
    previewStartSec: 12,
    color: '#00d2ff',
    icon: '💻',
  },
  {
    id: 'lounge',
    name: 'Casual Duel Lounge',
    subtitle: 'Warm Lo-Fi & Chill Beats',
    description: 'Relaxed Rhodes electric piano, mellow vinyl warmth, and comforting vibes.',
    genre: 'Lo-Fi Chillhop',
    src: 'app-resource://audio/bgm/theme_lounge.mp3',
    previewStartSec: 0,
    color: '#a8ff78',
    icon: '☕',
  },
  {
    id: 'tag-force-3',
    name: 'Tag Force 3 Arena',
    subtitle: 'PSP Classic GX Duel BGM',
    description: 'Authentic high-energy arcade synthesizer duel theme from Yu-Gi-Oh! GX Tag Force 3.',
    genre: 'Arcade Rock',
    src: 'app-resource://audio/bgm/theme_tag_force_3.mp3',
    previewStartSec: 8,
    color: '#ff9900',
    icon: '🎮',
  },
];

/**
 * Complete SFX Catalog (35+ Sound Triggers)
 */
export const SFX_CATALOG: Record<string, SfxDefinition> = {
  // ── UI & Navigation ─────────────────────────────────────────────────────────
  'ui-hover': {
    id: 'ui-hover',
    name: 'Button Hover',
    category: 'ui',
    src: 'app-resource://audio/sfx/ui/hover.mp3',
    synthFallback: 'ui-hover',
    volumeMultiplier: 0.35,
  },
  'ui-click': {
    id: 'ui-click',
    name: 'Button Click',
    category: 'ui',
    src: 'app-resource://audio/sfx/ui/click.mp3',
    synthFallback: 'ui-click',
    volumeMultiplier: 0.6,
  },
  'ui-modal-open': {
    id: 'ui-modal-open',
    name: 'Modal Open',
    category: 'ui',
    src: 'app-resource://audio/sfx/ui/modal_open.mp3',
    synthFallback: 'ui-modal-open',
    volumeMultiplier: 0.5,
  },
  'ui-modal-close': {
    id: 'ui-modal-close',
    name: 'Modal Close',
    category: 'ui',
    src: 'app-resource://audio/sfx/ui/modal_close.mp3',
    synthFallback: 'ui-modal-close',
    volumeMultiplier: 0.45,
  },
  'ui-card-hover': {
    id: 'ui-card-hover',
    name: 'Card Inspect Whisper',
    category: 'ui',
    src: 'app-resource://audio/sfx/ui/card_hover.mp3',
    synthFallback: 'ui-card-hover',
    volumeMultiplier: 0.3,
  },
  'deck-drag-start': {
    id: 'deck-drag-start',
    name: 'Deck Card Pickup',
    category: 'ui',
    src: 'app-resource://audio/sfx/ui/card_pickup.mp3',
    synthFallback: 'card-slide',
    volumeMultiplier: 0.5,
  },
  'deck-card-drop': {
    id: 'deck-card-drop',
    name: 'Deck Card Placed',
    category: 'ui',
    src: 'app-resource://audio/sfx/ui/card_drop.mp3',
    synthFallback: 'card-set',
    volumeMultiplier: 0.6,
  },
  'deck-card-trash': {
    id: 'deck-card-trash',
    name: 'Deck Card Removed',
    category: 'ui',
    src: 'app-resource://audio/sfx/ui/card_trash.mp3',
    synthFallback: 'card-trash',
    volumeMultiplier: 0.55,
  },
  'deck-save': {
    id: 'deck-save',
    name: 'Deck Saved Confirmation',
    category: 'ui',
    src: 'app-resource://audio/sfx/ui/deck_saved.mp3',
    synthFallback: 'deck-save',
    volumeMultiplier: 0.7,
  },

  // ── Coin Toss & Pre-Duel ───────────────────────────────────────────────────
  'coin-choice': {
    id: 'coin-choice',
    name: 'Coin Option Selected',
    category: 'ui',
    src: 'app-resource://audio/sfx/ui/coin_select.mp3',
    synthFallback: 'coin-choice',
    volumeMultiplier: 0.6,
  },
  'coin-flip': {
    id: 'coin-flip',
    name: '3D Coin Flip Spin',
    category: 'ui',
    src: 'app-resource://audio/sfx/ui/coin_spin.mp3',
    synthFallback: 'coin-flip',
    volumeMultiplier: 0.75,
  },
  'coin-land': {
    id: 'coin-land',
    name: 'Coin Landed Impact',
    category: 'ui',
    src: 'app-resource://audio/sfx/ui/coin_land.mp3',
    synthFallback: 'coin-land',
    volumeMultiplier: 0.8,
  },
  'toss-won': {
    id: 'toss-won',
    name: 'Coin Toss Won Fanfare',
    category: 'fanfare',
    src: 'app-resource://audio/sfx/jingles/toss_win.mp3',
    synthFallback: 'toss-won',
    volumeMultiplier: 0.85,
  },
  'toss-lost': {
    id: 'toss-lost',
    name: 'Coin Toss Lost Tone',
    category: 'fanfare',
    src: 'app-resource://audio/sfx/jingles/toss_lose.mp3',
    synthFallback: 'toss-lost',
    volumeMultiplier: 0.7,
  },

  // ── Duel Flow & Turns ──────────────────────────────────────────────────────
  'duel-start': {
    id: 'duel-start',
    name: 'Duel Start Sting',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/duel_start.mp3',
    synthFallback: 'duel-start',
    volumeMultiplier: 0.9,
  },
  'turn-start': {
    id: 'turn-start',
    name: 'Turn Start Indicator',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/turn_change.mp3',
    synthFallback: 'turn-start',
    volumeMultiplier: 0.75,
  },
  'phase-change': {
    id: 'phase-change',
    name: 'Phase Change Gong',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/phase_change.mp3',
    synthFallback: 'phase-change',
    volumeMultiplier: 0.65,
  },
  'prompt-alert': {
    id: 'prompt-alert',
    name: 'Decision Prompt Alert',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/prompt.mp3',
    synthFallback: 'prompt-alert',
    volumeMultiplier: 0.7,
  },
  'target-locked': {
    id: 'target-locked',
    name: 'Target Locked Ping',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/target_lock.mp3',
    synthFallback: 'target-locked',
    volumeMultiplier: 0.6,
  },
  'deck-shuffle': {
    id: 'deck-shuffle',
    name: 'Deck Shuffle Riffle',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/shuffle.mp3',
    synthFallback: 'deck-shuffle',
    volumeMultiplier: 0.65,
  },

  // ── Card Movements & Summoning ─────────────────────────────────────────────
  'card-draw': {
    id: 'card-draw',
    name: 'Card Draw Swoosh',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/draw.mp3',
    synthFallback: 'card-draw',
    volumeMultiplier: 0.8,
  },
  'summon-normal': {
    id: 'summon-normal',
    name: 'Normal Summon Burst',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/summon_normal.mp3',
    synthFallback: 'summon-normal',
    volumeMultiplier: 0.85,
  },
  'summon-tribute': {
    id: 'summon-tribute',
    name: 'Tribute Summon Thunder',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/summon_tribute.mp3',
    synthFallback: 'summon-tribute',
    volumeMultiplier: 0.95,
  },
  'summon-special': {
    id: 'summon-special',
    name: 'Special Summon Celestial Flash',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/summon_special.mp3',
    synthFallback: 'summon-special',
    volumeMultiplier: 0.9,
  },
  'summon-flip': {
    id: 'summon-flip',
    name: 'Flip Summon Reveal',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/summon_flip.mp3',
    synthFallback: 'summon-flip',
    volumeMultiplier: 0.8,
  },
  'card-set-monster': {
    id: 'card-set-monster',
    name: 'Monster Set Thump',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/set_monster.mp3',
    synthFallback: 'card-set-monster',
    volumeMultiplier: 0.7,
  },
  'card-set-spell': {
    id: 'card-set-spell',
    name: 'Spell/Trap Set Click',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/set_spell.mp3',
    synthFallback: 'card-set-spell',
    volumeMultiplier: 0.65,
  },
  'spell-activate': {
    id: 'spell-activate',
    name: 'Spell Activation Radiance',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/spell_activate.mp3',
    synthFallback: 'spell-activate',
    volumeMultiplier: 0.85,
  },
  'trap-activate': {
    id: 'trap-activate',
    name: 'Trap Activation Electric Zap',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/trap_activate.mp3',
    synthFallback: 'trap-activate',
    volumeMultiplier: 0.85,
  },
  'field-activate': {
    id: 'field-activate',
    name: 'Field Spell Warp Aura',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/field_activate.mp3',
    synthFallback: 'field-activate',
    volumeMultiplier: 0.8,
  },
  'position-change': {
    id: 'position-change',
    name: 'Monster Position Pivot',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/position_change.mp3',
    synthFallback: 'position-change',
    volumeMultiplier: 0.65,
  },
  'chain-link': {
    id: 'chain-link',
    name: 'Chain Link Clinking',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/chain_link.mp3',
    synthFallback: 'chain-link',
    volumeMultiplier: 0.75,
  },
  'card-destroy-monster': {
    id: 'card-destroy-monster',
    name: 'Monster Destroyed Blast',
    category: 'combat',
    src: 'app-resource://audio/sfx/combat/destroy_monster.mp3',
    synthFallback: 'card-destroy-monster',
    volumeMultiplier: 0.9,
  },
  'card-destroy-spell': {
    id: 'card-destroy-spell',
    name: 'Spell/Trap Shatter',
    category: 'combat',
    src: 'app-resource://audio/sfx/combat/destroy_spell.mp3',
    synthFallback: 'card-destroy-spell',
    volumeMultiplier: 0.8,
  },
  'card-banish': {
    id: 'card-banish',
    name: 'Banish Dimensional Warp',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/banish.mp3',
    synthFallback: 'card-banish',
    volumeMultiplier: 0.75,
  },
  'card-to-gy': {
    id: 'card-to-gy',
    name: 'Card to Graveyard Vortex',
    category: 'duel',
    src: 'app-resource://audio/sfx/duel/to_gy.mp3',
    synthFallback: 'card-to-gy',
    volumeMultiplier: 0.65,
  },

  // ── Combat & Battle ────────────────────────────────────────────────────────
  'attack-declare': {
    id: 'attack-declare',
    name: 'Attack Declaration Blade',
    category: 'combat',
    src: 'app-resource://audio/sfx/combat/attack_declare.mp3',
    synthFallback: 'attack-declare',
    volumeMultiplier: 0.85,
  },
  'attack-clash': {
    id: 'attack-clash',
    name: 'Monster Battle Clash',
    category: 'combat',
    src: 'app-resource://audio/sfx/combat/attack_clash.mp3',
    synthFallback: 'attack-clash',
    volumeMultiplier: 0.95,
  },
  'attack-direct': {
    id: 'attack-direct',
    name: 'Direct Attack Thunder Impact',
    category: 'combat',
    src: 'app-resource://audio/sfx/combat/attack_direct.mp3',
    synthFallback: 'attack-direct',
    volumeMultiplier: 1.0,
  },

  // ── Life Points (LP) ───────────────────────────────────────────────────────
  'lp-tick': {
    id: 'lp-tick',
    name: 'LP Counter Numerical Tick',
    category: 'lp',
    src: 'app-resource://audio/sfx/lp/lp_tick.mp3',
    synthFallback: 'lp-tick',
    volumeMultiplier: 0.5,
  },
  'lp-damage-heavy': {
    id: 'lp-damage-heavy',
    name: 'Heavy Damage Flinch Thump',
    category: 'lp',
    src: 'app-resource://audio/sfx/lp/damage_heavy.mp3',
    synthFallback: 'lp-damage-heavy',
    volumeMultiplier: 0.85,
  },
  'lp-heal': {
    id: 'lp-heal',
    name: 'LP Recovery Healing Chime',
    category: 'lp',
    src: 'app-resource://audio/sfx/lp/heal.mp3',
    synthFallback: 'lp-heal',
    volumeMultiplier: 0.8,
  },
  'lp-low-alarm': {
    id: 'lp-low-alarm',
    name: 'Low LP Warning Alarm Tone',
    category: 'lp',
    src: 'app-resource://audio/sfx/lp/low_lp_alarm.mp3',
    synthFallback: 'lp-low-alarm',
    volumeMultiplier: 0.6,
  },

  // ── Victory & Defeat ───────────────────────────────────────────────────────
  'match-victory': {
    id: 'match-victory',
    name: 'Triumphant Match Victory Fanfare',
    category: 'fanfare',
    src: 'app-resource://audio/sfx/jingles/victory.mp3',
    synthFallback: 'match-victory',
    volumeMultiplier: 1.0,
  },
  'match-defeat': {
    id: 'match-defeat',
    name: 'Dramatic Defeat Collapse',
    category: 'fanfare',
    src: 'app-resource://audio/sfx/jingles/defeat.mp3',
    synthFallback: 'match-defeat',
    volumeMultiplier: 0.9,
  },
};
