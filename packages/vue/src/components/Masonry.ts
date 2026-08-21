import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  type PropType,
  type VNode
} from 'vue'
import {
  classNames,
  coerceClassValue,
  computeMasonryColumnHeights,
  distributeMasonryItems,
  getMasonryColumnClasses,
  getMasonryColumnStyle,
  getMasonryGapStyle,
  getMasonryItemClasses,
  getMasonryRootClasses,
  isBrowser,
  moduloDistributeMasonryItems,
  observeScrollAreaSize,
  readMasonryItemHeight,
  resolveMasonryColumnCount,
  resolveMasonryGap,
  mergeStyleValues,
  MASONRY_DEFAULT_COLUMNS,
  MASONRY_DEFAULT_GAP,
  type MasonryInstance,
  type MasonryLayoutDetail,
  type MasonryResponsiveValue
} from '@expcat/tigercat-core'

export interface VueMasonryProps {
  columns?: MasonryResponsiveValue
  gap?: MasonryResponsiveValue
  className?: string
  columnClassName?: string
  itemClassName?: string
}

function vnodeSignature(vnodes: VNode[]): string {
  return vnodes.map((vnode, index) => `${index}:${String(vnode.key ?? '')}`).join('\u0000')
}

function sameHeights(previous: number[], next: number[]): boolean {
  return (
    previous.length === next.length && previous.every((height, index) => height === next[index])
  )
}

export const Masonry = defineComponent({
  name: 'TigerMasonry',
  inheritAttrs: false,
  props: {
    columns: {
      type: [Number, Object] as PropType<MasonryResponsiveValue>,
      default: MASONRY_DEFAULT_COLUMNS
    },
    gap: {
      type: [Number, Object] as PropType<MasonryResponsiveValue>,
      default: MASONRY_DEFAULT_GAP
    },
    className: { type: String, default: undefined },
    columnClassName: { type: String, default: undefined },
    itemClassName: { type: String, default: undefined }
  },
  emits: ['layout'],
  setup(props, { slots, emit, attrs, expose }) {
    const itemElements = new Map<number, HTMLElement>()
    const heights = shallowRef<number[]>([])
    const distribution = shallowRef<number[][]>([])
    const childrenSignature = shallowRef('')
    const windowWidth = ref(isBrowser() ? window.innerWidth : 1024)
    let lastSignature = ''
    let stopObserving: (() => void) | null = null
    let disposed = false

    const columnCount = computed(() => resolveMasonryColumnCount(props.columns, windowWidth.value))
    const gap = computed(() => resolveMasonryGap(props.gap, windowWidth.value))

    function setItemRef(index: number, el: unknown): void {
      if (el instanceof HTMLElement) {
        itemElements.set(index, el)
        return
      }
      // Vue unmounts the old wrapper AFTER mounting the new one when an
      // item moves between columns. Ignore that stale null so the live
      // element is not dropped from the measurement map.
      const current = itemElements.get(index)
      if (!current || !current.isConnected) {
        itemElements.delete(index)
      }
    }

    function emitLayout(nextDistribution: number[][]): void {
      const detail: MasonryLayoutDetail = {
        columnCount: columnCount.value,
        columnHeights: computeMasonryColumnHeights(heights.value, nextDistribution, gap.value)
      }
      emit('layout', detail)
    }

    function redistribute(): void {
      const next = distributeMasonryItems(heights.value, columnCount.value)
      distribution.value = next
      emitLayout(next)
    }

    function relayout(): void {
      const indices = Array.from(itemElements.keys())
      const maxIndex = indices.length > 0 ? Math.max(...indices) : -1
      const nextHeights: number[] = []
      for (let index = 0; index <= maxIndex; index++) {
        const element = itemElements.get(index)
        nextHeights.push(element ? readMasonryItemHeight(element) : 0)
      }

      // ResizeObserver fires once per (re)observe — bail out when neither the
      // item set nor any height changed, so observation never loops.
      const countChanged = nextHeights.length !== heights.value.length
      if (!countChanged && sameHeights(heights.value, nextHeights)) return

      heights.value = nextHeights
      redistribute()
    }

    function handleResize(): void {
      windowWidth.value = window.innerWidth
    }

    const isResponsive = () => typeof props.columns === 'object' || typeof props.gap === 'object'

    onMounted(() => {
      if (isResponsive()) window.addEventListener('resize', handleResize)
      relayout()
    })

    onBeforeUnmount(() => {
      disposed = true
      // Always remove: responsiveness may have flipped between mount and
      // unmount, and removing a listener that was never added is a no-op.
      window.removeEventListener('resize', handleResize)
      stopObserving?.()
      stopObserving = null
      itemElements.clear()
    })

    watch(childrenSignature, () => {
      void nextTick(relayout)
    })

    watch([columnCount, gap], redistribute)

    // Re-observe whenever the rendered item set changes: new elements need a
    // fresh observer and removed elements must be released. Deferred to the
    // next tick so every item ref has settled after the redistribution
    // re-render — observing mid-patch measures a partial item set and emits a
    // stale layout detail.
    watch([distribution, childrenSignature], () => {
      void nextTick(() => {
        if (disposed) return
        stopObserving?.()
        stopObserving = observeScrollAreaSize(Array.from(itemElements.values()), relayout)
      })
    })

    expose({
      relayout,
      getColumnCount: () => columnCount.value
    } satisfies MasonryInstance)

    return () => {
      const vnodes = (slots.default?.() ?? []).filter((vnode) => vnode)
      const signature = vnodeSignature(vnodes)
      if (signature !== lastSignature) {
        lastSignature = signature
        childrenSignature.value = signature
      }

      // Until the post-render measurement catches up (next microtask), fall
      // back to round-robin so inserted items are never dropped and removed
      // wrappers disappear immediately.
      const activeDistribution =
        distribution.value.length > 0 && heights.value.length === vnodes.length
          ? distribution.value
          : moduloDistributeMasonryItems(vnodes.length, columnCount.value)

      return h(
        'div',
        {
          ...attrs,
          class: classNames(getMasonryRootClasses(props.className), coerceClassValue(attrs.class)),
          style: mergeStyleValues(getMasonryGapStyle(gap.value), attrs.style),
          'data-masonry': ''
        },
        activeDistribution.map((indices, columnIndex) =>
          h(
            'div',
            {
              key: `column-${columnIndex}`,
              class: getMasonryColumnClasses(props.columnClassName),
              style: getMasonryColumnStyle(gap.value),
              'data-masonry-column': columnIndex
            },
            indices.map((index) =>
              h(
                'div',
                {
                  key: `item-${index}`,
                  class: getMasonryItemClasses(props.itemClassName),
                  'data-masonry-item': index,
                  ref: (el: unknown) => setItemRef(index, el)
                },
                vnodes[index]
              )
            )
          )
        )
      )
    }
  }
})

export default Masonry
