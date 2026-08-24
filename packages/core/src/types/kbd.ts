/**
 * Kbd component types and interfaces
 */

/**
 * Kbd size types
 */
export type KbdSize = 'sm' | 'md' | 'lg'

/**
 * Kbd visual variants. `default` uses Tag default chrome; `subtle` is quieter.
 */
export type KbdVariant = 'default' | 'subtle'

/**
 * One key or a combo list. A string is a single key; an array is joined
 * with `separator`.
 */
export type KbdKeys = string | readonly string[]

/**
 * Default combo separator
 */
export const DEFAULT_KBD_SEPARATOR = '+'

/**
 * Default size
 */
export const DEFAULT_KBD_SIZE: KbdSize = 'md'

/**
 * Default visual variant
 */
export const DEFAULT_KBD_VARIANT: KbdVariant = 'default'

/**
 * Base Kbd props interface (framework-agnostic)
 */
export interface KbdProps {
  /**
   * One key or a combo list. A string is a single key; an array is joined
   * with `separator`. Combine with the default slot / children to append a
   * final key.
   */
  keys?: KbdKeys

  /**
   * Separator between combo keys
   * @default '+'
   */
  separator?: string

  /**
   * Visual size
   * @default 'md'
   */
  size?: KbdSize

  /**
   * Visual variant. `default` reuses Tag default chrome; `subtle` is quieter.
   * @default 'default'
   */
  variant?: KbdVariant

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Inline styles
   */
  style?: Record<string, unknown>
}
