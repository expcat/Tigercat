import { computed, defineComponent, h, type PropType } from 'vue'
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
  type MessagePosition
} from '@expcat/tigercat-core'
import { createStatusIcon, createStatusIconWithLoading } from '../utils/icon-helpers'
import { renderVueOverlayOutlet } from '../utils/overlay-outlet'
import { useResolvedTigerLocale } from './tiger-config'

export interface VueMessageContainerProps {
  position?: MessagePosition
  messages?: MessageInstance[]
  /**
   * Portal through the overlay-host chain. Imperative hosts pass `false`
   * because they are already mounted on that target.
   * @default true
   */
  portal?: boolean
}

export type MessageContainerProps = VueMessageContainerProps

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
    portal: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close', 'pause', 'resume'],
  setup(props, { emit }) {
    const locale = useResolvedTigerLocale()
    const containerClasses = computed(() =>
      classNames(messageContainerBaseClasses, messagePositionClasses[props.position])
    )

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
      const a11yRole = getToastItemRole(message.type)
      const closeLabel = getMessageCloseAriaLabel(locale.value, message.closeAriaLabel)

      const children = [
        createStatusIconWithLoading(
          iconPath,
          iconClass,
          message.type === 'loading',
          messageLoadingSpinnerClasses,
          { 'aria-hidden': 'true', focusable: 'false' }
        ),
        h('div', { class: messageContentClasses }, message.content)
      ]

      if (message.closable) {
        children.push(
          h(
            'button',
            {
              class: messageCloseButtonClasses,
              onClick: () => emit('close', message.id),
              'aria-label': closeLabel,
              type: 'button'
            },
            createStatusIcon(messageCloseIconPath, 'w-4 h-4', {
              'aria-hidden': 'true',
              focusable: 'false'
            })
          )
        )
      }

      return h(
        'div',
        {
          key: message.id,
          class: messageClasses,
          role: a11yRole,
          'aria-busy': message.type === 'loading' ? 'true' : undefined,
          'data-tiger-message': '',
          'data-tiger-message-type': message.type,
          'data-tiger-message-id': String(message.id),
          onPointerenter: () => emit('pause', message.id),
          onPointerleave: () => emit('resume', message.id),
          onFocusin: (event: FocusEvent) => {
            const next = event.relatedTarget
            if (
              next instanceof Node &&
              event.currentTarget instanceof Node &&
              event.currentTarget.contains(next)
            ) {
              return
            }
            emit('pause', message.id)
          },
          onFocusout: (event: FocusEvent) => {
            const next = event.relatedTarget
            if (
              next instanceof Node &&
              event.currentTarget instanceof Node &&
              event.currentTarget.contains(next)
            ) {
              return
            }
            emit('resume', message.id)
          }
        },
        children
      )
    }

    return () => {
      const node = h(
        'div',
        {
          class: containerClasses.value,
          'data-tiger-toast': '',
          'data-tiger-message-position': props.position,
          'data-tiger-message-container': ''
        },
        props.messages.map(renderMessageItem)
      )
      return props.portal ? renderVueOverlayOutlet(`message-${props.position}`, node) : node
    }
  }
})

export default MessageContainer
