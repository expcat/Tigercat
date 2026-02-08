import React, { useState, useMemo, useCallback } from 'react'
import {
  classNames,
  icon24PathStrokeLinecap,
  icon24PathStrokeLinejoin,
  icon24StrokeWidth,
  icon24ViewBox,
  getAlertTypeClasses,
  defaultAlertThemeColors,
  alertBaseClasses,
  alertSizeClasses,
  alertIconSizeClasses,
  alertTitleSizeClasses,
  alertDescriptionSizeClasses,
  alertCloseButtonBaseClasses,
  alertIconContainerClasses,
  alertContentClasses,
  getAlertIconPath,
  alertCloseIconPath,
  type AlertProps as CoreAlertProps
} from '@expcat/tigercat-core'

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>, CoreAlertProps {
  /**
   * Alert content (React children)
   */
  children?: React.ReactNode

  /**
   * Custom title content (overrides title prop)
   */
  titleSlot?: React.ReactNode

  /**
   * Custom description content (overrides description prop)
   */
  descriptionSlot?: React.ReactNode

  /**
   * Callback when alert is closed
   */
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

/**
 * Icon component
 */
const Icon: React.FC<{ path: string; className: string }> = ({ path, className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox={icon24ViewBox}
    stroke="currentColor"
    strokeWidth={icon24StrokeWidth}>
    <path
      strokeLinecap={icon24PathStrokeLinecap}
      strokeLinejoin={icon24PathStrokeLinejoin}
      d={path}
    />
  </svg>
)

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  size = 'md',
  title,
  description,
  showIcon = true,
  closable = false,
  closeAriaLabel = 'Close alert',
  className,
  children,
  titleSlot,
  descriptionSlot,
  onClose,
  ...props
}) => {
  const [visible, setVisible] = useState(true)

  const colorScheme = useMemo(
    () => getAlertTypeClasses(type, defaultAlertThemeColors),
    [type]
  )

  const alertClasses = useMemo(
    () =>
      classNames(
        alertBaseClasses,
        alertSizeClasses[size],
        colorScheme.bg,
        colorScheme.border,
        className
      ),
    [size, colorScheme, className]
  )

  const iconClasses = useMemo(
    () => classNames(alertIconSizeClasses[size], colorScheme.icon),
    [size, colorScheme]
  )
  const titleClasses = useMemo(
    () => classNames(alertTitleSizeClasses[size], colorScheme.title),
    [size, colorScheme]
  )
  const descriptionClasses = useMemo(
    () => classNames(alertDescriptionSizeClasses[size], colorScheme.description),
    [size, colorScheme]
  )
  const closeButtonClasses = useMemo(
    () =>
      classNames(
        alertCloseButtonBaseClasses,
        colorScheme.closeButton,
        colorScheme.closeButtonHover,
        colorScheme.focus
      ),
    [colorScheme]
  )

  const handleClose = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClose?.(event)
      if (!event.defaultPrevented) {
        setVisible(false)
      }
    },
    [onClose]
  )

  if (!visible) {
    return null
  }

  const iconPath = getAlertIconPath(type)

  const hasTitle = !!(title || titleSlot)
  const hasDescription = !!(description || descriptionSlot)
  const hasDefaultContent = !hasTitle && !hasDescription && !!children
  const hasContent = hasTitle || hasDescription || hasDefaultContent

  return (
    <div {...props} className={alertClasses} role="alert">
      {showIcon && (
        <div className={alertIconContainerClasses}>
          <Icon path={iconPath} className={iconClasses} />
        </div>
      )}

      {hasContent && (
        <div className={alertContentClasses}>
          {hasTitle && <div className={titleClasses}>{titleSlot || title}</div>}
          {hasDescription && (
            <div className={descriptionClasses}>{descriptionSlot || description}</div>
          )}
          {hasDefaultContent && <div className={titleClasses}>{children}</div>}
        </div>
      )}

      {closable && (
        <button
          className={closeButtonClasses}
          onClick={handleClose}
          aria-label={closeAriaLabel}
          type="button">
          <Icon path={alertCloseIconPath} className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
