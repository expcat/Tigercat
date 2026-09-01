import type { TaskBoardCard, TaskBoardColumn, TaskBoardSwimlane } from '../types/task-board'
import { filterCards, groupBySwimlane, type SwimlaneGroup } from './kanban-utils'
import { mapVisibleCardIndexToSource } from './task-board-utils'

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
  const hidden = new Set(options.hiddenColumns ?? [])
  const filterText = options.filterText ?? ''
  const columns: TaskBoardViewColumn[] = []

  options.columns.forEach((source, sourceIndex) => {
    if (hidden.has(source.id)) return

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
  return view.columns.find((column) => column.source.id === columnId)
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
