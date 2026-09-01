import { createApp, defineComponent, h, onBeforeUnmount, shallowRef, type App } from 'vue'
import {
  createImperativeHost,
  createToastQueue,
  isBrowser,
  normalizeStringOption,
  resolveMessageDuration,
  type MessageConfig,
  type MessageInstance,
  type MessageOptions,
  type MessagePosition
} from '@expcat/tigercat-core'
import { MessageContainer } from './MessageContainer'

export { MessageContainer } from './MessageContainer'
export type { VueMessageContainerProps } from './MessageContainer'

const MESSAGE_POSITIONS: MessagePosition[] = [
  'top',
  'top-left',
  'top-right',
  'bottom',
  'bottom-left',
  'bottom-right'
]

type InternalMessageInstance = MessageInstance & { position: MessagePosition }

const messageQueue = createToastQueue<InternalMessageInstance>()
const host = createImperativeHost<App<Element>>({
  mount(element) {
    const app = createApp(MessageHost)
    app.mount(element)
    return app
  },
  unmount(app) {
    app.unmount()
  }
})

messageQueue.subscribe(() => {
  if (messageQueue.getSnapshot().length > 0) return
  queueMicrotask(() => {
    if (messageQueue.getSnapshot().length === 0) host.teardown()
  })
})

const MessageHost = /* @__PURE__ */ defineComponent({
  name: 'TigerMessageHost',
  setup() {
    const messages = shallowRef<readonly InternalMessageInstance[]>(messageQueue.getSnapshot())
    const stop = messageQueue.subscribe(() => {
      messages.value = messageQueue.getSnapshot()
    })
    onBeforeUnmount(stop)

    return () =>
      MESSAGE_POSITIONS.map((position) => {
        const positionedMessages = messages.value.filter((message) => message.position === position)
        if (positionedMessages.length === 0) return null
        return h(MessageContainer, {
          key: position,
          position,
          messages: [...positionedMessages],
          portal: false,
          onClose: (id: string | number) => messageQueue.remove(id)
        })
      })
  }
})

function addMessage(config: MessageConfig): () => void {
  if (!isBrowser()) return () => undefined

  const type = config.type || 'info'
  const instance = messageQueue.add({
    type,
    content: config.content,
    duration: resolveMessageDuration(type, config.duration),
    closable: config.closable || false,
    onClose: config.onClose,
    icon: config.icon,
    className: config.className,
    closeAriaLabel: config.closeAriaLabel,
    position: config.position ?? 'top'
  })

  if (!instance) return () => undefined
  host.ensure()
  return () => {
    messageQueue.remove(instance.id)
  }
}

function normalizeOptions(options: MessageOptions): MessageConfig {
  return normalizeStringOption<MessageConfig>(options, 'content')
}

export const Message = {
  info(options: MessageOptions): () => void {
    return addMessage({ ...normalizeOptions(options), type: 'info' })
  },
  success(options: MessageOptions): () => void {
    return addMessage({ ...normalizeOptions(options), type: 'success' })
  },
  warning(options: MessageOptions): () => void {
    return addMessage({ ...normalizeOptions(options), type: 'warning' })
  },
  error(options: MessageOptions): () => void {
    return addMessage({ ...normalizeOptions(options), type: 'error' })
  },
  loading(options: MessageOptions): () => void {
    return addMessage({ ...normalizeOptions(options), type: 'loading' })
  },
  clear() {
    messageQueue.clear()
    host.teardown()
  }
}

export default Message
