import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useId
} from 'react'
import {
  classNames,
  getDropdownContainerClasses,
  getDropdownTriggerClasses,
  getDropdownChevronClasses,
  getDropdownMenuClasses,
  getDropdownItemClasses,
  injectDropdownStyles,
  DROPDOWN_CHEVRON_PATH,
  DROPDOWN_ENTER_CLASS,
  handleMenuNavigation,
  focusFirstMenuItem,
  captureActiveElement,
  restoreFocus,
  type DropdownProps as CoreDropdownProps,
  type DropdownMenuProps as CoreDropdownMenuProps,
  type DropdownItemProps as CoreDropdownItemProps,
  type FloatingPlacement
} from '@expcat/tigercat-core'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'

// Dropdown context interface
export interface DropdownContextValue {
  closeOnClick: boolean
  handleItemClick: () => void
}

// Create dropdown context
export const DropdownContext = createContext<DropdownContextValue | null>(null)

// --- DropdownMenu (child component) ---

export interface DropdownMenuProps
  extends
    Omit<CoreDropdownMenuProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: React.CSSProperties

  /**
   * Menu content
   */
  children?: React.ReactNode
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  className,
  style,
  children,
  role,
  ...divProps
}) => {
  const menuClasses = classNames(getDropdownMenuClasses(), className)

  return (
    <div className={menuClasses} style={style} role={role ?? 'menu'} {...divProps}>
      {children}
    </div>
  )
}

// --- DropdownItem (child component) ---

export interface DropdownItemProps
  extends
    Omit<CoreDropdownItemProps, 'className'>,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled'> {
  className?: string

  /**
   * Click event handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void

  /**
   * Item content
   */
  children?: React.ReactNode
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  disabled = false,
  divided = false,
  className,
  onClick,
  children,
  ...buttonProps
}) => {
  const context = useContext(DropdownContext)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault()
      return
    }

    onClick?.(event)

    if (context?.closeOnClick) {
      context.handleItemClick()
    }
  }

  const itemClasses = classNames(getDropdownItemClasses(disabled, divided), className)

  return (
    <button
      type="button"
      className={itemClasses}
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={handleClick}
      {...buttonProps}>
      {children}
    </button>
  )
}

// --- Dropdown (parent component) ---

export interface DropdownProps
  extends Omit<CoreDropdownProps, 'style'>, Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: React.CSSProperties
  placement?: FloatingPlacement
  offset?: number
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
  /**
   * Render the trigger from open state. Receives `{ open }` so the trigger can
   * be styled/rendered by open state without attribute selectors. When given,
   * `children` only needs to provide the `DropdownMenu`. (Named `renderTrigger`
   * because `trigger` already configures the open event.)
   */
  renderTrigger?: (state: { open: boolean }) => React.ReactNode
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger = 'hover',
  placement: initialPlacement = 'bottom-start',
  offset = 4,
  disabled = false,
  open: controlledOpen,
  defaultOpen = false,
  closeOnClick = true,
  showArrow = true,
  portal = true,
  className,
  style,
  onOpenChange,
  children,
  renderTrigger,
  ...divProps
}) => {
  // Internal state for uncontrolled mode
  const [internalVisible, setInternalVisible] = useState(defaultOpen)

  // Use controlled or uncontrolled state
  const visible = controlledOpen !== undefined ? controlledOpen : internalVisible

  // Refs for Floating UI positioning
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  // Unique menu ID for aria-controls
  const reactId = useId()
  const menuId = useMemo(() => `tiger-dropdown-menu-${reactId}`, [reactId])

  // Inject animation styles once
  useEffect(() => {
    injectDropdownStyles()
  }, [])

  // Handle visibility change
  const setVisible = useCallback(
    (newVisible: boolean) => {
      if (disabled && newVisible) return

      // Capture focus before opening
      if (newVisible && !visible) {
        previousActiveElementRef.current = captureActiveElement()
      }

      // Update internal state if uncontrolled
      if (controlledOpen === undefined) {
        setInternalVisible(newVisible)
      }

      // Call event handler
      onOpenChange?.(newVisible)

      // Focus management
      if (newVisible) {
        // Use rAF to wait for menu to render
        requestAnimationFrame(() => {
          if (floatingRef.current) {
            focusFirstMenuItem(floatingRef.current)
          }
        })
      } else {
        restoreFocus(previousActiveElementRef.current)
        previousActiveElementRef.current = null
      }
    },
    [disabled, visible, controlledOpen, onOpenChange]
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

  // Handle keyboard navigation within menu
  const handleMenuKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (floatingRef.current) {
      handleMenuNavigation(floatingRef.current, event.nativeEvent)
    }
  }, [])

  const overlay = useAnchoredOverlay({
    referenceRef: triggerRef,
    floatingRef,
    enabled: visible,
    placement: initialPlacement,
    offset,
    portal,
    containerRef,
    dismissOnOutside: trigger === 'click',
    dismissOnEscape: true,
    onDismiss: () => setVisible(false)
  })

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }
    }
  }, [])

  const containerClasses = useMemo(
    () => classNames(getDropdownContainerClasses(), 'tiger-dropdown-container', className),
    [className]
  )

  const triggerClasses = useMemo(() => getDropdownTriggerClasses(disabled), [disabled])

  const menuWrapperClasses = classNames(overlay.floatingClasses, DROPDOWN_ENTER_CLASS)
  const menuWrapperStyles = overlay.floatingStyles

  const contextValue = useMemo<DropdownContextValue>(
    () => ({ closeOnClick, handleItemClick }),
    [closeOnClick, handleItemClick]
  )

  // Parse children to find trigger and menu. When `renderTrigger` is given it
  // supplies the trigger (receiving open state) and children only carry the menu.
  const childrenArray = React.Children.toArray(children)
  let triggerElement: React.ReactNode = renderTrigger ? renderTrigger({ open: visible }) : null
  let menuElement: React.ReactNode = null

  childrenArray.forEach((child) => {
    if (!React.isValidElement(child)) {
      if (!renderTrigger && triggerElement == null) triggerElement = child
      return
    }

    if (child.type === DropdownMenu) {
      menuElement = child
      return
    }

    if (!renderTrigger && triggerElement == null) {
      triggerElement = child
    }
  })

  const chevronNode = showArrow ? (
    <svg
      className={getDropdownChevronClasses(visible)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <path d={DROPDOWN_CHEVRON_PATH} />
    </svg>
  ) : null

  const menuWrapperNode = (
    <div
      ref={floatingRef}
      className={menuWrapperClasses}
      style={menuWrapperStyles}
      data-positioned={overlay.positioned}
      hidden={!visible}
      data-tiger-dropdown-menu=""
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleMenuKeyDown}>
      {menuElement && React.isValidElement(menuElement)
        ? React.cloneElement(menuElement as React.ReactElement<Record<string, unknown>>, {
            id: menuId
          })
        : menuElement}
    </div>
  )

  return (
    <DropdownContext.Provider value={contextValue}>
      <div ref={containerRef} className={containerClasses} style={style} {...divProps}>
        <div
          ref={triggerRef}
          className={triggerClasses}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-haspopup="menu"
          aria-expanded={visible}
          aria-controls={visible ? menuId : undefined}
          data-state={visible ? 'open' : 'closed'}>
          {triggerElement}
          {chevronNode}
        </div>
        {renderOverlayPortal(menuWrapperNode, overlay.target, !portal)}
      </div>
    </DropdownContext.Provider>
  )
}
