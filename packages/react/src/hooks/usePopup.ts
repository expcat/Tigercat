import { useCallback, useRef, useState, type RefObject } from 'react'
import { useFloating, useClickOutside, useEscapeKey } from '../utils/overlay'
import type { FloatingPlacement } from '@expcat/tigercat-core'

export type PopupTrigger = 'click' | 'hover' | 'focus'

export interface UsePopupOptions {
  /**
   * Controlled visible state
   */
  visible?: boolean
  /**
   * Default visible state (uncontrolled mode)
   */
  defaultVisible?: boolean
  /**
   * Trigger type
   */
  trigger?: PopupTrigger
  /**
   * Placement relative to trigger
   */
  placement?: FloatingPlacement
  /**
   * Whether the popup is disabled
   */
  disabled?: boolean
  /**
   * Offset distance from trigger (in pixels)
   */
  offset?: number
  /**
   * Callback when visible changes
   */
  onVisibleChange?: (visible: boolean) => void
}

export interface UsePopupReturn {
  /**
   * Container element ref
   */
  containerRef: RefObject<HTMLDivElement | null>
  /**
   * Trigger element ref
   */
  triggerRef: RefObject<HTMLDivElement | null>
  /**
   * Floating element ref
   */
  floatingRef: RefObject<HTMLDivElement | null>
  /**
   * Current visible state
   */
  currentVisible: boolean
  /**
   * Set visible state
   */
  setVisible: (visible: boolean) => void
  /**
   * Floating X position
   */
  x: number | null
  /**
   * Floating Y position
   */
  y: number | null
  /**
   * Actual placement after flip
   */
  actualPlacement: FloatingPlacement
  /**
   * Trigger event handlers
   */
  triggerHandlers: {
    onClick: () => void
    onMouseEnter: () => void
    onMouseLeave: () => void
    onFocus: () => void
    onBlur: () => void
  }
}

/**
 * Shared hook for popup components (Tooltip, Popover, etc.)
 * Handles visible state, floating positioning, and trigger events
 */
export function usePopup(options: UsePopupOptions): UsePopupReturn {
  const {
    visible,
    defaultVisible = false,
    trigger = 'click',
    placement = 'top',
    disabled = false,
    offset = 8,
    onVisibleChange
  } = options

  const isControlled = visible !== undefined
  const [internalVisible, setInternalVisible] = useState(defaultVisible)
  const currentVisible = isControlled ? visible : internalVisible

  // Element refs
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)

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

  // Handle visibility change
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

  // Trigger event handlers
  const triggerHandlers = {
    onClick: () => {
      if (disabled || trigger !== 'click') return
      setVisible(!currentVisible)
    },
    onMouseEnter: () => {
      if (disabled || trigger !== 'hover') return
      setVisible(true)
    },
    onMouseLeave: () => {
      if (disabled || trigger !== 'hover') return
      setVisible(false)
    },
    onFocus: () => {
      if (disabled || trigger !== 'focus') return
      setVisible(true)
    },
    onBlur: () => {
      if (disabled || trigger !== 'focus') return
      setVisible(false)
    }
  }

  return {
    containerRef,
    triggerRef,
    floatingRef,
    currentVisible,
    setVisible,
    x,
    y,
    actualPlacement,
    triggerHandlers
  }
}
