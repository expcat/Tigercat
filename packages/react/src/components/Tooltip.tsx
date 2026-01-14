import React, { useEffect, useCallback, useRef, useState } from 'react'
import {
  classNames,
  getTooltipContainerClasses,
  getTooltipTriggerClasses,
  getTooltipContentClasses,
  getDropdownMenuWrapperClasses,
  type TooltipProps as CoreTooltipProps
} from '@tigercat/core'

let tooltipIdCounter = 0

const createTooltipId = () => `tiger-tooltip-${++tooltipIdCounter}`

export type TooltipProps = Omit<CoreTooltipProps, 'content' | 'style'> &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style' | 'content'> & {
    children?: React.ReactNode
    content?: React.ReactNode
    /** @deprecated Use `content` (supports ReactNode). */
    contentContent?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    onVisibleChange?: (visible: boolean) => void
  }

export const Tooltip: React.FC<TooltipProps> = ({
  visible,
  defaultVisible = false,
  content,
  trigger = 'hover',
  placement = 'top',
  disabled = false,
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
  const tooltipIdRef = useRef<string | null>(null)

  if (!tooltipIdRef.current) {
    tooltipIdRef.current = createTooltipId()
  }

  const tooltipId = tooltipIdRef.current
  const tooltipContent = contentContent ?? content
  const describedBy = tooltipContent != null ? tooltipId : undefined

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

  // Handle outside click to close tooltip (only for click trigger)
  useEffect(() => {
    if (!currentVisible || trigger !== 'click') return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target
      if (!target) return
      if (containerRef.current?.contains(target as Node)) return
      setVisible(false)
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [currentVisible, trigger, setVisible])

  useEffect(() => {
    if (!currentVisible) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setVisible(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentVisible, setVisible])

  const containerClasses = classNames(getTooltipContainerClasses(), className)
  const triggerClasses = getTooltipTriggerClasses(disabled)
  const contentWrapperClasses = getDropdownMenuWrapperClasses(currentVisible, placement)
  const contentClasses = getTooltipContentClasses()

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
      <div className={triggerClasses} aria-describedby={describedBy} {...triggerHandlers}>
        {children}
      </div>

      <div className={contentWrapperClasses} hidden={!currentVisible} aria-hidden={!currentVisible}>
        <div id={tooltipId} role="tooltip" className={contentClasses}>
          {tooltipContent}
        </div>
      </div>
    </div>
  )
}
