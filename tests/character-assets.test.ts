import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Character Asset Integrity: All 40 duelists have valid portrait and avatar assets on disk', () => {
  const charactersJsonPath = path.resolve(process.cwd(), 'data/characters.json');
  const characters = JSON.parse(fs.readFileSync(charactersJsonPath, 'utf-8'));

  assert.strictEqual(characters.length, 40, 'Must have exactly 40 characters in roster');

  for (const char of characters) {
    // 1. Check avatar
    const avatarRel = char.avatar.replace('app-resource://', 'resources/');
    const avatarPath = path.resolve(process.cwd(), avatarRel);
    assert.ok(
      fs.existsSync(avatarPath),
      `Avatar for ${char.name} (${char.id}) must exist at ${avatarRel}`,
    );

    // 2. Check portrait
    const portraitRel = (char.portrait || char.avatar).replace('app-resource://', 'resources/');
    const portraitPath = path.resolve(process.cwd(), portraitRel);
    assert.ok(
      fs.existsSync(portraitPath),
      `Portrait for ${char.name} (${char.id}) must exist at ${portraitRel}`,
    );
  }
});
