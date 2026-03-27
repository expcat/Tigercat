import { defineComponent, h, ref, computed, watch, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getTaskBoardLabels,
  mergeTigerLocale,
  resolveLocaleText,
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
  type TaskBoardDragState,
  type TaskBoardMoveValidator,
  type TigerLocale,
  type TouchDragTracker
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueKanbanProps {
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

export const Kanban = defineComponent({
  name: 'TigerKanban',
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
    draggable: { type: Boolean, default: true },
    columnDraggable: { type: Boolean, default: true },
    enforceWipLimit: { type: Boolean, default: false },
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
    showCardCount: { type: Boolean, default: true },
    allowAddCard: { type: Boolean, default: true },
    allowAddColumn: { type: Boolean, default: false },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['card-move', 'column-move', 'update:columns', 'card-add', 'column-add'],
  setup(props, { emit, attrs, slots }) {
    const config = useTigerConfig()
    const boardRef = ref<HTMLElement | null>(null)

    // ── Columns state ──
    const internalColumns = ref<TaskBoardColumn[]>(props.defaultColumns ?? [])
    const isControlled = computed(() => props.columns !== undefined)

    const rawColumns = computed(() => (isControlled.value ? props.columns! : internalColumns.value))

    // Apply filter and hidden columns
    const visibleColumns = computed(() =>
      filterColumns(rawColumns.value, props.filterText || '', props.hiddenColumns)
    )

    watch(
      () => props.columns,
      (v) => {
        if (v) internalColumns.value = v
      }
    )

    function updateColumns(cols: TaskBoardColumn[]) {
      if (!isControlled.value) internalColumns.value = cols
      emit('update:columns', cols)
    }

    // ── Locale ──
    const merged = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getTaskBoardLabels(merged.value))

    // ── Drag state ──
    const dragState = ref<TaskBoardDragState | null>(null)
    const dropTargetCol = ref<string | number | null>(null)
    const dropTargetIdx = ref<number>(-1)
    const dragType = computed(() => dragState.value?.type ?? null)

    // ── Touch drag ──
    let _touchTracker: TouchDragTracker | null = null

    // ── Card drag handlers ──
    function onCardDragStart(
      e: DragEvent,
      card: TaskBoardCard,
      colId: string | number,
      idx: number
    ) {
      if (!props.draggable || !e.dataTransfer) return
      setDragData(e.dataTransfer, createCardDragData(card.id, colId, idx))
      dragState.value = { type: 'card', id: card.id, fromColumnId: colId, fromIndex: idx }
    }

    function onColumnDragStart(e: DragEvent, colId: string | number, idx: number) {
      if (!props.columnDraggable || !e.dataTransfer) return
      setDragData(e.dataTransfer, createColumnDragData(colId, idx))
      dragState.value = { type: 'column', id: colId, fromIndex: idx }
    }

    function onDragOver(e: DragEvent, colId: string | number) {
      e.preventDefault()
      if (!dragState.value) return
      dropTargetCol.value = colId
      if (dragState.value.type === 'card') {
        const colEl = (e.currentTarget as HTMLElement).querySelector('[data-kanban-body]')
        if (colEl) {
          const cards = Array.from(colEl.querySelectorAll('[data-kanban-card]'))
          const rects = cards.map((c) => c.getBoundingClientRect())
          dropTargetIdx.value = getDropIndex(e.clientY, rects)
        }
      }
    }

    function onColumnDragOver(e: DragEvent) {
      e.preventDefault()
      if (!dragState.value || dragState.value.type !== 'column') return
      const boardEl = boardRef.value
      if (!boardEl) return
      const cols = Array.from(boardEl.querySelectorAll('[data-kanban-column]'))
      const rects = cols.map((c) => c.getBoundingClientRect())
      dropTargetIdx.value = getColumnDropIndex(e.clientX, rects)
    }

    async function onDrop(e: DragEvent) {
      e.preventDefault()
      if (!dragState.value || !e.dataTransfer) return

      const data = parseDragData(e.dataTransfer)
      if (!data) return

      const cols = rawColumns.value

      if (data.type === 'card' && dropTargetCol.value != null) {
        if (props.beforeCardMove) {
          const evt: TaskBoardCardMoveEvent = {
            cardId: data.cardId,
            fromColumnId: data.columnId,
            toColumnId: dropTargetCol.value,
            fromIndex: data.index,
            toIndex: dropTargetIdx.value
          }
          const ok = await props.beforeCardMove(evt)
          if (!ok) {
            resetDrag()
            return
          }
        }

        const result = moveCard(
          cols,
          data.cardId,
          data.columnId,
          dropTargetCol.value,
          dropTargetIdx.value,
          { enforceWipLimit: props.enforceWipLimit }
        )
        if (result) {
          updateColumns(result.columns)
          emit('card-move', result.event)
        }
      } else if (data.type === 'column') {
        if (props.beforeColumnMove) {
          const evt: TaskBoardColumnMoveEvent = {
            columnId: data.columnId,
            fromIndex: data.index,
            toIndex: dropTargetIdx.value
          }
          const ok = await props.beforeColumnMove(evt)
          if (!ok) {
            resetDrag()
            return
          }
        }

        const result = reorderColumns(cols, data.index, dropTargetIdx.value)
        if (result) {
          updateColumns(result.columns)
          emit('column-move', result.event)
        }
      }

      resetDrag()
    }

    function onDragEnd() {
      resetDrag()
    }

    function resetDrag() {
      dragState.value = null
      dropTargetCol.value = null
      dropTargetIdx.value = -1
    }

    // ── Container classes ──
    const containerClasses = computed(() =>
      classNames(getKanbanContainerClasses(props.className), coerceClassValue(attrs.class))
    )

    const containerStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    // ── Render ──
    return () => {
      const children = visibleColumns.value.map((col, colIdx) => {
        const wipExceeded = isWipExceeded(col)
        const cardCount = getColumnCardCount(col)
        const isDragOverCol = dropTargetCol.value === col.id
        const isColDragging = dragState.value?.type === 'column' && dragState.value.id === col.id

        // Column header
        const headerContent = [
          slots['column-header']
            ? slots['column-header']({ column: col })
            : h('span', {}, resolveLocaleText(col.title)),
          props.showCardCount
            ? h(
                'span',
                {
                  class: classNames(
                    kanbanCardCountClasses,
                    wipExceeded && taskBoardWipExceededClasses
                  )
                },
                cardCount.limit ? `${cardCount.count}/${cardCount.limit}` : `${cardCount.count}`
              )
            : null
        ]

        const header = h(
          'div',
          {
            class: classNames(
              taskBoardColumnHeaderClasses,
              wipExceeded && taskBoardWipExceededClasses
            )
          },
          headerContent
        )

        // Cards
        const cardEls = col.cards.map((card, cardIdx) => {
          const isCardDragging = dragState.value?.type === 'card' && dragState.value.id === card.id

          return h(
            'div',
            {
              key: card.id,
              class: classNames(
                taskBoardCardClasses,
                isCardDragging && taskBoardCardDraggingClasses
              ),
              draggable: props.draggable,
              'data-kanban-card': '',
              onDragstart: (e: DragEvent) => onCardDragStart(e, card, col.id, cardIdx)
            },
            slots.card
              ? slots.card({ card, columnId: col.id })
              : [
                  h('div', { class: 'font-medium text-sm' }, resolveLocaleText(card.title)),
                  card.description
                    ? h(
                        'div',
                        { class: 'text-xs text-[var(--tiger-text-muted,#6b7280)] mt-1' },
                        card.description
                      )
                    : null
                ]
          )
        })

        // Drop indicator
        if (isDragOverCol && dragType.value === 'card' && dropTargetIdx.value >= 0) {
          cardEls.splice(
            dropTargetIdx.value,
            0,
            h('div', {
              key: '__drop-indicator',
              class: taskBoardDropIndicatorClasses
            })
          )
        }

        // Card body
        const body = h(
          'div',
          {
            class: taskBoardColumnBodyClasses,
            'data-kanban-body': ''
          },
          cardEls.length > 0
            ? cardEls
            : [
                h(
                  'div',
                  { class: taskBoardEmptyClasses },
                  resolveLocaleText(labels.value.emptyColumnText)
                )
              ]
        )

        // Add card button
        const addBtn = props.allowAddCard
          ? h(
              'div',
              {
                class: kanbanAddCardClasses,
                role: 'button',
                tabindex: 0,
                onClick: () => {
                  props.onCardAdd?.(col.id)
                  emit('card-add', col.id)
                },
                onKeydown: (e: KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    props.onCardAdd?.(col.id)
                    emit('card-add', col.id)
                  }
                }
              },
              '+ ' + resolveLocaleText(labels.value.addCardText)
            )
          : null

        return h(
          'div',
          {
            key: col.id,
            class: classNames(
              taskBoardColumnClasses,
              isDragOverCol && dragType.value === 'card' && taskBoardColumnDropTargetClasses,
              isColDragging && taskBoardColumnDraggingClasses
            ),
            'data-kanban-column': '',
            draggable: props.columnDraggable,
            onDragstart: (e: DragEvent) => onColumnDragStart(e, col.id, colIdx),
            onDragover: (e: DragEvent) => onDragOver(e, col.id),
            onDrop: onDrop,
            onDragend: onDragEnd
          },
          [header, body, addBtn]
        )
      })

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
          ref: boardRef,
          class: containerClasses.value,
          style: containerStyle.value,
          role: 'region',
          'aria-label': 'Kanban board',
          onDragover: onColumnDragOver
        },
        children
      )
    }
  }
})

export default Kanban
