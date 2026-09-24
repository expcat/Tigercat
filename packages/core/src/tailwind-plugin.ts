import plugin from 'tailwindcss/plugin'
import type { PluginAPI } from 'tailwindcss/plugin'
import type { ThemePreset } from './types/theme'
import { defaultTheme } from './themes/default/theme'
import { highContrastTheme } from './themes/high-contrast/theme'
import { resolvePresetThemeConfig, themeConfigToCssVars, themeTransitionValue } from './themes/manager'
import { alertCountdownBaseStyles } from './utils/alert-utils'
import { aspectRatioBaseStyles } from './utils/aspect-ratio-utils'
import { cardBaseStyles } from './utils/card-utils'
import { carouselBaseStyles } from './utils/carousel-utils'
import { cartesianChartAnimationBaseStyles } from './utils/chart/color'
import { dividerBaseStyles } from './utils/divider'
import { dropdownBaseStyles } from './utils/dropdown-utils'
import { imageCropperBaseStyles } from './utils/image-utils'
import { loadingAnimationBaseStyles } from './utils/loading-utils'
import { marqueeBaseStyles } from './utils/marquee-utils'
import { menuBaseStyles } from './utils/menu-utils'
import { printLayoutBaseStyles } from './utils/print-layout-utils'
import { progressBaseStyles } from './utils/progress-utils'
import { skeletonBaseStyles } from './utils/skeleton-utils'
import { spaceBaseStyles } from './utils/space'
import { stepConnectorBaseStyles } from './utils/steps-utils'
import { watermarkBaseStyles } from './utils/watermark-utils'
import { workflowDesignerCanvasBaseStyles } from './utils/workflow-designer-utils'
import { LAYOUT_GRID_CSS } from './utils/layout-grid-styles'

/** Each object stays separate so shared `@media` keys merge instead of replacing. */
const tigercatComponentStyleParts: Array<Record<string, unknown>> = [
  alertCountdownBaseStyles,
  progressBaseStyles,
  loadingAnimationBaseStyles,
  cartesianChartAnimationBaseStyles,
  stepConnectorBaseStyles,
  workflowDesignerCanvasBaseStyles,
  aspectRatioBaseStyles,
  cardBaseStyles,
  carouselBaseStyles,
  dividerBaseStyles,
  dropdownBaseStyles,
  imageCropperBaseStyles,
  marqueeBaseStyles,
  menuBaseStyles,
  printLayoutBaseStyles,
  skeletonBaseStyles,
  spaceBaseStyles,
  watermarkBaseStyles
]

function cssVarsForPreset(preset: ThemePreset | undefined, scheme: 'light' | 'dark') {
  return themeConfigToCssVars(resolvePresetThemeConfig(preset ?? defaultTheme, scheme))
}

export const tigercatTheme = cssVarsForPreset(defaultTheme, 'light')
export const tigercatDarkTheme = cssVarsForPreset(defaultTheme, 'dark')

const highContrastLight = cssVarsForPreset(highContrastTheme, 'light')
const highContrastDark = cssVarsForPreset(highContrastTheme, 'dark')

const reducedMotionVars = {
  '--tiger-motion-duration-quick': '0ms',
  '--tiger-motion-duration-base': '0ms',
  '--tiger-motion-duration-slow': '0ms',
  '--tiger-transition-quick': themeTransitionValue('0ms', 'linear'),
  '--tiger-transition-base': themeTransitionValue('0ms', 'linear'),
  '--tiger-transition-emphasized': themeTransitionValue('0ms', 'linear')
}

const tigercatReducedMotionBase = {
  '@media (prefers-reduced-motion: reduce)': {
    ':root, .dark': reducedMotionVars,
    '.tiger-motion-aware, .tiger-motion-aware::before, .tiger-motion-aware::after, [data-tiger-motion]':
      {
        animationDuration: '0ms',
        animationIterationCount: '1',
        animationDelay: '0ms',
        transitionDuration: '0ms',
        transitionDelay: '0ms',
        scrollBehavior: 'auto'
      }
  }
}

const tigercatForcedColorsBase = {
  '@media (forced-colors: active)': {
    ':root, .dark': {
      '--tiger-text': 'CanvasText',
      '--tiger-text-secondary': 'LinkText',
      '--tiger-surface': 'Canvas',
      '--tiger-surface-muted': 'Canvas',
      '--tiger-surface-raised': 'Canvas',
      '--tiger-border': 'CanvasText',
      '--tiger-border-strong': 'CanvasText',
      '--tiger-focus-ring': 'Highlight',
      '--tiger-primary': 'LinkText',
      '--tiger-primary-foreground': 'Canvas',
      '--tiger-success': 'LinkText',
      '--tiger-warning': 'CanvasText',
      '--tiger-error': 'CanvasText',
      '--tiger-info': 'LinkText',
      '--tiger-text-disabled': 'GrayText',
      colorScheme: 'light dark'
    }
  },
  '@media (prefers-contrast: more)': {
    ':root': highContrastLight,
    '.dark': highContrastDark
  }
}

function pluginBase(preset: ThemePreset): Record<string, unknown> {
  return mergeBase([
    {
      ':root': cssVarsForPreset(preset, 'light'),
      '.dark': cssVarsForPreset(preset, 'dark')
    },
    tigercatReducedMotionBase,
    tigercatForcedColorsBase,
    ...tigercatComponentStyleParts
  ])
}

function mergeBase(
  parts: Array<Record<string, unknown>>
): Record<string, unknown> {
  const merged: Record<string, unknown> = {}
  for (const part of parts) {
    for (const [selector, body] of Object.entries(part)) {
      const previous = merged[selector]
      if (
        previous &&
        typeof previous === 'object' &&
        body &&
        typeof body === 'object' &&
        !Array.isArray(previous) &&
        !Array.isArray(body)
      ) {
        merged[selector] = { ...(previous as object), ...(body as object) }
      } else {
        merged[selector] = body
      }
    }
  }
  return merged
}

function asBase(value: Record<string, unknown>): Parameters<PluginAPI['addBase']>[0] {
  return value as Parameters<PluginAPI['addBase']>[0]
}

export const tigercatPlugin = plugin(function ({ addBase }: PluginAPI) {
  addBase(asBase(mergeBase([pluginBase(defaultTheme), parseLayoutCss(LAYOUT_GRID_CSS)])))
})

export interface TigercatPluginOptions {
  /** Theme preset written to `:root` / `.dark`. */
  preset?: ThemePreset
}

export function createTigercatPlugin(options: TigercatPluginOptions = {}) {
  const preset = options.preset ?? defaultTheme
  return plugin(function ({ addBase }: PluginAPI) {
    addBase(asBase(mergeBase([pluginBase(preset), parseLayoutCss(LAYOUT_GRID_CSS)])))
  })
}

type LayoutDecls = Record<string, string | Record<string, string>>

function declarationBlock(body: string): Record<string, string> {
  const decls: Record<string, string> = {}
  for (const part of body.split(';')) {
    const colon = part.indexOf(':')
    if (colon === -1) continue
    const prop = part.slice(0, colon).trim()
    const value = part.slice(colon + 1).trim()
    if (prop && value) decls[prop] = value
  }
  return decls
}

/** Turn the static layout sheet into the object shape `addBase` accepts. */
function parseLayoutCss(css: string): Record<string, LayoutDecls> {
  const root: Record<string, LayoutDecls> = {}
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const stack: string[] = []
  let buffer = ''

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i]
    if (ch === '{') {
      stack.push(buffer.trim())
      buffer = ''
      continue
    }
    if (ch === '}') {
      const selector = stack.pop() ?? ''
      const body = buffer
      buffer = ''
      if (!selector || selector.startsWith('@')) continue
      const atRules = stack.filter((item) => item.startsWith('@'))
      const decls = declarationBlock(body)
      if (Object.keys(decls).length === 0) continue
      if (atRules.length === 1) {
        const at = atRules[0]!
        const nested = root[at] ?? {}
        nested[selector.trim()] = decls
        root[at] = nested
      } else if (atRules.length === 0) {
        root[selector.trim()] = { ...(root[selector.trim()] ?? {}), ...decls }
      }
      continue
    }
    buffer += ch
  }

  return root
}

export default tigercatPlugin
