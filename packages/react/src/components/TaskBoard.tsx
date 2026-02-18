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
  type TaskBoardMoveValidator,
  type TouchDragTracker
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

/* ------------------------------------------------------------------ */
/* Extracted memo sub-components for render performance                */
/* ------------------------------------------------------------------ */

interface CardItemProps {
  card: TaskBoardCard
  column: TaskBoardColumn
  isDragging: boolean
  isKbGrabbed: boolean
  draggable: boolean
  dragHintText: string
  renderCard?: (card: TaskBoardCard, columnId: string | number) => React.ReactNode
  onDragStart: (e: React.DragEvent, card: TaskBoardCard, column: TaskBoardColumn) => void
  onDragEnd: () => void
  onTouchStart: (e: React.TouchEvent, card: TaskBoardCard, column: TaskBoardColumn) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
  onKeyDown: (e: React.KeyboardEvent, card: TaskBoardCard, column: TaskBoardColumn) => void
}

const CardItem = React.memo<CardItemProps>(
  ({
    card,
    column,
    isDragging,
    isKbGrabbed,
    draggable,
    dragHintText,
    renderCard,
    onDragStart,
    onDragEnd,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onKeyDown
  }) => {
    const cardClasses = classNames(
      taskBoardCardClasses,
      isDragging && taskBoardCardDraggingClasses,
      isKbGrabbed && 'ring-2 ring-[var(--tiger-primary,#2563eb)]'
    )

    return (
      <div
        className={cardClasses}
        draggable={draggable}
        tabIndex={0}
        role="listitem"
        aria-roledescription={dragHintText}
        aria-grabbed={isKbGrabbed ? 'true' : undefined}
        data-tiger-taskboard-card=""
        data-tiger-taskboard-card-id={String(card.id)}
        onDragStart={(e) => onDragStart(e, card, column)}
        onDragEnd={onDragEnd}
        onTouchStart={(e) => onTouchStart(e, card, column)}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onKeyDown={(e) => onKeyDown(e, card, column)}>
        {renderCard ? (
          renderCard(card, column.id)
        ) : (
          <>
            <div className="font-medium text-sm text-[var(--tiger-text,#1f2937)]">{card.title}</div>
            {card.description && (
              <div className="mt-1 text-xs text-[var(--tiger-text-muted,#6b7280)] line-clamp-2">
                {card.description}
              </div>
            )}
          </>
        )}
      </div>
    )
  },
  (prev, next) =>
    prev.card.id === next.card.id &&
    prev.isDragging === next.isDragging &&
    prev.isKbGrabbed === next.isKbGrabbed &&
    prev.draggable === next.draggable &&
    prev.card === next.card
)
CardItem.displayName = 'TaskBoardCardItem'

interface ColumnItemProps {
  column: TaskBoardColumn
  colIndex: number
  isDropTarget: boolean
  isColDragging: boolean
  dropIdx: number
  draggable: boolean
  columnDraggable: boolean
  labels: ReturnType<typeof getTaskBoardLabels>
  renderCardProp?: (card: TaskBoardCard, columnId: string | number) => React.ReactNode
  renderColumnHeader?: (column: TaskBoardColumn) => React.ReactNode
  renderColumnFooter?: (column: TaskBoardColumn) => React.ReactNode
  renderEmptyColumn?: (column: TaskBoardColumn) => React.ReactNode
  onCardAdd?: (columnId: string | number) => void
  dragType: 'card' | 'column' | null
  onCardDragStart: (e: React.DragEvent, card: TaskBoardCard, column: TaskBoardColumn) => void
  onCardDragOver: (e: React.DragEvent, column: TaskBoardColumn) => void
  onCardDrop: (e: React.DragEvent, column: TaskBoardColumn) => void
  onDragEnd: () => void
  onDragLeave: (e: React.DragEvent) => void
  onColumnDragStart: (e: React.DragEvent, col: TaskBoardColumn, idx: number) => void
  onColumnDragOver: (e: React.DragEvent) => void
  onColumnDrop: (e: React.DragEvent) => void
  onCardTouchStart: (e: React.TouchEvent, card: TaskBoardCard, column: TaskBoardColumn) => void
  onCardTouchMove: (e: React.TouchEvent) => void
  onCardTouchEnd: () => void
  onColumnTouchStart: (e: React.TouchEvent, col: TaskBoardColumn, idx: number) => void
  onColumnTouchMove: (e: React.TouchEvent) => void
  onColumnTouchEnd: () => void
  onCardKeyDown: (e: React.KeyboardEvent, card: TaskBoardCard, column: TaskBoardColumn) => void
  dragStateId: string | number | null
  kbDragStateId: string | number | null
}

const ColumnItem = React.memo<ColumnItemProps>(
  ({
    column,
    colIndex,
    isDropTarget,
    isColDragging,
    dropIdx,
    draggable,
    columnDraggable,
    labels,
    renderCardProp,
    renderColumnHeader,
    renderColumnFooter,
    renderEmptyColumn,
    onCardAdd,
    dragType,
    onCardDragStart,
    onCardDragOver,
    onCardDrop,
    onDragEnd,
    onDragLeave,
    onColumnDragStart,
    onColumnDragOver,
    onColumnDrop,
    onCardTouchStart,
    onCardTouchMove,
    onCardTouchEnd,
    onColumnTouchStart,
    onColumnTouchMove,
    onColumnTouchEnd,
    onCardKeyDown,
    dragStateId,
    kbDragStateId
  }) => {
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
        const isDragging = dragStateId === card.id
        const isKbGrabbed = kbDragStateId === card.id
        nodes.push(
          <CardItem
            key={String(card.id)}
            card={card}
            column={column}
            isDragging={isDragging}
            isKbGrabbed={isKbGrabbed}
            draggable={draggable}
            dragHintText={labels.dragHintText}
            renderCard={renderCardProp}
            onDragStart={onCardDragStart}
            onDragEnd={onDragEnd}
            onTouchStart={onCardTouchStart}
            onTouchMove={onCardTouchMove}
            onTouchEnd={onCardTouchEnd}
            onKeyDown={onCardKeyDown}
          />
        )
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

    const wipTitle =
      column.wipLimit != null
        ? resolveLocaleText(labels.wipLimitText.replace('{limit}', String(column.wipLimit)))
        : undefined

    return (
      <div
        className={colClasses}
        data-tiger-taskboard-column=""
        data-tiger-taskboard-column-id={String(column.id)}
        onDragOver={dragType === 'column' ? onColumnDragOver : undefined}
        onDrop={dragType === 'column' ? onColumnDrop : undefined}>
        {/* Column header */}
        <div
          className={taskBoardColumnHeaderClasses}
          draggable={columnDraggable}
          onDragStart={(e) => onColumnDragStart(e, column, colIndex)}
          onDragEnd={onDragEnd}
          onTouchStart={(e) => onColumnTouchStart(e, column, colIndex)}
          onTouchMove={onColumnTouchMove}
          onTouchEnd={onColumnTouchEnd}
          style={columnDraggable ? { cursor: 'grab' } : undefined}>
          {renderColumnHeader ? (
            renderColumnHeader(column)
          ) : (
            <>
              <span className={wipOver ? taskBoardWipExceededClasses : undefined}>
                {column.title}
                {column.wipLimit != null ? (
                  <span className="ml-2 text-xs font-normal opacity-70" title={wipTitle}>
                    ({column.cards.length}/{column.wipLimit})
                  </span>
                ) : (
                  <span className="ml-2 text-xs font-normal opacity-50">{column.cards.length}</span>
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

        {/* Column body */}
        <div
          className={taskBoardColumnBodyClasses}
          role="list"
          aria-label={column.title}
          onDragOver={(e) => onCardDragOver(e, column)}
          onDrop={(e) => onCardDrop(e, column)}
          onDragLeave={onDragLeave}>
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
  (prev, next) =>
    prev.column === next.column &&
    prev.colIndex === next.colIndex &&
    prev.isDropTarget === next.isDropTarget &&
    prev.isColDragging === next.isColDragging &&
    prev.dropIdx === next.dropIdx &&
    prev.draggable === next.draggable &&
    prev.columnDraggable === next.columnDraggable &&
    prev.dragType === next.dragType &&
    prev.dragStateId === next.dragStateId &&
    prev.kbDragStateId === next.kbDragStateId &&
    prev.onCardAdd === next.onCardAdd
)
ColumnItem.displayName = 'TaskBoardColumnItem'

/* ------------------------------------------------------------------ */
/* Main TaskBoard component                                           */
/* ------------------------------------------------------------------ */

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
  enforceWipLimit = false,
  beforeCardMove,
  beforeColumnMove,
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

  // Ref for async helpers to avoid stale closure
  const columnsRef = useRef(currentColumns)
  columnsRef.current = currentColumns

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

  // Stable refs for async validation callbacks
  const beforeCardMoveRef = useRef(beforeCardMove)
  beforeCardMoveRef.current = beforeCardMove
  const beforeColumnMoveRef = useRef(beforeColumnMove)
  beforeColumnMoveRef.current = beforeColumnMove
  const onCardMoveRef = useRef(onCardMove)
  onCardMoveRef.current = onCardMove
  const onColumnMoveRef = useRef(onColumnMove)
  onColumnMoveRef.current = onColumnMove
  const enforceWipLimitRef = useRef(enforceWipLimit)
  enforceWipLimitRef.current = enforceWipLimit

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

  // ===================================================================
  // Unified apply helpers — validation + WIP + commit
  // ===================================================================

  const applyCardMove = useCallback(
    async (
      cardId: string | number,
      fromColumnId: string | number,
      toColumnId: string | number,
      toIdx: number
    ) => {
      const result = moveCard(columnsRef.current, cardId, fromColumnId, toColumnId, toIdx, {
        enforceWipLimit: enforceWipLimitRef.current
      })
      if (!result) return

      if (beforeCardMoveRef.current) {
        const ok = await beforeCardMoveRef.current(result.event)
        if (!ok) return
      }

      updateColumns(result.columns)
      onCardMoveRef.current?.(result.event)
    },
    [updateColumns]
  )

  const applyColumnMove = useCallback(
    async (fromIdx: number, toIdx: number) => {
      const cols = columnsRef.current
      const result = reorderColumns(cols, fromIdx, Math.min(toIdx, cols.length - 1))
      if (!result) return

      if (beforeColumnMoveRef.current) {
        const ok = await beforeColumnMoveRef.current(result.event)
        if (!ok) return
      }

      updateColumns(result.columns)
      onColumnMoveRef.current?.(result.event)
    },
    [updateColumns]
  )

  // ---- HTML5 DnD: cards ----
  const handleCardDragStart = useCallback(
    (e: React.DragEvent, card: TaskBoardCard, column: TaskBoardColumn) => {
      if (!draggable) return
      const idx = column.cards.findIndex((c) => c.id === card.id)
      setDragData(e.dataTransfer, createCardDragData(card.id, column.id, idx))
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
      const data = parseDragData(e.dataTransfer)
      if (!data || data.type !== 'card') return

      applyCardMove(
        data.cardId,
        data.columnId,
        column.id,
        dropIdx >= 0 ? dropIdx : column.cards.length
      )
      resetDrag()
    },
    [dropIdx, applyCardMove, resetDrag]
  )

  // ---- HTML5 DnD: columns ----
  const handleColumnDragStart = useCallback(
    (e: React.DragEvent, column: TaskBoardColumn, index: number) => {
      if (!columnDraggable) return
      setDragData(e.dataTransfer, createColumnDragData(column.id, index))
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
      const data = parseDragData(e.dataTransfer)
      if (!data || data.type !== 'column') return

      const colEls = boardRef.current?.querySelectorAll('[data-tiger-taskboard-column]')
      if (!colEls) return
      const rects: DOMRect[] = []
      colEls.forEach((el) => rects.push(el.getBoundingClientRect()))
      const toIdx = getColumnDropIndex(e.clientX, rects)

      applyColumnMove(data.index, toIdx)
      resetDrag()
    },
    [applyColumnMove, resetDrag]
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

  // ---- Touch fallback: cards ----
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
        if (dragState?.type === 'card') {
          const colEl = findColumnFromPoint(st.currentX, st.currentY, boardRef.current)
          if (colEl) {
            const colId = colEl.getAttribute('data-tiger-taskboard-column-id')
            setDropTargetColumnId(colId ?? null)
            const cardEls = colEl.querySelectorAll('[data-tiger-taskboard-card]')
            const rects: DOMRect[] = []
            cardEls.forEach((el) => rects.push(el.getBoundingClientRect()))
            setDropIdx(getDropIndex(st.currentY, rects))
          }
        }
      })
    },
    [dragState]
  )

  const handleTouchEnd = useCallback(() => {
    if (!touchTrackerRef.current || !dragState) return
    touchTrackerRef.current.onTouchEnd()

    if (dragState.type === 'card' && dropTargetColumnId != null) {
      applyCardMove(
        dragState.id,
        dragState.fromColumnId!,
        dropTargetColumnId,
        dropIdx >= 0 ? dropIdx : 0
      )
    }
    resetDrag()
  }, [dragState, dropIdx, dropTargetColumnId, applyCardMove, resetDrag])

  // ---- Touch fallback: columns ----
  const handleColumnTouchStart = useCallback(
    (e: React.TouchEvent, column: TaskBoardColumn, index: number) => {
      if (!columnDraggable || !touchTrackerRef.current) return
      touchTrackerRef.current.onTouchStart(e.nativeEvent, e.currentTarget as HTMLElement)
      setDragState({ type: 'column', id: column.id, fromIndex: index })
    },
    [columnDraggable]
  )

  const handleColumnTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchTrackerRef.current || !dragState || dragState.type !== 'column') return
      touchTrackerRef.current.onTouchMove(e.nativeEvent)
    },
    [dragState]
  )

  const handleColumnTouchEnd = useCallback(() => {
    if (!touchTrackerRef.current || !dragState || dragState.type !== 'column') return
    const st = touchTrackerRef.current.onTouchEnd()

    const colEls = boardRef.current?.querySelectorAll('[data-tiger-taskboard-column]')
    if (!colEls) {
      resetDrag()
      return
    }
    const rects: DOMRect[] = []
    colEls.forEach((el) => rects.push(el.getBoundingClientRect()))
    const toIdx = getColumnDropIndex(st.currentX, rects)

    applyColumnMove(dragState.fromIndex, Math.min(toIdx, columnsRef.current.length - 1))
    resetDrag()
  }, [dragState, applyColumnMove, resetDrag])

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
            applyCardMove(kbDragState.id, kbDragState.fromColumnId, column.id, cardIdx)
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
    [draggable, kbDragState, applyCardMove]
  )

  // ---- render ----
  const wrapperClasses = useMemo(() => classNames(taskBoardBaseClasses, className), [className])

  const dragType = dragState?.type ?? null
  const dragStateId = (dragState?.type === 'card' ? dragState.id : null) as string | number | null
  const kbDragStateId = (kbDragState?.id ?? null) as string | number | null

  return (
    <div
      ref={boardRef}
      className={wrapperClasses}
      style={style}
      role="region"
      aria-label={resolveLocaleText(labels.boardAriaLabel)}
      data-tiger-task-board=""
      {...rest}>
      {currentColumns.map((col, i) => {
        const isDropTarget = dragState?.type === 'card' && dropTargetColumnId === col.id
        const isColDragging = dragState?.type === 'column' && dragState.id === col.id

        return (
          <ColumnItem
            key={String(col.id)}
            column={col}
            colIndex={i}
            isDropTarget={isDropTarget}
            isColDragging={isColDragging}
            dropIdx={isDropTarget ? dropIdx : -1}
            draggable={draggable}
            columnDraggable={columnDraggable}
            labels={labels}
            renderCardProp={renderCardProp}
            renderColumnHeader={renderColumnHeader}
            renderColumnFooter={renderColumnFooter}
            renderEmptyColumn={renderEmptyColumn}
            onCardAdd={onCardAdd}
            dragType={dragType}
            onCardDragStart={handleCardDragStart}
            onCardDragOver={handleCardDragOver}
            onCardDrop={handleCardDrop}
            onDragEnd={handleDragEnd}
            onDragLeave={handleDragLeave}
            onColumnDragStart={handleColumnDragStart}
            onColumnDragOver={handleColumnDragOver}
            onColumnDrop={handleColumnDrop}
            onCardTouchStart={handleTouchStart}
            onCardTouchMove={handleTouchMove}
            onCardTouchEnd={handleTouchEnd}
            onColumnTouchStart={handleColumnTouchStart}
            onColumnTouchMove={handleColumnTouchMove}
            onColumnTouchEnd={handleColumnTouchEnd}
            onCardKeyDown={handleCardKeyDown}
            dragStateId={dragStateId}
            kbDragStateId={kbDragStateId}
          />
        )
      })}
    </div>
  )
}

export default TaskBoard
