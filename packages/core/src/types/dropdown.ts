/**
 * Dropdown component types and interfaces
 */

import type { FloatingPlacement } from '../utils/floating'

/**
 * Dropdown trigger mode - determines how the dropdown is opened
 */
export type DropdownTrigger = 'click' | 'hover'

/**
 * Default trigger. Hover still works when set explicitly, and is co-joined
 * with click / keyboard so touch and Tab can open the menu.
 */
export const DEFAULT_DROPDOWN_TRIGGER: DropdownTrigger = 'click'

/**
 * Base dropdown props interface
 */
export interface DropdownProps {
  /**
   * Trigger mode - click or hover. Hover also opens on click, focus, and
   * ArrowDown / ArrowUp.
   * @default 'click'
   */
  trigger?: DropdownTrigger
  /**
   * Merge trigger ARIA / handlers onto the single child instead of rendering
   * a wrapping button. The child must accept a ref (native button/a, or a
   * Tigercat Button).
   * @default false
   */
  asChild?: boolean
  /**
   * Dropdown placement relative to trigger
   * @default 'bottom-start'
   */
  placement?: FloatingPlacement
  /**
   * Offset distance from trigger element
   * @default 4
   */
  offset?: number
  /**
   * Whether the dropdown is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Whether the dropdown is open (controlled mode)
   */
  open?: boolean
  /**
   * Default open state (uncontrolled mode)
   * @default false
   */
  defaultOpen?: boolean
  /**
   * Whether to close dropdown on menu item click
   * @default true
   */
  closeOnClick?: boolean
  /**
   * Whether to show the dropdown arrow/chevron indicator
   * @default true
   */
  showArrow?: boolean
  /**
   * Portal the menu through the overlay target chain (nearest overlay-host,
   * then ConfigProvider root, then document.body) so it is not clipped by
   * overflow/sticky ancestors. Set to false to render in place.
   * @default true
   */
  portal?: boolean
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
 * Dropdown menu props interface
 */
export interface DropdownMenuProps {
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
 * Dropdown item props interface
 */
export interface DropdownItemProps {
  /**
   * Stable item identity when rendering lists. Not a React/Vue vnode key.
   */
  itemKey?: string | number
  /**
   * Whether the item is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Whether the item is divided from previous item
   * @default false
   */
  divided?: boolean
  /**
   * When set, overrides the parent Dropdown `closeOnClick`.
   * Omitted inherits the parent (default inherit).
   */
  closeOnClick?: boolean
  /**
   * When set, the item renders as a link (`<a role="menuitem">`).
   */
  href?: string
  /**
   * Additional CSS classes
   */
  className?: string
}
