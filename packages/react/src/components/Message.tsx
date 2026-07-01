import React, { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import {
  createInstanceCounter,
  isBrowser,
  normalizeStringOption,
  type MessageConfig,
  type MessageInstance,
  type MessageOptions,
  type MessagePosition
} from '@expcat/tigercat-core'
import { MessageContainer } from './MessageContainer'
import { getGlobalTigerLocale } from '../utils/global-locale'

export { MessageContainer } from './MessageContainer'
export type { MessageContainerProps } from './MessageContainer'

const MESSAGE_CONTAINER_ID = 'tiger-message-container'
const MESSAGE_POSITIONS: MessagePosition[] = [
  'top',
  'top-left',
  'top-right',
  'bottom',
  'bottom-left',
  'bottom-right'
]

type InternalMessageInstance = MessageInstance & { position: MessagePosition }

let messageInstances: InternalMessageInstance[] = []
let containerRoot: Root | null = null
let updateCallback: (() => void) | null = null
let getNextInstanceId: ReturnType<typeof createInstanceCounter> | null = null

export type MessageProps = MessageOptions

function getMessageInstanceId(): string | number {
  getNextInstanceId ??= createInstanceCounter()
  return getNextInstanceId()
}

function getDefaultMessageCloseAriaLabel(): string | undefined {
  const locale = getGlobalTigerLocale()
  const closeText = locale?.common?.closeText
  if (!closeText) return undefined
  const localeCode = locale.locale?.toLowerCase() ?? ''
  if (localeCode.startsWith('zh')) return `${closeText}消息`
  if (localeCode.startsWith('en')) return `${closeText} message`
  return closeText
}

const MessageHost: React.FC = () => {
  const [messages, setMessages] = useState<InternalMessageInstance[]>(() => [...messageInstances])

  useEffect(() => {
    updateCallback = () => {
      setMessages([...messageInstances])
    }

    return () => {
      updateCallback = null
    }
  }, [])

  return (
    <>
      {MESSAGE_POSITIONS.map((position) => {
        const positionedMessages = messages.filter((message) => message.position === position)
        if (positionedMessages.length === 0) return null
        return (
          <MessageContainer
            key={position}
            position={position}
            messages={positionedMessages}
            onClose={removeMessage}
          />
        )
      })}
    </>
  )
}

function ensureContainer() {
  if (!isBrowser()) {
    return
  }

  const rootId = `${MESSAGE_CONTAINER_ID}-root`
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
    containerRoot?.render(<MessageHost />)
  })
}

function addMessage(config: MessageConfig): () => void {
  const id = getMessageInstanceId()

  const instance: InternalMessageInstance = {
    id,
    type: config.type || 'info',
    content: config.content,
    duration: config.duration !== undefined ? config.duration : 3000,
    closable: config.closable || false,
    onClose: config.onClose,
    icon: config.icon,
    className: config.className,
    closeAriaLabel: config.closeAriaLabel ?? getDefaultMessageCloseAriaLabel(),
    position: config.position ?? 'top'
  }

  messageInstances.push(instance)

  const rootId = `${MESSAGE_CONTAINER_ID}-root`
  const shouldUpdateExistingContainer =
    isBrowser() && containerRoot !== null && document.getElementById(rootId) !== null

  ensureContainer()

  if (shouldUpdateExistingContainer && updateCallback) {
    updateCallback()
  }

  if (instance.duration > 0) {
    setTimeout(() => {
      removeMessage(id)
    }, instance.duration)
  }

  return () => removeMessage(id)
}

function removeMessage(id: string | number) {
  const index = messageInstances.findIndex((msg) => msg.id === id)
  if (index !== -1) {
    const instance = messageInstances[index]
    messageInstances.splice(index, 1)
    instance.onClose?.()
    updateCallback?.()
  }
}

function clearAll() {
  messageInstances.forEach((instance) => {
    instance.onClose?.()
  })
  messageInstances = []
  updateCallback?.()

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

function normalizeOptions(options: MessageOptions): MessageConfig {
  return normalizeStringOption<MessageConfig>(options, 'content')
}

export const Message = {
  info(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'info' })
  },
  success(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'success' })
  },
  warning(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'warning' })
  },
  error(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'error' })
  },
  loading(options: MessageOptions): () => void {
    const config = normalizeOptions(options)
    return addMessage({ ...config, type: 'loading', duration: 0 })
  },
  clear() {
    clearAll()
  }
}

export default Message
