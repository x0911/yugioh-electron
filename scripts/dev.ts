import { context } from 'esbuild';
import { createServer } from 'vite';
import { spawn } from 'node:child_process';
import electronPath from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { patchOcgcore } from './patch-ocgcore.js';

const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

async function startDev() {
  patchOcgcore();
  console.log('[dev] Starting Vite dev server for renderer...');
  const viteServer = await createServer({
    configFile: path.join(rootDir, 'vite.config.ts'),
  });
  await viteServer.listen();
  const address = viteServer.httpServer?.address();
  const port = typeof address === 'object' && address ? address.port : 5174;
  console.log(`[dev] Vite server listening on http://localhost:${port}`);

  let electronProcess: ReturnType<typeof spawn> | null = null;
  let isRestarting = false;

  const spawnElectron = () => {
    console.log('[dev] Launching Electron...');
    electronProcess = spawn(electronPath as unknown as string, ['.'], {
      cwd: rootDir,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        VITE_DEV_SERVER_URL: `http://localhost:${port}`,
      },
      stdio: 'inherit',
    });

    electronProcess.on('close', async (code) => {
      if (isRestarting) return;
      console.log(`[dev] Electron exited with code ${code}. Cleaning up...`);
      await mainCtx.dispose();
      await preloadCtx.dispose();
      await viteServer.close();
      process.exit(code ?? 0);
    });
  };

  let reloadTimeout: NodeJS.Timeout | null = null;
  const triggerRestart = () => {
    if (reloadTimeout) clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(() => {
      if (electronProcess) {
        console.log('[dev] Main/preload code changed. Restarting Electron...');
        isRestarting = true;
        electronProcess.kill('SIGTERM');
        setTimeout(() => {
          isRestarting = false;
          spawnElectron();
        }, 500);
      }
    }, 200);
  };

  const createReloaderPlugin = (name: string) => ({
    name: `reloader-${name}`,
    setup(build: any) {
      let isFirst = true;
      build.onEnd((result: any) => {
        if (isFirst) {
          isFirst = false;
          return;
        }
        if (!result.errors || result.errors.length === 0) {
          triggerRestart();
        }
      });
    },
  });

  const mainCtx = await context({
    entryPoints: [path.join(rootDir, 'src/main/index.ts')],
    outfile: path.join(rootDir, 'dist/main/index.js'),
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'esm',
    packages: 'external',
    sourcemap: true,
    plugins: [createReloaderPlugin('main')],
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
    plugins: [createReloaderPlugin('preload')],
  });

  await mainCtx.rebuild();
  await preloadCtx.rebuild();
  await mainCtx.watch();
  await preloadCtx.watch();

  spawnElectron();
}

startDev().catch((err) => {
  console.error('[dev] Dev server error:', err);
  process.exit(1);
});
