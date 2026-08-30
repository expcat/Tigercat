/**
 * Shared ConfigProvider resolution. Vue/React only bind context, lazy locale
 * state, and document ownership.
 */

import type { ColorScheme } from '../types/theme'
import type { ConfigProviderProps, TigerConfig } from '../types/config-provider'
import type { TigerLocale, TigerLocaleDirection } from '../types/locale'
import { mergeTigerLocale } from './i18n/locale-merge'
import { getLocaleDirection } from './locale-utils'

export type { ConfigProviderProps, TigerConfig }

export function resolveConfigDirection(input: {
  direction?: TigerLocaleDirection
  locale?: Partial<TigerLocale>
  parentDirection?: TigerLocaleDirection
}): TigerLocaleDirection | undefined {
  if (input.direction) return input.direction
  if (input.locale?.direction) return input.locale.direction
  if (input.locale?.locale) return getLocaleDirection(input.locale)
  return input.parentDirection
}

export interface ResolveTigerConfigInput {
  locale?: Partial<TigerLocale>
  localeLoading?: boolean
  localeLoadError?: Error
  direction?: TigerLocaleDirection
  theme?: string
  colorScheme?: ColorScheme
  parent?: TigerConfig
}

/**
 * Merge parent + self into one `TigerConfig`. `config.direction` and
 * `config.locale.direction` are the same resolution:
 * explicit prop → this layer's locale object → infer from this layer's locale
 * id → parent.
 */
export function resolveTigerConfig(input: ResolveTigerConfigInput): TigerConfig {
  const mergedLocale = mergeTigerLocale(input.parent?.locale, input.locale)
  const direction = resolveConfigDirection({
    direction: input.direction,
    locale: input.locale,
    parentDirection: input.parent?.direction
  })

  if (mergedLocale && direction) {
    mergedLocale.direction = direction
  }

  return {
    locale: mergedLocale,
    localeLoading: Boolean(input.localeLoading) || Boolean(input.parent?.localeLoading),
    localeLoadError: input.localeLoadError ?? input.parent?.localeLoadError,
    direction,
    theme: input.theme ?? input.parent?.theme,
    colorScheme: input.colorScheme ?? input.parent?.colorScheme
  }
}
