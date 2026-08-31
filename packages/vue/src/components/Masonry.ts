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
  computeMasonryPositions,
  getMasonryFlowRootStyle,
  getMasonryItemClasses,
  getMasonryItemPositionStyle,
  getMasonryPackedRootStyle,
  getMasonryRootClasses,
  hasMeasuredMasonryHeights,
  isResponsiveMap,
  mergeStyleValues,
  observeElementSize,
  observeScrollAreaSize,
  readMasonryItemHeight,
  resolveMasonryColumnCount,
  resolveMasonryGap,
  MASONRY_DEFAULT_COLUMNS,
  MASONRY_DEFAULT_GAP,
  type MasonryInstance,
  type MasonryLayoutDetail,
  type MasonryProps as CoreMasonryProps,
  type MasonryResponsiveValue
} from '@expcat/tigercat-core'
import { flattenElementVNodes } from '../utils/flatten-vnodes'

export interface VueMasonryProps extends CoreMasonryProps {}

export type MasonryProps = VueMasonryProps

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
    const rootRef = ref<HTMLElement | null>(null)
    const itemElements = new Map<number, HTMLElement>()
    const heights = shallowRef<number[]>([])
    const containerWidth = ref(0)
    const childrenSignature = shallowRef('')
    let stopRoot: (() => void) | null = null
    let stopItems: (() => void) | null = null

    const columnCount = computed(() =>
      resolveMasonryColumnCount(props.columns, containerWidth.value)
    )
    const gapPx = computed(() => resolveMasonryGap(props.gap, containerWidth.value))
    const packed = computed(
      () =>
        hasMeasuredMasonryHeights(heights.value) &&
        containerWidth.value > 0 &&
        heights.value.length === collectChildren().length
    )
    const positions = computed(() =>
      packed.value
        ? computeMasonryPositions(
            heights.value,
            columnCount.value,
            gapPx.value,
            containerWidth.value
          )
        : []
    )

    function collectChildren(): VNode[] {
      return flattenElementVNodes(slots.default?.())
    }

    function emitLayout(nextHeights: number[]): void {
      const packedPositions = hasMeasuredMasonryHeights(nextHeights)
        ? computeMasonryPositions(nextHeights, columnCount.value, gapPx.value, containerWidth.value)
        : []
      const columnHeights = Array.from({ length: columnCount.value }, () => 0)
      packedPositions.forEach((position, index) => {
        const bottom = position.top + (nextHeights[index] || 0)
        if (bottom > columnHeights[position.column]) columnHeights[position.column] = bottom
      })
      emit('layout', {
        columnCount: columnCount.value,
        columnHeights
      } satisfies MasonryLayoutDetail)
    }

    function measure(): void {
      const childCount = collectChildren().length
      const nextHeights: number[] = []
      for (let index = 0; index < childCount; index++) {
        const element = itemElements.get(index)
        nextHeights.push(element ? readMasonryItemHeight(element) : 0)
      }
      if (!sameHeights(heights.value, nextHeights)) {
        heights.value = nextHeights
      }
      emitLayout(nextHeights)
    }

    function setItemRef(index: number, el: Element | null): void {
      if (el instanceof HTMLElement) {
        itemElements.set(index, el)
        return
      }
      const existing = itemElements.get(index)
      if (!existing || !existing.isConnected) itemElements.delete(index)
    }

    function bindRoot(): void {
      stopRoot?.()
      stopRoot = null
      if (!rootRef.value) return
      containerWidth.value = rootRef.value.getBoundingClientRect().width
      stopRoot = observeElementSize(rootRef.value, ({ width }) => {
        containerWidth.value = width
      })
    }

    function bindItems(): void {
      stopItems?.()
      const items = Array.from(itemElements.values())
      stopItems = observeScrollAreaSize(items, measure)
      const medias = items.flatMap((el) => Array.from(el.querySelectorAll('img, video')))
      const onLoad = () => measure()
      for (const media of medias) {
        media.addEventListener('load', onLoad)
        media.addEventListener('error', onLoad)
      }
      stopItems = () => {
        stopItems = null
        observeScrollAreaSize(items, measure)()
        for (const media of medias) {
          media.removeEventListener('load', onLoad)
          media.removeEventListener('error', onLoad)
        }
      }
    }

    onMounted(() => {
      bindRoot()
      nextTick(() => {
        measure()
        bindItems()
      })
    })
    onBeforeUnmount(() => {
      stopRoot?.()
      stopItems?.()
    })

    watch([columnCount, gapPx, containerWidth], () => nextTick(() => measure()))
    watch(
      () => [isResponsiveMap(props.columns), isResponsiveMap(props.gap)] as const,
      () => bindRoot()
    )

    expose({
      relayout: measure,
      getColumnCount: () => columnCount.value
    } satisfies MasonryInstance)

    return () => {
      const childNodes = collectChildren()
      const signature = vnodeSignature(childNodes)
      if (childrenSignature.value !== signature) {
        childrenSignature.value = signature
        heights.value = []
      }
      const packedNow = packed.value
      const packedHeight = packedNow
        ? Math.max(
            0,
            ...positions.value.map((position, index) => position.top + (heights.value[index] || 0))
          )
        : 0
      const rootStyle = packedNow
        ? getMasonryPackedRootStyle(packedHeight, gapPx.value)
        : getMasonryFlowRootStyle(columnCount.value, gapPx.value)
      const labelled = Boolean(attrs['aria-label'] || attrs['aria-labelledby'])

      return h(
        'div',
        {
          ...attrs,
          ref: rootRef,
          role: labelled ? 'list' : (attrs.role as string | undefined),
          class: classNames(getMasonryRootClasses(props.className), coerceClassValue(attrs.class)),
          style: mergeStyleValues(rootStyle, attrs.style),
          'data-masonry': ''
        },
        childNodes.map((child, index) =>
          h(
            'div',
            {
              key: child.key ?? `item-${index}`,
              role: labelled ? 'listitem' : undefined,
              class: getMasonryItemClasses(props.itemClassName),
              style:
                packedNow && positions.value[index]
                  ? getMasonryItemPositionStyle(positions.value[index])
                  : undefined,
              'data-masonry-item': index,
              ref: (el: Element | null) => setItemRef(index, el)
            },
            [child]
          )
        )
      )
    }
  }
})

export default Masonry
