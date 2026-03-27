/**
 * Kanban types — extends TaskBoard with kanban-specific features.
 *
 * Kanban is essentially a TaskBoard with enhanced drag integration
 * using the new unified drag system from Phase 1.
 */

import type {
  TaskBoardCard,
  TaskBoardColumn,
  TaskBoardCardMoveEvent,
  TaskBoardColumnMoveEvent,
  TaskBoardProps
} from './composite'

// Re-export TaskBoard types as Kanban aliases for discoverability
export type KanbanCard = TaskBoardCard
export type KanbanColumn = TaskBoardColumn
export type KanbanCardMoveEvent = TaskBoardCardMoveEvent
export type KanbanColumnMoveEvent = TaskBoardColumnMoveEvent

/** Kanban-specific swim-lane grouping */
export interface KanbanSwimlane {
  /** Unique id */
  id: string | number
  /** Display label */
  label: string
  /** Color badge for this lane */
  color?: string
  /** Collapsed state */
  collapsed?: boolean
}

/** Kanban props — extends TaskBoard with swim-lane and filter support */
export interface KanbanProps extends TaskBoardProps {
  /** Enable swim-lane grouping (horizontal lanes across columns) */
  swimlanes?: KanbanSwimlane[]
  /** Card field used to assign swim-lanes */
  swimlaneField?: string
  /** Quick filter / search term applied to card titles */
  filterText?: string
  /** Column IDs to hide (useful for saved views) */
  hiddenColumns?: (string | number)[]
  /** Show column card count badges */
  showCardCount?: boolean
  /** Allow adding new cards inline */
  allowAddCard?: boolean
  /** Allow adding new columns inline */
  allowAddColumn?: boolean
}
