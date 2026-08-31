/**
 * ColorPicker shared types.
 *
 * Stored value is a CSS color string in `format` (`hex` / `rgb` / `hsl`).
 * Unselected is `undefined`. Clear writes `''`. Hex with alpha uses 8 digits.
 */
import type { ComponentSize } from './base'
import type { InputStatus } from './input'
import type { TigerLocale, TigerLocaleColorPicker } from './locale'
import type { FloatingPlacement } from '../utils/floating'

/**
 * Color format written on commit
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl'

/**
 * Shared ColorPicker props. React adds `value`/`onChange` aliases already
 * listed here; Vue binds `modelValue` / `update:modelValue` and
 * `open` / `update:open`.
 */
export interface ColorPickerProps {
  /** Locale object merged on top of ConfigProvider. Do not pass a language id. */
  locale?: Partial<TigerLocale>
  /**
   * UI labels for trigger / panel title / clear and panel chrome.
   * Takes precedence over `locale` and global ConfigProvider text.
   */
  labels?: Partial<TigerLocaleColorPicker>
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * @default 'md'
   */
  size?: ComponentSize
  /**
   * @default false
   */
  showAlpha?: boolean
  /**
   * Format of committed values. Hue / SV / alpha / text / presets all emit this format.
   * Hex with alpha uses `#rrggbbaa`.
   * @default 'hex'
   */
  format?: ColorFormat
  /** Preset colors rendered with ColorSwatch */
  presets?: string[]
  /** Controlled color. `undefined` is unselected; `''` is cleared. */
  value?: string
  defaultValue?: string
  open?: boolean
  /**
   * @default false
   */
  defaultOpen?: boolean
  /**
   * @default true
   */
  clearable?: boolean
  /**
   * Close the panel after picking a preset.
   * @default true
   */
  closeOnSelect?: boolean
  name?: string
  id?: string
  status?: InputStatus
  /**
   * @default 'bottom-start'
   */
  placement?: FloatingPlacement
  /**
   * @default 4
   */
  offset?: number
  dropdownClassName?: string
  getPopupContainer?: () => HTMLElement | null
  onChange?: (value: string) => void
  onOpenChange?: (open: boolean) => void
  className?: string
}

export interface ColorPickerRef {
  focus: () => void
  open: () => void
  close: () => void
}
