import type { TigerLocale } from '../types/locale'
import type { UploadLabels } from '../types/upload'
import { resolveLocaleSection } from './locale-utils'
import { enUS } from './i18n/locales/en-US'

export type UploadLabelOverrides = Partial<UploadLabels>

export function interpolateUploadLabel(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = params[key]
    return typeof value === 'string' ? value : ''
  })
}

export function getUploadLabels(
  locale?: Partial<TigerLocale>,
  overrides?: UploadLabelOverrides
): UploadLabels {
  return resolveLocaleSection(enUS.upload as UploadLabels, locale?.upload, overrides)
}
