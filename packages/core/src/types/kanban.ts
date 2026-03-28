/**
 * Kanban types — extends TaskBoard with kanban-specific features.
 *
 * Since v0.9.0, filter/card-count/add-button features have been merged into
 * TaskBoardProps.  KanbanProps now only adds swimlane-specific extensions.
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

/** Kanban props — extends TaskBoard with swim-lane support */
export interface KanbanProps extends TaskBoardProps {
  /** Enable swim-lane grouping (horizontal lanes across columns) */
  swimlanes?: KanbanSwimlane[]
  /** Card field used to assign swim-lanes */
  swimlaneField?: string
}
