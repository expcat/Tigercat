/**
 * Theme configuration and context
 */

export * from './colors'
export * from './checkbox'
export * from './switch'
export * from './slider'

/**
 * CSS variables for theme colors
 * These can be set on :root or any parent element to override theme colors
 *
 * @example
 * ```css
 * :root {
 *   --tiger-primary: #3b82f6;
 *   --tiger-primary-hover: #2563eb;
 *   --tiger-primary-disabled: #93c5fd;
 *   --tiger-secondary: #6b7280;
 *   --tiger-secondary-hover: #4b5563;
 *   --tiger-secondary-disabled: #9ca3af;
 *   --tiger-outline-bg-hover: #eff6ff;
 *   --tiger-ghost-bg-hover: #eff6ff;
 * }
 * ```
 *
 * @example
 * For dark mode:
 * ```css
 * .dark {
 *   --tiger-primary: #60a5fa;
 *   --tiger-primary-hover: #3b82f6;
 *   --tiger-outline-bg-hover: #1e3a8a;
 *   --tiger-ghost-bg-hover: #1e3a8a;
 * }
 * ```
 *
 * @since 0.2.0 - Added interaction state variables (focusRing, primaryActive, etc.)
 */
export const THEME_CSS_VARS = {
  // Primary colors
  primary: '--tiger-primary',
  primaryHover: '--tiger-primary-hover',
  primaryActive: '--tiger-primary-active',
  primaryDisabled: '--tiger-primary-disabled',
  // Secondary colors
  secondary: '--tiger-secondary',
  secondaryHover: '--tiger-secondary-hover',
  secondaryActive: '--tiger-secondary-active',
  secondaryDisabled: '--tiger-secondary-disabled',
  // Background hover states
  outlineBgHover: '--tiger-outline-bg-hover',
  ghostBgHover: '--tiger-ghost-bg-hover',
  // Interaction states (0.2.0+)
  focusRing: '--tiger-focus-ring',
  surface: '--tiger-surface'
} as const

/**
 * Helper function to set theme colors programmatically
 *
 * @param colors - Object with color values to set
 * @param element - Element to set colors on (defaults to document.documentElement)
 *
 * @example
 * ```typescript
 * import { setThemeColors } from '@expcat/tigercat-core'
 *
 * // Set colors on root
 * setThemeColors({
 *   primary: '#ff0000',
 *   primaryHover: '#cc0000',
 * })
 *
 * // Set colors on specific element
 * const container = document.querySelector('.my-container')
 * setThemeColors({
 *   primary: '#00ff00',
 * }, container)
 * ```
 */
export function setThemeColors(
  colors: Partial<Record<keyof typeof THEME_CSS_VARS, string>>,
  element?: HTMLElement
): void {
  const target = element || (typeof document !== 'undefined' ? document.documentElement : null)

  if (!target) {
    console.warn(
      'Cannot set theme colors: document is not available (SSR environment or non-browser context)'
    )
    return
  }

  Object.entries(colors).forEach(([key, value]) => {
    const varName = THEME_CSS_VARS[key as keyof typeof THEME_CSS_VARS]
    if (varName && value) {
      target.style.setProperty(varName, value)
    }
  })
}

/**
 * Helper function to get current theme color value
 *
 * @param colorKey - Key of the color to get
 * @param element - Element to get color from (defaults to document.documentElement)
 * @returns The current color value or undefined
 *
 * @example
 * ```typescript
 * import { getThemeColor } from '@expcat/tigercat-core'
 *
 * const primaryColor = getThemeColor('primary')
 * console.log(primaryColor) // '#2563eb'
 * ```
 */
export function getThemeColor(
  colorKey: keyof typeof THEME_CSS_VARS,
  element?: HTMLElement
): string | undefined {
  const target = element || (typeof document !== 'undefined' ? document.documentElement : null)

  if (!target) {
    return undefined
  }

  const varName = THEME_CSS_VARS[colorKey]
  const value = getComputedStyle(target).getPropertyValue(varName).trim()

  return value || undefined
}
