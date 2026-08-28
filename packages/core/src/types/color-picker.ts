/**
 * ColorPicker size variants
 */
import type { ComponentSize } from './base'
import type { TigerLocale, TigerLocaleColorPicker } from './locale'

/**
 * Color format
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl'

/**
 * Shared ColorPicker props (framework-agnostic)
 */
export interface ColorPickerProps {
  /** Locale override merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /**
   * UI labels for trigger / panel title / clear and panel chrome.
   * Takes precedence over `locale` and global ConfigProvider text.
   */
  labels?: Partial<TigerLocaleColorPicker>
  /** Whether the picker is disabled */
  disabled?: boolean
  /** Component size */
  size?: ComponentSize
  /** Whether to show alpha channel */
  showAlpha?: boolean
  /** Default format for input display */
  format?: ColorFormat
  /** Preset color swatches */
  presets?: string[]
  /** Custom class name */
  className?: string
}
