import { computed, defineComponent, h, onBeforeUnmount, PropType, ref, watch } from 'vue'
import {
  bindDragContainerItems,
  classNames,
  coerceClassValue,
  commitCrossContainerDrop,
  dragMoveAnnouncement,
  type DragConfig,
  type DragDropEvent,
  type DragEndEvent,
  type DragItem,
  type DragOverEvent,
  type DragStartEvent
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'
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
    const tigerConfig = useTigerConfig()
    const announcement = ref('')
    const drag = useDrag(() => ({
      config: props.config,
      containerId: props.containerId,
      onDragStart: (event: DragStartEvent) => emit('drag-start', event),
      onDragOver: (event: DragOverEvent) => {
        const from = event.item.index
        const to = event.overItem?.index ?? from
        announcement.value = dragMoveAnnouncement(from, to, tigerConfig.value.locale)
        emit('drag-over', event)
      },
      onDragEnd: (event: DragEndEvent) => {
        announcement.value = ''
        emit('drag-end', event)
      },
      onDrop: (event: DragDropEvent) => {
        emit('drop', event)
        if (event.fromContainerId !== event.toContainerId) {
          commitCrossContainerDrop(event)
          return
        }
        const result = drag.reorder(props.items)
        if (!result || result.fromIndex === result.toIndex) return
        emit('update:items', result.items)
        emit('items-change', result.items)
      }
    }))

    let unbindItems = bindDragContainerItems(drag.containerId, {
      getItems: () => props.items,
      commit: (next) => {
        emit('update:items', next)
        emit('items-change', next)
      }
    })
    watch(
      () => drag.containerId,
      (id) => {
        unbindItems()
        unbindItems = bindDragContainerItems(id, {
          getItems: () => props.items,
          commit: (next) => {
            emit('update:items', next)
            emit('items-change', next)
          }
        })
      }
    )
    onBeforeUnmount(() => unbindItems())

    const rootClass = computed(() =>
      classNames(
        'm-0 list-none p-0',
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    return () => {
      const zone = drag.getDropZoneAttrs()
      const preview = drag.draggedItem.value
        ? h(
            'div',
            { class: 'sr-only', 'aria-hidden': 'true', 'data-tiger-drag-preview': '' },
            String(drag.draggedItem.value.id)
          )
        : null
      const live = h(
        'div',
        { role: 'status', class: 'sr-only', 'data-tiger-drag-live': '' },
        announcement.value
      )
      const list = h(
        'ul',
        {
          ...attrs,
          ...zone,
          class: rootClass.value,
          'data-tiger-drag': '',
          role: 'list'
        },
        props.items.map((item) => {
          const itemAttrs: Record<string, unknown> = {
            ...drag.getDragItemAttrs(item),
            tabindex: props.config?.disabled ? -1 : 0
          }
          const isDragging = itemAttrs['data-dragging'] === true
          const custom = slots.item?.({ item, attrs: itemAttrs, isDragging })
          if (custom) return custom
          return h('li', { ...itemAttrs, key: item.id, role: 'listitem' }, String(item.id))
        })
      )
      return [preview, live, list]
    }
  }
})

export default Drag
