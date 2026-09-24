/**
 * Tag component types and interfaces
 */

import type { TigerLocale } from './locale'

/**
 * Tag variant types
 */
export type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

/**
 * Tag size types
 */
export type TagSize = 'sm' | 'md' | 'lg'

/**
 * Base tag props interface
 */
export interface TagProps {
  /**
   * Locale override merged on top of ConfigProvider locale.
   */
  locale?: Partial<TigerLocale>

  /**
   * Tag variant style
   * @default 'default'
   */
  variant?: TagVariant

  /**
   * Tag size
   * @default 'md'
   */
  size?: TagSize

  /**
   * Whether the tag can be closed
   * @default false
   */
  closable?: boolean

  /**
   * Accessible label for the close button (when `closable` is true).
   * Defaults to the tag text plus `status.tagCloseAriaLabel`.
   */
  closeAriaLabel?: string

  /**
   * When `false`, the tag is not rendered. Omitted / `true` keeps it shown.
   * Closing emits one event; the parent unmounts the tag.
   */
  open?: boolean
  onOpenChange?: (open: boolean) => void

  /**
   * Fully rounded pill shape
   * @default false
   */
  pill?: boolean
}
