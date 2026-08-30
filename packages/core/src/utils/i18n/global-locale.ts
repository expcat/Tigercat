import type { TigerLocale } from '../../types/locale'
import { isBrowser } from '../env'

interface GlobalTigerLocaleEntry {
  id: number
  locale?: Partial<TigerLocale>
}

export interface GlobalTigerLocaleHandle {
  update(locale?: Partial<TigerLocale>): void
  dispose(): void
}

export interface TigerLocaleScope {
  createHandle(locale?: Partial<TigerLocale>): GlobalTigerLocaleHandle
  getLocale(): Partial<TigerLocale> | undefined
  reset(): void
}

export function createTigerLocaleScope(): TigerLocaleScope {
  let nextId = 0
  const stack: GlobalTigerLocaleEntry[] = []

  return {
    createHandle(locale?: Partial<TigerLocale>): GlobalTigerLocaleHandle {
      const entry: GlobalTigerLocaleEntry = {
        id: ++nextId,
        locale
      }
      stack.push(entry)

      return {
        update(nextLocale?: Partial<TigerLocale>) {
          entry.locale = nextLocale
        },
        dispose() {
          const index = stack.findIndex((item) => item.id === entry.id)
          if (index !== -1) {
            stack.splice(index, 1)
          }
        }
      }
    },
    getLocale(): Partial<TigerLocale> | undefined {
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        const locale = stack[index]?.locale
        if (locale) {
          return locale
        }
      }
      return undefined
    },
    reset() {
      stack.length = 0
      nextId = 0
    }
  }
}

/**
 * Browser keeps a shared default scope so imperative APIs can read the
 * ConfigProvider locale. Node does not install that default: callers must
 * create a scope (or tests must reset) so SSR requests do not share a
 * process-wide stack.
 */
let defaultScope: TigerLocaleScope | undefined

function getDefaultScope(): TigerLocaleScope {
  if (!defaultScope) {
    defaultScope = createTigerLocaleScope()
  }
  return defaultScope
}

export function createGlobalTigerLocaleHandle(
  locale?: Partial<TigerLocale>
): GlobalTigerLocaleHandle {
  return getDefaultScope().createHandle(locale)
}

export function getGlobalTigerLocale(): Partial<TigerLocale> | undefined {
  if (!isBrowser() && !defaultScope) {
    return undefined
  }
  return getDefaultScope().getLocale()
}

export function resetTigerLocaleScope(): void {
  defaultScope?.reset()
  if (!isBrowser()) {
    defaultScope = undefined
  }
}
