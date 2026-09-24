import React from 'react'
import {
  classNames,
  getNotificationCloseAriaLabel,
  getNotificationIconPath,
  getNotificationTypeClasses,
  getToastItemRole,
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
  type NotificationPosition,
  type TigerLocale
} from '@expcat/tigercat-core'
import { StatusIcon } from './shared/icons'
import { useResolvedTigerLocale } from './ConfigProvider'

import { OverlayPortal } from '../utils/overlay-outlet'

interface NotificationItemProps {
  notification: NotificationInstance
  locale?: Partial<TigerLocale>
  onClose?: (id: string | number) => void
  onPause?: (id: string | number) => void
  onResume?: (id: string | number) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  locale,
  onClose,
  onPause,
  onResume
}) => {
  const colorScheme = getNotificationTypeClasses(notification.type)
  const notificationClasses = classNames(
    notificationBaseClasses,
    colorScheme.bg,
    colorScheme.border,
    notification.className
  )
  const iconPath = notification.icon || getNotificationIconPath(notification.type)
  const iconClass = classNames(notificationIconClasses, colorScheme.icon)
  const a11yRole = getToastItemRole(notification.type)
  const closeLabel = getNotificationCloseAriaLabel(locale, notification.closeAriaLabel)
  const close = () => onClose?.(notification.id)

  return (
    <div
      className={notificationClasses}
      role={a11yRole}
      data-tiger-notification=""
      data-tiger-notification-type={notification.type}
      data-tiger-notification-id={String(notification.id)}
      onPointerEnter={() => onPause?.(notification.id)}
      onPointerLeave={() => onResume?.(notification.id)}
      onFocus={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return
        onPause?.(notification.id)
      }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return
        onResume?.(notification.id)
      }}>
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
        {(notification.onClick || (notification.actions && notification.actions.length > 0)) && (
          <div className={notificationActionsClasses}>
            {notification.onClick ? (
              <button
                type="button"
                className={classNames(
                  notificationActionButtonClasses,
                  notificationActionButtonTypeClasses.primary
                )}
                onClick={() => notification.onClick?.()}>
                {notification.actionLabel || locale?.common?.viewText || 'View'}
              </button>
            ) : null}
            {notification.actions?.map((action) => (
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
                    close
                  })
                  if (action.closeOnClick) close()
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
          onClick={(event) => {
            event.stopPropagation()
            close()
          }}
          aria-label={closeLabel}
          type="button">
          <StatusIcon
            path={notificationCloseIconPath}
            className={notificationCloseIconClasses}
            aria-hidden="true"
            focusable="false"
          />
        </button>
      )}
    </div>
  )
}

export interface NotificationContainerProps {
  position?: NotificationPosition
  notifications?: NotificationInstance[]
  onClose?: (id: string | number) => void
  onPause?: (id: string | number) => void
  onResume?: (id: string | number) => void
  className?: string
  /**
   * Portal through the overlay-host chain. Imperative hosts pass `false`.
   * @default true
   */
  portal?: boolean
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position = 'top-right',
  notifications = [],
  onClose,
  onPause,
  onResume,
  className,
  portal = true
}) => {
  const locale = useResolvedTigerLocale()
  const containerClasses = classNames(
    notificationContainerBaseClasses,
    notificationPositionClasses[position],
    className
  )

  const node = (
    <div
      className={containerClasses}
      data-tiger-toast=""
      data-tiger-notification-container=""
      data-tiger-notification-position={position}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          locale={locale}
          onClose={onClose}
          onPause={onPause}
          onResume={onResume}
        />
      ))}
    </div>
  )

  return portal ? <OverlayPortal>{node}</OverlayPortal> : node
}

export default NotificationContainer
