import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useEffect,
  useMemo,
  useRef
} from 'react'
import {
  classNames,
  EMPTY_CHAT_MESSAGES,
  getChatMessageStatusInfo,
  buildChatMessageStatusInfo,
  getChatStatusBarClasses,
  formatChatTime,
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
  type ChatMessage,
  type ChatWindowHandle,
  type ChatWindowProps as CoreChatWindowProps,
  type VirtualListHandle
} from '@expcat/tigercat-core'
import { Avatar } from './Avatar'
import { Textarea } from './Textarea'
import { Input } from './Input'
import { Button } from './Button'
import { VirtualList } from './VirtualList'
import { Empty } from './Empty'
import { useTigerConfig } from './ConfigProvider'
import { useControlledState } from '../hooks/useControlledState'

export interface ChatWindowProps
  extends
    CoreChatWindowProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /**
   * Custom render for the bubble body (not the whole row).
   */
  renderBubble?: (message: ChatMessage, index: number) => React.ReactNode
}

export type { ChatWindowHandle }

export const ChatWindow = forwardRef<ChatWindowHandle, ChatWindowProps>(function ChatWindow(
  {
    messages = EMPTY_CHAT_MESSAGES,
    value,
    defaultValue = '',
    placeholder,
    disabled = false,
    maxLength,
    emptyText,
    sendText,
    locale,
    labels: labelsOverride,
    messageListAriaLabel,
    inputAriaLabel,
    sendAriaLabel,
    statusText,
    statusVariant = 'info',
    showAvatar = true,
    showName = true,
    showTime = false,
    inputType = 'textarea',
    inputRows = 3,
    sendOnEnter = true,
    allowShiftEnter = true,
    allowEmpty = false,
    clearOnSend = true,
    virtual = false,
    virtualItemHeight = CHAT_VIRTUAL_ESTIMATED_ITEM_HEIGHT,
    virtualHeight = 400,
    autoScrollToBottom = true,
    onChange,
    onSend,
    renderBubble,
    className,
    ...props
  },
  ref
) {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getChatWindowLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const statusMap = useMemo(() => buildChatMessageStatusInfo(labels), [labels])
  const resolvedPlaceholder = resolveLocaleText(labels.placeholder, placeholder)
  const resolvedEmptyText = resolveLocaleText(labels.emptyText, emptyText)
  const resolvedSendText = resolveLocaleText(labels.sendText, sendText)
  const listLabel = messageListAriaLabel ?? labels.messageListAriaLabel

  const [inputValue, setInputValue] = useControlledState({
    value,
    defaultValue,
    onChange
  })
  const lastSentRef = useRef<string | null>(null)
  const [, setSendTick] = React.useState(0)
  const stickToBottomRef = useRef(true)
  const messageListRef = useRef<HTMLDivElement | null>(null)
  const virtualListRef = useRef<VirtualListHandle | null>(null)
  const previousScrollHeightRef = useRef(0)
  const previousFirstIdRef = useRef<string | number | undefined>(messages[0]?.id)
  const previousLengthRef = useRef(messages.length)

  const hasSendHandler = typeof onSend === 'function'
  const canSend = canSendChatMessage({
    disabled,
    allowEmpty,
    value: inputValue,
    sending: false,
    hasSendHandler,
    lastSent: lastSentRef.current
  })

  const wrapperClasses = useMemo(() => classNames(chatWindowRootClasses, className), [className])

  const resolveScroller = useCallback((): HTMLElement | null => {
    if (virtual) return virtualListRef.current?.getScrollElement() ?? null
    return messageListRef.current
  }, [virtual])

  const syncStickToBottom = useCallback(() => {
    const scroller = resolveScroller()
    if (!scroller) return
    stickToBottomRef.current = isChatScrollerNearBottom(scroller)
  }, [resolveScroller])

  const scrollToBottom = useCallback(() => {
    if (!autoScrollToBottom) return
    requestAnimationFrame(() => {
      const scroller = resolveScroller()
      if (!scroller) return
      scroller.scrollTop = scroller.scrollHeight
      stickToBottomRef.current = true
      previousScrollHeightRef.current = scroller.scrollHeight
    })
  }, [autoScrollToBottom, resolveScroller])

  useImperativeHandle(ref, () => ({ scrollToBottom }), [scrollToBottom])

  const handleValueChange = useCallback(
    (nextValue: string) => {
      if (lastSentRef.current != null && nextValue !== lastSentRef.current) {
        lastSentRef.current = null
      }
      setInputValue(nextValue)
    },
    [setInputValue]
  )

  const handleSend = useCallback(() => {
    if (
      !canSendChatMessage({
        disabled,
        allowEmpty,
        value: inputValue,
        hasSendHandler,
        lastSent: lastSentRef.current
      })
    ) {
      return
    }
    const payload = String(inputValue ?? '')
    lastSentRef.current = payload
    setSendTick((tick) => tick + 1)
    onSend?.(payload)
    if (clearOnSend) setInputValue('')
  }, [allowEmpty, clearOnSend, disabled, hasSendHandler, inputValue, onSend, setInputValue])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (
        !shouldSendChatOnEnter(event.nativeEvent, {
          sendOnEnter,
          inputType,
          allowShiftEnter
        })
      ) {
        return
      }
      event.preventDefault()
      handleSend()
    },
    [allowShiftEnter, handleSend, inputType, sendOnEnter]
  )

  const renderBubbleBody = renderBubble

  const renderMessageItem = useCallback(
    (message: ChatMessage, index: number) => {
      const isSelf = message.direction === 'self'
      const statusInfo = message.status
        ? getChatMessageStatusInfo(message.status, statusMap)
        : undefined
      const timeText = showTime ? formatChatTime(message.time, mergedLocale) : ''

      return (
        <div
          key={message.id ?? index}
          className={getChatMessageRowClasses(isSelf)}
          data-tiger-chat-message>
          {showAvatar && message.user ? (
            <Avatar
              size="sm"
              src={message.user.avatar}
              text={message.user.name}
              className="flex-shrink-0"
              aria-hidden={Boolean(showName && message.user.name)}
            />
          ) : null}
          <div className={classNames('flex flex-col max-w-[75%]', isSelf && 'items-end')}>
            {showName && message.user?.name && (
              <div
                className={classNames(
                  'text-xs mb-1 text-[var(--tiger-text-muted,#6b7280)]',
                  isSelf && 'text-end'
                )}>
                {message.user.name}
              </div>
            )}
            <div className={getChatBubbleClasses(isSelf)} data-tiger-chat-bubble>
              {renderBubbleBody?.(message, index) ?? message.content}
            </div>
            {statusInfo && (
              <div className={classNames('text-xs mt-1', statusInfo.className)}>
                {message.statusText || statusInfo.text}
              </div>
            )}
            {timeText ? (
              <div className="text-xs mt-1 text-[var(--tiger-text-muted,#6b7280)]">{timeText}</div>
            ) : null}
          </div>
        </div>
      )
    },
    [mergedLocale, renderBubbleBody, showAvatar, showName, showTime, statusMap]
  )

  const lastContent = messages[messages.length - 1]?.content
  const firstId = messages[0]?.id

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const scroller = resolveScroller()
      if (!scroller) return
      const prepended = didChatPrepend(
        previousFirstIdRef.current,
        firstId,
        previousLengthRef.current,
        messages.length
      )
      const plan = planChatScroll({
        stickToBottom: stickToBottomRef.current,
        autoScrollToBottom,
        prepended,
        previousScrollHeight: previousScrollHeightRef.current,
        nextScrollHeight: scroller.scrollHeight
      })
      if (plan.scrollTop != null) {
        scroller.scrollTop = plan.scrollTop
        stickToBottomRef.current = true
      } else if (plan.compensate) {
        scroller.scrollTop += plan.compensate
      }
      previousScrollHeightRef.current = scroller.scrollHeight
      previousFirstIdRef.current = firstId
      previousLengthRef.current = messages.length
    })
    return () => cancelAnimationFrame(raf)
  }, [autoScrollToBottom, firstId, lastContent, messages.length, resolveScroller])

  const listA11y = {
    role: 'log' as const,
    'aria-live': 'polite' as const,
    'aria-relevant': 'additions text' as const,
    'aria-label': listLabel
  }

  return (
    <div className={wrapperClasses} data-tiger-chat-window {...props}>
      {virtual && messages.length > 0 ? (
        <VirtualList
          ref={virtualListRef}
          className={chatMessageListClasses}
          itemCount={messages.length}
          estimatedItemHeight={virtualItemHeight}
          height={virtualHeight}
          getItemKey={(index) => getChatItemKey(messages, index)}
          onScroll={syncStickToBottom}
          renderItem={({ index }) => renderMessageItem(messages[index], index)}
          {...listA11y}
        />
      ) : (
        <div
          ref={messageListRef}
          className={chatMessageListClasses}
          {...listA11y}
          onScroll={syncStickToBottom}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center py-8">
              <Empty description={resolvedEmptyText} />
            </div>
          ) : (
            messages.map(renderMessageItem)
          )}
        </div>
      )}
      {statusText ? (
        <div className={getChatStatusBarClasses(statusVariant)} aria-live="polite">
          {statusText}
        </div>
      ) : null}
      <div className={chatComposerClasses}>
        <div className="flex-1">
          {inputType === 'input' ? (
            <Input
              value={inputValue}
              placeholder={resolvedPlaceholder}
              disabled={disabled}
              maxLength={maxLength}
              aria-label={inputAriaLabel ?? resolvedPlaceholder}
              onChange={(event) => handleValueChange(event.currentTarget.value)}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <Textarea
              value={inputValue}
              placeholder={resolvedPlaceholder}
              disabled={disabled}
              maxLength={maxLength}
              rows={inputRows}
              aria-label={inputAriaLabel ?? resolvedPlaceholder}
              onChange={(event) => handleValueChange(event.currentTarget.value)}
              onKeyDown={handleKeyDown}
            />
          )}
        </div>
        <Button
          disabled={!canSend}
          onClick={handleSend}
          aria-label={sendAriaLabel ?? resolvedSendText}>
          {resolvedSendText}
        </Button>
      </div>
    </div>
  )
})

ChatWindow.displayName = 'ChatWindow'

export default ChatWindow
