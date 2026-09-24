import type { TigerLocale } from '../types/locale'
import type { UploadLabels } from '../types/upload'
import { resolveLocaleSection } from './locale-utils'


export type UploadLabelOverrides = Partial<UploadLabels>

export function interpolateUploadLabel(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = params[key]
    return typeof value === 'string' ? value : ''
  })
}

export const uploadQueuedStatusText = 'Queued'
export const uploadRetryFileAriaLabel = 'Retry {fileName}'
export const uploadSingleFileText = 'Only the first file was kept.'

export function getUploadLabels(
  locale?: Partial<TigerLocale>,
  overrides?: UploadLabelOverrides
): UploadLabels {
  return resolveLocaleSection((locale?.upload ?? {}) as UploadLabels, undefined, overrides)
}
