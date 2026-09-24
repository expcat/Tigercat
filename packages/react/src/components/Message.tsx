import {
  clearMessages,
  enqueueMessage,
  getActiveFeedbackScope,
  settleMessage,
  type MessageOptions,
  type MessagePromisePhases
} from '@expcat/tigercat-core'

export { MessageContainer } from './MessageContainer'
export type { MessageContainerProps } from './MessageContainer'

function open(type: 'info' | 'success' | 'warning' | 'error' | 'loading', options: MessageOptions) {
  return enqueueMessage(getActiveFeedbackScope(), options, type)
}

export const Message = {
  info(options: MessageOptions): () => void {
    return open('info', options)
  },
  success(options: MessageOptions): () => void {
    return open('success', options)
  },
  warning(options: MessageOptions): () => void {
    return open('warning', options)
  },
  error(options: MessageOptions): () => void {
    return open('error', options)
  },
  loading(options: MessageOptions): () => void {
    return open('loading', options)
  },
  clear() {
    clearMessages(getActiveFeedbackScope())
  },
  promise<T>(key: string | number, phases: MessagePromisePhases, task: Promise<T>) {
    return settleMessage(getActiveFeedbackScope(), key, phases, task)
  }
}

export default Message
