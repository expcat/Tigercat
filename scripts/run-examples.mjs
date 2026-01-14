#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
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

function createTailBuffer(maxLines = 120) {
  let pending = '';
  let lines = [];

  const pushText = (chunk) => {
    pending += String(chunk);
    const parts = pending.split(/\r?\n/);
    pending = parts.pop() ?? '';

    if (parts.length > 0) {
      lines = lines.concat(parts);
      if (lines.length > maxLines) {
        lines = lines.slice(lines.length - maxLines);
      }
    }
  };

  const getText = () =>
    tailText(lines.join(os.EOL) + (pending ? os.EOL + pending : ''), maxLines);

  return { pushText, getText };
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
  // 不生成日志文件；同时清理历史遗留的日志目录（包含过往日志）。
  rmSync(logDir, { recursive: true, force: true });

  function startExample(name, pnpmArgs) {
    const tail = createTailBuffer(120);

    const child = spawn(PNPM_CMD, pnpmArgs, {
      shell: PNPM_SHELL,
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    child.stdout?.on('data', (d) => {
      tail.pushText(d);
      process.stdout.write(d);
    });

    child.stderr?.on('data', (d) => {
      tail.pushText(d);
      process.stderr.write(d);
    });

    child.on('error', (err) => {
      tail.pushText(`\n[runner] ${name} failed to start: ${String(err)}\n`);
    });

    return { child, tail };
  }

  console.log('Starting Vue3 example on http://localhost:5173');
  const vue = startExample('vue3', [
    '--filter',
    '@tigercat-example/vue3',
    'dev',
  ]);

  console.log('Starting React example on http://localhost:5174');
  const react = startExample('react', [
    '--filter',
    '@tigercat-example/react',
    'dev',
  ]);

  const cleanup = () => {
    console.log('');
    console.log('Stopping example servers...');
    killTree(vue.child);
    killTree(react.child);
    rmSync(logDir, { recursive: true, force: true });
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
  console.log('Press Ctrl+C to stop both servers');
  console.log('');

  const waitForExit = (name, child, tail) =>
    new Promise((resolve) => {
      child.on('exit', (code, signal) => resolve({ name, code, signal, tail }));
    });

  if (smoke) {
    await new Promise((resolve) => setTimeout(resolve, effectiveSmokeMs));
    cleanup();
    console.log('');
    console.log(`✓ Smoke test complete (ran for ${effectiveSmokeMs}ms).`);
    process.exit(0);
  }

  const firstExit = await Promise.race([
    waitForExit('vue3', vue.child, vue.tail),
    waitForExit('react', react.child, react.tail),
  ]);

  cleanup();

  if ((firstExit.code ?? 0) !== 0 || firstExit.signal) {
    const tail = firstExit.tail?.getText?.();
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
