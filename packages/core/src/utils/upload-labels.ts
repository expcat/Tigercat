import type { TigerLocale } from '../types/locale'
import type { UploadLabels } from '../types/upload'
import { resolveLocaleText, DEFAULT_UPLOAD_LABELS } from './locale-utils'

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
  return {
    dragAreaAriaLabel: resolveLocaleText(
      DEFAULT_UPLOAD_LABELS.dragAreaAriaLabel,
      overrides?.dragAreaAriaLabel,
      locale?.upload?.dragAreaAriaLabel
    ),
    buttonAriaLabel: resolveLocaleText(
      DEFAULT_UPLOAD_LABELS.buttonAriaLabel,
      overrides?.buttonAriaLabel,
      locale?.upload?.buttonAriaLabel
    ),
    clickToUploadText: resolveLocaleText(
      DEFAULT_UPLOAD_LABELS.clickToUploadText,
      overrides?.clickToUploadText,
      locale?.upload?.clickToUploadText
    ),
    dragAndDropText: resolveLocaleText(
      DEFAULT_UPLOAD_LABELS.dragAndDropText,
      overrides?.dragAndDropText,
      locale?.upload?.dragAndDropText
    ),
    acceptInfoText: resolveLocaleText(
      DEFAULT_UPLOAD_LABELS.acceptInfoText,
      overrides?.acceptInfoText,
      locale?.upload?.acceptInfoText
    ),
    maxSizeInfoText: resolveLocaleText(
      DEFAULT_UPLOAD_LABELS.maxSizeInfoText,
      overrides?.maxSizeInfoText,
      locale?.upload?.maxSizeInfoText
    ),
    selectFileText: resolveLocaleText(
      DEFAULT_UPLOAD_LABELS.selectFileText,
      overrides?.selectFileText,
      locale?.upload?.selectFileText
    ),
    uploadedFilesAriaLabel: resolveLocaleText(
      DEFAULT_UPLOAD_LABELS.uploadedFilesAriaLabel,
      overrides?.uploadedFilesAriaLabel,
      locale?.upload?.uploadedFilesAriaLabel
    ),
    successAriaLabel: resolveLocaleText(
      DEFAULT_UPLOAD_LABELS.successAriaLabel,
      overrides?.successAriaLabel,
      locale?.upload?.successAriaLabel
    ),
    errorAriaLabel: resolveLocaleText(
      DEFAULT_UPLOAD_LABELS.errorAriaLabel,
      overrides?.errorAriaLabel,
      locale?.upload?.errorAriaLabel
    ),
    uploadingAriaLabel: resolveLocaleText(
      DEFAULT_UPLOAD_LABELS.uploadingAriaLabel,
      overrides?.uploadingAriaLabel,
      locale?.upload?.uploadingAriaLabel
    ),
    removeFileAriaLabel: resolveLocaleText(
      DEFAULT_UPLOAD_LABELS.removeFileAriaLabel,
      overrides?.removeFileAriaLabel,
      locale?.upload?.removeFileAriaLabel
    ),
    previewFileAriaLabel: resolveLocaleText(
      DEFAULT_UPLOAD_LABELS.previewFileAriaLabel,
      overrides?.previewFileAriaLabel,
      locale?.upload?.previewFileAriaLabel
    )
  }
}
