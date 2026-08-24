/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { LoadingBar } from '@expcat/tigercat-vue'
import {
  LOADING_BAR_CONTAINER_ID,
  LOADING_BAR_CONTAINER_ROOT_ID,
  LOADING_BAR_FINISH_HIDE_DELAY_MS
} from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

async function flushDomUpdates() {
  await nextTick()
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve()
  }
}

async function flushLazyImport() {
  await flushDomUpdates()
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
  await flushDomUpdates()
}

function getBar() {
  return document.querySelector('[data-tiger-loading-bar]')
}

function getContainer() {
  return document.querySelector('[data-tiger-loading-bar-container]')
}

async function waitForBar() {
  await vi.waitFor(() => {
    expect(getBar()).toBeTruthy()
  })
  return getBar()!
}

describe('LoadingBar (Vue)', () => {
  beforeAll(async () => {
    LoadingBar.start()
    await flushLazyImport()
    LoadingBar.clear()
    await flushLazyImport()
    document.body.innerHTML = ''
  })

  beforeEach(async () => {
    LoadingBar.clear()
    await flushLazyImport()
    document.body.innerHTML = ''
  })

  afterEach(async () => {
    vi.useRealTimers()
    LoadingBar.clear()
    document.body.innerHTML = ''
  })

  describe('Basic Functionality', () => {
    it('shows a top loading bar on start', async () => {
      LoadingBar.start()
      await flushDomUpdates()

      const bar = await waitForBar()
      expect(bar.getAttribute('role')).toBe('progressbar')
      expect(bar.getAttribute('aria-busy')).toBe('true')
      expect(bar.getAttribute('aria-live')).toBe('polite')
      expect(getContainer()?.id).toBe(LOADING_BAR_CONTAINER_ID)
      expect(document.getElementById(LOADING_BAR_CONTAINER_ROOT_ID)).toBeTruthy()
    })

    it('accepts color, height and className options', async () => {
      LoadingBar.start({
        color: 'success',
        height: 4,
        className: 'custom-loading-bar'
      })
      await flushDomUpdates()

      const container = await vi.waitFor(() => {
        const el = getContainer()
        expect(el).toBeTruthy()
        return el!
      })
      expect(container.className).toContain('custom-loading-bar')
      expect(container.getAttribute('style') || '').toContain('4px')
      expect(getBar()?.className).toContain('success')
    })

    it('mounts into a custom container target', async () => {
      const host = document.createElement('div')
      host.id = 'loading-bar-host'
      document.body.appendChild(host)

      LoadingBar.start({ container: '#loading-bar-host' })
      await flushDomUpdates()
      await waitForBar()

      expect(host.querySelector(`#${LOADING_BAR_CONTAINER_ROOT_ID}`)).toBeTruthy()
    })
  })

  describe('finish / error / clear', () => {
    it('finish completes then hides the bar', async () => {
      LoadingBar.start()
      await flushDomUpdates()
      await waitForBar()
      vi.useFakeTimers()

      LoadingBar.finish()
      await flushDomUpdates()

      const finishing = getBar()
      expect(finishing).toBeTruthy()
      expect(finishing?.getAttribute('data-tiger-loading-bar-status')).toBe('success')
      expect(finishing?.getAttribute('aria-valuenow')).toBe('100')
      expect(finishing?.getAttribute('aria-busy')).toBeNull()

      vi.advanceTimersByTime(LOADING_BAR_FINISH_HIDE_DELAY_MS)
      await flushDomUpdates()
      expect(getBar()).toBeNull()
    })

    it('error shows the error state then hides', async () => {
      LoadingBar.start()
      await flushDomUpdates()
      await waitForBar()
      vi.useFakeTimers()

      LoadingBar.error()
      await flushDomUpdates()

      const bar = getBar()
      expect(bar?.getAttribute('data-tiger-loading-bar-status')).toBe('error')
      expect(bar?.className).toContain('error')
      expect(bar?.getAttribute('aria-valuenow')).toBe('100')

      vi.advanceTimersByTime(LOADING_BAR_FINISH_HIDE_DELAY_MS)
      await flushDomUpdates()
      expect(getBar()).toBeNull()
    })

    it('clear hides immediately and removes the host', async () => {
      LoadingBar.start()
      await flushDomUpdates()
      await waitForBar()

      LoadingBar.clear()
      await flushDomUpdates()

      expect(getBar()).toBeNull()
      expect(document.getElementById(LOADING_BAR_CONTAINER_ROOT_ID)).toBeNull()
    })

    it('nested start requires matching finish calls', async () => {
      LoadingBar.start()
      LoadingBar.start()
      await flushDomUpdates()
      await waitForBar()

      LoadingBar.finish()
      await flushDomUpdates()
      expect(getBar()?.getAttribute('data-tiger-loading-bar-status')).toBe('loading')

      LoadingBar.finish()
      await flushDomUpdates()
      expect(getBar()?.getAttribute('data-tiger-loading-bar-status')).toBe('success')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations and does not trap focus', async () => {
      LoadingBar.start({ ariaLabel: 'Page loading' })
      await flushDomUpdates()
      const bar = await waitForBar()

      expect(bar.getAttribute('aria-label')).toBe('Page loading')
      expect(bar.getAttribute('tabindex')).toBeNull()
      expect(document.activeElement === bar || document.activeElement === getContainer()).toBe(
        false
      )
      await expectNoA11yViolationsIsolated(document.body)
    })
  })

  describe('SSR / edge', () => {
    it('does not throw when calling the discrete API with no existing host', () => {
      expect(() => LoadingBar.finish()).not.toThrow()
      expect(() => LoadingBar.clear()).not.toThrow()
    })
  })
})
