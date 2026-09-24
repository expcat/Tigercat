import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useId
} from 'react'
import {
  classNames,
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
  restoreSplitterSize,
  measureSplitterContainer,
  normalizeSplitterBounds,
  resizePanes,
  resolveSplitterSeparatorKey,
  serializePaneSizes,
  splitterPaneBaseClasses,
  createDocumentDragSession,
  type DocumentDragSession,
  type SplitterProps as CoreSplitterProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface SplitterResizeEvent {
  index: number
  sizes: number[]
}

export interface SplitterProps
  extends
    Omit<CoreSplitterProps, 'style'>,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CoreSplitterProps | 'children'> {
  onResizeStart?: (event: SplitterResizeEvent) => void
  onResize?: (event: SplitterResizeEvent) => void
  onResizeEnd?: (event: SplitterResizeEvent) => void
  onSizesChange?: (sizes: number[]) => void
  children?: React.ReactNode
  style?: React.CSSProperties
  collapsible?: boolean
}

function flattenSplitterPanes(children: React.ReactNode): React.ReactNode[] {
  const out: React.ReactNode[] = []
  React.Children.forEach(children, (child) => {
    if (child == null || typeof child === 'boolean') return
    if (typeof child === 'string' || typeof child === 'number') {
      if (String(child).trim() !== '') out.push(child)
      return
    }
    if (React.isValidElement(child) && child.type === React.Fragment) {
      out.push(...flattenSplitterPanes((child.props as { children?: React.ReactNode }).children))
      return
    }
    out.push(child)
  })
  return out
}

export const Splitter = forwardRef<HTMLDivElement, SplitterProps>(function Splitter(
  {
    orientation = 'horizontal',
    sizes: controlledSizes,
    min = 0,
    max,
    gutterSize = 4,
    disabled = false,
    className,
    style,
    onResizeStart,
    onResize,
    onResizeEnd,
    onSizesChange,
    children,
    collapsible = false,
    dir,
    ...rest
  },
  ref
) {
  const config = useTigerConfig()
  const labels = getSplitterLabels(config.locale)
  const rtl = isSplitterRtl(typeof dir === 'string' ? dir : config.direction)
  const { 'aria-labelledby': ariaLabelledby, 'aria-label': ariaLabel, ...domProps } = rest
  const panes = flattenSplitterPanes(children)
  const paneCount = panes.length
  const instanceId = useId()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragSessionRef = useRef<DocumentDragSession | null>(null)
  const [containerSize, setContainerSize] = useState(0)
  const sizesKey = serializePaneSizes(controlledSizes)
  const [override, setOverride] = useState<{ key: string | undefined; pixels: number[] } | null>(
    null
  )
  const dragPixels = override && override.key === sizesKey ? override.pixels : null
  const [draggingIndex, setDraggingIndex] = useState(-1)
  const draggingRef = useRef<{
    index: number
    startX: number
    startY: number
    startSizes: number[]
  } | null>(null)

  const bounds = useMemo(
    () => normalizeSplitterBounds(paneCount, min, max),
    [max, min, paneCount]
  )
  const boxes = layoutDeclaredPanes(
    dragPixels ?? controlledSizes,
    paneCount,
    containerSize,
    gutterSize,
    bounds.mins,
    bounds.maxes
  )
  const panePixels = boxes.map((box) => box.pixels ?? 0)
  const pixelsRef = useRef(panePixels)
  pixelsRef.current = panePixels
  const [collapsedPrevious, setCollapsedPrevious] = useState<(number | string | null)[]>([])

  if (controlledSizes && controlledSizes.length !== paneCount) {
    devWarn(
      'Splitter.sizes.length',
      `Splitter sizes length (${controlledSizes.length}) does not match pane count (${paneCount}). Extra panes share remaining space.`
    )
  }

  const setContainerNode = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node
      if (node) {
        ;(node as HTMLDivElement & { getSizes?: () => number[] }).getSizes = () =>
          pixelsRef.current.slice()
      }
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  const applyMeasure = useCallback(() => {
    const size = measureSplitterContainer(containerRef.current, orientation)
    if (size > 0) setContainerSize(size)
  }, [orientation])

  useLayoutEffect(() => {
    applyMeasure()
  }, [applyMeasure, paneCount, orientation])

  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => applyMeasure())
    observer.observe(el)
    return () => observer.disconnect()
  }, [applyMeasure])

  const cleanupDragSession = useCallback(() => {
    dragSessionRef.current?.dispose()
    dragSessionRef.current = null
  }, [])

  useEffect(() => cleanupDragSession, [cleanupDragSession])

  const mins = bounds.mins
  const maxes = bounds.maxes

  const commitSizes = useCallback(
    (nextPixels: number[], index: number, phase: 'move' | 'end' | 'keyboard') => {
      setOverride({ key: sizesKey, pixels: nextPixels })
      onSizesChange?.(nextPixels)
      onResize?.({ index, sizes: nextPixels })
      if (phase === 'end' || phase === 'keyboard') {
        onResizeEnd?.({ index, sizes: nextPixels })
      }
    },
    [onResize, onResizeEnd, onSizesChange, sizesKey]
  )

  const pixelsFor = useCallback(
    (liveSize: number): number[] => {
      return layoutDeclaredPanes(
        dragPixels ?? controlledSizes,
        paneCount,
        liveSize,
        gutterSize,
        mins,
        maxes
      ).map((box) => box.pixels ?? 0)
    },
    [controlledSizes, dragPixels, gutterSize, maxes, mins, paneCount]
  )

  const currentPixels = useCallback(
    (liveSize = containerSize): number[] => pixelsFor(liveSize),
    [containerSize, pixelsFor]
  )

  const handlePointerDown = useCallback(
    (index: number, e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return
      e.preventDefault()
      cleanupDragSession()
      const liveSize = measureSplitterContainer(containerRef.current, orientation)
      if (liveSize > 0 && liveSize !== containerSize) setContainerSize(liveSize)
      const startSizes = currentPixels(liveSize > 0 ? liveSize : containerSize)
      draggingRef.current = {
        index,
        startX: e.clientX,
        startY: e.clientY,
        startSizes
      }
      setDraggingIndex(index)
      onResizeStart?.({ index, sizes: startSizes })

      dragSessionRef.current = createDocumentDragSession({
        startX: e.clientX,
        startY: e.clientY,
        ownerDocument: e.currentTarget.ownerDocument,
        pointerId: e.pointerId,
        pointerTarget: e.currentTarget,
        lockAxis: orientation === 'horizontal' ? 'x' : 'y',
        onMove: ({ currentX, currentY }) => {
          const drag = draggingRef.current
          if (!drag) return
          const delta = getSplitterPointerDelta(
            orientation,
            drag.startX,
            drag.startY,
            currentX,
            currentY,
            rtl
          )
          const newSizes = resizePanes(drag.startSizes, drag.index, delta, mins, maxes)
          if (newSizes) commitSizes(newSizes, drag.index, 'move')
        },
        onEnd: ({ currentX, currentY }) => {
          const drag = draggingRef.current
          if (drag) {
            const delta = getSplitterPointerDelta(
              orientation,
              drag.startX,
              drag.startY,
              currentX,
              currentY,
              rtl
            )
            const finalSizes =
              resizePanes(drag.startSizes, drag.index, delta, mins, maxes) ?? drag.startSizes
            commitSizes(finalSizes, drag.index, 'end')
          }
          draggingRef.current = null
          dragSessionRef.current = null
          setDraggingIndex(-1)
        }
      })
    },
    [
      disabled,
      orientation,
      rtl,
      mins,
      maxes,
      cleanupDragSession,
      onResizeStart,
      commitSizes,
      containerSize,
      currentPixels
    ]
  )

  const handleKeyDown = useCallback(
    (gutterIdx: number, e: React.KeyboardEvent) => {
      if (disabled) return
      const action = resolveSplitterSeparatorKey(e.key, orientation, rtl)
      if (!action) return
      e.preventDefault()
      const current = currentPixels()
      const newSizes =
        action.type === 'delta'
          ? resizePanes(current, gutterIdx, action.delta, mins, maxes)
          : jumpSplitterGutter(current, gutterIdx, action.edge, mins, maxes)
      if (newSizes) commitSizes(newSizes, gutterIdx, 'keyboard')
    },
    [disabled, orientation, rtl, mins, maxes, commitSizes, currentPixels]
  )

  const containerClasses = classNames(getSplitterContainerClasses(orientation, className))

  return (
    <div
      {...domProps}
      ref={setContainerNode}
      className={containerClasses}
      style={{ ...style, ...getSplitterGutterCssVars(gutterSize) }}
      dir={dir}
      data-orientation={orientation}
      aria-label={typeof ariaLabel === 'string' ? ariaLabel : undefined}
      aria-labelledby={typeof ariaLabelledby === 'string' ? ariaLabelledby : undefined}>
      {panes.map((child, i) => {
        const paneStyle = getPaneStyle(boxes[i] ?? { kind: 'flex', pixels: null, flexGrow: 1 }, orientation)
        const paneId = `${instanceId}-pane-${i}`
        const isDragging = draggingIndex === i

        return (
          <React.Fragment key={i}>
            <div
              id={paneId}
              className={splitterPaneBaseClasses}
              style={paneStyle}
              data-pane-index={i}
              data-collapsed={collapsedPrevious[i] != null ? '' : undefined}>
              {collapsible ? (
                <button
                  type="button"
                  data-tiger-splitter-collapse={String(i)}
                  aria-label={
                    collapsedPrevious[i] != null
                      ? feedbackLayoutLabels.splitterExpand
                      : feedbackLayoutLabels.splitterCollapse
                  }
                  onClick={() => {
                    const base = (dragPixels ?? controlledSizes ?? panePixels).slice()
                    const stored = collapsedPrevious[i]
                    const nextSizes =
                      stored == null
                        ? collapseSplitterSizes(base, i).sizes
                        : restoreSplitterSize(base, i, stored)
                    setCollapsedPrevious((current) => {
                      const copy = current.slice()
                      copy[i] = stored == null ? (collapseSplitterSizes(base, i).previous) : null
                      return copy
                    })
                    const numeric = nextSizes.map((size) => (typeof size === 'number' ? size : 0))
                    setOverride({ key: sizesKey, pixels: numeric })
                    onSizesChange?.(numeric)
                  }}>
                  {collapsedPrevious[i] != null
                    ? feedbackLayoutLabels.splitterExpand
                    : feedbackLayoutLabels.splitterCollapse}
                </button>
              ) : null}
              {collapsedPrevious[i] != null ? null : child}
            </div>
            {i < panes.length - 1 && (
              <div
                className={getSplitterGutterClasses(orientation, !!isDragging, disabled)}
                role="separator"
                aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
                aria-controls={paneId}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={getSplitterGutterValueNow(containerSize > 0 ? panePixels : [], i)}
                aria-label={
                  ariaLabelledby ? undefined : formatSplitterGutterLabel(labels.gutterAriaLabel, i)
                }
                aria-labelledby={typeof ariaLabelledby === 'string' ? ariaLabelledby : undefined}
                tabIndex={disabled ? -1 : 0}
                data-gutter-index={i}
                onPointerDown={(e) => handlePointerDown(i, e)}
                onKeyDown={(e) => handleKeyDown(i, e)}>
                <div className={getSplitterGutterHandleClasses(orientation)} aria-hidden="true" />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
})

Splitter.displayName = 'Splitter'

export default Splitter
