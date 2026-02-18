import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  getTaskBoardLabels,
  mergeTigerLocale,
  resolveLocaleText,
  taskBoardBaseClasses,
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
  taskBoardAddCardClasses,
  moveCard,
  reorderColumns,
  isWipExceeded,
  getDropIndex,
  getColumnDropIndex,
  createCardDragData,
  createColumnDragData,
  parseDragData,
  setDragData,
  createTouchDragTracker,
  findColumnFromPoint,
  type TaskBoardProps as CoreTaskBoardProps,
  type TaskBoardColumn,
  type TaskBoardCard,
  type TaskBoardCardMoveEvent,
  type TaskBoardColumnMoveEvent,
  type TaskBoardDragState,
  type TouchDragTracker
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface TaskBoardProps
  extends
    Omit<
      CoreTaskBoardProps,
      'style' | 'renderCard' | 'renderColumnHeader' | 'renderColumnFooter' | 'renderEmptyColumn'
    >,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'style' | 'draggable'> {
  renderCard?: (card: TaskBoardCard, columnId: string | number) => React.ReactNode
  renderColumnHeader?: (column: TaskBoardColumn) => React.ReactNode
  renderColumnFooter?: (column: TaskBoardColumn) => React.ReactNode
  renderEmptyColumn?: (column: TaskBoardColumn) => React.ReactNode
  style?: React.CSSProperties
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  columns: controlledColumns,
  defaultColumns = [],
  draggable = true,
  columnDraggable = true,
  onCardMove,
  onColumnMove,
  onColumnsChange,
  onCardAdd,
  renderCard: renderCardProp,
  renderColumnHeader,
  renderColumnFooter,
  renderEmptyColumn,
  locale,
  className,
  style,
  ...rest
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(() => getTaskBoardLabels(mergedLocale), [mergedLocale])

  // ---- controlled / uncontrolled ----
  const [innerColumns, setInnerColumns] = useState<TaskBoardColumn[]>(defaultColumns)

  useEffect(() => {
    if (controlledColumns !== undefined) setInnerColumns(controlledColumns)
  }, [controlledColumns])

  const currentColumns = controlledColumns ?? innerColumns

  const updateColumns = useCallback(
    (next: TaskBoardColumn[]) => {
      setInnerColumns(next)
      onColumnsChange?.(next)
    },
    [onColumnsChange]
  )

  // ---- drag state ----
  const [dragState, setDragState] = useState<TaskBoardDragState | null>(null)
  const [dropTargetColumnId, setDropTargetColumnId] = useState<string | number | null>(null)
  const [dropIdx, setDropIdx] = useState(-1)
  const [kbDragState, setKbDragState] = useState<TaskBoardDragState | null>(null)

  const boardRef = useRef<HTMLDivElement>(null)
  const touchTrackerRef = useRef<TouchDragTracker | null>(null)
  const touchRafRef = useRef(0)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0)
    ) {
      touchTrackerRef.current = createTouchDragTracker()
    }
    return () => cancelAnimationFrame(touchRafRef.current)
  }, [])

  const resetDrag = useCallback(() => {
    setDragState(null)
    setDropTargetColumnId(null)
    setDropIdx(-1)
  }, [])

  // ---- HTML5 DnD: cards ----
  const handleCardDragStart = useCallback(
    (e: React.DragEvent, card: TaskBoardCard, column: TaskBoardColumn) => {
      if (!draggable) return
      const idx = column.cards.findIndex((c) => c.id === card.id)
      setDragData(
        e.dataTransfer as unknown as DataTransfer,
        createCardDragData(card.id, column.id, idx)
      )
      setDragState({ type: 'card', id: card.id, fromColumnId: column.id, fromIndex: idx })
    },
    [draggable]
  )

  const handleCardDragOver = useCallback(
    (e: React.DragEvent, column: TaskBoardColumn) => {
      e.preventDefault()
      if (!dragState || dragState.type !== 'card') return
      setDropTargetColumnId(column.id)

      const target = e.currentTarget as HTMLElement
      const cardEls = target.querySelectorAll('[data-tiger-taskboard-card]')
      const rects: DOMRect[] = []
      cardEls.forEach((el) => rects.push(el.getBoundingClientRect()))
      setDropIdx(getDropIndex(e.clientY, rects))
    },
    [dragState]
  )

  const handleCardDrop = useCallback(
    (e: React.DragEvent, column: TaskBoardColumn) => {
      e.preventDefault()
      const data = parseDragData(e.dataTransfer as unknown as DataTransfer)
      if (!data || data.type !== 'card') return

      const result = moveCard(
        currentColumns,
        data.cardId,
        data.columnId,
        column.id,
        dropIdx >= 0 ? dropIdx : column.cards.length
      )

      if (result) {
        updateColumns(result.columns)
        onCardMove?.(result.event)
      }
      resetDrag()
    },
    [currentColumns, dropIdx, onCardMove, resetDrag, updateColumns]
  )

  // ---- HTML5 DnD: columns ----
  const handleColumnDragStart = useCallback(
    (e: React.DragEvent, column: TaskBoardColumn, index: number) => {
      if (!columnDraggable) return
      setDragData(e.dataTransfer as unknown as DataTransfer, createColumnDragData(column.id, index))
      setDragState({ type: 'column', id: column.id, fromIndex: index })
    },
    [columnDraggable]
  )

  const handleColumnDragOver = useCallback(
    (e: React.DragEvent) => {
      if (!dragState || dragState.type !== 'column') return
      e.preventDefault()
    },
    [dragState]
  )

  const handleColumnDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const data = parseDragData(e.dataTransfer as unknown as DataTransfer)
      if (!data || data.type !== 'column') return

      const colEls = boardRef.current?.querySelectorAll('[data-tiger-taskboard-column]')
      if (!colEls) return
      const rects: DOMRect[] = []
      colEls.forEach((el) => rects.push(el.getBoundingClientRect()))
      const toIdx = getColumnDropIndex(e.clientX, rects)

      const result = reorderColumns(
        currentColumns,
        data.index,
        Math.min(toIdx, currentColumns.length - 1)
      )
      if (result) {
        updateColumns(result.columns)
        onColumnMove?.(result.event)
      }
      resetDrag()
    },
    [currentColumns, onColumnMove, resetDrag, updateColumns]
  )

  const handleDragEnd = useCallback(() => resetDrag(), [resetDrag])

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      const related = e.relatedTarget as HTMLElement | null
      if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
        if (dragState?.type === 'card') {
          setDropTargetColumnId(null)
          setDropIdx(-1)
        }
      }
    },
    [dragState]
  )

  // ---- Touch fallback ----
  const handleTouchStart = useCallback(
    (e: React.TouchEvent, card: TaskBoardCard, column: TaskBoardColumn) => {
      if (!draggable || !touchTrackerRef.current) return
      const idx = column.cards.findIndex((c) => c.id === card.id)
      touchTrackerRef.current.onTouchStart(e.nativeEvent, e.currentTarget as HTMLElement)
      setDragState({ type: 'card', id: card.id, fromColumnId: column.id, fromIndex: idx })
    },
    [draggable]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchTrackerRef.current || !dragState) return
      touchTrackerRef.current.onTouchMove(e.nativeEvent)

      cancelAnimationFrame(touchRafRef.current)
      touchRafRef.current = requestAnimationFrame(() => {
        const st = touchTrackerRef.current!.getState()
        const colEl = findColumnFromPoint(st.currentX, st.currentY, boardRef.current)
        if (colEl) {
          const colId = colEl.getAttribute('data-tiger-taskboard-column-id')
          setDropTargetColumnId(colId ?? null)
          const cardEls = colEl.querySelectorAll('[data-tiger-taskboard-card]')
          const rects: DOMRect[] = []
          cardEls.forEach((el) => rects.push(el.getBoundingClientRect()))
          setDropIdx(getDropIndex(st.currentY, rects))
        }
      })
    },
    [dragState]
  )

  const handleTouchEnd = useCallback(() => {
    if (!touchTrackerRef.current || !dragState) return
    touchTrackerRef.current.onTouchEnd()

    if (dragState.type === 'card' && dropTargetColumnId != null) {
      const result = moveCard(
        currentColumns,
        dragState.id,
        dragState.fromColumnId!,
        dropTargetColumnId,
        dropIdx >= 0 ? dropIdx : 0
      )
      if (result) {
        updateColumns(result.columns)
        onCardMove?.(result.event)
      }
    }
    resetDrag()
  }, [currentColumns, dragState, dropIdx, dropTargetColumnId, onCardMove, resetDrag, updateColumns])

  // ---- Keyboard DnD ----
  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent, card: TaskBoardCard, column: TaskBoardColumn) => {
      if (!draggable) return

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!kbDragState) {
          const idx = column.cards.findIndex((c) => c.id === card.id)
          setKbDragState({ type: 'card', id: card.id, fromColumnId: column.id, fromIndex: idx })
        } else {
          const cardIdx = column.cards.findIndex((c) => c.id === card.id)
          if (kbDragState.fromColumnId !== undefined) {
            const result = moveCard(
              currentColumns,
              kbDragState.id,
              kbDragState.fromColumnId,
              column.id,
              cardIdx
            )
            if (result) {
              updateColumns(result.columns)
              onCardMove?.(result.event)
            }
          }
          setKbDragState(null)
        }
        return
      }

      if (e.key === 'Escape' && kbDragState) {
        e.preventDefault()
        setKbDragState(null)
      }
    },
    [currentColumns, draggable, kbDragState, onCardMove, updateColumns]
  )

  // ---- render helpers ----
  const wrapperClasses = useMemo(() => classNames(taskBoardBaseClasses, className), [className])

  const renderCardNode = useCallback(
    (card: TaskBoardCard, column: TaskBoardColumn) => {
      const isDragging = dragState?.type === 'card' && dragState.id === card.id
      const isKbGrabbed = kbDragState?.id === card.id

      const cardClasses = classNames(
        taskBoardCardClasses,
        isDragging && taskBoardCardDraggingClasses,
        isKbGrabbed && 'ring-2 ring-[var(--tiger-primary,#2563eb)]'
      )

      if (renderCardProp) {
        return (
          <div
            key={String(card.id)}
            className={cardClasses}
            draggable={draggable}
            tabIndex={0}
            role="listitem"
            aria-roledescription={labels.dragHintText}
            aria-grabbed={isKbGrabbed ? 'true' : undefined}
            data-tiger-taskboard-card=""
            data-tiger-taskboard-card-id={String(card.id)}
            onDragStart={(e) => handleCardDragStart(e, card, column)}
            onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, card, column)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onKeyDown={(e) => handleCardKeyDown(e, card, column)}>
            {renderCardProp(card, column.id)}
          </div>
        )
      }

      return (
        <div
          key={String(card.id)}
          className={cardClasses}
          draggable={draggable}
          tabIndex={0}
          role="listitem"
          aria-roledescription={labels.dragHintText}
          aria-grabbed={isKbGrabbed ? 'true' : undefined}
          data-tiger-taskboard-card=""
          data-tiger-taskboard-card-id={String(card.id)}
          onDragStart={(e) => handleCardDragStart(e, card, column)}
          onDragEnd={handleDragEnd}
          onTouchStart={(e) => handleTouchStart(e, card, column)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onKeyDown={(e) => handleCardKeyDown(e, card, column)}>
          <div className="font-medium text-sm text-[var(--tiger-text,#1f2937)]">{card.title}</div>
          {card.description && (
            <div className="mt-1 text-xs text-[var(--tiger-text-muted,#6b7280)] line-clamp-2">
              {card.description}
            </div>
          )}
        </div>
      )
    },
    [
      dragState,
      kbDragState,
      draggable,
      labels.dragHintText,
      renderCardProp,
      handleCardDragStart,
      handleDragEnd,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleCardKeyDown
    ]
  )

  const renderColumnNode = useCallback(
    (column: TaskBoardColumn, colIndex: number) => {
      const isDropTarget = dragState?.type === 'card' && dropTargetColumnId === column.id
      const isColDragging = dragState?.type === 'column' && dragState.id === column.id
      const wipOver = isWipExceeded(column)

      const colClasses = classNames(
        taskBoardColumnClasses,
        isDropTarget && taskBoardColumnDropTargetClasses,
        isColDragging && taskBoardColumnDraggingClasses
      )

      // Build cards list with drop indicators
      let cardsContent: React.ReactNode
      if (column.cards.length > 0) {
        const nodes: React.ReactNode[] = []
        column.cards.forEach((card, i) => {
          if (isDropTarget && dropIdx === i) {
            nodes.push(<div key={`drop-${i}`} className={taskBoardDropIndicatorClasses} />)
          }
          nodes.push(renderCardNode(card, column))
        })
        if (isDropTarget && dropIdx >= column.cards.length) {
          nodes.push(<div key="drop-end" className={taskBoardDropIndicatorClasses} />)
        }
        cardsContent = nodes
      } else {
        cardsContent = isDropTarget ? (
          <div key="drop-empty" className={taskBoardDropIndicatorClasses} />
        ) : renderEmptyColumn ? (
          renderEmptyColumn(column)
        ) : (
          <div className={taskBoardEmptyClasses}>{resolveLocaleText(labels.emptyColumnText)}</div>
        )
      }

      return (
        <div
          key={String(column.id)}
          className={colClasses}
          data-tiger-taskboard-column=""
          data-tiger-taskboard-column-id={String(column.id)}
          onDragOver={dragState?.type === 'column' ? handleColumnDragOver : undefined}
          onDrop={dragState?.type === 'column' ? handleColumnDrop : undefined}>
          {/* Column header */}
          <div
            className={taskBoardColumnHeaderClasses}
            draggable={columnDraggable}
            onDragStart={(e) => handleColumnDragStart(e, column, colIndex)}
            onDragEnd={handleDragEnd}
            style={columnDraggable ? { cursor: 'grab' } : undefined}>
            {renderColumnHeader ? (
              renderColumnHeader(column)
            ) : (
              <>
                <span className={wipOver ? taskBoardWipExceededClasses : undefined}>
                  {column.title}
                  {column.wipLimit != null ? (
                    <span className="ml-2 text-xs font-normal opacity-70">
                      ({column.cards.length}/{column.wipLimit})
                    </span>
                  ) : (
                    <span className="ml-2 text-xs font-normal opacity-50">
                      {column.cards.length}
                    </span>
                  )}
                </span>
                {column.description && (
                  <span className="text-xs font-normal text-[var(--tiger-text-muted,#6b7280)] truncate max-w-[120px]">
                    {column.description}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Column body (scrollable card area) */}
          <div
            className={taskBoardColumnBodyClasses}
            role="list"
            aria-label={column.title}
            onDragOver={(e) => handleCardDragOver(e, column)}
            onDrop={(e) => handleCardDrop(e, column)}
            onDragLeave={handleDragLeave}>
            {cardsContent}
          </div>

          {/* Column footer */}
          {renderColumnFooter ? (
            renderColumnFooter(column)
          ) : onCardAdd ? (
            <div
              className={classNames(
                'border-t border-[var(--tiger-border,#e5e7eb)]',
                taskBoardAddCardClasses
              )}
              onClick={() => onCardAdd(column.id)}>
              <span>+</span>
              <span>{resolveLocaleText(labels.addCardText)}</span>
            </div>
          ) : null}
        </div>
      )
    },
    [
      dragState,
      dropTargetColumnId,
      dropIdx,
      columnDraggable,
      labels,
      renderCardNode,
      renderColumnHeader,
      renderColumnFooter,
      renderEmptyColumn,
      onCardAdd,
      handleCardDragOver,
      handleCardDrop,
      handleDragLeave,
      handleColumnDragStart,
      handleColumnDragOver,
      handleColumnDrop,
      handleDragEnd
    ]
  )

  return (
    <div
      ref={boardRef}
      className={wrapperClasses}
      style={style}
      role="region"
      aria-label="Task Board"
      data-tiger-task-board=""
      {...rest}>
      {currentColumns.map((col, i) => renderColumnNode(col, i))}
    </div>
  )
}

export default TaskBoard
