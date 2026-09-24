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
import { useResolvedTigerLocale } from './ConfigProvider'

import { OverlayPortal } from '../utils/overlay-outlet'

interface MessageItemProps {
  message: MessageInstance
  locale?: Partial<TigerLocale>
  onClose?: (id: string | number) => void
  onPause?: (id: string | number) => void
  onResume?: (id: string | number) => void
}

const MessageItem: React.FC<MessageItemProps> = ({ message, locale, onClose, onPause, onResume }) => {
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
      data-tiger-message-id={String(message.id)}
      onPointerEnter={() => onPause?.(message.id)}
      onPointerLeave={() => onResume?.(message.id)}
      onFocus={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return
        onPause?.(message.id)
      }}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return
        onResume?.(message.id)
      }}>
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
  onPause?: (id: string | number) => void
  onResume?: (id: string | number) => void
  /**
   * Render into the ConfigProvider overlay outlet. The imperative host passes
   * `false` because it is already in that tree.
   * @default true
   */
  portal?: boolean
}

export const MessageContainer: React.FC<MessageContainerProps> = ({
  position = 'top',
  messages = [],
  onClose,
  onPause,
  onResume,
  portal = true
}) => {
  const locale = useResolvedTigerLocale()
  const containerClasses = classNames(messageContainerBaseClasses, messagePositionClasses[position])

  const node = (
    <div
      className={containerClasses}
      data-tiger-toast=""
      data-tiger-message-position={position}
      data-tiger-message-container>
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
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

export default MessageContainer
