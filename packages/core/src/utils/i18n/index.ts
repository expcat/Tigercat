/**
 * Internationalization (i18n) utilities
 *
 * Locale resolution, label constants, and translation helpers.
 *
 * NOTE: Locale presets (enUS, zhCN, etc.) are NOT re-exported here to
 * enable tree-shaking.  Import them via subpath entries:
 *
 *   import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
 */

export * from '../locale-utils'
export * from '../datepicker-i18n'
export {
  getTimePickerLabels,
  getTimePickerOptionAriaLabel,
  type TimePickerOptionUnit
} from '../timepicker-utils'
export * from '../upload-labels'
export { defineLocale } from './define-locale'
export { defineText } from './define-text'
export { createTigerLocaleScope } from './global-locale'
export type { TigerLocaleHandle, TigerLocaleScope } from './global-locale'
export {
  feedbackLayoutLabels,
  formatFeedbackLayoutLabel
} from './w9/feedback-layout-labels'
export type { FeedbackLayoutLabels } from './w9/feedback-layout-labels'
export { navLabels, formatNavLabel } from './w9/nav-labels'
export type { NavLabels } from './w9/nav-labels'
