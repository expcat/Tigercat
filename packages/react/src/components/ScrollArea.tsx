import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  applyScrollAreaWheel,
  classNames,
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
  getScrollAreaShadowStyle,
  getScrollAreaThumbClasses,
  getScrollAreaThumbStyle,
  getScrollAreaViewportClasses,
  mergeTigerLocale,
  observeScrollAreaSize,
  physicalInlineScrollFromLogical,
  readInlineDirection,
  readScrollAreaMetrics,
  isScrollAreaViewportKeyTarget,
  resolveScrollAreaViewportTabIndex,
  scrollAreaRootClasses,
  prefersReducedMotion,
  scrollAreaMotionBehavior,
  shouldRenderScrollAreaScrollbar,
  SCROLL_AREA_MIN_THUMB_SIZE,
  type DocumentDragSession,
  type ScrollAreaAxis,
  type ScrollAreaInstance,
  type ScrollAreaProps as CoreScrollAreaProps,
  type ScrollAreaScrollDetail,
  type ScrollAreaScrollToOptions,
  type ScrollAreaState
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'

export interface ScrollAreaProps
  extends
    Omit<CoreScrollAreaProps, 'onScroll'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onScroll' | 'className'> {
  onScroll?: (detail: ScrollAreaScrollDetail) => void
  nativeBars?: boolean
}

export type { ScrollAreaInstance }

function peelA11y(rest: Record<string, unknown>): {
  a11y: Record<string, unknown>
  root: Record<string, unknown>
} {
  const a11y: Record<string, unknown> = {}
  const root: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (key === 'tabIndex' || key.startsWith('aria-')) a11y[key] = value
    else root[key] = value
  }
  return { a11y, root }
}

export const ScrollArea = forwardRef<ScrollAreaInstance, ScrollAreaProps>(function ScrollArea(
  {
    axis = 'vertical',
    scrollbar = 'auto',
    scrollbarSize = 'md',
    shadow = false,
    minThumbSize = SCROLL_AREA_MIN_THUMB_SIZE,
    height,
    maxHeight,
    width,
    maxWidth,
    ariaLabel,
    className,
    viewportClassName,
    children,
    onScroll,
    nativeBars = false,
    locale,
    ...rest
  },
  ref
) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const dragSessionRef = useRef<DocumentDragSession | null>(null)
  const stateRef = useRef<ScrollAreaState>(createEmptyScrollAreaState())
  const [state, setState] = useState<ScrollAreaState>(stateRef.current)
  const [draggingAxis, setDraggingAxis] = useState<ScrollAreaAxis | null>(null)
  const [scrolling, setScrolling] = useState(false)
  const scrollTimer = useRef<number>(0)
  const onScrollRef = useRef(onScroll)
  onScrollRef.current = onScroll
  const config = useTigerConfig()
  const labels = getScrollAreaLabels(mergeTigerLocale(config.locale, locale))
  const { a11y, root: rootRest } = peelA11y(rest as Record<string, unknown>)

  const syncState = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const next = computeScrollAreaState(
      readScrollAreaMetrics(viewport),
      minThumbSize,
      readInlineDirection(viewport)
    )
    stateRef.current = next
    setState(next)
  }, [minThumbSize])

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    syncState()
    setScrolling(true)
    window.clearTimeout(scrollTimer.current)
    scrollTimer.current = window.setTimeout(() => setScrolling(false), 600)
    onScrollRef.current?.({
      scrollTop: viewport.scrollTop,
      scrollLeft: viewport.scrollLeft,
      state: stateRef.current
    })
  }, [syncState])

  const applyScroll = useCallback(
    (axis: ScrollAreaAxis, logical: number) => {
      const viewport = viewportRef.current
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
    },
    [handleScroll]
  )

  const startThumbDrag = useCallback(
    (axis: ScrollAreaAxis, event: React.PointerEvent) => {
      const viewport = viewportRef.current
      if (!viewport || event.button !== 0) return
      event.preventDefault()
      event.stopPropagation()
      const axisState = axis === 'y' ? stateRef.current.y : stateRef.current.x
      const startOffset = axisState.thumbOffset
      const rtl = axis === 'x' && readInlineDirection(viewport) === 'rtl'
      const startPoint = axis === 'y' ? event.clientY : event.clientX
      dragSessionRef.current?.dispose()
      setDraggingAxis(axis)
      dragSessionRef.current = createDocumentDragSession({
        startX: event.clientX,
        startY: event.clientY,
        ownerDocument: viewport.ownerDocument,
        pointerId: event.pointerId,
        pointerTarget: event.currentTarget,
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
          setDraggingAxis(null)
          dragSessionRef.current = null
        }
      })
    },
    [applyScroll]
  )

  const handleTrackPointerDown = useCallback(
    (axis: ScrollAreaAxis, event: React.PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.dataset.scrollAreaThumb) {
        startThumbDrag(axis, event)
        return
      }
      const viewport = viewportRef.current
      if (!viewport) return
      const rect = event.currentTarget.getBoundingClientRect()
      const rtl = axis === 'x' && readInlineDirection(viewport) === 'rtl'
      const point =
        axis === 'y'
          ? event.clientY - rect.top
          : rtl
            ? rect.right - event.clientX
            : event.clientX - rect.left
      const axisState = axis === 'y' ? stateRef.current.y : stateRef.current.x
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
    },
    [applyScroll, startThumbDrag]
  )

  const scrollTo = useCallback(
    (options: ScrollAreaScrollToOptions) => {
      const viewport = viewportRef.current
      if (!viewport) return
      const behavior = options.behavior ?? 'auto'
      if (typeof viewport.scrollTo === 'function') {
        viewport.scrollTo({ top: options.top, left: options.left, behavior })
      } else {
        if (options.top !== undefined) viewport.scrollTop = options.top
        if (options.left !== undefined) viewport.scrollLeft = options.left
      }
      handleScroll()
    },
    [handleScroll]
  )

  const scrollToMarker = useCallback((id: string) => {
    const viewport = viewportRef.current
    if (!viewport) return
    const marker = viewport.querySelector(`[id="${CSS.escape(id)}"]`)
    if (!(marker instanceof HTMLElement)) return
    viewport.scrollTo({
      top: marker.offsetTop - viewport.offsetTop,
      behavior: scrollAreaMotionBehavior(prefersReducedMotion())
    })
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      scrollTo,
      scrollToMarker,
      scrollToTop: (behavior) => scrollTo({ top: 0, behavior }),
      scrollToBottom: (behavior) =>
        scrollTo({ top: viewportRef.current?.scrollHeight ?? 0, behavior }),
      getViewport: () => viewportRef.current,
      getState: () => stateRef.current
    }),
    [scrollTo, scrollToMarker]
  )

  useEffect(() => {
    const root = rootRef.current as
      (HTMLDivElement & { scrollToMarker?: (id: string) => void }) | null
    if (root) root.scrollToMarker = scrollToMarker
  }, [scrollToMarker])

  useEffect(() => {
    syncState()
    return observeScrollAreaSize([viewportRef.current, contentRef.current], syncState)
  }, [syncState, axis])

  useEffect(
    () => () => {
      dragSessionRef.current?.dispose()
      window.clearTimeout(scrollTimer.current)
    },
    []
  )

  const visibleY = nativeBars
    ? false
    : shouldRenderScrollAreaScrollbar(scrollbar, axis, 'y', state.y)
  const visibleX = nativeBars
    ? false
    : shouldRenderScrollAreaScrollbar(scrollbar, axis, 'x', state.x)
  const overflow = (visibleY && state.y.scrollable) || (visibleX && state.x.scrollable)
  const userTabIndex = a11y.tabIndex as number | undefined
  const tabIndex = resolveScrollAreaViewportTabIndex({
    overflow,
    userTabIndex
  })
  const named =
    (typeof ariaLabel === 'string' && ariaLabel) ||
    (typeof a11y['aria-label'] === 'string' && (a11y['aria-label'] as string)) ||
    (typeof a11y['aria-labelledby'] === 'string' && (a11y['aria-labelledby'] as string))
  const viewportName = named || (tabIndex === 0 ? labels.ariaLabel : undefined)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current
    if (!viewport || !isScrollAreaViewportKeyTarget(event)) return
    const delta = computeScrollAreaKeyboardDelta(
      event.key,
      axis,
      { width: viewport.clientWidth, height: viewport.clientHeight },
      readInlineDirection(viewport)
    )
    if (!delta) return
    event.preventDefault()
    if ('to' in delta) {
      if (delta.axis === 'y') {
        applyScroll('y', delta.to === 'start' ? 0 : viewport.scrollHeight)
      } else {
        applyScroll('x', delta.to === 'start' ? 0 : viewport.scrollWidth)
      }
      return
    }
    if (delta.axis === 'y') applyScroll('y', viewport.scrollTop + delta.delta)
    else {
      const logical =
        computeScrollAreaState(
          readScrollAreaMetrics(viewport),
          minThumbSize,
          readInlineDirection(viewport)
        ).x.progress *
          Math.max(viewport.scrollWidth - viewport.clientWidth, 0) +
        delta.delta
      applyScroll('x', logical)
    }
  }

  const shadowSides = useMemo(
    () => (shadow ? getScrollAreaShadowSides(state, axis) : []),
    [shadow, state, axis]
  )

  const renderScrollbar = (barAxis: ScrollAreaAxis) => {
    const axisState = barAxis === 'y' ? state.y : state.x
    if (nativeBars || !shouldRenderScrollAreaScrollbar(scrollbar, axis, barAxis, axisState))
      return null
    const otherVisible = barAxis === 'y' ? visibleX : visibleY
    return (
      <div
        className={getScrollAreaScrollbarClasses(barAxis, scrollbarSize, scrollbar)}
        style={getScrollAreaScrollbarPlacementStyle(barAxis, scrollbarSize, otherVisible)}
        data-scroll-area-scrollbar={barAxis}
        data-dragging={draggingAxis === barAxis ? '' : undefined}
        aria-hidden="true"
        onPointerDown={(event) => handleTrackPointerDown(barAxis, event)}
        onWheel={(event) => {
          const viewport = viewportRef.current
          if (!viewport) return
          applyScrollAreaWheel(event.nativeEvent, viewport)
          handleScroll()
        }}>
        <div
          className={getScrollAreaThumbClasses(barAxis, draggingAxis === barAxis)}
          style={getScrollAreaThumbStyle(barAxis, axisState)}
          data-scroll-area-thumb={barAxis}
        />
      </div>
    )
  }

  return (
    <div
      {...(rootRest as React.HTMLAttributes<HTMLDivElement>)}
      ref={rootRef}
      className={classNames(scrollAreaRootClasses, className)}
      data-scroll-area=""
      data-native-bars={nativeBars ? '' : undefined}
      data-scrolling={scrolling ? '' : undefined}>
      <div
        ref={viewportRef}
        className={classNames(
          getScrollAreaViewportClasses(axis, viewportClassName),
          nativeBars ? 'overflow-auto' : undefined
        )}
        style={{
          ...getScrollAreaBoxStyle({ height, maxHeight, width, maxWidth }),
          ...getScrollAreaGutterStyle(scrollbarSize, visibleX, visibleY)
        }}
        tabIndex={tabIndex}
        role={viewportName ? 'region' : undefined}
        aria-label={
          (a11y['aria-label'] as string | undefined) ||
          ariaLabel ||
          (tabIndex === 0 ? labels.ariaLabel : undefined)
        }
        aria-labelledby={a11y['aria-labelledby'] as string | undefined}
        data-scroll-area-viewport=""
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}>
        <div
          ref={contentRef}
          className={getScrollAreaContentClasses(axis)}
          data-scroll-area-content="">
          {children}
        </div>
      </div>
      {shadowSides.map((side) => (
        <div
          key={side}
          className={getScrollAreaShadowClasses(side)}
          style={getScrollAreaShadowStyle(side)}
          data-scroll-area-shadow={side}
          aria-hidden="true"
        />
      ))}
      {renderScrollbar('y')}
      {renderScrollbar('x')}
    </div>
  )
})

ScrollArea.displayName = 'ScrollArea'

export default ScrollArea
