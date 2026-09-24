/**
 * Development-only warnings.
 *
 * Shared, framework-agnostic helper so components can surface misuse (e.g. a
 * prop that does not exist) during development without spamming the console or
 * shipping the message string into production bundles.
 */

/**
 * Warnings emit only when `NODE_ENV` is an explicit non-production value.
 * A missing `process` or missing `NODE_ENV` stays silent.
 */
function isDevEnvironment(): boolean {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  const env = proc?.env?.NODE_ENV
  return typeof env === 'string' && env.length > 0 && env !== 'production'
}

/** Bounded de-dupe list. Oldest keys are dropped so the set cannot grow without limit. */
const WARN_KEY_LIMIT = 200
const warnedOrder: string[] = []
const warnedKeys = new Set<string>()

/**
 * Emit a `console.warn` once per unique `key` in development.
 *
 * @param key   Stable de-duplication key (e.g. `'Button.color'`).
 * @param message Human-readable warning message.
 */
export function devWarn(key: string, message: string): void {
  if (!isDevEnvironment() || warnedKeys.has(key)) return
  if (warnedOrder.length >= WARN_KEY_LIMIT) {
    const oldest = warnedOrder.shift()
    if (oldest) warnedKeys.delete(oldest)
  }
  warnedOrder.push(key)
  warnedKeys.add(key)
  console.warn(message)
}

export function hasAccessibleName(options: {
  text?: unknown
  ariaLabel?: unknown
  ariaLabelledby?: unknown
}): boolean {
  if (typeof options.ariaLabel === 'string' && options.ariaLabel.trim()) return true
  if (typeof options.ariaLabelledby === 'string' && options.ariaLabelledby.trim()) return true
  if (typeof options.text === 'string' && options.text.trim()) return true
  if (typeof options.text === 'number') return true
  return false
}

export function warnMissingAccessibleName(
  component: string,
  options: { text?: unknown; ariaLabel?: unknown; ariaLabelledby?: unknown }
): void {
  if (hasAccessibleName(options)) return
  devWarn(
    `${component}.accessibleName`,
    `[Tigercat] ${component} has no accessible name. Provide text content, aria-label, or aria-labelledby.`
  )
}

/**
 * Reset the de-duplication cache. Intended for tests only.
 */
export function resetDevWarnCache(): void {
  warnedOrder.length = 0
  warnedKeys.clear()
}
