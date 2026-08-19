import { build as esbuild } from 'esbuild';
import { build as viteBuild } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

async function main() {
  console.log('[build] Bundling main process...');
  await esbuild({
    entryPoints: [path.join(rootDir, 'src/main/index.ts')],
    outfile: path.join(rootDir, 'dist/main/index.js'),
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'esm',
    packages: 'external',
    sourcemap: true,
  });

  console.log('[build] Bundling preload script...');
  await esbuild({
    entryPoints: [path.join(rootDir, 'src/preload/index.ts')],
    outfile: path.join(rootDir, 'dist/preload/index.cjs'),
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    packages: 'external',
    sourcemap: true,
  });

  console.log('[build] Bundling renderer SPA...');
  await viteBuild({
    configFile: path.join(rootDir, 'vite.config.ts'),
  });

  console.log('[build] Build completed successfully.');
}

main().catch((err) => {
  console.error('[build] Error:', err);
  process.exit(1);
});
