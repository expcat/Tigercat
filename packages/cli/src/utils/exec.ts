import { execFileSync } from 'node:child_process'
import { logError } from './logger'

export interface RunCommandOptions {
  /** Working directory for the spawned command. */
  cwd?: string
  /** When the command throws, log this message and exit with code 1. */
  failureMessage?: string
}

/**
 * Centralized subprocess runner for CLI commands.
 *
 * Always runs from an argument array so user text is never a shell string, and
 * always inherits stdio so child output reaches the user. Error handling is
 * selected via options: with `failureMessage` the message is logged and the CLI
 * exits with code 1, and the default lets the error propagate (fail fast). A
 * failing child therefore always produces a non-zero CLI exit; interrupting a
 * foreground dev server with Ctrl+C exits non-zero like any interrupted
 * process and is not converted to success.
 *
 * On Windows the package managers ship .cmd shims that execFile cannot start
 * directly, so a shell is enabled there (same convention as
 * scripts/utils/pnpm.mjs). All call sites pass controlled names, versions and a
 * validated port. Other platforms keep plain argv execution without a shell.
 */
export function runArgv(file: string, args: string[], options: RunCommandOptions = {}): void {
  try {
    execFileSync(file, args, {
      cwd: options.cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    })
  } catch (error) {
    if (options.failureMessage !== undefined) {
      logError(options.failureMessage)
      process.exit(1)
    }
    throw error
  }
}
