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
  CHAT_VIRTUAL_THRESHOLD,
  planChatScroll,
  chatThreadSharesId,
  getChatItemKey,
  readDocumentTimeZone,
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
    timeZone: {
      type: String,
      default: undefined
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
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
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
    const sending = ref(false)
    let sendingNow = false
    const stickToBottom = ref(true)
    const messageListRef = ref<HTMLElement | null>(null)
    const virtualListRef = ref<VirtualListHandle | null>(null)
    const documentTimeZone = ref<string | null>(props.timeZone ?? null)
    const liveText = ref('')
    const anchorId = ref<string | number | null>(null)
    const virtualOn = computed(
      () => props.virtual ?? messages.value.length >= CHAT_VIRTUAL_THRESHOLD
    )
    onMounted(() => {
      documentTimeZone.value = props.timeZone || readDocumentTimeZone()
    })
    watch(
      () => props.timeZone,
      (zone) => {
        documentTimeZone.value = zone || readDocumentTimeZone()
      }
    )

    const hasSendHandler = () =>
      typeof (instance?.vnode.props as { onSend?: unknown } | undefined)?.onSend === 'function'

    const inputValue = computed(() =>
      props.modelValue !== undefined ? props.modelValue : localValue.value
    )

    const canSendNow = () =>
      canSendChatMessage({
        disabled: props.disabled,
        allowEmpty: props.allowEmpty,
        value: inputValue.value,
        sending: sending.value,
        hasSendHandler: hasSendHandler()
      })

    const wrapperClasses = computed(() =>
      classNames(chatWindowRootClasses, props.className, coerceClassValue(attrs.class))
    )
    const wrapperStyle = computed(() => mergeStyleValues(attrs.style, props.style))
    const listAriaLabel = computed(
      () => props.messageListAriaLabel ?? labels.value.messageListAriaLabel
    )

    const resolveScroller = (): HTMLElement | null => {
      if (virtualOn.value) return virtualListRef.value?.getScrollElement() ?? null
      return messageListRef.value
    }

    const syncStickToBottom = () => {
      const scroller = resolveScroller()
      if (!scroller) return
      stickToBottom.value = isChatScrollerNearBottom(scroller)
    }

    let seenIds = new Set<string>()

    const applyScrollPlan = () => {
      if (props.autoScrollToBottom === false) return
      const nextMessages = messages.value
      const ids = nextMessages.map((message) => message.id)
      const sessionChanged = !chatThreadSharesId(seenIds, ids)
      const decision = planChatScroll({
        messages: nextMessages,
        stickToBottom: sessionChanged ? true : stickToBottom.value,
        sessionChanged,
        anchorId: anchorId.value
      })
      stickToBottom.value = decision.stickToBottom
      anchorId.value = decision.anchorId
      if (decision.stickToBottom) {
        const index = nextMessages.findIndex((message) => message.id === decision.anchorId)
        if (virtualOn.value && index >= 0) {
          virtualListRef.value?.scrollToIndex(index, 'end')
        } else {
          const scroller = messageListRef.value
          if (scroller) scroller.scrollTop = scroller.scrollHeight
        }
      }
      seenIds = new Set(ids.filter((id) => id != null).map((id) => String(id)))
      const last = nextMessages[nextMessages.length - 1]
      if (last && virtualOn.value) liveText.value = String(last.content ?? '')
    }

    const scrollToBottom = () => {
      requestAnimationFrame(() => {
        stickToBottom.value = true
        const last = messages.value.length - 1
        if (last >= 0 && virtualOn.value) {
          virtualListRef.value?.scrollToIndex(last, 'end')
          anchorId.value = messages.value[last]?.id ?? null
          return
        }
        const scroller = resolveScroller()
        if (!scroller) return
        scroller.scrollTop = scroller.scrollHeight
      })
    }

    const handleValueChange = (nextValue: string) => {
      if (props.modelValue === undefined) localValue.value = nextValue
      emit('update:modelValue', nextValue)
    }

    const handleSend = async () => {
      if (sendingNow || !canSendNow()) return
      const payload = String(inputValue.value ?? '')
      sendingNow = true
      sending.value = true
      try {
        const returned = emit('send', payload) as unknown
        const tasks = Array.isArray(returned) ? returned : [returned]
        await Promise.all(tasks.map((task) => Promise.resolve(task)))
        if (props.clearOnSend) handleValueChange('')
      } catch {
        // Keep the draft so the same text can be sent again.
      } finally {
        sendingNow = false
        sending.value = false
      }
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
      const timeText = props.showTime
        ? formatChatTime(message.time, mergedLocale.value, {
            timeZone: (props.timeZone ?? documentTimeZone.value) || undefined
          })
        : ''
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
                      'text-xs mb-1 text-[var(--tiger-text-secondary)]',
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
              ? h('div', { class: 'text-xs mt-1 text-[var(--tiger-text-secondary)]' }, timeText)
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
          virtualOn.value
            ? h(
                'div',
                {
                  class: 'sr-only',
                  role: 'log',
                  'aria-live': 'polite',
                  'aria-relevant': 'additions text',
                  'aria-label': listAriaLabel.value
                },
                liveText.value
              )
            : null,
          messages.value.length === 0
            ? h(
                'div',
                { class: classNames(chatMessageListClasses, 'h-full flex items-center justify-center py-8') },
                [h(Empty, { description: resolveLocaleText(labels.value.emptyText, props.emptyText) })]
              )
            : virtualOn.value
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
                    role: 'presentation',
                    'data-tiger-chat-scroller': ''
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
                    role: 'log',
                    'aria-label': listAriaLabel.value,
                    'data-tiger-chat-scroller': '',
                    onScroll: syncStickToBottom
                  },
                  messages.value.map((message, index) => renderMessageItem(message, index))
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
                disabled: !canSendNow(),
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
