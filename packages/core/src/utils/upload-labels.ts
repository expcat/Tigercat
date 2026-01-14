import type { TigerLocale } from '../types/locale'
import type { UploadLabels } from '../types/upload'
import { resolveLocaleText } from './locale-utils'

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
      'Upload file by clicking or dragging',
      overrides?.dragAreaAriaLabel,
      locale?.upload?.dragAreaAriaLabel
    ),
    buttonAriaLabel: resolveLocaleText(
      'Upload file',
      overrides?.buttonAriaLabel,
      locale?.upload?.buttonAriaLabel
    ),
    clickToUploadText: resolveLocaleText(
      'Click to upload',
      overrides?.clickToUploadText,
      locale?.upload?.clickToUploadText
    ),
    dragAndDropText: resolveLocaleText(
      'or drag and drop',
      overrides?.dragAndDropText,
      locale?.upload?.dragAndDropText
    ),
    acceptInfoText: resolveLocaleText(
      'Accepted: {accept}',
      overrides?.acceptInfoText,
      locale?.upload?.acceptInfoText
    ),
    maxSizeInfoText: resolveLocaleText(
      'Max size: {maxSize}',
      overrides?.maxSizeInfoText,
      locale?.upload?.maxSizeInfoText
    ),
    selectFileText: resolveLocaleText(
      'Select File',
      overrides?.selectFileText,
      locale?.upload?.selectFileText
    ),
    uploadedFilesAriaLabel: resolveLocaleText(
      'Uploaded files',
      overrides?.uploadedFilesAriaLabel,
      locale?.upload?.uploadedFilesAriaLabel
    ),
    successAriaLabel: resolveLocaleText(
      'Success',
      overrides?.successAriaLabel,
      locale?.upload?.successAriaLabel
    ),
    errorAriaLabel: resolveLocaleText(
      'Error',
      overrides?.errorAriaLabel,
      locale?.upload?.errorAriaLabel
    ),
    uploadingAriaLabel: resolveLocaleText(
      'Uploading',
      overrides?.uploadingAriaLabel,
      locale?.upload?.uploadingAriaLabel
    ),
    removeFileAriaLabel: resolveLocaleText(
      'Remove {fileName}',
      overrides?.removeFileAriaLabel,
      locale?.upload?.removeFileAriaLabel
    ),
    previewFileAriaLabel: resolveLocaleText(
      'Preview {fileName}',
      overrides?.previewFileAriaLabel,
      locale?.upload?.previewFileAriaLabel
    )
  }
}
