import React, { useEffect, useMemo, useCallback, useRef, useId } from 'react'
import {
  ANIMATION_DURATION_MS,
  captureActiveElement,
  classNames,
  focusFirst,
  closeIconViewBox,
  closeIconPathD,
  closeIconPathStrokeLinecap,
  closeIconPathStrokeLinejoin,
  closeIconPathStrokeWidth,
  getModalContentClasses,
  getGestureTouchPoint,
  isModalSheetSwipeCloseGesture,
  resolveLocaleText,
  modalWrapperClasses,
  modalMaskClasses,
  getModalContainerClasses,
  modalHeaderClasses,
  modalTitleClasses,
  modalCloseButtonClasses,
  modalBodyClasses,
  modalFooterClasses,
  restoreFocus,
  shouldCloseOnMaskClick,
  resolveSwipeGesture,
  mergeTigerLocale,
  type GesturePoint,
  type ModalProps as CoreModalProps
} from '@expcat/tigercat-core'
import { renderBodyPortal, useBodyScrollLock, useEscapeKey, useFocusTrap } from '../utils/overlay'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'

export interface ModalProps
  extends
    CoreModalProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children' | 'draggable'> {
  /**
   * Modal content
   */
  children?: React.ReactNode

  /**
   * Modal title content (alternative to title prop)
   */
  titleContent?: React.ReactNode

  /**
   * Modal footer content
   */
  footer?: React.ReactNode

  /**
   * Callback when modal visibility changes
   */
  onOpenChange?: (open: boolean) => void

  /**
   * Callback when modal is closed
   */
  onClose?: () => void

  /**
   * Callback after the modal close lifecycle completes
   */
  onAfterClose?: () => void

  /**
   * Callback when cancel button or close action is triggered
   */
  onCancel?: () => void

  /**
   * Callback when OK button is clicked
   */
  onOk?: () => void

  /**
   * Close button aria-label
   * @default 'Close'
   */
  closeAriaLabel?: string

  /**
   * Whether to render a default footer when no `footer` prop is provided
   * @default false
   */
  showDefaultFooter?: boolean

  /**
   * Default OK button text (used in default footer)
   * @default '确定'
   */
  okText?: string

  /**
   * Default Cancel button text (used in default footer)
   * @default '取消'
   */
  cancelText?: string
}

export const Modal: React.FC<ModalProps> = ({
  open = false,
  size = 'md',
  width,
  title,
  titleContent,
  closable = true,
  mask = true,
  maskClosable = true,
  centered = false,
  mobileSheet = false,
  destroyOnClose = false,
  zIndex = 1000,
  className,
  children,
  footer,
  onOpenChange,
  onClose,
  onAfterClose,
  onCancel,
  onOk,
  closeAriaLabel,
  showDefaultFooter = false,
  okText,
  cancelText,
  locale,
  labels,
  style,
  draggable: isDraggable = false,
  ...rest
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const [hasBeenOpened, setHasBeenOpened] = React.useState(open)
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 })
  const prevOpenRef = useRef(open)

  useEffect(() => {
    if (open) {
      setHasBeenOpened(true)
    } else {
      setDragOffset({ x: 0, y: 0 })
    }
  }, [open])

  const handleDragMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggable) return
      const startX = e.clientX
      const startY = e.clientY
      let offsetX = dragOffset.x
      let offsetY = dragOffset.y
      const onMouseMove = (ev: MouseEvent) => {
        offsetX = dragOffset.x + (ev.clientX - startX)
        offsetY = dragOffset.y + (ev.clientY - startY)
        setDragOffset({ x: offsetX, y: offsetY })
      }
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [isDraggable, dragOffset]
  )

  useEffect(() => {
    if (prevOpenRef.current && !open) {
      const timer = window.setTimeout(() => {
        onAfterClose?.()
      }, ANIMATION_DURATION_MS)
      prevOpenRef.current = open
      return () => window.clearTimeout(timer)
    }
    prevOpenRef.current = open
  }, [open, onAfterClose])

  const shouldRender = destroyOnClose ? open : hasBeenOpened

  const handleClose = useCallback(() => {
    onCancel?.()
    onOpenChange?.(false)
    onClose?.()
  }, [onCancel, onOpenChange, onClose])

  const handleOk = useCallback(() => {
    onOk?.()
    onOpenChange?.(false)
    onClose?.()
  }, [onOk, onOpenChange, onClose])

  const handleMaskClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (shouldCloseOnMaskClick(event, maskClosable)) {
        handleClose()
      }
    },
    [maskClosable, handleClose]
  )

  const contentClasses = useMemo(
    () => getModalContentClasses(size, className, mobileSheet),
    [size, className, mobileSheet]
  )

  const containerClasses = useMemo(() => getModalContainerClasses(centered), [centered])

  const resolvedCloseAriaLabel = resolveLocaleText(
    'Close',
    closeAriaLabel,
    labels?.closeAriaLabel,
    mergedLocale?.modal?.closeAriaLabel,
    mergedLocale?.common?.closeText
  )

  const resolvedCancelText = resolveLocaleText(
    '取消',
    cancelText,
    labels?.cancelText,
    mergedLocale?.modal?.cancelText,
    mergedLocale?.common?.cancelText
  )

  const resolvedOkText = resolveLocaleText(
    '确定',
    okText,
    labels?.okText,
    mergedLocale?.modal?.okText,
    mergedLocale?.common?.okText
  )

  // Unique ids for a11y
  const reactId = useId()
  const modalId = useMemo(() => `tiger-modal-${reactId}`, [reactId])
  const titleId = `${modalId}-title`
  const overlayHostId = `${modalId}-overlay-host`

  const {
    ['aria-labelledby']: _ariaLabelledby,
    role: _role,
    tabIndex: _tabIndex,
    ...dialogDivProps
  } = rest as React.HTMLAttributes<HTMLDivElement> & React.AriaAttributes

  const ariaLabelledby =
    (rest as React.AriaAttributes)['aria-labelledby'] ??
    (title || titleContent ? titleId : undefined)

  const dialogRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const touchStartRef = useRef<GesturePoint | null>(null)
  const touchCurrentRef = useRef<GesturePoint | null>(null)

  useEffect(() => {
    if (open) {
      previousActiveElementRef.current = captureActiveElement()

      const timer = setTimeout(() => {
        focusFirst([closeButtonRef.current, dialogRef.current])
      }, 0)

      return () => clearTimeout(timer)
    }

    restoreFocus(previousActiveElementRef.current)
  }, [open])

  useEscapeKey({ enabled: open, onEscape: handleClose })
  useBodyScrollLock({ enabled: open })
  useFocusTrap({ enabled: open, containerRef: rootRef })

  const resetTouchGesture = useCallback(() => {
    touchStartRef.current = null
    touchCurrentRef.current = null
  }, [])

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      dialogDivProps.onTouchStart?.(event)
      if (!open || !mobileSheet) return

      const point = getGestureTouchPoint(event.touches)
      touchStartRef.current = point
      touchCurrentRef.current = point
    },
    [dialogDivProps, mobileSheet, open]
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

      resetTouchGesture()

      if (mobileSheet && isModalSheetSwipeCloseGesture(gesture)) {
        handleClose()
      }
    },
    [dialogDivProps, handleClose, mobileSheet, resetTouchGesture]
  )

  const handleTouchCancel = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      dialogDivProps.onTouchCancel?.(event)
      resetTouchGesture()
    },
    [dialogDivProps, resetTouchGesture]
  )

  // Close icon component
  const CloseIcon = (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox={closeIconViewBox}
      stroke="currentColor">
      <path
        strokeLinecap={closeIconPathStrokeLinecap}
        strokeLinejoin={closeIconPathStrokeLinejoin}
        strokeWidth={closeIconPathStrokeWidth}
        d={closeIconPathD}
      />
    </svg>
  )

  if (!shouldRender) {
    return null
  }

  const modalContent = (
    <div
      ref={rootRef}
      className={classNames(modalWrapperClasses, !open && 'pointer-events-none')}
      style={{ zIndex }}
      hidden={!open}
      aria-hidden={!open ? 'true' : undefined}
      data-tiger-overlay-layer=""
      data-tiger-modal-root="">
      {/* Mask */}
      {mask && (
        <div
          className={classNames(modalMaskClasses, open ? 'opacity-100' : 'opacity-0')}
          aria-hidden="true"
          data-tiger-modal-mask=""
        />
      )}

      {/* Content Container */}
      <div className={containerClasses} onClick={handleMaskClick}>
        <div
          className={contentClasses}
          style={{
            ...style,
            ...(width
              ? { width: typeof width === 'number' ? `${width}px` : width, maxWidth: '100%' }
              : undefined),
            ...(isDraggable && (dragOffset.x !== 0 || dragOffset.y !== 0)
              ? { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }
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
          data-tiger-modal="">
          {/* Header */}
          {(title || titleContent || closable) && (
            <div
              className={modalHeaderClasses}
              onMouseDown={isDraggable ? handleDragMouseDown : undefined}
              style={isDraggable ? { cursor: 'grab', userSelect: 'none' } : undefined}>
              {/* Title */}
              {(title || titleContent) && (
                <h3 id={titleId} className={modalTitleClasses}>
                  {titleContent || title}
                </h3>
              )}
              {/* Close button */}
              {closable && (
                <button
                  type="button"
                  className={modalCloseButtonClasses}
                  onClick={handleClose}
                  aria-label={resolvedCloseAriaLabel}
                  ref={closeButtonRef}>
                  {CloseIcon}
                </button>
              )}
            </div>
          )}

          {/* Body */}
          {children && <div className={modalBodyClasses}>{children}</div>}

          {/* Footer */}
          {footer ? (
            <div className={modalFooterClasses} data-tiger-modal-footer="">
              {footer}
            </div>
          ) : showDefaultFooter ? (
            <div className={modalFooterClasses} data-tiger-modal-footer="">
              <Button variant="secondary" onClick={handleClose}>
                {resolvedCancelText}
              </Button>
              <Button onClick={handleOk}>{resolvedOkText}</Button>
            </div>
          ) : null}
        </div>
      </div>
      <div id={overlayHostId} className="contents" data-tiger-overlay-host="" />
    </div>
  )

  return renderBodyPortal(modalContent)
}
