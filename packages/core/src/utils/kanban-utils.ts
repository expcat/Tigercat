/**
 * Kanban helpers live in `task-board-view` (same board model as TaskBoard).
 * This module re-exports the public names so existing barrel imports keep working.
 */

export {
  UNASSIGNED_SWIMLANE_ID,
  kanbanCardCountClasses,
  kanbanSwimlaneClasses,
  kanbanSwimlaneHeaderClasses,
  kanbanSwimlaneDotClasses,
  kanbanFilterHighlightClasses,
  kanbanAddColumnClasses,
  filterCards,
  filterColumns,
  groupBySwimlane,
  getColumnCardCount
} from './task-board-view'
export type { SwimlaneGroup } from './task-board-view'
