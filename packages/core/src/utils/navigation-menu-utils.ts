import { classNames } from './class-names'
import {
  DROPDOWN_CHEVRON_PATH,
  DROPDOWN_ENTER_CLASS,
  getDropdownChevronClasses,
  getDropdownItemClasses,
  getDropdownMenuClasses,
  injectDropdownStyles
} from './dropdown-utils'
import type { NavigationMenuValue } from '../types/navigation-menu'

export const NAVIGATION_MENU_ITEM_VALUE_ATTR = 'data-tiger-navigation-menu-value'

/**
 * Hover delay (ms) before a panel opens
 */
export const NAVIGATION_MENU_DEFAULT_DELAY_DURATION = 100

/**
 * Hover delay (ms) before a panel closes, and the skip-delay window
 */
export const NAVIGATION_MENU_DEFAULT_SKIP_DELAY_DURATION = 150

/**
 * Default offset between a trigger and its panel
 */
export const NAVIGATION_MENU_DEFAULT_OFFSET = 4

/**
 * CSS class for navigation menu panel entrance animation (reuses dropdown motion)
 */
export const NAVIGATION_MENU_ENTER_CLASS = DROPDOWN_ENTER_CLASS

/**
 * SVG path for the trigger chevron-down icon (viewBox 0 0 24 24)
 */
export const NAVIGATION_MENU_CHEVRON_PATH = DROPDOWN_CHEVRON_PATH

/**
 * Attribute marking top-level menubar items (triggers and top-level links)
 */
export const NAVIGATION_MENU_BAR_ITEM_ATTR = 'data-tiger-navigation-menu-bar-item'

/**
 * Inject navigation menu animation styles. Delegates to dropdown styles so both
 * surfaces share a single stylesheet.
 */
export function injectNavigationMenuStyles(): void {
  injectDropdownStyles()
}

/**
 * Normalize an item key so `1` and `'1'` match.
 */
export function navigationMenuValueId(
  value: NavigationMenuValue | null | undefined
): string | null {
  if (value == null || value === '') return null
  return String(value)
}

/**
 * Whether two item keys identify the same panel / trigger.
 */
export function sameNavigationMenuValue(
  a: NavigationMenuValue | null | undefined,
  b: NavigationMenuValue | null | undefined
): boolean {
  const left = navigationMenuValueId(a)
  const right = navigationMenuValueId(b)
  if (left == null || right == null) return false
  return left === right
}

/**
 * Whether `openValue` currently identifies `itemValue` as the open panel
 */
export function isNavigationMenuValueOpen(
  itemValue: NavigationMenuValue,
  openValue: NavigationMenuValue | null | undefined
): boolean {
  return sameNavigationMenuValue(itemValue, openValue)
}

/**
 * Whether a stored value represents an open panel
 */
export function isNavigationMenuOpen(openValue: NavigationMenuValue | null | undefined): boolean {
  return openValue !== null && openValue !== undefined && openValue !== ''
}

/**
 * Resolve the currently open item, honouring a controlled `open` boolean.
 * SSR-safe: pure value comparison, no window access.
 */
export function resolveNavigationMenuOpenValue(options: {
  value?: NavigationMenuValue | null
  internalValue: NavigationMenuValue | null
  open?: boolean
}): NavigationMenuValue | null {
  const next = options.value !== undefined ? options.value : options.internalValue
  if (options.open === false) return null
  if (!isNavigationMenuOpen(next)) return null
  return next as NavigationMenuValue
}

/**
 * Whether the next hover-open should skip `delayDuration`
 */
export function shouldSkipNavigationMenuOpenDelay(
  lastOpenAt: number,
  now: number,
  skipDelayDuration: number
): boolean {
  if (lastOpenAt <= 0) return false
  return now - lastOpenAt < skipDelayDuration
}

/**
 * Keys that open a trigger's panel from the menubar
 */
export function isNavigationMenuTriggerOpenKey(key: string): boolean {
  return key === 'Enter' || key === ' ' || key === 'ArrowDown'
}

/**
 * Get all enabled top-level menubar items
 */
export function getNavigationMenuBarItems(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(`[${NAVIGATION_MENU_BAR_ITEM_ATTR}]`)
  ).filter((el) => {
    if ((el as HTMLButtonElement).disabled) return false
    if (el.getAttribute('aria-disabled') === 'true') return false
    return true
  })
}

/**
 * Initialise roving tabindex on a menubar. Prefer the existing tab stop.
 * Frameworks should set `tabIndex` from `tabStopValue` and only call this
 * when that value is still empty.
 */
export function initNavigationMenuRovingTabIndex(root: HTMLElement): HTMLElement | null {
  const items = getNavigationMenuBarItems(root)
  if (items.length === 0) return null
  const active = items.find((el) => el.tabIndex === 0) ?? items[0]
  items.forEach((el) => {
    el.tabIndex = el === active ? 0 : -1
  })
  return active
}

/**
 * Get navigation menu root container classes
 */
export function getNavigationMenuClasses(): string {
  return classNames('tiger-navigation-menu', 'relative')
}

/**
 * Get menubar list classes (horizontal)
 */
export function getNavigationMenuListClasses(): string {
  return classNames(
    'tiger-navigation-menu-list',
    'flex flex-row items-center gap-1',
    'm-0 p-1',
    'list-none'
  )
}

/**
 * Get top-level item (`li`) classes
 */
export function getNavigationMenuItemClasses(): string {
  return classNames('tiger-navigation-menu-item', 'relative')
}

/**
 * Get top-level trigger classes
 */
export function getNavigationMenuTriggerClasses(disabled: boolean, open: boolean): string {
  return classNames(
    'tiger-navigation-menu-trigger',
    'inline-flex items-center gap-1.5',
    'px-3 py-2',
    'rounded-[var(--tiger-radius-md,0.5rem)]',
    'text-sm font-medium text-[var(--tiger-text,#374151)]',
    'bg-transparent border-0',
    'select-none appearance-none',
    'transition-colors duration-150',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40',
    disabled
      ? 'cursor-not-allowed opacity-50 pointer-events-none'
      : 'cursor-pointer hover:bg-[var(--tiger-surface-muted,#f3f4f6)]',
    open && 'bg-[var(--tiger-surface-muted,#f3f4f6)]'
  )
}

/**
 * Get trigger chevron classes (reuses dropdown chevron)
 */
export function getNavigationMenuChevronClasses(open: boolean): string {
  return classNames('tiger-navigation-menu-chevron', getDropdownChevronClasses(open))
}

/**
 * Get dropdown / MegaMenu panel classes (reuses dropdown chrome)
 */
export function getNavigationMenuContentClasses(mega: boolean): string {
  return classNames(
    'tiger-navigation-menu-content',
    getDropdownMenuClasses(),
    mega && 'min-w-[28rem] p-4'
  )
}

/**
 * Get link classes. Top-level links match triggers; panel links reuse dropdown items.
 */
export function getNavigationMenuLinkClasses(
  disabled: boolean,
  inPanel: boolean,
  active = false
): string {
  if (inPanel) {
    return classNames(
      'tiger-navigation-menu-link',
      getDropdownItemClasses(disabled, false),
      disabled && 'pointer-events-none',
      active && 'bg-[var(--tiger-surface-muted,#f3f4f6)] font-medium'
    )
  }

  return classNames('tiger-navigation-menu-link', getNavigationMenuTriggerClasses(disabled, active))
}
