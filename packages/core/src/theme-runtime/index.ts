/**
 * Theme runtime — CSS variable names, write/read helpers, and alias mapping.
 * Component skin class maps live in `utils/*`.
 */

import type { ThemeSemanticColors } from '../types/theme'
import { runtimeBreakpoints } from '../tokens/tokens'
import { isBrowser } from '../utils/env'
import { devWarn } from '../utils/dev-warn'

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
 * @since 0.7.0 - Added semantic surface/text/border variables, status colors, chart palette
 */
export const THEME_CSS_VARS = {
  // Primary colors
  primary: '--tiger-primary',
  primaryHover: '--tiger-primary-hover',
  primaryActive: '--tiger-primary-active',
  primaryDisabled: '--tiger-primary-disabled',
  primaryForeground: '--tiger-primary-foreground',
  // Secondary colors
  secondary: '--tiger-secondary',
  secondaryHover: '--tiger-secondary-hover',
  secondaryActive: '--tiger-secondary-active',
  secondaryDisabled: '--tiger-secondary-disabled',
  secondaryForeground: '--tiger-secondary-foreground',
  // Background hover states
  outlineBgHover: '--tiger-outline-bg-hover',
  ghostBgHover: '--tiger-ghost-bg-hover',
  // Interaction states
  focusRing: '--tiger-focus-ring',
  // Surface & background
  surface: '--tiger-surface',
  surfaceMuted: '--tiger-surface-muted',
  surfaceRaised: '--tiger-surface-raised',
  // Text
  text: '--tiger-text',
  textSecondary: '--tiger-text-secondary',
  textDisabled: '--tiger-text-disabled',
  // Border
  border: '--tiger-border',
  borderStrong: '--tiger-border-strong',
  // Status colors
  success: '--tiger-success',
  warning: '--tiger-warning',
  error: '--tiger-error',
  errorForeground: '--tiger-error-foreground',
  errorHover: '--tiger-error-hover',
  errorDisabled: '--tiger-error-disabled',
  errorBgHover: '--tiger-error-bg-hover',
  info: '--tiger-info',
  // Chart palette
  chart1: '--tiger-chart-1',
  chart2: '--tiger-chart-2',
  chart3: '--tiger-chart-3',
  chart4: '--tiger-chart-4',
  chart5: '--tiger-chart-5',
  chart6: '--tiger-chart-6',
  // Breakpoints
  breakpointXs: '--tiger-breakpoint-xs',
  breakpointSm: '--tiger-breakpoint-sm',
  breakpointMd: '--tiger-breakpoint-md',
  breakpointLg: '--tiger-breakpoint-lg',
  breakpointXl: '--tiger-breakpoint-xl',
  breakpoint2xl: '--tiger-breakpoint-2xl'
} as const

export const TIGER_BREAKPOINT_CSS_VALUES = {
  breakpointXs: runtimeBreakpoints.xs,
  breakpointSm: runtimeBreakpoints.sm,
  breakpointMd: runtimeBreakpoints.md,
  breakpointLg: runtimeBreakpoints.lg,
  breakpointXl: runtimeBreakpoints.xl,
  breakpoint2xl: runtimeBreakpoints['2xl']
} as const

const REGISTERED_EASINGS = new Set([
  'linear',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'cubic-bezier(0.4, 0, 0.2, 1)',
  'cubic-bezier(0.4, 0, 1, 1)',
  'cubic-bezier(0, 0, 0.2, 1)',
  'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'cubic-bezier(0.25, 0.1, 0.25, 1)',
  'cubic-bezier(0.2, 0, 0, 1)'
])

/**
 * Runtime theme values may be colors, lengths, registered easings, or
 * compositions of those (shadows, font stacks, transition shorthand).
 * `url()`, HTML, and unregistered cubic-bezier curves are rejected.
 */
export function isAllowedThemeValue(value: string): boolean {
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (!normalized || normalized.length > 500) return false
  if (/url\s*\(|expression\s*\(|javascript:|<|>|@import|;|\/\*|\*\/|\\/i.test(normalized)) {
    return false
  }
  const curves = normalized.match(/cubic-bezier\([^)]*\)/g) ?? []
  if (curves.some((curve) => !REGISTERED_EASINGS.has(curve))) return false
  if (REGISTERED_EASINGS.has(normalized)) return true
  return /^[#a-zA-Z0-9\s,.'()%+\-./]+$/.test(normalized)
}

/**
 * Map semantic colors to CSS custom properties. Alias names are not emitted.
 */
export function semanticColorsToCssVars(
  colors: Partial<ThemeSemanticColors> = {}
): Record<string, string> {
  const vars: Record<string, string> = {}

  for (const [key, value] of Object.entries(colors)) {
    const varName = THEME_CSS_VARS[key as keyof typeof THEME_CSS_VARS]
    if (varName && value && isAllowedThemeValue(value)) vars[varName] = value
  }

  for (const [key, value] of Object.entries(TIGER_BREAKPOINT_CSS_VALUES)) {
    vars[THEME_CSS_VARS[key as keyof typeof TIGER_BREAKPOINT_CSS_VALUES]] = value
  }

  return vars
}

const cssVarCache = new WeakMap<HTMLElement, Map<string, string>>()

export function setCssVarsCached(
  element: HTMLElement,
  vars: Record<string, string | undefined>
): void {
  let cache = cssVarCache.get(element)
  if (!cache) {
    cache = new Map()
    cssVarCache.set(element, cache)
  }

  for (const [name, value] of Object.entries(vars)) {
    if (!value || !isAllowedThemeValue(value)) continue
    if (cache.get(name) === value && element.style.getPropertyValue(name) === value) continue
    element.style.setProperty(name, value)
    cache.set(name, value)
  }
}

export function removeCssVarsCached(element: HTMLElement, names: string[]): void {
  const cache = cssVarCache.get(element)
  for (const name of names) {
    element.style.removeProperty(name)
    cache?.delete(name)
  }
}

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
  const target = element || (isBrowser() ? document.documentElement : null)

  if (!target) {
    devWarn(
      'setThemeColors.ssr',
      'Cannot set theme colors: document is not available (SSR environment or non-browser context)'
    )
    return
  }

  const vars: Record<string, string> = {}
  Object.entries(colors).forEach(([key, value]) => {
    const varName = THEME_CSS_VARS[key as keyof typeof THEME_CSS_VARS]
    if (varName && value) vars[varName] = value
  })
  setCssVarsCached(target, vars)
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
 * console.log(primaryColor) // specified value of --tiger-primary, e.g. '#2563eb'
 * ```
 */
export function getThemeColor(
  colorKey: keyof typeof THEME_CSS_VARS,
  element?: HTMLElement
): string | undefined {
  const target = element || (isBrowser() ? document.documentElement : null)

  if (!target) {
    return undefined
  }

  const varName = THEME_CSS_VARS[colorKey]
  const value = getComputedStyle(target).getPropertyValue(varName).trim()

  return value || undefined
}
