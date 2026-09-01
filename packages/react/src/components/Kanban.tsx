/**
 * Kanban — thin wrapper around TaskBoard with Kanban-friendly defaults.
 *
 * Differences from TaskBoard defaults:
 *   showCardCount  = true  (TaskBoard default: false)
 *   allowAddCard   = true  (TaskBoard default: false)
 *
 * Swimlanes group cards inside each column by `swimlaneField`.
 */
import React from 'react'
import { TaskBoard, type TaskBoardProps } from './TaskBoard'

export type KanbanProps = TaskBoardProps

export const Kanban: React.FC<KanbanProps> = ({
  showCardCount = true,
  allowAddCard = true,
  ...props
}) => {
  return <TaskBoard showCardCount={showCardCount} allowAddCard={allowAddCard} {...props} />
}

export default Kanban
