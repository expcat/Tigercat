/**
 * Kanban — thin wrapper around TaskBoard with Kanban-friendly defaults.
 *
 * Differences from TaskBoard defaults:
 *   showCardCount  = true  (TaskBoard default: false)
 *   allowAddCard   = true  (TaskBoard default: false)
 *
 * All drag-and-drop logic (HTML5, touch, keyboard) is handled by TaskBoard.
 */
import React from 'react'
import {
  type TaskBoardColumn,
  type TaskBoardCardMoveEvent,
  type TaskBoardColumnMoveEvent
} from '@expcat/tigercat-core'
import { TaskBoard } from './TaskBoard'

export interface KanbanProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled columns */
  columns?: TaskBoardColumn[]
  /** Default columns (uncontrolled) */
  defaultColumns?: TaskBoardColumn[]
  /** Enable card drag & drop */
  draggable?: boolean
  /** Enable column drag & drop */
  columnDraggable?: boolean
  /** Enforce WIP limits */
  enforceWipLimit?: boolean
  /** Validate card move before applying */
  beforeCardMove?: (event: TaskBoardCardMoveEvent) => boolean | Promise<boolean>
  /** Validate column move before applying */
  beforeColumnMove?: (event: TaskBoardColumnMoveEvent) => boolean | Promise<boolean>
  /** Filter text for cards */
  filterText?: string
  /** Column IDs to hide */
  hiddenColumns?: (string | number)[]
  /** Show card count badges */
  showCardCount?: boolean
  /** Allow inline card add */
  allowAddCard?: boolean
  /** Allow inline column add */
  allowAddColumn?: boolean
  /** Card move callback */
  onCardMove?: (event: TaskBoardCardMoveEvent) => void
  /** Column move callback */
  onColumnMove?: (event: TaskBoardColumnMoveEvent) => void
  /** Columns change callback */
  onColumnsChange?: (columns: TaskBoardColumn[]) => void
  /** Card add callback */
  onCardAdd?: (columnId: string | number) => void
  /** Column add callback */
  onColumnAdd?: () => void
  /** Custom card renderer */
  renderCard?: (card: import('@expcat/tigercat-core').TaskBoardCard, columnId: string | number) => React.ReactNode
  /** Custom column header renderer */
  renderColumnHeader?: (column: TaskBoardColumn) => React.ReactNode
}

export const Kanban: React.FC<KanbanProps> = ({
  showCardCount = true,
  allowAddCard = true,
  allowAddColumn = false,
  ...props
}) => {
  return (
    <TaskBoard
      showCardCount={showCardCount}
      allowAddCard={allowAddCard}
      allowAddColumn={allowAddColumn}
      {...props}
    />
  )
}

export default Kanban
