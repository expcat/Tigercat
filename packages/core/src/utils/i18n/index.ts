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
export { defineLocale, defineText } from './define-locale'
