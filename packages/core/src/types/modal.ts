/**
 * Modal/Dialog component types and interfaces
 */

import type { TigerLocale, TigerLocaleModal } from './locale'

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
   * Whether Escape closes the modal. Independent of `closable`, which only
   * shows or hides the close button.
   * @default true
   */
  keyboard?: boolean

  /**
   * Whether the modal should be centered vertically
   * @default false
   */
  centered?: boolean

  /**
   * Whether the modal should render as a mobile bottom sheet below the md breakpoint.
   * @default false
   */
  mobileSheet?: boolean

  /**
   * Whether to destroy the modal content when closed
   * @default false
   */
  destroyOnClose?: boolean

  /**
   * z-index of the modal
   * @default OVERLAY_Z_INDEX.modal
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

  /**
   * Flat custom-text overrides for single-language use (no i18n needed).
   * Takes precedence over `locale` and global ConfigProvider text.
   */
  labels?: Partial<TigerLocaleModal>

  /**
   * Close button accessible name. Defaults to `locale.modal.closeAriaLabel` (en-US `Close`).
   */
  closeAriaLabel?: string

  /**
   * Whether to render a default footer when no `footer` is provided.
   * @default false
   */
  showDefaultFooter?: boolean

  /**
   * Default OK button text. Defaults to `locale.modal.okText` (en-US `OK`).
   */
  okText?: string

  /**
   * Default Cancel button text. Defaults to `locale.modal.cancelText` (en-US `Cancel`).
   */
  cancelText?: string
}
