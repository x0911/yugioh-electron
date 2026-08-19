import path from 'node:path';
import fs from 'node:fs';

export class ScriptReaderService {
  private scriptsDir: string;
  private officialScriptsDir: string;
  private scriptCache = new Map<string, string | null>();

  constructor(customScriptsDir?: string) {
    this.scriptsDir = this.resolveScriptsDir(customScriptsDir);
    this.officialScriptsDir = path.join(this.scriptsDir, 'official');
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

  public readScript(name: string): string | null {
    if (this.scriptCache.has(name)) {
      return this.scriptCache.get(name) ?? null;
    }

    // Special bootstrap script
    if (name === 'c0.lua') {
      const boot = 'Duel.LoadScript("constant.lua")\nDuel.LoadScript("utility.lua")';
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

    this.scriptCache.set(name, null);
    return null;
  }

  public getBaseScript(name: string): string | null {
    return this.readScript(name);
  }

  public getScriptsDirectory(): string {
    return this.scriptsDir;
  }
}
