/**
 * ColorPicker size variants
 */
export type ColorPickerSize = 'sm' | 'md' | 'lg'

/**
 * Color format
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl'

/**
 * Shared ColorPicker props (framework-agnostic)
 */
export interface ColorPickerProps {
  /** Whether the picker is disabled */
  disabled?: boolean
  /** Component size */
  size?: ColorPickerSize
  /** Whether to show alpha channel */
  showAlpha?: boolean
  /** Default format for input display */
  format?: ColorFormat
  /** Preset color swatches */
  presets?: string[]
  /** Custom class name */
  className?: string
}
