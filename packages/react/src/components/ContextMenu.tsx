import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useMemo,
  useId
} from 'react'
import {
  classNames,
  getContextMenuContainerClasses,
  getContextMenuTriggerClasses,
  getContextMenuMenuClasses,
  getContextMenuItemClasses,
  getContextMenuSubTriggerClasses,
  getContextMenuSubChevronClasses,
  getContextMenuPointStyle,
  getContextMenuOpenPoint,
  injectContextMenuStyles,
  CONTEXT_MENU_ENTER_CLASS,
  CONTEXT_MENU_SUB_CHEVRON_PATH,
  isContextMenuKeyboardEvent,
  handleMenuNavigation,
  focusFirstMenuItem,
  captureActiveElement,
  restoreFocus,
  type ContextMenuPoint,
  type ContextMenuProps as CoreContextMenuProps,
  type ContextMenuMenuProps as CoreContextMenuMenuProps,
  type ContextMenuItemProps as CoreContextMenuItemProps,
  type ContextMenuSubProps as CoreContextMenuSubProps,
  type FloatingPlacement
} from '@expcat/tigercat-core'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'

export interface ContextMenuContextValue {
  closeOnClick: boolean
  handleItemClick: () => void
  portal: boolean
  open: boolean
}

export const ContextMenuContext = createContext<ContextMenuContextValue | null>(null)

export interface ContextMenuMenuProps
  extends
    Omit<CoreContextMenuMenuProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const ContextMenuMenu: React.FC<ContextMenuMenuProps> = ({
  className,
  style,
  children,
  role,
  ...divProps
}) => {
  const menuClasses = classNames(getContextMenuMenuClasses(), className)

  return (
    <div className={menuClasses} style={style} role={role ?? 'menu'} {...divProps}>
      {children}
    </div>
  )
}

export interface ContextMenuItemProps
  extends
    Omit<CoreContextMenuItemProps, 'className' | 'key'>,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled'> {
  className?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  children?: React.ReactNode
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
  disabled = false,
  divided = false,
  className,
  onClick,
  children,
  ...buttonProps
}) => {
  const context = useContext(ContextMenuContext)

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

  const itemClasses = classNames(getContextMenuItemClasses(disabled, divided), className)

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

export interface ContextMenuSubProps extends Omit<CoreContextMenuSubProps, 'className'> {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const ContextMenuSub: React.FC<ContextMenuSubProps> = ({
  title = '',
  disabled = false,
  className,
  style,
  children
}) => {
  const context = useContext(ContextMenuContext)
  const [isHovered, setIsHovered] = useState(false)
  const [isOpenByKeyboard, setIsOpenByKeyboard] = useState(false)
  const popupCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleRef = useRef<HTMLButtonElement | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)

  const isExpanded = isHovered || isOpenByKeyboard
  const portalEnabled = Boolean(context?.portal)

  const overlay = useAnchoredOverlay({
    referenceRef: titleRef,
    floatingRef: popupRef,
    enabled: Boolean(context) && isExpanded && !disabled,
    placement: 'right-start',
    offset: 4,
    portal: portalEnabled,
    dismissOnEscape: true,
    onDismiss: () => {
      setIsOpenByKeyboard(false)
      setIsHovered(false)
    }
  })

  useEffect(() => {
    if (!context?.open) {
      setIsHovered(false)
      setIsOpenByKeyboard(false)
    }
  }, [context?.open])

  useEffect(() => {
    return () => {
      if (popupCloseTimerRef.current) {
        clearTimeout(popupCloseTimerRef.current)
      }
    }
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (popupCloseTimerRef.current) {
      clearTimeout(popupCloseTimerRef.current)
      popupCloseTimerRef.current = null
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (disabled) return
    clearCloseTimer()
    setIsHovered(true)
  }, [clearCloseTimer, disabled])

  const handleMouseLeave = useCallback(() => {
    const close = () => {
      setIsHovered(false)
      setIsOpenByKeyboard(false)
    }

    if (portalEnabled) {
      popupCloseTimerRef.current = setTimeout(close, 120)
      return
    }

    close()
  }, [portalEnabled])

  const focusPopupFirstItem = useCallback(() => {
    requestAnimationFrame(() => {
      if (popupRef.current) focusFirstMenuItem(popupRef.current)
    })
  }, [])

  const handleTitleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return

      if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        event.stopPropagation()
        setIsOpenByKeyboard(true)
        setIsHovered(true)
        focusPopupFirstItem()
        return
      }

      if (event.key === 'ArrowLeft' || event.key === 'Escape') {
        if (isExpanded) {
          event.preventDefault()
          event.stopPropagation()
          setIsOpenByKeyboard(false)
          setIsHovered(false)
          titleRef.current?.focus()
        }
      }
    },
    [disabled, focusPopupFirstItem, isExpanded]
  )

  const handlePopupKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (popupRef.current) {
      handleMenuNavigation(popupRef.current, event.nativeEvent)
    }

    if (event.key === 'ArrowLeft' || event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setIsOpenByKeyboard(false)
      setIsHovered(false)
      titleRef.current?.focus()
    }
  }, [])

  const handlePopupContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
  }, [])

  if (!context) return null

  const triggerClasses = classNames(getContextMenuSubTriggerClasses(disabled), className)
  const popupClasses = classNames(overlay.floatingClasses, CONTEXT_MENU_ENTER_CLASS)

  const popup = (
    <div
      ref={popupRef}
      className={popupClasses}
      style={overlay.floatingStyles}
      data-positioned={overlay.positioned}
      data-tiger-context-menu-sub=""
      hidden={!isExpanded}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handlePopupKeyDown}
      onContextMenu={handlePopupContextMenu}>
      <div className={getContextMenuMenuClasses()} role="menu">
        {children}
      </div>
    </div>
  )

  return (
    <div
      className={portalEnabled ? undefined : 'relative'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="none">
      <button
        ref={titleRef}
        type="button"
        className={triggerClasses}
        style={style}
        role="menuitem"
        tabIndex={-1}
        aria-haspopup="menu"
        aria-expanded={isExpanded}
        aria-disabled={disabled || undefined}
        data-state={isExpanded ? 'open' : 'closed'}
        data-tiger-context-menu-sub-trigger=""
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        onKeyDown={handleTitleKeyDown}>
        <span className="flex-1 text-left">{title}</span>
        <svg
          className={getContextMenuSubChevronClasses()}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true">
          <path d={CONTEXT_MENU_SUB_CHEVRON_PATH} />
        </svg>
      </button>
      {renderOverlayPortal(popup, overlay.target, !portalEnabled)}
    </div>
  )
}

export interface ContextMenuProps
  extends
    Omit<CoreContextMenuProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'style' | 'onContextMenu'> {
  style?: React.CSSProperties
  placement?: FloatingPlacement
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  disabled = false,
  open: controlledOpen,
  defaultOpen = false,
  closeOnClick = true,
  portal = true,
  offset = 0,
  placement = 'bottom-start',
  className,
  style,
  onOpenChange,
  children,
  ...divProps
}) => {
  const [internalVisible, setInternalVisible] = useState(defaultOpen)
  const visible = controlledOpen !== undefined ? controlledOpen : internalVisible

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const pointNodeRef = useRef<HTMLDivElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const explicitPointRef = useRef(false)
  const [point, setPoint] = useState<ContextMenuPoint>({ x: 0, y: 0 })

  const reactId = useId()
  const menuId = useMemo(() => `tiger-context-menu-${reactId}`, [reactId])

  // New ref identity when the cursor moves so anchored-overlay remeasures the point.
  const pointReferenceRef = useMemo(
    () => ({
      get current() {
        return pointNodeRef.current
      },
      set current(node: HTMLDivElement | null) {
        pointNodeRef.current = node
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- point is an invalidation key, not a value
    [point.x, point.y]
  )

  useEffect(() => {
    injectContextMenuStyles()
  }, [])

  const setVisible = useCallback(
    (newVisible: boolean) => {
      if (disabled && newVisible) return

      if (newVisible && !visible) {
        previousActiveElementRef.current = captureActiveElement()
      }

      if (controlledOpen === undefined) {
        setInternalVisible(newVisible)
      }

      onOpenChange?.(newVisible)

      if (newVisible) {
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

  useLayoutEffect(() => {
    if (!visible || explicitPointRef.current) return
    if (!triggerRef.current) return
    setPoint(getContextMenuOpenPoint(null, triggerRef.current))
  }, [visible])

  const handleItemClick = useCallback(() => {
    if (closeOnClick) {
      setVisible(false)
    }
  }, [closeOnClick, setVisible])

  const openAt = useCallback(
    (next: ContextMenuPoint) => {
      explicitPointRef.current = true
      setPoint(next)
      setVisible(true)
    },
    [setVisible]
  )

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return
      event.preventDefault()
      event.stopPropagation()
      openAt(getContextMenuOpenPoint(event.nativeEvent, triggerRef.current))
    },
    [disabled, openAt]
  )

  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled || !isContextMenuKeyboardEvent(event)) return
      event.preventDefault()
      openAt(getContextMenuOpenPoint(null, triggerRef.current))
    },
    [disabled, openAt]
  )

  const handleMenuKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (floatingRef.current) {
      handleMenuNavigation(floatingRef.current, event.nativeEvent)
    }
  }, [])

  const handleMenuContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
  }, [])

  const overlay = useAnchoredOverlay({
    referenceRef: pointReferenceRef,
    floatingRef,
    enabled: visible,
    placement,
    offset,
    portal,
    dismissOnOutside: true,
    dismissOnEscape: true,
    onDismiss: () => setVisible(false)
  })

  const containerClasses = useMemo(
    () => classNames(getContextMenuContainerClasses(), className),
    [className]
  )
  const triggerClasses = useMemo(() => getContextMenuTriggerClasses(disabled), [disabled])
  const menuWrapperClasses = classNames(overlay.floatingClasses, CONTEXT_MENU_ENTER_CLASS)
  const pointStyle = useMemo(() => getContextMenuPointStyle(point) as React.CSSProperties, [point])

  const contextValue = useMemo<ContextMenuContextValue>(
    () => ({ closeOnClick, handleItemClick, portal, open: visible }),
    [closeOnClick, handleItemClick, portal, visible]
  )

  const childrenArray = React.Children.toArray(children)
  const triggerChildren: React.ReactNode[] = []
  let menuElement: React.ReactNode = null

  childrenArray.forEach((child) => {
    if (React.isValidElement(child) && child.type === ContextMenuMenu) {
      menuElement = child
      return
    }
    triggerChildren.push(child)
  })

  const menuWrapperNode = menuElement ? (
    <div
      key={`${point.x},${point.y}`}
      ref={floatingRef}
      className={menuWrapperClasses}
      style={overlay.floatingStyles}
      data-positioned={overlay.positioned}
      hidden={!visible}
      data-tiger-context-menu=""
      onKeyDown={handleMenuKeyDown}
      onContextMenu={handleMenuContextMenu}>
      {React.isValidElement(menuElement)
        ? React.cloneElement(menuElement as React.ReactElement<Record<string, unknown>>, {
            id: menuId
          })
        : menuElement}
    </div>
  ) : null

  return (
    <ContextMenuContext.Provider value={contextValue}>
      <div ref={containerRef} className={containerClasses} style={style} {...divProps}>
        <div
          ref={triggerRef}
          className={triggerClasses}
          onContextMenu={handleContextMenu}
          onKeyDown={handleTriggerKeyDown}
          aria-haspopup="menu"
          aria-expanded={visible}
          aria-controls={visible ? menuId : undefined}
          data-state={visible ? 'open' : 'closed'}
          data-tiger-context-menu-trigger="">
          {triggerChildren}
        </div>
        <div
          ref={pointNodeRef}
          style={pointStyle}
          aria-hidden="true"
          data-tiger-context-menu-point=""
        />
        {menuWrapperNode && renderOverlayPortal(menuWrapperNode, overlay.target, !portal)}
      </div>
    </ContextMenuContext.Provider>
  )
}

ContextMenu.displayName = 'ContextMenu'
ContextMenuMenu.displayName = 'ContextMenuMenu'
ContextMenuItem.displayName = 'ContextMenuItem'
ContextMenuSub.displayName = 'ContextMenuSub'

export default ContextMenu
