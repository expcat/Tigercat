/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { ChatWindow } from '@expcat/tigercat-react/ChatWindow'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import type { ChatMessage } from '@expcat/tigercat-core'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('ChatWindow (React)', () => {
  it('renders empty state and sends message', async () => {
    const onSend = vi.fn()
    render(<ChatWindow messages={[]} onSend={onSend} />)

    expect(screen.getByText('No messages')).toBeInTheDocument()

    const input = screen.getByPlaceholderText('Type a message') as HTMLTextAreaElement
    await userEvent.type(input, 'Hello{enter}')

    expect(onSend).toHaveBeenCalledTimes(1)
    expect(onSend).toHaveBeenCalledWith('Hello')
  })

  it('allows sending empty message when allowEmpty is true', async () => {
    const onSend = vi.fn()
    render(<ChatWindow allowEmpty onSend={onSend} />)

    const sendButton = screen.getByRole('button', { name: 'Send' })
    await userEvent.click(sendButton)

    expect(onSend).toHaveBeenCalledWith('')
  })

  it('does not send when disabled', async () => {
    const onSend = vi.fn()
    render(<ChatWindow disabled onSend={onSend} />)

    const sendButton = screen.getByRole('button', { name: 'Send' })
    await userEvent.click(sendButton)

    expect(onSend).not.toHaveBeenCalled()
  })

  it('handles shift+enter in textarea without sending', async () => {
    const onSend = vi.fn()
    render(<ChatWindow onSend={onSend} />)

    const input = screen.getByPlaceholderText('Type a message') as HTMLTextAreaElement
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

    expect(screen.getByText('Failed to send')).toBeInTheDocument()
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
        renderBubble={(message) => <span>Custom: {message.content}</span>}
      />
    )

    expect(screen.getByText('Custom: Hi')).toBeInTheDocument()
  })

  it('keeps input value when clearOnSend is false', async () => {
    const onSend = vi.fn()
    render(<ChatWindow inputType="input" clearOnSend={false} onSend={onSend} />)

    const input = screen.getByPlaceholderText('Type a message') as HTMLInputElement
    await userEvent.type(input, 'Ping{enter}')

    expect(onSend).toHaveBeenCalledWith('Ping')
    expect(input).toHaveValue('Ping')
  })

  it('does not send on enter when sendOnEnter is false', async () => {
    const onSend = vi.fn()
    render(<ChatWindow sendOnEnter={false} onSend={onSend} />)

    const input = screen.getByPlaceholderText('Type a message') as HTMLTextAreaElement
    await userEvent.type(input, 'Hello{enter}')

    expect(onSend).not.toHaveBeenCalled()
  })

  it('renders messages through VirtualList when virtual is enabled', () => {
    const messages: ChatMessage[] = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      content: `msg-${i}`
    }))

    const { container } = render(
      <ChatWindow messages={messages} virtual virtualHeight={200} virtualItemHeight={40} />
    )

    const bubbles = container.querySelectorAll('[data-tiger-chat-bubble]')
    expect(bubbles.length).toBeGreaterThan(0)
    expect(bubbles.length).toBeLessThan(40)
  })
  describe('locale', () => {
    it('uses ConfigProvider zh-CN for empty, send, placeholder, and failed status', () => {
      render(
        <ConfigProvider locale={zhCN}>
          <ChatWindow messages={[{ id: '1', content: 'Hi', status: 'failed' }]} />
        </ConfigProvider>
      )
      expect(screen.getByRole('button', { name: '发送' })).toBeInTheDocument()
      expect(screen.getByPlaceholderText('请输入消息')).toBeInTheDocument()
      expect(screen.getByText('发送失败')).toBeInTheDocument()
    })

    it('uses ConfigProvider en-US for empty, send, and delivered status', () => {
      render(
        <ConfigProvider locale={enUS}>
          <ChatWindow messages={[{ id: '1', content: 'Hi', status: 'sent' }]} />
        </ConfigProvider>
      )
      expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
      expect(screen.getByText('Delivered')).toBeInTheDocument()
    })

    it('lets explicit sendText win under en-US', () => {
      render(
        <ConfigProvider locale={enUS}>
          <ChatWindow sendText="Go" />
        </ConfigProvider>
      )
      expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
      expect(screen.getByText('No messages')).toBeInTheDocument()
    })

    it('shows Chinese empty text under ConfigProvider zh-CN', () => {
      render(
        <ConfigProvider locale={zhCN}>
          <ChatWindow messages={[]} />
        </ConfigProvider>
      )
      expect(screen.getByText('暂无消息')).toBeInTheDocument()
    })
  })

  describe('auto-scroll', () => {
    function getChatScroller(container: HTMLElement): HTMLElement {
      return container.querySelector('[role="log"]') as HTMLElement
    }

    function mockScrollerMetrics(
      el: HTMLElement,
      metrics: { scrollHeight: number; clientHeight: number }
    ): { setScrollHeight: (next: number) => void } {
      let scrollHeight = metrics.scrollHeight
      Object.defineProperty(el, 'scrollHeight', {
        configurable: true,
        get: () => scrollHeight
      })
      Object.defineProperty(el, 'clientHeight', {
        configurable: true,
        get: () => metrics.clientHeight
      })
      return {
        setScrollHeight(next: number) {
          scrollHeight = next
        }
      }
    }

    async function flushScrollFrames(): Promise<void> {
      await act(async () => {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve())
        })
      })
    }

    function createMessages(count: number): ChatMessage[] {
      return Array.from({ length: count }, (_, i) => ({
        id: String(i + 1),
        content: `msg-${i + 1}`
      }))
    }

    it('scrolls to bottom when a new message arrives while pinned', async () => {
      const messages = createMessages(8)
      const { container, rerender } = render(<ChatWindow messages={messages} />)
      const scroller = getChatScroller(container)
      const metrics = mockScrollerMetrics(scroller, { scrollHeight: 1000, clientHeight: 400 })
      await flushScrollFrames()

      expect(scroller.scrollTop).toBe(1000)

      metrics.setScrollHeight(1300)
      rerender(<ChatWindow messages={[...messages, { id: '9', content: 'msg-9' }]} />)
      await flushScrollFrames()

      expect(scroller.scrollTop).toBe(1300)
    })

    it('does not scroll to bottom when a new message arrives after the user left the bottom', async () => {
      const messages = createMessages(8)
      const { container, rerender } = render(<ChatWindow messages={messages} />)
      const scroller = getChatScroller(container)
      const metrics = mockScrollerMetrics(scroller, { scrollHeight: 1000, clientHeight: 400 })
      await flushScrollFrames()

      scroller.scrollTop = 400
      fireEvent.scroll(scroller)
      metrics.setScrollHeight(1300)
      rerender(<ChatWindow messages={[...messages, { id: '9', content: 'msg-9' }]} />)
      await flushScrollFrames()

      expect(scroller.scrollTop).toBe(400)
    })
  })

  it('does not send composing Enter', async () => {
    const onSend = vi.fn()
    render(<ChatWindow onSend={onSend} />)
    const input = screen.getByPlaceholderText('Type a message')
    await userEvent.type(input, 'nihao')
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true, keyCode: 229 })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('sends once when clearOnSend is false and the button is clicked twice', async () => {
    const onSend = vi.fn()
    render(<ChatWindow allowEmpty clearOnSend={false} onSend={onSend} />)
    const sendButton = screen.getByRole('button', { name: 'Send' })
    await userEvent.click(sendButton)
    await userEvent.click(sendButton)
    expect(onSend).toHaveBeenCalledTimes(1)
  })

  it('disables send when onSend is omitted', () => {
    render(<ChatWindow allowEmpty />)
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  it('does not put listitem inside the log', () => {
    render(
      <ChatWindow
        messages={[
          { id: '1', content: 'Hi', direction: 'other' },
          { id: '2', content: 'Hello', direction: 'self', status: 'failed' }
        ]}
      />
    )
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    expect(screen.getByRole('log', { name: 'Message list' })).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ChatWindow />)
      await expectNoA11yViolationsIsolated(container)
    })

    it('has no accessibility violations with messages and a failed bubble', async () => {
      const { container } = render(
        <ChatWindow
          messages={[
            { id: '1', content: 'Hi', direction: 'other' },
            { id: '2', content: 'Hello', direction: 'self', status: 'failed' }
          ]}
          statusText="typing"
          onSend={() => undefined}
        />
      )
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
