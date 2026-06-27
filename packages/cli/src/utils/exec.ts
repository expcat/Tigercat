import { execSync } from 'node:child_process'
import { logError } from './logger'

export interface RunCommandOptions {
  /** Working directory for the spawned command. */
  cwd?: string
  /** Swallow a non-zero exit (e.g. the user Ctrl+C-ing a foreground dev server). */
  allowFailure?: boolean
  /** When the command throws, log this message and exit with code 1. */
  failureMessage?: string
}

/**
 * Centralized subprocess runner for CLI commands.
 *
 * Always inherits stdio so child output reaches the user. Error handling is
 * selected via options: `allowFailure` ignores a non-zero exit, `failureMessage`
 * logs and exits, and the default lets the error propagate (fail fast).
 */
export function runCommand(command: string, options: RunCommandOptions = {}): void {
  try {
    execSync(command, { cwd: options.cwd, stdio: 'inherit' })
  } catch (error) {
    if (options.allowFailure) return
    if (options.failureMessage !== undefined) {
      logError(options.failureMessage)
      process.exit(1)
    }
    throw error
  }
}
