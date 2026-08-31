import { computed, defineComponent, h, PropType } from 'vue'
import {
  EMPTY_TIMELINE_ITEMS,
  classNames,
  coerceClassValue,
  getPendingDotClasses,
  getTimelineContainerClasses,
  getTimelineContentClasses,
  getTimelineDotClasses,
  getTimelineHeadClasses,
  getTimelineItemClasses,
  getTimelineItemKey,
  getTimelineTailClasses,
  mergeStyleValues,
  mergeTigerLocale,
  processTimelineItems,
  resolveLocaleText,
  timelineDescriptionClasses,
  timelineLabelClasses,
  timelineListClasses,
  type TimelineItem,
  type TimelineItemPosition,
  type TimelineMode,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

type HChildren = Parameters<typeof h>[2]

export interface VueTimelineProps {
  items?: TimelineItem[]
  mode?: TimelineMode
  /**
   * Append a pending item after the (optionally reversed) list.
   * Pending stays at the DOM end even when `reverse` is set.
   */
  pending?: boolean
  pendingDot?: unknown
  reverse?: boolean
  className?: string
  style?: Record<string, unknown>
  locale?: Partial<TigerLocale>
}

export type TimelineProps = VueTimelineProps

export const Timeline = defineComponent({
  name: 'TigerTimeline',
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<TimelineItem[]>,
      default: undefined
    },
    mode: {
      type: String as PropType<TimelineMode>,
      default: 'left' as TimelineMode
    },
    pending: {
      type: Boolean,
      default: false
    },
    pendingDot: {
      type: [String, Object] as PropType<unknown>,
      default: undefined
    },
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
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const processedItems = computed(() =>
      processTimelineItems(props.items ?? EMPTY_TIMELINE_ITEMS, {
        reverse: props.reverse,
        mode: props.mode
      })
    )

    const containerClasses = computed(() => {
      return classNames(
        getTimelineContainerClasses(props.mode),
        timelineListClasses,
        props.className,
        coerceClassValue(attrs.class)
      )
    })

    const containerStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    function renderDot(item: TimelineItem, isPending = false) {
      if (isPending && props.pendingDot) {
        return h(
          'div',
          { class: getTimelineDotClasses(undefined, true) },
          props.pendingDot as unknown as HChildren
        )
      }

      if (slots.dot) {
        return h(
          'div',
          { class: getTimelineDotClasses(undefined, true) },
          slots.dot({ item, pending: isPending })
        )
      }

      if (item.dot) {
        return h(
          'div',
          { class: getTimelineDotClasses(undefined, true) },
          item.dot as unknown as HChildren
        )
      }

      if (isPending) {
        return h('div', { class: getPendingDotClasses() })
      }

      const dotClasses = getTimelineDotClasses(item.color)
      const dotStyle = item.color ? { backgroundColor: item.color } : {}

      return h('div', { class: dotClasses, style: dotStyle })
    }

    function renderTimelineItem(item: TimelineItem, index: number) {
      const key = getTimelineItemKey(item, index)
      const isLast = index === processedItems.value.length - 1 && !props.pending
      const position = item.position

      const itemClasses = getTimelineItemClasses(props.mode, position, isLast)
      const tailClasses = getTimelineTailClasses(props.mode, isLast)
      const headClasses = getTimelineHeadClasses(props.mode)
      const contentClasses = getTimelineContentClasses(props.mode, position)

      if (slots.item) {
        return h('li', { key, class: itemClasses }, [
          h('div', { class: tailClasses }),
          h('div', { class: headClasses }, [renderDot(item)]),
          h('div', { class: contentClasses }, slots.item({ item, index }))
        ])
      }

      const contentChildren = []

      if (item.label) {
        contentChildren.push(h('div', { class: timelineLabelClasses }, item.label))
      }

      if (item.content) {
        contentChildren.push(
          h('div', { class: timelineDescriptionClasses }, item.content as unknown as HChildren)
        )
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

      if (slots.pending) {
        return h('li', { key: 'pending', class: itemClasses }, [
          h('div', { class: headClasses }, [renderDot({}, true)]),
          h('div', { class: contentClasses }, slots.pending())
        ])
      }

      return h('li', { key: 'pending', class: itemClasses }, [
        h('div', { class: headClasses }, [renderDot({}, true)]),
        h('div', { class: contentClasses }, [
          h(
            'div',
            { class: timelineDescriptionClasses },
            resolveLocaleText(
              'Loading...',
              mergedLocale.value?.timeline?.pendingText,
              mergedLocale.value?.common?.loadingText
            )
          )
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
          role: 'list',
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
