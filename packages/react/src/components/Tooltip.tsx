import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useFloating, useClickOutside, useEscapeKey } from '../utils/overlay'
import {
  classNames,
  getTooltipContainerClasses,
  getTooltipTriggerClasses,
  getTooltipContentClasses,
  getTransformOrigin,
  type TooltipProps as CoreTooltipProps,
  type FloatingPlacement
} from '@expcat/tigercat-core'

let tooltipIdCounter = 0

const createTooltipId = () => `tiger-tooltip-${++tooltipIdCounter}`

export type TooltipProps = Omit<CoreTooltipProps, 'content' | 'placement'> &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style' | 'content'> & {
    children?: React.ReactNode
    content?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    /**
     * Tooltip placement relative to trigger
     * @default 'top'
     */
    placement?: FloatingPlacement
    /**
     * Offset distance from trigger (in pixels)
     * @default 8
     */
    offset?: number
    onVisibleChange?: (visible: boolean) => void
  }

export const Tooltip: React.FC<TooltipProps> = ({
  visible,
  defaultVisible = false,
  content,
  trigger = 'hover',
  placement = 'top',
  disabled = false,
  offset = 8,
  className,
  style,
  children,
  onVisibleChange,
  ...divProps
}) => {
  const isControlled = visible !== undefined
  const [internalVisible, setInternalVisible] = useState(defaultVisible)
  const currentVisible = isControlled ? visible : internalVisible

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)
  const tooltipIdRef = useRef<string | null>(null)

  if (!tooltipIdRef.current) {
    tooltipIdRef.current = createTooltipId()
  }

  const tooltipId = tooltipIdRef.current
  const describedBy = content != null ? tooltipId : undefined

  // Floating UI positioning
  const {
    x,
    y,
    placement: actualPlacement
  } = useFloating({
    referenceRef: triggerRef,
    floatingRef,
    enabled: currentVisible,
    placement,
    offset
  })

  const setVisible = useCallback(
    (newVisible: boolean) => {
      if (disabled && newVisible) return
      if (!isControlled) setInternalVisible(newVisible)
      onVisibleChange?.(newVisible)
    },
    [disabled, isControlled, onVisibleChange]
  )

  const handleTriggerClick = useCallback(() => {
    if (!disabled && trigger === 'click') setVisible(!currentVisible)
  }, [disabled, trigger, currentVisible, setVisible])

  const handleMouseEnter = useCallback(() => {
    if (!disabled && trigger === 'hover') setVisible(true)
  }, [disabled, trigger, setVisible])

  const handleMouseLeave = useCallback(() => {
    if (!disabled && trigger === 'hover') setVisible(false)
  }, [disabled, trigger, setVisible])

  const handleFocus = useCallback(() => {
    if (!disabled && trigger === 'focus') setVisible(true)
  }, [disabled, trigger, setVisible])

  const handleBlur = useCallback(() => {
    if (!disabled && trigger === 'focus') setVisible(false)
  }, [disabled, trigger, setVisible])

  // Click outside handler (only for click trigger)
  useClickOutside({
    enabled: currentVisible && trigger === 'click',
    refs: [containerRef],
    onOutsideClick: () => setVisible(false),
    defer: true
  })

  // Escape key handler (all non-manual triggers)
  useEscapeKey({
    enabled: currentVisible && trigger !== 'manual',
    onEscape: () => setVisible(false)
  })

  // Memoized classes
  const containerClasses = useMemo(
    () => classNames(getTooltipContainerClasses(), className),
    [className]
  )
  const triggerClasses = useMemo(() => getTooltipTriggerClasses(disabled), [disabled])
  const contentClasses = useMemo(() => getTooltipContentClasses(), [])

  const floatingStyles = useMemo<React.CSSProperties>(
    () => ({
      position: 'absolute',
      left: x,
      top: y,
      transformOrigin: getTransformOrigin(actualPlacement),
      zIndex: 1000
    }),
    [x, y, actualPlacement]
  )

  const triggerHandlers = useMemo<React.DOMAttributes<HTMLDivElement>>(() => {
    if (trigger === 'click') return { onClick: handleTriggerClick }
    if (trigger === 'hover') return { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }
    if (trigger === 'focus') return { onFocus: handleFocus, onBlur: handleBlur }
    return {}
  }, [trigger, handleTriggerClick, handleMouseEnter, handleMouseLeave, handleFocus, handleBlur])

  if (!children) return null

  return (
    <div ref={containerRef} className={containerClasses} style={style} {...divProps}>
      <div
        ref={triggerRef}
        className={triggerClasses}
        aria-describedby={describedBy}
        {...triggerHandlers}>
        {children}
      </div>

      {currentVisible && (
        <div ref={floatingRef} style={floatingStyles} aria-hidden={false}>
          <div id={tooltipId} role="tooltip" className={contentClasses}>
            {content}
          </div>
        </div>
      )}
    </div>
  )
}
