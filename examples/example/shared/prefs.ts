import type { DemoLang } from './app-config'

export const DEMO_LANG_STORAGE_KEY = 'tigercat-example-lang'
export const DEMO_THEME_STORAGE_KEY = 'tigercat-example-theme'
export const DEMO_SIDER_COLLAPSED_STORAGE_KEY = 'tigercat-example-sider-collapsed'
export const DEMO_NAV_GROUPS_COLLAPSED_STORAGE_KEY = 'tigercat-example-nav-groups-collapsed'
export const DEMO_DARK_MODE_STORAGE_KEY = 'tigercat-example-dark'
export const DEMO_MODERN_STYLE_STORAGE_KEY = 'tigercat-example-modern'

export function getStoredLang(): DemoLang {
  if (typeof window === 'undefined') return 'zh-CN'

  const raw = window.localStorage.getItem(DEMO_LANG_STORAGE_KEY)
  if (raw === 'zh-CN' || raw === 'en-US') return raw

  const nav = (navigator.language || '').toLowerCase()
  return nav.startsWith('zh') ? 'zh-CN' : 'en-US'
}

export function setStoredLang(lang: DemoLang) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEMO_LANG_STORAGE_KEY, lang)
  document.documentElement.lang = lang
}

export function getStoredTheme(): string {
  if (typeof window === 'undefined') return 'default'
  return window.localStorage.getItem(DEMO_THEME_STORAGE_KEY) || 'default'
}

export function setStoredTheme(themeValue: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEMO_THEME_STORAGE_KEY, themeValue)
}

export function getStoredSiderCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(DEMO_SIDER_COLLAPSED_STORAGE_KEY) === '1'
}

export function setStoredSiderCollapsed(collapsed: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEMO_SIDER_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0')
}

export function getStoredCollapsedNavGroups(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}

  const raw = window.localStorage.getItem(DEMO_NAV_GROUPS_COLLAPSED_STORAGE_KEY)
  if (!raw) return {}

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}

    const record: Record<string, boolean> = {}
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'boolean') record[key] = value
    }
    return record
  } catch {
    return {}
  }
}

export function setStoredCollapsedNavGroups(groups: Record<string, boolean>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEMO_NAV_GROUPS_COLLAPSED_STORAGE_KEY, JSON.stringify(groups))
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

export function applyDarkMode(enabled: boolean) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', enabled)
}

export function getStoredModernStyle(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(DEMO_MODERN_STYLE_STORAGE_KEY) === '1'
}

export function setStoredModernStyle(enabled: boolean) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DEMO_MODERN_STYLE_STORAGE_KEY, enabled ? '1' : '0')
}

export function applyModernStyle(enabled: boolean) {
  if (typeof document === 'undefined') return
  if (enabled) {
    document.documentElement.setAttribute('data-tiger-style', 'modern')
  } else {
    document.documentElement.removeAttribute('data-tiger-style')
  }
}
