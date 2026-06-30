/**
 * Kanban types — extends TaskBoard with kanban-specific features.
 *
 * Card/column/move data models are shared with TaskBoard: use `TaskBoardCard`,
 * `TaskBoardColumn`, `TaskBoardCardMoveEvent` and `TaskBoardColumnMoveEvent`
 * directly. `KanbanProps` only adds swim-lane specific extensions.
 */

import type { TaskBoardProps } from './task-board'

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
