import { isBrowser, type MessageOptions, type MessageType } from '@expcat/tigercat-core'

export type { MessageOptions, MessageProps } from '@expcat/tigercat-core'

type MessageClose = () => void

let messageModulePromise: Promise<typeof import('./Message')> | null = null
let resolvedMessage: (typeof import('./Message'))['Message'] | null = null

function loadMessageModule(): Promise<typeof import('./Message')> {
  messageModulePromise ??= import('./Message').then((module) => {
    resolvedMessage = module.Message
    return module
  })
  return messageModulePromise
}

function forwardMessage(method: MessageType, options: MessageOptions): MessageClose {
  if (!isBrowser()) return () => undefined
  if (resolvedMessage) {
    return resolvedMessage[method](options)
  }
  let closeMessage: MessageClose | null = null
  let requestedClose = false
  void loadMessageModule().then(({ Message }) => {
    const close = Message[method](options)
    if (requestedClose) {
      close()
    } else {
      closeMessage = close
    }
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
    if (!isBrowser()) return
    if (resolvedMessage) {
      resolvedMessage.clear()
      return
    }
    void loadMessageModule().then(({ Message }) => {
      Message.clear()
    })
  }
}
