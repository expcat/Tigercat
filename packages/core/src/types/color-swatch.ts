import type { ComponentSize } from './base'
import type { InputStatus } from './input'
import type { TigerLocale, TigerLocaleColorPicker } from './locale'

export interface ColorSwatchOption {
  value: string
  label?: string
  disabled?: boolean
}

export type ColorSwatchOptionInput = string | ColorSwatchOption

export interface ColorSwatchGroup {
  label?: string
  colors: ColorSwatchOptionInput[]
}

export interface ColorSwatchNormalizedOption extends ColorSwatchOption {
  index: number
  groupIndex: number
}

export interface ColorSwatchNormalizedGroup {
  label?: string
  colors: ColorSwatchNormalizedOption[]
}

/**
 * Shared ColorSwatch props. Vue binds `modelValue` / `update:modelValue`.
 * Unselected is `undefined`. Empty `colors={[]}` renders no radiogroup.
 */
export interface ColorSwatchProps {
  disabled?: boolean
  size?: ComponentSize
  colors?: ColorSwatchOptionInput[]
  groups?: ColorSwatchGroup[]
  /**
   * Visual columns of the **current group** grid. ArrowUp/Down stay in that grid.
   * @default 6
   */
  columns?: number
  ariaLabel?: string
  className?: string
  value?: string
  defaultValue?: string
  /** Locale object merged on top of ConfigProvider. Do not pass a language id. */
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleColorPicker>
  name?: string
  id?: string
  status?: InputStatus
  onChange?: (value: string, option: ColorSwatchNormalizedOption) => void
}

export interface ColorSwatchRef {
  focus: () => void
}
