import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  classNames,
  resizableBaseClasses,
  getResizableHandleClasses,
  calculateResizeDelta,
  clampDimensions,
  applyAspectRatio,
  defaultResizeHandles,
  createDocumentDragSession,
  type DocumentDragSession,
  type ResizableProps as CoreResizableProps,
  type ResizeHandlePosition,
  type ResizeEvent
} from '@expcat/tigercat-core'

export interface ResizableProps extends Omit<CoreResizableProps, 'style'> {
  onResizeStart?: (event: ResizeEvent) => void
  onResize?: (event: ResizeEvent) => void
  onResizeEnd?: (event: ResizeEvent) => void
  children?: React.ReactNode
  style?: React.CSSProperties
}

export const Resizable: React.FC<ResizableProps> = ({
  defaultWidth,
  defaultHeight,
  minWidth = 0,
  minHeight = 0,
  maxWidth,
  maxHeight,
  handles = defaultResizeHandles,
  axis = 'both',
  disabled = false,
  lockAspectRatio = false,
  className,
  style,
  onResizeStart,
  onResize,
  onResizeEnd,
  children
}) => {
  const [width, setWidth] = useState(defaultWidth)
  const [height, setHeight] = useState(defaultHeight)
  const [draggingHandle, setDraggingHandle] = useState<ResizeHandlePosition | null>(null)
  const dragSessionRef = useRef<DocumentDragSession | null>(null)
  const dragRef = useRef<{
    handle: ResizeHandlePosition
    startX: number
    startY: number
    startW: number
    startH: number
  } | null>(null)

  const cleanupDragSession = useCallback(() => {
    dragSessionRef.current?.dispose()
    dragSessionRef.current = null
  }, [])

  useEffect(() => cleanupDragSession, [cleanupDragSession])

  const handleMouseDown = useCallback(
    (handle: ResizeHandlePosition, e: React.MouseEvent) => {
      if (disabled) return
      e.preventDefault()
      cleanupDragSession()
      const sw = width ?? 0
      const sh = height ?? 0
      dragRef.current = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startW: sw,
        startH: sh
      }
      setDraggingHandle(handle)
      onResizeStart?.({ width: sw, height: sh, handle, deltaX: 0, deltaY: 0 })

      const calculateResize = (currentX: number, currentY: number) => {
        const drag = dragRef.current
        if (!drag) return null
        const mouseDeltaX = currentX - drag.startX
        const mouseDeltaY = currentY - drag.startY
        const { deltaWidth, deltaHeight } = calculateResizeDelta(
          drag.handle,
          mouseDeltaX,
          mouseDeltaY,
          axis
        )
        let newW = drag.startW + deltaWidth
        let newH = drag.startH + deltaHeight

        if (lockAspectRatio) {
          const ar = applyAspectRatio(newW, newH, drag.startW, drag.startH)
          newW = ar.width
          newH = ar.height
        }

        const clamped = clampDimensions(newW, newH, minWidth, minHeight, maxWidth, maxHeight)
        return {
          width: clamped.width,
          height: clamped.height,
          handle: drag.handle,
          deltaX: clamped.width - drag.startW,
          deltaY: clamped.height - drag.startH
        }
      }

      dragSessionRef.current = createDocumentDragSession({
        startX: e.clientX,
        startY: e.clientY,
        ownerDocument: e.currentTarget.ownerDocument,
        onMove: ({ currentX, currentY }) => {
          const next = calculateResize(currentX, currentY)
          if (!next) return
          setWidth(next.width)
          setHeight(next.height)
          onResize?.(next)
        },
        onEnd: ({ currentX, currentY }) => {
          const next = calculateResize(currentX, currentY)
          if (next) onResizeEnd?.(next)
          dragRef.current = null
          dragSessionRef.current = null
          setDraggingHandle(null)
        }
      })
    },
    [
      disabled,
      width,
      height,
      axis,
      lockAspectRatio,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
      cleanupDragSession,
      onResizeStart,
      onResize,
      onResizeEnd
    ]
  )

  const containerClasses = useMemo(
    () => classNames(resizableBaseClasses, 'group/resizable', className),
    [className]
  )

  const containerStyle = useMemo<React.CSSProperties>(() => {
    const s: React.CSSProperties = { ...style }
    if (width != null) s.width = `${width}px`
    if (height != null) s.height = `${height}px`
    return s
  }, [width, height, style])

  return (
    <div className={containerClasses} style={containerStyle} data-resizable="">
      {children}
      {handles.map((pos) => (
        <div
          key={pos}
          className={getResizableHandleClasses(pos, draggingHandle === pos, disabled)}
          data-handle={pos}
          onMouseDown={(e) => handleMouseDown(pos, e)}
        />
      ))}
    </div>
  )
}

export default Resizable
