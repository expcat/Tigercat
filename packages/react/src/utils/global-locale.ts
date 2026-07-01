import type { TigerLocale } from '@expcat/tigercat-core'

interface GlobalTigerLocaleEntry {
  id: number
  locale?: Partial<TigerLocale>
}

export interface GlobalTigerLocaleHandle {
  update(locale?: Partial<TigerLocale>): void
  dispose(): void
}

let nextGlobalTigerLocaleId = 0
const globalTigerLocaleStack: GlobalTigerLocaleEntry[] = []

export function createGlobalTigerLocaleHandle(
  locale?: Partial<TigerLocale>
): GlobalTigerLocaleHandle {
  const entry: GlobalTigerLocaleEntry = {
    id: ++nextGlobalTigerLocaleId,
    locale
  }
  globalTigerLocaleStack.push(entry)

  return {
    update(nextLocale?: Partial<TigerLocale>) {
      entry.locale = nextLocale
    },
    dispose() {
      const index = globalTigerLocaleStack.findIndex((item) => item.id === entry.id)
      if (index !== -1) {
        globalTigerLocaleStack.splice(index, 1)
      }
    }
  }
}

export function getGlobalTigerLocale(): Partial<TigerLocale> | undefined {
  for (let index = globalTigerLocaleStack.length - 1; index >= 0; index -= 1) {
    const locale = globalTigerLocaleStack[index]?.locale
    if (locale) {
      return locale
    }
  }
  return undefined
}
