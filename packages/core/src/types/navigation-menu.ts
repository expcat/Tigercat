/**
 * NavigationMenu component types and interfaces
 */

import type { FloatingPlacement } from '../utils/floating'

/**
 * Open item key for a NavigationMenu. `null` / `undefined` / `''` means closed.
 * `1` and `'1'` identify the same item.
 */
export type NavigationMenuValue = string | number

/**
 * Base NavigationMenu props interface
 */
export interface NavigationMenuProps {
  /**
   * Currently open top-level item key (controlled mode).
   * `null` or `''` closes every panel.
   */
  value?: NavigationMenuValue | null
  /**
   * Default open item key (uncontrolled mode)
   */
  defaultValue?: NavigationMenuValue | null
  /**
   * Whether any panel is open (controlled mode).
   * When `false`, every panel is closed even if `value` is set.
   * When `true` without a `value` / `defaultValue`, nothing opens
   * (there is no panel to show).
   */
  open?: boolean
  /**
   * Default open state (uncontrolled mode). Requires `defaultValue` to know
   * which panel to show. Alone it does not open a panel.
   * @default false
   */
  defaultOpen?: boolean
  /**
   * Open the hovered trigger's panel after `delayDuration`.
   * Focus never opens a panel; Enter / Space / ArrowDown / click do.
   * @default false
   */
  openOnHover?: boolean
  /**
   * Panel placement relative to the trigger
   * @default 'bottom-start'
   */
  placement?: FloatingPlacement
  /**
   * Whether the navigation menu is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Whether to close the open panel when a link or item is clicked
   * @default true
   */
  closeOnClick?: boolean
  /**
   * Hover delay (ms) before opening a panel. Subsequent opens within
   * `skipDelayDuration` skip this delay so moving across items feels instant.
   * @default 100
   */
  delayDuration?: number
  /**
   * Hover delay (ms) before closing a panel, and the window during which
   * the next open skips `delayDuration`.
   * @default 150
   */
  skipDelayDuration?: number
  /**
   * Whether to show a chevron on triggers that have a panel
   * @default true
   */
  showArrow?: boolean
  /**
   * Portal panels through the overlay target chain (overlay-host, then
   * ConfigProvider root, then document.body) so they are not
   * clipped or covered by overflow/sticky ancestors.
   * @default true
   */
  portal?: boolean
  /**
   * Distance (in pixels) between the trigger and the panel
   * @default 4
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
 * Menubar list (`ul` with `role="menubar"`). Optional; the root wraps
 * children in a list when this is omitted.
 */
export interface NavigationMenuListProps {
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
 * Top-level navigation item (`li` with `role="none"`)
 */
export interface NavigationMenuItemProps {
  /**
   * Unique key used as the open `value` when this item has a panel.
   * Auto-generated when omitted.
   */
  value?: NavigationMenuValue
  /**
   * Whether the item (trigger or top-level link) is disabled
   * @default false
   */
  disabled?: boolean
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
 * Top-level panel trigger (`role="menuitem"`)
 */
export interface NavigationMenuTriggerProps {
  /**
   * Whether the trigger is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Whether to show a chevron. Falls back to the root `showArrow` prop.
   */
  showArrow?: boolean
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
 * Dropdown or MegaMenu content panel
 */
export interface NavigationMenuContentProps {
  /**
   * Wider MegaMenu panel with extra padding for rich content
   * @default false
   */
  mega?: boolean
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
 * Link used as a top-level menuitem or as an item inside a panel
 */
export interface NavigationMenuLinkProps {
  /**
   * Link href. Renders an `<a>` when set, otherwise a `<button>`.
   */
  href?: string
  /**
   * Link target
   */
  target?: string
  /**
   * Rel attribute. `noopener noreferrer` is added automatically for `_blank`.
   */
  rel?: string
  /**
   * Whether the link is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Whether the link represents the current page
   * @default false
   */
  active?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, unknown>
}
