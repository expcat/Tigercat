/**
 * Menu component utilities
 * Shared styles and helpers for Menu components
 */

import type { MenuMode, MenuTheme } from '../types/menu'

/**
 * Base menu container classes
 */
export const menuBaseClasses =
  'flex border bg-[var(--tiger-surface,#ffffff)] text-[var(--tiger-text,#111827)] border-[var(--tiger-border,#e5e7eb)]'

/**
 * Menu mode classes
 */
export const menuModeClasses = {
  horizontal: 'flex-row border-b',
  vertical: 'flex-col border-r min-w-[200px]',
  inline: 'flex-col min-w-[200px]'
}

/**
 * Menu theme classes - light theme
 */
export const menuLightThemeClasses =
  '[--tiger-surface:#ffffff] [--tiger-text:#111827] [--tiger-text-muted:#6b7280] [--tiger-border:#e5e7eb] [--tiger-surface-muted:#f9fafb]'

/**
 * Menu theme classes - dark theme
 */
export const menuDarkThemeClasses =
  '[--tiger-surface:#111827] [--tiger-text:#f9fafb] [--tiger-text-muted:#9ca3af] [--tiger-border:#374151] [--tiger-surface-muted:#1f2937] [--tiger-outline-bg-hover:#2563eb1a] [--tiger-ghost-bg-hover:#2563eb1a]'

/**
 * Menu item base classes
 * @since 0.2.0 - Added focus-visible ring (inset) and active state
 */
export const menuItemBaseClasses =
  'flex w-full items-center px-4 py-2 text-left bg-transparent border-0 cursor-pointer transition-colors duration-200 select-none appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))] focus-visible:ring-inset active:opacity-90'

/**
 * Menu item hover classes - light theme
 */
export const menuItemHoverLightClasses = 'hover:bg-[var(--tiger-surface-muted,#f9fafb)]'

/**
 * Menu item hover classes - dark theme
 */
export const menuItemHoverDarkClasses = 'hover:bg-[var(--tiger-surface-muted,#1f2937)]'

/**
 * Menu item selected classes - light theme
 */
export const menuItemSelectedLightClasses =
  'bg-[var(--tiger-outline-bg-hover,#eff6ff)] text-[var(--tiger-primary,#2563eb)] font-medium'

/**
 * Menu item selected classes - dark theme
 */
export const menuItemSelectedDarkClasses =
  'bg-[var(--tiger-outline-bg-hover,#2563eb1a)] text-[var(--tiger-primary,#60a5fa)] font-medium'

/**
 * Menu item disabled classes
 */
export const menuItemDisabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none'

/**
 * Menu item icon classes
 */
export const menuItemIconClasses = 'mr-2 flex-shrink-0'

/**
 * Submenu title classes
 * @since 0.2.0 - Added focus-visible ring (inset) and active state
 */
export const submenuTitleClasses =
  'flex w-full items-center justify-between px-4 py-2 text-left bg-transparent border-0 cursor-pointer transition-colors duration-200 select-none appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))] focus-visible:ring-inset active:opacity-90'

/**
 * Submenu expand icon classes
 */
export const submenuExpandIconClasses = 'ml-2 transition-transform duration-200'

/**
 * Submenu expand icon expanded classes
 */
export const submenuExpandIconExpandedClasses = 'transform rotate-180'

/**
 * Submenu content classes - horizontal mode (top-level, drops below)
 */
export const submenuContentHorizontalClasses =
  'absolute left-0 top-full mt-0 min-w-[160px] bg-[var(--tiger-surface,#ffffff)] text-[var(--tiger-text,#111827)] border border-[var(--tiger-border,#e5e7eb)] rounded shadow-lg z-50'

/**
 * Submenu content classes - horizontal mode nested (level >= 1, cascades right)
 */
export const submenuContentHorizontalNestedClasses =
  'absolute left-full top-0 ml-0 min-w-[160px] bg-[var(--tiger-surface,#ffffff)] text-[var(--tiger-text,#111827)] border border-[var(--tiger-border,#e5e7eb)] rounded shadow-lg z-50'

/**
 * Submenu content classes - collapsed vertical mode (popup)
 */
export const submenuContentPopupClasses =
  'absolute left-full top-0 ml-1 min-w-[180px] bg-[var(--tiger-surface,#ffffff)] text-[var(--tiger-text,#111827)] border border-[var(--tiger-border,#e5e7eb)] rounded shadow-lg z-50'

/**
 * Submenu content classes - vertical mode
 */
export const submenuContentVerticalClasses = 'overflow-hidden pl-2'

/**
 * Submenu content classes - inline mode
 */
export const submenuContentInlineClasses = 'overflow-hidden'

/**
 * Menu item group title classes
 */
export const menuItemGroupTitleClasses =
  'px-4 py-2 text-xs font-semibold text-[var(--tiger-text-muted,#6b7280)] uppercase tracking-wider'

/**
 * Menu collapsed classes
 */
export const menuCollapsedClasses = 'min-w-[64px]'

/**
 * Menu collapsed item classes
 */
export const menuCollapsedItemClasses = 'justify-center px-2'

/**
 * Get z-index style for nested submenu popups.
 * Each deeper level gets a higher z-index to stack correctly.
 */
export function getSubmenuPopupZIndex(level: number): Record<string, number> {
  return { zIndex: 50 + level * 10 }
}

/**
 * Get menu classes based on mode and theme
 */
export function getMenuClasses(mode: MenuMode, theme: MenuTheme, collapsed?: boolean): string {
  const classes = [menuBaseClasses, menuModeClasses[mode]]

  if (theme === 'dark') {
    classes.push(menuDarkThemeClasses)
  } else {
    classes.push(menuLightThemeClasses)
  }

  if (collapsed && mode === 'vertical') {
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
  const classes = [menuItemBaseClasses]

  if (collapsed) {
    classes.push(menuCollapsedItemClasses)
  }

  if (disabled) {
    classes.push(menuItemDisabledClasses)
  } else {
    if (selected) {
      classes.push(theme === 'dark' ? menuItemSelectedDarkClasses : menuItemSelectedLightClasses)
    } else {
      classes.push(theme === 'dark' ? menuItemHoverDarkClasses : menuItemHoverLightClasses)
    }
  }

  return classes.join(' ')
}

/**
 * Get submenu title classes based on theme
 */
export function getSubMenuTitleClasses(theme: MenuTheme, disabled?: boolean): string {
  const classes = [submenuTitleClasses]

  if (disabled) {
    classes.push(menuItemDisabledClasses)
  } else {
    classes.push(theme === 'dark' ? menuItemHoverDarkClasses : menuItemHoverLightClasses)
  }

  return classes.join(' ')
}

/**
 * Get submenu expand icon classes
 */
export function getSubMenuExpandIconClasses(expanded: boolean): string {
  const classes = [submenuExpandIconClasses]

  if (expanded) {
    classes.push(submenuExpandIconExpandedClasses)
  }

  return classes.join(' ')
}

/**
 * Get indent style for nested menu items
 */
export function getMenuItemIndent(
  level: number,
  inlineIndent: number = 24
): Record<string, string> {
  return {
    paddingLeft: `${level * inlineIndent}px`
  }
}

/**
 * Check if a key is in the selected keys array
 */
export function isKeySelected(key: string | number, selectedKeys: (string | number)[]): boolean {
  return selectedKeys.includes(key)
}

/**
 * Check if a key is in the open keys array
 */
export function isKeyOpen(key: string | number, openKeys: (string | number)[]): boolean {
  return openKeys.includes(key)
}

/**
 * Toggle a key in an array
 */
export function toggleKey(key: string | number, keys: (string | number)[]): (string | number)[] {
  const index = keys.indexOf(key)
  if (index > -1) {
    return keys.filter((k) => k !== key)
  }
  return [...keys, key]
}

/**
 * Replace keys array with single key (for single selection mode)
 */
export function replaceKeys(key: string | number, keys: (string | number)[]): (string | number)[] {
  if (keys.includes(key)) {
    return keys
  }
  return [key]
}

// ============================================================================
// DOM utilities for keyboard navigation (shared by Vue & React)
// ============================================================================

/**
 * Query all enabled, visible menu-item buttons that are **direct children**
 * of the given menu container (i.e. not inside a nested sub-menu `<ul>`).
 */
export function getMenuButtons(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[data-tiger-menuitem="true"]')
  ).filter((el) => {
    if (el.disabled || el.closest('[data-tiger-menu-hidden="true"]')) return false
    // Ensure the button's nearest menu ancestor is `container` itself,
    // not some nested <ul role="menu">.
    const nearest = el.closest('ul[role="menu"]')
    return nearest === container
  })
}

/**
 * Move roving-tabindex focus by `delta` steps (±1) within the nearest `ul[role="menu"]`.
 */
export function moveFocusInMenu(current: HTMLButtonElement, delta: number): void {
  const menuEl = current.closest('ul[role="menu"]') as HTMLElement | null
  if (!menuEl) return
  const items = getMenuButtons(menuEl)
  const idx = items.indexOf(current)
  if (idx < 0) return
  const next = items[(idx + delta + items.length) % items.length]
  items.forEach((el) => {
    el.tabIndex = el === next ? 0 : -1
  })
  next.focus()
}

/**
 * Move roving-tabindex focus to the first or last item.
 */
export function focusMenuEdge(current: HTMLButtonElement, edge: 'start' | 'end'): void {
  const menuEl = current.closest('ul[role="menu"]') as HTMLElement | null
  if (!menuEl) return
  const items = getMenuButtons(menuEl)
  if (items.length === 0) return
  const target = edge === 'start' ? items[0] : items[items.length - 1]
  items.forEach((el) => {
    el.tabIndex = el === target ? 0 : -1
  })
  target.focus()
}

/**
 * Initialise roving tabindex on a menu root element.
 * Sets tabindex=0 on the selected (or first) item, -1 on the rest.
 */
export function initRovingTabIndex(root: HTMLElement): void {
  const items = getMenuButtons(root)
  if (items.length === 0) return
  const hasActive = items.some((el) => el.tabIndex === 0)
  if (hasActive) return
  const selected = items.find((el) => el.dataset.tigerSelected === 'true')
  const active = selected ?? items[0]
  items.forEach((el) => {
    el.tabIndex = el === active ? 0 : -1
  })
}

/**
 * Focus the first child menu-item inside a submenu (called after expanding).
 */
export function focusFirstChildItem(titleEl: HTMLElement): void {
  const li = titleEl.closest('li')
  const submenu = li?.querySelector('ul[role="menu"]') as HTMLElement | null
  if (!submenu) return
  const items = getMenuButtons(submenu)
  if (items.length === 0) return
  items.forEach((el, idx) => {
    el.tabIndex = idx === 0 ? 0 : -1
  })
  items[0].focus()
}
