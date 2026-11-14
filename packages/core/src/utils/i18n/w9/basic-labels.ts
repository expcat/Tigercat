import type { TigerLocale } from '../../../types/locale'
import {
  getAvatarGroupLabels,
  getCodeLabels,
  getImageCompareLabels,
  getImageEditorLabels,
  getImageLabels,
  getImageViewerLabels,
  getQRCodeLabels
} from '../../locale-utils'

export type BasicLabelGroup =
  'imagePreview' | 'avatarGroup' | 'qrcode' | 'code' | 'imageCropper' | 'imageCompare' | 'gallery'

/** Reads standard locale sections. Pass the merged locale object, not a language id. */
export function basicLabel(
  locale: Partial<TigerLocale> | undefined,
  group: BasicLabelGroup,
  key: string
): string {
  const viewer = getImageViewerLabels(locale)
  const code = getCodeLabels(locale)
  const editor = getImageEditorLabels(locale)
  const image = getImageLabels(locale)
  const compare = getImageCompareLabels(locale)
  const labels: Record<BasicLabelGroup, Record<string, string>> = {
    imagePreview: {
      flipHorizontal: viewer.flipHorizontalAriaLabel,
      download: viewer.downloadAriaLabel,
      resetScale: viewer.originalSizeAriaLabel
    },
    avatarGroup: { overflowList: getAvatarGroupLabels(locale).overflowListAriaLabel },
    qrcode: { scanned: getQRCodeLabels(locale).scannedText },
    code: { wrap: code.wrapLabel, nowrap: code.nowrapLabel, language: code.languageLabel },
    imageCropper: {
      aspect: editor.cropAspectAriaLabel,
      free: editor.cropFreeText,
      square: '1:1',
      fourThree: '4:3',
      sixteenNine: '16:9',
      rotate: editor.cropRotateText,
      flip: editor.cropFlipText,
      circle: editor.cropCircleText
    },
    imageCompare: { before: compare.beforeAlt, after: compare.afterAlt },
    gallery: {
      list: image.galleryListAriaLabel,
      count: '{current} / {total}',
      open: image.galleryOpenAriaLabel
    }
  }
  return labels[group][key] ?? key
}
