import type { ColorScheme, ThemePresetName } from '@expcat/tigercat-core'
import type { DemoLang } from './app-config'
import { resolveDemoTheme } from './themes'

export const DEMO_LANG_STORAGE_KEY = 'tigercat-example-lang'
export const DEMO_THEME_STORAGE_KEY = 'tigercat-example-theme'
export const DEMO_SIDER_COLLAPSED_STORAGE_KEY = 'tigercat-example-sider-collapsed'
export const DEMO_DARK_MODE_STORAGE_KEY = 'tigercat-example-dark'

export function getStoredLang(): DemoLang {
  if (typeof window === 'undefined') return 'zh-CN'

  const raw = window.localStorage.getItem(DEMO_LANG_STORAGE_KEY)
  if (raw === 'zh-CN' || raw === 'zh-TW' || raw === 'en-US') return raw

  const nav = (navigator.language || '').toLowerCase()
  if (nav === 'zh-tw' || nav === 'zh-hk' || nav === 'zh-mo') return 'zh-TW'
  if (nav.startsWith('zh')) return 'zh-CN'
  return 'en-US'
}

export function setStoredLang(lang: DemoLang) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEMO_LANG_STORAGE_KEY, lang)
  document.documentElement.lang = lang
}

export function getStoredTheme(): ThemePresetName {
  if (typeof window === 'undefined') return 'default'
  return resolveDemoTheme(window.localStorage.getItem(DEMO_THEME_STORAGE_KEY))
}

export function setStoredTheme(themeValue: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEMO_THEME_STORAGE_KEY, resolveDemoTheme(themeValue))
}

export function getStoredSiderCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(DEMO_SIDER_COLLAPSED_STORAGE_KEY) === '1'
}

export function setStoredSiderCollapsed(collapsed: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEMO_SIDER_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0')
}

export function getStoredDarkMode(): boolean {
  if (typeof window === 'undefined') return false
  const raw = window.localStorage.getItem(DEMO_DARK_MODE_STORAGE_KEY)
  if (raw === '1') return true
  if (raw === '0') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function setStoredDarkMode(enabled: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEMO_DARK_MODE_STORAGE_KEY, enabled ? '1' : '0')
}

export function getStoredColorScheme(): ColorScheme {
  return getStoredDarkMode() ? 'dark' : 'light'
}
