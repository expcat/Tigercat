/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { act, render, waitFor } from '@testing-library/react'
import { LOADING_BAR_FINISH_HIDE_DELAY_MS } from '@expcat/tigercat-core'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { LoadingBar, LoadingBarContainer } from '@expcat/tigercat-react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { expectNoA11yViolations } from '../utils/react'

function getBar() {
  return document.querySelector('[data-tiger-loading-bar]')
}

function getContainer() {
  return document.querySelector('[data-tiger-loading-bar-container]')
}

async function flushHost() {
  await act(async () => {
    await Promise.resolve()
  })
}

describe('LoadingBar (React)', () => {
  beforeAll(async () => {
    LoadingBar.start()
    await waitFor(() => {
      expect(document.querySelector('[data-tiger-loading-bar-container]')).toBeTruthy()
    })
    LoadingBar.clear()
    document.body.innerHTML = ''
  })

  beforeEach(() => {
    act(() => {
      LoadingBar.clear()
    })
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    act(() => {
      LoadingBar.clear()
    })
    document.body.innerHTML = ''
  })

  it('shows a top progressbar on start without a live region', async () => {
    act(() => {
      LoadingBar.start()
    })
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

    act(() => {
      LoadingBar.start({ container: '#loading-bar-host-a' })
    })
    expect(first.querySelector('[data-tiger-imperative-host]')).toBeTruthy()

    act(() => {
      LoadingBar.start({ container: '#loading-bar-host-b' })
    })
    expect(first.querySelector('[data-tiger-imperative-host]')).toBeNull()
    expect(second.querySelector('[data-tiger-imperative-host]')).toBeTruthy()
  })

  it('does not throw on an illegal container selector', () => {
    expect(() => {
      act(() => {
        LoadingBar.start({ container: '[' })
      })
    }).not.toThrow()
  })

  it('finish completes then hides the bar', async () => {
    vi.useFakeTimers()
    act(() => {
      LoadingBar.start()
    })
    act(() => {
      LoadingBar.finish()
    })
    expect(getContainer()?.getAttribute('data-tiger-loading-bar-status')).toBe('success')
    expect(getContainer()?.getAttribute('aria-valuenow')).toBe('100')
    act(() => {
      vi.advanceTimersByTime(LOADING_BAR_FINISH_HIDE_DELAY_MS)
    })
    expect(getBar()).toBeNull()
    expect(document.querySelector('[data-tiger-loading-bar-container]')).toBeNull()
  })

  it('set writes a determinate percentage', () => {
    act(() => {
      LoadingBar.start()
      LoadingBar.set(40)
    })
    expect(getContainer()?.getAttribute('aria-valuenow')).toBe('40')
  })

  it('uses official loading text when ariaLabel is omitted', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <span />
      </ConfigProvider>
    )
    act(() => {
      LoadingBar.start()
    })
    expect(getContainer()?.getAttribute('aria-label')).toBe(zhCN.common?.loadingText)

    LoadingBar.clear()
    render(
      <ConfigProvider locale={zhTW}>
        <span />
      </ConfigProvider>
    )
    act(() => {
      LoadingBar.start()
    })
    expect(getContainer()?.getAttribute('aria-label')).toBe(zhTW.common?.loadingText)

    LoadingBar.clear()
    render(
      <ConfigProvider locale={jaJP}>
        <span />
      </ConfigProvider>
    )
    act(() => {
      LoadingBar.start()
    })
    expect(getContainer()?.getAttribute('aria-label')).toBe(jaJP.common?.loadingText)
  })

  it('clamps declarative valuenow and does not put live on the bar', async () => {
    const { rerender, unmount } = render(<LoadingBarContainer percentage={150} status="loading" />)
    const bar = document.querySelector('[data-tiger-loading-bar-container]')
    expect(bar?.getAttribute('aria-valuenow')).toBe('100')
    expect(bar?.getAttribute('aria-live')).toBeNull()
    rerender(<LoadingBarContainer percentage={Number.NaN} status="idle" />)
    expect(
      document.querySelector('[data-tiger-loading-bar-container]')?.getAttribute('aria-valuenow')
    ).toBe('0')
    await expectNoA11yViolations(
      document.querySelector('[data-tiger-loading-bar-container]') as HTMLElement
    )
    unmount()
  })
})
