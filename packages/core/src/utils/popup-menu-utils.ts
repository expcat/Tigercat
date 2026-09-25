import type { PopupMenuCheckChange, PopupMenuItem, PopupMenuItemType } from '../types/popup-menu'
import { classNames } from './class-names'
import { dropdownItemDividedClasses } from './dropdown-utils'
import { resolveLinkHref } from './link-utils'
import { navLabels } from './i18n/w9/nav-labels'

const POPUP_MENU_TYPES: readonly PopupMenuItemType[] = [
  'item',
  'link',
  'danger',
  'separator',
  'checkbox',
  'radio',
  'submenu'
]

export function isPopupMenuItemType(value: unknown): value is PopupMenuItemType {
  return typeof value === 'string' && POPUP_MENU_TYPES.includes(value as PopupMenuItemType)
}

export function resolvePopupMenuItemType(item: PopupMenuItem): PopupMenuItemType {
  if (isPopupMenuItemType(item.type)) return item.type
  if (item.children && item.children.length > 0) return 'submenu'
  if (item.href) return 'link'
  return 'item'
}

export function popupMenuItemRole(
  type: PopupMenuItemType
): 'separator' | 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' {
  if (type === 'separator') return 'separator'
  if (type === 'checkbox') return 'menuitemcheckbox'
  if (type === 'radio') return 'menuitemradio'
  return 'menuitem'
}

export function popupMenuItemCloses(type: PopupMenuItemType): boolean {
  return type !== 'checkbox' && type !== 'radio' && type !== 'separator' && type !== 'submenu'
}

/** Space toggles a controlled checkbox. Radio selects that item in its group. */
export function nextPopupMenuCheck(
  items: readonly PopupMenuItem[],
  key: string | number
): PopupMenuCheckChange | null {
  const item = items.find((entry) => entry.key === key)
  if (!item || item.disabled) return null
  const type = resolvePopupMenuItemType(item)
  if (type === 'checkbox') {
    return { key, checked: !item.checked }
  }
  if (type === 'radio') {
    if (item.checked) return { key, checked: true, group: item.group }
    return { key, checked: true, group: item.group }
  }
  return null
}

/** Next checked flags after a checkbox or radio change. Radio clears the group. */
export function applyPopupMenuCheck(
  items: readonly PopupMenuItem[],
  change: PopupMenuCheckChange
): PopupMenuItem[] {
  return items.map((item) => {
    const type = resolvePopupMenuItemType(item)
    if (item.key === change.key) return { ...item, checked: change.checked }
    if (type === 'radio' && change.checked && item.group != null && item.group === change.group) {
      return { ...item, checked: false }
    }
    return item
  })
}

export function popupMenuAccessibleName(
  item: PopupMenuItem,
  dangerLabel = navLabels.dangerItem
): string {
  const label = item.label ?? ''
  if (resolvePopupMenuItemType(item) !== 'danger') return label
  if (!label) return dangerLabel
  return `${label}, ${dangerLabel}`
}

export function popupMenuItemHref(item: PopupMenuItem): string | undefined {
  if (resolvePopupMenuItemType(item) !== 'link' && !item.href) return undefined
  return resolveLinkHref(item.href, { disabled: item.disabled })
}

export function getPopupMenuItemClasses(
  disabled: boolean,
  danger: boolean,
  divided = false
): string {
  return classNames(
    'flex items-center gap-2 w-full rounded-[var(--tiger-radius-md)] px-3 py-1.5 text-sm text-start',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-primary)]/40 focus-visible:ring-inset',
    danger ? 'text-[var(--tiger-error)]' : 'text-[var(--tiger-text)]',
    divided && dropdownItemDividedClasses,
    disabled
      ? 'cursor-not-allowed opacity-50'
      : 'cursor-pointer hover:bg-[var(--tiger-surface-muted)]'
  )
}

export function getPopupMenuShortcutClasses(): string {
  return 'ms-auto text-xs text-[var(--tiger-text-secondary)]'
}

export const POPUP_MENU_TYPEAHEAD_MATCH_CLASS =
  'bg-[var(--tiger-surface-muted)] outline outline-1 outline-[var(--tiger-primary)]'
