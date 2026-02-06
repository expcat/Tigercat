import { defineComponent, h, computed, ref, watch, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getChatMessageStatusInfo,
  formatChatTime,
  mergeStyleValues,
  type ChatMessage,
  type ChatWindowProps as CoreChatWindowProps,
  type BadgeVariant
} from '@expcat/tigercat-core'
import { Avatar } from './Avatar'
import { Textarea } from './Textarea'
import { Input } from './Input'
import { Button } from './Button'
import { Badge } from './Badge'

export interface VueChatWindowProps extends Omit<
  CoreChatWindowProps,
  'value' | 'onChange' | 'onSend'
> {
  modelValue?: string
  className?: string
  style?: Record<string, string | number>
}

export const ChatWindow = defineComponent({
  name: 'TigerChatWindow',
  inheritAttrs: false,
  props: {
    messages: {
      type: Array as PropType<ChatMessage[]>,
      default: () => []
    },
    modelValue: {
      type: String as PropType<string>
    },
    defaultValue: {
      type: String as PropType<string>,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入消息'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    maxLength: {
      type: Number
    },
    emptyText: {
      type: String,
      default: '暂无消息'
    },
    sendText: {
      type: String,
      default: '发送'
    },
    messageListAriaLabel: {
      type: String
    },
    inputAriaLabel: {
      type: String
    },
    sendAriaLabel: {
      type: String
    },
    statusText: {
      type: String
    },
    statusVariant: {
      type: String as PropType<BadgeVariant>,
      default: 'info'
    },
    showAvatar: {
      type: Boolean,
      default: true
    },
    showName: {
      type: Boolean,
      default: true
    },
    showTime: {
      type: Boolean,
      default: false
    },
    inputType: {
      type: String as PropType<'input' | 'textarea'>,
      default: 'textarea'
    },
    inputRows: {
      type: Number,
      default: 3
    },
    sendOnEnter: {
      type: Boolean,
      default: true
    },
    allowShiftEnter: {
      type: Boolean,
      default: true
    },
    allowEmpty: {
      type: Boolean,
      default: false
    },
    clearOnSend: {
      type: Boolean,
      default: true
    },
    className: {
      type: String
    },
    style: {
      type: Object as PropType<Record<string, string | number>>
    }
  },
  emits: {
    'update:modelValue': null,
    input: null,
    change: null,
    send: null
  },
  setup(props, { emit, attrs, slots }) {
    const localValue = ref<string>(props.modelValue ?? props.defaultValue ?? '')

    watch(
      () => props.modelValue,
      (nextValue) => {
        if (nextValue !== undefined && nextValue !== localValue.value) {
          localValue.value = nextValue
        }
      }
    )

    const wrapperClasses = computed(() =>
      classNames(
        'tiger-chat-window',
        'flex',
        'flex-col',
        'w-full',
        'rounded-lg',
        'border',
        'border-[var(--tiger-border,#e5e7eb)]',
        'bg-[var(--tiger-surface,#ffffff)]',
        props.className,
        coerceClassValue(attrs.class)
      )
    )

    const wrapperStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    const inputValue = computed(() =>
      props.modelValue !== undefined ? props.modelValue : localValue.value
    )

    const canSend = computed(() => {
      if (props.disabled) return false
      if (props.allowEmpty) return true
      const raw = String(inputValue.value ?? '')
      return raw.trim().length > 0
    })

    const handleValueChange = (nextValue: string) => {
      if (props.modelValue === undefined) {
        localValue.value = nextValue
      }
      emit('update:modelValue', nextValue)
      emit('input', nextValue)
      emit('change', nextValue)
    }

    const handleSend = () => {
      if (!canSend.value) return
      const payload = String(inputValue.value ?? '')
      emit('send', payload)
      if (props.clearOnSend) {
        handleValueChange('')
      }
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (!props.sendOnEnter) return
      if (event.key !== 'Enter') return
      if (props.inputType === 'textarea' && props.allowShiftEnter && event.shiftKey) return
      event.preventDefault()
      handleSend()
    }

    const renderMessageItem = (message: ChatMessage, index: number) => {
      const isSelf = message.direction === 'self'
      const rowClasses = classNames(
        'flex',
        'gap-3',
        'items-start',
        isSelf ? 'flex-row-reverse' : 'justify-start'
      )

      const bubbleClasses = classNames(
        'rounded-lg',
        'px-3',
        'py-2',
        'text-sm',
        'break-words',
        isSelf
          ? 'bg-[var(--tiger-primary,#2563eb)] text-white rounded-tr-none'
          : 'bg-[var(--tiger-surface-muted,#f3f4f6)] text-[var(--tiger-text,#111827)] rounded-tl-none'
      )

      const statusInfo = message.status ? getChatMessageStatusInfo(message.status) : undefined
      const customContent = slots.message?.({ message, index })

      const nameNode =
        props.showName && message.user?.name
          ? h(
              'div',
              {
                class: classNames(
                  'text-xs',
                  'mb-1',
                  'text-[var(--tiger-text-muted,#6b7280)]',
                  isSelf && 'text-right'
                )
              },
              message.user.name
            )
          : null

      const timeText = props.showTime ? formatChatTime(message.time) : ''
      const timeNode =
        props.showTime && timeText
          ? h(
              'div',
              {
                class: classNames('text-xs', 'mt-1', 'text-[var(--tiger-text-muted,#6b7280)]')
              },
              timeText
            )
          : null

      const statusNode = statusInfo
        ? h(
            'div',
            { class: classNames('text-xs', 'mt-1', statusInfo.className) },
            message.statusText || statusInfo.text
          )
        : null

      return h(
        'div',
        {
          class: rowClasses,
          'data-tiger-chat-message': '',
          role: 'listitem',
          key: message.id ?? index
        },
        [
          props.showAvatar && message.user
            ? h(Avatar, {
                size: 'sm',
                src: message.user.avatar,
                text: message.user.name,
                className: classNames('flex-shrink-0', isSelf ? 'ml-0' : 'mr-0')
              })
            : null,
          h(
            'div',
            { class: classNames('flex', 'flex-col', 'max-w-[75%]', isSelf && 'items-end') },
            [
              nameNode,
              h(
                'div',
                { class: bubbleClasses, 'data-tiger-chat-bubble': '' },
                customContent ?? message.content
              ),
              statusNode,
              timeNode
            ]
          )
        ]
      )
    }

    const renderInput = () => {
      const resolvedInputLabel = props.inputAriaLabel ?? props.placeholder ?? '消息输入'
      const commonProps = {
        modelValue: inputValue.value,
        placeholder: props.placeholder,
        disabled: props.disabled,
        maxLength: props.maxLength,
        onKeydown: handleKeydown,
        'onUpdate:modelValue': handleValueChange,
        'aria-label': resolvedInputLabel
      }

      if (props.inputType === 'input') {
        return h(Input, commonProps)
      }

      return h(Textarea, { ...commonProps, rows: props.inputRows })
    }

    return () =>
      h(
        'div',
        {
          ...attrs,
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          'data-tiger-chat-window': ''
        },
        [
          h(
            'div',
            {
              class: 'flex-1 overflow-auto p-4 space-y-4',
              role: 'log',
              'aria-live': 'polite',
              'aria-relevant': 'additions text',
              'aria-label': props.messageListAriaLabel ?? '消息列表'
            },
            props.messages.length === 0
              ? [
                  h(
                    'div',
                    {
                      class:
                        'h-full flex items-center justify-center text-[var(--tiger-text-muted,#6b7280)]'
                    },
                    props.emptyText
                  )
                ]
              : props.messages.map((message, index) => renderMessageItem(message, index))
          ),
          props.statusText
            ? h(
                'div',
                {
                  class:
                    'px-4 py-2 border-t border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)]'
                },
                h(Badge, {
                  type: 'text',
                  variant: props.statusVariant,
                  content: props.statusText
                })
              )
            : null,
          h(
            'div',
            {
              class:
                'flex items-end gap-3 px-4 py-3 border-t border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] rounded-b-lg'
            },
            [
              h('div', { class: 'flex-1' }, [renderInput()]),
              h(
                Button,
                {
                  disabled: !canSend.value,
                  onClick: handleSend,
                  'aria-label': props.sendAriaLabel ?? props.sendText
                },
                () => props.sendText
              )
            ]
          )
        ]
      )
  }
})

export default ChatWindow
