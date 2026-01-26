import React, { useState, useEffect, useCallback } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { flushSync } from 'react-dom'
import {
  classNames,
  icon24PathStrokeLinecap,
  icon24PathStrokeLinejoin,
  icon24StrokeWidth,
  icon24ViewBox,
  getMessageTypeClasses,
  defaultMessageThemeColors,
  messageContainerBaseClasses,
  messagePositionClasses,
  messageBaseClasses,
  messageIconClasses,
  messageContentClasses,
  messageCloseButtonClasses,
  messageLoadingSpinnerClasses,
  getMessageIconPath,
  messageCloseIconPath,
  isBrowser,
  type MessagePosition,
  type MessageInstance,
  type MessageOptions,
  type MessageConfig
} from '@expcat/tigercat-core'

/**
 * Global message container id
 */
const MESSAGE_CONTAINER_ID = 'tiger-message-container'
const MESSAGE_CLOSE_ARIA_LABEL = 'Close message'

/**
 * Message instance storage
 */
let messageInstances: MessageInstance[] = []
let instanceIdCounter = 0
let containerRoot: Root | null = null
let updateCallback: (() => void) | null = null

/**
 * Get next instance id
 */
function getNextInstanceId(): number {
  return ++instanceIdCounter
}

/**
 * Icon component
 */
const Icon: React.FC<{
  path: string
  className: string
  isLoading?: boolean
}> = ({ path, className, isLoading = false }) => {
  const iconClass = classNames(className, isLoading ? messageLoadingSpinnerClasses : '')

  return (
    <svg
      className={iconClass}
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
}

/**
 * Single message item component
 */
interface MessageItemProps {
  message: MessageInstance
  onClose: (id: string | number) => void
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10)
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
    setTimeout(() => onClose(message.id), 300)
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
      <Icon path={iconPath} className={iconClass} isLoading={message.type === 'loading'} />
      <div className={messageContentClasses}>{message.content}</div>
      {message.closable && (
        <button
          className={messageCloseButtonClasses}
          onClick={handleClose}
          aria-label={MESSAGE_CLOSE_ARIA_LABEL}
          type="button">
          <Icon path={messageCloseIconPath} className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

/**
 * Message container props
 */
export interface MessageContainerProps {
  position?: MessagePosition
}

/**
 * Message container component
 */
export const MessageContainer: React.FC<MessageContainerProps> = ({ position = 'top' }) => {
  const [messages, setMessages] = useState<MessageInstance[]>(() => [...messageInstances])

  useEffect(() => {
    // Register update callback
    updateCallback = () => {
      flushSync(() => {
        setMessages([...messageInstances])
      })
    }

    // Initial sync
    updateCallback()

    return () => {
      updateCallback = null
    }
  }, [])

  const containerClasses = classNames(messageContainerBaseClasses, messagePositionClasses[position])

  const handleRemove = useCallback((id: string | number) => {
    const index = messageInstances.findIndex((msg) => msg.id === id)
    if (index !== -1) {
      const instance = messageInstances[index]
      messageInstances.splice(index, 1)
      if (instance.onClose) {
        instance.onClose()
      }
      if (updateCallback) {
        updateCallback()
      }
    }
  }, [])

  return (
    <div
      className={containerClasses}
      id={MESSAGE_CONTAINER_ID}
      aria-live="polite"
      aria-relevant="additions"
      data-tiger-message-container>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} onClose={handleRemove} />
      ))}
    </div>
  )
}

/**
 * Ensure message container exists
 */
function ensureContainer() {
  if (!isBrowser()) {
    return
  }

  const rootId = `${MESSAGE_CONTAINER_ID}-root`

  // If we already created a root but the DOM was externally cleared (e.g. tests), reset.
  const existingRootEl = document.getElementById(rootId)
  if (containerRoot && !existingRootEl) {
    containerRoot = null
    updateCallback = null
  }

  if (containerRoot) {
    return
  }

  let rootEl = existingRootEl
  if (!rootEl) {
    rootEl = document.createElement('div')
    rootEl.id = rootId
    document.body.appendChild(rootEl)
  }

  containerRoot = createRoot(rootEl)
  flushSync(() => {
    containerRoot?.render(<MessageContainer />)
  })
}

/**
 * Add a message to the queue
 */
function addMessage(config: MessageConfig): () => void {
  const id = getNextInstanceId()

  const instance: MessageInstance = {
    id,
    type: config.type || 'info',
    content: config.content,
    duration: config.duration !== undefined ? config.duration : 3000,
    closable: config.closable || false,
    onClose: config.onClose,
    icon: config.icon,
    className: config.className
  }

  messageInstances.push(instance)

  // Ensure container exists after state is updated so it can render immediately.
  ensureContainer()

  // Trigger update
  if (updateCallback) {
    updateCallback()
  }

  // Auto close after duration
  if (instance.duration > 0) {
    setTimeout(() => {
      removeMessage(id)
    }, instance.duration)
  }

  // Return close function
  return () => removeMessage(id)
}

/**
 * Remove a message from the queue
 */
function removeMessage(id: string | number) {
  const index = messageInstances.findIndex((msg) => msg.id === id)
  if (index !== -1) {
    const instance = messageInstances[index]
    messageInstances.splice(index, 1)
    if (instance.onClose) {
      instance.onClose()
    }
    if (updateCallback) {
      updateCallback()
    }
  }
}

/**
 * Clear all messages
 */
function clearAll() {
  messageInstances.forEach((instance) => {
    if (instance.onClose) {
      instance.onClose()
    }
  })
  messageInstances = []
  if (updateCallback) {
    updateCallback()
  }

  // For a singleton-style API, clearing should also reset the mounted root.
  // This prevents tests or consumers that manipulate the DOM from leaving a stale root.
  if (containerRoot) {
    containerRoot.unmount()
    containerRoot = null
  }
  updateCallback = null

  const rootId = `${MESSAGE_CONTAINER_ID}-root`
  if (isBrowser()) {
    const rootEl = document.getElementById(rootId)
    if (rootEl?.parentNode) {
      rootEl.parentNode.removeChild(rootEl)
    }
  }
}

/**
 * Normalize message options
 */
function normalizeOptions(options: MessageOptions): MessageConfig {
  if (typeof options === 'string') {
    return { content: options }
  }
  return options
}

/**
 * Message API
 */
export const Message = {
  /**
   * Show an info message
   */
  info(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'info' })
  },

  /**
   * Show a success message
   */
  success(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'success' })
  },

  /**
   * Show a warning message
   */
  warning(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'warning' })
  },

  /**
   * Show an error message
   */
  error(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'error' })
  },

  /**
   * Show a loading message
   */
  loading(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'loading', duration: 0 })
  },

  /**
   * Clear all messages
   */
  clear() {
    clearAll()
  }
}

export default Message
