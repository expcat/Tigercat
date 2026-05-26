import { defineComponent, computed, ref, watch, h, PropType, onMounted, onBeforeUnmount } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
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
  type TaskBoardColumn,
  type TaskBoardCard,
  type TaskBoardCardMoveEvent,
  type TaskBoardColumnMoveEvent,
  type TaskBoardMoveValidator,
  type TigerLocale,
  type TaskBoardDragSnapshot
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueTaskBoardProps {
  columns?: TaskBoardColumn[]
  defaultColumns?: TaskBoardColumn[]
  draggable?: boolean
  columnDraggable?: boolean
  enforceWipLimit?: boolean
  beforeCardMove?: TaskBoardMoveValidator<TaskBoardCardMoveEvent>
  beforeColumnMove?: TaskBoardMoveValidator<TaskBoardColumnMoveEvent>
  onCardAdd?: (columnId: string | number) => void
  filterText?: string
  hiddenColumns?: (string | number)[]
  showCardCount?: boolean
  allowAddCard?: boolean
  allowAddColumn?: boolean
  locale?: Partial<TigerLocale>
  className?: string
  style?: Record<string, string | number>
}

export const TaskBoard = defineComponent({
  name: 'TigerTaskBoard',
  inheritAttrs: false,
  props: {
    columns: {
      type: Array as PropType<TaskBoardColumn[]>,
      default: undefined
    },
    defaultColumns: {
      type: Array as PropType<TaskBoardColumn[]>,
      default: () => []
    },
    draggable: {
      type: Boolean,
      default: true
    },
    columnDraggable: {
      type: Boolean,
      default: true
    },
    enforceWipLimit: {
      type: Boolean,
      default: false
    },
    beforeCardMove: {
      type: Function as PropType<TaskBoardMoveValidator<TaskBoardCardMoveEvent>>,
      default: undefined
    },
    beforeColumnMove: {
      type: Function as PropType<TaskBoardMoveValidator<TaskBoardColumnMoveEvent>>,
      default: undefined
    },
    onCardAdd: {
      type: Function as PropType<(columnId: string | number) => void>,
      default: undefined
    },
    filterText: { type: String, default: '' },
    hiddenColumns: {
      type: Array as PropType<(string | number)[]>,
      default: () => []
    },
    showCardCount: { type: Boolean, default: false },
    allowAddCard: { type: Boolean, default: false },
    allowAddColumn: { type: Boolean, default: false },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['card-move', 'column-move', 'card-add', 'column-add', 'update:columns'],
  setup(props, { slots, attrs, emit }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getTaskBoardLabels(mergedLocale.value))

    // ----- controlled / uncontrolled -----
    const innerColumns = ref<TaskBoardColumn[]>(props.columns ?? props.defaultColumns ?? [])

    watch(
      () => props.columns,
      (value) => {
        if (value !== undefined) innerColumns.value = value
      }
    )

    watch(
      () => props.defaultColumns,
      (value) => {
        if (props.columns === undefined && value !== undefined) {
          innerColumns.value = value
        }
      }
    )

    const currentColumns = computed(() => props.columns ?? innerColumns.value)

    // Apply filter and hidden columns (no-op when filterText is empty and hiddenColumns is empty)
    const visibleColumns = computed(() => {
      const cols = currentColumns.value
      if (!props.filterText && (!props.hiddenColumns || props.hiddenColumns.length === 0)) {
        return cols
      }
      return filterColumns(cols, props.filterText || '', props.hiddenColumns)
    })

    const updateColumns = (next: TaskBoardColumn[]) => {
      innerColumns.value = next
      emit('update:columns', next)
    }

    // ----- drag controller (unified DnD + touch + keyboard) -----
    const dragSnap = ref<TaskBoardDragSnapshot>(createDefaultDragSnapshot())
    const boardRef = ref<HTMLElement | null>(null)

    // ===================================================================
    // Unified apply helpers — validation + WIP + commit
    // ===================================================================

    const applyCardMove = async (
      cardId: string | number,
      fromColumnId: string | number,
      toColumnId: string | number,
      toIdx: number
    ) => {
      const result = moveCard(currentColumns.value, cardId, fromColumnId, toColumnId, toIdx, {
        enforceWipLimit: props.enforceWipLimit
      })
      if (!result) return

      if (props.beforeCardMove) {
        const ok = await props.beforeCardMove(result.event)
        if (!ok) return
      }

      updateColumns(result.columns)
      emit('card-move', result.event)
    }

    const applyColumnMove = async (fromIdx: number, toIdx: number) => {
      const result = reorderColumns(
        currentColumns.value,
        fromIdx,
        Math.min(toIdx, currentColumns.value.length - 1)
      )
      if (!result) return

      if (props.beforeColumnMove) {
        const ok = await props.beforeColumnMove(result.event)
        if (!ok) return
      }

      updateColumns(result.columns)
      emit('column-move', result.event)
    }

    const dragCtrl = createTaskBoardDragController(
      {
        onStateChange: (s) => {
          dragSnap.value = s
        },
        applyCardMove,
        applyColumnMove,
        getBoardEl: () => boardRef.value,
        getColumnCount: () => currentColumns.value.length
      },
      { draggable: props.draggable, columnDraggable: props.columnDraggable }
    )

    // Keep controller options in sync with props
    watch(
      () => [props.draggable, props.columnDraggable],
      () =>
        dragCtrl.setOptions({ draggable: props.draggable, columnDraggable: props.columnDraggable })
    )

    // ----- lifecycle -----
    onMounted(() => {
      dragCtrl.init()
    })
    onBeforeUnmount(() => {
      dragCtrl.dispose()
    })

    // ----- render helpers -----
    const wrapperClasses = computed(() =>
      classNames(
        taskBoardBaseClasses,
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    const wrapperStyle = computed(() =>
      mergeStyleValues((attrs as Record<string, unknown>).style, props.style)
    )

    const renderCard = (card: TaskBoardCard, column: TaskBoardColumn) => {
      const isDragging = dragSnap.value.drag?.type === 'card' && dragSnap.value.drag.id === card.id
      const isKbGrabbed = dragSnap.value.kbDrag?.id === card.id

      const cardClasses = classNames(
        taskBoardCardClasses,
        isDragging && taskBoardCardDraggingClasses,
        isKbGrabbed && 'ring-2 ring-[var(--tiger-primary,#2563eb)]'
      )

      const cardAttrs = {
        key: String(card.id),
        class: cardClasses,
        draggable: props.draggable,
        tabindex: 0,
        role: 'listitem',
        'aria-roledescription': labels.value.dragHintText,
        'aria-grabbed': isKbGrabbed ? 'true' : undefined,
        'data-tiger-taskboard-card': '',
        'data-tiger-taskboard-card-id': String(card.id),
        onDragstart: (e: DragEvent) => {
          if (e.dataTransfer) dragCtrl.cardDragStart(e.dataTransfer, card, column)
        },
        onDragend: () => dragCtrl.dragEnd(),
        onTouchstart: (e: TouchEvent) =>
          dragCtrl.cardTouchStart(e, e.currentTarget as HTMLElement, card, column),
        onTouchmove: (e: TouchEvent) => dragCtrl.cardTouchMove(e),
        onTouchend: () => dragCtrl.cardTouchEnd(),
        onKeydown: (e: KeyboardEvent) => {
          if (dragCtrl.cardKeyDown(e.key, card, column)) e.preventDefault()
        }
      }

      if (slots.card) {
        return h('div', cardAttrs, slots.card({ card, column, isDragging }))
      }

      return h('div', cardAttrs, [
        h('div', { class: 'font-medium text-sm text-[var(--tiger-text,#1f2937)]' }, card.title),
        card.description
          ? h(
              'div',
              { class: 'mt-1 text-xs text-[var(--tiger-text-muted,#6b7280)] line-clamp-2' },
              card.description
            )
          : null
      ])
    }

    const renderColumnNode = (column: TaskBoardColumn, colIndex: number) => {
      const isDropTarget =
        dragSnap.value.drag?.type === 'card' && dragSnap.value.dropTargetColumnId === column.id
      const isColDragging =
        dragSnap.value.drag?.type === 'column' && dragSnap.value.drag.id === column.id
      const wipOver = isWipExceeded(column)
      const cardCount = props.showCardCount ? getColumnCardCount(column) : null

      const colClasses = classNames(
        taskBoardColumnClasses,
        isDropTarget && taskBoardColumnDropTargetClasses,
        isColDragging && taskBoardColumnDraggingClasses
      )

      // Column header
      const headerContent = slots['column-header']
        ? slots['column-header']({ column })
        : [
            h('span', { class: wipOver ? taskBoardWipExceededClasses : undefined }, [
              column.title,
              // When showCardCount is enabled, use the compact badge style
              props.showCardCount && cardCount
                ? null
                : column.wipLimit != null
                  ? h(
                      'span',
                      {
                        class: 'ml-2 text-xs font-normal opacity-70',
                        title: resolveLocaleText(
                          labels.value.wipLimitText.replace('{limit}', String(column.wipLimit))
                        )
                      },
                      `(${column.cards.length}/${column.wipLimit})`
                    )
                  : h(
                      'span',
                      { class: 'ml-2 text-xs font-normal opacity-50' },
                      String(column.cards.length)
                    )
            ]),
            // Card count badge (Kanban-style)
            props.showCardCount && cardCount
              ? h(
                  'span',
                  {
                    class: classNames(
                      kanbanCardCountClasses,
                      wipOver && taskBoardWipExceededClasses
                    )
                  },
                  cardCount.limit ? `${cardCount.count}/${cardCount.limit}` : `${cardCount.count}`
                )
              : null,
            column.description
              ? h(
                  'span',
                  {
                    class:
                      'text-xs font-normal text-[var(--tiger-text-muted,#6b7280)] truncate max-w-[120px]'
                  },
                  column.description
                )
              : null
          ]

      const header = h(
        'div',
        {
          class: taskBoardColumnHeaderClasses,
          draggable: props.columnDraggable,
          onDragstart: (e: DragEvent) => {
            if (e.dataTransfer) dragCtrl.columnDragStart(e.dataTransfer, column, colIndex)
          },
          onDragend: () => dragCtrl.dragEnd(),
          onTouchstart: (e: TouchEvent) =>
            dragCtrl.columnTouchStart(e, e.currentTarget as HTMLElement, column, colIndex),
          onTouchmove: (e: TouchEvent) => dragCtrl.columnTouchMove(e),
          onTouchend: () => dragCtrl.columnTouchEnd(),
          style: props.columnDraggable ? 'cursor: grab' : undefined
        },
        headerContent
      )

      // Cards or empty state
      const cards =
        column.cards.length > 0
          ? column.cards
              .flatMap((card, i) => {
                const nodes = []
                if (isDropTarget && dragSnap.value.dropIndex === i) {
                  nodes.push(h('div', { key: `drop-${i}`, class: taskBoardDropIndicatorClasses }))
                }
                nodes.push(renderCard(card, column))
                return nodes
              })
              .concat(
                isDropTarget && dragSnap.value.dropIndex >= column.cards.length
                  ? [h('div', { key: 'drop-end', class: taskBoardDropIndicatorClasses })]
                  : []
              )
          : [
              isDropTarget
                ? h('div', { key: 'drop-empty', class: taskBoardDropIndicatorClasses })
                : slots['empty-column']
                  ? slots['empty-column']({ column })
                  : h(
                      'div',
                      { class: taskBoardEmptyClasses },
                      resolveLocaleText(labels.value.emptyColumnText)
                    )
            ]

      const body = h(
        'div',
        {
          class: taskBoardColumnBodyClasses,
          role: 'list',
          'aria-label': column.title,
          onDragover: (e: DragEvent) => {
            e.preventDefault()
            dragCtrl.cardDragOver(e.clientY, e.currentTarget as HTMLElement, column)
          },
          onDrop: (e: DragEvent) => {
            e.preventDefault()
            if (e.dataTransfer) dragCtrl.cardDrop(e.dataTransfer, column)
          },
          onDragleave: (e: DragEvent) =>
            dragCtrl.dragLeave(e.currentTarget as HTMLElement, e.relatedTarget as Element | null)
        },
        cards
      )

      // Footer — add-card button
      const showAddCard = props.allowAddCard || props.onCardAdd
      const footer = slots['column-footer']
        ? slots['column-footer']({ column })
        : showAddCard
          ? h(
              'div',
              {
                class: classNames(
                  'border-t border-[var(--tiger-border,#e5e7eb)]',
                  taskBoardAddCardClasses
                ),
                role: 'button',
                tabindex: 0,
                onClick: () => {
                  emit('card-add', column.id)
                },
                onKeydown: (e: KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    emit('card-add', column.id)
                  }
                }
              },
              [h('span', null, '+'), h('span', null, resolveLocaleText(labels.value.addCardText))]
            )
          : null

      return h(
        'div',
        {
          key: String(column.id),
          class: colClasses,
          'data-tiger-taskboard-column': '',
          'data-tiger-taskboard-column-id': String(column.id),
          onDragover:
            dragSnap.value.drag?.type === 'column'
              ? (e: DragEvent) => {
                  e.preventDefault()
                  dragCtrl.columnDragOver()
                }
              : undefined,
          onDrop:
            dragSnap.value.drag?.type === 'column'
              ? (e: DragEvent) => {
                  e.preventDefault()
                  if (e.dataTransfer) dragCtrl.columnDrop(e.dataTransfer, e.clientX)
                }
              : undefined
        },
        [header, body, footer]
      )
    }

    // ----- main render -----
    return () => {
      const children = visibleColumns.value.map((col, i) => renderColumnNode(col, i))

      // Add column button
      if (props.allowAddColumn) {
        children.push(
          h(
            'div',
            {
              key: '__add-column',
              class: kanbanAddColumnClasses,
              role: 'button',
              tabindex: 0,
              onClick: () => emit('column-add'),
              onKeydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  emit('column-add')
                }
              }
            },
            '+ ' + resolveLocaleText(labels.value.addCardText)
          )
        )
      }

      return h(
        'div',
        {
          ...attrs,
          ref: boardRef,
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          role: 'region',
          'aria-label': resolveLocaleText(labels.value.boardAriaLabel),
          'data-tiger-task-board': ''
        },
        children
      )
    }
  }
})

export default TaskBoard
