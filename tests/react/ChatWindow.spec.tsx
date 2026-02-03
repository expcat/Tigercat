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
