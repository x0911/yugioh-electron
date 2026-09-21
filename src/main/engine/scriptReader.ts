import path from 'node:path';
import fs from 'node:fs';
import Database, { type Database as DatabaseType, type Statement } from 'better-sqlite3';

export class ScriptReaderService {
  private scriptsDir: string;
  private officialScriptsDir: string;
  private scriptCache = new Map<string, string | null>();
  private db: DatabaseType | null = null;
  private stmtGetAlias: Statement<[number], { alias: number }> | null = null;

  private customDbPath?: string;

  constructor(customScriptsDir?: string, customDbPath?: string) {
    this.customDbPath = customDbPath;
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

  public ensureDatabase(): void {
    if (!this.db || !this.stmtGetAlias) {
      this.initDatabase(this.customDbPath);
    }
  }

  private resolveAliasScriptPath(cardId: number): string | null {
    this.ensureDatabase();
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

  private preprocessScript(rawContent: string, isBaseRuntime = false): string {
    // 1. Replace bitwise OR on uppercase constants: e.g. REASON_EFFECT|REASON_DISCARD -> REASON_EFFECT+REASON_DISCARD
    let content = rawContent;
    while (/([A-Z_0-9]+)\s*\|\s*([A-Z_0-9]+)/.test(content)) {
      content = content.replace(/([A-Z_0-9]+)\s*\|\s*([A-Z_0-9]+)/g, '$1+$2');
    }
    // 2. Replace `#variable` length operator on userdata groups with `Auxiliary.GetCount(variable)`
    // IMPORTANT: Skip in base runtime scripts (utility.lua) where `#g` operates on native Lua tables/strings
    // and would cause infinite recursion inside Auxiliary.GetCount itself!
    if (!isBaseRuntime) {
      content = content.replace(/#([a-zA-Z0-9_]+)/g, 'Auxiliary.GetCount($1)');
    }
    // 3. Polyfill modern methods IsSpellTrap and IsMonster for ocgcore 11.0
    content = content.replace(/:IsSpellTrap\(\)/g, ':IsType(TYPE_SPELL+TYPE_TRAP)');
    content = content.replace(/:IsMonster\(\)/g, ':IsType(TYPE_MONSTER)');
    // 4. Guard against nil target when card is removed from target location before effect resolution
    content = content.replace(/if tc:IsRelateToEffect\(([a-zA-Z0-9_]+)\)/g, 'if tc and tc:IsRelateToEffect($1)');
    return content;
  }

  public readScript(name: string): string | null {
    if (this.scriptCache.has(name)) {
      return this.scriptCache.get(name) ?? null;
    }

    // Special bootstrap script
    if (name === 'c0.lua') {
      const boot = [
        '-- Defensive polyfills in bootstrap in case of older utility.lua',
        'Auxiliary = Auxiliary or aux or {}',
        'aux = Auxiliary',
        'if not Auxiliary.GetCount then',
        '  function Auxiliary.GetCount(g)',
        '    if not g then return 0 end',
        '    local t = type(g)',
        '    if t == "userdata" then',
        '      local ok, count = pcall(function() return g:GetCount() end)',
        '      if ok and type(count) == "number" then return count end',
        '    elseif t == "table" or t == "string" then',
        '      return #g',
        '    end',
        '    return 0',
        '  end',
        '  Auxiliary.GetLen = Auxiliary.GetCount',
        'end',
        'if not Auxiliary.GetValueType then',
        '  function Auxiliary.GetValueType(v)',
        '    local t = type(v)',
        '    if t == "userdata" then',
        '      if v.GetFirst or v.GetCount or v.Filter then return "Group"',
        '      elseif v.GetCode or v.IsLocation then return "Card"',
        '      elseif v.SetType or v.SetCategory then return "Effect" end',
        '    end',
        '    return t',
        '  end',
        '  Auxiliary.getValueType = Auxiliary.GetValueType',
        'end',
        'if Card and not Card.IsSpellTrap then',
        '  function Card.IsSpellTrap(c) return c:IsType(TYPE_SPELL+TYPE_TRAP) end',
        'end',
        'if Card and not Card.IsMonster then',
        '  function Card.IsMonster(c) return c:IsType(TYPE_MONSTER) end',
        'end',
        'if Effect and not Effect.GetChainData then',
        '  local _cd = setmetatable({}, { __mode = "k" })',
        '  function Effect.GetChainData(e)',
        '    if not _cd[e] then _cd[e] = {} end',
        '    return _cd[e]',
        '  end',
        '  function Effect.SetChainData(e, d) _cd[e] = d end',
        'end',
        'Duel.LoadScript("constant.lua")',
        'Duel.LoadScript("utility.lua")',
        '-- Ensure procedure scripts and core tables exist unconditionally',
        'if not aux.AddNormalSummonProcedure then',
        '  pcall(function() Duel.LoadScript("proc_normal.lua") end)',
        'end',
        'if not aux.SynchroProcedure or not Synchro then',
        '  pcall(function() Duel.LoadScript("proc_synchro.lua") end)',
        'end',
        'Synchro = aux.SynchroProcedure or Synchro or {}',
        'if not Synchro.AddProcedure then',
        '  function Synchro.AddProcedure(c,f1,min1,max1,f2,min2,max2) end',
        'end',
        'if not Synchro.NonTuner then',
        '  function Synchro.NonTuner(f) return function(target,scard,sumtype,tp) return target:IsNotTuner(scard,tp) and (not f or f(target)) end end',
        'end',
        'if not aux.AddNormalSummonProcedure then',
        '  function Auxiliary.AddNormalSummonProcedure(c,ns,opt,min,max,val,desc,f,sumop)',
        '    val = val or SUMMON_TYPE_TRIBUTE',
        '    local e1=Effect.CreateEffect(c)',
        '    if desc then e1:SetDescription(desc) end',
        '    e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)',
        '    e1:SetType(EFFECT_TYPE_SINGLE)',
        '    e1:SetCode(EFFECT_SUMMON_PROC)',
        '    e1:SetValue(val)',
        '    c:RegisterEffect(e1)',
        '    return e1',
        '  end',
        'end',
        'if not aux.AddNormalSetProcedure then',
        '  Auxiliary.AddNormalSetProcedure = Auxiliary.AddNormalSummonProcedure',
        'end',
      ].join('\n');
      this.scriptCache.set(name, boot);
      return boot;
    }

    // Official card scripts (e.g. c12580477.lua)
    if (/^c\d+\.lua$/.test(name)) {
      const cardId = parseInt(name.slice(1, -4), 10);
      const preamble = !isNaN(cardId)
        ? `self_code = ${cardId}\nself_table = _G["c${cardId}"] or {}\n_G["c${cardId}"] = self_table\n`
        : '';

      const officialPath = path.join(this.officialScriptsDir, name);
      if (fs.existsSync(officialPath)) {
        try {
          const rawContent = fs.readFileSync(officialPath, 'utf-8');
          const content = preamble + this.preprocessScript(rawContent);
          this.scriptCache.set(name, content);
          return content;
        } catch (err) {
          console.warn(`[ScriptReaderService] Failed reading script ${name}:`, err);
        }
      }

      // Check alias script fallback if direct script is missing
      if (!isNaN(cardId)) {
        const aliasPath = this.resolveAliasScriptPath(cardId);
        if (aliasPath && fs.existsSync(aliasPath)) {
          try {
            const rawContent = fs.readFileSync(aliasPath, 'utf-8');
            const content = preamble + this.preprocessScript(rawContent);
            this.scriptCache.set(name, content);
            return content;
          } catch (err) {
            console.warn(`[ScriptReaderService] Failed reading alias script for ${name}:`, err);
          }
        }

        // Fallback for vanilla tokens or normal monsters without dedicated lua script:
        // Provide empty initial_effect stub so ocgcore doesn't abort with "CallCardFunction attempt to call an error function"
        const stub = `${preamble}function self_table.initial_effect(c)\nend\n`;
        this.scriptCache.set(name, stub);
        return stub;
      }
    }

    // Base runtime scripts (constant.lua, utility.lua, proc_*.lua)
    const basePath = path.join(this.scriptsDir, name);
    if (fs.existsSync(basePath)) {
      try {
        const rawContent = fs.readFileSync(basePath, 'utf-8');
        const content = this.preprocessScript(rawContent, true);
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
