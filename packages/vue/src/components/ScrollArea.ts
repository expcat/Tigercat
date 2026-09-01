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
  PropType
} from 'vue'
import {
  applyScrollAreaWheel,
  classNames,
  coerceClassValue,
  computeScrollAreaKeyboardDelta,
  computeScrollAreaState,
  computeScrollFromThumbOffset,
  computeScrollFromTrackPoint,
  createDocumentDragSession,
  createEmptyScrollAreaState,
  getScrollAreaBoxStyle,
  getScrollAreaContentClasses,
  getScrollAreaGutterStyle,
  getScrollAreaLabels,
  getScrollAreaScrollbarClasses,
  getScrollAreaScrollbarPlacementStyle,
  getScrollAreaShadowClasses,
  getScrollAreaShadowSides,
  getScrollAreaThumbClasses,
  getScrollAreaThumbStyle,
  getScrollAreaViewportClasses,
  mergeStyleValues,
  mergeTigerLocale,
  observeScrollAreaSize,
  physicalInlineScrollFromLogical,
  readInlineDirection,
  readScrollAreaMetrics,
  resolveScrollAreaViewportTabIndex,
  scrollAreaHasFocusable,
  scrollAreaRootClasses,
  shouldRenderScrollAreaScrollbar,
  SCROLL_AREA_MIN_THUMB_SIZE,
  type DocumentDragSession,
  type ScrollAreaAxis,
  type ScrollAreaDirection,
  type ScrollAreaInstance,
  type ScrollAreaProps as CoreScrollAreaProps,
  type ScrollAreaScrollbarSize,
  type ScrollAreaScrollbarVisibility,
  type ScrollAreaScrollToOptions,
  type ScrollAreaState,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueScrollAreaProps extends CoreScrollAreaProps {}

export type ScrollAreaProps = VueScrollAreaProps

export type { ScrollAreaInstance }

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
    viewportClassName: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined }
  },
  emits: ['scroll'],
  setup(props, { slots, emit, attrs, expose }) {
    const viewportRef = ref<HTMLElement | null>(null)
    const contentRef = ref<HTMLElement | null>(null)
    const scrollState = shallowRef<ScrollAreaState>(createEmptyScrollAreaState())
    const draggingAxis = ref<ScrollAreaAxis | null>(null)
    const scrolling = ref(false)
    let dragSession: DocumentDragSession | null = null
    let stopObserving: (() => void) | null = null
    let scrollTimer = 0
    const config = useTigerConfig()
    const labels = computed(() =>
      getScrollAreaLabels(mergeTigerLocale(config.value.locale, props.locale))
    )

    function syncState(): void {
      const viewport = viewportRef.value
      if (!viewport) return
      scrollState.value = computeScrollAreaState(
        readScrollAreaMetrics(viewport),
        props.minThumbSize,
        readInlineDirection(viewport)
      )
    }

    function handleScroll(): void {
      const viewport = viewportRef.value
      if (!viewport) return
      syncState()
      scrolling.value = true
      window.clearTimeout(scrollTimer)
      scrollTimer = window.setTimeout(() => {
        scrolling.value = false
      }, 600)
      emit('scroll', {
        scrollTop: viewport.scrollTop,
        scrollLeft: viewport.scrollLeft,
        state: scrollState.value
      })
    }

    function applyScroll(axis: ScrollAreaAxis, logical: number): void {
      const viewport = viewportRef.value
      if (!viewport) return
      if (axis === 'y') viewport.scrollTop = logical
      else {
        viewport.scrollLeft = physicalInlineScrollFromLogical(
          logical,
          viewport.scrollWidth,
          viewport.clientWidth,
          readInlineDirection(viewport),
          viewport.scrollLeft
        )
      }
      handleScroll()
    }

    function startThumbDrag(axis: ScrollAreaAxis, event: PointerEvent): void {
      const viewport = viewportRef.value
      if (!viewport || event.button !== 0) return
      event.preventDefault()
      event.stopPropagation()
      const axisState = axis === 'y' ? scrollState.value.y : scrollState.value.x
      const startOffset = axisState.thumbOffset
      const rtl = axis === 'x' && readInlineDirection(viewport) === 'rtl'
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
          const delta = rtl ? startPoint - current : current - startPoint
          const trackSize = axis === 'y' ? viewport.clientHeight : viewport.clientWidth
          applyScroll(
            axis,
            computeScrollFromThumbOffset(
              startOffset + delta,
              trackSize,
              axisState.thumbSize,
              axis === 'y' ? viewport.scrollHeight : viewport.scrollWidth,
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
      const viewport = viewportRef.value
      if (!viewport) return
      const track = event.currentTarget as HTMLElement
      const rect = track.getBoundingClientRect()
      const rtl = axis === 'x' && readInlineDirection(viewport) === 'rtl'
      const point =
        axis === 'y'
          ? event.clientY - rect.top
          : rtl
            ? rect.right - event.clientX
            : event.clientX - rect.left
      const axisState = axis === 'y' ? scrollState.value.y : scrollState.value.x
      const trackSize = axis === 'y' ? viewport.clientHeight : viewport.clientWidth
      applyScroll(
        axis,
        computeScrollFromTrackPoint(
          point,
          trackSize,
          axisState.thumbSize,
          axis === 'y' ? viewport.scrollHeight : viewport.scrollWidth,
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

    onMounted(() => {
      syncState()
      stopObserving = observeScrollAreaSize([viewportRef.value, contentRef.value], syncState)
    })
    onBeforeUnmount(() => {
      dragSession?.dispose()
      stopObserving?.()
      window.clearTimeout(scrollTimer)
    })
    watch(
      () => [props.direction, props.minThumbSize],
      () => {
        void nextTick(syncState)
      }
    )

    expose({
      scrollTo,
      scrollToTop: (behavior?: ScrollAreaScrollToOptions['behavior']) =>
        scrollTo({ top: 0, behavior }),
      scrollToBottom: (behavior?: ScrollAreaScrollToOptions['behavior']) =>
        scrollTo({ top: viewportRef.value?.scrollHeight ?? 0, behavior }),
      getViewport: () => viewportRef.value,
      getState: () => scrollState.value
    } satisfies ScrollAreaInstance)

    function renderScrollbar(axis: ScrollAreaAxis) {
      const axisState = axis === 'y' ? scrollState.value.y : scrollState.value.x
      if (!shouldRenderScrollAreaScrollbar(props.scrollbar, props.direction, axis, axisState)) {
        return null
      }
      const otherVisible =
        axis === 'y'
          ? shouldRenderScrollAreaScrollbar(
              props.scrollbar,
              props.direction,
              'x',
              scrollState.value.x
            )
          : shouldRenderScrollAreaScrollbar(
              props.scrollbar,
              props.direction,
              'y',
              scrollState.value.y
            )
      return h(
        'div',
        {
          key: `scrollbar-${axis}`,
          class: getScrollAreaScrollbarClasses(axis, props.scrollbarSize, props.scrollbar),
          style: getScrollAreaScrollbarPlacementStyle(axis, props.scrollbarSize, otherVisible),
          'data-scroll-area-scrollbar': axis,
          'data-dragging': draggingAxis.value === axis ? '' : undefined,
          'aria-hidden': 'true',
          onPointerdown: (event: PointerEvent) => handleTrackPointerDown(axis, event),
          onWheel: (event: WheelEvent) => {
            const viewport = viewportRef.value
            if (!viewport) return
            applyScrollAreaWheel(event, viewport)
            handleScroll()
          }
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
      const visibleY = shouldRenderScrollAreaScrollbar(
        props.scrollbar,
        props.direction,
        'y',
        scrollState.value.y
      )
      const visibleX = shouldRenderScrollAreaScrollbar(
        props.scrollbar,
        props.direction,
        'x',
        scrollState.value.x
      )
      const overflow =
        (visibleY && scrollState.value.y.scrollable) || (visibleX && scrollState.value.x.scrollable)
      const userTabIndex =
        typeof attrs.tabindex === 'number'
          ? attrs.tabindex
          : typeof attrs.tabIndex === 'number'
            ? (attrs.tabIndex as number)
            : undefined
      const tabIndex = resolveScrollAreaViewportTabIndex({
        overflow,
        hasFocusable: scrollAreaHasFocusable(contentRef.value),
        userTabIndex
      })
      const labelledBy = (attrs['aria-labelledby'] as string | undefined) || undefined
      const attrLabel = (attrs['aria-label'] as string | undefined) || props.ariaLabel
      const viewportName =
        attrLabel || labelledBy || (tabIndex === 0 ? labels.value.ariaLabel : undefined)
      const {
        class: attrClass,
        style: attrStyle,
        tabindex: _t,
        tabIndex: _t2,
        ...rootAttrs
      } = attrs as Record<string, unknown>
      const shadows = props.shadow
        ? getScrollAreaShadowSides(scrollState.value, props.direction)
        : []

      const restRoot: Record<string, unknown> = {}
      const restA11y: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(rootAttrs)) {
        if (key.startsWith('aria-')) restA11y[key] = value
        else restRoot[key] = value
      }

      return h(
        'div',
        {
          ...restRoot,
          class: classNames(scrollAreaRootClasses, props.className, coerceClassValue(attrClass)),
          style: mergeStyleValues(getScrollAreaBoxStyle(props), attrStyle),
          'data-scroll-area': '',
          'data-scrolling': scrolling.value ? '' : undefined
        },
        [
          h(
            'div',
            {
              ref: viewportRef,
              class: getScrollAreaViewportClasses(props.direction, props.viewportClassName),
              style: getScrollAreaGutterStyle(props.scrollbarSize, visibleX, visibleY),
              tabindex: tabIndex,
              role: viewportName ? 'region' : undefined,
              'aria-label': attrLabel || (tabIndex === 0 ? labels.value.ariaLabel : undefined),
              'aria-labelledby': labelledBy,
              'data-scroll-area-viewport': '',
              onScroll: handleScroll,
              onKeydown: (event: KeyboardEvent) => {
                const viewport = viewportRef.value
                if (!viewport) return
                const delta = computeScrollAreaKeyboardDelta(
                  event.key,
                  props.direction,
                  { width: viewport.clientWidth, height: viewport.clientHeight },
                  readInlineDirection(viewport)
                )
                if (!delta) return
                event.preventDefault()
                if ('to' in delta) {
                  applyScroll(
                    delta.axis,
                    delta.to === 'start'
                      ? 0
                      : delta.axis === 'y'
                        ? viewport.scrollHeight
                        : viewport.scrollWidth
                  )
                  return
                }
                if (delta.axis === 'y') applyScroll('y', viewport.scrollTop + delta.delta)
                else {
                  const logical =
                    scrollState.value.x.progress *
                      Math.max(viewport.scrollWidth - viewport.clientWidth, 0) +
                    delta.delta
                  applyScroll('x', logical)
                }
              }
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
