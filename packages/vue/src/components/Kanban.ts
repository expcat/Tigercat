/**
 * Kanban — thin wrapper around TaskBoard with Kanban-friendly defaults.
 *
 * Differences from TaskBoard defaults:
 *   showCardCount  = true  (TaskBoard default: false)
 *   allowAddCard   = true  (TaskBoard default: false)
 *
 * All drag-and-drop logic (HTML5, touch, keyboard) is handled by TaskBoard.
 */
import { defineComponent, h, PropType } from 'vue'
import {
  type TaskBoardColumn,
  type TaskBoardCardMoveEvent,
  type TaskBoardColumnMoveEvent,
  type TaskBoardMoveValidator,
  type TigerLocale
} from '@expcat/tigercat-core'
import { TaskBoard } from './TaskBoard'

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
    // Merge onCardAdd prop callback + card-add emit into one handler
    // to avoid Vue h() key collision between 'onCardAdd' prop and 'onCard-add' listener
    const handleCardAdd = (colId: string | number) => {
      props.onCardAdd?.(colId)
      emit('card-add', colId)
    }

    return () =>
      h(
        TaskBoard,
        {
          ...attrs,
          columns: props.columns,
          defaultColumns: props.defaultColumns,
          draggable: props.draggable,
          columnDraggable: props.columnDraggable,
          enforceWipLimit: props.enforceWipLimit,
          beforeCardMove: props.beforeCardMove,
          beforeColumnMove: props.beforeColumnMove,
          // Only set onCardAdd when needed — its presence affects button visibility
          onCardAdd: props.allowAddCard || props.onCardAdd ? handleCardAdd : undefined,
          filterText: props.filterText,
          hiddenColumns: props.hiddenColumns,
          showCardCount: props.showCardCount,
          allowAddCard: props.allowAddCard,
          allowAddColumn: props.allowAddColumn,
          locale: props.locale,
          className: props.className,
          style: props.style,
          'onCard-move': (e: TaskBoardCardMoveEvent) => emit('card-move', e),
          'onColumn-move': (e: TaskBoardColumnMoveEvent) => emit('column-move', e),
          'onUpdate:columns': (cols: TaskBoardColumn[]) => emit('update:columns', cols),
          'onColumn-add': () => emit('column-add')
        },
        slots
      )
  }
})

export default Kanban
