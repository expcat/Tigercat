/**
 * Empty component types and interfaces
 */

/**
 * Built-in empty state presets
 */
export type EmptyPreset = 'default' | 'simple' | 'no-data' | 'no-results' | 'error'

/**
 * Base empty state props interface (framework-agnostic)
 */
export interface EmptyProps {
  /**
   * Preset empty state style
   * @default 'default'
   */
  preset?: EmptyPreset

  /**
   * Description text below the illustration
   */
  description?: string

  /**
   * Whether to show the built-in SVG illustration
   * @default true
   */
  showImage?: boolean

  /**
   * Additional CSS class name
   */
  className?: string
}
