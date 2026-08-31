/**
 * Container component types and interfaces
 */

/**
 * Container width constraint types
 */
export type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | false

/**
 * Base container props interface
 */
export interface ContainerProps {
  /**
   * Maximum width constraint, read from `--tiger-breakpoint-*`.
   * - 'sm' | 'md' | 'lg' | 'xl' | '2xl': `max-width: var(--tiger-breakpoint-*)`
   * - 'full': `max-width: 100%` (caps at the parent)
   * - false: no max-width (still `width: 100%`)
   * @default false
   */
  maxWidth?: ContainerMaxWidth

  /**
   * Whether to center the container horizontally
   * @default true
   */
  center?: boolean

  /**
   * Whether to add horizontal padding
   * @default true
   */
  padding?: boolean
}
