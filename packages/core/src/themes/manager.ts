/**
 * Request-scoped theme application.
 *
 * Each browser root (and each server render) owns a scope. CSS variables are
 * written into a style element on that root so light and `.dark` can disagree
 * without a process-wide singleton. `auto` does not stamp `.dark`; the first
 * paint follows the class or `data-tiger-color-scheme` already on the root.
 */

import type { ThemeConfig, ThemePreset, ColorScheme } from '../types/theme'
import { THEME_CSS_VARS, semanticColorsToCssVars, isAllowedThemeValue } from '../theme-runtime'
import { isBrowser } from '../utils/env'
import { devWarn } from '../utils/dev-warn'
import { defaultTheme } from './default/theme'
import { vibrantTheme } from './vibrant/theme'
import { professionalTheme } from './professional/theme'
import { minimalTheme } from './minimal/theme'
import { naturalTheme } from './natural/theme'
import { modernTheme } from './modern/theme'
import { highContrastTheme } from './high-contrast/theme'

const builtInPresets = [
  defaultTheme,
  vibrantTheme,
  professionalTheme,
  minimalTheme,
  naturalTheme,
  modernTheme,
  highContrastTheme
]

export function mergeThemeConfig(base: ThemeConfig = {}, override: ThemeConfig = {}): ThemeConfig {
  return {
    colors: { ...base.colors, ...override.colors },
    typography: { ...base.typography, ...override.typography },
    radius: { ...base.radius, ...override.radius },
    shadows: { ...base.shadows, ...override.shadows },
    spacing: { ...base.spacing, ...override.spacing },
    motion: { ...base.motion, ...override.motion }
  }
}

export function resolvePresetThemeConfig(
  preset: ThemePreset | undefined,
  scheme: 'light' | 'dark',
  fallback: ThemePreset = defaultTheme
): ThemeConfig {
  return mergeThemeConfig(fallback[scheme], preset?.[scheme] ?? {})
}

export const THEME_CONFIG_CSS_VARS = {
  typography: {
    fontFamily: '--tiger-font-family',
    fontFamilyMono: '--tiger-font-family-mono',
    fontSizeBase: '--tiger-font-size-base',
    fontSizeSm: '--tiger-font-size-sm',
    fontSizeLg: '--tiger-font-size-lg',
    fontWeightNormal: '--tiger-font-weight-normal',
    fontWeightMedium: '--tiger-font-weight-medium',
    fontWeightSemibold: '--tiger-font-weight-semibold',
    fontWeightBold: '--tiger-font-weight-bold',
    lineHeightNormal: '--tiger-line-height-normal',
    lineHeightTight: '--tiger-line-height-tight'
  },
  radius: {
    none: '--tiger-radius-none',
    sm: '--tiger-radius-sm',
    md: '--tiger-radius-md',
    lg: '--tiger-radius-lg',
    xl: '--tiger-radius-xl',
    full: '--tiger-radius-full'
  },
  shadows: {
    xs: '--tiger-shadow-xs',
    sm: '--tiger-shadow-sm',
    md: '--tiger-shadow-md',
    lg: '--tiger-shadow-lg',
    xl: '--tiger-shadow-xl'
  },
  spacing: {
    xs: '--tiger-spacing-xs',
    sm: '--tiger-spacing-sm',
    md: '--tiger-spacing-md',
    lg: '--tiger-spacing-lg',
    xl: '--tiger-spacing-xl'
  },
  motion: {
    durationFast: '--tiger-motion-duration-quick',
    durationBase: '--tiger-motion-duration-base',
    durationSlow: '--tiger-motion-duration-slow',
    easing: '--tiger-motion-ease-standard'
  }
} as const

export const THEME_TRANSITION_PROPERTIES =
  'color, background-color, border-color, outline-color, text-decoration-color, box-shadow, opacity, transform'

const THEME_TRANSITION_CSS_VARS = {
  durationFast: '--tiger-transition-quick',
  durationBase: '--tiger-transition-base',
  durationSlow: '--tiger-transition-emphasized'
} as const

export function themeTransitionValue(duration: string, easing: string): string {
  return `${THEME_TRANSITION_PROPERTIES} ${duration} ${easing}`
}

const DEFAULT_TRANSITION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'
/**
 * Nested scopes compose shorthands against the easing custom property so an
 * easing set on a parent keeps flowing until the nested config sets its own.
 */
const INHERITED_TRANSITION_EASING = 'var(--tiger-motion-ease-standard)'

/** Derived transition shorthands for the motion durations the config sets. */
function motionTransitionCssVars(
  motion: ThemeConfig['motion'],
  fallbackEasing: string
): Record<string, string> {
  const vars: Record<string, string> = {}
  if (!motion) return vars
  const easing = motion.easing ?? fallbackEasing
  if (!isAllowedThemeValue(easing)) return vars
  if (motion.durationBase) {
    vars[THEME_TRANSITION_CSS_VARS.durationBase] = themeTransitionValue(motion.durationBase, easing)
  }
  if (motion.durationFast) {
    vars[THEME_TRANSITION_CSS_VARS.durationFast] = themeTransitionValue(motion.durationFast, easing)
  }
  if (motion.durationSlow) {
    vars[THEME_TRANSITION_CSS_VARS.durationSlow] = themeTransitionValue(motion.durationSlow, easing)
  }
  return vars
}

export function themeConfigToCssVars(config: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {
    ...semanticColorsToCssVars(config.colors)
  }

  for (const section of ['typography', 'radius', 'shadows', 'spacing', 'motion'] as const) {
    const values = config[section]
    if (!values) continue
    const varNames = THEME_CONFIG_CSS_VARS[section]
    for (const [key, value] of Object.entries(values)) {
      const varName = varNames[key as keyof typeof varNames]
      if (varName && value && isAllowedThemeValue(value)) vars[varName] = value
    }
  }

  Object.assign(vars, motionTransitionCssVars(config.motion, DEFAULT_TRANSITION_EASING))

  return vars
}

export interface ThemeChangeEvent {
  theme: string
  colorScheme: 'light' | 'dark'
}

export type ThemeChangeListener = (event: ThemeChangeEvent) => void

export const THEME_ROOT_ATTRIBUTE = 'data-tiger-theme-scope'

/**
 * Nearest ancestor (including the node itself) marked as a theme root.
 * Portals use this instead of always attaching to `documentElement`.
 */
export function nearestThemeRoot(node: Node | null): HTMLElement | null {
  if (!node) return null
  const element = node instanceof Element ? node : node.parentElement
  if (!element) return null
  return element.closest<HTMLElement>(`[${THEME_ROOT_ATTRIBUTE}]`)
}

/** CSS variables for keys the config actually sets. Parent breakpoints stay inherited. */
export function themeConfigOwnCssVars(config: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {}
  if (config.colors) {
    for (const [key, value] of Object.entries(config.colors)) {
      const varName = THEME_CSS_VARS[key as keyof typeof THEME_CSS_VARS]
      if (varName && value && isAllowedThemeValue(value)) vars[varName] = value
    }
  }
  for (const section of ['typography', 'radius', 'shadows', 'spacing', 'motion'] as const) {
    const values = config[section]
    if (!values) continue
    const varNames = THEME_CONFIG_CSS_VARS[section]
    for (const [key, value] of Object.entries(values)) {
      const varName = varNames[key as keyof typeof varNames]
      if (varName && value && isAllowedThemeValue(value)) vars[varName] = value
    }
  }
  Object.assign(vars, motionTransitionCssVars(config.motion, INHERITED_TRANSITION_EASING))
  return vars
}

export interface TigerThemeScopeOptions {
  root?: HTMLElement | null
  theme?: string
  colorScheme?: ColorScheme
  /**
   * Child root. Only variables this preset sets are written, so parent
   * custom properties keep inheriting.
   */
  nested?: boolean
}

export interface TigerThemeScope {
  registerTheme(preset: ThemePreset): void
  getTheme(name: string): ThemePreset | undefined
  getAvailableThemes(): string[]
  getCurrentTheme(): string
  getResolvedColorScheme(): 'light' | 'dark'
  getColorScheme(): ColorScheme
  setTheme(name: string): void
  defineTheme(preset: ThemePreset): void
  setColorScheme(scheme: ColorScheme): void
  onChange(listener: ThemeChangeListener): () => void
  apply(): void
  dispose(): void
}

let nextScopeId = 0

/** Root state the scope found before its first write, restored on release/dispose. */
interface RootSnapshot {
  themeScopeAttr: string | null
  themeAttr: string | null
  darkClass: boolean
  colorSchemeStyle: string
  colorSchemeAttr: string | null
}

function readExplicitScheme(root: HTMLElement | null): 'light' | 'dark' | null {
  if (!root) return null
  const attr = root.getAttribute('data-tiger-color-scheme')
  if (attr === 'dark' || attr === 'light') return attr
  if (root.classList.contains('dark')) return 'dark'
  return null
}

/**
 * Scheme the scoped stylesheet actually paints for an `auto` scope: the root's
 * own attribute/class wins, then the `.dark <scope>` rule — an ancestor dark
 * class — applies unless the root explicitly says light.
 */
function readScopedScheme(root: HTMLElement | null): 'light' | 'dark' {
  const own = readExplicitScheme(root)
  if (own) return own
  if (root?.parentElement?.closest('.dark')) return 'dark'
  return 'light'
}

function decls(vars: Record<string, string>): string {
  return Object.entries(vars)
    .filter(([, value]) => isAllowedThemeValue(value))
    .map(([name, value]) => `${name}:${value}`)
    .join(';')
}

export function createTigerThemeScope(options: TigerThemeScopeOptions = {}): TigerThemeScope {
  const presets = new Map<string, ThemePreset>()
  for (const preset of builtInPresets) presets.set(preset.name, preset)

  const nested = options.nested === true
  let currentThemeName = options.theme ?? 'default'
  let colorScheme: ColorScheme = options.colorScheme ?? 'auto'
  let root =
    options.root === undefined ? (isBrowser() ? document.documentElement : null) : options.root
  const scopeId = `tiger-theme-${++nextScopeId}`
  let styleEl: HTMLStyleElement | null = null
  let rootSnapshot: RootSnapshot | null = null
  let schemeStamp: { attr: string; darkClass: boolean; colorSchemeStyle: string } | null = null
  const listeners: ThemeChangeListener[] = []

  function resolved(): 'light' | 'dark' {
    if (colorScheme === 'dark' || colorScheme === 'light') return colorScheme
    return readScopedScheme(root)
  }

  function ensureStyle(): HTMLStyleElement | null {
    if (!isBrowser() || !root) return null
    const doc = root.ownerDocument
    if (!styleEl || styleEl.ownerDocument !== doc) {
      styleEl = doc.createElement('style')
      styleEl.setAttribute('data-tiger-theme-style', scopeId)
      doc.head.appendChild(styleEl)
    }
    return styleEl
  }

  /**
   * Release the class/attribute/colorScheme this scope stamped, keeping prior
   * state. Each field is restored only while it still holds what this scope
   * wrote, so external changes made after the stamp survive.
   */
  function releaseScheme(): void {
    if (!root || !rootSnapshot || !schemeStamp) return
    if (root.classList.contains('dark') === schemeStamp.darkClass) {
      root.classList.toggle('dark', rootSnapshot.darkClass)
    }
    if (root.style.colorScheme === schemeStamp.colorSchemeStyle) {
      root.style.colorScheme = rootSnapshot.colorSchemeStyle
    }
    if (root.getAttribute('data-tiger-color-scheme') === schemeStamp.attr) {
      if (rootSnapshot.colorSchemeAttr === null) root.removeAttribute('data-tiger-color-scheme')
      else root.setAttribute('data-tiger-color-scheme', rootSnapshot.colorSchemeAttr)
    }
    schemeStamp = null
  }

  /** Restore every marker this scope wrote — only while the root is still ours. */
  function releaseRoot(): void {
    if (!root || !rootSnapshot) return
    if (root.getAttribute('data-tiger-theme-scope') !== scopeId) return
    releaseScheme()
    if (rootSnapshot.themeAttr === null) root.removeAttribute('data-tiger-theme')
    else root.setAttribute('data-tiger-theme', rootSnapshot.themeAttr)
    if (rootSnapshot.themeScopeAttr === null) root.removeAttribute('data-tiger-theme-scope')
    else root.setAttribute('data-tiger-theme-scope', rootSnapshot.themeScopeAttr)
    rootSnapshot = null
  }

  function apply(): void {
    if (!presets.has(currentThemeName)) {
      devWarn(
        `themeScope.setTheme.${currentThemeName}`,
        `[Tigercat] Theme "${currentThemeName}" is not registered.`
      )
      return
    }
    const preset = presets.get(currentThemeName)
    const lightSource = nested ? (preset?.light ?? {}) : resolvePresetThemeConfig(preset, 'light')
    const darkSource = nested ? (preset?.dark ?? {}) : resolvePresetThemeConfig(preset, 'dark')
    const lightVars = nested
      ? themeConfigOwnCssVars(lightSource)
      : themeConfigToCssVars(lightSource)
    const darkVars = nested ? themeConfigOwnCssVars(darkSource) : themeConfigToCssVars(darkSource)
    const light = decls(lightVars)
    const dark = decls(darkVars)
    const selector = `[data-tiger-theme-scope="${scopeId}"]`
    // A scheme changes text tokens. The same root has to paint the canvas or
    // light text sits on whatever surface is behind the provider.
    const canvas = 'background-color:var(--tiger-surface);color:var(--tiger-text)'
    const css = [
      `${selector}{${light};${canvas}}`,
      `${selector}[data-tiger-color-scheme="dark"],${selector}.dark:not([data-tiger-color-scheme="light"]){${dark}}`,
      `.dark ${selector}:not([data-tiger-color-scheme="light"]){${dark}}`
    ].join('')

    if (root && isBrowser()) {
      rootSnapshot ??= {
        themeScopeAttr: root.getAttribute('data-tiger-theme-scope'),
        themeAttr: root.getAttribute('data-tiger-theme'),
        darkClass: root.classList.contains('dark'),
        colorSchemeStyle: root.style.colorScheme,
        colorSchemeAttr: root.getAttribute('data-tiger-color-scheme')
      }
      root.setAttribute('data-tiger-theme-scope', scopeId)
      root.setAttribute('data-tiger-theme', currentThemeName)
      if (colorScheme === 'auto') {
        releaseScheme()
      } else {
        root.setAttribute('data-tiger-color-scheme', colorScheme)
        root.classList.toggle('dark', colorScheme === 'dark')
        root.style.colorScheme = colorScheme
        schemeStamp = {
          attr: colorScheme,
          darkClass: colorScheme === 'dark',
          colorSchemeStyle: colorScheme
        }
      }
      const style = ensureStyle()
      if (style) style.textContent = css
    }

    const event: ThemeChangeEvent = { theme: currentThemeName, colorScheme: resolved() }
    for (const listener of listeners) listener(event)
  }

  const scope: TigerThemeScope = {
    registerTheme(preset) {
      presets.set(preset.name, preset)
    },
    getTheme(name) {
      return presets.get(name)
    },
    getAvailableThemes() {
      return Array.from(presets.keys())
    },
    getCurrentTheme() {
      return currentThemeName
    },
    getResolvedColorScheme() {
      return resolved()
    },
    getColorScheme() {
      return colorScheme
    },
    setTheme(name) {
      if (!presets.has(name)) {
        devWarn(`themeScope.setTheme.${name}`, `[Tigercat] Theme "${name}" is not registered.`)
        return
      }
      currentThemeName = name
      apply()
    },
    defineTheme(preset) {
      presets.set(preset.name, preset)
      currentThemeName = preset.name
      apply()
    },
    setColorScheme(scheme) {
      colorScheme = scheme
      apply()
    },
    onChange(listener) {
      listeners.push(listener)
      return () => {
        const index = listeners.indexOf(listener)
        if (index !== -1) listeners.splice(index, 1)
      }
    },
    apply,
    dispose() {
      styleEl?.remove()
      styleEl = null
      releaseRoot()
      listeners.length = 0
      root = null
    }
  }

  return scope
}

export function readTigerDocumentTheme(root?: HTMLElement | null): {
  theme: string
  colorScheme: 'light' | 'dark'
} {
  const target = root === undefined ? (isBrowser() ? document.documentElement : null) : root
  const theme = target?.getAttribute('data-tiger-theme') || 'default'
  const explicit = readExplicitScheme(target)
  return { theme, colorScheme: explicit ?? 'light' }
}
