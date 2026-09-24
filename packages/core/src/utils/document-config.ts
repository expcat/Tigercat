/**
 * Document attributes for one ConfigProvider root.
 *
 * Owners are stored on the element they write, not on a module-level stack,
 * so two documents (and two SSR requests) cannot clear each other. A later
 * sibling stays current when an earlier root unmounts. The last living owner
 * restores the snapshot taken before the first owner wrote.
 */

import { createTigerThemeScope, type TigerThemeScope } from '../themes/manager'
import type { ColorScheme } from '../types/theme'
import type { TigerLocale, TigerLocaleDirection } from '../types/locale'
import { isBrowser } from './env'

export interface DocumentConfigValues {
  theme?: string
  colorScheme?: ColorScheme
  direction?: TigerLocaleDirection
  lang?: string
}

export interface DocumentConfigHandle {
  apply(values: DocumentConfigValues): void
  /** Locale for imperative hosts. Stored on this owner, not a process-wide stack. */
  setLocale(locale: Partial<TigerLocale> | undefined): void
  dispose(): void
  readonly themeScope: TigerThemeScope
}

interface DocumentSnapshot {
  dir: string | null
  dataTigerDir: string | null
  lang: string | null
  theme: string | null
  colorScheme: string | null
  darkClass: boolean
  colorSchemeStyle: string
}

interface OwnerEntry {
  id: number
  values: DocumentConfigValues
  themeScope: TigerThemeScope
  locale?: Partial<TigerLocale>
}

interface OwnerState {
  baseline: DocumentSnapshot
  owners: OwnerEntry[]
  nextId: number
}

/** Shared with test document reset. Not a process-wide owner stack. */
export const DOCUMENT_OWNER_STATE = Symbol.for('tigercat.documentOwners')

type OwnerHost = HTMLElement & { [DOCUMENT_OWNER_STATE]?: OwnerState }

function readOwners(root: HTMLElement): OwnerState | undefined {
  return (root as OwnerHost)[DOCUMENT_OWNER_STATE]
}

function writeOwners(root: HTMLElement, state: OwnerState | undefined): void {
  const host = root as OwnerHost
  if (state) host[DOCUMENT_OWNER_STATE] = state
  else delete host[DOCUMENT_OWNER_STATE]
}

function ensureOwners(root: HTMLElement): OwnerState {
  const existing = readOwners(root)
  if (existing) return existing
  const state: OwnerState = { baseline: snapshot(root), owners: [], nextId: 0 }
  writeOwners(root, state)
  return state
}

function snapshot(root: HTMLElement): DocumentSnapshot {
  return {
    dir: root.getAttribute('dir'),
    dataTigerDir: root.getAttribute('data-tiger-dir'),
    lang: root.getAttribute('lang'),
    theme: root.getAttribute('data-tiger-theme'),
    colorScheme: root.getAttribute('data-tiger-color-scheme'),
    darkClass: root.classList.contains('dark'),
    colorSchemeStyle: root.style.colorScheme
  }
}

function restore(root: HTMLElement, previous: DocumentSnapshot): void {
  if (previous.dir === null) root.removeAttribute('dir')
  else root.setAttribute('dir', previous.dir)
  if (previous.dataTigerDir === null) root.removeAttribute('data-tiger-dir')
  else root.setAttribute('data-tiger-dir', previous.dataTigerDir)
  if (previous.lang === null) root.removeAttribute('lang')
  else root.setAttribute('lang', previous.lang)
  if (previous.theme === null) root.removeAttribute('data-tiger-theme')
  else root.setAttribute('data-tiger-theme', previous.theme)
  if (previous.colorScheme === null) root.removeAttribute('data-tiger-color-scheme')
  else root.setAttribute('data-tiger-color-scheme', previous.colorScheme)
  root.classList.toggle('dark', previous.darkClass)
  root.style.colorScheme = previous.colorSchemeStyle
}

function paintOwner(root: HTMLElement, state: OwnerState): void {
  const current = state.owners[state.owners.length - 1]
  restore(root, state.baseline)
  if (!current) return
  const values = current.values
  if (values.theme) current.themeScope.setTheme(values.theme)
  if (values.colorScheme) current.themeScope.setColorScheme(values.colorScheme)
  else current.themeScope.apply()
  if (values.direction) {
    root.setAttribute('dir', values.direction)
    root.setAttribute('data-tiger-dir', values.direction)
  }
  if (values.lang) root.setAttribute('lang', values.lang)
}

function copyValues(values: DocumentConfigValues): DocumentConfigValues {
  return {
    theme: values.theme,
    colorScheme: values.colorScheme,
    direction: values.direction,
    lang: values.lang
  }
}

/** Locale of the current document owner. Empty when no owner is mounted. */
export function readDocumentOwnerLocale(
  root?: HTMLElement | null
): Partial<TigerLocale> | undefined {
  const target = root === undefined ? (isBrowser() ? document.documentElement : null) : root
  if (!target) return undefined
  const owners = readOwners(target)?.owners
  if (!owners?.length) return undefined
  return owners[owners.length - 1]?.locale
}

export function createDocumentConfigHandle(root?: HTMLElement | null): DocumentConfigHandle {
  const target = root === undefined ? (isBrowser() ? document.documentElement : null) : root
  const themeScope = createTigerThemeScope({
    root: target,
    colorScheme: 'auto'
  })
  let entry: OwnerEntry | null = null
  let disposed = false

  if (target) {
    const state = ensureOwners(target)
    entry = { id: ++state.nextId, values: {}, themeScope }
    state.owners.push(entry)
  }

  return {
    themeScope,
    setLocale(locale) {
      if (disposed || !entry) return
      entry.locale = locale
    },
    apply(values) {
      if (disposed) return
      if (!target || !entry) {
        if (values.theme) themeScope.setTheme(values.theme)
        if (values.colorScheme) themeScope.setColorScheme(values.colorScheme)
        else themeScope.apply()
        return
      }
      entry.values = copyValues(values)
      const state = readOwners(target)
      if (state && state.owners[state.owners.length - 1] === entry) {
        paintOwner(target, state)
      }
    },
    dispose() {
      if (disposed) return
      disposed = true
      if (!target || !entry) {
        themeScope.dispose()
        return
      }
      const state = readOwners(target)
      const wasCurrent = state?.owners[state.owners.length - 1] === entry
      const baseline = state?.baseline ?? null
      if (state) {
        state.owners = state.owners.filter((owner) => owner !== entry)
        if (state.owners.length === 0) writeOwners(target, undefined)
      }
      themeScope.dispose()
      if (!wasCurrent) return
      const remaining = readOwners(target)
      if (remaining && remaining.owners.length > 0) {
        paintOwner(target, remaining)
        return
      }
      if (baseline) restore(target, baseline)
    }
  }
}
