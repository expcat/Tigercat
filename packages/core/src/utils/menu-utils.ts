/**
 * Menu component utilities
 * Shared styles and helpers for Menu components
 */

import type {
  MenuFilterMode,
  MenuItem,
  MenuKey,
  MenuMode,
  MenuSchemaBadge,
  MenuTheme
} from '../types/menu'
import { classNames } from './class-names'
import { typedKeyId } from './focus-utils'
import { getIconDefinition } from './icons/registry'
import { prefersReducedMotion } from './transition'

/**
 * Base menu container classes
 */
export const menuBaseClasses =
  'flex border bg-[var(--tiger-surface)] text-[var(--tiger-text)] border-[var(--tiger-border)]'

/**
 * Menu mode classes
 */
export const menuModeClasses = {
  horizontal: 'flex-row border-b',
  vertical: 'flex-col border-e min-w-[200px]',
  inline: 'flex-col min-w-[200px]'
}

export const menuCollapsedModeClasses = {
  vertical: 'flex-col border-e',
  inline: 'flex-col'
}

/**
 * Default `theme="light"` inherits page tokens (`html.dark` / `:root`).
 * Empty so the menu root does not re-declare `--tiger-surface` (and siblings) as light hexes.
 */
export const menuLightThemeClasses = ''

/**
 * Dark menu uses the semantic `.dark` token set. No hex overrides.
 */
export const menuDarkThemeClasses = 'dark'

/**
 * Shared item chrome. Padding and justify are applied separately so a collapsed
 * rail does not keep `px-4` / `justify-between` fighting `justify-center`.
 */
const menuItemChromeClasses =
  'flex w-full items-center py-2 text-start bg-transparent border-0 cursor-pointer transition-colors duration-200 select-none appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]/40 focus-visible:ring-inset active:opacity-90'

/**
 * Menu item base classes
 */
export const menuItemBaseClasses = classNames(menuItemChromeClasses, 'px-4')

/**
 * Menu item hover classes - light theme
 */
export const menuItemHoverLightClasses = 'hover:bg-[var(--tiger-surface-muted)]'

/**
 * Menu item hover classes - dark theme
 */
export const menuItemHoverDarkClasses = 'hover:bg-[var(--tiger-surface-muted)]'

/**
 * Menu item selected classes - light theme
 */
export const menuItemSelectedLightClasses =
  'bg-[var(--tiger-outline-bg-hover)] text-[var(--tiger-primary)] font-medium'

/**
 * Menu item selected classes - dark theme
 */
export const menuItemSelectedDarkClasses =
  'bg-[var(--tiger-outline-bg-hover)] text-[var(--tiger-primary)] font-medium'

/**
 * Menu item disabled classes
 */
export const menuItemDisabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none'

/**
 * Menu item icon classes
 */
export const menuItemIconClasses = 'me-2 flex-shrink-0'

/**
 * Menu item icon classes when the menu is collapsed.
 * No inline-end margin: the label is visually hidden (sr-only) so a margin
 * would only push the icon off-center.
 */
export const menuCollapsedIconClasses = 'flex-shrink-0'

/**
 * Submenu title classes
 */
export const submenuTitleClasses = classNames(menuItemChromeClasses, 'justify-between px-4')

/**
 * Submenu expand icon classes. `rtl:-scale-x-100` flips the inline-end chevron.
 */
export const submenuExpandIconClasses =
  'ms-2 shrink-0 transition-transform duration-200 rtl:-scale-x-100'

/**
 * Inline accordion: expanded chevron points up.
 */
export const submenuExpandIconExpandedClasses = 'rotate-180'

/**
 * Popup / horizontal: chevron points toward inline-end.
 */
export const submenuExpandIconPopupClasses = '-rotate-90'

/**
 * Submenu content classes - popup (horizontal, nested, and collapsed vertical)
 */
export const submenuContentPopupClasses =
  'min-w-[180px] bg-[var(--tiger-surface)] text-[var(--tiger-text)] border border-[var(--tiger-border)] rounded-[var(--tiger-radius-lg)] shadow-[var(--tiger-shadow-lg)] overflow-hidden'

/**
 * Submenu content classes - vertical mode
 */
export const submenuContentVerticalClasses = 'overflow-hidden ps-2'

/**
 * Submenu content classes - inline mode
 */
export const submenuContentInlineClasses = 'overflow-hidden'

/**
 * Submenu inline/vertical motion wrapper classes.
 */
export const submenuHeightTransitionClasses =
  'overflow-hidden transition-[height,opacity] duration-200 ease-in-out motion-reduce:transition-none'

/**
 * Menu item group title classes
 */
export const menuItemGroupTitleClasses =
  'px-4 py-2 text-xs font-semibold text-[var(--tiger-text-secondary)] uppercase tracking-wider'

/**
 * Menu search field wrapper classes.
 */
export const menuSearchFieldClasses = 'px-2 py-2'

/**
 * Menu search input classes.
 */
export const menuSearchInputClasses =
  'w-full rounded border border-[var(--tiger-border)] bg-[var(--tiger-surface)] px-3 py-1.5 text-sm text-[var(--tiger-text)] outline-none focus:border-[var(--tiger-primary)] focus:ring-2 focus:ring-[var(--tiger-focus-ring)]/20'

/**
 * Menu search empty state classes.
 */
export const menuSearchEmptyClasses =
  'px-4 py-6 text-sm text-center text-[var(--tiger-text-secondary)]'

/**
 * Collapsed rail. A block-level menu with only `min-width` stretches to the
 * container, which scatters first-letter glyphs and anchors submenu popups
 * to the far edge of that stretched row.
 */
export const menuCollapsedClasses = 'w-[64px] shrink-0'

/**
 * Menu collapsed item classes. Mutually exclusive with expanded padding / justify.
 */
export const menuCollapsedItemClasses = 'justify-center px-2'

/** Text-only collapsed glyph. Not `flex-1`: that stretches one character across the row. */
export const menuCollapsedGlyphClasses = 'shrink-0 text-center'

export const MENU_POPUP_HOVER_CLOSE_MS = 120

export const MENU_DEFAULT_INLINE_INDENT = 24

/**
 * Pick the appropriate class string based on menu theme
 */
function themeClass(theme: MenuTheme, light: string, dark: string): string {
  return theme === 'dark' ? dark : light
}

/**
 * Get menu classes based on mode and theme
 */
export function getMenuClasses(mode: MenuMode, theme: MenuTheme, collapsed?: boolean): string {
  const modeClasses =
    collapsed && (mode === 'vertical' || mode === 'inline')
      ? menuCollapsedModeClasses[mode]
      : menuModeClasses[mode]
  const classes = [menuBaseClasses, modeClasses]
  const themeClasses = themeClass(theme, menuLightThemeClasses, menuDarkThemeClasses)

  if (themeClasses) {
    classes.push(themeClasses)
  }

  if (collapsed && (mode === 'vertical' || mode === 'inline')) {
    classes.push(menuCollapsedClasses)
  }

  return classes.join(' ')
}

/**
 * Get menu item classes based on state and theme
 */
export function getMenuItemClasses(
  selected: boolean,
  disabled: boolean,
  theme: MenuTheme,
  collapsed?: boolean
): string {
  const classes = [collapsed ? menuItemChromeClasses : menuItemBaseClasses]

  if (collapsed) {
    classes.push(menuCollapsedItemClasses)
  }

  if (disabled) {
    classes.push(menuItemDisabledClasses)
  } else {
    if (selected) {
      classes.push(themeClass(theme, menuItemSelectedLightClasses, menuItemSelectedDarkClasses))
    } else {
      classes.push(themeClass(theme, menuItemHoverLightClasses, menuItemHoverDarkClasses))
    }
  }

  return classes.join(' ')
}

/**
 * Get submenu title classes based on theme
 */
export function getSubMenuTitleClasses(
  theme: MenuTheme,
  disabled?: boolean,
  options?: { collapsed?: boolean; childSelected?: boolean }
): string {
  const classes = [options?.collapsed ? menuItemChromeClasses : submenuTitleClasses]

  if (options?.collapsed) {
    classes.push(menuCollapsedItemClasses)
  }

  if (disabled) {
    classes.push(menuItemDisabledClasses)
  } else if (options?.childSelected) {
    classes.push(themeClass(theme, menuItemSelectedLightClasses, menuItemSelectedDarkClasses))
  } else {
    classes.push(themeClass(theme, menuItemHoverLightClasses, menuItemHoverDarkClasses))
  }

  return classes.join(' ')
}

/**
 * Get submenu expand icon classes
 */
export function getSubMenuExpandIconClasses(
  expanded: boolean,
  options?: { popup?: boolean }
): string {
  const classes = [submenuExpandIconClasses]

  if (options?.popup) {
    classes.push(submenuExpandIconPopupClasses)
  } else if (expanded) {
    classes.push(submenuExpandIconExpandedClasses)
  }

  return classes.join(' ')
}

/**
 * Get indent style for nested menu items
 */
export function getMenuItemIndent(
  level: number,
  inlineIndent: number = MENU_DEFAULT_INLINE_INDENT
): Record<string, string> {
  if (level <= 0) return {}
  return {
    paddingInlineStart: `${level * inlineIndent}px`
  }
}

export function shouldIndentMenuItem(mode: MenuMode, level: number): boolean {
  return mode === 'inline' && level > 0
}

export function menuKeyId(key: MenuKey): string {
  return typedKeyId(key)
}

export function parseMenuKeyId(id: string): MenuKey {
  if (id.startsWith('n:')) {
    const value = Number(id.slice(2))
    return Number.isFinite(value) ? value : id.slice(2)
  }
  if (id.startsWith('s:')) return id.slice(2)
  return id
}

export function sameMenuKey(a: MenuKey, b: MenuKey): boolean {
  return menuKeyId(a) === menuKeyId(b)
}

export function uniqueMenuKeys(keys: Iterable<MenuKey>): MenuKey[] {
  const seen = new Set<string>()
  const result: MenuKey[] = []
  for (const key of keys) {
    const id = menuKeyId(key)
    if (seen.has(id)) continue
    seen.add(id)
    result.push(key)
  }
  return result
}

/**
 * Check if a key is in the selected keys array (`1` and `"1"` match).
 */
export function isKeySelected(key: MenuKey, selectedKeys: readonly MenuKey[]): boolean {
  const id = menuKeyId(key)
  return selectedKeys.some((item) => menuKeyId(item) === id)
}

/**
 * Check if a key is in the open keys array (`1` and `"1"` match).
 */
export function isKeyOpen(key: MenuKey, openKeys: readonly MenuKey[]): boolean {
  return isKeySelected(key, openKeys)
}

/**
 * Toggle a key in an array
 */
export function toggleKey(key: MenuKey, keys: readonly MenuKey[]): MenuKey[] {
  if (isKeySelected(key, keys)) {
    return keys.filter((item) => !sameMenuKey(item, key))
  }
  return [...keys, key]
}

/**
 * Single-select commit: click a selected key emits `[]`, otherwise `[key]`.
 */
export function replaceKeys(key: MenuKey, keys: readonly MenuKey[]): MenuKey[] {
  if (isKeySelected(key, keys)) return []
  return [key]
}

/**
 * Normalize a menu search query for case-insensitive matching.
 */
export function normalizeMenuSearchQuery(query?: string): string {
  return query?.trim().toLowerCase() ?? ''
}

/**
 * Check whether a menu label matches a normalized search query.
 */
export function matchesMenuSearch(label: string, normalizedQuery: string): boolean {
  return normalizedQuery === '' || label.toLowerCase().includes(normalizedQuery)
}

function menuItemSearchLabel(item: MenuItem): string {
  return item.label ?? item.title ?? ''
}

export type MenuNodeKind = 'item' | 'submenu' | 'group' | 'divider'

export function getMenuItemKind(item: MenuItem): MenuNodeKind {
  if (item.type === 'divider') return 'divider'
  if (item.type === 'group') return 'group'
  if (item.children != null) return 'submenu'
  return 'item'
}

export function isMenuSubmenuItem(item: MenuItem): boolean {
  return getMenuItemKind(item) === 'submenu'
}

/**
 * Filter a tree of menu items while preserving ancestors of matching children.
 * Parent matches in `subtree` (default) keep the node a submenu and retain children.
 */
export function filterMenuItems(
  items: MenuItem[],
  query?: string,
  filterMode: MenuFilterMode = 'subtree'
): MenuItem[] {
  const normalizedQuery = normalizeMenuSearchQuery(query)

  if (!normalizedQuery) {
    return items
  }

  const filtered: MenuItem[] = []

  for (const item of items) {
    if (item.type === 'divider') continue

    const matchesSelf = matchesMenuSearch(menuItemSearchLabel(item), normalizedQuery)
    const originalChildren = item.children

    if (item.type === 'group') {
      const children = originalChildren
        ? filterMenuItems(originalChildren, normalizedQuery, filterMode)
        : undefined
      if (matchesSelf || (children && children.length > 0)) {
        filtered.push({
          ...item,
          children: matchesSelf && filterMode === 'subtree' ? originalChildren : children
        })
      }
      continue
    }

    if (matchesSelf && filterMode === 'subtree') {
      filtered.push({ ...item })
      continue
    }

    const children = originalChildren
      ? filterMenuItems(originalChildren, normalizedQuery, filterMode)
      : undefined

    if (matchesSelf || (children && children.length > 0)) {
      filtered.push({
        ...item,
        children: originalChildren ? (children ?? []) : children
      })
    }
  }

  return filtered
}

/**
 * Ancestor keys that must be open for matching descendants to be visible.
 */
export function getMenuSearchExpandKeys(items: MenuItem[], query?: string): MenuKey[] {
  const normalizedQuery = normalizeMenuSearchQuery(query)
  if (!normalizedQuery) return []

  const keys: MenuKey[] = []

  const walk = (nodes: MenuItem[]): boolean => {
    let matched = false
    for (const node of nodes) {
      const selfMatch = matchesMenuSearch(menuItemSearchLabel(node), normalizedQuery)
      const childMatch = node.children ? walk(node.children) : false
      if (node.key != null && node.children && (selfMatch || childMatch)) {
        keys.push(node.key)
      }
      if (selfMatch || childMatch) matched = true
    }
    return matched
  }

  walk(items)
  return uniqueMenuKeys(keys)
}

export function collectMenuDescendantKeys(items: MenuItem[] | undefined): MenuKey[] {
  if (!items || items.length === 0) return []
  const keys: MenuKey[] = []
  const walk = (nodes: MenuItem[]) => {
    for (const node of nodes) {
      if (node.key != null) keys.push(node.key)
      if (node.children) walk(node.children)
    }
  }
  walk(items)
  return keys
}

export function hasSelectedMenuDescendant(
  selectedKeys: readonly MenuKey[],
  descendantKeys: readonly MenuKey[]
): boolean {
  if (selectedKeys.length === 0 || descendantKeys.length === 0) return false
  return descendantKeys.some((key) => isKeySelected(key, selectedKeys))
}

export type MenuIconKind = 'name' | 'node' | 'none'

export function resolveMenuIconKind(icon: unknown): MenuIconKind {
  if (icon == null || icon === false) return 'none'
  if (typeof icon === 'string') {
    return getIconDefinition(icon) ? 'name' : 'none'
  }
  return 'node'
}

export function menuCollapsedTooltip(
  collapsed: boolean,
  label: string | null | undefined
): string | null {
  if (!collapsed) return null
  const text = label?.trim()
  return text ? text : null
}

export function normalizeMenuItemBadge(
  badge: MenuSchemaBadge | undefined
): { content?: string | number; type?: 'dot' | 'number' | 'text'; variant?: string } | null {
  if (badge == null || badge === '') return null
  if (typeof badge === 'string' || typeof badge === 'number') {
    return { content: badge, type: typeof badge === 'number' ? 'number' : 'text' }
  }
  return {
    content: badge.content,
    type: badge.type ?? (typeof badge.content === 'number' ? 'number' : 'text'),
    variant: badge.variant
  }
}

export function getMenuCollapsedInitial(text: string | null | undefined): string | null {
  const trimmed = text?.trim() ?? ''
  if (!trimmed) return null
  return trimmed.charAt(0).toUpperCase()
}

export function getMenuPlainText(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) {
    const parts: string[] = []
    for (const item of value) {
      if (typeof item === 'string' || typeof item === 'number') {
        parts.push(String(item))
      } else {
        return null
      }
    }
    return parts.join('')
  }
  return null
}

export function getMenuListRole(
  mode: MenuMode,
  options?: { popup?: boolean; isRoot?: boolean }
): 'menu' | 'menubar' | undefined {
  if (options?.popup) return 'menu'
  if (!options?.isRoot) return 'menu'
  return mode === 'horizontal' ? 'menubar' : 'menu'
}

export function isMenuRoving(
  _mode: MenuMode,
  _options?: { popup?: boolean; isRoot?: boolean }
): boolean {
  return true
}

/**
 * Popup entrance animation. Same keyframes as `dropdownBaseStyles`.
 * Spread into the Tailwind plugin; do not inject a runtime style tag.
 */
export const menuBaseStyles = {
  '@keyframes tiger-dropdown-in': {
    from: {
      opacity: '0',
      transform: 'scale(0.96) translateY(-2px)'
    },
    to: {
      opacity: '1',
      transform: 'scale(1) translateY(0)'
    }
  },
  '.tiger-dropdown-enter': {
    animation:
      'tiger-dropdown-in var(--tiger-motion-duration-base) var(--tiger-motion-ease-standard)'
  },
  '@media (prefers-reduced-motion: reduce)': {
    '.tiger-dropdown-enter': {
      animationDuration: '0ms'
    }
  }
} as const

// ============================================================================
// Submenu height transition controller
// ============================================================================

export interface SubmenuHeightTransitionElement {
  scrollHeight: number
  style: Pick<CSSStyleDeclaration, 'height' | 'opacity' | 'overflow'>
  addEventListener: HTMLElement['addEventListener']
  removeEventListener: HTMLElement['removeEventListener']
}

export interface SubmenuHeightTransitionController {
  update(expanded: boolean): void
  dispose(): void
}

export interface SubmenuHeightTransitionControllerOptions {
  expanded: boolean
  requestAnimationFrame?: typeof globalThis.requestAnimationFrame
  cancelAnimationFrame?: typeof globalThis.cancelAnimationFrame
  prefersReducedMotion?: () => boolean
}

function requestSubmenuFrame(
  callback: FrameRequestCallback,
  requestFrame: typeof globalThis.requestAnimationFrame | undefined
): number {
  if (typeof requestFrame === 'function') {
    return requestFrame(callback)
  }

  callback(0)
  return 0
}

function cancelSubmenuFrame(
  frame: number,
  cancelFrame: typeof globalThis.cancelAnimationFrame | undefined
): void {
  if (frame && typeof cancelFrame === 'function') {
    cancelFrame(frame)
  }
}

function setSubmenuCollapsedStyle(element: SubmenuHeightTransitionElement): void {
  element.style.overflow = 'hidden'
  element.style.height = '0px'
  element.style.opacity = '0'
}

function setSubmenuExpandedStyle(element: SubmenuHeightTransitionElement): void {
  element.style.overflow = 'hidden'
  element.style.height = 'auto'
  element.style.opacity = '1'
}

export function getInitialSubmenuHeightTransitionStyle(
  expanded: boolean
): Pick<CSSStyleDeclaration, 'height' | 'opacity' | 'overflow'> {
  return {
    height: expanded ? 'auto' : '0px',
    opacity: expanded ? '1' : '0',
    overflow: 'hidden'
  }
}

export function createSubmenuHeightTransitionController(
  element: SubmenuHeightTransitionElement,
  options: SubmenuHeightTransitionControllerOptions
): SubmenuHeightTransitionController {
  const requestFrame = options.requestAnimationFrame ?? globalThis.requestAnimationFrame
  const cancelFrame = options.cancelAnimationFrame ?? globalThis.cancelAnimationFrame
  const reducedMotion = () =>
    options.prefersReducedMotion ? options.prefersReducedMotion() : prefersReducedMotion()
  let frame = 0
  let expanded = options.expanded

  if (expanded) {
    setSubmenuExpandedStyle(element)
  } else {
    setSubmenuCollapsedStyle(element)
  }

  const clearFrame = () => {
    cancelSubmenuFrame(frame, cancelFrame)
    frame = 0
  }

  const handleTransitionEnd = (event: Event) => {
    const transitionEvent = event as TransitionEvent
    if ((event.target as unknown) !== element || transitionEvent.propertyName !== 'height') {
      return
    }

    if (expanded) {
      element.style.height = 'auto'
    }
  }

  element.addEventListener('transitionend', handleTransitionEnd)

  return {
    update(nextExpanded: boolean) {
      if (nextExpanded === expanded) return

      clearFrame()
      expanded = nextExpanded

      if (reducedMotion()) {
        if (nextExpanded) {
          setSubmenuExpandedStyle(element)
        } else {
          setSubmenuCollapsedStyle(element)
        }
        return
      }

      if (nextExpanded) {
        element.style.overflow = 'hidden'
        element.style.height = '0px'
        element.style.opacity = '1'
        frame = requestSubmenuFrame(() => {
          frame = 0
          element.style.height = `${element.scrollHeight}px`
        }, requestFrame)
      } else {
        element.style.overflow = 'hidden'
        element.style.height = `${element.scrollHeight}px`
        element.style.opacity = '1'
        frame = requestSubmenuFrame(() => {
          frame = 0
          element.style.height = '0px'
          element.style.opacity = '0'
        }, requestFrame)
      }
    },
    dispose() {
      clearFrame()
      element.removeEventListener('transitionend', handleTransitionEnd)
    }
  }
}

// ============================================================================
// DOM utilities for keyboard navigation (shared by Vue & React)
// ============================================================================

export function getMenuNavigationKeys(
  mode: MenuMode,
  isRoot: boolean,
  dir: 'ltr' | 'rtl' = 'ltr'
): {
  nextKey: 'ArrowRight' | 'ArrowDown' | 'ArrowLeft' | 'ArrowUp'
  prevKey: 'ArrowRight' | 'ArrowDown' | 'ArrowLeft' | 'ArrowUp'
  openKey: 'ArrowRight' | 'ArrowDown' | 'ArrowLeft'
  closeKey: 'ArrowRight' | 'ArrowLeft'
} {
  const rtl = dir === 'rtl'
  const inlineOpen: 'ArrowRight' | 'ArrowLeft' = rtl ? 'ArrowLeft' : 'ArrowRight'
  const inlineClose: 'ArrowRight' | 'ArrowLeft' = rtl ? 'ArrowRight' : 'ArrowLeft'
  const isHorizontalRoot = isRoot && mode === 'horizontal'
  if (isHorizontalRoot) {
    return {
      nextKey: rtl ? 'ArrowLeft' : 'ArrowRight',
      prevKey: rtl ? 'ArrowRight' : 'ArrowLeft',
      openKey: 'ArrowDown',
      closeKey: inlineClose
    }
  }
  return {
    nextKey: 'ArrowDown',
    prevKey: 'ArrowUp',
    openKey: inlineOpen,
    closeKey: inlineClose
  }
}

function closestMenuList(el: Element | null): HTMLElement | null {
  return (
    el?.closest<HTMLElement>('ul[data-tiger-menu-list], ul[role="menu"], ul[role="menubar"]') ??
    null
  )
}

/**
 * Query enabled, visible menu items that are **direct children** of the given
 * menu container (not inside a nested submenu list).
 */
export function getMenuButtons(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-tiger-menuitem="true"]')).filter(
    (el) => {
      if (
        (el instanceof HTMLButtonElement && el.disabled) ||
        el.getAttribute('aria-disabled') === 'true' ||
        el.closest('[data-tiger-menu-hidden="true"]')
      ) {
        return false
      }
      return closestMenuList(el) === container
    }
  )
}

function setRovingTabIndex(items: HTMLElement[], active: HTMLElement): void {
  items.forEach((el) => {
    el.tabIndex = el === active ? 0 : -1
  })
}

/**
 * Move roving-tabindex focus by `delta` steps (±1) within the nearest menu list.
 */
export function moveFocusInMenu(current: HTMLElement, delta: number): void {
  const menuEl = closestMenuList(current)
  if (!menuEl) return
  const items = getMenuButtons(menuEl)
  const idx = items.indexOf(current)
  if (idx < 0) return
  const next = items[(idx + delta + items.length) % items.length]
  setRovingTabIndex(items, next)
  next.focus()
}

/**
 * Move roving-tabindex focus to the first or last item.
 */
export function focusMenuEdge(current: HTMLElement, edge: 'start' | 'end'): void {
  const menuEl = closestMenuList(current)
  if (!menuEl) return
  const items = getMenuButtons(menuEl)
  if (items.length === 0) return
  const target = edge === 'start' ? items[0] : items[items.length - 1]
  setRovingTabIndex(items, target)
  target.focus()
}

/**
 * Initialise roving tabindex on a menu root element.
 * Re-pins when the current tab stop is no longer in this container.
 */
export function initRovingTabIndex(root: HTMLElement): void {
  const items = getMenuButtons(root)
  if (items.length === 0) return
  const active = items.find((el) => el.tabIndex === 0)
  if (active && items.includes(active)) return
  const selected = items.find((el) => el.dataset.tigerSelected === 'true')
  const next = selected ?? items[0]
  setRovingTabIndex(items, next)
}

export function resolveMenuTabStopKey(options: {
  itemKeys: readonly MenuKey[]
  selectedKeys: readonly MenuKey[]
  disabledKeys?: ReadonlySet<string>
  /** Stop already stored for this layer. Kept when it is still enabled. */
  current?: MenuKey
  /** Popup layers open on their first enabled item. */
  preferFirst?: boolean
}): MenuKey | undefined {
  const disabled = options.disabledKeys
  const enabled = options.itemKeys.filter((key) => !disabled?.has(menuKeyId(key)))
  if (enabled.length === 0) return undefined
  if (options.preferFirst) return enabled[0]
  if (
    options.current != null &&
    enabled.some((key) => sameMenuKey(key, options.current as MenuKey))
  ) {
    return enabled.find((key) => sameMenuKey(key, options.current as MenuKey))
  }
  const selected = enabled.find((key) => isKeySelected(key, options.selectedKeys))
  return selected ?? enabled[0]
}

export function nextMenuRovingKey(options: {
  itemKeys: readonly MenuKey[]
  current: MenuKey | undefined
  delta: 1 | -1 | 'start' | 'end'
  disabledKeys?: ReadonlySet<string>
}): MenuKey | undefined {
  const disabled = options.disabledKeys
  const enabled = options.itemKeys.filter((key) => !disabled?.has(menuKeyId(key)))
  if (enabled.length === 0) return undefined
  if (options.delta === 'start') return enabled[0]
  if (options.delta === 'end') return enabled[enabled.length - 1]
  const index = enabled.findIndex(
    (key) => options.current != null && sameMenuKey(key, options.current)
  )
  const base = index < 0 ? 0 : index
  const next = (base + options.delta + enabled.length) % enabled.length
  return enabled[next]
}

/**
 * Focus the first child menu-item inside a submenu.
 * Pass `popupEl` when the list is portaled (not a descendant of the title's `li`).
 */
export function focusFirstChildItem(titleEl: HTMLElement, popupEl?: HTMLElement | null): void {
  const submenu =
    popupEl ??
    (titleEl
      .closest('li')
      ?.querySelector('ul[data-tiger-menu-list], ul[role="menu"]') as HTMLElement | null)
  if (!submenu) return
  const items = getMenuButtons(submenu)
  if (items.length === 0) return
  setRovingTabIndex(items, items[0])
  items[0].focus()
}

export function getMenuPopupPlacement(
  mode: MenuMode,
  level: number,
  dir: 'ltr' | 'rtl' = 'ltr'
): 'bottom-start' | 'right-start' | 'left-start' {
  if (mode === 'horizontal' && level === 0) return 'bottom-start'
  return dir === 'rtl' ? 'left-start' : 'right-start'
}
