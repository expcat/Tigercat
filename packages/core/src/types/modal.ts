/**
 * Modal/Dialog component types and interfaces
 */

import type { TigerLocale } from './locale'

/**
 * Modal size types
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/**
 * Base modal props interface
 */
export interface ModalProps {
  /**
   * Whether the modal is open
   * @default false
   */
  open?: boolean

  /**
   * Modal size
   * @default 'md'
   */
  size?: ModalSize

  /**
   * Custom width (overrides size). Accepts CSS value like '600px' or '80%'.
   */
  width?: string | number

  /**
   * Modal title
   */
  title?: string

  /**
   * Whether to show the close button
   * @default true
   */
  closable?: boolean

  /**
   * Whether to show the mask (overlay)
   * @default true
   */
  mask?: boolean

  /**
   * Whether clicking the mask should close the modal
   * @default true
   */
  maskClosable?: boolean

  /**
   * Whether the modal should be centered vertically
   * @default false
   */
  centered?: boolean

  /**
   * Whether to destroy the modal content when closed
   * @default false
   */
  destroyOnClose?: boolean

  /**
   * z-index of the modal
   * @default 1000
   */
  zIndex?: number

  /**
   * Custom class name for modal content
   */
  className?: string

  /**
   * Whether the modal can be dragged by its title bar
   * @default false
   */
  draggable?: boolean

  /**
   * Locale overrides for common texts
   */
  locale?: Partial<TigerLocale>
}
