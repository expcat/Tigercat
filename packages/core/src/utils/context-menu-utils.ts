import { classNames } from './class-names'
import {
  DROPDOWN_ENTER_CLASS,
  getDropdownItemClasses,
  getDropdownMenuClasses,
  injectDropdownStyles
} from './dropdown-utils'
import type { ContextMenuPoint } from '../types/context-menu'

/**
 * Origin-size of the cursor virtual reference used with anchored-overlay.
 * 1px keeps getBoundingClientRect stable across browsers.
 */
export const CONTEXT_MENU_POINT_SIZE = 1

/**
 * CSS class for context menu entrance animation (reuses dropdown motion)
 */
export const CONTEXT_MENU_ENTER_CLASS = DROPDOWN_ENTER_CLASS

/**
 * SVG path for the nested submenu chevron-right icon (viewBox 0 0 24 24)
 */
export const CONTEXT_MENU_SUB_CHEVRON_PATH = 'M9 5l7 7-7 7'

/**
 * Inject context menu animation styles. Delegates to dropdown styles so both
 * surfaces share a single stylesheet.
 */
export function injectContextMenuStyles(): void {
  injectDropdownStyles()
}

/**
 * Get context menu root container classes
 */
export function getContextMenuContainerClasses(): string {
  return classNames('tiger-context-menu', 'relative')
}

/**
 * Get context menu trigger surface classes
 */
export function getContextMenuTriggerClasses(disabled: boolean): string {
  return classNames(
    'tiger-context-menu-trigger',
    disabled ? 'cursor-not-allowed opacity-50 pointer-events-none' : undefined
  )
}

/**
 * Get context menu panel classes (reuses dropdown menu chrome)
 */
export function getContextMenuMenuClasses(): string {
  return classNames('tiger-context-menu-menu', getDropdownMenuClasses())
}

/**
 * Get context menu item classes (reuses dropdown item chrome)
 */
export function getContextMenuItemClasses(disabled: boolean, divided: boolean): string {
  return classNames('tiger-context-menu-item', getDropdownItemClasses(disabled, divided))
}

/**
 * Get nested submenu trigger classes
 */
export function getContextMenuSubTriggerClasses(disabled: boolean): string {
  return classNames(getContextMenuItemClasses(disabled, false), 'justify-between')
}

/**
 * Get nested submenu chevron classes
 */
export function getContextMenuSubChevronClasses(): string {
  return classNames(
    'tiger-context-menu-sub-chevron',
    'w-3.5 h-3.5 shrink-0',
    'text-[var(--tiger-text-muted,#9ca3af)]'
  )
}

/**
 * Inline style for the 1×1 cursor virtual reference.
 * SSR-safe: numbers only, no window access.
 */
export function getContextMenuPointStyle(point: ContextMenuPoint): Record<string, string> {
  return {
    position: 'fixed',
    left: `${point.x}px`,
    top: `${point.y}px`,
    width: `${CONTEXT_MENU_POINT_SIZE}px`,
    height: `${CONTEXT_MENU_POINT_SIZE}px`,
    margin: '0px',
    padding: '0px',
    border: '0px',
    pointerEvents: 'none'
  }
}

/**
 * Read a viewport point from a mouse/pointer event.
 */
export function getContextMenuPointFromEvent(event: {
  clientX: number
  clientY: number
}): ContextMenuPoint {
  return { x: event.clientX, y: event.clientY }
}

/**
 * Fall back to an element's top-left when no pointer event is available
 * (controlled `open` / `defaultOpen` without a contextmenu event).
 */
export function getContextMenuPointFromElement(element: {
  getBoundingClientRect: () => { left: number; top: number }
}): ContextMenuPoint {
  const rect = element.getBoundingClientRect()
  return { x: rect.left, y: rect.top }
}

/**
 * Resolve the menu origin: pointer event first, then a fallback element.
 */
export function getContextMenuOpenPoint(
  event: { clientX: number; clientY: number } | null | undefined,
  fallbackElement: { getBoundingClientRect: () => { left: number; top: number } } | null | undefined
): ContextMenuPoint {
  if (event) return getContextMenuPointFromEvent(event)
  if (fallbackElement) return getContextMenuPointFromElement(fallbackElement)
  return { x: 0, y: 0 }
}

/**
 * Whether a keyboard event should open the context menu (Shift+F10 / ContextMenu).
 */
export function isContextMenuKeyboardEvent(event: { key: string; shiftKey: boolean }): boolean {
  return event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)
}
