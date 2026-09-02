/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { Message } from '@expcat/tigercat-vue/Message'
import { MessageContainer } from '@expcat/tigercat-vue/MessageContainer'
import { ConfigProvider } from '../../packages/vue/src/components/ConfigProvider'
import { expectNoA11yViolations } from '../utils'

function getMessages() {
  return document.querySelectorAll('[data-tiger-message]')
}

async function flushHost() {
  await Promise.resolve()
  await nextTick()
}

function mountProvider(locale: typeof zhCN) {
  const app = createApp({
    render: () => h(ConfigProvider, { locale }, () => h('span'))
  })
  const root = document.createElement('div')
  document.body.append(root)
  app.mount(root)
  return () => {
    app.unmount()
    root.remove()
  }
}

describe('Message (Vue)', () => {
  beforeAll(async () => {
    Message.info({ content: '__warmup__', duration: 0 })
    await vi.waitFor(() => {
      expect(document.querySelector('[data-tiger-message]')).toBeTruthy()
    })
    Message.clear()
    document.body.innerHTML = ''
  })

  beforeEach(async () => {
    Message.clear()
    document.body.innerHTML = ''
    await flushHost()
  })

  afterEach(() => {
    vi.useRealTimers()
    Message.clear()
    document.body.innerHTML = ''
  })

  it('renders three messages from one turn without waitFor', async () => {
    Message.info('one')
    Message.success('two')
    Message.warning('three')
    await flushHost()
    expect(getMessages()).toHaveLength(3)
  })

  it('respects loading duration when it is passed', async () => {
    vi.useFakeTimers()
    Message.loading({ content: 'Saving', duration: 1000 })
    await flushHost()
    expect(getMessages()).toHaveLength(1)
    vi.advanceTimersByTime(1000)
    await flushHost()
    expect(getMessages()).toHaveLength(0)
  })

  it('does not fire onClose again after a manual close', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    Message.info({ content: 'Timed', duration: 3000, closable: true, onClose })
    await flushHost()
    const close = document.querySelector('button')
    close?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushHost()
    expect(onClose).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(3000)
    await flushHost()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses official locale close names without an override', async () => {
    const unmount = mountProvider(zhCN)
    Message.info({ content: 'Closable', closable: true, duration: 0 })
    await flushHost()
    expect(
      document.querySelector(`button[aria-label="${zhCN.common?.closeMessageAriaLabel}"]`)
    ).toBeTruthy()
    unmount()
    Message.clear()

    mountProvider(zhTW)
    Message.info({ content: 'TW', closable: true, duration: 0 })
    await flushHost()
    const tw = document.querySelector('button')
    expect(tw?.getAttribute('aria-label')).toBe(zhTW.common?.closeMessageAriaLabel)
    expect(tw?.getAttribute('aria-label')).not.toContain('消息')

    Message.clear()
    mountProvider(jaJP)
    Message.info({ content: 'JA', closable: true, duration: 0 })
    await flushHost()
    expect(document.querySelector('button')?.getAttribute('aria-label')).toBe(
      jaJP.common?.closeMessageAriaLabel
    )
  })

  it('keeps a single live region per item and none on an empty container', async () => {
    Message.info({ content: 'info', duration: 0 })
    Message.error({ content: 'error', duration: 0 })
    await flushHost()
    expect(document.querySelectorAll('[aria-live]')).toHaveLength(0)
    expect(document.querySelectorAll('[role="status"]')).toHaveLength(1)
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(1)
    await expectNoA11yViolations(document.querySelector('[data-tiger-message]') as HTMLElement)

    Message.clear()
    const root = document.createElement('div')
    document.body.append(root)
    const app = createApp(MessageContainer)
    app.mount(root)
    await nextTick()
    expect(document.querySelector('[data-tiger-message-container][aria-live]')).toBeNull()
    const empty = document.querySelector('[data-tiger-message-container]')
    if (empty) await expectNoA11yViolations(empty as HTMLElement)
    app.unmount()
  })

  it('emits close from the declarative container', async () => {
    const onClose = vi.fn()
    const root = document.createElement('div')
    document.body.append(root)
    const app = createApp({
      render: () =>
        h(MessageContainer, {
          messages: [
            {
              id: 'one',
              type: 'info',
              content: 'Declarative',
              duration: 0,
              closable: true
            }
          ],
          onClose
        })
    })
    app.mount(root)
    await nextTick()
    document.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(onClose).toHaveBeenCalledWith('one')
    app.unmount()
  })
})
