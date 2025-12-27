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
   * Maximum width constraint for the container
   * - 'sm': max-w-screen-sm (640px)
   * - 'md': max-w-screen-md (768px)
   * - 'lg': max-w-screen-lg (1024px)
   * - 'xl': max-w-screen-xl (1280px)
   * - '2xl': max-w-screen-2xl (1536px)
   * - 'full': w-full (100%)
   * - false: no max-width constraint
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
