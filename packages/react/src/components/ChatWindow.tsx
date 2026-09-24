import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useEffect,
  useMemo,
  useRef,
  useState
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
  chatThreadSharesId,
  getChatItemKey,
  readDocumentTimeZone,
  CHAT_VIRTUAL_THRESHOLD,
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
import { useTigerConfig } from './tiger-config'
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
    timeZone,
    inputType = 'textarea',
    inputRows = 3,
    sendOnEnter = true,
    allowShiftEnter = true,
    allowEmpty = false,
    clearOnSend = true,
    virtual,
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
  const [sending, setSending] = React.useState(false)
  const sendingRef = useRef(false)
  const stickToBottomRef = useRef(true)
  const messageListRef = useRef<HTMLDivElement | null>(null)
  const virtualListRef = useRef<VirtualListHandle | null>(null)
  const previousIdsRef = useRef(new Set<string>())
  const anchorIdRef = useRef<string | number | null>(null)
  const seenLastIdRef = useRef<string | number | null | undefined>(undefined)
  const [liveText, setLiveText] = useState('')
  const [documentTimeZone, setDocumentTimeZone] = useState<string | null>(timeZone ?? null)
  const clockZone = timeZone ?? documentTimeZone
  const virtualOn = virtual ?? messages.length >= CHAT_VIRTUAL_THRESHOLD
  const previousScrollHeightRef = useRef(0)
  const previousFirstIdRef = useRef<string | number | undefined>(messages[0]?.id)
  const previousLengthRef = useRef(messages.length)

  const hasSendHandler = typeof onSend === 'function'
  const canSend = canSendChatMessage({
    disabled,
    allowEmpty,
    value: inputValue,
    sending,
    hasSendHandler
  })

  const wrapperClasses = useMemo(() => classNames(chatWindowRootClasses, className), [className])

  const resolveScroller = useCallback((): HTMLElement | null => {
    if (virtualOn) return virtualListRef.current?.getScrollElement() ?? null
    return messageListRef.current
  }, [virtualOn])

  const syncStickToBottom = useCallback(() => {
    const scroller = resolveScroller()
    if (!scroller) return
    stickToBottomRef.current = isChatScrollerNearBottom(scroller)
  }, [resolveScroller])

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const last = messages.length - 1
      stickToBottomRef.current = true
      if (last >= 0 && virtualOn) {
        virtualListRef.current?.scrollToIndex(last, 'end')
        return
      }
      const scroller = resolveScroller()
      if (!scroller) return
      scroller.scrollTop = scroller.scrollHeight
    })
  }, [messages.length, resolveScroller, virtualOn])

  useImperativeHandle(ref, () => ({ scrollToBottom }), [scrollToBottom])

  const handleValueChange = useCallback(
    (nextValue: string | number) => {
      const next = String(nextValue)
      setInputValue(next)
    },
    [setInputValue]
  )

  const handleSend = useCallback(async () => {
    if (
      sendingRef.current ||
      !canSendChatMessage({
        disabled,
        allowEmpty,
        value: inputValue,
        sending: sendingRef.current,
        hasSendHandler
      })
    ) {
      return
    }
    const payload = String(inputValue ?? '')
    sendingRef.current = true
    setSending(true)
    try {
      await Promise.resolve(onSend?.(payload))
      if (clearOnSend) setInputValue('')
    } catch {
      // Keep the draft so the same text can be sent again.
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }, [
    allowEmpty,
    clearOnSend,
    disabled,
    hasSendHandler,
    inputValue,
    onSend,
    sending,
    setInputValue
  ])

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
      const timeText = showTime
        ? formatChatTime(message.time, mergedLocale, { timeZone: clockZone ?? undefined })
        : ''

      return (
        <div
          key={message.id ?? index}
          className={getChatMessageRowClasses(isSelf)}
          data-tiger-chat-message
          data-tiger-chat-id={message.id}>
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
                  'text-xs mb-1 text-[var(--tiger-text-secondary)]',
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
              <div className="text-xs mt-1 text-[var(--tiger-text-secondary)]">{timeText}</div>
            ) : null}
          </div>
        </div>
      )
    },
    [clockZone, mergedLocale, renderBubbleBody, showAvatar, showName, showTime, statusMap]
  )

  useEffect(() => {
    if (timeZone) {
      setDocumentTimeZone(timeZone)
      return
    }
    setDocumentTimeZone(readDocumentTimeZone())
  }, [timeZone])

  const lastId = messages[messages.length - 1]?.id ?? null

  useEffect(() => {
    if (seenLastIdRef.current === undefined) {
      seenLastIdRef.current = lastId
      return
    }
    if (lastId !== seenLastIdRef.current) {
      seenLastIdRef.current = lastId
      const last = messages[messages.length - 1]
      setLiveText(last ? String(last.content ?? '') : '')
    }
  }, [lastId, messages])

  useEffect(() => {
    if (!autoScrollToBottom) return undefined
    const ids = messages.map((message) => message.id)
    const sessionChanged = !chatThreadSharesId(previousIdsRef.current, ids)
    const decision = planChatScroll({
      messages,
      stickToBottom: sessionChanged ? true : stickToBottomRef.current,
      sessionChanged,
      anchorId: anchorIdRef.current
    })
    stickToBottomRef.current = decision.stickToBottom
    const raf = requestAnimationFrame(() => {
      if (!decision.stickToBottom) return
      const index = messages.findIndex((message) => message.id === decision.anchorId)
      if (virtualOn && index >= 0) {
        virtualListRef.current?.scrollToIndex(index, 'end')
        return
      }
      const scroller = messageListRef.current
      if (scroller) scroller.scrollTop = scroller.scrollHeight
    })
    previousIdsRef.current = new Set(ids.filter((id) => id != null).map((id) => String(id)))
    if (!decision.stickToBottom && decision.anchorId != null) {
      anchorIdRef.current = decision.anchorId
    } else if (decision.stickToBottom) {
      anchorIdRef.current = decision.anchorId
    }
    return () => cancelAnimationFrame(raf)
  }, [autoScrollToBottom, messages, virtualOn])

  const listA11y = {
    role: 'list' as const,
    'aria-label': listLabel
  }

  return (
    <div className={wrapperClasses} data-tiger-chat-window {...props}>
      {virtualOn ? (
        <div
          className="sr-only"
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          aria-label={listLabel}>
          {liveText}
        </div>
      ) : null}
      {messages.length === 0 ? (
        <div
          className={classNames(
            chatMessageListClasses,
            'h-full flex items-center justify-center py-8'
          )}>
          <Empty description={resolvedEmptyText} />
        </div>
      ) : virtualOn ? (
        <VirtualList
          ref={virtualListRef}
          className={chatMessageListClasses}
          itemCount={messages.length}
          estimatedItemHeight={virtualItemHeight}
          height={virtualHeight}
          getItemKey={(index) => getChatItemKey(messages, index)}
          onScroll={syncStickToBottom}
          renderItem={({ index }) => renderMessageItem(messages[index], index)}
          role="presentation"
          data-tiger-chat-scroller=""
        />
      ) : (
        <div
          ref={messageListRef}
          className={chatMessageListClasses}
          role="log"
          aria-label={listLabel}
          data-tiger-chat-scroller=""
          onScroll={syncStickToBottom}>
          {messages.map(renderMessageItem)}
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
              onChange={handleValueChange}
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
              onChange={handleValueChange}
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
