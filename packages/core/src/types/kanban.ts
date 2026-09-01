/**
 * Kanban types — extends TaskBoard with kanban-specific features.
 *
 * Card/column/move data models are shared with TaskBoard: use `TaskBoardCard`,
 * `TaskBoardColumn`, `TaskBoardCardMoveEvent` and `TaskBoardColumnMoveEvent`
 * directly. `KanbanProps` only adds swim-lane specific extensions.
 */

import type { TaskBoardProps, TaskBoardSwimlane } from './task-board'

/** Swimlane grouping bucket. Same as {@link TaskBoardSwimlane}. */
export type KanbanSwimlane = TaskBoardSwimlane

/**
 * Kanban props — TaskBoard with Kanban-friendly defaults
 * (`showCardCount` / `allowAddCard` true). Swimlanes group cards **inside
 * each column** by `swimlaneField`; they are not horizontal rows across columns.
 */
export interface KanbanProps extends TaskBoardProps {
  /**
   * Group cards inside each column by `swimlaneField`.
   * Not a horizontal row across columns.
   */
  swimlanes?: TaskBoardSwimlane[]
  /** Card field used to assign a swimlane (`card[swimlaneField] === lane.id`). */
  swimlaneField?: string
}
