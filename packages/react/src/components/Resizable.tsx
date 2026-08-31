import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  applyResizeJump,
  applyResizeSize,
  classNames,
  createDocumentDragSession,
  defaultResizeHandles,
  formatResizableHandleLabel,
  getResizableHandleClasses,
  getResizeHandleOrientation,
  getResizeKeyboardDelta,
  getResizableLabels,
  isCornerResizeHandle,
  isSplitterRtl,
  mergeResizableBoxStyle,
  resizableBaseClasses,
  resolveVisibleResizeHandles,
  type DocumentDragSession,
  type ResizableProps as CoreResizableProps,
  type ResizeEvent,
  type ResizeHandlePosition
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'

export interface ResizableProps
  extends
    Omit<CoreResizableProps, 'style'>,
    Omit<
      React.ComponentPropsWithoutRef<'div'>,
      keyof CoreResizableProps | 'onResize' | 'children' | 'width' | 'height'
    > {
  onResizeStart?: (event: ResizeEvent) => void
  onResize?: (event: ResizeEvent) => void
  onResizeEnd?: (event: ResizeEvent) => void
  onWidthChange?: (width: number) => void
  onHeightChange?: (height: number) => void
  children?: React.ReactNode
  style?: React.CSSProperties
  width?: number
  height?: number
}

export const Resizable = forwardRef<HTMLDivElement, ResizableProps>(function Resizable(
  {
    width: widthProp,
    height: heightProp,
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
    onWidthChange,
    onHeightChange,
    children,
    dir,
    ...rest
  },
  ref
) {
  const config = useTigerConfig()
  const labels = getResizableLabels(config.locale)
  const rtl = isSplitterRtl(typeof dir === 'string' ? dir : config.direction)
  const { 'aria-labelledby': ariaLabelledby, 'aria-label': ariaLabel, ...domProps } = rest

  const [width, setWidth] = useControlledState<number | undefined>({
    value: widthProp,
    defaultValue: defaultWidth,
    onChange: onWidthChange
  })
  const [height, setHeight] = useControlledState<number | undefined>({
    value: heightProp,
    defaultValue: defaultHeight,
    onChange: onHeightChange
  })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [draggingHandle, setDraggingHandle] = useState<ResizeHandlePosition | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const dragSessionRef = useRef<DocumentDragSession | null>(null)
  const dragRef = useRef<{
    handle: ResizeHandlePosition
    startX: number
    startY: number
    startW: number
    startH: number
    startOffsetX: number
    startOffsetY: number
  } | null>(null)

  const visibleHandles = useMemo(() => resolveVisibleResizeHandles(handles, axis), [handles, axis])

  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref]
  )

  const cleanupDragSession = useCallback(() => {
    dragSessionRef.current?.dispose()
    dragSessionRef.current = null
  }, [])

  useEffect(() => cleanupDragSession, [cleanupDragSession])

  const commitSize = useCallback(
    (
      next: { width: number; height: number; offsetX: number; offsetY: number },
      handle: ResizeHandlePosition,
      startW: number,
      startH: number,
      startOffsetX: number,
      startOffsetY: number,
      phase: 'move' | 'end' | 'keyboard'
    ) => {
      setWidth(next.width)
      setHeight(next.height)
      setOffset({ x: startOffsetX + next.offsetX, y: startOffsetY + next.offsetY })
      const event: ResizeEvent = {
        width: next.width,
        height: next.height,
        handle,
        deltaX: next.width - startW,
        deltaY: next.height - startH
      }
      onResize?.(event)
      if (phase !== 'move') onResizeEnd?.(event)
    },
    [onResize, onResizeEnd, setHeight, setWidth]
  )

  const measureBox = (): { width: number; height: number } => {
    const rect = rootRef.current?.getBoundingClientRect()
    return {
      width: width ?? rect?.width ?? 0,
      height: height ?? rect?.height ?? 0
    }
  }

  const handlePointerDown = useCallback(
    (handle: ResizeHandlePosition, e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return
      e.preventDefault()
      cleanupDragSession()
      const box = measureBox()
      dragRef.current = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startW: box.width,
        startH: box.height,
        startOffsetX: offset.x,
        startOffsetY: offset.y
      }
      setDraggingHandle(handle)
      onResizeStart?.({
        width: box.width,
        height: box.height,
        handle,
        deltaX: 0,
        deltaY: 0
      })

      dragSessionRef.current = createDocumentDragSession({
        startX: e.clientX,
        startY: e.clientY,
        ownerDocument: e.currentTarget.ownerDocument,
        pointerId: e.pointerId,
        pointerTarget: e.currentTarget,
        onMove: ({ currentX, currentY }) => {
          const drag = dragRef.current
          if (!drag) return
          const next = applyResizeSize(
            drag.handle,
            drag.startW,
            drag.startH,
            currentX - drag.startX,
            currentY - drag.startY,
            axis,
            {
              rtl,
              lockAspectRatio,
              minWidth,
              minHeight,
              maxWidth,
              maxHeight
            }
          )
          commitSize(
            next,
            drag.handle,
            drag.startW,
            drag.startH,
            drag.startOffsetX,
            drag.startOffsetY,
            'move'
          )
        },
        onEnd: ({ currentX, currentY }) => {
          const drag = dragRef.current
          if (drag) {
            const next = applyResizeSize(
              drag.handle,
              drag.startW,
              drag.startH,
              currentX - drag.startX,
              currentY - drag.startY,
              axis,
              {
                rtl,
                lockAspectRatio,
                minWidth,
                minHeight,
                maxWidth,
                maxHeight
              }
            )
            commitSize(
              next,
              drag.handle,
              drag.startW,
              drag.startH,
              drag.startOffsetX,
              drag.startOffsetY,
              'end'
            )
          }
          dragRef.current = null
          dragSessionRef.current = null
          setDraggingHandle(null)
        }
      })
    },
    [
      axis,
      cleanupDragSession,
      commitSize,
      disabled,
      height,
      lockAspectRatio,
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      offset.x,
      offset.y,
      onResizeStart,
      rtl,
      width
    ]
  )

  const handleKeyDown = useCallback(
    (handle: ResizeHandlePosition, e: React.KeyboardEvent) => {
      if (disabled) return
      const box = measureBox()
      const jumped = applyResizeJump(e.key, handle, box.width, box.height, axis, {
        rtl,
        lockAspectRatio,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight
      })
      if (jumped) {
        e.preventDefault()
        commitSize(jumped, handle, box.width, box.height, offset.x, offset.y, 'keyboard')
        return
      }
      const delta = getResizeKeyboardDelta(e.key)
      if (!delta) return
      e.preventDefault()
      const next = applyResizeSize(
        handle,
        box.width,
        box.height,
        delta.deltaX,
        delta.deltaY,
        axis,
        { rtl, lockAspectRatio, minWidth, minHeight, maxWidth, maxHeight }
      )
      commitSize(next, handle, box.width, box.height, offset.x, offset.y, 'keyboard')
    },
    [
      axis,
      commitSize,
      disabled,
      height,
      lockAspectRatio,
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      offset.x,
      offset.y,
      rtl,
      width
    ]
  )

  const containerClasses = classNames(resizableBaseClasses, 'group/resizable', className)
  const containerStyle = mergeResizableBoxStyle(
    style as Record<string, string | number> | undefined,
    width,
    height,
    offset.x,
    offset.y
  ) as React.CSSProperties

  return (
    <div
      {...domProps}
      ref={setRootRef}
      className={containerClasses}
      style={containerStyle}
      dir={dir}
      data-resizable=""
      aria-label={typeof ariaLabel === 'string' ? ariaLabel : undefined}
      aria-labelledby={typeof ariaLabelledby === 'string' ? ariaLabelledby : undefined}>
      {children}
      {visibleHandles.map((pos) => {
        const corner = isCornerResizeHandle(pos)
        const usesHeight = pos === 'top' || pos === 'bottom'
        const valueNow = Math.round((usesHeight ? height : width) ?? 0)
        const valueMin = usesHeight ? minHeight : minWidth
        const valueMax = usesHeight ? maxHeight : maxWidth
        const handleName = formatResizableHandleLabel(labels.handleAriaLabel, pos)
        return (
          <div
            key={pos}
            className={getResizableHandleClasses(pos, draggingHandle === pos, disabled)}
            data-handle={pos}
            role={corner ? undefined : 'separator'}
            aria-hidden={corner ? true : undefined}
            aria-label={corner || ariaLabelledby ? undefined : handleName}
            aria-orientation={corner ? undefined : getResizeHandleOrientation(pos)}
            aria-valuenow={corner ? undefined : valueNow}
            aria-valuemin={corner ? undefined : valueMin}
            aria-valuemax={corner ? undefined : valueMax}
            tabIndex={disabled || corner ? -1 : 0}
            onPointerDown={(e) => handlePointerDown(pos, e)}
            onKeyDown={(e) => handleKeyDown(pos, e)}
          />
        )
      })}
    </div>
  )
})

Resizable.displayName = 'Resizable'

export default Resizable
