import type { ThemePresetName } from '@expcat/tigercat-core'
import type { DemoLang } from './app-config'

export interface DemoThemePreset {
  value: ThemePresetName
  label: Record<DemoLang, string>
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

/** Snapshot computed `--tiger-*` tokens so a sandbox iframe can paint the same theme. */
export function collectTigerCssVars(root: HTMLElement | null | undefined): string {
  if (!root || typeof getComputedStyle === 'undefined') return ''
  const style = getComputedStyle(root)
  const parts: string[] = []
  for (let index = 0; index < style.length; index++) {
    const name = style.item(index)
    if (name.startsWith('--tiger-')) {
      parts.push(`${name}:${style.getPropertyValue(name).trim()}`)
    }
  }
  return parts.join(';')
}
