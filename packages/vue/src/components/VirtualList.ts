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
  observeSize,
  readMarginBoxBlockSize,
  resolveScrollportViewport,
  scrollTopForVirtualAlign,
  warnFixedRowOverflow,
  type VirtualScrollAlign,
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
    itemHeight: { type: Number, default: undefined },
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
    const clientHeight = ref(0)
    const measureVersion = ref(0)
    const containerRef = ref<HTMLElement | null>(null)
    const itemEls = new Map<number, HTMLElement>()
    const itemCleanups = new Map<number, () => void>()
    let dynamicHeld: VirtualListSizeStrategy | null = null
    let variableHeld: VirtualListSizeStrategy | null = null
    let fixedHeld: VirtualListSizeStrategy | null = null
    let heldEstimated: number | undefined
    let heldFixed: number | undefined
    let pendingAlign: { index: number; align: VirtualScrollAlign } | null = null
    let activeIndex = 0

    const fixedHeight = computed(
      () =>
        props.itemHeight != null &&
        props.estimatedItemHeight == null &&
        !props.getItemHeight &&
        !props.sizeStrategy
    )
    const dynamicEstimate = computed(() => {
      if (props.estimatedItemHeight != null) return props.estimatedItemHeight
      if (fixedHeight.value || props.getItemHeight || props.sizeStrategy) return undefined
      return 40
    })

    const strategy = computed<VirtualListSizeStrategy>(() => {
      if (props.sizeStrategy) {
        dynamicHeld = null
        variableHeld = null
        return props.sizeStrategy
      }
      if (props.getItemHeight) {
        dynamicHeld = null
        const read = props.getItemHeight
        if (!variableHeld) variableHeld = variableSizeStrategy(read, props.itemCount)
        else variableHeld.syncHeights?.(read, props.itemCount)
        return variableHeld
      }
      if (dynamicEstimate.value != null) {
        variableHeld = null
        if (!dynamicHeld || heldEstimated !== dynamicEstimate.value) {
          dynamicHeld = dynamicSizeStrategy(dynamicEstimate.value, props.itemCount)
          heldEstimated = dynamicEstimate.value
        }
        return dynamicHeld
      }
      dynamicHeld = null
      variableHeld = null
      const pinned = props.itemHeight ?? 40
      if (!fixedHeld || heldFixed !== pinned) {
        fixedHeld = fixedSizeStrategy(pinned)
        heldFixed = pinned
      }
      return fixedHeld
    })

    const canMeasure = computed(() => typeof strategy.value.updateItemHeight === 'function')

    const viewport = computed(() => resolveScrollportViewport(clientHeight.value, props.height))

    const range = computed(() => {
      void measureVersion.value
      return strategy.value.getRange(
        scrollTop.value,
        viewport.value,
        props.itemCount,
        props.overscan
      )
    })

    function readPort() {
      const el = containerRef.value
      if (!el) return
      if (clientHeight.value !== el.clientHeight) clientHeight.value = el.clientHeight
    }

    function measureVisible() {
      readPort()
      const strat = strategy.value
      if (fixedHeight.value) {
        itemEls.forEach((el) => {
          warnFixedRowOverflow('VirtualList.itemHeight', el.scrollHeight, props.itemHeight ?? 0)
        })
      }
      if (!canMeasure.value || !strat.updateItemHeight) return
      strat.setItemKeys?.(
        Array.from({ length: props.itemCount }, (_, index) =>
          props.getItemKey ? props.getItemKey(index) : index
        )
      )
      const anchorIndex = range.value.startIndex >= 0 ? range.value.startIndex : 0
      const anchorKey = props.getItemKey ? props.getItemKey(anchorIndex) : anchorIndex
      strat.noteAnchor?.(anchorKey, scrollTop.value)
      let changed = false
      itemEls.forEach((el, i) => {
        const measured = readMarginBoxBlockSize(el)
        const key = props.getItemKey ? props.getItemKey(i) : i
        if (measured > 0 && measured !== strat.getItemHeight(i)) {
          strat.updateItemHeight!(i, measured, key)
          changed = true
        }
      })
      const corrected = strat.consumeAnchorScrollTop?.()
      if (corrected != null && Math.abs(corrected - scrollTop.value) > 0.5) {
        applyScrollTop(corrected)
        changed = true
      }
      if (pendingAlign) {
        const pending = pendingAlign
        pendingAlign = null
        const next = scrollTopForVirtualAlign({
          scrollTop: scrollTop.value,
          viewport: viewport.value,
          offset: strat.getItemOffset(pending.index),
          size: strat.getItemHeight(pending.index),
          align: pending.align
        })
        if (next !== scrollTop.value) applyScrollTop(next)
      }
      if (changed) measureVersion.value += 1
    }

    onMounted(() => {
      measureVisible()
      if (containerRef.value) observeSize(containerRef.value, readPort)
    })
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
      scrollToIndex(index: number, align: VirtualScrollAlign = 'start') {
        const safe = Number.isFinite(index) ? Math.floor(index) : 0
        const clamped = Math.max(0, Math.min(Math.max(props.itemCount - 1, 0), safe))
        pendingAlign = { index: clamped, align }
        activeIndex = clamped
        applyScrollTop(
          scrollTopForVirtualAlign({
            scrollTop: scrollTop.value,
            viewport: viewport.value,
            offset: strategy.value.getItemOffset(clamped),
            size: strategy.value.getItemHeight(clamped),
            align
          })
        )
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
                : props.getItemHeight
                  ? { width: '100%' }
                  : { height: `${itemH}px`, width: '100%', minHeight: `${itemH}px` },
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
      const keyboardScroll = Boolean(namedAriaLabel)

      return h(
        'div',
        {
          ...restAttrs,
          ref: containerRef,
          role: props.role,
          tabindex: keyboardScroll ? 0 : undefined,
          'aria-label': namedAriaLabel,
          class: classNames(
            virtualListContainerClasses,
            props.className,
            coerceClassValue(attrClass)
          ),
          style: mergeStyleValues(attrStyle, { height: `${props.height}px` }) as CSSProperties,
          onScroll: handleScroll,
          onKeydown: keyboardScroll
            ? (event: KeyboardEvent) => {
                if (event.target !== event.currentTarget) return
                if (
                  event.key !== 'ArrowDown' &&
                  event.key !== 'ArrowUp' &&
                  event.key !== 'Home' &&
                  event.key !== 'End'
                ) {
                  return
                }
                event.preventDefault()
                const next =
                  event.key === 'End'
                    ? Math.max(0, props.itemCount - 1)
                    : event.key === 'Home'
                      ? 0
                      : event.key === 'ArrowDown'
                        ? Math.min(Math.max(props.itemCount - 1, 0), activeIndex + 1)
                        : Math.max(0, activeIndex - 1)
                activeIndex = next
                applyScrollTop(
                  scrollTopForVirtualAlign({
                    scrollTop: scrollTop.value,
                    viewport: viewport.value,
                    offset: currentStrategy.getItemOffset(next),
                    size: currentStrategy.getItemHeight(next),
                    align: 'auto'
                  })
                )
              }
            : undefined
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
          ),
          slots.footer?.()
        ]
      )
    }
  }
})

export default VirtualList
