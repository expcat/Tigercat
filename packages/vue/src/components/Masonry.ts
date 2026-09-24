import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useId,
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
  getMasonryLabels,
  getMasonryPackedRootStyle,
  getMasonryRootClasses,
  hasMeasuredMasonryHeights,
  isResponsiveMap,
  masonryLayoutColumnHeights,
  mergeStyleValues,
  observeElementSize,
  observeScrollAreaSize,
  readMasonryItemHeight,
  resolveMasonryColumnCount,
  resolveMasonryGap,
  MASONRY_DEFAULT_COLUMNS,
  MASONRY_DEFAULT_GAP,
  type MasonryInstance,
  type MasonryLayout,
  type MasonryLayoutDetail,
  type MasonryProps as CoreMasonryProps,
  type MasonryResponsiveValue
} from '@expcat/tigercat-core'
import { flattenElementVNodes } from '../utils/flatten-vnodes'
import { useTigerConfig } from './ConfigProvider'

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
    layout: {
      type: String as PropType<MasonryLayout>,
      default: 'source' as MasonryLayout
    },
    className: { type: String, default: undefined },
    itemClassName: { type: String, default: undefined }
  },
  emits: ['layout'],
  setup(props, { slots, emit, attrs, expose }) {
    const config = useTigerConfig()
    const rootRef = ref<HTMLElement | null>(null)
    let alive = true
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
    const orderNoteId = useId()
    const shortest = computed(() => props.layout === 'shortest')
    const packed = computed(
      () =>
        shortest.value &&
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
      emit('layout', {
        columnCount: columnCount.value,
        columnHeights: masonryLayoutColumnHeights(
          nextHeights,
          columnCount.value,
          gapPx.value,
          shortest.value ? 'shortest' : 'source'
        )
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
      stopItems = null
      const items = Array.from(itemElements.values())
      const stopSize = observeScrollAreaSize(items, () => {
        if (alive) measure()
      })
      const medias = items.flatMap((el) => Array.from(el.querySelectorAll('img, video')))
      const onMedia = (): void => {
        if (alive) measure()
      }
      for (const media of medias) {
        media.addEventListener('load', onMedia)
        media.addEventListener('error', onMedia)
      }
      stopItems = () => {
        stopSize()
        for (const media of medias) {
          media.removeEventListener('load', onMedia)
          media.removeEventListener('error', onMedia)
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
      alive = false
      stopRoot?.()
      stopItems?.()
      stopItems = null
    })

    watch([columnCount, gapPx, containerWidth], () =>
      nextTick(() => {
        if (alive) measure()
      })
    )
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
        ? getMasonryPackedRootStyle(packedHeight)
        : getMasonryFlowRootStyle(columnCount.value, gapPx.value)
      const labelled = Boolean(attrs['aria-label'] || attrs['aria-labelledby'])
      const visualOrder = shortest.value
        ? h(
            'span',
            { id: orderNoteId, class: 'sr-only' },
            getMasonryLabels(config.value.locale).visualOrderText
          )
        : null
      const describedBy = [attrs['aria-describedby'], visualOrder ? orderNoteId : undefined]
        .filter((value) => typeof value === 'string' && value.length > 0)
        .join(' ')

      return h(
        'div',
        {
          ...attrs,
          ref: rootRef,
          role: labelled ? 'list' : (attrs.role as string | undefined),
          class: classNames(getMasonryRootClasses(props.className), coerceClassValue(attrs.class)),
          style: mergeStyleValues(rootStyle, attrs.style),
          'data-masonry': '',
          'data-masonry-order': shortest.value ? 'visual' : undefined,
          'aria-describedby': describedBy || undefined
        },
        [
          visualOrder,
          ...childNodes.map((child, index) =>
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
                ref: (el) => setItemRef(index, el instanceof Element ? el : null)
              },
              [child]
            )
          )
        ]
      )
    }
  }
})

export default Masonry
