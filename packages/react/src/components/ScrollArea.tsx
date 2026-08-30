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
  classNames,
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
  type ScrollAreaInstance,
  type ScrollAreaProps as CoreScrollAreaProps,
  type ScrollAreaScrollDetail,
  type ScrollAreaScrollToOptions,
  type ScrollAreaState
} from '@expcat/tigercat-core'

export interface ScrollAreaProps
  extends
    CoreScrollAreaProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onScroll' | 'className'> {
  /** Fired on every viewport scroll with the derived scroll state */
  onScroll?: (detail: ScrollAreaScrollDetail) => void
}

export const ScrollArea = forwardRef<ScrollAreaInstance, ScrollAreaProps>(
  (
    {
      direction = 'vertical',
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
      ...rest
    },
    ref
  ) => {
    const viewportRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const dragSessionRef = useRef<DocumentDragSession | null>(null)
    const stateRef = useRef<ScrollAreaState>(createEmptyScrollAreaState())
    const [state, setState] = useState<ScrollAreaState>(stateRef.current)
    const [draggingAxis, setDraggingAxis] = useState<ScrollAreaAxis | null>(null)

    const onScrollRef = useRef(onScroll)
    onScrollRef.current = onScroll

    const syncState = useCallback(() => {
      const viewport = viewportRef.current
      if (!viewport) return
      const next = computeScrollAreaState(readScrollAreaMetrics(viewport), minThumbSize)
      stateRef.current = next
      setState(next)
    }, [minThumbSize])

    const handleScroll = useCallback(() => {
      const viewport = viewportRef.current
      if (!viewport) return
      syncState()
      onScrollRef.current?.({
        scrollTop: viewport.scrollTop,
        scrollLeft: viewport.scrollLeft,
        state: stateRef.current
      })
    }, [syncState])

    const applyScroll = useCallback(
      (axis: ScrollAreaAxis, position: number) => {
        const viewport = viewportRef.current
        if (!viewport) return
        if (axis === 'y') viewport.scrollTop = position
        else viewport.scrollLeft = position
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
            const trackSize = axis === 'y' ? viewport.clientHeight : viewport.clientWidth
            applyScroll(
              axis,
              computeScrollFromThumbOffset(
                startOffset + (current - startPoint),
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
        const point = axis === 'y' ? event.clientY - rect.top : event.clientX - rect.left
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

    useImperativeHandle(
      ref,
      () => ({
        scrollTo,
        scrollToTop: (behavior) => scrollTo({ top: 0, behavior }),
        scrollToBottom: (behavior) =>
          scrollTo({ top: viewportRef.current?.scrollHeight ?? 0, behavior }),
        getViewport: () => viewportRef.current,
        getState: () => stateRef.current
      }),
      [scrollTo]
    )

    useEffect(() => {
      syncState()
      return observeScrollAreaSize([viewportRef.current, contentRef.current], syncState)
    }, [syncState, direction])

    useEffect(() => () => dragSessionRef.current?.dispose(), [])

    const shadowSides = useMemo(
      () => (shadow ? getScrollAreaShadowSides(state, direction) : []),
      [shadow, state, direction]
    )

    const renderScrollbar = (axis: ScrollAreaAxis) => {
      const axisState = axis === 'y' ? state.y : state.x
      if (!shouldRenderScrollAreaScrollbar(scrollbar, direction, axis, axisState)) return null

      return (
        <div
          className={getScrollAreaScrollbarClasses(axis, scrollbarSize, scrollbar)}
          data-scroll-area-scrollbar={axis}
          aria-hidden="true"
          onPointerDown={(event) => handleTrackPointerDown(axis, event)}>
          <div
            className={getScrollAreaThumbClasses(axis, draggingAxis === axis)}
            style={getScrollAreaThumbStyle(axis, axisState)}
            data-scroll-area-thumb={axis}
          />
        </div>
      )
    }

    return (
      <div {...rest} className={classNames(scrollAreaRootClasses, className)} data-scroll-area="">
        <div
          ref={viewportRef}
          className={getScrollAreaViewportClasses(direction, viewportClassName)}
          style={getScrollAreaBoxStyle({ height, maxHeight, width, maxWidth })}
          tabIndex={0}
          role={ariaLabel ? 'region' : undefined}
          aria-label={ariaLabel}
          data-scroll-area-viewport=""
          onScroll={handleScroll}>
          <div
            ref={contentRef}
            className={getScrollAreaContentClasses(direction)}
            data-scroll-area-content="">
            {children}
          </div>
        </div>
        {shadowSides.map((side) => (
          <div
            key={side}
            className={getScrollAreaShadowClasses(side)}
            data-scroll-area-shadow={side}
            aria-hidden="true"
          />
        ))}
        {renderScrollbar('y')}
        {renderScrollbar('x')}
      </div>
    )
  }
)

ScrollArea.displayName = 'ScrollArea'

export default ScrollArea
