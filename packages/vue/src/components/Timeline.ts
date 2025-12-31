import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
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
  type TimelineItemPosition,
} from '@tigercat/core'

export const Timeline = defineComponent({
  name: 'TigerTimeline',
  props: {
    /**
     * Timeline data source
     */
    items: {
      type: Array as PropType<TimelineItem[]>,
      default: () => [],
    },
    /**
     * Timeline mode/direction
     */
    mode: {
      type: String as PropType<TimelineMode>,
      default: 'left' as TimelineMode,
    },
    /**
     * Whether to show pending state
     */
    pending: {
      type: Boolean,
      default: false,
    },
    /**
     * Pending item dot content
     */
    pendingDot: {
      type: [String, Object] as PropType<unknown>,
      default: null,
    },
    /**
     * Whether to reverse the timeline order
     */
    reverse: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    // Process items with position for alternate mode
    const processedItems = computed(() => {
      let items = [...props.items]
      
      if (props.reverse) {
        items = items.reverse()
      }

      // Assign positions for alternate mode
      if (props.mode === 'alternate') {
        return items.map((item, index) => ({
          ...item,
          position: (item.position || (index % 2 === 0 ? 'left' : 'right')) as TimelineItemPosition,
        }))
      }

      return items
    })

    // Container classes
    const containerClasses = computed(() => {
      return classNames(
        getTimelineContainerClasses(props.mode),
        timelineListClasses
      )
    })

    function getItemKey(item: TimelineItem, index: number): string | number {
      return item.key || index
    }

    function renderDot(item: TimelineItem, isPending = false) {
      // Custom dot from slot
      if (slots.dot) {
        return h('div', { class: getTimelineDotClasses(undefined, true) }, 
          slots.dot({ item })
        )
      }

      // Custom dot from item
      if (item.dot) {
        return h('div', { class: getTimelineDotClasses(undefined, true) }, 
          item.dot as any
        )
      }

      // Pending dot
      if (isPending) {
        if (props.pendingDot) {
          return h('div', { class: getTimelineDotClasses(undefined, true) }, 
            props.pendingDot as any
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
      const position = (item as any).position as TimelineItemPosition | undefined

      const itemClasses = getTimelineItemClasses(props.mode, position, isLast)
      const tailClasses = getTimelineTailClasses(props.mode, position, isLast)
      const headClasses = getTimelineHeadClasses(props.mode, position)
      const contentClasses = getTimelineContentClasses(props.mode, position)

      // Custom render from slot
      if (slots.item) {
        return h('li', { key, class: itemClasses }, [
          // Tail (connector line)
          h('div', { class: tailClasses }),
          // Head (dot)
          h('div', { class: headClasses }, [renderDot(item)]),
          // Content
          h('div', { class: contentClasses }, 
            slots.item({ item, index })
          ),
        ])
      }

      // Default item render
      const contentChildren = []

      if (item.label) {
        contentChildren.push(
          h('div', { class: timelineLabelClasses }, item.label)
        )
      }

      if (item.content) {
        contentChildren.push(
          h('div', { class: timelineDescriptionClasses }, item.content)
        )
      }

      return h('li', { key, class: itemClasses }, [
        // Tail (connector line)
        h('div', { class: tailClasses }),
        // Head (dot)
        h('div', { class: headClasses }, [renderDot(item)]),
        // Content
        h('div', { class: contentClasses }, contentChildren),
      ])
    }

    function renderPendingItem() {
      if (!props.pending) {
        return null
      }

      const index = processedItems.value.length
      const position = props.mode === 'alternate' 
        ? (index % 2 === 0 ? 'left' : 'right') as TimelineItemPosition
        : undefined

      const itemClasses = getTimelineItemClasses(props.mode, position, true)
      const headClasses = getTimelineHeadClasses(props.mode, position)
      const contentClasses = getTimelineContentClasses(props.mode, position)

      // Pending content from slot
      if (slots.pending) {
        return h('li', { key: 'pending', class: itemClasses }, [
          h('div', { class: headClasses }, [renderDot({}, true)]),
          h('div', { class: contentClasses }, slots.pending()),
        ])
      }

      return h('li', { key: 'pending', class: itemClasses }, [
        h('div', { class: headClasses }, [renderDot({}, true)]),
        h('div', { class: contentClasses }, [
          h('div', { class: timelineDescriptionClasses }, 'Loading...'),
        ]),
      ])
    }

    return () => {
      return h('ul', { class: containerClasses.value }, [
        ...processedItems.value.map((item, index) => renderTimelineItem(item, index)),
        renderPendingItem(),
      ])
    }
  },
})

export default Timeline
