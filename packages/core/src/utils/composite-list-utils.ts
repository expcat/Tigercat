/**
 * Long composite lists (activity, comments, notifications) share one window
 * decision. The row arithmetic stays in virtual-list-utils.
 */

export const COMPOSITE_LIST_VIRTUAL_THRESHOLD = 40

/** Scrollport used once a list is windowed. Replaces a clip that still mounted every row. */
export const COMPOSITE_LIST_VIEWPORT = 380

export const COMPOSITE_LIST_ESTIMATED_ITEM_HEIGHT = 88

export function compositeListUsesWindow(count: number): boolean {
  return Number.isFinite(count) && count >= COMPOSITE_LIST_VIRTUAL_THRESHOLD
}

export interface CompositeGroupWindowRow {
  key: string
  kind: 'header' | 'item'
  groupIndex: number
  itemIndex: number
}

/** Flatten grouped rows so one virtual window can keep headers and items. */
export function flattenCompositeGroupRows(
  groups: readonly {
    key?: string | number
    title?: string
    items?: readonly { id?: string | number }[]
  }[],
  showHeaders: boolean
): CompositeGroupWindowRow[] {
  const rows: CompositeGroupWindowRow[] = []
  groups.forEach((group, groupIndex) => {
    const title = group.title?.trim()
    if (showHeaders && title) {
      rows.push({
        key: `group:${String(group.key ?? groupIndex)}`,
        kind: 'header',
        groupIndex,
        itemIndex: -1
      })
    }
    ;(group.items ?? []).forEach((item, itemIndex) => {
      rows.push({
        key: item.id != null && item.id !== '' ? String(item.id) : `item:${groupIndex}:${itemIndex}`,
        kind: 'item',
        groupIndex,
        itemIndex
      })
    })
  })
  return rows
}
