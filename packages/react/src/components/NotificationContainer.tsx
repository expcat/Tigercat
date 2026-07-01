import React, { useEffect, useState } from 'react'
import {
  ANIMATION_DURATION_MS,
  classNames,
  getNotificationIconPath,
  getNotificationTypeClasses,
  notificationActionButtonClasses,
  notificationActionButtonTypeClasses,
  notificationActionsClasses,
  notificationBaseClasses,
  notificationCloseButtonClasses,
  notificationCloseIconClasses,
  notificationCloseIconPath,
  notificationContainerBaseClasses,
  notificationContentClasses,
  notificationDescriptionClasses,
  notificationIconClasses,
  notificationPositionClasses,
  notificationTitleClasses,
  type NotificationInstance,
  type NotificationPosition
} from '@expcat/tigercat-core'
import { StatusIcon } from './shared/icons'

const NOTIFICATION_CONTAINER_ID_PREFIX = 'tiger-notification-container'

interface NotificationItemProps {
  notification: NotificationInstance
  onClose?: (id: string | number) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const colorScheme = getNotificationTypeClasses(notification.type)

  const notificationClasses = classNames(
    notificationBaseClasses,
    colorScheme.bg,
    colorScheme.border,
    notification.className,
    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
  )

  const iconPath = notification.icon || getNotificationIconPath(notification.type)
  const iconClass = classNames(notificationIconClasses, colorScheme.icon)

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(notification.id), ANIMATION_DURATION_MS)
  }

  const a11yRole = notification.type === 'error' ? 'alert' : 'status'
  const ariaLive = notification.type === 'error' ? 'assertive' : 'polite'

  return (
    <div
      className={notificationClasses}
      role={a11yRole}
      aria-live={ariaLive}
      aria-atomic="true"
      onClick={notification.onClick}
      onKeyDown={(e) => {
        if (!notification.onClick) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          notification.onClick()
        }
      }}
      tabIndex={notification.onClick ? 0 : undefined}
      style={notification.onClick ? { cursor: 'pointer' } : undefined}
      data-tiger-notification=""
      data-tiger-notification-type={notification.type}
      data-tiger-notification-id={String(notification.id)}>
      <StatusIcon path={iconPath} className={iconClass} aria-hidden="true" focusable="false" />
      <div className={notificationContentClasses}>
        <div className={classNames(notificationTitleClasses, colorScheme.titleText)}>
          {notification.title}
        </div>
        {notification.description && (
          <div className={classNames(notificationDescriptionClasses, colorScheme.descriptionText)}>
            {notification.description}
          </div>
        )}
        {notification.actions && notification.actions.length > 0 && (
          <div className={notificationActionsClasses}>
            {notification.actions.map((action) => (
              <button
                key={action.key ?? action.label}
                className={classNames(
                  notificationActionButtonClasses,
                  notificationActionButtonTypeClasses[action.type ?? 'default']
                )}
                type="button"
                disabled={action.disabled}
                onClick={(event) => {
                  event.stopPropagation()
                  action.onClick?.({
                    id: notification.id,
                    close: handleClose
                  })
                  if (action.closeOnClick) {
                    handleClose()
                  }
                }}>
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {notification.closable && (
        <button
          className={notificationCloseButtonClasses}
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          aria-label={notification.closeAriaLabel ?? 'Close notification'}
          type="button">
          <StatusIcon path={notificationCloseIconPath} className={notificationCloseIconClasses} />
        </button>
      )}
    </div>
  )
}

export interface NotificationContainerProps {
  position?: NotificationPosition
  notifications?: NotificationInstance[]
  onClose?: (id: string | number) => void
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position = 'top-right',
  notifications = [],
  onClose
}) => {
  const containerClasses = classNames(
    notificationContainerBaseClasses,
    notificationPositionClasses[position]
  )

  return (
    <div
      className={containerClasses}
      id={`${NOTIFICATION_CONTAINER_ID_PREFIX}-${position}`}
      aria-live="polite"
      aria-relevant="additions"
      data-tiger-notification-container=""
      data-tiger-notification-position={position}>
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onClose={onClose} />
      ))}
    </div>
  )
}

export default NotificationContainer
