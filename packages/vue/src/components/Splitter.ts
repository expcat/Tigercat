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
  getSplitterLabels,
  getSplitterPointerDelta,
  isSplitterRtl,
  jumpSplitterGutter,
  collapseSplitterSizes,
  feedbackLayoutLabels,
  layoutDeclaredPanes,
  measureSplitterContainer,
  mergeStyleValues,
  normalizeSplitterBounds,
  parsePaneSize,
  projectControlledPaneSizes,
  resizePanes,
  resolveSplitterSeparatorKey,
  serializePaneSizes,
  splitterContentSize,
  splitterPaneBaseClasses,
  type DocumentDragSession,
  type SplitDirection
} from '@expcat/tigercat-core'
import { flattenElementVNodes } from '../utils/flatten-vnodes'
import { useTigerConfig } from './tiger-config'

export interface VueSplitterProps {
  orientation?: SplitDirection
  sizes?: (number | string)[]
  min?: number | number[]
  max?: number | number[]
  gutterSize?: number
  disabled?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const Splitter = defineComponent({
  name: 'TigerSplitter',
  inheritAttrs: false,
  props: {
    orientation: {
      type: String as PropType<SplitDirection>,
      default: 'horizontal' as SplitDirection
    },
    sizes: {
      type: Array as PropType<(number | string)[]>,
      default: undefined
    },
    min: {
      type: [Number, Array] as PropType<number | number[]>,
      default: 0
    },
    max: {
      type: [Number, Array] as PropType<number | number[]>,
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
    },
    collapsible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:sizes', 'resize-start', 'resize', 'resize-end'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() => getSplitterLabels(config.value.locale))
    const instanceId = useId()
    const containerRef = ref<HTMLElement | null>(null)
    const containerSize = ref(0)
    const sizesKey = computed(() => serializePaneSizes(props.sizes))
    const override = ref<{ key: string | undefined; pixels: number[] } | null>(null)
    const collapsedPrevious = ref<(number | string | null)[]>([])
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

    const dragPixels = () =>
      override.value && override.value.key === sizesKey.value ? override.value.pixels : null

    const applyMeasure = () => {
      const size = measureSplitterContainer(containerRef.value, props.orientation)
      if (size > 0) containerSize.value = size
    }

    const bindContainer = (el: unknown) => {
      containerRef.value = el instanceof HTMLElement ? el : null
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
        getSplitterContainerClasses(props.orientation, props.className),
        coerceClassValue(attrs.class)
      )
    )

    const boundsFor = (count: number) => normalizeSplitterBounds(count, props.min, props.max)
    const getMins = (count: number) => boundsFor(count).mins
    const getMaxes = (count: number) => boundsFor(count).maxes

    const currentPixels = (
      liveSize = containerSize.value,
      count = collectPanes().length
    ): number[] => {
      const bounds = boundsFor(count)
      return layoutDeclaredPanes(
        dragPixels() ?? props.sizes,
        count,
        liveSize,
        props.gutterSize,
        bounds.mins,
        bounds.maxes
      ).map((box) => box.pixels ?? 0)
    }

    const commitSizes = (
      nextPixels: number[],
      index: number,
      phase: 'move' | 'end' | 'keyboard'
    ) => {
      override.value = { key: sizesKey.value, pixels: nextPixels }
      emit(
        'update:sizes',
        projectControlledPaneSizes(props.sizes, nextPixels, containerSize.value, props.gutterSize)
      )
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
      const liveSize = measureSplitterContainer(containerRef.value, props.orientation)
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
        lockAxis: props.orientation === 'horizontal' ? 'x' : 'y',
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
        props.orientation,
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
        getMins(startSizes.value.length),
        getMaxes(startSizes.value.length)
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
      if (props.sizes && props.sizes.length !== panes.length && panes.length > 0) {
        devWarn(
          'Splitter.sizes.length',
          `Splitter sizes length (${props.sizes.length}) does not match pane count (${panes.length}). Extra panes share remaining space.`
        )
      }
      const bounds = boundsFor(panes.length)
      const boxes = layoutDeclaredPanes(
        dragPixels() ?? props.sizes,
        panes.length,
        containerSize.value,
        props.gutterSize,
        bounds.mins,
        bounds.maxes
      )
      const pixels = boxes.map((box) => box.pixels ?? 0)
      const root = containerRef.value as (HTMLElement & { getSizes?: () => number[] }) | null
      if (root) root.getSizes = () => pixels.slice()

      const toggleCollapse = (index: number) => {
        const available = splitterContentSize(containerSize.value, panes.length, props.gutterSize)
        const base = (dragPixels() ?? props.sizes ?? pixels).slice()
        const stored = collapsedPrevious.value[index]
        const nextPixels = base.map((size) => parsePaneSize(size, available))
        if (stored == null) {
          const collapsed = collapseSplitterSizes(base, index)
          nextPixels[index] = 0
          collapsedPrevious.value = collapsedPrevious.value.slice()
          collapsedPrevious.value[index] = collapsed.previous
        } else {
          nextPixels[index] = parsePaneSize(stored, available)
          collapsedPrevious.value = collapsedPrevious.value.slice()
          collapsedPrevious.value[index] = null
        }
        override.value = { key: sizesKey.value, pixels: nextPixels }
        emit(
          'update:sizes',
          projectControlledPaneSizes(props.sizes, nextPixels, containerSize.value, props.gutterSize)
        )
      }

      panes.forEach((child, i) => {
        const paneStyle = getPaneStyle(
          boxes[i] ?? { kind: 'flex', pixels: null, flexGrow: 1 },
          props.orientation
        )
        nodes.push(
          h(
            'div',
            {
              id: `${instanceId}-pane-${i}`,
              class: splitterPaneBaseClasses,
              style: paneStyle,
              'data-pane-index': i,
              'data-collapsed': collapsedPrevious.value[i] != null ? '' : undefined
            },
            props.collapsible
              ? [
                  h(
                    'button',
                    {
                      type: 'button',
                      'data-tiger-splitter-collapse': String(i),
                      'aria-label':
                        collapsedPrevious.value[i] != null
                          ? feedbackLayoutLabels.splitterExpand
                          : feedbackLayoutLabels.splitterCollapse,
                      onClick: () => toggleCollapse(i)
                    },
                    collapsedPrevious.value[i] != null
                      ? feedbackLayoutLabels.splitterExpand
                      : feedbackLayoutLabels.splitterCollapse
                  ),
                  collapsedPrevious.value[i] != null ? null : child
                ]
              : [child]
          )
        )

        if (i < panes.length - 1) {
          const isDragging = draggingIndex.value === i
          const labelledby = attrs['aria-labelledby']
          nodes.push(
            h(
              'div',
              {
                class: getSplitterGutterClasses(props.orientation, isDragging, props.disabled),
                role: 'separator',
                'aria-orientation': props.orientation === 'horizontal' ? 'vertical' : 'horizontal',
                'aria-controls': `${instanceId}-pane-${i}`,
                'aria-valuemin': 0,
                'aria-valuemax': 100,
                'aria-valuenow': getSplitterGutterValueNow(
                  containerSize.value > 0 ? pixels : [],
                  i
                ),
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
                  const action = resolveSplitterSeparatorKey(e.key, props.orientation, rtl.value)
                  if (!action) return
                  e.preventDefault()
                  const count = panes.length
                  const current = currentPixels(containerSize.value, count)
                  const newSizes =
                    action.type === 'delta'
                      ? resizePanes(current, i, action.delta, getMins(count), getMaxes(count))
                      : jumpSplitterGutter(current, i, action.edge, getMins(count), getMaxes(count))
                  if (newSizes) commitSizes(newSizes, i, 'keyboard')
                }
              },
              [
                h('div', {
                  class: getSplitterGutterHandleClasses(props.orientation),
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
          'data-orientation': props.orientation
        },
        nodes
      )
    }
  }
})

export default Splitter
