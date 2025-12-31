import React, { useState, useMemo } from 'react'
import { 
  classNames, 
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
  type AlertProps as CoreAlertProps,
} from '@tigercat/core'

export interface AlertProps extends CoreAlertProps {
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
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
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
  className,
  children,
  titleSlot,
  descriptionSlot,
  onClose,
  ...props
}) => {
  const [visible, setVisible] = useState(true)
  
  const colorScheme = useMemo(() => getAlertTypeClasses(type, defaultAlertThemeColors), [type])

  const alertClasses = useMemo(() => {
    return classNames(
      alertBaseClasses,
      alertSizeClasses[size],
      colorScheme.bg,
      colorScheme.border,
      className
    )
  }, [size, colorScheme, className])

  const iconClasses = useMemo(() => {
    return classNames(
      alertIconSizeClasses[size],
      colorScheme.icon
    )
  }, [size, colorScheme])

  const titleClasses = useMemo(() => {
    return classNames(
      alertTitleSizeClasses[size],
      colorScheme.title
    )
  }, [size, colorScheme])

  const descriptionClasses = useMemo(() => {
    return classNames(
      alertDescriptionSizeClasses[size],
      colorScheme.description
    )
  }, [size, colorScheme])

  const closeButtonClasses = useMemo(() => {
    return classNames(
      alertCloseButtonBaseClasses,
      colorScheme.closeButton,
      colorScheme.closeButtonHover,
      colorScheme.focus
    )
  }, [colorScheme])

  const handleClose = (event: React.MouseEvent<HTMLButtonElement>) => {
    setVisible(false)
    if (onClose) {
      onClose(event)
    }
  }

  if (!visible) {
    return null
  }

  const iconPath = getAlertIconPath(type)

  return (
    <div className={alertClasses} role="alert" {...props}>
      {/* Icon */}
      {showIcon && (
        <div className={alertIconContainerClasses}>
          <Icon path={iconPath} className={iconClasses} />
        </div>
      )}

      {/* Content */}
      <div className={alertContentClasses}>
        {/* Title */}
        {(title || titleSlot) && (
          <div className={titleClasses}>
            {titleSlot || title}
          </div>
        )}

        {/* Description */}
        {(description || descriptionSlot) && (
          <div className={descriptionClasses}>
            {descriptionSlot || description}
          </div>
        )}

        {/* Default content if no title/description */}
        {!title && !description && !titleSlot && !descriptionSlot && children && (
          <div className={titleClasses}>
            {children}
          </div>
        )}
      </div>

      {/* Close button */}
      {closable && (
        <button
          className={closeButtonClasses}
          onClick={handleClose}
          aria-label="Close alert"
          type="button"
        >
          <Icon path={alertCloseIconPath} className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
