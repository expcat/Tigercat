/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
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
