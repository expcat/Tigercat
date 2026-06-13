/**
 * Picker utilities — shared keyboard-navigation helpers for combobox-style
 * components (Select, AutoComplete, Cascader, TreeSelect, Transfer).
 *
 * These helpers operate on a flat array of renderable items and skip items
 * that report `disabled` via the supplied predicate.
 */

export type IsItemDisabled<T> = (item: T) => boolean

export interface PickerComboboxAriaOptions {
  expanded: boolean
  listboxId: string
  activeIndex?: number
  activeOptionId?: string
}

export interface PickerListboxAriaOptions {
  id?: string
  label?: string
}

export interface PickerOptionAriaOptions {
  selected?: boolean
  disabled?: boolean
}

export type PickerTriggerKeyAction = 'open' | 'close' | 'toggle' | 'none'

const defaultIsDisabled = <T>(item: T): boolean =>
  !!(item as { disabled?: boolean } | null | undefined)?.disabled

/**
 * Find the first index whose item is enabled.
 * Returns -1 when the list is empty or every item is disabled.
 */
export function findFirstEnabledIndex<T>(
  items: readonly T[],
  isDisabled: IsItemDisabled<T> = defaultIsDisabled
): number {
  for (let i = 0; i < items.length; i++) {
    if (!isDisabled(items[i])) return i
  }
  return -1
}

/**
 * Find the last index whose item is enabled.
 * Returns -1 when the list is empty or every item is disabled.
 */
export function findLastEnabledIndex<T>(
  items: readonly T[],
  isDisabled: IsItemDisabled<T> = defaultIsDisabled
): number {
  for (let i = items.length - 1; i >= 0; i--) {
    if (!isDisabled(items[i])) return i
  }
  return -1
}

/**
 * Find the next enabled index in the given direction.
 *
 * - When `current < 0`, navigation starts from the head (direction 1) or
 *   the tail (direction -1).
 * - When no enabled item exists in the requested direction, returns
 *   `current` unchanged (matches the "stay where you are" UX of Select).
 * - Returns -1 when the list is empty.
 */
export function findNextEnabledIndex<T>(
  items: readonly T[],
  current: number,
  direction: 1 | -1,
  isDisabled: IsItemDisabled<T> = defaultIsDisabled
): number {
  if (items.length === 0) return -1

  const start = current < 0 ? (direction === 1 ? 0 : items.length - 1) : current + direction

  for (let i = start; i >= 0 && i < items.length; i += direction) {
    if (!isDisabled(items[i])) return i
  }
  return current
}

export function getInitialPickerActiveIndex<T>(
  items: readonly T[],
  activeFirst: boolean,
  isDisabled: IsItemDisabled<T> = defaultIsDisabled
): number {
  return activeFirst ? findFirstEnabledIndex(items, isDisabled) : -1
}

export function getPickerNavigationIndex<T>(
  items: readonly T[],
  current: number,
  key: string,
  isDisabled: IsItemDisabled<T> = defaultIsDisabled
): number {
  switch (key) {
    case 'ArrowDown':
      return findNextEnabledIndex(items, current, 1, isDisabled)
    case 'ArrowUp':
      return findNextEnabledIndex(items, current, -1, isDisabled)
    case 'Home':
      return findFirstEnabledIndex(items, isDisabled)
    case 'End':
      return findLastEnabledIndex(items, isDisabled)
    default:
      return current
  }
}

export function getPickerOptionId(listboxId: string, index: number): string {
  return `${listboxId}-option-${index}`
}

/**
 * Stable `data-state` attribute for a disclosure-style overlay trigger.
 *
 * Returns `{ 'data-state': 'open' | 'closed' }` so trigger elements can be
 * styled by open state via a documented, framework-agnostic hook (mirrors the
 * value Dropdown exposes). This is part of the public, stable trigger API.
 */
export function getDisclosureStateAttr(open: boolean): { 'data-state': 'open' | 'closed' } {
  return { 'data-state': open ? 'open' : 'closed' }
}

export function getPickerComboboxAria({
  expanded,
  listboxId,
  activeIndex = -1,
  activeOptionId
}: PickerComboboxAriaOptions): {
  role: 'combobox'
  'aria-expanded': boolean
  'aria-haspopup': 'listbox'
  'aria-controls': string | undefined
  'aria-activedescendant': string | undefined
  'data-state': 'open' | 'closed'
} {
  return {
    role: 'combobox',
    'aria-expanded': expanded,
    'aria-haspopup': 'listbox',
    'aria-controls': expanded ? listboxId : undefined,
    'aria-activedescendant': expanded
      ? (activeOptionId ??
        (activeIndex >= 0 ? getPickerOptionId(listboxId, activeIndex) : undefined))
      : undefined,
    'data-state': expanded ? 'open' : 'closed'
  }
}

export function getPickerListboxAria({ id, label }: PickerListboxAriaOptions = {}): {
  id: string | undefined
  role: 'listbox'
  'aria-label': string | undefined
} {
  return {
    id,
    role: 'listbox',
    'aria-label': label
  }
}

export function getPickerOptionAria({
  selected = false,
  disabled = false
}: PickerOptionAriaOptions): {
  role: 'option'
  'aria-selected': boolean
  'aria-disabled': boolean | undefined
} {
  return {
    role: 'option',
    'aria-selected': selected,
    'aria-disabled': disabled || undefined
  }
}

export function getPickerTriggerKeyAction(key: string, expanded: boolean): PickerTriggerKeyAction {
  switch (key) {
    case 'Enter':
    case ' ':
      return 'toggle'
    case 'ArrowDown':
      return expanded ? 'none' : 'open'
    case 'Escape':
      return expanded ? 'close' : 'none'
    default:
      return 'none'
  }
}
