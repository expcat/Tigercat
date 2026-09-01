import React, { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import {
  classNames,
  closeIconViewBox,
  closeIconPathD,
  closeIconPathStrokeLinecap,
  closeIconPathStrokeLinejoin,
  closeIconPathStrokeWidth,
  getDrawerMaskClasses,
  getDrawerContainerClasses,
  getDrawerPanelClasses,
  getDrawerHeaderClasses,
  getDrawerBodyClasses,
  getDrawerFooterClasses,
  getDrawerCloseButtonClasses,
  getDrawerTitleClasses,
  getGestureTouchPoint,
  isDrawerSwipeCloseGesture,
  resolveDrawerPlacement,
  getDrawerSwipeCloseDirection,
  resolveLocaleText,
  resolveSwipeGesture,
  shouldRenderOverlay,
  isOverlayVisuallyHidden,
  scheduleOverlayLeave,
  canStartOverlaySwipeClose,
  OVERLAY_SWIPE_HANDLE_ATTR,
  shouldCloseOnMaskClick,
  mergeTigerLocale,
  OVERLAY_Z_INDEX,
  type GesturePoint,
  type DrawerProps as CoreDrawerProps
} from '@expcat/tigercat-core'
import { renderBodyPortal, useBodyScrollLock, useEscapeKey, useFocusTrap } from '../utils/overlay'
import { useTigerConfig } from './ConfigProvider'

export interface DrawerProps
  extends
    Omit<CoreDrawerProps, 'panelStyle'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  onAfterEnter?: () => void
  onAfterClose?: () => void
  header?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  panelStyle?: React.CSSProperties

  /**
   * Close button aria-label
   * @default 'Close drawer'
   */
  closeAriaLabel?: string
}

const CloseIcon: React.FC = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox={closeIconViewBox}
    xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap={closeIconPathStrokeLinecap}
      strokeLinejoin={closeIconPathStrokeLinejoin}
      strokeWidth={closeIconPathStrokeWidth}
      d={closeIconPathD}
    />
  </svg>
)

export const Drawer: React.FC<DrawerProps> = ({
  open = false,
  placement = 'right',
  size = 'md',
  width,
  title,
  header,
  closable = true,
  mask = true,
  maskClosable = true,
  keyboard = true,
  zIndex = OVERLAY_Z_INDEX.modal,
  className,
  bodyClassName,
  bodyPadding,
  destroyOnClose = false,
  fullscreenOnMobile = true,
  panelClassName,
  panelStyle,
  onClose,
  onOpenChange,
  onAfterEnter,
  onAfterClose,
  closeAriaLabel,
  locale,
  labels,
  children,
  footer,
  style,
  ...rest
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const [hasOpened, setHasOpened] = React.useState(open)
  const [leaving, setLeaving] = React.useState(false)
  const wasOpenRef = useRef(open)
  const afterEnterRef = useRef(onAfterEnter)
  const afterCloseRef = useRef(onAfterClose)
  afterEnterRef.current = onAfterEnter
  afterCloseRef.current = onAfterClose

  useEffect(() => {
    if (open) {
      setHasOpened(true)
      setLeaving(false)
      wasOpenRef.current = true
      return scheduleOverlayLeave({
        onFinish: () => afterEnterRef.current?.()
      })
    }
    if (!wasOpenRef.current) return
    wasOpenRef.current = false
    setLeaving(true)
    return scheduleOverlayLeave({
      onFinish: () => {
        setLeaving(false)
        afterCloseRef.current?.()
      }
    })
  }, [open])

  const shouldRender = shouldRenderOverlay({
    open,
    hasOpened,
    leaving,
    destroyOnClose
  })

  const handleClose = useCallback(() => {
    onOpenChange?.(false)
    onClose?.()
  }, [onOpenChange, onClose])

  const handleMaskClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (shouldCloseOnMaskClick(event, maskClosable)) {
        handleClose()
      }
    },
    [maskClosable, handleClose]
  )

  useBodyScrollLock({ enabled: open })

  const reactId = useId()
  const drawerId = useMemo(() => `tiger-drawer-${reactId}`, [reactId])
  const titleId = `${drawerId}-title`
  const overlayHostId = `${drawerId}-overlay-host`

  const {
    ['aria-labelledby']: _ariaLabelledby,
    role: _role,
    tabIndex: _tabIndex,
    ...dialogDivProps
  } = rest as React.HTMLAttributes<HTMLDivElement> & React.AriaAttributes

  const ariaLabelledby =
    (rest as React.AriaAttributes)['aria-labelledby'] ?? (title || header ? titleId : undefined)

  const dialogRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const touchStartRef = useRef<GesturePoint | null>(null)
  const touchCurrentRef = useRef<GesturePoint | null>(null)
  const swipeAllowedRef = useRef(false)

  const resolvedPlacement = resolveDrawerPlacement(
    placement,
    mergedLocale?.direction === 'rtl' ? 'rtl' : 'ltr'
  )

  useEscapeKey({ enabled: open && keyboard, onEscape: handleClose, layerRef: rootRef })

  const resolvedCloseAriaLabel = resolveLocaleText(
    'Close drawer',
    closeAriaLabel,
    labels?.closeAriaLabel,
    mergedLocale?.drawer?.closeAriaLabel,
    mergedLocale?.common?.closeText
  )

  useFocusTrap({ enabled: open, containerRef: rootRef, inert: true, autoFocus: true })

  const resetTouchGesture = useCallback(() => {
    touchStartRef.current = null
    touchCurrentRef.current = null
    swipeAllowedRef.current = false
  }, [])

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      dialogDivProps.onTouchStart?.(event)
      if (!open) return

      swipeAllowedRef.current = canStartOverlaySwipeClose({
        target: event.target,
        scrollContainer: bodyRef.current,
        closeDirection: getDrawerSwipeCloseDirection(resolvedPlacement)
      })
      const point = getGestureTouchPoint(event.touches)
      touchStartRef.current = point
      touchCurrentRef.current = point
    },
    [dialogDivProps, open, resolvedPlacement]
  )

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      dialogDivProps.onTouchMove?.(event)
      if (!touchStartRef.current) return

      const point = getGestureTouchPoint(event.touches)
      if (point) {
        touchCurrentRef.current = point
      }
    },
    [dialogDivProps]
  )

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      dialogDivProps.onTouchEnd?.(event)
      const gesture = resolveSwipeGesture(
        touchStartRef.current,
        getGestureTouchPoint(event.changedTouches) ?? touchCurrentRef.current,
        { minDistance: 48, minVelocity: 0.15 }
      )

      const allowed = swipeAllowedRef.current
      resetTouchGesture()

      if (allowed && isDrawerSwipeCloseGesture(resolvedPlacement, gesture)) {
        handleClose()
      }
    },
    [dialogDivProps, handleClose, resolvedPlacement, resetTouchGesture]
  )

  const handleTouchCancel = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      dialogDivProps.onTouchCancel?.(event)
      resetTouchGesture()
    },
    [dialogDivProps, resetTouchGesture]
  )

  const containerClasses = getDrawerContainerClasses()

  const maskClasses = getDrawerMaskClasses(open)
  const panelClasses = classNames(
    getDrawerPanelClasses(resolvedPlacement, open, size, fullscreenOnMobile),
    'flex flex-col',
    className,
    panelClassName
  )

  const headerClasses = getDrawerHeaderClasses()
  const bodyClasses = getDrawerBodyClasses(bodyClassName, bodyPadding)
  const footerClasses = getDrawerFooterClasses()
  const closeButtonClasses = getDrawerCloseButtonClasses()
  const titleClasses = getDrawerTitleClasses()

  if (!shouldRender) {
    return null
  }

  const drawerContent = (
    <div
      ref={rootRef}
      className={containerClasses}
      style={{ zIndex }}
      hidden={isOverlayVisuallyHidden(open, leaving)}
      aria-hidden={!open ? 'true' : undefined}
      data-tiger-overlay-layer=""
      data-tiger-drawer-root="">
      {mask && (
        <div
          className={maskClasses}
          onClick={handleMaskClick}
          aria-hidden="true"
          data-tiger-drawer-mask=""
        />
      )}

      <div
        className={panelClasses}
        style={{
          ...panelStyle,
          ...style,
          ...(width
            ? {
                [resolvedPlacement === 'left' || resolvedPlacement === 'right'
                  ? 'width'
                  : 'height']: typeof width === 'number' ? `${width}px` : width
              }
            : undefined)
        }}
        {...dialogDivProps}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledby}
        aria-owns={overlayHostId}
        tabIndex={-1}
        ref={dialogRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        data-tiger-drawer="">
        {(title || header || closable) && (
          <div className={headerClasses} {...{ [OVERLAY_SWIPE_HANDLE_ATTR]: '' }}>
            {header ? (
              <div className={titleClasses} id={titleId}>
                {header}
              </div>
            ) : title ? (
              <h3 className={titleClasses} id={titleId}>
                {title}
              </h3>
            ) : null}
            {closable && (
              <button
                type="button"
                className={closeButtonClasses}
                onClick={handleClose}
                aria-label={resolvedCloseAriaLabel}
                ref={closeButtonRef}>
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        {children && (
          <div className={bodyClasses} ref={bodyRef} data-tiger-drawer-body="">
            {children}
          </div>
        )}
        {footer && <div className={footerClasses}>{footer}</div>}
      </div>
      <div id={overlayHostId} className="contents" data-tiger-overlay-host="" />
    </div>
  )

  return renderBodyPortal(drawerContent)
}
