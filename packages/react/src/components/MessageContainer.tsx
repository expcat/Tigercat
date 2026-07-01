import React, { useCallback, useEffect, useState } from 'react'
import {
  ANIMATION_DURATION_MS,
  classNames,
  defaultMessageThemeColors,
  getMessageIconPath,
  getMessageTypeClasses,
  messageBaseClasses,
  messageCloseButtonClasses,
  messageCloseIconPath,
  messageContainerBaseClasses,
  messageContentClasses,
  messageIconClasses,
  messageLoadingSpinnerClasses,
  messagePositionClasses,
  type MessageInstance,
  type MessagePosition
} from '@expcat/tigercat-core'
import { StatusIcon, StatusIconWithLoading } from './shared/icons'

const MESSAGE_CONTAINER_ID = 'tiger-message-container'
const MESSAGE_CLOSE_ARIA_LABEL = 'Close message'

interface MessageItemProps {
  message: MessageInstance
  onClose?: (id: string | number) => void
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const colorScheme = getMessageTypeClasses(message.type, defaultMessageThemeColors)

  const messageClasses = classNames(
    messageBaseClasses,
    colorScheme.bg,
    colorScheme.border,
    colorScheme.text,
    message.className,
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
  )

  const iconPath = message.icon || getMessageIconPath(message.type)
  const iconClass = classNames(messageIconClasses, colorScheme.icon)

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => onClose?.(message.id), ANIMATION_DURATION_MS)
  }, [message.id, onClose])

  const a11yRole = message.type === 'error' ? 'alert' : 'status'
  const ariaLive = message.type === 'error' ? 'assertive' : 'polite'

  return (
    <div
      className={messageClasses}
      role={a11yRole}
      aria-live={ariaLive}
      aria-atomic="true"
      aria-busy={message.type === 'loading' || undefined}
      data-tiger-message
      data-tiger-message-type={message.type}
      data-tiger-message-id={String(message.id)}>
      <StatusIconWithLoading
        path={iconPath}
        className={iconClass}
        isLoading={message.type === 'loading'}
        spinnerClass={messageLoadingSpinnerClasses}
      />
      <div className={messageContentClasses}>{message.content}</div>
      {message.closable && (
        <button
          className={messageCloseButtonClasses}
          onClick={handleClose}
          aria-label={message.closeAriaLabel ?? MESSAGE_CLOSE_ARIA_LABEL}
          type="button">
          <StatusIcon path={messageCloseIconPath} className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export interface MessageContainerProps {
  position?: MessagePosition
  messages?: MessageInstance[]
  onClose?: (id: string | number) => void
}

export const MessageContainer: React.FC<MessageContainerProps> = ({
  position = 'top',
  messages = [],
  onClose
}) => {
  const containerClasses = classNames(messageContainerBaseClasses, messagePositionClasses[position])
  const containerId =
    position === 'top' ? MESSAGE_CONTAINER_ID : `${MESSAGE_CONTAINER_ID}-${position}`

  return (
    <div
      className={containerClasses}
      id={containerId}
      aria-live="polite"
      aria-relevant="additions"
      data-tiger-message-position={position}
      data-tiger-message-container>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} onClose={onClose} />
      ))}
    </div>
  )
}

export default MessageContainer
