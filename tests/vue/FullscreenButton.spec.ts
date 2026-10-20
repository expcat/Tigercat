/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
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

  it('has no obvious a11y violations', async () => {
    const { container } = render(FullscreenButton)
    await expectNoA11yViolationsIsolated(container)
  })
})
