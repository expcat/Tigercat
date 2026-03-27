/**
 * Kanban utility functions
 *
 * Extends task-board-utils with kanban-specific features:
 * swimlane support, filtering, card counting, and column visibility.
 */

import type { TaskBoardColumn, TaskBoardCard } from '../types/composite'
import type { KanbanSwimlane } from '../types/kanban'
import {
  taskBoardBaseClasses,
  taskBoardColumnClasses,
  taskBoardColumnHeaderClasses,
  taskBoardColumnBodyClasses,
  taskBoardCardClasses,
  taskBoardEmptyClasses,
  taskBoardAddCardClasses
} from './task-board-utils'

// Re-export base classes as kanban aliases for convenience
export const kanbanBoardClasses = taskBoardBaseClasses
export const kanbanColumnClasses = taskBoardColumnClasses
export const kanbanColumnHeaderClasses = taskBoardColumnHeaderClasses
export const kanbanColumnBodyClasses = taskBoardColumnBodyClasses
export const kanbanCardClasses = taskBoardCardClasses
export const kanbanEmptyClasses = taskBoardEmptyClasses
export const kanbanAddCardClasses = taskBoardAddCardClasses

// ─── Additional Kanban-specific class constants ───────────────────

/** Card count badge */
export const kanbanCardCountClasses =
  'inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs font-medium bg-[var(--tiger-bg-secondary,#f3f4f6)] text-[var(--tiger-text-secondary,#6b7280)]'

/** Swimlane row wrapper */
export const kanbanSwimlaneClasses = 'border-b border-[var(--tiger-border,#e5e7eb)] last:border-b-0'

/** Swimlane header */
export const kanbanSwimlaneHeaderClasses =
  'flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--tiger-text,#1f2937)] cursor-pointer select-none hover:bg-[var(--tiger-bg-hover,#f9fafb)]'

/** Swimlane color dot */
export const kanbanSwimlaneDotClasses = 'w-2.5 h-2.5 rounded-full shrink-0'

/** Collapsed swimlane */
export const kanbanSwimlaneCollapsedClasses = 'hidden'

/** Filter match highlight on card */
export const kanbanFilterHighlightClasses = 'bg-[var(--tiger-warning,#fbbf24)]/20'

/** Add column button */
export const kanbanAddColumnClasses =
  'flex items-center justify-center shrink-0 w-72 min-h-[80px] rounded-lg border-2 border-dashed border-[var(--tiger-border,#d1d5db)] text-[var(--tiger-text-muted,#9ca3af)] hover:border-[var(--tiger-primary,#2563eb)] hover:text-[var(--tiger-primary,#2563eb)] cursor-pointer transition-colors'

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
  swimlane: KanbanSwimlane
  cards: TaskBoardCard[]
}

/**
 * Group cards within a column by swimlane field.
 * Cards without a matching swimlane go into a default "Unassigned" group.
 */
export function groupBySwimlane(
  cards: TaskBoardCard[],
  swimlanes: KanbanSwimlane[],
  fieldName: string
): SwimlaneGroup[] {
  const groups: Map<string | number, TaskBoardCard[]> = new Map()

  // Initialize groups for each swimlane
  for (const lane of swimlanes) {
    groups.set(lane.id, [])
  }

  // Also prepare an "unassigned" bucket
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
      swimlane: { id: '__unassigned', label: 'Unassigned' },
      cards: unassigned
    })
  }

  return result
}

// ─── Card count ───────────────────────────────────────────────────

/**
 * Get card count for a column, respecting WIP limits.
 * Returns { count, limit, exceeded }.
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

// ─── Column class helpers ─────────────────────────────────────────

export function getKanbanContainerClasses(className?: string): string {
  const parts = [kanbanBoardClasses]
  if (className) parts.push(className)
  return parts.join(' ')
}
