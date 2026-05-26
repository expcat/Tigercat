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
  kanbanCardCountClasses,
  kanbanAddColumnClasses,
  filterColumns,
  getColumnCardCount,
  moveCard,
  reorderColumns,
  isWipExceeded,
  createTaskBoardDragController,
  createDefaultDragSnapshot,
  type TaskBoardProps as CoreTaskBoardProps,
  type TaskBoardColumn,
  type TaskBoardCard,
  type TaskBoardDragSnapshot,
  type TaskBoardDragController
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
  dragCtrl: TaskBoardDragController
}

const CardItem = React.memo<CardItemProps>(
  ({ card, column, isDragging, isKbGrabbed, draggable, dragHintText, renderCard, dragCtrl }) => {
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
        onDragStart={(e) => {
          if (e.dataTransfer) dragCtrl.cardDragStart(e.dataTransfer, card, column)
        }}
        onDragEnd={() => dragCtrl.dragEnd()}
        onTouchStart={(e) =>
          dragCtrl.cardTouchStart(e.nativeEvent, e.currentTarget as HTMLElement, card, column)
        }
        onTouchMove={(e) => dragCtrl.cardTouchMove(e.nativeEvent)}
        onTouchEnd={() => dragCtrl.cardTouchEnd()}
        onKeyDown={(e) => {
          if (dragCtrl.cardKeyDown(e.key, card, column)) e.preventDefault()
        }}>
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
  dragCtrl: TaskBoardDragController
  dragStateId: string | number | null
  kbDragStateId: string | number | null
  showCardCount: boolean
  allowAddCard: boolean
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
    dragCtrl,
    dragStateId,
    kbDragStateId,
    showCardCount,
    allowAddCard
  }) => {
    const wipOver = isWipExceeded(column)
    const cardCount = showCardCount ? getColumnCardCount(column) : null

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
            dragCtrl={dragCtrl}
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
        onDragOver={
          dragType === 'column'
            ? (e: React.DragEvent) => {
                e.preventDefault()
                dragCtrl.columnDragOver()
              }
            : undefined
        }
        onDrop={
          dragType === 'column'
            ? (e: React.DragEvent) => {
                e.preventDefault()
                if (e.dataTransfer) dragCtrl.columnDrop(e.dataTransfer, e.clientX)
              }
            : undefined
        }>
        {/* Column header */}
        <div
          className={taskBoardColumnHeaderClasses}
          draggable={columnDraggable}
          onDragStart={(e) => {
            if (e.dataTransfer) dragCtrl.columnDragStart(e.dataTransfer, column, colIndex)
          }}
          onDragEnd={() => dragCtrl.dragEnd()}
          onTouchStart={(e) =>
            dragCtrl.columnTouchStart(
              e.nativeEvent,
              e.currentTarget as HTMLElement,
              column,
              colIndex
            )
          }
          onTouchMove={(e) => dragCtrl.columnTouchMove(e.nativeEvent)}
          onTouchEnd={() => dragCtrl.columnTouchEnd()}
          style={columnDraggable ? { cursor: 'grab' } : undefined}>
          {renderColumnHeader ? (
            renderColumnHeader(column)
          ) : (
            <>
              <span className={wipOver ? taskBoardWipExceededClasses : undefined}>
                {column.title}
                {showCardCount && cardCount ? null : column.wipLimit != null ? (
                  <span className="ml-2 text-xs font-normal opacity-70" title={wipTitle}>
                    ({column.cards.length}/{column.wipLimit})
                  </span>
                ) : (
                  <span className="ml-2 text-xs font-normal opacity-50">{column.cards.length}</span>
                )}
              </span>
              {showCardCount && cardCount && (
                <span
                  className={classNames(
                    kanbanCardCountClasses,
                    wipOver && taskBoardWipExceededClasses
                  )}>
                  {cardCount.limit ? `${cardCount.count}/${cardCount.limit}` : `${cardCount.count}`}
                </span>
              )}
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
          onDragOver={(e) => {
            e.preventDefault()
            dragCtrl.cardDragOver(e.clientY, e.currentTarget as HTMLElement, column)
          }}
          onDrop={(e) => {
            e.preventDefault()
            if (e.dataTransfer) dragCtrl.cardDrop(e.dataTransfer, column)
          }}
          onDragLeave={(e) =>
            dragCtrl.dragLeave(e.currentTarget as HTMLElement, e.relatedTarget as Element | null)
          }>
          {cardsContent}
        </div>

        {/* Column footer */}
        {renderColumnFooter ? (
          renderColumnFooter(column)
        ) : onCardAdd || allowAddCard ? (
          <div
            className={classNames(
              'border-t border-[var(--tiger-border,#e5e7eb)]',
              taskBoardAddCardClasses
            )}
            role="button"
            tabIndex={0}
            onClick={() => onCardAdd?.(column.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onCardAdd?.(column.id)
              }
            }}>
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
    prev.onCardAdd === next.onCardAdd &&
    prev.showCardCount === next.showCardCount &&
    prev.allowAddCard === next.allowAddCard
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
  filterText = '',
  hiddenColumns,
  showCardCount = false,
  allowAddCard = false,
  allowAddColumn = false,
  onColumnAdd,
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

  // Apply filter and hidden columns (no-op when filterText is empty and hiddenColumns is empty)
  const visibleColumns = useMemo(() => {
    if (!filterText && (!hiddenColumns || hiddenColumns.length === 0)) {
      return currentColumns
    }
    return filterColumns(currentColumns, filterText, hiddenColumns)
  }, [currentColumns, filterText, hiddenColumns])

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

  // ---- drag controller (unified DnD + touch + keyboard) ----
  const [dragSnap, setDragSnap] = useState<TaskBoardDragSnapshot>(createDefaultDragSnapshot)

  const boardRef = useRef<HTMLDivElement>(null)

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

  const dragCtrlRef = useRef<TaskBoardDragController | null>(null)
  if (!dragCtrlRef.current) {
    dragCtrlRef.current = createTaskBoardDragController(
      {
        onStateChange: setDragSnap,
        applyCardMove: (...args) => applyCardMoveRef.current(...args),
        applyColumnMove: (...args) => applyColumnMoveRef.current(...args),
        getBoardEl: () => boardRef.current,
        getColumnCount: () => columnsRef.current.length
      },
      { draggable, columnDraggable }
    )
  }
  const dragCtrl = dragCtrlRef.current

  // Stable refs for apply callbacks (avoids stale closures in controller)
  const applyCardMoveRef = useRef(applyCardMove)
  applyCardMoveRef.current = applyCardMove
  const applyColumnMoveRef = useRef(applyColumnMove)
  applyColumnMoveRef.current = applyColumnMove

  // Keep controller options in sync with props
  useEffect(() => {
    dragCtrl.setOptions({ draggable, columnDraggable })
  }, [draggable, columnDraggable, dragCtrl])

  useEffect(() => {
    dragCtrl.init()
    return () => dragCtrl.dispose()
  }, [dragCtrl])

  // ---- render ----
  const wrapperClasses = useMemo(() => classNames(taskBoardBaseClasses, className), [className])

  const dragType = dragSnap.drag?.type ?? null
  const dragStateId = (dragSnap.drag?.type === 'card' ? dragSnap.drag.id : null) as
    | string
    | number
    | null
  const kbDragStateId = (dragSnap.kbDrag?.id ?? null) as string | number | null

  return (
    <div
      ref={boardRef}
      className={wrapperClasses}
      style={style}
      role="region"
      aria-label={resolveLocaleText(labels.boardAriaLabel)}
      data-tiger-task-board=""
      {...rest}>
      {visibleColumns.map((col, i) => {
        const isDropTarget =
          dragSnap.drag?.type === 'card' && dragSnap.dropTargetColumnId === col.id
        const isColDragging = dragSnap.drag?.type === 'column' && dragSnap.drag.id === col.id

        return (
          <ColumnItem
            key={String(col.id)}
            column={col}
            colIndex={i}
            isDropTarget={isDropTarget}
            isColDragging={isColDragging}
            dropIdx={isDropTarget ? dragSnap.dropIndex : -1}
            draggable={draggable}
            columnDraggable={columnDraggable}
            labels={labels}
            renderCardProp={renderCardProp}
            renderColumnHeader={renderColumnHeader}
            renderColumnFooter={renderColumnFooter}
            renderEmptyColumn={renderEmptyColumn}
            onCardAdd={onCardAdd}
            dragType={dragType}
            dragCtrl={dragCtrl}
            dragStateId={dragStateId}
            kbDragStateId={kbDragStateId}
            showCardCount={showCardCount}
            allowAddCard={allowAddCard}
          />
        )
      })}
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

export default TaskBoard
