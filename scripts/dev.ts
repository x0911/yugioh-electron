import { context } from 'esbuild';
import { createServer } from 'vite';
import { spawn } from 'node:child_process';
import electronPath from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

async function startDev() {
  console.log('[dev] Starting Vite dev server for renderer...');
  const viteServer = await createServer({
    configFile: path.join(rootDir, 'vite.config.ts'),
  });
  await viteServer.listen();
  const address = viteServer.httpServer?.address();
  const port = typeof address === 'object' && address ? address.port : 5173;
  console.log(`[dev] Vite server listening on http://localhost:${port}`);

  console.log('[dev] Compiling main process and preload...');
  const mainCtx = await context({
    entryPoints: [path.join(rootDir, 'src/main/index.ts')],
    outfile: path.join(rootDir, 'dist/main/index.js'),
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'esm',
    packages: 'external',
    sourcemap: true,
  });

  const preloadCtx = await context({
    entryPoints: [path.join(rootDir, 'src/preload/index.ts')],
    outfile: path.join(rootDir, 'dist/preload/index.cjs'),
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    packages: 'external',
    sourcemap: true,
  });

  await mainCtx.rebuild();
  await preloadCtx.rebuild();
  await mainCtx.watch();
  await preloadCtx.watch();

  console.log('[dev] Launching Electron...');
  const electronProcess = spawn(electronPath as unknown as string, ['.'], {
    cwd: rootDir,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VITE_DEV_SERVER_URL: `http://localhost:${port}`,
    },
    stdio: 'inherit',
  });

  electronProcess.on('close', async (code) => {
    console.log(`[dev] Electron exited with code ${code}. Cleaning up...`);
    await mainCtx.dispose();
    await preloadCtx.dispose();
    await viteServer.close();
    process.exit(code ?? 0);
  });
}

startDev().catch((err) => {
  console.error('[dev] Dev server error:', err);
  process.exit(1);
});
