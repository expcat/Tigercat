import React, { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import {
  ANIMATION_DURATION_MS,
  captureActiveElement,
  classNames,
  closeIconViewBox,
  closeIconPathD,
  closeIconPathStrokeLinecap,
  closeIconPathStrokeLinejoin,
  closeIconPathStrokeWidth,
  focusFirst,
  getDrawerMaskClasses,
  getDrawerContainerClasses,
  getDrawerPanelClasses,
  getDrawerHeaderClasses,
  getDrawerBodyClasses,
  getDrawerFooterClasses,
  getDrawerCloseButtonClasses,
  getDrawerTitleClasses,
  resolveLocaleText,
  restoreFocus,
  shouldCloseOnMaskClick,
  type DrawerProps as CoreDrawerProps
} from '@expcat/tigercat-core'
import { renderBodyPortal, useBodyScrollLock, useEscapeKey, useFocusTrap } from '../utils/overlay'

export interface DrawerProps
  extends CoreDrawerProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  onAfterEnter?: () => void
  onAfterLeave?: () => void
  header?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode

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
  zIndex = 1000,
  className,
  bodyClassName,
  destroyOnClose = false,
  onClose,
  onOpenChange,
  onAfterEnter,
  onAfterLeave,
  closeAriaLabel,
  locale,
  children,
  footer,
  style,
  ...rest
}) => {
  const [hasBeenOpened, setHasBeenOpened] = React.useState(open)

  useEffect(() => {
    if (open) setHasBeenOpened(true)
  }, [open])

  const shouldRender = destroyOnClose ? open : hasBeenOpened

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

  useEscapeKey({ enabled: open, onEscape: handleClose })
  useBodyScrollLock({ enabled: open })

  const previousVisible = useRef(false)
  useEffect(() => {
    if (open === previousVisible.current) return
    previousVisible.current = open

    const timer = window.setTimeout(() => {
      if (open) {
        onAfterEnter?.()
      } else {
        onAfterLeave?.()
      }
    }, ANIMATION_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [open, onAfterEnter, onAfterLeave])

  const reactId = useId()
  const drawerId = useMemo(() => `tiger-drawer-${reactId}`, [reactId])
  const titleId = `${drawerId}-title`

  const {
    ['aria-labelledby']: _ariaLabelledby,
    role: _role,
    tabIndex: _tabIndex,
    ...dialogDivProps
  } = rest as React.HTMLAttributes<HTMLDivElement> & React.AriaAttributes

  const ariaLabelledby =
    (rest as React.AriaAttributes)['aria-labelledby'] ?? (title || header ? titleId : undefined)

  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  const resolvedCloseAriaLabel = resolveLocaleText(
    'Close drawer',
    closeAriaLabel,
    locale?.drawer?.closeAriaLabel,
    locale?.common?.closeText
  )

  useEffect(() => {
    if (open) {
      previousActiveElementRef.current = captureActiveElement()

      const timer = window.setTimeout(() => {
        focusFirst([closeButtonRef.current, dialogRef.current])
      }, 0)

      return () => window.clearTimeout(timer)
    }
    restoreFocus(previousActiveElementRef.current)
  }, [open])

  useFocusTrap({ enabled: open, containerRef: dialogRef })

  const containerClasses = classNames(getDrawerContainerClasses(), !open && 'pointer-events-none')

  const maskClasses = getDrawerMaskClasses(open)
  const panelClasses = classNames(
    getDrawerPanelClasses(placement, open, size),
    'flex flex-col',
    className
  )

  const headerClasses = getDrawerHeaderClasses()
  const bodyClasses = getDrawerBodyClasses(bodyClassName)
  const footerClasses = getDrawerFooterClasses()
  const closeButtonClasses = getDrawerCloseButtonClasses()
  const titleClasses = getDrawerTitleClasses()

  if (!shouldRender) {
    return null
  }

  const drawerContent = (
    <div
      className={containerClasses}
      style={{ zIndex }}
      hidden={!open}
      aria-hidden={!open ? 'true' : undefined}
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
          ...style,
          ...(width
            ? {
                [placement === 'left' || placement === 'right' ? 'width' : 'height']:
                  typeof width === 'number' ? `${width}px` : width
              }
            : undefined)
        }}
        {...dialogDivProps}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledby}
        tabIndex={-1}
        ref={dialogRef}
        data-tiger-drawer="">
        {(title || header || closable) && (
          <div className={headerClasses}>
            {(title || header) && (
              <h3 className={titleClasses} id={titleId}>
                {header || title}
              </h3>
            )}
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

        {children && <div className={bodyClasses}>{children}</div>}
        {footer && <div className={footerClasses}>{footer}</div>}
      </div>
    </div>
  )

  return renderBodyPortal(drawerContent)
}
