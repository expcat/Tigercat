import { computed, defineComponent, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  reorderSequence,
  type DragConfig,
  type DragDropEvent,
  type DragEndEvent,
  type DragItem,
  type DragOverEvent,
  type DragStartEvent
} from '@expcat/tigercat-core'
import { useDrag } from '../composables/useDrag'

export interface VueDragProps {
  items?: DragItem[]
  config?: DragConfig
  containerId?: string
  className?: string
}

export type DragProps = VueDragProps

export const Drag = defineComponent({
  name: 'TigerDrag',
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<DragItem[]>,
      default: () => []
    },
    config: {
      type: Object as PropType<DragConfig>,
      default: undefined
    },
    containerId: {
      type: String,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    }
  },
  emits: ['update:items', 'items-change', 'drag-start', 'drag-over', 'drop', 'drag-end'],
  setup(props, { emit, slots, attrs }) {
    const drag = useDrag(() => ({
      config: props.config,
      containerId: props.containerId,
      onDragStart: (event: DragStartEvent) => emit('drag-start', event),
      onDragOver: (event: DragOverEvent) => emit('drag-over', event),
      onDragEnd: (event: DragEndEvent) => emit('drag-end', event),
      onDrop: (event: DragDropEvent) => {
        emit('drop', event)
        if (event.fromIndex === event.toIndex) return
        const next = reorderSequence(props.items, event.fromIndex, event.toIndex).map(
          (item, index) => ({ ...item, index })
        )
        emit('update:items', next)
        emit('items-change', next)
      }
    }))

    const rootClass = computed(() =>
      classNames(
        'm-0 list-none p-0',
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    return () => {
      const zone = drag.getDropZoneAttrs()
      return h(
        'ul',
        {
          ...attrs,
          ...zone,
          class: rootClass.value,
          'data-tiger-drag': '',
          role: 'list'
        },
        props.items.map((item) => {
          const itemAttrs = drag.getDragItemAttrs(item)
          const isDragging = drag.draggedItem.value?.id === item.id
          const custom = slots.item?.({ item, attrs: itemAttrs, isDragging })
          if (custom) return custom
          return h('li', { ...itemAttrs, key: item.id, role: 'listitem' }, String(item.id))
        })
      )
    }
  }
})

export default Drag
