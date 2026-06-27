import { defineComponent, h, ref, computed, onMounted, onUpdated, PropType } from 'vue'
import {
  virtualListContainerClasses,
  virtualListInnerClasses,
  fixedSizeStrategy,
  variableSizeStrategy,
  dynamicSizeStrategy,
  classNames,
  coerceClassValue,
  type VirtualListSizeStrategy
} from '@expcat/tigercat-core'

export type VueVirtualListProps = InstanceType<typeof VirtualList>['$props']

export const VirtualList = defineComponent({
  name: 'TigerVirtualList',
  props: {
    itemCount: { type: Number, default: 0 },
    itemHeight: { type: Number, default: 40 },
    estimatedItemHeight: { type: Number, default: undefined },
    getItemHeight: {
      type: Function as PropType<(index: number) => number>,
      default: undefined
    },
    sizeStrategy: {
      type: Object as PropType<VirtualListSizeStrategy>,
      default: undefined
    },
    height: { type: Number, default: 400 },
    overscan: { type: Number, default: 5 },
    /** Custom class name (merged with the `class` attribute) */
    className: { type: String, default: undefined }
  },
  emits: ['scroll'],
  setup(props, { emit, attrs, slots }) {
    const scrollTop = ref(0)
    // Bumped after DOM measurement so the range/offsets recompute (dynamic mode).
    const measureVersion = ref(0)
    const containerRef = ref<HTMLElement | null>(null)
    const itemEls = new Map<number, HTMLElement>()

    const isDynamic = computed(
      () => !props.sizeStrategy && !props.getItemHeight && props.estimatedItemHeight !== undefined
    )

    const strategy = computed<VirtualListSizeStrategy>(() => {
      if (props.sizeStrategy) return props.sizeStrategy
      if (props.getItemHeight) {
        return variableSizeStrategy(props.getItemHeight, props.itemCount)
      }
      if (props.estimatedItemHeight !== undefined) {
        return dynamicSizeStrategy(props.estimatedItemHeight, props.itemCount)
      }
      return fixedSizeStrategy(props.itemHeight)
    })

    const range = computed(() => {
      // Touch measureVersion so re-measured heights recompute the window.
      void measureVersion.value
      return strategy.value.getRange(scrollTop.value, props.height, props.itemCount, props.overscan)
    })

    function measureDynamic() {
      if (!isDynamic.value) return
      const strat = strategy.value
      if (!strat.updateItemHeight) return
      let changed = false
      itemEls.forEach((el, i) => {
        const measured = el.offsetHeight
        if (measured > 0 && measured !== strat.getItemHeight(i)) {
          strat.updateItemHeight!(i, measured)
          changed = true
        }
      })
      if (changed) measureVersion.value += 1
    }

    onMounted(measureDynamic)
    onUpdated(measureDynamic)

    function handleScroll() {
      if (containerRef.value) {
        scrollTop.value = containerRef.value.scrollTop
        emit('scroll', scrollTop.value)
      }
    }

    return () => {
      const { startIndex, endIndex, totalHeight } = range.value
      const currentStrategy = strategy.value
      const items: ReturnType<typeof h>[] = []

      const dynamic = isDynamic.value
      if (dynamic) itemEls.clear()
      for (let i = startIndex; i <= endIndex; i++) {
        const itemH = currentStrategy.getItemHeight(i)
        const slotContent = slots.default?.({ index: i })
        const index = i
        items.push(
          h(
            'div',
            {
              key: index,
              // Auto height in dynamic mode so real content height is measurable.
              style: dynamic ? { width: '100%' } : { height: `${itemH}px`, width: '100%' },
              ref: dynamic
                ? (el: unknown) => {
                    if (el)
                      itemEls.set(index, (el as { $el?: HTMLElement }).$el ?? (el as HTMLElement))
                    else itemEls.delete(index)
                  }
                : undefined
            },
            slotContent
          )
        )
      }

      const offsetTop = startIndex >= 0 ? currentStrategy.getItemOffset(startIndex) : 0

      return h(
        'div',
        {
          ref: containerRef,
          class: classNames(
            virtualListContainerClasses,
            props.className,
            coerceClassValue(attrs.class)
          ),
          style: { height: `${props.height}px` },
          onScroll: handleScroll
        },
        [
          h(
            'div',
            {
              class: virtualListInnerClasses,
              style: { height: `${totalHeight}px` }
            },
            [
              h(
                'div',
                {
                  style: {
                    transform: `translateY(${offsetTop}px)`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%'
                  }
                },
                items
              )
            ]
          )
        ]
      )
    }
  }
})

export default VirtualList
