import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  getChatMessageStatusInfo,
  getChatStatusBarClasses,
  formatChatTime,
  type ChatMessage,
  type ChatWindowProps as CoreChatWindowProps
} from '@expcat/tigercat-core'
import { Avatar } from './Avatar'
import { Textarea } from './Textarea'
import { Input } from './Input'
import { Button } from './Button'
import { VirtualList } from './VirtualList'
import { Empty } from './Empty'

export interface ChatWindowProps
  extends
    CoreChatWindowProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /**
   * Custom render for message bubble
   */
  renderMessage?: (message: ChatMessage, index: number) => React.ReactNode
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages = [],
  value,
  defaultValue = '',
  placeholder = '请输入消息',
  disabled = false,
  maxLength,
  emptyText = '暂无消息',
  sendText = '发送',
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
  virtualItemHeight = 88,
  virtualHeight = 400,
  autoScrollToBottom = true,
  onChange,
  onSend,
  renderMessage,
  className,
  ...props
}) => {
  const [innerValue, setInnerValue] = useState<string>(value ?? defaultValue)

  useEffect(() => {
    if (value !== undefined) {
      setInnerValue(value)
    }
  }, [value])

  const inputValue = value !== undefined ? value : innerValue

  const wrapperClasses = useMemo(
    () =>
      classNames(
        'tiger-chat-window flex flex-col w-full rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] shadow-sm overflow-hidden transition-all duration-300',
        className
      ),
    [className]
  )

  const canSend = useMemo(() => {
    if (disabled) return false
    if (allowEmpty) return true
    const raw = String(inputValue ?? '')
    return raw.trim().length > 0
  }, [allowEmpty, disabled, inputValue])

  const handleValueChange = useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setInnerValue(nextValue)
      }
      onChange?.(nextValue)
    },
    [onChange, value]
  )

  const handleSend = useCallback(() => {
    if (!canSend) return
    const payload = String(inputValue ?? '')
    onSend?.(payload)
    if (clearOnSend) {
      if (value === undefined) {
        setInnerValue('')
      }
      onChange?.('')
    }
  }, [canSend, clearOnSend, inputValue, onSend, onChange, value])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!sendOnEnter) return
      if (event.key !== 'Enter') return
      if (inputType === 'textarea' && allowShiftEnter && event.shiftKey) return
      event.preventDefault()
      handleSend()
    },
    [allowShiftEnter, handleSend, inputType, sendOnEnter]
  )

  const renderMessageItem = useCallback(
    (message: ChatMessage, index: number) => {
      const isSelf = message.direction === 'self'
      const statusInfo = message.status ? getChatMessageStatusInfo(message.status) : undefined
      const timeText = showTime ? formatChatTime(message.time) : ''

      return (
        <div
          key={message.id ?? index}
          className={classNames(
            'flex gap-3 items-start',
            isSelf ? 'flex-row-reverse' : 'justify-start'
          )}
          data-tiger-chat-message
          role="listitem">
          {showAvatar && message.user ? (
            <Avatar
              size="sm"
              src={message.user.avatar}
              text={message.user.name}
              className="flex-shrink-0"
            />
          ) : null}
          <div className={classNames('flex flex-col max-w-[75%]', isSelf && 'items-end')}>
            {showName && message.user?.name && (
              <div
                className={classNames(
                  'text-xs mb-1 text-[var(--tiger-text-muted,#6b7280)]',
                  isSelf && 'text-right'
                )}>
                {message.user.name}
              </div>
            )}
            <div
              className={classNames(
                'rounded-[var(--tiger-radius-lg,0.75rem)] px-4 py-2.5 text-sm break-words shadow-sm transition-all',
                isSelf
                  ? 'bg-[var(--tiger-primary,#2563eb)] text-white rounded-tr-[var(--tiger-radius-sm,0.375rem)]'
                  : 'bg-[var(--tiger-surface,#ffffff)] border border-[var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)] rounded-tl-[var(--tiger-radius-sm,0.375rem)]'
              )}
              data-tiger-chat-bubble>
              {renderMessage?.(message, index) ?? message.content}
            </div>
            {statusInfo && (
              <div className={classNames('text-xs mt-1', statusInfo.className)}>
                {message.statusText || statusInfo.text}
              </div>
            )}
            {timeText && (
              <div className="text-xs mt-1 text-[var(--tiger-text-muted,#6b7280)]">{timeText}</div>
            )}
          </div>
        </div>
      )
    },
    [renderMessage, showAvatar, showName, showTime]
  )

  const messageListRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!autoScrollToBottom) return
    const raf = requestAnimationFrame(() => {
      const el = messageListRef.current
      if (!el) return
      // In virtual mode the actual scroller is the inner VirtualList container.
      const target = (virtual ? (el.firstElementChild as HTMLElement | null) : el) ?? el
      target.scrollTop = target.scrollHeight
    })
    return () => cancelAnimationFrame(raf)
  }, [messages.length, autoScrollToBottom, virtual])

  return (
    <div className={wrapperClasses} data-tiger-chat-window {...props}>
      {virtual && messages.length > 0 ? (
        <div
          ref={messageListRef}
          className="flex-1 overflow-auto bg-[var(--tiger-surface-muted,#f9fafb)]"
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          aria-label={messageListAriaLabel ?? '消息列表'}>
          <VirtualList
            itemCount={messages.length}
            itemHeight={virtualItemHeight}
            height={virtualHeight}
            renderItem={({ index }) => renderMessageItem(messages[index], index)}
          />
        </div>
      ) : (
        <div
          ref={messageListRef}
          className="flex-1 overflow-auto p-5 space-y-4 bg-[var(--tiger-surface-muted,#f9fafb)]"
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          aria-label={messageListAriaLabel ?? '消息列表'}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center py-8">
              <Empty description={emptyText} />
            </div>
          ) : (
            messages.map(renderMessageItem)
          )}
        </div>
      )}
      {statusText && <div className={getChatStatusBarClasses(statusVariant)}>{statusText}</div>}
      <div className="flex items-end gap-3 px-5 py-4 border-t border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] rounded-b-lg">
        <div className="flex-1">
          {inputType === 'input' ? (
            <Input
              value={inputValue}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              aria-label={inputAriaLabel ?? placeholder ?? '消息输入'}
              onChange={(event) => handleValueChange(event.currentTarget.value)}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <Textarea
              value={inputValue}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              rows={inputRows}
              aria-label={inputAriaLabel ?? placeholder ?? '消息输入'}
              onChange={(event) => handleValueChange(event.currentTarget.value)}
              onKeyDown={handleKeyDown}
            />
          )}
        </div>
        <Button disabled={!canSend} onClick={handleSend} aria-label={sendAriaLabel ?? sendText}>
          {sendText}
        </Button>
      </div>
    </div>
  )
}

export default ChatWindow
