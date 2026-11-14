import { getUploadLabels } from '../../upload-labels'
import type { TigerLocale } from '../../../types/locale'
import {
  getCommonLabels,
  getSelectLabels,
  getTagsInputLabels,
  getFormValidationLabels,
  getSliderLabels,
  getCronEditorLabels,
  getColorPickerLabels,
  getSignatureLabels,
  getTransferLabels
} from '../../locale-utils'

export interface W9FormLabels {
  selectAll: string
  maxCountReached: string
  collapsedTags: string
  tagDuplicate: string
  tagMax: string
  tagRejected: string
  errorSummary: string
  sliderValue: string
  cronSentence: string
  cronNext: string
  keyboardClose: string
  eyedropper: string
  recentColors: string
  colorHex: string
  colorRgb: string
  colorHsl: string
  signatureHasStrokes: string
  signatureRedo: string
  uploadDirectory: string
  transferPage: string
}

/** Reads standard locale sections from an already merged locale object. */
export function getW9FormLabels(locale?: Partial<TigerLocale>): W9FormLabels {
  const common = getCommonLabels(locale)
  const select = getSelectLabels(locale)
  const tags = getTagsInputLabels(locale)
  const color = getColorPickerLabels(locale)
  const signature = getSignatureLabels(locale)
  return {
    selectAll: select.selectAllText,
    maxCountReached: select.maxCountText,
    collapsedTags: select.collapsedTagsText,
    tagDuplicate: tags.duplicateText,
    tagMax: tags.limitText,
    tagRejected: tags.rejectedText,
    errorSummary: getFormValidationLabels(locale).errorSummary,
    sliderValue: getSliderLabels(locale).valueText,
    cronSentence: '{sentence}',
    cronNext: getCronEditorLabels(locale).nextRunText,
    keyboardClose: common.closeText,
    eyedropper: color.eyedropperText,
    recentColors: color.recentColorsText,
    colorHex: color.formatHex,
    colorRgb: color.formatRgb,
    colorHsl: color.formatHsl,
    signatureHasStrokes: signature.hasStrokesText,
    signatureRedo: signature.redoText,
    uploadDirectory: getUploadLabels(locale).selectDirectoryText,
    transferPage: getTransferLabels(locale).pageText
  }
}
