import { spawn } from 'node:child_process';
import electronPath from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import http from 'node:http';

const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

async function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, () => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startGuestDev() {
  const port = 5173;
  const isViteUp = await isPortOpen(port);

  if (!isViteUp) {
    console.warn(`\n[dev:guest] Vite dev server not detected on http://localhost:${port}.`);
    console.warn(`[dev:guest] Please start the main game instance first with "npm run dev" in another terminal.\n`);
    process.exit(1);
  }

  console.log('[dev:guest] Launching Player 2 (Guest) Electron window...');
  const electronProcess = spawn(electronPath as unknown as string, ['.', '--guest', '--multi-instance', '--windowed'], {
    cwd: rootDir,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VITE_DEV_SERVER_URL: `http://localhost:${port}`,
      YUGIOH_MULTI_INSTANCE: 'true',
      YUGIOH_INSTANCE_ROLE: 'guest',
      WINDOWED: 'true',
    },
    stdio: 'inherit',
  });

  electronProcess.on('close', (code) => {
    console.log(`[dev:guest] Guest Electron window exited with code ${code}.`);
    process.exit(code ?? 0);
  });
}

startGuestDev().catch((err) => {
  console.error('[dev:guest] Error:', err);
  process.exit(1);
});
