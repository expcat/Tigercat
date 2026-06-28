import { computed, defineComponent, h, Teleport, TransitionGroup, type PropType } from 'vue'
import {
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
import { createStatusIcon, createStatusIconWithLoading } from '../utils/icon-helpers'

const MESSAGE_CONTAINER_ID = 'tiger-message-container'
const MESSAGE_CLOSE_ARIA_LABEL = 'Close message'

const IS_TEST_ENV = (() => {
  const proc = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process
  return typeof proc !== 'undefined' && proc.env?.NODE_ENV === 'test'
})()

export interface VueMessageContainerProps {
  position?: MessagePosition
  messages?: MessageInstance[]
  onClose?: (id: string | number) => void
}

export const MessageContainer = /* @__PURE__ */ defineComponent({
  name: 'TigerMessageContainer',
  props: {
    position: {
      type: String as PropType<MessagePosition>,
      default: 'top' as MessagePosition
    },
    messages: {
      type: Array as PropType<MessageInstance[]>,
      default: () => []
    },
    onClose: Function as PropType<(id: string | number) => void>
  },
  setup(props) {
    const containerClasses = computed(() => {
      return classNames(messageContainerBaseClasses, messagePositionClasses[props.position])
    })

    const renderMessageItem = (message: MessageInstance) => {
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

      const a11yRole = message.type === 'error' ? 'alert' : 'status'
      const ariaLive = message.type === 'error' ? 'assertive' : 'polite'

      const children = [
        createStatusIconWithLoading(
          iconPath,
          iconClass,
          message.type === 'loading',
          messageLoadingSpinnerClasses
        ),
        h('div', { class: messageContentClasses }, message.content)
      ]

      if (message.closable) {
        children.push(
          h(
            'button',
            {
              class: messageCloseButtonClasses,
              onClick: () => props.onClose?.(message.id),
              'aria-label': MESSAGE_CLOSE_ARIA_LABEL,
              type: 'button'
            },
            createStatusIcon(messageCloseIconPath, 'w-4 h-4')
          )
        )
      }

      return h(
        'div',
        {
          key: message.id,
          class: messageClasses,
          role: a11yRole,
          'aria-live': ariaLive,
          'aria-atomic': 'true',
          'aria-busy': message.type === 'loading' ? 'true' : undefined,
          'data-tiger-message': '',
          'data-tiger-message-type': message.type,
          'data-tiger-message-id': String(message.id)
        },
        children
      )
    }

    return () =>
      h(
        Teleport,
        { to: 'body' },
        h(
          'div',
          {
            class: containerClasses.value,
            id:
              props.position === 'top'
                ? MESSAGE_CONTAINER_ID
                : `${MESSAGE_CONTAINER_ID}-${props.position}`,
            'aria-live': 'polite',
            'aria-relevant': 'additions',
            'data-tiger-message-position': props.position,
            'data-tiger-message-container': ''
          },
          IS_TEST_ENV
            ? props.messages.map(renderMessageItem)
            : h(TransitionGroup, { name: 'message' }, () => props.messages.map(renderMessageItem))
        )
      )
  }
})

export default MessageContainer
