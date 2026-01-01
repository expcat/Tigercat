import React, { useEffect, useMemo, useCallback, useState, useRef } from 'react'
import {
  classNames,
  getTooltipContainerClasses,
  getTooltipTriggerClasses,
  getTooltipContentClasses,
  getDropdownMenuWrapperClasses,
  type TooltipProps as CoreTooltipProps,
  type TooltipTrigger,
} from '@tigercat/core'

export interface TooltipProps extends CoreTooltipProps {
  /**
   * The element to trigger the tooltip
   */
  children?: React.ReactNode
  
  /**
   * Custom content (alternative to content prop)
   */
  contentContent?: React.ReactNode
  
  /**
   * Callback when visibility changes
   */
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
  children,
  contentContent,
  onVisibleChange,
}) => {
  // Internal state for uncontrolled mode
  const [internalVisible, setInternalVisible] = useState(defaultVisible)
  
  // Computed visible state (controlled or uncontrolled)
  const currentVisible = visible !== undefined ? visible : internalVisible
  
  // Ref to the container element
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Ref to the trigger element
  const triggerRef = useRef<HTMLDivElement>(null)

  // Handle visibility change
  const setVisible = useCallback(
    (newVisible: boolean) => {
      if (disabled) return

      // Update internal state if uncontrolled
      if (visible === undefined) {
        setInternalVisible(newVisible)
      }

      // Notify parent
      if (onVisibleChange) {
        onVisibleChange(newVisible)
      }
    },
    [disabled, visible, onVisibleChange]
  )

  // Handle trigger click
  const handleTriggerClick = useCallback(() => {
    if (disabled || trigger !== 'click') return
    setVisible(!currentVisible)
  }, [disabled, trigger, currentVisible, setVisible])

  // Handle trigger mouse enter
  const handleTriggerMouseEnter = useCallback(() => {
    if (disabled || trigger !== 'hover') return
    setVisible(true)
  }, [disabled, trigger, setVisible])

  // Handle trigger mouse leave
  const handleTriggerMouseLeave = useCallback(() => {
    if (disabled || trigger !== 'hover') return
    setVisible(false)
  }, [disabled, trigger, setVisible])

  // Handle trigger focus
  const handleTriggerFocus = useCallback(() => {
    if (disabled || trigger !== 'focus') return
    setVisible(true)
  }, [disabled, trigger, setVisible])

  // Handle trigger blur
  const handleTriggerBlur = useCallback(() => {
    if (disabled || trigger !== 'focus') return
    setVisible(false)
  }, [disabled, trigger, setVisible])

  // Handle outside click to close tooltip (only for click trigger)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      if (containerRef.current && !containerRef.current.contains(target)) {
        // Close by calling onVisibleChange if in controlled mode, or update internal state
        if (visible !== undefined && onVisibleChange) {
          onVisibleChange(false)
        } else {
          setInternalVisible(false)
        }
      }
    }

    if (currentVisible && trigger === 'click') {
      // Use setTimeout to avoid immediate triggering on the same click that opened it
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 0)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [currentVisible, trigger, visible, onVisibleChange])

  // Container classes
  const containerClasses = useMemo(
    () => classNames(getTooltipContainerClasses(), className),
    [className]
  )

  // Trigger classes
  const triggerClasses = useMemo(
    () => getTooltipTriggerClasses(disabled),
    [disabled]
  )

  // Content wrapper classes
  const contentWrapperClasses = useMemo(
    () => getDropdownMenuWrapperClasses(currentVisible, placement),
    [currentVisible, placement]
  )

  // Content classes
  const contentClasses = useMemo(
    () => getTooltipContentClasses(),
    []
  )

  // Build trigger event handlers
  const triggerHandlers = useMemo(() => {
    const handlers: React.DOMAttributes<HTMLDivElement> = {}
    
    if (trigger === 'click') {
      handlers.onClick = handleTriggerClick
    } else if (trigger === 'hover') {
      handlers.onMouseEnter = handleTriggerMouseEnter
      handlers.onMouseLeave = handleTriggerMouseLeave
    } else if (trigger === 'focus') {
      handlers.onFocus = handleTriggerFocus
      handlers.onBlur = handleTriggerBlur
    }
    
    return handlers
  }, [
    trigger,
    handleTriggerClick,
    handleTriggerMouseEnter,
    handleTriggerMouseLeave,
    handleTriggerFocus,
    handleTriggerBlur,
  ])

  if (!children) {
    return null
  }

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Trigger */}
      <div ref={triggerRef} className={triggerClasses} {...triggerHandlers}>
        {children}
      </div>

      {/* Tooltip content */}
      <div className={contentWrapperClasses}>
        <div className={contentClasses}>
          {contentContent || content}
        </div>
      </div>
    </div>
  )
}
