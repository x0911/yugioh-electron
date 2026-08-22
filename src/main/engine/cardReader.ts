import Database, { type Database as DatabaseType, type Statement } from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { type OcgCardData } from 'ocgcore-wasm';
import {
  CARD_TYPES,
  ATTRIBUTE_NAME_MAP,
  RACE_NAME_MAP,
  type CardDetail,
} from '../../shared/types/card.js';
import { SYSTEM_STRINGS } from './stringResolver.js';

export interface CardRecord {
  id: number;
  ot: number;
  alias: number;
  setcode: number | bigint;
  type: number;
  atk: number;
  def: number;
  level: number;
  race: number | bigint;
  attribute: number;
  category: number;
  name: string;
  desc: string;
}

export interface CardTextsRecord {
  id: number;
  name: string;
  desc: string;
  str1?: string;
  str2?: string;
  str3?: string;
  str4?: string;
  str5?: string;
  str6?: string;
  str7?: string;
  str8?: string;
  str9?: string;
  str10?: string;
  str11?: string;
  str12?: string;
  str13?: string;
  str14?: string;
  str15?: string;
  str16?: string;
}

export class CardReaderService {
  private db: DatabaseType | null = null;
  private stmtGetCardData: Statement<[number], CardRecord> | null = null;
  private stmtGetCardName: Statement<[number], { name: string }> | null = null;
  private stmtGetCardTexts: Statement<[number], CardTextsRecord> | null = null;
  private stmtGetAlias: Statement<[number], { alias: number }> | null = null;
  private cardCache = new Map<number, OcgCardData | null>();
  private nameCache = new Map<number, string>();
  private textsCache = new Map<number, CardTextsRecord | null>();

  constructor(customDbPath?: string) {
    this.initDatabase(customDbPath);
  }

  private resolveCdbPath(customDbPath?: string): string {
    if (customDbPath && fs.existsSync(customDbPath)) {
      return customDbPath;
    }

    // 1. Packaged Electron runtime
    if (process.resourcesPath) {
      const packagedPath = path.join(process.resourcesPath, 'resources/cards.cdb');
      if (fs.existsSync(packagedPath)) return packagedPath;
    }

    // 2. Dev mode / cwd
    const devPath = path.resolve(process.cwd(), 'resources/cards.cdb');
    if (fs.existsSync(devPath)) return devPath;

    // 3. Fallback relative to current file
    const relativePath = path.resolve(__dirname, '../../../../resources/cards.cdb');
    if (fs.existsSync(relativePath)) return relativePath;

    throw new Error(`[CardReaderService] Cannot locate cards.cdb database at: ${devPath}`);
  }

  private initDatabase(customDbPath?: string): void {
    const dbPath = this.resolveCdbPath(customDbPath);
    this.db = new Database(dbPath, { readonly: true });

    this.stmtGetCardData = this.db.prepare<[number], CardRecord>(
      'SELECT d.*, t.name, t.desc FROM datas d JOIN texts t ON d.id = t.id WHERE d.id = ?',
    );
    this.stmtGetCardName = this.db.prepare<[number], { name: string }>(
      'SELECT name FROM texts WHERE id = ?',
    );
    this.stmtGetCardTexts = this.db.prepare<[number], CardTextsRecord>(
      'SELECT * FROM texts WHERE id = ?',
    );
    this.stmtGetAlias = this.db.prepare<[number], { alias: number }>(
      'SELECT alias FROM datas WHERE id = ?',
    );
  }

  public readCard(code: number): OcgCardData | null {
    if (this.cardCache.has(code)) {
      return this.cardCache.get(code) ?? null;
    }

    if (!this.stmtGetCardData) return null;

    try {
      const row = this.stmtGetCardData.get(code);
      if (!row) {
        this.cardCache.set(code, null);
        return null;
      }

      // Decode setcodes (64-bit integer containing up to 4 16-bit setcode identifiers)
      const setcodes: number[] = [];
      let sc = BigInt(row.setcode);
      for (let i = 0; i < 4; i++) {
        const s = Number(sc & 0xffffn);
        if (s > 0) setcodes.push(s);
        sc = sc >> 16n;
      }
      if (setcodes.length === 0) setcodes.push(0);

      const cardData: OcgCardData = {
        code: row.id,
        alias: row.alias,
        setcodes,
        type: row.type,
        level: row.level & 0xff,
        attribute: row.attribute,
        race: BigInt(row.race),
        attack: row.atk,
        defense: row.def,
        lscale: (row.level >> 24) & 0xff,
        rscale: (row.level >> 16) & 0xff,
        link_marker: 0,
      };

      this.cardCache.set(code, cardData);
      this.nameCache.set(code, row.name);
      return cardData;
    } catch (err) {
      console.error(`[CardReaderService] Error reading card code ${code}:`, err);
      return null;
    }
  }

  public getCardName(code: number): string {
    if (this.nameCache.has(code)) {
      return this.nameCache.get(code)!;
    }

    if (!this.stmtGetCardName) return `[Card #${code}]`;

    try {
      const row = this.stmtGetCardName.get(code);
      const name = row?.name ?? `[Card #${code}]`;
      this.nameCache.set(code, name);
      return name;
    } catch {
      return `[Card #${code}]`;
    }
  }

  public getCardRecord(code: number): CardRecord | null {
    if (!this.stmtGetCardData) return null;
    try {
      return this.stmtGetCardData.get(code) ?? null;
    } catch {
      return null;
    }
  }

  public getCardTextsRow(code: number): CardTextsRecord | null {
    if (this.textsCache.has(code)) {
      return this.textsCache.get(code) ?? null;
    }

    if (!this.stmtGetCardTexts) return null;

    try {
      let row = this.stmtGetCardTexts.get(code) ?? null;
      if (!row && this.stmtGetAlias) {
        const aliasRow = this.stmtGetAlias.get(code);
        if (aliasRow && aliasRow.alias > 0) {
          row = this.stmtGetCardTexts.get(aliasRow.alias) ?? null;
        }
      }
      this.textsCache.set(code, row);
      return row;
    } catch {
      return null;
    }
  }

  /**
   * Resolves a raw numeric string ID, system ID, or card string ID into human-readable text.
   * e.g. 1 -> "Normal Summon"
   * e.g. 6935513399296 -> "Tribute Summon with 1 tribute" (Fog King str1)
   * e.g. 6935513399297 -> "Summon without tribute" (Fog King str2)
   */
  public resolveString(rawVal: number | bigint | string): string {
    if (rawVal === null || rawVal === undefined) return '';

    let val: bigint;
    if (typeof rawVal === 'bigint') {
      val = rawVal;
    } else if (typeof rawVal === 'number') {
      val = BigInt(rawVal);
    } else {
      const trimmed = String(rawVal).trim();
      if (!trimmed) return '';
      try {
        val = BigInt(trimmed);
      } catch {
        return trimmed;
      }
    }

    // 1. Check system string dictionary
    const num = Number(val);
    if (SYSTEM_STRINGS[num]) {
      return SYSTEM_STRINGS[num];
    }

    // 2. Decode card string ID (64-bit ocgcore format: (code << 20) | (strIndex & 0xfffff))
    let code = Number(val >> 20n);
    let strIdx = Number(val & 0xfffffn);

    let row = this.getCardTextsRow(code);

    // Fallback for 32-bit shift ((code << 4) | (strIndex & 0xf))
    if (!row) {
      const altCode = Number(val >> 4n);
      const altIdx = Number(val & 0xfn);
      const altRow = this.getCardTextsRow(altCode);
      if (altRow) {
        code = altCode;
        strIdx = altIdx;
        row = altRow;
      }
    }

    if (row) {
      const strKey = `str${strIdx + 1}` as keyof CardTextsRecord;
      const strVal = row[strKey];
      if (typeof strVal === 'string' && strVal.trim().length > 0) {
        return strVal.trim();
      }
      return `${row.name || `Card #${code}`} (Effect #${strIdx + 1})`;
    }

    // 3. Fallback for low numeric system codes without custom entries
    if (num > 0 && num < 2048) {
      return `Option #${num}`;
    }

    return String(rawVal);
  }

  /**
   * Extracts the underlying card passcode from a 64-bit or 32-bit string ID, if valid.
   */
  public extractCardCodeFromStringId(rawVal: number | bigint | string): number | null {
    if (rawVal === null || rawVal === undefined) return null;

    let val: bigint;
    if (typeof rawVal === 'bigint') {
      val = rawVal;
    } else if (typeof rawVal === 'number') {
      val = BigInt(rawVal);
    } else {
      const trimmed = String(rawVal).trim();
      if (!trimmed) return null;
      try {
        val = BigInt(trimmed);
      } catch {
        return null;
      }
    }

    const num = Number(val);
    if (num > 0 && num < 2048) return null; // System string, not a card ID

    // Check 64-bit shift
    const code64 = Number(val >> 20n);
    if (code64 > 0 && this.getCardTextsRow(code64)) {
      return code64;
    }

    // Check 32-bit shift
    const code32 = Number(val >> 4n);
    if (code32 > 0 && this.getCardTextsRow(code32)) {
      return code32;
    }

    return null;
  }

  public getCardCount(): number {
    if (!this.db) return 0;
    try {
      const row = this.db.prepare('SELECT count(*) as count FROM datas').get() as { count: number };
      return row?.count ?? 0;
    } catch {
      return 0;
    }
  }

  private loadWhitelistManifest(): Record<string, { id: number; name: string; era?: 'DM' | 'GX' }> {
    try {
      const devPath = path.resolve(process.cwd(), 'data/card-pool-whitelist.json');
      if (fs.existsSync(devPath)) {
        return JSON.parse(fs.readFileSync(devPath, 'utf-8'));
      }
      if (process.resourcesPath) {
        const packagedPath = path.join(process.resourcesPath, 'data/card-pool-whitelist.json');
        if (fs.existsSync(packagedPath)) {
          return JSON.parse(fs.readFileSync(packagedPath, 'utf-8'));
        }
      }
    } catch (err) {
      console.warn('[CardReaderService] Could not load whitelist manifest:', err);
    }
    return {};
  }

  public mapRowToCardDetail(
    row: CardRecord,
    manifest?: Record<string, { id: number; name: string; era?: 'DM' | 'GX' }>,
  ): CardDetail {
    const isMonster = (row.type & CARD_TYPES.MONSTER) !== 0;
    const isSpell = (row.type & CARD_TYPES.SPELL) !== 0;
    const isTrap = (row.type & CARD_TYPES.TRAP) !== 0;
    const isNormal = (row.type & CARD_TYPES.NORMAL) !== 0;
    const isEffect = (row.type & CARD_TYPES.EFFECT) !== 0;
    const isFusion = (row.type & CARD_TYPES.FUSION) !== 0;
    const isRitual = (row.type & CARD_TYPES.RITUAL) !== 0;
    const isFlip = (row.type & CARD_TYPES.FLIP) !== 0;
    const isToon = (row.type & CARD_TYPES.TOON) !== 0;
    const isSpirit = (row.type & CARD_TYPES.SPIRIT) !== 0;
    const isUnion = (row.type & CARD_TYPES.UNION) !== 0;
    const isGemini = (row.type & CARD_TYPES.GEMINI) !== 0;
    const isQuickPlay = (row.type & CARD_TYPES.QUICKPLAY) !== 0;
    const isContinuous = (row.type & CARD_TYPES.CONTINUOUS) !== 0;
    const isEquip = (row.type & CARD_TYPES.EQUIP) !== 0;
    const isField = (row.type & CARD_TYPES.FIELD) !== 0;
    const isCounter = (row.type & CARD_TYPES.COUNTER) !== 0;
    const isExtraDeck = isFusion;

    const attributeName =
      ATTRIBUTE_NAME_MAP[row.attribute] || (isSpell ? 'SPELL' : isTrap ? 'TRAP' : 'UNKNOWN');
    const raceNum = Number(row.race);
    const raceName = RACE_NAME_MAP[raceNum] || (isSpell ? 'Spell' : isTrap ? 'Trap' : 'Unknown');
    const era = manifest ? (manifest[String(row.id)]?.era || 'DM') : 'DM';

    const typeLabels: string[] = [];
    if (isMonster) {
      typeLabels.push('Monster');
      if (raceName && raceName !== 'Unknown') typeLabels.push(raceName);
      if (isNormal) typeLabels.push('Normal');
      if (isEffect) typeLabels.push('Effect');
      if (isFusion) typeLabels.push('Fusion');
      if (isRitual) typeLabels.push('Ritual');
      if (isFlip) typeLabels.push('Flip');
      if (isToon) typeLabels.push('Toon');
      if (isSpirit) typeLabels.push('Spirit');
      if (isUnion) typeLabels.push('Union');
      if (isGemini) typeLabels.push('Gemini');
    } else if (isSpell) {
      typeLabels.push('Spell');
      if (isQuickPlay) typeLabels.push('Quick-Play');
      else if (isContinuous) typeLabels.push('Continuous');
      else if (isEquip) typeLabels.push('Equip');
      else if (isField) typeLabels.push('Field');
      else if (isRitual) typeLabels.push('Ritual');
      else typeLabels.push('Normal');
    } else if (isTrap) {
      typeLabels.push('Trap');
      if (isCounter) typeLabels.push('Counter');
      else if (isContinuous) typeLabels.push('Continuous');
      else typeLabels.push('Normal');
    }

    return {
      id: row.id,
      alias: row.alias,
      name: row.name,
      desc: row.desc,
      type: row.type,
      atk: row.atk,
      def: row.def,
      level: row.level & 0xff,
      race: raceNum,
      raceName,
      attribute: row.attribute,
      attributeName,
      isMonster,
      isSpell,
      isTrap,
      isFusion,
      isRitual,
      isEffect,
      isNormal,
      isFlip,
      isToon,
      isSpirit,
      isUnion,
      isGemini,
      isQuickPlay,
      isContinuous,
      isEquip,
      isField,
      isCounter,
      isExtraDeck,
      era,
      typeLabels,
    };
  }

  public getCardDetail(code: number): CardDetail | null {
    if (!code || code <= 0) return null;
    const row = this.getCardRecord(code);
    if (!row) return null;
    return this.mapRowToCardDetail(row);
  }

  public getAllCards(): CardDetail[] {
    if (!this.db) return [];

    try {
      const manifest = this.loadWhitelistManifest();
      const rows = this.db
        .prepare<[], CardRecord>(
          'SELECT d.*, t.name, t.desc FROM datas d JOIN texts t ON d.id = t.id ORDER BY t.name ASC',
        )
        .all();

      return rows.map((row) => this.mapRowToCardDetail(row, manifest));
    } catch (err) {
      console.error('[CardReaderService] Error loading all cards:', err);
      return [];
    }
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.stmtGetCardData = null;
      this.stmtGetCardName = null;
    }
  }
}
