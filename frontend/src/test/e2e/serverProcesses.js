import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));

// PID file lets globalTeardown (a separate process) find and kill the servers.
const PID_FILE = resolve(tmpdir(), 'rentech-e2e-pids.json');

const BACKEND_PORT = process.env.E2E_BACKEND_PORT || '5000';
const FRONTEND_PORT = process.env.E2E_FRONTEND_PORT || '5174';
const API_TARGET = `http://localhost:${BACKEND_PORT}`;

const backendDir = resolve(__dirname, '../../../../backend');
const frontendDir = resolve(__dirname, '../../..');

// Two servers are started: the backend (Node) and the frontend (Vite dev server).
const servers = [
  {
    name: 'backend',
    cwd: backendDir,
    command: [resolve(backendDir, 'App.js')],
    env: { ...process.env, PORT: BACKEND_PORT },
    healthUrl: `http://127.0.0.1:${BACKEND_PORT}/api/health`,
  },
  {
    name: 'frontend',
    cwd: frontendDir,
    command: [
      resolve(frontendDir, 'node_modules/vite/bin/vite.js'),
      '--host',
      '127.0.0.1',
      '--port',
      FRONTEND_PORT,
      '--strictPort',
    ],
    env: { ...process.env, VITE_API_BASE_URL: API_TARGET },
    healthUrl: `http://127.0.0.1:${FRONTEND_PORT}/`,
  },
];

// Poll a URL until the server answers (any non-5xx status is treated as "up").
async function waitForServer(url, timeoutMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res && res.status < 600) return true;
    } catch {
      // connection refused / not ready yet — keep waiting
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for server at ${url}`);
}

export async function startServers() {
  const pids = [];

  for (const s of servers) {
    const child = spawn(process.execPath, s.command, {
      cwd: s.cwd,
      env: s.env,
      stdio: 'inherit',
    });
    pids.push({ name: s.name, pid: child.pid });
    child.on('exit', (code) => {
      if (code && code !== 0) {
        console.warn(`[e2e] ${s.name} process exited with code ${code}`);
      }
    });
  }

  writeFileSync(PID_FILE, JSON.stringify(pids));

  for (const s of servers) {
    console.log(`[e2e] waiting for ${s.name} (${s.healthUrl})`);
    await waitForServer(s.healthUrl);
  }
  console.log('[e2e] all servers ready');
}

export async function stopServers() {
  let pids = [];
  try {
    if (existsSync(PID_FILE)) {
      pids = JSON.parse(readFileSync(PID_FILE, 'utf8'));
    }
  } catch {
    pids = [];
  }

  for (const { pid } of pids) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // already gone
    }
  }

  if (existsSync(PID_FILE)) {
    try {
      unlinkSync(PID_FILE);
    } catch {
      /* noop */
    }
  }
  console.log('[e2e] servers stopped');
}
