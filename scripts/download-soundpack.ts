import fs from 'node:fs';
import path from 'node:path';

// Primary and fallback repositories for authentic Yu-Gi-Oh! simulator sounds
const REPO_BASES = [
  'https://raw.githubusercontent.com/Lahrenheit/EDOPRO-Soundpack/master/',
  'https://raw.githubusercontent.com/purerosefallen/ygopro-222DIY-sound/master/',
];

interface SoundMapping {
  remoteName: string;
  targetPaths: string[];
}

const SOUND_MAPPINGS: SoundMapping[] = [
  // Duel & Field Actions
  { remoteName: 'draw.wav', targetPaths: ['sfx/duel/draw.wav', 'sfx/duel/draw.mp3'] },
  { remoteName: 'summon.wav', targetPaths: ['sfx/duel/summon_normal.wav', 'sfx/duel/summon_normal.mp3'] },
  { remoteName: 'specialsummon.wav', targetPaths: ['sfx/duel/summon_special.wav', 'sfx/duel/summon_special.mp3', 'sfx/duel/summon_tribute.wav', 'sfx/duel/summon_tribute.mp3'] },
  { remoteName: 'flip.wav', targetPaths: ['sfx/duel/summon_flip.wav', 'sfx/duel/summon_flip.mp3'] },
  { remoteName: 'set.wav', targetPaths: ['sfx/duel/set_monster.wav', 'sfx/duel/set_monster.mp3', 'sfx/duel/set_spell.wav', 'sfx/duel/set_spell.mp3'] },
  { remoteName: 'activate.wav', targetPaths: ['sfx/duel/spell_activate.wav', 'sfx/duel/spell_activate.mp3', 'sfx/duel/field_activate.wav', 'sfx/duel/field_activate.mp3'] },
  { remoteName: 'chain.wav', targetPaths: ['sfx/duel/trap_activate.wav', 'sfx/duel/trap_activate.mp3', 'sfx/duel/chain_link.wav', 'sfx/duel/chain_link.mp3'] },
  { remoteName: 'phase.wav', targetPaths: ['sfx/duel/phase_change.wav', 'sfx/duel/phase_change.mp3'] },
  { remoteName: 'nextturn.wav', targetPaths: ['sfx/duel/turn_start.wav', 'sfx/duel/turn_start.mp3'] },
  { remoteName: 'shuffle.wav', targetPaths: ['sfx/duel/deck_shuffle.wav', 'sfx/duel/deck_shuffle.mp3'] },
  { remoteName: 'question.wav', targetPaths: ['sfx/duel/prompt_alert.wav', 'sfx/duel/prompt_alert.mp3'] },
  { remoteName: 'target.wav', targetPaths: ['sfx/duel/target_locked.wav', 'sfx/duel/target_locked.mp3'] },
  { remoteName: 'banished.wav', targetPaths: ['sfx/duel/banish.wav', 'sfx/duel/banish.mp3'] },
  { remoteName: 'carddrop.wav', targetPaths: ['sfx/duel/discard.wav', 'sfx/duel/discard.mp3', 'sfx/duel/position_change.wav', 'sfx/duel/position_change.mp3', 'sfx/ui/card_drop.wav', 'sfx/ui/card_drop.mp3'] },

  // Combat & Attacks
  { remoteName: 'attack.wav', targetPaths: ['sfx/combat/attack_declare.wav', 'sfx/combat/attack_declare.mp3'] },
  { remoteName: 'damage.wav', targetPaths: ['sfx/combat/attack_clash.wav', 'sfx/combat/attack_clash.mp3', 'sfx/lp/damage_heavy.wav', 'sfx/lp/damage_heavy.mp3'] },
  { remoteName: 'directattack.wav', targetPaths: ['sfx/combat/attack_direct.wav', 'sfx/combat/attack_direct.mp3'] },
  { remoteName: 'destroyed.wav', targetPaths: ['sfx/combat/destroy_monster.wav', 'sfx/combat/destroy_monster.mp3', 'sfx/combat/destroy_spell.wav', 'sfx/combat/destroy_spell.mp3', 'sfx/ui/card_trash.wav', 'sfx/ui/card_trash.mp3'] },

  // Coin & LP
  { remoteName: 'coinflip.wav', targetPaths: ['sfx/coin/flip.wav', 'sfx/coin/flip.mp3', 'sfx/coin/choice.wav', 'sfx/coin/choice.mp3', 'sfx/coin/land.wav', 'sfx/coin/land.mp3'] },
  { remoteName: 'gainlp.wav', targetPaths: ['sfx/lp/heal.wav', 'sfx/lp/heal.mp3'] },
  { remoteName: 'info.wav', targetPaths: ['sfx/lp/tick.wav', 'sfx/lp/tick.mp3', 'sfx/lp/low_alarm.wav', 'sfx/lp/low_alarm.mp3'] },

  // UI & Deck Editor
  { remoteName: 'button.wav', targetPaths: ['sfx/ui/hover.wav', 'sfx/ui/hover.mp3', 'sfx/ui/click.wav', 'sfx/ui/click.mp3', 'sfx/ui/modal_close.wav', 'sfx/ui/modal_close.mp3'] },
  { remoteName: 'cardpick.wav', targetPaths: ['sfx/ui/card_pickup.wav', 'sfx/ui/card_pickup.mp3', 'sfx/ui/card_hover.wav', 'sfx/ui/card_hover.mp3', 'sfx/ui/modal_open.wav', 'sfx/ui/modal_open.mp3'] },

  // Fanfares & Jingles
  { remoteName: 'duelwin.mp3', targetPaths: ['sfx/fanfare/victory.mp3', 'sfx/fanfare/toss_won.mp3', 'sfx/fanfare/duel_start.mp3', 'sfx/ui/deck_saved.mp3'] },
  { remoteName: 'duellose.mp3', targetPaths: ['sfx/fanfare/defeat.mp3', 'sfx/fanfare/toss_lost.mp3'] },

  // Background Music Themes (Authentic community BGM)
  { remoteName: 'song-advantage.mp3', targetPaths: ['bgm/theme_passionate.mp3'] },
  { remoteName: 'menu.mp3', targetPaths: ['bgm/theme_master_duel.mp3'] },
  { remoteName: 'rockpaperscissors.mp3', targetPaths: ['bgm/theme_gx_rock.mp3'] },
  { remoteName: 'song-disadvantage.mp3', targetPaths: ['bgm/theme_millennium.mp3'] },
  { remoteName: 'playerenter.wav', targetPaths: ['bgm/theme_kaibacorp.mp3'] },
  { remoteName: 'deck.mp3', targetPaths: ['bgm/theme_lounge.mp3'] },
  { remoteName: 'song-advantage.mp3', targetPaths: ['bgm/theme_tag_force_3.mp3'] },
];

async function downloadFile(remoteName: string): Promise<Buffer | null> {
  for (const baseUrl of REPO_BASES) {
    const url = baseUrl + remoteName;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
    } catch {
      // Try next mirror
    }
  }
  return null;
}

async function main() {
  console.log('=== DOWNLOADING & INSTALLING AUTHENTIC YU-GI-OH! DUEL SOUNDPACK ===\n');

  const baseAudioDir = path.resolve(process.cwd(), 'resources/audio');

  let successCount = 0;
  let failCount = 0;

  for (const mapping of SOUND_MAPPINGS) {
    console.log(`▶ Downloading [${mapping.remoteName}]...`);
    const buffer = await downloadFile(mapping.remoteName);

    if (buffer) {
      for (const targetRelPath of mapping.targetPaths) {
        const targetFullPath = path.join(baseAudioDir, targetRelPath);
        fs.mkdirSync(path.dirname(targetFullPath), { recursive: true });
        fs.writeFileSync(targetFullPath, buffer);
        console.log(`   ↳ Saved to: ${targetRelPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
      }
      successCount++;
    } else {
      console.warn(`   ⚠️ Failed to download ${mapping.remoteName} from remote mirrors.`);
      failCount++;
    }
  }

  console.log(`\n================================================================`);
  console.log(`🎉 SOUNDPACK INSTALLATION FINISHED! (${successCount} downloaded, ${failCount} failed)`);
  console.log(`================================================================\n`);
}

main().catch((err) => {
  console.error('Download soundpack error:', err);
  process.exit(1);
});
