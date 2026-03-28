import React, { useRef, useState, useCallback, useMemo } from 'react'
import { useControlledState } from '../hooks/useControlledState'
import {
  classNames,
  taskBoardColumnClasses,
  taskBoardColumnHeaderClasses,
  taskBoardColumnBodyClasses,
  taskBoardCardClasses,
  taskBoardCardDraggingClasses,
  taskBoardDropIndicatorClasses,
  taskBoardColumnDropTargetClasses,
  taskBoardColumnDraggingClasses,
  taskBoardEmptyClasses,
  taskBoardWipExceededClasses,
  moveCard,
  reorderColumns,
  isWipExceeded,
  getDropIndex,
  getColumnDropIndex,
  createCardDragData,
  createColumnDragData,
  parseDragData,
  setDragData,
  getKanbanContainerClasses,
  kanbanCardCountClasses,
  kanbanAddCardClasses,
  kanbanAddColumnClasses,
  filterColumns,
  getColumnCardCount,
  type TaskBoardColumn,
  type TaskBoardCard,
  type TaskBoardCardMoveEvent,
  type TaskBoardColumnMoveEvent,
  type TaskBoardDragState
} from '@expcat/tigercat-core'

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
  renderCard?: (card: TaskBoardCard, columnId: string | number) => React.ReactNode
  /** Custom column header renderer */
  renderColumnHeader?: (column: TaskBoardColumn) => React.ReactNode
}

export const Kanban: React.FC<KanbanProps> = ({
  columns: controlledColumns,
  defaultColumns = [],
  draggable = true,
  columnDraggable = true,
  enforceWipLimit = false,
  beforeCardMove,
  beforeColumnMove,
  filterText = '',
  hiddenColumns,
  showCardCount = true,
  allowAddCard = true,
  allowAddColumn = false,
  onCardMove,
  onColumnMove,
  onColumnsChange,
  onCardAdd,
  onColumnAdd,
  renderCard,
  renderColumnHeader,
  className,
  ...restProps
}) => {
  const boardRef = useRef<HTMLDivElement>(null)
  const [rawColumns, setInternalColumns, isControlled] = useControlledState(
    controlledColumns,
    defaultColumns
  )

  // Apply filter
  const visibleColumns = useMemo(
    () => filterColumns(rawColumns, filterText, hiddenColumns),
    [rawColumns, filterText, hiddenColumns]
  )

  // Drag state
  const [dragState, setDragState] = useState<TaskBoardDragState | null>(null)
  const [dropTargetCol, setDropTargetCol] = useState<string | number | null>(null)
  const [dropTargetIdx, setDropTargetIdx] = useState(-1)

  function updateColumns(cols: TaskBoardColumn[]) {
    if (!isControlled) setInternalColumns(cols)
    onColumnsChange?.(cols)
  }

  function resetDrag() {
    setDragState(null)
    setDropTargetCol(null)
    setDropTargetIdx(-1)
  }

  // Card drag handlers
  const handleCardDragStart = useCallback(
    (e: React.DragEvent, card: TaskBoardCard, colId: string | number, idx: number) => {
      if (!draggable) return
      e.stopPropagation()
      setDragData(e.nativeEvent.dataTransfer!, createCardDragData(card.id, colId, idx))
      setDragState({ type: 'card', id: card.id, fromColumnId: colId, fromIndex: idx })
    },
    [draggable]
  )

  const handleColumnDragStart = useCallback(
    (e: React.DragEvent, colId: string | number, idx: number) => {
      if (!columnDraggable) return
      setDragData(e.nativeEvent.dataTransfer!, createColumnDragData(colId, idx))
      setDragState({ type: 'column', id: colId, fromIndex: idx })
    },
    [columnDraggable]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent, colId: string | number) => {
      e.preventDefault()
      if (!dragState) return
      setDropTargetCol(colId)
      if (dragState.type === 'card') {
        const colEl = (e.currentTarget as HTMLElement).querySelector('[data-kanban-body]')
        if (colEl) {
          const cards = Array.from(colEl.querySelectorAll('[data-kanban-card]'))
          const rects = cards.map((c) => c.getBoundingClientRect())
          setDropTargetIdx(getDropIndex(e.clientY, rects))
        }
      }
    },
    [dragState]
  )

  const handleColumnDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!dragState || dragState.type !== 'column') return
      const boardEl = boardRef.current
      if (!boardEl) return
      const cols = Array.from(boardEl.querySelectorAll('[data-kanban-column]'))
      const rects = cols.map((c) => c.getBoundingClientRect())
      setDropTargetIdx(getColumnDropIndex(e.clientX, rects))
    },
    [dragState]
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      const data = parseDragData(e.nativeEvent.dataTransfer!)
      if (!data || !dragState) {
        resetDrag()
        return
      }

      if (data.type === 'card' && dropTargetCol != null) {
        if (beforeCardMove) {
          const evt: TaskBoardCardMoveEvent = {
            cardId: data.cardId,
            fromColumnId: data.columnId,
            toColumnId: dropTargetCol,
            fromIndex: data.index,
            toIndex: dropTargetIdx
          }
          const ok = await beforeCardMove(evt)
          if (!ok) {
            resetDrag()
            return
          }
        }
        const result = moveCard(
          rawColumns,
          data.cardId,
          data.columnId,
          dropTargetCol,
          dropTargetIdx,
          { enforceWipLimit }
        )
        if (result) {
          updateColumns(result.columns)
          onCardMove?.(result.event)
        }
      } else if (data.type === 'column') {
        if (beforeColumnMove) {
          const evt: TaskBoardColumnMoveEvent = {
            columnId: data.columnId,
            fromIndex: data.index,
            toIndex: dropTargetIdx
          }
          const ok = await beforeColumnMove(evt)
          if (!ok) {
            resetDrag()
            return
          }
        }
        const result = reorderColumns(rawColumns, data.index, dropTargetIdx)
        if (result) {
          updateColumns(result.columns)
          onColumnMove?.(result.event)
        }
      }
      resetDrag()
    },
    [
      dragState,
      dropTargetCol,
      dropTargetIdx,
      rawColumns,
      enforceWipLimit,
      beforeCardMove,
      beforeColumnMove,
      onCardMove,
      onColumnMove
    ]
  )

  const containerClasses = useMemo(
    () => classNames(getKanbanContainerClasses(className)),
    [className]
  )

  return (
    <div
      ref={boardRef}
      className={containerClasses}
      role="region"
      aria-label="Kanban board"
      onDragOver={handleColumnDragOver}
      {...restProps}>
      {visibleColumns.map((col, colIdx) => {
        const wipExceeded = isWipExceeded(col)
        const cardCount = getColumnCardCount(col)
        const isDragOverCol = dropTargetCol === col.id
        const isColDragging = dragState?.type === 'column' && dragState.id === col.id

        return (
          <div
            key={col.id}
            className={classNames(
              taskBoardColumnClasses,
              isDragOverCol && dragState?.type === 'card' && taskBoardColumnDropTargetClasses,
              isColDragging && taskBoardColumnDraggingClasses
            )}
            data-kanban-column=""
            draggable={columnDraggable}
            onDragStart={(e) => handleColumnDragStart(e, col.id, colIdx)}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDrop={handleDrop}
            onDragEnd={resetDrag}>
            {/* Header */}
            <div
              className={classNames(
                taskBoardColumnHeaderClasses,
                wipExceeded && taskBoardWipExceededClasses
              )}>
              {renderColumnHeader ? renderColumnHeader(col) : <span>{col.title}</span>}
              {showCardCount && (
                <span
                  className={classNames(
                    kanbanCardCountClasses,
                    wipExceeded && taskBoardWipExceededClasses
                  )}>
                  {cardCount.limit ? `${cardCount.count}/${cardCount.limit}` : `${cardCount.count}`}
                </span>
              )}
            </div>

            {/* Card body */}
            <div className={taskBoardColumnBodyClasses} data-kanban-body="">
              {col.cards.length === 0 ? (
                <div className={taskBoardEmptyClasses}>No cards</div>
              ) : (
                col.cards.map((card, cardIdx) => {
                  const isCardDragging = dragState?.type === 'card' && dragState.id === card.id

                  return (
                    <React.Fragment key={card.id}>
                      {isDragOverCol && dragState?.type === 'card' && dropTargetIdx === cardIdx && (
                        <div className={taskBoardDropIndicatorClasses} />
                      )}
                      <div
                        className={classNames(
                          taskBoardCardClasses,
                          isCardDragging && taskBoardCardDraggingClasses
                        )}
                        draggable={draggable}
                        data-kanban-card=""
                        onDragStart={(e) => handleCardDragStart(e, card, col.id, cardIdx)}>
                        {renderCard ? (
                          renderCard(card, col.id)
                        ) : (
                          <>
                            <div className="font-medium text-sm">{card.title}</div>
                            {card.description && (
                              <div className="text-xs text-[var(--tiger-text-muted,#6b7280)] mt-1">
                                {card.description}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </React.Fragment>
                  )
                })
              )}
              {isDragOverCol && dragState?.type === 'card' && dropTargetIdx >= col.cards.length && (
                <div className={taskBoardDropIndicatorClasses} />
              )}
            </div>

            {/* Add card button */}
            {allowAddCard && (
              <div
                className={kanbanAddCardClasses}
                role="button"
                tabIndex={0}
                onClick={() => onCardAdd?.(col.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onCardAdd?.(col.id)
                  }
                }}>
                + Add card
              </div>
            )}
          </div>
        )
      })}

      {/* Add column button */}
      {allowAddColumn && (
        <div
          className={kanbanAddColumnClasses}
          role="button"
          tabIndex={0}
          onClick={() => onColumnAdd?.()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onColumnAdd?.()
            }
          }}>
          + Add column
        </div>
      )}
    </div>
  )
}

export default Kanban
