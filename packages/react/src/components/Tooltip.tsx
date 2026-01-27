import React, { useCallback, useRef, useState } from 'react'
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

export type TooltipProps = Omit<CoreTooltipProps, 'content' | 'style' | 'placement'> &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style' | 'content'> & {
    children?: React.ReactNode
    content?: React.ReactNode
    /** @deprecated Use `content` (supports ReactNode). */
    contentContent?: React.ReactNode
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
  contentContent,
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
  const tooltipContent = contentContent ?? content
  const describedBy = tooltipContent != null ? tooltipId : undefined

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

      if (!isControlled) {
        setInternalVisible(newVisible)
      }

      onVisibleChange?.(newVisible)
    },
    [disabled, isControlled, onVisibleChange]
  )

  const handleTriggerClick = () => {
    if (disabled || trigger !== 'click') return
    setVisible(!currentVisible)
  }

  const handleTriggerMouseEnter = () => {
    if (disabled || trigger !== 'hover') return
    setVisible(true)
  }

  const handleTriggerMouseLeave = () => {
    if (disabled || trigger !== 'hover') return
    setVisible(false)
  }

  const handleTriggerFocus = () => {
    if (disabled || trigger !== 'focus') return
    setVisible(true)
  }

  const handleTriggerBlur = () => {
    if (disabled || trigger !== 'focus') return
    setVisible(false)
  }

  // Click outside handler (only for click trigger)
  useClickOutside({
    enabled: currentVisible && trigger === 'click',
    refs: [containerRef],
    onOutsideClick: () => setVisible(false),
    defer: true
  })

  // Escape key handler
  useEscapeKey({
    enabled: currentVisible,
    onEscape: () => setVisible(false)
  })

  const containerClasses = classNames(getTooltipContainerClasses(), className)
  const triggerClasses = getTooltipTriggerClasses(disabled)
  const contentClasses = getTooltipContentClasses()

  const floatingStyles: React.CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    transformOrigin: getTransformOrigin(actualPlacement),
    zIndex: 1000
  }

  const triggerHandlers: React.DOMAttributes<HTMLDivElement> = {}
  if (trigger === 'click') {
    triggerHandlers.onClick = handleTriggerClick
  } else if (trigger === 'hover') {
    triggerHandlers.onMouseEnter = handleTriggerMouseEnter
    triggerHandlers.onMouseLeave = handleTriggerMouseLeave
  } else if (trigger === 'focus') {
    triggerHandlers.onFocus = handleTriggerFocus
    triggerHandlers.onBlur = handleTriggerBlur
  }

  if (!children) {
    return null
  }

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
            {tooltipContent}
          </div>
        </div>
      )}
    </div>
  )
}
