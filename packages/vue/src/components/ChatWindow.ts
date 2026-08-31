import { defineComponent, h, computed, ref, watch, onMounted, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getChatMessageStatusInfo,
  buildChatMessageStatusInfo,
  getChatStatusBarClasses,
  formatChatTime,
  mergeStyleValues,
  getChatWindowLabels,
  mergeTigerLocale,
  resolveLocaleText,
  type BadgeVariant,
  type ChatMessage,
  type ChatWindowProps as CoreChatWindowProps,
  type TigerLocale,
  type TigerLocaleChatWindow
} from '@expcat/tigercat-core'
import { Avatar } from './Avatar'
import { Textarea } from './Textarea'
import { Input } from './Input'
import { Button } from './Button'
import { VirtualList } from './VirtualList'
import { Empty } from './Empty'
import { useTigerConfig } from './ConfigProvider'

export interface VueChatWindowProps extends Omit<
  CoreChatWindowProps,
  'value' | 'onChange' | 'onSend'
> {
  modelValue?: string
  className?: string
  style?: Record<string, string | number>
}

const CHAT_STICK_TO_BOTTOM_PX = 32

function resolveChatScroller(
  virtual: boolean,
  messageList: HTMLElement | null,
  virtualWrapper: HTMLElement | null
): HTMLElement | null {
  if (virtual) {
    const wrapper = virtualWrapper
    return (wrapper?.firstElementChild as HTMLElement | null) ?? wrapper
  }
  return messageList
}

function isChatScrollerNearBottom(scroller: HTMLElement): boolean {
  return (
    scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <= CHAT_STICK_TO_BOTTOM_PX
  )
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
      default: undefined
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
      default: undefined
    },
    sendText: {
      type: String,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleChatWindow>>,
      default: undefined
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
      default: 'info' as BadgeVariant
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
    virtual: {
      type: Boolean,
      default: false
    },
    virtualItemHeight: {
      type: Number,
      default: 88
    },
    virtualHeight: {
      type: Number,
      default: 400
    },
    autoScrollToBottom: {
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
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getChatWindowLabels(mergedLocale.value, props.labels))
    const statusMap = computed(() => buildChatMessageStatusInfo(labels.value))

    const localValue = ref<string>(props.defaultValue ?? '')

    watch(
      () => props.modelValue,
      (nextValue) => {
        if (nextValue !== undefined) localValue.value = nextValue
      }
    )

    const wrapperClasses = computed(() =>
      classNames(
        'tiger-chat-window flex flex-col w-full rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] shadow-sm overflow-hidden transition-all duration-300',
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

    const messageListRef = ref<HTMLElement | null>(null)
    const virtualWrapperRef = ref<HTMLElement | null>(null)
    const stickToBottom = ref(true)

    const resolveScroller = (): HTMLElement | null =>
      resolveChatScroller(props.virtual, messageListRef.value, virtualWrapperRef.value)

    const syncStickToBottom = () => {
      const scroller = resolveScroller()
      if (!scroller) return
      stickToBottom.value = isChatScrollerNearBottom(scroller)
    }

    const scrollToBottom = () => {
      if (!props.autoScrollToBottom) return
      requestAnimationFrame(() => {
        const scroller = resolveScroller()
        if (scroller) {
          scroller.scrollTop = scroller.scrollHeight
          stickToBottom.value = true
        }
      })
    }

    onMounted(scrollToBottom)
    watch(
      () => props.messages.length,
      () => {
        if (!resolveScroller() || stickToBottom.value) {
          scrollToBottom()
        }
      }
    )

    const renderMessageItem = (message: ChatMessage, index: number) => {
      const isSelf = message.direction === 'self'
      const statusInfo = message.status
        ? getChatMessageStatusInfo(message.status, statusMap.value)
        : undefined
      const timeText = props.showTime ? formatChatTime(message.time) : ''
      const customContent = slots.message?.({ message, index })

      return h(
        'div',
        {
          class: classNames(
            'flex gap-3 items-start',
            isSelf ? 'flex-row-reverse' : 'justify-start'
          ),
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
                className: 'flex-shrink-0'
              })
            : null,
          h('div', { class: classNames('flex flex-col max-w-[75%]', isSelf && 'items-end') }, [
            props.showName && message.user?.name
              ? h(
                  'div',
                  {
                    class: classNames(
                      'text-xs mb-1 text-[var(--tiger-text-muted,#6b7280)]',
                      isSelf && 'text-right'
                    )
                  },
                  message.user.name
                )
              : null,
            h(
              'div',
              {
                class: classNames(
                  'rounded-[var(--tiger-radius-lg,0.75rem)] px-4 py-2.5 text-sm break-words shadow-sm transition-all',
                  isSelf
                    ? 'bg-[var(--tiger-primary,#2563eb)] text-white rounded-tr-[var(--tiger-radius-sm,0.375rem)]'
                    : 'bg-[var(--tiger-surface,#ffffff)] border border-[var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)] rounded-tl-[var(--tiger-radius-sm,0.375rem)]'
                ),
                'data-tiger-chat-bubble': ''
              },
              customContent ?? message.content
            ),
            statusInfo
              ? h(
                  'div',
                  { class: classNames('text-xs mt-1', statusInfo.className) },
                  message.statusText || statusInfo.text
                )
              : null,
            timeText
              ? h('div', { class: 'text-xs mt-1 text-[var(--tiger-text-muted,#6b7280)]' }, timeText)
              : null
          ])
        ]
      )
    }

    const renderInput = () => {
      const resolvedPlaceholder = resolveLocaleText(labels.value.placeholder, props.placeholder)
      const resolvedInputLabel = props.inputAriaLabel ?? resolvedPlaceholder
      const commonProps = {
        modelValue: inputValue.value,
        placeholder: resolvedPlaceholder,
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
          props.virtual && props.messages.length > 0
            ? h(
                'div',
                {
                  ref: virtualWrapperRef,
                  class: 'flex-1 overflow-auto bg-[var(--tiger-surface-muted,#f9fafb)]',
                  role: 'log',
                  'aria-live': 'polite',
                  'aria-relevant': 'additions text',
                  'aria-label': props.messageListAriaLabel ?? 'Message list',
                  onScroll: syncStickToBottom
                },
                [
                  h(
                    VirtualList,
                    {
                      role: 'none',
                      itemCount: props.messages.length,
                      itemHeight: props.virtualItemHeight,
                      height: props.virtualHeight,
                      onScroll: syncStickToBottom
                    },
                    {
                      default: ({ index }: { index: number }) =>
                        renderMessageItem(props.messages[index], index)
                    }
                  )
                ]
              )
            : h(
                'div',
                {
                  ref: messageListRef,
                  class:
                    'flex-1 overflow-auto p-5 space-y-4 bg-[var(--tiger-surface-muted,#f9fafb)]',
                  role: 'log',
                  'aria-live': 'polite',
                  'aria-relevant': 'additions text',
                  'aria-label': props.messageListAriaLabel ?? 'Message list',
                  onScroll: syncStickToBottom
                },
                props.messages.length === 0
                  ? [
                      h(
                        'div',
                        {
                          class: 'h-full flex items-center justify-center py-8'
                        },
                        [
                          h(Empty, {
                            description: resolveLocaleText(labels.value.emptyText, props.emptyText)
                          })
                        ]
                      )
                    ]
                  : props.messages.map((message, index) => renderMessageItem(message, index))
              ),
          props.statusText
            ? h(
                'div',
                {
                  class: getChatStatusBarClasses(props.statusVariant)
                },
                props.statusText
              )
            : null,
          h(
            'div',
            {
              class:
                'flex items-end gap-3 px-5 py-4 border-t border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] rounded-b-lg'
            },
            [
              h('div', { class: 'flex-1' }, [renderInput()]),
              h(
                Button,
                {
                  disabled: !canSend.value,
                  onClick: handleSend,
                  'aria-label':
                    props.sendAriaLabel ?? resolveLocaleText(labels.value.sendText, props.sendText)
                },
                () => resolveLocaleText(labels.value.sendText, props.sendText)
              )
            ]
          )
        ]
      )
  }
})

export default ChatWindow
