/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { FullscreenButton } from '@expcat/tigercat-vue/FullscreenButton'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('FullscreenButton (Vue)', () => {
  it('renders a labelled toggle and reads fullscreen support after mount', () => {
    render(FullscreenButton)
    const button = screen.getByRole('button', { name: 'Enter fullscreen' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(button).not.toHaveAttribute('disabled')
  })

  it('has no obvious a11y violations', async () => {
    const { container } = render(FullscreenButton)
    await expectNoA11yViolationsIsolated(container)
  })
})
