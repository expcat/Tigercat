import { spawnSync } from 'node:child_process'

export const isWindows = process.platform === 'win32'

// Use `pnpm` and enable `shell` on Windows so it works with pnpm.ps1/Corepack.
export const PNPM_CMD = 'pnpm'
export const PNPM_SHELL = isWindows

export function pnpmSpawnSync(args, options = {}) {
  return spawnSync(PNPM_CMD, args, {
    shell: PNPM_SHELL,
    ...options
  })
}

export function isPnpmAvailable() {
  const result = pnpmSpawnSync(['--version'], { stdio: 'ignore' })
  return result.status === 0
}

export function getPnpmVersion() {
  const result = pnpmSpawnSync(['--version'], { encoding: 'utf8' })
  if (result.error || result.status !== 0) return null
  return String(result.stdout).trim() || null
}

export function runPnpm(args, options = {}) {
  const result = pnpmSpawnSync(args, { stdio: 'inherit', ...options })
  return result.status ?? 1
}
