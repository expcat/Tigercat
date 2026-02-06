import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  classNames,
  getChatMessageStatusInfo,
  formatChatTime,
  type ChatMessage,
  type ChatWindowProps as CoreChatWindowProps,
  type BadgeVariant
} from '@expcat/tigercat-core'
import { Avatar } from './Avatar'
import { Textarea } from './Textarea'
import { Input } from './Input'
import { Button } from './Button'
import { Badge } from './Badge'

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
        'tiger-chat-window',
        'flex',
        'flex-col',
        'w-full',
        'rounded-lg',
        'border',
        'border-[var(--tiger-border,#e5e7eb)]',
        'bg-[var(--tiger-surface,#ffffff)]',
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

      const metaText = formatChatTime(message.time)
      const statusInfo = message.status ? getChatMessageStatusInfo(message.status) : undefined
      const customContent = renderMessage?.(message, index)

      const nameNode = showName && message.user?.name && (
        <div
          className={classNames(
            'text-xs',
            'mb-1',
            'text-[var(--tiger-text-muted,#6b7280)]',
            isSelf && 'text-right'
          )}>
          {message.user.name}
        </div>
      )

      const timeNode =
        showTime && metaText ? (
          <div className={classNames('text-xs', 'mt-1', 'text-[var(--tiger-text-muted,#6b7280)]')}>
            {metaText}
          </div>
        ) : null

      const statusNode = statusInfo ? (
        <div className={classNames('text-xs', 'mt-1', statusInfo.className)}>
          {message.statusText || statusInfo.text}
        </div>
      ) : null

      return (
        <div
          key={message.id ?? index}
          className={rowClasses}
          data-tiger-chat-message
          role="listitem">
          {showAvatar && message.user ? (
            <Avatar
              size="sm"
              src={message.user.avatar}
              text={message.user.name}
              className={classNames('flex-shrink-0', isSelf ? 'ml-0' : 'mr-0')}
            />
          ) : null}
          <div className={classNames('flex', 'flex-col', 'max-w-[75%]', isSelf && 'items-end')}>
            {nameNode}
            <div className={bubbleClasses} data-tiger-chat-bubble>
              {customContent ?? message.content}
            </div>
            {statusNode}
            {timeNode}
          </div>
        </div>
      )
    },
    [renderMessage, showAvatar, showName, showTime]
  )

  const statusVariantSafe = statusVariant as BadgeVariant
  const resolvedMessageListLabel = messageListAriaLabel ?? '消息列表'
  const resolvedInputLabel = inputAriaLabel ?? placeholder ?? '消息输入'
  const resolvedSendLabel = sendAriaLabel ?? sendText

  return (
    <div className={wrapperClasses} data-tiger-chat-window {...props}>
      <div
        className="flex-1 overflow-auto p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label={resolvedMessageListLabel}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[var(--tiger-text-muted,#6b7280)]">
            {emptyText}
          </div>
        ) : (
          messages.map(renderMessageItem)
        )}
      </div>
      {statusText ? (
        <div className="px-4 py-2 border-t border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)]">
          <Badge type="text" variant={statusVariantSafe} content={statusText} />
        </div>
      ) : null}
      <div className="flex items-end gap-3 px-4 py-3 border-t border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] rounded-b-lg">
        <div className="flex-1">
          {inputType === 'input' ? (
            <Input
              value={inputValue}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              aria-label={resolvedInputLabel}
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
              aria-label={resolvedInputLabel}
              onChange={(event) => handleValueChange(event.currentTarget.value)}
              onKeyDown={handleKeyDown}
            />
          )}
        </div>
        <Button disabled={!canSend} onClick={handleSend} aria-label={resolvedSendLabel}>
          {sendText}
        </Button>
      </div>
    </div>
  )
}

export default ChatWindow
