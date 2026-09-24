import type { TigerLocale } from '../../types/locale'

interface TigerLocaleEntry {
  id: number
  locale?: Partial<TigerLocale>
}

export interface TigerLocaleHandle {
  update(locale?: Partial<TigerLocale>): void
  dispose(): void
}

export interface TigerLocaleScope {
  createHandle(locale?: Partial<TigerLocale>): TigerLocaleHandle
  getLocale(): Partial<TigerLocale> | undefined
  reset(): void
}

/**
 * Locale stack owned by one ConfigProvider (or one server request).
 * There is no module-level default stack.
 */
export function createTigerLocaleScope(): TigerLocaleScope {
  let nextId = 0
  const stack: TigerLocaleEntry[] = []

  return {
    createHandle(locale?: Partial<TigerLocale>): TigerLocaleHandle {
      const entry: TigerLocaleEntry = {
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
          if (index !== -1) stack.splice(index, 1)
        }
      }
    },
    getLocale(): Partial<TigerLocale> | undefined {
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        const locale = stack[index]?.locale
        if (locale) return locale
      }
      return undefined
    },
    reset() {
      stack.length = 0
      nextId = 0
    }
  }
}
