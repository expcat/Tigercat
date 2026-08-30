import {
  defineComponent,
  h,
  ref,
  shallowRef,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
  PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  computeScrollAreaState,
  computeScrollFromThumbOffset,
  computeScrollFromTrackPoint,
  createDocumentDragSession,
  createEmptyScrollAreaState,
  getScrollAreaBoxStyle,
  getScrollAreaContentClasses,
  getScrollAreaScrollbarClasses,
  getScrollAreaShadowClasses,
  getScrollAreaShadowSides,
  getScrollAreaThumbClasses,
  getScrollAreaThumbStyle,
  getScrollAreaViewportClasses,
  observeScrollAreaSize,
  readScrollAreaMetrics,
  scrollAreaRootClasses,
  shouldRenderScrollAreaScrollbar,
  SCROLL_AREA_MIN_THUMB_SIZE,
  type DocumentDragSession,
  type ScrollAreaAxis,
  type ScrollAreaDirection,
  type ScrollAreaScrollbarSize,
  type ScrollAreaScrollbarVisibility,
  type ScrollAreaScrollToOptions,
  type ScrollAreaState
} from '@expcat/tigercat-core'

export interface VueScrollAreaProps {
  direction?: ScrollAreaDirection
  scrollbar?: ScrollAreaScrollbarVisibility
  scrollbarSize?: ScrollAreaScrollbarSize
  shadow?: boolean
  minThumbSize?: number
  height?: number | string
  maxHeight?: number | string
  width?: number | string
  maxWidth?: number | string
  ariaLabel?: string
  className?: string
  viewportClassName?: string
}

export const ScrollArea = defineComponent({
  name: 'TigerScrollArea',
  inheritAttrs: false,
  props: {
    direction: {
      type: String as PropType<ScrollAreaDirection>,
      default: 'vertical' as ScrollAreaDirection
    },
    scrollbar: {
      type: String as PropType<ScrollAreaScrollbarVisibility>,
      default: 'auto' as ScrollAreaScrollbarVisibility
    },
    scrollbarSize: {
      type: String as PropType<ScrollAreaScrollbarSize>,
      default: 'md' as ScrollAreaScrollbarSize
    },
    shadow: { type: Boolean, default: false },
    minThumbSize: { type: Number, default: SCROLL_AREA_MIN_THUMB_SIZE },
    height: { type: [Number, String] as PropType<number | string>, default: undefined },
    maxHeight: { type: [Number, String] as PropType<number | string>, default: undefined },
    width: { type: [Number, String] as PropType<number | string>, default: undefined },
    maxWidth: { type: [Number, String] as PropType<number | string>, default: undefined },
    ariaLabel: { type: String, default: undefined },
    className: { type: String, default: undefined },
    viewportClassName: { type: String, default: undefined }
  },
  emits: ['scroll'],
  setup(props, { slots, emit, attrs, expose }) {
    const viewportRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)
    const scrollState = shallowRef<ScrollAreaState>(createEmptyScrollAreaState())
    const draggingAxis = ref<ScrollAreaAxis | null>(null)
    let dragSession: DocumentDragSession | null = null
    let stopObserving: (() => void) | null = null

    function syncState(): void {
      const viewport = viewportRef.value
      if (!viewport) return
      scrollState.value = computeScrollAreaState(
        readScrollAreaMetrics(viewport),
        props.minThumbSize
      )
    }

    function handleScroll(): void {
      const viewport = viewportRef.value
      if (!viewport) return
      syncState()
      emit('scroll', {
        scrollTop: viewport.scrollTop,
        scrollLeft: viewport.scrollLeft,
        state: scrollState.value
      })
    }

    function applyScroll(axis: ScrollAreaAxis, position: number): void {
      const viewport = viewportRef.value
      if (!viewport) return
      if (axis === 'y') viewport.scrollTop = position
      else viewport.scrollLeft = position
      handleScroll()
    }

    function trackSizeOf(axis: ScrollAreaAxis): number {
      const viewport = viewportRef.value
      if (!viewport) return 0
      return axis === 'y' ? viewport.clientHeight : viewport.clientWidth
    }

    function scrollSizeOf(axis: ScrollAreaAxis): number {
      const viewport = viewportRef.value
      if (!viewport) return 0
      return axis === 'y' ? viewport.scrollHeight : viewport.scrollWidth
    }

    function startThumbDrag(axis: ScrollAreaAxis, event: PointerEvent): void {
      const viewport = viewportRef.value
      if (!viewport || event.button !== 0) return
      event.preventDefault()
      event.stopPropagation()

      const axisState = axis === 'y' ? scrollState.value.y : scrollState.value.x
      const startOffset = axisState.thumbOffset
      const startPoint = axis === 'y' ? event.clientY : event.clientX

      dragSession?.dispose()
      draggingAxis.value = axis
      dragSession = createDocumentDragSession({
        startX: event.clientX,
        startY: event.clientY,
        ownerDocument: viewport.ownerDocument,
        pointerId: event.pointerId,
        pointerTarget: event.currentTarget instanceof Element ? event.currentTarget : null,
        lockAxis: axis,
        onMove: ({ currentX, currentY }) => {
          const current = axis === 'y' ? currentY : currentX
          const trackSize = trackSizeOf(axis)
          applyScroll(
            axis,
            computeScrollFromThumbOffset(
              startOffset + (current - startPoint),
              trackSize,
              axisState.thumbSize,
              scrollSizeOf(axis),
              trackSize
            )
          )
        },
        onEnd: () => {
          draggingAxis.value = null
          dragSession = null
        }
      })
    }

    function handleTrackPointerDown(axis: ScrollAreaAxis, event: PointerEvent): void {
      const target = event.target as HTMLElement | null
      if (target?.dataset.scrollAreaThumb) {
        startThumbDrag(axis, event)
        return
      }

      const track = event.currentTarget as HTMLElement
      const rect = track.getBoundingClientRect()
      const point = axis === 'y' ? event.clientY - rect.top : event.clientX - rect.left
      const axisState = axis === 'y' ? scrollState.value.y : scrollState.value.x
      const trackSize = trackSizeOf(axis)
      applyScroll(
        axis,
        computeScrollFromTrackPoint(
          point,
          trackSize,
          axisState.thumbSize,
          scrollSizeOf(axis),
          trackSize
        )
      )
    }

    function scrollTo(options: ScrollAreaScrollToOptions): void {
      const viewport = viewportRef.value
      if (!viewport) return
      const behavior = options.behavior ?? 'auto'
      if (typeof viewport.scrollTo === 'function') {
        viewport.scrollTo({ top: options.top, left: options.left, behavior })
      } else {
        if (options.top !== undefined) viewport.scrollTop = options.top
        if (options.left !== undefined) viewport.scrollLeft = options.left
      }
      handleScroll()
    }

    function scrollToTop(behavior?: ScrollAreaScrollToOptions['behavior']): void {
      scrollTo({ top: 0, behavior })
    }

    function scrollToBottom(behavior?: ScrollAreaScrollToOptions['behavior']): void {
      const viewport = viewportRef.value
      if (!viewport) return
      scrollTo({ top: viewport.scrollHeight, behavior })
    }

    onMounted(() => {
      syncState()
      stopObserving = observeScrollAreaSize([viewportRef.value, contentRef.value], syncState)
    })

    onBeforeUnmount(() => {
      dragSession?.dispose()
      dragSession = null
      stopObserving?.()
      stopObserving = null
    })

    watch(
      () => [props.direction, props.minThumbSize],
      () => {
        void nextTick(syncState)
      }
    )

    expose({
      scrollTo,
      scrollToTop,
      scrollToBottom,
      getViewport: () => viewportRef.value,
      getState: () => scrollState.value
    })

    function renderScrollbar(axis: ScrollAreaAxis) {
      const axisState = axis === 'y' ? scrollState.value.y : scrollState.value.x
      if (!shouldRenderScrollAreaScrollbar(props.scrollbar, props.direction, axis, axisState)) {
        return null
      }

      return h(
        'div',
        {
          key: `scrollbar-${axis}`,
          class: getScrollAreaScrollbarClasses(axis, props.scrollbarSize, props.scrollbar),
          'data-scroll-area-scrollbar': axis,
          'aria-hidden': 'true',
          onPointerdown: (event: PointerEvent) => handleTrackPointerDown(axis, event)
        },
        [
          h('div', {
            class: getScrollAreaThumbClasses(axis, draggingAxis.value === axis),
            style: getScrollAreaThumbStyle(axis, axisState),
            'data-scroll-area-thumb': axis
          })
        ]
      )
    }

    return () => {
      const shadows = props.shadow
        ? getScrollAreaShadowSides(scrollState.value, props.direction)
        : []

      return h(
        'div',
        {
          ...attrs,
          class: classNames(scrollAreaRootClasses, props.className, coerceClassValue(attrs.class)),
          style: mergeStyleValues(attrs.style),
          'data-scroll-area': ''
        },
        [
          h(
            'div',
            {
              ref: viewportRef,
              class: getScrollAreaViewportClasses(props.direction, props.viewportClassName),
              style: getScrollAreaBoxStyle(props),
              tabindex: 0,
              role: props.ariaLabel ? 'region' : undefined,
              'aria-label': props.ariaLabel,
              'data-scroll-area-viewport': '',
              onScroll: handleScroll
            },
            [
              h(
                'div',
                {
                  ref: contentRef,
                  class: getScrollAreaContentClasses(props.direction),
                  'data-scroll-area-content': ''
                },
                slots.default?.()
              )
            ]
          ),
          ...shadows.map((side) =>
            h('div', {
              key: `shadow-${side}`,
              class: getScrollAreaShadowClasses(side),
              'data-scroll-area-shadow': side,
              'aria-hidden': 'true'
            })
          ),
          renderScrollbar('y'),
          renderScrollbar('x')
        ]
      )
    }
  }
})

export default ScrollArea
