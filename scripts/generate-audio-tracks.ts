import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 44100;

/**
 * Creates a valid RIFF WAVE buffer from Float32 mono/stereo audio samples.
 */
function createWavBuffer(samples: Float32Array, sampleRate = SAMPLE_RATE, channels = 1): Buffer {
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF Chunk
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // "fmt " Subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // "data" Subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write 16-bit PCM samples with soft clipping
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    // Soft clip
    let s = samples[i];
    s = Math.max(-1, Math.min(1, s));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7fff;
    buffer.writeInt16LE(Math.round(intSample), offset);
    offset += 2;
  }

  return buffer;
}

// -----------------------------------------------------------------------------
// Sound Synthesis Primitives
// -----------------------------------------------------------------------------

function sine(freq: number, t: number, phase = 0): number {
  return Math.sin(2 * Math.PI * freq * t + phase);
}

function saw(freq: number, t: number): number {
  const p = (freq * t) % 1;
  return 2 * p - 1;
}

function square(freq: number, t: number): number {
  return Math.sin(2 * Math.PI * freq * t) >= 0 ? 1 : -1;
}

function triangle(freq: number, t: number): number {
  return 2 * Math.abs(2 * ((freq * t) % 1) - 1) - 1;
}

function noise(): number {
  return Math.random() * 2 - 1;
}

function adsr(t: number, totalDur: number, a = 0.05, d = 0.1, s = 0.7, r = 0.2): number {
  if (t < a) return t / a;
  if (t < a + d) return 1.0 - (1.0 - s) * ((t - a) / d);
  if (t < totalDur - r) return s;
  if (t < totalDur) return s * (1.0 - (t - (totalDur - r)) / r);
  return 0;
}

// Note frequencies (Hz)
const NOTE: Record<string, number> = {
  C2: 65.41, D2: 73.42, Eb2: 77.78, E2: 82.41, F2: 87.31, G2: 98.0, Ab2: 103.83, A2: 110.0, Bb2: 116.54, B2: 123.47,
  C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, G3: 196.0, Ab3: 207.65, A3: 220.0, Bb3: 233.08, B3: 246.94,
  C4: 261.63, Cs4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.0, Ab4: 415.3, A4: 440.0, Bb4: 466.16, B4: 493.88,
  C5: 523.25, Cs5: 554.37, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, G5: 783.99, Ab5: 830.61, A5: 880.0, Bb5: 932.33, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98,
};

// -----------------------------------------------------------------------------
// BGM Themes Generator
// -----------------------------------------------------------------------------

function generatePassionateDuelist(durationSec = 16): Float32Array {
  const numSamples = Math.floor(SAMPLE_RATE * durationSec);
  const out = new Float32Array(numSamples);
  const bpm = 136;
  const beatDur = 60 / bpm;

  // Chord progression: Cm (4 beats) -> Ab (4 beats) -> Fm (4 beats) -> G (4 beats)
  const chords = [
    { bass: NOTE.C2, chord: [NOTE.C3, NOTE.Eb3, NOTE.G3, NOTE.C4], dur: beatDur * 4 },
    { bass: NOTE.Ab2, chord: [NOTE.Ab2, NOTE.C3, NOTE.Eb3, NOTE.Ab3], dur: beatDur * 4 },
    { bass: NOTE.F2, chord: [NOTE.F2, NOTE.Ab2, NOTE.C3, NOTE.F3], dur: beatDur * 4 },
    { bass: NOTE.G2, chord: [NOTE.G2, NOTE.B2, NOTE.D3, NOTE.G3], dur: beatDur * 4 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const loopT = t % (beatDur * 16);
    const chordIdx = Math.floor(loopT / (beatDur * 4)) % 4;
    const curChord = chords[chordIdx];
    const beatInBar = (loopT / beatDur) % 4;

    // 1. Driving Bassline (8th notes pulse)
    const eighthNote = (loopT / (beatDur / 2)) % 1;
    const bassEnv = Math.exp(-eighthNote * 4.5);
    const bass = (saw(curChord.bass, t) * 0.4 + sine(curChord.bass * 2, t) * 0.3) * bassEnv;

    // 2. Brass Power Chords
    let chordSum = 0;
    for (const freq of curChord.chord) {
      chordSum += (saw(freq, t) * 0.5 + triangle(freq, t) * 0.5) * 0.08;
    }

    // 3. Heroic Lead Melody
    let lead = 0;
    const leadNotes = [NOTE.C4, NOTE.Eb4, NOTE.G4, NOTE.C5, NOTE.Bb4, NOTE.Ab4, NOTE.G4, NOTE.D4];
    const leadIdx = Math.floor(loopT / (beatDur * 2)) % leadNotes.length;
    const noteInStep = (loopT / (beatDur * 2)) % 1;
    const leadEnv = adsr(noteInStep, 1.0, 0.05, 0.2, 0.6, 0.2);
    lead = (saw(leadNotes[leadIdx], t) * 0.6 + square(leadNotes[leadIdx] * 0.5, t) * 0.2) * leadEnv * 0.22;

    // 4. Drums (Kick on 1 & 3, Snare on 2 & 4, Hi-hat on 8ths)
    let kick = 0;
    if (beatInBar < 0.2 || (beatInBar >= 2.0 && beatInBar < 2.2)) {
      const kt = (beatInBar % 2) * beatDur;
      kick = sine(Math.max(40, 150 - kt * 600), kt) * Math.exp(-kt * 18) * 0.45;
    }
    let snare = 0;
    if ((beatInBar >= 1.0 && beatInBar < 1.25) || (beatInBar >= 3.0 && beatInBar < 3.25)) {
      const st = ((beatInBar - 1) % 2) * beatDur;
      snare = (noise() * 0.6 + sine(200, st) * 0.4) * Math.exp(-st * 16) * 0.35;
    }
    const hat = noise() * Math.exp(-eighthNote * 25) * 0.08;

    out[i] = (bass * 0.35 + chordSum * 0.3 + lead * 0.35 + kick + snare + hat) * 0.85;
  }
  return out;
}

function generateMasterDuel(durationSec = 16): Float32Array {
  const numSamples = Math.floor(SAMPLE_RATE * durationSec);
  const out = new Float32Array(numSamples);
  const bpm = 140;
  const beatDur = 60 / bpm;
  const sixteenth = beatDur / 4;

  const bassNotes = [NOTE.D2, NOTE.D2, NOTE.F2, NOTE.G2, NOTE.Bb2, NOTE.A2, NOTE.G2, NOTE.E2];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const loopT = t % (beatDur * 16);
    const step = Math.floor(loopT / sixteenth) % 64;
    const stepT = (loopT % sixteenth) / sixteenth;

    // 1. Electronic 16th-note Arpeggio
    const arpNotes = [NOTE.D3, NOTE.F3, NOTE.A3, NOTE.D4, NOTE.F4, NOTE.A4, NOTE.D5, NOTE.A4];
    const curArp = arpNotes[step % arpNotes.length];
    const arpEnv = Math.exp(-stepT * 6.0);
    const arp = (saw(curArp, t) * 0.4 + square(curArp * 2, t) * 0.2) * arpEnv * 0.2;

    // 2. Heavy Synth Bass (8th-note drive)
    const curBass = bassNotes[Math.floor(step / 8) % bassNotes.length];
    const bassEnv = Math.exp(-(stepT % 0.5) * 4.0);
    const bass = (saw(curBass, t) * 0.5 + sine(curBass, t) * 0.5) * bassEnv * 0.35;

    // 3. Four-on-the-floor Kick
    const kickT = (loopT % beatDur) / beatDur;
    const kick = sine(Math.max(35, 160 - kickT * 700), kickT) * Math.exp(-kickT * 15) * 0.5;

    // 4. Off-beat electronic clap/hi-hat
    const isClap = (Math.floor(loopT / beatDur) % 2 === 1) && kickT < 0.2;
    const clap = isClap ? noise() * Math.exp(-kickT * 14) * 0.3 : 0;
    const hat = (step % 2 === 1) ? noise() * Math.exp(-stepT * 20) * 0.1 : 0;

    out[i] = (arp + bass + kick + clap + hat) * 0.8;
  }
  return out;
}

function generateGxRock(durationSec = 16): Float32Array {
  const numSamples = Math.floor(SAMPLE_RATE * durationSec);
  const out = new Float32Array(numSamples);
  const bpm = 148;
  const beatDur = 60 / bpm;

  const chords = [
    { root: NOTE.E2, third: NOTE.G2, fifth: NOTE.B2 },
    { root: NOTE.C2, third: NOTE.E2, fifth: NOTE.G2 },
    { root: NOTE.G2, third: NOTE.B2, fifth: NOTE.D3 },
    { root: NOTE.D2, third: NOTE.Fs4 * 0.5, fifth: NOTE.A2 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const loopT = t % (beatDur * 16);
    const chordIdx = Math.floor(loopT / (beatDur * 4)) % 4;
    const curChord = chords[chordIdx];
    const beatInBar = (loopT / beatDur) % 4;

    // Fast Power Chord Strumming (16th notes)
    const strumT = (loopT / (beatDur / 4)) % 1;
    const guitarEnv = Math.exp(-strumT * 5.0);
    const guitar = (saw(curChord.root, t) * 0.4 + saw(curChord.fifth, t) * 0.4 + saw(curChord.root * 2, t) * 0.2) * guitarEnv * 0.35;

    // Melodic J-Rock Lead
    const leadNotes = [NOTE.E4, NOTE.G4, NOTE.A4, NOTE.B4, NOTE.D5, NOTE.B4, NOTE.A4, NOTE.G4];
    const leadIdx = Math.floor(loopT / (beatDur * 2)) % leadNotes.length;
    const lead = (saw(leadNotes[leadIdx], t) * 0.6 + triangle(leadNotes[leadIdx], t) * 0.4) * 0.18;

    // Rock Drums
    let kick = 0;
    if (beatInBar < 0.25 || (beatInBar >= 1.5 && beatInBar < 1.75)) {
      const kt = (beatInBar % 1) * beatDur;
      kick = sine(Math.max(40, 140 - kt * 500), kt) * Math.exp(-kt * 16) * 0.45;
    }
    const snare = (beatInBar >= 1.0 && beatInBar < 1.25) || (beatInBar >= 3.0 && beatInBar < 3.25)
      ? (noise() * 0.7 + sine(180, t) * 0.3) * Math.exp(-((beatInBar % 1) * beatDur) * 15) * 0.4
      : 0;

    out[i] = (guitar + lead + kick + snare) * 0.8;
  }
  return out;
}

function generateMillennium(durationSec = 16): Float32Array {
  const numSamples = Math.floor(SAMPLE_RATE * durationSec);
  const out = new Float32Array(numSamples);
  const bpm = 100;
  const beatDur = 60 / bpm;

  // Ancient Egyptian Phrygian Dominant in A: A, Bb, C#, D, E, F, G
  const scale = [NOTE.A3, NOTE.Bb3, NOTE.Cs4, NOTE.D4, NOTE.E4, NOTE.F4, NOTE.G4, NOTE.A4];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const loopT = t % (beatDur * 16);

    // 1. Tomb Drone (Deep A1 + E2)
    const drone = (sine(NOTE.A2 * 0.5, t) * 0.4 + sine(NOTE.E2, t) * 0.3 + triangle(NOTE.A2, t) * 0.2) * 0.35;

    // 2. Exotic Arabic Modal Flute
    const fluteIdx = Math.floor(loopT / (beatDur * 2)) % scale.length;
    const fluteNote = scale[fluteIdx];
    const vibrato = 1 + 0.015 * Math.sin(2 * Math.PI * 5.5 * t);
    const flute = (sine(fluteNote * vibrato, t) * 0.7 + sine(fluteNote * 2 * vibrato, t) * 0.2 + noise() * 0.05) * 0.25;

    // 3. Middle Eastern Tomb Percussion (Darbuka rhythm: Doum-Tek-Tek-Doum-Tek)
    const stepInBar = (loopT / (beatDur / 2)) % 8;
    let darbuka = 0;
    if (stepInBar < 0.3 || stepInBar === 4) {
      // Doum (deep bass)
      darbuka = sine(70, t) * Math.exp(-(stepInBar % 1) * 8) * 0.5;
    } else if (stepInBar === 2 || stepInBar === 3 || stepInBar === 6 || stepInBar === 7) {
      // Tek (crisp high snap)
      darbuka = (noise() * 0.6 + sine(450, t) * 0.4) * Math.exp(-(stepInBar % 1) * 16) * 0.3;
    }

    out[i] = (drone + flute + darbuka) * 0.85;
  }
  return out;
}

function generateKaibaCorp(durationSec = 16): Float32Array {
  const numSamples = Math.floor(SAMPLE_RATE * durationSec);
  const out = new Float32Array(numSamples);
  const bpm = 132;
  const beatDur = 60 / bpm;
  const sixteenth = beatDur / 4;

  const arpNotes = [NOTE.F3, NOTE.Ab3, NOTE.C4, NOTE.Eb4, NOTE.F4, NOTE.Ab4, NOTE.C5, NOTE.Eb5];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const loopT = t % (beatDur * 16);
    const step = Math.floor(loopT / sixteenth) % 64;
    const stepT = (loopT % sixteenth) / sixteenth;

    // 1. Crystal Cyber Arpeggios
    const curNote = arpNotes[step % arpNotes.length];
    const arp = (triangle(curNote, t) * 0.5 + sine(curNote * 2, t) * 0.3) * Math.exp(-stepT * 4.5) * 0.25;

    // 2. Cyber Synthwave Bass
    const bassFreq = (step < 32) ? NOTE.F2 : NOTE.Db2;
    const bass = (saw(bassFreq, t) * 0.5 + sine(bassFreq, t) * 0.5) * Math.exp(-(stepT % 0.5) * 3.5) * 0.35;

    // 3. Cyber Matrix Pad
    const pad = (saw(NOTE.F3, t) * 0.15 + saw(NOTE.C4, t) * 0.15 + sine(NOTE.Ab3, t) * 0.2) * 0.2;

    // 4. Punchy Synth Beat
    const kick = (step % 4 === 0) ? sine(Math.max(38, 150 - stepT * 600), stepT) * Math.exp(-stepT * 12) * 0.45 : 0;
    const snare = (step % 8 === 4) ? noise() * Math.exp(-stepT * 14) * 0.3 : 0;

    out[i] = (arp + bass + pad + kick + snare) * 0.85;
  }
  return out;
}

function generateLounge(durationSec = 16): Float32Array {
  const numSamples = Math.floor(SAMPLE_RATE * durationSec);
  const out = new Float32Array(numSamples);
  const bpm = 88;
  const beatDur = 60 / bpm;

  const chords = [
    [NOTE.F3, NOTE.A3, NOTE.C4, NOTE.E4],   // Fmaj7
    [NOTE.A3, NOTE.C4, NOTE.E4, NOTE.G4],   // Am7
    [NOTE.D3, NOTE.F3, NOTE.A3, NOTE.C4],   // Dm7
    [NOTE.G3, NOTE.Bb3, NOTE.D4, NOTE.F4],  // Gm7
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const loopT = t % (beatDur * 16);
    const bar = Math.floor(loopT / (beatDur * 4)) % 4;
    const curChord = chords[bar];
    const beatInBar = (loopT / beatDur) % 4;

    // 1. Warm Rhodes Electric Piano
    let keys = 0;
    for (const freq of curChord) {
      keys += (sine(freq, t) * 0.5 + triangle(freq * 2, t) * 0.2 + sine(freq * 0.5, t) * 0.3) * 0.08;
    }
    const chordAttack = Math.exp(-(beatInBar % 2) * 2.0);
    keys *= chordAttack;

    // 2. Mellow Walking Bass
    const root = curChord[0] * 0.5;
    const bass = (sine(root, t) * 0.6 + triangle(root, t) * 0.3) * Math.exp(-(beatInBar % 1) * 2.5) * 0.35;

    // 3. Relaxed Lo-Fi Drum Beat
    let kick = 0;
    if (beatInBar < 0.3 || (beatInBar >= 2.5 && beatInBar < 2.8)) {
      const kt = (beatInBar % 1) * beatDur;
      kick = sine(Math.max(45, 110 - kt * 300), kt) * Math.exp(-kt * 10) * 0.35;
    }
    const rimshot = (beatInBar >= 1.0 && beatInBar < 1.2) || (beatInBar >= 3.0 && beatInBar < 3.2)
      ? (noise() * 0.4 + sine(350, t) * 0.6) * Math.exp(-((beatInBar % 1) * beatDur) * 20) * 0.25
      : 0;
    const vinyl = noise() * 0.015;

    out[i] = (keys + bass + kick + rimshot + vinyl) * 0.85;
  }
  return out;
}

// -----------------------------------------------------------------------------
// SFX Single Sounds Generator
// -----------------------------------------------------------------------------

function generateSfxSample(sfxType: string): Float32Array {
  const dur = 0.5;
  const numSamples = Math.floor(SAMPLE_RATE * dur);
  const out = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    switch (sfxType) {
      case 'hover':
        out[i] = sine(880 + t * 4000, t) * Math.exp(-t * 30) * 0.25;
        break;
      case 'click':
        out[i] = triangle(600 - t * 4000, t) * Math.exp(-t * 40) * 0.4;
        break;
      case 'draw':
        out[i] = (noise() * 0.4 + saw(400 + t * 1200, t) * 0.6) * Math.exp(-t * 15) * 0.35;
        break;
      case 'summon':
        out[i] = (triangle(440 + t * 600, t) * 0.5 + sine(880, t) * 0.3 + noise() * 0.2) * Math.exp(-t * 8) * 0.45;
        break;
      case 'spell':
        out[i] = (sine(1046.5, t) * 0.4 + sine(1318.5, t) * 0.3 + sine(1567.9, t) * 0.3) * Math.exp(-t * 6) * 0.4;
        break;
      case 'attack':
        out[i] = saw(300 + t * 3000, t) * Math.exp(-t * 12) * 0.45;
        break;
      case 'destroy':
        out[i] = (noise() * 0.7 + sine(100, t) * 0.3) * Math.exp(-t * 8) * 0.5;
        break;
      case 'tick':
        out[i] = square(1500, t) * Math.exp(-t * 80) * 0.25;
        break;
      case 'fanfare':
        const note = t < 0.1 ? 523.25 : t < 0.2 ? 659.25 : t < 0.3 ? 783.99 : 1046.5;
        out[i] = triangle(note, t) * Math.exp(-(t % 0.1) * 10) * 0.4;
        break;
      default:
        out[i] = sine(440, t) * Math.exp(-t * 15) * 0.3;
        break;
    }
  }
  return out;
}

// -----------------------------------------------------------------------------
// Main Generator Execution
// -----------------------------------------------------------------------------

async function main() {
  console.log('=== GENERATING YU-GI-OH! BGM & SFX AUDIO TRACKS ===\n');

  const bgmDir = path.resolve(process.cwd(), 'resources/audio/bgm');
  const sfxDir = path.resolve(process.cwd(), 'resources/audio/sfx');

  fs.mkdirSync(bgmDir, { recursive: true });
  fs.mkdirSync(path.join(sfxDir, 'ui'), { recursive: true });
  fs.mkdirSync(path.join(sfxDir, 'duel'), { recursive: true });
  fs.mkdirSync(path.join(sfxDir, 'combat'), { recursive: true });
  fs.mkdirSync(path.join(sfxDir, 'coin'), { recursive: true });
  fs.mkdirSync(path.join(sfxDir, 'fanfare'), { recursive: true });
  fs.mkdirSync(path.join(sfxDir, 'lp'), { recursive: true });

  // 1. Generate 6 BGM Tracks
  const bgmGenerators: Record<string, () => Float32Array> = {
    'theme_passionate.mp3': generatePassionateDuelist,
    'theme_master_duel.mp3': generateMasterDuel,
    'theme_gx_rock.mp3': generateGxRock,
    'theme_millennium.mp3': generateMillennium,
    'theme_kaibacorp.mp3': generateKaibaCorp,
    'theme_lounge.mp3': generateLounge,
  };

  console.log('▶ Generating 6 Main BGM Theme Tracks:');
  for (const [filename, genFn] of Object.entries(bgmGenerators)) {
    const samples = genFn();
    const wavBuf = createWavBuffer(samples);
    const targetFile = path.join(bgmDir, filename);
    fs.writeFileSync(targetFile, wavBuf);
    console.log(`  ✓ Written ${filename} (${(wavBuf.length / 1024).toFixed(1)} KB)`);
  }

  // 2. Generate SFX Audio Files
  console.log('\n▶ Generating SFX Catalog Audio Files:');
  const sfxList: { path: string; type: string }[] = [
    { path: 'ui/hover.mp3', type: 'hover' },
    { path: 'ui/click.mp3', type: 'click' },
    { path: 'ui/modal_open.mp3', type: 'spell' },
    { path: 'ui/modal_close.mp3', type: 'click' },
    { path: 'ui/card_hover.mp3', type: 'hover' },
    { path: 'ui/card_pickup.mp3', type: 'draw' },
    { path: 'ui/card_drop.mp3', type: 'click' },
    { path: 'ui/card_trash.mp3', type: 'destroy' },
    { path: 'ui/deck_saved.mp3', type: 'fanfare' },
    { path: 'coin/choice.mp3', type: 'click' },
    { path: 'coin/flip.mp3', type: 'hover' },
    { path: 'coin/land.mp3', type: 'click' },
    { path: 'fanfare/toss_won.mp3', type: 'fanfare' },
    { path: 'fanfare/toss_lost.mp3', type: 'destroy' },
    { path: 'fanfare/duel_start.mp3', type: 'fanfare' },
    { path: 'fanfare/victory.mp3', type: 'fanfare' },
    { path: 'fanfare/defeat.mp3', type: 'destroy' },
    { path: 'duel/draw.mp3', type: 'draw' },
    { path: 'duel/summon_normal.mp3', type: 'summon' },
    { path: 'duel/summon_special.mp3', type: 'summon' },
    { path: 'duel/summon_flip.mp3', type: 'summon' },
    { path: 'duel/summon_tribute.mp3', type: 'summon' },
    { path: 'duel/set_monster.mp3', type: 'click' },
    { path: 'duel/set_spell.mp3', type: 'click' },
    { path: 'duel/spell_activate.mp3', type: 'spell' },
    { path: 'duel/trap_activate.mp3', type: 'spell' },
    { path: 'duel/field_activate.mp3', type: 'spell' },
    { path: 'duel/chain_link.mp3', type: 'spell' },
    { path: 'duel/position_change.mp3', type: 'click' },
    { path: 'duel/phase_change.mp3', type: 'hover' },
    { path: 'duel/turn_start.mp3', type: 'fanfare' },
    { path: 'duel/deck_shuffle.mp3', type: 'draw' },
    { path: 'duel/prompt_alert.mp3', type: 'spell' },
    { path: 'duel/target_locked.mp3', type: 'click' },
    { path: 'duel/discard.mp3', type: 'draw' },
    { path: 'duel/banish.mp3', type: 'destroy' },
    { path: 'combat/attack_declare.mp3', type: 'attack' },
    { path: 'combat/attack_clash.mp3', type: 'destroy' },
    { path: 'combat/attack_direct.mp3', type: 'destroy' },
    { path: 'combat/destroy_monster.mp3', type: 'destroy' },
    { path: 'combat/destroy_spell.mp3', type: 'destroy' },
    { path: 'lp/tick.mp3', type: 'tick' },
    { path: 'lp/damage_heavy.mp3', type: 'destroy' },
    { path: 'lp/heal.mp3', type: 'spell' },
    { path: 'lp/low_alarm.mp3', type: 'destroy' },
  ];

  for (const item of sfxList) {
    const samples = generateSfxSample(item.type);
    const wavBuf = createWavBuffer(samples);
    const targetFile = path.join(sfxDir, item.path);
    fs.writeFileSync(targetFile, wavBuf);
  }
  console.log(`  ✓ Generated all ${sfxList.length} SFX audio files into resources/audio/sfx/`);

  console.log('\n🎉 ALL BGM & SFX TRACKS SUCCESSFULLY GENERATED!\n');
}

main().catch((err) => {
  console.error('Audio generator error:', err);
  process.exit(1);
});
