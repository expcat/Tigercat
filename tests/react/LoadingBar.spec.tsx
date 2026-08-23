/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { LoadingBar } from '@expcat/tigercat-react'
import {
  LOADING_BAR_CONTAINER_ID,
  LOADING_BAR_CONTAINER_ROOT_ID,
  LOADING_BAR_FINISH_HIDE_DELAY_MS
} from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function getBar() {
  return document.querySelector('[data-tiger-loading-bar]')
}

function getContainer() {
  return document.querySelector('[data-tiger-loading-bar-container]')
}

async function runLoadingBarAction<T>(action: () => T): Promise<T> {
  let result!: T
  act(() => {
    result = action()
  })
  await act(async () => {
    await Promise.resolve()
  })
  return result
}

describe('LoadingBar (React)', () => {
  beforeEach(async () => {
    await runLoadingBarAction(() => LoadingBar.clear())
    document.body.innerHTML = ''
  })

  afterEach(async () => {
    vi.useRealTimers()
    await runLoadingBarAction(() => LoadingBar.clear())
    document.body.innerHTML = ''
  })

  describe('Basic Functionality', () => {
    it('shows a top loading bar on start', async () => {
      await runLoadingBarAction(() => LoadingBar.start())

      await waitFor(() => {
        const bar = getBar()
        expect(bar).toBeTruthy()
        expect(bar?.getAttribute('role')).toBe('progressbar')
        expect(bar?.getAttribute('aria-busy')).toBe('true')
        expect(bar?.getAttribute('aria-live')).toBe('polite')
        expect(getContainer()?.id).toBe(LOADING_BAR_CONTAINER_ID)
        expect(document.getElementById(LOADING_BAR_CONTAINER_ROOT_ID)).toBeTruthy()
      })
    })

    it('accepts color, height and className options', async () => {
      await runLoadingBarAction(() =>
        LoadingBar.start({
          color: 'success',
          height: 4,
          className: 'custom-loading-bar'
        })
      )

      await waitFor(() => {
        const container = getContainer()
        expect(container).toBeTruthy()
        expect(container?.className).toContain('custom-loading-bar')
        expect(container).toHaveStyle({ height: '4px' })
        expect(getBar()?.className).toContain('success')
      })
    })

    it('mounts into a custom container target', async () => {
      const host = document.createElement('div')
      host.id = 'loading-bar-host'
      document.body.appendChild(host)

      await runLoadingBarAction(() => LoadingBar.start({ container: '#loading-bar-host' }))

      await waitFor(() => {
        expect(host.querySelector(`#${LOADING_BAR_CONTAINER_ROOT_ID}`)).toBeTruthy()
        expect(getBar()).toBeTruthy()
      })
    })
  })

  describe('finish / error / clear', () => {
    it('finish completes then hides the bar', async () => {
      vi.useFakeTimers()
      await runLoadingBarAction(() => LoadingBar.start())
      expect(getBar()).toBeTruthy()

      await runLoadingBarAction(() => LoadingBar.finish())
      expect(getBar()?.getAttribute('data-tiger-loading-bar-status')).toBe('success')
      expect(getBar()?.getAttribute('aria-valuenow')).toBe('100')
      expect(getBar()?.getAttribute('aria-busy')).toBeNull()

      await act(async () => {
        vi.advanceTimersByTime(LOADING_BAR_FINISH_HIDE_DELAY_MS)
      })
      expect(getBar()).toBeNull()
    })

    it('error shows the error state then hides', async () => {
      vi.useFakeTimers()
      await runLoadingBarAction(() => LoadingBar.start())

      await runLoadingBarAction(() => LoadingBar.error())
      expect(getBar()?.getAttribute('data-tiger-loading-bar-status')).toBe('error')
      expect(getBar()?.className).toContain('error')
      expect(getBar()?.getAttribute('aria-valuenow')).toBe('100')

      await act(async () => {
        vi.advanceTimersByTime(LOADING_BAR_FINISH_HIDE_DELAY_MS)
      })
      expect(getBar()).toBeNull()
    })

    it('clear hides immediately and removes the host', async () => {
      await runLoadingBarAction(() => LoadingBar.start())
      await waitFor(() => expect(getBar()).toBeTruthy())

      await runLoadingBarAction(() => LoadingBar.clear())
      expect(getBar()).toBeNull()
      expect(document.getElementById(LOADING_BAR_CONTAINER_ROOT_ID)).toBeNull()
    })

    it('nested start requires matching finish calls', async () => {
      vi.useFakeTimers()
      await runLoadingBarAction(() => {
        LoadingBar.start()
        LoadingBar.start()
      })
      expect(getBar()?.getAttribute('data-tiger-loading-bar-status')).toBe('loading')

      await runLoadingBarAction(() => LoadingBar.finish())
      expect(getBar()?.getAttribute('data-tiger-loading-bar-status')).toBe('loading')

      await runLoadingBarAction(() => LoadingBar.finish())
      expect(getBar()?.getAttribute('data-tiger-loading-bar-status')).toBe('success')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations and does not trap focus', async () => {
      await runLoadingBarAction(() => LoadingBar.start({ ariaLabel: 'Page loading' }))

      await waitFor(() => {
        expect(getBar()).toBeTruthy()
      })

      const bar = getBar()
      expect(bar?.getAttribute('aria-label')).toBe('Page loading')
      expect(bar?.getAttribute('tabindex')).toBeNull()
      expect(document.activeElement === bar || document.activeElement === getContainer()).toBe(
        false
      )
      await expectNoA11yViolationsIsolated(document.body)
    })
  })

  describe('SSR / edge', () => {
    it('does not throw when calling the discrete API with no existing host', async () => {
      await expect(runLoadingBarAction(() => LoadingBar.finish())).resolves.toBeUndefined()
      await expect(runLoadingBarAction(() => LoadingBar.clear())).resolves.toBeUndefined()
    })
  })
})
