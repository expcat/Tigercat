/**
 * Picker utilities — shared keyboard-navigation helpers for combobox-style
 * components (Select, AutoComplete, Cascader, TreeSelect, Transfer).
 *
 * These helpers operate on a flat array of renderable items and skip items
 * that report `disabled` via the supplied predicate.
 */

export type IsItemDisabled<T> = (item: T) => boolean

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
