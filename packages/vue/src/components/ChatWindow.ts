import {
  defineComponent,
  h,
  computed,
  ref,
  watch,
  onMounted,
  getCurrentInstance,
  PropType
} from 'vue'
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
  canSendChatMessage,
  shouldSendChatOnEnter,
  isChatScrollerNearBottom,
  planChatScroll,
  didChatPrepend,
  getChatItemKey,
  getChatMessageRowClasses,
  getChatBubbleClasses,
  chatWindowRootClasses,
  chatMessageListClasses,
  chatComposerClasses,
  CHAT_VIRTUAL_ESTIMATED_ITEM_HEIGHT,
  EMPTY_CHAT_MESSAGES,
  type BadgeVariant,
  type ChatMessage,
  type ChatWindowHandle,
  type ChatWindowProps as CoreChatWindowProps,
  type TigerLocale,
  type TigerLocaleChatWindow,
  type VirtualListHandle
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

export type { ChatWindowHandle }

export const ChatWindow = defineComponent({
  name: 'TigerChatWindow',
  inheritAttrs: false,
  props: {
    messages: {
      type: Array as PropType<ChatMessage[]>,
      default: undefined
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
      default: CHAT_VIRTUAL_ESTIMATED_ITEM_HEIGHT
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
    'update:modelValue': (_value: string) => true,
    send: (_value: string) => true
  },
  setup(props, { emit, attrs, slots, expose }) {
    const instance = getCurrentInstance()
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getChatWindowLabels(mergedLocale.value, props.labels))
    const statusMap = computed(() => buildChatMessageStatusInfo(labels.value))
    const messages = computed(() => props.messages ?? EMPTY_CHAT_MESSAGES)

    const localValue = ref<string>(props.defaultValue ?? '')
    const lastSent = ref<string | null>(null)
    const stickToBottom = ref(true)
    const messageListRef = ref<HTMLElement | null>(null)
    const virtualListRef = ref<VirtualListHandle | null>(null)
    const previousScrollHeight = ref(0)
    const previousFirstId = ref<string | number | undefined>(messages.value[0]?.id)
    const previousLength = ref(messages.value.length)

    const hasSendHandler = computed(
      () =>
        typeof (instance?.vnode.props as { onSend?: unknown } | undefined)?.onSend === 'function'
    )

    const inputValue = computed(() =>
      props.modelValue !== undefined ? props.modelValue : localValue.value
    )

    const canSend = computed(() =>
      canSendChatMessage({
        disabled: props.disabled,
        allowEmpty: props.allowEmpty,
        value: inputValue.value,
        hasSendHandler: hasSendHandler.value,
        lastSent: lastSent.value
      })
    )

    const wrapperClasses = computed(() =>
      classNames(chatWindowRootClasses, props.className, coerceClassValue(attrs.class))
    )
    const wrapperStyle = computed(() => mergeStyleValues(attrs.style, props.style))
    const listAriaLabel = computed(
      () => props.messageListAriaLabel ?? labels.value.messageListAriaLabel
    )

    const resolveScroller = (): HTMLElement | null => {
      if (props.virtual) return virtualListRef.value?.getScrollElement() ?? null
      return messageListRef.value
    }

    const syncStickToBottom = () => {
      const scroller = resolveScroller()
      if (!scroller) return
      stickToBottom.value = isChatScrollerNearBottom(scroller)
    }

    const applyScrollPlan = () => {
      const scroller = resolveScroller()
      if (!scroller) return
      const nextMessages = messages.value
      const prepended = didChatPrepend(
        previousFirstId.value,
        nextMessages[0]?.id,
        previousLength.value,
        nextMessages.length
      )
      const plan = planChatScroll({
        stickToBottom: stickToBottom.value,
        autoScrollToBottom: props.autoScrollToBottom,
        prepended,
        previousScrollHeight: previousScrollHeight.value,
        nextScrollHeight: scroller.scrollHeight
      })
      if (plan.scrollTop != null) {
        scroller.scrollTop = plan.scrollTop
        stickToBottom.value = true
      } else if (plan.compensate) {
        scroller.scrollTop += plan.compensate
      }
      previousScrollHeight.value = scroller.scrollHeight
      previousFirstId.value = nextMessages[0]?.id
      previousLength.value = nextMessages.length
    }

    const scrollToBottom = () => {
      if (!props.autoScrollToBottom) return
      requestAnimationFrame(() => {
        const scroller = resolveScroller()
        if (!scroller) return
        scroller.scrollTop = scroller.scrollHeight
        stickToBottom.value = true
        previousScrollHeight.value = scroller.scrollHeight
      })
    }

    const handleValueChange = (nextValue: string) => {
      if (props.modelValue === undefined) localValue.value = nextValue
      if (lastSent.value != null && nextValue !== lastSent.value) lastSent.value = null
      emit('update:modelValue', nextValue)
    }

    const handleSend = () => {
      if (!canSend.value) return
      const payload = String(inputValue.value ?? '')
      lastSent.value = payload
      emit('send', payload)
      if (props.clearOnSend) handleValueChange('')
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (
        !shouldSendChatOnEnter(event, {
          sendOnEnter: props.sendOnEnter,
          inputType: props.inputType,
          allowShiftEnter: props.allowShiftEnter
        })
      ) {
        return
      }
      event.preventDefault()
      handleSend()
    }

    onMounted(scrollToBottom)
    watch(
      () =>
        [
          messages.value.length,
          messages.value[0]?.id,
          messages.value[messages.value.length - 1]?.content
        ] as const,
      () => {
        requestAnimationFrame(applyScrollPlan)
      }
    )

    const renderMessageItem = (message: ChatMessage, index: number) => {
      const isSelf = message.direction === 'self'
      const statusInfo = message.status
        ? getChatMessageStatusInfo(message.status, statusMap.value)
        : undefined
      const timeText = props.showTime ? formatChatTime(message.time, mergedLocale.value) : ''
      const customContent =
        slots.bubble?.({ message, index }) ?? slots.message?.({ message, index })

      return h(
        'div',
        {
          class: getChatMessageRowClasses(isSelf),
          'data-tiger-chat-message': '',
          key: message.id ?? index
        },
        [
          props.showAvatar && message.user
            ? h(Avatar, {
                size: 'sm',
                src: message.user.avatar,
                text: message.user.name,
                className: 'flex-shrink-0',
                'aria-hidden': props.showName && message.user.name ? true : undefined
              })
            : null,
          h('div', { class: classNames('flex flex-col max-w-[75%]', isSelf && 'items-end') }, [
            props.showName && message.user?.name
              ? h(
                  'div',
                  {
                    class: classNames(
                      'text-xs mb-1 text-[var(--tiger-text-muted,#6b7280)]',
                      isSelf && 'text-end'
                    )
                  },
                  message.user.name
                )
              : null,
            h(
              'div',
              {
                class: getChatBubbleClasses(isSelf),
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

    const listA11y = () => ({
      role: 'log' as const,
      'aria-live': 'polite' as const,
      'aria-relevant': 'additions text',
      'aria-label': listAriaLabel.value
    })

    expose({
      scrollToBottom
    } satisfies ChatWindowHandle)

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
          props.virtual && messages.value.length > 0
            ? h(
                VirtualList,
                {
                  ref: virtualListRef,
                  className: chatMessageListClasses,
                  itemCount: messages.value.length,
                  estimatedItemHeight: props.virtualItemHeight,
                  height: props.virtualHeight,
                  getItemKey: (index: number) => getChatItemKey(messages.value, index),
                  onScroll: syncStickToBottom,
                  ...listA11y()
                },
                {
                  default: ({ index }: { index: number }) =>
                    renderMessageItem(messages.value[index], index)
                }
              )
            : h(
                'div',
                {
                  ref: messageListRef,
                  class: chatMessageListClasses,
                  ...listA11y(),
                  onScroll: syncStickToBottom
                },
                messages.value.length === 0
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
                  : messages.value.map((message, index) => renderMessageItem(message, index))
              ),
          props.statusText
            ? h(
                'div',
                {
                  class: getChatStatusBarClasses(props.statusVariant),
                  'aria-live': 'polite'
                },
                props.statusText
              )
            : null,
          h('div', { class: chatComposerClasses }, [
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
          ])
        ]
      )
  }
})

export default ChatWindow
