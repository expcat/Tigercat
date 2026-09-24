/**
 * Build a complete locale by deep-merging `overrides` onto a caller-supplied base.
 * The English table is not imported here; pass `enUS` from
 * `@expcat/tigercat-core/locales/en-US` (or another full locale) as `base`.
 */

import type { TigerLocale } from '../../types/locale'
import { deepMergeLocale } from './locale-merge'

export function defineLocale(overrides: Partial<TigerLocale>, base: TigerLocale): TigerLocale {
  return deepMergeLocale(base, overrides) as TigerLocale
}
