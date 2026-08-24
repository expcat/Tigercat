import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import {
  getImageCompareAfterClasses,
  getImageCompareBeforeClasses,
  getImageCompareClipStyle,
  getImageCompareHandleClasses,
  getImageCompareHandleStyle,
  getImageCompareImgClasses,
  getImageCompareKeyboardPosition,
  getImageCompareKnobClasses,
  getImageCompareLineClasses,
  getImageComparePointerClientPoint,
  getImageComparePositionFromPointer,
  getImageCompareRootClasses,
  getImageCompareRootStyle,
  isImageCompareInteractiveTarget,
  isImageCompareVertical,
  resolveImageCompareAriaLabel,
  resolveImageCompareFit,
  resolveImageCompareOrientation,
  resolveImageComparePosition,
  resolveImageCompareStep,
  type ImageCompareProps as CoreImageCompareProps
} from '@expcat/tigercat-core'

export interface ImageCompareProps
  extends
    Omit<CoreImageCompareProps, 'style'>,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CoreImageCompareProps | 'onChange'> {
  /** Before pane content. Takes precedence over `beforeSrc`. */
  before?: React.ReactNode
  /** After pane content. Takes precedence over `afterSrc`. */
  after?: React.ReactNode
  style?: React.CSSProperties
  /** Called when the handle position changes */
  onChange?: (position: number) => void
}

function renderPaneContent(
  slot: React.ReactNode,
  src: string | undefined,
  alt: string,
  fit: CoreImageCompareProps['fit']
): React.ReactNode {
  if (slot != null) return slot
  if (!src) return null
  return (
    <img
      src={src}
      alt={alt}
      className={getImageCompareImgClasses(resolveImageCompareFit(fit))}
      draggable={false}
    />
  )
}

export const ImageCompare = forwardRef<HTMLDivElement, ImageCompareProps>(
  (
    {
      beforeSrc,
      afterSrc,
      beforeAlt = '',
      afterAlt = '',
      fit,
      position: controlledPosition,
      defaultPosition,
      orientation,
      step,
      disabled = false,
      width,
      height,
      ariaLabel,
      className,
      style,
      before,
      after,
      onChange,
      onMouseDown,
      onTouchStart,
      onKeyDown,
      ...rest
    },
    ref
  ) => {
    const {
      'aria-label': ariaLabelAttr,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      ...domProps
    } = rest

    const resolvedOrientation = resolveImageCompareOrientation(orientation)
    const resolvedStep = resolveImageCompareStep(step)
    const [uncontrolledPosition, setUncontrolledPosition] = useState(() =>
      resolveImageComparePosition(controlledPosition ?? defaultPosition, step)
    )
    const [dragging, setDragging] = useState(false)
    const rootRef = useRef<HTMLDivElement | null>(null)
    const handleRef = useRef<HTMLDivElement | null>(null)
    const draggingRef = useRef(false)

    const isControlled = controlledPosition !== undefined
    const current = resolveImageComparePosition(
      isControlled ? controlledPosition : uncontrolledPosition,
      step
    )
    const vertical = isImageCompareVertical(resolvedOrientation)
    const resolvedAriaLabel = resolveImageCompareAriaLabel(
      typeof ariaLabelAttr === 'string' ? ariaLabelAttr : ariaLabel
    )

    const setRootRef = useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref]
    )

    const commit = useCallback(
      (next: number) => {
        const resolved = resolveImageComparePosition(next, step)
        if (!isControlled) setUncontrolledPosition(resolved)
        onChange?.(resolved)
      },
      [isControlled, onChange, step]
    )

    const positionFromEvent = useCallback(
      (event: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent): number | null => {
        const root = rootRef.current
        const source = 'nativeEvent' in event ? event.nativeEvent : event
        const point = getImageComparePointerClientPoint(source)
        if (!root || !point) return null
        return getImageComparePositionFromPointer({
          clientX: point.clientX,
          clientY: point.clientY,
          rect: root.getBoundingClientRect(),
          orientation: resolvedOrientation,
          step: resolvedStep
        })
      },
      [resolvedOrientation, resolvedStep]
    )

    const handleMove = useCallback(
      (event: MouseEvent | TouchEvent) => {
        if (disabled || !draggingRef.current) return
        const next = positionFromEvent(event)
        if (next === null) return
        commit(next)
      },
      [commit, disabled, positionFromEvent]
    )

    const handleEnd = useCallback(() => {
      draggingRef.current = false
      setDragging(false)
    }, [])

    useEffect(() => {
      if (!dragging) return

      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleEnd)
      document.addEventListener('touchmove', handleMove)
      document.addEventListener('touchend', handleEnd)

      return () => {
        document.removeEventListener('mousemove', handleMove)
        document.removeEventListener('mouseup', handleEnd)
        document.removeEventListener('touchmove', handleMove)
        document.removeEventListener('touchend', handleEnd)
      }
    }, [dragging, handleEnd, handleMove])

    const startDrag = useCallback(
      (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (disabled) return
        if ('button' in event && event.button !== 0) return
        if (isImageCompareInteractiveTarget(event.target, handleRef.current)) return

        event.preventDefault()
        draggingRef.current = true
        setDragging(true)
        const next = positionFromEvent(event)
        if (next !== null) commit(next)
        handleRef.current?.focus()
      },
      [commit, disabled, positionFromEvent]
    )

    const handleMouseDown = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        startDrag(event)
        onMouseDown?.(event)
      },
      [onMouseDown, startDrag]
    )

    const handleTouchStart = useCallback(
      (event: React.TouchEvent<HTMLDivElement>) => {
        startDrag(event)
        onTouchStart?.(event)
      },
      [onTouchStart, startDrag]
    )

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) {
          onKeyDown?.(event)
          return
        }
        const next = getImageCompareKeyboardPosition(event.key, current, resolvedStep)
        if (next !== null) {
          event.preventDefault()
          commit(next)
        }
        onKeyDown?.(event)
      },
      [commit, current, disabled, onKeyDown, resolvedStep]
    )

    return (
      <div
        {...domProps}
        ref={setRootRef}
        data-image-compare=""
        data-image-compare-orientation={resolvedOrientation}
        data-image-compare-position={String(current)}
        data-image-compare-disabled={disabled ? 'true' : 'false'}
        data-image-compare-dragging={dragging ? 'true' : 'false'}
        className={getImageCompareRootClasses({
          orientation: resolvedOrientation,
          disabled,
          className
        })}
        style={{
          ...getImageCompareRootStyle({
            position: current,
            step: resolvedStep,
            width,
            height
          }),
          ...style
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}>
        <div className={getImageCompareAfterClasses()} data-image-compare-after="">
          {renderPaneContent(after, afterSrc, afterAlt, fit)}
        </div>
        <div
          className={getImageCompareBeforeClasses()}
          style={getImageCompareClipStyle(current, resolvedOrientation, resolvedStep)}
          data-image-compare-before="">
          {renderPaneContent(before, beforeSrc, beforeAlt, fit)}
        </div>
        <div
          ref={handleRef}
          className={getImageCompareHandleClasses({
            orientation: resolvedOrientation,
            disabled
          })}
          style={getImageCompareHandleStyle(current, resolvedOrientation, resolvedStep)}
          data-image-compare-handle=""
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={resolvedAriaLabel}
          aria-labelledby={ariaLabelledby}
          aria-describedby={ariaDescribedby}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={current}
          aria-valuetext={`${current}%`}
          aria-orientation={vertical ? 'vertical' : 'horizontal'}
          aria-disabled={disabled}
          onKeyDown={handleKeyDown}>
          <div
            className={getImageCompareLineClasses(resolvedOrientation)}
            data-image-compare-line=""
            aria-hidden="true"
          />
          <div
            className={getImageCompareKnobClasses()}
            data-image-compare-knob=""
            aria-hidden="true"
          />
        </div>
      </div>
    )
  }
)
ImageCompare.displayName = 'ImageCompare'

export default ImageCompare
