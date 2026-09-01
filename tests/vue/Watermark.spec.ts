/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import { Watermark } from '@expcat/tigercat-vue/Watermark'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('Watermark', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders children and watermark overlay', () => {
    const { container } = render(Watermark, {
      props: { content: 'Secret', className: 'from-prop' },
      attrs: { class: 'from-attr', 'data-testid': 'watermark' },
      slots: { default: 'Protected content' }
    })

    const wrapper = screen.getByTestId('watermark')
    const overlay = container.querySelector('[data-watermark="true"]')

    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(wrapper).toHaveClass('relative')
    expect(wrapper).toHaveClass('from-prop')
    expect(wrapper).toHaveClass('from-attr')
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
    expect(overlay).toHaveStyle({
      position: 'absolute',
      pointerEvents: 'none',
      backgroundRepeat: 'repeat'
    })
  })

  it('renders overlay even without content', () => {
    const { container } = render(Watermark, {
      slots: { default: 'Content' }
    })
    const overlay = container.querySelector('[data-watermark="true"]')
    expect(overlay).toBeInTheDocument()
  })

  it('renders with array content', () => {
    const { container } = render(Watermark, {
      props: { content: ['Line 1', 'Line 2'] },
      slots: { default: 'Body' }
    })
    const overlay = container.querySelector('[data-watermark="true"]')
    expect(overlay).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('overlay has pointer-events none', () => {
    const { container } = render(Watermark, {
      props: { content: 'Secret' },
      slots: { default: 'Content' }
    })
    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay.style.pointerEvents).toBe('none')
  })

  it('applies custom zIndex via overlay style', () => {
    const { container } = render(Watermark, {
      props: { content: 'Z', zIndex: 999 },
      slots: { default: 'Content' }
    })
    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay.style.zIndex).toBe('999')
  })

  it('merges className and attrs class', () => {
    const { container } = render(Watermark, {
      props: { className: 'prop-cls' },
      attrs: { class: 'attr-cls' },
      slots: { default: 'Content' }
    })
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper).toHaveClass('prop-cls')
    expect(wrapper).toHaveClass('attr-cls')
  })

  it('renders without children', () => {
    const { container } = render(Watermark, {
      props: { content: 'Empty' }
    })
    const overlay = container.querySelector('[data-watermark="true"]')
    expect(overlay).toBeInTheDocument()
  })

  it('keeps the same overlay node after painting', async () => {
    const { container } = render(Watermark, {
      props: { content: 'Secret' },
      slots: { default: 'Protected content' }
    })
    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay).toBeTruthy()
    overlay.style.backgroundImage = 'url(data:image/png;base64,painted)'
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(container.querySelector('[data-watermark="true"]')).toBe(overlay)
  })

  it('restores overlay after it is removed', async () => {
    const { container } = render(Watermark, {
      props: { content: 'Secret' },
      slots: { default: 'Protected content' }
    })
    const overlay = container.querySelector('[data-watermark="true"]') as HTMLElement
    expect(overlay).toBeTruthy()
    overlay.remove()
    await waitFor(() => {
      const restored = container.querySelector('[data-watermark="true"]')
      expect(restored).toBeTruthy()
      expect(restored).not.toBe(overlay)
    })
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Watermark)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
