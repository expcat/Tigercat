/**
 * Drawer component types
 */

import type { TigerLocale } from './locale';

/**
 * Drawer placement - where the drawer appears from
 */
export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

/**
 * Drawer size - width for left/right, height for top/bottom
 */
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Base drawer props interface
 */
export interface DrawerProps {
  /**
   * Whether the drawer is visible
   * @default false
   */
  visible?: boolean;

  /**
   * Drawer placement
   * @default 'right'
   */
  placement?: DrawerPlacement;

  /**
   * Drawer size
   * @default 'md'
   */
  size?: DrawerSize;

  /**
   * Drawer title
   */
  title?: string;

  /**
   * Whether to show close button
   * @default true
   */
  closable?: boolean;

  /**
   * Whether to show mask/backdrop
   * @default true
   */
  mask?: boolean;

  /**
   * Whether clicking mask closes the drawer
   * @default true
   */
  maskClosable?: boolean;

  /**
   * z-index of the drawer
   * @default 1000
   */
  zIndex?: number;

  /**
   * Additional CSS class for the drawer container
   */
  className?: string;

  /**
   * Additional CSS class for the drawer body
   */
  bodyClassName?: string;

  /**
   * Whether to destroy content on close
   * @default false
   */
  destroyOnClose?: boolean;

  /**
   * Locale overrides for common texts
   */
  locale?: Partial<TigerLocale>;
}
