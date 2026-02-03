/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/vue'
import { ChatWindow } from '@expcat/tigercat-vue'
import type { ChatMessage } from '@expcat/tigercat-core'

describe('ChatWindow (Vue)', () => {
  it('renders empty state and emits send', async () => {
    const { emitted } = render(ChatWindow, {
      props: { messages: [] }
    })

    expect(screen.getByText('暂无消息')).toBeInTheDocument()

    const textarea = screen.getByPlaceholderText('请输入消息') as HTMLTextAreaElement
    await fireEvent.update(textarea, 'Hello')
    await fireEvent.keyDown(textarea, { key: 'Enter' })

    expect(emitted().send).toBeTruthy()
    expect(emitted().send?.[0]).toEqual(['Hello'])
  })

  it('allows sending empty message when allowEmpty is true', async () => {
    const { emitted } = render(ChatWindow, {
      props: { allowEmpty: true }
    })

    const sendButton = screen.getByRole('button', { name: '发送' })
    await fireEvent.click(sendButton)

    expect(emitted().send?.[0]).toEqual([''])
  })

  it('does not send when disabled', async () => {
    const { emitted } = render(ChatWindow, {
      props: { disabled: true }
    })

    const sendButton = screen.getByRole('button', { name: '发送' })
    await fireEvent.click(sendButton)

    expect(emitted().send).toBeFalsy()
  })

  it('handles shift+enter in textarea without sending', async () => {
    const { emitted } = render(ChatWindow)

    const textarea = screen.getByPlaceholderText('请输入消息') as HTMLTextAreaElement
    await fireEvent.update(textarea, 'Hello')
    await fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })

    expect(emitted().send).toBeFalsy()

    await fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(emitted().send?.[0]).toEqual(['Hello'])
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

    render(ChatWindow, {
      props: { messages, showTime: true }
    })

    expect(screen.getByText('发送失败')).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('renders slot message content', () => {
    const messages: ChatMessage[] = [
      {
        id: '1',
        content: 'Hi',
        direction: 'other',
        user: { name: 'A' }
      }
    ]

    render(ChatWindow, {
      props: { messages },
      slots: {
        message: ({ message }: { message: ChatMessage }) => `Custom: ${message.content}`
      }
    })

    expect(screen.getByText('Custom: Hi')).toBeInTheDocument()
  })
})
