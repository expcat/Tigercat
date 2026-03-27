import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  classNames,
  getSplitterContainerClasses,
  getSplitterGutterClasses,
  getSplitterGutterHandleClasses,
  getPaneStyle,
  resizePanes,
  type SplitterProps as CoreSplitterProps
} from '@expcat/tigercat-core'

export interface SplitterResizeEvent {
  index: number
  sizes: number[]
}

export interface SplitterProps extends Omit<CoreSplitterProps, 'style'> {
  onResizeStart?: (event: SplitterResizeEvent) => void
  onResize?: (event: SplitterResizeEvent) => void
  onResizeEnd?: (event: SplitterResizeEvent) => void
  onSizesChange?: (sizes: number[]) => void
  children?: React.ReactNode
  style?: React.CSSProperties
}

export const Splitter: React.FC<SplitterProps> = ({
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
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [paneSizes, setPaneSizes] = useState<number[]>(controlledSizes || [])
  const draggingRef = useRef<{
    index: number
    startPos: number
    startSizes: number[]
  } | null>(null)

  // Sync controlled sizes
  useEffect(() => {
    if (controlledSizes) setPaneSizes(controlledSizes)
  }, [controlledSizes])

  // Initialize sizes from container if not controlled
  useEffect(() => {
    if (controlledSizes && controlledSizes.length > 0) return
    const el = containerRef.current
    if (!el) return
    const paneCount = React.Children.count(children)
    if (paneCount === 0) return
    const totalGutter = (paneCount - 1) * gutterSize
    const total =
      direction === 'horizontal' ? el.clientWidth - totalGutter : el.clientHeight - totalGutter
    const eachSize = total / paneCount
    setPaneSizes(Array.from({ length: paneCount }, () => eachSize))
  }, [children, direction, gutterSize, controlledSizes])

  const mins = useMemo(() => paneSizes.map(() => min), [paneSizes.length, min])
  const maxes = useMemo(() => paneSizes.map(() => max), [paneSizes.length, max])

  const handleMouseDown = useCallback(
    (index: number, e: React.MouseEvent) => {
      if (disabled) return
      e.preventDefault()
      draggingRef.current = {
        index,
        startPos: direction === 'horizontal' ? e.clientX : e.clientY,
        startSizes: [...paneSizes]
      }
      onResizeStart?.({ index, sizes: [...paneSizes] })

      const onMouseMove = (ev: MouseEvent) => {
        const drag = draggingRef.current
        if (!drag) return
        const currentPos = direction === 'horizontal' ? ev.clientX : ev.clientY
        const delta = currentPos - drag.startPos
        const newSizes = resizePanes(drag.startSizes, drag.index, delta, mins, maxes)
        if (newSizes) {
          setPaneSizes(newSizes)
          onSizesChange?.(newSizes)
          onResize?.({ index: drag.index, sizes: newSizes })
        }
      }

      const onMouseUp = (ev: MouseEvent) => {
        const drag = draggingRef.current
        if (drag) {
          const currentPos = direction === 'horizontal' ? ev.clientX : ev.clientY
          const delta = currentPos - drag.startPos
          const finalSizes =
            resizePanes(drag.startSizes, drag.index, delta, mins, maxes) ?? drag.startSizes
          onResizeEnd?.({ index: drag.index, sizes: finalSizes })
        }
        draggingRef.current = null
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [
      disabled,
      direction,
      paneSizes,
      mins,
      maxes,
      onResizeStart,
      onResize,
      onResizeEnd,
      onSizesChange
    ]
  )

  const handleKeyDown = useCallback(
    (gutterIdx: number, e: React.KeyboardEvent) => {
      if (disabled) return
      const step = 10
      let delta = 0
      if (
        (direction === 'horizontal' && e.key === 'ArrowLeft') ||
        (direction === 'vertical' && e.key === 'ArrowUp')
      ) {
        delta = -step
      } else if (
        (direction === 'horizontal' && e.key === 'ArrowRight') ||
        (direction === 'vertical' && e.key === 'ArrowDown')
      ) {
        delta = step
      }
      if (delta !== 0) {
        e.preventDefault()
        const newSizes = resizePanes(paneSizes, gutterIdx, delta, mins, maxes)
        if (newSizes) {
          setPaneSizes(newSizes)
          onSizesChange?.(newSizes)
          onResize?.({ index: gutterIdx, sizes: newSizes })
        }
      }
    },
    [disabled, direction, paneSizes, mins, maxes, onResize, onSizesChange]
  )

  const childArray = React.Children.toArray(children)
  const containerClasses = useMemo(
    () => classNames(getSplitterContainerClasses(direction, className)),
    [direction, className]
  )

  return (
    <div ref={containerRef} className={containerClasses} style={style} data-direction={direction}>
      {childArray.map((child, i) => {
        const size = paneSizes[i]
        const paneStyle = size != null ? getPaneStyle(size, direction) : undefined
        const isDragging = draggingRef.current?.index === i

        return (
          <React.Fragment key={i}>
            <div
              className="tiger-splitter-pane relative overflow-auto"
              style={paneStyle}
              data-pane-index={i}>
              {child}
            </div>
            {i < childArray.length - 1 && (
              <div
                className={getSplitterGutterClasses(direction, !!isDragging, disabled)}
                role="separator"
                aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
                tabIndex={disabled ? -1 : 0}
                data-gutter-index={i}
                onMouseDown={(e) => handleMouseDown(i, e)}
                onKeyDown={(e) => handleKeyDown(i, e)}>
                <div className={getSplitterGutterHandleClasses(direction)} />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default Splitter
