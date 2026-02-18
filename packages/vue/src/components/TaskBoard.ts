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
  type TaskBoardColumn,
  type TaskBoardCard,
  type TaskBoardCardMoveEvent,
  type TaskBoardColumnMoveEvent,
  type TaskBoardDragState,
  type TaskBoardMoveValidator,
  type TigerLocale,
  type TouchDragTracker
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
  emits: ['card-move', 'column-move', 'card-add', 'update:columns'],
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

    const updateColumns = (next: TaskBoardColumn[]) => {
      innerColumns.value = next
      emit('update:columns', next)
    }

    // ----- drag state -----
    const dragState = ref<TaskBoardDragState | null>(null)
    const dropTargetColumnId = ref<string | number | null>(null)
    const dropIndex = ref(-1)

    const boardRef = ref<HTMLElement | null>(null)

    // ----- touch tracker -----
    let touchTracker: TouchDragTracker | null = null
    let touchRaf = 0

    const isTouchDevice = () =>
      typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

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

      // beforeCardMove gate
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

    // ----- HTML5 DnD: cards -----
    const handleCardDragStart = (e: DragEvent, card: TaskBoardCard, column: TaskBoardColumn) => {
      if (!props.draggable || !e.dataTransfer) return
      const idx = column.cards.findIndex((c) => c.id === card.id)
      setDragData(e.dataTransfer, createCardDragData(card.id, column.id, idx))
      dragState.value = { type: 'card', id: card.id, fromColumnId: column.id, fromIndex: idx }
    }

    const handleCardDragOver = (e: DragEvent, column: TaskBoardColumn) => {
      e.preventDefault()
      if (!dragState.value || dragState.value.type !== 'card') return
      dropTargetColumnId.value = column.id

      const target = e.currentTarget as HTMLElement
      const cardEls = target.querySelectorAll('[data-tiger-taskboard-card]')
      const rects: DOMRect[] = []
      cardEls.forEach((el) => rects.push(el.getBoundingClientRect()))
      dropIndex.value = getDropIndex(e.clientY, rects)
    }

    const handleCardDrop = (e: DragEvent, column: TaskBoardColumn) => {
      e.preventDefault()
      if (!e.dataTransfer) return
      const data = parseDragData(e.dataTransfer)
      if (!data || data.type !== 'card') return

      applyCardMove(
        data.cardId,
        data.columnId,
        column.id,
        dropIndex.value >= 0 ? dropIndex.value : column.cards.length
      )
      resetDragState()
    }

    // ----- HTML5 DnD: columns -----
    const handleColumnDragStart = (e: DragEvent, column: TaskBoardColumn, index: number) => {
      if (!props.columnDraggable || !e.dataTransfer) return
      setDragData(e.dataTransfer, createColumnDragData(column.id, index))
      dragState.value = { type: 'column', id: column.id, fromIndex: index }
    }

    const handleColumnDragOver = (e: DragEvent) => {
      if (!dragState.value || dragState.value.type !== 'column') return
      e.preventDefault()
    }

    const handleColumnDrop = (e: DragEvent) => {
      e.preventDefault()
      if (!e.dataTransfer) return
      const data = parseDragData(e.dataTransfer)
      if (!data || data.type !== 'column') return

      const colEls = boardRef.value?.querySelectorAll('[data-tiger-taskboard-column]')
      if (!colEls) return
      const rects: DOMRect[] = []
      colEls.forEach((el) => rects.push(el.getBoundingClientRect()))
      const toIdx = getColumnDropIndex(e.clientX, rects)

      applyColumnMove(data.index, toIdx)
      resetDragState()
    }

    const handleDragEnd = () => {
      resetDragState()
    }

    const handleDragLeave = (e: DragEvent) => {
      const related = e.relatedTarget as HTMLElement | null
      if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
        if (dragState.value?.type === 'card') {
          dropTargetColumnId.value = null
          dropIndex.value = -1
        }
      }
    }

    const resetDragState = () => {
      dragState.value = null
      dropTargetColumnId.value = null
      dropIndex.value = -1
    }

    // ----- Touch fallback: cards -----
    const setupTouch = () => {
      if (!isTouchDevice()) return
      touchTracker = createTouchDragTracker()
    }

    const handleTouchStart = (e: TouchEvent, card: TaskBoardCard, column: TaskBoardColumn) => {
      if (!props.draggable || !touchTracker) return
      const idx = column.cards.findIndex((c) => c.id === card.id)
      touchTracker.onTouchStart(e, e.currentTarget as HTMLElement)
      dragState.value = { type: 'card', id: card.id, fromColumnId: column.id, fromIndex: idx }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchTracker || !dragState.value) return
      touchTracker.onTouchMove(e)

      cancelAnimationFrame(touchRaf)
      touchRaf = requestAnimationFrame(() => {
        const st = touchTracker!.getState()
        if (dragState.value?.type === 'card') {
          const colEl = findColumnFromPoint(st.currentX, st.currentY, boardRef.value)
          if (colEl) {
            const colId = colEl.getAttribute('data-tiger-taskboard-column-id')
            dropTargetColumnId.value = colId ?? null

            const cardEls = colEl.querySelectorAll('[data-tiger-taskboard-card]')
            const rects: DOMRect[] = []
            cardEls.forEach((el) => rects.push(el.getBoundingClientRect()))
            dropIndex.value = getDropIndex(st.currentY, rects)
          }
        }
      })
    }

    const handleTouchEnd = () => {
      if (!touchTracker || !dragState.value) return
      touchTracker.onTouchEnd()

      if (dragState.value.type === 'card' && dropTargetColumnId.value != null) {
        applyCardMove(
          dragState.value.id,
          dragState.value.fromColumnId!,
          dropTargetColumnId.value,
          dropIndex.value >= 0 ? dropIndex.value : 0
        )
      }
      resetDragState()
    }

    // ----- Touch fallback: columns -----
    const handleColumnTouchStart = (e: TouchEvent, column: TaskBoardColumn, index: number) => {
      if (!props.columnDraggable || !touchTracker) return
      touchTracker.onTouchStart(e, e.currentTarget as HTMLElement)
      dragState.value = { type: 'column', id: column.id, fromIndex: index }
    }

    const handleColumnTouchMove = (e: TouchEvent) => {
      if (!touchTracker || !dragState.value || dragState.value.type !== 'column') return
      touchTracker.onTouchMove(e)
    }

    const handleColumnTouchEnd = () => {
      if (!touchTracker || !dragState.value || dragState.value.type !== 'column') return
      const st = touchTracker.onTouchEnd()

      const colEls = boardRef.value?.querySelectorAll('[data-tiger-taskboard-column]')
      if (!colEls) {
        resetDragState()
        return
      }
      const rects: DOMRect[] = []
      colEls.forEach((el) => rects.push(el.getBoundingClientRect()))
      const toIdx = getColumnDropIndex(st.currentX, rects)

      applyColumnMove(dragState.value.fromIndex, Math.min(toIdx, currentColumns.value.length - 1))
      resetDragState()
    }

    // ----- Keyboard DnD -----
    const kbDragState = ref<TaskBoardDragState | null>(null)

    const handleCardKeyDown = (e: KeyboardEvent, card: TaskBoardCard, column: TaskBoardColumn) => {
      if (!props.draggable) return

      // Enter/Space — toggle grab
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!kbDragState.value) {
          const idx = column.cards.findIndex((c) => c.id === card.id)
          kbDragState.value = { type: 'card', id: card.id, fromColumnId: column.id, fromIndex: idx }
        } else {
          // drop
          const cardIdx = column.cards.findIndex((c) => c.id === card.id)
          if (kbDragState.value.fromColumnId !== undefined) {
            applyCardMove(kbDragState.value.id, kbDragState.value.fromColumnId, column.id, cardIdx)
          }
          kbDragState.value = null
        }
        return
      }

      if (e.key === 'Escape' && kbDragState.value) {
        e.preventDefault()
        kbDragState.value = null
      }
    }

    // ----- lifecycle -----
    onMounted(() => {
      setupTouch()
    })
    onBeforeUnmount(() => {
      cancelAnimationFrame(touchRaf)
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
      const isDragging = dragState.value?.type === 'card' && dragState.value.id === card.id
      const isKbGrabbed = kbDragState.value?.id === card.id

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
        onDragstart: (e: DragEvent) => handleCardDragStart(e, card, column),
        onDragend: handleDragEnd,
        onTouchstart: (e: TouchEvent) => handleTouchStart(e, card, column),
        onTouchmove: handleTouchMove,
        onTouchend: handleTouchEnd,
        onKeydown: (e: KeyboardEvent) => handleCardKeyDown(e, card, column)
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
        dragState.value?.type === 'card' && dropTargetColumnId.value === column.id
      const isColDragging = dragState.value?.type === 'column' && dragState.value.id === column.id
      const wipOver = isWipExceeded(column)

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
              column.wipLimit != null
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
          onDragstart: (e: DragEvent) => handleColumnDragStart(e, column, colIndex),
          onDragend: handleDragEnd,
          onTouchstart: (e: TouchEvent) => handleColumnTouchStart(e, column, colIndex),
          onTouchmove: handleColumnTouchMove,
          onTouchend: handleColumnTouchEnd,
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
                if (isDropTarget && dropIndex.value === i) {
                  nodes.push(h('div', { key: `drop-${i}`, class: taskBoardDropIndicatorClasses }))
                }
                nodes.push(renderCard(card, column))
                return nodes
              })
              .concat(
                isDropTarget && dropIndex.value >= column.cards.length
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
          onDragover: (e: DragEvent) => handleCardDragOver(e, column),
          onDrop: (e: DragEvent) => handleCardDrop(e, column),
          onDragleave: handleDragLeave
        },
        cards
      )

      // Footer — only emit, no direct prop call
      const footer = slots['column-footer']
        ? slots['column-footer']({ column })
        : props.onCardAdd
          ? h(
              'div',
              {
                class: classNames(
                  'border-t border-[var(--tiger-border,#e5e7eb)]',
                  taskBoardAddCardClasses
                ),
                onClick: () => {
                  emit('card-add', column.id)
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
          onDragover: dragState.value?.type === 'column' ? handleColumnDragOver : undefined,
          onDrop: dragState.value?.type === 'column' ? handleColumnDrop : undefined
        },
        [header, body, footer]
      )
    }

    // ----- main render -----
    return () =>
      h(
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
        currentColumns.value.map((col, i) => renderColumnNode(col, i))
      )
  }
})

export default TaskBoard
