import React, { useEffect, useMemo, useCallback, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import {
  captureActiveElement,
  classNames,
  focusFirst,
  closeIconViewBox,
  closeIconPathD,
  closeIconPathStrokeLinecap,
  closeIconPathStrokeLinejoin,
  closeIconPathStrokeWidth,
  getModalContentClasses,
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
  type TigerLocale,
  type ModalProps as CoreModalProps
} from '@expcat/tigercat-core'
import { useEscapeKey } from '../utils/overlay'

export interface ModalProps
  extends CoreModalProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
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
  onVisibleChange?: (visible: boolean) => void

  /**
   * Callback when modal is closed
   */
  onClose?: () => void

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
}

export const Modal: React.FC<ModalProps> = ({
  visible = false,
  size = 'md',
  title,
  titleContent,
  closable = true,
  mask = true,
  maskClosable = true,
  centered = false,
  destroyOnClose = false,
  zIndex = 1000,
  className,
  children,
  footer,
  onVisibleChange,
  onClose,
  onCancel,
  onOk: _onOk,
  closeAriaLabel,
  locale,
  style,
  ...rest
}) => {
  const [hasBeenOpened, setHasBeenOpened] = React.useState(visible)

  useEffect(() => {
    if (visible) {
      setHasBeenOpened(true)
    }
  }, [visible])

  // Notify parent of visibility changes
  useEffect(() => {
    onVisibleChange?.(visible)
    if (!visible && onClose) {
      onClose()
    }
  }, [visible, onVisibleChange, onClose])

  const shouldRender = destroyOnClose ? visible : hasBeenOpened

  const handleClose = useCallback(() => {
    onCancel?.()
    onVisibleChange?.(false)
  }, [onCancel, onVisibleChange])

  const handleMaskClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (maskClosable && event.target === event.currentTarget) {
        handleClose()
      }
    },
    [maskClosable, handleClose]
  )

  const contentClasses = useMemo(() => getModalContentClasses(size, className), [size, className])

  const containerClasses = useMemo(() => getModalContainerClasses(centered), [centered])

  const resolvedCloseAriaLabel = resolveLocaleText(
    'Close',
    closeAriaLabel,
    locale?.modal?.closeAriaLabel,
    locale?.common?.closeText
  )

  // Unique ids for a11y
  const reactId = useId()
  const modalId = useMemo(() => `tiger-modal-${reactId}`, [reactId])
  const titleId = `${modalId}-title`

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
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!visible) return

    previousActiveElementRef.current = captureActiveElement()

    const timer = setTimeout(() => {
      focusFirst([closeButtonRef.current, dialogRef.current])
    }, 0)

    return () => clearTimeout(timer)
  }, [visible])

  useEffect(() => {
    if (visible) return
    restoreFocus(previousActiveElementRef.current)
  }, [visible])

  useEscapeKey({ enabled: visible, onEscape: handleClose })

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

  if (destroyOnClose && !visible) {
    return null
  }

  const modalContent = (
    <div
      className={classNames(modalWrapperClasses, !visible && 'pointer-events-none')}
      style={{ zIndex }}
      hidden={!visible}
      aria-hidden={!visible ? 'true' : undefined}
      data-tiger-modal-root="">
      {/* Mask */}
      {mask && (
        <div
          className={classNames(modalMaskClasses, visible ? 'opacity-100' : 'opacity-0')}
          aria-hidden="true"
          data-tiger-modal-mask=""
        />
      )}

      {/* Content Container */}
      <div className={containerClasses} onClick={handleMaskClick}>
        <div
          className={classNames(contentClasses)}
          style={style}
          {...dialogDivProps}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledby}
          tabIndex={-1}
          ref={dialogRef}
          data-tiger-modal="">
          {/* Header */}
          {(title || titleContent || closable) && (
            <div className={modalHeaderClasses}>
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
          {footer && (
            <div className={modalFooterClasses} data-tiger-modal-footer="">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
