import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getTimelineContainerClasses,
  getTimelineItemClasses,
  getTimelineTailClasses,
  getTimelineHeadClasses,
  getTimelineDotClasses,
  getTimelineContentClasses,
  getPendingDotClasses,
  timelineListClasses,
  timelineLabelClasses,
  timelineDescriptionClasses,
  type TimelineMode,
  type TimelineItem,
  type TimelineItemPosition
} from '@expcat/tigercat-core'

type HChildren = Parameters<typeof h>[2]

export interface VueTimelineProps {
  items?: TimelineItem[]
  mode?: TimelineMode
  pending?: boolean
  pendingDot?: unknown
  reverse?: boolean
  className?: string
  style?: Record<string, unknown>
}

export const Timeline = defineComponent({
  name: 'TigerTimeline',
  inheritAttrs: false,
  props: {
    /**
     * Timeline data source
     */
    items: {
      type: Array as PropType<TimelineItem[]>,
      default: () => []
    },
    /**
     * Timeline mode/direction
     */
    mode: {
      type: String as PropType<TimelineMode>,
      default: 'left' as TimelineMode
    },
    /**
     * Whether to show pending state
     */
    pending: {
      type: Boolean,
      default: false
    },
    /**
     * Pending item dot content
     */
    pendingDot: {
      type: [String, Object] as PropType<unknown>,
      default: null
    },
    /**
     * Whether to reverse the timeline order
     */
    reverse: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const processedItems = computed(() => {
      let items = [...props.items]

      if (props.reverse) {
        items = items.reverse()
      }

      // Assign positions for alternate mode
      if (props.mode === 'alternate') {
        return items.map((item, index) => ({
          ...item,
          position: (item.position || (index % 2 === 0 ? 'left' : 'right')) as TimelineItemPosition
        }))
      }

      return items
    })

    const containerClasses = computed(() => {
      return classNames(
        getTimelineContainerClasses(props.mode),
        timelineListClasses,
        props.className,
        coerceClassValue(attrs.class)
      )
    })

    const containerStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    function getItemKey(item: TimelineItem, index: number): string | number {
      return item.key || index
    }

    function renderDot(item: TimelineItem, isPending = false) {
      // Custom dot from slot
      if (slots.dot) {
        return h('div', { class: getTimelineDotClasses(undefined, true) }, slots.dot({ item }))
      }

      // Custom dot from item
      if (item.dot) {
        return h(
          'div',
          { class: getTimelineDotClasses(undefined, true) },
          item.dot as unknown as HChildren
        )
      }

      // Pending dot
      if (isPending) {
        if (props.pendingDot) {
          return h(
            'div',
            { class: getTimelineDotClasses(undefined, true) },
            props.pendingDot as unknown as HChildren
          )
        }
        return h('div', { class: getPendingDotClasses() })
      }

      // Default dot with optional color
      const dotClasses = getTimelineDotClasses(item.color)
      const dotStyle = item.color ? { backgroundColor: item.color } : {}

      return h('div', { class: dotClasses, style: dotStyle })
    }

    function renderTimelineItem(item: TimelineItem, index: number) {
      const key = getItemKey(item, index)
      const isLast = index === processedItems.value.length - 1 && !props.pending
      const position = item.position

      const itemClasses = getTimelineItemClasses(props.mode, position, isLast)
      const tailClasses = getTimelineTailClasses(props.mode, isLast)
      const headClasses = getTimelineHeadClasses(props.mode)
      const contentClasses = getTimelineContentClasses(props.mode, position)

      // Custom render from slot
      if (slots.item) {
        return h('li', { key, class: itemClasses }, [
          h('div', { class: tailClasses }),
          h('div', { class: headClasses }, [renderDot(item)]),
          h('div', { class: contentClasses }, slots.item({ item, index }))
        ])
      }

      // Default item render
      const contentChildren = []

      if (item.label) {
        contentChildren.push(h('div', { class: timelineLabelClasses }, item.label))
      }

      if (item.content) {
        contentChildren.push(h('div', { class: timelineDescriptionClasses }, item.content))
      }

      return h('li', { key, class: itemClasses }, [
        h('div', { class: tailClasses }),
        h('div', { class: headClasses }, [renderDot(item)]),
        h('div', { class: contentClasses }, contentChildren)
      ])
    }

    function renderPendingItem() {
      if (!props.pending) {
        return null
      }

      const index = processedItems.value.length
      const position =
        props.mode === 'alternate'
          ? ((index % 2 === 0 ? 'left' : 'right') as TimelineItemPosition)
          : undefined

      const itemClasses = getTimelineItemClasses(props.mode, position, true)
      const headClasses = getTimelineHeadClasses(props.mode)
      const contentClasses = getTimelineContentClasses(props.mode, position)

      // Pending content from slot
      if (slots.pending) {
        return h('li', { key: 'pending', class: itemClasses }, [
          h('div', { class: headClasses }, [renderDot({}, true)]),
          h('div', { class: contentClasses }, slots.pending())
        ])
      }

      return h('li', { key: 'pending', class: itemClasses }, [
        h('div', { class: headClasses }, [renderDot({}, true)]),
        h('div', { class: contentClasses }, [
          h('div', { class: timelineDescriptionClasses }, 'Loading...')
        ])
      ])
    }

    return () => {
      return h(
        'ul',
        {
          ...attrs,
          class: containerClasses.value,
          style: containerStyle.value,
          'aria-busy': attrs['aria-busy'] ?? (props.pending ? 'true' : undefined)
        },
        [
          ...processedItems.value.map((item, index) => renderTimelineItem(item, index)),
          renderPendingItem()
        ]
      )
    }
  }
})

export default Timeline
