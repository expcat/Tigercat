import React from 'react'
import {
  classNames,
  defaultMessageThemeColors,
  getMessageCloseAriaLabel,
  getMessageIconPath,
  getMessageTypeClasses,
  getToastItemRole,
  messageBaseClasses,
  messageCloseButtonClasses,
  messageCloseIconPath,
  messageContainerBaseClasses,
  messageContentClasses,
  messageIconClasses,
  messageLoadingSpinnerClasses,
  messagePositionClasses,
  type MessageInstance,
  type MessagePosition,
  type TigerLocale
} from '@expcat/tigercat-core'
import { StatusIcon, StatusIconWithLoading } from './shared/icons'
import { useTigerConfig } from './ConfigProvider'
import { getGlobalTigerLocale } from '../utils/global-locale'
import { renderBodyPortal } from '../utils/overlay'

interface MessageItemProps {
  message: MessageInstance
  locale?: Partial<TigerLocale>
  onClose?: (id: string | number) => void
}

const MessageItem: React.FC<MessageItemProps> = ({ message, locale, onClose }) => {
  const colorScheme = getMessageTypeClasses(message.type, defaultMessageThemeColors)
  const messageClasses = classNames(
    messageBaseClasses,
    colorScheme.bg,
    colorScheme.border,
    colorScheme.text,
    message.className
  )
  const iconPath = message.icon || getMessageIconPath(message.type)
  const iconClass = classNames(messageIconClasses, colorScheme.icon)
  const a11yRole = getToastItemRole(message.type)
  const closeLabel = getMessageCloseAriaLabel(locale, message.closeAriaLabel)

  return (
    <div
      className={messageClasses}
      role={a11yRole}
      aria-busy={message.type === 'loading' || undefined}
      data-tiger-message
      data-tiger-message-type={message.type}
      data-tiger-message-id={String(message.id)}>
      <StatusIconWithLoading
        path={iconPath}
        className={iconClass}
        isLoading={message.type === 'loading'}
        spinnerClass={messageLoadingSpinnerClasses}
        aria-hidden="true"
        focusable="false"
      />
      <div className={messageContentClasses}>{message.content}</div>
      {message.closable && (
        <button
          className={messageCloseButtonClasses}
          onClick={() => onClose?.(message.id)}
          aria-label={closeLabel}
          type="button">
          <StatusIcon
            path={messageCloseIconPath}
            className="w-4 h-4"
            aria-hidden="true"
            focusable="false"
          />
        </button>
      )}
    </div>
  )
}

export interface MessageContainerProps {
  position?: MessagePosition
  messages?: MessageInstance[]
  onClose?: (id: string | number) => void
  /**
   * Portal through the overlay-host chain. Imperative hosts pass `false`
   * because they are already mounted on that target.
   * @default true
   */
  portal?: boolean
}

export const MessageContainer: React.FC<MessageContainerProps> = ({
  position = 'top',
  messages = [],
  onClose,
  portal = true
}) => {
  const config = useTigerConfig()
  const locale = config.locale ?? getGlobalTigerLocale()
  const containerClasses = classNames(messageContainerBaseClasses, messagePositionClasses[position])

  const node = (
    <div
      className={containerClasses}
      data-tiger-message-position={position}
      data-tiger-message-container>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} locale={locale} onClose={onClose} />
      ))}
    </div>
  )

  return portal ? renderBodyPortal(node) : node
}

export default MessageContainer
