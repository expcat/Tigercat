import React, { createContext, useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  classNames,
  getDropdownContainerClasses,
  getDropdownTriggerClasses,
  getTransformOrigin,
  type DropdownProps as CoreDropdownProps,
  type FloatingPlacement
} from '@expcat/tigercat-core'
import { DropdownMenu } from './DropdownMenu'
import { useClickOutside, useEscapeKey, useFloating } from '../utils/overlay'

// Dropdown context interface
export interface DropdownContextValue {
  closeOnClick: boolean
  handleItemClick: () => void
}

// Create dropdown context
export const DropdownContext = createContext<DropdownContextValue | null>(null)

export interface DropdownProps
  extends
    Omit<CoreDropdownProps, 'style' | 'placement'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: React.CSSProperties

  /**
   * Dropdown placement relative to trigger
   * @default 'bottom-start'
   */
  placement?: FloatingPlacement

  /**
   * Offset distance from trigger element
   * @default 4
   */
  offset?: number

  /**
   * Visibility change event handler
   */
  onVisibleChange?: (visible: boolean) => void

  /**
   * Dropdown content (trigger and menu)
   */
  children?: React.ReactNode
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger = 'hover',
  placement: initialPlacement = 'bottom-start',
  offset = 4,
  disabled = false,
  visible: controlledVisible,
  defaultVisible = false,
  closeOnClick = true,
  className,
  style,
  onVisibleChange,
  children,
  onKeyDown,
  ...divProps
}) => {
  // Internal state for uncontrolled mode
  const [internalVisible, setInternalVisible] = useState(defaultVisible)

  // Use controlled or uncontrolled state
  const visible = controlledVisible !== undefined ? controlledVisible : internalVisible

  // Refs for Floating UI positioning
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Handle visibility change
  const setVisible = useCallback(
    (newVisible: boolean) => {
      if (disabled && newVisible) return

      // Update internal state if uncontrolled
      if (controlledVisible === undefined) {
        setInternalVisible(newVisible)
      }

      // Call event handler
      onVisibleChange?.(newVisible)
    },
    [disabled, controlledVisible, onVisibleChange]
  )

  // Handle item click (close dropdown)
  const handleItemClick = useCallback(() => {
    if (closeOnClick) {
      setVisible(false)
    }
  }, [closeOnClick, setVisible])

  // Handle mouse enter (for hover trigger)
  const handleMouseEnter = useCallback(() => {
    if (trigger !== 'hover') return

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }

    hoverTimerRef.current = setTimeout(() => {
      setVisible(true)
    }, 100)
  }, [trigger, setVisible])

  // Handle mouse leave (for hover trigger)
  const handleMouseLeave = useCallback(() => {
    if (trigger !== 'hover') return

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }

    hoverTimerRef.current = setTimeout(() => {
      setVisible(false)
    }, 150)
  }, [trigger, setVisible])

  // Handle click (for click trigger)
  const handleClick = useCallback(() => {
    if (trigger !== 'click') return
    setVisible(!visible)
  }, [trigger, visible, setVisible])

  // Handle outside click to close dropdown
  useClickOutside({
    enabled: trigger === 'click' && visible,
    refs: [containerRef],
    onOutsideClick: () => setVisible(false)
  })

  useEscapeKey({
    enabled: visible,
    onEscape: () => setVisible(false)
  })

  // Floating UI positioning
  const { x, y, placement } = useFloating({
    referenceRef: triggerRef,
    floatingRef,
    enabled: visible,
    placement: initialPlacement,
    offset
  })

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }
    }
  }, [])

  const containerClasses = classNames(
    getDropdownContainerClasses(),
    'tiger-dropdown-container',
    className
  )

  const triggerClasses = getDropdownTriggerClasses(disabled)

  const menuWrapperClasses = 'absolute z-50'

  const menuWrapperStyles = useMemo<React.CSSProperties>(
    () => ({
      position: 'absolute',
      left: x,
      top: y,
      transformOrigin: getTransformOrigin(placement)
    }),
    [x, y, placement]
  )

  const contextValue: DropdownContextValue = {
    closeOnClick,
    handleItemClick
  }

  // Parse children to find trigger and menu
  const childrenArray = React.Children.toArray(children)
  let triggerElement: React.ReactNode = null
  let menuElement: React.ReactNode = null

  childrenArray.forEach((child) => {
    if (!React.isValidElement(child)) {
      if (triggerElement == null) triggerElement = child
      return
    }

    if (child.type === DropdownMenu) {
      menuElement = child
      return
    }

    if (triggerElement == null) {
      triggerElement = child
    }
  })

  const handleContainerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
  }

  return (
    <DropdownContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={containerClasses}
        style={style}
        onKeyDown={handleContainerKeyDown}
        {...divProps}>
        {/* Trigger element */}
        <div
          ref={triggerRef}
          className={triggerClasses}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-haspopup="menu"
          aria-expanded={visible}>
          {triggerElement}
        </div>

        {/* Dropdown menu with Floating UI positioning */}
        <div
          ref={floatingRef}
          className={menuWrapperClasses}
          style={menuWrapperStyles}
          hidden={!visible}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          {menuElement}
        </div>
      </div>
    </DropdownContext.Provider>
  )
}
