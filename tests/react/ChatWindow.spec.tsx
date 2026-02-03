/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { ChatWindow } from '@expcat/tigercat-react'
import type { ChatMessage } from '@expcat/tigercat-core'

describe('ChatWindow (React)', () => {
  it('renders empty state and sends message', async () => {
    const onSend = vi.fn()
    render(<ChatWindow messages={[]} onSend={onSend} />)

    expect(screen.getByText('暂无消息')).toBeInTheDocument()

    const input = screen.getByPlaceholderText('请输入消息') as HTMLTextAreaElement
    await userEvent.type(input, 'Hello{enter}')

    expect(onSend).toHaveBeenCalledTimes(1)
    expect(onSend).toHaveBeenCalledWith('Hello')
  })

  it('allows sending empty message when allowEmpty is true', async () => {
    const onSend = vi.fn()
    render(<ChatWindow allowEmpty onSend={onSend} />)

    const sendButton = screen.getByRole('button', { name: '发送' })
    await userEvent.click(sendButton)

    expect(onSend).toHaveBeenCalledWith('')
  })

  it('does not send when disabled', async () => {
    const onSend = vi.fn()
    render(<ChatWindow disabled onSend={onSend} />)

    const sendButton = screen.getByRole('button', { name: '发送' })
    await userEvent.click(sendButton)

    expect(onSend).not.toHaveBeenCalled()
  })

  it('handles shift+enter in textarea without sending', async () => {
    const onSend = vi.fn()
    render(<ChatWindow onSend={onSend} />)

    const input = screen.getByPlaceholderText('请输入消息') as HTMLTextAreaElement
    await userEvent.type(input, 'Hello{shift>}{enter}{/shift}')

    expect(onSend).not.toHaveBeenCalled()

    await userEvent.type(input, '{enter}')
    expect(onSend).toHaveBeenCalledTimes(1)
  })

  it('renders status and time metadata', () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        content: 'Hi',
        direction: 'other',
        status: 'failed',
        time: '10:00'
      }
    ]

    render(<ChatWindow messages={messages} showTime />)

    expect(screen.getByText('发送失败')).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('renders custom message content', () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        content: 'Hi',
        direction: 'other',
        user: { name: 'A' }
      }
    ]

    render(
      <ChatWindow
        messages={messages}
        renderMessage={(message) => <span>Custom: {message.content}</span>}
      />
    )

    expect(screen.getByText('Custom: Hi')).toBeInTheDocument()
  })
})
