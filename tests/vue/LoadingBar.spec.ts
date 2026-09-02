/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { LOADING_BAR_FINISH_HIDE_DELAY_MS } from '@expcat/tigercat-core'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { LoadingBar } from '@expcat/tigercat-vue/LoadingBar'
import { LoadingBarContainer } from '@expcat/tigercat-vue/LoadingBarContainer'
import { ConfigProvider } from '../../packages/vue/src/components/ConfigProvider'
import { expectNoA11yViolations } from '../utils'

function getBar() {
  return document.querySelector('[data-tiger-loading-bar]')
}

function getContainer() {
  return document.querySelector('[data-tiger-loading-bar-container]')
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

describe('LoadingBar (Vue)', () => {
  beforeAll(async () => {
    LoadingBar.start()
    await vi.waitFor(() => {
      expect(document.querySelector('[data-tiger-loading-bar-container]')).toBeTruthy()
    })
    LoadingBar.clear()
    document.body.innerHTML = ''
  })

  beforeEach(async () => {
    LoadingBar.clear()
    document.body.innerHTML = ''
    await flushHost()
  })

  afterEach(() => {
    vi.useRealTimers()
    LoadingBar.clear()
    document.body.innerHTML = ''
  })

  it('shows a top progressbar on start without a live region', async () => {
    LoadingBar.start()
    await flushHost()
    expect(getContainer()?.getAttribute('role')).toBe('progressbar')
    expect(getContainer()?.getAttribute('aria-busy')).toBe('true')
    expect(getContainer()?.getAttribute('aria-live')).toBeNull()
    expect(getContainer()?.id).toBeFalsy()
    expect(getBar()).toBeTruthy()
  })

  it('mounts into a custom container and moves when start is called again', async () => {
    const first = document.createElement('div')
    const second = document.createElement('div')
    first.id = 'loading-bar-host-a'
    second.id = 'loading-bar-host-b'
    document.body.append(first, second)

    LoadingBar.start({ container: '#loading-bar-host-a' })
    await flushHost()
    expect(first.querySelector('[data-tiger-imperative-host]')).toBeTruthy()

    LoadingBar.start({ container: '#loading-bar-host-b' })
    await flushHost()
    expect(first.querySelector('[data-tiger-imperative-host]')).toBeNull()
    expect(second.querySelector('[data-tiger-imperative-host]')).toBeTruthy()
  })

  it('finish completes then hides the bar', async () => {
    vi.useFakeTimers()
    LoadingBar.start()
    await flushHost()
    LoadingBar.finish()
    await flushHost()
    expect(getContainer()?.getAttribute('data-tiger-loading-bar-status')).toBe('success')
    expect(getContainer()?.getAttribute('aria-valuenow')).toBe('100')
    vi.advanceTimersByTime(LOADING_BAR_FINISH_HIDE_DELAY_MS)
    await flushHost()
    expect(getBar()).toBeNull()
  })

  it('set writes a determinate percentage', async () => {
    LoadingBar.start()
    LoadingBar.set(40)
    await flushHost()
    expect(getContainer()?.getAttribute('aria-valuenow')).toBe('40')
  })

  it('uses official loading text when ariaLabel is omitted', async () => {
    mountProvider(zhCN)
    LoadingBar.start()
    await flushHost()
    expect(getContainer()?.getAttribute('aria-label')).toBe(zhCN.common?.loadingText)

    LoadingBar.clear()
    mountProvider(zhTW)
    LoadingBar.start()
    await flushHost()
    expect(getContainer()?.getAttribute('aria-label')).toBe(zhTW.common?.loadingText)

    LoadingBar.clear()
    mountProvider(jaJP)
    LoadingBar.start()
    await flushHost()
    expect(getContainer()?.getAttribute('aria-label')).toBe(jaJP.common?.loadingText)
  })

  it('clamps declarative valuenow and does not put live on the bar', async () => {
    const root = document.createElement('div')
    document.body.append(root)
    const app = createApp({
      render: () => h(LoadingBarContainer, { percentage: 150, status: 'loading' })
    })
    app.mount(root)
    await nextTick()
    expect(getContainer()?.getAttribute('aria-valuenow')).toBe('100')
    expect(getContainer()?.getAttribute('aria-live')).toBeNull()
    await expectNoA11yViolations(getContainer() as HTMLElement)
    app.unmount()
  })
})
