import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import {
  createDocumentDragSession,
  getImageCompareAfterClasses,
  getImageCompareBeforeClasses,
  getImageCompareClipStyle,
  getImageCompareHandleClasses,
  getImageCompareHandleStyle,
  getImageCompareImgClasses,
  getImageCompareKeyboardPosition,
  getImageCompareKnobClasses,
  getImageCompareLabels,
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
  resolveImageCompareRtl,
  resolveImageCompareStep,
  type DocumentDragSession,
  type ImageCompareProps as CoreImageCompareProps
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'

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
      onPointerDown,
      onKeyDown,
      dir,
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

    const config = useTigerConfig()
    const labels = getImageCompareLabels(config.locale)
    const resolvedOrientation = resolveImageCompareOrientation(orientation)
    const resolvedStep = resolveImageCompareStep(step)
    const resolvedDir = typeof dir === 'string' ? dir : config.direction
    const rtl = resolveImageCompareRtl(resolvedDir)
    const [current, setCurrent] = useControlledState({
      value: controlledPosition,
      defaultValue: defaultPosition ?? 50,
      onChange,
      postState: (position) => resolveImageComparePosition(position, step)
    })
    const [dragging, setDragging] = useState(false)
    const rootRef = useRef<HTMLDivElement | null>(null)
    const handleRef = useRef<HTMLDivElement | null>(null)
    const dragSessionRef = useRef<DocumentDragSession | null>(null)
    const vertical = isImageCompareVertical(resolvedOrientation)
    const explicitAriaLabel = resolveImageCompareAriaLabel(
      typeof ariaLabelAttr === 'string' ? ariaLabelAttr : ariaLabel
    )
    const resolvedAriaLabel = ariaLabelledby
      ? explicitAriaLabel
      : (explicitAriaLabel ?? labels.ariaLabel)

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
        setCurrent(next)
      },
      [setCurrent]
    )

    const positionFromPoint = useCallback(
      (clientX: number, clientY: number): number | null => {
        const root = rootRef.current
        if (!root) return null
        return getImageComparePositionFromPointer({
          clientX,
          clientY,
          rect: root.getBoundingClientRect(),
          orientation: resolvedOrientation,
          step: resolvedStep,
          rtl
        })
      },
      [resolvedOrientation, resolvedStep, rtl]
    )

    const stopDrag = useCallback(() => {
      dragSessionRef.current?.dispose()
      dragSessionRef.current = null
      setDragging(false)
    }, [])

    useEffect(() => stopDrag, [stopDrag])

    const handlePointerDown = useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerDown?.(event)
        if (event.defaultPrevented) return
        if (disabled) return
        if (event.button !== 0) return
        if (isImageCompareInteractiveTarget(event.target, handleRef.current)) return

        event.preventDefault()
        const next = positionFromPoint(event.clientX, event.clientY)
        if (next !== null) commit(next)
        handleRef.current?.focus()
        setDragging(true)
        dragSessionRef.current?.dispose()
        dragSessionRef.current = createDocumentDragSession({
          startX: event.clientX,
          startY: event.clientY,
          ownerDocument: event.currentTarget.ownerDocument,
          pointerId: event.pointerId,
          pointerTarget: event.currentTarget,
          onMove: ({ event: moveEvent, currentX, currentY }) => {
            if (moveEvent.cancelable) moveEvent.preventDefault()
            const moved = positionFromPoint(currentX, currentY)
            if (moved !== null) commit(moved)
          },
          onEnd: () => {
            dragSessionRef.current = null
            setDragging(false)
          }
        })
      },
      [commit, disabled, onPointerDown, positionFromPoint]
    )

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) {
          onKeyDown?.(event)
          return
        }
        const next = getImageCompareKeyboardPosition(event.key, current, resolvedStep, {
          orientation: resolvedOrientation,
          rtl
        })
        if (next !== null) {
          event.preventDefault()
          commit(next)
        }
        onKeyDown?.(event)
      },
      [commit, current, disabled, onKeyDown, resolvedOrientation, resolvedStep, rtl]
    )

    return (
      <div
        {...domProps}
        ref={setRootRef}
        dir={resolvedDir}
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
            width,
            height
          }),
          ...style
        }}
        onPointerDown={handlePointerDown}>
        <div className={getImageCompareAfterClasses()} data-image-compare-after="">
          {renderPaneContent(after, afterSrc, afterAlt, fit)}
        </div>
        <div
          className={getImageCompareBeforeClasses()}
          style={getImageCompareClipStyle(current, resolvedOrientation, resolvedStep, rtl)}
          data-image-compare-before="">
          {renderPaneContent(before, beforeSrc, beforeAlt, fit)}
        </div>
        <div
          ref={handleRef}
          className={getImageCompareHandleClasses({
            orientation: resolvedOrientation,
            disabled
          })}
          style={getImageCompareHandleStyle(current, resolvedOrientation, resolvedStep, rtl)}
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
