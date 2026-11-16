/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { defineComponent, h, nextTick } from 'vue'
import { FullscreenButton } from '@expcat/tigercat-vue/FullscreenButton'
import { useFullscreen } from '@expcat/tigercat-vue/useFullscreen'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('FullscreenButton (Vue)', () => {
  it('renders a labelled toggle and reads fullscreen support after mount', () => {
    render(FullscreenButton)
    const button = screen.getByRole('button', { name: 'Enter fullscreen' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(button).not.toHaveAttribute('disabled')
  })

  it('unsubscribes document fullscreen events on unmount', () => {
    const onChange = vi.fn()
    const Host = defineComponent({
      setup() {
        useFullscreen({ onChange })
        return () => h('div')
      }
    })
    const { unmount } = render(Host)

    document.dispatchEvent(new Event('fullscreenchange'))
    const before = onChange.mock.calls.length
    expect(before).toBeGreaterThan(0)

    unmount()
    document.dispatchEvent(new Event('fullscreenchange'))
    document.dispatchEvent(new Event('webkitfullscreenchange'))

    expect(onChange.mock.calls.length).toBe(before)
  })

  it('syncs the pressed state and next request when the target changes during fullscreen', async () => {
    const targetA = document.createElement('div')
    const targetB = document.createElement('div')
    const request = vi.fn().mockResolvedValue(undefined)
    targetB.requestFullscreen = request
    document.documentElement.requestFullscreen = vi.fn()
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: targetA })

    try {
      const { rerender } = render(FullscreenButton, { props: { target: targetA } })
      await nextTick()
      const button = screen.getByRole('button', { name: 'Exit fullscreen' })
      expect(button).toHaveAttribute('aria-pressed', 'true')

      await rerender({ target: targetB })

      expect(button).toHaveAttribute('aria-pressed', 'false')
      expect(button).toHaveAccessibleName('Enter fullscreen')
      await fireEvent.click(button)
      expect(request).toHaveBeenCalledOnce()
    } finally {
      Reflect.deleteProperty(document, 'fullscreenElement')
      Reflect.deleteProperty(document.documentElement, 'requestFullscreen')
    }
  })

  it('has no obvious a11y violations', async () => {
    const { container } = render(FullscreenButton)
    await expectNoA11yViolationsIsolated(container)
  })
})
