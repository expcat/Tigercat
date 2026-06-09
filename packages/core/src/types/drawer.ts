/**
 * Drawer component types
 */

import type { TigerLocale, TigerLocaleDrawer } from './locale'

/**
 * Drawer placement - where the drawer appears from
 */
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

/**
 * Drawer size - width for left/right, height for top/bottom
 */
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/**
 * Base drawer props interface
 */
export interface DrawerProps {
  /**
   * Whether the drawer is open
   * @default false
   */
  open?: boolean

  /**
   * Drawer placement
   * @default 'right'
   */
  placement?: DrawerPlacement

  /**
   * Drawer size
   * @default 'md'
   */
  size?: DrawerSize

  /**
   * Custom width/height (overrides size). Accepts CSS value like '400px' or '50%'.
   * Applied as width for left/right placement, height for top/bottom.
   */
  width?: string | number

  /**
   * Drawer title
   */
  title?: string

  /**
   * Whether to show close button
   * @default true
   */
  closable?: boolean

  /**
   * Whether to show mask/backdrop
   * @default true
   */
  mask?: boolean

  /**
   * Whether clicking mask closes the drawer
   * @default true
   */
  maskClosable?: boolean

  /**
   * z-index of the drawer
   * @default 1000
   */
  zIndex?: number

  /**
   * Additional CSS class for the drawer container
   */
  className?: string

  /**
   * Additional CSS class for the drawer body
   */
  bodyClassName?: string

  /**
   * Whether to destroy content on close
   * @default false
   */
  destroyOnClose?: boolean

  /**
   * When `destroyOnClose` is enabled, keep the drawer mounted until the
   * leave animation finishes before destroying its content.
   * @default false
   */
  destroyOnCloseAfterLeave?: boolean

  /**
   * Whether the drawer panel should become fullscreen on mobile viewports.
   * @default true
   */
  fullscreenOnMobile?: boolean

  /**
   * Locale overrides for common texts
   */
  locale?: Partial<TigerLocale>

  /**
   * Flat custom-text overrides for single-language use (no i18n needed).
   * Takes precedence over `locale` and global ConfigProvider text.
   */
  labels?: Partial<TigerLocaleDrawer>

  /**
   * Additional CSS class for the drawer panel.
   */
  panelClassName?: string

  /**
   * Custom inline style for the drawer panel.
   */
  panelStyle?: Record<string, string | number>
}
