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
  kanbanSwimlaneClasses,
  kanbanSwimlaneHeaderClasses,
  kanbanSwimlaneDotClasses,
  kanbanAddColumnClasses,
  kanbanFilterHighlightClasses,
  getColumnCardCount,
  moveCard,
  reorderColumns,
  isWipExceeded,
  appendDefaultTaskBoardCard,
  appendDefaultTaskBoardColumn,
  createTaskBoardDragController,
  createDefaultDragSnapshot,
  resolveTaskBoardView,
  type TaskBoardProps as CoreTaskBoardProps,
  type TaskBoardColumn,
  type TaskBoardCard,
  type TaskBoardDragSnapshot,
  type TaskBoardDragController,
  type TaskBoardViewColumn
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { useControlledState } from '../hooks/useControlledState'

function cardMatchesFilter(card: TaskBoardCard, filterText: string): boolean {
  if (!filterText.trim()) return false
  const lower = filterText.toLowerCase()
  return (
    (card.title ?? '').toLowerCase().includes(lower) ||
    (card.description ?? '').toLowerCase().includes(lower)
  )
}

interface CardItemProps {
  card: TaskBoardCard
  column: TaskBoardColumn
  isDragging: boolean
  isKbGrabbed: boolean
  draggable: boolean
  dragHintText: string
  filterHit: boolean
  renderCard?: (card: TaskBoardCard, columnId: string | number) => React.ReactNode
  dragCtrl: TaskBoardDragController
}

const CardItem: React.FC<CardItemProps> = ({
  card,
  column,
  isDragging,
  isKbGrabbed,
  draggable,
  dragHintText,
  filterHit,
  renderCard,
  dragCtrl
}) => {
  const cardClasses = classNames(
    taskBoardCardClasses,
    isDragging && taskBoardCardDraggingClasses,
    filterHit && kanbanFilterHighlightClasses,
    isKbGrabbed &&
      'ring-2 ring-[var(--tiger-primary,#2563eb)] ring-offset-2 shadow-[0_0_12px_rgba(37,99,235,0.25)]'
  )

  return (
    <div
      className={cardClasses}
      draggable={draggable}
      tabIndex={0}
      role="listitem"
      title={dragHintText}
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
        if (dragCtrl.cardKeyDown(e.key, card, column)) {
          e.preventDefault()
          e.stopPropagation()
        }
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
}

interface ColumnItemProps {
  viewColumn: TaskBoardViewColumn
  isDropTarget: boolean
  isColDragging: boolean
  dropIdx: number
  draggable: boolean
  columnDraggable: boolean
  labels: ReturnType<typeof getTaskBoardLabels>
  filterText: string
  renderCardProp?: (card: TaskBoardCard, columnId: string | number) => React.ReactNode
  renderColumnHeader?: (column: TaskBoardColumn) => React.ReactNode
  renderColumnFooter?: (column: TaskBoardColumn) => React.ReactNode
  renderEmptyColumn?: (column: TaskBoardColumn) => React.ReactNode
  onCardAdd?: (columnId: string | number) => void
  addDisabled: boolean
  dragType: 'card' | 'column' | null
  dragCtrl: TaskBoardDragController
  dragStateId: string | number | null
  kbDragStateId: string | number | null
  showCardCount: boolean
  onToggleSwimlane: (laneId: string | number, collapsed: boolean) => void
}

const ColumnItem: React.FC<ColumnItemProps> = ({
  viewColumn,
  isDropTarget,
  isColDragging,
  dropIdx,
  draggable,
  columnDraggable,
  labels,
  filterText,
  renderCardProp,
  renderColumnHeader,
  renderColumnFooter,
  renderEmptyColumn,
  onCardAdd,
  addDisabled,
  dragType,
  dragCtrl,
  dragStateId,
  kbDragStateId,
  showCardCount,
  onToggleSwimlane
}) => {
  const column = viewColumn.source
  const wipOver = isWipExceeded(column)
  const cardCount = getColumnCardCount(column)

  const colClasses = classNames(
    taskBoardColumnClasses,
    isDropTarget && taskBoardColumnDropTargetClasses,
    isColDragging && taskBoardColumnDraggingClasses
  )

  const renderCardNode = (card: TaskBoardCard, visibleIndex: number) => {
    const nodes: React.ReactNode[] = []
    if (isDropTarget && dropIdx === visibleIndex) {
      nodes.push(<div key={`drop-${visibleIndex}`} className={taskBoardDropIndicatorClasses} />)
    }
    nodes.push(
      <CardItem
        key={String(card.id)}
        card={card}
        column={column}
        isDragging={dragStateId === card.id}
        isKbGrabbed={kbDragStateId === card.id}
        draggable={draggable}
        dragHintText={labels.dragHintText}
        filterHit={cardMatchesFilter(card, filterText)}
        renderCard={renderCardProp}
        dragCtrl={dragCtrl}
      />
    )
    return nodes
  }

  let cardsContent: React.ReactNode
  if (viewColumn.groups && viewColumn.groups.length > 0) {
    let offset = 0
    const nodes: React.ReactNode[] = viewColumn.groups.map((group) => {
      const prefix = offset
      if (!group.swimlane.collapsed) offset += group.cards.length
      return (
        <div
          key={String(group.swimlane.id)}
          className={kanbanSwimlaneClasses}
          data-tiger-kanban-swimlane=""
          data-tiger-kanban-swimlane-id={String(group.swimlane.id)}>
          <button
            type="button"
            className={kanbanSwimlaneHeaderClasses}
            aria-expanded={!group.swimlane.collapsed}
            onClick={() => onToggleSwimlane(group.swimlane.id, !group.swimlane.collapsed)}>
            {group.swimlane.color && (
              <span
                className={kanbanSwimlaneDotClasses}
                style={{ backgroundColor: group.swimlane.color }}
              />
            )}
            <span>{group.swimlane.label}</span>
            <span className="ms-auto text-xs text-[var(--tiger-text-muted,#6b7280)]">
              {group.cards.length}
            </span>
          </button>
          {!group.swimlane.collapsed &&
            group.cards.flatMap((card, i) => renderCardNode(card, prefix + i))}
        </div>
      )
    })
    if (isDropTarget && dropIdx >= viewColumn.visibleCards.length) {
      nodes.push(<div key="drop-end" className={taskBoardDropIndicatorClasses} />)
    }
    cardsContent = nodes
  } else if (viewColumn.visibleCards.length > 0) {
    const nodes: React.ReactNode[] = viewColumn.visibleCards.flatMap((card, i) =>
      renderCardNode(card, i)
    )
    if (isDropTarget && dropIdx >= viewColumn.visibleCards.length) {
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
  const countLabel = cardCount.limit
    ? `${cardCount.count}/${cardCount.limit}`
    : `${cardCount.count}`

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
      <div
        className={taskBoardColumnHeaderClasses}
        draggable={columnDraggable}
        tabIndex={columnDraggable ? 0 : undefined}
        onDragStart={(e) => {
          if (e.dataTransfer) dragCtrl.columnDragStart(e.dataTransfer, column)
        }}
        onDragEnd={() => dragCtrl.dragEnd()}
        onTouchStart={(e) =>
          dragCtrl.columnTouchStart(e.nativeEvent, e.currentTarget as HTMLElement, column)
        }
        onTouchMove={(e) => dragCtrl.columnTouchMove(e.nativeEvent)}
        onTouchEnd={() => dragCtrl.columnTouchEnd()}
        onKeyDown={(e) => {
          if (dragCtrl.columnKeyDown(e.key, column)) e.preventDefault()
        }}
        style={columnDraggable ? { cursor: 'grab' } : undefined}>
        {renderColumnHeader ? (
          renderColumnHeader(column)
        ) : (
          <>
            <span className={wipOver ? taskBoardWipExceededClasses : undefined}>
              {column.title}
              {!showCardCount && cardCount.limit != null ? (
                <span
                  className={classNames(
                    'ms-2 text-xs font-normal transition-all duration-200 px-1.5 py-0.5 rounded',
                    wipOver
                      ? 'bg-red-50 dark:bg-red-950/30 text-[var(--tiger-error,#ef4444)] font-semibold border border-red-200/30 dark:border-red-900/30 shadow-xs'
                      : 'opacity-70 bg-[var(--tiger-border,#e5e7eb)]/20 text-[var(--tiger-text-secondary,#6b7280)]'
                  )}
                  title={wipTitle}>
                  ({countLabel})
                </span>
              ) : null}
            </span>
            {showCardCount ? (
              <span
                className={classNames(
                  kanbanCardCountClasses,
                  wipOver &&
                    `${taskBoardWipExceededClasses} bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/30 font-semibold shadow-xs`
                )}
                title={wipTitle}>
                {countLabel}
              </span>
            ) : null}
            {column.description && (
              <span className="text-xs font-normal text-[var(--tiger-text-muted,#6b7280)] truncate max-w-[120px]">
                {column.description}
              </span>
            )}
          </>
        )}
      </div>

      <div
        className={taskBoardColumnBodyClasses}
        role="list"
        aria-label={column.title}
        tabIndex={viewColumn.visibleCards.length === 0 ? 0 : undefined}
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
        }
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return
          if (dragCtrl.columnBodyKeyDown(e.key, column)) e.preventDefault()
        }}>
        {cardsContent}
      </div>

      {renderColumnFooter ? (
        renderColumnFooter(column)
      ) : onCardAdd ? (
        <button
          type="button"
          className={classNames(
            'border-t border-[var(--tiger-border,#e5e7eb)]',
            taskBoardAddCardClasses
          )}
          disabled={addDisabled}
          onClick={() => onCardAdd(column.id)}>
          <span>+</span>
          <span>{resolveLocaleText(labels.addCardText)}</span>
        </button>
      ) : null}
    </div>
  )
}

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
  swimlanes,
  swimlaneField,
  onSwimlaneCollapse,
  locale,
  labels: labelsOverride,
  className,
  style,
  ...rest
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getTaskBoardLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const dir: 'ltr' | 'rtl' = config.direction === 'rtl' ? 'rtl' : 'ltr'

  const [currentColumns, setCurrentColumns] = useControlledState<TaskBoardColumn[]>({
    value: controlledColumns,
    defaultValue: defaultColumns,
    onChange: onColumnsChange
  })

  const [collapsedOverride, setCollapsedOverride] = useState<Record<string, boolean>>({})

  const view = useMemo(
    () =>
      resolveTaskBoardView({
        columns: currentColumns,
        filterText,
        hiddenColumns,
        swimlanes,
        swimlaneField,
        unassignedLabel: labels.unassignedSwimlaneText,
        collapsedLaneState: collapsedOverride
      }),
    [
      currentColumns,
      filterText,
      hiddenColumns,
      swimlanes,
      swimlaneField,
      collapsedOverride,
      labels.unassignedSwimlaneText
    ]
  )

  const columnsRef = useRef(currentColumns)
  columnsRef.current = currentColumns
  const viewRef = useRef(view)
  viewRef.current = view
  const dirRef = useRef(dir)
  dirRef.current = dir

  const consumerOnCardAdd = onCardAdd
  const showAddCard = Boolean(allowAddCard || consumerOnCardAdd)
  const handleCardAdd = useCallback(
    (columnId: string | number) => {
      if (consumerOnCardAdd == null) {
        const col = columnsRef.current.find((item) => item.id === columnId)
        if (
          enforceWipLimit &&
          col &&
          col.wipLimit != null &&
          col.wipLimit > 0 &&
          col.cards.length >= col.wipLimit
        ) {
          return
        }
        setCurrentColumns(
          appendDefaultTaskBoardCard(columnsRef.current, columnId, labels.newCardTitle)
        )
      }
      consumerOnCardAdd?.(columnId)
    },
    [consumerOnCardAdd, enforceWipLimit, labels.newCardTitle, setCurrentColumns]
  )

  const handleColumnAdd = useCallback(() => {
    if (onColumnAdd == null) {
      setCurrentColumns(appendDefaultTaskBoardColumn(columnsRef.current, labels.newColumnTitle))
    }
    onColumnAdd?.()
  }, [onColumnAdd, labels.newColumnTitle, setCurrentColumns])

  const handleToggleSwimlane = useCallback(
    (laneId: string | number, collapsed: boolean) => {
      if (onSwimlaneCollapse) {
        onSwimlaneCollapse(laneId, collapsed)
        return
      }
      setCollapsedOverride((prev) => ({ ...prev, [String(laneId)]: collapsed }))
    },
    [onSwimlaneCollapse]
  )

  const [dragSnap, setDragSnap] = useState<TaskBoardDragSnapshot>(createDefaultDragSnapshot)
  const boardRef = useRef<HTMLDivElement>(null)

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

      setCurrentColumns(result.columns)
      onCardMoveRef.current?.(result.event)
    },
    [setCurrentColumns]
  )

  const applyColumnMove = useCallback(
    async (fromIdx: number, toIdx: number) => {
      const result = reorderColumns(columnsRef.current, fromIdx, toIdx)
      if (!result) return

      if (beforeColumnMoveRef.current) {
        const ok = await beforeColumnMoveRef.current(result.event)
        if (!ok) return
      }

      setCurrentColumns(result.columns)
      onColumnMoveRef.current?.(result.event)
    },
    [setCurrentColumns]
  )

  const applyCardMoveRef = useRef(applyCardMove)
  applyCardMoveRef.current = applyCardMove
  const applyColumnMoveRef = useRef(applyColumnMove)
  applyColumnMoveRef.current = applyColumnMove

  const dragCtrlRef = useRef<TaskBoardDragController | null>(null)
  if (!dragCtrlRef.current) {
    dragCtrlRef.current = createTaskBoardDragController(
      {
        onStateChange: setDragSnap,
        applyCardMove: (...args) => applyCardMoveRef.current(...args),
        applyColumnMove: (...args) => applyColumnMoveRef.current(...args),
        getBoardEl: () => boardRef.current,
        getView: () => viewRef.current,
        getSourceColumns: () => columnsRef.current,
        getDir: () => dirRef.current
      },
      { draggable, columnDraggable }
    )
  }
  const dragCtrl = dragCtrlRef.current

  useEffect(() => {
    dragCtrl.setOptions({ draggable, columnDraggable })
  }, [draggable, columnDraggable, dragCtrl])

  useEffect(() => {
    dragCtrl.init()
    return () => dragCtrl.dispose()
  }, [dragCtrl])

  const wrapperClasses = useMemo(() => classNames(taskBoardBaseClasses, className), [className])

  const dragType = dragSnap.drag?.type ?? null
  const dragStateId = (dragSnap.drag?.type === 'card' ? dragSnap.drag.id : null) as
    string | number | null
  const kbDragStateId = (dragSnap.kbDrag?.id ?? null) as string | number | null
  const kbGrabbing = dragSnap.kbDrag?.type === 'card'
  const liveMessage = dragSnap.kbDrag ? labels.dragHintText : ''

  return (
    <div
      {...rest}
      ref={boardRef}
      className={wrapperClasses}
      style={style}
      role="region"
      aria-label={resolveLocaleText(labels.boardAriaLabel)}
      data-tiger-task-board="">
      <div className="sr-only" aria-live="assertive">
        {liveMessage}
      </div>
      {view.columns.map((viewColumn) => {
        const col = viewColumn.source
        const isDropTarget =
          (dragSnap.drag?.type === 'card' || kbGrabbing) && dragSnap.dropTargetColumnId === col.id
        const isColDragging = dragSnap.drag?.type === 'column' && dragSnap.drag.id === col.id
        const atWip =
          enforceWipLimit &&
          col.wipLimit != null &&
          col.wipLimit > 0 &&
          col.cards.length >= col.wipLimit

        return (
          <ColumnItem
            key={String(col.id)}
            viewColumn={viewColumn}
            isDropTarget={Boolean(isDropTarget)}
            isColDragging={isColDragging}
            dropIdx={isDropTarget ? dragSnap.dropIndex : -1}
            draggable={draggable}
            columnDraggable={columnDraggable}
            labels={labels}
            filterText={filterText}
            renderCardProp={renderCardProp}
            renderColumnHeader={renderColumnHeader}
            renderColumnFooter={renderColumnFooter}
            renderEmptyColumn={renderEmptyColumn}
            onCardAdd={showAddCard ? handleCardAdd : undefined}
            addDisabled={Boolean(atWip)}
            dragType={dragType}
            dragCtrl={dragCtrl}
            dragStateId={dragStateId}
            kbDragStateId={kbDragStateId}
            showCardCount={showCardCount}
            onToggleSwimlane={handleToggleSwimlane}
          />
        )
      })}
      {allowAddColumn && (
        <button type="button" className={kanbanAddColumnClasses} onClick={handleColumnAdd}>
          + {resolveLocaleText(labels.addColumnText)}
        </button>
      )}
    </div>
  )
}

export default TaskBoard
