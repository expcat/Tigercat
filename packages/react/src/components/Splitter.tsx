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
  getSplitterKeyboardDelta,
  getSplitterLabels,
  getSplitterPointerDelta,
  isSplitterRtl,
  layoutPanePixels,
  measureSplitterContainer,
  panePixelsToRatios,
  reconcileSplitterRatios,
  resolveInitialPaneSizes,
  resizePanes,
  splitterPaneBaseClasses,
  createDocumentDragSession,
  type DocumentDragSession,
  type SplitterProps as CoreSplitterProps,
  type SplitterRatioState
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
    direction = 'horizontal',
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
  const [ratioState, setRatioState] = useState<SplitterRatioState>({
    ratios: [],
    sizesKey: undefined
  })
  const [draggingIndex, setDraggingIndex] = useState(-1)
  const draggingRef = useRef<{
    index: number
    startX: number
    startY: number
    startSizes: number[]
  } | null>(null)

  const available = containerSize > 0 ? containerSize - Math.max(0, paneCount - 1) * gutterSize : 0
  const reconciled = reconcileSplitterRatios(ratioState, paneCount, controlledSizes, available)
  if (reconciled !== ratioState) {
    setRatioState(reconciled)
  }
  const ratios = reconciled.ratios
  const measured = containerSize > 0
  const paneSizes = measured ? layoutPanePixels(ratios, containerSize, gutterSize, min, max) : []

  if (
    process.env.NODE_ENV !== 'production' &&
    controlledSizes &&
    controlledSizes.length !== paneCount
  ) {
    devWarn(
      'Splitter.sizes.length',
      `Splitter sizes length (${controlledSizes.length}) does not match pane count (${paneCount}). Extra panes share remaining space.`
    )
  }

  const setContainerNode = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  const applyMeasure = useCallback(() => {
    const size = measureSplitterContainer(containerRef.current, direction)
    if (size > 0) setContainerSize(size)
  }, [direction])

  useLayoutEffect(() => {
    applyMeasure()
  }, [applyMeasure, paneCount, direction])

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

  const mins = useMemo(() => Array.from({ length: paneCount }, () => min), [paneCount, min])
  const maxes = useMemo(() => Array.from({ length: paneCount }, () => max), [paneCount, max])

  const commitSizes = useCallback(
    (nextPixels: number[], index: number, phase: 'move' | 'end' | 'keyboard') => {
      setRatioState((prev) => ({
        ratios: panePixelsToRatios(nextPixels),
        sizesKey: prev.sizesKey
      }))
      onSizesChange?.(nextPixels)
      onResize?.({ index, sizes: nextPixels })
      if (phase === 'end' || phase === 'keyboard') {
        onResizeEnd?.({ index, sizes: nextPixels })
      }
    },
    [onResize, onResizeEnd, onSizesChange]
  )

  const currentPixels = (liveSize = containerSize): number[] => {
    if (liveSize > 0) {
      return layoutPanePixels(ratios, liveSize, gutterSize, min, max)
    }
    return resolveInitialPaneSizes(paneCount, 0, gutterSize, controlledSizes, min, max) ?? []
  }

  const handlePointerDown = useCallback(
    (index: number, e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return
      e.preventDefault()
      cleanupDragSession()
      const liveSize = measureSplitterContainer(containerRef.current, direction)
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
        lockAxis: direction === 'horizontal' ? 'x' : 'y',
        onMove: ({ currentX, currentY }) => {
          const drag = draggingRef.current
          if (!drag) return
          const delta = getSplitterPointerDelta(
            direction,
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
              direction,
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
      direction,
      rtl,
      mins,
      maxes,
      cleanupDragSession,
      onResizeStart,
      commitSizes,
      measured,
      paneSizes,
      ratios,
      gutterSize,
      min,
      max,
      paneCount
    ]
  )

  const handleKeyDown = useCallback(
    (gutterIdx: number, e: React.KeyboardEvent) => {
      if (disabled) return
      const delta = getSplitterKeyboardDelta(e.key, direction, rtl)
      if (delta == null) return
      e.preventDefault()
      const newSizes = resizePanes(currentPixels(), gutterIdx, delta, mins, maxes)
      if (newSizes) commitSizes(newSizes, gutterIdx, 'keyboard')
    },
    [
      disabled,
      direction,
      rtl,
      mins,
      maxes,
      commitSizes,
      measured,
      paneSizes,
      ratios,
      gutterSize,
      min,
      max,
      paneCount
    ]
  )

  const containerClasses = classNames(getSplitterContainerClasses(direction, className))

  return (
    <div
      {...domProps}
      ref={setContainerNode}
      className={containerClasses}
      style={{ ...style, ...getSplitterGutterCssVars(gutterSize) }}
      dir={dir}
      data-direction={direction}
      aria-label={typeof ariaLabel === 'string' ? ariaLabel : undefined}
      aria-labelledby={typeof ariaLabelledby === 'string' ? ariaLabelledby : undefined}>
      {panes.map((child, i) => {
        const size = measured ? paneSizes[i] : null
        const paneStyle = getPaneStyle(size, direction, {
          ratio: ratios[i] ?? 0,
          measured
        })
        const paneId = `${instanceId}-pane-${i}`
        const isDragging = draggingIndex === i

        return (
          <React.Fragment key={i}>
            <div
              id={paneId}
              className={splitterPaneBaseClasses}
              style={paneStyle}
              data-pane-index={i}>
              {child}
            </div>
            {i < panes.length - 1 && (
              <div
                className={getSplitterGutterClasses(direction, !!isDragging, disabled)}
                role="separator"
                aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
                aria-controls={paneId}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={getSplitterGutterValueNow(measured ? paneSizes : [], i)}
                aria-label={
                  ariaLabelledby ? undefined : formatSplitterGutterLabel(labels.gutterAriaLabel, i)
                }
                aria-labelledby={typeof ariaLabelledby === 'string' ? ariaLabelledby : undefined}
                tabIndex={disabled ? -1 : 0}
                data-gutter-index={i}
                onPointerDown={(e) => handlePointerDown(i, e)}
                onKeyDown={(e) => handleKeyDown(i, e)}>
                <div className={getSplitterGutterHandleClasses(direction)} aria-hidden="true" />
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
