import type { MessageOptions, MessageType } from '@expcat/tigercat-core'

export type MessageProps = MessageOptions

type MessageClose = () => void

function forwardMessage(method: MessageType, options: MessageOptions): MessageClose {
  let closeMessage: MessageClose | null = null
  let requestedClose = false
  queueMicrotask(() => {
    void import('./Message').then(({ Message }) => {
      const close = Message[method](options)
      if (requestedClose) {
        close()
      } else {
        closeMessage = close
      }
    })
  })

  return () => {
    if (closeMessage) {
      closeMessage()
      closeMessage = null
    } else {
      requestedClose = true
    }
  }
}

export const Message: Record<MessageType, (options: MessageOptions) => MessageClose> & {
  clear: () => void
} = {
  success(options) {
    return forwardMessage('success', options)
  },
  warning(options) {
    return forwardMessage('warning', options)
  },
  error(options) {
    return forwardMessage('error', options)
  },
  info(options) {
    return forwardMessage('info', options)
  },
  loading(options) {
    return forwardMessage('loading', options)
  },
  clear() {
    queueMicrotask(() => {
      void import('./Message').then(({ Message }) => {
        Message.clear()
      })
    })
  }
}
