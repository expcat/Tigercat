/**
 * @vitest-environment happy-dom
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/vue'
import { defineComponent, h, nextTick } from 'vue'
import { ChatWindow } from '@expcat/tigercat-vue/ChatWindow'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import type { ChatMessage } from '@expcat/tigercat-core'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils'

function createMessages(count: number): ChatMessage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    content: `msg-${i + 1}`
  }))
}

function getChatScroller(container: HTMLElement, virtual = false): HTMLElement {
  const log = container.querySelector('[role="log"]') as HTMLElement
  if (virtual) {
    return (log.firstElementChild as HTMLElement | null) ?? log
  }
  return log
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
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

describe('ChatWindow (Vue)', () => {
  it('renders empty state and emits send', async () => {
    const { emitted } = render(ChatWindow, {
      props: { messages: [] }
    })

    expect(screen.getByText('No messages')).toBeInTheDocument()

    const textarea = screen.getByPlaceholderText('Type a message') as HTMLTextAreaElement
    await fireEvent.update(textarea, 'Hello')
    await fireEvent.keyDown(textarea, { key: 'Enter' })

    expect(emitted().send).toBeTruthy()
    expect(emitted().send?.[0]).toEqual(['Hello'])
  })

  it('allows sending empty message when allowEmpty is true', async () => {
    const { emitted } = render(ChatWindow, {
      props: { allowEmpty: true }
    })

    const sendButton = screen.getByRole('button', { name: 'Send' })
    await fireEvent.click(sendButton)

    expect(emitted().send?.[0]).toEqual([''])
  })

  it('does not send when disabled', async () => {
    const { emitted } = render(ChatWindow, {
      props: { disabled: true }
    })

    const sendButton = screen.getByRole('button', { name: 'Send' })
    await fireEvent.click(sendButton)

    expect(emitted().send).toBeFalsy()
  })

  it('handles shift+enter in textarea without sending', async () => {
    const { emitted } = render(ChatWindow)

    const textarea = screen.getByPlaceholderText('Type a message') as HTMLTextAreaElement
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

    expect(screen.getByText('Failed to send')).toBeInTheDocument()
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

  it('keeps input value when clearOnSend is false', async () => {
    const { emitted } = render(ChatWindow, {
      props: { inputType: 'input', clearOnSend: false }
    })

    const input = screen.getByPlaceholderText('Type a message') as HTMLInputElement
    await fireEvent.update(input, 'Ping')
    await fireEvent.keyDown(input, { key: 'Enter' })

    expect(emitted().send?.[0]).toEqual(['Ping'])
    expect(input.value).toBe('Ping')
  })

  it('does not send on enter when sendOnEnter is false', async () => {
    const { emitted } = render(ChatWindow, {
      props: { sendOnEnter: false }
    })

    const textarea = screen.getByPlaceholderText('Type a message') as HTMLTextAreaElement
    await fireEvent.update(textarea, 'Hello')
    await fireEvent.keyDown(textarea, { key: 'Enter' })

    expect(emitted().send).toBeFalsy()
  })

  it('renders messages through VirtualList when virtual is enabled', () => {
    const messages: ChatMessage[] = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      content: `msg-${i}`
    }))

    const { container } = render(ChatWindow, {
      props: {
        messages,
        virtual: true,
        virtualHeight: 200,
        virtualItemHeight: 40
      }
    })

    const bubbles = container.querySelectorAll('[data-tiger-chat-bubble]')
    // VirtualList must keep the rendered window much smaller than 200 rows.
    expect(bubbles.length).toBeGreaterThan(0)
    expect(bubbles.length).toBeLessThan(40)
  })

  describe('locale', () => {
    it('uses ConfigProvider zh-CN for empty, send, placeholder, and failed status', () => {
      const Wrapper = defineComponent({
        setup() {
          return () =>
            h(ConfigProvider, { locale: zhCN }, () =>
              h(ChatWindow, {
                messages: [{ id: '1', content: 'Hi', status: 'failed' }]
              })
            )
        }
      })
      render(Wrapper)
      expect(screen.getByRole('button', { name: '发送' })).toBeInTheDocument()
      expect(screen.getByPlaceholderText('请输入消息')).toBeInTheDocument()
      expect(screen.getByText('发送失败')).toBeInTheDocument()
    })

    it('uses ConfigProvider en-US for empty, send, and delivered status', () => {
      const Wrapper = defineComponent({
        setup() {
          return () =>
            h(ConfigProvider, { locale: enUS }, () =>
              h(ChatWindow, {
                messages: [{ id: '1', content: 'Hi', status: 'sent' }]
              })
            )
        }
      })
      render(Wrapper)
      expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
      expect(screen.getByText('Delivered')).toBeInTheDocument()
    })

    it('lets explicit sendText win under en-US', () => {
      const Wrapper = defineComponent({
        setup() {
          return () => h(ConfigProvider, { locale: enUS }, () => h(ChatWindow, { sendText: 'Go' }))
        }
      })
      render(Wrapper)
      expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
      expect(screen.getByText('No messages')).toBeInTheDocument()
    })

    it('shows Chinese empty text under ConfigProvider zh-CN', () => {
      const Wrapper = defineComponent({
        setup() {
          return () => h(ConfigProvider, { locale: zhCN }, () => h(ChatWindow, { messages: [] }))
        }
      })
      render(Wrapper)
      expect(screen.getByText('暂无消息')).toBeInTheDocument()
    })
  })

  describe('auto-scroll', () => {
    it('does not call onUpdated for scroll-to-bottom', () => {
      const source = readFileSync(
        resolve(process.cwd(), 'packages/vue/src/components/ChatWindow.ts'),
        'utf8'
      )
      expect(source).not.toContain('onUpdated(')
    })

    it('does not reset scrollTop when a controlled v-model keystroke re-renders', async () => {
      const messages = createMessages(8)
      const { container, rerender } = render(ChatWindow, {
        props: { messages, modelValue: '' }
      })
      const scroller = getChatScroller(container)
      mockScrollerMetrics(scroller, { scrollHeight: 2000, clientHeight: 400 })
      await flushScrollFrames()

      scroller.scrollTop = 600
      const textarea = screen.getByPlaceholderText('Type a message')
      await fireEvent.update(textarea, 'reading history')
      await rerender({ messages, modelValue: 'reading history' })
      await flushScrollFrames()

      expect(scroller.scrollTop).toBe(600)
    })

    it('does not reset virtual log scrollTop when a controlled v-model keystroke re-renders', async () => {
      const messages = createMessages(120)
      const { container, rerender } = render(ChatWindow, {
        props: {
          messages,
          modelValue: '',
          virtual: true,
          virtualHeight: 200,
          virtualItemHeight: 40
        }
      })
      const scroller = getChatScroller(container, true)
      mockScrollerMetrics(scroller, { scrollHeight: 4800, clientHeight: 200 })
      await flushScrollFrames()

      scroller.scrollTop = 800
      const textarea = screen.getByPlaceholderText('Type a message')
      await fireEvent.update(textarea, 'reading history')
      await rerender({
        messages,
        modelValue: 'reading history',
        virtual: true,
        virtualHeight: 200,
        virtualItemHeight: 40
      })
      await flushScrollFrames()

      expect(scroller.scrollTop).toBe(800)
    })

    it('scrolls to bottom when a new message arrives while pinned', async () => {
      const messages = createMessages(8)
      const { container, rerender } = render(ChatWindow, {
        props: { messages }
      })
      const scroller = getChatScroller(container)
      const metrics = mockScrollerMetrics(scroller, { scrollHeight: 1000, clientHeight: 400 })
      await flushScrollFrames()

      expect(scroller.scrollTop).toBe(1000)

      metrics.setScrollHeight(1300)
      await rerender({
        messages: [...messages, { id: '9', content: 'msg-9' }]
      })
      await flushScrollFrames()

      expect(scroller.scrollTop).toBe(1300)
    })

    it('does not scroll to bottom when a new message arrives after the user left the bottom', async () => {
      const messages = createMessages(8)
      const { container, rerender } = render(ChatWindow, {
        props: { messages }
      })
      const scroller = getChatScroller(container)
      const metrics = mockScrollerMetrics(scroller, { scrollHeight: 1000, clientHeight: 400 })
      await flushScrollFrames()

      scroller.scrollTop = 400
      await fireEvent.scroll(scroller)
      metrics.setScrollHeight(1300)
      await rerender({
        messages: [...messages, { id: '9', content: 'msg-9' }]
      })
      await flushScrollFrames()

      expect(scroller.scrollTop).toBe(400)
    })

    it('does not assign scrollTop on messages.length change when autoScrollToBottom is false', async () => {
      const messages = createMessages(8)
      const { container, rerender } = render(ChatWindow, {
        props: { messages, autoScrollToBottom: false }
      })
      const scroller = getChatScroller(container)
      mockScrollerMetrics(scroller, { scrollHeight: 1000, clientHeight: 400 })
      await flushScrollFrames()

      scroller.scrollTop = 400
      await rerender({
        messages: [...messages, { id: '9', content: 'msg-9' }],
        autoScrollToBottom: false
      })
      await flushScrollFrames()

      expect(scroller.scrollTop).toBe(400)
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(ChatWindow)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
