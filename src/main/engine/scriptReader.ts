import path from 'node:path';
import fs from 'node:fs';
import Database, { type Database as DatabaseType, type Statement } from 'better-sqlite3';

export class ScriptReaderService {
  private scriptsDir: string;
  private officialScriptsDir: string;
  private scriptCache = new Map<string, string | null>();
  private db: DatabaseType | null = null;
  private stmtGetAlias: Statement<[number], { alias: number }> | null = null;

  constructor(customScriptsDir?: string, customDbPath?: string) {
    this.scriptsDir = this.resolveScriptsDir(customScriptsDir);
    this.officialScriptsDir = path.join(this.scriptsDir, 'official');
    this.initDatabase(customDbPath);
  }

  private resolveScriptsDir(customDir?: string): string {
    if (customDir && fs.existsSync(customDir)) {
      return customDir;
    }

    // 1. Packaged Electron runtime
    if (process.resourcesPath) {
      const packagedPath = path.join(process.resourcesPath, 'resources/scripts');
      if (fs.existsSync(packagedPath)) return packagedPath;
    }

    // 2. Dev mode / cwd
    const devPath = path.resolve(process.cwd(), 'resources/scripts');
    if (fs.existsSync(devPath)) return devPath;

    // 3. Fallback relative
    const relativePath = path.resolve(__dirname, '../../../../resources/scripts');
    if (fs.existsSync(relativePath)) return relativePath;

    throw new Error(`[ScriptReaderService] Cannot locate scripts directory at: ${devPath}`);
  }

  private initDatabase(customDbPath?: string): void {
    try {
      let cdbPath = customDbPath;
      if (!cdbPath) {
        if (process.resourcesPath) {
          const packaged = path.join(process.resourcesPath, 'resources/cards.cdb');
          if (fs.existsSync(packaged)) cdbPath = packaged;
        }
        if (!cdbPath) {
          const dev = path.resolve(process.cwd(), 'resources/cards.cdb');
          if (fs.existsSync(dev)) cdbPath = dev;
        }
      }

      if (cdbPath && fs.existsSync(cdbPath)) {
        this.db = new Database(cdbPath, { readonly: true });
        this.stmtGetAlias = this.db.prepare('SELECT alias FROM datas WHERE id = ?');
      }
    } catch (err) {
      console.warn('[ScriptReaderService] Could not open SQLite database for alias resolution:', err);
    }
  }

  private resolveAliasScriptPath(cardId: number): string | null {
    if (!this.stmtGetAlias) return null;
    try {
      const row = this.stmtGetAlias.get(cardId);
      if (row && row.alias && row.alias > 0) {
        const aliasPath = path.join(this.officialScriptsDir, `c${row.alias}.lua`);
        if (fs.existsSync(aliasPath)) {
          return aliasPath;
        }
      }
    } catch {
      // Ignore database errors
    }
    return null;
  }

  public readScript(name: string): string | null {
    if (this.scriptCache.has(name)) {
      return this.scriptCache.get(name) ?? null;
    }

    // Special bootstrap script
    if (name === 'c0.lua') {
      const boot = [
        'Duel.LoadScript("constant.lua")',
        'Duel.LoadScript("utility.lua")',
        'Duel.LoadScript("cards_specific_functions.lua")',
        'Duel.LoadScript("proc_fusion.lua")',
        'Duel.LoadScript("proc_fusion_spell.lua")',
        'Duel.LoadScript("proc_ritual.lua")',
        'Duel.LoadScript("proc_synchro.lua")',
        'Duel.LoadScript("proc_xyz.lua")',
        'Duel.LoadScript("proc_union.lua")',
        'Duel.LoadScript("proc_link.lua")',
        'Duel.LoadScript("proc_pendulum.lua")',
        'Duel.LoadScript("proc_equip.lua")',
        'Duel.LoadScript("proc_gemini.lua")',
        'Duel.LoadScript("proc_spirit.lua")',
        'Duel.LoadScript("proc_normal.lua")',
        'Duel.LoadScript("proc_persistent.lua")',
        'Duel.LoadScript("proc_workaround.lua")',
        'Duel.LoadScript("deprecated_functions.lua")',
      ].join('\n');
      this.scriptCache.set(name, boot);
      return boot;
    }

    // Official card scripts (e.g. c12580477.lua)
    if (/^c\d+\.lua$/.test(name)) {
      const officialPath = path.join(this.officialScriptsDir, name);
      if (fs.existsSync(officialPath)) {
        try {
          const content = fs.readFileSync(officialPath, 'utf-8');
          this.scriptCache.set(name, content);
          return content;
        } catch (err) {
          console.warn(`[ScriptReaderService] Failed reading script ${name}:`, err);
        }
      }

      // Check alias script fallback if direct script is missing
      const cardId = parseInt(name.slice(1, -4), 10);
      if (!isNaN(cardId)) {
        const aliasPath = this.resolveAliasScriptPath(cardId);
        if (aliasPath && fs.existsSync(aliasPath)) {
          try {
            const content = fs.readFileSync(aliasPath, 'utf-8');
            this.scriptCache.set(name, content);
            return content;
          } catch (err) {
            console.warn(`[ScriptReaderService] Failed reading alias script for ${name}:`, err);
          }
        }
      }
    }

    // Base runtime scripts (constant.lua, utility.lua, proc_*.lua)
    const basePath = path.join(this.scriptsDir, name);
    if (fs.existsSync(basePath)) {
      try {
        const content = fs.readFileSync(basePath, 'utf-8');
        this.scriptCache.set(name, content);
        return content;
      } catch (err) {
        console.warn(`[ScriptReaderService] Failed reading base script ${name}:`, err);
      }
    }

    // If a system helper or procedure script is requested by utility.lua/constant.lua and not found, return empty stub to prevent crashing
    if (name.endsWith('.lua') && !/^c\d+\.lua$/.test(name)) {
      this.scriptCache.set(name, '');
      return '';
    }

    this.scriptCache.set(name, null);
    return null;
  }

  public getBaseScript(name: string): string | null {
    return this.readScript(name);
  }

  public getScriptsDirectory(): string {
    return this.scriptsDir;
  }

  public close(): void {
    if (this.db) {
      try {
        this.db.close();
      } catch {
        // Ignore close error
      }
      this.db = null;
    }
  }
}
