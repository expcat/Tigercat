/**
 * Development-only warnings.
 *
 * Shared, framework-agnostic helper so components can surface misuse (e.g. a
 * prop that does not exist) during development without spamming the console or
 * shipping the message string into production bundles.
 */

/**
 * Whether warnings should be emitted. Suppressed when `NODE_ENV` is
 * `'production'`. The `process` guard keeps this safe in browser / SSR bundles
 * where `process` may be undefined.
 */
function isDevEnvironment(): boolean {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  return !proc?.env || proc.env.NODE_ENV !== 'production'
}

const warnedKeys = new Set<string>()

/**
 * Emit a `console.warn` once per unique `key` in development.
 *
 * @param key   Stable de-duplication key (e.g. `'Button.color'`).
 * @param message Human-readable warning message.
 */
export function devWarn(key: string, message: string): void {
  if (!isDevEnvironment() || warnedKeys.has(key)) return
  warnedKeys.add(key)
  console.warn(message)
}

/**
 * Warn (once) when an unsupported `color` prop is passed to a component that
 * only exposes `variant`. Shared by Button and Tag across Vue and React.
 *
 * @param component Component display name (e.g. `'Button'`).
 * @param props     The fallthrough props/attrs to inspect.
 */
export function warnUnsupportedColorProp(component: string, props: Record<string, unknown>): void {
  if (!('color' in props)) return
  devWarn(
    `${component}.color`,
    `[Tigercat] ${component} does not support color. Use variant instead.`
  )
}

/**
 * Warn about an unsupported `color` prop and drop it so it does not land on DOM.
 */
export function omitUnsupportedColorProp<T extends Record<string, unknown>>(
  component: string,
  props: T
): Omit<T, 'color'> {
  warnUnsupportedColorProp(component, props)
  if (!('color' in props)) return props
  const { color: _color, ...rest } = props
  return rest
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
  warnedKeys.clear()
}
