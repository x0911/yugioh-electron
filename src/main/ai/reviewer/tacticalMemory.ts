import fs from 'node:fs';
import path from 'node:path';

export interface BlunderEntry {
  id: string;
  timestamp: string;
  turn: number;
  type: 'SUICIDAL_ATTACK' | 'CARD_ADVANTAGE_LEAK' | 'PASSIVE_PHASE_SKIP' | 'RECKLESS_SUMMON' | 'FUTILE_ATTACK' | 'WALL_SACRIFICE';
  cardName: string;
  cardCode?: number;
  description: string;
  remedy: string;
  damagePenalty?: number;
}

export interface TacticalMemoryData {
  version: number;
  totalDuelsReviewed: number;
  blunders: BlunderEntry[];
  learnedRules: string[];
  personalityDeltas: {
    aggression: number;
    defensiveness: number;
    cardAdvantageWeight: number;
    riskTolerance: number;
  };
  matchupRecords: Record<string, { wins: number; losses: number; notes: string[] }>;
}

const DEFAULT_MEMORY: TacticalMemoryData = {
  version: 1,
  totalDuelsReviewed: 0,
  blunders: [],
  learnedRules: [
    'Do not declare attack with lower ATK monster into superior defender.',
    'Do not activate Card Destruction when opponent has more cards than AI.',
    'Set weak utility monsters in defense position when facing boss monsters with >= 1900 ATK.',
    'Proactively attack face-down monsters with >= 1400 ATK beatsticks when holding board advantage.',
    'Never sacrifice indestructible stall walls (Marshmallon, Spirit Reaper) when under threat from superior monsters.',
  ],
  personalityDeltas: {
    aggression: 0,
    defensiveness: 0,
    cardAdvantageWeight: 0,
    riskTolerance: 0,
  },
  matchupRecords: {},
};

export class TacticalMemoryStore {
  private memoryPath: string;
  private memory: TacticalMemoryData;

  constructor(customPath?: string) {
    this.memoryPath =
      customPath ||
      path.join(process.cwd(), 'userData', 'ai-tactical-memory.json');
    this.memory = this.load();
  }

  public getMemory(): TacticalMemoryData {
    return this.memory;
  }

  public load(): TacticalMemoryData {
    try {
      if (fs.existsSync(this.memoryPath)) {
        const raw = fs.readFileSync(this.memoryPath, 'utf-8');
        return { ...DEFAULT_MEMORY, ...JSON.parse(raw) };
      }
    } catch {
      // Fallback to default on parse/read error
    }
    return JSON.parse(JSON.stringify(DEFAULT_MEMORY));
  }

  public save(): void {
    try {
      const dir = path.dirname(this.memoryPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2), 'utf-8');
    } catch {
      // Ignore file write errors in restricted environments
    }
  }

  public recordBlunder(blunder: Omit<BlunderEntry, 'id' | 'timestamp'>): void {
    const entry: BlunderEntry = {
      ...blunder,
      id: `blunder-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.memory.blunders.unshift(entry);
    if (this.memory.blunders.length > 50) {
      this.memory.blunders = this.memory.blunders.slice(0, 50);
    }
    if (blunder.remedy && !this.memory.learnedRules.includes(blunder.remedy)) {
      this.memory.learnedRules.push(blunder.remedy);
    }
    this.save();
  }

  public incrementDuelsReviewed(): void {
    this.memory.totalDuelsReviewed += 1;
    this.save();
  }

  public adjustPersonality(delta: Partial<TacticalMemoryData['personalityDeltas']>): void {
    if (delta.aggression !== undefined) this.memory.personalityDeltas.aggression += delta.aggression;
    if (delta.defensiveness !== undefined) this.memory.personalityDeltas.defensiveness += delta.defensiveness;
    if (delta.cardAdvantageWeight !== undefined) this.memory.personalityDeltas.cardAdvantageWeight += delta.cardAdvantageWeight;
    if (delta.riskTolerance !== undefined) this.memory.personalityDeltas.riskTolerance += delta.riskTolerance;
    this.save();
  }
}

export const tacticalMemory = new TacticalMemoryStore();
