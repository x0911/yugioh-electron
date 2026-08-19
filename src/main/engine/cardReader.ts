import Database, { type Database as DatabaseType, type Statement } from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { type OcgCardData } from 'ocgcore-wasm';

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

export class CardReaderService {
  private db: DatabaseType | null = null;
  private stmtGetCardData: Statement<[number], CardRecord> | null = null;
  private stmtGetCardName: Statement<[number], { name: string }> | null = null;
  private cardCache = new Map<number, OcgCardData | null>();
  private nameCache = new Map<number, string>();

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

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.stmtGetCardData = null;
      this.stmtGetCardName = null;
    }
  }
}
