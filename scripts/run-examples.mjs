#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
} from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  isWindows,
  isPnpmAvailable,
  runPnpm,
  PNPM_CMD,
  PNPM_SHELL,
} from './utils/pnpm.mjs';

const argv = process.argv.slice(2);
const checkOnly = argv.includes('--check') || argv.includes('-c');
const smoke = argv.includes('--smoke');
const smokeArg = argv.find((a) => a.startsWith('--smoke-ms='));
const smokeMs = Number.parseInt(
  smokeArg?.slice('--smoke-ms='.length) ?? '',
  10
);
const effectiveSmokeMs =
  Number.isFinite(smokeMs) && smokeMs > 0 ? smokeMs : 3000;

async function* walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

async function needsBuildForPackage(srcDir, distEntry) {
  if (!existsSync(distEntry)) return true;
  if (!existsSync(srcDir)) return false;

  const distStat = await stat(distEntry);
  const distMtime = distStat.mtimeMs;

  for await (const filePath of walkFiles(srcDir)) {
    const fileStat = await stat(filePath);
    if (fileStat.mtimeMs > distMtime) return true;
  }

  return false;
}

function killTree(child) {
  if (!child || typeof child.pid !== 'number') return;

  if (isWindows) {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      shell: true,
    });
    return;
  }

  try {
    child.kill('SIGTERM');
  } catch {
    // ignore
  }
}

function tailText(text, maxLines = 120) {
  const lines = String(text).split(/\r?\n/);
  return lines.slice(Math.max(0, lines.length - maxLines)).join(os.EOL);
}

function readLogTailSafe(logPath) {
  try {
    const content = readFileSync(logPath, 'utf8');
    return tailText(content);
  } catch {
    return null;
  }
}

function ensureExamplesDependenciesInstalled(exampleDirs) {
  const missing = exampleDirs.filter(
    (dir) => !existsSync(path.join(dir, 'node_modules'))
  );
  if (missing.length === 0) return 0;

  console.log('');
  console.log(
    'Example dependencies are missing. Installing workspace dependencies...'
  );
  console.log('');
  return runPnpm(['install']);
}

async function main() {
  console.log('🐯 Starting Tigercat Examples');
  console.log('==========================');
  console.log('');

  if (!isPnpmAvailable()) {
    console.error('Error: pnpm is not installed or not in PATH');
    console.error('Install it with: npm install -g pnpm');
    process.exit(1);
  }

  const packagesToCheck = [
    {
      name: '@tigercat/core',
      srcDir: path.join('packages', 'core', 'src'),
      distEntry: path.join('packages', 'core', 'dist', 'index.js'),
    },
    {
      name: '@tigercat/react',
      srcDir: path.join('packages', 'react', 'src'),
      distEntry: path.join('packages', 'react', 'dist', 'index.js'),
    },
    {
      name: '@tigercat/vue',
      srcDir: path.join('packages', 'vue', 'src'),
      distEntry: path.join('packages', 'vue', 'dist', 'index.js'),
    },
  ];

  let needBuild = false;
  for (const pkg of packagesToCheck) {
    if (await needsBuildForPackage(pkg.srcDir, pkg.distEntry)) {
      needBuild = true;
      break;
    }
  }

  if (needBuild) {
    console.log('Packages are missing or outdated. Building now...');
    const status = runPnpm([
      '--filter',
      '@tigercat/core',
      '--filter',
      '@tigercat/react',
      '--filter',
      '@tigercat/vue',
      'build',
    ]);

    if (status !== 0) {
      console.error(
        'Error: Build failed. Please fix build errors and try again.'
      );
      process.exit(status);
    }
  }

  const exampleDirs = [
    path.join('examples', 'example', 'vue3'),
    path.join('examples', 'example', 'react'),
  ];

  const installStatus = ensureExamplesDependenciesInstalled(exampleDirs);
  if (installStatus !== 0) {
    console.error(
      'Error: Failed to install dependencies required by examples.'
    );
    process.exit(installStatus);
  }

  if (checkOnly) {
    console.log('');
    console.log('✓ Check complete (no servers started due to --check).');
    process.exit(0);
  }

  const logDir = path.join(os.tmpdir(), 'tigercat');
  mkdirSync(logDir, { recursive: true });

  const vueLogPath = path.join(logDir, 'vue3-example.log');
  const reactLogPath = path.join(logDir, 'react-example.log');

  function startWithLogs(name, pnpmArgs, logPath) {
    const stream = createWriteStream(logPath, { flags: 'a' });

    const child = spawn(PNPM_CMD, pnpmArgs, {
      shell: PNPM_SHELL,
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    child.stdout?.pipe(stream);
    child.stderr?.pipe(stream);

    child.on('close', () => {
      stream.end();
    });

    child.on('error', (err) => {
      stream.write(`\n[runner] ${name} failed to start: ${String(err)}\n`);
      stream.end();
    });

    return child;
  }

  console.log('Starting Vue3 example on http://localhost:5173');
  const vueChild = startWithLogs(
    'vue3',
    ['--filter', '@tigercat-example/vue3', 'dev'],
    vueLogPath
  );

  console.log('Starting React example on http://localhost:5174');
  const reactChild = startWithLogs(
    'react',
    ['--filter', '@tigercat-example/react', 'dev'],
    reactLogPath
  );

  const cleanup = () => {
    console.log('');
    console.log('Stopping example servers...');
    killTree(vueChild);
    killTree(reactChild);
  };

  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });

  console.log('');
  console.log('✓ Both examples are starting...');
  console.log('');
  console.log('  Vue3:  http://localhost:5173');
  console.log('  React: http://localhost:5174');
  console.log('');
  console.log('Logs:');
  console.log(`  Vue3:  ${vueLogPath}`);
  console.log(`  React: ${reactLogPath}`);
  console.log('');
  console.log('Press Ctrl+C to stop both servers');
  console.log('');

  const waitForExit = (name, child, logPath) =>
    new Promise((resolve) => {
      child.on('exit', (code, signal) =>
        resolve({ name, code, signal, logPath })
      );
    });

  if (smoke) {
    await new Promise((resolve) => setTimeout(resolve, effectiveSmokeMs));
    cleanup();
    console.log('');
    console.log(`✓ Smoke test complete (ran for ${effectiveSmokeMs}ms).`);
    process.exit(0);
  }

  const firstExit = await Promise.race([
    waitForExit('vue3', vueChild, vueLogPath),
    waitForExit('react', reactChild, reactLogPath),
  ]);

  cleanup();

  if ((firstExit.code ?? 0) !== 0 || firstExit.signal) {
    const tail = readLogTailSafe(firstExit.logPath);
    if (tail) {
      console.error('');
      console.error(`[${firstExit.name}] last log lines:`);
      console.error(tail);
    }
  }

  if (firstExit.signal) {
    process.exit(1);
  }

  process.exit(firstExit.code ?? 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
