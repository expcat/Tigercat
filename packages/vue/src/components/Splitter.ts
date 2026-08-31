import { defineComponent, h, ref, computed, onMounted, onBeforeUnmount, useId, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  createDocumentDragSession,
  devWarn,
  formatSplitterGutterLabel,
  getPaneStyle,
  getSplitterContainerClasses,
  getSplitterGutterClasses,
  getSplitterGutterCssVars,
  getSplitterGutterHandleClasses,
  getSplitterGutterValueNow,
  getSplitterKeyboardDelta,
  getSplitterLabels,
  getSplitterPointerDelta,
  isSplitterRtl,
  layoutPanePixels,
  measureSplitterContainer,
  mergeStyleValues,
  panePixelsToRatios,
  reconcileSplitterRatios,
  resolveInitialPaneSizes,
  resizePanes,
  splitterPaneBaseClasses,
  type DocumentDragSession,
  type SplitDirection,
  type SplitterRatioState
} from '@expcat/tigercat-core'
import { flattenElementVNodes } from '../utils/flatten-vnodes'
import { useTigerConfig } from './ConfigProvider'

export interface VueSplitterProps {
  direction?: SplitDirection
  sizes?: (number | string)[]
  min?: number
  max?: number
  gutterSize?: number
  disabled?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const Splitter = defineComponent({
  name: 'TigerSplitter',
  inheritAttrs: false,
  props: {
    direction: {
      type: String as PropType<SplitDirection>,
      default: 'horizontal' as SplitDirection
    },
    sizes: {
      type: Array as PropType<(number | string)[]>,
      default: undefined
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: undefined
    },
    gutterSize: {
      type: Number,
      default: 4
    },
    disabled: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['update:sizes', 'resize-start', 'resize', 'resize-end'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() => getSplitterLabels(config.value.locale))
    const instanceId = useId()
    const containerRef = ref<HTMLElement | null>(null)
    const containerSize = ref(0)
    const ratioState = ref<SplitterRatioState>({ ratios: [], sizesKey: undefined })
    const draggingIndex = ref(-1)
    const startPos = ref({ x: 0, y: 0 })
    const startSizes = ref<number[]>([])
    let dragSession: DocumentDragSession | null = null
    let resizeObserver: ResizeObserver | null = null

    const rtl = computed(() => {
      const attrDir = attrs.dir
      const dir = typeof attrDir === 'string' ? attrDir : config.value.direction
      return isSplitterRtl(dir)
    })

    const collectPanes = () => flattenElementVNodes(slots.default?.())

    const syncRatios = (count: number) => {
      const available =
        containerSize.value > 0
          ? containerSize.value - Math.max(0, count - 1) * props.gutterSize
          : 0
      ratioState.value = reconcileSplitterRatios(ratioState.value, count, props.sizes, available)
    }

    const applyMeasure = () => {
      const size = measureSplitterContainer(containerRef.value, props.direction)
      if (size > 0) containerSize.value = size
    }

    const bindContainer = (el: HTMLElement | null) => {
      containerRef.value = el
      applyMeasure()
    }

    onMounted(() => {
      applyMeasure()
      const el = containerRef.value
      if (el && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => applyMeasure())
        resizeObserver.observe(el)
      }
    })

    const containerClasses = computed(() =>
      classNames(
        getSplitterContainerClasses(props.direction, props.className),
        coerceClassValue(attrs.class)
      )
    )

    const paneCount = () => ratioState.value.ratios.length
    const getMins = (count = paneCount()) => Array.from({ length: count }, () => props.min)
    const getMaxes = (count = paneCount()) => Array.from({ length: count }, () => props.max)

    const currentPixels = (liveSize = containerSize.value): number[] => {
      const ratios = ratioState.value.ratios
      if (liveSize > 0) {
        return layoutPanePixels(ratios, liveSize, props.gutterSize, props.min, props.max)
      }
      return (
        resolveInitialPaneSizes(
          ratios.length,
          0,
          props.gutterSize,
          props.sizes,
          props.min,
          props.max
        ) ?? []
      )
    }

    const commitSizes = (
      nextPixels: number[],
      index: number,
      phase: 'move' | 'end' | 'keyboard'
    ) => {
      ratioState.value = {
        ratios: panePixelsToRatios(nextPixels),
        sizesKey: ratioState.value.sizesKey
      }
      emit('update:sizes', nextPixels)
      emit('resize', { index, sizes: nextPixels })
      if (phase === 'end' || phase === 'keyboard') {
        emit('resize-end', { index, sizes: nextPixels })
      }
    }

    const cleanupDragSession = () => {
      dragSession?.dispose()
      dragSession = null
    }

    const onPointerDown = (index: number, e: PointerEvent) => {
      if (props.disabled || e.button !== 0) return
      e.preventDefault()
      cleanupDragSession()
      const liveSize = measureSplitterContainer(containerRef.value, props.direction)
      if (liveSize > 0) containerSize.value = liveSize
      draggingIndex.value = index
      startPos.value = { x: e.clientX, y: e.clientY }
      startSizes.value = currentPixels(liveSize > 0 ? liveSize : containerSize.value)
      emit('resize-start', { index, sizes: [...startSizes.value] })

      dragSession = createDocumentDragSession({
        startX: e.clientX,
        startY: e.clientY,
        ownerDocument: (e.currentTarget as HTMLElement | null)?.ownerDocument,
        pointerId: e.pointerId,
        pointerTarget: e.currentTarget instanceof Element ? e.currentTarget : null,
        lockAxis: props.direction === 'horizontal' ? 'x' : 'y',
        onMove: ({ currentX, currentY }) => {
          applyDragResize(currentX, currentY, 'move')
        },
        onEnd: ({ currentX, currentY }) => {
          applyDragResize(currentX, currentY, 'end')
          draggingIndex.value = -1
          dragSession = null
        }
      })
    }

    const applyDragResize = (currentX: number, currentY: number, phase: 'move' | 'end') => {
      if (draggingIndex.value < 0) return
      const delta = getSplitterPointerDelta(
        props.direction,
        startPos.value.x,
        startPos.value.y,
        currentX,
        currentY,
        rtl.value
      )
      const newSizes = resizePanes(
        startSizes.value,
        draggingIndex.value,
        delta,
        getMins(),
        getMaxes()
      )
      if (newSizes) commitSizes(newSizes, draggingIndex.value, phase)
    }

    onBeforeUnmount(() => {
      cleanupDragSession()
      resizeObserver?.disconnect()
      resizeObserver = null
    })

    return () => {
      const nodes: ReturnType<typeof h>[] = []
      const panes = collectPanes()
      syncRatios(panes.length)
      if (props.sizes && props.sizes.length !== panes.length && panes.length > 0) {
        devWarn(
          'Splitter.sizes.length',
          `Splitter sizes length (${props.sizes.length}) does not match pane count (${panes.length}). Extra panes share remaining space.`
        )
      }
      const ratios = ratioState.value.ratios
      const measured = containerSize.value > 0
      const pixels = measured
        ? layoutPanePixels(ratios, containerSize.value, props.gutterSize, props.min, props.max)
        : []

      panes.forEach((child, i) => {
        const size = measured ? pixels[i] : null
        const paneStyle = getPaneStyle(size, props.direction, {
          ratio: ratios[i] ?? 0,
          measured
        })
        nodes.push(
          h(
            'div',
            {
              id: `${instanceId}-pane-${i}`,
              class: splitterPaneBaseClasses,
              style: paneStyle,
              'data-pane-index': i
            },
            [child]
          )
        )

        if (i < panes.length - 1) {
          const isDragging = draggingIndex.value === i
          const labelledby = attrs['aria-labelledby']
          nodes.push(
            h(
              'div',
              {
                class: getSplitterGutterClasses(props.direction, isDragging, props.disabled),
                role: 'separator',
                'aria-orientation': props.direction === 'horizontal' ? 'vertical' : 'horizontal',
                'aria-controls': `${instanceId}-pane-${i}`,
                'aria-valuemin': 0,
                'aria-valuemax': 100,
                'aria-valuenow': getSplitterGutterValueNow(measured ? pixels : [], i),
                'aria-label':
                  typeof labelledby === 'string'
                    ? undefined
                    : formatSplitterGutterLabel(labels.value.gutterAriaLabel, i),
                'aria-labelledby': typeof labelledby === 'string' ? labelledby : undefined,
                tabindex: props.disabled ? -1 : 0,
                'data-gutter-index': i,
                onPointerdown: (e: PointerEvent) => onPointerDown(i, e),
                onKeydown: (e: KeyboardEvent) => {
                  if (props.disabled) return
                  const delta = getSplitterKeyboardDelta(e.key, props.direction, rtl.value)
                  if (delta == null) return
                  e.preventDefault()
                  const newSizes = resizePanes(currentPixels(), i, delta, getMins(), getMaxes())
                  if (newSizes) commitSizes(newSizes, i, 'keyboard')
                }
              },
              [
                h('div', {
                  class: getSplitterGutterHandleClasses(props.direction),
                  'aria-hidden': 'true'
                })
              ]
            )
          )
        }
      })

      return h(
        'div',
        {
          ...attrs,
          ref: bindContainer,
          class: containerClasses.value,
          style: mergeStyleValues(attrs.style, {
            ...props.style,
            ...getSplitterGutterCssVars(props.gutterSize)
          }),
          'data-direction': props.direction
        },
        nodes
      )
    }
  }
})

export default Splitter
