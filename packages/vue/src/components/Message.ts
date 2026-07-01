import { createApp, defineComponent, h, ref, type App } from 'vue'
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

export { MessageContainer } from './MessageContainer'
export type { VueMessageContainerProps } from './MessageContainer'

const MESSAGE_CONTAINER_ID = 'tiger-message-container'
const MESSAGE_CONTAINER_ROOT_ID = `${MESSAGE_CONTAINER_ID}-root`
const MESSAGE_POSITIONS: MessagePosition[] = [
  'top',
  'top-left',
  'top-right',
  'bottom',
  'bottom-left',
  'bottom-right'
]

type InternalMessageInstance = MessageInstance & { position: MessagePosition }

const messageInstances = ref<InternalMessageInstance[]>([])
let containerApp: App<Element> | null = null
let getNextInstanceId: ReturnType<typeof createInstanceCounter> | null = null

export type VueMessageProps = MessageOptions

function getMessageInstanceId(): string | number {
  getNextInstanceId ??= createInstanceCounter()
  return getNextInstanceId()
}

const MessageHost = /* @__PURE__ */ defineComponent({
  name: 'TigerMessageHost',
  setup() {
    return () =>
      MESSAGE_POSITIONS.map((position) => {
        const positionedMessages = messageInstances.value.filter(
          (message) => message.position === position
        )
        if (positionedMessages.length === 0) return null
        return h(MessageContainer, {
          key: position,
          position,
          messages: positionedMessages,
          onClose: removeMessage
        })
      })
  }
})

function ensureContainer() {
  if (!isBrowser()) {
    return
  }

  const existingRootEl = document.getElementById(MESSAGE_CONTAINER_ROOT_ID)

  if (containerApp && !existingRootEl) {
    containerApp = null
  }

  if (containerApp) {
    return
  }

  let rootEl = existingRootEl
  if (!rootEl) {
    rootEl = document.createElement('div')
    rootEl.id = MESSAGE_CONTAINER_ROOT_ID
    document.body.appendChild(rootEl)
  }

  containerApp = createApp(MessageHost)
  containerApp.mount(rootEl)
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
    closeAriaLabel: config.closeAriaLabel,
    position: config.position ?? 'top'
  }

  messageInstances.value.push(instance)
  ensureContainer()

  if (instance.duration > 0) {
    setTimeout(() => {
      removeMessage(id)
    }, instance.duration)
  }

  return () => removeMessage(id)
}

function removeMessage(id: string | number) {
  const index = messageInstances.value.findIndex((msg) => msg.id === id)
  if (index !== -1) {
    const instance = messageInstances.value[index]
    messageInstances.value.splice(index, 1)
    instance.onClose?.()
  }
}

function clearAll() {
  messageInstances.value.forEach((instance) => {
    instance.onClose?.()
  })

  messageInstances.value = []

  if (containerApp) {
    containerApp.unmount()
    containerApp = null
  }
  if (isBrowser()) {
    const rootEl = document.getElementById(MESSAGE_CONTAINER_ROOT_ID)
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
