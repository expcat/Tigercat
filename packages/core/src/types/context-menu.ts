/**
 * ContextMenu component types and interfaces
 */

import type { FloatingPlacement } from '../utils/floating'

/**
 * Viewport point used as the floating-ui virtual reference.
 */
export interface ContextMenuPoint {
  /**
   * Horizontal coordinate in client (viewport) space
   */
  x: number
  /**
   * Vertical coordinate in client (viewport) space
   */
  y: number
}

/**
 * Base ContextMenu props interface
 */
export interface ContextMenuProps {
  /**
   * Merge trigger ARIA / handlers onto the unique focusable child.
   * @default false
   */
  asChild?: boolean
  /**
   * Menu placement relative to the cursor point
   * @default 'bottom-start'
   */
  placement?: FloatingPlacement
  /**
   * Whether the context menu is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Whether the menu is open (controlled mode)
   */
  open?: boolean
  /**
   * Default open state (uncontrolled mode)
   * @default false
   */
  defaultOpen?: boolean
  /**
   * Whether to close the menu on item click
   * @default true
   */
  closeOnClick?: boolean
  /**
   * Portal the menu through the overlay target chain (overlay-host, then
   * ConfigProvider root, then document.body) so it is not
   * clipped or covered by overflow/sticky ancestors.
   * @default true
   */
  portal?: boolean
  /**
   * Distance (in pixels) between the cursor point and the menu
   * @default 0
   */
  offset?: number
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, unknown>
}

/**
 * Context menu panel props interface
 */
export interface ContextMenuMenuProps {
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, unknown>
}

/**
 * Context menu item props interface
 */
export interface ContextMenuItemProps {
  /**
   * Stable item identity when rendering lists. Not a React/Vue vnode key.
   */
  itemKey?: string | number
  /**
   * When set, the item renders as a link (`<a role="menuitem">`).
   */
  href?: string
  /**
   * Whether the item is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Whether the item is divided from the previous item
   * @default false
   */
  divided?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Nested submenu props interface
 */
export interface ContextMenuSubProps {
  /**
   * Submenu trigger label
   */
  title?: string
  /**
   * Whether the submenu trigger is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
}
