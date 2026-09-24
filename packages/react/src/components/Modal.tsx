import React, { useEffect, useLayoutEffect, useMemo, useCallback, useRef, useId, useState } from 'react'
import {
  acquireOverlayZ,
  classNames,
  createDismissActionEvent,
  destroyAllConfirmModals,
  enqueueConfirmModal,
  getActiveFeedbackScope,
  getModalContentClasses,
  getGestureTouchPoint,
  isModalSheetSwipeCloseGesture,
  getModalLabels,
  modalWrapperClasses,
  modalMaskClasses,
  getModalContainerClasses,
  modalHeaderClasses,
  modalTitleClasses,
  modalCloseButtonClasses,
  modalBodyClasses,
  modalDragStyle,
  modalFooterClasses,
  settleDismissAction,
  shouldRenderOverlay,
  isOverlayVisuallyHidden,
  whenOverlayTransitionEnds,
  canStartOverlaySwipeClose,
  clampSheetDragDistance,
  prefersReducedMotion,
  resolveSheetReducedMotion,
  resolveSheetRelease,
  isOverlayDragHandleEvent,
  clampOverlayDragOffset,
  OVERLAY_SWIPE_HANDLE_ATTR,
  shouldCloseOnMaskClick,
  resolveSwipeGesture,
  mergeTigerLocale,
  OVERLAY_Z_INDEX,
  createDocumentDragSession,
  type DocumentDragSession,
  type GesturePoint,
  type ConfirmModalInput,
  type ConfirmModalKind,
  type ModalProps as CoreModalProps
} from '@expcat/tigercat-core'
import {
  closeIconViewBox,
  closeIconPathD,
  closeIconPathStrokeLinecap,
  closeIconPathStrokeLinejoin,
  closeIconPathStrokeWidth
} from '@expcat/tigercat-core/icons/common'
import {
  useBodyScrollLock,
  useEscapeKey,
  useFocusTrap,
  useOverlayPortalTarget
} from '../utils/overlay'
import { OverlayPortal } from '../utils/overlay-outlet'
import { composeRefs } from '../utils/overlay-trigger'
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
   * Modal footer content, or a render function that receives `{ ok, cancel }`.
   * Default OK always closes.
   */
  footer?: React.ReactNode | ((actions: { ok: () => void; cancel: () => void }) => React.ReactNode)

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
  onOk?: (event: { preventDefault(): void }) => void | Promise<void>

  /**
   * Show the cancel button in the default footer.
   * @default true
   */
  showCancel?: boolean
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open = false,
    size = 'md',
    width,
    title,
    titleContent,
    closable = true,
    mask = true,
    maskClosable = true,
    keyboard = true,
    centered = false,
    mobileSheet = false,
    destroyOnClose = false,
    zIndex,
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
    showCancel = true,
    okText,
    cancelText,
    initialFocus,
    locale,
    labels,
    style,
    draggable: isDraggable = false,
    ...rest
  },
  forwardedRef
) {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const [hasOpened, setHasOpened] = React.useState(open)
  const [leaving, setLeaving] = React.useState(false)
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 })
  const [stackedZ, setStackedZ] = useState<number | undefined>(undefined)
  useEffect(() => {
    if (!open || zIndex !== undefined) {
      setStackedZ(undefined)
      return
    }
    const layer = acquireOverlayZ()
    setStackedZ(layer.zIndex)
    return () => {
      layer.release()
    }
  }, [open, zIndex])
  const [dragging, setDragging] = React.useState(false)
  const wasOpenRef = useRef(open)
  const afterCloseRef = useRef(onAfterClose)
  afterCloseRef.current = onAfterClose
  const dragSessionRef = useRef<DocumentDragSession | null>(null)

  const cleanupDragSession = useCallback(() => {
    dragSessionRef.current?.dispose()
    dragSessionRef.current = null
  }, [])

  useEffect(() => {
    if (open) {
      setHasOpened(true)
      setLeaving(false)
      wasOpenRef.current = true
      return
    }
    cleanupDragSession()
    setDragOffset({ x: 0, y: 0 })
    if (!wasOpenRef.current) return
    wasOpenRef.current = false
    setLeaving(true)
    return whenOverlayTransitionEnds(dialogRef.current, () => {
      setLeaving(false)
      afterCloseRef.current?.()
    })
  }, [open, cleanupDragSession])

  useEffect(() => cleanupDragSession, [cleanupDragSession])

  const handleDragPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggable || e.button !== 0 || !isOverlayDragHandleEvent(e)) return
      e.preventDefault()
      const originX = dragOffset.x
      const originY = dragOffset.y
      const startRect = (dialogRef.current ?? e.currentTarget).getBoundingClientRect()
      const view = e.currentTarget.ownerDocument.defaultView
      const viewport = {
        width: view?.innerWidth ?? startRect.width,
        height: view?.innerHeight ?? startRect.height
      }
      cleanupDragSession()
      setDragging(true)
      dragSessionRef.current = createDocumentDragSession({
        startX: e.clientX,
        startY: e.clientY,
        ownerDocument: e.currentTarget.ownerDocument,
        pointerId: e.pointerId,
        pointerTarget: e.currentTarget,
        onMove: ({ deltaX, deltaY }) => {
          setDragOffset(
            clampOverlayDragOffset(
              { x: originX, y: originY },
              { x: deltaX, y: deltaY },
              startRect,
              viewport
            )
          )
        },
        onEnd: () => {
          dragSessionRef.current = null
          setDragging(false)
        }
      })
    },
    [isDraggable, dragOffset, cleanupDragSession]
  )

  const shouldRender = shouldRenderOverlay({
    open,
    hasOpened,
    leaving,
    destroyOnClose
  })

  const handleClose = useCallback(() => {
    onCancel?.()
    onOpenChange?.(false)
    onClose?.()
  }, [onCancel, onOpenChange, onClose])

  const [confirming, setConfirming] = useState(false)
  const handleOk = useCallback(async () => {
    if (confirming) return
    const event = createDismissActionEvent()
    let result: unknown
    try {
      result = onOk?.(event)
    } catch {
      return
    }
    if (event.defaultPrevented) return
    const pending =
      typeof result === 'object' &&
      result !== null &&
      typeof (result as Promise<unknown>).then === 'function'
    if (pending) setConfirming(true)
    const outcome = await settleDismissAction(result, event)
    if (pending) setConfirming(false)
    if (outcome !== 'close') return
    onOpenChange?.(false)
    onClose?.()
  }, [confirming, onOk, onOpenChange, onClose])

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

  const modalLabels = getModalLabels(mergedLocale, {
    ...labels,
    ...(closeAriaLabel ? { closeAriaLabel } : {}),
    ...(okText
      ? { okText }
      : locale?.modal?.okText
        ? { okText: locale.modal.okText }
        : locale?.common?.okText
          ? { okText: locale.common.okText }
          : {}),
    ...(cancelText
      ? { cancelText }
      : locale?.modal?.cancelText
        ? { cancelText: locale.modal.cancelText }
        : locale?.common?.cancelText
          ? { cancelText: locale.common.cancelText }
          : {})
  })
  const resolvedCloseAriaLabel = modalLabels.closeAriaLabel
  const resolvedCancelText = modalLabels.cancelText
  const resolvedOkText = modalLabels.okText

  // Unique ids for a11y
  const reactId = useId()
  const modalId = useMemo(() => `tiger-modal-${reactId}`, [reactId])
  const titleId = `${modalId}-title`
  const bodyId = `${modalId}-body`
  const overlayHostId = `${modalId}-overlay-host`

  const {
    ['aria-labelledby']: _ariaLabelledby,
    ['aria-label']: ariaLabelFromRest,
    ['aria-describedby']: ariaDescribedbyFromRest,
    role: _role,
    tabIndex: _tabIndex,
    ...dialogDivProps
  } = rest as React.HTMLAttributes<HTMLDivElement> & React.AriaAttributes

  const hasTitle = Boolean(title || titleContent)
  const ariaLabelledby =
    (rest as React.AriaAttributes)['aria-labelledby'] ?? (hasTitle ? titleId : undefined)
  const ariaLabel = ariaLabelFromRest ?? (hasTitle ? undefined : modalLabels.dialogAriaLabel)
  const ariaDescribedby = ariaDescribedbyFromRest ?? (children ? bodyId : undefined)

  const { anchorRef, target: portalTarget } = useOverlayPortalTarget()
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const touchStartRef = useRef<GesturePoint | null>(null)
  const touchCurrentRef = useRef<GesturePoint | null>(null)
  const swipeAllowedRef = useRef(false)
  const [sheetOffset, setSheetOffset] = useState(0)

  useEscapeKey({ enabled: open && keyboard, onEscape: handleClose, layerRef: rootRef })
  useBodyScrollLock({ enabled: open })
  const focusTargetRef = useRef<HTMLElement | null>(null)
  useLayoutEffect(() => {
    const root = dialogRef.current
    const found = initialFocus && root ? root.querySelector(initialFocus) : null
    focusTargetRef.current = found instanceof HTMLElement ? found : root
  }, [open, initialFocus])
  useFocusTrap({
    enabled: open,
    containerRef: rootRef,
    inert: true,
    autoFocus: true,
    initialFocusRef: focusTargetRef
  })

  const resetTouchGesture = useCallback(() => {
    touchStartRef.current = null
    touchCurrentRef.current = null
    swipeAllowedRef.current = false
    setSheetOffset(0)
  }, [])

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      dialogDivProps.onTouchStart?.(event)
      if (!open || !mobileSheet) return

      swipeAllowedRef.current = canStartOverlaySwipeClose({
        target: event.target,
        scrollContainer: bodyRef.current,
        closeDirection: 'down'
      })
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
      if (point && touchStartRef.current && swipeAllowedRef.current) {
        touchCurrentRef.current = point
        setSheetOffset(clampSheetDragDistance(point.y - touchStartRef.current.y))
      } else if (point) {
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
      const distance = sheetOffset || gesture?.distance || 0
      const size = dialogRef.current?.offsetHeight ?? 0
      resetTouchGesture()
      if (!allowed || !mobileSheet) return
      const release = resolveSheetRelease(distance, size)
      const motion = resolveSheetReducedMotion(release, prefersReducedMotion())
      if (motion === 'close') handleClose()
    },
    [dialogDivProps, handleClose, mobileSheet, resetTouchGesture, sheetOffset]
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
      stroke="currentColor"
      aria-hidden="true"
      focusable="false">
      <path
        strokeLinecap={closeIconPathStrokeLinecap}
        strokeLinejoin={closeIconPathStrokeLinejoin}
        strokeWidth={closeIconPathStrokeWidth}
        d={closeIconPathD}
      />
    </svg>
  )

  const anchor = <span ref={anchorRef} hidden />

  if (!shouldRender) {
    return anchor
  }

  const modalContent = (
    <div
      ref={rootRef}
      className={modalWrapperClasses}
      style={{ zIndex: zIndex ?? stackedZ ?? OVERLAY_Z_INDEX.modal }}
      hidden={isOverlayVisuallyHidden(open, leaving)}
      aria-hidden={!open ? 'true' : undefined}
      data-tiger-overlay-layer=""
      data-tiger-modal-root="">
      {/* Mask */}
      {mask && (
        <div
          className={classNames(modalMaskClasses, open ? 'opacity-100' : 'opacity-0')}
          aria-hidden="true"
          data-tiger-modal-mask=""
          onClick={handleMaskClick}
        />
      )}

      <div className={containerClasses}>
        <div
          className={contentClasses}
          style={{
            ...style,
            ...(width
              ? { width: typeof width === 'number' ? `${width}px` : width, maxWidth: '100%' }
              : undefined),
            ...(isDraggable && (dragOffset.x !== 0 || dragOffset.y !== 0)
              ? { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }
              : sheetOffset > 0
                ? { transform: `translate3d(0, ${sheetOffset}px, 0)`, transitionDuration: '0ms' }
                : undefined),
            ...(dragging ? modalDragStyle : null)
          }}
          {...dialogDivProps}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledby}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedby}
          aria-owns={overlayHostId}
          tabIndex={-1}
          ref={composeRefs(forwardedRef, dialogRef)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          data-tiger-modal="">
          {/* Header */}
          {(title || titleContent || closable) && (
            <div
              className={modalHeaderClasses}
              {...{ [OVERLAY_SWIPE_HANDLE_ATTR]: '' }}
              onPointerDown={isDraggable ? handleDragPointerDown : undefined}
              style={
                isDraggable
                  ? {
                      cursor: dragging ? 'grabbing' : 'grab',
                      userSelect: 'none',
                      touchAction: 'none'
                    }
                  : undefined
              }>
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
          {children && (
            <div className={modalBodyClasses} ref={bodyRef} id={bodyId} data-tiger-modal-body="">
              {children}
            </div>
          )}

          {/* Footer */}
          {footer ? (
            <div className={modalFooterClasses} data-tiger-modal-footer="">
              {typeof footer === 'function'
                ? footer({ ok: handleOk, cancel: handleClose })
                : footer}
            </div>
          ) : showDefaultFooter ? (
            <div className={modalFooterClasses} data-tiger-modal-footer="">
              {showCancel ? (
                <Button variant="secondary" onClick={handleClose}>
                  {resolvedCancelText}
                </Button>
              ) : null}
              <Button onClick={handleOk} loading={confirming} disabled={confirming}>
                {resolvedOkText}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      <div id={overlayHostId} className="contents" data-tiger-overlay-host="" />
    </div>
  )

  return (
    <>
      {anchor}
      <OverlayPortal target={portalTarget}>{modalContent}</OverlayPortal>
    </>
  )
})

function openModal(kind: ConfirmModalKind, input: ConfirmModalInput = {}) {
  return enqueueConfirmModal(getActiveFeedbackScope(), { ...input, kind })
}

export function confirmModal(input: ConfirmModalInput = {}) {
  return openModal('confirm', input)
}

export function infoModal(input: ConfirmModalInput = {}) {
  return openModal('info', input)
}

export function successModal(input: ConfirmModalInput = {}) {
  return openModal('success', input)
}

export function warningModal(input: ConfirmModalInput = {}) {
  return openModal('warning', input)
}

export function errorModal(input: ConfirmModalInput = {}) {
  return openModal('error', input)
}

export function destroyAllModals(): void {
  destroyAllConfirmModals(getActiveFeedbackScope())
}
