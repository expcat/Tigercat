import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef
} from 'react'
import {
  classNames,
  createFloatingHoverDelayController,
  DEFAULT_DROPDOWN_TRIGGER,
  DROPDOWN_CHEVRON_PATH,
  DROPDOWN_ENTER_CLASS,
  devWarn,
  focusFirstMenuItem,
  getDropdownChevronClasses,
  getDropdownContainerClasses,
  getDropdownItemClasses,
  getDropdownMenuClasses,
  getDropdownTriggerClasses,
  getOverlayTriggerAria,
  getOverlayTriggerKeyboardAction,
  handleMenuNavigation,
  injectDropdownStyles,
  restoreFocus,
  type DropdownItemProps as CoreDropdownItemProps,
  type DropdownMenuProps as CoreDropdownMenuProps,
  type DropdownProps as CoreDropdownProps,
  type FloatingPlacement
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'
import { composeRefs, renderOverlayTrigger } from '../utils/overlay-trigger'

export interface DropdownContextValue {
  closeOnClick: boolean
  handleItemClick: () => void
}

export const DropdownContext = createContext<DropdownContextValue | null>(null)

export interface DropdownMenuProps
  extends
    Omit<CoreDropdownMenuProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: React.CSSProperties
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
    <div
      className={menuClasses}
      style={style}
      data-tiger-dropdown-menu=""
      {...divProps}
      role={role ?? 'menu'}>
      {children}
    </div>
  )
}

export interface DropdownItemProps
  extends
    Omit<CoreDropdownItemProps, 'className'>,
    Omit<
      React.AnchorHTMLAttributes<HTMLAnchorElement> & React.ButtonHTMLAttributes<HTMLButtonElement>,
      'onClick' | 'disabled' | 'href'
    > {
  className?: string
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  children?: React.ReactNode
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  disabled = false,
  divided = false,
  closeOnClick,
  href,
  className,
  onClick,
  children,
  ...rest
}) => {
  const context = useContext(DropdownContext)
  if (context == null) {
    devWarn('DropdownItem.orphan', 'DropdownItem must be used inside Dropdown.')
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault()
      return
    }

    onClick?.(event)

    const shouldClose = closeOnClick ?? context?.closeOnClick ?? true
    if (shouldClose) {
      context?.handleItemClick()
    }
  }

  const itemClasses = classNames(getDropdownItemClasses(disabled, divided), className)
  const Comp = href && !disabled ? 'a' : 'button'

  return (
    <Comp
      {...(rest as React.HTMLAttributes<HTMLElement>)}
      {...(Comp === 'a' ? { href } : { type: 'button' as const })}
      className={itemClasses}
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      disabled={Comp === 'button' ? disabled : undefined}
      onClick={handleClick}>
      {children}
    </Comp>
  )
}

export interface DropdownProps
  extends Omit<CoreDropdownProps, 'style'>, Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: React.CSSProperties
  placement?: FloatingPlacement
  offset?: number
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
  renderTrigger?: (state: { open: boolean }) => React.ReactNode
  asChild?: boolean
}

export const Dropdown = forwardRef<HTMLElement, DropdownProps>(function Dropdown(
  {
    trigger = DEFAULT_DROPDOWN_TRIGGER,
    placement: initialPlacement = 'bottom-start',
    offset = 4,
    disabled = false,
    open: controlledOpen,
    defaultOpen = false,
    closeOnClick = true,
    showArrow = true,
    portal = true,
    asChild = false,
    className,
    style,
    onOpenChange,
    children,
    renderTrigger,
    ...divProps
  },
  forwardedRef
) {
  const [visible, setVisibleState] = useControlledState({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const floatingRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const openIntentRef = useRef<'menu' | 'hover'>('menu')
  const skipRestoreRef = useRef(false)

  const reactId = useId()
  const menuId = useMemo(() => `tiger-dropdown-menu-${reactId}`, [reactId])

  useEffect(() => {
    injectDropdownStyles()
  }, [])

  const setVisibleRef = useRef<(next: boolean) => void>(() => undefined)

  const hoverControllerRef = useRef<ReturnType<typeof createFloatingHoverDelayController> | null>(
    null
  )
  if (hoverControllerRef.current === null) {
    hoverControllerRef.current = createFloatingHoverDelayController({
      show: () => {
        openIntentRef.current = 'hover'
        setVisibleRef.current(true)
      },
      hide: () => {
        skipRestoreRef.current = true
        setVisibleRef.current(false)
      }
    })
  }
  const hoverController = hoverControllerRef.current

  const setVisible = useCallback(
    (next: boolean) => {
      if (disabled && next) return
      if (next && !visible) {
        previousActiveElementRef.current = triggerRef.current
      }
      setVisibleState(next)
      if (!next) {
        hoverController.cancel()
        if (!skipRestoreRef.current) {
          restoreFocus(previousActiveElementRef.current)
        }
        previousActiveElementRef.current = null
        skipRestoreRef.current = false
      }
    },
    [disabled, visible, setVisibleState, hoverController]
  )
  setVisibleRef.current = setVisible

  useEffect(() => {
    if (!visible) return
    if (openIntentRef.current === 'hover') return
    const frame = requestAnimationFrame(() => {
      if (floatingRef.current) focusFirstMenuItem(floatingRef.current)
    })
    return () => cancelAnimationFrame(frame)
  }, [visible])

  const handleItemClick = useCallback(() => {
    skipRestoreRef.current = false
    setVisible(false)
  }, [setVisible])

  const handleMouseEnter = useCallback(() => {
    if (trigger !== 'hover' || disabled) return
    hoverController.enter()
  }, [trigger, disabled, hoverController])

  const handleMouseLeave = useCallback(() => {
    if (trigger !== 'hover') return
    hoverController.leave()
  }, [trigger, hoverController])

  const handleClick = useCallback(() => {
    if (disabled) return
    if (triggerRef.current?.getAttribute('aria-disabled') === 'true') return
    if (trigger === 'hover') {
      hoverController.cancel()
    }
    openIntentRef.current = 'menu'
    setVisible(!visible)
  }, [disabled, trigger, visible, setVisible, hoverController])

  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const action = getOverlayTriggerKeyboardAction(event.nativeEvent, {
        kind: 'menu',
        open: visible,
        disabled
      })
      if (!action) return
      event.preventDefault()
      hoverController.cancel()
      if (action === 'close') {
        setVisible(false)
        return
      }
      openIntentRef.current = 'menu'
      if (!visible) setVisible(true)
    },
    [visible, disabled, hoverController, setVisible]
  )

  const handleMenuKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Tab') {
        skipRestoreRef.current = true
        setVisible(false)
        return
      }
      if (floatingRef.current) {
        handleMenuNavigation(floatingRef.current, event.nativeEvent)
      }
    },
    [setVisible]
  )

  const overlay = useAnchoredOverlay({
    referenceRef: triggerRef,
    floatingRef,
    enabled: visible,
    placement: initialPlacement,
    offset,
    portal,
    containerRef,
    dismissOnOutside: true,
    dismissOnEscape: true,
    onDismiss: (reason) => {
      skipRestoreRef.current = reason !== 'escape'
      if (reason === 'escape') openIntentRef.current = 'menu'
      setVisible(false)
    }
  })

  useEffect(() => () => hoverController.dispose(), [hoverController])

  const containerClasses = useMemo(
    () => classNames(getDropdownContainerClasses(), 'tiger-dropdown-container', className),
    [className]
  )

  const triggerClasses = useMemo(() => getDropdownTriggerClasses(disabled), [disabled])

  const contextValue = useMemo<DropdownContextValue>(
    () => ({ closeOnClick, handleItemClick }),
    [closeOnClick, handleItemClick]
  )

  const childrenArray = React.Children.toArray(children)
  let triggerElement: React.ReactNode = renderTrigger ? renderTrigger({ open: visible }) : null
  let menuElement: React.ReactNode = null
  let sawTrigger = Boolean(renderTrigger)

  childrenArray.forEach((child) => {
    if (React.isValidElement(child) && child.type === DropdownMenu) {
      menuElement = child
      return
    }
    if (renderTrigger) return
    if (!sawTrigger) {
      triggerElement = child
      sawTrigger = true
      return
    }
    devWarn('Dropdown.extraTrigger', 'Dropdown only uses the first non-menu child as the trigger.')
  })

  const triggerAria = getOverlayTriggerAria({
    kind: 'menu',
    open: visible,
    controlsId: menuId,
    disabled
  })

  const composedTriggerRef = composeRefs(forwardedRef, triggerRef)

  const chevronNode =
    showArrow && !asChild ? (
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

  const triggerNode = renderOverlayTrigger({
    asChild,
    child: triggerElement,
    triggerRef: composedTriggerRef,
    className: asChild ? undefined : triggerClasses,
    disabled,
    extraChildren: chevronNode,
    aria: triggerAria,
    handlers: {
      onClick: handleClick,
      onKeyDown: handleTriggerKeyDown,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  })

  const menuWrapperNode = (
    <div
      ref={floatingRef}
      className={classNames(overlay.floatingClasses, DROPDOWN_ENTER_CLASS)}
      style={overlay.floatingStyles}
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
        {triggerNode}
        {renderOverlayPortal(menuWrapperNode, overlay.target, !portal)}
      </div>
    </DropdownContext.Provider>
  )
})

Dropdown.displayName = 'Dropdown'
DropdownMenu.displayName = 'DropdownMenu'
DropdownItem.displayName = 'DropdownItem'
