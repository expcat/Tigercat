import type { ThemePresetName } from '@expcat/tigercat-core'
import { THEME_CONFIG_CSS_VARS, THEME_CSS_VARS } from '@expcat/tigercat-core'
import type { DemoCopy } from './app-config'

export interface DemoThemePreset {
  value: ThemePresetName
  label: DemoCopy
}

/** Product preset names — the example shell does not keep a parallel hex palette. */
export const DEMO_THEME_PRESETS: DemoThemePreset[] = [
  { value: 'default', label: { 'zh-CN': '默认', 'en-US': 'Default' } },
  { value: 'modern', label: { 'zh-CN': '现代', 'en-US': 'Modern' } },
  { value: 'vibrant', label: { 'zh-CN': '活力', 'en-US': 'Vibrant' } },
  { value: 'minimal', label: { 'zh-CN': '极简', 'en-US': 'Minimal' } },
  { value: 'high-contrast', label: { 'zh-CN': '高对比', 'en-US': 'High Contrast' } },
  { value: 'professional', label: { 'zh-CN': '专业', 'en-US': 'Professional' } },
  { value: 'natural', label: { 'zh-CN': '自然', 'en-US': 'Natural' } }
]

const PRESET_VALUES = new Set<string>(DEMO_THEME_PRESETS.map((preset) => preset.value))

const LEGACY_THEME_MAP: Record<string, ThemePresetName> = {
  green: 'natural',
  purple: 'vibrant',
  orange: 'professional',
  pink: 'minimal'
}

export function isDemoTheme(value: string): value is ThemePresetName {
  return PRESET_VALUES.has(value)
}

export function resolveDemoTheme(value: string | null | undefined): ThemePresetName {
  if (value && isDemoTheme(value)) return value
  if (value && LEGACY_THEME_MAP[value]) return LEGACY_THEME_MAP[value]
  return 'default'
}

const THEME_TOKEN_NAMES: readonly string[] = [
  ...Object.values(THEME_CSS_VARS),
  ...Object.values(THEME_CONFIG_CSS_VARS).flatMap((section) => Object.values(section)),
  '--tiger-transition-quick',
  '--tiger-transition-base',
  '--tiger-transition-emphasized',
  '--tiger-chart-split-1',
  '--tiger-chart-split-2'
]

/**
 * Snapshot computed `--tiger-*` tokens so a sandbox iframe can paint the same
 * theme before ConfigProvider's document owner writes them. Known token names
 * are read directly: `CSSStyleDeclaration` enumeration omits custom properties
 * in some engines, which left previews on the default preset.
 */
export function collectTigerCssVars(root: HTMLElement | null | undefined): string {
  if (!root || typeof getComputedStyle === 'undefined') return ''
  const style = getComputedStyle(root)
  const names = new Set<string>(THEME_TOKEN_NAMES)
  for (let index = 0; index < style.length; index++) {
    const name = style.item(index)
    if (name.startsWith('--tiger-')) names.add(name)
  }
  const parts: string[] = []
  for (const name of names) {
    const value = style.getPropertyValue(name).trim()
    if (value) parts.push(`${name}:${value}`)
  }
  return parts.join(';')
}
