import {
  defineComponent,
  computed,
  ref,
  watch,
  h,
  PropType,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance
} from 'vue'
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
  type TaskBoardColumn,
  type TaskBoardCard,
  type TaskBoardSwimlane,
  type TaskBoardCardMoveEvent,
  type TaskBoardColumnMoveEvent,
  type TaskBoardMoveValidator,
  type TigerLocale,
  type TigerLocaleTaskBoard,
  type TaskBoardDragSnapshot
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

function cardMatchesFilter(card: TaskBoardCard, filterText: string): boolean {
  if (!filterText.trim()) return false
  const lower = filterText.toLowerCase()
  return (
    (card.title ?? '').toLowerCase().includes(lower) ||
    (card.description ?? '').toLowerCase().includes(lower)
  )
}

export interface VueTaskBoardProps {
  columns?: TaskBoardColumn[]
  defaultColumns?: TaskBoardColumn[]
  draggable?: boolean
  columnDraggable?: boolean
  enforceWipLimit?: boolean
  beforeCardMove?: TaskBoardMoveValidator<TaskBoardCardMoveEvent>
  beforeColumnMove?: TaskBoardMoveValidator<TaskBoardColumnMoveEvent>
  onCardAdd?: (columnId: string | number) => void
  onColumnAdd?: () => void
  filterText?: string
  hiddenColumns?: (string | number)[]
  showCardCount?: boolean
  allowAddCard?: boolean
  allowAddColumn?: boolean
  swimlanes?: TaskBoardSwimlane[]
  swimlaneField?: string
  onSwimlaneCollapse?: (laneId: string | number, collapsed: boolean) => void
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleTaskBoard>
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
    filterText: { type: String, default: '' },
    hiddenColumns: {
      type: Array as PropType<(string | number)[]>,
      default: () => []
    },
    showCardCount: { type: Boolean, default: false },
    allowAddCard: { type: Boolean, default: false },
    allowAddColumn: { type: Boolean, default: false },
    swimlanes: {
      type: Array as PropType<TaskBoardSwimlane[]>,
      default: undefined
    },
    swimlaneField: {
      type: String,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleTaskBoard>>,
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
  emits: [
    'card-move',
    'column-move',
    'card-add',
    'column-add',
    'update:columns',
    'swimlane-collapse'
  ],
  setup(props, { slots, attrs, emit }) {
    const instance = getCurrentInstance()
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getTaskBoardLabels(mergedLocale.value, props.labels))
    const dir = computed<'ltr' | 'rtl'>(() => (config.value.direction === 'rtl' ? 'rtl' : 'ltr'))

    const innerColumns = ref<TaskBoardColumn[]>(
      props.columns !== undefined ? props.columns : (props.defaultColumns ?? [])
    )

    watch(
      () => props.columns,
      (value) => {
        if (value !== undefined) innerColumns.value = value
      }
    )

    const currentColumns = computed(() =>
      props.columns !== undefined ? props.columns : innerColumns.value
    )

    const collapsedOverride = ref<Record<string, boolean>>({})

    const view = computed(() =>
      resolveTaskBoardView({
        columns: currentColumns.value,
        filterText: props.filterText,
        hiddenColumns: props.hiddenColumns,
        swimlanes: props.swimlanes,
        swimlaneField: props.swimlaneField,
        unassignedLabel: labels.value.unassignedSwimlaneText,
        collapsedLaneState: collapsedOverride.value
      })
    )

    const updateColumns = (next: TaskBoardColumn[]) => {
      innerColumns.value = next
      emit('update:columns', next)
    }

    const hasListener = (propName: string): boolean =>
      typeof (instance?.vnode.props as Record<string, unknown> | undefined)?.[propName] ===
      'function'

    const addCardToColumn = (columnId: string | number) => {
      emit('card-add', columnId)
      if (!hasListener('onCardAdd')) {
        const col = currentColumns.value.find((item) => item.id === columnId)
        if (
          props.enforceWipLimit &&
          col &&
          col.wipLimit != null &&
          col.wipLimit > 0 &&
          col.cards.length >= col.wipLimit
        ) {
          return
        }
        updateColumns(
          appendDefaultTaskBoardCard(currentColumns.value, columnId, labels.value.newCardTitle)
        )
      }
    }

    const addColumn = () => {
      emit('column-add')
      if (!hasListener('onColumnAdd')) {
        updateColumns(
          appendDefaultTaskBoardColumn(currentColumns.value, labels.value.newColumnTitle)
        )
      }
    }

    const toggleSwimlane = (laneId: string | number, collapsed: boolean) => {
      emit('swimlane-collapse', laneId, collapsed)
      if (!hasListener('onSwimlaneCollapse')) {
        collapsedOverride.value = { ...collapsedOverride.value, [String(laneId)]: collapsed }
      }
    }

    const dragSnap = ref<TaskBoardDragSnapshot>(createDefaultDragSnapshot())
    const boardRef = ref<HTMLElement | null>(null)

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
      const result = reorderColumns(currentColumns.value, fromIdx, toIdx)
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
        getView: () => view.value,
        getSourceColumns: () => currentColumns.value,
        getDir: () => dir.value
      },
      { draggable: props.draggable, columnDraggable: props.columnDraggable }
    )

    watch(
      () => [props.draggable, props.columnDraggable] as const,
      () =>
        dragCtrl.setOptions({ draggable: props.draggable, columnDraggable: props.columnDraggable })
    )

    onMounted(() => {
      dragCtrl.init()
    })
    onBeforeUnmount(() => {
      dragCtrl.dispose()
    })

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
        cardMatchesFilter(card, props.filterText || '') && kanbanFilterHighlightClasses,
        isKbGrabbed &&
          'ring-2 ring-[var(--tiger-primary,#2563eb)] ring-offset-2 shadow-[0_0_12px_rgba(37,99,235,0.25)]'
      )

      const cardAttrs = {
        key: String(card.id),
        class: cardClasses,
        draggable: props.draggable,
        tabindex: 0,
        role: 'listitem',
        title: labels.value.dragHintText,
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
          if (dragCtrl.cardKeyDown(e.key, card, column)) {
            e.preventDefault()
            e.stopPropagation()
          }
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

    const renderColumnNode = (viewColumn: (typeof view.value.columns)[number]) => {
      const column = viewColumn.source
      const kbGrabbing = dragSnap.value.kbDrag?.type === 'card'
      const isDropTarget =
        (dragSnap.value.drag?.type === 'card' || kbGrabbing) &&
        dragSnap.value.dropTargetColumnId === column.id
      const isColDragging =
        dragSnap.value.drag?.type === 'column' && dragSnap.value.drag.id === column.id
      const dropIdx = isDropTarget ? dragSnap.value.dropIndex : -1
      const wipOver = isWipExceeded(column)
      const cardCount = getColumnCardCount(column)
      const countLabel = cardCount.limit
        ? `${cardCount.count}/${cardCount.limit}`
        : `${cardCount.count}`
      const wipTitle =
        column.wipLimit != null
          ? resolveLocaleText(labels.value.wipLimitText.replace('{limit}', String(column.wipLimit)))
          : undefined

      const colClasses = classNames(
        taskBoardColumnClasses,
        isDropTarget && taskBoardColumnDropTargetClasses,
        isColDragging && taskBoardColumnDraggingClasses
      )

      const headerContent = slots['column-header']
        ? slots['column-header']({ column })
        : [
            h('span', { class: wipOver ? taskBoardWipExceededClasses : undefined }, [
              column.title,
              !props.showCardCount && cardCount.limit != null
                ? h(
                    'span',
                    {
                      class: classNames(
                        'ms-2 text-xs font-normal transition-all duration-200 px-1.5 py-0.5 rounded',
                        wipOver
                          ? 'bg-red-50 dark:bg-red-950/30 text-[var(--tiger-error,#ef4444)] font-semibold border border-red-200/30 dark:border-red-900/30 shadow-xs'
                          : 'opacity-70 bg-[var(--tiger-border,#e5e7eb)]/20 text-[var(--tiger-text-secondary,#6b7280)]'
                      ),
                      title: wipTitle
                    },
                    `(${countLabel})`
                  )
                : null
            ]),
            props.showCardCount
              ? h(
                  'span',
                  {
                    class: classNames(
                      kanbanCardCountClasses,
                      wipOver &&
                        `${taskBoardWipExceededClasses} bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/30 font-semibold shadow-xs`
                    ),
                    title: wipTitle
                  },
                  countLabel
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
          tabindex: props.columnDraggable ? 0 : undefined,
          onDragstart: (e: DragEvent) => {
            if (e.dataTransfer) dragCtrl.columnDragStart(e.dataTransfer, column)
          },
          onDragend: () => dragCtrl.dragEnd(),
          onTouchstart: (e: TouchEvent) =>
            dragCtrl.columnTouchStart(e, e.currentTarget as HTMLElement, column),
          onTouchmove: (e: TouchEvent) => dragCtrl.columnTouchMove(e),
          onTouchend: () => dragCtrl.columnTouchEnd(),
          onKeydown: (e: KeyboardEvent) => {
            if (dragCtrl.columnKeyDown(e.key, column)) e.preventDefault()
          },
          style: props.columnDraggable ? 'cursor: grab' : undefined
        },
        headerContent
      )

      const renderCardNode = (card: TaskBoardCard, visibleIndex: number) => {
        const nodes = []
        if (isDropTarget && dropIdx === visibleIndex) {
          nodes.push(
            h('div', { key: `drop-${visibleIndex}`, class: taskBoardDropIndicatorClasses })
          )
        }
        nodes.push(renderCard(card, column))
        return nodes
      }

      let cards
      if (viewColumn.groups && viewColumn.groups.length > 0) {
        let offset = 0
        cards = viewColumn.groups.map((group) => {
          const prefix = offset
          if (!group.swimlane.collapsed) offset += group.cards.length
          return h(
            'div',
            {
              key: String(group.swimlane.id),
              class: kanbanSwimlaneClasses,
              'data-tiger-kanban-swimlane': '',
              'data-tiger-kanban-swimlane-id': String(group.swimlane.id)
            },
            [
              h(
                'button',
                {
                  type: 'button',
                  class: kanbanSwimlaneHeaderClasses,
                  'aria-expanded': !group.swimlane.collapsed,
                  onClick: () => toggleSwimlane(group.swimlane.id, !group.swimlane.collapsed)
                },
                [
                  group.swimlane.color
                    ? h('span', {
                        class: kanbanSwimlaneDotClasses,
                        style: { backgroundColor: group.swimlane.color }
                      })
                    : null,
                  h('span', null, group.swimlane.label),
                  h(
                    'span',
                    { class: 'ms-auto text-xs text-[var(--tiger-text-muted,#6b7280)]' },
                    String(group.cards.length)
                  )
                ]
              ),
              group.swimlane.collapsed
                ? null
                : group.cards.flatMap((card, i) => renderCardNode(card, prefix + i))
            ]
          )
        })
        if (isDropTarget && dropIdx >= viewColumn.visibleCards.length) {
          cards = cards.concat([
            h('div', { key: 'drop-end', class: taskBoardDropIndicatorClasses })
          ])
        }
      } else if (viewColumn.visibleCards.length > 0) {
        cards = viewColumn.visibleCards.flatMap((card, i) => renderCardNode(card, i))
        if (isDropTarget && dropIdx >= viewColumn.visibleCards.length) {
          cards = cards.concat([
            h('div', { key: 'drop-end', class: taskBoardDropIndicatorClasses })
          ])
        }
      } else {
        cards = [
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
      }

      const body = h(
        'div',
        {
          class: taskBoardColumnBodyClasses,
          role: 'list',
          'aria-label': column.title,
          tabindex: viewColumn.visibleCards.length === 0 ? 0 : undefined,
          onDragover: (e: DragEvent) => {
            e.preventDefault()
            dragCtrl.cardDragOver(e.clientY, e.currentTarget as HTMLElement, column)
          },
          onDrop: (e: DragEvent) => {
            e.preventDefault()
            if (e.dataTransfer) dragCtrl.cardDrop(e.dataTransfer, column)
          },
          onDragleave: (e: DragEvent) =>
            dragCtrl.dragLeave(e.currentTarget as HTMLElement, e.relatedTarget as Element | null),
          onKeydown: (e: KeyboardEvent) => {
            if (e.target !== e.currentTarget) return
            if (dragCtrl.columnBodyKeyDown(e.key, column)) e.preventDefault()
          }
        },
        cards
      )

      const showAddCard = props.allowAddCard || hasListener('onCardAdd')
      const atWip =
        props.enforceWipLimit &&
        column.wipLimit != null &&
        column.wipLimit > 0 &&
        column.cards.length >= column.wipLimit
      const footer = slots['column-footer']
        ? slots['column-footer']({ column })
        : showAddCard
          ? h(
              'button',
              {
                type: 'button',
                class: classNames(
                  'border-t border-[var(--tiger-border,#e5e7eb)]',
                  taskBoardAddCardClasses
                ),
                disabled: atWip,
                onClick: () => addCardToColumn(column.id)
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

    return () => {
      const children = view.value.columns.map((col) => renderColumnNode(col))

      if (props.allowAddColumn) {
        children.push(
          h(
            'button',
            {
              key: '__add-column',
              type: 'button',
              class: kanbanAddColumnClasses,
              onClick: () => addColumn()
            },
            '+ ' + resolveLocaleText(labels.value.addColumnText)
          )
        )
      }

      const liveMessage = dragSnap.value.kbDrag ? labels.value.dragHintText : ''

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
        [h('div', { class: 'sr-only', 'aria-live': 'assertive' }, liveMessage), ...children]
      )
    }
  }
})

export default TaskBoard
