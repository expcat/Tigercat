/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { FullscreenButton } from '@expcat/tigercat-react/FullscreenButton'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('FullscreenButton (React)', () => {
  it('renders a labelled toggle that is disabled without Fullscreen API', () => {
    render(<FullscreenButton />)
    const button = screen.getByRole('button', { name: 'Enter fullscreen' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('does not mark the button disabled on the server render path', () => {
    const html = renderToStaticMarkup(<FullscreenButton />)
    expect(html).not.toMatch(/\sdisabled(?:=|\s|>)/)
  })

  it('syncs the pressed state and next request when the target changes during fullscreen', () => {
    const targetA = document.createElement('div')
    const targetB = document.createElement('div')
    const request = vi.fn().mockResolvedValue(undefined)
    targetB.requestFullscreen = request
    document.documentElement.requestFullscreen = vi.fn()
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: targetA })

    try {
      const { rerender } = render(<FullscreenButton target={targetA} />)
      const button = screen.getByRole('button', { name: 'Exit fullscreen' })
      expect(button).toHaveAttribute('aria-pressed', 'true')

      rerender(<FullscreenButton target={targetB} />)

      expect(button).toHaveAttribute('aria-pressed', 'false')
      expect(button).toHaveAccessibleName('Enter fullscreen')
      fireEvent.click(button)
      expect(request).toHaveBeenCalledOnce()
    } finally {
      Reflect.deleteProperty(document, 'fullscreenElement')
      Reflect.deleteProperty(document.documentElement, 'requestFullscreen')
    }
  })

  it('has no obvious a11y violations', async () => {
    const { container } = render(<FullscreenButton />)
    await expectNoA11yViolationsIsolated(container)
  })
})
