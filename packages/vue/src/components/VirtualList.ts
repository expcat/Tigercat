import {
  defineComponent,
  h,
  ref,
  computed,
  onMounted,
  onUpdated,
  PropType,
  type CSSProperties
} from 'vue'
import {
  virtualListContainerClasses,
  virtualListInnerClasses,
  fixedSizeStrategy,
  variableSizeStrategy,
  dynamicSizeStrategy,
  classNames,
  coerceClassValue,
  mergeStyleValues,
  type VirtualListHandle,
  type VirtualListSizeStrategy
} from '@expcat/tigercat-core'

export type { VirtualListHandle }
export type VueVirtualListProps = InstanceType<typeof VirtualList>['$props']
export type VirtualListProps = VueVirtualListProps

export const VirtualList = defineComponent({
  name: 'TigerVirtualList',
  inheritAttrs: false,
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
    getItemKey: {
      type: Function as PropType<(index: number) => string | number>,
      default: undefined
    },
    ariaLabel: { type: String, default: undefined },
    className: { type: String, default: undefined },
    role: { type: String, default: 'list' }
  },
  emits: ['scroll'],
  setup(props, { emit, attrs, slots, expose }) {
    const scrollTop = ref(0)
    const measureVersion = ref(0)
    const containerRef = ref<HTMLElement | null>(null)
    const itemEls = new Map<number, HTMLElement>()
    let dynamicHeld: VirtualListSizeStrategy | null = null
    let heldEstimated: number | undefined

    const strategy = computed<VirtualListSizeStrategy>(() => {
      if (props.sizeStrategy) {
        dynamicHeld = null
        return props.sizeStrategy
      }
      if (props.getItemHeight) {
        dynamicHeld = null
        return variableSizeStrategy(props.getItemHeight, props.itemCount)
      }
      if (props.estimatedItemHeight !== undefined) {
        if (!dynamicHeld || heldEstimated !== props.estimatedItemHeight) {
          dynamicHeld = dynamicSizeStrategy(props.estimatedItemHeight, props.itemCount)
          heldEstimated = props.estimatedItemHeight
        }
        return dynamicHeld
      }
      dynamicHeld = null
      return fixedSizeStrategy(props.itemHeight)
    })

    const canMeasure = computed(() => typeof strategy.value.updateItemHeight === 'function')

    const range = computed(() => {
      void measureVersion.value
      return strategy.value.getRange(scrollTop.value, props.height, props.itemCount, props.overscan)
    })

    function measureVisible() {
      if (!canMeasure.value) return
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

    onMounted(measureVisible)
    onUpdated(measureVisible)

    function applyScrollTop(next: number) {
      const offset = Math.max(0, next)
      if (containerRef.value && containerRef.value.scrollTop !== offset) {
        containerRef.value.scrollTop = offset
      }
      scrollTop.value = offset
      emit('scroll', offset)
    }

    const handle: VirtualListHandle = {
      scrollToIndex(index: number) {
        const safe = Number.isFinite(index) ? Math.floor(index) : 0
        const clamped = Math.max(0, Math.min(Math.max(props.itemCount - 1, 0), safe))
        applyScrollTop(strategy.value.getItemOffset(clamped))
      },
      scrollToOffset(offset: number) {
        applyScrollTop(Number.isFinite(offset) ? offset : 0)
      },
      getScrollElement() {
        return containerRef.value
      }
    }

    expose(handle)

    function handleScroll() {
      if (!containerRef.value) return
      const st = containerRef.value.scrollTop
      scrollTop.value = st
      emit('scroll', st)
    }

    return () => {
      const { startIndex, endIndex, totalHeight, offsetTop } = range.value
      const currentStrategy = strategy.value
      const items: ReturnType<typeof h>[] = []
      const dynamic = canMeasure.value
      const asList = props.role === 'list'
      if (dynamic) itemEls.clear()
      for (let i = startIndex; i <= endIndex; i++) {
        const itemH = currentStrategy.getItemHeight(i)
        const slotContent = slots.default?.({ index: i })
        const index = i
        const key = props.getItemKey ? props.getItemKey(i) : i
        items.push(
          h(
            'div',
            {
              key,
              ...(asList
                ? {
                    role: 'listitem',
                    'aria-setsize': props.itemCount,
                    'aria-posinset': index + 1
                  }
                : {}),
              style: dynamic
                ? { width: '100%' }
                : { height: `${itemH}px`, width: '100%', overflow: 'hidden' },
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

      const { class: attrClass, style: attrStyle, ...restAttrs } = attrs as Record<string, unknown>
      const namedAriaLabel =
        props.ariaLabel ??
        (typeof restAttrs['aria-label'] === 'string' ? restAttrs['aria-label'] : undefined)

      return h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          role: props.role,
          tabindex: 0,
          'aria-label': namedAriaLabel,
          class: classNames(
            virtualListContainerClasses,
            props.className,
            coerceClassValue(attrClass)
          ),
          style: mergeStyleValues(attrStyle, { height: `${props.height}px` }) as CSSProperties,
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
