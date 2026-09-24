import type { TaskBoardCard, TaskBoardColumn, TaskBoardSwimlane } from '../types/task-board'
import { devWarn } from './dev-warn'
import { treeKeyId } from './tree-utils'
import {
  formatTaskBoardGrabAnnouncement,
  mapVisibleCardIndexToSource,
  type TaskBoardDragState
} from './task-board-utils'

/** Reserved so a business swimlane id cannot occupy the unassigned bucket. */
export const UNASSIGNED_SWIMLANE_ID = '\u0000tiger-unassigned'

/** Card count badge */
export const kanbanCardCountClasses =
  'inline-flex items-center justify-center h-5 min-w-[22px] px-2 rounded-full text-xs font-semibold bg-[var(--tiger-border)]/60 text-[var(--tiger-text-secondary)]/90 backdrop-blur-xs shadow-inner'

/** Swimlane row wrapper */
export const kanbanSwimlaneClasses = 'border-b border-[var(--tiger-border)] last:border-b-0'

/** Swimlane header (click / keyboard toggles collapsed) */
export const kanbanSwimlaneHeaderClasses =
  'flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-[var(--tiger-text)] cursor-pointer select-none hover:bg-[var(--tiger-bg-hover)]'

/** Swimlane color dot */
export const kanbanSwimlaneDotClasses = 'w-2.5 h-2.5 rounded-full shrink-0'

/** Filter match highlight on card */
export const kanbanFilterHighlightClasses = 'bg-[var(--tiger-warning)]/20'

/** Add column button */
export const kanbanAddColumnClasses =
  'flex items-center justify-center shrink-0 w-76 min-h-[120px] rounded-[var(--tiger-radius-lg)] border-2 border-dashed border-[var(--tiger-border)] bg-[var(--tiger-surface-muted)]/40 text-sm font-medium text-[var(--tiger-text-secondary)] hover:border-[var(--tiger-primary)]/80 hover:text-[var(--tiger-primary)] hover:bg-[var(--tiger-surface)] hover:shadow-sm cursor-pointer [transition:var(--tiger-transition-base)] active:scale-98'

/**
 * Filter cards by a search term (matches against title and description).
 * Returns a new array of matching cards.
 */
export function filterCards(cards: TaskBoardCard[], filterText: string): TaskBoardCard[] {
  if (!filterText.trim()) return cards
  const lower = filterText.toLowerCase()
  return cards.filter((card) => {
    const title = (card.title ?? '').toLowerCase()
    const desc = (card.description ?? '').toLowerCase()
    return title.includes(lower) || desc.includes(lower)
  })
}



export interface SwimlaneGroup {
  swimlane: TaskBoardSwimlane
  cards: TaskBoardCard[]
}

/**
 * Group cards within a column by swimlane field.
 * Cards without a matching swimlane go into an unassigned bucket
 * whose label comes from locale (never a hardcoded English string).
 */
export function groupBySwimlane(
  cards: TaskBoardCard[],
  swimlanes: TaskBoardSwimlane[],
  fieldName: string,
  unassignedLabel = 'Unassigned'
): SwimlaneGroup[] {
  const groups = new Map<string, TaskBoardCard[]>()

  for (const lane of swimlanes) {
    const id = treeKeyId(lane.id)
    if (id === UNASSIGNED_SWIMLANE_ID) {
      devWarn(
        'TaskBoard.swimlane.unassigned',
        'A swimlane id uses the reserved unassigned bucket and is kept separate'
      )
      continue
    }
    if (!groups.has(id)) groups.set(id, [])
  }

  const unassigned: TaskBoardCard[] = []

  for (const card of cards) {
    const fieldValue = (card as Record<string, unknown>)[fieldName]
    const id = fieldValue == null ? '' : treeKeyId(fieldValue as string | number)
    const bucket = id && id !== UNASSIGNED_SWIMLANE_ID ? groups.get(id) : undefined
    if (bucket) bucket.push(card)
    else unassigned.push(card)
  }

  const result: SwimlaneGroup[] = swimlanes
    .filter((lane) => treeKeyId(lane.id) !== UNASSIGNED_SWIMLANE_ID)
    .map((lane) => ({
      swimlane: lane,
      cards: groups.get(treeKeyId(lane.id)) ?? []
    }))

  if (unassigned.length > 0) {
    result.push({
      swimlane: { id: UNASSIGNED_SWIMLANE_ID, label: unassignedLabel },
      cards: unassigned
    })
  }

  return result
}

/**
 * Get card count for a column, respecting WIP limits.
 * Always pass the **source** column, not a filtered copy.
 */
export function getColumnCardCount(column: TaskBoardColumn): {
  count: number
  limit: number | undefined
  exceeded: boolean
} {
  const count = column.cards.length
  const limit = column.wipLimit && column.wipLimit > 0 ? column.wipLimit : undefined
  return {
    count,
    limit,
    exceeded: limit != null && count > limit
  }
}

/** Visible column on one frame of the board. Counts and WIP stay on `source`. */
export interface TaskBoardViewColumn {
  /** Unfiltered source column — WIP / card counts / moves use this */
  source: TaskBoardColumn
  /** Index of `source` in the unfiltered columns array */
  sourceIndex: number
  /**
   * Cards the user can see, in DOM order (filter then swimlane groups).
   * Collapsed swimlanes are omitted so they are not drop targets.
   */
  visibleCards: TaskBoardCard[]
  /** Per-column swimlane groups when swimlanes are enabled */
  groups?: SwimlaneGroup[]
}

export interface TaskBoardView {
  columns: TaskBoardViewColumn[]
}

export interface ResolveTaskBoardViewOptions {
  columns: TaskBoardColumn[]
  filterText?: string
  hiddenColumns?: (string | number)[]
  swimlanes?: TaskBoardSwimlane[]
  swimlaneField?: string
  unassignedLabel?: string
  /** Overlay for lane collapsed state; wins over `swimlanes[].collapsed` */
  collapsedLaneState?: Readonly<Record<string, boolean>>
}

/**
 * Display-layer view of a task board.
 *
 * `filterText` / `hiddenColumns` / swimlane grouping only change what is
 * rendered. WIP, counts, and move indices always go back to `source`.
 */
export function resolveTaskBoardView(options: ResolveTaskBoardViewOptions): TaskBoardView {
  const hidden = new Set((options.hiddenColumns ?? []).map((id) => treeKeyId(id)))
  const filterText = options.filterText ?? ''
  const columns: TaskBoardViewColumn[] = []

  options.columns.forEach((source, sourceIndex) => {
    if (hidden.has(treeKeyId(source.id))) return

    const filtered = filterCards(source.cards, filterText)
    let visibleCards = filtered
    let groups: SwimlaneGroup[] | undefined

    if (options.swimlanes && options.swimlaneField) {
      groups = groupBySwimlane(
        filtered,
        options.swimlanes,
        options.swimlaneField,
        options.unassignedLabel
      ).map((group) => {
        const override = options.collapsedLaneState?.[String(group.swimlane.id)]
        const collapsed = override ?? Boolean(group.swimlane.collapsed)
        return collapsed === group.swimlane.collapsed
          ? group
          : { ...group, swimlane: { ...group.swimlane, collapsed } }
      })
      visibleCards = groups.flatMap((group) => (group.swimlane.collapsed ? [] : group.cards))
    }

    columns.push({ source, sourceIndex, visibleCards, groups })
  })

  return { columns }
}

export function findTaskBoardViewColumn(
  view: TaskBoardView,
  columnId: string | number
): TaskBoardViewColumn | undefined {
  return view.columns.find((column) => treeKeyId(column.source.id) === treeKeyId(columnId))
}

/**
 * Map a visible card insertion index (DOM / swimlane order) back onto the
 * source column. `visibleIndex < 0` means “after the last visible card”.
 */
export function resolveCardDropSourceIndex(
  view: TaskBoardView,
  toColumnId: string | number,
  visibleIndex: number
): number {
  const column = findTaskBoardViewColumn(view, toColumnId)
  if (!column) return Math.max(0, visibleIndex)
  const index = visibleIndex < 0 ? column.visibleCards.length : visibleIndex
  return mapVisibleCardIndexToSource(column.source.cards, column.visibleCards, index)
}

/**
 * Map a visible column insertion index back onto the source array.
 * Hidden columns stay in the source and are skipped in `visible`.
 */
export function mapVisibleColumnIndexToSource(
  sourceColumns: TaskBoardColumn[],
  visibleColumnIds: readonly (string | number)[],
  visibleIndex: number
): number {
  return mapVisibleCardIndexToSource(
    sourceColumns,
    visibleColumnIds.map((id) => ({ id })),
    visibleIndex
  )
}

/**
 * Convert a column drag (by id) plus a visible insertion point into source
 * `fromIndex` / `toIndex` for `reorderColumns`.
 */
export function resolveColumnReorder(
  sourceColumns: TaskBoardColumn[],
  fromColumnId: string | number,
  visibleColumnIds: readonly (string | number)[],
  visibleInsertIndex: number
): { fromIndex: number; toIndex: number } | null {
  const fromIndex = sourceColumns.findIndex((column) => column.id === fromColumnId)
  if (fromIndex === -1) return null

  const insert = mapVisibleColumnIndexToSource(sourceColumns, visibleColumnIds, visibleInsertIndex)
  let toIndex = insert > fromIndex ? insert - 1 : insert
  toIndex = Math.max(0, Math.min(toIndex, sourceColumns.length - 1))
  if (fromIndex === toIndex) return null
  return { fromIndex, toIndex }
}

export type TaskBoardKeyboardDirection = 'up' | 'down' | 'start' | 'end'

export interface TaskBoardKeyboardDrop {
  columnId: string | number
  dropIndex: number
}

/**
 * Move the keyboard drop indicator. `dropIndex` is an insertion point in
 * `0..visibleCards.length` (length = after the last visible card). Empty
 * columns accept `dropIndex === 0`.
 */
export function moveTaskBoardKeyboardDrop(
  view: TaskBoardView,
  current: TaskBoardKeyboardDrop,
  direction: TaskBoardKeyboardDirection
): TaskBoardKeyboardDrop {
  if (view.columns.length === 0) return current

  let colIndex = view.columns.findIndex((column) => column.source.id === current.columnId)
  if (colIndex === -1) colIndex = 0

  const column = view.columns[colIndex]
  let dropIndex = Math.max(0, Math.min(current.dropIndex, column.visibleCards.length))

  if (direction === 'down') {
    if (dropIndex < column.visibleCards.length) {
      return { columnId: column.source.id, dropIndex: dropIndex + 1 }
    }
    if (colIndex < view.columns.length - 1) {
      return { columnId: view.columns[colIndex + 1].source.id, dropIndex: 0 }
    }
    return { columnId: column.source.id, dropIndex }
  }

  if (direction === 'up') {
    if (dropIndex > 0) {
      return { columnId: column.source.id, dropIndex: dropIndex - 1 }
    }
    if (colIndex > 0) {
      const prev = view.columns[colIndex - 1]
      return { columnId: prev.source.id, dropIndex: prev.visibleCards.length }
    }
    return { columnId: column.source.id, dropIndex: 0 }
  }

  const nextCol = direction === 'end' ? colIndex + 1 : colIndex - 1
  if (nextCol < 0 || nextCol >= view.columns.length) {
    return { columnId: column.source.id, dropIndex }
  }
  const target = view.columns[nextCol]
  return {
    columnId: target.source.id,
    dropIndex: Math.min(dropIndex, target.visibleCards.length)
  }
}

/**
 * Spoken grab line. Empty when nothing is grabbed. Position is 1-based.
 * Column grabs name the column; card grabs name the card, source, and target.
 */
export function describeTaskBoardGrabAnnouncement(
  snapshot: {
    kbDrag: TaskBoardDragState | null
    dropTargetColumnId: string | number | null
    dropIndex: number
  },
  view: TaskBoardView,
  template: string
): string {
  const grab = snapshot.kbDrag
  if (!grab || template.trim() === '') return ''
  if (grab.type === 'column') {
    const index = view.columns.findIndex((column) => column.source.id === grab.id)
    const column = index >= 0 ? view.columns[index] : undefined
    const title = column?.source.title || String(grab.id)
    return formatTaskBoardGrabAnnouncement(template, {
      card: title,
      from: title,
      to: title,
      position: index >= 0 ? index + 1 : 1,
      count: Math.max(1, view.columns.length)
    })
  }
  const fromColumn = view.columns.find((column) => column.source.id === grab.fromColumnId)
  const toId = snapshot.dropTargetColumnId ?? grab.fromColumnId
  const toColumn = view.columns.find((column) => column.source.id === toId)
  const card = fromColumn?.source.cards.find((item) => item.id === grab.id)
  const slotCount = (toColumn?.visibleCards.length ?? 0) + 1
  const position = snapshot.dropIndex >= 0 ? snapshot.dropIndex + 1 : 1
  return formatTaskBoardGrabAnnouncement(template, {
    card: card?.title || String(grab.id),
    from: fromColumn?.source.title || String(grab.fromColumnId ?? ''),
    to: toColumn?.source.title || String(toId ?? ''),
    position: Math.min(Math.max(1, position), Math.max(1, slotCount)),
    count: Math.max(1, slotCount)
  })
}

export function moveTaskBoardKeyboardColumn(
  sourceColumns: TaskBoardColumn[],
  view: TaskBoardView,
  columnId: string | number,
  direction: 'start' | 'end'
): { fromIndex: number; toIndex: number } | null {
  const visibleIds = view.columns.map((column) => column.source.id)
  const fromVisible = visibleIds.findIndex((id) => id === columnId)
  if (fromVisible === -1) return null
  const toVisible = direction === 'end' ? fromVisible + 1 : fromVisible - 1
  if (toVisible < 0 || toVisible >= visibleIds.length) return null
  return resolveColumnReorder(
    sourceColumns,
    columnId,
    visibleIds,
    direction === 'end' ? toVisible + 1 : toVisible
  )
}
