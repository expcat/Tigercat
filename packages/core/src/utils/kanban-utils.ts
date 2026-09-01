/**
 * Kanban utility functions
 *
 * Swimlanes group cards **inside each column** by a card field. Filter and
 * hidden-column helpers only affect the display list — WIP / counts / moves
 * stay on the source arrays (see `resolveTaskBoardView`).
 */

import type { TaskBoardColumn, TaskBoardCard, TaskBoardSwimlane } from '../types/task-board'

export const UNASSIGNED_SWIMLANE_ID = '__unassigned'

// ─── Kanban-specific class constants ──────────────────────────────

/** Card count badge */
export const kanbanCardCountClasses =
  'inline-flex items-center justify-center h-5 min-w-[22px] px-2 rounded-full text-xs font-semibold bg-[var(--tiger-border,#e5e7eb)]/60 text-[var(--tiger-text-secondary,#6b7280)]/90 backdrop-blur-xs shadow-inner'

/** Swimlane row wrapper */
export const kanbanSwimlaneClasses = 'border-b border-[var(--tiger-border,#e5e7eb)] last:border-b-0'

/** Swimlane header (click / keyboard toggles collapsed) */
export const kanbanSwimlaneHeaderClasses =
  'flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-[var(--tiger-text,#1f2937)] cursor-pointer select-none hover:bg-[var(--tiger-bg-hover,#f9fafb)]'

/** Swimlane color dot */
export const kanbanSwimlaneDotClasses = 'w-2.5 h-2.5 rounded-full shrink-0'

/** Filter match highlight on card */
export const kanbanFilterHighlightClasses = 'bg-[var(--tiger-warning,#fbbf24)]/20'

/** Add column button */
export const kanbanAddColumnClasses =
  'flex items-center justify-center shrink-0 w-76 min-h-[120px] rounded-[var(--tiger-radius-lg,0.75rem)] border-2 border-dashed border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface-muted,#f9fafb)]/40 text-sm font-medium text-[var(--tiger-text-muted,#6b7280)] hover:border-[var(--tiger-primary,#2563eb)]/80 hover:text-[var(--tiger-primary,#2563eb)] hover:bg-[var(--tiger-surface,#ffffff)] hover:shadow-sm cursor-pointer transition-all duration-300 active:scale-98'

// ─── Filter logic ─────────────────────────────────────────────────

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

/**
 * Apply filter to all columns.
 * Returns new column array with filtered cards.
 */
export function filterColumns(
  columns: TaskBoardColumn[],
  filterText: string,
  hiddenColumns?: (string | number)[]
): TaskBoardColumn[] {
  return columns
    .filter((col) => !hiddenColumns?.includes(col.id))
    .map((col) => ({
      ...col,
      cards: filterCards(col.cards, filterText)
    }))
}

// ─── Swimlane grouping ────────────────────────────────────────────

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
  const groups: Map<string | number, TaskBoardCard[]> = new Map()

  for (const lane of swimlanes) {
    groups.set(lane.id, [])
  }

  const unassigned: TaskBoardCard[] = []

  for (const card of cards) {
    const fieldValue = (card as Record<string, unknown>)[fieldName]
    if (fieldValue != null && groups.has(fieldValue as string | number)) {
      groups.get(fieldValue as string | number)!.push(card)
    } else {
      unassigned.push(card)
    }
  }

  const result: SwimlaneGroup[] = swimlanes.map((lane) => ({
    swimlane: lane,
    cards: groups.get(lane.id) ?? []
  }))

  if (unassigned.length > 0) {
    result.push({
      swimlane: { id: UNASSIGNED_SWIMLANE_ID, label: unassignedLabel },
      cards: unassigned
    })
  }

  return result
}

// ─── Card count ───────────────────────────────────────────────────

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
