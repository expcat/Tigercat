/**
 * Document ownership for ConfigProvider.
 *
 * Only outermost (or sibling-root) providers write `html` dir / theme.
 * Nested providers stay in context. A stack of owners restores the previous
 * owner on dispose, or the pre-provider snapshot when the stack is empty.
 */

import { registerBuiltInThemes, ThemeManager } from '../themes/manager'
import type { ColorScheme } from '../types/theme'
import type { TigerLocaleDirection } from '../types/locale'
import { isBrowser } from './env'

export interface DocumentConfigValues {
  theme?: string
  colorScheme?: ColorScheme
  direction?: TigerLocaleDirection
  lang?: string
}

export interface DocumentConfigHandle {
  apply(values: DocumentConfigValues, options?: { hydrateAuto?: boolean }): void
  dispose(): void
}

interface DocumentBaseline {
  dir: string | null
  dataTigerDir: string | null
  lang: string | null
  theme: string
  colorScheme: ColorScheme
}

interface DocumentOwnerEntry {
  id: number
  values: DocumentConfigValues
}

let nextId = 0
const stack: DocumentOwnerEntry[] = []
let baseline: DocumentBaseline | null = null

function snapshotBaseline(): void {
  baseline = {
    dir: isBrowser() ? document.documentElement.getAttribute('dir') : null,
    dataTigerDir: isBrowser() ? document.documentElement.getAttribute('data-tiger-dir') : null,
    lang: isBrowser() ? document.documentElement.getAttribute('lang') : null,
    theme: ThemeManager.getCurrentTheme(),
    colorScheme: ThemeManager.getColorScheme()
  }
}

function writeDirection(direction?: TigerLocaleDirection): void {
  if (!direction || !isBrowser()) return
  const root = document.documentElement
  root.setAttribute('dir', direction)
  root.setAttribute('data-tiger-dir', direction)
}

function writeLang(lang?: string): void {
  if (!lang || !isBrowser()) return
  document.documentElement.setAttribute('lang', lang)
}

function applyValues(values: DocumentConfigValues, options?: { hydrateAuto?: boolean }): void {
  registerBuiltInThemes()

  if (values.theme) ThemeManager.setTheme(values.theme)

  if (values.colorScheme) {
    if (values.colorScheme === 'auto' && options?.hydrateAuto) {
      ThemeManager.setColorScheme('auto', { applyResolved: false })
    } else {
      ThemeManager.setColorScheme(values.colorScheme)
    }
  }

  writeDirection(values.direction)
  writeLang(values.lang)
}

function restoreBaseline(): void {
  if (!baseline) return

  ThemeManager.setTheme(baseline.theme)
  ThemeManager.setColorScheme(baseline.colorScheme)

  if (isBrowser()) {
    const root = document.documentElement
    if (baseline.dir === null) root.removeAttribute('dir')
    else root.setAttribute('dir', baseline.dir)
    if (baseline.dataTigerDir === null) root.removeAttribute('data-tiger-dir')
    else root.setAttribute('data-tiger-dir', baseline.dataTigerDir)
    if (baseline.lang === null) root.removeAttribute('lang')
    else root.setAttribute('lang', baseline.lang)
  }

  baseline = null
}

export function createDocumentConfigHandle(): DocumentConfigHandle {
  const entry: DocumentOwnerEntry = {
    id: ++nextId,
    values: {}
  }

  if (stack.length === 0) snapshotBaseline()
  stack.push(entry)

  return {
    apply(values, options) {
      entry.values = values
      if (stack[stack.length - 1] === entry) {
        applyValues(values, options)
      }
    },
    dispose() {
      const index = stack.findIndex((item) => item.id === entry.id)
      if (index === -1) return
      const wasTop = index === stack.length - 1
      stack.splice(index, 1)

      if (stack.length === 0) {
        restoreBaseline()
        return
      }

      if (wasTop) {
        applyValues(stack[stack.length - 1]!.values)
      }
    }
  }
}

export function resetDocumentConfigScope(): void {
  stack.length = 0
  if (baseline) restoreBaseline()
  nextId = 0
}
